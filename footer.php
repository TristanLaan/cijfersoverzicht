<?php
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

/**
 * @param bool $sticky
 * @param bool $admin
 */
function footer(bool $sticky = false, bool $admin = false) { ?>
    <footer style=" width: 100%; <?php if ($sticky) { ?>position: fixed; bottom: 0; right: 0; <?php } ?>">
        <?php
        if (!$sticky) {
            ?><hr><?php
        } ?>
        <div style="float: right; margin-bottom: 5px;">
            <?php if ($admin) {
                ?><a href="./" class="spacing url">Cijfersoverzicht</a><?php
            } else {
                ?><a href="admin.php" class="spacing url">Admin</a><?php
            }?>
            <a href="license.html" class="spacing url">Licence</a>
            <a href="https://github.com/TristanLaan/cijfersoverzicht" class="spacing url">Source</a>
            <p class="inline spacing">&copy;Tristan Laan 2018-<?php
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
