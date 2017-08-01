const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const userVO = mongoose.Schema({
	strEmail : {
		type:String,
		unique:true,
		required:true
	},
	strUsername:{
		type:String,
		unique:true,
		required:true
	},
	strPassword:{
		type:String,
		required:true
	},
	strSalt:{
		type:String
	},
	dateUserCreated:{
		type:Date,
		default:Date.now()
	},
	isAdmin:{
		type:Boolean,
		default:false
	},
	isVerified:{
		type:Boolean,
		default:false
	}
});
module.exports = mongoose.model('user',userVO);