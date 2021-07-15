#!/usr/bin/python3
import datetime
import pymysql
import pymysql.cursors
import json
from pathlib import Path
from xml.sax.saxutils import unescape as xml_unescape


class Config:
    def __init__(self, password: str, server: str, username: str,
                 database: str):
        self.password = password
        self.server = server
        self.username = username
        self.database = database
        self.charset = 'UTF8MB4'


def parse_result(result):
    output = []

    for val in result.values():
        if isinstance(val, str):
            output.append(xml_unescape(val.strip()))
        elif isinstance(val, datetime.date):
            output.append(val.strftime("%Y-%m-%d"))
        else:
            output.append(val)

    return output


def get_data(config: Config):
    try:
        connection = pymysql.connect(cursorclass=pymysql.cursors.DictCursor,
                                     host=config.server,
                                     user=config.username,
                                     password=config.password,
                                     db=config.database,
                                     charset=config.charset)
        with connection:
            with connection.cursor() as cursor:
                # Read records
                cursor.execute("SELECT `vaknr`, `vaknaam`, `jaar`, `periode`, `studiepunten`, `gehaald`, `eindcijfer`, `toon` FROM Vakken")
                results = cursor.fetchall()
                vakken = [parse_result(result) for result in results]
                cursor.execute("SELECT `cijfernr`, `vaknr`, `cijfertitel`, `weging`, `datum`, `cijfer` FROM Cijfers")
                results = cursor.fetchall()
                cijfers = [parse_result(result) for result in results]
    except pymysql.err.Error as e:
        print(str(e))
        exit(1)

    return {'vakken': vakken, 'cijfers': cijfers}

def convert_vakken(vakken):
    values = []
    for vak in vakken:
        periode = vak[3]
        if periode == 0:
            periode = None
        values.extend([vak[0], 1, vak[1], vak[2], periode, periode,
                       vak[4], vak[5], vak[6], vak[7]])
    return values

def convert_cijfers(cijfers):
    values = []
    for cijfer in cijfers:
        values.extend([cijfer[0], cijfer[1], cijfer[2], cijfer[3], cijfer[4], cijfer[5]])
    return values

def insert_data(config: Config, data):
    try:
        connection = pymysql.connect(cursorclass=pymysql.cursors.DictCursor,
                                     host=config.server,
                                     user=config.username,
                                     password=config.password,
                                     db=config.database,
                                     charset=config.charset)
        with connection:
            with connection.cursor() as cursor:
                sql = "INSERT INTO `Vakken` (`vaknr`, `studienr`, `vaknaam`, `jaar`, `periode_start`, `periode_end`, `studiepunten`, `gehaald`, `eindcijfer`, `toon`) VALUES " + ", ".join(["(%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)" for _ in range(len(data['vakken']))])
                cursor.execute(sql, convert_vakken(data['vakken']))
                sql = "INSERT INTO `Cijfers` (`cijfernr`, `vaknr`, `cijfertitel`, `weging`, `datum`, `cijfer`) VALUES " + ", ".join(["(%s, %s, %s, %s, %s, %s)" for _ in range(len(data['cijfers']))])
                cursor.execute(sql, convert_cijfers(data['cijfers']))
        connection.commit()
    except pymysql.err.Error as e:
        print(str(e))
        exit(1)

def show_command(config: Config):
    print("Execute the following command in the command line inside "
          "the directory with `cijfers.sql`:")
    print("mysql {} < cijfers.sql".format(config.database))


if __name__ == '__main__':
    print("Enter the database configuration details. "
          "Read/write permission on the database is required.")
    # server = input("Enter db server: ")
    # database = input("Enter db name: ")
    # username = input("Enter db username: ")
    # password = input("Enter db password: ")
    print()

    password = "tE-MTCswzK9XJb7MNMtL-YQKv-L-tfWk"
    server = "localhost"
    username = "cijfersoverzicht"
    database = "cijfersoverzicht"

    file = Path("backup_data.json")
    config = Config(password, server, username, database)

    if file.exists():
        with file.open('r') as f:
            data = json.load(f)
    else:
        data = get_data(config)
        with file.open('w') as f:
            json.dump(data, f)

    show_command(config)
    print("Press enter when you've executed the command...")
    input()

    insert_data(config, data)
    print("Database correctly migrated!")
    print("If everything is correct you can remove `backup_data.json`")

