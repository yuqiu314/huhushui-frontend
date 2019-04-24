var lock = false;
$("#btnReg").bind("click", function(){
    if (lock) {return;}
    if($.trim($("#inputName").val()).length<=0){
        alert("酒店名不能为空");
        return;
    }
    if($.trim($("#inputLoginName").val()).length<=0){
        alert("登陆名不能为空");
        return;
    }
    if($.trim($("#inputPassword").val()).length<=0) {
        alert("密码不能为空");
        return;
    }
    if($.trim($("#inputEmail").val()).length<=0) {
        alert("邮箱不能为空");
        return;
    }
    lock = true;
    $.post('/tor/hotel/reg', {"name":$("#inputName").val(), 
        "loginame":$("#inputLoginName").val(), 
        "password":$("#inputPassword").val(),
        "email":$("#inputEmail").val(),
        "phone":$("#inputPhone").val()
    }, function(result){
        if(result == "-2"){
            alert("酒店名不存在，请确认！");
        }else if(result == "-1"){
            alert("注册失败，登陆名重复！");
        }else if(result == "-3"){
            alert("注册失败，该酒店已经注册！");
        }else{
            window.location.href = "/tor/hotel/wait";
        }
        lock = false;
    });
});
