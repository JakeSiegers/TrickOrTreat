/*
SQLyog Community v12.12 (64 bit)
MySQL - 5.6.24-log : Database - trickortreat
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`trickortreat` /*!40100 DEFAULT CHARACTER SET utf8 */;

USE `trickortreat`;

/*Table structure for table `candies` */

DROP TABLE IF EXISTS `candies`;

CREATE TABLE `candies` (
  `candyId` int(11) NOT NULL AUTO_INCREMENT,
  `candyName` varchar(40) NOT NULL,
  `candyIcon` varchar(40) NOT NULL,
  `nonCandy` tinyint(1) NOT NULL,
  PRIMARY KEY (`candyId`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1;

/*Data for the table `candies` */

insert  into `candies`(`candyId`,`candyName`,`candyIcon`,`nonCandy`) values (1,'Hershey\'s Kiss',':hersheyskiss:',0),(2,'M&Ms',':mandms:',0),(3,'Snickers',':snickers:',0),(4,'Twizzlers',':twizzlers:',0),(5,'Reese\'s Peanut Butter Cup',':reeses:',0),(6,'Kit-Kat Bar',':kitkat:',0),(7,'Gummi Worms',':gummyworms:',0),(8,'Gummi Bears',':gummybears:',0),(9,'Butterfinger',':butterfinger:',0),(10,'Twix',':twix:',0),(11,'Hershey Bar',':hersheys:',0),(12,'Jelly Beans',':jellybeans:',0),(13,'Candy Corn',':candycorn:',0),(14,'Three Musketeers',':3musketeers:',0),(15,'Tootsie Roll',':tootsieroll:',0),(16,'Skittles',':skittles:',0),(17,'Milky Way',':milkyway:',0),(18,'Starburst',':starburst:',0),(19,'Sour Patch Kids',':sourpatchkids:',0),(20,'Almond Joy ',':almondjoy:',0),(21,'Pixie Stix',':pixiestix:',0),(22,'Smarties',':smarties:',0),(23,'Blow Pop',':blowpop:',0),(24,'Jolly Rancher',':jollyrancher:',0),(25,'Red Vines',':redvines:',0),(26,'Jawbreaker',':jawbreaker:',0),(27,'Pocky',':pocky:',0),(28,'Pop Rocks',':poprocks:',0),(29,'Caramel Square',':caramelsquare:',0),(30,'Whoppers',':whoppers:',0),(31,'Gum Drops',':gumdrops:',0),(32,'Butterscotch',':butterscotch:',0),(33,'Candy Cane',':candycane:',0),(34,'Life Savers',':lifesavers:',0),(35,'Pez',':pez:',0),(36,'Sweethearts',':sweethearts:',0),(37,'Warhead',':warhead:',0),(38,'Now and Later',':nowandlater:',0),(39,'Tootsie Roll Pop',':tootsierollpop:',0),(40,'Chocolate Truffle',':chocolatetruffle:',0);

/*Table structure for table `playercandies` */

DROP TABLE IF EXISTS `playercandies`;

CREATE TABLE `playercandies` (
  `playerCandyId` int(11) NOT NULL AUTO_INCREMENT,
  `candyId` int(11) NOT NULL,
  `playerId` varchar(11) NOT NULL,
  `amount` int(11) NOT NULL,
  PRIMARY KEY (`playerCandyId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `playercandies` */

/*Table structure for table `players` */

DROP TABLE IF EXISTS `players`;

CREATE TABLE `players` (
  `playerId` varchar(11) NOT NULL,
  `playerName` varchar(21) NOT NULL,
  `lastPlayed` datetime NOT NULL,
  `numPlayedToday` int(11) NOT NULL,
  PRIMARY KEY (`playerId`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Data for the table `players` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
