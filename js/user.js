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

import {
    get_cijfers,
    get_standaard_studie,
    get_studies,
    parse_get_all_cijfers,
    parse_get_studies,
    studieMapping
} from "./api.mjs";
import {toonPopup} from "./popup.mjs";
import {createPanel, panelTypesEnum} from "./panel.mjs";
import {
    clear_element,
    create_cijfer_grafiek,
    maak_element,
    update_cijfers_tabel,
    update_vakken_tabel
} from "./common.mjs";
import {generate_hash, compare_hashes} from "./hash.mjs";

let cijfers_hash = null;
let studies_hash = null;
let huidige_studie = null;
let refresh_interval = null;
let first_reload = true;

function get_huidige_studie(state=null) {
    let params = (new URL(document.location)).searchParams;
    let id = parseInt(params.get('studie'));
    if (state && 'study' in state) {
        huidige_studie = state['studie'];
    } else if (!isNaN(id)) {
        huidige_studie = id;
    }
}

function update_titel(studie) {
    document.title = `${studie.naam} – ${default_title}`;
    let titel = document.getElementById('titel');
    clear_element(titel);
    titel.append(`${default_title} – ${studie.naam}`)
}

function vul_info_vak(element, titel, waarde) {
    let strong = document.createElement('strong');
    strong.append(`${titel}:`);
    clear_element(element);
    element.append(strong);
    element.append(` ${waarde}`);
}

function toon_huidige_cijfers(vakken) {
    const table = document.getElementById('huidige-cijfers');
    update_cijfers_tabel(table, {vakken: vakken, nieuw: true});
}

function toon_oude_cijfers(vakken) {
    const table = document.getElementById('oude-cijfers');
    update_cijfers_tabel(table, {vakken: vakken, nieuw: false});
}

function calc_gemiddelde_cijfer(vakken) {
    let som = 0;
    let aantal = 0;

    for (let vak of vakken) {
        if (vak.eindcijfer !== null) {
            aantal += vak.studiepunten;
            som += vak.eindcijfer * vak.studiepunten;
        } else if (vak.gemiddelde !== null) {
            aantal += vak.studiepunten;
            som += vak.gemiddelde * vak.studiepunten;
        }
    }

    if (aantal === 0) {
        return null;
    }

    let gemiddelde = som / aantal;
    gemiddelde = gemiddelde.toFixed(2);

    return gemiddelde;
}

function calc_studiepunten(vakken) {
    let studiepunten = 0;

    for (let vak of vakken) {
        if (vak.gehaald) {
            studiepunten += vak.studiepunten;
        }
    }

    return studiepunten;
}

function toon_vakken(vakken) {
    const table = document.getElementById('vakken');
    let info_vak = document.getElementById('studie-info');
    let studiepunten = calc_studiepunten(vakken);
    let gemiddelde = calc_gemiddelde_cijfer(vakken);

    update_vakken_tabel(table, {vakken: vakken});

    clear_element(info_vak);

    if (huidige_studie.bsa !== null) {
        let bsa_vak = maak_element('p');
        vul_info_vak(bsa_vak, "BSA gehaald", studiepunten >= huidige_studie.bsa ? "ja" : `nee (${studiepunten}/${huidige_studie.bsa} studiepunten)`);
        info_vak.append(bsa_vak);
    }

    if (huidige_studie.bsa === null || studiepunten >= huidige_studie.bsa) {
        let gehaald_vak = maak_element('p');
        vul_info_vak(gehaald_vak, "Studie gehaald", huidige_studie.gehaald ? "ja" : "nee");
        info_vak.append(gehaald_vak);
    }

    let studiepunten_vak = maak_element('p');
    vul_info_vak(studiepunten_vak, "Totaal aantal studiepunten", studiepunten);
    info_vak.append(studiepunten_vak);


    if (gemiddelde !== null) {
        let gemiddelde_vak = maak_element('p');
        vul_info_vak(gemiddelde_vak, "Gemiddelde cijfer", gemiddelde);
        info_vak.append(gemiddelde_vak);
    }

}

function toon_studies(studies) {
    let studie_vak = document.getElementById("studie-select-vak");
    clear_element(studie_vak);

    update_titel(huidige_studie);

    for (let studie of studies) {
        let button = maak_element('button', {
            class: ['w3-btn', 'w3-round', 'w3-light-grey', 'w3-border', 'w3-padding', 'studie-button'],
            children: [studie.format()]
        });

        if (studie === huidige_studie) {
            button.classList.add('studie-selected');
        }

        button.addEventListener('click', function() {
            huidige_studie = studie;
            clearInterval(refresh_interval);
            refresh_interval = setInterval(laad_studies, 60000);
            history.pushState({studie: studie}, studie.format(), `?studie=${studie.studienummer}`);
            update_titel(studie);
            toon_studies(studies);
            laad_cijfers();
        });

        studie_vak.prepend(button);
    }
}

async function update_studies() {
    if (this.readyState === 4 && this.status === 200) {
        let new_hash = await generate_hash(this.responseText);
        if (compare_hashes(new_hash, studies_hash)) {
            if (huidige_studie) {
                laad_cijfers();
            }
            return;
        }

        let results = parse_get_studies(this.responseText);
        if (results.error) {
            if (results.error.reload_required) {
                setTimeout(function () {
                    location.reload()
                }, 500);
            }

            const errorPanel = createPanel(panelTypesEnum.error, results.error.message, true);
            toonPopup(document.getElementById("error-popup"), errorPanel);
            return;
        }

        studies_hash = new_hash;

        if (huidige_studie === null) {
            huidige_studie = get_standaard_studie(results.studies);
        } else if (typeof huidige_studie === 'number') {
            if (huidige_studie in studieMapping) {
                huidige_studie = studieMapping[huidige_studie];
            } else {
                huidige_studie = get_standaard_studie(results.studies);
            }
        } else {
            if (huidige_studie.studienummer in studieMapping) {
                huidige_studie = studieMapping[huidige_studie.studienummer];
            } else {
                huidige_studie = get_standaard_studie(results.studies);
            }
        }

        if (huidige_studie === null) {
            const errorPanel = createPanel(panelTypesEnum.error, "Er zijn geen studies gevonden.", true);
            toonPopup(document.getElementById("error-popup"), errorPanel);
            return;
        }

        toon_studies(results.studies);
        laad_cijfers();
    }
}

function laad_studies() {
    if (first_reload || !document.hidden) {
        first_reload = false;
        get_studies(update_studies);
    }
}

async function update_cijfers_scherm() {
    if (this.readyState === 4 && this.status === 200) {
        let new_hash = await generate_hash(this.responseText);
        if (compare_hashes(new_hash, cijfers_hash)) {
            return;
        }

        let results = parse_get_all_cijfers(this.responseText);
        if (results.error) {
            if (results.error.reload_required) {
                setTimeout(function () {
                    location.reload()
                }, 500);
            }

            const errorPanel = createPanel(panelTypesEnum.error, results.error.message, true);
            toonPopup(document.getElementById("error-popup"), errorPanel);
            return;
        }

        cijfers_hash = new_hash;

        toon_huidige_cijfers(results.vakken);
        toon_oude_cijfers(results.vakken);
        toon_vakken(results.vakken);

        let grafiek = document.getElementById('cijfer-grafiek');
        if (grafiek !== null) {
            create_cijfer_grafiek(grafiek, huidige_studie.studienummer);
        }
    }
}

function laad_cijfers() {
    get_cijfers(huidige_studie, update_cijfers_scherm);
}

get_huidige_studie();
laad_studies();
window.laad_cijfers = laad_cijfers;
window.laad_studies = laad_studies;
refresh_interval = setInterval(laad_studies, 60000);

window.onpopstate = function(event) {
    huidige_studie = null;
    get_huidige_studie(event.state);
    studies_hash = null;
    laad_studies();
}
