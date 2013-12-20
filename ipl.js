var 	seaport = require('seaport'),
	net = require('net'),
	redis = require("redis"),
        client = redis.createClient(),
	seaportServer = seaport.createServer(),
	seaportClient = seaport.connect('localhost', 4100);

var getModuleContext = function(){
	return {
		'user':1,
		'moduleId': 1,
		'moduleName': 'tellstickSensor',
		'database': client,
		'seaport': seaport.connect('localhost', 4100),
		'triggerChanged': function(outMessage){
			outMessage.userId = this.user;
			outMessage.moduleName = this.moduleName;
			outMessage.moduleId = this.moduleId;
			this.seaport.get('IplProcessor', function(ports){
				var port = ports[0];
				var conn = net.connect(port.port, port.host, function(){
					conn.write(JSON.stringify(outMessage));
				});
				conn.on('error', function(){
					console.log('error');
				});
			});
		},
		'message': function(callback){
			var port = this.seaport.register('user:{0}.{1}:{2}'.format(this.user, this.moduleName, this.moduleId));
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
var iplPort = seaportClient.register('IplProcessor');
net.createServer(function(socket){
	socket.on('data', function(data){
		var message = JSON.parse(data.toString());
		var userId = message.userId;
		var moduleName = message.moduleName;
		var moduleId = message.moduleId;
		delete message.userId;
		delete message.moduleName;
		delete message.moduleId;
		client.lpush('user:{0}.{1}.{2}'.format(userId, moduleName, moduleId),data, function(){
			
		});

	});
}).listen(iplPort);
//client.lpush('user:1.tellstick:1.recivers', 'user.1.tellstickActuator.1');
exports.getModuleContext = getModuleContext;
