var tellstick = require('telldus'),
	async = require('async'),
	redis = require("redis"),
    client = redis.createClient(),
	client2 = redis.createClient();
var devices = []; 
client.on("error", function (err) {
        console.log("Redis err: " + err);
    });
//tellstick.addRawDeviceEventListener(function(arg1, values, arg){
//	console.log(arguments);
//	client2.lpush('user:1.tellstick:1', values);
//	client2.ltrim('user:1.tellstick:1', '0', '99');
//});
var createDevice = function(actuator, callback){
	console.log(actuator);
	var validInputs = ['unit', 'house', 'code']; //Todo: add other inputs
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
			devices.push(newDevice);
			console.log('new device added: id='+newDevice.id);
			callback(newDevice);
		});
	});
}
var populateDevices = function(callback){
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
					devices.push(newDevice);
					cb();
				});
			});
		});
		async.series(deviceTasks, function(){
			callback();
		});
	});
};
var performCommand = function(device, command, callback){
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
			callback();
		});
	}
	if(command == 'turnOn'){
		tellstick.turnOn(device.id, function(err, val){
			if(err != null)
				console.log('error turning on device');
			console.log('successfully turned off device ' + device.id);
			callback();
		});
	}
};
var deviceKeysToCompare = ['protocol', 'house', 'unit', 'model'];
var doAction = function(){
	client.blpop('user:1.tellstickActuator:1.raw', 0, function(err, result){
		var actuatorString = result[1];
		var deviceToOperate = null;
		console.log('actuator hw, command');
		var keyValues = actuatorString.split(';');
		var actuator = {};
		keyValues.forEach(function(keyValue){
			var splitted = keyValue.split(':');
			if(splitted.length < 2)
				return;
			actuator[splitted[0]]=splitted[1];
		});
		devices.forEach(function loop(device){
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
			createDevice(actuator, function(device){
				performCommand(device, actuator.method, function(){
					doAction();
				});
			});
			return;
		};
		performCommand(deviceToOperate, actuator.method, function(){
			doAction();			 
		} );
	});
};
populateDevices(function(){
	doAction();
});
