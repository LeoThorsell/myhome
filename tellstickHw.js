var tellstick = require('telldus-core-js'),
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
var createDevice = function(actuator){
//	var newDevice = tellstick.
	console.log('create tellstick device is not implemented yet!'); // TODO: implementera
};
var populateDevices = function(){
	var tellstickDevices = tellstick.getDevices();
	var parametersToRead = ['house', 'unit', 'group', 'command']
	tellstickDevices.forEach(function(d){
		d.protocol = tellstick.getProtocol(d.id);
		d.model = tellstick.getModel(d.id);
		parametersToRead.forEach(function(p){
			d[p] = tellstick.getDeviceParameter(d.id, p, '');
		});
		devices.push(d);
	});
};
var performCommand = function(device, command){
	if(device == undefined || device.id == undefined){
		console.log('no device information provided');
		return;
	}
	console.log(command + ' ' + device.id);	
	if(command == 'turnoff'){
		if(tellstick.turnOff(device.id)!=0)
			console.log('error turning off device');
	}
	if(command == 'turnon')
		if(tellstick.turnOn(device.id)!=0)
			console.log('error turning on device');
};
var deviceKeysToCompare = ['protocol', 'house', 'unit'];
var doAction = function(){
	client.blpop('user:1.tellstickActuator:1.raw', 0, function(err, result){
		var actuatorString = result[1];
		var deviceToOperate = -1;
		console.log('actuator hw, command');
		var keyValues = actuatorString.split(';');
		var actuator = {};
		keyValues.forEach(function(keyValue){
			var splitted = keyValue.split(':');
			if(splitted.length != 2)
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
			deviceToOperate = createDevice(actuator);
		};
		performCommand(deviceToOperate, actuator.method);
		doAction();	
	});
};
doAction();
populateDevices();
