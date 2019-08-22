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

function verwijder_vak() {
    global $session;

    if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
        session_start(); //sessie starten
    }

    if ($_SESSION[$session . 'admin'] !== "ingelogd") {
        return -1;
    }

    if (!isset($_POST['vakid']) || !is_numeric($_POST['vakid'])) {
        return -2;
    }

    /* @var Vak $vak */
    $vak = Vak::getVak($_POST['vakid']);

    if ($vak === NULL) {
        return -3;
    }


    return (int) (!$vak->verwijder());
}

echo verwijder_vak();
