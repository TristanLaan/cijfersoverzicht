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

require_once "Cijfer.php";
require_once "verbindDatabase.php";

class Vak {
    var $vaknummer;
    var $naam;
    var $jaar;
    var $periode;
    var $studiepunten;
    var $gehaald;
    var $eindcijfer;
    var $toon;
    var $som = 0;
    var $weging = 0;

    /**
     * Vak constructor.
     * @param $vaknummer
     * @param $naam
     * @param $jaar
     * @param $periode
     * @param $studiepunten
     * @param $gehaald
     * @param $eindcijfer
     * @param $toon
     */
    public function __construct(int $vaknummer, string $naam, int $jaar, int $studiepunten, bool $gehaald,
                                bool $toon, float $eindcijfer = NULL, int $periode = NULL) {
        $this->vaknummer = $vaknummer;
        $this->naam = $naam;
        $this->jaar = $jaar;
        $this->periode = $periode;
        $this->studiepunten = $studiepunten;
        $this->gehaald = $gehaald;
        $this->eindcijfer = $eindcijfer;
        $this->toon = $toon;
    }

    public static function getVakFromArray(array $vak) {
        $vaknummer = $vak["vaknr"];
        $naam = $vak["vaknaam"];
        $jaar = $vak["jaar"];
        $studiepunten = $vak["studiepunten"];
        $periode = $vak["periode"] == 0 ? NULL : $vak["periode"];
        $gehaald = $vak["gehaald"] == 1;
        $eindcijfer = empty($vak["eindcijfer"]) ? NULL : $vak["eindcijfer"]/100;
        $toon = $vak["toon"] == 1;

        return new Vak($vaknummer, $naam, $jaar, $studiepunten, $gehaald, $toon, $eindcijfer, $periode);
    }

    public static function getVak(int $vaknummer) {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return NULL;
        }

        $sql = $database->prepare("SELECT * FROM Vakken WHERE Vakken.vaknr = :vak LIMIT 1");
        $sql->bindParam(':vak', $vaknummer, PDO::PARAM_INT);
        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return NULL;
        }

        $vak = $sql->fetch(PDO::FETCH_ASSOC);

        $database = NULL;

        if ($vak == NULL) {
            return NULL;
        }

        return self::getVakFromArray($vak);
    }

    public static function getAllVakken() {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return NULL;
        }

        $sql = $database->prepare("SELECT * FROM Vakken ORDER BY jaar, periode");
        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return NULL;
        }

        $results = $sql->fetchAll(PDO::FETCH_ASSOC);

        $database = NULL;

        $length = sizeof($results);

        if ($length < 1) {
            return NULL;
        }

        for ($i = 0; $i < $length; $i++) {
            $vakken[$i] = self::getVakFromArray($results[$i]);
        }

        return $vakken;
    }

    /** @noinspection PhpUnusedPrivateMethodInspection */
    private static function compareCijfers(Cijfer $cijfer1, Cijfer $cijfer2) {
        if ($cijfer1 == NULL) {
            if ($cijfer2 == NULL) {
                return 0;
            }

            return -1;
        }

        if ($cijfer2 == NULL) {
            return 1;
        }

        if ($cijfer1->datum == NULL) {
            if ($cijfer2->datum == NULL) {
                return 0;
            }

            return 1;
        }

        if ($cijfer2->datum == NULL) {
            return -1;
        }

        return $cijfer1->datum > $cijfer2->datum;
    }

    private static function sortCijfers(array $cijfers) {
        usort($cijfers, "self::compareCijfers");
        return $cijfers;
    }

    public function getCijfers() {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return NULL;
        }

        $sql = $database->prepare("SELECT * FROM Cijfers WHERE Cijfers.vaknr = :vak");
        $sql->bindParam(':vak', $this->vaknummer, PDO::PARAM_INT);
        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return NULL;
        }

        $results = $sql->fetchAll(PDO::FETCH_ASSOC);

        $database = NULL;

        $length = sizeof($results);


        if ($length < 1) {
            return NULL;
        }

        for ($i = 0; $i < $length; $i++) {
            $cijfer = Cijfer::getCijferFromArray($results[$i], $this);
            $cijfers[$i] = $cijfer;
        }

         return self::sortCijfers($cijfers);
    }
}