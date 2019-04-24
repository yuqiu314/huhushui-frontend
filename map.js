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
	latitude = ($.getUrlParam('lat')!=null) ? parseFloat($.getUrlParam('lat')) : 39.916527;
	longitude = ($.getUrlParam('lon')!=null)? parseFloat($.getUrlParam('lon')) : 116.397128;

	var center = new qq.maps.LatLng(latitude, longitude);
	var map = new qq.maps.Map(document.getElementById("container"),{center:  center,zoom: 13});
	//这个是marker
	var markers = [];
	var marker = new qq.maps.Marker({
		//设置Marker的位置坐标
		position: center,
		//设置显示Marker的地图
		map: map
	});
	//设置Marker的可见性，为true时可见,false时不可见，默认属性为true
	marker.setVisible(true);
	//设置Marker的动画属性为从落下
	marker.setAnimation(qq.maps.MarkerAnimation.DOWN);
	//设置Marker是否可以被拖拽，为true时可拖拽，false时不可拖拽，默认属性为false
	marker.setDraggable(true);
	markers.push(marker);
	var infoWin = new qq.maps.InfoWindow({
		map: map
	});
	qq.maps.event.addListener(marker, 'click', function() {
		infoWin.open();
		infoWin.setContent('<div style="width:120px;height:90px;">' +
			'<input id="btnSetCenter" class="btn btn-sm btn-primary" type="button" value="当前位置" lat="' + 
			marker.getPosition().getLat()+'" lng="' + marker.getPosition().getLng() + '" /></div>');
		infoWin.setPosition(marker);
	});
        qq.maps.event.addListener(infoWin, 'domready', function() {
            var btn = document.getElementById("btnSetCenter");
            qq.maps.event.addDomListener(btn,"click",function(){
                var url = "/tor/user/booking?lat=";
                url += $(this).attr("lat") + "&lon=" + $(this).attr("lng");
                if($.getUrlParam('t')) url += "&t=" + $.getUrlParam('t');
                location.href = url;
            });
        });
	qq.maps.event.addListener(marker, 'dragend', function() {
		latitude = marker.getPosition().getLat();
		longitude = marker.getPosition().getLng();
	});
	var ap = new qq.maps.place.Autocomplete(document.getElementById('keyword'), {location:"成都"});
	var searchService = new qq.maps.SearchService({
		//map : map,
		complete: function(results) {
			//设置回调函数参数
			var pois = results.detail.pois;
			var infoWin = new qq.maps.InfoWindow({
				map: map
			});
			var latlngBounds = new qq.maps.LatLngBounds();
			for (var i = 0, l = pois.length; i < l; i++) {
				var poi = pois[i];
				//扩展边界范围，用来包含搜索到的Poi点
				latlngBounds.extend(poi.latLng);

				(function(n) {
					var marker = new qq.maps.Marker({
						map: map
					});
					marker.setPosition(pois[n].latLng);
					marker.setTitle(i + 1);
					markers.push(marker);
					qq.maps.event.addListener(marker, 'click', function() {
						infoWin.open();
						infoWin.setContent(
'<div style="width:180px;height:30px;">' +
'<input id="btnSetCenter" class="btn btn-xs btn-primary" type="button" value=' +
pois[n].name + ' lat="' + marker.getPosition().getLat()+'" lng="' + 
marker.getPosition().getLng() + '" /></div>');
						infoWin.setPosition(marker);
					});
                                        qq.maps.event.addListener(infoWin, 'domready', function() {
                                            var btn = document.getElementById("btnSetCenter");
                                            qq.maps.event.addDomListener(btn,"click",function(){
                                                var url = "/tor/user/booking?lat=";
                                                url += $(this).attr("lat") + "&lon=" + $(this).attr("lng");
                                                if($.getUrlParam('t')) url += "&t=" + $.getUrlParam('t');
                                                location.href = url;
                                            });
                                        });
                                })(i);
                        }
                        //调整地图视野
                        map.fitBounds(latlngBounds);
		},
			//若服务请求失败，则运行以下函数
			error: function() {
				alert("无法搜索到结果");
			}			

	});
	//清除地图上的marker
	function clearOverlays(overlays) {
		var overlay;
		while (overlay = overlays.pop()) {
			overlay.setMap(null);
		}
	}
	$("#btnMap").bind("click", function(){	
		clearOverlays(markers);
                searchService.setLocation($("#region").val());
		searchService.search($("#keyword").val());
	});
	qq.maps.event.addListener(ap, "confirm", function(res){
		clearOverlays(markers);
                searchService.setLocation($("#region").val());
		searchService.search(res.value);
	});
};

$(function(){
	init();
}); 
