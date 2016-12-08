import React from "react";
import ReactDOM from "react-dom";
import FunnelOverall from "./FunnelOverall";
import Segmentation from "./Segmentation";

require('./main.css')

var segmentation_values = {
  device:
    [{ name:'mobile_web', label: 'Mobile Web', num_users: 2000 },
    { name: 'desktop_web', label: 'Desktop Web', num_users: 500 }],
  channel:
    [{ name:'paid', label: 'Paid', num_users: 400 },
    { name: 'brand', label: 'Brand', num_users: 500 }]
};

var funnel_values = [
  { name: 'new_visitors', label: 'New Visitors', num_users: 3245 },
  { name:'signups', label: 'Signups', num_users: 1600 },
  { name: 'profiles', label: 'Profiles', num_users: 300 },
  { name:'first_orders', label: 'First Orders', num_users: 50 }
];

ReactDOM.render(
  <FunnelOverall overall_values={{ name:'overall', label: 'Overall', num_users: '17%' }} funnel_values={funnel_values} />,
  document.getElementById('container')
);



ReactDOM.render(
  <Segmentation segmentation_values={segmentation_values} />,
  document.getElementById('segmentation')
);

