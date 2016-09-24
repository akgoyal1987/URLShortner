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
	}
	request(originalUrl, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    URLModel.create({originalUrl : originalUrl, shortUrl : desiredShortUrl}, function(err, shortURL){
	    	res.render('urlcreated', shortURL);
	    })
	  }else{
	  	req.flash('info', 'url given by you does not seems to be working. please check');
	  	res.redirect('/?originalUrl='+originalUrl+"&desiredShortUrl="+desiredShortUrl);
	  }
	})
};

router.post('/create/ShortUrl', function(req, res){
	var desiredShortUrl = req.body.desiredShortUrl;
	var originalUrl = req.body.originalUrl;
	if(desiredShortUrl && desiredShortUrl.trim()!==""){
		URLModel.findOne({shortUrl : baseUrl+desiredShortUrl}, function(err, urlModalObj){
			if(urlModalObj){
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
	URLModel.findOne({shortUrl : baseUrl+shortUrl}, function(err, urlModalObj){
		if(urlModalObj){
			res.redirect(urlModalObj.originalUrl);
		}else{
			res.send("Invalid Url");
		}
	});
});


router.get('*', function(req, res){
	res.redirect("/");
});
module.exports = router;
