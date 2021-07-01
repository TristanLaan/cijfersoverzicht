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

import {verbergPopups} from "./popup.mjs";

const panelTypesEnum = Object.freeze({error: 0, warning: 1, info: 2});
const typeNames = Object.freeze({[panelTypesEnum.error]: 'Error', [panelTypesEnum.warning]: 'Waarschuwing', [panelTypesEnum.info]: 'Melding'});
const typeColors = Object.freeze({[panelTypesEnum.error]: 'w3-red', [panelTypesEnum.warning]: 'w3-amber', [panelTypesEnum.info]: 'w3-light-gray'});

function createPanel(type, melding, popup) {
    let div = document.createElement('div');
    div.classList.add("w3-panel", typeColors[type], "w3-display-container");
    let span = document.createElement('span');
    span.addEventListener("click", popup ? verbergPopups : () => {div.style.display = 'none'; });
    span.classList.add("w3-button", "w3-large", "w3-display-topright");
    span.appendChild(document.createTextNode("×"));
    div.appendChild(span);
    let h3 = document.createElement('h3');
    h3.appendChild(document.createTextNode(typeNames[type]));
    div.appendChild(h3);
    let p = document.createElement('p');
    if (melding instanceof HTMLElement) {
        p.appendChild(melding);
    } else {
        p.innerHTML = melding;
    }
    div.appendChild(p);

    return div;
}

export {createPanel, panelTypesEnum};
