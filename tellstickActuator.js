exports.tellstickActuator = function tellstickActuator()
{
	this.ipl = null;
	this.init = function(ipl)
	{
		this.ipl = ipl;
		var me = this;
		this.ipl.message(function(message){
			var dummy = 'class:command;protocol:arctech;model:selflearning;house:10793614;unit:11;group:0;method:turnoff;';
			console.log('actuator ' + message);
			me.ipl.database.lpush('user:1.tellstickActuator:1.raw', dummy);
		});
	}
}

