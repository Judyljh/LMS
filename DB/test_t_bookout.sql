CREATE DATABASE  IF NOT EXISTS `test` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `test`;
-- MySQL dump 10.13  Distrib 5.5.16, for Win32 (x86)
--
-- Host: 127.0.0.1    Database: test
-- ------------------------------------------------------
-- Server version	5.5.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `t_bookout`
--

DROP TABLE IF EXISTS `t_bookout`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_bookout` (
  `lid` int(11) NOT NULL AUTO_INCREMENT,
  `bid` varchar(20) NOT NULL,
  `uid` int(11) NOT NULL,
  `out_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`lid`),
  KEY `fk_uid_idx` (`uid`),
  KEY `fk_bid_idx` (`bid`),
  KEY `FKBF6D12FAB5D2D1CB` (`bid`),
  KEY `FKBF6D12FA917AE78` (`uid`),
  CONSTRAINT `FKBF6D12FA917AE78` FOREIGN KEY (`uid`) REFERENCES `t_clients` (`cid`),
  CONSTRAINT `FKBF6D12FAB5D2D1CB` FOREIGN KEY (`bid`) REFERENCES `t_book` (`barcode`),
  CONSTRAINT `fk_bid` FOREIGN KEY (`bid`) REFERENCES `t_book` (`barcode`),
  CONSTRAINT `fk_uid` FOREIGN KEY (`uid`) REFERENCES `t_clients` (`cid`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_bookout`
--

LOCK TABLES `t_bookout` WRITE;
/*!40000 ALTER TABLE `t_bookout` DISABLE KEYS */;
INSERT INTO `t_bookout` VALUES (1,'BS001',1,'2015-11-18 22:39:03'),(2,'TS001',1,'2015-11-18 22:39:03'),(3,'TS006',1,'2015-11-18 22:39:03');
/*!40000 ALTER TABLE `t_bookout` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-11-22 22:16:03
