/*
 * Copyright 2013 Leo Thorsell.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
var sys = require('sys')
var exec = require('child_process').exec;
var RED = require(process.env.NODE_RED_HOME+"/red/red");

function LircOutput(n) {
	RED.nodes.createNode(this,n);
	this.on('input', function(msg){
		sendCommand(
			msg.payload.device,
			msg.payload.command,
			1	
		);
	});
};

RED.nodes.registerType("LircOutput", LircOutput);
//string.Format("irsend send_once {0} {1} -# {2}", command.Device, command.Key, command.Count.ToString()));
var sendCommand = function(device, command, count){
	var command = 'irsend send_once ' + device + ' ' + command + ' -# ' + count;
	child = exec(command, function (error, stdout, stderr) {
		if (error !== null) {
			console.log('exec error: ' + error);
		}
	});
}
