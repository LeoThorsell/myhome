var util = require('util');

exports.tellstickActuator = function tellstickActuator()
{
	this.ipl = null;
	this.init = function(ipl)
	{
		this.ipl = ipl;
		var me = this;
		this.ipl.message(function(message){
			var ts = me.ipl.settings.tellstick;
			var raw = "";
			for(var key in ts){
				raw += key+':'+ts[key]+';';
			}
			raw += 'method:turn' + message.command + ';';
			console.log(raw);
			me.ipl.database.lpush('user:1.tellstickActuator:1.raw', raw);
		});
	}
}

