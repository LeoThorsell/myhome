var http = require('http'),
	xml2js = require('xml2js'),
	util = require('util'),
	url = require('url');

exports.sunRiseSet = function(){
	this.ipl = null;
	this.init = function(ipl){
		this.ipl = ipl;
		//sär = 60.3478 15.7505i
		this.setNextTime();
	};
	this.setNextTime = function(){
		var today = new Date();
		var tomorrow = new Date();
		tomorrow.setDate(today.getDate()+1);
		var todayString = util.format('%s-%s-%s', today.getFullYear(), ('00'+today.getMonth()+1).slice(-2), ('00'+today.getDate()).slice(-2));
		var tomorrowString = util.format('%s-%s-%s', tomorrow.getFullYear(), ('00'+tomorrow.getMonth()+1).slice(-2), ('00' + tomorrow.getDate()).slice(-2));;
		var uri = util.format('http://api.yr.no/weatherapi/sunrise/1.0/?lat=%s;lon=%s;from=%s;to=%s',
			this.ipl.settings.lat, this.ipl.settings.lon, todayString, tomorrowString);
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
			setTimeout(function(){
				console.log('rise/set' + new Date());
				if(action.type == 'rise')
					me.ipl.triggerChanged({command:'Off'});
				else
					me.ipl.triggerChanged({command:'Off'});
				me.setNextTime();
			}, action.time.getTime()-now.getTime());
			break;
		}	
	};
};
