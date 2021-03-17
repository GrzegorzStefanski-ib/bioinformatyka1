d3 = window.d3;

var margin = {top: 30, right: 30, bottom: 30, left: 60},
    width = 530 - margin.left - margin.right,
    height = 460 - margin.top - margin.bottom;

  
var svg = d3.select("#plot")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Add X axis
var x = d3.scaleLinear()
  .domain([0, 4000])
  .range([ 0, width ]);
var xAxis = svg.append("g")
  .call(d3.axisTop(x));

// Add Y axis
var y = d3.scaleLinear()
  .domain([0, 500000])
  .range([ 0, height]);

var yAxis = svg.append("g")
  .call(d3.axisLeft(y));
   // Customization
   svg.selectAll(".tick line").attr("stroke", "#EBEBEB")

// Add X axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width / 2 + 50)
    .attr("y", -20)
    .text("Sequence 1");

// Y axis label:
svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 10)
    .attr("x", -height / 2 + 20)
    .text("Sequence 2")


// add the X gridlines
let xGrid = svg.append("g")			
.attr("class", "grid")
.attr("transform", "translate(0," + height + ")")
.call(make_x_gridlines(4)
    .tickSize(-height)
    .tickFormat("")
)

// add the Y gridlines
let yGrid = svg.append("g")			
.attr("class", "grid")
.call(make_y_gridlines(4)
    .tickSize(-width)
    .tickFormat("")
)


document.getElementById("plotData").addEventListener("click", () => {

    let data;
    let args;
    let points = [];

    let pyScript = 'dotPlot.py'
    let seq1 = document.getElementById("Sequence1").value;
    let seq2 = document.getElementById("Sequence2").value;
    let windowSize = document.getElementById("windowSize").value;
    let threshold = document.getElementById("threshold").value;

    if(seq2 != null && seq2.trim() != ""){
        args = [pyScript, seq1, seq2, windowSize, threshold];
    }
    else{
        args = [pyScript, seq1, windowSize, threshold];
    }

    let pythonProcess = window.execFile('Python/python', args, (err, stdout, stderr) => {
        if (err) {
          throw err;
        }
      
        data = stdout;
    });

    pythonProcess.on('close', () => {

    
        if (data === null){
            console.log("output of python script is empty")
            console.log(pyOut)
        }
    
        else {
    
            data = data.toString()
    
            data = data.match(/([\d.]+)/gm)
            if(data != null) {
    
            
              data = data.map(Number);
            
              for (let index = 2; index < data.length; index += 2) {
                points.push(
                    [
                        data[index] * (width * (data[0] - 1) / (data[0] - 0.5) )  / (data[0] - 1) + width * (0.5 / (data[0] - 0.5)), 
                        data[index + 1] * (height * (data[1] - 1) / (data[1] - 0.5) )  / (data[1] - 1) + height * (0.5 / (data[1] - 0.5))
                    ]
                );
              }

              let r = 4 / Math.floor(Math.max(data[0], data[1]) / 100)
    
              svg.selectAll("circle").remove();
              svg.selectAll("circle")
              .data(points)
              .enter()
              .append("circle")
              .attr("cx", function(d) {return d[0]})
              .attr("cy", function(d) {return d[1]})
              .attr("r", r)

                x.domain([-0.5, data[0] - 1])
                y.domain([-0.5, data[1] - 1])

                // add the X gridlines
                if(data[0] < 100 && data[1] < 100){

                    xAxis.call(d3.axisTop(x).ticks(data[0]))
                    yAxis.call(d3.axisLeft(y).ticks(data[1]))

                    xGrid.attr("class", "grid")
                    .attr("transform", "translate(0," + height + ")")
                    .call(make_x_gridlines(data[0])
                        .tickSize(-height)
                        .tickFormat("")
                    )

                    // add the Y gridlines
                    yGrid.attr("class", "grid")
                    .call(make_y_gridlines(data[1])
                        .tickSize(-width)
                        .tickFormat("")
                    )
                }
                else{

                    xAxis.call(d3.axisTop(x).ticks(10))
                    yAxis.call(d3.axisLeft(y).ticks(10))

                    xGrid.attr("class", "grid")
                    .attr("transform", "translate(0," + height + ")")
                    .call(make_x_gridlines(0)
                        .tickSize(-height)
                        .tickFormat("")
                    )

                    // add the Y gridlines
                    yGrid.attr("class", "grid")
                    .call(make_y_gridlines(0)
                        .tickSize(-width)
                        .tickFormat("")
                    )
                }
            }
    
        }

        console.log("done")
    
        
      });
})

document.getElementById("savePlot").addEventListener("click", () => {
    let directory = window.dialog.showSaveDialogSync()

    var config = {
        filename: 'customFileName',
      }
    d3_save_svg.save(d3.select('svg').node(), config);
})

// gridlines in x axis function
function make_x_gridlines(n) {		
    return d3.axisBottom(x)
        .ticks(n)
}

// gridlines in y axis function
function make_y_gridlines(n) {		
    return d3.axisLeft(y)
        .ticks(n)
}
