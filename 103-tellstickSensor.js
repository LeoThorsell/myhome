/**
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
var	tellstick = require('telldus');
var async = require('async');

function TellstickSensor(n) {
	RED.nodes.createNode(this,n);
    this.sensorId = n.sensorId;
	this.name = n.name;
	var me = this;
	this.hw = new tellstickHw();
	this.hw.init(function(sensor){
		if(sensor.id!=me.sensorId)
			return;
		if((new Date()-me.lastTime)<5000)
			return;
		var msg = new Array(3);
		for(var i=0;i<3;i++)
			msg[i]={};
		msg[0].payload = sensor.temp;
		msg[1].payload = sensor.humidity;
		msg[2].payload = sensor;
		me.lastTime = new Date();
		me.send(msg);
	});
}
RED.nodes.registerType("TellstickSensor",TellstickSensor);

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
