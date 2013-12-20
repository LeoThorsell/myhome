var tellstick = require('telldus-core-js'),
	redis = require("redis"),
        client = redis.createClient();
function tellstickActuator()
{
	this.ipl = null;
	this.init = function(ipl)
	{
		this.ipl = ipl;
		this.ipl.message(function(message){
			console.log(message);
		});
	}
}

