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

import {Cijfer, format_date, get_cijfers, parse_date, parse_get_all_cijfers, Vak} from "./api.mjs";
import {compare_hashes, generate_hash} from "./hash.mjs";
import {createPanel, panelTypesEnum} from "./panel.mjs";
import * as common from "./common.mjs";
import {clear_element, maak_element} from "./common.mjs";
import {toonPopup} from "./popup.mjs";

let cijfers_hash = null;
let upload_vakken_created = false;
let vakken = [];
let cijferMapping = {};
let vakMapping = {};

function get_selectie(table) {
    let selectie = new Set();
    let matches = table.querySelectorAll("input[type='checkbox']");
    for (let match of matches) {
        if (match.checked) {
            selectie.add(parseInt(match.name));
            match.checked = false;
        }
    }

    return selectie;
}

function update_cijfers_tabel() {
    let table = document.getElementById("cijfertabel");
    const selectie = get_selectie(table);
    common.update_cijfers_tabel(table, {vakken: vakken, selectie: selectie}, true);
}

function update_vakken_tabel() {
    let table = document.getElementById("vaktabel");
    const selectie = get_selectie(table);
    common.update_vakken_tabel(table, {vakken: vakken, selectie: selectie}, true);
}

function update_vakken_selects() {
    let selects = document.querySelectorAll("select.vak-select");

    for (let select of selects) {
        let options = create_vak_selectie(select.value in vakMapping ? parseInt(select.value) : null);
        clear_element(select);
        for (let option of options) {
            select.appendChild(option);
        }
    }
}

function create_mappings() {
    vakMapping = {};
    cijferMapping = {};
    for (let vak of vakken) {
        vakMapping[vak.vaknummer] = vak;
        for (let cijfer of vak.cijfers) {
            cijferMapping[cijfer.cijfernummer] = cijfer;
        }
    }
}

function laad_cijfers(cache = true) {
    async function update_cijfers_scherm() {
        if (this.readyState === 4 && this.status === 200) {
            let new_hash;
            if (cache) {
                new_hash = await generate_hash(this.responseText);
                if (compare_hashes(new_hash, cijfers_hash)) {
                    return;
                }
            }

            let results = parse_get_all_cijfers(this.responseText);
            if (results.error) {
                const errorPanel = createPanel(panelTypesEnum.error, results.error.message, false);
                document.getElementById("cijfer-refresh-error").appendChild(errorPanel);
                return;
            }

            if (cache) {
                cijfers_hash = new_hash;
            }

            vakken = results.vakken;
            create_mappings();
            update_cijfers_tabel();
            update_vakken_tabel();
            update_vakken_selects();

            if (!upload_vakken_created) {
                create_cijfer_upload_vakken(1);
                create_vak_upload_vakken(1);
                upload_vakken_created = true;
            }
        }
    }

    if (!document.hidden) {
        return get_cijfers(update_cijfers_scherm);
    }
}

function show_error(div, error) {
    clear_element(div);
    div.appendChild(createPanel(panelTypesEnum.error, error.message, false));
}

function get_cijfervak_data(form, bewerk) {
    const cijfernummer = bewerk ? parseInt(form.querySelector("input[name='cijfernummer']").value) : null;
    const vaknummer = parseInt(form.querySelector("select[name='vaknummer']").value);
    const titel = form.querySelector("input[name='titel']").value
    const weging_val = form.querySelector("input[name='weging']").value
    const weging = weging_val === '' ? null : parseFloat(weging_val);
    const datum_val = form.querySelector("input[name='datum']").value
    const datum = datum_val === '' ? null : datum_val;
    const cijfer_val = form.querySelector("input[name='cijfer']").value
    const cijfer = cijfer_val === '' ? null : parseFloat(cijfer_val);
    let errorvak = form.querySelector("div.errorvak");
    let error = false;
    clear_element(errorvak);

    if (titel === '') {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Cijfertitel is verplicht.", false));
        error = true;
    }

    if (isNaN(vaknummer) || vaknummer < 0) {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Vak is verplicht.", false));
        error = true;
    }

    if (isNaN(weging) || weging < 0) {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Weging is ongeldig.", false));
        error = true;
    }

    try {
        if (datum !== null) {
            parse_date(datum);
        }
    } catch {
        errorvak.appendChild(createPanel(panelTypesEnum.error, `Datum niet in yyyy-mm-dd format (${datum}).`, false));
        error = true;
    }

    if (isNaN(cijfer) || cijfer < 0) {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Cijfer is ongeldig.", false));
        error = true;
    }

    if (error) {
        return null;
    }

    try {
        return Cijfer.from_json({
            cijfernummer: cijfernummer,
            vaknummer: vaknummer,
            naam: titel,
            weging: weging,
            datum: datum,
            cijfer: cijfer
        });
    } catch {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Vak bestaat niet.", false));
        return null;
    }
}

function upload_cijfer(form, bewerk) {
    function general_error_function(error) {
        show_error(form.querySelector("div.errorvak"), error);
    }

    function handle_cijfer_function(i, cijfer, error) {
        if (error) {
            show_error(form.querySelector("div.errorvak"), error);
        } else {
            clear_element(form);
            form.appendChild(maak_element('p', {children: [document.createTextNode("Cijfer geüpload!")]}));
            form.dataset.uploaded = "true";
            laad_cijfers();
        }
    }

    let cijfer = get_cijfervak_data(form, bewerk);

    if (cijfer) {
        Cijfer.update_cijfers([cijfer], general_error_function, handle_cijfer_function);
    }
}

function update_cijfer_selectie(divs, errorvak, bewerk) {
    let cijfers = [];
    let correct_divs = [];
    function general_error_function(error) {
        show_error(errorvak, error);
    }

    function handle_cijfer_function(i, cijfer, error) {
        let form = correct_divs[i].querySelector("form");

        if (error) {
            show_error(form.querySelector("div.errorvak"), error);
        } else {
            clear_element(form);
            form.appendChild(maak_element('p', {children: [document.createTextNode("Cijfer geüpload!")]}));
            form.dataset.uploaded = "true";
        }
    }

    for (let div of divs) {
        let form = div.querySelector("form");
        if (!form.dataset.uploaded) {
            let cijfer = get_cijfervak_data(form, bewerk);
            if (cijfer) {
                cijfers.push(cijfer);
                correct_divs.push(div);
            }
        }
    }

    if (cijfers.length > 0) {
        Cijfer.update_cijfers(cijfers, general_error_function, handle_cijfer_function, () => laad_cijfers());
    }
}

function upload_alle_cijfers() {
    let divs = Array.prototype.slice.call(document.querySelectorAll("div.upload-cijfervak"), 0);
    divs.sort((a, b) => (a.id < b.id) ? -1 : (a.id > b.id) ? 1 : 0);
    update_cijfer_selectie(divs, document.getElementById("cijferuploaderror"), false);
}

function wijzig_alle_cijfers() {
    let divs = Array.prototype.slice.call(document.querySelectorAll("div.wijzig-cijfervak"), 0);
    update_cijfer_selectie(divs, document.getElementById("cijferwijzigerror"), true);
}

function create_vak_selectie(geselecteerd) {
    let selecties = [];
    selecties.push(maak_element('option', {
        value: '',
        disabled: true,
        selected: geselecteerd === null,
        children: [document.createTextNode("Kies je vak")]
    }));
    for (let vak of vakken) {
        selecties.push(maak_element('option', {
            value: vak.vaknummer,
            selected: geselecteerd === vak.vaknummer,
            children: [document.createTextNode(vak.naam)]
        }))
    }
    return selecties;
}

function create_cijfer_vak(i, bewerk = false, cijfer = null) {
    let optie;
    let div = maak_element('div', {id: `${bewerk ? 'wijzig' : 'upload'}-cijfervak-${i}`, class: [`${bewerk ? 'wijzig' : 'upload'}-cijfervak`]});
    div.appendChild(maak_element('div', {
        class: ['w3-container', 'w3-teal'],
        children: [maak_element('h3', {
            children: [document.createTextNode(cijfer === null ? `Cijfer ${i + 1}` :
                `${cijfer.cijfernummer}. ${cijfer.naam} - ${cijfer.vak.naam}`)]
        })]
    }));
    let form = maak_element('form', {
        action: "javascript:void(0)",
        class: ['w3-white', 'w3-container', 'w3-card-4'],
        style: {'margin-bottom': '15px'}
    });
    form.addEventListener('submit', function () {
        upload_cijfer(form, bewerk)
    });
    form.appendChild(maak_element('div', {class: ['errorvak']}));

    // Verplichte onderdelen
    form.appendChild(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: [document.createTextNode("Verplicht")]
    }));

    // Cijfernummer
    if (cijfer) {
        form.appendChild(maak_element('input', {
            name: 'cijfernummer',
            type: 'number',
            value: cijfer.cijfernummer,
            required: true,
            disabled: true,
            class: ['w3-input', 'w3-border'],
            style: {display: 'none'}
        }));
    }

    // Titel
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Titel")]
    }));
    optie.appendChild(maak_element('input', {
        name: 'titel',
        type: 'text',
        placeholder: 'eindtentamen',
        value: cijfer ? cijfer.naam : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    form.appendChild(optie);

    // Vak
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Vak")]
    }));
    let select = maak_element('select', {
        class: ['w3-select', 'vak-select'],
        name: 'vaknummer', required: true
    });
    let options = create_vak_selectie(cijfer ? cijfer.vak.vaknummer : null);
    for (let option of options) {
        select.appendChild(option);
    }
    optie.appendChild(select);
    form.appendChild(optie);

    // Optionele onderdelen
    form.appendChild(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: [document.createTextNode("Optioneel")]
    }));

    let row = maak_element('div', {class: ['w3-row']});

    // Weging
    let sec = maak_element('div', {class: ['w3-third', 'third-left']});
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Weging (in %)")]
    }));
    optie.appendChild(maak_element('input', {
        name: 'weging',
        type: 'number',
        placeholder: 42.0,
        min: 0,
        step: 0.01,
        value: cijfer && cijfer.weging ? cijfer.weging : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.appendChild(optie);
    row.appendChild(sec);

    // Datum
    sec = maak_element('div', {class: ['w3-third', 'third-mid']});
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {class: ['w3-text-grey'], children: [document.createTextNode("Datum")]}));
    optie.appendChild(maak_element('input', {
        name: 'datum',
        type: 'date',
        placeholder: 'yyyy-mm-dd',
        value: cijfer && cijfer.datum ? format_date(cijfer.datum) : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.appendChild(optie);
    row.appendChild(sec);

    // Cijfer
    sec = maak_element('div', {class: ['w3-third', 'third-right']});
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {class: ['w3-text-grey'], children: [document.createTextNode("Cijfer")]}));
    optie.appendChild(maak_element('input', {
        name: 'cijfer',
        type: 'number',
        placeholder: 6.66,
        min: 0,
        step: 0.01,
        value: cijfer && cijfer.cijfer ? cijfer.cijfer : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.appendChild(optie);
    row.appendChild(sec);

    form.appendChild(row);

    // Submit
    optie = maak_element('p');
    optie.appendChild(maak_element('input', {
        type: 'submit',
        value: `${bewerk ? "Wijzig" : "Upload"} \xa0 ❯`,
        class: ['w3-btn', 'w3-padding', 'w3-teal'],
        style: {width: '120px'}
    }));
    form.appendChild(optie);

    div.appendChild(form);
    return div;
}

function create_cijfer_upload_vakken(aantal) {
    let div = document.getElementById('cijfervakken');
    clear_element(div);
    for (let i = 0; i < aantal; ++i) {
        div.appendChild(create_cijfer_vak(i, false, null));
    }
}

function create_cijfer_wijzig_vakken() {
    let table = document.getElementById('cijfertabel');
    let selectie = get_selectie(table);
    let popup = document.getElementById('wijzig-cijfer-popup');
    let div = document.createElement('div');

    if (selectie.size < 1) {
        return;
    }

    for (const [i, cijfer] of selectie.entries()) {
        div.appendChild(create_cijfer_vak(i, true, cijferMapping[cijfer]));
    }

    div.appendChild(maak_element('div', {id: 'cijferwijzigerror'}));
    let button = maak_element('button', {type: 'button', class: ['w3-btn', 'w3-padding', 'w3-teal', 'upload-button'], children: [document.createTextNode("Wijzig alle \xa0 ❯")]});
    button.addEventListener('click', wijzig_alle_cijfers);
    div.appendChild(button);

    toonPopup(popup, div);
}

async function deel_cijfers() {
    let table = document.getElementById('cijfertabel');
    let selectie = get_selectie(table);
    let info = document.getElementById('cijfer-deel-info');

    if (selectie.size < 1) {
        return;
    }

    clear_element(info);
    let text = `Er ${(selectie.size === 1 ? "is een nieuw cijfer" : "zijn nieuwe cijfers")} geüpload:\n`;

    for (const cijfernummer of selectie) {
        let cijfer = cijferMapping[cijfernummer];
        text += `Cijfer:\t\t\t${(cijfer.cijfer === null ? "Onbekend" : `${cijfer.cijfer}`)}\nVak:\t\t\t${cijfer.vak.naam}\nOmschrijving:\t${cijfer.naam}\nWeging:\t\t\t${(cijfer.weging === null ? "Onbekend" : `${cijfer.weging}%`)}\n\n`;
    }

    text += `Bekijk cijfers:${(serverinfo.intern ? `\nExtern:\t\t\t${serverinfo.domein}\nIntern:\t\t\t${serverinfo.interndomein}` : `\t${serverinfo.domein}`)}\nWachtwoord:\t${serverinfo.wachtwoord}`;

    try {
        if (navigator && navigator.share) {
            await navigator.share({title: serverinfo.titel, text: text, url: serverinfo.domein});
        } else {
            // Fallback if sharing is not supported
            console.debug("Warning: falling back to old share implementation.");
            let tekstVak = document.createElement('textarea');
            tekstVak.value = text;
            tekstVak.readOnly = true;
            tekstVak.style.position = 'absolute';
            tekstVak.style.left = '-1000px';
            document.body.appendChild(tekstVak);
            tekstVak.select();
            document.execCommand('copy');
            document.body.removeChild(tekstVak);
        }
        info.appendChild(createPanel(panelTypesEnum.info, "Cijfers succesvol gekopieerd!", false));
    } catch (e) {
        info.appendChild(createPanel(panelTypesEnum.error, `Kon cijfers niet kopiëren: ${e}.`, false));
    }
}

function verwijder_cijfers() {
    function general_error_function(error) {
        show_error(document.getElementById("cijferverwijdererror"), error);
    }

    function handle_cijfer_function(results) {
        let errorvak = document.getElementById("cijferverwijdererror");
        clear_element(errorvak);
        let div = document.createElement('div');
        let succes = true;

        for (const result of results) {
            if (result.error) {
                let cijfer = cijfers[result.i];
                let p = maak_element('p');

                succes = false;
                p.innerHTML = `${cijfer.cijfernummer}. ${cijfer.naam}: ${result.error.message}`;
                div.appendChild(p);
            }
        }

        if (succes) {
            errorvak.appendChild(createPanel(panelTypesEnum.info, "Cijfers succesvol verwijderd!", false));
        } else {
            errorvak.appendChild(createPanel(panelTypesEnum.error, div, false));
        }

        laad_cijfers();
    }

    let table = document.getElementById('cijfertabel');
    let selectie = get_selectie(table);
    let cijfers = [];

    if (selectie.size < 1) {
        return;
    }

    let warning = "Weet je zeker dat je deze cijfers wilt verwijderen:\n";

    for (const [i, cijfernummer] of selectie.entries()) {
        let cijfer = cijferMapping[cijfernummer];
        warning += `${cijfer.cijfernummer}. ${cijfer.naam}\n`;
        cijfers.push(cijfer);
    }

    if (window.confirm(warning)) {
        Cijfer.verwijder_cijfers(cijfers, general_error_function, handle_cijfer_function);
    }
}

function get_vakvak_data(form, bewerk) {
    const vaknummer = bewerk ? parseInt(form.querySelector("input[name='vaknummer']").value) : null;
    const titel = form.querySelector("input[name='titel']").value
    const jaar_val = form.querySelector("input[name='jaar']").value
    const jaar = parseInt(jaar_val);
    const studiepunten_val = form.querySelector("input[name='studiepunten']").value
    const studiepunten = parseInt(studiepunten_val);
    const gehaald = form.querySelector("input[name='gehaald']").checked;
    const toon = form.querySelector("input[name='toon']").checked;
    const periode_val = form.querySelector("input[name='periode']").value
    const periode = periode_val === '' ? null : parseInt(periode_val);
    const eindcijfer_val = form.querySelector("input[name='eindcijfer']").value
    const eindcijfer = eindcijfer_val === '' ? null : parseFloat(eindcijfer_val);
    let errorvak = form.querySelector("div.errorvak");
    let error = false;
    clear_element(errorvak);

    if (titel === '') {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Cijfertitel is verplicht.", false));
        error = true;
    }

    if (isNaN(jaar) || jaar < 0) {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Jaar is verplicht.", false));
        error = true;
    }

    if (isNaN(studiepunten) || studiepunten < 0) {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Studiepunten zijn verplicht.", false));
        error = true;
    }

    if (isNaN(periode) || periode < 0) {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Periode is ongeldig.", false));
        error = true;
    }

    if (isNaN(eindcijfer) || eindcijfer < 0) {
        errorvak.appendChild(createPanel(panelTypesEnum.error, "Eindcijer is ongeldig.", false));
        error = true;
    }

    if (error) {
        return null;
    }

    return Vak.from_json({
        vaknummer: vaknummer,
        naam: titel,
        jaar: jaar,
        studiepunten: studiepunten,
        gehaald: gehaald,
        toon: toon,
        periode: periode,
        eindcijfer: eindcijfer
    });
}

function upload_vak(form, bewerk) {
    function general_error_function(error) {
        show_error(form.querySelector("div.errorvak"), error);
    }

    function handle_vak_function(i, vak, error) {
        if (error) {
            show_error(form.querySelector("div.errorvak"), error);
        } else {
            clear_element(form);
            form.appendChild(maak_element('p', {children: [document.createTextNode("Vak geüpload!")]}));
            form.dataset.uploaded = "true";
            laad_cijfers();
        }
    }

    let vak = get_vakvak_data(form, bewerk);

    if (vak) {
        Vak.update_vakken([vak], general_error_function, handle_vak_function);
    }
}

function update_vak_selectie(divs, errorvak, bewerk) {
    let vakken = [];
    let correct_divs = [];
    function general_error_function(error) {
        show_error(errorvak, error);
    }

    function handle_vak_function(i, vak, error) {
        let form = correct_divs[i].querySelector("form");

        if (error) {
            show_error(form.querySelector("div.errorvak"), error);
        } else {
            clear_element(form);
            form.appendChild(maak_element('p', {children: [document.createTextNode("Vak geüpload!")]}));
            form.dataset.uploaded = "true";
        }
    }

    for (let div of divs) {
        let form = div.querySelector("form");
        if (!form.dataset.uploaded) {
            let vak = get_vakvak_data(form, bewerk);
            if (vak) {
                vakken.push(vak);
                correct_divs.push(div);
            }
        }
    }

    if (vakken.length > 0) {
        Vak.update_vakken(vakken, general_error_function, handle_vak_function, () => laad_cijfers());
    }
}

function upload_alle_vakken() {
    let divs = Array.prototype.slice.call(document.querySelectorAll("div.upload-vakvak"), 0);
    divs.sort((a, b) => (a.id < b.id) ? -1 : (a.id > b.id) ? 1 : 0);
    update_vak_selectie(divs, document.getElementById("vakuploaderror"), false);
}

function wijzig_alle_vakken() {
    let divs = Array.prototype.slice.call(document.querySelectorAll("div.wijzig-vakvak"), 0);
    update_vak_selectie(divs, document.getElementById("vakwijzigerror"), true);
}

function create_vak_vak(i, bewerk = false, vak = null) {
    let optie, row, sec;
    let gemiddelde = vak && vak.gemiddelde;
    let div = maak_element('div', {id: `${bewerk ? 'wijzig' : 'upload'}-vakvak-${i}`, class: [`${bewerk ? 'wijzig' : 'upload'}-vakvak`]});
    div.appendChild(maak_element('div', {
        class: ['w3-container', 'w3-teal'],
        children: [maak_element('h3', {
            children: [document.createTextNode(vak === null ? `Vak ${i + 1}` :
                `${vak.vaknummer}. ${vak.naam}`)]
        })]
    }));
    let form = maak_element('form', {
        action: "javascript:void(0)",
        class: ['w3-white', 'w3-container', 'w3-card-4'],
        style: {'margin-bottom': '15px'}
    });
    form.addEventListener('submit', function () {
        upload_vak(form, bewerk)
    });
    form.appendChild(maak_element('div', {class: ['errorvak']}));

    // Verplichte onderdelen
    form.appendChild(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: [document.createTextNode("Verplicht")]
    }));

    // Vaknummer
    if (vak) {
        form.appendChild(maak_element('input', {
            name: 'vaknummer',
            type: 'number',
            value: vak.vaknummer,
            required: true,
            disabled: true,
            class: ['w3-input', 'w3-border'],
            style: {display: 'none'}
        }));
    }

    // Titel
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Titel")]
    }));
    optie.appendChild(maak_element('input', {
        name: 'titel',
        type: 'text',
        placeholder: 'Inleiding studie',
        value: vak ? vak.naam : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    form.appendChild(optie);

    row = maak_element('div', {class: ['w3-row']});
    // Jaar
    sec = maak_element('div', {class: ['w3-half', 'third-left']});
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Jaar")]
    }));
    optie.appendChild(maak_element('input', {
        name: 'jaar',
        type: 'number',
        min: 1,
        step: 1,
        placeholder: '1',
        value: vak ? vak.jaar : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    sec.appendChild(optie);
    row.appendChild(sec);

    // Studiepunten
    sec = maak_element('div', {class: ['w3-half', 'third-right']});
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Studiepunten")]
    }));
    optie.appendChild(maak_element('input', {
        name: 'studiepunten',
        type: 'number',
        min: 0,
        step: 1,
        placeholder: '6',
        value: vak ? vak.studiepunten : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    sec.appendChild(optie);
    row.appendChild(sec);

    form.appendChild(row);

    row = maak_element('div', {class: ['w3-row']});
    // Gehaald
    sec = maak_element('div', {class: ['w3-half', 'third-left']});
    optie = maak_element('p', {style: {margin: 0}});
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Gehaald: ")]
    }));
    optie.appendChild(maak_element('input', {
        name: 'gehaald',
        type: 'checkbox',
        checked: vak ? vak.gehaald : false,
        class: ['w3-check']
    }));
    sec.appendChild(optie);
    row.appendChild(sec);

    // Toon
    sec = maak_element('div', {class: ['w3-half', 'third-right']});
    optie = maak_element('p', {style: {margin: 0}});
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Toon: ")]
    }));
    optie.appendChild(maak_element('input', {
        name: 'toon',
        type: 'checkbox',
        checked: vak ? vak.toon : true,
        class: ['w3-check']
    }));
    sec.appendChild(optie);
    row.appendChild(sec);

    form.appendChild(row);

    // Optionele onderdelen
    form.appendChild(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: [document.createTextNode("Optioneel")]
    }));

    row = maak_element('div', {class: ['w3-row']});
    // Periode
    sec = maak_element('div', {class: gemiddelde ? ['w3-third', 'third-left'] : ['w3-half', 'third-left']});
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Periode")]
    }));
    optie.appendChild(maak_element('input', {
        name: 'periode',
        type: 'number',
        min: 0,
        step: 1,
        placeholder: '1',
        value: vak ? vak.periode : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.appendChild(optie);
    row.appendChild(sec);

    // Eindcijfer
    sec = maak_element('div', {class: gemiddelde ? ['w3-third', 'third-mid'] : ['w3-half', 'third-right']});
    optie = maak_element('p');
    optie.appendChild(maak_element('label', {
        class: ['w3-text-grey'],
        children: [document.createTextNode("Eindcijfer")]
    }));
    optie.appendChild(maak_element('input', {
        name: 'eindcijfer',
        type: 'number',
        min: 0,
        step: 0.01,
        placeholder: '6.66',
        value: vak ? vak.eindcijfer : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.appendChild(optie);
    row.appendChild(sec);

    if (gemiddelde) {
        // Gemiddelde cijfer
        sec = maak_element('div', {class: ['w3-third', 'third-right']});
        optie = maak_element('p');
        optie.appendChild(maak_element('label', {
            class: ['w3-text-grey'],
            style: {fontStyle: 'italic'},
            children: [document.createTextNode("Berekend gemiddelde")]
        }));
        optie.appendChild(maak_element('input', {
            name: 'gemiddelde',
            type: 'number',
            min: 0,
            step: 0.01,
            value: vak.gemiddelde,
            disabled: true,
            class: ['w3-input', 'w3-border'],
            style: {fontStyle: 'italic'}
        }));
        sec.appendChild(optie);
        row.appendChild(sec);
    }

    form.appendChild(row);

    // Submit
    optie = maak_element('p');
    optie.appendChild(maak_element('input', {
        type: 'submit',
        value: `${bewerk ? "Wijzig" : "Upload"} \xa0 ❯`,
        class: ['w3-btn', 'w3-padding', 'w3-teal'],
        style: {width: '120px'}
    }));
    form.appendChild(optie);

    div.appendChild(form);
    return div;
}

function create_vak_upload_vakken(aantal) {
    let div = document.getElementById('vakvakken');
    clear_element(div);
    for (let i = 0; i < aantal; ++i) {
        div.appendChild(create_vak_vak(i, false, null));
    }
}

function create_vak_wijzig_vakken() {
    let table = document.getElementById('vaktabel');
    let selectie = get_selectie(table);
    let popup = document.getElementById('wijzig-vak-popup');
    let div = document.createElement('div');

    if (selectie.size < 1) {
        return;
    }

    for (const [i, vak] of selectie.entries()) {
        div.appendChild(create_vak_vak(i, true, vakMapping[vak]));
    }

    div.appendChild(maak_element('div', {id: 'vakwijzigerror'}));
    let button = maak_element('button', {type: 'button', class: ['w3-btn', 'w3-padding', 'w3-teal', 'upload-button'], children: [document.createTextNode("Wijzig alle \xa0 ❯")]});
    button.addEventListener('click', wijzig_alle_vakken);
    div.appendChild(button);

    toonPopup(popup, div);
}

function verwijder_vakken() {
    function general_error_function(error) {
        show_error(document.getElementById("vakverwijdererror"), error);
    }

    function handle_vak_function(results) {
        let errorvak = document.getElementById("vakverwijdererror");
        clear_element(errorvak);
        let div = document.createElement('div');
        let succes = true;

        for (const result of results) {
            if (result.error) {
                let vak = vakken[result.i];
                let p = maak_element('p');

                succes = false;
                p.innerHTML = `${vak.vaknummer}. ${vak.naam}: ${result.error.message}`;
                div.appendChild(p);
            }
        }

        if (succes) {
            errorvak.appendChild(createPanel(panelTypesEnum.info, "Vakken succesvol verwijderd!", false));
        } else {
            errorvak.appendChild(createPanel(panelTypesEnum.error, div, false));
        }

        laad_cijfers();
    }

    let table = document.getElementById('vaktabel');
    let selectie = get_selectie(table);
    let vakken = [];

    if (selectie.size < 1) {
        return;
    }

    let warning = "Weet je zeker dat je deze vakken wilt verwijderen:\n";

    for (const vaknummer of selectie) {
        let vak = vakMapping[vaknummer];
        warning += `${vak.vaknummer}. ${vak.naam}\n`;
        vakken.push(vak);
    }

    if (window.confirm(warning)) {
        Vak.verwijder_vakken(vakken, general_error_function, handle_vak_function);
    }
}

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
                document.getElementById('refresherror').appendChild(createPanel(panelTypesEnum.error, message, false));
            }
        }
    };
    xhttp.open("POST", "refresh_grafiek.php", true);
    xhttp.send();
    document.getElementById("loadicon").style.display = "block";
}

laad_cijfers();
window.laad_cijfers = laad_cijfers;
setInterval(laad_cijfers, 60000);

document.getElementById('reset-cijfers-form').addEventListener('submit', function () {
    let input = document.getElementById('reset-cijfers-form').querySelector("input[name='aantal']");
    create_cijfer_upload_vakken(parseInt(input.value));
    input.value = 1;
});

document.getElementById('reset-vakken-form').addEventListener('submit', function () {
    let input = document.getElementById('reset-vakken-form').querySelector("input[name='aantal']");
    create_vak_upload_vakken(parseInt(input.value));
    input.value = 1;
});

document.getElementById('wijzig-cijfer-button').addEventListener('click', create_cijfer_wijzig_vakken);
document.getElementById('deel-cijfer-button').addEventListener('click', deel_cijfers);
document.getElementById('upload-cijfers-button').addEventListener('click', upload_alle_cijfers);
document.getElementById('verwijder-cijfer-button').addEventListener('click', verwijder_cijfers);

document.getElementById('wijzig-vak-button').addEventListener('click', create_vak_wijzig_vakken);
document.getElementById('upload-vakken-button').addEventListener('click', upload_alle_vakken);
document.getElementById('verwijder-vak-button').addEventListener('click', verwijder_vakken);

document.getElementById('refresh-grafiek-button').addEventListener('click', refresh_grafiek);
