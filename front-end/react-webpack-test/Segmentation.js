"use strict";

var React = require('react');
var ReactDOM = require('react-dom');
var PieChart = require('react-d3-basic').PieChart;

var width = 700,
    height = 400,
    innerRadius = 30;

// TODO: Make label/value look like this:
// var chartSeries = [
//   {
//     "field": "<5",
//     "name": "less than 5"
//   },
//   {
//     "field": "5-13",
//     "name": "5 to 13"
//   },
//   {
//     "field": "14-17",
//     "name": "14 to 17"
//   },
//   {
//     "field": "18-24",
//     "name": "18 to 24"
//   },
//   {
//     "field": "25-44",
//     "name": "25 to 44"
//   },
//   {
//     "field": "45-64",
//     "name": "45 to 64"
//   }
// ]

var SegmentationPanel = React.createClass({
  render: function () {
    var segmentations = this.props.segmentation_values.map(function (segment, index) {
      return(
        <PieChart
          data= {segment.data}
          width= {width}
          height= {height}
          chartSeries= {segment.chartSeries}
          value = {segment.value}
          name = {segment.name}
          innerRadius = {innerRadius}
        />
      );
    });

    return(
      // TODO: Style this
      <div className="segmentation">
        {segmentations}
      </div>
    );
  }
});