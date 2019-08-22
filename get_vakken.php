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

if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

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
    if (isset($_POST['vakid']) && $_POST['vakid'] !== "None" && $_POST['vakid'] !== "null") {
        if (!is_numeric($_POST['vakid'])) {
            $return["returnwaarde"] = -2;
        } else {
            $return["object"] = Vak::getVak($_POST['vakid']);
        }
    } else {
        $return["object"] = Vak::getAllVakken();
    }
}

$return["md5"] = md5(json_encode($return));

if (isset($_POST["md5"]) && $_POST["md5"] == "true") {
    header('Content-Type: text/plain');
    echo $return["md5"];
} else {
    header('Content-Type: application/json');
    echo json_encode($return);
}
