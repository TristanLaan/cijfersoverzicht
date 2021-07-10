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

const date_options = { year: 'numeric', month: 'short', day: 'numeric' };

function clear_element(element) {
    while(element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function verwijder_huidige_tbody(table) {
    let tbody = table.querySelector("tbody");
    if (tbody) {
        tbody.parentNode.removeChild(tbody);
    }
}

function maak_element(type, opties= {}) {
    let element = document.createElement(type);
    for (let [optie, value] of Object.entries(opties)) {
        if (optie === 'children') {
            for (let c of value) {
                element.appendChild(c);
            }
        } else if (optie === 'class') {
            for (let c of value) {
                element.classList.add(c);
            }
        } else if (optie === 'style') {
            for (let [soptie, svalue] of Object.entries(value)) {
                element.style[soptie] = svalue;
            }
        } else {
            element[optie] = value;
        }
    }

    return element;
}

function maak_tcell(row, text, styleclass=null) {
    let cell = row.insertCell();

    if (styleclass) {
        cell.classList.add(styleclass);
    }
    cell.appendChild(text);

    return cell;
}

function vul_cijfers_rij(rij, cijfer, admin) {
    if (admin) {
        maak_tcell(rij, document.createTextNode(cijfer.cijfernummer));
    }
    maak_tcell(rij, document.createTextNode(cijfer.naam), admin ? null : "table-cijfertitel");
    if (admin) {
        maak_tcell(rij, document.createTextNode(cijfer.vak.naam));
    }
    maak_tcell(rij, document.createTextNode(
        cijfer.datum !== null ? cijfer.datum.toLocaleDateString(undefined, date_options) : ""));
    maak_tcell(rij, document.createTextNode(cijfer.weging !== null ? cijfer.weging + "%" : ""));
    maak_tcell(rij, document.createTextNode(cijfer.cijfer !== null ? cijfer.cijfer : ""));
}

function vul_cijfers_tabel_user(table, data) {
    let vakken = data.vakken;
    let nieuw = data.nieuw;
    let kleur = 0;

    for (let vak of vakken) {
        if (vak.toon === nieuw && vak.cijfers.length > 0) {
            kleur++;
            let aantal_cijfers = vak.cijfers.length;
            let first = true;

            for (let cijfer of vak.cijfers) {
                let tr = table.insertRow();

                if (first) {
                    let tc = maak_tcell(tr, document.createTextNode(vak.naam),
                        kleur % 2 === 0 ? "table-row-1" : "table-row-2");
                    tc.rowSpan = aantal_cijfers;
                    first = false;
                }

                vul_cijfers_rij(tr, cijfer, false);
            }
        }
    }
}

function vul_cijfers_tabel_admin(table, data) {
    let vakken = data.vakken;
    let selectie = data.selectie;

    for (let vak of vakken) {
        for (let cijfer of vak.cijfers) {
            let tr = table.insertRow();
            tr.id = `tr-cijfer-${cijfer.cijfernummer}`;
            let input = document.createElement('input');
            input.id = `select-cijfer-${cijfer.cijfernummer}`;
            input.name = cijfer.cijfernummer;
            input.classList.add('w3-check');
            input.type = 'checkbox';
            if (selectie.has(cijfer.cijfernummer)) {
                input.checked = true;
            }
            maak_tcell(tr, input);

            vul_cijfers_rij(tr, cijfer, true);
        }
    }
}

function update_cijfers_tabel(table, data, admin=false) {
    verwijder_huidige_tbody(table);
    let table_inhoud = document.createElement('tbody');

    if (admin) {
        vul_cijfers_tabel_admin(table_inhoud, data);
    } else {
        vul_cijfers_tabel_user(table_inhoud, data);
    }


    if (table_inhoud.rows.length < 1) {
        let tr = table_inhoud.insertRow();
        let em = document.createElement('em');
        em.appendChild(document.createTextNode("Geen cijfers om weer te geven…"));
        let tc = maak_tcell(tr, em, "w3-center");
        tc.colSpan = admin ? 7 : 5;
    }

    table.appendChild(table_inhoud);
}

function format_periode(periode) {
    if (periode.start === periode.end) {
        return periode.start;
    }

    return `${periode.start}–${periode.end}`
}

function vul_vakken_rij(rij, vak, admin) {
    if (admin) {
        maak_tcell(rij, document.createTextNode(vak.vaknummer));
    }

    maak_tcell(rij, document.createTextNode(vak.naam));
    maak_tcell(rij, document.createTextNode(vak.jaar));
    maak_tcell(rij, document.createTextNode(vak.periode !== null ? format_periode(vak.periode) : ""));
    maak_tcell(rij, document.createTextNode(vak.gemiddelde !== null ? vak.gemiddelde : ""));

    if (!admin) {
        let abbr = document.createElement('abbr');
        abbr.style.textDecoration = 'none';
        if (vak.eindcijfer === null) {
            abbr.title = 'voorlopig';
            abbr.style.fontStyle = 'italic';
            abbr.appendChild(document.createTextNode(vak.totaal !== null ? vak.totaal : ""));
        } else {
            abbr.title = 'definitief';
            abbr.appendChild(document.createTextNode(vak.eindcijfer));
        }
        maak_tcell(rij, abbr);
    }

    maak_tcell(rij, document.createTextNode(vak.studiepunten));

    if (admin) {
        maak_tcell(rij, document.createTextNode(vak.eindcijfer !== null ? vak.eindcijfer : ""));
    }

    maak_tcell(rij, document.createTextNode(vak.gehaald ? "ja" : "nee"));

    if (admin) {
        maak_tcell(rij, document.createTextNode(vak.toon ? "ja" : "nee"));
    }
}

function update_vakken_tabel(table, data, admin=false) {
    verwijder_huidige_tbody(table);
    let table_inhoud = document.createElement('tbody');

    for (let vak of data.vakken) {
        let tr = table_inhoud.insertRow();
        if (admin) {
            tr.id = `tr-vak-${vak.vaknummer}`;
            let input = document.createElement('input');
            input.id = `select-vak-${vak.vaknummer}`;
            input.name = vak.vaknummer;
            input.classList.add('w3-check');
            input.type = 'checkbox';
            if (data.selectie.has(vak.vaknummer)) {
                input.checked = true;
            }
            maak_tcell(tr, input);
        }
        vul_vakken_rij(tr, vak, admin);
    }


    if (table_inhoud.rows.length < 1) {
        let tr = table_inhoud.insertRow();
        let em = document.createElement('em');
        em.appendChild(document.createTextNode("Geen vakken om weer te geven…"));
        let tc = maak_tcell(tr, em, "w3-center");
        tc.colSpan = admin ? 10 : 7;
    }

    table.appendChild(table_inhoud);
}

export {date_options, clear_element, maak_element, maak_tcell, update_cijfers_tabel, update_vakken_tabel};
