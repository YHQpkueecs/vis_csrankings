<!DOCTYPE html>
<html>
<head>
	<title>江东子弟小组-final project</title>
    <script src="https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js"></script>
    <script src="d3.v3.min.js"></script>

    <style>

        body {
            font: 10px sans-serif;
            margin: 50px;
        }

        .grid .tick {
            stroke: lightgrey;
            opacity: 0.7;
            shape-rendering: crispEdges;
        }

        .grid path {
            stroke-width: 0;
        }

        .axis path {
            fill: none;
            stroke: #bbb;
            shape-rendering: crispEdges;
        }

        .axis text {
            fill: #555;
        }

        .axis line {
            stroke: #e7e7e7;
            shape-rendering: crispEdges;
        }

        .axis .axis-label {
            font-size: 14px;
        }

        .line {
            fill: none;
            stroke-width: 1.5px;
        }

        .dot {
            stroke: transparent;
            stroke-width: 10px;
            cursor: pointer;
        }

        .dot:hover {
            stroke: rgba(68, 127, 255, 0.3);
        }
    </style>


</head>

<body>

    <div class="container">
  <h1 align="center">
  领域排名前十的老师
    </h1>
<p><br><br><br></p>

<!-- 
    <h2 style=" padding:30px 5px 5px 400px">
  城市2017-2018年每一天的AQI
    </h2>
 -->

  <div class="btn-group" data-toggle="buttons" align="center">
    <h3>
        请选择一个领域：
    <label for="" class="btn btn-primary">
        <input type="radio" name="selected_city" onclick = "read_data(this.value, 2010, 2018)" checked="checked" value="AI">AI
    </label>
    <label for="" class="btn btn-primary">
        <input type="radio" name="selected_city" onclick = "read_data(this.value, 2010, 2018)" value="Systems">Systems
    </label>
    <label for="" class="btn btn-primary">
        <input type="radio" name="selected_city" onclick = "read_data(this.value, 2010, 2018)" value="Theory">Theory
    </label>
    <label for="" class="btn btn-primary">
        <input type="radio" name="selected_city" onclick = "read_data(this.value, 2010, 2018)" value="Interdisciplinary Areas">Interdisciplinary Areas
    </label>
    </h3>
  </div>



    <h2 style=" padding:30px 5px 5px 300px">
        Top 10 professor's publication
    </h2>
    <h3 style=" padding:0px 5px 5px 300px">
        （折线图可以通过鼠标进行移动、放大、缩小操作）
    </h3>

    <div id="trendSvg"></div>

    <script type="text/javascript">

    var ai_conference = ["aaai", "ijcai", "cvpr", "eccv", "iccv", "icml", "kdd", "nips", "acl", "emnlp", "naacl", "sigir", "www"]

    var theory_conference = ["focs", "soda", "stoc", "crypto", "eurocrypt", "cav", "lics"]

    function in_this_area(area, conf)//if in this area, return 1
    {
    	let flag = 0;
    	if(area == "AI")
    	{
    		for(let i=0;i<ai_conference.length;i++)
    		{
    			if(ai_conference[i] == conf)
    			{
    				flag = 1;
    				return flag;
    			}
    		}
    	}
    	else if(area == "Theory")
    	{
    		for(let i=0;i<theory_conference.length;i++)
    		{
    			if(theory_conference[i] == conf)
    			{
    				flag = 1;
    				return flag;
    			}
    		}
    	}
    	else{
    		//to be continued
    	}
    	return flag;
    }


    function read_data(area, start_time, end_time)
    {
    	let prof = [];
        path = "generated-author-info-tiny.csv";
    	d3.csv(path, function(csvdata){
    		console.log(csvdata);
    		let id = 0;
    		for(let i=0;i<csvdata.length;i++)
    		{
    			let name = csvdata[i].name;
    			let univ = csvdata[i].dept;
    			let conf = csvdata[i].area;
    			let year = +csvdata[i].year;

    			if(start_time <= year && year <= end_time && in_this_area(area, conf))
    			{
    				if(prof.length == 0)
    				{
    					prof.push({
    						name: name,
    						pub: 1,
    						chosen: 0
    					})
    				}
    				else
    				{
    					if(name == prof[id].name)
    						prof[id].pub++;
    					else
    					{
    						prof.push({
	    						name: name,
	    						pub: 1,
	    						chosen: 0
	    					})
	    					id++;
    					}
    				}
    			}
    		}

    		console.log(prof)

    		if(id == prof.length)
    			console.log("id equals prof.length")

    		let top_ten_prof = []; 

    		for(let k=0;k<10;k++)
    		{
    			let max_pub = 0;
    			let max_id = -1;
    			for(let j=0;j<id;j++)
    				if(prof[j].chosen == 0 && prof[j].pub>max_pub)
    				{
    					max_pub = prof[j].pub;
    					max_id = j;
    				}
    			console.log(max_id)
    			prof[max_id].chosen = 1;
    			top_ten_prof.push(prof[max_id]);

    		}

    		console.log("top_ten_prof is", top_ten_prof)

    		//svg.selectAll(".dots").remove();
    		//svg.selectAll(".line").remove();


    		for(let k=0;k<10;k++)
    		{
    			let data_temp = [];
    			let data = [];
    			for(let year = 1970; year<=2019; year++)
    			{
    				data_temp.push({
                            x: year,
                            y: 0
                            });
    			}

    			for(let i=0;i<csvdata.length;i++)
    			{
    				//let find = 0;
    				if(csvdata[i].name == top_ten_prof[k].name)
    				{
    					let cur_year = csvdata[i].year;
    					data_temp[cur_year-1970].y++;
    				}
    			}
    			console.log("data_temp is", data_temp)
    			console.log("data is", data)
    			data.push(data_temp);
    			main_draw(data);
    		}


    		});

    }

    read_data("AI", 2010, 2018);

    function main_draw(data){

        var colors = [
            'steelblue',
            'green',
            'red',
            'purple'
        ];

        var color1 = [];

        for(let i = 0; i < 4; i++)
        {
            color1.push({
                top: 50*i,
                below: 50*(i+1),
                id: i
            })
        }
        var margin = {top: 2, right: 330, bottom: 3, left: 50},
                width = 1080 - margin.left - margin.right,
                height = 50 - margin.top - margin.bottom;

        var x = d3.scale.linear()
                .domain([2000, 2019])
                .range([0, width]);

        var y = d3.scale.linear()
                .domain([0, 8])
                .range([height, 0]);

        //x轴设置
        var xAxis = d3.svg.axis()
                .scale(x)
                .ticks(10)//调节刻度大小
                .tickSize(-height)
                .tickPadding(10)
                .tickSubdivide(true)
                .orient("bottom");

        //y轴设置
        var yAxis = d3.svg.axis()
                .scale(y)
                .tickPadding(10)
                .tickSize(-width)
                .tickSubdivide(true)
                .orient("left");

        //缩放拖拽
        var zoom = d3.behavior.zoom()
                .x(x)
                .y(y)
                .scaleExtent([-10, 10])//可缩放的范围
                .on("zoom", zoomed);

        var svg = d3.select("#trendSvg").append("svg")
                .call(zoom)
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        svg.append("g")
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height + ")")
                .call(xAxis);

        svg.append("g")
                .attr("class", "y axis")
                .call(yAxis);

        svg.append("g")
                .attr("class", "y axis")
                .append("text")
                .attr("class", "axis-label")
                .attr("transform", "rotate(-90)")
                .attr("y", (-margin.left) + 10)
                .attr("x", -height/2)
                .text('Pubs');

       // svg.selectAll("legend1")
        //         .data(color1)
        //         .enter()
        //         .append("rect")
        //         .attr("x",function(d){return 800;})
        //         .attr("y",function(d){return d.top;})
        //         .attr("width",30)
        //         .attr("height",function(d){return d.below-d.top-20;})
        //         .attr("fill",function(d){return colors[d.id];})
        //         .attr("opacity",1);

        // svg.selectAll("cityname")
        //         .data(color1)
        //         .enter()
        //         .append("text")
        //         .text(function(d){return id2city[d.id];})
        //         .attr("x",850)
        //         .attr("y",function(d,i){return d.top + 18;})
        //         .style("text-anchor","middle");
 
        svg.selectAll(".line").remove();
        svg.selectAll(".dots").remove();

        svg.append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", height);

        var line = d3.svg.line()
                .interpolate("linear")
                .x(function(d) { return x(d.x); })
                .y(function(d) { return y(d.y); });

        svg.selectAll('.line')
                .data(data)
                .enter()
                .append("path")
                .attr("class", "line")
                .attr("clip-path", "url(#clip)")
                .attr('stroke', function(d,i){
                    return colors[i];
                })
                .attr("d", line);


        var points = svg.selectAll('.dots')
                .data(data)
                .enter()
                .append("g")
                .attr("class", "dots")
                .attr("clip-path", "url(#clip)");

        points.selectAll('.dot')
                .data(function(d, index){
                    var a = [];
                    d.forEach(function(point,i){
                        a.push({'index': d.id, 'point': point});
                    });
                    return a;
                })
                .enter()
                .append('circle')
                .attr('class','dot')
                .attr("r", 2)
                .attr('fill', function(d,i){
                    return colors[d.index];
                })
                .attr("transform", function(d) {
                    return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
                );

        function zoomed() {
            svg.select(".x.axis").call(xAxis);
            svg.select(".y.axis").call(yAxis);
            svg.selectAll('path.line').attr('d', line);

            points.selectAll('circle').attr("transform", function(d) {
                return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")"; }
            );
        }

    }
    
</script>



</body>
