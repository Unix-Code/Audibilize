(function() {

var validExtension = function (url) {
    return(url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

var getOffset = function (el) {
  el = el.getBoundingClientRect();
  return {
    left: el.left + window.scrollX,
    top: el.top + window.scrollY
  }
}

var comparePos = function (pos1, pos2) {
	var x1 = pos1.left;
	var x2 = pos2.left;
	var y1 = pos1.top;
	var y2 = pos2.top;

	if (y1 === y2) {
		return x2 - x1;
	}
	else {
		return y1 - y2
	}
}

var sortImgs = function (imgsColl) {
	var imgs = [].slice.call(imgsColl);
	imgs = imgs.filter((img) => validExtension(img.src));
	//console.log(imgs);
	var imgPosPairs = imgs.map(img => [img, getOffset(img)]);
	//console.log(imgPosPairs);
	imgPosPairs.sort((pair1, pair2) => comparePos(pair1[1], pair2[1]));

	return imgPosPairs;
}

var sendToIndico = function (endpoint, data, callback) {
  var key = 'a0fb001e73d90238c232cac782678907',
    collectionName = 'GraphTypesTest4',
    url = 'https://apiv2.indico.io/' + endpoint,
    log = function(res) { console.log(res) };

  var callback = callback || log;

  // Using jQuery ($) to make requests
  $.post(url, JSON.stringify({
    api_key: key,
    data: data,
    collection: collectionName
  }), callback);
}

var isLineGraph = function (pred) {
	cutoff = 0.50
    tcurve = pred.curve > cutoff
    return tcurve;
}

var displayResults = function (data) {
	console.log(JSON.parse(data));
	for (var i = 0; i < imgs.length; i++) {
		var result = JSON.parse(data).results[i];
		if (isLineGraph(result)) {
			console.log("src: " + imgs[i][0].src + "\nalt: " + imgs[i][0].alt);
			console.log("result: " + result);
		}
	}
}

var sendResultsToBackground = function (data) {
	package = {};
	package.predictions = JSON.parse(data).results;
	package.imgs = imgs;
	package.message = "line-graphs-loaded";
	//chrome.tabs.sendMessage(package, {"message": "line-graphs-loaded"});
	chrome.runtime.sendMessage(package, function(response) {
	});
}

var graphIndex = 0;

var ctrlPressed = false;
var shiftPressed = false;
var rightAngleBracketPressed = false;


document.addEventListener("keyup", function(e) {
	if (!e.repeat) {
		// console.log("Released: " + e.key);
		if (e.key === "Control") {
			ctrlPressed = false;
		}
		if (e.key === "Shift") {
			shiftPressed = false;
		}
		if (e.key === ">") {
			rightAngleBracketPressed = false;
		}
	}
});

var deliver = function (data) {
	chrome.runtime.sendMessage({"data": data, "message" : "audibilize-graph"}, function(response) {
	});
}

document.addEventListener("keydown", function(e){
	if (!e.repeat) {
		// console.log("Pressed: " + e.key);
		if (e.key === "Control") {
			ctrlPressed = true;
		}
		if (e.key === "Shift") {
			shiftPressed = true;
		}
		if (e.key === ">") {
			rightAngleBracketPressed = true;
		}
		if (ctrlPressed && shiftPressed && rightAngleBracketPressed) {
			console.log("Execute Thing"); // Placeholder
			graphIndex++;
			var img = package.imgs[graphIndex];
			var endpoint = "https://172.18.4.248:5000/data_points";


				$.post(endpoint, JSON.stringify({
						"url": img.src,
						"step" : 3
					}), deliver);
		}
	}
});

var imgs = document.getElementsByTagName("img");
imgs = sortImgs(imgs);
var package = {};
var imgUrls = imgs.map((x) => x[0].src);
// console.log(imgUrls);
sendToIndico('custom/batch/predict', imgUrls, sendResultsToBackground);

})();
