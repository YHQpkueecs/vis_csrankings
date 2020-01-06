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

//********The following lines are here to indicate the size of the sunburst graphics
let width = 500;
let height = 500;
let radius = Math.min(width, height) / 2;
//******************************

let uni_acc;
let institutes_edited;

let partition = d3.partition() // <-- 1
    .size([2 * Math.PI, radius]); // <-- 2

let arc = d3.arc() // <-- 2
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .innerRadius(d => d.y0)
    .outerRadius(d => d.y1);



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
    let div = d3.select("#sunburstdiv");
    div.selectAll("svg")
        .remove();
    let chart = div.append("svg")
        .attr("class", "sunburstSVG")
        .attr("width", width)
        .attr("height", height);

    const g = chart.append('g') // <-- 3
        .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')'); // <-- 4
    // SVG lines ends

    g.selectAll('path')
        .data(root.descendants())
        .enter()
        .append('path')
        .attr("display", function(d) { return d.depth ? null : "none"; })
        .attr("d", arc)
        .style('stroke', '#fff')
        .style("fill", function (d) { return area_to_color((d.children ? d : d.parent).data.name); });

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

area_to_color = d3.scaleOrdinal()
  .domain(['AI','Systems','Theory','Interdisciplinary Areas','Others','Unrecognized'])
  .range([d3.rgb(215,51,55), d3.rgb(34,177,76), d3.rgb(37,0,210), d3.rgb(240,181,0),d3.rgb(120,120,120), d3.rgb(0,0,0)])

function sub_to_color_decline(d, scale){
  let base = d3.hsl(basic_color_scale(d.Department));
  //console.log('base color: ',base )
  base.l += 0.5 * Number(d.Subclass)/scale;
  base.s -= 0.20;
  return base;
}
