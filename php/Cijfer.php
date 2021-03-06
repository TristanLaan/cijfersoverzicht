<?php
/**
 * Copyright (c) Tristan Laan 2018-2021.
 * This file is part of cijfersoverzicht.
 * cijfersoverzicht is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * cijfersoverzicht is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with cijfersoverzicht.  If not, see <https://www.gnu.org/licenses/>
 */

require_once "Vak.php";
require_once "verbindDatabase.php";

class Cijfer implements JsonSerializable {
    var $cijfernummer;
    var $vak;
    var $naam;
    var $weging;
    var $datum;
    var $cijfer;
    var $beschrijving;

    /**
     * Cijfer constructor.
     *
     * @param int           $cijfernummer
     * @param Vak           $vak
     * @param string        $naam
     * @param float|null    $weging
     * @param DateTime|null $datum
     * @param float|null    $cijfer
     */
    public function __construct(int $cijfernummer, Vak $vak, string $naam, float $weging = null,
                                DateTime $datum = null, float $cijfer = null, string $beschrijving = null) {
        $this->cijfernummer = $cijfernummer;
        $this->vak = $vak;
        $this->naam = $naam;
        $this->weging = $weging;
        $this->datum = $datum;
        $this->cijfer = $cijfer;
        $this->beschrijving = $beschrijving;
    }

    public function jsonSerialize() {
        return [
            'cijfernummer' => $this->cijfernummer,
            'vaknummer' => $this->vak->vaknummer,
            'naam' => $this->naam,
            'weging' => $this->weging,
            'datum' => $this->datum === null ? null : $this->datum->format("Y-m-d"),
            'cijfer' => $this->cijfer,
            'beschrijving' => $this->beschrijving
        ];
    }

    public static function getCijferFromArray(array $cijfer, Vak $vak = null) {
        $cijfernummer = $cijfer["cijfernr"];
        if ($vak == null) {
            $internal_vak = Vak::getVak($cijfer["vaknr"]);
        } else {
            $internal_vak = $vak;
        }
        $naam = $cijfer["cijfertitel"];
        $weging = $cijfer["weging"] === null ? null : $cijfer["weging"] / 100;
        $getal = $cijfer["cijfer"] === null ? null : $cijfer["cijfer"] / 100;
        $datum = $cijfer["datum"];
        $beschrijving = $cijfer["beschrijving"];

        try {
            $datum = DateTime::createFromFormat("Y-m-d", $datum);
            if (!$datum) {
                $datum = null;
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
            return null;
        }

        return new Cijfer($cijfernummer, $internal_vak, $naam, $weging, $datum, $getal, $beschrijving);
    }

    public static function getCijfer(int $cijfernummer) {
        $database = verbindDatabase();

        if ($database === null) {
            error_log("Geen verbinding met database");
            return null;
        }

        $sql = $database->prepare("SELECT * FROM Cijfers WHERE Cijfers.cijfernr = :cijfer LIMIT 1");
        $sql->bindValue(':cijfer', $cijfernummer, PDO::PARAM_INT);
        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return null;
        }

        $cijfer = $sql->fetch(PDO::FETCH_ASSOC);

        $database = null;

        if ($cijfer == null) {
            error_log("Cijfer niet gevonden: " . $cijfernummer);
            return null;
        }

        return self::getCijferFromArray($cijfer);
    }

    public static function createCijfer(Vak $vak, string $naam, float $weging = null, DateTime $datum = null,
                                        float $cijfer = null, string $beschrijving = null) {
        $nieuwCijfer = new Cijfer(-1, $vak, $naam, $weging, $datum, $cijfer, $beschrijving);

        $return = $nieuwCijfer->upload();

        return [$return, $nieuwCijfer];
    }

    /**
     * @param Cijfer[] $cijfers
     * @return float
     */
    private static function berekenGemiddeldeCijfer(array $cijfers = null) {
        if ($cijfers === null) {
            return null;
        }

        $totaleWeging = 0;
        $totaleCijfer = 0;
        $found = false;
        foreach ($cijfers as $cijfer) {
            if ($cijfer != null && $cijfer->cijfer != null && $cijfer->weging != null) {
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

        return $found ? round($gemiddelde, 2) : null;
    }

    /**
     * @param Cijfer[] $cijfers
     * @return float
     */
    private static function berekenEindcijfer(array $cijfers = null) {
        if ($cijfers === null) {
            return null;
        }

        $eindcijfer = 0;
        $found = false;
        foreach ($cijfers as $cijfer) {
            if ($cijfer != null && $cijfer->cijfer != null && $cijfer->weging != null) {
                $found = true;
                $eindcijfer += $cijfer->cijfer * $cijfer->weging / 100;
            }
        }

        return $found ? round($eindcijfer, 2) : null;
    }

    private static function getAllCijfersZonderVakken() {
        $database = verbindDatabase();

        if ($database === null) {
            error_log("Geen verbinding met database");
            return null;
        }

        $sql = $database->prepare("SELECT * FROM Cijfers ORDER BY cijfernr");
        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return null;
        }

        $results = $sql->fetchAll(PDO::FETCH_ASSOC);

        $database = null;

        $length = sizeof($results);


        if ($length < 1) {
            return null;
        }

        $cijfers = [];

        for ($i = 0; $i < $length; $i++) {
            $cijfer = Cijfer::getCijferFromArray($results[$i]);
            $cijfers[$i] = $cijfer;
        }

        return $cijfers;
    }

    public static function getAllCijfers($studie, $vakken = true) {
        if (!$vakken) {
            return self::getAllCijfersZonderVakken();
        }

        $vakken = Vak::getAllVakken($studie);

        if ($vakken == null) {
            return null;
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

    public function upload() {
        $database = verbindDatabase();

        if ($database === null) {
            error_log("Geen verbinding met database");
            return 1;
        }

        if ($this->cijfernummer > -1) {
            $sql = $database->prepare("SELECT cijfernr FROM Cijfers WHERE cijfernr = :nummer");
            $sql->bindValue(':nummer', $this->cijfernummer, PDO::PARAM_INT);

            if (!$sql->execute()) {
                error_log("Execute failed: " . implode($sql->errorInfo()));
            }

            if ($sql->rowCount() > 0) {
                return 0;
            }
        }

        $columns = "vaknr, cijfertitel";
        $values = ":vaknr, :titel";

        if ($this->weging !== null) {
            $columns .= ", weging";
            $values .= ", :weging";
        }

        if ($this->datum !== null) {
            $columns .= ", datum";
            $values .= ", :datum";
        }

        if ($this->cijfer !== null) {
            $columns .= ", cijfer";
            $values .= ", :cijfer";
        }

        if ($this->beschrijving !== null) {
            $columns .= ", beschrijving";
            $values .= ", :beschrijving";
        }

        $sql = $database->prepare("INSERT INTO Cijfers ($columns) VALUES($values)");

        if (!$sql->bindValue(':vaknr', $this->vak->vaknummer, PDO::PARAM_INT)) {
            return 2;
        }

        if (!$sql->bindValue(':titel', $this->naam, PDO::PARAM_STR)) {
            return 3;
        }

        if ($this->weging !== null) {
            if (!$sql->bindValue(':weging', round($this->weging * 100), PDO::PARAM_INT)) {
                return 4;
            }
        }

        if ($this->datum !== null) {
            if (!$sql->bindValue(':datum', $this->datum->format("Y-m-d"), PDO::PARAM_STR)) {
                return 5;
            }
        }

        if ($this->cijfer !== null) {
            if (!$sql->bindValue(':cijfer', round($this->cijfer * 100), PDO::PARAM_INT)) {
                return 6;
            }
        }

        if ($this->beschrijving !== null) {
            if (!$sql->bindValue(':beschrijving', $this->beschrijving, PDO::PARAM_STR)) {
                return 9;
            }
        }

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 7;
        }

        $sql = $database->prepare("SELECT * FROM Cijfers ORDER BY cijfernr DESC LIMIT 1");

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 8;
        }

        $result = $sql->fetch(PDO::FETCH_ASSOC);
        $database = null;

        $this->cijfernummer = (int)$result['cijfernr'];
        $this->vak = Vak::getVak((int)$result['vaknr']);
        $this->naam = $result['cijfertitel'];
        $this->weging = $result["weging"] === null ? null : $result["weging"] / 100;
        $this->cijfer = $result["cijfer"] === null ? null : $result["cijfer"] / 100;

        try {
            $datum = DateTime::createFromFormat("Y-m-d", $result['datum']);
            if (!$datum) {
                $datum = null;
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
            $datum = null;
        }

        $this->datum = $datum;
        $this->beschrijving = $result["beschrijving"];

        return 0;
    }

    public function update() {
        $database = verbindDatabase();

        if ($database === null) {
            error_log("Geen verbinding met database");
            return 1;
        }

        $sql = $database->prepare("UPDATE Cijfers set vaknr = :vaknr, cijfertitel = :titel, " .
            "weging = :weging, datum = :datum, cijfer = :cijfer, beschrijving = :beschrijving " .
            "WHERE cijfernr = :cijfernr");

        if (!$sql->bindValue(':vaknr', $this->vak->vaknummer, PDO::PARAM_INT)) {
            return 2;
        }

        if (!$sql->bindValue(':titel', $this->naam, PDO::PARAM_STR)) {
            return 3;
        }

        if ($this->weging !== null) {
            if (!$sql->bindValue(':weging', round($this->weging * 100), PDO::PARAM_INT)) {
                return 4;
            }
        } else {
            if (!$sql->bindValue(':weging', null, PDO::PARAM_NULL)) {
                return 4;
            }
        }

        if ($this->datum !== null) {
            if (!$sql->bindValue(':datum', $this->datum->format("Y-m-d"), PDO::PARAM_STR)) {
                return 5;
            }
        } else {
            if (!$sql->bindValue(':datum', null, PDO::PARAM_NULL)) {
                return 5;
            }
        }

        if ($this->cijfer !== null) {
            if (!$sql->bindValue(':cijfer', round($this->cijfer * 100), PDO::PARAM_INT)) {
                return 6;
            }
        } else {
            if (!$sql->bindValue(':cijfer', null, PDO::PARAM_NULL)) {
                return 6;
            }
        }

        if ($this->beschrijving !== null) {
            if (!$sql->bindValue(':beschrijving', $this->beschrijving, PDO::PARAM_STR)) {
                return 9;
            }
        } else {
            if (!$sql->bindValue(':beschrijving', null, PDO::PARAM_NULL)) {
                return 9;
            }
        }

        if (!$sql->bindValue(':cijfernr', $this->cijfernummer)) {
            return 7;
        }

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 8;
        }

        $database = null;

        return 0;
    }

    public function verwijder() {
        $database = verbindDatabase();

        if ($database === null) {
            error_log("Geen verbinding met database");
            return false;
        }

        $sql = $database->prepare("DELETE FROM Cijfers WHERE cijfernr = :cijfer");
        $sql->bindValue(':cijfer', $this->cijfernummer);

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return false;
        }

        $database = null;

        $this->cijfernummer = -1;

        return true;
    }
}
