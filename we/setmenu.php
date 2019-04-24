<?php
include "EasyWechat.class.php";
include "../../private/wechat.config.php";
$weObj = new EasyWechat($options);
$uri0 = $weObj->getOauthRedirect('http://huhusleep.com/we/login.php', '0', 'snsapi_base');
$uri1 = $weObj->getOauthRedirect('http://huhusleep.com/we/login.php', '1', 'snsapi_base');
$uri2 = $weObj->getOauthRedirect('http://huhusleep.com/we/login.php', '2', 'snsapi_base');
$uri11 = $weObj->getOauthRedirect('http://huhusleep.com/we/login.php', '11', 'snsapi_base');
$newmenu = array (
    'button' => array (
        0 => array ('type'=>'view','name'=>'今晚速订','url'=>$uri0),
        1 => array (
            'name' => '用户操作',
            'sub_button' => array (
                0 => array ('type'=>'view','name'=>'待入住订单','url'=>$uri2),
                1 => array ('type'=>'view','name'=>'开始预订','url'=>$uri1),
            ),
        ),
        2 => array (
            'name' => '酒店后台',
            'sub_button' => array (
                0 => array ('type'=>'view','name'=>'订单管理','url'=>$uri11),
            ),
        ),
    )
);
$result = $weObj->createMenu($newmenu);
print_r($result);
