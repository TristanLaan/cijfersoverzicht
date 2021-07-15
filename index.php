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

require_once "php/login.php";
require_once "connect.php";
require_once "php/footer.php";
require_once "php/print_copyright.php";

$datum = new DateTime();
?>
<!DOCTYPE html>
<html lang="nl">
<?php htmlcopyright(); ?>
<head>
    <meta charset="utf-8"/>
    <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
    <title><?php echo $title; ?></title>
    <meta name="viewport" content="width=1200px, initial-scale=0.86, maximum-scale=3.0, minimum-scale=0.25"/>
    <meta name="color-scheme" content="dark light">
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="style.css">
    <script type="module" src="js/user.js" defer></script>
    <script src="js/browser-error.js" nomodule defer></script>
    <script>
        const default_title = "<?php echo $title; ?>";
    </script>
</head>

<body>
<div id="popup" class="popupachtergrond popup"></div>
<div id="error-popup" class="popupscherm popup"></div>
<div id="content" class="w3-container index-table">
    <h1 id="titel" class="w3-center"><?php echo $title; ?></h1>
    <div id="studie-select-vak" class="studie-select">
        <p class="load-warning"><em>Studies aan het laden&hellip;</em></p>
    </div>
    <h2>Cijfers</h2>

    <table id="huidige-cijfers" class="w3-table-all w3-hoverable">
        <thead>
        <tr class="table-head">
            <th>Vak</th>
            <th class="table-cijfertitel">Titel</th>
            <th>Datum</th>
            <th>Weging</th>
            <th>Cijfer</th>
        </tr>
        </thead>
        <!-- Hier worden de huidige cijfers geplaatst door `user.js` -->
        <tbody>
        <tr class="load-warning"><td class="w3-center" colspan="5"><em>Cijfers aan het laden&hellip;</em></td></tr>
        </tbody>
    </table>

    <h2>Vakken</h2>

    <table id="vakken" class="w3-table-all w3-hoverable">
        <thead>
        <tr class="table-head">
            <th>Vak</th>
            <th>Jaar</th>
            <th>Periode</th>
            <th>Gemiddelde cijfer</th>
            <th><span style="font-style: italic;">(Voorlopig)</span> eindcijfer</th>
            <th>Studiepunten</th>
            <th>Gehaald</th>
        </tr>
        </thead>
        <!-- Hier worden de vakken geplaatst door `user.js` -->
        <tbody>
        <tr class="load-warning"><td class="w3-center" colspan="7"><em>Vakken aan het laden&hellip;</em></td></tr>
        </tbody>
    </table>

    <div id="studie-info"></div>
    <?php if ($grafiek) { ?>
    <div id="cijfer-grafiek"></div>

    <?php } ?>

    <h2>Oude cijfers</h2>

    <table id="oude-cijfers" class="w3-table-all w3-hoverable">
        <thead>
        <tr class="table-head">
            <th>Vak</th>
            <th class="table-cijfertitel">Titel</th>
            <th>Datum</th>
            <th>Weging</th>
            <th>Cijfer</th>
        </tr>
        </thead>
        <!-- Hier worden de oude cijfers geplaatst door `user.js` -->
        <tbody>
        <tr class="load-warning"><td class="w3-center" colspan="5"><em>Cijfers aan het laden&hellip;</em></td></tr>
        </tbody>
    </table>

</div>

<br>
<?php footer(); ?>

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
