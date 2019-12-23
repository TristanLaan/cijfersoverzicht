<?php
/**
 * Copyright (c) Tristan Laan 2018-2019.
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

/**
 * @param array $array
 * @return array
 */
function upload_cijfer($array = NULL) {
    global $session;

    if ($array === NULL) {
        $array = $_POST;
    }

    if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
        session_start(); //sessie starten
    }

    if (!isset($_SESSION[$session . 'admin'])) {
        $_SESSION[$session . 'admin'] = NULL;
    }

    if ($_SESSION[$session . 'admin'] !== "ingelogd") {
        return [-1, NULL];
    }

    if (!isset($array['vakid'])) {
        return [-2, NULL];
    }

    if (!isset($array['naam']) || empty($array['naam']) || $array['naam'] === 'null') {
        return [-3, NULL];
    }

    $naam = $array['naam'];

    if (!isset($array['weging']) || $array['weging'] === "") {
        $weging = NULL;
    } else {
        $weging = $array['weging'];
        if (!is_numeric($weging)) {
            return [-7, NULL];
        }
    }

    if (!isset($array['datum']) || $array['datum'] === "") {
        $datum = NULL;
    } else {
        try {
            $datum = DateTime::createFromFormat("Y-m-d", $array['datum']);
            if (!$datum) {
                return [-4, NULL];
            }
        } catch (Exception $e) {
            error_log($e->getMessage());
            return [-4, NULL];
        }
    }

    if (!isset($array['cijfer']) || $array['cijfer'] === "") {
        $cijfer = NULL;
    } else {
        $cijfer = $array['cijfer'];
        if (!is_numeric($cijfer)) {
            return [-6, NULL];
        }
    }

    if (!is_numeric($array['vakid'])) {
        $vak = NULL;
    } else {
        $vak = Vak::getVak($array['vakid']);
    }

    if ($vak === NULL) {
        return [-5, NULL];
    }

    /* @var Cijfer $uploadedCijfer */
    return Cijfer::createCijfer($vak, $naam, $weging, $datum, $cijfer);
}
