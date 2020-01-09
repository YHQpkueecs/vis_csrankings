//This is the obsoleted global variables for testing the functionality
/*
let university = 'Duke University'
//The name of university should be here

let start_year = 2010;
let end_year = 2019;
*/
// start_year and end_year should be passed in by the main program


// the const below should not be changed
const start_year_all = 1990;
const end_year_all = 2019;
const interval = end_year_all - start_year_all;
// const ends
const halfPi = Math.PI/2;
//********The following lines are here to indicate the size of the sunburst graphics
let width = 400;
let height = 400;
let radius = Math.min(width, height) / 2;
//******************************

let uni_acc;
let institutes_edited;

let partition = d3.partition();

let x = d3.scaleLinear()
    .range([0, 2 * Math.PI]);

let y = d3.scaleLinear()
    .range([0, radius]);

let arc = d3.arc()
    .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
    .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
    .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
    .outerRadius(function(d) { return Math.max(0, y(d.y1)); });


// Main parts begin:
d3.csv('./data/generated-author-info.csv', d3.autoType)
    .then(function(data) {

        //console.log('data: ', data);
        let institutes = data.reduce((institute, row) => {
            if (!institute[row.dept]) institute[row.dept] = [];
            institute[row.dept].push(row);
            return institute;
        }, {});
        //console.log('institutes: ', institutes);
        let insititute_list = Object.keys(institutes);
        // A deep copy
        institutes_edited = JSON.parse(JSON.stringify(institutes));
        // deep copy ends
        for (let [name, institute] of Object.entries(institutes)) {
            institutes_edited[name] = ins_map(institute)
        }
        //console.log('Edited: ', institutes_edited);

    });


function sunburst_draw(university, start_year, end_year) {
    let local = JSON.parse(JSON.stringify(institutes_edited[university]));
    uni_acc = accumulate(local, start_year, end_year);
    console.log(local);
    console.log(uni_acc);
    let root = d3.hierarchy(uni_acc).sum(d => d.count);
    //let root = d3.hierarchy(uni_acc);
    console.log(root);
    let adjusted_root = d3.hierarchy(uni_acc).sum(d => d.adjustedcount);

    partition(root); // <-- 1
    partition(adjusted_root);

    // The following lines are for testing SVG graphics drawing, should be edited when we are going to merge the program
    let div = d3.select("#sunburstdiv")
        .attr("style", "width: " + sunburst_w + "px; height:" + sunburst_h + "px;");
    div.selectAll("svg")
        .remove();
    let chart = div.append("svg")
        .attr("class", "sunburstSVG")
        .attr("width", width * 2)
        .attr("height", height)

    const g = chart.append('g') // <-- 3
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')'); // <-- 4
    // SVG lines ends

    let paths = g.selectAll("path")
      .data(partition(root).descendants())
      .enter().append("path")
      .attr("d", arc)
      .style("fill", function(d) { return color_map((d.children ? d : d.parent).data.name); })
      .style("fill-opacity", d => d.children ? 0.85 : 0.4 )
      .style('stroke', '#fff')  // <-- 7
      .on("click", click);

    function click(d) {
      chart.transition()
          .duration(750)
          .tween("scale", function() {
            let xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                yd = d3.interpolate(y.domain(), [d.y0, 1]),
                yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
            return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
          })
        .selectAll("path")
          .attrTween("d", function(d) { return function() { return arc(d); }; });
    }

    // tips
    let paths_tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d, i) {
            return "<p>Area: " + d.data.name + "</p>\n" +
                "<p>Publications: " + d.value + "</p>\n";
        });
    paths.call(paths_tip);
    paths.on("mouseover", function(d, i) {
            paths_tip.show(d, i); // mouseover：鼠标悬浮在元素上时触发函数 tip.show
            //d3.select(this)
            //   .attr("fill", "#80ffff");
        })
        .on("mouseout", function(d, i) {
            paths_tip.hide(d, i);
            /*
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", tag2color[d.tag]);
            */
        });

    // text
    chart.append("text")
        .attr("x", width / 2 + width)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("font-weight", "bold")
        .attr("font-size", 18)
        .text(university+': From '+start_year+' to '+end_year);
    // legend
    {
        let domains = ['AI', 'Systems', 'Theory', 'Interdisciplinary Areas', 'Others', 'Unrecognized'];

        let legend_width = 50,
            legend_height = 25,
            legend_x = width + width / 4,
            legend_y = 100,
            legend_padding = 5;
        let legend_rects = chart.selectAll(".myLegendRect")
            .data(domains)
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
                return area_to_color(d);
            });
        let legend_texts = chart.selectAll(".myLegendText")
            .data(domains)
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
                return d;
            });
    }
}


function accumulate(institute, start_year, end_year) {
    let index_begin = start_year - start_year_all;
    let index_end = end_year - start_year_all;

    let ins_acc = { name: institute.name, children: {} };

    let i;
    for (i = index_begin; i <= index_end; i++) {
        let year = institute.years[i];
        for (let [area, obj] of Object.entries(year.children)) {
            if (!ins_acc.children[area]) ins_acc.children[area] = obj;
            else {
                for (let [sub, sub_obj] of Object.entries(obj.children)) {
                    if (!ins_acc.children[area].children[sub]) ins_acc.children[area].children[sub] = sub_obj;
                    else {
                        ins_acc.children[area].children[sub].count += sub_obj.count;
                        ins_acc.children[area].children[sub].adjustedcount += sub_obj.adjustedcount;
                    }
                }
            }
        }
    }
    for (let [area, obj] of Object.entries(ins_acc.children)) {
        ins_acc.children[area].children = Object.values(ins_acc.children[area].children);
    }
    ins_acc.children = Object.values(ins_acc.children);
    console.log(ins_acc);
    return ins_acc;
}


function ins_map(institute) {
    let ins_obj = {
        name: institute[0].dept,
        years: []
    };
    let i, j;
    for (i = 0; i <= interval; i++) {
        ins_obj.years.push({ year: i + start_year_all, children: {} })
        let area_name;
        let sub_name;
        for (j = 0; j < institute.length; j++) {
            if (institute[j].year == i + start_year_all) {
                area_name = conf_to_area(institute[j].area);
                sub_name = conf_to_sub(institute[j].area);
                if (!ins_obj.years[i].children[area_name]) {
                    ins_obj.years[i].children[area_name] = { name: area_name, children: {} }
                }
                if (!ins_obj.years[i].children[area_name].children[sub_name]) {
                    ins_obj.years[i].children[area_name].children[sub_name] = { name: sub_name, count: 0, adjustedcount: 0 }
                }
                ins_obj.years[i].children[area_name].children[sub_name].count += institute[j].count;
                ins_obj.years[i].children[area_name].children[sub_name].adjustedcount += institute[j].adjustedcount;
                institute.splice(j, 1);
                j--;
            }
        }
    }
    return ins_obj;
}

function conf_to_sub(conf) {
    if (conf == 'aaai' || conf == 'ijcai') return 'AI'
    else if (conf == 'cvpr' || conf == 'eccv' || conf == 'iccv') return 'Vision'
    else if (conf == 'icml' || conf == 'kdd' || conf == 'nips') return 'ML'
    else if (conf == 'acl' || conf == 'emnlp' || conf == 'naacl') return 'NLP'
    else if (conf == 'sigir' || conf == 'www') return 'Web+IR'
    else if (conf == 'asplos' || conf == 'isca' || conf == 'micro' || conf == 'hpca') return 'Arch'
    else if (conf == 'sigcomm' || conf == 'nsdi') return "Networks"
    else if (conf == 'ccs' || conf == 'oakland' || conf == 'usenixsec' || conf == 'ndss') return "Security"
    else if (conf == 'sigmod' || conf == 'vldb' || conf == 'icde' || conf == 'pods') return 'DB'
    else if (conf == 'dac' || conf == 'iccad') return 'EDA'
    else if (conf == 'emsoft' || conf == 'rtas' || conf == 'rtss') return 'Embedded'
    else if (conf == 'hpdc' || conf == 'ics' || conf == 'sc') return 'HPC'
    else if (conf == 'mobicom' || conf == 'mobisys' || conf == 'sensys') return 'Mobile'
    else if (conf == 'imc' || conf == 'sigmetrics') return 'Metrics'
    else if (conf == 'osdi' || conf == 'sosp' || conf == 'eurosys' || conf == 'fast' || conf == 'usenixatc') return 'OS'
    else if (conf == 'pldi' || conf == 'popl' || conf == 'icfp' || conf == 'oopsla') return 'PL'
    else if (conf == 'fse' || conf == 'icse' || conf == 'ase' || conf == 'issta') return 'SE'
    else if (conf == 'focs' || conf == 'soda' || conf == 'stoc') return 'Theory'
    else if (conf == 'crypto' || conf == 'eurocrypt') return 'Crypto'
    else if (conf == 'cav' || conf == 'lics') return 'Logic'
    else if (conf == 'ismb' || conf == 'recomb') return 'Comp. Bio'
    else if (conf == 'siggraph' || conf == 'siggraph-asia') return 'Graphics'
    else if (conf == 'ec' || conf == 'wine') return 'Ecom'
    else if (conf == 'uist' || conf == 'chiconf' || conf == 'ubicomp') return 'HCI'
    else if (conf == 'icra' || conf == 'iros' || conf == 'rss') return 'Robotics'
    else if (conf == 'vis' || conf == 'vr') return 'Visualization'
    else if (conf == 'pets') return 'Others'
    else {
        console.log("Unrecognized Conference, Please check again.");
        console.log("Conf:", conf);
        return 'Unrecognized';
    }
}

function sub_to_area(sub) {
    if (sub == 'AI' || sub == 'Vision' || sub == 'ML' || sub == 'NLP' || sub == 'Web+IR') return 'AI'
    else if (sub == 'Arch' || sub == 'Networks' || sub == 'Security' || sub == 'DB' || sub == 'EDA' || sub == 'Embedded' || sub == 'HPC' || sub == 'Mobile' || sub == 'Metrics' || sub == 'OS' || sub == 'PL' || sub == 'SE') return "Systems"
    else if (sub == 'Theory' || sub == 'Crypto' || sub == 'Logic') return 'Theory'
    else if (sub == 'Comp. Bio' || sub == 'Graphics' || sub == 'Ecom' || sub == 'HCI' || sub == 'Robotics' || sub == 'Visualization') return 'Interdisciplinary Areas'
    else if (sub == 'Others') return 'Others'
    else if (sub == 'Unrecognized') return 'Unrecognized'
    else {
        console.log("Unrecognized Subarea, Please check again.");
        return "Unknown"
    }
}

function conf_to_area(conf) {
    return sub_to_area(conf_to_sub(conf));
}

function color_map(area){
  if(['AI', 'Systems', 'Theory', 'Interdisciplinary Areas', 'Others', 'Unrecognized'].includes(area)){
    return area_to_color(area);
  }
  else {
    return d3.rgb(255,255,255);
  }
}

area_to_color = d3.scaleOrdinal()
    .domain(['AI', 'Systems', 'Theory', 'Interdisciplinary Areas', 'Others', 'Unrecognized'])
    .range([d3.rgb(215, 51, 55), d3.rgb(34, 177, 76), d3.rgb(37, 0, 210), d3.rgb(240, 181, 0), d3.rgb(120, 120, 120), d3.rgb(0, 0, 0)])

function sub_to_color_decline(d, scale) {
    let base = d3.hsl(basic_color_scale(d.Department));
    //console.log('base color: ',base )
    base.l += 0.5 * Number(d.Subclass) / scale;
    base.s -= 0.20;
    return base;
}
