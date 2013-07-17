-- phpMyAdmin SQL Dump
-- version 3.5.2.2
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 08-04-2013 a las 04:22:02
-- Versión del servidor: 5.5.27
-- Versión de PHP: 5.4.7

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Base de datos: `SaveGrow`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sg_countrys`
-- Contiene los paises, prefijos y sus rentabilidades.
--

CREATE TABLE IF NOT EXISTS `sg_countrys` (
  `c_id` int(5) NOT NULL AUTO_INCREMENT,
  `c_name` varchar(20) NOT NULL,
  `c_pref` varchar(4) NOT NULL,
  `c_return` int(3) NOT NULL,
  PRIMARY KEY (`c_id`)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sg_fees_paid`
-- Contiene los pagos de los ahorros.
--

CREATE TABLE IF NOT EXISTS `sg_fees_paid` (
  `fee_id` int(5) NOT NULL AUTO_INCREMENT,
  `fee_reg` int(10) NOT NULL,
  `fee_parent_reg` int(10) NOT NULL,
  `fee_value` bigint(14) NOT NULL,
  PRIMARY KEY (`fee_id`)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sg_savings`
-- Contiene los ahorros de los usuarios de la aplicación.
--

CREATE TABLE IF NOT EXISTS `sg_savings` (
  `saving_id` int(5) NOT NULL AUTO_INCREMENT,
  `saving_user` int(5) NOT NULL,
  `saving_reg` int(10) NOT NULL,
  `saving_type` int(1) NOT NULL DEFAULT '3',
  `saving_name` varchar(100) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `saving_value` bigint(14) NOT NULL,
  `saving_percent` decimal(5,2) NOT NULL,
  `saving_long` int(2) NOT NULL,
  `saving_noti` int(1) NOT NULL DEFAULT '1',
  `saving_finish` int(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`saving_id`)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sg_shared_savings`
-- Permite asignar un ahorro a más de un usuario, así lo pueden compartir
--

CREATE TABLE IF NOT EXISTS `sg_shared_savings` (
    `ss_id` int(5) NOT NULL AUTO_INCREMENT,
    `ss_saving` int(10) NOT NULL,
    `ss_friend` varchar(40) NOT NULL,
    `ss_accept` int(1) NOT NULL,
    PRIMARY KEY (`ss_id`)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sg_users`
-- Contiene los usuarios de la aplicación.
--

CREATE TABLE IF NOT EXISTS `sg_users` (
  `user_id` int(5) NOT NULL AUTO_INCREMENT,
  `user_reg` int(10) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `user_mail` varchar(40) NOT NULL,
  `user_pass` varchar(32) NOT NULL,
  `user_avatar` varchar(100) NOT NULL,
  `user_country` varchar(3) NOT NULL DEFAULT '',
  `user_key` varchar(15) NOT NULL DEFAULT '',
  `user_treg` varchar(1) NOT NULL DEFAULT '',
  `user_ip` varchar(15) NOT NULL,
  PRIMARY KEY (`user_id`),
  KEY `user_name` (`user_name`,`user_pass`)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sg_tips`
-- Contiene los tips de ahorro
--

CREATE TABLE IF NOT EXISTS `sg_tips` (
  `tip_id` int(5) NOT NULL AUTO_INCREMENT,
  `tip_name` TINYTEXT NOT NULL,
  `tip_type` int(1) NOT NULL,
  `tip_country` varchar(3) NOT NULL,
  `tip_img` TINYTEXT NOT NULL DEFAULT '',
  `tip_text` TEXT NOT NULL,
  `tip_date` int(10) NOT NULL,
  PRIMARY KEY (`tip_id`)
);