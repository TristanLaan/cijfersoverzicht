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

# Pad van root van cijfersoverzicht naar map met grafieken
image_path = "graphs"
# Begin van naam afbeelding
image_name = "grades"
# Titel van grafiek
title = ""
# Aantal grafieken dat bewaard moet blijven
history = 10
# Het aantal dagen waar het gemiddelde over genomen wordt
window = 31
# Het minimum aantal cijfers om het gemiddelde over te nemen
window_min = 5
# Group id van webserver user, dit is standaard 33. De juiste waarde kan je
# vinden in `/etc/group`
gid = 33

# Instellingen uit connect.php. Als use_connect True is dan probeert hij ze
# door middel van een regex op te halen uit connect.php, dit wordt echter
# afgeraden
use_connect = False
password = ""
server = ""
username = ""
database = ""
charset = ""
