// global vars
let faculty_pub_info = new Array(),
    tag2color = new Array();

// data loader
{
    function readPubData() {
        // read top20.csv to load titles and cites
        d3.csv("data/top20.csv", d3.autoType)
            .then(function(csvdata) {
                //console.log(csvdata);
                for (let i = 0; i < csvdata.length; ++i) {
                    faculty_pub_info[csvdata[i].name] = [];
                    for (let j = 0; j < 10; ++j) {
                        faculty_pub_info[csvdata[i].name].push({
                            title: "",
                            n_cite: 0,
                            label: "",
                            tag: "",
                            abstract: ""
                        });
                        faculty_pub_info[csvdata[i].name][j].title = csvdata[i][(j + 1).toString()];
                        faculty_pub_info[csvdata[i].name][j].n_cite = csvdata[i]["c" + (j + 1).toString()];
                    }
                }

                // read labels0.csv to read tags and labels
                d3.csv("data/labels0.csv", d3.autoType)
                    .then(function(csvdata2) {
                        //console.log(csvdata2);
                        for (let i = 0; i < csvdata2.length; ++i) {
                            if (!faculty_pub_info.hasOwnProperty(csvdata2[i].name))
                                continue;
                            for (let j = 0; j < 10; ++j) {
                                faculty_pub_info[csvdata2[i].name][j].tag = csvdata2[i]["tag" + (j + 1).toString()];
                                faculty_pub_info[csvdata2[i].name][j].label = csvdata2[i]["lable" + (j + 1).toString()];
                                tag2color[faculty_pub_info[csvdata2[i].name][j].tag] = d3.interpolateSinebow(Math.random());
                            }
                        }
                        tag2color["null"] = "gray";
                        console.log('color mapping: ', tag2color);

                        // read abstract.csv to load abstracts
                        d3.csv("data/abstract.csv")
                            .then(function(csvdata3) {
                                //console.log(csvdata3);
                                for (let i = 0; i < csvdata3.length; ++i) {
                                    if (!faculty_pub_info.hasOwnProperty(csvdata3[i].name))
                                        continue;
                                    for (let j = 0; j < 5; ++j)
                                        faculty_pub_info[csvdata3[i].name][j].abstract = csvdata3[i]["abstract" + (j + 1).toString()];
                                }
                                console.log("Faculties publication data loaded!");
                                drawBarChart({name: "Eric P. Xing", dept: "Carnegie Mellon University"});
                                //console.log("faculty_pub_info", faculty_pub_info["Eric P. Xing"]);
                            });
                    });
            });
    }
}

// draw
{
    function drawBarChart(prof) {
        let margin = { top: 80, right: 30, bottom: 200, left: 45 },
            small_pad = 20,
            width = barchart_w,
            height = barchart_h,
            bar_width = 60,
            bar_max_height = height - margin.bottom - margin.top - small_pad,
            bar_min_height = 50;

        // find data
        let data = faculty_pub_info[prof.name];
        //console.log(data);
        let max_cite = 0,
            min_cite = 999999;
        for (let i = 0; i < data.length; ++i) {
            max_cite = Math.max(max_cite, data[i].n_cite);
            min_cite = Math.min(min_cite, data[i].n_cite);
        }
        console.log(min_cite, max_cite);


        //// draw bars
        let x = d3.scaleLinear()
            .domain([0, 9])
            .range([margin.left + small_pad, width - margin.right - bar_width - small_pad]);
        let y = d3.scaleLinear()
            .domain([min_cite, max_cite])
            .range([height - margin.bottom - bar_min_height, height - margin.bottom - bar_max_height]);
        let yAxis = d3.axisLeft()
            .scale(y)
            .ticks(5)
            .tickPadding(5);
        //.tickSize(-(width - margin.left - margin.right));

        let div = d3.select("#barchartdiv");
        div.selectAll("svg")
            .remove();
        let svg = div.append("svg")
            .attr("class", "barchartSVG")
            .attr("width", width)
            .attr("height", height);
        svg.append("rect")
            .attr("x", margin.left)
            .attr("y", margin.top)
            .attr("width", width - margin.left - margin.right)
            .attr("height", height - margin.top - margin.bottom)
            .attr("stroke", "gray")
            .attr("fill", "transparent");

        // draw axis
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + margin.left + ",0)")
            .call(yAxis);
        // legend
        {
            let tags = new Array();
            for (let i = 0; i < data.length; ++i) {
                tags[data[i].tag] = tag2color[data[i].tag];
            }
            //console.log(tags);
            tags = Object.entries(tags);
            //console.log(tags);

            let legend_width = 50,
                legend_height = 25,
                legend_x = width - margin.right - 200,
                legend_y = margin.top + 10,
                legend_padding = 5;
            let legend_rects = svg.selectAll(".myLegendRect")
                .data(tags)
                .enter()
                .append("rect")
                .attr("class", "myLegendRect")
                .attr("x", legend_x)
                .attr("y", function(d, i) {
                    return legend_y + i * legend_height;
                })
                .attr("width", legend_width - legend_padding)
                .attr("height", legend_height - legend_padding)
                .attr("fill", function(d) {
                    return d[1];
                });
            let legend_texts = svg.selectAll(".myLegendText")
                .data(tags)
                .enter()
                .append("text")
                .attr("class", "myLegendText")
                .attr("x", legend_x + legend_width)
                .attr("y", function(d, i) {
                    return legend_y + i * legend_height;
                })
                .attr("dx", function() {
                    return 3;
                })
                .attr("dy", function(d) {
                    return 14;
                })
                .attr("text-anchor", "start")
                .attr("font-size", 14)
                .text(function(d) {
                    if (d[0] == "null")
                        return "unknown";
                    return d[0];
                });
        }
        // draw rects
        let rects = svg.selectAll(".barRect")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "barRect")
            .attr("x", function(d, i) {
                return x(i);
            })
            .attr("y", function(d) {
                return y(d.n_cite);
            })
            .attr("width", bar_width)
            .attr("height", function(d) {
                return height - margin.bottom - y(d.n_cite);
            })
            .attr("fill", function(d) {
                return tag2color[d.tag];
            });
        // tip
        {
            let rect_tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0])
                .html(function(d, i) {
                    return "<p>Title: " + d.title + "</p>\n" +
                        "<p>Citations: " + d.n_cite + "</p>\n" +
                        "<p>Area: " + d.tag + ", " + d.label + "</p>\n";
                });
            rects.call(rect_tip);
            rects.on("mouseover", function(d, i) {
                    rect_tip.show(d, i); // mouseover：鼠标悬浮在元素上时触发函数 tip.show
                    d3.select(this)
                        .attr("fill", "#80ffff");
                })
                .on("mouseout", function(d, i) {
                    rect_tip.hide(d, i);
                    d3.select(this)
                        .transition()
                        .duration(200)
                        .attr("fill", tag2color[d.tag]);
                });


            /// draw professor description
            svg.append("text")
                .attr("x", function(d, i) {
                    return width / 2;
                })
                .attr("y", function(d) {
                    return small_pad;
                })
                .attr("dy", 10)
                .attr("text-anchor", "middle")
                .attr("font-size", 18)
                .attr("font-weight", "bold")
                .text("Top 10 publications of: " + prof.name);
            svg.append("text")
                .attr("x", function(d, i) {
                    return width / 2;
                })
                .attr("y", function(d) {
                    return small_pad;
                })
                .attr("dy", 35)
                .attr("text-anchor", "middle")
                .attr("font-size", 16)
                .text(prof.dept);
        }

        // details of a selected paper
        {
            rects.on("click", function(d, i) {
            	svg.selectAll(".barRect")
            		.attr("stroke-width", 0);
            	d3.select(this)
            		.attr("stroke-width", 4)
                    .attr("stroke", "blue");

                svg.selectAll('foreignObject')
                    .remove();
                let dv = svg.append('foreignObject')
                    .attr('x', margin.left)
                    .attr('y', height - margin.bottom)
                    .attr('width', width - margin.left - margin.right)
                    .attr('height', margin.bottom)
                    .append('xhtml:div');
                    //.style('color', "black")
                    //.style('overflow', 'hidden')
                    //.style('text-overflow', 'ellipsis');
                dv.html("<font size=2.5><p><b>Title: </b>" + d.title + "</p>" +
                	"<p><b>Area: </b>" + d.tag + ", " + d.label + "</p>" +
                	"<p><b>Citations: </b>" + d.n_cite + "</p>" +
                	"<p><b>Abstract:</b> " + d.abstract + "</p></font>");
            });
        }
    }
}

// main
readPubData();
