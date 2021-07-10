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
require_once "php/Vak.php";

function update_vak($array) {
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

    $vak = NULL;

    if (isset($array['vaknummer']) && $array['vaknummer'] !== '') {
        if (!is_numeric($array['vaknummer'])) {
            return [-2, NULL];
        }

        /* @var Vak $vak */
        $vak = Vak::getVak($array['vaknummer']);

        if ($vak === NULL) {
            return [-2, NULL];
        }
    }

    if (empty($array['naam']) || $array['naam'] === 'null') {
        return [-3, NULL];
    }

    $naam = $array['naam'];

    if (!isset($array['jaar']) || $array['jaar'] === '' || !is_numeric($array['jaar'])) {
        return [-4, NULL];
    }

    $jaar = $array['jaar'];

    if (!isset($array['studiepunten']) || $array['studiepunten'] === '' || !is_numeric($array['studiepunten'])) {
        return [-5, NULL];
    }

    $studiepunten = $array['studiepunten'];

    if (empty($array['periode'])) {
        $periode = NULL;
    } else {
        if (!isset($array['periode']['periode_start']) || $array['periode']['periode_start'] === '' || !is_numeric($array['periode']['periode_start'])
            || !isset($array['periode']['periode_end']) || $array['periode']['periode_end'] === '' || !is_numeric($array['periode']['periode_end'])) {
            return [-5, NULL];
        }
        $periode = new Periode($array['periode']['periode_start'], $array['periode']['periode_end']);
    }

    if (empty($array['gehaald']) || !filter_var($array['gehaald'], FILTER_VALIDATE_BOOLEAN)) {
        $gehaald = false;
    } else {
        $gehaald = true;
    }

    if (empty($array['toon']) || !filter_var($array['toon'], FILTER_VALIDATE_BOOLEAN)) {
        $toon = false;
    } else {
        $toon = true;
    }

    if (!isset($array['eindcijfer']) || $array['eindcijfer'] === '') {
        $eindcijfer = NULL;
    } else {
        $eindcijfer = $array['eindcijfer'];
        if (!is_numeric($eindcijfer)) {
            return [-7, NULL];
        }
    }

    if ($vak === NULL) {
        return Vak::createVak($naam, $jaar, $studiepunten, $gehaald, $toon, $periode, $eindcijfer);
    }

    $vak->naam = $naam;
    $vak->jaar = $jaar;
    $vak->periode = $periode;
    $vak->studiepunten = $studiepunten;
    $vak->gehaald = $gehaald;
    $vak->toon = $toon;
    $vak->eindcijfer = $eindcijfer;

    $return = $vak->update();
    return [$return, $vak];
}


// Takes raw data from the request
$json = file_get_contents('php://input');

// Converts the raw data into a array
$data = json_decode($json, true);

if ($data === NULL) {
    $return = ["returnwaarde" => 1, "object" => NULL];
} else {
    $return = ["returnwaarde" => 0, "object" => []];

    foreach ($data as $vak) {
        list($returnwaarde, $object) = update_vak($vak);
        $return["object"][] = ["returnwaarde" => $returnwaarde, "object" => $object];
    }
}

header('Content-Type: application/json');
echo json_encode($return);
