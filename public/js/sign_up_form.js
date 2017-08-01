let regExp  = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
$(document).ready(function(){
	$('input').addClass('w3-round w3-hover-light-gray w3-input w3-border');
	$('input').blur(function(){
		let object = $(this)
		if(object.attr('id')=='strEmail'){
			confirm('Email',false);
		}
		if(object.attr('id')=='strUsername'){
			confirm('Username',false);
		}
		if(object.attr('id')=='strPassword'){
			if(object.val().length < 8){
				object.removeClass('w3-border-green');
				object.addClass('w3-border-red');
				$('.error-Password').text('Password should be longer');
			}else{
				object.removeClass('w3-border-red');
				object.addClass('w3-border-green');
				$('.error-Password').text("");
			}
			$('#strConfirmPassword').val('');
		}
		if(object.attr('id')=='strConfirmPassword'){
			if(object.val() != $('#strPassword').val()){
				object.removeClass('w3-border-green');
				object.addClass('w3-border-red');
				$('.error-Confirm-Password').text('Passwords do not match');
			}else{
				object.removeClass('w3-border-red');
				object.addClass('w3-border-green');
				$('.error-Confirm-Password').text("");
			}
		}
	});
	$('#submit').click(function(){
		sign_up();
	});
});
function sign_up(){
	let email = $('#strEmail'),
		username = $('#strUsername'),
		password = $('#strPassword'),
		confirmPassword = $('#strConfirmPassword');
	$.post('/user/confirm/Email',{data:email.val()},function(r1){
		if(!r1.success){
			alert('Unexpected Error Occurred. Try it later.'); 
			return false;
		}
		if(!r1.available){
			alert('This Email is Already In Use');
			email.focus();
			return false;
		}
		if(email.val().length == 0){
			alert('Enter Email');
			email.focus();
			return false;
		}
		if(!email.val().match(regExp)){
			alert('Invalid Email Template'); 
			email.focus();
			return false;
		}		
		$.post('/user/confirm/Username',{data:username.val()},function(r2){
			if(!r2.success){
				alert('Unexpected Error Occurred. Try it later.'); 
				return false;
			}
			if(!r2.available){
				alert('This Username is Already In Use'); 
				username.focus();
				return false;
			}
			if(username.val().length == 0){
				alert('Enter Username');
				username.focus();
				return false;
			}
			if(password.val().length == 0){
				alert('Enter Password');
				password.focus();
				return false;
			}
			if(password.val().length < 8){
				alert('Password should be longer than 8 letters');
				password.val(''); 
				password.focus();
				return false;
			}
			if(confirmPassword.val().length == 0){
				alert('Enter Confirm Password');
				confirmPassword.focus();
				return false;
			}
			if(password.val() != confirmPassword.val()){
				alert('Passwords do not match');
				confirmPassword.val('');
				password.val('');
				password.focus();
				return false;
			}
			$.post('/user/new',$('form').serialize(),function(r){
				if(r.success){
					$(location).attr('href',r.msg);
				}else{
					alert(r.msg+' Try it later');
				}
			});
		});
	});

}

function confirm(obj){
	let object = $('#str'+obj),
		success = $('.success-'+obj),
		error = $('.error-'+obj)
	if(object.val().length==0){
		object.removeClass('w3-border-green');
		success.text('');
		error.text('');
		return false;
	}
	if(obj=='Email'&&!object.val().match(regExp)){
		object.removeClass('w3-border-green');
		object.addClass('w3-border-red');
		success.text('');
		error.text('Invalid Email Template');
		return false;
	}
	$.post('/user/confirm/'+obj,{data:object.val()},function(r){
		if(!r.success){
			object.addClass('w3-border-red');
			object.removeClass('w3-border-green');
			success.text('');
			error.text('Unexpected Error Occurred. Try it later.');
			return false;
		}
		if(r.available){
			object.addClass('w3-border-green');
			object.removeClass('w3-border-red');
			success.text('Available '+obj);
			error.text('');
		}else{
			object.addClass('w3-border-red');
			object.removeClass('w3-border-green');
			success.text('');
			error.text('This '+obj+' is Already in Use');
		}
	});
	
}