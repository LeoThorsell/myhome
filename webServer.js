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
var static = require('node-static');
var http = require('http');
var RED = require(process.env.NODE_RED_HOME+"/red/red");

function WebServer(n) {
	RED.nodes.createNode(this,n);
	console.log(n);
	var file = new static.Server(n.path);
	http.createServer(function (request, response) {
		request.addListener('end', function () {
			file.serve(request, response);
		}).resume();
	}).listen(1881);
};

RED.nodes.registerType('WebServer', WebServer);
