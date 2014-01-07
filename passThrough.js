exports.passThrough = function(){
	this.ipl = null;
	this.init = function(ipl){
		this.ipl = ipl;
		var me = this;
		this.ipl.message(function(message){
			me.ipl.triggerChanged(message);
		});
	};
}
