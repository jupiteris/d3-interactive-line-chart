const tempTypes = ['Recorded Room Temperature', 'Weather App Temperature', 'Recorded Ambient Temperature', 'Recorded Exhaust Temperature']
const tempColors = ["red", "yellow", "orange", "lightblue"]

let str = ''
tempTypes.forEach((t, i) => {
    str += `<li><div style="background:` + tempColors[i] + `;"></div><span>${t}</span></li>`
})

document.querySelector('.color-key').innerHTML = str;

//initialize margin start
var margin = { top: 50, right: 50, bottom: 50, left: 50 },
    width = 1200 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom,
    tooltip = { width: 100, height: 100, x: 10, y: -30 };
//initialize margin end
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseDate = d3.timeParse("%Y-%m-%d %H:%M:%S");
var dateFormatter = d3.timeFormat("%I%p");

var x = d3.scaleBand().range([0, width]);
var y = d3.scaleLinear().range([height, 0]);
var z = d3.scaleLinear().range([height, 0]);

var xAxis = d3.axisBottom()
    .scale(x)
    .tickFormat(dateFormatter);
var yAxis = d3.axisRight().scale(y)
var zAxis = d3.axisLeft().scale(z)

var line = d3.line()
    .x(function (d) { return x(d.time); })
    .y(function (d) { return y(d.heat); })
    .defined(((d) => d.heat));;

d3.csv("julespersec.csv", function (error, data) {
    if (error) throw error;

    let temperatures = [];
    let clickedTimes = {};
    data.forEach(function (d) {
        d.time = parseDate(d.time);
        d.heat = parseFloat(d.heat);
        d.values.split(" ").map(t => parseFloat(t)).forEach((e, index) => {
            temperatures.push({
                time: d.time,
                value: e,
                color: tempColors[index]
            })
        })
    });

    x.domain(data.map(d => d.time));
    y.domain([-0.1, 0.4]);
    z.domain([d3.min(temperatures.map(e => e.value)) - 2, d3.max(temperatures.map(e => e.value)) + 2]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)

    svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" + width + ", 0)")
        .attr("stroke", "steelblue")
        .call(yAxis)

    svg.append("g")
        .attr("class", "z axis")
        .call(zAxis)

    // Add X axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("x", width)
        .attr("y", height + 40)
        .text("Time");

    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -margin.top)
        .text("Temperature")

    // Y axis label:
    svg.append("text")
        .attr("text-anchor", "end")
        // .attr("transform", "rotate(-90)")
        .attr("y", -20)
        .attr("x", width + 35)
        .text("Energy")

    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("transform", "translate(25, 0)")
        .attr("d", line);

    svg.selectAll("lineDots")
        .data(data)
        .enter()
        .append("circle")
        .attr("fill", "steelblue")
        .attr("stroke", "none")
        .attr("cx", function (d) { return x(d.time) })
        .attr("cy", function (d) { return y(d.heat) })
        .attr("transform", "translate(25, 0)")
        .attr("r", 9)
        .style("display", d => d.heat ? "block" : "none")
        .style("cursor", "pointer")
        .on("click", function (d) {
            if (clickedTimes[d.time] === undefined) {
                clickedTimes[d.time] = true;
            }
            else {
                clickedTimes[d.time] = !clickedTimes[d.time]
            }

            var tempDotsByTime = document.getElementsByClassName(d.time);

            for (var i = 0; i < tempDotsByTime.length; i++) {
                tempDotsByTime[i].style.display = clickedTimes[d.time] ? "block" : 'none';
            }
        })

    svg.selectAll("tempDots")
        .data(temperatures)
        .enter()
        .append("circle")
        .attr("fill", function (d) { return d.color })
        .attr("class", function (d) { return d.time })
        .attr("transform", "translate(25, 0)")
        .attr("stroke", "none")
        .attr("cx", function (d) { return x(d.time) })
        .attr("cy", function (d) { return z(d.value) })
        .attr("r", 5)
        .style("display", "none")
});