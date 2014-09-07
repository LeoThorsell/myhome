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
var tellstick = require('telldus');

function TellstickRemote(n) {
	console.log('starting tellstick remote node');
	RED.nodes.createNode(this,n);
	this.house = n.house;
	this.unit = n.unit;
	this.hw = new tellstickHw();
	var me = this;
	this.lastCommmand = '';
	this.lastCommandTime = 0;
	this.hw.init(function(data){
		if(data.class != 'command')
			return;
		if(data.protocol != 'arctech')
			return;
		if(data.house != me.house)
			return;
		if(data.unit != me.unit)
			return;
		var time = new Date();
		if(me.lastCommand == data.method && time - me.lastCommandTime<2000)
			return;
		me.lastCommandTime = time;
		me.lastCommand = data.method;
		console.log(data);
		var msg = {};
		msg.payload = data.method;
		me.send(msg)
	});

	console.log('done starting tellstick remote node');
};

RED.nodes.registerType("TellstickRemote", TellstickRemote);

function tellstickHw(){
	this.init = function(callback){
		var me = this;
		tellstick.addRawDeviceEventListener(function(err, data){
			var obj = {};
			var propertyStrings = data.split(';');
			propertyStrings.forEach(function(propertyString){
				var keyValue = propertyString.split(':');
				obj[keyValue[0]]=keyValue[1];
			});
			callback(obj);
		});
	};
}
