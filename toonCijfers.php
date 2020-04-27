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

require_once "Cijfer.php";
require_once "Vak.php";

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
                    <td><?php if ($cijfer->datum !== NULL) {
                            echo $cijfer->datum->format("Y-m-d");
                        } ?></td>
                    <td><?php if ($cijfer->weging !== NULL) {
                            echo $cijfer->weging . "%";
                        } ?></td>
                    <td><?php if ($cijfer->cijfer !== NULL) {
                            echo $cijfer->cijfer;
                        } ?></td>
                </tr>

                <?php
            }
        }
    }
}
