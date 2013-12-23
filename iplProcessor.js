var	seaport  = require('seaport'),
        net = require('net'),
	util = require('util'),
        redis = require("redis"),
        client = redis.createClient(),
	seaportServer = seaport.createServer(),
        seaportClient = seaport.connect('localhost', 4100);

exports.iplProcessor = function(){
	this.ipl = null;
	this.init = function(ipl){
		this.ipl = ipl;
		var iplPort = seaportClient.register('IplProcessor');
		var me = this;
		console.log('iplprocessor init');
		net.createServer(function(socket){
			socket.on('data', function(data){
				console.log('iplprocessor data recived');
				var message = JSON.parse(data.toString());
				var userId = message.userId;
				var moduleName = message.moduleName;
				var moduleId = message.moduleId;
				me.notifyReceivers(message);
				delete message.userId;
				delete message.moduleName;
				delete message.moduleId;
				var key = util.format('user:%s.%s.%s', userId, moduleName, moduleId);
				client.lpush(key, data);
				client.ltrim(key, '0', '20');

			});
		}).listen(iplPort);
		console.log('iplprocessor started listen on port: ' + iplPort);
	};
	this.notifyReceivers = function(message){
		var userId = message.userId;
		var moduleName = message.moduleName;
		var moduleId = message.moduleId;
		var key = util.format('user:%s.%s:%s.receivers', userId, moduleName, moduleId);
		console.log(key);
		var me = this;
		this.ipl.database.lrange(key, '0', '-1', function(err, receivers){
			var outMessage = JSON.stringify(message);
			receivers.forEach(function(receiver){
				me.ipl.seaport.get(receiver, function(ports){
					var port = ports[0];
					console.log(port);
					var conn = net.connect(port.port, port.host, function(){
						conn.write(outMessage);
					});
					conn.on('error', function(err){
					        console.log('IplProcessor.notifyreceiver.error ' + err);
					});
				});
			}); 
		});	
	};
};


