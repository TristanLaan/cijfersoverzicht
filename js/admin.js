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
    Cijfer, format_date, get_cijfers, parse_date, parse_get_all_cijfers, Vak, Periode, parse_get_studies,
    get_standaard_studie, studieMapping, get_studies, Studie
} from "./api.mjs";
import {compare_hashes, generate_hash} from "./hash.mjs";
import {createPanel, panelTypesEnum} from "./panel.mjs";
import * as common from "./common.mjs";
import {clear_element, create_cijfer_grafiek, maak_element} from "./common.mjs";
import {toonPopup, verbergPopups} from "./popup.mjs";

let cijfers_hash = null;
let studies_hash = null;
let huidige_studie = null;
let upload_vakken_created = false;
let studie_wijzig_vak_created = false;
let vakken = [];
let cijferMapping = {};
let vakMapping = {};
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

function show_error(div, error) {
    clear_element(div);
    div.append(createPanel(panelTypesEnum.error, error.message, false));
}

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

function update_titel(studie) {
    document.title = `Bewerk ${studie.naam} – ${default_title}`;
    let titel = document.getElementById('titel');
    clear_element(titel);
    titel.append(`${default_title} – Bewerk ${studie.naam}`)
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
            create_studie_bewerk_vak();
            verbergPopups();
            laad_cijfers();
        });

        studie_vak.prepend(button);
    }

    let button = maak_element('button', {
        class: ['w3-button', 'w3-circle', 'w3-light-grey', 'w3-xlarge', 'w3-ripple', 'w3-border', 'studie-button'],
        style: {padding: '0 13.5px', height: '43px', width: '43px'},
        children: ['+']
    });

    button.addEventListener('click', create_studie_upload_vak);

    studie_vak.append(button);
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
            select.append(option);
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

function laad_studies(cache = true) {
    async function update_studies_scherm() {
        if (this.readyState === 4 && this.status === 200) {
            let new_hash = null;
            if (cache) {
                new_hash = await generate_hash(this.responseText);
                if (compare_hashes(new_hash, studies_hash)) {
                    if (huidige_studie) {
                        laad_cijfers();
                    }
                    return;
                }
            }

            let results = parse_get_studies(this.responseText);
            if (results.error) {
                if (results.error.reload_required) {
                    setTimeout(function () {
                        location.reload()
                    }, 500);
                }

                const errorPanel = createPanel(panelTypesEnum.error, results.error.message, false);
                toonPopup(document.getElementById("cijfer-refresh-error"), errorPanel);
                return;
            }

            if (cache) {
                studies_hash = new_hash;
            }


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
                    studie_wijzig_vak_created = false;
                }
            }

            toon_studies(results.studies);
            if (!studie_wijzig_vak_created) {
                create_studie_bewerk_vak();
                studie_wijzig_vak_created = true;
            }
            laad_cijfers(cache);
        }
    }

    if (first_reload || !document.hidden) {
        first_reload = false;
        get_studies(update_studies_scherm);
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
                document.getElementById("cijfer-refresh-error").append(errorPanel);
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

            let grafiek = document.getElementById('cijfer-grafiek');
            if (grafiek !== null) {
                create_cijfer_grafiek(grafiek, huidige_studie.studienummer, true);
            }

            if (!upload_vakken_created) {
                create_cijfer_upload_vakken(1);
                create_vak_upload_vakken(1);
                upload_vakken_created = true;
            }
        }
    }


    get_cijfers(huidige_studie, update_cijfers_scherm);
}

function get_studievak_data(form, bewerk) {
    const studienummer = bewerk ? huidige_studie.studienummer : null;
    const naam = form.querySelector("input[name='naam']").value
    const begin_jaar = parseInt(form.querySelector("input[name='begin_jaar']").value);
    const eind_jaar_val = form.querySelector("input[name='eind_jaar']").value;
    const eind_jaar = eind_jaar_val === '' ? null : parseInt(eind_jaar_val);
    const standaard = form.querySelector("input[name='standaard']").checked;
    const gehaald = form.querySelector("input[name='gehaald']").checked;
    const bsa_val = form.querySelector("input[name='bsa']").value
    const bsa = bsa_val === '' ? null : parseInt(bsa_val);
    let errorvak = form.querySelector("div.errorvak");
    let error = false;
    clear_element(errorvak);

    if (naam === '') {
        errorvak.append(createPanel(panelTypesEnum.error, "Naam is verplicht.", false));
        error = true;
    }

    if (isNaN(begin_jaar)) {
        errorvak.append(createPanel(panelTypesEnum.error, "Begin jaar is verplicht.", false));
        error = true;
    } else if (begin_jaar < 1901 || begin_jaar > 2155) {
        errorvak.append(createPanel(panelTypesEnum.error, "Begin jaar moet na 1900 en voor 2155 zijn.", false));
        error = true;
    }

    if (eind_jaar !== null && (isNaN(eind_jaar) || eind_jaar < 1901 || eind_jaar > 2155)) {
        errorvak.append(createPanel(panelTypesEnum.error, "Eind jaar is geen getal.", false));
        error = true;
    }

    if (bsa !== null && (isNaN(bsa) || bsa < 0)) {
        errorvak.append(createPanel(panelTypesEnum.error, "Weging is ongeldig.", false));
        error = true;
    }

    if (error) {
        return null;
    }

    return Studie.from_json({
        studienummer: studienummer,
        naam: naam,
        begin_jaar: begin_jaar,
        eind_jaar: eind_jaar,
        standaard: standaard,
        gehaald: gehaald,
        bsa: bsa
    });
}

function upload_studie(form, bewerk) {
    function general_error_function(error) {
        show_error(form.querySelector("div.errorvak"), error);
    }

    function handle_studie_function(i, studie, error) {
        if (error) {
            show_error(form.querySelector("div.errorvak"), error);
        } else {
            clear_element(form);
            form.append(maak_element('p', {children: [`Studie ${bewerk ? "gewijzigd" : "geüpload"}!`]}));

            if (bewerk) {
                let button = maak_element('button', {
                    class: ['w3-btn', 'w3-padding', 'w3-teal'],
                    style: {width: '120px'},
                    type: 'button',
                    children: ["OK \xa0 ❯"]
                });
                button.addEventListener('click', create_studie_bewerk_vak);
                form.append(maak_element('p', {children: [button]}));
            } else {
                huidige_studie = studie;
            }

            form.dataset.uploaded = "true";
            laad_studies();
        }
    }

    let studie = get_studievak_data(form, bewerk);

    if (studie) {
        Studie.update_studies([studie], general_error_function, handle_studie_function);
    }
}

function verwijder_studie(form) {
    let errorvak = form.querySelector("div.errorvak");
    function general_error_function(error) {
        show_error(errorvak, error);
    }

    function handle_studie_function(results) {
        let error = results[0].error;

        if (error) {
            show_error(errorvak, error);
        } else {
            window.alert("De studie is succesvol verwijderd!");
            location.reload();
        }
    }

    if (huidige_studie.standaard) {
        clear_element(errorvak);
        errorvak.append(createPanel(panelTypesEnum.error, "Kan standaard studie niet verwijderen.", false));
        return;
    }

    if (window.confirm(`Weet je zeker dat je de studie '${huidige_studie.naam}' wilt verwijderen?`)) {
        Studie.verwijder_studies([huidige_studie], general_error_function, handle_studie_function);
    }
}

function create_studie_vak(bewerk, studie = null) {
    let optie, row, sec;
    let div = maak_element('div', {id: `${bewerk ? 'wijzig' : 'upload'}-studievak`, class: [`${bewerk ? 'wijzig' : 'upload'}-studievak`]});
    div.append(maak_element('div', {
        class: ['w3-container', 'w3-teal'],
        children: [maak_element('h3', {
            children: [studie === null ? "Nieuwe studie" :
                "Studie instellingen"]
        })]
    }));
    let form = maak_element('form', {
        action: "javascript:void(0)",
        class: ['w3-white', 'w3-container', 'w3-card-4'],
        style: {'margin-bottom': '15px'}
    });
    form.addEventListener('submit', function () {
        upload_studie(form, bewerk)
    });
    form.append(maak_element('div', {class: ['errorvak']}));

    // Verplichte onderdelen
    form.append(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: ["Verplicht"]
    }));

    // Titel
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Titel"]
    }));
    optie.append(maak_element('input', {
        name: 'naam',
        type: 'text',
        placeholder: 'Studie',
        value: studie ? studie.naam : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    form.append(optie);

    // Begin jaar
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Begonnen in"]
    }));
    optie.append(maak_element('input', {
        name: 'begin_jaar',
        type: 'number',
        min: 1901,
        max: 2155,
        placeholder: '2020',
        value: studie ? studie.begin_jaar : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    form.append(optie);

    row = maak_element('div', {class: ['w3-row']});
    // Standaard
    sec = maak_element('div', {class: ['w3-half', 'third-left']});
    optie = maak_element('p', {style: {margin: 0}});
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Standaard: "]
    }));
    optie.append(maak_element('input', {
        name: 'standaard',
        type: 'checkbox',
        checked: studie ? studie.standaard : false,
        disabled: studie ? studie.standaard : false,
        class: ['w3-check']
    }));
    sec.append(optie);
    row.append(sec);

    // Gehaald
    sec = maak_element('div', {class: ['w3-half', 'third-right']});
    optie = maak_element('p', {style: {margin: 0}});
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Gehaald: "]
    }));
    optie.append(maak_element('input', {
        name: 'gehaald',
        type: 'checkbox',
        checked: studie ? studie.gehaald : false,
        class: ['w3-check']
    }));
    sec.append(optie);
    row.append(sec);

    form.append(row);

    // Optionele onderdelen
    form.append(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: ["Optioneel"]
    }));

    row = maak_element('div', {class: ['w3-row']});
    // Eind jaar
    sec = maak_element('div', {class: ['w3-half', 'third-left']});
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Gestopt in"]
    }));
    optie.append(maak_element('input', {
        name: 'eind_jaar',
        type: 'number',
        min: 1901,
        max: 2155,
        placeholder: '2022',
        value: studie ? studie.eind_jaar : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.append(optie);
    row.append(sec);

    // BSA
    sec = maak_element('div', {class: ['w3-half', 'third-right']});
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["BSA"]
    }));
    optie.append(maak_element('input', {
        name: 'bsa',
        type: 'number',
        min: 0,
        placeholder: '42',
        value: studie ? studie.bsa : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.append(optie);
    row.append(sec);

    form.append(row);

    if (bewerk) {
        row = maak_element('div', {class: ['w3-row']});
        sec = maak_element('div', {class: ['w3-half', 'third-left']});
    }
    // Submit
    optie = maak_element('p');
    optie.append(maak_element('input', {
        type: 'submit',
        value: `${bewerk ? "Wijzig" : "Upload"} \xa0 ❯`,
        class: ['w3-btn', 'w3-padding', 'w3-teal'],
        style: {width: '120px'}
    }));

    if (bewerk) {
        sec.append(optie);
        row.append(sec);

        // Verwijder
        sec = maak_element('div', {class: ['w3-half', 'third-right']});
        optie = maak_element('p');
        let button = maak_element('button', {
            type: 'button',
            class: ['w3-btn', 'w3-padding', 'w3-red'],
            style: {width: '120px'},
            children: ["Verwijder \xa0 ❯"]
        });
        button.addEventListener('click', function () {
            verwijder_studie(form)
        });
        optie.append(button);
        sec.append(optie);
        row.append(sec);

        form.append(row);
    } else {
        form.append(optie);
    }

    div.append(form);
    return div;
}

function create_studie_upload_vak() {
    let popup = document.getElementById('upload-studie-popup');
    let div = document.createElement('div');
    div.append(create_studie_vak(false));
    toonPopup(popup, div);
}

function create_studie_bewerk_vak() {
    let div = document.getElementById('studievak');
    clear_element(div);
    div.append(create_studie_vak(true, huidige_studie));
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
        errorvak.append(createPanel(panelTypesEnum.error, "Cijfertitel is verplicht.", false));
        error = true;
    }

    if (isNaN(vaknummer) || vaknummer < 0) {
        errorvak.append(createPanel(panelTypesEnum.error, "Vak is verplicht.", false));
        error = true;
    }

    if (isNaN(weging) || weging < 0) {
        errorvak.append(createPanel(panelTypesEnum.error, "Weging is ongeldig.", false));
        error = true;
    }

    try {
        if (datum !== null) {
            parse_date(datum);
        }
    } catch {
        errorvak.append(createPanel(panelTypesEnum.error, `Datum niet in yyyy-mm-dd format (${datum}).`, false));
        error = true;
    }

    if (isNaN(cijfer) || cijfer < 0) {
        errorvak.append(createPanel(panelTypesEnum.error, "Cijfer is ongeldig.", false));
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
        errorvak.append(createPanel(panelTypesEnum.error, "Vak bestaat niet.", false));
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
            form.append(maak_element('p', {children: ["Cijfer geüpload!"]}));
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
            form.append(maak_element('p', {children: ["Cijfer geüpload!"]}));
            form.dataset.uploaded = "true";
        }
    }

    for (let div of divs) {
        let form = div.querySelector("form");
        if (!form.dataset.uploaded) {
            if (!form.reportValidity()) {
                return;
            }

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
        children: ["Kies je vak"]
    }));
    for (let vak of vakken) {
        selecties.push(maak_element('option', {
            value: vak.vaknummer,
            selected: geselecteerd === vak.vaknummer,
            children: [vak.naam]
        }))
    }
    return selecties;
}

function create_cijfer_vak(i, bewerk = false, cijfer = null) {
    let optie;
    let div = maak_element('div', {id: `${bewerk ? 'wijzig' : 'upload'}-cijfervak-${i}`, class: [`${bewerk ? 'wijzig' : 'upload'}-cijfervak`]});
    div.append(maak_element('div', {
        class: ['w3-container', 'w3-teal'],
        children: [maak_element('h3', {
            children: [cijfer === null ? `Cijfer ${i + 1}` :
                `${cijfer.cijfernummer}. ${cijfer.naam} - ${cijfer.vak.naam}`]
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
    form.append(maak_element('div', {class: ['errorvak']}));

    // Verplichte onderdelen
    form.append(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: ["Verplicht"]
    }));

    // Cijfernummer
    if (cijfer) {
        form.append(maak_element('input', {
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
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Titel"]
    }));
    optie.append(maak_element('input', {
        name: 'titel',
        type: 'text',
        placeholder: 'eindtentamen',
        value: cijfer ? cijfer.naam : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    form.append(optie);

    // Vak
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Vak"]
    }));
    let select = maak_element('select', {
        class: ['w3-select', 'vak-select'],
        name: 'vaknummer', required: true
    });
    let options = create_vak_selectie(cijfer ? cijfer.vak.vaknummer : null);
    for (let option of options) {
        select.append(option);
    }
    optie.append(select);
    form.append(optie);

    // Optionele onderdelen
    form.append(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: ["Optioneel"]
    }));

    let row = maak_element('div', {class: ['w3-row']});

    // Weging
    let sec = maak_element('div', {class: ['w3-third', 'third-left']});
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Weging (in %)"]
    }));
    optie.append(maak_element('input', {
        name: 'weging',
        type: 'number',
        placeholder: 42.0,
        min: 0,
        step: 0.01,
        value: cijfer && cijfer.weging ? cijfer.weging : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.append(optie);
    row.append(sec);

    // Datum
    sec = maak_element('div', {class: ['w3-third', 'third-mid']});
    optie = maak_element('p');
    optie.append(maak_element('label', {class: ['w3-text-grey'], children: ["Datum"]}));
    optie.append(maak_element('input', {
        name: 'datum',
        type: 'date',
        placeholder: 'yyyy-mm-dd',
        value: cijfer && cijfer.datum ? format_date(cijfer.datum) : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.append(optie);
    row.append(sec);

    // Cijfer
    sec = maak_element('div', {class: ['w3-third', 'third-right']});
    optie = maak_element('p');
    optie.append(maak_element('label', {class: ['w3-text-grey'], children: ["Cijfer"]}));
    optie.append(maak_element('input', {
        name: 'cijfer',
        type: 'number',
        placeholder: 6.66,
        min: 0,
        step: 0.01,
        value: cijfer && cijfer.cijfer ? cijfer.cijfer : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.append(optie);
    row.append(sec);

    form.append(row);

    // Submit
    optie = maak_element('p');
    optie.append(maak_element('input', {
        type: 'submit',
        value: `${bewerk ? "Wijzig" : "Upload"} \xa0 ❯`,
        class: ['w3-btn', 'w3-padding', 'w3-teal'],
        style: {width: '120px'}
    }));
    form.append(optie);

    div.append(form);
    return div;
}

function create_cijfer_upload_vakken(aantal) {
    let div = document.getElementById('cijfervakken');
    clear_element(div);
    for (let i = 0; i < aantal; ++i) {
        div.append(create_cijfer_vak(i, false, null));
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
        div.append(create_cijfer_vak(i, true, cijferMapping[cijfer]));
    }

    div.append(maak_element('div', {id: 'cijferwijzigerror'}));
    let button = maak_element('button', {type: 'button', class: ['w3-btn', 'w3-padding', 'w3-teal', 'upload-button'], children: ["Wijzig alle \xa0 ❯"]});
    button.addEventListener('click', wijzig_alle_cijfers);
    div.append(button);

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

    let url_extension = '';
    if (!huidige_studie.standaard) {
        url_extension += `?studie=${huidige_studie.studienummer}`;
    }

    text += `Bekijk cijfers:${(serverinfo.intern ? `\nExtern:\t\t\t${serverinfo.domein}${url_extension}\nIntern:\t\t\t${serverinfo.interndomein}${url_extension}` : `\t${serverinfo.domein}${url_extension}`)}\nWachtwoord:\t${serverinfo.wachtwoord}`;

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
            document.body.append(tekstVak);
            tekstVak.select();
            document.execCommand('copy');
            document.body.removeChild(tekstVak);
        }
        info.append(createPanel(panelTypesEnum.info, "Cijfers succesvol gekopieerd!", false));
    } catch (e) {
        info.append(createPanel(panelTypesEnum.error, `Kon cijfers niet kopiëren: ${e}.`, false));
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
                div.append(p);
            }
        }

        if (succes) {
            errorvak.append(createPanel(panelTypesEnum.info, "Cijfers succesvol verwijderd!", false));
        } else {
            errorvak.append(createPanel(panelTypesEnum.error, div, false));
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
    const periode_start_val = form.querySelector("input[name='periode-start']").value
    const periode_start = periode_start_val === '' ? null : parseInt(periode_start_val);
    const periode_end_val = form.querySelector("input[name='periode-end']").value
    const periode_end = periode_end_val === '' ? null : parseInt(periode_end_val);
    const eindcijfer_val = form.querySelector("input[name='eindcijfer']").value
    const eindcijfer = eindcijfer_val === '' ? null : parseFloat(eindcijfer_val);
    let errorvak = form.querySelector("div.errorvak");
    let error = false;
    clear_element(errorvak);

    if (titel === '') {
        errorvak.append(createPanel(panelTypesEnum.error, "Cijfertitel is verplicht.", false));
        error = true;
    }

    if (isNaN(jaar) || jaar < 0) {
        errorvak.append(createPanel(panelTypesEnum.error, "Jaar is verplicht.", false));
        error = true;
    }

    if (isNaN(studiepunten) || studiepunten < 0) {
        errorvak.append(createPanel(panelTypesEnum.error, "Studiepunten zijn verplicht.", false));
        error = true;
    }

    if (isNaN(periode_start) || periode_start < 0) {
        errorvak.append(createPanel(panelTypesEnum.error, "Begin periode is ongeldig.", false));
        error = true;
    }

    if (isNaN(periode_end) || periode_end < 0) {
        errorvak.append(createPanel(panelTypesEnum.error, "Eind periode is ongeldig.", false));
        error = true;
    }

    if (isNaN(eindcijfer) || eindcijfer < 0) {
        errorvak.append(createPanel(panelTypesEnum.error, "Eindcijer is ongeldig.", false));
        error = true;
    }

    if (!isNaN(periode_start) && !isNaN(periode_end)) {
        if (periode_start === null) {
            if (periode_end !== null) {
                errorvak.append(createPanel(panelTypesEnum.error, "Alleen eind periode opgegeven.", false));
                error = true;
            }
        } else {
            if (periode_end === null) {
                errorvak.append(createPanel(panelTypesEnum.error, "Alleen begin periode opgegeven.", false));
                error = true;
            }

            if (periode_start > periode_end) {
                errorvak.append(createPanel(panelTypesEnum.error, "De eind periode moet na de begin periode zijn.", false));
                error = true;
            }
        }
    }

    if (error) {
        return null;
    }

    return Vak.from_json({
        vaknummer: vaknummer,
        studienummer: huidige_studie.studienummer,
        naam: titel,
        jaar: jaar,
        studiepunten: studiepunten,
        gehaald: gehaald,
        toon: toon,
        periode: periode_start === null ? null : {start: periode_start, end: periode_end},
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
            form.append(maak_element('p', {children: ["Vak geüpload!"]}));
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
            form.append(maak_element('p', {children: ["Vak geüpload!"]}));
            form.dataset.uploaded = "true";
        }
    }

    for (let div of divs) {
        let form = div.querySelector("form");
        if (!form.dataset.uploaded) {
            if (!form.reportValidity()) {
                return;
            }

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
    div.append(maak_element('div', {
        class: ['w3-container', 'w3-teal'],
        children: [maak_element('h3', {
            children: [vak === null ? `Vak ${i + 1}` :
                `${vak.vaknummer}. ${vak.naam}`]
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
    form.append(maak_element('div', {class: ['errorvak']}));

    // Verplichte onderdelen
    form.append(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: ["Verplicht"]
    }));

    // Vaknummer
    if (vak) {
        form.append(maak_element('input', {
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
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Titel"]
    }));
    optie.append(maak_element('input', {
        name: 'titel',
        type: 'text',
        placeholder: 'Inleiding studie',
        value: vak ? vak.naam : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    form.append(optie);

    row = maak_element('div', {class: ['w3-row']});
    // Jaar
    sec = maak_element('div', {class: ['w3-half', 'third-left']});
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Jaar"]
    }));
    optie.append(maak_element('input', {
        name: 'jaar',
        type: 'number',
        min: 1,
        step: 1,
        placeholder: '1',
        value: vak ? vak.jaar : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    sec.append(optie);
    row.append(sec);

    // Studiepunten
    sec = maak_element('div', {class: ['w3-half', 'third-right']});
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Studiepunten"]
    }));
    optie.append(maak_element('input', {
        name: 'studiepunten',
        type: 'number',
        min: 0,
        step: 1,
        placeholder: '6',
        value: vak ? vak.studiepunten : '',
        required: true,
        class: ['w3-input', 'w3-border']
    }));
    sec.append(optie);
    row.append(sec);

    form.append(row);

    row = maak_element('div', {class: ['w3-row']});
    // Gehaald
    sec = maak_element('div', {class: ['w3-half', 'third-left']});
    optie = maak_element('p', {style: {margin: 0}});
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Gehaald: "]
    }));
    optie.append(maak_element('input', {
        name: 'gehaald',
        type: 'checkbox',
        checked: vak ? vak.gehaald : false,
        class: ['w3-check']
    }));
    sec.append(optie);
    row.append(sec);

    // Toon
    sec = maak_element('div', {class: ['w3-half', 'third-right']});
    optie = maak_element('p', {style: {margin: 0}});
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Toon: "]
    }));
    optie.append(maak_element('input', {
        name: 'toon',
        type: 'checkbox',
        checked: vak ? vak.toon : true,
        class: ['w3-check']
    }));
    sec.append(optie);
    row.append(sec);

    form.append(row);

    // Optionele onderdelen
    form.append(maak_element('h4', {
        style: {'margin-bottom': 0},
        children: ["Optioneel"]
    }));

    row = maak_element('div', {class: ['w3-row']});
    // Periode
    sec = maak_element('div', {class: gemiddelde ? ['w3-third', 'third-left'] : ['w3-half', 'third-left']});
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Periode"]
    }));

    let flex = maak_element('div', {
        style: {display: 'flex', justifyContent: 'space-between'}
    });

    let periode_start = maak_element('input', {
        name: 'periode-start',
        type: 'number',
        min: 0,
        step: 1,
        placeholder: '1',
        value: (vak && vak.periode) ? vak.periode.start : '',
        class: ['w3-input', 'w3-border'],
        style: {width: 'calc(50% - 15px)'}
    });

    let periode_end = maak_element('input', {
        name: 'periode-end',
        type: 'number',
        min: 0,
        step: 1,
        placeholder: '1',
        value: (vak && vak.periode) ? vak.periode.end : '',
        class: ['w3-input', 'w3-border'],
        style: {width: 'calc(50% - 15px)'}
    });

    function update_periode_end() {
        let start = periode_start.value === '' ? null : parseInt(periode_start.value);
        let end = periode_end.value === '' ? null : parseInt(periode_end.value);

        if (start === null) {
            periode_end.value = '';
            periode_end.min = 0;
            periode_end.required = false;
        } else {
            periode_end.min = start;
            periode_end.required = true;
            if (end === null || start > end) {
                periode_end.value = start;
            }
        }
    }

    periode_start.addEventListener('input', update_periode_end);

    flex.append(periode_start);
    flex.append(maak_element('span', {
        style: {maxWidth: '20px', margin: 'auto 0'},
        children: ["–"]
    }))
    flex.append(periode_end);
    optie.append(flex);
    sec.append(optie);
    row.append(sec);

    // Eindcijfer
    sec = maak_element('div', {class: gemiddelde ? ['w3-third', 'third-mid'] : ['w3-half', 'third-right']});
    optie = maak_element('p');
    optie.append(maak_element('label', {
        class: ['w3-text-grey'],
        children: ["Eindcijfer"]
    }));
    optie.append(maak_element('input', {
        name: 'eindcijfer',
        type: 'number',
        min: 0,
        step: 0.01,
        placeholder: '6.66',
        value: vak ? vak.eindcijfer : '',
        class: ['w3-input', 'w3-border']
    }));
    sec.append(optie);
    row.append(sec);

    if (gemiddelde) {
        // Gemiddelde cijfer
        sec = maak_element('div', {class: ['w3-third', 'third-right']});
        optie = maak_element('p');
        optie.append(maak_element('label', {
            class: ['w3-text-grey'],
            style: {fontStyle: 'italic'},
            children: ["Berekend gemiddelde"]
        }));
        optie.append(maak_element('input', {
            name: 'gemiddelde',
            type: 'number',
            min: 0,
            step: 0.01,
            value: vak.gemiddelde,
            disabled: true,
            class: ['w3-input', 'w3-border'],
            style: {fontStyle: 'italic'}
        }));
        sec.append(optie);
        row.append(sec);
    }

    form.append(row);

    // Submit
    optie = maak_element('p');
    optie.append(maak_element('input', {
        type: 'submit',
        value: `${bewerk ? "Wijzig" : "Upload"} \xa0 ❯`,
        class: ['w3-btn', 'w3-padding', 'w3-teal'],
        style: {width: '120px'}
    }));
    form.append(optie);

    div.append(form);
    return div;
}

function create_vak_upload_vakken(aantal) {
    let div = document.getElementById('vakvakken');
    clear_element(div);
    for (let i = 0; i < aantal; ++i) {
        div.append(create_vak_vak(i, false, null));
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
        div.append(create_vak_vak(i, true, vakMapping[vak]));
    }

    div.append(maak_element('div', {id: 'vakwijzigerror'}));
    let button = maak_element('button', {type: 'button', class: ['w3-btn', 'w3-padding', 'w3-teal', 'upload-button'], children: ["Wijzig alle \xa0 ❯"]});
    button.addEventListener('click', wijzig_alle_vakken);
    div.append(button);

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
                div.append(p);
            }
        }

        if (succes) {
            errorvak.append(createPanel(panelTypesEnum.info, "Vakken succesvol verwijderd!", false));
        } else {
            errorvak.append(createPanel(panelTypesEnum.error, div, false));
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

get_huidige_studie();
laad_studies();
window.laad_studies = laad_studies;
window.laad_cijfers = laad_cijfers;
refresh_interval = setInterval(laad_studies, 60000);

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

window.onpopstate = function(event) {
    huidige_studie = null;
    get_huidige_studie(event.state);
    studies_hash = null;
    verbergPopups();
    studie_wijzig_vak_created = false;
    laad_studies();
}
