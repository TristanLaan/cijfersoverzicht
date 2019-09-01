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
require_once "footer.php";
require_once "print_copyright.php";

$datum = new DateTime();
if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
    session_start(); //sessie starten
}

if (!isset($_SESSION[$session])) { //uitvoeren als er op loguit is gedrukt
    $_SESSION[$session] = null; //sessie leegmaken
}

if ($_SESSION[$session] == null) //weergeven als niet is ingelogd
{
    ?>
    <!DOCTYPE html>
    <html lang="nl">
    <?php htmlcopyright(); ?>
    <head>
        <title>Login om cijfers te zien - <?php echo $title; ?></title>
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <script>
            function loginsite() {
                const pass = document.getElementById("password").value;
                const xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState === 4 && this.status === 200) {
                        document.getElementById("password").value = "";
                        console.debug("ajax response: " + this.responseText);
                        const errorvak = document.getElementById("error");
                        const errorcode = parseInt(this.responseText);
                        const errortext = document.getElementById("errortext");
                        switch (errorcode) {
                            case 0:
                                window.location.reload(true);
                                console.debug("logged in");
                                break;
                            case 1:
                                errorvak.style.display = "block";
                                errortext.innerText = "Wachtwoord onjuist";
                                break;
                            default:
                                errorvak.style.display = "block";
                                errortext.innerText = "Onbekende fout";
                                break;
                        }
                    }
                };
                xhttp.open("POST", "login_ajax.php", true);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("password=" + pass);
            }
        </script>
    </head>
    <body>
    <div class="w3-display-topmiddle">
        <h1 class="w3-xxxlarge"><?php echo $title; ?></h1>
    </div>

    <div class="w3-display-middle">
        <div style="display: none" id="error" class="w3-panel w3-red w3-card w3-display-container">
            <span onclick="this.parentElement.style.display='none'"
                  class="w3-button w3-small w3-display-topright">×</span>
            <p id="errortext"></p>
        </div>

        <div class="w3-card-4">
            <div class="w3-container w3-light-grey">
                <h2>Log in:</h2>
            </div>
            <form method="post" action="javascript:void(0)" onsubmit="loginsite()">
                <div class="w3-container">
                    <p><input class="w3-input" id="password" type="password" name="password" placeholder="wachtwoord"
                              required></p>
                </div>
                <div class="w3-bar">
                    <button type="submit" name="login"
                            class="knophalf w3-bar-item2 w3-button w3-block w3-dark-grey w3-border-right">Login
                    </button>
                </div>
            </form>
        </div>
    </div>
    <?php footer(true); ?>
    </body>
    </html>
    <?php
    exit();
} else {
    if (strpos($_SERVER["SCRIPT_NAME"], "login.php") !== FALSE) {//controleren of huidige pagina login.php ?>
        <script type="text/javascript">
            window.location = "index.php";
        </script>
    <?php }
}
?>
