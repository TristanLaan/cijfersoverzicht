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

async function generate_hash(message) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    if (crypto.subtle) {
        return await crypto.subtle.digest('SHA-256', data);
    } else {
        return data;
    }
}

function compare_hashes(a, b) {
    if (a === null || b === null) {
        return false;
    }

    if (a.byteLength !== b.byteLength) {
        return false;
    }

    a = new Uint8Array(a, 0);
    b = new Uint8Array(b, 0);

    for (let i = 0; i < a.byteLength; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
}

export {generate_hash, compare_hashes};
