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
require_once "login_admin.php";
require_once "footer.php";
require_once "print_copyright.php";
?>
<!DOCTYPE html>
<html lang="nl">
<?php htmlcopyright(); ?>
<head>
    <title>Bewerk cijfers - <?php echo $title; ?></title>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <script src="admin.js" async></script>
    <style>
        @media (min-width: 601px) {
            .third-left, .third-mid {
                padding-right: 16px
            }

            .third-right, .third-mid {
                padding-left: 16px
            }
        }

        html {
            overflow-x: auto;
        }

        .upload-button {
            width: 140px;
            margin-right: 25px;
            margin-bottom: 10px;
        }

        .aantal-reset {
            width: 250px;
            float: left;
            margin-right: 15px;
            margin-bottom: 10px;
        }

        .reset-button {
            width: 100px;
            float: left;
            margin-bottom: 10px;
        }

        .popupachtergrond {
            position: fixed;
            background-color: black;
            opacity: 0.4;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            z-index: 2;
            display: none;
        }

        .popupscherm {
            position: fixed;
            left: 12.5%;
            width: calc(75% - 10px);
            top: 2.5%;
            background-color: rgba(255,255,255,0);
            height: 95%;
            overflow-y: auto;
            z-index: 3;
            display: none;
            overflow: -moz-scrollbars-none;
            -ms-overflow-style: none;
        }

        .popupscherm::-webkit-scrollbar {
            width: 0 !important
        }
    </style>
    <script>
        const serverinfo = {
            domein: "<?php echo $domein; ?>",
            wachtwoord: "<?php echo $userpass; ?>",
            intern: <?php echo $intern ? "true" : "false"; ?>,
            interndomein: "<?php echo $interndomein; ?>"
        };
    </script>
</head>
<body>
<div id="popup" class="popupachtergrond popup"></div>

<div id="wijzig-cijfer-popup" class="popupscherm popup"></div>

<div id="wijzig-vak-popup" class="popupscherm popup"></div>

<div class="w3-container">
    <h1 class="w3-center"><?php echo $title; ?></h1>
    <form style="width: 100%" action="javascript:void(0)">
        <h2>Cijfers wijzigen</h2>
        <table id="cijfertabel" class="w3-table-all w3-hoverable" style="margin-bottom: 15px;">
            <thead>
            <tr class="w3-light-grey">
                <th></th>
                <th>No.</th>
                <th>Titel</th>
                <th>Vak</th>
                <th>Datum</th>
                <th>Weging</th>
                <th>Cijfer</th>
            </tr>
            </thead>
            <!-- Hier worden de cijfers geplaatst door `admin.js` -->
        </table>
        <div style="width: 100%;" id="cijfer-buttons">
            <button type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="wijzigCijferSelectie()">Wijzig &nbsp; ❯
            </button>
            <button type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="deelCijferSelectie()">Deel &nbsp; ❯
            </button>
            <button type="button" class="w3-btn w3-padding w3-red upload-button" onclick="verwijderCijferSelectie()">Verwijder &nbsp; ❯
            </button>
        </div>
    </form>

    <form style="width: 100%" action="javascript:void(0)">
        <h2 style="margin-top: 15px;">Vakken wijzigen</h2>
        <table id="vaktabel" class="w3-table-all w3-hoverable" style="margin-bottom: 15px;">
            <thead>
            <tr class="w3-light-grey">
                <th></th>
                <th>No.</th>
                <th>Titel</th>
                <th>Jaar</th>
                <th>Periode</th>
                <th>Studiepunten</th>
                <th>Eindcijfer</th>
                <th>Gehaald</th>
                <th>Toon</th>
            </tr>
            </thead>
            <!-- Hier worden de vakken geplaatst door `admin.js` -->
        </table>
        <div style="width: 100%;" id="vak-buttons">
            <button type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="wijzigVakSelectie()">Wijzig &nbsp; ❯
            </button>
            <button type="button" class="w3-btn w3-padding w3-red upload-button" onclick="verwijderVakSelectie()">Verwijder &nbsp; ❯
            </button>
        </div>
    </form>

    <div class="w3-row-padding">
        <div class="w3-half">
            <h2>Nieuwe cijfers</h2>
            <div id="cijfervakken">
                <div id="cijfervak0">
                </div>
            </div>
            <button type="button" style="float: left;" class="w3-btn w3-padding w3-teal upload-button" onclick="uploadAlleCijfers()">Upload
                alle &nbsp; ❯
            </button>
            <form style="float: left" id="resetCijfer" onsubmit="resetCijferUpload()" action="javascript:void(0)">
                <input class="w3-input w3-border aantal-reset" type="number" name="aantal" required value="1" min="1"
                       step="1">
                <input type="submit" class="w3-btn w3-padding w3-red reset-button" value="Reset &nbsp; ❯">
            </form>
        </div>
        <div class="w3-half">
            <h2>Nieuwe Vakken</h2>
            <div id="vakvakken">
                <div id="vak0">
                </div>
            </div>
            <button style="float: left;" type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="uploadAlleVakken()">Upload
                alle &nbsp; ❯
            </button>
            <form style="float: left" id="resetVak" onsubmit="resetVakUpload()" action="javascript:void(0)">
                <input class="w3-input w3-border aantal-reset" type="number" name="aantal" required value="1" min="1"
                       step="1">
                <input type="submit" class="w3-btn w3-padding w3-red reset-button" value="Reset &nbsp; ❯">
            </form>
        </div>
    </div>
</div>
<?php footer(false, true); ?>
</body>
</html>
