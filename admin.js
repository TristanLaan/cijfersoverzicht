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

const cijfer_head = `<thead>
        <tr class="w3-light-grey table-head">
            <th></th>
            <th>No.</th>
            <th>Titel</th>
            <th>Vak</th>
            <th>Datum</th>
            <th>Weging</th>
            <th>Cijfer</th>
        </tr>
        </thead>`;

const vak_head = `<thead>
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
            </thead>`;

let cijfers = null;
let klaar_voor_vak = false;
let vakken = null;
let sorted_vakken = null;

const cijferUploaded = "<p>Cijfer geüpload!</p>";
const cijferGewijzigd = "<p>Cijfer gewijzigd!</p>";
const vakUploaded = "<p>Vak geüpload!</p>";
const vakGewijzigd = "<p>Vak gewijzigd!</p>";

function dump(obj, indent = 0) {
    let out = '';
    for (let i in obj) {
        for (let j = 0; j < Math.min(indent, 16); j++) {
            out += " ";
        }

        out += i + ": " + (typeof obj[i] === 'object' && obj[i] !== null ? "\n" +
            dump(obj[i], indent + 2) : obj[i] + "\n");
    }

    return out;
}

function parseCijferUpload(response) {
    console.debug(response);
    let item = response.object;

    switch (response.returnwaarde) {
        case 0:
            console.debug("upload geslaagd");
            console.debug(item);
            break;
        case -1:
            console.debug("Niet ingelogd");
            break;
        case -2:
            console.debug("Vak niet opgegeven");
            break;
        case -3:
            console.debug("Cijfertitel niet opgegeven");
            break;
        case -4:
            console.debug("Datum niet opgegeven");
            break;
        case -5:
            console.debug("Vak niet gevonden");
            break;
        case -6:
            console.debug("Cijfer is incorrect");
            break;
        case -7:
            console.debug("Weging is incorrect");
            break;
        case 1:
            console.debug("Geen verbinding met database");
            break;
        case 3:
            console.debug("Incorrecte cijfertitel");
            break;
        case 4:
            console.debug("Incorrecte weging");
            break;
        case 5:
            console.debug("Incorrecte datum");
            break;
        case 6:
            console.debug("Incorrecte cijfer");
            break;
        default:
            console.debug("Onbekende fout: " + response.returnwaarde);
            break;
    }

    return {returncode: response.returnwaarde, item: item};
}

function logUploadCijfer() {
    console.debug("ajax response: " + this.responseText);
    console.debug(parseCijferUpload(JSON.parse(this.responseText)));
}

function uploadCijfer(vakid, naam, weging, datum, cijfer,
                      callback = logUploadCijfer) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback.apply(xhttp);
        }
    };
    xhttp.open("POST", "upload_cijfer.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let input = "vakid=" + vakid + "&naam=" + naam;

    if (weging !== null) {
        input += "&weging=" + weging;
    }

    if (datum !== null) {
        input += "&datum=" + datum;
    }

    if (cijfer !== null) {
        input += "&cijfer=" + cijfer;
    }

    xhttp.send(input);
}

function parseVakUpload(response) {
    console.debug(response);
    let item = response.object;
    switch (response.returnwaarde) {
        case 0:
            console.debug("upload geslaagd");
            console.debug(item);
            break;
        case -1:
            console.debug("Niet ingelogd");
            break;
        case -2:
            console.debug("Vaktitel niet opgegeven");
            break;
        case -3:
            console.debug("Jaar niet opgegeven");
            break;
        case -4:
            console.debug("Studiepunten niet opgegeven");
            break;
        case -5:
            console.debug("Periode niet opgegeven");
            break;
        case -6:
            console.debug("Eindcijfer is incorrect");
            break;
        case 1:
            console.debug("Geen verbinding met database");
            break;
        case 2:
            console.debug("Incorrecte vaktitel");
            break;
        case 3:
            console.debug("Incorrect jaar");
            break;
        case 4:
            console.debug("Incorrecte periode");
            break;
        case 5:
            console.debug("Incorrect aantal studiepunten");
            break;
        case 6:
            console.debug("Gehaald is incorrect");
            break;
        case 7:
            console.debug("Incorrect eindcijfer");
            break;
        case 8:
            console.debug("Toon is incorrect");
            break;
        default:
            console.debug("Onbekende fout: " + response.returnwaarde);
            break;
    }

    return {returncode: response.returnwaarde, item: item};
}

function logUploadVak() {
    console.debug("ajax response: " + this.responseText);
    console.debug(parseVakUpload(JSON.parse(this.responseText)));
}

function uploadVak(naam, jaar, studiepunten, gehaald, toon, periode = null,
                   eindcijfer = null, callback = logUploadVak) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback.apply(xhttp);
        }
    };
    xhttp.open("POST", "upload_vak.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let input = "naam=" + naam + "&jaar=" + jaar + "&studiepunten=" +
        studiepunten + "&gehaald=" + gehaald + "&toon=" + toon;

    if (periode !== null) {
        input += "&periode=" + periode;
    }

    if (eindcijfer !== null) {
        input += "&eindcijfer=" + eindcijfer;
    }

    xhttp.send(input);
}

function parseVakWijzig(ajax) {
    console.debug("ajax response: " + ajax);
    const response = JSON.parse(ajax);
    console.debug(response);
    let item = response.object;
    switch (response.returnwaarde) {
        case 0:
            console.debug("upload geslaagd");
            console.debug(item);
            break;
        case -1:
            console.debug("Niet ingelogd");
            break;
        case -2:
            console.debug("Vak niet gevonden");
            break;
        case -3:
            console.debug("Vaktitel niet opgegeven");
            break;
        case -4:
            console.debug("Jaar niet opgegeven");
            break;
        case -5:
            console.debug("Studiepunten niet opgegeven");
            break;
        case -6:
            console.debug("Periode niet opgegeven");
            break;
        case -7:
            console.debug("Eindcijfer is incorrect");
            break;
        case 1:
            console.debug("Geen verbinding met database");
            break;
        case 2:
            console.debug("Incorrecte vaktitel");
            break;
        case 3:
            console.debug("Incorrect jaar");
            break;
        case 4:
            console.debug("Gehaald is incorrect");
            break;
        case 5:
            console.debug("Incorrect eindcijfer");
            break;
        case 6:
            console.debug("Toon is incorrect");
            break;
        case 7:
            console.debug("Incorrecte periode");
            break;
        case 8:
            console.debug("Incorrect aantal studiepunten");
            break;
        default:
            console.debug("Onbekende fout: " + response.returnwaarde);
            break;
    }

    return {returncode: response.returnwaarde, item: item};
}

function logWijzigVak() {
    console.debug(parseVakWijzig(this.responseText));
}

function wijzigVak(vakid, naam, jaar, studiepunten, gehaald, toon, periode = null,
                   eindcijfer = null, callback = logUploadVak) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback.apply(xhttp);
        }
    };
    xhttp.open("POST", "wijzig_vak.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let input = "vakid=" + vakid + "&naam=" + naam + "&jaar=" + jaar + "&studiepunten=" +
        studiepunten + "&gehaald=" + gehaald + "&toon=" + toon;

    if (periode !== null) {
        input += "&periode=" + periode;
    }

    if (eindcijfer !== null) {
        input += "&eindcijfer=" + eindcijfer;
    }

    xhttp.send(input);
}

function parseCijferWijzig(ajax) {
    console.debug("ajax response: " + ajax);
    const response = JSON.parse(ajax);
    console.debug(response);
    let item = response.object;

    switch (response.returnwaarde) {
        case 0:
            console.debug("upload geslaagd");
            console.debug(item);
            break;
        case -1:
            console.debug("Niet ingelogd");
            break;
        case -2:
            console.debug("Cijfer niet gevonden");
            break;
        case -3:
            console.debug("Vak niet opgegeven");
            break;
        case -4:
            console.debug("Cijfertitel niet opgegeven");
            break;
        case -5:
            console.debug("Datum niet opgegeven");
            break;
        case -6:
            console.debug("Cijfer is incorrect");
            break;
        case -7:
            console.debug("Vak niet gevonden");
            break;
        case -8:
            console.debug("Weging is incorrect");
            break;
        case 1:
            console.debug("Geen verbinding met database");
            break;
        case 3:
            console.debug("Incorrecte cijfertitel");
            break;
        case 4:
            console.debug("Incorrecte weging");
            break;
        case 5:
            console.debug("Incorrecte datum");
            break;
        case 6:
            console.debug("Incorrecte cijfer");
            break;
        default:
            console.debug("Onbekende fout: " + response.returnwaarde);
            break;
    }

    return {returncode: response.returnwaarde, item: item};
}

function logWijzigCijfer() {
    console.debug(parseCijferWijzig(this.responseText));
}

function wijzigCijfer(cijferid, vakid, naam, weging, datum, cijfer,
                      callback = logWijzigCijfer) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback.apply(xhttp);
        }
    };
    xhttp.open("POST", "wijzig_cijfer.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let input = "cijferid=" + cijferid + "&vakid=" + vakid + "&naam=" + naam;

    if (weging !== null) {
        input += "&weging=" + weging;
    }

    if (datum !== null) {
        input += "&datum=" + datum;
    }

    if (cijfer !== null) {
        input += "&cijfer=" + cijfer;
    }

    xhttp.send(input);
}

function parseCijferVerwijder(ajax) {
    console.debug("ajax response: " + ajax);
    const response = parseInt(ajax);
    console.debug(response);

    switch (response) {
        case 0:
            console.debug("Verwijderen geslaagd");
            break;
        case -1:
            console.debug("Niet ingelogd");
            break;
        case -2:
            console.debug("Cijfer incorrect");
            break;
        case -3:
            console.debug("Cijfer niet gevonden");
            break;
        default:
            console.debug("Onbekende fout: " + response);
            break;
    }

    return response;
}

function logVerwijderCijfer() {
    console.debug(parseCijferVerwijder(this.responseText));
}

function verwijderCijfer(cijferid, callback = logVerwijderCijfer) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback.apply(xhttp);
        }
    };
    xhttp.open("POST", "verwijder_cijfer.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let input = "cijferid=" + cijferid;
    xhttp.send(input);
}


function verwijderCijfers(cijfers) {
    for (let cijfer of cijfers) {
        let errfun = function () {
            let tablerow = document.getElementById("tr-cijfer-" + cijfer.cijfernummer);
            let string = "<td colspan=\"7\"><i>";
            let response = parseCijferVerwijder(this.responseText);

            switch (response) {
                case 0:
                    string += "Verwijderen geslaagd";
                    break;
                case -1:
                    string += "Je bent niet meer ingelogd, open <a href=\"admin.php\">deze pagina</a>, log opnieuw in en probeer het opnieuw.";
                    break;
                case -2:
                case -3:
                    string += "Cijfer is niet gevonden";
                    break;
                default:
                    string += "Onbekende fout: " + response;
                    break;
            }
            string += "</i></td>";
            tablerow.innerHTML = string;
        };

        verwijderCijfer(cijfer.cijfernummer, errfun);
    }
}

function parseVakVerwijder(ajax) {
    console.debug("ajax response: " + ajax);
    const response = parseInt(ajax);
    console.debug(response);

    switch (response) {
        case 0:
            console.debug("Verwijderen geslaagd");
            break;
        case -1:
            console.debug("Niet ingelogd");
            break;
        case -2:
            console.debug("Vak incorrect");
            break;
        case -3:
            console.debug("Vak niet gevonden");
            break;
        default:
            console.debug("Onbekende fout: " + response);
            break;
    }

    return response;
}

function logVerwijderVak() {
    console.debug(parseVakVerwijder(this.responseText));
}

function verwijderVak(vakid, callback = logVerwijderVak) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback.apply(xhttp);
        }
    };
    xhttp.open("POST", "verwijder_vak.php", true);
    xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    let input = "vakid=" + vakid;
    xhttp.send(input);
}

function verwijderVakken(vakken) {
    for (let vak of vakken) {
        let errfun = function () {
            let tablerow = document.getElementById("tr-vak-" + vak.vaknummer);
            let string = "<td colspan=\"9\"><i>";
            let response = parseVakVerwijder(this.responseText);

            switch (response) {
                case 0:
                    string += "Verwijderen geslaagd";
                    break;
                case -1:
                    string += "Je bent niet meer ingelogd, open <a href=\"admin.php\">deze pagina</a>, log opnieuw in en probeer het opnieuw.";
                    break;
                case -2:
                case -3:
                    string += "Vak is niet gevonden";
                    break;
                default:
                    string += "Onbekende fout: " + response;
                    break;
            }
            string += "</i></td>";
            tablerow.innerHTML = string;
        };

        verwijderVak(vak.vaknummer, errfun);
    }
}

function toonFout(foutmelding) {
    return `<div class="w3-panel w3-red w3-display-container">
                    <span onclick="this.parentElement.style.display='none'"
                    class="w3-button w3-large w3-display-topright">&times;</span>
                    <h3>Fout!</h3>
                    <p>${foutmelding}</p>
                </div>`
}

function toonSelectieVakken(value = null) {
    if (vakken.object === null) {
        return "";
    }

    let string = "";

    for (let vak of vakken.object) {
        string += `<option value=\"${vak.vaknummer}\" ${(value === vak.vaknummer ? "selected" : "")}>${vak.naam}</option>`;
    }

    return string;
}

function toonUploadCijferVak(vak, getal, bewerk = false, cijfer = null) {
    let selectieVakken = toonSelectieVakken(cijfer === null ? null : cijfer.vak.vaknummer);
    vak.innerHTML = `<div class="w3-container w3-teal">
            <h3>${(cijfer === null ? `Cijfer ${getal + 1}` : `${cijfer.cijfernummer}. ${cijfer.naam} - ${cijfer.vak.naam}`)}</h3>
        </div>
        <form onsubmit="${(bewerk ? "wijzig" : "upload")}CijferVak(${getal})" action="javascript:void(0)" class="w3-white w3-container w3-card-4" style="margin-bottom: 15px;">
            <div class="errorvak"></div>
            <h4 style="margin-bottom: 0">Verplicht</h4>
            <p>
                <label class="w3-text-grey">Titel</label>
                <input name="titel" class="w3-input w3-border" type="text" placeholder="eindtentamen" ${(cijfer === null ? "" : `value="${cijfer.naam}"`)} required>
                ${(cijfer === null ? "" : `<input name="cijfernummer" style="display: none" value="${cijfer.cijfernummer}" required readonly>`)}
            </p>
            <p>
                <label class="w3-text-grey">Vak</label>
                <select name="vakid" class="w3-select" name="vak" required>
                    <option value="" disabled ${(cijfer === null ? "selected" : "")}>Kies je vak</option>
                    ${selectieVakken}
                </select>
            </p>
            <h4 style="margin-bottom: 0">Optioneel</h4>
            <div class="w3-row">
                <div class="w3-third third-left">
                    <p>
                        <label class="w3-text-grey">Weging (in %)</label>
                        <input name="weging" class="w3-input w3-border" type="number" min="0" step="0.01" placeholder="42.0" ${(cijfer === null || cijfer.weging === null ? "" : `value="${cijfer.weging}"`)}>
                    </p>
                </div>

                <div class="w3-third third-mid">
                    <p>
                        <label class="w3-text-grey">Datum</label>
                        <input name="datum" class="w3-input w3-border" type="date" placeholder="yyyy-mm-dd" ${(cijfer === null || cijfer.datum === null ? "" : `value="${cijfer.datum}"`)}>
                    </p>
                </div>

                <div class="w3-third third-right">
                    <p>
                        <label class="w3-text-grey">Cijfer</label>
                        <input name="cijfer" class="w3-input w3-border" type="number" min="0" step="0.01" placeholder="6.66" ${(cijfer === null || cijfer.cijfer === null ? "" : `value="${cijfer.cijfer}"`)}>
                    </p>
                </div>
            </div>
            <p><input type="submit" class="w3-btn w3-padding w3-teal" style="width:120px" value="${(bewerk ? "Wijzig" : "Upload")} &nbsp; ❯"></p>
        </form>`;
}

function toonUploadVakVak(div, getal, bewerk = false, vak = null) {
    div.innerHTML = `<div class="w3-container w3-teal">
                    <h3>${(vak === null ? `Vak ${getal + 1}` : `${vak.vaknummer}. ${vak.naam}`)}</h3>
                </div>
                <form onsubmit="${(bewerk ? "wijzig" : "upload")}VakVak(${getal})" action="javascript:void(0)" class="w3-white w3-container w3-card-4" style="margin-bottom: 15px;">
                    <div class="errorvak"></div>
                    <h4 style="margin-bottom: 0">Verplicht</h4>
                    <p>
                        <label class="w3-text-grey">Titel</label>
                        <input name="titel" class="w3-input w3-border" type="text" placeholder="Inleiding Studie" ${(vak === null ? "" : `value="${vak.naam}"`)} required>
                        ${(vak === null ? "" : `<input name="vaknummer" style="display: none" value="${vak.vaknummer}" required readonly>`)}

                    </p>
                    <div class="w3-row">
                        <div class="w3-half third-left">
                            <p>
                                <label class="w3-text-grey">Jaar</label>
                                <input name="jaar" class="w3-input w3-border" type="number" min="1" step="1" placeholder="1" ${(vak === null ? "" : `value="${vak.jaar}"`)} required>
                            </p>
                        </div>

                        <div class="w3-half third-right">
                            <p>
                                <label class="w3-text-grey">Studiepunten</label>
                                <input name="studiepunten" class="w3-input w3-border" type="number" min="0" step="1" placeholder="6" ${(vak === null ? "" : `value="${vak.studiepunten}"`)} required>
                            </p>
                        </div>
                    </div>

                    <div class="w3-row">
                        <div class="w3-half third-left">
                            <p style="margin: 0">
                                <label class="w3-text-grey">Gehaald: </label>
                                <input name="gehaald" class="w3-check" type="checkbox" ${(vak === null || vak.gehaald === false ? "" : "checked")}>
                            </p>
                        </div>

                        <div class="w3-half third-right">
                            <p style="margin: 0">
                                <label class="w3-text-grey">Toon: </label>
                                <input name="toon" class="w3-check" type="checkbox" ${(vak === null || vak.toon === true ? "checked" : "")}>
                            </p>
                        </div>
                    </div>

                    <h4 style="margin-bottom: 0">Optioneel</h4>
                    <div class="w3-row">
                        <div class="w3-half third-left">
                            <p>
                                <label class="w3-text-grey">Periode</label>
                                <input name="periode" class="w3-input w3-border" type="number" min="0" step="1" placeholder="1" ${(vak === null || vak.periode === null ? "" : `value="${vak.periode}"`)}>
                            </p>
                        </div>

                        <div class="w3-half third-right">
                            <p>
                                <label class="w3-text-grey">Eindcijfer</label>
                                <input name="eindcijfer" class="w3-input w3-border" type="number" min="0" step="0.01" placeholder="6.66" ${(vak === null || vak.eindcijfer === null ? "" : `value="${vak.eindcijfer}"`)}>
                            </p>
                        </div>
                    </div>
                    <p><input type="submit" class="w3-btn w3-padding w3-teal" style="width:120px" value="${(bewerk ? "Wijzig" : "Upload")} &nbsp; ❯"></p>
                </form>`;
}

function getCijferInput(getal) {
    const div = document.getElementById('cijfervak' + getal);
    const inputs = div.children[1].elements;
    let titel = inputs["titel"].value;
    let vakid = inputs["vakid"].value;
    let weging = inputs["weging"].value === "" ? null : inputs["weging"].value;
    let datum = inputs["datum"].value === "" ? null : inputs["datum"].value;
    let cijfergetal = inputs["cijfer"].value === "" ? null : inputs["cijfer"].value;
    return {naam: titel, vakid: vakid, weging: weging, datum: datum, cijfer: cijfergetal}
}

function cijferError(div, returnwaarde) {
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
}

function uploadCijferVak(getal) {
    const div = document.getElementById('cijfervak' + getal);
    let input = getCijferInput(getal);

    console.debug(`titel: ${input.naam}, vakid: ${input.vakid}, weging: ${input.weging}, datum: ${input.datum}, cijfer: ${input.cijfer}`);

    let errorfun = function () {
        cijferError(div, parseCijferUpload(JSON.parse(this.responseText)));
    };

    uploadCijfer(input.vakid, input.naam, input.weging, input.datum, input.cijfer, errorfun);
}

function wijzigCijferVak(getal) {
    const div = document.getElementById('wijzigcijfervak' + getal);
    const inputs = div.children[1].elements;
    let cijfernummer = inputs["cijfernummer"].value;
    let titel = inputs["titel"].value;
    let vakid = inputs["vakid"].value;
    let weging = inputs["weging"].value === "" ? null : inputs["weging"].value;
    let datum = inputs["datum"].value === "" ? null : inputs["datum"].value;
    let cijfergetal = inputs["cijfer"].value === "" ? null : inputs["cijfer"].value;

    console.debug(`cijfernummer: ${cijfernummer}, titel: ${titel}, vakid: ${vakid}, weging: ${weging}, datum: ${datum}, cijfer: ${cijfergetal}`);

    let errorfun = function () {
        let returnwaarde = parseCijferWijzig(this.responseText);
        switch (returnwaarde.returncode) {
            case 0:
                div.children[1].innerHTML = cijferGewijzigd;
                break;
            case -1:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout(`Je bent niet meer ingelogd, open <a target="_blank" href="admin.php">deze pagina</a>, log opnieuw in en probeer het opnieuw.`);
                break;
            case -2:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Cijfer niet gevonden");
                break;
            case -3:
            case -7:
            case 2:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Vak niet opgegeven/niet gevonden.");
                break;
            case -4:
            case 3:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Titel niet opgegeven/incorrect");
                break;
            case -5:
            case 5:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Datum is niet in correct formaat opgegeven (YYYY-mm-dd of ingebouwde date picker).");
                break;
            case -6:
            case 6:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Cijfer moet een getal zijn");
                break;
            case -8:
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

    wijzigCijfer(cijfernummer, vakid, titel, weging, datum, cijfergetal, errorfun);
}

function wijzigVakVak(getal) {
    const div = document.getElementById('wijzigvakvak' + getal);
    const inputs = div.children[1].elements;
    let vaknummer = inputs["vaknummer"].value;
    let titel = inputs["titel"].value;
    let jaar = inputs["jaar"].value;
    let studiepunten = inputs["studiepunten"].value;
    let gehaald = inputs["gehaald"].checked;
    let toon = inputs["toon"].checked;
    let periode = inputs["periode"].value === "" ? null : inputs["periode"].value;
    let eindcijfer = inputs["eindcijfer"].value === "" ? null : inputs["eindcijfer"].value;

    console.debug(`titel: ${titel}, jaar: ${jaar}, studiepunten: ${studiepunten}, gehaald: ${gehaald}, toon: ${toon}, periode: ${periode}, eindcijfer: ${eindcijfer}`);
    let errorfun = function () {
        let returnwaarde = parseVakWijzig(this.responseText);
        switch (returnwaarde.returncode) {
            case 0:
                div.children[1].innerHTML = vakGewijzigd;
                break;
            case -1:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout(`Je bent niet meer ingelogd, open <a target="_blank" href="admin.php">deze pagina</a>, log opnieuw in en probeer het opnieuw.`);
                break;
            case -2:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Vak niet gevonden");
                break;
            case -3:
            case 2:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Titel niet opgegeven/incorrect.");
                break;
            case -4:
            case 3:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Jaar niet opgegeven/incorrect");
                break;
            case -5:
            case 8:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Studiepunten niet opgegeven/incorrect.");
                break;
            case -6:
            case 7:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Periode niet opgegeven/incorrect");
                break;
            case -7:
            case 5:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Eindcijfer niet opgegeven/incorrect");
                break;
            case 6:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Toon is incorrect");
                break;
            case 4:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Gehaald is incorrect");
                break;
            case 1:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Geen verbinding met database, probeer later opnieuw");
                break;
            default:
                div.children[1].getElementsByClassName('errorvak')[0].innerHTML = toonFout("Er is een onbekende fout opgetreden, probeer het later opnieuw.");
                break;
        }
    };

    wijzigVak(vaknummer, titel, jaar, studiepunten, gehaald, toon, periode, eindcijfer, errorfun);
}

function getVakInput(getal) {
    const div = document.getElementById('vak' + getal);
    const inputs = div.children[1].elements;
    let titel = inputs["titel"].value;
    let jaar = inputs["jaar"].value;
    let studiepunten = inputs["studiepunten"].value;
    let gehaald = inputs["gehaald"].checked;
    let toon = inputs["toon"].checked;
    let periode = inputs["periode"].value === "" ? null : inputs["periode"].value;
    let eindcijfer = inputs["eindcijfer"].value === "" ? null : inputs["eindcijfer"].value;
    return {naam: titel, jaar: jaar, studiepunten: studiepunten, gehaald: gehaald, toon: toon, periode: periode, eindcijfer: eindcijfer}
}

function vakError(div, returnwaarde) {
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
}

function uploadVakVak(getal) {
    const div = document.getElementById('vak' + getal);
    let input = getVakInput(getal);

    console.debug(`titel: ${input.naam}, jaar: ${input.jaar}, studiepunten: ${input.studiepunten}, gehaald: ${input.gehaald}, toon: ${input.toon}, periode: ${input.periode}, eindcijfer: ${input.eindcijfer}`);

    let errorfun = function () {
        let returnwaarde = parseVakUpload(JSON.parse(this.responseText));
        vakError(div, returnwaarde);
    };

    uploadVak(input.naam, input.jaar, input.studiepunten, input.gehaald, input.toon, input.periode, input.eindcijfer, errorfun);
}

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

function uploadAlleCijfers() {
    const cijferDiv = document.getElementById('cijfervakken');
    const cijferVakken = cijferDiv.children;
    let input = [];
    for (let i = 0; i < cijferVakken.length; i++) {
        if (cijferVakken[i].children[1].innerHTML !== cijferUploaded) {
            input.push(getCijferInput(i));
        }
    }
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let output = JSON.parse(this.responseText);
            if (output.returnwaarde !== 0) {
                let errorvak = document.getElementById('cijferuploaderror');
                errorvak.innerHTML = toonFout("Er is een onbekende fout opgetreden, probeer het later opnieuw");
            } else {
                for (let i = 0; i < cijferVakken.length; i++) {
                    let cijfervak = document.getElementById('cijfervak' + i);
                    let cijfer = output.object[i];
                    cijferError(cijfervak, parseCijferUpload(cijfer));
                }
            }
        }
    };
    xhttp.open("POST", "upload_cijfers.php", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(input));
}

function testCijfer(post_data) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            console.debug(JSON.parse(this.responseText));
        }
    };
    xhttp.open("POST", "upload_cijfers.php", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(post_data));
}

function uploadAlleVakken() {
    const vakDiv = document.getElementById('vakvakken');
    const vakVakken = vakDiv.children;
    let input = [];

    for (let i = 0; i < vakVakken.length; i++) {
        if (vakVakken[i].children[1].innerHTML !== cijferUploaded) {
            input.push(getVakInput(i));
        }
    }

    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let output = JSON.parse(this.responseText);
            if (output.returnwaarde !== 0) {
                let errorvak = document.getElementById('vakuploaderror');
                errorvak.innerHTML = toonFout("Er is een onbekende fout opgetreden, probeer het later opnieuw");
            } else {
                for (let i = 0; i < vakVakken.length; i++) {
                    let vakVak = document.getElementById('vak' + i);
                    let vak = output.object[i];
                    vakError(vakVak, parseVakUpload(vak));
                }
            }
        }
    };
    xhttp.open("POST", "upload_vakken.php", true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(input));
}

function wijzigAlleCijfers() {
    const cijferDiv = document.getElementById('wijzigcijfervakken');
    const cijferVakken = cijferDiv.children;
    for (let i = 0; i < cijferVakken.length; i++) {
        if (cijferVakken[i].children[1].innerHTML !== cijferGewijzigd) {
            wijzigCijferVak(i);
        }
    }
}

function wijzigAlleVakken() {
    const vakDiv = document.getElementById('wijzigvakvakken');
    const vakVakken = vakDiv.children;
    for (let i = 0; i < vakVakken.length; i++) {
        if (vakVakken[i].children[1].innerHTML !== vakGewijzigd) {
            wijzigVakVak(i);
        }
    }
}

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

function get_cijfers() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = update_cijfers_scherm;
    xhttp.open("GET", "get_cijfers.php?cijfers=true", true);
    xhttp.send();
}

function get_vakken() {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = update_vakken_scherm;
    xhttp.open("GET", "get_vakken.php", true);
    xhttp.send();
}

function update_vakken_scherm() {
    if (this.readyState === 4 && this.status === 200) {
        vakken = JSON.parse(this.responseText);
        if (vakken.object !== null) {
            let vakken_object = JSON.parse(this.responseText);
            sorted_vakken = vakken_object.object;
            sorted_vakken.sort(function (a, b) {
                return a.vaknummer - b.vaknummer;
            });
        }
        console.debug(vakken);

        if (!klaar_voor_vak) {
            let uploadCijferVak0 = document.getElementById('cijfervak0');
            if (uploadCijferVak0 === null) {
                uploadCijferVakKlaar = setInterval(probeerToonUploadCijferVak, 100);
            } else {
                toonUploadCijferVak(uploadCijferVak0, 0);
            }
            klaar_voor_vak = true;
        }

        toon_vakken();
    }
}

function update_cijfers_scherm() {
    if (this.readyState === 4 && this.status === 200) {
        cijfers = JSON.parse(this.responseText);
        console.debug(cijfers);

        toon_cijfers();
    }
}

let cijfers_getoont = null;

function probeer_toon_cijfers() {
    if (document.getElementById("cijfertabel") !== null) {
        clearInterval(cijfers_getoont);
        toon_cijfers();
    }
}

function toon_cijfers() {
    let table = document.getElementById("cijfertabel");

    if (table === null) {
        cijfers_getoont = setInterval(probeer_toon_cijfers, 100);
    }

    let table_inhoud = cijfer_head;

    if (cijfers.object !== null) {
        for (let cijfer of cijfers.object) {
            table_inhoud += `<tr id="tr-cijfer-${cijfer.cijfernummer}"><td><input id="select-${cijfer.cijfernummer}" name="${cijfer.cijfernummer}" class="w3-check" type="checkbox"></td>
            <td>${cijfer.cijfernummer}</td>
            <td>${cijfer.naam}</td>
            <td>${cijfer.vak.naam}</td>
            <td>${(cijfer.datum !== null ? cijfer.datum : "")}</td>
            <td>${(cijfer.weging !== null ? cijfer.weging + "%" : "")}</td>
            <td>${(cijfer.cijfer !== null ? cijfer.cijfer : "")}</td>
            </tr>`;
        }
    }

    table.innerHTML = table_inhoud;
}

let vakken_getoont = null;

function probeer_toon_vaken() {
    if (document.getElementById("vaktabel") !== null) {
        clearInterval(vakken_getoont);
        toon_vakken();
    }
}

function toon_vakken() {
    let table = document.getElementById("vaktabel");

    if (table === null) {
        vakken_getoont = setInterval(probeer_toon_vaken, 100);
    }

    let table_inhoud = vak_head;

    if (sorted_vakken !== null) {
        for (let vak of sorted_vakken) {
            table_inhoud += `<tr id="tr-vak-${vak.vaknummer}"><td><input id="select-${vak.vaknummer}" name="${vak.vaknummer}" class="w3-check" type="checkbox"></td>
            <td>${vak.vaknummer}</td>
            <td>${vak.naam}</td>
            <td>${vak.jaar !== null ? vak.jaar : ""}</td>
            <td>${(vak.periode !== null ? vak.periode : "")}</td>
            <td>${vak.studiepunten}</td>
            <td>${(vak.eindcijfer !== null ? vak.eindcijfer : "")}</td>
            <td>${(vak.gehaald === true ? "ja" : "nee")}</td>
            <td>${(vak.toon === true ? "ja" : "nee")}</td>
            </tr>`;
        }
    }

    table.innerHTML = table_inhoud;
}

function getCijferSelectie() {
    let results = [];
    let selectie = [];
    let table = document.getElementById("cijfertabel");
    let checkboxes = table.getElementsByTagName("input");

    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            results.push(parseInt(checkbox.name));
        }
    }

    if (results.length === 0) {
        return null;
    }


    for (let cijfer of cijfers.object) {
        if (results.includes(cijfer.cijfernummer)) {
            selectie.push(cijfer);
        }
    }

    resetCijferSelectie();

    return selectie;
}

function resetCijferSelectie() {
    let table = document.getElementById("cijfertabel");
    let checkboxes = table.getElementsByTagName("input");

    for (let checkbox of checkboxes) {
        checkbox.checked = false;
    }
}

function deelCijferSelectie() {
    let selectie = getCijferSelectie();

    if (selectie === null) {
        return;
    }

    let string = `Er ${(selectie.length === 1 ? "is een nieuw cijfer" : "zijn nieuwe cijfers")} geüpload:\n`;

    for (let i = 0; i < selectie.length; i++) {
        let cijfer = selectie[i];
        string += `Cijfer:\t\t\t${(cijfer.cijfer == null ? "Onbekend" : `${cijfer.cijfer}`)}\nVak:\t\t\t${cijfer.vak.naam}\nOmschrijving:\t${cijfer.naam}\nWeging:\t\t${(cijfer.weging == null ? "Onbekend" : `${cijfer.weging}%`)}\n\n`;
    }

    string += `Bekijk cijfers:${(serverinfo.intern ? `\nExtern:\t\t\t${serverinfo.domein}\nIntern:\t\t\t${serverinfo.interndomein}` : `\t${serverinfo.domein}`)}\nWachtwoord:\t${serverinfo.wachtwoord}`;

    kopieerString(string);
}

function wijzigCijferSelectie() {
    let selectie = getCijferSelectie();

    if (selectie === null) {
        return;
    }

    toonCijferPopup(selectie);
}

function verwijderCijferSelectie() {
    let selectie = getCijferSelectie();

    if (selectie === null) {
        return;
    }

    let string = `Weet je zeker dat je deze cijfers wilt verwijderen:\n`;

    for (let i = 0; i < selectie.length; i++) {
        let cijfer = selectie[i];
        string += `${cijfer.cijfernummer}. ${cijfer.naam}\n`;
    }

    if (window.confirm(string)) {
        verwijderCijfers(selectie);
    }
}

function getVakSelectie() {
    let results = [];
    let selectie = [];
    let table = document.getElementById("vaktabel");
    let checkboxes = table.getElementsByTagName("input");

    for (let checkbox of checkboxes) {
        if (checkbox.checked) {
            results.push(parseInt(checkbox.name));
        }
    }

    if (results.length === 0) {
        return null;
    }


    for (let vak of sorted_vakken) {
        if (results.includes(vak.vaknummer)) {
            selectie.push(vak);
        }
    }

    resetVakSelectie();

    return selectie;
}

function resetVakSelectie() {
    let table = document.getElementById("vaktabel");
    let checkboxes = table.getElementsByTagName("input");

    for (let checkbox of checkboxes) {
        checkbox.checked = false;
    }
}

function wijzigVakSelectie() {
    let selectie = getVakSelectie();

    if (selectie === null) {
        return;
    }

    toonVakPopup(selectie);
}

function verwijderVakSelectie() {
    let selectie = getVakSelectie();

    if (selectie === null) {
        return;
    }

    let string = `Weet je zeker dat je deze vakken wilt verwijderen:\n`;

    for (let i = 0; i < selectie.length; i++) {
        let vak = selectie[i];
        string += `${vak.vaknummer}. ${vak.naam}\n`;
    }

    if (window.confirm(string)) {
        verwijderVakken(selectie);
    }
}

function kopieerString(string) {
    let tekstVak = document.createElement('textarea');
    tekstVak.value = string;
    tekstVak.setAttribute('readonly', '');
    tekstVak.style = {position: 'absolute', left: '-9999px'};
    document.body.appendChild(tekstVak);
    tekstVak.select();
    document.execCommand('copy');
    document.body.removeChild(tekstVak);
}

document.onkeydown = function (evt) {
    evt = evt || window.event;
    var isEscape = false;
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    if (isEscape) {
        verbergPopups();
    }
};

window.onload = function () {
    let popups = document.getElementsByClassName('popup');
    /* Sluit popup als er naast geklikt wordt */
    document.onclick = function (e) {
        if (e.target.id === 'popup') {
            let i;
            for (i = 0; i < popups.length; i++) {
                popups[i].style.display = "none";
            }
        }
    };
};

function verbergPopups() {
    let popups;
    popups = document.getElementsByClassName('popup');

    let i;
    for (i = 0; i < popups.length; i++) {
        popups[i].style.display = "none";
    }

}

function toonCijferPopup(cijfers) {
    let popup = document.getElementById("wijzig-cijfer-popup");
    let background = document.getElementById("popup");
    verbergPopups();
    popup.innerHTML = "<div id=\"wijzigcijfervakken\" style=\"padding-top: 15px;\"></div>";
    popup.style.display = "block";
    popup = popup.children[0];
    background.style.display = "block";

    if (cijfers === null || cijfers.length === 0) {
        return;
    }

    for (let i = 0; i < cijfers.length; i++) {
        let cijfer = cijfers[i];
        popup.innerHTML += `<div id="wijzigcijfervak${i}"></div>`;
        toonUploadCijferVak(document.getElementById("wijzigcijfervak" + i), i, true, cijfer);
    }

    popup.innerHTML += `<button type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="wijzigAlleCijfers()">Wijzig
                alle &nbsp; ❯
            </button>`;
}

function toonVakPopup(vakken) {
    let popup = document.getElementById("wijzig-vak-popup");
    let background = document.getElementById("popup");
    verbergPopups();
    popup.innerHTML = "<div id=\"wijzigvakvakken\" style=\"padding-top: 15px;\"></div>";
    popup.style.display = "block";
    popup = popup.children[0];
    background.style.display = "block";

    if (vakken === null || vakken.length === 0) {
        return;
    }

    for (let i = 0; i < vakken.length; i++) {
        let vak = vakken[i];
        popup.innerHTML += `<div id="wijzigvakvak${i}"></div>`;
        toonUploadVakVak(document.getElementById("wijzigvakvak" + i), i, true, vak);
    }

    popup.innerHTML += `<button type="button" class="w3-btn w3-padding w3-teal upload-button" onclick="wijzigAlleVakken()">Wijzig
                alle &nbsp; ❯
            </button>`;
}

function probeerToonUploadVakVak() {
    let uploadVak0 = document.getElementById('vak0');

    if (uploadVak0 !== null) {
        clearInterval(uploadVakKlaar);
        toonUploadVakVak(uploadVak0, 0);
    }
}

function probeerToonUploadCijferVak() {
    let uploadCijferVak0 = document.getElementById('cijfervak0');

    if (uploadCijferVak0 !== null) {
        clearInterval(uploadCijferVakKlaar);
        toonUploadCijferVak(uploadCijferVak0, 0);
    }
}

get_cijfers();
get_vakken();

let uploadVak0 = document.getElementById('vak0');
let uploadVakKlaar = null;
let uploadCijferVakKlaar = null;

if (uploadVak0 === null) {
    uploadVakKlaar = setInterval(probeerToonUploadVakVak, 100);
} else {
    toonUploadVakVak(uploadVak0, 0);
}
