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
                account : "Set an account",
                password : {
                    required : "Set your account password",
                    minlength : "Password must be minimum 6 characters"
                },
                password_confirmation : {
                    required : "Enter confirm password",
                    equalTo : "Password and Confirm password must match"
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