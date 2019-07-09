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

if ($_SESSION[$session . 'admin'] !== "ingelogd") {
    echo "-1";
    exit();
}

if (!isset($_POST['cijferid']) || !is_numeric($_POST['cijferid'])) {
    echo "-2";
    exit();
}

/* @var Cijfer $cijfer */
$cijfer = Cijfer::getCijfer($_POST['cijferid']);

if ($cijfer === NULL) {
    echo "-2";
    exit();
}

if (!isset($_POST['vakid'])) {
    echo "-3";
    exit();
}

if (!isset($_POST['naam']) || empty($_POST['naam']) || $_POST['naam'] === 'null') {
    echo "-4";
    exit();
}

$naam = $_POST['naam'];

if (!isset($_POST['weging']) || $_POST['weging'] === "") {
    $weging = NULL;
} else {
    $weging = $_POST['weging'];
    if (!is_numeric($weging)) {
        echo -8;
        exit();
    }
}

if (!isset($_POST['datum']) || $_POST['datum'] === "") {
    $datum = NULL;
} else {
    try {
        $datum = DateTime::createFromFormat("Y-m-d", $_POST['datum']);
        if (!$datum) {
            echo "-5";
            exit();
        }
    } catch (Exception $e) {
        error_log($e->getMessage());
        echo "-5";
        exit();
    }
}

if (!isset($_POST['cijfer']) || $_POST['cijfer'] === "") {
    $cijferwaarde = NULL;
} else {
    $cijferwaarde = $_POST['cijfer'];
    if (!is_numeric($cijferwaarde)) {
        echo -6;
        exit();
    }
}

if (!is_numeric($_POST['vakid'])) {
    $vak = NULL;
} else {
    $vak = Vak::getVak($_POST['vakid']);
}

if ($vak === NULL) {
    echo "-7";
    exit();
}

$cijfer->vak = $vak;
$cijfer->cijfer = $_POST['cijfer'];
$cijfer->datum = $datum;
$cijfer->weging = $weging;
$cijfer->naam = $naam;
$cijfer->cijfer = $cijferwaarde;

$return = $cijfer->update();

if ($return !== 0) {
    echo $return;
    exit();
}

echo "0\n";

echo json_encode($cijfer);
