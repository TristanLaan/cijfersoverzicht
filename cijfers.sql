-- Copyright (c) Tristan Laan 2018-2021.
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

-- --------------------------------------------------------
--
-- Tabelstructuur voor tabel `Vakken`
--

CREATE TABLE `Vakken` (
  `vaknr` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vaknaam` VARCHAR(1024) NOT NULL,
  `jaar` TINYINT(1) UNSIGNED NOT NULL,
  `periode` TINYINT(1) UNSIGNED NOT NULL,
  `studiepunten` TINYINT(2) UNSIGNED NOT NULL DEFAULT '6',
  `gehaald` BOOLEAN NOT NULL DEFAULT FALSE,
  `eindcijfer` SMALLINT(4) UNSIGNED DEFAULT NULL,
  `toon` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`vaknr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
--
-- Tabelstructuur voor tabel `Cijfers`
--

CREATE TABLE `Cijfers` (
  `cijfernr` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `vaknr` INT UNSIGNED NOT NULL,
  `cijfertitel` VARCHAR(1024) NOT NULL,
  `weging` SMALLINT(5) UNSIGNED DEFAULT NULL,
  `datum` date DEFAULT NULL,
  `cijfer` SMALLINT(4) UNSIGNED DEFAULT NULL,
  PRIMARY KEY (`cijfernr`),
  FOREIGN KEY (`vaknr`) REFERENCES `Vakken`(`vaknr`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
