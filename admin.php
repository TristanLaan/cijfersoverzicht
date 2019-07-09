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
require_once "Cijfer.php";
require_once "Vak.php";
$datum = new DateTime();
/* @var Vak[] $vakken */
$vakken = vak::getAllVakken();
?>
<html lang="nl">
<?php htmlcopyright(); ?>
<head>
    <title>Bewerk cijfers</title>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <script src="admin.js"></script>
    <style>
        @media (min-width: 601px) {
            .third-left, .third-mid {
                padding-right: 16px
            }

            .third-right, .third-mid {
                padding-left: 16px
            }
        }

        .upload-button {
            width: 140px;
            float: left;
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
    </style>

    <script>
        const cijferUploaded = `Cijfer geupload!`;
        const vakUploaded = `Vak geupload!`;
    </script>

    <script>
        function toonFout(foutmelding) {
            return `<div class="w3-panel w3-red w3-display-container">
                    <span onclick="this.parentElement.style.display='none'"
                    class="w3-button w3-large w3-display-topright">&times;</span>
                    <h3>Fout!</h3>
                    <p>${foutmelding}</p>
                </div>`
        }
    </script>

    <script>
        function toonUploadCijferVak(vak, getal) {
            vak.innerHTML = `<div class="w3-container w3-teal">
            <h3>Cijfer ${getal + 1}</h3>
        </div>
        <form onsubmit="uploadCijferVak(${getal})" action="javascript:void(0)" class="w3-container w3-card-4">
            <div class="errorvak"></div>
            <h4 style="margin-bottom: 0">Verplicht</h4>
            <p>
                <label class="w3-text-grey">Titel</label>
                <input name="titel" class="w3-input w3-border" type="text" placeholder="eindtentamen" required>
            </p>
            <p>
                <label class="w3-text-grey">Vak</label>
                <select name="vakid" class="w3-select" name="vak" required>
                    <option value="" disabled selected>Kies je vak</option>
                    <?php
                if ($vakken !== NULL) {
                    foreach ($vakken as $vak) {
                        echo "<option value=\"$vak->vaknummer\">$vak->naam</option>\n";
                    }
                }
                ?>
                </select>
            </p>
            <h4 style="margin-bottom: 0">Optioneel</h4>
            <div class="w3-row">
                <div class="w3-third third-left">
                    <p>
                        <label class="w3-text-grey">Weging (in %)</label>
                        <input name="weging" class="w3-input w3-border" type="number" min="0" step="0.01" placeholder="42.0">
                    </p>
                </div>

                <div class="w3-third third-mid">
                    <p>
                        <label class="w3-text-grey">Datum</label>
                        <input name="datum" class="w3-input w3-border" type="date">
                    </p>
                </div>

                <div class="w3-third third-right">
                    <p>
                        <label class="w3-text-grey">Cijfer</label>
                        <input name="cijfer" class="w3-input w3-border" type="number" min="0" step="0.01" placeholder="6.66">
                    </p>
                </div>
            </div>
            <p><input type="submit" class="w3-btn w3-padding w3-teal" style="width:120px" value="Upload &nbsp; ❯"></p>
        </form>`;
        }
    </script>

    <script>
        function toonUploadVakVak(vak, getal) {
            vak.innerHTML = `<div class="w3-container w3-teal">
                    <h3>Vak ${getal + 1}</h3>
                </div>
                <form onsubmit="uploadVakVak(${getal})" action="javascript:void(0)" class="w3-container w3-card-4">
                    <div class="errorvak"></div>
                    <h4 style="margin-bottom: 0">Verplicht</h4>
                    <p>
                        <label class="w3-text-grey">Titel</label>
                        <input name="titel" class="w3-input w3-border" type="text" placeholder="Inleiding Studie" required>
                    </p>
                    <div class="w3-row">
                        <div class="w3-half third-left">
                            <p>
                                <label class="w3-text-grey">Jaar</label>
                                <input name="jaar" class="w3-input w3-border" type="number" min="1" step="1" placeholder="1">
                            </p>
                        </div>

                        <div class="w3-half third-right">
                            <p>
                                <label class="w3-text-grey">Studiepunten</label>
                                <input name="studiepunten" class="w3-input w3-border" type="number" min="0" step="1" placeholder="6">
                            </p>
                        </div>
                    </div>

                    <div class="w3-row">
                        <div class="w3-half third-left">
                            <p style="margin: 0">
                                <label class="w3-text-grey">Gehaald: </label>
                                <input name="gehaald" class="w3-check" type="checkbox">
                            </p>
                        </div>

                        <div class="w3-half third-right">
                            <p style="margin: 0">
                                <label class="w3-text-grey">Toon: </label>
                                <input name="toon" class="w3-check" type="checkbox" checked>
                            </p>
                        </div>
                    </div>

                    <h4 style="margin-bottom: 0">Optioneel</h4>
                    <div class="w3-row">
                        <div class="w3-half third-left">
                            <p>
                                <label class="w3-text-grey">Periode</label>
                                <input name="periode" class="w3-input w3-border" type="number" min="0" step="1" placeholder="1">
                            </p>
                        </div>

                        <div class="w3-half third-right">
                            <p>
                                <label class="w3-text-grey">Eindcijfer</label>
                                <input name="eindcijfer" class="w3-input w3-border" type="number" min="0" step="0.01" placeholder="6.66">
                            </p>
                        </div>
                    </div>
                    <p><input type="submit" class="w3-btn w3-padding w3-teal" style="width:120px" value="Upload &nbsp; ❯"></p>
                </form>`;
        }
    </script>

    <script>
        function uploadCijferVak(getal) {
            const div = document.getElementById('cijfervak' + getal);
            const inputs = div.children[1].elements;
            let titel = inputs["titel"].value;
            let vakid = inputs["vakid"].value;
            let weging = inputs["weging"].value === "" ? null : inputs["weging"].value;
            let datum = inputs["datum"].value === "" ? null : inputs["datum"].value;
            let cijfergetal = inputs["cijfer"].value === "" ? null : inputs["cijfer"].value;

            console.debug(`titel: ${titel}, vakid: ${vakid}, weging: ${weging}, datum: ${datum}, cijfer: ${cijfergetal}`);

            let errorfun = function () {
                let returnwaarde = parseCijferUpload(this.responseText);
                switch (returnwaarde.returncode) {
                    case 0:
                        div.children[1].innerHTML = cijferUploaded;
                        break;
                    case -1:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout(`Je bent niet meer ingelogd, open <a target="_blank" href="admin.php">deze pagina</a>, log opnieuw in en probeer het opnieuw.`);
                        break;
                    case -2:
                    case -5:
                    case 2:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Vak niet opgegeven/niet gevonden.");
                        break;
                    case -3:
                    case 3:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Titel niet opgegeven/incorrect");
                        break;
                    case -4:
                    case 5:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Datum is niet in correct formaat opgegeven (YYYY-mm-dd of ingebouwde date picker).");
                        break;
                    case -6:
                    case 6:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Cijfer moet een getal zijn");
                        break;
                    case -7:
                    case 4:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Weging moet een getal zijn");
                        break;
                    case 1:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Geen verbinding met database, probeer later opnieuw");
                        break;
                    default:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Er is een onbekende fout opgetreden, probeer het later opnieuw.");
                        break;
                }
            };

            uploadCijfer(vakid, titel, weging, datum, cijfergetal, errorfun);
        }
    </script>

    <script>
        function uploadVakVak(getal) {
            console.debug(getal);
            const div = document.getElementById('vak' + getal);
            console.debug(div);
            const inputs = div.children[1].elements;
            console.debug(inputs);
            let titel = inputs["titel"].value;
            let jaar = inputs["jaar"].value;
            let studiepunten = inputs["studiepunten"].value;
            let gehaald = inputs["gehaald"].checked;
            let toon = inputs["toon"].checked;
            let periode = inputs["periode"].value === "" ? null : inputs["periode"].value;
            let eindcijfer = inputs["eindcijfer"].value === "" ? null : inputs["eindcijfer"].value;

            console.debug(`titel: ${titel}, jaar: ${jaar}, studiepunten: ${studiepunten}, gehaald: ${gehaald}, toon: ${toon}, periode: ${periode}, eindcijfer: ${eindcijfer}`);

            let errorfun = function () {
                let returnwaarde = parseVakUpload(this.responseText);
                switch (returnwaarde.returncode) {
                    case 0:
                        div.children[1].innerHTML = vakUploaded;
                        break;
                    case -1:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout(`Je bent niet meer ingelogd, open <a target="_blank" href="admin.php">deze pagina</a>, log opnieuw in en probeer het opnieuw.`);
                        break;
                    case -2:
                    case 2:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Vaktitel niet opgegeven/incorrect");
                        break;
                    case -3:
                    case 3:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Jaar niet opgegeven/incorrect");
                        break;
                    case -4:
                    case 5:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Studiepunten niet opgegeven/incorrect");
                        break;
                    case -5:
                    case 4:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Periode niet opgegeven/incorrect");
                        break;
                    case -6:
                    case 7:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Eindcijfer moet een cijfer zijn");
                        break;
                    case 1:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Geen verbinding met database, probeer later opnieuw");
                        break;
                    default:
                        div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Er is een onbekende fout opgetreden, probeer het later opnieuw");
                        break;
                }
            };

            uploadVak(titel, jaar, studiepunten, gehaald, toon, periode, eindcijfer, errorfun);
        }
    </script>

    <script>
        function resetCijferUpload() {
            const resetForm = document.getElementById("resetCijfer");
            const aantal = resetForm.elements["aantal"];
            const cijferVak = document.getElementById("cijfervakken");
            cijferVak.innerHTML = "";

            for (let i = 0; i < aantal.value; i++) {
                cijferVak.innerHTML += `<div id="cijfervak${i}"></div>`;
                toonUploadCijferVak(document.getElementById("cijfervak" + i), i);
            }

            aantal.value = 1;
        }
    </script>

    <script>
        function resetVakUpload() {
            const resetForm = document.getElementById("resetVak");
            const aantal = resetForm.elements["aantal"];
            const cijferVak = document.getElementById("vakvakken");
            cijferVak.innerHTML = "";

            for (let i = 0; i < aantal.value; i++) {
                cijferVak.innerHTML += `<div id="vak${i}"></div>`;
                toonUploadVakVak(document.getElementById("vak" + i), i);
            }

            aantal.value = 1;
        }
    </script>

    <script>
        function uploadAlleCijfers() {
            const cijferDiv = document.getElementById('cijfervakken');
            const cijferVakken = cijferDiv.children;
            for (let i = 0; i < cijferVakken.length; i++) {
                if (cijferVakken[i].children[1].innerHTML !== cijferUploaded) {
                    uploadCijferVak(i);
                }
            }
        }
    </script>

    <script>
        function uploadAlleVakken() {
            const vakDiv = document.getElementById('vakvakken');
            const vakVakken = vakDiv.children;
            for (let i = 0; i < vakVakken.length; i++) {
                if (vakVakken[i].children[1].innerHTML !== vakUploaded) {
                    uploadVakVak(i);
                }
            }
        }
    </script>
</head>
<body>

<div class="w3-container">
    <div class="w3-row-padding">
        <div class="w3-half">
            <h2>Nieuwe cijfers</h2>
            <div id="cijfervakken">
                <div id="cijfervak0">
                    <script>
                        toonUploadCijferVak(document.getElementById('cijfervak0'), 0);
                    </script>
                </div>
            </div>
            <button type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="uploadAlleCijfers()">Upload
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
                    <script>
                        toonUploadVakVak(document.getElementById('vak0'), 0);
                    </script>
                </div>
            </div>
            <button type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="uploadAlleVakken()">Upload
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
<?php footer(); ?>
</body>
</html>
