-- phpMyAdmin SQL Dump
-- version 4.8.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Gegenereerd op: 28 jan 2019 om 01:22
-- Serverversie: 5.5.57-MariaDB
-- PHP-versie: 5.6.38

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cijfers_tristan_uva`
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
