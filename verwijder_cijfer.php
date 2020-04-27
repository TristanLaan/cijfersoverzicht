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
require_once "Cijfer.php";

function verwijder_cijfer() {
    global $session;

    if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
        session_start(); //sessie starten
    }

    if (!isset($_SESSION[$session . 'admin'])) {
        $_SESSION[$session . 'admin'] = NULL;
    }

    if ($_SESSION[$session . 'admin'] !== "ingelogd") {
        return -1;
    }

    if (!isset($_POST['cijferid']) || !is_numeric($_POST['cijferid'])) {
        return -2;
    }

    /* @var Cijfer $cijfer */
    $cijfer = Cijfer::getCijfer($_POST['cijferid']);

    if ($cijfer === NULL) {
        return -3;
    }


    return (int) (!$cijfer->verwijder());
}

echo verwijder_cijfer();
