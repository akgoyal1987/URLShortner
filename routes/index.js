var express = require('express');
var router = express.Router();
var URLModel = require('../models/URLMOdel');
var request = require('request');
var logger = require('../config/logger.js');
var shortid = require('shortid');
var baseUrl = "http://localhost:3000/";

router.get('/', function(req, res, next) {
	var originalUrl = req.query.originalUrl;
	var desiredShortUrl = req.query.desiredShortUrl;
	res.render('index', {originalUrl : originalUrl, desiredShortUrl : desiredShortUrl, baseUrl : baseUrl});
});


var validateUrlAndCreateShortUrl = function(req, res){
	var originalUrl = req.body.originalUrl;
	var desiredShortUrl = req.body.desiredShortUrl;
	if(desiredShortUrl && desiredShortUrl.trim() !== ""){
		desiredShortUrl = baseUrl+desiredShortUrl;		
	}else{
		desiredShortUrl = baseUrl+shortid.generate();
		logger.info("Short Url Generated : "+desiredShortUrl);		
	}
	logger.info("Checking if Given Original Url is Valid Or Not : "+originalUrl);		
	request(originalUrl, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	logger.info("Given Original Url is valid, Inserting Into Database");		
	    URLModel.create({originalUrl : originalUrl, shortUrl : desiredShortUrl}, function(err, shortURL){
	    	if(err){
				logger.info("Error While Inserting Into Database");
				logger.error(err.toString());
				return res.send("Errro While Creating Shorturl, please try after some time.");
			}			
			logger.info("Short Url Created Successfully");
	    	res.render('urlcreated', shortURL);
	    })
	  }else{
	  	req.flash('info', 'url given by you does not seems to be working. please check');
	  	logger.info('Given Original Url does not seems to be valid, redirecting back');
	  	res.redirect('/?originalUrl='+originalUrl+"&desiredShortUrl="+desiredShortUrl);
	  }
	})
};

router.post('/create/ShortUrl', function(req, res){
	var desiredShortUrl = req.body.desiredShortUrl;
	var originalUrl = req.body.originalUrl;
	if(desiredShortUrl && desiredShortUrl.trim()!==""){
		logger.info("Checking if Desired ShortUrl : "+(baseUrl+desiredShortUrl)+" Already Exists or Not");
		URLModel.findOne({shortUrl : baseUrl+desiredShortUrl}, function(err, urlModalObj){
			if(err){
				logger.info("Error While Checking For Existing Short Url");
				logger.error(err.toString());
			}			
			if(urlModalObj){
				logger.info("Desired ShortUrl Already Exists, Redirecting Back");
				req.flash('info', 'Desired Short Url Already Exists');
				return res.redirect('/?originalUrl='+originalUrl+"&desiredShortUrl="+desiredShortUrl);
			}
			validateUrlAndCreateShortUrl(req, res);
		});
	}else{
		validateUrlAndCreateShortUrl(req, res);
	}
});


router.get('/:shortUrl', function(req, res){
	var shortUrl = req.params.shortUrl;
	URLModel.findOneAndUpdate({shortUrl : baseUrl+shortUrl}, { $inc: { accessCount : 1 } }, function(err, urlModalObj){
		if(urlModalObj){
			logger.info("Valid Short Url, Redirecting to : "+shortUrl+", access Count = "+(urlModalObj.accessCount+1));
			res.redirect(urlModalObj.originalUrl);
		}else{
			logger.info("Invalid Shorturl Hit");
			res.send("Invalid Url");
		}
	});
});


router.get('*', function(req, res){
	res.redirect("/");
});
module.exports = router;
