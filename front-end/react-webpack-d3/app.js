import React from "react";
import ReactDOM from "react-dom";
import Hello from "./hello";

//TODO: Take this out eventually --------
// ReactDOM.render(
//   <Hello name="World" />,
//   document.body
// );

// --------------------------------------

//Fix Color Scale weirdness
// TODO: Double check CR calc (does this need to be weighted avg?)
// require('main.css')

queue()
  .defer(d3.tsv, "data-str.tsv")
  .await(createCohortChart);


function createCohortChart (errors, data) {
//Data Manips
	//Mean - Group By 2 Dims - Apply avg func
  var valueByCohort = d3.nest()
		.key(function(d){ return d.cohort+':'+d.tenure; })
		.rollup(function(v) { 
			return {
			 meanValue: d3.mean(v, function(g) {return +g.value; })
			} 
		})
		.entries(data);

  //Scale-ify data - sort alphanumerically (flexible enough to accept ordinal | number)
  var cohortLabels = data.map(function(d){return d.cohort;}).sort();
  var tenureLabels = data.map(function(d){return d.tenure;}).sort();

  var cohortScale = d3.scale.ordinal()
  	.domain(cohortLabels);
  	cohortScale.range(d3.range(cohortScale.domain().length));
  
  console.log('Cohort Scale Domain: ');
  console.log(cohortScale.domain());

  var tenureScale = d3.scale.ordinal()
  	.domain(tenureLabels);
  	tenureScale.range(d3.range(tenureScale.domain().length));

  console.log('Tenure Scale Domain: ');
  console.log(tenureScale.domain());

  //Improvement Calc
  //x(this_cohort) - 1 -> x.getdomain(previous_cohort) -> previous_cohort.tenure
  valueByCohort.forEach(function(obj){
  	
  	var thisCohortDomain = obj.key.split(":")[0],
  			thisTenureDomain = obj.key.split(":")[1],
  			thisCohortRange = cohortScale(thisCohortDomain),
  			
  			lastCohort = valueByCohort.filter(function (d){
  				return d.key == (cohortScale.domain()[(thisCohortRange - 1)] + ":" + thisTenureDomain);
  			});
  	
  	//TODO: Color across adding new users, arrow comparison to previous week.
  	obj.cohort = thisCohortDomain;
  	obj.tenure = thisTenureDomain;
  	obj.values.lastMeanValue = (lastCohort.length != 0) ? lastCohort[0].values.meanValue : NaN;
 
  	obj.values.improvement = (obj.values.meanValue - obj.values.lastMeanValue) / obj.values.lastMeanValue;
  });

  console.log('Cohort Values: ');
  console.log(valueByCohort);

  CohortChart(valueByCohort, cohortScale, tenureScale, 5);
}

// TODO: Add tooltip on hover
function CohortChart(data, cohortScale, tenureScale, maxSize){
	var data = data;
	var maxSize = (typeof maxSize !== 'undefined') ?  maxSize : 5;

	//Set Chart Container Specs
	var margin = { top: 100, right: 0, bottom: 100, left: 100 },
			width = 960 - margin.left - margin.right,
			height = 600 - margin.top - margin.bottom,

			gridSize = Math.floor(width / 12);

	// Color Scale
	var colorScale = d3.scale.linear()
	  .domain([-1, 0, 1])
	  .range(["red", "white", "green"]);

	//Create SVG element
	var svg = d3.select('#chart').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.append('g')
		.attr('transform', 'translate(' + margin.left +',' + margin.top+ ')')

  //Add Defs - Marker - Arrows
  var up_arrow = { id: 0, name: 'arrow_up', type:'marker-end', orientation:'auto', triangle_path: 'M 0 0 L 10 5 L 0 10 z', line_path: 'M 25 25 L 25 10', viewbox: '0 0 15 15', color: 'green'},
  	down_arrow = {id: 1, name: 'arrow_down', type:'marker-start', orientation:'90', triangle_path: 'M 0 0 L 10 5 L 0 10 z', line_path: 'M 25 10 L 25 25', viewbox: '0 0 15 15', color: 'red'};
  
  var arrowsData = {
  	up: up_arrow,
  	down: down_arrow
  }

  var defs = svg.append('svg:defs');
  defs.selectAll('marker')
	  .data([up_arrow, down_arrow])
	  .enter()
	  .append('svg:marker')
	  .attr('id', function(d){ return 'marker_' + d.name;})
	  .attr('markerHeight', 5)
	  .attr('markerWidth', 5)
	  .attr('markerUnits', 'strokeWidth')
	  .attr('orient', function(d){ return d.orientation;})
	  .attr('refX', 1)
	  .attr('refY', 5)
	  .attr('viewBox', function(d){ return d.viewbox;})
	  .append('svg:path')
	    .attr('d', function(d){ return d.triangle_path;})
	    .attr('fill', function(d) { return d.color;});

	//Create g element, bind cohort data to g
	var cards = svg.selectAll('.cohort')
		.data(data, function(d){return d.key})
		.enter()
		.append('g').filter(function(d){return (d.tenure < maxSize) && (d.cohort < maxSize);})

	//Create axis labels
	var cohortLabels = svg.selectAll(".cohortLabel")
    .data(cohortScale.domain())
    .enter().append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d) { return cohortScale(d)*gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

	var tenureLabels = svg.selectAll(".tenureLabel")
    .data(tenureScale.range())
    .enter().append("text")
      .text(function(d) { return d; })
      .attr("x", function(d, i) { return tenureScale(d)*gridSize; })
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });
  //Create rects
  //Selectively fill based on value
  cards.append('rect')
  	.attr('x', function(d){ return cohortScale(d.tenure)*gridSize; })
  	.attr('y', function(d){ return tenureScale(d.cohort)*gridSize; })
  	.attr("class", "hour bordered")
  	.attr('rx', 4)
  	.attr('ry', 4)
  	.attr('width', gridSize)
  	.attr('height', gridSize)
  	.style('fill', function(d){ return colorScale(d.values.improvement); });

  //Create text - value
  cards.append('text')
  	.attr("class", "meanValue")
  	.text(function(d){ return (d.values.meanValue*100).toFixed(1) + '%'; })
  	.attr('x', function(d){ return cohortScale(d.tenure)*gridSize; })
  	.attr('y', function(d){ return tenureScale(d.cohort)*gridSize; })
  	.attr('dx', '.75em')
    .attr('dy', '1.55em');

  //Create text - improvement
  cards.append('text')
  	.attr("class", "improvement")
  	.text(function(d){ return (d.values.improvement*100).toFixed() + '%'; })
  	.attr('x', function(d){ return cohortScale(d.tenure)*gridSize; })
  	.attr('y', function(d){ return tenureScale(d.cohort)*gridSize; })
  	.attr("dx", gridSize*.25)
    .attr("dy", gridSize*.75);

    //TODO: CSS to make sure arrow is right next to text
  // Create marker - arrow - Up | Down
  cards.append('svg:path')
  	.each(function(d){
  		var arrowhead = d.values.improvement > 0 ? 'up' : 'down',
			 	x = cohortScale(d.tenure)*gridSize,
			 	y = cohortScale(d.cohort)*gridSize;
			var arrow = d3.select(this)
				.attr('stroke', arrowsData[arrowhead].color)
				.attr('strokeWidth', 2)
				.attr('d', function(d,i){ return 'M '+ (x+(gridSize*.74)) + ' ' + (y+(gridSize*.76))  + ' l ' + 0 + ' ' + (gridSize*-.15);})
				.attr(arrowsData[arrowhead].type, function(d){return 'url(#marker_' + arrowsData[arrowhead].name + ')';});
  	});

	//Create legend
	var legendElementWidth = gridSize*2

	var legend = svg.selectAll('legend')
		.data(colorScale.domain())

  legend.enter().append("g")
    .attr("class", "legend");

    legend.append("rect")
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height)
      .attr("width", legendElementWidth)
      .attr("height", gridSize / 2)
      .attr('stroke', 'black')
      .style("fill", function(d, i) { return colorScale.range()[i]; });

    legend.append("text")
      .attr("class", "mono")
      .text(function(d) { return "≥ " + Math.round(d); })
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height + gridSize);
}

