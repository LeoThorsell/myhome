var	tellstickHw = require('./tellstickHw.js'),
	tellstickSensor = require('./tellstickSensors.js'),
	ipl = require('./ipl.js');

var sensor = new tellstickSensor.tellstickSensor();
sensor.init(ipl.getModuleContext());

