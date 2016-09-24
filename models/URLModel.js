var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var URLModelSchema = new Schema({
	originalUrl : String,
	shortUrl:String,
  	created_at :{type:Date, default: Date.now},
  	accessCount : {type : Number, default : 0}
});
module.exports = mongoose.model('URLModel', URLModelSchema,'URLModel');
