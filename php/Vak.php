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

require_once "Cijfer.php";
require_once "verbindDatabase.php";

class Vak implements JsonSerializable {
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

    public function jsonSerialize() {
        return [
            'vaknummer' => $this->vaknummer,
            'naam' => $this->naam,
            'jaar' => $this->jaar,
            'periode' => $this->periode,
            'studiepunten' => $this->studiepunten,
            'gehaald' => $this->gehaald,
            'eindcijfer' => $this->eindcijfer,
            'toon' => $this->toon
        ];
    }

    public static function getVakFromArray(array $vak) {
        $vaknummer = $vak["vaknr"];
        $naam = $vak["vaknaam"];
        $jaar = $vak["jaar"];
        $studiepunten = $vak["studiepunten"];
        $periode = $vak["periode"] == 0 ? NULL : $vak["periode"];
        $gehaald = $vak["gehaald"] == 1;
        $eindcijfer = $vak["eindcijfer"] === NULL ? NULL : $vak["eindcijfer"] / 100;
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

    public static function createVak(string $naam, int $jaar, int $studiepunten, bool $gehaald, bool $toon,
                                     int $periode = NULL, float $eindcijfer = NULL) {
        $nieuwVak = new Vak(-1, $naam, $jaar, $studiepunten, $gehaald, $toon, $eindcijfer, $periode);

        $return = $nieuwVak->upload();

        return [$return, $nieuwVak];
    }

    public static function getAllVakken() {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return NULL;
        }

        $sql = $database->prepare("SELECT * FROM Vakken ORDER BY jaar ASC, periode ASC");
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

    public function upload() {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return 1;
        }

        if ($this->vaknummer > -1) {
            $sql = $database->prepare("SELECT vaknr FROM Vakken WHERE vaknr = :nummer");
            $sql->bindValue(':nummer', $this->vaknummer, PDO::PARAM_INT);

            if (!$sql->execute()) {
                error_log("Execute failed: " . implode($sql->errorInfo()));
            }

            if ($sql->rowCount() > 0) {
                return 0;
            }
        }

        $columns = "vaknaam, jaar, periode, studiepunten, gehaald, toon";
        $values = ":titel, :jaar, :periode , :studiepunten, :gehaald, :toon";

        if ($this->eindcijfer !== NULL) {
            $columns .= ", eindcijfer";
            $values .= ", :eindcijfer";
        }

        $sql = $database->prepare("INSERT INTO Vakken ($columns) VALUES($values)");
        if (!$sql->bindValue(':titel', htmlspecialchars($this->naam), PDO::PARAM_STR)) {
            return 2;
        }

        if (!$sql->bindValue(':jaar', $this->jaar, PDO::PARAM_INT)) {
            return 3;
        }

        if (!$sql->bindValue(':periode', $this->periode === NULL ? 0 : $this->periode, PDO::PARAM_INT)) {
            return 4;
        }

        if (!$sql->bindValue(':studiepunten', $this->studiepunten, PDO::PARAM_INT)) {
            return 5;
        }

        if (!$sql->bindValue(':gehaald', $this->gehaald, PDO::PARAM_BOOL)) {
            return 6;
        }

        if ($this->eindcijfer !== NULL) {
            if (!$sql->bindValue(':eindcijfer', round($this->eindcijfer * 100), PDO::PARAM_INT)) {
                return 7;
            }
        }

        if (!$sql->bindValue(':toon', $this->toon, PDO::PARAM_BOOL)) {
            return 8;
        }

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 9;
        }

        $sql = $database->prepare("SELECT * FROM Vakken ORDER BY vaknr DESC LIMIT 1");

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 10;
        }

        $result = $sql->fetch(PDO::FETCH_ASSOC);
        $database = NULL;

        $this->vaknummer = (int)$result["vaknr"];
        $this->naam = $result["vaknaam"];
        $this->jaar = (int)$result["jaar"];
        $this->periode = $result["periode"] == 0 ? NULL : (int)$result["periode"];
        $this->studiepunten = (int)$result["studiepunten"];
        $this->gehaald = $result["gehaald"] == 1;
        $this->eindcijfer = $result["eindcijfer"] === NULL ? NULL : $result["eindcijfer"] / 100;
        $this->toon = $result["toon"] == 1;

        return 0;
    }

    public function update() {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return 1;
        }

        $values = "vaknaam = :titel, jaar = :jaar, periode = :periode, studiepunten = :studiepunten," .
            "gehaald = :gehaald, eindcijfer = :eindcijfer, toon = :toon";

        $sql = $database->prepare("UPDATE Vakken set $values WHERE vaknr = :vaknr");

        if (!$sql->bindValue(':vaknr', $this->vaknummer, PDO::PARAM_INT)) {
            return 10;
        }

        if (!$sql->bindValue(':titel', htmlspecialchars($this->naam), PDO::PARAM_STR)) {
            return 2;
        }

        if (!$sql->bindValue(':jaar', $this->jaar, PDO::PARAM_INT)) {
            return 3;
        }

        if (!$sql->bindValue(':gehaald', $this->gehaald, PDO::PARAM_BOOL)) {
            return 4;
        }

        if ($this->eindcijfer !== NULL) {
            if (!$sql->bindValue(':eindcijfer', round($this->eindcijfer * 100), PDO::PARAM_INT)) {
                return 5;
            }
        } else {
            if (!$sql->bindValue(':eindcijfer', NULL, PDO::PARAM_NULL)) {
                return 5;
            }
        }

        if (!$sql->bindValue(':toon', $this->toon, PDO::PARAM_BOOL)) {
            return 6;
        }

        if ($this->periode !== NULL) {
            if (!$sql->bindValue(':periode', $this->periode, PDO::PARAM_INT)) {
                return 7;
            }
        } else {
            if (!$sql->bindValue(':periode', 0, PDO::PARAM_INT)) {
                return 7;
            }
        }

        if (!$sql->bindValue(':studiepunten', $this->studiepunten, PDO::PARAM_INT)) {
            return 8;
        }

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 9;
        }

        $database = NULL;

        return 0;
    }

    public function verwijder() {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return false;
        }

        $sql = $database->prepare("DELETE FROM Vakken WHERE vaknr = :vak");
        $sql->bindValue(':vak', $this->vaknummer);

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return false;
        }

        $this->vaknummer = -1;

        $database = NULL;

        return true;
    }
}
