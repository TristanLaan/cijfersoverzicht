/*
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

function parseCijferUpload(ajax) {
    console.debug("ajax response: " + ajax);
    const errorcode = parseInt(ajax.split('\n')[0]);
    let item = null;
    switch (errorcode) {
        case 0:
            console.debug("upload geslaagd");
            item = JSON.parse(ajax.substring(2));
            item.vak = JSON.parse(item.vak);
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
            console.debug("Onbekende fout: " + errorcode);
            break;
    }

    return {returncode: errorcode, item: item};
}

function logUploadCijfer() {
    console.debug("Return:\n\n" + dump(parseCijferUpload(this.responseText)));
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

function parseVakUpload(ajax) {
    console.debug("ajax response: " + ajax);
    const errorcode = parseInt(ajax.split('\n')[0]);
    let item = null;
    switch (errorcode) {
        case 0:
            console.debug("upload geslaagd");
            item = JSON.parse(ajax.substring(2));
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
            console.debug("Onbekende fout: " + errorcode);
            break;
    }

    return {returncode: errorcode, item: item};
}

function logUploadVak() {
    console.debug("Return:\n\n" + dump(parseVakUpload(this.responseText)));
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

function parseCijferWijzig(ajax) {
    console.debug("ajax response: " + ajax);
    const errorcode = parseInt(ajax.split('\n')[0]);
    let item = null;
    switch (errorcode) {
        case 0:
            console.debug("upload geslaagd");
            item = JSON.parse(ajax.substring(2));
            item.vak = JSON.parse(item.vak);
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
            console.debug("Onbekende fout: " + errorcode);
            break;
    }

    return {returncode: errorcode, item: item};
}

function logWijzigCijfer() {
    console.debug("Return:\n\n" + dump(parseCijferWijzig(this.responseText)));
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
