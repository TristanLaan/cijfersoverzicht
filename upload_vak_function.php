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
require_once "Vak.php";

/**
 * @param array $array
 * @return array
 */
function upload_vak($array = NULL) {
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

    if (!isset($array['naam']) || empty($array['naam']) || $array['naam'] === 'null') {
        return [-2, NULL];
    }

    $naam = $array['naam'];

    if (!isset($array['jaar']) || $array['jaar'] === "" || $array['jaar'] === 'null' || !is_numeric($array['jaar'])) {
        return [-3, NULL];
    }

    $jaar = $array['jaar'];

    if (!isset($array['studiepunten']) || $array['studiepunten'] === "" || $array['studiepunten'] === 'null' || !is_numeric($array['studiepunten'])) {
        return [-4, NULL];
    }

    $studiepunten = $array['studiepunten'];

    if (!isset($array['periode']) || $array['periode'] === "") {
        $periode = NULL;
    } else {
        $periode = $array['periode'];
        if (!is_numeric($periode)) {
            return [-5, NULL];
        }
    }

    if (!isset($array['gehaald']) || !filter_var($array['gehaald'], FILTER_VALIDATE_BOOLEAN)) {
        $gehaald = false;
    } else {
        $gehaald = true;
    }

    if (!isset($array['toon']) || !filter_var($array['toon'], FILTER_VALIDATE_BOOLEAN)) {
        $toon = false;
    } else {
        $toon = true;
    }

    if (!isset($array['eindcijfer']) || $array['eindcijfer'] === "") {
        $eindcijfer = NULL;
    } else {
        $eindcijfer = $array['eindcijfer'];
        if (!is_numeric($eindcijfer)) {
            return [-6, NULL];
        }
    }

    /* @var Vak $uploadedVak */
    return Vak::createVak($naam, $jaar, $studiepunten, $gehaald, $toon, $periode, $eindcijfer);
}
