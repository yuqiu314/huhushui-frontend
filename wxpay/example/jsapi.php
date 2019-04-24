<?php 
ini_set('date.timezone','Asia/Shanghai');
//error_reporting(E_ERROR);
require_once "../lib/WxPay.Api.php";
require_once "WxPay.JsApiPay.php";
require_once 'log.php';

//初始化日志
$logHandler= new CLogFileHandler("../logs/".date('Y-m-d').'.log');
$log = Log::Init($logHandler, 15);

//打印输出数组信息
function printf_info($data)
{
    foreach($data as $key=>$value){
        echo "<font color='#00ff55;'>$key</font> : $value <br/>";
    }
}

//①、获取用户openid
$tools = new JsApiPay();
$openId = $tools->GetOpenid();

//②、统一下单
$input = new WxPayUnifiedOrder();
$input->SetBody("酒店房费");
$input->SetAttach($_COOKIE['payorder']);
$input->SetOut_trade_no(WxPayConfig::MCHID.date("YmdHis"));
$input->SetTotal_fee($_COOKIE['paymoney']);
$input->SetTime_start(date("YmdHis"));
$input->SetTime_expire(date("YmdHis", time() + 600));
$input->SetGoods_tag("testTag");
$input->SetNotify_url("http://huhusleep.com/tor/user/pay_bid");
$input->SetTrade_type("JSAPI");
$input->SetOpenid($openId);
$order = WxPayApi::unifiedOrder($input);
#echo '<font color="#f00"><b>统一下单支付单信息</b></font><br/>';
#printf_info($order);
$jsApiParameters = $tools->GetJsApiParameters($order);
#echo $jsApiParameters;

//③、在支持成功回调通知中处理成功之后的事宜，见 notify.php
/**
 * 注意：
 * 1、当你的回调地址不可访问的时候，回调通知会失败，可以通过查询订单来确认支付是否成功
 * 2、jsapi支付时需要填入用户openid，WxPay.JsApiPay.php中有获取openid流程 （文档可以参考微信公众平台“网页授权接口”，
 * 参考http://mp.weixin.qq.com/wiki/17/c0f37d5704f0b64713d5d2c37b468d75.html）
 */
?>

<html>
<head>
    <meta http-equiv="content-type" content="text/html;charset=utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1"/> 
    <title>微信支付</title>
<script src="//cdn.bootcss.com/sockjs-client/1.0.0/sockjs.min.js" async></script>
<script type="text/javascript">
function request (type, url, opts, callback) {
    var xhr = new XMLHttpRequest ();
    if (typeof opts === 'function') {
        callback = opts;
        opts = null;
    }
    xhr.open (type, url, true);
    var fd = new FormData ();
    if (type === 'POST' && opts) {
        for (var key in opts) {
            fd.append (key, opts[key]);
        }
    }
    xhr.onload = function () {
        callback (xhr.response);
    };
    xhr.send (opts ? fd : null);
}
function getCookie(name){
    var arr=document.cookie.split('; ');  
    for(var i=0;i<arr.length;i++)    {
        var arr2=arr[i].split('=');               
        if(arr2[0]==name){           
            return arr2[1];       
        }   
    }       
    return '';
}
function showElem(id){
    document.getElementById("pay_view").style.display="none";
    document.getElementById("payed_view").style.display="none";
    document.getElementById("failed_view").style.display="none";
    document.getElementById("success_view").style.display="none";
    document.getElementById(id).style.display="";
}
function confirmSuccess(){
    window.location.href = '/tor/user/booking';
}
//调用微信JS api 支付
function jsApiCall()
{
    var sock = new SockJS('http://'+window.location.hostname+'/broadcast');
    sock.onopen = function() {
        WeixinJSBridge.invoke(
            'getBrandWCPayRequest',
            <?php echo $jsApiParameters; ?>,
            function(res){
                if(res.err_msg == "get_brand_wcpay_request:ok" ) {
                                sock.send(result);
                                showElem("success_view");
                    /*showElem("payed_view");
                    request('POST', '/tor/user/pay_bid', {"bidid":getCookie('payorder')},
                        function(result){
                            if(result == "-1"){
                                showElem("fail_view");
                            }else{
                                sock.send(result);
                                showElem("success_view");
                            }
                });*/
                } else {
                    //alert("支付过程中出现问题，请尝试重新支付");
                }
            }
        );
    }
}

function callpay()
{
    jsApiCall();
}

window.onload = function(){
};

</script>
</head>
<body>
    <div id="pay_view">
    <br/>
    <font color="#9ACD32"><b>您需要支付的金额为<span style="color:#f00;font-size:50px"><?php echo $_COOKIE['paymoney']/100?></span>元</b></font><br/><br/>
        <div align="center">
                <button style="width:210px; height:50px; border-radius: 15px;background-color:#FE6714; border:0px #FE6714 solid; cursor: pointer;  color:white;  font-size:16px;" type="button" onclick="callpay()" >立即支付</button>
        </div>
    </div>
    <div id="payed_view" style="display:none;">
    <br/><br/><br/>
    <b><span style="color:#f00;font-size:50px">请稍候，系统正在完成最后的订单确认...</span></b>
    </div>
    <div id="failed_view" style="display:none;">
    <br/><br/><br/>
    <b><span style="color:#f00;font-size:50px">提交确认失败，请拨打4007-020-021联系客服！</span></b>
    </div>
    <div id="success_view" style="display:none;">
    <br/><br/><br/>
    <b><span style="color:#9ACD32;font-size:50px">确认订单生成完毕，请尽快入住吧！</span></b>
    <div align="center">
        <button style="width:210px; height:50px; border-radius: 15px;background-color:#FE6714; border:0px #FE6714 solid; cursor: pointer;  color:white;  font-size:16px;" type="button" onclick="confirmSuccess()" >好的</button>
    </div>
</body>
</html>
