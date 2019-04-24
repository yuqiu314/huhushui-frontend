var lock1 = false;
var lock2 = false;
var lock3 = false;
var lock4 = false;
var soundready = false;

Date.prototype.Format = function(fmt) 
{ //author: meizz 
    var o = { 
        "M+" : this.getMonth()+1,                 //月份 
        "d+" : this.getDate(),                    //日 
        "h+" : this.getHours(),                   //小时 
        "m+" : this.getMinutes(),                 //分 
        "s+" : this.getSeconds(),                 //秒 
        "q+" : Math.floor((this.getMonth()+3)/3), //季度 
        "S"  : this.getMilliseconds()             //毫秒 
    }; 
    if(/(y+)/.test(fmt)) 
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length)); 
    for(var k in o) 
        if(new RegExp("("+ k +")").test(fmt)) 
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length))); 
    return fmt; 
}

function getPreDay(s){
    var y = parseInt(s.substr(0,4), 10);
    var m = parseInt(s.substr(4,2), 10)-1;
    var d = parseInt(s.substr(6,2), 10);
    var dt = new Date(y, m, d-1);
    y = dt.getFullYear();
    m = dt.getMonth()+1;
    d = dt.getDate();
    m = m<10?m:"0"+m;
    d = d<10?d:"0"+d;
    return y + "" + m + "" + d;
}

$(document).ready(function () {
    var sm = soundManager.setup({
        url: "//cdn.bootcss.com/soundmanager2/2.97a.20150601/swf/soundmanager2.swf",
        onready: function() {
            soundready = true;
        },
        ontimeout: function() {
            // Hrmm, SM2 could not start. Missing SWF? Flash blocked? Show an error, etc.?
        },
    });
    var sock = new SockJS('http://'+window.location.hostname+'/broadcast');
    sock.onopen = function() {
        //注册功能还未做完
        //sock.send($.cookie('hotellogin'));
    };
    sock.onmessage = function(e){
        var strmsg = e.data;
        var objmsg = JSON.parse(strmsg);
        for(var i=0;i<objmsg.length;i++){
            if(objmsg[i].t == $.cookie('hotellogin')){
                switch(objmsg[i].h){
                    case "order_new":
                        //alert("您有新的订单！");
                        if(soundready){
                            var mySound = soundManager.createSound({
                                id: 'aSound',
                                url: '/static/sound/newmsg.mp3',
                            });
                            mySound.play();
                            setInterval(function(){
                                soundManager.play('aSound');
                            },25000);
                        }
                        $("#info").text("您有新的订单，快来查看一下！");
                        $('#myModal').modal('show');
                        break;
                    case "order_abandoned":
                        //alert("客户撤销了一个订单。");
                        //window.location.reload();
                        $("#info").text("有客户撤销了一个订单。");
                        $('#myModal').modal('show');
                        break;
                    case "order_accepted":
                        //alert("恭喜，用户接受了您的报价！");
                        //window.location.reload();
                        $("#info").text("有客户接受了您的报价！");
                        $('#myModal').modal('show');
                        break;
                    case "order_payed":
                        if(soundready){
                            var mySound = soundManager.createSound({
                                id: 'aSound',
                                url: '/static/sound/newmsg.mp3'
                            });
                            mySound.play();
                            setInterval(function(){
                                soundManager.play('aSound');
                            },305000);
                        }
                        $("#info").text("有客户已经完成支付！");
                        $('#myModal').modal('show');
                        break;
                }
            }
        }
    };
    $("input[name='btnConfirm']").bind("click", function(){
        if (lock1) {return;}
        lock1 = true;
        var bidid = $(this).attr("bidid");
        var orderid = $(this).attr("orderid");
        $.post('/tor/hotel/bid/update', {"bidprice":$("#"+bidid).val(),"orderid":orderid,"bidid":bidid}, function(result){
            if(result == "-1"){
                $("#info").text("出价失败！");
                $('#myModal').modal('show');
            }else if(result == "1"){
                window.location.href = "/tor/hotel/login";
            }else{
                sock.send(result);
                window.location.href = "/tor/hotel/wait";
            }
            lock1 = false;
        });
    });
    $("input[name='btnUpdate']").bind("click", function(){
        if (lock2) {return;}
        lock2 = true;
        var bidid = $(this).attr("bidid");
        var orderid = $(this).attr("orderid");
        $.post('/tor/hotel/bid/update', {"bidprice":$("#"+bidid).val(),"orderid":orderid,"bidid":bidid}, function(result){
            if(result == "-1"){
                $("#info").text("更新价格失败！");
                $('#myModal').modal('show');
            }else if(result == "1"){
                window.location.href = "/tor/hotel/login";
            }else{
                sock.send(result);
                window.location.href = "/tor/hotel/wait";
            }
            lock2 = false;
        });
    });
    $("input[name='btnComplete']").bind("click", function(){
        if (lock3) {return;}
        lock3 = true;
        var orderid = $(this).attr("orderid");
        $.post('/tor/hotel/bid/complete', {"orderid":orderid}, function(result){
            if(result == "-1"){
                $("#info").text("关闭订单失败，请重试！");
                $('#myModal').modal('show');
            }else if(result == "1"){
                window.location.href = "/tor/hotel/login";
            }else{
                sock.send(result);
                window.location.href = "/tor/hotel/wait";
            }
            lock3 = false;
        });
    });
    $("#btnReload").bind("click", function(){
        window.location.reload();
    });

    var dt = $('.datetime');
    for(i=0;i<dt.length;i++){
        var dn = new Date(dt.eq(i).attr("d_n"));
        dt.eq(i).text(dn.toLocaleString());
    }

    $.get('/tor/servertime',function(result){
        var servertime = (new Date(result)).valueOf();
        var localtime = (new Date()).valueOf();
        var updateBtn = function(){
            var dt = $("input[name='btnConfirm']");
            for(i=0;i<dt.length;i++){
                var biddn = (new Date(dt.eq(i).attr("biddn"))).valueOf();
                var nowtime = (new Date()).valueOf();
                var diff = parseInt(900 + (biddn - servertime + localtime - nowtime)/1000);
                if(diff > 0){
                    dt.eq(i).val("出价，剩余"+diff+"秒");
                }else{
                    dt.eq(i).val("已过期");
                    dt.eq(i).addClass("disabled");
                }
            }
        };
        var updateBtn2 = function(){
            var dt = $("input[name='btnUpdate']");
            for(i=0;i<dt.length;i++){
                var biddn = (new Date(dt.eq(i).attr("biddn"))).valueOf();
                var nowtime = (new Date()).valueOf();
                var diff = parseInt(900 + (biddn - servertime + localtime - nowtime)/1000);
                if(diff > 0){
                    dt.eq(i).val("更改报价，剩余"+diff+"秒");
                }else{
                    dt.eq(i).val("已过期");
                    dt.eq(i).addClass("disabled");
                }
            }
        };
        setInterval(function(){
            updateBtn();
            updateBtn2();
        },1000);
        updateBtn();
        updateBtn2();
    });

    var dt = new Date();
    dt.setHours(06,0,0);
    var pdt = new Date(dt.getTime() - 24*60*60*1000);
    $('#datetimepicker1').datetimepicker({
        defaultDate: pdt,
    });
    $('#datetimepicker2').datetimepicker({
        defaultDate: dt,
    });
    $("input[name='btnDaily']").bind("click", function(){
        if (lock4) {return;}
        lock4 = true;
        var bd = new Date($("#datetimepicker1").find("input").val());
        var ed = new Date($("#datetimepicker2").find("input").val());
        $.post('/tor/hotel/daily', {
            "beginDate":bd.getTime() + bd.getTimezoneOffset()*60000,
            "endDate":ed.getTime() + ed.getTimezoneOffset()*60000}, function(result){
            if(result == "-1"){
                $("#info").text("发送邮件失败，请重试！");
                $('#myModal').modal('show');
            }else if(result == "0"){
                $("#info").text("该时间段内无相关记录。如有必要，请尝试修改查询条件。");
                $('#myModal').modal('show');
            }else{
                $("#info").text("共找到"+result+"条记录，系统已将邮件发出！");
                $('#myModal').modal('show');
            }
            lock4 = false;
        });
    });
});
