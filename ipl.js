var 	seaport = require('seaport'),
	net = require('net'),
	util = require('util'),
	redis = require("redis"),
        client = redis.createClient(),
	seaportServer = seaport.createServer(),
	seaportClient = seaport.connect('localhost', 4100);

var getModuleContext = function(userId, moduleId, moduleName){
	return {
		'user':userId,
		'moduleId': moduleId,
		'moduleName': moduleName,
		'database': client,
		'seaport': seaport.connect('localhost', 4100),
		'triggerChanged': function(outMessage){
			outMessage.userId = this.user;
			outMessage.moduleName = this.moduleName;
			outMessage.moduleId = this.moduleId;
			console.log('triggerchanged');
			this.seaport.get('IplProcessor', function(ports){
				var port = ports[0];
				console.log(ports);
				var conn = net.connect(port.port, port.host, function(){
					console.log('modulecontext net connect');
					conn.write(JSON.stringify(outMessage));
				});
				conn.on('error', function(){
					console.log('error');
				});
			});
		},
		'message': function(callback){
			console.log('iplcontect message');
			var port = this.seaport.register(util.format('user:%s.%s:%s', this.user, this.moduleName, this.moduleId));
			net.createServer(function(socket){
				socket.on('data', function(data){
					var message = JSON.parse(data.toString());
					
				});
			}).listen(port);
		}
	};
};
client.on("error", function (err) {
	console.log("Redis err: " + err);
});

seaportServer.listen(4100);
//client.lpush('user:1.tellstick:1.recivers', 'user.1.tellstickActuator.1');
exports.getModuleContext = getModuleContext;
