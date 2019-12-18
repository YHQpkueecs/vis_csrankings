var root = __dirname;
var database = require("./server/database/database.js"), logger = require("./server/logger.js").initialize();
database.initialize(logger);
var handle = require("./server/handler/handler").initialize(root, database, logger);
var router = require("./server/router/router").initialize(handle, logger);
var server = require("./server/server").initialize(router, "0.0.0.0", 2468);
//"0.0.0.0" 表示本机地址，2468 是端口号