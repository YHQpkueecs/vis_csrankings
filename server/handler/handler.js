//Worker: 各种处理程序，负责直接包装响应
//注意文件路径以最顶级的index.js为准

var fileType = {
	"json":"application/json",
	"js":"text/plain",
	"tpl":"text/plain",
	"css":"text/css",
	"less":"text/plain",
	"png":"image/png",
	"ico":"image/ico",
	"html":"text/html",
	"csv":"text/comma-separated-values",
	"woff":"application/x-font-woff",
	"ttf":"application/octet-stream",
	"bmp":"application/x-MS-bmp",
	"svg":"image/svg-xml",
	"map":"text/plain",
	"ico":"image/vnd.microsoft.icon",
	"pdf":"application/pdf",
};

function initialize(root, db, logger){
	var resOpt = {
		root:  root
	};

	function handleFile(path, response, next){
		if(typeof handle[path]==='function'){
			next();
			return;
		}
		logger.log("    Handler: File!");
		var t_index = path.lastIndexOf(".")+1;
		var t_path = path.slice(t_index);
		var tt_path = "/client" + path;
		logger.log("                                                 "+tt_path);
		response.status(200).type(fileType[t_path]).sendFile(tt_path.slice(1), resOpt,
			function(err){
				if(err){
					logger.log(err);
					response.status(err.status).end();
				}
				next();
			});
	}

	function handleStart(path, response, next){
		logger.log("    Handler: Start!");
		response.status(200).type("html").sendFile("/client"+path+"/index.html", resOpt,
			function(err){
				if(err){
					logger.log(err);
					response.status(err.status).end();
				}
				next();
			});
	}

	function handle404(path, response, next){
		logger.log("    Handler: File not found for "+ path);
		response.sendStatus(404);
		next();
	}

	function handleUpload(request, response){
		logger.log("    Handler: Upload!");
		db.clear(function(){
			db.insert([request.body], function(){
				db.list(function(){});
			});
		});
	}

	function handleQuery(request, response){
		logger.log("    Handler: Query!");
		var t_record = request.url.replace("/query?name=", "");
		var responseFunc = function(v_result){
			if(!v_result){
				logger.log("    Handler: Query Failed!");
				response.sendStatus(404);
			}else{
				logger.log("    Handler: Query Success! The result is " + v_result);
				response.status(200).jsonp(v_result);
			}
		};
		db.query(t_record, responseFunc);
	}

	var handle = {};
	handle["/"] = handleStart;
	handle["/start"] = handleStart;
	handle["upload"] = handleUpload;
	handle["query"] = handleQuery;
	handle["file"] = handleFile;
	handle["404"] = handle404;
	return handle;
}

exports.initialize = initialize;