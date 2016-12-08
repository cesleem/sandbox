'use strict';

/**
 * https://github.com/mikolalysenko/gauss-random
 */
function randomGaussian() {
  return Math.sqrt(-2 * Math.log(Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

var store = function () {
  var data = _.range(256).map(function (i) {
    // console.log(i, " -- ", randomGaussian() + 8);
    return [i, randomGaussian() + 8];
  });
  var data2 = [[1, 4], [2, 2], [3, 9], [4, 6]];
  // console.log("data -> ", data);

  // Initialize crossfilter dataset.
  var filter = crossfilter(data);

  // Create dimensions and groups.
  var index = filter.dimension(function (d) {
    return d[0];
  });
  var indexGroup = index.group().reduceSum(function (d) {
    return d[1];
  });
  var value = filter.dimension(function (d) {
    return d[1];
  });
  var valueGroup = value.group().reduceSum(function (d) {
    return d[1];
  });
  var index2D = filter.dimension(function (d) {
    return d;
  });
  var index2DGroup = index2D.group();

  var charts = [];

  return {
    data: data,
    filter: filter,
    index: index, indexGroup: indexGroup,
    value: value, valueGroup: valueGroup,
    index2D: index2D, index2DGroup: index2DGroup,
    charts: charts
  };
}();

var Chart = {
  create: function create(el, margin, width, height, x, y) {
    // margins have been subtracted from width and height.
    var svg = Chart.setSize(el, margin, width, height);
    var g = Chart.createGroup(svg, margin);

    return {
      svg: svg,
      g: g,
      xAxis: Chart.createXAxis(x),
      yAxis: Chart.createYAxis(y),
      xAxisGroup: Chart.createXAxisGroup(g, height),
      yAxisGroup: Chart.createYAxisGroup(g)
    };
  },
  setSize: function setSize(el, margin, width, height) {
    return d3.select(el).attr('width', width + margin.left + margin.right).attr('height', height + margin.top + margin.bottom);
  },
  createGroup: function createGroup(svg, margin) {
    return svg.append('g').attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
  },
  createXAxis: function createXAxis(x) {
    return d3.svg.axis().scale(x).orient('bottom');
  },
  createYAxis: function createYAxis(y) {
    return d3.svg.axis().scale(y).orient('left');
  },
  createXAxisGroup: function createXAxisGroup(g, height) {
    return g.append('g').attr('class', 'x axis').attr('transform', 'translate(0,' + height + ')');
  },
  createYAxisGroup: function createYAxisGroup(g) {
    return g.append('g').attr('class', 'y axis');
  }
};

var LineChart = React.createClass({
  displayName: 'LineChart',

  propTypes: {
    id: React.PropTypes.string.isRequired,
    dimension: React.PropTypes.object.isRequired,
    group: React.PropTypes.object.isRequired,
    yAccessor: React.PropTypes.func.isRequired
  },
  getDefaultProps: function getDefaultProps() {
    return {
      margin: { top: 32, left: 32, bottom: 32, right: 32 },
      width: 320,
      height: 320,
      xAccessor: function xAccessor(d) {
        return d.key;
      }
    };
  },
  componentDidMount: function componentDidMount() {
    var _props = this.props;
    var group = _props.group;
    var margin = _props.margin;
    var width = _props.width;
    var height = _props.height;
    var x = _props.x;
    var y = _props.y;
    var xAccessor = _props.xAccessor;
    var yAccessor = _props.yAccessor;

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;

    var all = group.all();

    x = x || d3.scale.linear().domain(d3.extent(all, xAccessor)).range([0, width]);

    y = y || d3.scale.linear().domain(d3.extent(all, yAccessor)).range([height, 0]);

    var line = d3.svg.line().x(_.flow(xAccessor, x)).y(_.flow(yAccessor, y));

    var brush = d3.svg.brush().x(x);

    var _Chart$create = Chart.create(this.getDOMNode(), margin, width, height, x, y);

    var g = _Chart$create.g;
    var xAxis = _Chart$create.xAxis;
    var yAxis = _Chart$create.yAxis;
    var xAxisGroup = _Chart$create.xAxisGroup;
    var yAxisGroup = _Chart$create.yAxisGroup;

    xAxis.ticks(6);
    yAxis.ticks(6);

    var linePath = g.append('path').attr('class', 'line');

    var brushGroup = g.append('g').attr('class', 'brush').call(brush);

    brushGroup.selectAll('rect').attr('height', height);

    function redraw() {
      all = group.all().filter(function (d) {
        return d.value;
      });
      xAxisGroup.call(xAxis);
      yAxisGroup.call(yAxis);
      linePath.datum(all).attr('d', line);
    }

    redraw();

    this.chart = {
      margin: margin,
      width: width, height: height,
      x: x, y: y,
      xAxis: xAxis, yAxis: yAxis,
      xAccessor: xAccessor, yAccessor: yAccessor,
      xAxisGroup: xAxisGroup, yAxisGroup: yAxisGroup,
      line: line, linePath: linePath,
      brush: brush, brushGroup: brushGroup,
      redraw: redraw
    };

    store.charts.push(this.chart);

    brush.on('brush', this.onBrush).on('brushend', this.onBrushEnd);
  },
  onBrush: function onBrush() {
    if (this.chart.brush.empty()) {
      this.props.dimension.filterAll();
    } else {
      var extent = this.chart.brush.extent();
      this.props.dimension.filter(extent);
    }

    this.props.redrawAll();
  },
  onBrushEnd: function onBrushEnd() {
    if (this.chart.brush.empty()) {
      this.props.dimension.filterAll();
      this.props.redrawAll();
    }
  },
  shouldComponentUpdate: function shouldComponentUpdate() {
    this.chart.redraw();
    return false;
  },
  render: function render() {
    // console.log( "store.charts --> ", store.charts );

    return React.createElement(
      'svg',
      { className: 'chart' },
      this.props.children
    );
  }
});

var BarChart = React.createClass({
  displayName: 'BarChart',

  propTypes: {
    id: React.PropTypes.string.isRequired,
    dimension: React.PropTypes.object.isRequired,
    group: React.PropTypes.object.isRequired,
    yAccessor: React.PropTypes.func.isRequired
  },
  getDefaultProps: function getDefaultProps() {
    return {
      margin: { top: 32, left: 32, bottom: 32, right: 32 },
      width: 320,
      height: 320,
      xAccessor: function xAccessor(d) {
        return d.key;
      }
    };
  },
  componentDidMount: function componentDidMount() {
    var _props2 = this.props;
    var group = _props2.group;
    var margin = _props2.margin;
    var width = _props2.width;
    var height = _props2.height;
    var x = _props2.x;
    var y = _props2.y;
    var xAccessor = _props2.xAccessor;
    var yAccessor = _props2.yAccessor;
    var padding = _props2.padding;

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;
    padding = padding || 2;

    var all = group.all();

    x = x || d3.scale.linear().domain(d3.extent(all, yAccessor)).range([0, width]);

    var histogram = d3.layout.histogram().value(function (d) {
      return d.value;
    }).bins(x.ticks(24));

    console.log("histogram -->", histogram);

    y = y || d3.scale.linear().domain([0, d3.max(histogram(all), function (d) {
      return d.y;
    })]).range([height, 0]);

    var brush = d3.svg.brush().x(x);

    var _Chart$create2 = Chart.create(this.getDOMNode(), margin, width, height, x, y);

    var g = _Chart$create2.g;
    var xAxis = _Chart$create2.xAxis;
    var yAxis = _Chart$create2.yAxis;
    var xAxisGroup = _Chart$create2.xAxisGroup;
    var yAxisGroup = _Chart$create2.yAxisGroup;

    xAxis.ticks(6);
    yAxis.ticks(6);

    var bars = g.append('g').attr('class', 'bars').selectAll('.bar');
    console.log("g MOUNT --> ", g);
    console.log("bars MOUNT --> ", bars);

    var brushGroup = g.append('g').attr('class', 'brush').call(brush);

    brushGroup.selectAll('rect').attr('height', height);

    function redraw() {
      var all = group.all().filter(function (d) {
        return d.value;
      });

      xAxisGroup.call(xAxis);
      yAxisGroup.call(yAxis);

      bars = bars.data(histogram(all));
      console.log("bars REDRAW --> ", bars);

      bars.enter().append('rect').attr('class', 'bar');

      bars.attr('x', function (d) {
        return x(d.x);
      }).attr('y', function (d) {
        return y(d.y);
      }).attr('width', function (d) {
        return x(d.dx + d.x) - x(d.x) - padding;
      }).attr('height', function (d) {
        return height - y(d.y);
      });

      bars.exit().remove();
    }

    redraw();

    this.chart = {
      margin: margin,
      width: width, height: height,
      x: x, y: y,
      xAxis: xAxis, yAxis: yAxis,
      xAccessor: xAccessor, yAccessor: yAccessor,
      xAxisGroup: xAxisGroup, yAxisGroup: yAxisGroup,
      bars: bars,
      padding: padding,
      brush: brush, brushGroup: brushGroup,
      redraw: redraw
    };

    store.charts.push(this.chart);

    brush.on('brush', this.onBrush).on('brushend', this.onBrushEnd);
  },
  onBrush: function onBrush() {
    if (this.chart.brush.empty()) {
      this.props.dimension.filterAll();
    } else {
      var extent = this.chart.brush.extent();
      this.props.dimension.filter(extent);
    }

    this.props.redrawAll();
  },
  onBrushEnd: function onBrushEnd() {
    if (this.chart.brush.empty()) {
      this.props.dimension.filterAll();
      this.props.redrawAll();
    }
  },
  shouldComponentUpdate: function shouldComponentUpdate() {
    this.chart.redraw();
    return false;
  },
  render: function render() {
    return React.createElement(
      'svg',
      { className: 'chart' },
      this.props.children
    );
  }
});

var ScatterPlot = React.createClass({
  displayName: 'ScatterPlot',

  propTypes: {
    id: React.PropTypes.string.isRequired,
    dimension: React.PropTypes.object.isRequired,
    group: React.PropTypes.object.isRequired,
    yAccessor: React.PropTypes.func.isRequired
  },
  getDefaultProps: function getDefaultProps() {
    return {
      margin: { top: 32, left: 32, bottom: 32, right: 32 },
      width: 320,
      height: 320,
      xAccessor: function xAccessor(d) {
        return d.key;
      }
    };
  },
  componentDidMount: function componentDidMount() {
    var _props3 = this.props;
    var group = _props3.group;
    var margin = _props3.margin;
    var width = _props3.width;
    var height = _props3.height;
    var x = _props3.x;
    var y = _props3.y;
    var xAccessor = _props3.xAccessor;
    var yAccessor = _props3.yAccessor;
    var radius = _props3.radius;

    width = width - margin.left - margin.right;
    height = height - margin.top - margin.bottom;
    radius = radius || 2;

    var all = group.all();

    x = x || d3.scale.linear().domain(d3.extent(all, xAccessor)).range([0, width]);

    y = y || d3.scale.linear().domain(d3.extent(all, yAccessor)).range([height, 0]);

    var plotX = _.flow(xAccessor, x);
    var plotY = _.flow(yAccessor, y);

    var brush = d3.svg.brush().x(x).y(y);

    var _Chart$create3 = Chart.create(this.getDOMNode(), margin, width, height, x, y);

    var g = _Chart$create3.g;
    var xAxis = _Chart$create3.xAxis;
    var yAxis = _Chart$create3.yAxis;
    var xAxisGroup = _Chart$create3.xAxisGroup;
    var yAxisGroup = _Chart$create3.yAxisGroup;

    xAxis.ticks(6);
    yAxis.ticks(6);

    var circles = g.append('g').selectAll('circle');

    var brushGroup = g.append('g').attr('class', 'brush').call(brush);

    function redraw() {
      var all = group.all();

      xAxisGroup.call(xAxis);
      yAxisGroup.call(yAxis);

      circles = circles.data(all);

      circles.enter().append('circle').attr('r', radius);

      circles.attr('cx', plotX).attr('cy', plotY);

      circles.exit().remove();
    }

    redraw();

    this.chart = {
      margin: margin,
      width: width, height: height,
      x: x, y: y,
      xAxis: xAxis, yAxis: yAxis,
      xAccessor: xAccessor, yAccessor: yAccessor,
      xAxisGroup: xAxisGroup, yAxisGroup: yAxisGroup,
      circles: circles,
      radius: radius,
      brush: brush, brushGroup: brushGroup,
      redraw: redraw
    };

    store.charts.push(this.chart);

    brush.on('brush', this.onBrush).on('brushend', this.onBrushEnd);
  },
  onBrush: function onBrush() {
    var _this = this;

    if (this.chart.brush.empty()) {
      this.props.dimension.filterAll();
    } else {
      (function () {
        var extent = _this.chart.brush.extent();
        _this.props.dimension.filterFunction(function (d) {
          return extent[0][0] <= d[0] && d[0] <= extent[1][0] && extent[0][1] <= d[1] && d[1] <= extent[1][1];
        });
      })();
    }

    this.props.redrawAll();
  },
  onBrushEnd: function onBrushEnd() {
    if (this.chart.brush.empty()) {
      this.props.dimension.filterAll();
      this.props.redrawAll();
    }
  },
  render: function render() {
    return React.createElement(
      'svg',
      { className: 'chart' },
      this.props.children
    );
  }
});

var EntireChart = React.createClass({
  displayName: 'EntireChart',
  componentWillMount: function componentWillMount() {
    this.filterAll();
  },
  filterAll: function filterAll() {
    _.forEach([store.index, store.value, store.index2D], function (dimension) {
      return dimension.filterAll();
    });
  },
  redrawAll: function redrawAll() {
    _.forEach(store.charts, function (chart) {
      return chart.redraw();
    });
  },
  render: function render() {
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'chart-group' },
        React.createElement(LineChart, {
          id: 'line-chart',
          dimension: store.index,
          group: store.indexGroup,
          yAccessor: function yAccessor(d) {
            return d.value;
          },
          redrawAll: this.redrawAll })
      ),
      React.createElement(
        'div',
        { className: 'chart-group' },
        React.createElement(BarChart, {
          id: 'bar-chart',
          dimension: store.value,
          group: store.valueGroup,
          yAccessor: function yAccessor(d) {
            return d.value;
          },
          padding: 2,
          redrawAll: this.redrawAll })
      ),
      React.createElement(
        'div',
        { className: 'chart-group' },
        React.createElement(ScatterPlot, {
          id: 'scatter-plot',
          dimension: store.index2D,
          group: store.index2DGroup,
          xAccessor: function xAccessor(d) {
            return d.key[0];
          },
          yAccessor: function yAccessor(d) {
            return d.key[1];
          },
          redrawAll: this.redrawAll })
      )
    );
  }
});

var App = React.createClass({
  displayName: 'App',

  render: function render() {
    return React.createElement(EntireChart, null);
  }
});

React.render(React.createElement(App, null), document.body);