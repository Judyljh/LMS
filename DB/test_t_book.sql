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
-- Table structure for table `t_book`
--

DROP TABLE IF EXISTS `t_book`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `t_book` (
  `barcode` varchar(20) NOT NULL,
  `bookName` varchar(20) NOT NULL,
  `bookType` int(11) DEFAULT NULL,
  `price` float NOT NULL,
  `count` int(11) NOT NULL,
  `author` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`barcode`),
  KEY `FK_type_index` (`bookType`),
  KEY `FKCB4C8FF488116ECB` (`bookType`),
  CONSTRAINT `FKCB4C8FF488116ECB` FOREIGN KEY (`bookType`) REFERENCES `t_booktype` (`bookTypeId`),
  CONSTRAINT `FK_type` FOREIGN KEY (`bookType`) REFERENCES `t_booktype` (`bookTypeId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `t_book`
--

LOCK TABLES `t_book` WRITE;
/*!40000 ALTER TABLE `t_book` DISABLE KEYS */;
INSERT INTO `t_book` VALUES ('BN034','Australia Culture',6,23.5,3,'Tony Steward'),('BS001','ABC',5,0.5,2,'Mick Eason'),('TS001','Android Bible',2,25,12,'Tom Test'),('TS002','Delphi Programming',2,25.5,12,'Jack T'),('TS003','Australia History',4,23.3,12,'Peter Major'),('TS004','Dora Advanture',5,18.5,12,'Julia P'),('TS005','div+css Web Design',2,38.5,19,'Smith'),('TS006','iOS Mobile App',2,42.3,18,'Mark'),('TS098','365 Stories',5,12,3,'Julia Cot');
/*!40000 ALTER TABLE `t_book` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2015-11-22 22:16:02
