<?php
include "EasyWechat.class.php";
include "../../private/wechat.config.php";
$weObj = new EasyWechat($options);
$menu = $weObj->getMenu();
print_r($menu);
