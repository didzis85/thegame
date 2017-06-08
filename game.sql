-- phpMyAdmin SQL Dump
-- version 4.4.6
-- http://www.phpmyadmin.net
--
-- Host: 10.10.10.20
-- Generation Time: Jun 08, 2017 at 09:00 AM
-- Server version: 5.6.24-ndb-7.4.6-cluster-gpl-log
-- PHP Version: 7.1.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `game`
--
CREATE DATABASE IF NOT EXISTS `game` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `game`;

-- --------------------------------------------------------

--
-- Table structure for table `opt_backer_to_player`
--

DROP TABLE IF EXISTS `opt_backer_to_player`;
CREATE TABLE IF NOT EXISTS `opt_backer_to_player` (
  `playerID` char(50) NOT NULL,
  `backerID` char(50) NOT NULL,
  `tournamentID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `opt_players`
--

DROP TABLE IF EXISTS `opt_players`;
CREATE TABLE IF NOT EXISTS `opt_players` (
  `id` int(11) NOT NULL,
  `playerID` char(50) NOT NULL,
  `points` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `opt_player_to_tournament`
--

DROP TABLE IF EXISTS `opt_player_to_tournament`;
CREATE TABLE IF NOT EXISTS `opt_player_to_tournament` (
  `tournamentID` int(11) NOT NULL,
  `playerID` char(50) NOT NULL,
  `amount` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `opt_tournaments`
--

DROP TABLE IF EXISTS `opt_tournaments`;
CREATE TABLE IF NOT EXISTS `opt_tournaments` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `minDeposit` int(11) NOT NULL,
  `status` char(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `opt_players`
--
ALTER TABLE `opt_players`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `opt_tournaments`
--
ALTER TABLE `opt_tournaments`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `opt_players`
--
ALTER TABLE `opt_players`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `opt_tournaments`
--
ALTER TABLE `opt_tournaments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
