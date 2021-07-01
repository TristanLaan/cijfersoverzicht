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

import {get_cijfers, parse_get_all_cijfers} from "./api.mjs";
import {toonPopup} from "./popup.mjs";
import {createPanel, panelTypesEnum} from "./panel.mjs";
import {clear_element, update_cijfers_tabel, update_vakken_tabel} from "./common.mjs";
import {generate_hash, compare_hashes} from "./hash.mjs";

let cijfers_hash = null;

function vul_info_vak(element, titel, waarde) {
    let strong = document.createElement('strong');
    strong.appendChild(document.createTextNode(`${titel}:`));
    clear_element(element);
    element.appendChild(strong);
    element.appendChild(document.createTextNode(` ${waarde}`));
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
    const studiepunten_vak = document.getElementById('studiepunten');
    const bsa_vak = document.getElementById('bsa');
    const gemiddelde_vak = document.getElementById('gemiddelde');
    let studiepunten = calc_studiepunten(vakken);
    let gemiddelde = calc_gemiddelde_cijfer(vakken);

    update_vakken_tabel(table, {vakken: vakken});

    vul_info_vak(bsa_vak, "BSA gehaald", studiepunten >= bsa_benodigd ? "ja" : "nee");
    vul_info_vak(studiepunten_vak, "Totaal aantal studiepunten", studiepunten);
    vul_info_vak(gemiddelde_vak, "Gemiddelde cijfer", gemiddelde !== null ? gemiddelde : "");
}

async function update_cijfers_scherm() {
    if (this.readyState === 4 && this.status === 200) {
        let new_hash = await generate_hash(this.responseText);
        if (compare_hashes(new_hash, cijfers_hash)) {
            return;
        }
        cijfers_hash = new_hash;

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

        toon_huidige_cijfers(results.vakken);
        toon_oude_cijfers(results.vakken);
        toon_vakken(results.vakken);
    }
}

function laad_cijfers() {
    if (!document.hidden) {
        get_cijfers(update_cijfers_scherm);
    }
}


laad_cijfers();
window.laad_cijfers = laad_cijfers;
setInterval(laad_cijfers, 60000);
