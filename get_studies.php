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
require_once "php/Studie.php";

if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
    session_start(); //sessie starten
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
    $return["object"] = Studie::getAllStudies();
}

$etag = md5(json_encode($return));

// Set etag in header for caching results
header('Content-Type: application/json; charset=UTF-8');
header("ETag: \"$etag\"");
header('Cache-Control: private, must-revalidate');

if(isset($_SERVER['HTTP_IF_NONE_MATCH']) && ($_SERVER['HTTP_IF_NONE_MATCH'] === $etag || $_SERVER['HTTP_IF_NONE_MATCH'] === "W/\"$etag\"")) {
    http_response_code(304);
} else {
    echo json_encode($return);
}
