function $(x) {return document.getElementById(x);}
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

function setCookie(name, value, iDay){   
    var oDate=new Date();   
    oDate.setDate(oDate.getDate()+iDay);       
    document.cookie=name+'='+value+';expires='+oDate;
}
function removeCookie(name){   
    setCookie(name, 1, -1);
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
function getUrlParam(name) {
  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||["",""])[1].replace(/\+/g, '%20'))||null;
}

function jsonp(url, callback) {
    var callbackName = 'jsonp_callback_' + Math.round(100000 * Math.random());
    window[callbackName] = function(data) {
        delete window[callbackName];
        document.body.removeChild(script);
        callback(data);
    };

    var script = document.createElement('script');
    script.src = url + (url.indexOf('?') >= 0 ? '&' : '?') + 'callback=' + callbackName;
    document.body.appendChild(script);
}

function baidugeo(){
    //默认为bd09经纬度坐标。
    //允许的值为bd09ll、bd09mc、gcj02、wgs84。
    //bd09ll表示百度经纬度坐标，bd09mc表示百度墨卡托坐标，
    //gcj02表示经过国测局加密的坐标，wgs84表示gps获取的坐标。
    jsonp("http://api.map.baidu.com/geocoder/v2/?ak=zQyGkE6OfnnN3sExid4dgIiz&location="+window.latitude+","+window.longitude+"&output=json&pois=0&coordtype=gcj02ll", 
            function(data) {
                $("address").innerHTML = data.result.formatted_address+'（'+data.result.sematic_description+'）';
            });
}
function getj(){
    if(window.isGcj0211){
        baidugeo();
    }else{
        jsonp("http://apis.map.qq.com/ws/coord/v1/translate/?locations="+window.latitude+","+window.longitude+"&type=1&key=OGZBZ-DVPWW-36LRD-RYWPP-3AGWV-5EBUR&output=jsonp",
        function(data) {
            window.latitude = data.locations[0].lat;
            window.longitude = data.locations[0].lng;
            window.isGcj0211 = true;
            baidugeo();
        });
    }
}


function addopt(obj, val) {
    var opt = document.createElement("option");
    opt.text = opt.value = val;
    obj.add(opt);
}

function writeYears(obj, date) {
    var years = date.getYear()+1900;
    for (var i=years; i<years+3; i++) {
        addopt(obj, i);
    }
}
function writeMonths(obj) {
    for (var i=1; i<13; i++) {
        addopt(obj, Math.floor(i/10) ? i : "0"+i);
    }
}
function writeDate(obj, year, month) {
    var ndate = new Date(1900+year, (parseInt(month)+1), 0);
    var date = ndate.getDate();
    var selectedIndex = (date-1)<obj.selectedIndex ? (date-1) : obj.selectedIndex;
    var len = obj.options.length;
    var i;
    if (date>len)
        for (i=len+1; i<=date; i++) {
            addopt(obj, Math.floor(i/10) ? i : "0"+i);
        }
    else
        for (i=date; i<len; i++) {
            obj.remove(obj.length-1);
        }
    obj.selectedIndex = selectedIndex;
}

function writePrices(obj) {
    for (var i=20; i<=1200; i+=20) {
        addopt(obj, i);
    }
    obj.value = 120;
}
function writeDistance(obj) {
    for (var i=1; i<=10; i+=1) {
        addopt(obj, i);
    }
    obj.value = 2;
}
function writeRoomCount(obj) {
    for (var i=1; i<=10; i++) {
        addopt(obj, i);
    }
    obj.value = 1;
}
function writeDuration(obj) {
    for (var i=1; i<=9; i++) {
        addopt(obj, i);
    }
    obj.value = 1;
}

function changeTotal() {
    $("btnSubmit").value = "总计"+ 
        $("prcv").value*$("roomCount").value*$("duration").value +"元，提交请求";
}

(function (fn) {
    if (document.readyState != 'loading') {
        fn();
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
})(function () {
    window.latitude = 0.0;
    window.longitude = 0.0;
    window.isGcj0211 = true;
    $('btnMap').addEventListener('click', function (){
        var url = "/map.html?lat=";
        url += window.latitude+"&lon="+window.longitude;
        if(getUrlParam('t')) url += "&t=" + getUrlParam('t');
        location.href = url;
    });
    var lock = false;
    $('btnSubmit').addEventListener('click', function (){
        if (lock) {return;}
        lock = true;
        request('POST', '/tor/user/booking', {
            "price":$("prcv").value, "roomtype":$('room').value,
            "latitude":window.latitude, "longitude":window.longitude,
            "distance":$("disv").value, "details":$("details").value,
            "year": $("year").value, "month": $("month").value,
            "day": $("day").value, "roomcount": $("roomCount").value,
            "duration": $("duration").value 
        }, function(result){
            if(result == "-2"){
                alert('您有尚未确认的订单，请确认或者撤销以后继续！');
                window.location.reload();
            }else if(result == "-1"){
                alert('我们遇到一些小问题，请重新尝试发送！');
            }else if(result == "0"){
                alert('对不起，找不到合适的酒店。请确认搜索中心位置是否正确。');
            }else{
                var sock = new SockJS('http://'+window.location.hostname+'/broadcast');
                sock.onopen = function() {
                    sock.send(result);
                    var objmsg = JSON.parse(result);
                    setCookie('findhotel', objmsg.length);
                    window.location.reload();
                };
                sock.onerror = function() {
                    var objmsg = JSON.parse(result);
                    setCookie('findhotel', objmsg.length);
                    window.location.reload();
                };
            }
            lock = false;
        });
    });
    $('year').addEventListener('change', function (){
        writeDate($('day'), parseInt($('year').value)-1900, parseInt($('month').value)-1);
    });
    $('month').addEventListener('change', function (){
        writeDate($('day'), parseInt($('year').value)-1900, parseInt($('month').value)-1);
    });
    var now = new Date();
    writeYears($("year"), now);
    writeMonths($("month"));
    var this_month = now.getMonth()+1;
    if (this_month<10) {this_month = "0"+this_month;}
    $("month").value = this_month;
    writeDate($("day"), now.getYear(), now.getMonth()+1);
    var nowday = now.getDate();
    if (nowday<10){nowday="0"+(now.getDate())*1;}
    $("day").value = nowday;
    writePrices($("prcv"));
    writeDistance($("disv"));
    writeRoomCount($("roomCount"));
    writeDuration($("duration"));
    changeTotal();
    //只有在cookie传进来的才是GPS的坐标，需要转换，其余时候就不需要了
    if(getUrlParam('lat') && getUrlParam('lon')){	
        window.latitude = getUrlParam('lat');
        window.longitude = getUrlParam('lon');
        window.isGcj0211 = true;
        getj();
    }else{
        var oReq = new XMLHttpRequest();
        oReq.onload = function() {
            var signature = JSON.parse(this.responseText);
            wx.config({
                debug: false,
                appId: signature.appid,
                timestamp: signature.timestamp,
                nonceStr: signature.noncestr,
                signature: signature.signature,
                jsApiList: [
                'getLocation',
                ]
            });
            window.latitude = getCookie('latitude');
            window.longitude = getCookie('longitude');
            window.isGcj0211 = false;
            wx.ready(function () {
                wx.getLocation({
                    success: function (res) {
                        window.latitude = res.latitude;
                        window.longitude = res.longitude;
                        window.isGcj0211 = false;
                        getj();
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
        };
        oReq.open("get", "/we/jssig.php?url="+encodeURIComponent(location.href.split('#')[0]), true);
        oReq.send();
    }
});
