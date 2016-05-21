var analysis = {
  setup : function (error, data) {
    var margin = {
      top : 20,
      right : 20,
      bottom : 150,
      left : 100
    },
    width = 1080 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var formatPercent = d3.format(".0%");

    var x = d3.scale.ordinal()
      .rangeRoundBands([0, width], .1, 1);

    var y = d3.scale.linear()
      .range([height, 0]);

    var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom");

    var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

    var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    (function (error, data) {
      data = data.splice(0, 30);
      data.forEach(function (d) {
        d.msg_count = +d.msg_count;
      });

      x.domain(data.map(function (d) {
          return d.name;
        }));
      y.domain([0, d3.max(data, function (d) {
            return d.msg_count;
          })]);

      svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".35em")
      .attr("transform", "rotate(-70)");

      svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Msg_count");

      svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) {
        return x(d.name);
      })
      .attr("width", x.rangeBand())
      .attr("y", function (d) {
        return y(d.msg_count);
      })
      .attr("height", function (d) {
        return height - y(d.msg_count);
      })
      .append("title")
      .text(function (d) {
        return d.msg_count;
      });

      d3.select("input").on("change", change);

      function change() {
        // Copy-on-write since tweens are evaluated after a delay.
        var x0 = x.domain(data.sort(this.checked
               ? function (a, b) {
              return b.msg_count - a.msg_count;
            }
               : function (a, b) {
              return d3.ascending(a.name, b.name);
            })
            .map(function (d) {
              return d.name;
            })
            .splice(0, 30))
          .copy();

        svg.selectAll(".bar")
        .sort(function (a, b) {
          return x0(a.name) - x0(b.name);
        });

        var transition = svg.transition().duration(750),
        delay = function (d, i) {
          return i * 50;
        };

        transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function (d) {
          return x0(d.name);
        });

        transition.select(".x.axis")
        .call(xAxis)
        .selectAll("g")
        .delay(delay);
      }
    })(undefined, data);
  }
}

chrome.runtime.sendMessage({
  cmd : 'request_data'
}, function (responseData) {
  console.log(responseData)
  var data = [];
  responseData.forEach(function (d) {
    data.push({
      name : Object.keys(d)[0],
      msg_count : d[Object.keys(d)[0]]
    });
  });
  analysis.setup(undefined, data);
});
