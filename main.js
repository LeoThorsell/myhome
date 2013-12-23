var	tellstickHw = require('./tellstickHw.js'),
	tellstickSensor = require('./tellstickSensors.js'),
	iplProcessor = require('./iplProcessor.js'),
	tellstickActuator = require('./tellstickActuator.js'),
	ipl = require('./ipl.js'),
	util = require('util');

var sensor = new tellstickSensor.tellstickSensor();
var iplProc = new iplProcessor.iplProcessor();
var actuator = new tellstickActuator.tellstickActuator();
sensor.init(ipl.getModuleContext(1, 1, 'tellstickSensor'));
iplProc.init(ipl.getModuleContext(1, 1, 'IplProcessor'));
actuator.init(ipl.getModuleContext(1, 1, 'tellstickActuator'));
