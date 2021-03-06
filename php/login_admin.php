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
require_once "php/print_copyright.php";
require_once "php/footer.php";


$datum = new DateTime();

if (session_status() == PHP_SESSION_NONE) { //controleren of sessie al is gestart
    session_start(); //sessie starten
}

if (!isset($_SESSION[$session . 'admin'])) { //uitvoeren als er op loguit is gedrukt
    $_SESSION[$session . 'admin'] = null; //sessie leegmaken
}

if ($_SESSION[$session . 'admin'] === null) //weergeven als niet is ingelogd
{
    ?>
    <!DOCTYPE html>
    <html lang="nl">
    <?php htmlcopyright(); ?>
    <head>
        <title>Login om cijfers te beheren – <?php echo $title; ?></title>
        <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
        <link rel="stylesheet" href="style.css">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
                xhttp.open("POST", "login_admin_ajax.php", true);
                xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xhttp.send("password=" + pass);
            }
        </script>
    </head>
    <body>
    <div class="w3-display-topmiddle">
        <h1 class="w3-xxxlarge titel-tekst"><?php echo $title; ?></h1>
    </div>

    <div class="w3-display-middle">
        <div id="error" class="error w3-panel w3-red w3-card w3-display-container">
            <span onclick="this.parentElement.style.display='none'"
                  class="w3-button w3-small w3-display-topright">×</span>
            <p id="errortext"></p>
        </div>

        <div class="w3-card-4 login-box">
            <div class="login-header w3-container w3-pale-red">
                <h2>Log in admin:</h2>
            </div>
            <form method="post" action="javascript:void(0)" onsubmit="loginsite()">
                <div class="w3-container">
                    <p><input class="w3-input login-header" id="password" type="password" name="password" placeholder="wachtwoord"
                              autocomplete="current-password" required></p>
                </div>
                <div class="w3-bar">
                    <button type="submit" name="login"
                            class="login-knop-admin knophalf w3-bar-item2 w3-button w3-block w3-dark-grey">Login
                    </button>
                </div>
            </form>
        </div>
    </div>
    <?php footer(true, true); ?>
    </body>
    </html>
    <?php
    exit();
} else {
    if (strpos($_SERVER["SCRIPT_NAME"], "login_admin.php") !== FALSE) {//controleren of huidige pagina login.php ?>
        <script type="text/javascript">
            window.location = "admin.php";
        </script>
    <?php }
}
?>
