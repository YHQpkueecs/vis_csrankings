var logger;

function initialize(v_logger){
	logger = v_logger;
	return this;
}

//执行SQL语句
function queryRecord(v_record, callback){
}

module.exports = {
	initialize: initialize,
	query: queryRecord,
};