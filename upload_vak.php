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

if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
    session_start(); //sessie starten
}

if (!isset($_SESSION[$session . 'admin'])) {
    $_SESSION[$session . 'admin'] = NULL;
}

if ($_SESSION[$session . 'admin'] !== "ingelogd") {
    echo "-1";
    exit();
}

if (!isset($_POST['naam']) || empty($_POST['naam']) || $_POST['naam'] === 'null') {
    echo "-2";
    exit();
}

$naam = $_POST['naam'];

if (!isset($_POST['jaar']) || $_POST['jaar'] === "" || $_POST['jaar'] === 'null' || !is_numeric($_POST['jaar'])) {
    echo -3;
    exit();
}

$jaar = $_POST['jaar'];

if (!isset($_POST['studiepunten']) || $_POST['studiepunten'] === "" || $_POST['studiepunten'] === 'null' || !is_numeric($_POST['studiepunten'])) {
    echo -4;
    exit();
}

$studiepunten = $_POST['studiepunten'];

if (!isset($_POST['periode']) || $_POST['periode'] === "") {
    $periode = NULL;
} else {
    $periode = $_POST['periode'];
    if (!is_numeric($periode)) {
        echo -5;
        exit();
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
        echo -6;
        exit();
    }
}

/* @var Vak $uploadedVak */
list($return, $uploadedVak) = Vak::createVak($naam, $jaar, $studiepunten, $gehaald, $toon, $periode, $eindcijfer);

if ($return !== 0) {
    echo $return;
    exit();
}

echo "0\n";

echo json_encode($uploadedVak);
