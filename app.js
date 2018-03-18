d3.select(window).on("resize", makeResponsive);

makeResponsive();


function makeResponsive(){
// svg container dimension set-up
  var svgArea = d3.select("body").select("svg");
  if (!svgArea.empty()) {svgArea.remove();}

  // SVG wrapper dimensions are determined by the current width and height of the browser window.
  var svgWidth = window.innerWidth,
      svgHeight = window.innerHeight,
      margin = {top: 10, right: 40, bottom:40, left: 120};

  // plot container dimensions
  var width = svgWidth - margin.left - margin.right,
      height = svgHeight - margin.top - margin.bottom;

  var $div = d3
      .select("body")
      .append("div")
        .attr("id", "chart")

  // DOM svg element creation w/ defined dimensions
  var svg = $div
      .append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
      .append("g")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

  var chart = svg.append("g");

  // append a div to the bodyj to create tooltips, assign it a class
  $div.append("div").attr("class", "tooltip").style("opacity", 0);

  var csv = "./assets/data/data.csv"
  d3.csv(csv, (err, data) => {
      if (err) throw err;

      // convert string to integers
      data.forEach((element) => {
          element.id = +element.id;
          element.poverty = +element.poverty;
          element.no_healthcare_18_64 = +element.no_healthcare_18_64;
          element.yes_1_alcohol_in_last_30_days = +element.yes_1_alcohol_in_last_30_days;
          element.yes_blind_difficulty_seeing = +element.yes_blind_difficulty_seeing;
          element.yes_difficulty_concentrating_remembering = +element.yes_difficulty_concentrating_remembering;
      });

      var xValue = (d) => {return d.poverty;},
          xScale = d3.scaleLinear().range([0, width]),
          xMap = (d) => {return xScale(xValue(d));},
          xAxis = d3.axisBottom(xScale);

      var yValue,
          yScale,
          yMap,
          yAxis;

      function featureSelection(dataColumn){
      // ySetup
          yValue = (d) => {return d[dataColumn];},
          yScale = d3.scaleLinear().range([height, 0]),
          yMap = (d) => {return yScale(yValue(d));},
          yAxis = d3.axisLeft(yScale);
      }

      // initialize tooltip
      var tooltip = d3
            .tip()
            .attr("class", "tooltip")
            .offset([60, -80])
            .html((d) => {
              var stateName = d.state;
              var povertyPerc = d.poverty;
              var columnPerc = d[currentAxisLabelY];

              return "<strong>" + stateName + "</strong>" + "<br>Selection: " + columnPerc + "%<br>Poverty: " + povertyPerc + "%";
            })

      // circleText state setup
      var fValue = (d) => {return d.state_abbr;};

      var currentAxisLabelY = 'no_healthcare_18_64'
      featureSelection(currentAxisLabelY)

      // axis range
      xScale.domain([d3.min(data, xValue)-1, d3.max(data, xValue)+1]);
      yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

      // create tooltip
      chart.call(tooltip);

      // x-axis
      chart.append("g")
          .attr("class", "x-axis")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)

      // y-axis
      chart.append("g")
          .attr("class", "y-axis")
          .call(yAxis)

      // draw dots
      var node = chart.selectAll(".dot")
            .data(data).enter();

          node
            .append("circle")
              .attr("class", "dot")
              .attr("r", 15)
              .attr("cx", xMap)
              .attr("cy", yMap)

            node
            .append("text")
              .attr("class", "state")
              .attr("x", (d) => {return xScale(d.poverty)})
              .attr("y", (d) => {return yScale(d[currentAxisLabelY])})
              .text(fValue)
              .on("mouseover", (d) => {
                tooltip.show(d)})
              .on("mouseout", (d) => {
                  tooltip.hide(d)});

      chart
        .append("text")
        .attr("transform", "translate(" + width/2 + "," + (height + margin.top+20) + ")")
        .attr("class", "axis-text benchmark")
        .text("In Poverty (%)");

      // default active axis
      chart
        .append("text")
        .attr("transform", "translate(" + -margin.left*2/6 + "," + height/2 + ") rotate(270)")
        .attr("class", "axis-text active")
        .attr("data-axis-name", "no_healthcare_18_64")
        .text("Adult Age 18-64 Lacks Healthcare (%)");

      // inactive axis
      chart
        .append("text")
        .attr("transform", "translate(" + -margin.left*3/6 + "," + height/2 + ") rotate(270)")
        .attr("class", "axis-text inactive")
        .attr("data-axis-name", "yes_1_alcohol_in_last_30_days")
        .text("Min 1 Alcoholic Drink in Last 30 Days (%)");


      // inactive axis
      chart
        .append("text")
        .attr("transform", "translate(" + -margin.left*4/6 + "," + height/2 + ") rotate(270)")
        .attr("class", "axis-text inactive")
        .attr("data-axis-name", "yes_blind_difficulty_seeing")
        .text("Blind or Difficulty Seeing Even w/ Glasses (%)");


      // inactive axis
      chart
        .append("text")
        .attr("transform", "translate(" + -margin.left*5/6 + "," + height/2 + ") rotate(270)")
        .attr("class", "axis-text inactive")
        .attr("data-axis-name", "yes_difficulty_concentrating_remembering")
        .text("Difficulty Concentrating, Remembering, Making Decisions (%)");


      function labelChange(clickedAxis){
        d3
          .selectAll(".axis-text")
          .filter(".active")
          .classed("active", false)
          .classed("inactive", true);

        clickedAxis.classed("inactive", false).classed("active", true);
      }


      d3.selectAll(".axis-text").on("click", function(){
        // assign a variable to current axis
        var clickedSelection = d3.select(this);

        // "true" or "false" based on whether the axis is currently selected
        var isClickedSelectionInactive = clickedSelection.classed("inactive");

        var clickedAxis = clickedSelection.attr("data-axis-name");

        if (isClickedSelectionInactive){
          currentAxisLabelY = clickedAxis;
          featureSelection(currentAxisLabelY);

          yScale.domain([d3.min(data, yValue)-1, d3.max(data, yValue)+1]);

          svg
            .select(".y-axis")
            .transition()

            .duration(1800)
            .call(yAxis);

          d3.selectAll(".dot").each(function (){
            d3
              .select(this)
              .transition()
              .attr("cy", (d) => {
                return yScale(+d[currentAxisLabelY]);
              })

              .duration(1800);
          });

          d3.selectAll(".state").each(function (){
            d3
              .select(this)
              .transition()
              .attr("y", (d) => {
                return yScale(+d[currentAxisLabelY]);
              })

              .duration(1800);
          });
          labelChange(clickedSelection);
        }

      })

  });
}
