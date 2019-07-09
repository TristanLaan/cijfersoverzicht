<?php
/**
 * Copyright (c) Tristan Laan 2019.
 * This file is part of cijfersoverzicht.
 * cijfersoverzicht is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or any later
 * version.
 *
 * cijfersoverzicht is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with cijfersoverzicht.  If not, see <https://www.gnu.org/licenses/>
 */

/**
 * @param bool $sticky
 */
function footer(bool $sticky = false) { ?>
    <?php if (!$sticky) { ?>
        <hr><?php } ?>
    <footer <?php if ($sticky) { ?>style="position: fixed; bottom: 0; right: 0;" <?php } ?>>
        <div style="float: right">
            <a href="LICENSE" style="margin: 0 5px; color: #0645AD">Licence</a>
            <a href="https://github.com/TristanLaan/cijfersoverzicht" style="margin: 0 5px; color: #0645AD">Source</a>
            <p style="display: inline; margin: 0 5px;">&copy;Tristan Laan 2018-<?php
                try {
                    $datum = new DateTime();
                    echo $datum->format("Y");
                } catch (Exception $e) {
                    error_log($e->getMessage());
                    echo "2019";
                } ?></p>
        </div>
    </footer>
<?php } ?>
