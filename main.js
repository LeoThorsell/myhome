var	tellstickHw = require('./tellstickHw.js'),
	tellstickSensor = require('./tellstickSensors.js'),
	iplProcessor = require('./iplProcessor.js'),
	tellstickActuator = require('./tellstickActuator.js'),
	cronScheduler = require('./cronScheduler.js'),
	passThrough = require('./passThrough.js'),
	sunRiseSet = require('./sunRiseSet.js'),
	redis = require("redis"),
        client = redis.createClient(),
	ipl = require('./ipl.js'),
	util = require('util');

var modules = [];
function init(){
	modules.cronScheduler = cronScheduler.cronScheduler; 
	modules.tellstickActuator = tellstickActuator.tellstickActuator;
	modules.passThrough = passThrough.passThrough;
	modules.sunRiseSet = sunRiseSet.sunRiseSet;
	client.smembers('users', function(err, userIds){
		userIds.forEach(function(userId){
			client.smembers('user:' + userId + '.parts', function(err, parts){
				parts.forEach(function(part){
					var splitted = part.split(':');
					if(modules[splitted[0]]==undefined)
						return;
					var part = new modules[splitted[0]]();
					var context = ipl.getModuleContext(userId, splitted[1], splitted[0]);
					client.get(util.format('user:%s.%s:%s', userId, splitted[0], splitted[1]), function(err, data){
						if(data != null){
							context.settings = JSON.parse(data.toString());
						}
						part.init(context);				
					});
				});
			});
		});
	});
};
var iplProc = new iplProcessor.iplProcessor();
iplProc.init(ipl.getModuleContext(1, 1, 'IplProcessor'));
function redis()
{
	client.set('user:1.tellstickActuator:2', JSON.stringify(
	{
		name:'Actuator2', 
		tellstick:{
			'class':'command',
			protocol:'arctech',
			model:'selflearning',
			house:'1074',
			unit:'1'
		}
	}));
}
//redis();
init();
