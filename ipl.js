var 	seaport = require('seaport'),
	net = require('net'),
	util = require('util'),
	redis = require("redis"),
        client = redis.createClient(),
	seaportServer = seaport.createServer(),
	seaportClient = seaport.connect('localhost', 4100);

var getModuleContext = function(userId, moduleId, moduleName){
	return {
		'userId':userId,
		'moduleId': moduleId,
		'moduleName': moduleName,
		'database': client,
		'seaport': seaport.connect('localhost', 4100),
		'triggerChanged': function(outMessage){
			outMessage.userId = this.userId;
			outMessage.moduleName = this.moduleName;
			outMessage.moduleId = this.moduleId;
			console.log('triggerchanged');
			this.seaport.get('IplProcessor', function(ports){
				var port = ports[0];
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
			var port = this.seaport.register(util.format('user:%s.%s:%s', this.userId, this.moduleName, this.moduleId));
			net.createServer(function(socket){
				socket.on('data', function(data){
					var message = JSON.parse(data.toString());
					callback(message);					
				});
			}).listen(port);
		}
	};
};
client.on("error", function (err) {
	console.log("Redis err: " + err);
});

seaportServer.listen(4100);
exports.getModuleContext = getModuleContext;
