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
    <link rel="stylesheet" href="style.css">
    <script src="admin.js" async></script>
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
    <form class="fullwidth" action="javascript:void(0)">
        <h2>Cijfers wijzigen</h2>
        <table id="cijfertabel" class="bottom-room w3-table-all w3-hoverable">
            <thead>
            <tr class="w3-light-grey table-head">
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
        <div class="fullwidth" id="cijfer-buttons">
            <button type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="wijzigCijferSelectie()">Wijzig &nbsp; ❯
            </button>
            <button type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="deelCijferSelectie()">Deel &nbsp; ❯
            </button>
            <button type="button" class="w3-btn w3-padding w3-red upload-button" onclick="verwijderCijferSelectie()">Verwijder &nbsp; ❯
            </button>
        </div>
    </form>

    <form class="fullwidth" action="javascript:void(0)">
        <h2 id="wijzig-vak">Vakken wijzigen</h2>
        <table id="vaktabel" class="w3-table-all w3-hoverable bottom-room">
            <thead>
            <tr class="w3-light-grey table-head">
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
        <div class="fullwidth" id="vak-buttons">
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
            <button type="button" class="w3-btn w3-padding w3-teal upload-button left" onclick="uploadAlleCijfers()">Upload
                alle &nbsp; ❯
            </button>
            <form class="left" id="resetCijfer" onsubmit="resetCijferUpload()" action="javascript:void(0)">
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
            <button type="button" class="left w3-btn w3-padding w3-teal upload-button" onclick="uploadAlleVakken()">Upload
                alle &nbsp; ❯
            </button>
            <form class="left" id="resetVak" onsubmit="resetVakUpload()" action="javascript:void(0)">
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
