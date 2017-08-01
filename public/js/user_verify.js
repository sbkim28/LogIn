$(document).ready(function(){
	$('#transport').click(function(){
		$(this).attr('disabled','disabled')
		let _str = $(location).attr('href').split('/')
		let id = _str[_str.length-1]=='' ? _str[_str.length-2] : _str[_str.length-1];
		$.post('/user/verify/mail',{id:id},function(r){
			alert(r.msg);
			if(r.success) $('.success').text(r.msg);
			else $('.error').text(r.msg);
		});
	});
});