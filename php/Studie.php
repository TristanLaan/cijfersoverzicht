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

require_once "verbindDatabase.php";

class Studie implements JsonSerializable {
    var $studienummer;
    var $naam;
    var $begin_jaar;
    var $eind_jaar;
    var $gehaald;
    var $bsa;
    var $standaard;

    /**
     * Studie constructor.
     *
     * @param int      $studienummer
     * @param string   $naam
     * @param int      $begin_jaar
     * @param int|null $eind_jaar
     * @param bool     $gehaald
     * @param bool     $standaard
     * @param int|null $bsa
     */
    public function __construct(int $studienummer, string $naam, int $begin_jaar, int $eind_jaar = null, bool $gehaald = false,
                                bool $standaard = false, int $bsa = null) {
        $this->studienummer = $studienummer;
        $this->naam = $naam;
        $this->begin_jaar = $begin_jaar;
        $this->eind_jaar = $eind_jaar;
        $this->gehaald = $gehaald;
        $this->bsa = $bsa;
        $this->standaard = $standaard;
    }

    public function jsonSerialize() {
        return [
            'studienummer' => $this->studienummer,
            'naam' => $this->naam,
            'begin_jaar' => $this->begin_jaar,
            'eind_jaar' => $this->eind_jaar,
            'gehaald' => $this->gehaald,
            'bsa' => $this->bsa,
            'standaard' => $this->standaard
            ];
    }

    public static function getStudieFromArray(array $studie) {
        $studienummer = $studie["studienr"];
        $naam = $studie["naam"];
        $begin_jaar = $studie["begin_jaar"];
        $eind_jaar = $studie["eind_jaar"];
        $gehaald = $studie["gehaald"] == 1;
        $bsa = $studie["bsa"];
        $standaard = $studie["standaard"] == 1;

        return new Studie($studienummer, $naam, $begin_jaar, $eind_jaar, $gehaald, $standaard, $bsa);
    }

    public static function getStudie(int $studienummer) {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return NULL;
        }

        $sql = $database->prepare("SELECT * FROM Studies WHERE Studies.studienr = :studie LIMIT 1");
        $sql->bindParam(':studie', $studienummer, PDO::PARAM_INT);
        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return NULL;
        }

        $studie = $sql->fetch(PDO::FETCH_ASSOC);

        $database = NULL;

        if ($studie == NULL) {
            return NULL;
        }

        return self::getStudieFromArray($studie);
    }

    public static function createStudie(string $naam, int $begin_jaar, int $eind_jaar = null,
                                        bool $gehaald = false, bool $standaard = false, int $bsa = null) {
        $studie = new Studie(-1, $naam, $begin_jaar, $eind_jaar, $gehaald, $standaard, $bsa);
        $return = $studie->upload();

        return [$return, $studie];
    }

    public static function getAllStudies() {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return NULL;
        }

        $sql = $database->prepare("SELECT * FROM Studies ORDER BY ISNULL(eind_jaar) DESC, eind_jaar DESC, begin_jaar DESC, standaard DESC");
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

        $studies = [];

        for ($i = 0; $i < $length; $i++) {
            $studies[$i] = self::getStudieFromArray($results[$i]);
        }

        return $studies;
    }

    private function verwijder_standaard() {
        if ($this->standaard) {
            $database = verbindDatabase();
            $sql = $database->prepare("UPDATE Studies set standaard = FALSE WHERE studienr != :studienummer");
            $sql->bindValue(':studienummer', $this->studienummer, PDO::PARAM_INT);
            if (!$sql->execute()) {
                error_log("Execute standaard false failed: " . implode($sql->errorInfo()));
            }
            $database = null;
        }
    }

    public function upload() {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return 1;
        }

        if ($this->studienummer > -1) {
            $sql = $database->prepare("SELECT studienr FROM Studies WHERE studienr = :studienummer");
            $sql->bindValue(':studienummer', $this->studienummer, PDO::PARAM_INT);

            if (!$sql->execute()) {
                error_log("Execute failed: " . implode($sql->errorInfo()));
            }

            if ($sql->rowCount() > 0) {
                return 0;
            }
        }

        $columns = "naam, begin_jaar, eind_jaar, gehaald, standaard";
        $values = ":naam, :begin_jaar, :eind_jaar, :gehaald, :standaard";

        if ($this->bsa !== NULL) {
            $columns .= ", bsa";
            $values .= ", :bsa";
        }

        $sql = $database->prepare("INSERT INTO Studies ($columns) VALUES($values)");
        if (!$sql->bindValue(':naam', $this->naam, PDO::PARAM_STR)) {
            return 2;
        }

        if (!$sql->bindValue(':begin_jaar', $this->begin_jaar, PDO::PARAM_INT)) {
            return 3;
        }

        if (!$sql->bindValue(':eind_jaar', $this->eind_jaar, PDO::PARAM_INT)) {
            return 4;
        }

        if (!$sql->bindValue(':gehaald', $this->gehaald, PDO::PARAM_BOOL)) {
            return 5;
        }

        if (!$sql->bindValue(':standaard', $this->standaard, PDO::PARAM_BOOL)) {
            return 6;
        }

        if ($this->bsa !== NULL) {
            if (!$sql->bindValue(':bsa', $this->bsa, PDO::PARAM_INT)) {
                return 7;
            }
        }

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 8;
        }

        $sql = $database->prepare("SELECT * FROM Studies ORDER BY studienr DESC LIMIT 1");

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 9;
        }

        $result = $sql->fetch(PDO::FETCH_ASSOC);
        $database = NULL;

        $this->studienummer = (int)$result["studienr"];
        $this->naam = $result["naam"];
        $this->begin_jaar = (int)$result["begin_jaar"];
        $this->eind_jaar = (int)$result["eind_jaar"];
        $this->gehaald = $result["gehaald"] == 1;
        $this->standaard = $result["standaard"] == 1;
        $this->bsa = $result["bsa"] === NULL ? NULL : (int) $result["bsa"];

        $this->verwijder_standaard();

        return 0;
    }

    public function update() {
        $database = verbindDatabase();

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return 1;
        }

        $values = "naam = :naam, begin_jaar = :begin_jaar, eind_jaar = :eind_jaar, gehaald = :gehaald, bsa = :bsa, standaard = :standaard";

        $sql = $database->prepare("UPDATE Studies set $values WHERE studienr = :studienummer");

        if (!$sql->bindValue(':studienummer', $this->studienummer, PDO::PARAM_INT)) {
            return 10;
        }

        if (!$sql->bindValue(':naam', $this->naam, PDO::PARAM_STR)) {
            return 2;
        }

        if (!$sql->bindValue(':begin_jaar', $this->begin_jaar, PDO::PARAM_INT)) {
            return 3;
        }

        if (!$sql->bindValue(':eind_jaar', $this->eind_jaar, PDO::PARAM_INT)) {
            return 4;
        }

        if (!$sql->bindValue(':gehaald', $this->gehaald, PDO::PARAM_BOOL)) {
            return 5;
        }

        if (!$sql->bindValue(':standaard', $this->standaard, PDO::PARAM_BOOL)) {
            return 6;
        }

        if ($this->bsa !== NULL) {
            if (!$sql->bindValue(':bsa', $this->bsa, PDO::PARAM_INT)) {
                return 7;
            }
        } else {
            if (!$sql->bindValue(':bsa', null, PDO::PARAM_NULL)) {
                return 7;
            }
        }

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 8;
        }

        $database = NULL;

        $this->verwijder_standaard();

        return 0;
    }

    public function verwijder() {
        $database = verbindDatabase();

        if ($this->standaard) {
            return 1;
        }

        if ($database === NULL) {
            error_log("Geen verbinding met database");
            return 2;
        }

        $sql = $database->prepare("DELETE FROM Studies WHERE studienr = :studienummer");
        $sql->bindValue(':studienummer', $this->studienummer);

        if (!$sql->execute()) {
            error_log("Execute failed: " . implode($sql->errorInfo()));
            return 3;
        }

        $this->studienummer = -1;

        $database = NULL;

        return 0;
    }
}
