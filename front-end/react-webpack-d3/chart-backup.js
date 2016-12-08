
var margin = { top: 50, right: 0, bottom: 100, left: 30 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    gridSize = Math.floor(width / 12),
    legendElementWidth = gridSize*2,
    buckets = 9,
    colors = ["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"], // alternatively colorbrewer.YlGnBu[9]
    days = ["Mo", "Tu", "We", "Th", "Fr"],
    times = ["1a", "2a", "3a", "4a", "5a"],
    datasets = ["data2.tsv", "data2.tsv"],
    arrowsData = [
	   { id: 0, name: 'arrow_up', triangle_path: 'M 0 0 L 10 5 L 0 10 z', line_path: 'M 25 25 L 25 10', viewbox: '0 0 15 15', color: 'green'},
	   { id: 1, name: 'arrow_down', triangle_path: 'M 0 0 L 10 5 L 0 10 z', line_path: 'M 25 10 L 25 25', viewbox: '0 0 15 15', color: 'red'}
	  ],
	  arrowUp =  { id: 1, name: 'arrow_up', triangle_path: 'M 0 0 L 10 5 L 0 10 z', line_path: 'M 25 25 L 25 10', viewbox: '0 0 15 15', color: 'green'},
   	arrowDown = { id: 0, name: 'arrow_down', triangle_path: 'M 0 0 L 10 5 L 0 10 z', line_path: 'M 25 10 L 25 25', viewbox: '0 0 15 15', color: 'red'};


// TODO: Data Transformation from "(Key 0, Key 1), Pct_Signup" to "(Key 0, Key 1), Avg(Pct_Signup)"
// TODO: Infer labels from data
// TODO: Accepts ordinal scaled data vs numeric type only
// TODO: Calcuate Improvement from previous cell (use cell not key identifier)
// TODO: Font/Font Size
// TODO: @Pat: Selectively apply UP vs DOWN ARROW

var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var defs = svg.append('svg:defs')

var dayLabels = svg.selectAll(".dayLabel")
    .data(days)
    .enter().append("text")
      .text(function (d) { return d; })
      .attr("x", 0)
      .attr("y", function (d, i) { return i * gridSize; })
      .style("text-anchor", "end")
      .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
      .attr("class", function (d, i) { return ((i >= 0 && i <= 4) ? "dayLabel mono axis axis-workweek" : "dayLabel mono axis"); });

var timeLabels = svg.selectAll(".timeLabel")
    .data(times)
    .enter().append("text")
      .text(function(d) { return d; })
      .attr("x", function(d, i) { return i * gridSize; })
      .attr("y", 0)
      .style("text-anchor", "middle")
      .attr("transform", "translate(" + gridSize / 2 + ", -6)")
      .attr("class", function(d, i) { return ((i >= 7 && i <= 16) ? "timeLabel mono axis axis-worktime" : "timeLabel mono axis"); });

var heatmapChart = function(tsvFile) {
  d3.tsv(tsvFile,
  function(d) {
    return {
      day: +d.day,
      hour: +d.hour,
      value: +d.value
    };
  },
  function(error, data) {
    // var colorScale = d3.scale.quantile()
    //     .domain([0, buckets - 1, d3.max(data, function (d) { return d.value; })])
    //     .range(colors);


    var colorScale = d3.scale.linear()
  .domain([-1, 0, 1])
  .range(["red", "white", "green"]);

    var cards = svg.selectAll(".hour")
        .data(data, function(d) {return d.day+':'+d.hour;})
        .enter().append("g");           

    cards.append("rect")
        .attr("x", function(d) { return (d.hour - 1) * gridSize; })
        .attr("y", function(d) { return (d.day - 1) * gridSize; })
        .attr("rx", 4)
        .attr("ry", 4)
        .attr("class", "hour bordered")
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("fill", function(d) { return colorScale(d.value); });

    cards.append("text")
        .attr("class", "mono")
        .text(function (d) { return d; })
        .attr("x", function(d) { return (d.hour - 1) * gridSize; })
        .attr("y", function(d) { return (d.day - 1) * gridSize; })
        .attr("dx", ".75em")
        .attr("dy", "1.55em")
        .attr("font-family", "sans-serif")
        .attr("font-size", "20px")
        .text(function(d) { return d.value; }); 

    cards.append("text")
        .attr("class", "mono")
        .text(function (d) { return d; })
        .attr("x", function(d) { return (d.hour - 1) * gridSize; })
        .attr("y", function(d) { return (d.day - 1) * gridSize; })
        .attr("dx", gridSize*.35)
        .attr("dy", gridSize*.75)
        .text(function(d) { return d.value+10; });

		defs.selectAll('marker')
			  .data(arrowsData)
			  .enter()
			  .append('svg:marker')
			  .attr('id', function(d){ return 'marker_' + d.name;})
			  .attr('markerHeight', 5)
			  .attr('markerWidth', 5)
			  .attr('markerUnits', 'strokeWidth')
			  .attr('orient', 'auto')
			  .attr('refX', 1)
			  .attr('refY', 5)
			  .attr('viewBox', function(d){ return d.viewbox;})
			  .append('svg:path')
			    .attr('d', function(d){ return d.triangle_path;})
			    .attr('fill', function(d) { return d.color;});

			cards.append('svg:path')
			    .each(function(d) {
			            var arrowhead;
			            var x = (d.hour - 1) * gridSize,
			            y = (d.day - 1) * gridSize;
			            var arrow = d3.select(this)
			              .attr('stroke', arrowUp.color)
			              .attr('stroke-width', 2)
			              .attr('d', function(d,i){ return 'M '+ (x+(gridSize*.66)) + ' ' + (y+(gridSize*.75))  + ' l ' + 0 + ' ' + (gridSize*-.15);})
			              .attr('marker-end', function(d){return 'url(#marker_' + arrowUp.name + ')';});
			    });
   
    cards.exit().remove();

    var legend = svg.selectAll(".legend")
        .data([0].concat(colorScale.quantiles()), function(d) { return d; });

    legend.enter().append("g")
        .attr("class", "legend");

    legend.append("rect")
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height)
      .attr("width", legendElementWidth)
      .attr("height", gridSize / 2)
      .style("fill", function(d, i) { return colors[i]; });

    legend.append("text")
      .attr("class", "mono")
      .text(function(d) { return "≥ " + Math.round(d); })
      .attr("x", function(d, i) { return legendElementWidth * i; })
      .attr("y", height + gridSize);
  });  
};

heatmapChart(datasets[0]);