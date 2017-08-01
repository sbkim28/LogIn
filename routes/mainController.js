const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mailConfig = require('../config/mailerConfig');
module.exports = (app,userDTO)=>{
	app.get('/',ensureAuthenticated,(req,res)=>{
		res.render('index');
	});
	app.get('/user/in',ensureDeauthenticated,(req,res)=>{
		res.render('sign_in_form');
	});
	app.post('/user/in',ensureDeauthenticated,(req,res)=>{
		userDTO.findOne({strEmail:req.body.strEmail},(err,data)=>{
			if(err) return res.json({success:false,msg:'Unexpected Error Occured',error:'err'});
			if(!data) return res.json({success:false,msg:'Invalid Email or Password',error:'!data'});
			
			crypto.pbkdf2(req.body.strPassword,data.strSalt,386729,64,'sha512',(err,key)=>{
				if(data.strPassword!=key.toString('base64')) return res.json({success:false,msg:'Invalid Email or Password',error:'!data'});
				if(!data.isVerified) return res.json({success:false,msg:'Not Verified Account',error:'!verified',link:'/user/verify/'+data._id});
				let session = req.session;
				session.isSignIn = true;
				session.thisIp = getUserIp(req);
				session.userId = data._id;
				res.json({success:true})
			});
		});
	});
	app.get('/user/new',ensureDeauthenticated,(req,res)=>{
		res.render('sign_up_form');
	});
	app.post('/user/confirm/:obj',ensureDeauthenticated,(req,res)=>{
		if(req.params.obj == 'Email'){
			userDTO.find({strEmail:req.body.data}).count().exec(returnF);
		}
		if(req.params.obj == 'Username'){
			userDTO.find({strUsername:req.body.data}).count().exec(returnF);
		}
		function returnF(err,num){
			if(err) return res.json({success:false,available:null});
			if(num==null||num==0) return res.json({success:true,available:true});
			res.json({success:true,available:false});
		}
	});
	app.post('/user/new',ensureDeauthenticated,(req,res)=>{
		crypto.randomBytes(64,(err,buf)=>{
			if(err) return res.json({success:false,msg:'Unexpected Error During Encryption.'});
			let strSalt = buf.toString('base64');
			crypto.pbkdf2(req.body.strPassword,strSalt,386729,64,'sha512',(err,key)=>{
				if(err) return res.json({success:false,msg:'Unexpected Error During Encryption.'});
				req.body.strSalt = strSalt;
				req.body.strPassword = key.toString('base64');
				let _dto = new userDTO(req.body);
				console.log(_dto);
				_dto.save((err,data)=>{
					if(err) return res.json({success:false,msg:'Unexpected Error During Save.'});
					res.json({success:true,msg:'/user/verify/'+data._id});
				});
			});
		});
	});
	app.get('/user/verify/:id',ensureDeauthenticated,(req,res)=>{
		userDTO.findById(req.params.id).count().exec((err,num)=>{
			if(num == null|| num == 0) return res.json({error:'!data',msg:'Wrong parameter'});
			res.render('user_verify');
		});
	});
	app.post('/user/verify/mail',ensureDeauthenticated,(req,res)=>{
		userDTO.findById(req.body.id,(err,data)=>{
			if(!data) return res.json({success:false,error:'!data',msg:'No data found'});
			if(sendMail(data.strEmail,'test',setContext(1,data,frontUrl(req)))== false) return res.json({success:false,error:'!mail',msg:'Unexpected Error During Transporting Email.'})
			res.json({success:true,msg:'Mail was sent successfully'});
		});
	});
	app.get('/user/verify/:id/:date',ensureDeauthenticated,(req,res)=>{
		console.log(req.params.date);
		userDTO.findById(req.params.id,(err,data)=>{
			if(!data) return res.json({success:false,error:'!data',msg:'No data found'});
			if(Date.now()-req.params.date>1000*60*5) return res.json({success:false,error:'expired',msg:'Expired Link (5m)'});
			//if(data.isVerified) return res.json({success:false,error:'done',msg:'Already Verified Account'});
			userDTO.update({_id:data._id},{$set:{isVerified:true}},(err)=>{
				if(err) return res.json({success:false,error:'err',msg:'Unexpected Error During Verifying your Account'});
				res.redirect('/user/new/success');
			});
		})
	});
	app.get('/user/new/success',ensureDeauthenticated,(req,res)=>{
		res.render('user_verify_success');
	});
	app.get('/user/out',(req,res)=>{
		session.destory((err)=>{
			if(err) return res.json({success:false,error:'err',msg:'Unexpected Error During Sign Out'})
			res.redirect('/user/in');
		});
	});
	app.get('/javascript/deactive',(req,res)=>{
		res.send("Your browser doesn't support javascript. Active it or use other browser to continue...")
	});
};
function frontUrl(req){
	let frontUrl = req.protocol + '://' + req.get('host');
	return frontUrl
}
function ensureAuthenticated(req,res,next){
	let session = req.session;
	if(session.isSignIn){
		let thisIp = getUserIp(req)
		if(session.thisIp != thisIp){
			console.log('Session Hijacking : '+ thisIp);
			return res.status(403).redirect('/user/in');
		}else{
			return next();
		}
	}else{
		return res.redirect('/user/in');
	}
}
function ensureDeauthenticated(req,res,next){
	let session = req.session;
	if(session.isSignIn){
		return res.redirect('/');
	}else{
		return next();
	}
}
function sendMail(toEmail,subject,context){
	let mailTransport = nodemailer.createTransport(mailConfig);
	let mailOptions = {
			from:mailConfig.auth.user,
			to:toEmail,
			subject:subject,
			html:context
	}
	mailTransport.sendMail(mailOptions,function(error,info){
		if(error){
			console.log(error);
			return false;
		}
		else{
			console.log('Email sent:' + info.response);
			return true;
		}
	});
}
function setContext(i,val,url){
	if(i==1){
		let mailBody = "<h1> Verify Your Account </h1>"
			+ "<article>"
			+ "<p>Click "
			+ "<a href='"
			+ url + "/user/verify/"+val._id+"/";
		mailBody += Date.now();
		mailBody +="'>"
			+ "Here</a> to Verify your Account </p>"
			+ "</article>";
			console.log(mailBody);
		return mailBody;
	}
}
function getUserIp(req){
	let ip = req.headers['x-forwarded-for']||
	req.connection.remoteAddress||
	req.socket.remoteAddress||
	req.connection.socket.remoteAddress;
	return ip;
}