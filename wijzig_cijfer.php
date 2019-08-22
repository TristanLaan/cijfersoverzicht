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

require_once "connect.php";
require_once "Vak.php";
require_once "Cijfer.php";

function wijzig_cijfer() {
    global $session;

    if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
        session_start(); //sessie starten
    }

    if ($_SESSION[$session . 'admin'] !== "ingelogd") {
        return [-1, NULL];
    }

    if (!isset($_POST['cijferid']) || !is_numeric($_POST['cijferid'])) {
        return [-2, NULL];
    }

    /* @var Cijfer $cijfer */
    $cijfer = Cijfer::getCijfer($_POST['cijferid']);

    if ($cijfer === NULL) {
        return [-2, NULL];
    }

    if (!isset($_POST['vakid'])) {
        return [-3, NULL];
    }

    if (!isset($_POST['naam']) || empty($_POST['naam']) || $_POST['naam'] === 'null') {
        return [-4, NULL];
    }

    $naam = $_POST['naam'];

    if (!isset($_POST['weging']) || $_POST['weging'] === "") {
        $weging = NULL;
    } else {
        $weging = $_POST['weging'];
        if (!is_numeric($weging)) {
            return [-8, NULL];
        }
    }

    if (!isset($_POST['datum']) || $_POST['datum'] === "") {
        $datum = NULL;
    } else {
        try {
            $datum = DateTime::createFromFormat("Y-m-d", $_POST['datum']);
            if (!$datum) {
                return [-5, NULL];
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
            return [-5, NULL];
        }
    }

    if (!isset($_POST['cijfer']) || $_POST['cijfer'] === "") {
        $cijferwaarde = NULL;
    } else {
        $cijferwaarde = $_POST['cijfer'];
        if (!is_numeric($cijferwaarde)) {
            return [-6, NULL];
        }
    }

    if (!is_numeric($_POST['vakid'])) {
        $vak = NULL;
    } else {
        $vak = Vak::getVak($_POST['vakid']);
    }

    if ($vak === NULL) {
        return [-7, NULL];
    }

    $cijfer->vak = $vak;
    $cijfer->datum = $datum;
    $cijfer->weging = $weging;
    $cijfer->naam = $naam;
    $cijfer->cijfer = $cijferwaarde;

    $return = $cijfer->update();
    return [$return, $cijfer];
}

list($return["returnwaarde"], $return["object"]) = wijzig_cijfer();
header('Content-Type: application/json');
echo json_encode($return);
