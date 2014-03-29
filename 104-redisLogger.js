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
var redis = require('redis');

function RedisLogger(n) {
	RED.nodes.createNode(this,n);
    this.host = n.host;
	this.port = n.port;
	this.key = n.key;
	var me = this;
	redisClient.init(function(){
		me.on('input', function(msg){
			redisClient.log(me.key, msg.payload);
		});
	});
};

RED.nodes.registerType("RedisLogger", RedisLogger);

redisClient = {
	initialized: false,
	initCallbacks: [],	
	host: '192.168.0.137',
	port: 6379,
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
		this.client = redis.createClient(this.port, this.host);	
		var me = this;
		this.client.on('ready', function(){
			cb();
		});
	},
	log: function(key, value){
		//console.log(key + ': ' + value);
		if(isNaN(parseInt(value,10))){
			console.log('invalid: ' + ': ' + value);
		   	return;
		}
		var obj = {};
		obj.value = value;
		obj.time = new Date().getTime();
		this.client.zadd(key, obj.time, '{"v":'+obj.value+',"t":' +obj.time+'}');
	}
};
