from flask import request,Flask
from flask_cors import CORS
from point import locate_point
import json
app = Flask(__name__)
CORS(app)

@app.route("/")
def hello():
    return "Hello World!"

@app.route("/data_points", methods=['POST'])
def parse_request():
    dataDict=request.json
    #print("++++++on+++", data)
    #dataDict = json.loads(str(data))
    print(dataDict)
    url = dataDict[u'url'].encode("utf-8")
    step = dataDict[u'step']
    res = locate_point(url, step)
    return res

#app.run(host='172.18.4.248')
