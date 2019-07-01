<?php
/**
 * Copyright (c) Tristan Laan 2019.
 * This file is part of cijfersoverzicht.
 * cijfersoverzicht is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or any later
 * version.
 *
 * cijfersoverzicht is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with cijfersoverzicht.  If not, see <https://www.gnu.org/licenses/>
 */

require_once "Vak.php";
require_once "verbindDatabase.php";

class Cijfer {
    var $cijfernummer;
    var $vak;
    var $naam;
    var $weging;
    var $datum;
    var $cijfer;


    /**
     * Cijfer constructor.
     * @param int $cijfernummer
     * @param Vak $vak
     * @param string $naam
     * @param float $weging
     * @param DateTime $datum
     * @param float $cijfer
     */
    public function __construct($cijfernummer, $vak, $naam, $weging, $datum, $cijfer) {
        $this->cijfernummer = $cijfernummer;
        $this->vak = $vak;
        $this->naam = $naam;
        $this->weging = $weging;
        $this->datum = $datum;
        $this->cijfer = $cijfer;
    }

    public static function getCijferFromArray($cijfer, $vak) {
        $cijfernummer = $cijfer["cijfernr"];
        if ($vak == NULL) {
            $internal_vak = Vak::getVak($cijfer["vaknr"]);
        } else {
            $internal_vak = $vak;
        }
        $naam = $cijfer["cijfertitel"];
        $weging = empty($cijfer["weging"]) ? NULL : $cijfer["weging"] / 100;
        $getal = empty($cijfer["cijfer"]) ? NULL : $cijfer["cijfer"] / 100;
        $datum = $cijfer["datum"];

        try {
            $datum = DateTime::createFromFormat("Y-m-d", $datum);
            if (!$datum) {
                $datum = NULL;
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
            return NULL;
        }

        return new Cijfer($cijfernummer, $internal_vak, $naam, $weging, $datum, $getal);
    }

    public static function getCijfer($cijfernummer) {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return NULL;
        }

        $sql = $database->prepare("SELECT * FROM Cijfers WHERE Cijfers.cijfernr = :cijfer LIMIT 1");
        $sql->bindValue(':cijfer', $cijfernummer, PDO::PARAM_INT);
        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return NULL;
        }

        $cijfer = $sql->fetch(PDO::FETCH_ASSOC);

        $database = NULL;

        if ($cijfer == NULL) {
            error_log("Cijfer niet gevonden: " . $cijfernummer);
            return NULL;
        }

        return self::getCijferFromArray($cijfer);
    }

    /**
     * @param Cijfer[] $cijfers
     * @return float
     */
    private static function berekenGemiddeldeCijfer($cijfers) {
        if ($cijfers === NULL) {
            return NULL;
        }

        $totaleWeging = 0;
        $totaleCijfer = 0;
        $found = false;
        foreach ($cijfers as $cijfer) {
            if ($cijfer != NULL && $cijfer->cijfer != NULL && $cijfer->weging != NULL) {
                $found = true;
                $totaleWeging += $cijfer->weging;
                $totaleCijfer += $cijfer->cijfer * $cijfer->weging;
            }
        }

        if ($totaleWeging === 0) {
            $gemiddelde = 0;
        } else {
            $gemiddelde = $totaleCijfer / $totaleWeging;
        }

        return $found ? round($gemiddelde, 2) : NULL;
    }

    /**
     * @param Cijfer[] $cijfers
     * @return float
     */
    private static function berekenEindcijfer($cijfers) {
        if ($cijfers === NULL) {
            return NULL;
        }

        $eindcijfer = 0;
        $found = false;
        foreach ($cijfers as $cijfer) {
            if ($cijfer != NULL && $cijfer->cijfer != NULL && $cijfer->weging != NULL) {
                $found = true;
                $eindcijfer += $cijfer->cijfer * $cijfer->weging / 100;
            }
        }

        return $found ? round($eindcijfer, 2) : NULL;
    }

    public static function getAllCijfers() {
        $vakken = Vak::getAllVakken();

        if ($vakken == NULL) {
            return NULL;
        }

        /* @var Vak[] $vakken */

        $length = sizeof($vakken);
        for ($i = 0; $i < $length; $i++) {
            $cijfers[$i]['cijfers'] = $vakken[$i]->getCijfers();
            $cijfers[$i]['gemiddelde'] = self::berekenGemiddeldeCijfer($cijfers[$i]['cijfers']);
            $cijfers[$i]['totaal'] = self::berekenEindcijfer($cijfers[$i]['cijfers']);
            $cijfers[$i]['vak'] = $vakken[$i];
        }

        return $cijfers;
    }
}