var pal = {
  "dark_orange": "#DE5D09",
  "orange": "#F39000",
  "light_orange": "#FCC97A",
  "dark_aqua": "#007495",
  "aqua": "#93CAC9",
  "aqua_light": "#B2D8D7",
  "aqua_extra_light": "#D1E7E5",
  "dark_grey": "#475C6D",
  "grey": "#A0ADBB",
  "light_grey": "#CFD9E5"
};

var defaultPal = [pal.dark_orange, pal.orange, pal.light_orange, pal.aqua_light, pal.aqua, pal.grey];

function scaleBandInvert(scale) {
  var domain = scale.domain().reverse();
  var bandWidth = scale.bandwidth()
  var eachBand = scale.step();
  return function (value) {
    var index = Math.floor((value / eachBand));
    return domain[Math.max(0,Math.min(index, domain.length-1))];
  }
}

function draw_gnr_chart(chart_type, chart_id, data, margin, width, height, legend_orders){
    var chartNode = d3.select("#" + chart_id);

    var value_data = data.filter(function(d){return d.value != "" && d.value !== undefined})

    if(value_data.length == 0){
        chartNode.append("p").text("No data (can programmatically remove element/move it to end)");
        return(false)
    }
    var overallSelect = chartNode
    .append("div")
    .attr('class', 'overallselect');
    overallSelect
          .append("input")
          .attr("value", "Overall")
          .attr("id","Overall"+"_"+chart_id)
          .attr("type", "radio")
          .attr("name", chart_id+"_overall_radio")
          .attr("checked", true);
    overallSelect
          .append('label')
          .attr("for", "Overall"+"_"+chart_id)
          .text("Overall");
    overallSelect
          .append("input")
          .attr("value", "Disaggregates")
          .attr("id","Disaggregates"+"_"+chart_id)
          .attr("type", "radio")
          .attr("name", chart_id+"_overall_radio")
    overallSelect
          .append('label')
          .attr("for", "Disaggregates"+"_"+chart_id)
          .text("Disaggregates");
    var allIndicator = d3.map(data, function(d){return(d.indicator)}).keys();
    var indicatorSelect = chartNode
      .append("div")
      .attr('class', 'indicatorselect');
    for(var i = 0; i < allIndicator.length; i++){
        theIndicator = allIndicator[i]
        if(i == 0){
        indicatorSelect
          .append("input")
          .attr("value", theIndicator)
          .attr("id", theIndicator+"_"+chart_id+"_indic")
          .attr("type", "radio")
          .attr("name", chart_id+"_indic_radio")
          .attr("checked", true);
        }else{
          indicatorSelect
            .append("input")
            .attr("value", theIndicator)
            .attr("id", theIndicator+"_"+chart_id+"_indic")
            .attr("type", "radio")
            .attr("name", chart_id+"_indic_radio");
        }
        
        indicatorSelect
        .append('label')
        .attr("for", theIndicator+"_"+chart_id+"_indic")
        .text(theIndicator);
    }

    var firstIndicator = [allIndicator[0]];

    var currentDisaggregation = "";
    var disaggregationSelect = chartNode
      .append("div")
      .attr('class', 'disaggregationselect');
    var svg = chartNode
      .append("svg")
        .attr('preserveAspectRatio', 'xMinYMin meet')
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .attr("style","background-color: white;")
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    function draw_chart(selectedIndicator, selectedDisaggregation, selectedOverall){
      clean_up();

      if(selectedDisaggregation !== null){
        currentDisaggregation = selectedDisaggregation;
      }
      if(selectedDisaggregation === null){
        disaggregationSelect.selectAll("*").remove()
        var allDisaggregation = d3.map(data.filter(function(d){return selectedIndicator.includes(d.indicator)}), function(d){return(d.disaggregation)}).keys();
        var overallIndex = allDisaggregation.indexOf("Overall")
        if (overallIndex > -1){
          allDisaggregation.splice(overallIndex,1)
        }
        for(var i = 0; i < allDisaggregation.length; i++){
            theDisaggregation = allDisaggregation[i]
            if(allDisaggregation.includes(currentDisaggregation)){
              if(theDisaggregation == currentDisaggregation){
                disaggregationSelect
                .append("input")
                .attr("value", theDisaggregation)
                .attr("id", theDisaggregation+"_"+chart_id+"_disagg")
                .attr("type", "radio")
                .attr("name", chart_id+"_disagg_radio")
                .attr("checked", true);
                }else{
                    disaggregationSelect
                    .append("input")
                    .attr("value", theDisaggregation)
                    .attr("id", theDisaggregation+"_"+chart_id+"_disagg")
                    .attr("type", "radio")
                    .attr("name", chart_id+"_disagg_radio");
                }
            }else{
              if(i == 0){
                disaggregationSelect
                .append("input")
                .attr("value", theDisaggregation)
                .attr("id", theDisaggregation+"_"+chart_id+"_disagg")
                .attr("type", "radio")
                .attr("name", chart_id+"_disagg_radio")
                .attr("checked", true);
                }else{
                    disaggregationSelect
                    .append("input")
                    .attr("value", theDisaggregation)
                    .attr("id", theDisaggregation+"_"+chart_id+"_disagg")
                    .attr("type", "radio")
                    .attr("name", chart_id+"_disagg_radio");
                }
            }
            
            
            disaggregationSelect
            .append('label')
            .attr("for", theDisaggregation+"_"+chart_id+"_disagg")
            .text(theDisaggregation);
        }
        if(allDisaggregation.includes(currentDisaggregation)){
          selectedDisaggregation = currentDisaggregation;
        }else{
          selectedDisaggregation = allDisaggregation[0];
        }
      }else{
        var allDisaggregation = d3.map(data.filter(function(d){return selectedIndicator.includes(d.indicator)}), function(d){return(d.disaggregation)}).keys();
      }

      if( selectedOverall == "Overall"){
        var filteredData = data.filter(function(d){ return "Overall" == d.disaggregation});
        var filteredDataIndicator = d3.map(filteredData, function(d){return d.indicator}).keys();
        if( filteredData.length == 0 || filteredDataIndicator.length != allIndicator.length){
          selectedOverall = "Disaggregates";
          overallSelect.attr("style", "display: none;")
        }
      }

      if(selectedOverall != "Overall"){
        indicatorSelect.attr("style","display: block;")
        if(allDisaggregation.length > 1){
          disaggregationSelect.attr("style","display: inline;")
        }else{
          disaggregationSelect.attr("style","display: none;")
        }
      }else{
        disaggregationSelect.attr("style","display: none;")
        indicatorSelect.attr("style","display: none;")
      }
      if(chart_type=="numberline"){
        indicatorSelect.attr("style","display: none;")
        overallSelect.attr("style","display: none;")
      }

      if(selectedOverall == "Overall" && chart_type != "numberline"){
        selectedDisaggregation = "Overall";
        var filteredData = data.filter(function(d){ return selectedDisaggregation == d.disaggregation});
        filteredData.forEach(function(d,i,dat){dat[i].disagg_value = d.indicator});
      } else {
        var filteredData = data.filter(function(d){ return selectedIndicator.includes(d.indicator) && selectedDisaggregation == d.disaggregation});
      }
      
      var allYears = d3.map(filteredData, function(d){return(d.year)}).keys();
      if(chart_type == "line" || chart_type == "bar"){
        if(allYears.length > 1){
            draw_line_chart(filteredData, selectedDisaggregation);
        }else{
            draw_bar_chart(filteredData, selectedDisaggregation);
        }
      }else if(chart_type == "numberline"){
          draw_numberline_chart(data, selectedDisaggregation);
      }
    }

    function draw_line_chart(filteredData, selectedDisaggregation){
      var allDisaggValues = d3.map(filteredData, function(d){return d.disagg_value}).keys().sort();
      if(Object.keys(legend_orders).includes(selectedDisaggregation)){
        var legendOrder = legend_orders[selectedDisaggregation];
        var filteredLegend = Object.keys(legendOrder).filter(
          function(key){return allDisaggValues.includes(key)}
        ).reduce(
          function(obj, key){
            obj[key] = legendOrder[key];
            return(obj)
          }, {}
        );
        var allDisaggValues = Object.keys(filteredLegend);
        var disaggPal = Object.values(filteredLegend);
      }else{
        var disaggPal = defaultPal;
      };
      filteredData = filteredData.filter(function(d){ return d.value != "" && d.value !== undefined})
      var colorScale = d3.scaleOrdinal()
        .domain(allDisaggValues)
        .range(disaggPal);
      var y = d3.scaleLinear()
        .domain(d3.extent(filteredData, function(d) { return +d.value; }))
        .range([ height, 0 ])
        .nice();
      var yAxis = d3.axisLeft().ticks(4).scale(y).tickSize(0).tickSizeOuter(0).tickSizeInner(-width).tickFormat( function(d) { return d + "%" } );
        svg.append("g")
        .attr('class', 'yaxis')
        .call(yAxis);
      var x = d3.scaleLinear()
        .domain(d3.extent(filteredData, function(d) { return d.year; }))
        .range([ 0, width ]);
      var xAxis = d3.axisBottom(x).ticks(4).tickFormat(d3.format("d")).tickSize(5).tickSizeOuter(0);
      svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr('class', 'xaxis')
        .call(xAxis);
      svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr('class','yaxistitle')
        .style("text-anchor", "end")
        .text("Prevalence (%)");
      for(var i = 0; i < allDisaggValues.length; i++){
        svg.append("path")
          .datum(filteredData.filter(function(d){return (d.disagg_value) ==allDisaggValues[i]}))
          .attr("d", d3.line()
            .x(function(d) { return x(d.year) })
            .y(function(d) { return y(+d.value) })
          )
          .attr("stroke", function(d){ return colorScale(d[0].disagg_value) })
          .style("stroke-width", 2)
          .style("fill", "none");
        svg
          .append("rect")
          .attr("x", width + 20)
          .attr("y", i*20 + 4)
          .attr("width", 10)
          .attr("height", 10)
          .style("fill", function(d){ return colorScale(allDisaggValues[i]) });
        svg
          .append("text")
          .attr("class","legend")
          .attr("x", width + 40)
          .attr("y", i*20 +12.5)
          .style("fill", "#475C6D")
          .text(function(d){ return allDisaggValues[i] })
          .attr("text-anchor", "left");
      }

      var highlight = svg
        .append("circle")
        .attr("r", 2.5)
        .attr("style","opacity:0;");

      var tooltip = svg.append("text")
        .attr("class","tooltip")
        .style("fill", "#475C6D");
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
          var tooltip_threshold_y = (d3.max(filteredData,function(d){return d.value})-d3.min(filteredData,function(d){return d.value})) * 0.1
          var closest_year_distance = d3.min(filteredData, function(d){ return Math.abs(x_pos - d.year)});
          var closest_year = filteredData.filter(function(d){return Math.abs(x_pos - d.year) == closest_year_distance})[0].year;
          var filtered_data_by_year = filteredData.filter(function(d){ return d.year == closest_year });
          var closest_value_distance = d3.min(filtered_data_by_year, function(d){ return Math.abs(y_pos - d.value)});
          var closest_value = filtered_data_by_year.filter(function(d){return Math.abs(y_pos - d.value) == closest_value_distance})[0].value;
          var highlight_data = filtered_data_by_year.filter(function(d){ return d.value == closest_value});
          if(Math.abs(closest_value_distance) < tooltip_threshold_y && Math.abs(closest_year_distance) < 0.5){
          tooltip
          .attr("x",mouse_position[0]-30)
          .attr("y",mouse_position[1])
          .text(
            parseFloat(highlight_data[0].value).toFixed(2)+", "+highlight_data[0].disagg_value
          )
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
          } else {
            tooltip
            .text("");
          tooltipBackground
            .attr("style","opacity:0;");
          highlight
            .attr("style","opacity:0;");
          }
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

    function draw_bar_chart(filteredData, selectedDisaggregation){
        var allDisaggValues = d3.map(filteredData, function(d){return d.disagg_value}).keys().sort();
        if(Object.keys(legend_orders).includes(selectedDisaggregation)){
          var legendOrder = legend_orders[selectedDisaggregation];
          var filteredLegend = Object.keys(legendOrder).filter(
            function(key){return allDisaggValues.includes(key)}
          ).reduce(
            function(obj, key){
              obj[key] = legendOrder[key];
              return(obj)
            }, {}
          );
          var allDisaggValues = Object.keys(filteredLegend);
          var disaggPal = Object.values(filteredLegend);
        }else{
          var disaggPal = defaultPal;
        };
        filteredData = filteredData.filter(function(d){ return d.value != "" && d.value !== undefined})
        var colorScale = d3.scaleOrdinal()
          .domain(allDisaggValues)
          .range(disaggPal);
        var y = d3.scaleLinear()
          .domain(d3.extent(filteredData, function(d) { return +d.value; }))
          .range([ height, 0 ])
          .nice();
        var yAxis = d3.axisLeft().ticks(4).scale(y).tickSize(0).tickSizeOuter(0).tickSizeInner(-width).tickFormat( function(d) { return d + "%" } );
        svg.append("g")
          .attr('class', 'yaxis')
          .call(yAxis);
        var x_max = d3.max(filteredData, function(d) { return d.year; });
        var x = d3.scaleLinear()
          .domain([0, x_max*2])
          .range([0, width]);
        var xAxis = d3.axisBottom(x).tickSizeOuter(0).tickValues(filteredData.map(function(d){ return d.year })).tickFormat(d3.format("d"));
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .attr('class', 'xaxis')
          .call(xAxis);
        svg.append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 0 - margin.left)
          .attr("x", 0)
          .attr("dy", "1em")
          .attr('class','yaxistitle')
          .style("text-anchor", "end")
          .text("Prevalence (%)");
        var disaggScale = d3.scaleBand()
            .domain(allDisaggValues)
            .range([0, width])
            .padding(0.2);
        for(var i = 0; i < allDisaggValues.length; i++){
          svg.append("rect")
            .data(filteredData.filter(function(d){return (d.disagg_value) == allDisaggValues[i]}))
            .attr("x", function(d){return disaggScale(allDisaggValues[i])})
            .attr("y", function(d){return y(d.value)})
            .attr("height", function(d){return height - y(d.value)})
            .attr("width", disaggScale.bandwidth())
            .attr("fill", function(d){ return colorScale(d.disagg_value) })
            .attr("stroke", "black")
            .style("stroke-width", 2)
            .on("mousemove", function(highlight_data){
                var mouse_position = d3.mouse(this);
                tooltip
                .attr("x",mouse_position[0] -30)
                .attr("y",mouse_position[1])
                .text(
                  parseFloat(highlight_data.value).toFixed(2)+", "+highlight_data.disagg_value
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
              });
          svg
            .append("rect")
            .attr("x", width + 20)
            .attr("y", i*20 +4)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d){ return colorScale(allDisaggValues[i]) });
          svg
            .append("text")
            .attr("class","legend")
            .attr("x", width + 40)
            .attr("y", i*20 +12.5)
            .style("fill", "#475C6D")
            .text(function(d){ return allDisaggValues[i] })
            .attr("text-anchor", "left");
        }
  
        var tooltip = svg.append("text")
          .attr("class","tooltip")
          .style("fill", "#475C6D");
        var tooltipBackground = svg.append("rect")
          .attr("class","tooltip-bg")
          .attr("fill","black")
          .attr("rx",5);
    }

    function draw_numberline_chart(filteredData, selectedDisaggregation){
        var allIndicatorDisaggValues = d3.map(filteredData, function(d){return d.indicator +  ": " + d.disagg_value}).keys().sort();
        var allDisaggValues = d3.map(filteredData, function(d){return d.disagg_value}).keys().sort();
        if(Object.keys(legend_orders).includes(selectedDisaggregation)){
          var legendOrder = legend_orders[selectedDisaggregation];
          var filteredLegend = Object.keys(legendOrder).filter(
            function(key){return allDisaggValues.includes(key)}
          ).reduce(
            function(obj, key){
              obj[key] = legendOrder[key];
              return(obj)
            }, {}
          );
          var allDisaggValues = Object.keys(filteredLegend);
          var disaggPal = Object.values(filteredLegend);
        }else{
          var disaggPal = defaultPal;
        };
        var allIndicatorValues = d3.map(filteredData, function(d){return d.indicator}).keys();
        filteredData = filteredData.filter(function(d){ return d.value != "" && d.value !== undefined})
        var colorScale = d3.scaleOrdinal()
          .domain(allDisaggValues)
          .range(disaggPal);
        var x = d3.scaleLinear()
          .domain(d3.extent(filteredData, function(d) { return +d.value; }))
          .range([0, width])
          .nice();
        var xAxis = d3.axisBottom(x).ticks(7).tickSizeOuter(0);
        svg.append("g")
          .attr("transform", "translate(0," + height + ")")
          .attr("class","xaxis")
          .call(xAxis);
        var y = d3.scaleBand()
          .domain(allIndicatorValues)
          .range([ height, 0 ]);
        var halfBandwidth = y.bandwidth()/2;
        var yAxis = d3.axisLeft().scale(y).tickSize(-width).tickSizeOuter(0);
        svg.append("g")
          .attr("class","yaxis")
          .call(yAxis);
        var disaggScale = d3.scaleBand()
            .domain(allIndicatorDisaggValues)
            .range([0, width]);
        for(var i = 0; i < allIndicatorDisaggValues.length; i++){
          svg.append("circle")
            .data(filteredData.filter(function(d){return (d.indicator +  ": " + d.disagg_value) == allIndicatorDisaggValues[i]}))
            .attr("cx", function(d){return x(d.value)})
            .attr("cy", function(d){return y(d.indicator) + halfBandwidth})
            .attr("stroke", function(d){ return colorScale(d.disagg_value) })
            .style("stroke-width", 1.5)
            .attr("r", 4)
            .attr("fill", "none");
        }
        for(var i = 0; i < allDisaggValues.length; i++){
          svg
            .append("circle")
            .attr("cx", width + 10)
            .attr("cy", i*20)
            .attr("r", 4)
            .style("stroke", function(d){ return colorScale(allDisaggValues[i]) })
            .style("stroke-width", 1.5)
            .attr("fill", "none");
          svg
            .append("text")
            .attr("class","legend")
            .attr("x", width + 25)
            .attr("y", i*20 + 4)
            .style("fill", "#475C6D")
            .text(function(d){ return allDisaggValues[i] })
            .attr("text-anchor", "left");
        }
  
    var highlight = svg
        .append("circle")
        .attr("r", 4)
        .attr("style","opacity:0;");

      var tooltip = svg.append("text")
        .attr("class","tooltip")
        .style("fill", "#475C6D");
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
          var y_pos = scaleBandInvert(y)(mouse_position[1]);
          var filtered_data_by_y = filteredData.filter(function(d){ return d.indicator == y_pos});
          var closest_x_distance = d3.min(filtered_data_by_y, function(d){ return Math.abs(x_pos - d.value)});
          var closest_x = filtered_data_by_y.filter(function(d){return Math.abs(x_pos - d.value) == closest_x_distance})[0].value;
          var highlight_data = filtered_data_by_y.filter(function(d){ return d.value == closest_x });
          if(Math.abs(closest_x_distance)<10){
          tooltip
          .attr("x",mouse_position[0] + 5)
          .attr("y",mouse_position[1])
          .text(
            parseFloat(highlight_data[0].value).toFixed(2)+", "+highlight_data[0].disagg_value
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
            .attr("cx", function(d){return x(d.value)})
            .attr("cy", function(d){return y(d.indicator) + halfBandwidth})
            .attr("fill", function(d){return colorScale(d.disagg_value) })
            .attr("style","opacity:1;");
          }else {
              tooltip
              .text("");
            tooltipBackground
              .attr("style","opacity:0;");
            highlight
              .attr("style","opacity:0;");
            }
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

    function clean_up(){
      svg.selectAll("*").remove();
    }

    draw_chart(firstIndicator, null, "Overall");

    indicatorSelect.on("change", function(d) {
        var selectedIndicators = indicatorSelect.selectAll("input:checked").nodes().map(function(d){return d.value})
        var selectedOverall = overallSelect.selectAll("input:checked").nodes().map(function(d){return d.value})[0]
        draw_chart(selectedIndicators, null,selectedOverall)
    });
    disaggregationSelect.on("change", function(d) {
        var selectedIndicators = indicatorSelect.selectAll("input:checked").nodes().map(function(d){return d.value})
        var selectedDisaggregation = disaggregationSelect.selectAll("input:checked").nodes().map(function(d){return d.value})[0]
        var selectedOverall = overallSelect.selectAll("input:checked").nodes().map(function(d){return d.value})[0]
        draw_chart(selectedIndicators, selectedDisaggregation,selectedOverall)
    });
    overallSelect.on("change", function(d) {
      var selectedIndicators = indicatorSelect.selectAll("input:checked").nodes().map(function(d){return d.value})
      var selectedDisaggregation = disaggregationSelect.selectAll("input:checked").nodes().map(function(d){return d.value})[0]
      var selectedOverall = overallSelect.selectAll("input:checked").nodes().map(function(d){return d.value})[0]
      draw_chart(selectedIndicators, selectedDisaggregation,selectedOverall)
  });
  }