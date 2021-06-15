#  Copyright (c) Tristan Laan 2018-2021.
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

import re
from typing import Tuple


def find_config(config: str) -> Tuple[str, str, str, str, str]:
    password = None
    server = None
    username = None
    database = None
    charset = None
    regpassdouble = re.compile(r'^.*\$password\s*=\s*"(([^"]*|(\\"))*)";.*$')
    regpasssingle = re.compile(r"^.*\$password\s*=\s*'(([^']*|(\\'))*)';.*$")
    regservdouble = re.compile(r'^.*\$server\s*=\s*"(([^"]*|(\\"))*)";.*$')
    regservsingle = re.compile(r"^.*\$server\s*=\s*'(([^']*|(\\'))*)';.*$")
    reguserdouble = re.compile(r'^.*\$username\s*=\s*"(([^"]*|(\\"))*)";.*$')
    regusersingle = re.compile(r"^.*\$username\s*=\s*'(([^']*|(\\'))*)';.*$")
    regdbdouble = re.compile(r'^.*\$database\s*=\s*"(([^"]*|(\\"))*)";.*$')
    regdbsingle = re.compile(r"^.*\$database\s*=\s*'(([^']*|(\\'))*)';.*$")
    regchardouble = re.compile(r'^.*\$charset\s*=\s*"(([^"]*|(\\"))*)";.*$')
    regcharsingle = re.compile(r"^.*\$charset\s*=\s*'(([^']*|(\\'))*)';.*$")

    with open(config) as file:
        for line in file:
            if password is None:
                result = regpassdouble.match(line)
                if result is not None:
                    password = result.group(1)
            if password is None:
                result = regpasssingle.match(line)
                if result is not None:
                    password = result.group(1)

            if server is None:
                result = regservdouble.match(line)
                if result is not None:
                    server = result.group(1)
            if server is None:
                result = regservsingle.match(line)
                if result is not None:
                    server = result.group(1)

            if username is None:
                result = reguserdouble.match(line)
                if result is not None:
                    username = result.group(1)
            if username is None:
                result = regusersingle.match(line)
                if result is not None:
                    username = result.group(1)

            if database is None:
                result = regdbdouble.match(line)
                if result is not None:
                    database = result.group(1)
            if database is None:
                result = regdbsingle.match(line)
                if result is not None:
                    database = result.group(1)

            if charset is None:
                result = regchardouble.match(line)
                if result is not None:
                    charset = result.group(1)
            if charset is None:
                result = regcharsingle.match(line)
                if result is not None:
                    charset = result.group(1)

            if password is not None and server is not None and \
                    username is not None and database is not None and \
                    charset is not None:
                return password, server, username, database, charset
    exit("Error finding credentials")
