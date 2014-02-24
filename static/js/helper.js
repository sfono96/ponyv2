
var width = 1200/2.15, height = 600/2.6, barHeight = 50;
var margins = {top: height*.05, bottom: height*.10, left: width*.05, right: width*.05};
var playingWidth = width-margins.left-margins.right;

//var motherShip = d3.select("#below-proficient-scores").append("svg").attr("height",height).attr("width",width).append("g")
//var frame = motherShip.append("rect").attr("height",height).attr("width",width).attr("fill","none").attr("stroke","grey")

// main drawing board
var canvas = d3.select(".below-proficient-scores").append("svg").attr("height",height).attr("width",width).attr("viewBox","0 0 "+width+" "+height).attr("preserveAspectRatio","xMinYMin meet")
//var frame = canvas.append("rect").attr("height",height).attr("width",width).attr("fill","none").attr("stroke","grey")

// start at point zero - pre transition data
var data0 = [{grade:"K",t1:0,t2:0,t3:0,t4:0},{grade:"1",t1:0,t2:0,t3:0,t4:0},{grade:"2",t1:0,t2:0,t3:0,t4:0},{grade:"3",t1:0,t2:0,t3:0,t4:0},{grade:"4",t1:0,t2:0,t3:0,t4:0},{grade:"5",t1:0,t2:0,t3:0,t4:0},{grade:"6",t1:0,t2:0,t3:0,t4:0}]

// main data
var data = [{grade:"K",t1:50,t2:30,t3:10,t4:10},{grade:"1",t1:40,t2:20,t3:30,t4:10},{grade:"2",t1:30,t2:25,t3:25,t4:20},{grade:"3",t1:30,t2:35,t3:30,t4:5},{grade:"4",t1:45,t2:30,t3:10,t4:15},{grade:"5",t1:20,t2:25,t3:45,t4:10},{grade:"6",t1:10,t2:30,t3:55,t4:5}]

// drill-in data
var data1 = [{grade:"1/17",t1:50,t2:20,t3:20,t4:10},{grade:"1/24",t1:40,t2:20,t3:30,t4:10},{grade:"1/31",t1:50,t2:25,t3:15,t4:10},{grade:"2/7",t1:35,t2:35,t3:20,t4:10},{grade:"2/14",t1:50,t2:30,t3:10,t4:10}]

// scales and axes
var x = d3.scale.ordinal().rangeRoundBands([margins.left,width-margins.right])
var y = d3.scale.linear().rangeRound([height-margins.bottom,margins.top])
var color = d3.scale.ordinal().range(["#36648B", "#4F94CD", "#5CACEE","#63B8FF"]).domain(["t1","t2","t3","t4"]) //green,yellow,red = "#33CC33", "#FFFF4D", "#FF4D4D"
var xAxis = d3.svg.axis().scale(x).orient("bottom")
var yAxis = d3.svg.axis().scale(y).orient("left").tickFormat(d3.format("%"));

clicked = false, minimized = false;

// do the stacking here (for each data set above)
data0.forEach(function(d){
    var y0 = 0;
    d.tiers = color.domain().map(function(name){return {name:name, y0:y0, y1:y0+= +d[name]}}) // incrementing new y starting pos
    d.total = d.tiers[d.tiers.length-1].y1
})

data.forEach(function(d){
    var y0 = 0;
    d.tiers = color.domain().map(function(name){return {name:name, y0:y0, y1:y0+= +d[name]}}) // incrementing new y starting pos
    d.total = d.tiers[d.tiers.length-1].y1
})

data1.forEach(function(d){
    var y0 = 0;
    d.tiers = color.domain().map(function(name){return {name:name, y0:y0, y1:y0+= +d[name]}}) // incrementing new y starting pos
    d.total = d.tiers[d.tiers.length-1].y1
})

//data.sort(function(a, b) { return b.total - a.total; }); //???

// set the domains
x.domain(data.map(function(d){return d.grade;}));
y.domain([0,d3.max(data0,function(d){return d.total;})]);

var widthDiscount = .80 
var barWidth = x.rangeBand()*widthDiscount
var barMarg = x.rangeBand()*(1-widthDiscount)/2

// x axis
var xax = canvas.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + (height-margins.bottom) + ")")
  .call(xAxis);

// grade column group - start with pre transition data set
var grades = canvas.selectAll(".grade").data(data0).enter().append("g").attr("class","g")
        .attr("transform", function(d) { return "translate(" + x(d.grade) + ",0)"; })
        .on("click",function(d){return animateMe(grades,stacks,xax)})
        //.on("dblclick",function(d){return moveIt(canvas)})
        .on("mouseover",function(d){return d3.select(this).attr("opacity",".7")})
        .on("mouseout",function(d){return d3.select(this).attr("opacity","1")});

var stacks = grades.selectAll("rect")
    .data(function(d) { return d.tiers; }).enter().append("rect")
    .attr("width", barWidth)
    .attr("x",barMarg)
    .attr("y", function(d) { return y(d.y1+.5); })
    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
    //.attr("stroke","white")
    .style("fill", function(d) { return color(d.name); });

// opening transition to main data set
y.domain([0,d3.max(data,function(d){return d.total;})]);
        grades.data(data).enter()
        stacks.data(function(d){return d.tiers}).enter()
        stacks.transition().duration(1000)
            .attr("y", function(d) { return y(d.y1); })
            .attr("height", function(d) { return y(d.y0) - y(d.y1); })
            .style("fill",function(d) { return color(d.name); });

function animateMe(grades,stacks,xax){
    if(clicked){
        y.domain([0,d3.max(data,function(d){return d.total;})]);
        x.domain(data.map(function(d){return d.grade;}));
        barWidth = x.rangeBand()*widthDiscount
        grades.data(data0).enter()
        xax.transition().duration(500).call(xAxis)
        grades.data(data).enter()
        stacks.data(function(d){return d.tiers}).enter()
        stacks.transition().duration(500)
            .attr("y", function(d) { return y(d.y1); })
            .attr("height", function(d) { return y(d.y0) - y(d.y1); })
            .attr("width",barWidth)
            .style("fill",function(d) { return color(d.name); });
        grades.transition().duration(500).attr("transform", function(d) { return "translate(" + x(d.grade) + ",0)"; })
        clicked = false
    }
    else {
        y.domain([0,d3.max(data1,function(d){return d.total;})]);
        x.domain(data1.map(function(d){return d.grade;}));
        barWidth = x.rangeBand()*widthDiscount
        grades.data(data0).enter()
        xax.transition().duration(500).call(xAxis)
        grades.data(data1).enter()
        stacks.data(function(d){return d.tiers}).enter()
        stacks.transition().duration(500)
            .attr("y", function(d) { return y(d.y1); })
            .attr("height", function(d) { return y(d.y0) - y(d.y1); })
            .attr("width",barWidth)
            .style("fill",function(d) { return color(d.name); });
        grades.transition().duration(500).attr("transform", function(d) { return "translate(" + x(d.grade) + ",0)"; });
        clicked = true
    }
}

















// main drawing board
var canvas2 = d3.select(".below-proficient-scores2").append("svg").attr("height",height).attr("width",width).attr("viewBox","0 0 "+width+" "+height).attr("preserveAspectRatio","xMinYMin meet")
//var frame = canvas.append("rect").attr("height",height).attr("width",width).attr("fill","none").attr("stroke","grey")

// x axis
canvas2.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + (height-margins.bottom) + ")")
  .call(xAxis);
  
// grade column group - start with pre transition data set
var grades2 = canvas2.selectAll(".grade").data(data0).enter().append("g").attr("class","g")
        .attr("transform", function(d) { return "translate(" + x(d.grade) + ",0)"; })
        //.on("click",function(d){return animateMe(grades,stacks)})
        //.on("dblclick",function(d){return moveIt(canvas)})
        .on("mouseover",function(d){return d3.select(this).attr("opacity",".7")})
        .on("mouseout",function(d){return d3.select(this).attr("opacity","1")});

var stacks2 = grades2.selectAll("rect")
    .data(function(d) { return d.tiers; }).enter().append("rect")
    .attr("width", barWidth)
    .attr("x",barMarg)
    .attr("y", function(d) { return y(d.y1+.5); })
    .attr("height", function(d) { return y(d.y0) - y(d.y1); })
    //.attr("stroke","white")
    .style("fill", function(d) { return color(d.name); });

// opening transition to main data set
y.domain([0,d3.max(data,function(d){return d.total;})]);
        grades2.data(data).enter()
        stacks2.data(function(d){return d.tiers}).enter()
        stacks2.transition().duration(1000)
            .attr("y", function(d) { return y(d.y1); })
            .attr("height", function(d) { return y(d.y0) - y(d.y1); })
            .style("fill",function(d) { return color(d.name); })




