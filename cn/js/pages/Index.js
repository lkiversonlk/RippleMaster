function Index(){

};

Index.prototype = {
    Start : function(){
        $("#signupForm").validate({
            rules : {
                account : "required",
                password : {required : true, minlength : 6},
                password_confirmation : {required : true, equalTo : "#password"}
            },
            messages :{
                account : "输入一个账户名",
                password : {
                    required : "设置密码",
                    minlength : "密码长度至少需要6位"
                },
                password_confirmation : {
                    required : "重复密码",
                    equalTo : "两次输入密码不一致"
                }
            },
            errorClass: "help-inline",
            errorElement: "span",
            highlight:function(element, errorClass, validClass)
            {
                $(element).parents('.control-group').addClass('error');
            },
            unhighlight: function(element, errorClass, validClass)
            {
                $(element).parents('.control-group').removeClass('error');
                $(element).parents('.control-group').addClass('success');
            }
        })
    }
}