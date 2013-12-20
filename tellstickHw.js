var tellstick = require('telldus-core-js'),
	redis = require("redis"),
        client = redis.createClient();
var devices = []; 
client.on("error", function (err) {
        console.log("Redis err: " + err);
    });

tellstick.addRawDeviceEventListener(function(arg1, values, arg){
	client.lpush('user:1.tellstick:1', values);
	client.ltrim('user:1.tellstick:1', '0', '99');
});
var createDevice = function(actuator){
//	var newDevice = tellstick.
};
var doAction = function(){
	client.blpop('user:1.tellstickActuator:1', 0, function(err, result){
		doAction();
		var actuator = result[1];
		var deviceToOperate = null;
		devices.forEach(function(device){
			if(deviceToOperate == null){
				deviveToOperate = device;
				for(key in device){
					if(key == 'command')
						continue;
					if(devic[key] == actuator[key])
						continue;
					deviceToOperate = null;
				}
			}
		});
		if(deviceToOperate == null){
			deviceToOperate = createDevice(actuator);
		};
		
	});
};
//tellstick.setDeviceParameter(2, 'test', '1');
