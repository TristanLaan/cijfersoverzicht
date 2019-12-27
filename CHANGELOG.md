# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Added
- Python script om een grafiek met cijfers te genereren toegevoegd, zie
  [README.md](README.md) voor vereisten
- Toggle in `connect.php` om de grafiek aan en uit te zetten
- In `index.php` staat de grafiek en knoppen om de grafiek te downloaden
- Met `afbeelding.php` is het mogelijk om afbeeldingen op te halen uit
  `graphs/` als de gebruiker is ingelogd
- Met `refresh_grafiek.php` kan de grafiek opnieuw gegenereerd worden
- In `admin.php` staat de grafiek en knoppen om de grafiek te vernieuwen en
  te downloaden

### Fixed
- `verwijder_*.php` en `wijzig_*.php` gaven een php error als de pagina werd
  bezocht voordat een andere pagina werd bezocht, waardoor de sessie nog niet
  geinitialiseerd was

## [0.5.1] - 2019-12-23
### Changed
- Als je als admin inlogt hoef je niet meer als gebruiker in te loggen om
  het overzicht te zien
- Gebruik etag en de HTTP `304 Not Modified` response code in plaats van de
  huidige check of de data gewijzigd is in `get_cijfers.php` en `get_vakken.php`
- `get_cijfers.php` en `get_vakken.php` gebruiken nu GET om opties mee te geven
  in plaats van POST
- Upload alle stuurt nu alle vakken/cijfers in één request naar de server, in
  plaats van één request per vak/cijfer. Dit zorgt voor betere prestaties als er
  veel vakken tegelijk worden geüpload en het zorgt ervoor dat de volgorde
  gegarandeerd hetzelfde is als ingevoerd
- Het aantal benodigde studiepunten wordt nu in `connect.php` bewaard

## [0.5.0] - 2019-09-25
### Added
- HTML-pagina voor licentie toegevoegd
- Titel duidelijker op pagina weergeven
- Dark mode toegevoegd

### Changed
- Deel bericht is verbeterd als intern-adres uit staat
- Het verschil tussen het login-scherm van de admin pagina en van de normale
  pagina is wat duidelijker gemaakt
- Er is een link toegevoegd naar de thuis-pagina/admin-pagina
- Licentie veranderd van GPLv3 > GNU AGPL
- CSS naar apart bestand verhuist
- Voor het gemiddelde van alle cijfers wordt nu het gemiddelde gebruikt in
  plaats van het voorlopige eindcijfer wanneer het eindcijfer nog onbekend is

### Fixed
- Nieuwe cijfers maken wordt getoont als er nog geen vakken bestaan
- Tabel met cijfers en vakken wordt niet meer geleegd bij een server fout
- Placeholder date format voor browsers die input type=date niet ondersteunen
- Geen null waardes meer in delen cijfers

## [0.4.0] - 2019-07-22
### Added
- Het gemiddelde cijfer van alle vakken wordt nu weergeven
- Cijfers en vakken worden nu los opgehaald via javascript/ajax op de homepage
  in plaats van dat ze gelijk worden neergezet tijdens het ophalen van de pagina
- Er wordt nu iedere 15s gecontroleerd of er nieuwe cijfers zijn
- Alle ajax requests worden nu beantwoord met pure JSON en de header wordt ook
  op application/json gezet i.p.v. text/html
- Er zijn duidelijkere instructies toegevoegd voor het installeren van de
  website
- Vakken worden op de admin pagina opgehaald via AJAX
- Er is een tabel met cijfers toegevoegd op de admin pagina
- Er is een tabel met vakken toegevoegd op de admin pagina
- Cijfers kunnen nu worden gewijzigd, gedeeld en verwijderd worden
- Vakken kunnen nu worden gewijzigd en verwijderd worden

### Changed
- De footer neemt de hele breedte in en heeft een margin aan de onderkant
- Divs zitten niet meer aan elkaar vast op de admin pagina
- Het Vak-object in Cijfer-objecten worden nu in correcte JSON verstuurd
- Er zijn overbodige comments uit het sql-bestand verwijderd
- Wachtwoord veld wordt geleegd als het wachtwoord incorrect is
- Er zijn extra velden toegevoegd aan `connect.php`
- Alle javascript code van `admin.php` is verplaatst naar `admin.js`

### Fixed
- Er zat een foute regel in `wijzig_cijfer.php` waardoor php een warning kon
  geven als de pagina opgevraagd werd.

## [0.3.0] - 2019-07-09
### Added
- Alle code is opgemaakt
- Er is een admin pagina gemaakt waar cijfers geupload kunnen worden
- De footer wordt nu door een losse functie aangemaakt
- Er zijn methodes aan de vak- en cijfer-klasses toegevoegd om cijfers en vakken
  te kunnen uploaden en updaten
- De vak- en cijfer-klasses implementeren nu de JsonSerializable-klasse
- Er is een CHANGELOG toegevoegd aan het project
- De vakken worden nu aflopend op jaar gesorteerd
- De header van bestanden wordt nu ook als comment in html pagina's aangemaakt

## [0.2.0] - 2019-07-08
### Added
- Er is een cijfer- en vak-klasse aangemaakt in php en de code is erg
  opgeschoont door het opsplitsen in functies
- Project geupgrade van PHP 5.6 > PHP 7.0

## Removed
- Er is geen support meer voor PHP 5.6

## [0.1.2] - 2019-06-20
### Added
- Het inloggen gaat nu via AJAX ipv PHP
- De sessie naam is nu opgeslagen in een globale variabele
- Er is een link naar de licentie en github toegevoegd
- Er is aan ieder bestand een header toegevoegd

### Fixed
- Globale variabele $password wordt niet meer overschreven tijdens inloggen

## [0.1.1] - 2019-02-26
### Added
- Als de periode 0 is wordt die nu verborgen
- Er is een GPLv3 licentie toegevoegd
- Er is een README toegevoegd

### Fixed
- Fix er werden 2 lege rijen onder de tabel toegevoegd
- Fix het minimale voorlopige eindcijfer is een 1

### Removed
- Test pagina voor database connectie is verwijderd

## [0.1.0] - 2019-01-27
### Added
- Cijfers.sql bevat de database structuur van de website
- Er staat een template waar alle credentials in moeten staat in connect-template.php
- Een test pagina die test of de connectie met de database is geslaagd
- Een login pagina die een wachtwoord vereist voordat de website wordt bezocht
- Een pagina waar alle cijfers te zien zijn

[Unreleased]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/TristanLaan/cijfersoverzicht/releases/tag/v0.1.0
