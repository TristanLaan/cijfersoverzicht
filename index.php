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
$datum = new DateTime();

/*Wachtwoord vragen voor bezoeken website */
require_once "login.php";
require_once "connect.php";
require_once "Vak.php";
require_once "Cijfer.php";

$cijfers = Cijfer::getAllCijfers();

function toonCijfers(array $cijfers, bool $show) {
    $kleur = 0; //kleur bijhouden van vakken kolom tabel

    foreach ($cijfers as $vakArray) {
        $vak = $vakArray["vak"];
        $cijfersArray = $vakArray["cijfers"];
        /* @var Vak $vak
         * @var Cijfer[] $cijfersArray
         */
        if ($vak !== NULL && $vak->toon === $show && $cijfersArray !== NULL) {
            /* Berekeningen voor berekenen gemmiddelde cijfers enz. */
            $kleur++;

            /* Door alle cijfers loopen */
            $aantalCijfers = sizeof($cijfersArray);
            $first = true;
            foreach ($cijfersArray as $cijfer) {
                ?>

                <tr>
                    <?php if ($first) { //eerste keer moet vak ook geprint worden
                        echo '<td style="background-color: #';
                        if ($kleur % 2) { //juiste achtergrondkleur selecteren
                            echo "fff";
                        } else {
                            echo "f1f1f1";
                        }
                        echo '; border-right: 1px solid #ddd; " rowspan="' . $aantalCijfers . '">'
                            . $vak->naam . '</td>';
                        $first = false;
                    }
                    ?>
                    <td style="padding-left: 16px;"><?php echo $cijfer->naam; ?></td>
                    <td><?php if ($cijfer->datum != NULL) {
                            echo $cijfer->datum->format("Y-m-d");
                        } ?></td>
                    <td><?php if ($cijfer->weging != NULL) {
                            echo $cijfer->weging . "%";
                        } ?></td>
                    <td><?php if ($cijfer->cijfer != NULL) {
                            echo $cijfer->cijfer;
                        } ?></td>
                </tr>

                <?php
            }
        }
    }
}

?>

<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title><?php echo $title; ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css" />
    <style>
        html {
            overflow-x: auto;
        }
    </style>
</head>

<body>
<div style="min-width: 1200px;" class="w3-container">
    <h2>Cijfers</h2>

    <table class="w3-table-all w3-hoverable">
        <thead>
        <tr class="w3-light-grey">
            <th>Vak</th>
            <th style="padding-left: 16px;">Titel</th>
            <th>Datum</th>
            <th>Weging</th>
            <th>Cijfer</th>
        </tr>
        </thead>

        <?php
        /* Alle huidige cijfers tonen */
        if ($cijfers !== NULL) {
            toonCijfers($cijfers, true);
        }
        ?>

    </table>

    <h2>Vakken</h2>

    <table class="w3-table-all w3-hoverable">
        <thead>
        <tr class="w3-light-grey">
            <th>Vak</th>
            <th>Jaar</th>
            <th>Periode</th>
            <th>Gemiddelde cijfer</th>
            <th>(Voorlopig) eindcijfer</th>
            <th>Studiepunten</th>
            <th>Gehaald</th>
        </tr>
        </thead>

        <?php
        /* Vakken tonen */
        $studiepunten = 0;
        if ($cijfers !== NULL) {
            foreach ($cijfers as $vakArray) {
                $vak = $vakArray["vak"];
                $gemiddelde = $vakArray["gemiddelde"];
                $totaal = $vakArray["totaal"];
                if ($vak->gehaald) {
                    $studiepunten += $vak->studiepunten;
                }
                ?>
                <tr>
                    <td><?php echo $vak->naam; ?></td>
                    <td><?php echo $vak->jaar; ?></td>
                    <td><?php if ($vak->periode) {
                        echo $vak->periode;
                        } ?></td>
                    <td><?php if ($gemiddelde !== NULL) {
                            echo $gemiddelde;
                        } ?></td>
                    <td><?php
                        if ($vak->eindcijfer !== NULL) {
                        ?>
                        <abbr style="text-decoration: none;" title="definitief">
                            <?php
                            echo $vak->eindcijfer;
                            } elseif ($totaal !== NULL) {
                            ?>
                            <abbr style="text-decoration: none;" title="voorlopig">
                                <?php
                                echo $totaal;
                                }
                                ?></abbr></td>
                    <td><?php echo $vak->studiepunten; ?></td>
                    <td><?php echo $vak->gehaald ? "ja" : "nee"; ?></td>
                </tr>
                <?php
            }
        }

        if ($studiepunten >= 42) {
            $bsa = "ja";
        } else {
            $bsa = "nee";
        }
        ?>
    </table>

    <p><b>Totaal aantal studiepunten:</b> <?php echo $studiepunten; ?></p>
    <p><b>BSA gehaald:</b> <?php echo $bsa; ?></p>


    <h2>Oude cijfers</h2>

    <table class="w3-table-all w3-hoverable">
        <thead>
        <tr class="w3-light-grey">
            <th>Vak</th>
            <th style="padding-left: 16px;">Titel</th>
            <th>Datum</th>
            <th>Weging</th>
            <th>Cijfer</th>
        </tr>
        </thead>
        <?php
        /* Alle oude cijfers tonen */
        if ($cijfers !== NULL) {
            toonCijfers($cijfers, false);
        }
        ?>
    </table>

</div>
<br>
<?php /*?>
    <!--
-----------DEBUG-------------
    <?php
        echo "\n";
        print_r($bsa);
        echo "\n";
        print_r($studiepunten);
        echo "\n";
        print_r($vakken);
        print_r($cijfers);
    ?>
    -->
    */ ?>

<footer>
    <div style="float: right">
        <a href="LICENSE" style="margin: 0 5px; color: #0645AD">Licence</a>
        <a href="https://github.com/TristanLaan/cijfersoverzicht" style="margin: 0 5px; color: #0645AD">Source</a>
        <p style="display: inline; margin: 0 5px;">&copy;Tristan Laan 2018-<?php echo $datum->format("Y"); ?></p>
    </div>
</footer>
</body>
</html>
