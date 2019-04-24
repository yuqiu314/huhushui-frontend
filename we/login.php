<?php
include "EasyWechat.class.php";
include "../../private/wechat.config.php";
$weObj = new EasyWechat($options);
$oauthAccessToken = $weObj->getOauthAccessToken();
//setcookie('openid', $oauthAccessToken['openid'], time()+3600*24, '/', 'huhusleep.com');
if($_GET['state']==0)
{
    header('Location: http://huhusleep.com/tor/user/booking?t=0&openid='.$oauthAccessToken['openid']);
}
else if($_GET['state']==1)
{
    header('Location: http://huhusleep.com/tor/user/booking?t=1&openid='.$oauthAccessToken['openid']);
}
else if($_GET['state']==2)
{
    header('Location: http://huhusleep.com/tor/user/orders?openid='.$oauthAccessToken['openid']);
}
else if($_GET['state']==11)
{
    header('Location: http://huhusleep.com/tor/hotel/wait?openid='.$oauthAccessToken['openid']);
}
else
{
    echo '<p>参数无效，请返回重试</p>';
}
