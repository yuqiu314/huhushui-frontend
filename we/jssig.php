<?php
include "EasyWechat.class.php";
include "../../private/wechat.config.php";

$weObj = new EasyWechat($options);
$url = $_GET['url'];
$signature = $weObj->getJsSign($url);
echo json_encode($signature);
?>
