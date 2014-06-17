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
var	util = require('util');
var	tellstick = require('./103-tellstickSensor.js');

function TellstickRemote(n) {
	console.log('starting tellstick remote node');
	RED.nodes.createNode(this,n);

	this.hw = new tellstick.tellstickHw();
	var me = this;
	this.hw.init(function(data){
		if(data.class != 'command')
			return;
		var msg = [{},{}];
		msg[0].payload = 'test';
		msg[1].payload = data;
		me.send(msg)
		console.log(data);
	});

//	tellstick.addRawDeviceEventListener(function(controllerId, data){
//		console.log(controllerid);
//	this.send(data);
//	}.bind(this));
	console.log('done starting tellstick remote node');
};

RED.nodes.registerType("TellstickRemote", TellstickRemote);

