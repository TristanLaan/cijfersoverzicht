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

import {createPanel, panelTypesEnum} from "./panel.mjs";

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
            element.append(...value);
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
    cell.append(text);

    return cell;
}

function maak_tooltip(element, inhoud) {
    let sup;

    function toggle_beschrijving_popout() {
        let div = element.querySelector("div.popout");
        if (div) {
            div.remove();
        } else {
            let content = maak_element('div', {
                style: {whiteSpace: 'pre-wrap'},
                class: ['popout-content'],
                children: [inhoud]
            })

            let arrow = maak_element('div', {class: ['popout-after']});

            div = maak_element('div', {
                class: ['popout'],
                children: [content, arrow]
            });

            element.append(div);

            // Maximale hoogte valt binnen body en past volledig in beeld.
            let pos = div.getBoundingClientRect();
            const body_pos = document.body.getBoundingClientRect();
            const screen_height = window.innerHeight - 100;

            let max_height = pos.bottom - 26 - body_pos.top;
            if (max_height > screen_height) {
                max_height = screen_height;
            }

            content.style.maxHeight = max_height.toString() + 'px';

            // Popout komt vanuit ⓘ-symbool.
            // Centreer div boven ⓘ-symbool, en binnen boundaries van het element.
            const el_pos = element.getBoundingClientRect();
            const sup_pos = sup.getBoundingClientRect();
            const sup_x = sup_pos.left + sup_pos.width / 2;
            let left = sup_x - el_pos.left - pos.width / 2;

            if (left < 0) {
                left = 0;
            } else if (left + pos.width > el_pos.width) {
                left = el_pos.width - pos.width;
            }

            div.style.left = left.toString() + 'px';

            // Centreer pijl boven ⓘ-symbool.
            pos = div.getBoundingClientRect();
            left = sup_x - pos.left;
            arrow.style.left = left.toString() + 'px';
        }
    }

    element.classList.add('popout-container');
    sup = maak_element('sup', {
        style: {marginLeft: '-6px', fontWeight: '600'},
        class: ['tooltip'],
        children: ["ⓘ"]
    });
    sup.addEventListener('click', toggle_beschrijving_popout);
    element.append(sup);
}

function vul_cijfers_rij(rij, cijfer, admin) {
    if (admin) {
        maak_tcell(rij, cijfer.cijfernummer);
    }
    let naam = maak_tcell(rij, cijfer.naam, admin ? null : "table-cijfertitel");
    if (cijfer.beschrijving) {
        maak_tooltip(naam, cijfer.beschrijving);
    }
    if (admin) {
        maak_tcell(rij, cijfer.vak.naam);
    }
    maak_tcell(rij,
        cijfer.datum !== null ? cijfer.datum.toLocaleDateString(undefined, date_options) : "");
    maak_tcell(rij, cijfer.weging !== null ? cijfer.weging + "%" : "");
    maak_tcell(rij, cijfer.cijfer !== null ? cijfer.cijfer : "");
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
                    let tc = maak_tcell(tr, vak.naam,
                        kleur % 2 === 0 ? "table-row-1" : "table-row-2");
                    tc.rowSpan = aantal_cijfers;
                    first = false;

                    if (vak.beschrijving) {
                        maak_tooltip(tc, vak.beschrijving);
                    }
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
        em.append("Geen cijfers om weer te geven…");
        let tc = maak_tcell(tr, em, "w3-center");
        tc.colSpan = admin ? 7 : 5;
    }

    table.append(table_inhoud);
}

function format_periode(periode) {
    if (periode.start === periode.end) {
        return periode.start;
    }

    return `${periode.start}–${periode.end}`
}

function vul_vakken_rij(rij, vak, admin) {
    if (admin) {
        maak_tcell(rij, vak.vaknummer);
    }

    let naam = maak_tcell(rij, vak.naam);

    if (vak.beschrijving) {
        maak_tooltip(naam, vak.beschrijving);
    }

    maak_tcell(rij, vak.jaar);
    maak_tcell(rij, vak.periode !== null ? format_periode(vak.periode) : "");
    maak_tcell(rij, vak.gemiddelde !== null ? vak.gemiddelde : "");

    if (!admin) {
        let abbr = document.createElement('abbr');
        abbr.style.textDecoration = 'none';
        if (vak.eindcijfer === null) {
            abbr.title = 'voorlopig';
            abbr.style.fontStyle = 'italic';
            abbr.append(vak.totaal !== null ? vak.totaal : "");
        } else {
            abbr.title = 'definitief';
            abbr.append(vak.eindcijfer);
        }
        maak_tcell(rij, abbr);
    }

    maak_tcell(rij, vak.studiepunten);

    if (admin) {
        maak_tcell(rij, vak.eindcijfer !== null ? vak.eindcijfer : "");
    }

    maak_tcell(rij, vak.gehaald ? "ja" : "nee");

    if (admin) {
        maak_tcell(rij, vak.toon ? "ja" : "nee");
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
        em.append("Geen vakken om weer te geven…");
        let tc = maak_tcell(tr, em, "w3-center");
        tc.colSpan = admin ? 10 : 7;
    }

    table.append(table_inhoud);
}

function create_cijfer_grafiek(sectie, studienummer, vernieuwknop = false) {
    function refresh_grafiek() {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                document.getElementById("loadicon").style.display = "none";
                clear_element(document.getElementById('refresherror'));
                let return_value = parseInt(xhttp.responseText);

                if (this.status !== 200 || return_value !== 0) {
                    let message = "Er is een onbekende fout opgetreden, probeer het later opnieuw;";
                    if (return_value === -1) {
                        message = `Je bent niet ingelogd! Klik <a href="admin.php" target="_blank">hier</a> om opnieuw in te loggen, en probeer het dan opnieuw.`;
                    }
                    if (return_value === -2) {
                        message = "De grafiek functionaliteit is uitgeschakeld in de instellingen.";
                    }
                    document.getElementById('refresherror').append(createPanel(panelTypesEnum.error, message, false));
                }

                create_cijfer_grafiek(sectie, studienummer, vernieuwknop);
            }
        };
        xhttp.open("POST", "refresh_grafiek.php", true);
        xhttp.send();
        document.getElementById("loadicon").style.display = "block";
    }

    let div, inner_div, picture, button, link;
    let elements = [];

    picture = maak_element('picture');
    picture.append(maak_element('source', {
        srcset: `afbeelding.php?id=grades-${studienummer}-dark-latest.svg`,
        id: `test-bla`,
        media: "(prefers-color-scheme: dark)"
    }));
    picture.append(maak_element('img', {
        src: `afbeelding.php?id=grades-${studienummer}-light-latest.svg`,
        media: "(prefers-color-scheme: dark)",
        alt: "Grafiek cijfers",
        class: ["graph"]
    }));

    elements.push(picture);

    if (vernieuwknop) {
        div = maak_element('div', {
            id: "loadicon",
            class: ["fullwidth", "hidden"]
        });
        inner_div = maak_element('div', {
            class: ["center", "loading-bar"]
        })
        picture = maak_element('picture');
        picture.append(maak_element('source', {
            srcset: "icons/purple-spin.svg",
            media: "(prefers-color-scheme: dark)"
        }));
        picture.append(maak_element('img', {
            src: "icons/black-spin.svg",
            media: "(prefers-color-scheme: dark)",
            alt: "Grafiek aan het genereren…",
            class: ["loading"]
        }));
        inner_div.append(picture);
        div.append(inner_div);
        elements.push(div);

        div = maak_element('div', {
            class: ['fullwidth'],
            children: [
                maak_element('div', {
                    class: ['center'],
                    id: 'refresherror'
                })
            ],
        });
        elements.push(div);
    }

    div = maak_element('div', {
        class: ['fullwidth', 'downloads']
    });

    inner_div = maak_element('div', {
        class: ['center', 'download-buttons']
    });

    if (vernieuwknop) {
        button = maak_element('button', {
            type: 'button',
            class: ['w3-btn', 'w3-padding', 'w3-teal', 'download-button'],
            children: ["Vernieuw grafiek \xa0 ❯"]
        });

        button.addEventListener('click', refresh_grafiek);
        inner_div.append(button);
    }

    let combinations = [
        ["svg (licht)", `grades-${studienummer}-light-latest.svg`],
        ["png (licht)", `grades-${studienummer}-light-latest.png`],
        ["svg (donker)", `grades-${studienummer}-dark-latest.svg`],
        ["png (donker)", `grades-${studienummer}-dark-latest.png`],
    ];

    for (let i = 0; i < combinations.length; ++i) {
        let naam = combinations[i][0];
        let file = combinations[i][1];
        link = maak_element('a', {
            target: '_blank',
            href: `afbeelding.php?id=${file}`,
            download: file
        });
        button = maak_element('button', {
            type: 'button',
            class: ['w3-btn', 'w3-padding', 'w3-teal', 'download-button'],
            children: [`Download ${naam} \xa0 ❯`]
        });
        link.append(button);
        inner_div.append(link);
    }

    div.append(inner_div);
    elements.push(div);


    clear_element(sectie);

    sectie.append(...elements);
}

export {date_options, clear_element, maak_element, maak_tcell, update_cijfers_tabel, update_vakken_tabel, create_cijfer_grafiek};
