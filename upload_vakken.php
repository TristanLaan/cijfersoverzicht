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

require_once "upload_vak_function.php";

// Takes raw data from the request
$json = file_get_contents('php://input');

// Converts the raw data into a array
$data = json_decode($json, true);

if ($data === NULL) {
    $return = ["returnwaarde" => 1, "object" => NULL];
} else {
    $return = ["returnwaarde" => 0, "object" => []];

    foreach ($data as $vak) {
        list($returnwaarde, $object) = upload_vak($vak);
        $return["object"][] = ["returnwaarde" => $returnwaarde, "object" => $object];
    }
}

header('Content-Type: application/json');
echo json_encode($return);
