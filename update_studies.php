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

require_once "connect.php";
require_once "php/Studie.php";

function update_studie($array) {
    global $session;

    if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
        session_start(); //sessie starten
    }

    if (!isset($_SESSION[$session . 'admin'])) {
        $_SESSION[$session . 'admin'] = NULL;
    }

    if ($_SESSION[$session . 'admin'] !== "ingelogd") {
        return [-1, NULL];
    }

    $studie = NULL;

    if (isset($array['studienummer']) && $array['studienummer'] !== '') {
        if (!is_numeric($array['studienummer'])) {
            return [-2, NULL];
        }

        /* @var Studie $studie */
        $studie = Studie::getStudie($array['studienummer']);

        if ($studie === NULL) {
            return [-2, NULL];
        }
    }

    if (empty($array['naam']) || $array['naam'] === 'null') {
        return [-3, NULL];
    }

    $naam = $array['naam'];

    if (!isset($array['begin_jaar']) || $array['begin_jaar'] === '' || !is_numeric($array['begin_jaar'])  || $array['begin_jaar'] < 1901 || $array['begin_jaar'] > 2155) {
        return [-4, NULL];
    }

    $begin_jaar = $array['begin_jaar'];

    if (!isset($array['eind_jaar']) || $array['eind_jaar'] === '') {
        $eind_jaar = null;
    } else {
        if (!is_numeric($array['eind_jaar']) || $array['eind_jaar'] < 1901 || $array['eind_jaar'] > 2155) {
            return [-5, NULL];
        }

        $eind_jaar = $array['eind_jaar'];
    }

    if (empty($array['gehaald']) || !filter_var($array['gehaald'], FILTER_VALIDATE_BOOLEAN)) {
        $gehaald = false;
    } else {
        $gehaald = true;
    }

    if (empty($array['standaard']) || !filter_var($array['standaard'], FILTER_VALIDATE_BOOLEAN)) {
        $standaard = false;
    } else {
        $standaard = true;
    }

    if (!isset($array['bsa']) || $array['bsa'] === '') {
        $bsa = null;
    } else {
        if (!is_numeric($array['bsa']) || $array['bsa'] < 0) {
            return [-6, NULL];
        }

        $bsa = $array['bsa'];
    }

    if ($studie === NULL) {
        return Studie::createStudie($naam, $begin_jaar, $eind_jaar, $gehaald, $standaard, $bsa);
    }

    $studie->naam = $naam;
    $studie->begin_jaar = $begin_jaar;
    $studie->eind_jaar = $eind_jaar;
    $studie->gehaald = $gehaald;
    $studie->standaard = $standaard;
    $studie->bsa = $bsa;

    $return = $studie->update();
    return [$return, $studie];
}


// Takes raw data from the request
$json = file_get_contents('php://input');

// Converts the raw data into a array
$data = json_decode($json, true);

if ($data === NULL) {
    $return = ["returnwaarde" => 1, "object" => NULL];
} else {
    $return = ["returnwaarde" => 0, "object" => []];

    foreach ($data as $studie) {
        list($returnwaarde, $object) = update_studie($studie);
        $return["object"][] = ["returnwaarde" => $returnwaarde, "object" => $object];
    }
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($return);
