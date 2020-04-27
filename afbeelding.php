<?php
/**
 * Copyright (c) Tristan Laan 2018-2020.
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

if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
    session_start(); //sessie starten
}

if (!isset($_SESSION[$session])) {
    $_SESSION[$session] = NULL;
}

if ($_SESSION[$session] !== "ingelogd") {
    http_response_code(403);
} else {
    if (!isset($_GET["id"]) || empty($_GET["id"])) {
        http_response_code(400);
    } else {
        $file_name = $_GET["id"];
        $files = scandir($afbeelding_dir);
        foreach ($files as $file) {
            if (strpos($file, $file_name) !== false) {
                $file_parts = pathinfo($file);
                switch ($file_parts['extension']) {
                    case "svg":
                        header("Content-Type: image/svg+xml");
                        break;
                    case "png":
                        header("Content-Type: image/png");
                        break;
                    case "jpeg":
                    case "jpg":
                        header("Content-Type: image/jpeg");
                        break;
                    default:
                        http_response_code(400);
                        exit();
                }
                // Set etag in header for caching results
                $etag = md5_file($afbeelding_dir . "/" . $file);
                header('ETag: ' . $etag);
                header('Cache-Control: private, must-revalidate');

                if(isset($_SERVER['HTTP_IF_NONE_MATCH']) && $_SERVER['HTTP_IF_NONE_MATCH'] === $etag) {
                    http_response_code(304);
                } else {
                    readfile($afbeelding_dir . "/" . $file);
                }
                exit();
            }
        }

        http_response_code(404);
    }
}
