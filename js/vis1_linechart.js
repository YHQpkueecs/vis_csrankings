// global vars
var ai_conference = ["aaai", "ijcai", "cvpr", "eccv", "iccv", "icml", "kdd",
    "nips", "acl", "emnlp", "naacl", "sigir", "www"
];
var theory_conference = ["focs", "soda", "stoc", "crypto", "eurocrypt",
    "cav", "lics"
];
var systems_conference = ["asplos", "isca", "micro", "sigcomm", "nsdi",
    "ccs", "oakland", "usenixsec", "sigmod", "vldb", "icde", "pods",
    "dac", "iccad", "emsoft", "rtas", "rtss", "hpdc", "ics", "sc",
    "mobicom", "mobisys", "sensys", "imc", "sigmetrics", "osdi",
    "sosp", "pldi", "popl", "icfp", "oopsla", "fse", "icse", "ase", "issta"
];
var interdiscip_conference = ["ismb", "recomb", "siggraph", "siggraph-asia",
    "ec", "wine", "chi", "ubicomp", "uist", "icra", "iros", "rss", "vis", "vr"
];
var begin_year_linechart = 2010, end_year_linechart = 2018, area_linechart = "AI";


// data loader
{
    //if in this area, return 1
    function in_this_area(area, conf) {
        let flag = 0;
        if (area == "AI") {
            for (let i = 0; i < ai_conference.length; i++) {
                if (ai_conference[i] == conf) {
                    flag = 1;
                    return flag;
                }
            }
        } else if (area == "Theory") {
            for (let i = 0; i < theory_conference.length; i++) {
                if (theory_conference[i] == conf) {
                    flag = 1;
                    return flag;
                }
            }
        } else if (area == "Systems") {
            for (let i = 0; i < systems_conference.length; i++) {
                if (systems_conference[i] == conf) {
                    flag = 1;
                    return flag;
                }
            }
        } else if (area == "Interdisciplinary Areas") {
            for (let i = 0; i < interdiscip_conference.length; i++) {
                if (interdiscip_conference[i] == conf) {
                    flag = 1;
                    return flag;
                }
            }
        }
        return flag;
    }

    // main function
    // process csv data in area from time [starttime, endtime]
    // select top_k professors
    function read_data(area, start_time, end_time, top_k = 10,
        path = "data/generated-author-info.csv") {
        area_linechart = area;
        console.log("state changed:", begin_year_linechart, end_year_linechart, area_linechart);

        d3.select("#linechartdiv")
            .selectAll("svg")
            .remove();

        return d3.csv(path, function(csvdata) {
            let prof = [];
            //console.log(csvdata);
            let id = 0;
            for (let i = 0; i < csvdata.length; i++) {
                let name = csvdata[i].name;
                let univ = csvdata[i].dept;
                let conf = csvdata[i].area;
                let year = +csvdata[i].year; // integer
                //console.log(name, univ, conf, year);

                if (start_time <= year && year <= end_time && in_this_area(area, conf)) {
                    if (prof.length == 0) {
                        prof.push({
                            name: name,
                            pub: 1,
                            chosen: 0,
                            dept: univ
                        })
                    } else {
                        if (name == prof[id].name)
                            prof[id].pub++;
                        else {
                            prof.push({
                                name: name,
                                pub: 1,
                                chosen: 0,
                                dept: univ
                            })
                            id++;
                        }
                    }
                }
            }

            //console.log(prof);

            if (id == prof.length)
                console.log("id equals prof.length");

            let top_k_prof = [];

            for (let k = 0; k < top_k; k++) {
                let max_pub = 0;
                let max_id = -1;
                for (let j = 0; j < id; j++)
                    if (prof[j].chosen == 0 && prof[j].pub > max_pub) {
                        max_pub = prof[j].pub;
                        max_id = j;
                    }
                //console.log(max_id)
                prof[max_id].chosen = 1;
                top_k_prof.push(prof[max_id]);

            }

            console.log("top_profs are", top_k_prof);

            for (let k = 0; k < top_k; k++) {
                let data_temp = [];
                let data = [];
                for (let year = 1970; year <= 2019; year++) {
                    data_temp.push({
                        x: year,
                        y: 0
                    });
                }

                for (let i = 0; i < csvdata.length; i++) {
                    //let find = 0;
                    if (csvdata[i].name == top_k_prof[k].name) {
                        let cur_year = csvdata[i].year;
                        if (cur_year > 2019)
                            cur_year = 2019;
                        data_temp[cur_year - 1970].y++;
                    }
                }
                //console.log("data_temp is", data_temp)
                //console.log("data is", data)
                data.push(data_temp);
                main_draw(data, top_k_prof[k]);
            }
        });
    }
}

// draw svg
{
    // data: publications every year;
    // prof: professor info
    function main_draw(data, prof) {

        let line_color = '#02f78e', 
            dot_color = '#272727';

        let margin = { top: 10, right: 300, bottom: 20, left: 40 },
            width = 1000 - margin.left - margin.right,
            height = 80 - margin.top - margin.bottom;

        let x = d3.scale.linear()
            .domain([2000, 2019])
            .range([0, width]);

        let y = d3.scale.linear()
            .domain([0, 10])
            .range([height, 0]);

        //x轴设置
        let xAxis = d3.svg.axis()
            .scale(x)
            .ticks(10) //调节刻度大小
            .tickSize(-height)
            .tickPadding(10)
            .tickSubdivide(true)
            .orient("bottom");

        //y轴设置
        let yAxis = d3.svg.axis()
            .scale(y)
            .ticks(2)
            .tickPadding(10)
            .tickSize(-width)
            .tickSubdivide(true)
            .orient("left");

        //缩放拖拽
        let zoom = d3.behavior.zoom()
            .x(x)
            .y(y)
            .scaleExtent([-10, 10]) //可缩放的范围
            .on("zoom", zoomed);

        let svg = d3.select("#linechartdiv")
            .append("div")
            .append("svg")
            .call(zoom)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // text of professor information
        let txt_dx = 40, txt_dy = 15, txt_ddy = 20;
        svg.append("text")
            .attr("class", "myProfText")
            .attr("x", width)
            .attr("y", 0)
            .attr("dx", txt_dx)
            .attr("dy", txt_dy)
            .attr("text-anchor", "start")
            .attr("font-size", 14)
            .attr("font-weight", "bold")
            .text(prof.name);
        svg.append("text")
            .attr("class", "myProfText")
            .attr("x", width)
            .attr("y", 0)
            .attr("dx", txt_dx)
            .attr("dy", txt_dy + txt_ddy)
            .attr("text-anchor", "start")
            .attr("font-size", 14)
            .text(prof.dept);
        svg.append("text")
            .attr("class", "myProfText")
            .attr("x", width)
            .attr("y", 0)
            .attr("dx", txt_dx)
            .attr("dy", txt_dy + txt_ddy*2)
            .attr("text-anchor", "start")
            .attr("font-size", 14)
            .text(" Pubs: " + prof.pub);

        // axes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "x axis")
            .append("text")
            .attr("class", "axis-label")
            .attr("y", height+10)
            .attr("x", width)
            .text('Year');
        
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis);
        
        svg.append("g")
            .attr("class", "y axis")
            .append("text")
            .attr("class", "axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -margin.left+15)
            .attr("x", -height / 2)
            .text('Pubs');

        // line chart
        svg.append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", width)
            .attr("height", height);

        let line = d3.svg.line()
            .interpolate("linear")
            .x(function(d) { return x(d.x); })
            .y(function(d) { return y(d.y); });

        svg.selectAll('.line')
            .data(data)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("clip-path", "url(#clip)")
            .attr('stroke', line_color)
            .attr("d", line);


        let points = svg.selectAll('.dots')
            .data(data)
            .enter()
            .append("g")
            .attr("class", "dots")
            .attr("clip-path", "url(#clip)");

        points.selectAll('.dot')
            .data(function(d, index) {
                let a = [];
                d.forEach(function(point, i) {
                    a.push({ 'index': d.id, 'point': point });
                });
                return a;
            })
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr("r", 2)
            .attr('fill', dot_color)
            .attr("transform", function(d) {
                return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")";
            });

        function zoomed() {
            svg.select(".x.axis").call(xAxis);
            svg.select(".y.axis").call(yAxis);
            svg.selectAll('path.line').attr('d', line);

            points.selectAll('circle').attr("transform", function(d) {
                return "translate(" + x(d.point.x) + "," + y(d.point.y) + ")";
            });
        }

    }
}

// main
read_data("AI", 2010, 2018, 10);