# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [Unreleased]
### Changed
- De footer neemt de hele breedte in en heeft een margin aan de onderkant

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

[Unreleased]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.3.0...HEAD
[0.3.0]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.1.2...v0.2.0
[0.1.2]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/TristanLaan/cijfersoverzicht/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/TristanLaan/cijfersoverzicht/releases/tag/v0.1.0
