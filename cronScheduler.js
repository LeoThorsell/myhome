var schedule = require('node-schedule');

exports.cronScheduler = function(){
	this.ipl = null;
	this.init = function(ipl){
		console.log('cron init');
		this.ipl = ipl;
		schedule.scheduleJob('*	* * * *', function(){
			console.log('static time module every minute tick...');
		});
	};	
};
