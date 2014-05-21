(function(){
    $("#signupForm").validate({
        rules : {
            account : "required",
            password : {required : true, minlength : 6},
            password_confirm : {required : true, equalTo : "#password"},
            recaptcha_response_field : {required : true}
        },
        messages :{
            account : "Set an account",
            password : {
                required : "Set your account password",
                minlength : "Password must be minimum 6 characters"
            },
            password_confirm : {
                required : "Enter confirm password",
                equalTo : "Password and Confirm password must match"
            },
            recaptcha_response_field : {
                required : "Enter the recaptcha code"
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
})();