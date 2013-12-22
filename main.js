var	tellstickHw = require('./tellstickHw.js'),
	tellstickSensor = require('./tellstickSensors.js'),
	iplProcessor = require('./iplProcessor.js'),
	ipl = require('./ipl.js'),
	util = require('util');

var sensor = new tellstickSensor.tellstickSensor();
var iplProc = new iplProcessor.iplProcessor();
sensor.init(ipl.getModuleContext(1, 1, 'tellstickSensor'));
iplProc.init(ipl.getModuleContext(1, 1, 'IplProcessor'));
console.log(util.format('%s %s', 'hello', 'world'));
