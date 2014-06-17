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

function RemoteConverter(n) {
	RED.nodes.createNode(this,n);
	var self = this;
	this.on('input', function(msg){
		var toSend = {};
		if(msg.payload.device != 'thomson')
			return;
		var command = msg.payload.command;
		if(!(command in keymap))
			return;
		toSend.payload = keymap[command];
		self.send(toSend);
	});	
};
var keymap = {
	"0": "Key0",
	"1": "Key1",
	"2": "Key2",
	"3": "Key3",
	"4": "Key4",
	"5": "Key5",
	"6": "Key6",
	"7": "Key7",
	"8": "Key8",
	"9": "Key9",
	"progdown": "Keyleft",
	"progup": "Keyright",
	"left": "Keyleft",
	"right": "Keyright",
	"up": "Keyup",
	"down": "Keydown",
	"ok": "KeyOK",
	"back": "Keylame",
	"exit": "Keylame",
	"menu": "Keymenu",
};
RED.nodes.registerType("RemoteConverter", RemoteConverter);


