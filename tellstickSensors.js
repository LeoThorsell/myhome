function tellstickSensor(){
	this.ipl=null;

	this.init = function(ipl){
		this.ipl = ipl;
		this.waitForValue();
	};
	this.waitForValue = function(){
	//	'class:command;protocol:sartano;model:codeswitch;code:1010011010;method:turnoff;'
		var that = this;
		this.ipl.database.blpop('user:1.tellstick:1', '0', function(err, result){
			that.waitForValue();//No, it will not fuck up the stack!
			var properties = result[1].split(';');
			var tellstickDevice = {};
			properties.forEach(function(property){
				var splitted = property.split(':');
				if(splitted[0].length>0)
					tellstickDevice[splitted[0]] = splitted[1];
			});
			that.ipl.triggerChanged({action:'I am the tellstick sensor'});
		});
	};
};
exports.tellstickSensor = tellstickSensor;
