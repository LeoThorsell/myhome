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
var	util = require('util');
var async = require('async');
var influx = require('influx');

function InfluxLogger(n) {
	RED.nodes.createNode(this,n);
    this.host = n.host;
	this.port = n.port;
	this.username = n.username;
	this.password = n.password;
	this.database = n.database;
	this.tsName = n.tsName;
	this.key = n.key;
	var me = this;
	console.log('starting influx, ' + this.tsName);
	influxClient.init(function(){
		me.on('input', function(msg){
			influxClient.log(me.tsName, msg.payload);
		});
	});
};

RED.nodes.registerType("InfluxLogger", InfluxLogger);

influxClient = {
	initialized: false,
	initCallbacks: [],	
	host: '192.168.0.117',
	port: 8086,
	username: 'nodered',
	password: 'nodered',
	database: 'ThorsellHome',
	client: null,
	init: function(callback){
		if(!this.initialized){
			this.initCallbacks.push(callback);
			var me = this;
			if(this.initCallbacks.length == 1)
				this.connect(function(){
					me.initialized = true;
					for(var i=0;i<me.initCallbacks.length;++i){
						me.initCallbacks[i]();
					}
				});
		}
		else
			callback();
	},
	connect: function(cb){
		console.log(this.host);
		this.client = influx([this.host], this.port, this.username, this.password, this.database);
		this.client.options.hosts = [this.host];
		cb();	
	},
	log: function(key, value){
		var val = parseFloat(value);
		if(isNaN(val)){
			console.log('invalid: ' + ': ' + value);
		   	return;
		}
		var point = {val:val};
		this.client.writePoint(key,point,{},function(){});
	}
};
