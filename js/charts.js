var chartTheseColumns = function(bindTarget, columns){
    dithrii(bindTarget, columns);
    return;
	var chart = c3.generate({
        bindto: bindTarget,
        data: {
            x: 'x',
            xFormat: '%Y-%d-%m %H:%M:%S',
            columns: columns,
            type: 'area'
        },
        axis: {
            x: {
                type: 'timeseries',
                tick: {
                    format: '%y-%m-%d %H:%M:%S'
                }
            }
        }
    });
}

//https://bl.ocks.org/mbostock/4015254

var dithrii = function(bindTarget, columns){
    var svg = d3.select(bindTarget),
        margin = {top: 20, right: 20, bottom: 30, left: 60},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var parseDate = d3.timeParse("%Y-%m-%d"),
        formatDate = d3.timeFormat("%Y");

    var x = d3.scaleTime()
        .domain([new Date(1999, 0, 1), new Date(2003, 0, 0)])
        .range([0, width]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);

    var area = d3.area()
        .curve(d3.curveStepAfter)
        .y0(y(0))
        .y1(function(d) { return y(d.value); });

    var areaPath = g.append("path")
        .attr("clip-path", "url(#clip)")
        .attr("fill", "steelblue");

    var yGroup = g.append("g");

    var xGroup = g.append("g")
        .attr("transform", "translate(0," + height + ")");


    function zoomed() {
      var xz = d3.event.transform.rescaleX(x);
      xGroup.call(xAxis.scale(xz));
      areaPath.attr("d", area.x(function(d) { return xz(d.date); }));
    }

    var zoom = d3.zoom()
        .scaleExtent([1 / 4, 8])
        .translateExtent([[-width, -Infinity], [2 * width, Infinity]])
        .on("zoom", zoomed);

    var zoomRect = svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .call(zoom);

    g.append("clipPath")
        .attr("id", "clip")
      .append("rect")
        .attr("width", width)
        .attr("height", height);

    d3.csv("flights.csv", function(d) {
      d.date = parseDate(d.date);
      d.value = +d.value;
      return d;
    }, function(error, data) {
      if (error) throw error;
      console.log("Got this far...");
      var xExtent = d3.extent(data, function(d) { return d.date; });
      zoom.translateExtent([[x(xExtent[0]), -Infinity], [x(xExtent[1]), Infinity]])
      y.domain([0, d3.max(data, function(d) { return d.value; })]);
      yGroup.call(yAxis).select(".domain").remove();
      areaPath.datum(data);
      zoomRect.call(zoom.transform, d3.zoomIdentity);
    });
}