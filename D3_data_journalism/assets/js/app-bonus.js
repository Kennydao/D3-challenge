function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select('body').select('svg');

  if (!svgArea.empty()) {
      svgArea.remove();
  }

  // Set up svg Margins
  var svgWidth = 960;
  var svgHeight = 600;

  var margin = {
      top: 10,
      right: 20,
      bottom: 80,
      left: 100
  };

  var width = svgWidth - margin.left - margin.right;
  var height = svgHeight - margin.top - margin.bottom;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .classed("chart", true);

  // Append an SVG group
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);



  // var yLabel = "Obesity";

  console.log("begining value XAxis", chosenXAxis);
  console.log("begining value YAxis", chosenYAxis);

// function used for updating x-scale var upon click on axis label
function xScale(dataSet, chosenXAxis) {
  // create scales
  // console.log(dataSet);
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(dataSet, d => d[chosenXAxis]*0.8),
      d3.max(dataSet, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  console.log('in the xScale function');

  return xLinearScale;

}
// yScale function
function yScale(dataSet, chosenYAxis) {
  // create scales
  var yLinearScale = d3.scaleLinear()
        .domain([0, d3.max(dataSet, d => d[chosenYAxis])*1.2])
        .range([height, 0]);

    console.log("hi! am in yScale function!");

    console.log(d3.max(dataSet, d => d[chosenYAxis])*1.2);
    console.log(yLinearScale);

    return yLinearScale;

  }

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    console.log("am in the renderAxes");

  return xAxis;
}

function renderYAxes(newYScale, yAxis) {

    var leftAxis = d3.axisLeft(newYScale);

    // var yAxis = chartGroup.append('g');
    //  .call(leftAxis)
    //  .attr("transform", `translate(0, ${width})`);


    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    console.log("am in the renderYAxes, exiting");
    console.log(yAxis);
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenAxis, circleLabels) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenAxis]));

  // render circles label
  circleLabels.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  // console.log(chosenXAxis)
  // var xLabel;
  switch (chosenXAxis) {
    case "poverty":
        xLabel = "Poverty (%)";
        break;
    case "age":
        xLabel = "Age (Median)";
        break;
    case "income":
        xLabel = "Income (Median)";
        break;
  };

  // var yLabel;
  switch (chosenYAxis) {
    case "healthcare":
        yLabel = "Healthcare (%)";
        break;
    case "smokes":
        yLabel = "Smokes (%)";
        break;
    case "obesity":
        yLabel = "Obesity (%)";
        break;
  };

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {

    //convert number to comma format
    var xVal = `${d[chosenXAxis]}`;
    var yVal = `${d[chosenYAxis]}`;

    xVal = numberWithCommas(xVal);
    yVal = numberWithCommas(yVal);

      return (`${d.state}<br>--------------<br>${xLabel}: ${xVal}<br>
                ${yLabel}: ${yVal}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
    })
    // on mouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
};

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(dataSet, err) {
  if (err) throw err;

  // parse data
  dataSet.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.smokes = +data.smokes;
  });


  var xLinearScale = d3.scaleLinear();
  // .domain([d3.min(poverty), d3.max(poverty)])
  // .range([0,width]);

  var xLinearScale = xScale(dataSet, chosenXAxis);
  //   console.log(xLinearScale);

  var yLinearScale = yScale(dataSet, chosenYAxis);
  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(dataSet, d => d[chosenYAxis])*1.2])
    .range([height, 0]);


  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append y axis to chart
  var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .attr("transform", `translate(0, ${width})`)
    .call(leftAxis);

  chartGroup.append("g")
    .call(leftAxis);

  // append x axis to chart
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);


  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(dataSet)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .attr("class", "stateCircle")
    .attr("fill", "skyblue")
    .attr("opacity", ".6");

  // create circle labels
  var circleLabels = chartGroup.selectAll(null)
    .data(dataSet)
    .enter()
    .append("text");

  circleLabels
    .attr("x", function(d) {
      return xLinearScale(d[chosenXAxis]);})
    .attr("y", function(d) {
      return yLinearScale(d[chosenYAxis])+3;})
    .text(function(d) {
      return d.abbr;})
// .classed("stateText", true);
    .attr("font-family", "sans-serif")
    .attr("font-size", "10px")
    .attr("text-anchor", "middle")
    .attr("fill", "white");


  // Create group for x-axis labels
  var labelsGroup = chartGroup.append("g")
    // .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = labelsGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + 15})`)
    .attr("x", 0)
    .attr("y", 15)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = labelsGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + 15})`)
    .attr("x", 0)
    .attr("y", 35)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = labelsGroup.append("text")
    .attr("transform", `translate(${width / 2}, ${height + 10})`)
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y-axis text labels

  var healthcareLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height/2))
    .attr("dy", "-2em")
    .attr("value", "healthcare")
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height/2))
    .attr("dy", "-3em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var obeseLabel = labelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", 0 - (height/2))
    .attr("dy", "-4em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // axis labels event listener
  labelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");

      switch (value) {
        case "poverty":
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);

          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
          chosenXAxis = value;

          xLinearScale = xScale(dataSet, chosenXAxis);
          xAxis = renderAxes(xLinearScale, xAxis);

          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, circleLabels);
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          console.log("am in the labelsGroup function - chosenXAxis", chosenXAxis);
          break;
        case "age":
          ageLabel
            .classed("active", true)
            .classed("inactive", false);

          povertyLabel
            .classed("active", false)
            .classed("inactive", true);

          incomeLabel
            .classed("active", false)
            .classed("inactive", true);

          chosenXAxis = value;
          chosenXAxis = value;
          xLinearScale = xScale(dataSet, chosenXAxis);
          xAxis = renderAxes(xLinearScale, xAxis);

          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, circleLabels);
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          console.log("am in the labelsGroup function - chosenXAxis", chosenXAxis);
          break;

        case "income":
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);

          ageLabel
            .classed("active", false)
            .classed("inactive", true);

          povertyLabel
            .classed("active", false)
            .classed("inactive", true);

          chosenXAxis = value;
          xLinearScale = xScale(dataSet, chosenXAxis);
          xAxis = renderAxes(xLinearScale, xAxis);

          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, circleLabels);
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

          console.log("am in the labelsGroup function - chosenXAxis", chosenXAxis);
          break;

        case "healthcare":
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);

          smokesLabel
            .classed("active", false)
            .classed("inactive", true);

          obeseLabel
            .classed("active", false)
            .classed("inactive", true);

          chosenYAxis = value;
          console.log("am in the labelsGroup function - chosenYAxis", chosenYAxis);

          yLinearScale = yScale(dataSet, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);

          circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis, circleLabels);
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis,  circlesGroup);
          break;

        case "smokes":
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);

          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);

          obeseLabel
            .classed("active", false)
            .classed("inactive", true);

          chosenYAxis = value;
          console.log("am in the labelsGroup function - chosenYAxis", chosenYAxis);

          yLinearScale = yScale(dataSet, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);

          circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis, circleLabels);
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          break;

        case "obesity":
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);

          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);

          smokesLabel
            .classed("active", false)
            .classed("inactive", true);

          chosenYAxis = value;
          console.log("am in the labelsGroup function - chosenYAxis", chosenYAxis, );

          yLinearScale = yScale(dataSet, chosenYAxis);
          yAxis = renderYAxes(yLinearScale, yAxis);

          circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis, circleLabels);
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
          break;

        }
    });
  }).catch(function(error) {
    console.log(error);
  });
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";
var xLabel = "";
var yLabel = "";

makeResponsive();

d3.select(window).on('resize', makeResponsive);


