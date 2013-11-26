var request = require("request");
var $ = require("cheerio");
var data = [];

var i = 100;
while (i--) {
  request("http://en.wikipedia.org/w/api.php?action=query&list=random&format=json&rnnamespace=0&rnlimit=10", function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var listResponse = JSON.parse(body);
      var title;
      var html;
      for (var i = 0; i < listResponse.query.random.length; i++) {
        title = encodeURI(listResponse.query.random[i].title);
        request("http://en.wikipedia.org/wiki/" +  title, function (error, response, body) {
          data.push($('ol.references', body).children().length);
        });
      }
    }
  });
}
