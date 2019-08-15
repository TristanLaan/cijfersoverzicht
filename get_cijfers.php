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

header('Content-Type: application/json');

$return["returnwaarde"] = 0;
$return["object"] = NULL;

if (!isset($_SESSION[$session])) {
    $_SESSION[$session] = NULL;
}

if (!isset($_SESSION[$session . 'admin'])) {
    $_SESSION[$session . 'admin'] = NULL;
}

if ($_SESSION[$session] !== "ingelogd" && $_SESSION[$session . 'admin'] !== "ingelogd") {
    $return["returnwaarde"] = -1;
} else {
    if (isset($_POST['cijferid']) && $_POST['cijferid'] !== "None" && $_POST['cijferid'] !== "null") {
        if (!is_numeric($_POST['cijferid'])) {
            $return["returnwaarde"] = -2;
        } else {
            $return["object"] = Cijfer::getCijfer($_POST['cijferid']);
        }
    } elseif (isset($_POST['vakid']) && $_POST['vakid'] !== "None" && $_POST['vakid'] !== "null") {
        if (!is_numeric($_POST['vakid'])) {
            $return["returnwaarde"] = -2;
        } else {
            $vak = Vak::getVak($_POST['vakid']);

            if ($vak === NULL) {
                $return["returnwaarde"] = -3;
            } else {
                $return["object"] = $vak->getCijfers();
            }
        }
    } else {
        $return["object"] = Cijfer::getAllCijfers();
    }
}

echo json_encode($return);
