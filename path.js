//由于弹出的标签页中用到了链接，用异步的方式无法正常工作
$.ajaxSetup({ async :false});

(function($){
	$.getUrlParam = function(name){
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
		var r = window.location.search.substr(1).match(reg);
		if (r!=null) return unescape(r[2]); return null;
	}
})(jQuery);
function init(){
	start_lat = parseFloat($.getUrlParam('slat'));//($.getUrlParam('lat')!=null) ? parseFloat($.getUrlParam('lat')) : 39.916527;
	start_lng = parseFloat($.getUrlParam('slng'));//($.getUrlParam('lon')!=null)? parseFloat($.getUrlParam('lon')) : 116.397128;
        end_lat = parseFloat($.getUrlParam('elat'));
        end_lng = parseFloat($.getUrlParam('elng'));

	var center = new qq.maps.LatLng(start_lat, start_lng);
	var map = new qq.maps.Map(document.getElementById("container"),{center:  center,zoom: 13});
        //设置获取驾车线路方案的服务
        var drivingService = new qq.maps.DrivingService({
            map: map,
            //展现结果
            panel: document.getElementById('infoDiv')
        });

        var start = new qq.maps.LatLng(start_lat, start_lng);
        var end = new qq.maps.LatLng(end_lat, end_lng);

        drivingService.setLocation("成都");
        drivingService.setComplete(function(result) {
            if (result.type == qq.maps.ServiceResultType.MULTI_DESTINATION) {
                alert("起终点不唯一");
            }
        });

        drivingService.setError(function(data) {
            alert(data);
        });

        drivingService.search(start, end);
};

$(function(){
	init();
}); 
