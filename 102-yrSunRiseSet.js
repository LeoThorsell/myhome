/**
 * Copyright 2013 IBM Corp.
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
var http = require('http'),
	xml2js = require('xml2js'),
	util = require('util'),
	url = require('url');

function YrSunRiseSet(n) {
    RED.nodes.createNode(this,n);
    this.topic = n.topic;
	this.risePayload = n.risePayload || 'rise';
	this.setPayload = n.setPayload || 'set';
	this.lon = n.lon;
	this.lat = n.lat;
	var riseSet = new sunRiseSet();
    this.on("close", function() {
		riseSet.close();
    });
	var me = this;
	riseSet.on('rise', function(){
		var msg = {};
		msg.payload = me.risePayload;
		me.send(msg);
	});
	riseSet.on('set', function(){
		var msg = {};
		msg.payload = me.setPayload;
		me.send(msg);
	});
	riseSet.init(this.lon, this.lat);
}
RED.nodes.registerType("YrSunRiseSet",YrSunRiseSet);

function sunRiseSet(){
	this.riseCb = null;
	this.setCb = null;
	this.timeoutId = -1;
	this.on = function(what, cb)
	{
		if(what=='rise' || what=='Rise')
			this.riseCb = cb;
		else if(what =='set' || what=='Set')
			this.setCb = cb;
	}
	this.close = function(){
		if(this.intervalId == -1)
			return;
		clearTimeout(this.timeoutId);
	}
	this.init = function(lon, lat){
		this.lon = lon;
		this.lat = lat;
		this.setNextTime();
	}
	this.setNextTime = function(){
		var today = new Date();
		var tomorrow = new Date();
		tomorrow.setDate(today.getDate()+1);
		console.log(tomorrow);
		var todayString = util.format('%s-%s-%s',       today.getFullYear(), ('00'+(today   .getMonth()+1)).slice(-2), ('00'+ today    .getDate()).slice(-2));
		var tomorrowString = util.format('%s-%s-%s', tomorrow.getFullYear(), ('00'+(tomorrow.getMonth()+1)).slice(-2), ('00' + tomorrow.getDate()).slice(-2));
		var uri = util.format('http://api.yr.no/weatherapi/sunrise/1.0/?lat=%s;lon=%s;from=%s;to=%s',
			this.lat, this.lon, todayString, tomorrowString);
		var options = url.parse(uri);
		var me = this;
		http.get(options, function(res){
			var body = '';
			res.on('data', function(chunk){
				body += chunk;
			});
			res.on('end', function(){
				xml2js.parseString(body, function(err, obj){
					if(err != null)
						return console.log(err);
					me.parse(obj);
				});
			});
		}).on('error', function(e){
			console.log(e);
		});
	};
	this.parse = function(yrObj){
		var riseSets = [];
		yrObj.astrodata.time.forEach(function(t){
			var sun = t.location[0].sun[0].$;
			riseSets.push({type:'set', time: new Date(Date.parse(sun.set))});
			riseSets.push({type:'rise', time: new Date(Date.parse(sun.rise))});
		});
		riseSets.sort(function(a,b){return a.time.getTime()-b.time.getTime();});
		var now = new Date();
		for(var i=0;i<riseSets.length;i++){
			if(riseSets[i].time<=now)
				continue;
			var action = riseSets[i];
			var me = this;
			this.timeoutId = setTimeout(function(){
				console.log('rise/set' + new Date());
				if(action.type == 'rise' && me.riseCb instanceof Function)
					me.riseCb();
				else if(action.type == 'set' && me.setCb instanceof Function)
					me.setCb();
				me.setNextTime();
			}, action.time.getTime()-now.getTime());
			var timeInms = action.time.getTime()-now.getTime();
			console.log('next time sceduled in (ms): ' + timeInms );
			break;
		}	
	};
}
