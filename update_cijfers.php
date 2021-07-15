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
require_once "php/Cijfer.php";

function update_cijfer($array) {
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

    $cijfer = NULL;

    if (isset($array['cijfernummer']) && $array['cijfernummer'] !== '') {
        if (!is_numeric($array['cijfernummer'])) {
            return [-2, NULL];
        }

        /* @var Cijfer $cijfer */
        $cijfer = Cijfer::getCijfer($array['cijfernummer']);

        if ($cijfer === NULL) {
            return [-2, NULL];
        }
    }

    if (empty($array['vaknummer'])) {
        return [-3, NULL];
    }

    if (empty($array['naam']) || $array['naam'] === 'null') {
        return [-4, NULL];
    }

    $naam = $array['naam'];

    if (!isset($array['weging']) || $array['weging'] === '') {
        $weging = NULL;
    } else {
        $weging = $array['weging'];
        if (!is_numeric($weging)) {
            return [-8, NULL];
        }
    }

    if (empty($array['datum'])) {
        $datum = NULL;
    } else {
        try {
            $datum = DateTime::createFromFormat("Y-m-d", $array['datum']);
            if (!$datum) {
                return [-5, NULL];
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
            return [-5, NULL];
        }
    }

    if (!isset($array['cijfer']) || $array['cijfer'] === '') {
        $cijferwaarde = NULL;
    } else {
        $cijferwaarde = $array['cijfer'];
        if (!is_numeric($cijferwaarde)) {
            return [-6, NULL];
        }
    }

    if (!isset($array['beschrijving']) || $array['beschrijving'] === '') {
        $beschrijving = NULL;
    } else {
        $beschrijving = $array['beschrijving'];
    }

    if (!is_numeric($array['vaknummer'])) {
        $vak = NULL;
    } else {
        $vak = Vak::getVak($array['vaknummer']);
    }

    if ($vak === NULL) {
        return [-7, NULL];
    }

    if ($cijfer === NULL) {
        return Cijfer::createCijfer($vak, $naam, $weging, $datum, $cijferwaarde, $beschrijving);
    }

    $cijfer->vak = $vak;
    $cijfer->datum = $datum;
    $cijfer->weging = $weging;
    $cijfer->naam = $naam;
    $cijfer->cijfer = $cijferwaarde;
    $cijfer->beschrijving = $beschrijving;

    $return = $cijfer->update();

    return [$return, $cijfer];
}

// Takes raw data from the request
$json = file_get_contents('php://input');

// Converts the raw data into a array
$data = json_decode($json, true);

if ($data === NULL) {
    $return = ["returnwaarde" => 1, "object" => NULL];
} else {
    $return = ["returnwaarde" => 0, "object" => []];

    foreach ($data as $cijfer) {
        list($returnwaarde, $object) = update_cijfer($cijfer);
        $return["object"][] = ["returnwaarde" => $returnwaarde, "object" => $object];
    }
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($return);
