function draw_gnr_chart(chart_type, chart_id, data, margin, width, height, sortOrder=null){
    var chartNode = d3.select("#" + chart_id);

    var value_data = data.filter(function(d){return d.value != "" && d.value !== undefined})

    if(value_data.length == 0){
        chartNode.append("p").text("No data (can programmatically remove element/move it to end)");
        return(false)
    }

    var allIndicator = d3.map(data, function(d){return(d.indicator)}).keys();
    var indicatorSelect = chartNode
      .append("select");
    indicatorSelect
      .selectAll('option')
      .data(allIndicator)
      .enter()
      .append('option')
      .text(function (d) { return d; })
      .attr("value", function (d) { return d; });

    var firstIndicator = allIndicator[0];

    var disaggregationSelect = chartNode
      .append("select");

    var svg = chartNode
      .append("svg")
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .attr("style","background-color: white;")
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    function draw_chart(selectedIndicator, selectedDisaggregation){
      clean_up();
      if(selectedDisaggregation === null){
        disaggregationSelect.selectAll("option").remove();
        var allDisaggregation = d3.map(data.filter(function(d){return d.indicator == selectedIndicator}), function(d){return(d.disaggregation)}).keys();
        disaggregationSelect
          .selectAll('option')
          .data(allDisaggregation)
          .enter()
          .append('option')
          .text(function (d) { return d; })
          .attr("value", function (d) { return d; });
        var selectedDisaggregation = allDisaggregation[0];
        if(allDisaggregation.length > 1){
          disaggregationSelect.attr("style","display: inline;")
        }else{
          disaggregationSelect.attr("style","display: none;")
        }
      }
      var filteredData = data.filter(function(d){ return d.indicator == selectedIndicator && d.disaggregation == selectedDisaggregation});
      var allYears = d3.map(filteredData, function(d){return(d.year)}).keys();
      if(chart_type == "line" || chart_type == "bar"){
        if(allYears.length > 1){
            draw_line_chart(filteredData);
        }else{
            draw_bar_chart(filteredData);
        }
      }
    }

    function draw_line_chart(filteredData){
      if(sortOrder !== null){
        var allDisaggValues = d3.map(filteredData, function(d){return d.disagg_value}).keys().sort( function(a, b) {
            return (sortOrder[a.disagg_value] - sortOrder[b.disagg_value]);
        });
      }else{
        var allDisaggValues = d3.map(filteredData, function(d){return d.disagg_value}).keys().sort();
      }
      filteredData = filteredData.filter(function(d){ return d.value != "" && d.value !== undefined})
      var colorScale = d3.scaleOrdinal()
        .domain(allDisaggValues)
        .range(d3.schemeSet2);
      var x = d3.scaleLinear()
        .domain(d3.extent(filteredData, function(d) { return d.year; }))
        .range([ 0, width ]);
      var xAxis = d3.axisBottom(x).ticks(4).tickFormat(d3.format("d"));
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);
      var y = d3.scaleLinear()
        .domain(d3.extent(filteredData, function(d) { return +d.value; }))
        .range([ height, 0 ])
        .nice();
      var yAxis = d3.axisLeft().ticks(7).scale(y);
      svg.append("g")
        .call(yAxis);
      for(var i = 0; i < allDisaggValues.length; i++){
        svg.append("path")
          .datum(filteredData.filter(function(d){return d.disagg_value == allDisaggValues[i]}))
          .attr("d", d3.line()
            .x(function(d) { return x(d.year) })
            .y(function(d) { return y(+d.value) })
          )
          .attr("stroke", function(d){ return colorScale(allDisaggValues[i]) })
          .style("stroke-width", 2)
          .style("fill", "none");
        svg
          .append("rect")
          .attr("x", width + 10)
          .attr("y", i*15 - (10/2))
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", function(d){ return colorScale(allDisaggValues[i]) });
        svg
          .append("text")
          .attr("x", width + 25)
          .attr("y", i*15 + 4)
          .style("fill", "#443e42")
          .text(function(d){ return allDisaggValues[i] })
          .attr("text-anchor", "left")
          .style("font-size", "10px");
      }

      var highlight = svg
        .append("circle")
        .attr("r", 2.5)
        .attr("style","opacity:0;");

      var tooltip = svg.append("text")
        .attr("class","tooltip")
        .attr("font-size",12);
      var tooltipBackground = svg.append("rect")
        .attr("class","tooltip-bg")
        .attr("fill","black")
        .attr("rx",5);

      svg.append("rect")
        .attr("style","opacity:0;")
        .attr("width", width)
        .attr("height", height)
        .on("mousemove", function(){
          var mouse_position = d3.mouse(this);
          var x_pos = x.invert(mouse_position[0]);
          var y_pos = y.invert(mouse_position[1]);
          var closest_year_distance = d3.min(filteredData, function(d){ return Math.abs(x_pos - d.year)});
          var closest_year = filteredData.filter(function(d){return Math.abs(x_pos - d.year) == closest_year_distance})[0].year;
          var filtered_data_by_year = filteredData.filter(function(d){ return d.year == closest_year });
          var closest_value_distance = d3.min(filtered_data_by_year, function(d){ return Math.abs(y_pos - d.value)});
          var closest_value = filtered_data_by_year.filter(function(d){return Math.abs(y_pos - d.value) == closest_value_distance})[0].value;
          var highlight_data = filtered_data_by_year.filter(function(d){ return d.value == closest_value});
          tooltip
          .attr("x",mouse_position[0] + 5)
          .attr("y",mouse_position[1])
          .text(
            parseFloat(highlight_data[0].value).toFixed(2)
          );
          var tooltip_bbox = tooltip.node().getBBox();
          tooltipBackground
          .attr("x",tooltip_bbox.x - 2)
          .attr("y",tooltip_bbox.y - 2)
          .attr("height", tooltip_bbox.height + 4)
          .attr("width", tooltip_bbox.width + 4)
          .attr("style","opacity: 0.1;");
          highlight
            .data(highlight_data)
            .attr("cx", function(d){return x(d.year)})
            .attr("cy", function(d){return y(d.value)})
            .attr("fill", function(d){return colorScale(d.disagg_value) })
            .attr("style","opacity:1;");
        })
        .on('mouseout', function(){
          tooltip
            .text("");
          tooltipBackground
            .attr("style","opacity:0;");
          highlight
            .attr("style","opacity:0;");
        });
    }

    function draw_bar_chart(filteredData){
        if(sortOrder !== null){
          var allDisaggValues = d3.map(filteredData, function(d){return d.disagg_value}).keys().sort( function(a, b) {
            return (sortOrder[a.disagg_value] - sortOrder[b.disagg_value]);
          });
        }else{
          var allDisaggValues = d3.map(filteredData, function(d){return d.disagg_value}).keys().sort();
        }
        filteredData = filteredData.filter(function(d){ return d.value != "" && d.value !== undefined})
        var colorScale = d3.scaleOrdinal()
          .domain(allDisaggValues)
          .range(d3.schemeSet2);
        var x_max = d3.max(filteredData, function(d) { return d.year; });
        var x = d3.scaleLinear()
          .domain([0, x_max*2])
          .range([0, width]);
        var xAxis = d3.axisBottom(x).tickValues(filteredData.map(function(d){ return d.year })).tickFormat(d3.format("d"));
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis);
        var y = d3.scaleLinear()
          .domain(d3.extent(filteredData, function(d) { return +d.value; }))
          .range([ height, 0 ])
          .nice();
        var yAxis = d3.axisLeft().ticks(7).scale(y);
        svg.append("g")
          .call(yAxis);
        var disaggScale = d3.scaleBand()
            .domain(allDisaggValues)
            .range([0, width])
            .padding(0.2);
        for(var i = 0; i < allDisaggValues.length; i++){
          svg.append("rect")
            .data(filteredData.filter(function(d){return d.disagg_value == allDisaggValues[i]}))
            .attr("x", function(d){return disaggScale(allDisaggValues[i])})
            .attr("y", function(d){return y(d.value)})
            .attr("height", function(d){return height - y(d.value)})
            .attr("width", disaggScale.bandwidth())
            .attr("fill", function(d){ return colorScale(allDisaggValues[i]) })
            .style("stroke-width", 2)
            .on("mousemove", function(highlight_data){
                var mouse_position = d3.mouse(this);
                tooltip
                .attr("x",mouse_position[0] + 5)
                .attr("y",mouse_position[1])
                .text(
                  parseFloat(highlight_data.value).toFixed(2)
                );
                var tooltip_bbox = tooltip.node().getBBox();
                tooltipBackground
                .attr("x",tooltip_bbox.x - 2)
                .attr("y",tooltip_bbox.y - 2)
                .attr("height", tooltip_bbox.height + 4)
                .attr("width", tooltip_bbox.width + 4)
                .attr("style","opacity: 0.1;");
              })
              .on('mouseout', function(){
                tooltip
                  .text("");
                tooltipBackground
                  .attr("style","opacity:0;");
              });;
          svg
            .append("rect")
            .attr("x", width + 10)
            .attr("y", i*15 - (10/2))
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d){ return colorScale(allDisaggValues[i]) });
          svg
            .append("text")
            .attr("x", width + 25)
            .attr("y", i*15 + 4)
            .style("fill", "#443e42")
            .text(function(d){ return allDisaggValues[i] })
            .attr("text-anchor", "left")
            .style("font-size", "10px");
        }
  
        var tooltip = svg.append("text")
          .attr("class","tooltip")
          .attr("font-size",12);
        var tooltipBackground = svg.append("rect")
          .attr("class","tooltip-bg")
          .attr("fill","black")
          .attr("rx",5);
    }

    function clean_up(){
      svg.selectAll("*").remove();
    }

    draw_chart(firstIndicator, null);

    indicatorSelect.on("change", function(d) {
        draw_chart(indicatorSelect.property("value"), null)
    });
    disaggregationSelect.on("change", function(d) {
        draw_chart(indicatorSelect.property("value"), disaggregationSelect.property("value"))
    });
  }