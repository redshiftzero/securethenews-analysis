var w = 925,
	h = 550,
	margin = 30,
	startYear = 2016.9166666666667, 
	endYear = 2018.8333333333333,
	startScore = -1,
	endScore = 100,
	y = d3.scale.linear().domain([endScore, startScore]).range([0 + margin, h - margin]),
    x = d3.scale.linear().domain([startYear, endYear]).range([0 + margin -5, w]),
    monthStep = 1./12.
	years = d3.range(startYear, endYear+0.1, monthStep);


var vis = d3.select("#vis")
    .append("svg:svg")
    .attr("width", w)
    .attr("height", h)
    .append("svg:g")

			
var line = d3.svg.line()
    .x(function(d,i) { return x(d.x); })
    .y(function(d) { return y(d.y); });
					

var startEnd = {},
    newsOrgCodes = {};
d3.text('securethenews_06October2018.csv', 'text/csv', function(text) {
    var scans = d3.csv.parseRows(text);
    
    // skip first row since it's the header
    for (i=1; i < scans.length; i++) {
        var values = scans[i].slice(1, scans[i.length-1]);
        var currData = [];
        newsOrgCodes[scans[i][0]] = scans[i][0];
        
        var started = false;
        for (j=0; j < values.length; j++) {
            if (values[j] != '') {
                currData.push({ x: years[j], y: values[j] });
            
                if (!started) {
                    startEnd[scans[i][0]] = { 'startYear':years[j], 'startVal':values[j] };
                    started = true;
                } else if (j == values.length-1) {
                    startEnd[scans[i][0]]['endYear'] = years[j];
                    startEnd[scans[i][0]]['endVal'] = values[j];
                }
                
            }
        }
        vis.append("svg:path")
            .data([currData])
            .attr("newsorg", scans[i][0])
            .attr("d", line)
            .on("mouseover", onmouseover)
            .on("mouseout", onmouseout);
    }
});  
    
// x axis
vis.append("svg:line")
    .attr("x1", x(startYear))
    .attr("y1", y(startScore))
    .attr("x2", x(endYear + 0.2))
    .attr("y2", y(startScore))
    .attr("class", "axis")

// y axis
vis.append("svg:line")
    .attr("x1", x(startYear))
    .attr("y1", y(startScore))
    .attr("x2", x(startYear))
    .attr("y2", y(endScore))
    .attr("class", "axis")
			
vis.selectAll(".xLabel")
    .data(x.ticks(2))
    .enter().append("svg:text")
    .attr("class", "xLabel")
    .text(String)
    .attr("x", function(d) { return x(d) })
    .attr("y", h-10)
    .attr("text-anchor", "middle")

vis.selectAll(".yLabel")
    .data(y.ticks(4))
    .enter().append("svg:text")
    .attr("class", "yLabel")
    .text(String)
	.attr("x", 0)
	.attr("y", function(d) { return y(d) })
	.attr("text-anchor", "right")
	.attr("dy", 3)
			
vis.selectAll(".xTicks")
    .data(x.ticks(2))
    .enter().append("svg:line")
    .attr("class", "xTicks")
    .attr("x1", function(d) { return x(d); })
    .attr("y1", y(startScore))
    .attr("x2", function(d) { return x(d); })
    .attr("y2", y(startScore)+7)
	
vis.selectAll(".yTicks")
    .data(y.ticks(4))
    .enter().append("svg:line")
    .attr("class", "yTicks")
    .attr("y1", function(d) { return y(d); })
    .attr("x1", x(startYear - 0.01))
    .attr("y2", function(d) { return y(d); })
    .attr("x2", x(startYear))

function onclick(d, i) {
    var currClass = d3.select(this).attr("class");
    if (d3.select(this).classed('selected')) {
        d3.select(this).attr("class", currClass.substring(0, currClass.length-9));
    } else {
        d3.select(this).classed('selected', true);
    }
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
    this.parentNode.appendChild(this);
    });
  };

function onmouseover(d, i) {
    var currClass = d3.select(this).attr("class");
    d3.select(this)
      .attr("class", currClass + " current")
      .moveToFront();

    var newsOrgCode = $(this).attr("newsorg");
    var newsOrgVals = startEnd[newsOrgCode];
    var percentChange = 100 * (newsOrgVals['endVal'] - newsOrgVals['startVal']) / newsOrgVals['startVal'];
    
    var blurb = '<h2>' + newsOrgCodes[newsOrgCode] + '</h2>';
    blurb += "<p>This organization had an HTTPS score of " + Math.round(newsOrgVals['startVal']) + " in " + Math.trunc(newsOrgVals['startYear']) + " and " + Math.round(newsOrgVals['endVal']) + " in " + Math.trunc(newsOrgVals['endYear']);
    if (percentChange == Infinity) {
        blurb += "." 
    } else if (percentChange >= 0) {
        blurb += ", an increase of " + Math.round(percentChange) + " percent."
    } else if (percentChange == NaN) {
        blurb += "."
    } else {
        blurb += ", a decrease of " + -1 * Math.round(percentChange) + " percent."
    }
    blurb += "</p>";
    
    $("#default-blurb").hide();
    $("#blurb-content").html(blurb);
}

function onmouseout(d, i) {
    var currClass = d3.select(this).attr("class");
    var prevClass = currClass.substring(0, currClass.length-8);
    d3.select(this)
        .attr("class", prevClass);
    $("#default-blurb").show();
    $("#blurb-content").html('');
}
