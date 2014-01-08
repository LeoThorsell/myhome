var schedule = require('node-schedule');

exports.cronScheduler = function(){
	this.ipl = null;
	this.init = function(ipl){
		this.ipl = ipl;
		console.log(this.ipl.settings);
		var me = this;
		schedule.scheduleJob(this.ipl.settings.cron, function(){
			console.log(me.ipl.settings.cron + ' ' + me.ipl.settings.command);
			me.ipl.triggerChanged({command: me.ipl.settings.command});
		});
	};	
};
