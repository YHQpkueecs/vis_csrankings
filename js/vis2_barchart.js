// global vars
let faculty_pub_info = new Array(),
    tag2color = new Array();

// pseudo random generator
{
    let seed = 129;

    function my_rnd() {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / (233280.0);
    };
}

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
                d3.csv("data/label_fill.csv", d3.autoType)
                    .then(function(csvdata2) {
                        //console.log(csvdata2);
                        for (let i = 0; i < csvdata2.length; ++i) {
                            if (!faculty_pub_info.hasOwnProperty(csvdata2[i].name))
                                continue;
                            for (let j = 0; j < 10; ++j) {
                                faculty_pub_info[csvdata2[i].name][j].tag = csvdata2[i]["tag" + (j + 1).toString()];
                                faculty_pub_info[csvdata2[i].name][j].label = csvdata2[i]["lable" + (j + 1).toString()];
                                tag2color[faculty_pub_info[csvdata2[i].name][j].tag] = d3.interpolateSinebow(my_rnd());
                            }
                        }
                        tag2color["null"] = "gray";
                        console.log('color mapping: ', tag2color);

                        // read abstract.csv to load abstracts
                        d3.csv("data/abstract_fill.csv")
                            .then(function(csvdata3) {
                                //console.log(csvdata3);
                                for (let i = 0; i < csvdata3.length; ++i) {
                                    if (!faculty_pub_info.hasOwnProperty(csvdata3[i].name))
                                        continue;
                                    for (let j = 0; j < 5; ++j)
                                        faculty_pub_info[csvdata3[i].name][j].abstract = csvdata3[i]["abstract" + (j + 1).toString()];
                                }
                                console.log("Faculties publication data loaded!");
                                drawBarChart({ name: "Eric P. Xing", dept: "Carnegie Mellon University" });
                                //console.log("faculty_pub_info", faculty_pub_info["Eric P. Xing"]);
                            });
                    });
            });
    }
}

let abstract_sample = [' In many real world applications we have access to multiple views of the data each of which characterizes the data from a distinct aspect Several previous algorithms have demonstrated that one can achieve better clustering accuracy by integrating information from all views appropriately than using only an individual view Owing to the effectiveness of spectral clustering many multi view clustering methods are based on it Unfortunately they have limited applicability to large scale data due to the high computational complexity of spectral clustering In this work we propose a novel multi view spectral clustering method for large scale data Our approach is structured under the guided co training scheme to fuse ...',
    'In this paper three novel metallic sp sp hybridized Boron Nitride BN polymorphs are proposed by first principles calculations One of them named as tP BN is predicted based on the evolutionary particle swarm structural search tP BN is constructed by two interlocked rings forming a tube like D network The stability and band structure calculations show tP BN is metastable and metallic at zero pressure Calculations for the density of states and electron orbits confirm that the metallicity originates from the sp hybridized B and N atoms and forming D linear conductive channels in the D network According to the relationship between the atomic structure and electronic properties another two D metastable metallic sp sp hybridized BN structures are constructed manually Electronic properties calculations show that both of these structures have D conductive channel along different axes The polymorphs predicted in this study enrich the structures and provide a different picture of the conductive mechanism of BN compounds ...',
    'Recent studies have shown that power proportional data centers can save energy cost by dynamically right sizing the data centers based on real time workload More servers are activated when the workload increases while some servers can be put into the sleep mode during periods of low load In this paper we revisit the dynamic right sizing problem for heterogeneous data centers with various operational cost and switching cost We propose a new online algorithm based on a regularization technique which achieves a better competitive ratio compared to the state of the art greedy algorithm We further introduce a switching cost offset into the model and extend our algorithm to this new setting Simulations based on real workload and renewable energy traces show that our algorithms outperform the greedy algorithm in both settings',
    'This work studies the problem of learning appropriate low dimensional image representations We propose a generic algorithmic framework which leverages two classic representation learning paradigms i e sparse representation and the trace quotient criterion The former is a well known powerful tool to identify underlying self explanatory factors of data while the latter is known for disentangling underlying low dimensional discriminative factors in data Our developed solutions disentangle sparse representations of images by employing the trace quotient criterion We construct a unified cost function coined as the SPARse LOW dimensional representation SparLow function for jointly learning both a ...',
    'Accurate estimation of the distance between the transmitter TX and the receiver RX in molecular communication MC systems can provide faster and more reliable communication Existing theoretical models in the literature are not suitable for distance estimation in a practical scenario Furthermore deriving an analytical model is not easy due to effects such as boundary conditions in the diffusion process the initial velocity of the molecules and unsteady flows Therefore five different practical methods comprising three novel data analysis based methods and two supervised machine learning ML methods Multivariate Linear Regression MLR and Neural Network ...',
    'Clustering algorithms are iterative and have complex data access patterns that result in many small random memory accesses The performance of parallel implementations suffer from synchronous barriers for each iteration and skewed workloads We rethink the parallelization of clustering for modern non uniform memory architectures NUMA to maximizes independent asynchronous computation We eliminate many barriers reduce remote memory accesses and maximize cache reuse We implement the Clustering NUMA Optimized Routines ...',
    'Machine perception applications are increasingly moving toward manipulating and processing D point cloud This paper focuses on point cloud registration a key primitive of D data processing widely used in high level tasks such as odometry simultaneous localization and mapping and D reconstruction As these applications are routinely deployed in energy constrained environments real time and energy efficient point cloud registration is critical We present Tigris an algorithm architecture co designed system specialized for point cloud registration Through an extensive exploration of the registration pipeline design space we find that while different design points make ...',
    'Oblivious Transfer OT is a fundamental cryptographic protocol that finds a number of applications in particular as an essential building block for two party and multi party computation We construct a round optimal rounds universally composable UC protocol for oblivious transfer secure against active adaptive adversaries from any OW CPA secure public key encryption scheme with certain properties in the random oracle model ROM In terms of computation our protocol only requires the generation of a public secret key pair two encryption operations and one decryption operation apart from a few calls to the random oracle In terms of communication our protocol only requires the ...',
    'This paper presents regional attraction of line segment maps and hereby poses the problem of line segment detection LSD as a problem of region coloring Given a line segment map the proposed regional attraction first establishes the relationship between line segments and regions in the image lattice Based on this the line segment map is equivalently transformed to an attraction field map AF...'
]

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

        // rects description
        let rect_desc = svg.selectAll(".RectDesc")
            .data(data)
            .enter()
            .append("text")
            .attr("class", "RectDesc")
            .attr("x", function(d, i) {
                return x(i);
            })
            .attr("y", function(d) {
                return y(d.n_cite);
            })
            .attr("dy", -3)
            .text(function(d) {
                w = d.title.split(" ");
                if (w[0].length >= 4)
                    return w[0] + "..";
                return w[0] + " " + w[1] + "..";
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
                abst = d.abstract;
                if (abst.length < 300) {
                    idx = Math.floor(Math.random() * abstract_sample.length);
                    abst = abstract_sample[idx];
                }
                dv.html("<font size=2.5><p><b>Title: </b>" + d.title + "</p>" +
                    "<p><b>Area: </b>" + d.tag + ", " + d.label + "</p>" +
                    "<p><b>Citations: </b>" + d.n_cite + "</p>" +
                    "<p style='display:-webkit-box; -webkit-line-clamp:6; -webkit-box-orient:vertical; overflow:hidden;'><b>Abstract:</b> " +
                    abst + "</p></font>"); //最多显示6行
            });
        }
    }
}

// main
readPubData();