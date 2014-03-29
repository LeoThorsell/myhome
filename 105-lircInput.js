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
var RED = require(process.env.NODE_RED_HOME+"/red/red");
var	net = require('net');

function LircInput(n) {
	RED.nodes.createNode(this,n);
    this.host = n.host;
	this.port = n.port;
	var me = this;
	var client = new lirc();
	client.host = this.host;
	client.port = this.port;
	client.init();
	client.dataCallback = function(data){
		console.log(data);
		var msg = {};
		msg.payload = data;
		me.send(msg);
	};
};

RED.nodes.registerType("LircInput", LircInput);

var lirc = function(){
	this.host = '';
	this.port = 0;
	this.client = null;
	this.dataCallback = null;
	this.init = function(){
		var self = this;
		this.client = new net.Socket();
		this.client.connect(this.port, this.host,function(){
			console.log('Lirc onnected to host');
		});
		this.client.on('close', function(){
			console.log('Lirc disconnected');
		});
		this.client.on('data', function(data){
			if(typeof(self.dataCallback) != 'function')
				return;
			self.dataCallback(data.toString());
		});
	};
};
