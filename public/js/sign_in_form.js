$(document).ready(function(){
	$('input').addClass('w3-round w3-hover-light-gray w3-input w3-border');
	$('#submit').click(function(){
		sign_in();
	});
	$('#strPassword').keypress(function(e){
		if(e.which==13){
			sign_in();
		}
	});
});
function sign_in(){
	let strEmail = $('#strEmail').val();
	let regExp = /^[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_\.]?[0-9a-zA-Z])*\.[a-zA-Z]{2,3}$/i;
	if(strEmail.length == 0){
		alert('Enter Email');
		$('#strEmail').focus();
		return false;
	}
	if(!strEmail.match(regExp)){
		alert('Invalid Email Form');
		$('#strEmail').focus();
		return false;
	}
	if($('#strPassword').val().length==0){
		alert('Enter Password');
		$('#strPassword').focus();
		return false;
	}
	$.post('/user/in',$('form').serialize(),function(r){
		if(r.success) $(location).attr('href','/');
		else {
			$('#strPassword').val('');
			alert(r.msg);
			$('.error').text(r.msg);
			if(r.error == '!verified'){
				$('.link').attr('href',r.link);
				$('.link').text('Click Here to Verify your Account.');
			}
		}
	});
}