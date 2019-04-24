var lock = false;

$("#loginButton").bind("click", function(){
        if (lock) {return;}
	if($.trim($("#inputLoginName").val()).length<=0){
		alert("用户名不能为空");
		return;
	}
	if($.trim($("#inputPassword").val()).length<=0) {
		alert("密码不能为空");
		return;
	}
        lock = true;
	$.post('/tor/hotel/login', {"loginame":$("#inputLoginName").val(), "password":$("#inputPassword").val(),}, function(result){
		if(result == "-1"){
			alert('登陆失败！');
		}else{
			window.location.href = "/tor/hotel/wait";
		}
                lock = false;
	});
});
