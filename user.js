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
let cached_cijfers = null;
let cijfers = null;
let first = true;

const cijfer_head = `<thead>
        <tr class="w3-light-grey">
            <th>Vak</th>
            <th style="padding-left: 16px;">Titel</th>
            <th>Datum</th>
            <th>Weging</th>
            <th>Cijfer</th>
        </tr>
        </thead>`;

const vak_head = `<thead>
        <tr class="w3-light-grey">
            <th>Vak</th>
            <th>Jaar</th>
            <th>Periode</th>
            <th>Gemiddelde cijfer</th>
            <th>(Voorlopig) eindcijfer</th>
            <th>Studiepunten</th>
            <th>Gehaald</th>
        </tr>
        </thead>`;

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

function get_cijfers(toon_cijfers) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = toon_cijfers;
    xhttp.open("POST", "get_cijfers.php", true);

    if (first) {
        xhttp.send();
        first = false;
    } else {
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send("md5=true");
    }
}

function toon_cijfers(table, nieuw) {
    let table_inhoud = cijfer_head;
    let kleur = 0;

    if (cijfers.object !== null) {
        for (let vak_array of cijfers.object) {
            let vak = vak_array.vak;
            let cijfers_array = vak_array.cijfers;

            if (vak !== null && vak.toon === nieuw && cijfers_array !== null) {
                kleur++;
                let aantal_cijfers = cijfers_array.length;
                let first = true;

                for (let cijfer of cijfers_array) {
                    table_inhoud += "<tr>";

                    if (first) {
                        if (kleur % 2 === 0) {
                            table_inhoud += `<td style="background-color: #f1f1f1; border-right: 1px solid #ddd;" rowspan="${aantal_cijfers}">`
                        } else {
                            table_inhoud += `<td style="background-color: #fff; border-right: 1px solid #ddd;" rowspan="${aantal_cijfers}">`
                        }
                        table_inhoud += `${vak.naam}</td>`;
                        first = false;
                    }

                    table_inhoud += `<td style="padding-left: 16px;">${cijfer.naam}</td>
                    <td>${(cijfer.datum !== null ? cijfer.datum : "")}</td>
                    <td>${(cijfer.weging !== null ? cijfer.weging + "%" : "")}</td>
                    <td>${(cijfer.cijfer !== null ? cijfer.cijfer : "")}</td>
                    </tr>`;
                }
            }
        }
    }

    table.innerHTML = table_inhoud;

}

function toon_huidige_cijfers() {
    const table = document.getElementById('huidige-cijfers');
    toon_cijfers(table, true);
}

function toon_oude_cijfers() {
    const table = document.getElementById('oude-cijfers');
    toon_cijfers(table, false);
}

function gemiddelde_cijfer() {
    if (cijfers.object === null) {
        return null;
    }

    let som = 0;
    let aantal = 0;

    for (let vak_array of cijfers.object) {
        if (vak_array.vak.eindcijfer !== null) {
            aantal++;
            som += vak_array.vak.eindcijfer;
        } else if (vak_array.totaal !== null) {
            aantal++;
            som += vak_array.totaal;
        }
    }

    if (aantal === 0) {
        return null;
    }

    gemiddelde = som/aantal;
    gemiddelde = +gemiddelde.toFixed(2);

    return gemiddelde;
}

function toon_vakken() {
    const table = document.getElementById('vakken');
    const studiepunten_vak = document.getElementById('studiepunten');
    const bsa_vak = document.getElementById('bsa');
    const gemiddelde_vak = document.getElementById('gemiddelde');
    let table_inhoud = vak_head;
    let studiepunten = 0;
    let gemiddelde = gemiddelde_cijfer();

    if (cijfers.object !== null) {
        for (let vak_array of cijfers.object) {
            let vak = vak_array.vak;
            let gemiddelde = vak_array.gemiddelde;
            let totaal = vak_array.totaal;

            if (vak.gehaald) {
                studiepunten += vak.studiepunten;
            }

            table_inhoud += `<tr>
                    <td>${vak.naam}</td>
                    <td>${vak.jaar}</td>
                    <td>${(vak.periode !== null ? vak.periode : "")}</td>
                    <td>${(gemiddelde !== null ? gemiddelde : "")}</td>
                    <td>${(vak.eindcijfer !== null ? `<abbr style="text-decoration: none;" title="definitief">
                        ${vak.eindcijfer}</abbr>` : (totaal !== null ? `<abbr style="text-decoration: none;" title="voorlopig">
                        ${totaal}</abbr>` : ""))}</td>
                    <td>${vak.studiepunten}</td>
                    <td>${(vak.gehaald ? "ja" : "nee")}</td>
                </tr>`
        }
    }

    if (studiepunten >= 42) {
        bsa_vak.innerHTML = "<b>BSA gehaald:</b> ja";
    } else {
        bsa_vak.innerHTML = "<b>BSA gehaald:</b> nee";
    }

    studiepunten_vak.innerHTML = `<b>Totaal aantal studiepunten:</b> ${studiepunten}`;
    gemiddelde_vak.innerHTML = `<b>Gemiddelde cijfer:</b> ${(gemiddelde !== null ? gemiddelde : "")}`;
    table.innerHTML = table_inhoud;
}

function check_update() {
    if (this.readyState === 4 && this.status === 200) {
        let currentdate = new Date();

        console.debug("Last Sync: " + currentdate.getDate() + "/"
            + (currentdate.getMonth() + 1) + "/"
            + currentdate.getFullYear() + " @ "
            + currentdate.getHours() + ":"
            + currentdate.getMinutes() + ":"
            + currentdate.getSeconds());
        oude_cijfers = cached_cijfers;
        cached_cijfers = this.responseText;

        if (oude_cijfers !== cached_cijfers) {
            const newxhttp = new XMLHttpRequest();
            newxhttp.onreadystatechange = update_cijfers_scherm;
            newxhttp.open("POST", "get_cijfers.php", true);
            newxhttp.send();
        }
    }
}

function update_cijfers_scherm() {
    if (this.readyState === 4 && this.status === 200) {
        cijfers = JSON.parse(this.responseText);
        console.debug("Nieuwe cijfers:\n" + dump(cijfers));

        if (cached_cijfers === null) {
            console.debug("eerste md5 = " + cijfers.md5);
            cached_cijfers = cijfers.md5;
        }

        toon_huidige_cijfers();
        toon_oude_cijfers();
        toon_vakken();
    }
}

function herlaad_cijfers() {
    get_cijfers(check_update);
}

get_cijfers(update_cijfers_scherm);
setInterval(herlaad_cijfers, 15000);