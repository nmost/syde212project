var request = require("request");
var fs = require('fs');
var csv = require('csv');
var $ = require("cheerio");
var async = require("async");

var pageRequests = [];
var i = 100;

while (i--) {
  pageRequests.push(function(cb) {
    request("http://en.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=10", function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var listResponse = JSON.parse(body);
        var title;
        var html;
        var requests = [];
        for (var a = 0; a < listResponse.query.random.length; a++) {
          title = encodeURI(listResponse.query.random[a].title);
          (function (urlTitle) {
            requests.push(function(callback) {
              request("http://en.wikipedia.org/wiki/" +  urlTitle, function (error, response, body) {
                callback(null, $('ol.references', body).children().length);
              });
            });
          })(title);
        }
        cb(null, requests);
      } else {
        cb("problem!");
      }
    });
  });
}

async.parallel(pageRequests, function(err, requests) {
  var sourceRequests = []
  for (var i = 0; i < requests.length; i++) {
    sourceRequests.push.apply(sourceRequests, requests[i]);
  }
  async.parallel(sourceRequests, function(err, results) {
    output(results);
  });
})
 
function output(numbers) {
  console.log(numbers);
  var csvArray = []
  for (var i = 0; i < numbers.length; i++) {
    csvArray.push([numbers[i]]);
  }
  csv()
  .from.array(csvArray)
  .to.stream(fs.createWriteStream(__dirname+'/data.csv'));
}