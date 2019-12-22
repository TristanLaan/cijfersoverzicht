-- Copyright (c) Tristan Laan 2018-2019.
-- This file is part of cijfersoverzicht.
-- cijfersoverzicht is free software: you can redistribute it and/or modify
-- it under the terms of the GNU Affero General Public License as published
-- by the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- cijfersoverzicht is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU Affero General Public License for more details.
--
-- You should have received a copy of the GNU Affero General Public License
-- along with cijfersoverzicht.  If not, see <https://www.gnu.org/licenses/>

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cijfersoverzicht`
--

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Cijfers`
--

CREATE TABLE `Cijfers` (
  `cijfernr` int(11) NOT NULL,
  `vaknr` int(11) NOT NULL,
  `cijfertitel` text NOT NULL,
  `weging` smallint(5) DEFAULT NULL,
  `datum` date DEFAULT NULL,
  `cijfer` smallint(4) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Tabelstructuur voor tabel `Vakken`
--

CREATE TABLE `Vakken` (
  `vaknr` int(11) NOT NULL,
  `vaknaam` tinytext NOT NULL,
  `jaar` tinyint(1) NOT NULL,
  `periode` int(6) NOT NULL,
  `studiepunten` tinyint(2) NOT NULL DEFAULT '6',
  `gehaald` tinyint(1) NOT NULL DEFAULT '0',
  `eindcijfer` int(4) DEFAULT NULL,
  `toon` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

--
-- Indexen voor geëxporteerde tabellen
--

--
-- Indexen voor tabel `Cijfers`
--
ALTER TABLE `Cijfers`
  ADD PRIMARY KEY (`cijfernr`),
  ADD KEY `vaknr` (`vaknr`);

--
-- Indexen voor tabel `Vakken`
--
ALTER TABLE `Vakken`
  ADD PRIMARY KEY (`vaknr`);

--
-- AUTO_INCREMENT voor geëxporteerde tabellen
--

--
-- AUTO_INCREMENT voor een tabel `Cijfers`
--
ALTER TABLE `Cijfers`
  MODIFY `cijfernr` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT voor een tabel `Vakken`
--
ALTER TABLE `Vakken`
  MODIFY `vaknr` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
