<?php
include "EasyWechat.class.php";
include "../../private/wechat.config.php";

$weObj = new EasyWechat($options);
//$url = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];
$url = $_GET['url'];
//$url = 'http://'.$_SERVER['HTTP_HOST'].'/tor/user/booking?openid=otW5rwRYMJgD7nRDwx17i1YPZWjM';
$signature = $weObj->getJsSign($url);
?>
wx.config({
    debug: true,
        appId: '<?php echo $signature['appid'];?>',
        timestamp: <?php echo $signature['timestamp'];?>,
        nonceStr: '<?php echo $signature['noncestr'];?>',
        signature: '<?php echo $signature['signature'];?>',
        jsApiList: [
                'checkJsApi',
                'onMenuShareTimeline',
                'onMenuShareAppMessage',
                'onMenuShareQQ',
                'onMenuShareWeibo',
                'hideMenuItems',
                'showMenuItems',
                'hideAllNonBaseMenuItem',
                'showAllNonBaseMenuItem',
                'translateVoice',
                'startRecord',
                'stopRecord',
                'onRecordEnd',
                'playVoice',
                'pauseVoice',
                'stopVoice',
                'uploadVoice',
                'downloadVoice',
                'chooseImage',
                'previewImage',
                'uploadImage',
                'downloadImage',
                'getNetworkType',
                'openLocation',
                'getLocation',
                'hideOptionMenu',
                'showOptionMenu',
                'closeWindow',
                'scanQRCode',
                'chooseWXPay',
                'openProductSpecificView',
                'addCard',
                'chooseCard',
                'openCard'
        ]
});
window.latitude = getCookie('latitude');
window.longitude = getCookie('longitude');
window.isGcj0211 = false;

function GetQueryString(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r!=null)return  unescape(r[2]); return null;
}

wx.ready(function () {
    wx.getLocation({
        success: function (res) {
            window.latitude = res['latitude'];
            window.longitude = res['longitude'];
            window.isGcj0211 = false;
            getj();
            var pos = {'latitude':res['latitude'], 'longitude':res['longitude']};
/*            document.write(JSON.stringify(res));
            var callbackfunc = GetQueryString('callback');
            if(callbackfunc != null) {
                callbackfunc(res);
        }*/
        },
            cancel: function (res) {
                alert('您拒绝了提供位置，将使用默认值。您可以再次进入来授权。');
                getj();
            },
            fail: function (res) {
                alert('获取位置失败，将使用默认设置。');
                getj();
            }
    });
});

wx.error(function (res) {
    alert('获取位置发生错误，请尝试刷新。');
});
