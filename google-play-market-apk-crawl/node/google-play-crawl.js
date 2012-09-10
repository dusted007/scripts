#!/usr/local/bin/node


var email = 'tqp860618@gmail.com';
var password = 'go8SML6wxb';
var device_id = '3ACAB901816AF0EC';

if(!email||!password||!device_id){
	console.log('pls set the email,password,device_id with the script');
	process.exit(1);
}

var app_ids = [];
if(process.argv.length>=3){
	for(var i=2;i<process.argv.length;i++){
		app_ids.push(process.argv[i]);	
	}
}
else{
	console.log('google-play-crawl.js'+" [app_id]\n"+'google-play-crawl.js'+" com.google.android.gm");
	process.exit(1);
}


var http =require('http');
var https =require('https');
var querystring = require('querystring');
var fs = require('fs');
var zlib = require('zlib');




var AUTH_TOKEN = "";






var base64 = function () {};
base64.classID = function () {
	return "system.utility.base64"
};
base64.isFinal = function () {
	return !0
};
base64.encString = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
base64.encStringS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
base64.encode = function (e, g, j) {
	if (1 > arguments.length) return null;
	var l = [];
	if (3 <= arguments.length && !0 != j && !1 != j) return null;
	var h = 3 <= arguments.length && j ? this.encStringS : this.encString,
		k = "string" == typeof e;
	if (!k && "object" != typeof e && !(e instanceof Array)) return null;
	2 > arguments.length && (g = !0);
	if (!0 != g && !1 != g) return null;
	for (var m = !k || !g ? 1 : 2, a = "", b = 0, f = 1, c = 0, i = b = 0; i < e.length; i++) {
		for (var b = k ? e.charCodeAt(i) : e[i], d = m - 1; 0 <= d; d--) l[d] = b & 255, b >>= 8;
		for (d = 0; d < m; d++) c = c << 8 & 65280 | l[d], b = 63 << 2 * f & c, c -= b, a += h.charAt(b >> 2 * f), f++, 4 == f && (a += h.charAt(c & 63), f = 1)
	}
	switch (f) {
	case 2:
		a += h.charAt(63 & 16 * c);
		a += "==";
		break;
	case 3:
		a += h.charAt(63 & 4 * c), a += "="
	}
	return a
};
var Utils = {
	toArrayBuffer:function(buffer) {
		var ab = new ArrayBuffer(buffer.length);
		var view = new Uint8Array(ab);
		for (var i = 0; i < buffer.length; ++i) {
			view[i] = buffer[i];
		}
		return ab;
	},
	stringToByteArray: function(c) {
		for (var b = [], a = 0; a < c.length; ++a) b.push(c.charCodeAt(a));
		return b
	},
	serializeInt32: function(c) {
		for (var b = [], a = 0; 0 == a || c && 5 > a; a++) {
			var d = c % 128;
			(c >>>= 7) && (d += 128);
			b.push(d)
		}
		return b
	},
	serializeData: function(c, b, a) {
		var d = [];
		"string" == a ? (d = d.concat(this.serializeInt32(b.length)), d = d.concat(this.stringToByteArray(b))) : "int32" == a ? d = d.concat(this.serializeInt32(b)) : "bool" == a && d.push(b ? 1 : 0);
		return c.concat(d)
	},
	
	postData:function(host,port,path,data,callback){
		var post_data = querystring.stringify(data);
		
		var post_options = {
			host: host,
			port: 443,
			path: path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': post_data.length
			}
		};
		
		//console.log(post_data,host,port,path);
		var post_req = https.request(post_options,callback);
		post_req.write(post_data);
		post_req.end();
		
	}
	
	
}

var MarketSession = {
	generateAssetRequest: function(c) {
		var b = [0, [16], 2, [24], 4, [34], 6, [42], 8, [50], 10, [58], 12, [66], 14, [74], 16, [82], 18, [90], 20, [19, 82], 22, [10], 24, [20]],
			a = [],
			d, f = 0,
			e;
		for (e in b) if ("object" == typeof b[e]) a = a.concat(b[e]);
		else
		switch (d = b[e], d) {
		case 0:
			a = Utils.serializeData(a, c.authToken, "string");
			break;
		case 2:
			a = Utils.serializeData(a, c.isSecure, "bool");
			break;
		case 4:
			a = Utils.serializeData(a, c.sdkVersion, "int32");
			break;
		case 6:
			a = Utils.serializeData(a, c.deviceId, "string");
			break;
		case 8:
			a = Utils.serializeData(a, c.deviceAndSdkVersion, "string");
			break;
		case 10:
			a = Utils.serializeData(a, c.locale, "string");
			break;
		case 12:
			a = Utils.serializeData(a, c.country, "string");
			break;
		case 14:
			a = Utils.serializeData(a, c.operatorAlpha, "string");
			break;
		case 16:
			a = Utils.serializeData(a, c.simOperatorAlpha, "string");
			break;
		case 18:
			a = Utils.serializeData(a, c.operatorNumeric, "string");
			break;
		case 20:
			a = Utils.serializeData(a, c.simOperatorNumeric, "string");
			f = a.length + 1;
			break;
		case 22:
			a = a.concat(Utils.serializeInt32(c.packageName.length + 2));
			break;
		case 24:
			a = Utils.serializeData(a, c.packageName, "string")
		}
		a = [10].concat(Utils.serializeInt32(f)).concat([10]).concat(a);
		
		return base64.encode(a, !1, !0)
	},
	
	requestAsset:function(f) {
		params={'version':2,'request':f};
		Utils.postData('android.clients.google.com',443,'/market/api/ApiRequest',params,
		function(res){
			//res.setEncoding('ascii');
			var buffer='';
			length=0;
			res.on('data', 
				function(data){
					buffer=data;
				}
			);
			res.on('end', function(){
				//zlib	
				zlib.unzip(buffer, function(err, buffer) {
				  if (!err) {
					  //console.log(buffer);
					  buffer=Utils.toArrayBuffer(buffer);
					  
					  for (var a = [], b = "", c, e = new Uint8Array(buffer), d = 0; d < e.byteLength; d++) a.push(e[d]), c = e[d], b = 32 > c || 122 < c ? b + "~" : b + String.fromCharCode(c);
					  (a = /(https?:\/\/[^:]+)/gi.exec(b)) ? (c = a[1], (a = /MarketDA.*?(\d+)/gi.exec(b)) ? (cookieValue = a[1], console.log(c + "#" + cookieValue)) : (console.log("COOKIE: " + b), console.log("ERROR1: Cannot download this app!"))) : (console.log("HTTP: " + b), console.log("ERROR2: Cannot download this app!"))
				  }
				});
			});
			res.on('error', function(){
				console.log('http error');
			});
			
		});
		
	},
	doDownload: function(app_id) {
		c=app_id;
		var b = {};
		b.authToken = AUTH_TOKEN;
		b.isSecure = !0;
		b.sdkVersion = 2009011;
		b.deviceId = device_id;
		b.deviceAndSdkVersion = "passion:9";
		b.locale = "en";
		b.country = "us";
		b.operatorAlpha = 'China Mobile';
		b.simOperatorAlpha = 'China Mobile';
		b.operatorNumeric = '46000';
		b.simOperatorNumeric = '46000';
		b.packageName = app_id;
		require_string=this.generateAssetRequest(b);
		
		//China
		//China Mobile":"46000
		//console.log(b);
		this.requestAsset(require_string);
		
	},
	tryDownload:function(app_ids){
		var URL_LOGIN = "https://www.google.com/accounts/ClientLogin";
		var params = {
			"Email": email,
			"Passwd": password,
			"service": 'androidsecure',
			"accountType": 'HOSTED_OR_GOOGLE'
		};
		that=this;
		Utils.postData('www.google.com',443,'/accounts/ClientLogin',params,function(res){
			res.setEncoding('utf8');
			res.on('data', function(data){
				var regex = /Auth=([a-z0-9=_\-]+)/gi;
				match = regex.exec(data);
				
				if (match && match.length >= 1)
				{
					AUTH_TOKEN = match[1];
				}
				for(var i=0;i<app_ids.length;i++){
					that.doDownload(app_ids[i]);		
				}
				});
			res.on('end', function(e){
				
			});
			res.on('error', function(e){
				console.log('http error',e);
			});
			
		});
		
	}
};
MarketSession.tryDownload(app_ids);

//MarketSession.download(app_id);