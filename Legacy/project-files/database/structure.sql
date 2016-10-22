
/*Table structure for table `candies` */

DROP TABLE IF EXISTS `candies`;

CREATE TABLE `candies` (
  `candyId` INT(11) NOT NULL AUTO_INCREMENT,
  `candyName` VARCHAR(40) NOT NULL,
  `candyIcon` VARCHAR(40) NOT NULL,
  `nonCandy` TINYINT(1) NOT NULL,
  PRIMARY KEY (`candyId`)
) ENGINE=INNODB AUTO_INCREMENT=41 DEFAULT CHARSET=latin1;

/*Data for the table `candies` */

INSERT  INTO `candies`(`candyId`,`candyName`,`candyIcon`,`nonCandy`) VALUES (1,'Hershey\'s Kiss',':hersheyskiss:',0),(2,'M&Ms',':mandms:',0),(3,'Snickers',':snickers:',0),(4,'Twizzlers',':twizzlers:',0),(5,'Reese\'s Peanut Butter Cup',':reeses:',0),(6,'Kit-Kat Bar',':kitkat:',0),(7,'Gummi Worms',':gummyworms:',0),(8,'Gummi Bears',':gummybears:',0),(9,'Butterfinger',':butterfinger:',0),(10,'Twix',':twix:',0),(11,'Hershey Bar',':hersheys:',0),(12,'Jelly Beans',':jellybeans:',0),(13,'Candy Corn',':candycorn:',0),(14,'Three Musketeers',':3musketeers:',0),(15,'Tootsie Roll',':tootsieroll:',0),(16,'Skittles',':skittles:',0),(17,'Milky Way',':milkyway:',0),(18,'Starburst',':starburst:',0),(19,'Sour Patch Kids',':sourpatchkids:',0),(20,'Almond Joy ',':almondjoy:',0),(21,'Pixie Stix',':pixiestix:',0),(22,'Smarties',':smarties:',0),(23,'Blow Pop',':blowpop:',0),(24,'Jolly Rancher',':jollyrancher:',0),(25,'Red Vines',':redvines:',0),(26,'Jawbreaker',':jawbreaker:',0),(27,'Pocky',':pocky:',0),(28,'Pop Rocks',':poprocks:',0),(29,'Caramel Square',':caramelsquare:',0),(30,'Whoppers',':whoppers:',0),(31,'Gum Drops',':gumdrops:',0),(32,'Butterscotch',':butterscotch:',0),(33,'Candy Cane',':candycane:',0),(34,'Life Savers',':lifesavers:',0),(35,'Pez',':pez:',0),(36,'Sweethearts',':sweethearts:',0),(37,'Warhead',':warhead:',0),(38,'Now and Later',':nowandlater:',0),(39,'Tootsie Roll Pop',':tootsierollpop:',0),(40,'Chocolate Truffle',':chocolatetruffle:',0);

/*Table structure for table `playercandies` */

CREATE TABLE `playercandies` (
  `playerCandyId` INT(11) NOT NULL AUTO_INCREMENT,
  `candyId` INT(11) NOT NULL,
  `playerId` VARCHAR(11) NOT NULL,
  `amount` INT(11) NOT NULL,
  PRIMARY KEY (`playerCandyId`)
) ENGINE=INNODB DEFAULT CHARSET=latin1;

/*Data for the table `playercandies` */

/*Table structure for table `players` */

CREATE TABLE `players` (
  `playerId` VARCHAR(11) NOT NULL,
  `playerName` VARCHAR(21) NOT NULL,
  `lastPlayed` DATETIME NOT NULL,
  `numPlayedToday` INT(11) NOT NULL,
  PRIMARY KEY (`playerId`)
) ENGINE=INNODB DEFAULT CHARSET=latin1;

/*Data for the table `players` */

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
