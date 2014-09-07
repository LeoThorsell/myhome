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
var RED = require(process.env.NODE_RED_HOME+"/red/red");

function Timer(n) {
	RED.nodes.createNode(this,n);
	var self = this;
	this.startInput = n.startInput;
	this.stopOutput = n.stopOutput;
	this.delay = n.delay*1000;
	var me = this;
	this.on('input', function(msg){
		console.log(msg);
		if(msg.payload != me.startInput)
			return;
		if(me.timerHandle != null){
			clearTimeout(me.timerHandle);
		}
		else
			me.send({payload:me.startInput});
		me.timerHandle = setTimeout(function(){
			me.timerHandle = null;
			var toSend = {};
			toSend.payload = me.stopOutput;
			me.send(toSend);
		}, me.delay);
	});
};

RED.nodes.registerType("Timer", Timer);
