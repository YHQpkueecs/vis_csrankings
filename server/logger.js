function initialize(){
	var fs = require('fs');
	var logger = require("tracer").console();
	return logger;
}

module.exports = {
	initialize: initialize,
};