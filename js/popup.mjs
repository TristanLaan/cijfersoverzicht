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

import {clear_element} from "./common.mjs";

function verbergPopups() {
    let popups = document.getElementsByClassName("popup");

    for (let popup of popups) {
        popup.style.display = "none";
    }
}

function toonPopup(popup, content) {
    let background = document.getElementById("popup");
    verbergPopups();

    clear_element(popup);
    popup.appendChild(content);

    popup.style.display = "block";
    background.style.display = "block";
}

window.onload = function () {
    /* Sluit popup als er naast geklikt wordt */
    document.onclick = function (e) {
        if (e.target.id === 'popup') {
            verbergPopups();
        }
    };
};

export {verbergPopups, toonPopup};
