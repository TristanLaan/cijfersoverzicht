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

function verbindDatabase() {
    try {
        global $server, $password, $username, $database, $charset;
        $connectie = new PDO("mysql:host=$server;dbname=$database;charset=$charset", $username, $password);
    } catch (PDOException $ex) {
        echo "<p>Er is een probleem met de database, neem contact op met de beheerder.</p><p>Error informatie:</p><pre>verbindDatabase:\n";
        echo $ex->getMessage() . "</pre>";
        return NULL;
    }

    return $connectie;
}
