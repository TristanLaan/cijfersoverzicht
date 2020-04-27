#!/usr/bin/env python3
#  Copyright (c) Tristan Laan 2018-2020.
#  This file is part of cijfersoverzicht.
#  cijfersoverzicht is free software: you can redistribute it and/or modify
#  it under the terms of the GNU Affero General Public License as published
#  by the Free Software Foundation, either version 3 of the License, or
#  (at your option) any later version.
#
#  cijfersoverzicht is distributed in the hope that it will be useful,
#  but WITHOUT ANY WARRANTY; without even the implied warranty of
#  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
#  GNU Affero General Public License for more details.
#
#  You should have received a copy of the GNU Affero General Public License
#  along with cijfersoverzicht.  If not, see <https://www.gnu.org/licenses/>
#
#  Dit script wordt uitgevoerd als op de vernieuw knop wordt gedrukt. Je kan
#  ook een cron job instellen die dit script uitvoert, let dan op dat de user
#  root is of in de group `credentials.gid` zit en de pwd op de root map van
#  cijfersoverzicht staat.

import datetime
from typing import Tuple, List
import matplotlib

# Backend display driver has to be changed before pyplot is imported, because
# the script will be executed by a script that has no access to the display
matplotlib.use('Agg')
from matplotlib.dates import date2num
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import pymysql
import pymysql.cursors
import os
import stat
import tempfile
import glob


class Config:
    def __init__(self, password: str, server: str, username: str,
                 database: str, charset: str, image_path: str,
                 image_name: str, title: str):
        self.password = password
        self.server = server
        self.username = username
        self.database = database
        self.charset = charset
        self.image_path = image_path
        self.image_name = image_name
        self.title = title

    def __repr__(self):
        return "({}, {}, {}, {}, {}, {})".format(self.password, self.server,
                                                 self.username, self.database,
                                                 self.charset, self.image_path)


def get_grades(config: Config) -> List[Tuple[datetime.date, float]]:
    # Connect to the database
    connection = pymysql.connect(host=config.server,
                                 user=config.username,
                                 password=config.password,
                                 db=config.database,
                                 charset=config.charset,
                                 cursorclass=pymysql.cursors.DictCursor)

    try:
        with connection.cursor() as cursor:
            # Read records
            sql = "SELECT `datum`, `cijfer` FROM `Cijfers` ORDER BY datum"
            cursor.execute(sql)
            results = cursor.fetchall()

    finally:
        connection.close()
    return [(result['datum'], result['cijfer'] / 100) for result in results if
            result['datum'] is not None and result['cijfer'] is not None]


def interpolate_grades(dates: np.ndarray, grades: np.ndarray,
                       window: int = 31) -> Tuple[np.ndarray, np.ndarray]:
    min = np.min(dates)
    max = np.max(dates)
    days = np.arange(min, max + 1)
    all_grades = []
    win = window - 1 // 2

    for day in days:
        range_grades = grades[
            np.logical_and(dates > day - win, dates < day + win)]
        if len(range_grades) < window // 2:
            all_grades.append(np.nan)
        else:
            all_grades.append(np.mean(range_grades))

    all_grades = np.array(all_grades)
    select_days = days[np.logical_not(np.isnan(all_grades))]
    select_days = np.concatenate(([min], select_days, [max]))
    select_grades = all_grades[np.logical_not(np.isnan(all_grades))]
    select_grades = np.concatenate(
        ([select_grades[0]], select_grades, [select_grades[-1]]))

    return select_days, select_grades


def plot_grades(data: List[Tuple[datetime.date, float]], config: Config,
                time: str, dark: bool = False, window: int = 31) -> None:
    dates = np.array([date2num(date) for date, _grade in data])
    grades = np.array([grade for _date, grade in data])

    i_dates, i_grades = interpolate_grades(dates, grades, window)

    if dark:
        plt.style.use('dark_background')
    else:
        plt.style.use('default')

    colors = plt.rcParams['axes.prop_cycle'].by_key()['color']

    f = plt.figure(figsize=[8, 6], dpi=300)

    if dark:
        # Kies betere kleuren voor dark mode
        plt.gca().set_prop_cycle(color=[colors[3], colors[4]])
        f.patch.set_facecolor('#121212')
        plt.gca().set_facecolor('#121212')
    else:
        # Wissel eerste 2 kleuren om
        plt.gca().set_prop_cycle(color=[colors[1], colors[0]] + colors[2:])

    if len(grades) > 0:
        plt.plot_date(dates, grades, label='Behaald cijfer')
        plt.plot_date(i_dates, i_grades, linestyle='--', marker=None,
                      label='Voortschrijdend gemiddelde over {} dagen'.format(
                          window))

    plt.xlabel("Datum")
    plt.ylabel("Cijfer")

    if len(grades) > 0:
        plt.ylim(bottom=0, top=max(np.max(grades) + 0.5, 10.5))
        plt.xlim(left=np.min(dates), right=np.max(dates))
        plt.yticks(np.arange(0, max(np.max(grades) + 0.5, 10.5), 1))
    else:
        plt.ylim(bottom=0, top=10.5)
        plt.yticks(np.arange(0, 10.5, 1))

    plt.grid(True)
    f.autofmt_xdate()
    plt.title(config.title)

    if len(grades) > 0:
        plt.legend()

    if dark:
        f.savefig(
            "{}/{}-dark-{}.svg".format(config.image_path, config.image_name,
                                       time), format='svg',
            facecolor=f.get_facecolor())
        f.savefig(
            "{}/{}-dark-{}.png".format(config.image_path, config.image_name,
                                       time), format='png',
            facecolor=f.get_facecolor())
    else:
        f.savefig(
            "{}/{}-light-{}.svg".format(config.image_path, config.image_name,
                                        time), format='svg',
            facecolor=f.get_facecolor())
        f.savefig(
            "{}/{}-light-{}.png".format(config.image_path, config.image_name,
                                        time), format='png',
            facecolor=f.get_facecolor())

    plt.close(f)
    plt.cla()


def symlink(target: str, link_name: str, overwrite: bool = False):
    """
    Create a symbolic link named link_name pointing to target.
    If link_name exists then FileExistsError is raised, unless overwrite=True.
    When trying to overwrite a directory, IsADirectoryError is raised.
    Source: https://stackoverflow.com/a/55742015
    """

    if not overwrite:
        os.symlink(target, link_name)
        return

    # os.replace() may fail if files are on different filesystems
    link_dir = os.path.dirname(link_name)

    # Create link to target with temporary filename
    while True:
        temp_link_name = tempfile.mktemp(dir=link_dir)

        # os.* functions mimic as closely as possible system functions
        # The POSIX symlink() returns EEXIST if link_name already exists
        # https://pubs.opengroup.org/onlinepubs/9699919799/functions/symlink.html
        try:
            os.symlink(target, temp_link_name)
            break
        except FileExistsError:
            pass

    # Replace link_name with temp_link_name
    try:
        # Pre-empt os.replace on a directory with a nicer message
        if os.path.isdir(link_name):
            raise IsADirectoryError(
                f"Cannot symlink over existing directory: '{link_name}'")
        os.replace(temp_link_name, link_name)
    except:
        if os.path.islink(temp_link_name):
            os.remove(temp_link_name)
        raise


def set_symlink(config: Config, now: str, dark: bool, ext: str):
    if dark:
        dark_str = "dark"
    else:
        dark_str = "light"

    target = "{}-{}-{}.{}".format(config.image_name, dark_str, now, ext)
    link = "{}/{}-{}-latest.{}".format(config.image_path, config.image_name,
                                       dark_str, ext)

    symlink(target, link, True)


def set_all_symlinks(config: Config, now: str):
    set_symlink(config, now, False, 'svg')
    set_symlink(config, now, False, 'png')
    set_symlink(config, now, True, 'svg')
    set_symlink(config, now, True, 'png')


def set_permission(config: Config, gid: int, now: str, dark: bool, ext: str):
    if dark:
        dark_str = "dark"
    else:
        dark_str = "light"

    file_name = "{}/{}-{}-{}.{}".format(config.image_path,
                                        config.image_name,
                                        dark_str, now, ext)
    os.chown(file_name, -1, gid)
    os.chmod(file_name,
             stat.S_IRUSR | stat.S_IWUSR | stat.S_IRGRP | stat.S_IWGRP)


def set_all_permissions(config: Config, gid: int, now: str):
    set_permission(config, gid, now, False, 'svg')
    set_permission(config, gid, now, False, 'png')
    set_permission(config, gid, now, True, 'svg')
    set_permission(config, gid, now, True, 'png')


def remove_old_graphs_extension(config: Config, amount: int, dark: bool,
                                extension: str):
    if dark:
        dark_str = 'dark'
    else:
        dark_str = 'light'

    graphs = glob.glob("{}/{}-{}-*.{}".format(config.image_path,
                                              config.image_name, dark_str,
                                              extension))

    try:
        graphs.remove("{}/{}-{}-latest.{}".format(config.image_path,
                                                  config.image_name, dark_str,
                                                  extension))
    except ValueError:
        pass

    graphs.sort()
    to_remove = graphs[:len(graphs) - amount + 1]
    for file in to_remove:
        try:
            os.remove(file)
        except PermissionError:
            pass


def remove_old_graphs(config: Config, amount: int):
    remove_old_graphs_extension(config, amount, False, "svg")
    remove_old_graphs_extension(config, amount, False, "png")
    remove_old_graphs_extension(config, amount, True, "svg")
    remove_old_graphs_extension(config, amount, True, "png")


if __name__ == '__main__':
    import credentials
    from find_credentials import find_config
    from pandas.plotting import register_matplotlib_converters

    config_file = "connect.php"

    if credentials.use_connect:
        config = Config(*find_config(config_file), credentials.image_path,
                        credentials.image_name, credentials.title)
    else:
        config = Config(credentials.password, credentials.server,
                        credentials.username, credentials.database,
                        credentials.charset, credentials.image_path,
                        credentials.image_name, credentials.title)

    register_matplotlib_converters()

    if not os.path.exists(credentials.image_path):
        os.makedirs(credentials.image_path)

    remove_old_graphs(config, credentials.history)

    grades = get_grades(config)
    now = datetime.datetime.now().strftime("%Y-%m-%dT%H%M%S%f%z")
    plot_grades(grades, config, now, False)
    plot_grades(grades, config, now, True)

    set_all_permissions(config, credentials.gid, now)
    set_all_symlinks(config, now)
