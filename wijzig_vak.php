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

function wijzig_vak() {
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

    if (!isset($_POST['vakid']) || !is_numeric($_POST['vakid'])) {
        return [-2, NULL];
    }

    /* @var Vak $vak */
    $vak = Vak::getVak($_POST['vakid']);

    if ($vak === NULL) {
        return [-2, NULL];
    }

    if (!isset($_POST['naam']) || empty($_POST['naam']) || $_POST['naam'] === 'null') {
        return [-3, NULL];
    }

    $naam = $_POST['naam'];

    if (!isset($_POST['jaar']) || $_POST['jaar'] === "" || $_POST['jaar'] === 'null' || !is_numeric($_POST['jaar'])) {
        return [-4, NULL];
    }

    $jaar = $_POST['jaar'];

    if (!isset($_POST['studiepunten']) || $_POST['studiepunten'] === "" ||
        $_POST['studiepunten'] === 'null' || !is_numeric($_POST['studiepunten'])) {
        return [-5, NULL];
    }

    $studiepunten = $_POST['studiepunten'];

    if (!isset($_POST['periode']) || $_POST['periode'] === "") {
        $periode = NULL;
    } else {
        $periode = $_POST['periode'];
        if (!is_numeric($periode)) {
            return [-6, NULL];
        }
    }

    if (!isset($_POST['gehaald']) || !filter_var($_POST['gehaald'], FILTER_VALIDATE_BOOLEAN)) {
        $gehaald = false;
    } else {
        $gehaald = true;
    }

    if (!isset($_POST['toon']) || !filter_var($_POST['toon'], FILTER_VALIDATE_BOOLEAN)) {
        $toon = false;
    } else {
        $toon = true;
    }

    if (!isset($_POST['eindcijfer']) || $_POST['eindcijfer'] === "") {
        $eindcijfer = NULL;
    } else {
        $eindcijfer = $_POST['eindcijfer'];
        if (!is_numeric($eindcijfer)) {
            return [-7, NULL];
        }
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

list($return["returnwaarde"], $return["object"]) = wijzig_vak();
header('Content-Type: application/json');
echo json_encode($return);
