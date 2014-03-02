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
// The main node definition - most things happen in here
function TellstickActuator(n) {
	//class:command;protocol:arctech;model:selflearning;house:7462818;unit:1;group:0;method:turnoff;
	RED.nodes.createNode(this,n);
    this.house = n.house;
	this.unit = n.unit;
	this.name = n.name;
	var me = this;
	this.hw = new tellstickHw();
	this.hw.init(function(){
		me.on('input', function(msg){
			var command =  util.format('class:command;protocol:arctech;model:selflearning-switch;house:%s;unit:%s;group:0;method:',
									   this.house, this.unit)
			console.log('tellstickdevices populated');
			if(msg.payload == 'turnon')
				me.hw.doAction(command + 'turnon');
			else if(msg.payload == 'turnoff')
				me.hw.doAction(command + 'turnoff');		
		});
	});
}
RED.nodes.registerType("TellstickActuator",TellstickActuator);

function tellstickHw(){
	this.devices = [];
	var deviceKeysToCompare = ['protocol', 'house', 'unit', 'model'];
	var validInputs = ['unit', 'house', 'code']; //Todo: add other inputs

	this.init = function(callback){
		this.populateDevices(callback);
	};
	this.createDevice = function(actuator, callback){
			var me = this;
			tellstick.addDevice(function(err, id){
			var newDevice = {};
			newDevice.id = id;
			newDevice.protocol = actuator.protocol;
			newDevice.model = actuator.model;
			var tasks = [];
			tasks.push(function(cb){tellstick.setProtocol(newDevice.id, newDevice.protocol, cb);});
			tasks.push(function(cb){tellstick.setModel(newDevice.id, newDevice.model, cb);});
			for(key in actuator){
				if(validInputs.indexOf(key)<0)
					continue;
				if(actuator[key] == undefined || actuator[key].length == 0 )
					continue;
				newDevice[key] = actuator[key];
				(function(k){
					tasks.push(function(cb){tellstick.setDeviceParameter(newDevice.id, k, newDevice[k], cb)});
				})(key);
			}
			async.parallel(tasks, function(err, results){
				me.devices.push(newDevice);
				console.log('new device added: id='+newDevice.id);
				if(callback instanceof Function)
					callback(newDevice);
			});
		});
	}
	this.populateDevices = function(callback){
		var self = this;
		tellstick.getDevices(function(err, tellstickDevices){
			var parametersToRead = ['house', 'unit'];
			var deviceTasks = [];
			tellstickDevices.forEach(function(d){
				var id = d.id;
				var tasks = [];
				var newDevice = {};
				newDevice.protocol = d.protocol;
				newDevice.model = d.model;
				newDevice.id = id;
				//tasks.push(function(cb){tellstick.getProtocol(id, cb)});
				//tasks.push(function(cb){tellstick.getModel(id, cb)});
				parametersToRead.forEach(function(p){
					tasks.push(function(cb){tellstick.getDeviceParameter(id, p, '', cb)});
				});
				deviceTasks.push(function(cb){
					async.series(tasks, function(err, results){
						//newDevice.protocol = results[0][0];
						//newDevice.model = results[1][0];
						for(var i=0;i<parametersToRead.length;i++){
							newDevice[parametersToRead[i]] = results[i][0];
						}
						self.devices.push(newDevice);
						cb();
					});
				});
			});
			async.series(deviceTasks, function(){
				if(typeof(callback) == "function")
					callback();
			});
		});
	};
	this.performCommand = function(device, command, callback){
		if(device == undefined || device.id == undefined){
			console.log('no device information provided');
			return;
		}
		console.log(command + ' ' + device.id);	
		if(command == 'turnoff'){
			tellstick.turnOff(device.id, function(err, val){
				if(err!=null)
					console.log('error turning off device');
				console.log('successfully turned off device ' + device.id);
				if(callback instanceof Function)
					callback();
			});
		}
		if(command == 'turnon'){
			tellstick.turnOn(device.id, function(err, val){
				if(err != null)
					console.log('error turning on device');
				console.log('successfully turned on device ' + device.id);
				if(callback instanceof Function)
					callback();
			});
		}
	};
	this.doAction = function(actuatorString){
		var deviceToOperate = null;
		console.log('actuator hw, command');
		var keyValues = actuatorString.toString().split(';');
		var actuator = {};
		keyValues.forEach(function(keyValue){
			var splitted = keyValue.split(':');
			if(splitted.length < 2)
				return;
			actuator[splitted[0]]=splitted[1];
		});
		this.devices.forEach(function loop(device){
			if(loop.stop)
				return;
			var correctDevice = true;
			for(key in device){
				if(deviceKeysToCompare.indexOf(key) == -1)
					continue;
				if(device[key] != actuator[key]){
					correctDevice = false;
					break;
				}
			}
			if(!correctDevice)
				return;
			loop.stop = true;
			deviceToOperate = device;
		});
		var me = this;
		if(deviceToOperate == null){
			this.createDevice(actuator, function(device){
				me.performCommand(device, actuator.method);
			});
			return;
		};
		this.performCommand(deviceToOperate, actuator.method);
	};
}
