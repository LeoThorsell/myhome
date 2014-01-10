var seaport = require('seaport'),
	net = require('net');

function tellstickSensor(){
	this.ipl=null;
	this.seaport = seaport.connect('localhost', 4100);
	this.init = function(ipl){
		this.ipl = ipl;
		var self = this;
		this.seaport.get('user:1.tellstickHw', function(ports){
			var port = ports[0];
			var s = net.connect(port.port, port.host, function(){
				selfsocket = s;	
			});
			s.on('data', function(data){
				console.log('sensordata' + data.toString());
				var properties = data.toString().split(';');
				var tellstickDevice = {};
				properties.forEach(function(property){
					var splitted = property.split(':');
					if(splitted[0].length>0)
						tellstickDevice[splitted[0]] = splitted[1];
				});
				console.log(properties);
				self.ipl.triggerChanged({action:'I am the tellstick sensor'});

			});
			s.on('error', function(){
				console.log('error');
			});
		});
	};
};
exports.tellstickSensor = tellstickSensor;
