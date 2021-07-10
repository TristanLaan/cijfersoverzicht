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

let vakMapping = {};

function format_date(date) {
    let y = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date);
    let m = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date);
    let d = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date);
    return `${y}-${m}-${d}`;
}

class Error {
    value;
    message;
    reload_required;
    constructor(value, message, reload_required=false) {
        this.value = value;

        if (this.value) {
            this.message = `${message} (E${this.format_error_value()})`;
        } else {
            this.message = message;
        }

        this.reload_required = reload_required;
    }

    format_error_value() {
        if (this.value < 0) {
            return `-${(-this.value).toString().padStart(2, '0')}`;
        }

        return this.value.toString().padStart(2, '0');
    }
}

class Periode {
    start;
    end;

    constructor(start, end) {
        this.start = start;
        this.end = end;
    }

    to_json() {
        return {start: this.start, end: this.end};
    }

    static from_json(json) {
        return new this(json.start, json.end);
    }
}

class Vak {
    vaknummer;
    naam;
    jaar;
    periode;
    studiepunten;
    gehaald;
    eindcijfer;
    toon;
    gemiddelde;
    totaal;
    cijfers;

    constructor(vaknummer, naam, jaar, periode, studiepunten, gehaald, eindcijfer, toon, gemiddelde=null, totaal=null, cijfers=[]) {
        this.vaknummer = vaknummer;
        this.naam = naam;
        this.jaar = jaar;
        this.periode = periode;
        this.studiepunten = studiepunten;
        this.gehaald = gehaald;
        this.eindcijfer = eindcijfer;
        this.toon = toon;
        this.gemiddelde = gemiddelde;
        this.totaal = totaal;
        this.cijfers = cijfers;
    }

    to_json() {
        if (this.vaknummer === null) {
            return {naam: this.naam, jaar: this.jaar, periode: this.periode === null ? null : this.periode.to_json(), studiepunten: this.studiepunten, gehaald: this.gehaald, toon: this.toon, eindcijfer: this.eindcijfer};
        }
        return {vaknummer: this.vaknummer, naam: this.naam, jaar: this.jaar, periode: null ? null : this.periode.to_json(), studiepunten: this.studiepunten, gehaald: this.gehaald, toon: this.toon, eindcijfer: this.eindcijfer};
    }

    static from_json(json, gemiddelde=null, totaal=null, cijfers=[]) {
        return new this(json.vaknummer, json.naam, json.jaar, json.periode === null ? null : Periode.from_json(json.periode), json.studiepunten, json.gehaald, json.eindcijfer, json.toon, gemiddelde, totaal, cijfers);
    }

    static update_vakken(vakken, general_error_function, handle_vak_function, finished_function=null) {
        let data = [];
        for (let vak of vakken) {
            data.push(vak.to_json());
        }

        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let output;
                    try {
                        output = JSON.parse(this.responseText);
                    } catch (SyntaxError) {
                        console.debug('JSON response: ' + this.responseText);
                        general_error_function(new Error(null, "Er is een onbekende fout opgetreden bij het updaten van de vakken. (JSON parsing)"));
                        return;
                    }

                    if (output.returnwaarde !== 0) {
                        general_error_function(new Error(null, "Er is een onbekende fout opgetreden tijdens het updaten van de vakken, probeer het later opnieuw."));
                    } else {
                        for (const [i, vak_update] of output.object.entries()) {
                            let error = null;
                            switch (vak_update.returnwaarde) {
                                case 0:
                                    break;
                                case -1:
                                    error = new Error(vak_update.returnwaarde, `Je bent niet ingelogd! Klik <a href="admin.php" target="_blank">hier</a> om opnieuw in te loggen, en probeer het dan opnieuw.`, true);
                                    break;
                                case -3:
                                    error = new Error(vak_update.returnwaarde, "De naam van het vak is niet opgegeven.");
                                    break;
                                case -4:
                                    error = new Error(vak_update.returnwaarde, "Het jaar van het vak is geen geldig getal.");
                                    break;
                                case -5:
                                    error = new Error(vak_update.returnwaarde, "De hoeveelheid studiepunten van het vak is geen geldig getal.");
                                    break;
                                case -6:
                                    error = new Error(vak_update.returnwaarde, "De periode van het vak is geen geldig getal.");
                                    break;
                                case -7:
                                    error = new Error(vak_update.returnwaarde, "Het eindcijfer van het vak is geen geldig getal.");
                                    break;
                                default:
                                    error = new Error(vak_update.returnwaarde, "Er is een onbekende fout opgetreden tijdens het updaten van het vak, probeer het later opnieuw.");
                                    break;
                            }

                            handle_vak_function(i, vak_update.object, error);
                        }

                        if (finished_function) {
                            finished_function();
                        }
                    }
                } else {
                    general_error_function(new Error(null, "Er is een onbekende fout opgetreden tijdens het updaten van de vakken, probeer het later opnieuw."));
                }
            }
        }

        xhttp.open("POST", "update_vakken.php", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify(data));
    }

    static verwijder_vakken(vakken, general_error_function, handle_vak_function) {
        let data = [];
        for (let vak of vakken) {
            data.push({vaknummer: vak.vaknummer});
        }

        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let output;
                    try {
                        output = JSON.parse(this.responseText);
                    } catch (SyntaxError) {
                        console.debug('JSON response: ' + this.responseText);
                        general_error_function(new Error(null, "Er is een onbekende fout opgetreden bij het verwijderen van de vakken. (JSON parsing)"));
                        return;
                    }

                    if (output.returnwaarde !== 0) {
                        general_error_function(new Error(null, "Er is een onbekende fout opgetreden tijdens het verwijderen van de vakken, probeer het later opnieuw."));
                    } else {
                        let results = [];
                        for (const [i, cijfer_update] of output.object.entries()) {
                            let error = null;
                            switch (cijfer_update.returnwaarde) {
                                case 0:
                                    break;
                                case -1:
                                    error = new Error(cijfer_update.returnwaarde, `Je bent niet ingelogd! Klik <a href="admin.php" target="_blank">hier</a> om opnieuw in te loggen, en probeer het dan opnieuw.`, true);
                                    break;
                                case -3:
                                    error = new Error(cijfer_update.returnwaarde, "Het opgegeven vak bestaat niet.");
                                    break;
                                default:
                                    error = new Error(cijfer_update.returnwaarde, "Er is een onbekende fout opgetreden tijdens het verwijderen van het vak, probeer het later opnieuw.");
                                    break;
                            }

                            results.push({i: i, error: error});
                        }

                        handle_vak_function(results);
                    }
                } else {
                    general_error_function(new Error(null, "Er is een onbekende fout opgetreden tijdens het verwijderen van de vakken, probeer het later opnieuw."));
                }
            }
        }

        xhttp.open("POST", "verwijder_vakken.php", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify(data));
    }


}

function parse_date(date) {
    const split = date.split('-');
    // Month is zero-indexed in js.
    return new Date(split[0], split[1] - 1, split[2]);
}

class Cijfer {
    cijfernummer;
    vak;
    naam;
    datum;
    cijfer;

    constructor(cijfernummer, vak, naam, weging, datum, cijfer) {
        this.cijfernummer = cijfernummer;
        if (!(vak instanceof Vak)) {
            throw TypeError;
        }
        this.vak = vak;
        this.naam = naam;
        this.weging = weging;
        this.datum = datum;
        this.cijfer = cijfer;
    }

    to_json() {
        if (this.cijfernummer === null) {
            return {vaknummer: this.vak.vaknummer, naam: this.naam, weging: this.weging, datum: this.datum ? format_date(this.datum) : null, cijfer: this.cijfer};
        }
        return {cijfernummer: this.cijfernummer, vaknummer: this.vak.vaknummer, naam: this.naam, weging: this.weging, datum: this.datum ? format_date(this.datum) : null, cijfer: this.cijfer};
    }

    static from_json(json) {
        return new this(json.cijfernummer, vakMapping[json.vaknummer], json.naam, json.weging, json.datum ? parse_date(json.datum) : null, json.cijfer);
    }

    static update_cijfers(cijfers, general_error_function, handle_cijfer_function, finished_function=null) {
        let data = [];
        for (let cijfer of cijfers) {
            data.push(cijfer.to_json());
        }

        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let output;
                    try {
                        output = JSON.parse(this.responseText);
                    } catch (SyntaxError) {
                        console.debug('JSON response: ' + this.responseText);
                        general_error_function(new Error(null, "Er is een onbekende fout opgetreden bij het updaten van de cijfers. (JSON parsing)"));
                        return;
                    }

                    if (output.returnwaarde !== 0) {
                        general_error_function(new Error(null, "Er is een onbekende fout opgetreden tijdens het updaten van de cijfers, probeer het later opnieuw."));
                    } else {
                        for (const [i, cijfer_update] of output.object.entries()) {
                            let error = null;
                            switch (cijfer_update.returnwaarde) {
                                case 0:
                                    break;
                                case -1:
                                    error = new Error(cijfer_update.returnwaarde, `Je bent niet ingelogd! Klik <a href="admin.php" target="_blank">hier</a> om opnieuw in te loggen, en probeer het dan opnieuw.`, true);
                                    break;
                                case -3:
                                case -7:
                                    error = new Error(cijfer_update.returnwaarde, "Het opgegeven vak bestaat niet.");
                                    break;
                                case -4:
                                    error = new Error(cijfer_update.returnwaarde, "De naam van het cijfer is niet opgegeven.");
                                    break;
                                case -8:
                                    error = new Error(cijfer_update.returnwaarde, "De weging van het cijfer is geen getal.");
                                    break;
                                case -5:
                                    error = new Error(cijfer_update.returnwaarde, "De datum van het cijfer is niet doorgegeven in het correct format.");
                                    break;
                                case -6:
                                    error = new Error(cijfer_update.returnwaarde, "De waarde van het cijfer is niet opgegeven of geen getal.");
                                    break;
                                default:
                                    error = new Error(cijfer_update.returnwaarde, "Er is een onbekende fout opgetreden tijdens het updaten van het cijfer, probeer het later opnieuw.");
                                    break;
                            }

                            handle_cijfer_function(i, cijfer_update.object, error);
                        }

                        if (finished_function) {
                            finished_function();
                        }
                    }
                } else {
                    general_error_function(new Error(null, "Er is een onbekende fout opgetreden tijdens het updaten van de cijfers, probeer het later opnieuw."));
                }
            }
        }

        xhttp.open("POST", "update_cijfers.php", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify(data));
    }

    static verwijder_cijfers(cijfers, general_error_function, handle_cijfer_function) {
        let data = [];
        for (let cijfer of cijfers) {
            data.push({cijfernummer: cijfer.cijfernummer});
        }

        const xhttp = new XMLHttpRequest();

        xhttp.onreadystatechange = function () {
            if (this.readyState === 4) {
                if (this.status === 200) {
                    let output;
                    try {
                        output = JSON.parse(this.responseText);
                    } catch (SyntaxError) {
                        console.debug('JSON response: ' + this.responseText);
                        general_error_function(new Error(null, "Er is een onbekende fout opgetreden bij het verwijderen van de cijfers. (JSON parsing)"));
                        return;
                    }

                    if (output.returnwaarde !== 0) {
                        general_error_function(new Error(null, "Er is een onbekende fout opgetreden tijdens het verwijderen van de cijfers, probeer het later opnieuw."));
                    } else {
                        let results = [];
                        for (const [i, cijfer_update] of output.object.entries()) {
                            let error = null;
                            switch (cijfer_update.returnwaarde) {
                                case 0:
                                    break;
                                case -1:
                                    error = new Error(cijfer_update.returnwaarde, `Je bent niet ingelogd! Klik <a href="admin.php" target="_blank">hier</a> om opnieuw in te loggen, en probeer het dan opnieuw.`, true);
                                    break;
                                case -3:
                                    error = new Error(cijfer_update.returnwaarde, "Het opgegeven cijfer bestaat niet.");
                                    break;
                                default:
                                    error = new Error(cijfer_update.returnwaarde, "Er is een onbekende fout opgetreden tijdens het verwijderen van het cijfer, probeer het later opnieuw.");
                                    break;
                            }

                            results.push({i: i, error: error});
                        }

                        handle_cijfer_function(results);
                    }
                } else {
                    general_error_function(new Error(null, "Er is een onbekende fout opgetreden tijdens het verwijderen van de cijfers, probeer het later opnieuw."));
                }
            }
        }

        xhttp.open("POST", "verwijder_cijfers.php", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify(data));
    }
}

function parse_get_all_cijfers(response) {
    vakMapping = {};
    let json;
    try {
        json = JSON.parse(response);
    } catch (SyntaxError) {
        console.debug('JSON response: ' + response);
        return {error: new Error(null, "Er is een onbekende fout opgetreden bij het ophalen van de cijfers. (JSON parsing)")};
    }

    switch (json.returnwaarde) {
        case 0:
            break;
        case -1:
            return {error: new Error(-1, "Je bent niet ingelogd! Refresh de pagina.", true)};
        default:
            return {error: new Error(json.returnwaarde, "Er is een onbekende fout opgetreden bij het ophalen van de cijfers.")};
    }

    let vakken = [];
    if (json.object) {
        for (let cijfergroep of json.object) {
            let vak = Vak.from_json(cijfergroep.vak, cijfergroep.gemiddelde, cijfergroep.totaal, []);
            vakMapping[vak.vaknummer] = vak;

            if (cijfergroep.cijfers) {
                for (let cijfer of cijfergroep.cijfers) {
                    vak.cijfers.push(Cijfer.from_json(cijfer));
                }
            }

            vakken.push(vak);
        }
    }

    return {error: null, vakken: vakken};
}

function get_cijfers(handle_cijfers) {
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = handle_cijfers;
    xhttp.open("GET", "get_cijfers.php", true);
    xhttp.send();
}

export {vakMapping, Periode, Vak, Cijfer, Error, parse_get_all_cijfers, get_cijfers, parse_date, format_date};
