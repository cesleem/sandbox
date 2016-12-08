import React from "react";
export default React.createClass({
 render: function() {
 	var overall_values = this.props.overall_values
 	var funnel_values = this.props.funnel_values.map(function (funnel_value) {
   	return (
   		<div id={funnel_value.name}>
			<span className="label">{funnel_value.label}</span>
			<span className="value">{funnel_value.num_users}</span>
		</div>
   	);
   });

   return (
   	<div>
	    <div id={overall_values.name}>
				<span className="label">{overall_values.label}</span>
				<span className="value">{overall_values.num_users}</span>
		</div>
		<div className="funnel">
			{funnel_values}
		</div>
	</div>
	);

 },
});