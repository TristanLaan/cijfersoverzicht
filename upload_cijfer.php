<?php
/**
 * Copyright (c) Tristan Laan 2019.
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
require_once "Vak.php";
require_once "Cijfer.php";

function upload_cijfer() {
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

    if (!isset($_POST['vakid'])) {
        return [-2, NULL];
    }

    if (!isset($_POST['naam']) || empty($_POST['naam']) || $_POST['naam'] === 'null') {
        return [-3, NULL];
    }

    $naam = $_POST['naam'];

    if (!isset($_POST['weging']) || $_POST['weging'] === "") {
        $weging = NULL;
    } else {
        $weging = $_POST['weging'];
        if (!is_numeric($weging)) {
            return [-7, NULL];
        }
    }

    if (!isset($_POST['datum']) || $_POST['datum'] === "") {
        $datum = NULL;
    } else {
        try {
            $datum = DateTime::createFromFormat("Y-m-d", $_POST['datum']);
            if (!$datum) {
                return [-4, NULL];
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
            return [-4, NULL];
        }
    }

    if (!isset($_POST['cijfer']) || $_POST['cijfer'] === "") {
        $cijfer = NULL;
    } else {
        $cijfer = $_POST['cijfer'];
        if (!is_numeric($cijfer)) {
            return [-6, NULL];
        }
    }

    if (!is_numeric($_POST['vakid'])) {
        $vak = NULL;
    } else {
        $vak = Vak::getVak($_POST['vakid']);
    }

    if ($vak === NULL) {
        return [-5, NULL];
    }

    /* @var Cijfer $uploadedCijfer */
    return Cijfer::createCijfer($vak, $naam, $weging, $datum, $cijfer);
}

list($return["returnwaarde"], $return["object"]) = upload_cijfer();
header('Content-Type: application/json');
echo json_encode($return);
