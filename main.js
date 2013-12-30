var	tellstickHw = require('./tellstickHw.js'),
	tellstickSensor = require('./tellstickSensors.js'),
	iplProcessor = require('./iplProcessor.js'),
	tellstickActuator = require('./tellstickActuator.js'),
	cronScheduler = require('./cronScheduler.js'),
	redis = require("redis"),
        client = redis.createClient(),
	ipl = require('./ipl.js'),
	util = require('util');

var modules = [];
function init(){
	modules.cronScheduler = cronScheduler.cronScheduler; 
	client.smembers('users', function(err, userIds){
		userIds.forEach(function(userId){
			client.smembers('user:' + userId + '.parts', function(err, parts){
				parts.forEach(function(part){
					var splitted = part.split(':');
					if(modules[splitted[0]]==undefined)
						return;
					var part = new modules[splitted[0]]();
					var context = ipl.getModuleContext(userId, splitted[1], splitted[0]);
					part.init(context);
				});
			});
		});
	});
};
var sensor = new tellstickSensor.tellstickSensor();
var iplProc = new iplProcessor.iplProcessor();
var actuator = new tellstickActuator.tellstickActuator();
//var cron = new cronScheduler.cronScheduler();
//sensor.init(ipl.getModuleContext(1, 1, 'tellstickSensor'));
iplProc.init(ipl.getModuleContext(1, 1, 'IplProcessor'));
//actuator.init(ipl.getModuleContext(1, 1, 'tellstickActuator'));
//cron.init(ipl.getModuleContext(1, 1, 'cronScheduler'));
init();
