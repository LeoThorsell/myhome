var util = require('util'),
	net = require('net'),
	seaport = require('seaport');

exports.tellstickActuator = function tellstickActuator()
{
	this.ipl = null;
	this.socket = null;
	this.seaport = seaport.connect('localhost', 4100);
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
			me.socket.write(raw);
			//me.ipl.database.lpush('user:1.tellstickActuator:1.raw', raw);
		
		});
		this.seaport.get('user:1.tellstickHw', function(ports){
			var port = ports[0];
			var s = net.connect(port.port, port.host, function(){
				me.socket = s;	
			});
			s.on('error', function(){
				console.log('error');
			});
		});
	}
}

