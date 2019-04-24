var lock1 = false;
var lock2 = false;
var lock3 = false;

(function($){
    $.getUrlParam = function(name)
{
    var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if (r!=null) return unescape(r[2]); return null;
}
})(jQuery);
$(document).ready(function () {
    var sock = new SockJS('http://'+window.location.hostname+'/broadcast');
    sock.onopen = function() {
        //注册功能还没做完
        //sock.send($.cookie('openid'));
    };
    sock.onmessage = function(e){
    };
    
    var dn = new Date($("#d_n").attr("d_n"));
    $("#d_n").text(dn.toLocaleString());
    
    $("#btnCancel").bind("click", function(){
        if (lock1) {return;}
        lock1 = true;
        $.post('/tor/user/del_acc_order', {"orderid":$(this).attr("orderid")}, function(result){
            if(result == "-1"){
                alert('撤销订单失败！');
            }else{
                sock.send(result);
                window.location.reload();
            }
            lock1 = false;
        });
    });
    $("input[name='btnConfirm']").bind("click", function(){
        if($(this).hasClass("disabled")){return;}
        if(lock2){return;}
        lock2 = true;
        $.post('/tor/user/pay_bid', {"bidid":$(this).attr("bidid")}, function(result){
            if(result == "-1"){
                alert('提交确认失败！请联系客服解决！');
            }else{
                sock.send(result);
                window.location.reload();
            }
            lock2 = false;
        });
    });

    var localtime = Date.parse(new Date());
    $.get('/tor/servertime',function(result){
        var servertime = (new Date(result)).valueOf();
        var localtime = (new Date()).valueOf();
        var updateBtn = function(){
            var dt = $('.datetime');
            for(i=0;i<dt.length;i++){
                var biddn = (new Date(dt.eq(i).attr("bidda"))).valueOf();
                var nowtime = (new Date()).valueOf();
                var diff = parseInt(300 + (biddn - servertime + localtime - nowtime)/1000);
                if(diff > 0){
                    dt.eq(i).val("支付，剩余"+diff+"秒");
                }else{
                    dt.eq(i).val("已过期");
                    dt.eq(i).addClass("disabled");
                }
            }
        };
        setInterval(function(){
            updateBtn();
        },1000);
        updateBtn();
    });
});
