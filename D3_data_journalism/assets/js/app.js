// define width, height and margin for svg object

// resize the chart by screen size
function makeResponsive() {

    var svgArea = d3.select('body').select('svg');

    if (!svgArea.empty()) {
          svgArea.remove();
    }

    var svgWidth = 960;
    var svgHeight = 500;

    var margin = {
      top: 20,
      right: 40,
      bottom: 80,
      left: 100
    };

    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // create an SVG wrapper, append an SVG group that will hold our chart,
    // and shift the latter by left and top margins.
    var svg = d3.select("#scatter")
                .append("svg")
                .classed("chart", true)
                .attr("width", svgWidth)
                .attr("height", svgHeight);

    // append svg group
    var chartGroup = svg.append("g")
                        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // initialize params
    var chosenXAxis = "age";

    // function used for updating x-scale var upon click on axis label
    function xScale(dataSet, chosenXAxis) {
    // create scales

        var xLinearScale = d3.scaleLinear()
            .domain([d3.min(dataSet, d => d[chosenXAxis]*0.9),
            d3.max(dataSet, d => d[chosenXAxis]*1.05)])
            .range([0, width]);
    return xLinearScale;
    }
    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, circlesGroup) {

        var label = "Age (Median)";

        var toolTip = d3.tip()
            .attr("class", "d3-tip")
            .offset([80, -60])
            .html(function(d) {
                return (`<strong>${d.state}</strong><br>--------------<br>${label}: ${d[chosenXAxis]}`);
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
    }

    // Retrieve data from the CSV file and execute everything below
    d3.csv("./assets/data/data.csv").then(function(dataSet, err) {
        if (err) throw err;

        // getting the data from csv and casting as number
        dataSet.forEach(function(data) {
            data.age = +data.age;
            data.smokes = +data.smokes;
        });

        var xLinearScale = xScale(dataSet, chosenXAxis);

        // Create y scale function
        var yLinearScale = d3.scaleLinear()
            .domain([0, d3.max(dataSet, d => d.smokes)*1.2])
            .range([height, 0]);

        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        // append y axis
        chartGroup.append("g")
            .call(leftAxis);

        // append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
                .data(dataSet)
                .enter()
                .append("circle")
                .attr("cx", d => xLinearScale(d.age))
                .attr("cy", d => yLinearScale(d.smokes))
                .attr("r", 15)
                .attr("fill", "skyblue")
                .attr("opacity", ".5")

        // create circle labels
        var circleLabels = chartGroup.selectAll(null)
                .data(dataSet)
                .enter()
                .append("text");

        circleLabels
            .attr("x", function(d) {
                return xLinearScale(d.age);})
            .attr("y", function(d) {
                return yLinearScale(d.smokes)+3;})
            .text(function(d) {
                return d.abbr;})
            // .classed("stateText", true)
            .attr("font-family", "sans-serif")
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .attr("fill", "white");

        // Create group for x-axis labels
        var xAxisLabel = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        xAxisLabel.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "age") // value to grab for event listener
            .classed("active", true)
            .text("Age (Median)");

        // create y axis label

        chartGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "4em")
            .classed('active', true)
            .text("Smokes (%)");

        // updateToolTip function above csv import
        var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    }).catch(function(error) {
            console.log(error);
        });
};

makeResponsive();

d3.select(window).on('resize', makeResponsive);
