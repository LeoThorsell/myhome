/*
 * Copyright 2013 Leo Thorsell.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
var http = require('http');
var RED = require(process.env.NODE_RED_HOME+"/red/red");

function dreambox(options){
	var url = options.url;
	var port = options.port;
	return {
		pushKey: function(key){
			if(!(key in dreamboxKeys))
			   return;
			var options = {
				hostname: url,
				port: port,
				path: '/web/remotecontrol?command=' + dreamboxKeys[key],
				method: 'GET'
			};
			var req = http.request(options, function(res){
				res.setEncoding('utf8');
				res.on('data', function (chunk) {
				});
			});
			req.on('error', function(e) {
				  console.log('problem with request: ' + e.message);
			});
			req.end();
		}
	};
}
function Dreambox(n) {
	RED.nodes.createNode(this,n);
	var self = this;
	var box = dreambox({
		url: n.url, 
		port: n.port
	});
	this.on('input', function(msg){
		box.pushKey(msg.payload);	
	});	
};

RED.nodes.registerType("Dreambox", Dreambox);

var dreamboxDefaults = {
	url:'127.0.0.1',
	port:80
};
var dreamboxKeys = {
	Power:			116,
	Key1 :			2  ,
	Key2 :			3  ,
	Key3 :			4  ,
	Key4 :			5  ,
	Key5 :			6  ,
	Key6 :			7  ,
	Key7 :			8  ,
	Key8 :			9  ,
	Key9 :			10 ,
	Key0 :			11 ,
	Keyprevious :		412,
	Keynext	:		407,
	KeyvolumeUp :	115,
	Keymute :			113,
	KeybouquetUp :	402,
	KeyvolumeDown :	114,
	Keylame :			174,
	KeybouquetDown :	403,
	Keyinfo :			358,
	Keyup :			103,
	Keymenu :			139,
	Keyleft :			105,
	KeyOK :			352,
	Keyright :		106,
	Keyaudio :		392,
	Keydown :			108,
	Keyvideo :		393,
	Keyred :			398,
	Keygreen :		399,
	Keyyellow :		400,
	Keyblue :			401,
	Keytv :			377,
	Keyradio :		385,
	Keytext :			388,
	Keyhelp :			138 
};

