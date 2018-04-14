(function() {
var imgs = [];
var predictions = [];
var graphIndex = 0;
var numTabs = 0;
var currTab = 0;

var sendGraph = function(request) {
	console.log("Sent");
	chrome.tabs.create({"url": "tones.html"});
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			//var graphIndex = request.graphIndex;
			//var img = imgs[graphIndex];
			//var prediction = predictions[graphIndex]
			currTab = tabs[tabs.length - 1];

			var result = JSON.parse(request.data);
			var x = result.x;
			var y = result.y;
			var minY = result.minY;
			var maxY = result.maxY;
			console.log(JSON.stringify(result));
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
				console.log(currTab);
				chrome.tabs.sendMessage(currTab.id, {"x": x, "y" : y, "minY" : minY, "maxY": maxY, "message" : "single-graph"}, function(response) {

					});
			});

		});
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	console.log("Reached Background" + "\n" + request.message);
    if( request.message === "line-graphs-loaded" ) {
      imgs = request.imgs;
	  predictions = request.predictions;
	  console.log(imgs);
    }
	else if (request.message === "audibilize-graph") {
		sendGraph(request);
	}
  }
);


})();
