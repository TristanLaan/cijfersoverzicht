# Cijfersoverzicht

Een website met een gekoppelde database om een makkelijk overzicht te geven van behaalde cijfers.

## Installatie
- Hernoem `connect-template.php` naar `connect.php`, en vul de configuratie gegevens van dit bestand in. 
- Plaats de bestanden in een webserver die geconfigureert is met PHP 7.0 of hoger en MySQL/MariaDB 5.5 of hoger. 
- Importeer cijfers.sql in MySQL/MariaDB als database met dezelfde naam als opgegeven in `connect.php`.
- _Optioneel:_ voeg aan `/etc/apache2/mods-enabled/deflate.conf` de regel `AddOutputFilterByType DEFLATE application/json` toe om compressie toe te voegen aan JSON-verzoeken van javascript.
