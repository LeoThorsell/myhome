var tellstick = require('telldus'),
	async = require('async'),
	net = require('net'),
	seaport = require('seaport'),
	seaportClient = seaport.connect('localhost', 4100);

var hw = new tellstickHw();
hw.init();
function tellstickHw(){
	this.devices = [];
	this.server = new server();
	var deviceKeysToCompare = ['protocol', 'house', 'unit', 'model'];
	var validInputs = ['unit', 'house', 'code']; //Todo: add other inputs

	this.init = function(){
		var me = this;
		this.server.init();
		this.server.onData(function(data){
			me.doAction(data);
		});
		var self = this;
		this.populateDevices();
		this.startListen();
	};
	this.startListen = function(){
		var me = this;
		//tellstick.addRawDeviceEventListener(function(arg1, values, arg){
		//	console.log(values);
		//	me.server.sendData(values);	
		//});
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
				newDevice.id = id;
				tasks.push(function(cb){tellstick.getProtocol(id, cb)});
				tasks.push(function(cb){tellstick.getModel(id, cb)});
				parametersToRead.forEach(function(p){
					tasks.push(function(cb){tellstick.getDeviceParameter(id, p, '', cb)});
				});
				deviceTasks.push(function(cb){
					async.parallel(tasks, function(err, results){
						newDevice.protocol = results[0][0];
						newDevice.model = results[1][0];
						for(var i=0;i<parametersToRead.length;i++){
							newDevice[parametersToRead[i]] = results[2+i][0];
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
		if(command == 'turnOff'){
			tellstick.turnOff(device.id, function(err, val){
				if(err!=null)
					console.log('error turning off device');
				console.log('successfully turned off device ' + device.id);
				if(callback instanceof Function)
					callback();
			});
		}
		if(command == 'turnOn'){
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
		if(deviceToOperate == null){
			this.createDevice(actuator, function(device){
				this.performCommand(device, actuator.method);
			});
			return;
		};
		this.performCommand(deviceToOperate, actuator.method);
	};
}
function server(){
	this.listeners = [];
	this.init = function(){
		var self = this;
		var servicePort = seaportClient.register('user:1.tellstickHw');
		net.createServer(function(socket){
			socket.on('connect', function(){
				console.log('listener connected');
				self.listeners.push(socket);
			});
			socket.on('data', function(data){
				console.log('on data' + data);
				if(self.receiver instanceof Function)
					self.receiver(data);
			});
			socket.on('close', function(){
				console.log('listener disconnected');
				listeners.splice(listeners.indexOf(socket),1);
			});
		}).listen(servicePort);
	}
	this.onData = function(callback){
		this.receiver = callback;
	}
	this.sendData = function(data){
		this.listeners.forEach(function(l){
			l.write(data);
		});
	}
}
