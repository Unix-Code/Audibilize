(function() {
if (!document.URL.includes("tones.html")) {
	console.log("exited" + document.URL);
	return;
}
console.log("Tones: " + document.URL);	
	
var sample = new OscillatorSample();
sample.toggle();
sample.toggle();
sample.changeType('sine');
var playing = false;
//sample.changeFrequency(800);

var xList = [] //0 to 29
var yList = [] //range -1 to 1

for(var i=0; i<= 50; i++){
  xList.push(i);
  yList.push(Math.sin((i/50.0)*Math.PI*2));
}

//console.log(yList);
var min_freq = 320;
var max_freq = 800;
var min_data = Math.min(...yList)
var max_data = Math.max(... yList)

function convert (y) {
  var ratio = (y - min_data) / (max_data - min_data);
  var frequency = ((max_freq - min_freq) * ratio) + min_freq;
  return frequency;

}

/*
for(var i=0; i<50; i++){
    sample.changeFrequency(convert(y[x[i]], min_freq, max_freq, min_data, max_data));
}*/

function closestX(xCoord) {
  var diffs = xList.slice(0);

  diffs = diffs.map(function(valX) { return Math.abs(valX - xCoord); });

  var minDiff = Math.min(...diffs);
  var minDiffInd = diffs.indexOf(minDiff);
  return minDiffInd;
}

// percent_x is 0 to 1 (left side to right side of screen)
function playAudio(percent_x){
  // get x minimum
  // get x maximum

  // TODO calc later

  // console.log("Graph/Window Ratio: " + percent_x);

  // console.log("x: " + xList);
  var min = Math.min(...xList);
  // console.log("MinX: " + min);
  var max = Math.max(...xList);

  var graphWidth = max - min;
  // console.log("Graph Width: " + graphWidth);
  var xCoord = graphWidth * percent_x + min;

  console.log("Graph x coord: " + xCoord);
  // find the nearest x, then look up the y for it..
  // TODO ****
  var closestXVal = closestX(xCoord);
  console.log("Closest Xval: " + closestXVal);
  var y = yList[closestXVal];
  console.log("Non-Standardized: " + y);
  var freq = convert(y);
  console.log(freq);
  sample.changeFrequency(freq);
}


var mouseIsDown = false;
document.addEventListener("mousedown", function(){
  console.log("Clicking");
  mouseIsDown = true;
  if (!playing) {
    sample.toggle();
  }
  playing = true;
})

document.addEventListener("mouseup", function(){
  console.log("Not Clicking");
  mouseIsDown = false;
  if (playing) {
    sample.toggle();
  }
  playing = false;
})


document.addEventListener("mousemove", function(e){
   if(mouseIsDown){
     var winX = e.pageX;
     var winY = e.pageY;
     console.log("( " + winX + ", " + winY + ")")
     var winWidth = document.documentElement.clientWidth;
     var winHeight = document.documentElement.clientHeight;

     var percent_x = Math.min(winX / winWidth, 1);

     playAudio(percent_x);
   }
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	if (request.message === "single-graph") {
		console.log(JSON.stringify(request));
		min_data = request.minY;
		max_data = request.maxY;
		xList = request.x;
		yList = request.y;
		// var prediction = request.prediction;
		// console.log("Prediction: " + prediction);
		// console.log("Made it from request");
	}
  }
);

})();




