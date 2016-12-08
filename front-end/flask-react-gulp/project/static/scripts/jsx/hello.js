/*** @jsx React.DOM */

var realPython = React.createClass({
	render: function() {
	  return (<h2>Greetings</h2>);
	}
});

ReactDOM.render(
	<realPython />,
	document.getElementById('main')
);