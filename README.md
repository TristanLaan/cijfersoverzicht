# Cijfersoverzicht

Een website met een gekoppelde database om een makkelijk overzicht te geven van
behaalde cijfers.

## Installatie
- Kopieer `connect-template.php` naar `connect.php`, en vul de configuratie
  gegevens van dit bestand in.

- Plaats de bestanden in een webserver die geconfigureert is met PHP 7.0 of
  hoger en MySQL/MariaDB 5.5 of hoger.

- Importeer cijfers.sql in MySQL/MariaDB als database met dezelfde naam als
  opgegeven in `connect.php`.

- Zorg dat `python/` en `graphs/` niet toegankelijk zijn vanaf het web.
- _Optioneel:_ voeg aan `/etc/apache2/mods-enabled/deflate.conf` de regel
  `AddOutputFilterByType DEFLATE application/json` toe om compressie toe te
  voegen aan JSON-verzoeken van javascript. Deze verzoeken kunnen best groot
  zijn als ze niet gecomprimeerd zijn, dus dit is aanbevolen.

  Ook kan `AddOutputFilterByType DEFLATE image/svg+xml` worden toegevoegd
  om de svg afbeeldingen te comprimeren.

- _Optioneel:_ Om de grafiek met cijfers te genereren moeten de volgende
  packages geïnstalleerd zijn: `python3`, `matplotlib`, `pandas`, `numpy` en
  `pymysql`.
  Op Debian kunnen deze packages geïnstalleerd worden met het commando:
  `sudo apt update && sudo apt install python3 python3-pymysql python3-numpy  python3-matplotlib python3-pandas`.

  Ook moet het bestand `credentials-template.py` naar `credentials.py` worden
  gekopieerd en moet hier de configuratie worden ingevuld.
