
    import React from 'react';
    import ReactDOM from 'react-dom';
    import { Table as Component} from 'pyxley';
    var type = "Table";
var options = {"url": "/mytable/", "className": "display", "params": {}, "id": "mytable", "table_options": {"sDom": "<\"top\">rt<\"bottom\"lp><\"clear\">", "pageLength": 5, "searching": false, "scrollX": true, "deferRender": true, "paging": false, "bSort": true}};
    ReactDOM.render(
        <Component
        type = { type }
options = { options } />,
        document.getElementById("component_id")
    );
    