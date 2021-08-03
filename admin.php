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
require_once "php/login_admin.php";
require_once "php/footer.php";
require_once "php/print_copyright.php";
?>
<!DOCTYPE html>
<html lang="nl">
<?php htmlcopyright(); ?>
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <title>Bewerk cijfers – <?php echo $title; ?></title>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="style.css">
    <meta name="color-scheme" content="dark light">
    <script>
        const serverinfo = {
            domein: "<?php echo $domein; ?>",
            wachtwoord: "<?php echo $userpass; ?>",
            intern: <?php echo $intern ? "true" : "false"; ?>,
            interndomein: "<?php echo $interndomein; ?>",
            titel: "<?php echo $title; ?>"
        };
        const default_title = "<?php echo $title; ?>";
    </script>
    <script type="module" src="js/admin.js" defer></script>
    <script src="js/browser-error.js" nomodule defer></script>
</head>
<body>
<div id="popup" class="popupachtergrond popup"></div>

<div id="upload-studie-popup" class="popupscherm popup"></div>

<div id="wijzig-cijfer-popup" class="popupscherm popup"></div>

<div id="wijzig-vak-popup" class="popupscherm popup"></div>

<div id="cijfer-refresh-error" class="w3-container"></div>

<div id="content" class="w3-container">
    <h1 id="titel" class="w3-center"><?php echo $title; ?></h1>
    <div id="studie-select-vak" class="studie-select">
        <p class="load-warning"><em>Studies aan het laden&hellip;</em></p>
    </div>
    <form class="fullwidth" action="javascript:void(0)">
        <h2>Cijfers wijzigen</h2>
        <table id="cijfertabel" class="bottom-room w3-table-all w3-hoverable">
            <thead>
            <tr class="table-head">
                <th></th>
                <th>No.</th>
                <th>Titel</th>
                <th>Vak</th>
                <th>Datum</th>
                <th>Weging</th>
                <th>Cijfer</th>
            </tr>
            </thead>
            <!-- Hier worden de cijfers geplaatst door `js/admin.js` -->
            <tbody>
            <tr class="load-warning"><td class="w3-center" colspan="7"><em>Cijfers aan het laden&hellip;</em></td></tr>
            </tbody>
        </table>
        <div id="cijfer-deel-info"></div>
        <div id="cijferverwijdererror"></div>
        <div class="fullwidth" id="cijfer-buttons">
            <button type="button" id="wijzig-cijfer-button" class="w3-btn w3-padding w3-teal upload-button">Wijzig &nbsp; ❯
            </button>
            <button type="button" id="deel-cijfer-button" class="w3-btn w3-padding w3-teal upload-button">Deel &nbsp; ❯
            </button>
            <button type="button" id="verwijder-cijfer-button" class="w3-btn w3-padding w3-red upload-button">Verwijder &nbsp; ❯
            </button>
        </div>
    </form>

    <form class="fullwidth" action="javascript:void(0)">
        <h2 id="wijzig-vak">Vakken wijzigen</h2>
        <table id="vaktabel" class="w3-table-all w3-hoverable bottom-room">
            <thead>
            <tr class="table-head">
                <th></th>
                <th>No.</th>
                <th>Titel</th>
                <th>Jaar</th>
                <th>Periode</th>
                <th>Gemiddelde</th>
                <th>Studiepunten</th>
                <th>Eindcijfer</th>
                <th>Gehaald</th>
                <th>Toon</th>
            </tr>
            </thead>
            <!-- Hier worden de vakken geplaatst door `js/admin.js` -->
            <tbody>
            <tr class="load-warning"><td class="w3-center" colspan="9"><em>Vakken aan het laden&hellip;</em></td></tr>
            </tbody>
        </table>
        <div id="vakverwijdererror"></div>
        <div class="fullwidth" id="vak-buttons">
            <button type="button" id="wijzig-vak-button" class="w3-btn w3-padding w3-teal upload-button">Wijzig &nbsp; ❯
            </button>
            <button type="button" id="verwijder-vak-button" class="w3-btn w3-padding w3-red upload-button">Verwijder &nbsp; ❯
            </button>
        </div>
    </form>

    <div class="w3-row-padding">
        <div class="w3-half">
            <h2>Nieuwe cijfers</h2>
            <div id="cijfervakken">
            </div>
            <div id="cijferuploaderror"></div>
            <button type="button" id="upload-cijfers-button" class="w3-btn w3-padding w3-teal upload-button left">Upload
                alle &nbsp; ❯
            </button>
            <form class="left" id="reset-cijfers-form" action="javascript:void(0)">
                <input class="w3-input w3-border aantal-reset" type="number" name="aantal" required value="1" min="1"
                       step="1">
                <input type="submit" class="w3-btn w3-padding w3-red reset-button" value="Reset &nbsp; ❯">
            </form>
        </div>
        <div class="w3-half">
            <h2>Nieuwe Vakken</h2>
            <div id="vakvakken">
            </div>
            <div id="vakuploaderror"></div>
            <button type="button" id="upload-vakken-button" class="left w3-btn w3-padding w3-teal upload-button">Upload
                alle &nbsp; ❯
            </button>
            <form class="left" id="reset-vakken-form" action="javascript:void(0)">
                <input class="w3-input w3-border aantal-reset" type="number" name="aantal" required value="1" min="1"
                       step="1">
                <input type="submit" class="w3-btn w3-padding w3-red reset-button" value="Reset &nbsp; ❯">
            </form>
        </div>
    </div>

    <div style="display: flex; justify-content: center">
        <div class="w3-half">
            <div id="studievak"></div>
        </div>
    </div>

    <?php if ($grafiek) { ?>
    <div id="cijfer-grafiek"></div>
    <?php } ?>
</div>
<?php footer(false, true); ?>

<script>
    setTimeout(function() {
        let es = Array.prototype.slice.call(document.getElementsByClassName("load-warning"));
        for (let e of es) {
            e.classList.remove('load-warning');
        }
    }, 500);
</script>
</body>
</html>
