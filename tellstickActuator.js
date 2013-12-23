exports.tellstickActuator = function tellstickActuator()
{
	this.ipl = null;
	this.init = function(ipl)
	{
		this.ipl = ipl;
		this.ipl.message(function(message){
			console.log('actuator' + message);
		});
	}
}

