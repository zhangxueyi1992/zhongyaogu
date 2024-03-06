/*
Navicat MySQL Data Transfer

Source Server         : local
Source Server Version : 50630
Source Host           : localhost:3306
Source Database       : medical

Target Server Type    : MYSQL
Target Server Version : 50630
File Encoding         : 65001

Date: 2024-02-22 16:27:42
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for `tb_cmsuser`
-- ----------------------------
DROP TABLE IF EXISTS `tb_cmsuser`;
CREATE TABLE `tb_cmsuser` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `active` smallint(1) NOT NULL DEFAULT '1' COMMENT '是否是激活状态',
  `addtime` datetime NOT NULL COMMENT '添加时间',
  `introduction` varchar(45) NOT NULL COMMENT '介绍',
  `label` char(5) NOT NULL COMMENT '是否是超管',
  `name` varchar(20) NOT NULL COMMENT '姓名',
  `avatar` varchar(50) NOT NULL COMMENT '头像',
  `password` char(32) NOT NULL COMMENT 'md5加密的密码',
  `sort` smallint(3) NOT NULL COMMENT '排序',
  `token` varchar(20) NOT NULL COMMENT '令牌',
  `username` varchar(10) NOT NULL COMMENT '登录用户名',
  `lastUpdate` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_cmsuser
-- ----------------------------
INSERT INTO `tb_cmsuser` VALUES ('1', '1', '2023-07-14 17:37:06', '我是超级管理员2', 'super', '超级管理员2', 'uploads/1708587652479.jpg', 'e10adc3949ba59abbe56e057f20f883e', '1', 'admin_token', 'admin', '2024-02-22 15:40:52');

-- ----------------------------
-- Table structure for `tb_medical`
-- ----------------------------
DROP TABLE IF EXISTS `tb_medical`;
CREATE TABLE `tb_medical` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL COMMENT '药材名称',
  `picture` varchar(80) NOT NULL COMMENT '药材图片地址（放大后）',
  `videoUrl` varchar(80) NOT NULL COMMENT '视频地址',
  `audioUrl` varchar(80) NOT NULL COMMENT '音频地址',
  `createAt` datetime NOT NULL COMMENT '创建时间',
  `lastUpdate` datetime NOT NULL COMMENT '最近更新时间',
  `sort` tinyint(3) NOT NULL COMMENT '排序',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=103 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_medical
-- ----------------------------
INSERT INTO `tb_medical` VALUES ('30', '石斛', 'uploads/1708503727081.jpg', 'uploads/1708503727076.mp4', 'uploads/1708503727086.mp3', '2024-02-21 16:22:08', '2024-02-21 16:22:08', '1');
INSERT INTO `tb_medical` VALUES ('32', '金线莲', 'uploads/1708504667264.jpg', 'uploads/1708504667272.mp4', 'uploads/1708504667267.mp3', '2024-02-21 16:37:48', '2024-02-21 16:37:48', '2');
INSERT INTO `tb_medical` VALUES ('33', '黄精', 'uploads/1708504864010.jpg', 'uploads/1708504864017.mp4', 'uploads/1708504864013.mp3', '2024-02-21 16:41:04', '2024-02-21 16:41:04', '3');
INSERT INTO `tb_medical` VALUES ('34', '枳壳', 'uploads/1708504990900.jpg', 'uploads/1708504990912.mp4', 'uploads/1708504990908.mp3', '2024-02-21 16:43:11', '2024-02-21 16:43:11', '4');
INSERT INTO `tb_medical` VALUES ('35', '艾叶', 'uploads/1708505059783.jpg', 'uploads/1708505059790.mp4', 'uploads/1708505059786.mp3', '2024-02-21 16:44:20', '2024-02-21 16:44:20', '5');
INSERT INTO `tb_medical` VALUES ('36', '沉香', 'uploads/1708505133688.jpg', 'uploads/1708505133694.mp4', 'uploads/1708505133690.mp3', '2024-02-21 16:45:34', '2024-02-21 16:45:34', '6');
INSERT INTO `tb_medical` VALUES ('37', '白果', 'uploads/1708505214363.jpg', 'uploads/1708505214366.mp4', 'uploads/1708505214360.mp3', '2024-02-21 16:46:55', '2024-02-21 16:46:55', '7');
INSERT INTO `tb_medical` VALUES ('38', '山香圆叶', 'uploads/1708505289166.jpg', 'uploads/1708505289171.mp4', 'uploads/1708505289168.mp3', '2024-02-21 16:48:09', '2024-02-21 16:48:09', '8');
INSERT INTO `tb_medical` VALUES ('39', '杏', 'uploads/1708505361961.jpg', 'uploads/1708505361966.mp4', 'uploads/1708505361964.mp3', '2024-02-21 16:49:22', '2024-02-21 16:49:22', '9');
INSERT INTO `tb_medical` VALUES ('40', '龙胆草', 'uploads/1708505437265.jpg', 'uploads/1708505437271.mp4', 'uploads/1708505437268.mp3', '2024-02-21 16:50:38', '2024-02-21 16:50:38', '10');
INSERT INTO `tb_medical` VALUES ('41', '金银花', 'uploads/1708505469101.jpg', 'uploads/1708505469107.mp4', 'uploads/1708505469104.mp3', '2024-02-21 16:51:09', '2024-02-21 16:51:09', '11');
INSERT INTO `tb_medical` VALUES ('42', '蒲公英', 'uploads/1708505525963.jpg', 'uploads/1708505525967.mp4', 'uploads/1708505525965.mp3', '2024-02-21 16:52:06', '2024-02-21 16:52:06', '12');
INSERT INTO `tb_medical` VALUES ('43', '苍术', 'uploads/1708506501227.jpg', 'uploads/1708506501229.mp4', 'uploads/1708506501224.mp3', '2024-02-21 17:08:21', '2024-02-21 17:08:21', '13');
INSERT INTO `tb_medical` VALUES ('44', '厚朴', 'uploads/1708506539103.jpg', 'uploads/1708506539410.mp4', 'uploads/1708506539408.mp3', '2024-02-21 17:09:00', '2024-02-21 17:09:00', '14');
INSERT INTO `tb_medical` VALUES ('45', '藿香', 'uploads/1708506569520.jpg', 'uploads/1708506569839.mp4', 'uploads/1708506569836.mp3', '2024-02-21 17:09:30', '2024-02-21 17:09:30', '15');
INSERT INTO `tb_medical` VALUES ('46', '茯苓', 'uploads/1708506593202.jpg', 'uploads/1708506593522.mp4', 'uploads/1708506593519.mp3', '2024-02-21 17:09:54', '2024-02-21 17:09:54', '16');
INSERT INTO `tb_medical` VALUES ('47', '木通', 'uploads/1708506632542.jpg', 'uploads/1708506632860.mp4', 'uploads/1708506632857.mp3', '2024-02-21 17:10:33', '2024-02-21 17:10:33', '17');
INSERT INTO `tb_medical` VALUES ('48', '金钱草', 'uploads/1708506659176.jpg', 'uploads/1708506659483.mp4', 'uploads/1708506659485.mp3', '2024-02-21 17:11:00', '2024-02-21 17:11:00', '18');
INSERT INTO `tb_medical` VALUES ('49', '丁香', 'uploads/1708506683041.jpg', 'uploads/1708506683354.mp4', 'uploads/1708506683351.mp3', '2024-02-21 17:11:24', '2024-02-21 17:11:24', '19');
INSERT INTO `tb_medical` VALUES ('50', '佛手', 'uploads/1708506710648.jpg', 'uploads/1708506710957.mp4', 'uploads/1708506710953.mp3', '2024-02-21 17:11:51', '2024-02-21 17:12:12', '20');
INSERT INTO `tb_medical` VALUES ('51', '香薷', 'uploads/1708507075950.jpg', 'uploads/1708507076265.mp4', 'uploads/1708507076262.mp3', '2024-02-21 17:17:57', '2024-02-21 17:17:57', '21');
INSERT INTO `tb_medical` VALUES ('52', '菊花', 'uploads/1708507109444.jpg', 'uploads/1708507109754.mp4', 'uploads/1708507109750.mp3', '2024-02-21 17:18:30', '2024-02-21 17:18:30', '22');
INSERT INTO `tb_medical` VALUES ('53', '荔枝核', 'uploads/1708507138761.jpg', 'uploads/1708507139067.mp4', 'uploads/1708507139065.mp3', '2024-02-21 17:19:00', '2024-02-21 17:20:51', '24');
INSERT INTO `tb_medical` VALUES ('54', '甘松', 'uploads/1708507236389.jpg', 'uploads/1708507236395.mp4', 'uploads/1708507236392.mp3', '2024-02-21 17:20:37', '2024-02-21 17:20:37', '23');
INSERT INTO `tb_medical` VALUES ('55', '山楂', 'uploads/1708508511771.jpg', 'uploads/1708508512079.mp4', 'uploads/1708508512076.mp3', '2024-02-21 17:41:53', '2024-02-21 17:41:53', '25');
INSERT INTO `tb_medical` VALUES ('56', '鸡内金', 'uploads/1708508550775.jpg', 'uploads/1708508551091.mp4', 'uploads/1708508551088.mp3', '2024-02-21 17:42:32', '2024-02-21 17:42:32', '26');
INSERT INTO `tb_medical` VALUES ('57', '地榆', 'uploads/1708508582858.jpg', 'uploads/1708508583176.mp4', 'uploads/1708508583174.mp3', '2024-02-21 17:43:04', '2024-02-21 17:43:04', '27');
INSERT INTO `tb_medical` VALUES ('58', '白芨', 'uploads/1708508617168.jpg', 'uploads/1708508617478.mp4', 'uploads/1708508617475.mp3', '2024-02-21 17:43:38', '2024-02-21 17:43:38', '28');
INSERT INTO `tb_medical` VALUES ('59', '仙鹤草', 'uploads/1708508650955.jpg', 'uploads/1708508651263.mp4', 'uploads/1708508651266.mp3', '2024-02-21 17:44:12', '2024-02-21 17:44:28', '29');
INSERT INTO `tb_medical` VALUES ('60', '藕节', 'uploads/1708508733431.jpg', 'uploads/1708508733436.mp4', 'uploads/1708508733434.mp3', '2024-02-21 17:45:34', '2024-02-21 17:45:34', '30');
INSERT INTO `tb_medical` VALUES ('61', '麻黄', 'uploads/1708508763668.jpg', 'uploads/1708508763989.mp4', 'uploads/1708508763986.mp3', '2024-02-21 17:46:05', '2024-02-21 17:46:05', '31');
INSERT INTO `tb_medical` VALUES ('62', '川芎', 'uploads/1708508790724.jpg', 'uploads/1708508791035.mp4', 'uploads/1708508825944.mp3', '2024-02-21 17:46:32', '2024-02-21 17:47:06', '32');
INSERT INTO `tb_medical` VALUES ('63', '郁金', 'uploads/1708508869403.jpg', 'uploads/1708508869716.mp4', 'uploads/1708508869713.mp3', '2024-02-21 17:47:50', '2024-02-21 17:47:50', '33');
INSERT INTO `tb_medical` VALUES ('64', '丹参', 'uploads/1708508897756.jpg', 'uploads/1708508898066.mp4', 'uploads/1708508898068.mp3', '2024-02-21 17:48:19', '2024-02-21 17:48:19', '34');
INSERT INTO `tb_medical` VALUES ('65', '桃仁', 'uploads/1708508937014.jpg', 'uploads/1708508937326.mp4', 'uploads/1708508937324.mp3', '2024-02-21 17:48:58', '2024-02-21 17:48:58', '35');
INSERT INTO `tb_medical` VALUES ('66', '益母草', 'uploads/1708508965527.jpg', 'uploads/1708508965849.mp4', 'uploads/1708508965846.mp3', '2024-02-21 17:49:26', '2024-02-21 17:49:35', '36');
INSERT INTO `tb_medical` VALUES ('67', '王不留行', 'uploads/1708509002029.jpg', 'uploads/1708509002032.mp4', 'uploads/1708509002026.mp3', '2024-02-21 17:50:02', '2024-02-21 17:50:12', '37');
INSERT INTO `tb_medical` VALUES ('68', '骨碎补', 'uploads/1708509052265.jpg', 'uploads/1708509052268.mp4', 'uploads/1708509052271.mp3', '2024-02-21 17:50:53', '2024-02-21 17:50:53', '38');
INSERT INTO `tb_medical` VALUES ('69', '莪术', 'uploads/1708509089368.jpg', 'uploads/1708509089373.mp4', 'uploads/1708509089371.mp3', '2024-02-21 17:51:30', '2024-02-21 17:51:30', '39');
INSERT INTO `tb_medical` VALUES ('70', '白芷', 'uploads/1708509122492.jpg', 'uploads/1708509122827.mp4', 'uploads/1708509122822.mp3', '2024-02-21 17:52:03', '2024-02-21 17:52:03', '40');
INSERT INTO `tb_medical` VALUES ('71', '土鳖虫', 'uploads/1708509180910.jpg', 'uploads/1708509181223.mp4', 'uploads/1708509181220.mp3', '2024-02-21 17:53:02', '2024-02-21 17:53:02', '41');
INSERT INTO `tb_medical` VALUES ('72', '天南星', 'uploads/1708509211430.jpg', 'uploads/1708509211756.mp4', 'uploads/1708509211753.mp3', '2024-02-21 17:53:32', '2024-02-21 17:53:32', '42');
INSERT INTO `tb_medical` VALUES ('73', '白芥子', 'uploads/1708509240513.jpg', 'uploads/1708509240833.mp4', 'uploads/1708509240830.mp3', '2024-02-21 17:54:01', '2024-02-21 17:54:01', '43');
INSERT INTO `tb_medical` VALUES ('74', '旋覆花', 'uploads/1708569895445.jpg', 'uploads/1708569895456.mp4', 'uploads/1708569895452.mp3', '2024-02-22 10:44:56', '2024-02-22 10:44:56', '44');
INSERT INTO `tb_medical` VALUES ('75', '桔梗', 'uploads/1708569925658.jpg', 'uploads/1708569925665.mp4', 'uploads/1708569925662.mp3', '2024-02-22 10:45:26', '2024-02-22 10:45:26', '45');
INSERT INTO `tb_medical` VALUES ('76', '瓜蒌子', 'uploads/1708569963497.jpg', 'uploads/1708569963504.mp4', 'uploads/1708569963501.mp3', '2024-02-22 10:46:04', '2024-02-22 10:46:04', '46');
INSERT INTO `tb_medical` VALUES ('77', '前胡', 'uploads/1708570002399.jpg', 'uploads/1708570002406.mp4', 'uploads/1708570002403.mp3', '2024-02-22 10:46:43', '2024-02-22 10:46:43', '47');
INSERT INTO `tb_medical` VALUES ('78', '细辛', 'uploads/1708570029185.jpg', 'uploads/1708570029188.mp4', 'uploads/1708570029182.mp3', '2024-02-22 10:47:10', '2024-02-22 10:47:10', '48');
INSERT INTO `tb_medical` VALUES ('79', '桑白皮', 'uploads/1708570055922.jpg', 'uploads/1708570055925.mp4', 'uploads/1708570055919.mp3', '2024-02-22 10:47:36', '2024-02-22 10:47:36', '49');
INSERT INTO `tb_medical` VALUES ('80', '冬虫夏草', 'uploads/1708570091118.jpg', 'uploads/1708570091112.mp4', 'uploads/1708570091115.mp3', '2024-02-22 10:48:12', '2024-02-22 10:48:12', '50');
INSERT INTO `tb_medical` VALUES ('81', '榧子', 'uploads/1708571707238.jpg', 'uploads/1708571707241.mp4', 'uploads/1708571707235.mp3', '2024-02-22 11:15:08', '2024-02-22 11:15:08', '51');
INSERT INTO `tb_medical` VALUES ('82', '覆盆子', 'uploads/1708571744638.jpg', 'uploads/1708571744644.mp4', 'uploads/1708571744647.mp3', '2024-02-22 11:15:45', '2024-02-22 11:15:45', '52');
INSERT INTO `tb_medical` VALUES ('83', '桂枝', 'uploads/1708571769026.jpg', 'uploads/1708571769022.mp4', 'uploads/1708571769029.mp3', '2024-02-22 11:16:09', '2024-02-22 11:17:22', '53');
INSERT INTO `tb_medical` VALUES ('84', '蛤蚧', 'uploads/1708571799043.jpg', 'uploads/1708571799052.mp4', 'uploads/1708571799047.mp3', '2024-02-22 11:16:39', '2024-02-22 11:17:27', '54');
INSERT INTO `tb_medical` VALUES ('85', '海马', 'uploads/1708571827007.jpg', 'uploads/1708571827014.mp4', 'uploads/1708571827011.mp3', '2024-02-22 11:17:07', '2024-02-22 11:17:07', '55');
INSERT INTO `tb_medical` VALUES ('86', '化橘红', 'uploads/1708571880789.jpg', 'uploads/1708572528841.mp4', 'uploads/1708571880792.mp3', '2024-02-22 11:18:01', '2024-02-22 11:28:49', '56');
INSERT INTO `tb_medical` VALUES ('87', '橘皮', 'uploads/1708571938506.jpg', 'uploads/1708572543640.mp4', 'uploads/1708571938815.mp3', '2024-02-22 11:18:59', '2024-02-22 11:29:04', '57');
INSERT INTO `tb_medical` VALUES ('88', '鹿茸', 'uploads/1708572596231.jpg', 'uploads/1708572596236.mp4', 'uploads/1708572596233.mp3', '2024-02-22 11:29:57', '2024-02-22 11:29:57', '58');
INSERT INTO `tb_medical` VALUES ('89', '木瓜', 'uploads/1708572623250.jpg', 'uploads/1708572623256.mp4', 'uploads/1708572623253.mp3', '2024-02-22 11:30:24', '2024-02-22 11:30:24', '59');
INSERT INTO `tb_medical` VALUES ('90', '牛黄', 'uploads/1708572660789.jpg', 'uploads/1708572660791.mp4', 'uploads/1708572660793.mp3', '2024-02-22 11:31:01', '2024-02-22 11:31:12', '60');
INSERT INTO `tb_medical` VALUES ('91', '女贞子', 'uploads/1708572702744.jpg', 'uploads/1708572703048.mp4', 'uploads/1708572703044.mp3', '2024-02-22 11:31:44', '2024-02-22 11:31:44', '61');
INSERT INTO `tb_medical` VALUES ('92', '硼砂', 'uploads/1708572739440.jpg', 'uploads/1708572739747.mp4', 'uploads/1708572739744.mp3', '2024-02-22 11:32:20', '2024-02-22 11:32:20', '62');
INSERT INTO `tb_medical` VALUES ('93', '千年健', 'uploads/1708572775958.jpg', 'uploads/1708572776277.mp4', 'uploads/1708572776274.mp3', '2024-02-22 11:32:57', '2024-02-22 11:32:57', '63');
INSERT INTO `tb_medical` VALUES ('94', '牵牛子', 'uploads/1708572809796.jpg', 'uploads/1708572810105.mp4', 'uploads/1708572810102.mp3', '2024-02-22 11:33:31', '2024-02-22 11:33:31', '64');
INSERT INTO `tb_medical` VALUES ('95', '麝香', 'uploads/1708572842065.jpg', 'uploads/1708572842381.mp4', 'uploads/1708572842384.mp3', '2024-02-22 11:34:03', '2024-02-22 11:34:03', '65');
INSERT INTO `tb_medical` VALUES ('96', '檀香', 'uploads/1708572875906.jpg', 'uploads/1708572876215.mp4', 'uploads/1708572876212.mp3', '2024-02-22 11:34:37', '2024-02-22 11:34:37', '66');
INSERT INTO `tb_medical` VALUES ('97', '辛夷', 'uploads/1708572903413.jpg', 'uploads/1708572903732.mp4', 'uploads/1708572903729.mp3', '2024-02-22 11:35:04', '2024-02-22 11:35:04', '67');
INSERT INTO `tb_medical` VALUES ('98', '雪莲', 'uploads/1708572934426.jpg', 'uploads/1708572934733.mp4', 'uploads/1708572934730.mp3', '2024-02-22 11:35:35', '2024-02-22 11:35:35', '68');
INSERT INTO `tb_medical` VALUES ('99', '栀子', 'uploads/1708572960571.jpg', 'uploads/1708572960896.mp4', 'uploads/1708572960893.mp3', '2024-02-22 11:36:02', '2024-02-22 11:36:02', '69');
INSERT INTO `tb_medical` VALUES ('100', '紫苏', 'uploads/1708572990564.jpg', 'uploads/1708572990869.mp4', 'uploads/1708572990872.mp3', '2024-02-22 11:36:32', '2024-02-22 11:36:32', '70');
INSERT INTO `tb_medical` VALUES ('101', '柴胡', 'uploads/1708573031961.jpg', 'uploads/1708573130636.mp4', 'uploads/1708573032267.mp3', '2024-02-22 11:37:13', '2024-02-22 11:38:51', '71');
INSERT INTO `tb_medical` VALUES ('102', '鸡血藤', 'uploads/1708573071187.jpg', 'uploads/1708573071193.mp4', 'uploads/1708573071181.mp3', '2024-02-22 11:37:51', '2024-02-22 11:37:51', '72');

-- ----------------------------
-- Table structure for `tb_menu`
-- ----------------------------
DROP TABLE IF EXISTS `tb_menu`;
CREATE TABLE `tb_menu` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `component` varchar(45) NOT NULL,
  `level` smallint(1) NOT NULL DEFAULT '0',
  `name` varchar(30) NOT NULL,
  `path` varchar(30) NOT NULL,
  `pid` int(11) NOT NULL,
  `redirect` varchar(30) NOT NULL,
  `sort` tinyint(3) NOT NULL,
  `title` varchar(10) NOT NULL,
  `icon` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_menu
-- ----------------------------
INSERT INTO `tb_menu` VALUES ('1', 'Layout', '0', 'medical-manager', '/medical-manager', '0', '/medical-manager/list', '1', '药材管理', 'medical');
INSERT INTO `tb_menu` VALUES ('2', '@/views/medical/list.vue', '1', 'list', 'list', '1', '', '2', '药材列表', '');
INSERT INTO `tb_menu` VALUES ('3', 'Layout', '0', 'SysConfig', '/sysconfig', '0', '/sysconfig/index', '3', '系统设置', 'sysconfig');
INSERT INTO `tb_menu` VALUES ('4', '@/views/system-config/index.vue', '1', 'SystemConfig', 'index', '3', '', '4', '系统信息', '');

-- ----------------------------
-- Table structure for `tb_sys`
-- ----------------------------
DROP TABLE IF EXISTS `tb_sys`;
CREATE TABLE `tb_sys` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `audioTime` smallint(3) NOT NULL,
  `videoTime` smallint(3) NOT NULL,
  `lastUpdate` datetime NOT NULL,
  `autoTime` smallint(3) NOT NULL,
  `cabinets` int(6) NOT NULL COMMENT '最小药柜数',
  `picture` varchar(50) NOT NULL COMMENT '药柜背景图片',
  `jump` tinyint(1) NOT NULL COMMENT '是否跳过音频',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of tb_sys
-- ----------------------------
INSERT INTO `tb_sys` VALUES ('1', '1', '1', '2024-02-21 16:28:25', '1', '72', 'uploads/1708499407284.jpg', '1');
