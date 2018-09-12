$(document).ready(function(e) {  
    sign_in_submit();
 });

 function sign_in_submit(){
    $("#sign-in").submit(function (e) {
        e.preventDefault();
        let username = $("#username").val();
        let password = $("#password").val();
        sign_in_req(username,password);
    });
 }

 function sign_in_req(username,password){
     let payload = {
        username:username,
        password:password 
     }; 

     $.ajax({
        headers: {
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(payload),
        dataType: 'json',
        success: function (res) {
            res = JSON.parse(JSON.stringify(res));
            if(!res.posted){
                let message = res.message;
                $("#error > #error-p").text(message);
            }else{
                $.cookie("username", username, 1);
                window.location = "products"
            }
        },
        error: function (err) {
            $("#error > #error-p").text("Error");
        },
        processData: false,
        type: 'POST',
        url: '/api/login'
      })
 }