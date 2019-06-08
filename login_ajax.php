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
if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
    session_start(); //sessie starten
}

if (!isset($_SESSION[$session])) { //uitvoeren als er op loguit is gedrukt
    $_SESSION[$session] = null; //sessie leegmaken
}

if (isset($_POST['password'])) //uitvoeren als er op inloggen is gedrukt
{
    $password = $_POST['password'];
    if ($password == $userpass) {
        $_SESSION[$session] = "ingelogd";
        echo "0";
    } else {
        echo "1";
    }
}