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

function verwijder_vak($array) {
    global $session;

    if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
        session_start(); //sessie starten
    }

    if (!isset($_SESSION[$session . 'admin'])) {
        $_SESSION[$session . 'admin'] = NULL;
    }

    if ($_SESSION[$session . 'admin'] !== "ingelogd") {
        return -1;
    }

    if (!isset($array['vaknummer']) || !is_numeric($array['vaknummer'])) {
        return -2;
    }

    /* @var Vak $vak */
    $vak = Vak::getVak($array['vaknummer']);

    if ($vak === NULL) {
        return -3;
    }


    return (int) (!$vak->verwijder());
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
        $returnwaarde = verwijder_vak($vak);
        $return["object"][] = ["returnwaarde" => $returnwaarde];
    }
}

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($return);
