
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
        var strmsg = e.data;
        var objmsg = JSON.parse(strmsg);
        for(var i=0;i<objmsg.length;i++){
            if(objmsg[i].t == $.cookie('openid')){
                switch(objmsg[i].h){
                    case "bid_new":
                        //alert("有酒店给您报价了，快去看看！");
                        window.location.reload();
                        break;
                    case "bid_update":
                        //alert("有酒店更改了报价，速查！");
                        window.location.reload();
                        break;
                }
            }
        }
    };

    var dn = new Date($("#d_n").attr("d_n"));
    $("#d_n").text(dn.toLocaleString());

    if($.cookie('findhotel')){
        $("#info").text("已通知离您最近的"+$.cookie('findhotel')+"家酒店，请等待他们的实时报价...");
    }

    var lock1 = false;
    $("#btnCancel").bind("click", function(){
        if (lock1) {return;}
        lock1 = true;
        $.post('/tor/user/del_new_order', {"orderid":$(this).attr("orderid")}, function(result){
            if(result == "-1"){
                alert('撤销订单失败！');
            }else{
                sock.send(result);
                window.location.reload();
            }
            lock1 = false;
        });
    });

    var lock2 = false;
    var curbid;
    var confirmDeal = function(bidid) {
        if (lock2) {return;}
        lock2 = true;
        $.post('/tor/user/acc_bid', {"bidid":bidid}, function(result){
            if(result == "-1"){
                alert('提交确认失败！');
            }else{
                sock.send(result);
                window.location.reload();
            }
            lock2 = false;
        });
    };

    $("input[name='btnConfirm']").bind("click", function(){
        if($(this).hasClass("disabled")){return;}
        curbid = $(this).attr("bidid");
        //首先检查是否已经留了电话号码
        $.get('/tor/user/phone',function(result){
            if(result == "-1"){
                $('#myModal').modal('show');
            }
            else{
                confirmDeal(curbid);
            }
        });
    });

    var lock3 = false;
    $("#btnPhone").bind("click", function(){
        if (lock3) {return;}
        lock3 = true;
        $.post('/tor/user/phone', {"phone":$("#inputPhone").val(), "code":$("#inputCode").val()}, function(result){
            if(result == "-1"){
                alert('验证码错误，请重试。');
            }else{
                $('#myModal').modal('hide');
                confirmDeal(curbid);
            }
            lock3 = false;
        });
    });

    var cooldown = 0;
    setInterval(function(){
        if(cooldown > 0){
            $("#btnValid").val("距下一次发送还有"+cooldown+"秒");
            $("#btnValid").addClass("disabled");
            cooldown -= 1;
        }else{
            $("#btnValid").val("发送验证码");
        }
    },1000);
    $("#btnValid").bind("click", function(){
        if(cooldown <= 0){
            cooldown = 120;
            $.post('/tor/user/sendvalidsms', {"phone":$("#inputPhone").val()}, function(result){
                if(result == "-1"){
                    alert('验证短信发送失败，请重试。');
                }else{
                }
            });
        }
    });

    $.get('/tor/servertime',function(result){
        var servertime = (new Date(result)).valueOf();
        var localtime = (new Date()).valueOf();
        var updateBtn = function(){
            var dt = $('.datetime');
            for(i=0;i<dt.length;i++){
                var biddn = (new Date(dt.eq(i).attr("biddn"))).valueOf();
                var nowtime = (new Date()).valueOf();
                var diff = parseInt(900 + (biddn - servertime + localtime - nowtime)/1000);
                if(diff > 0){
                    dt.eq(i).val("确认，剩余"+diff+"秒");
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
