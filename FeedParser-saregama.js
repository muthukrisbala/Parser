var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

var req = request('https://www.youtube.com/feeds/videos.xml?channel_id=UCRhn5l_2zvcMQA0RI2f010g');
var feedparser = new FeedParser();

req.on('error', function (error) {
  // handle any request errors
});

req.on('response', function (res) {
  var stream = this; // `this` is `req`, which is a stream

  if (res.statusCode !== 200) {
    this.emit('error', new Error('Bad status code'));
  }
  else {
    stream.pipe(feedparser);
  }
});

feedparser.on('error', function (error) {
  // always handle errors
});

feedparser.on('readable', function () {
  // This is where the action is!
  var stream = this; // `this` is `feedparser`, which is a stream
  var meta = this.meta; // **NOTE** the "meta" is always available in the context of the feedparser instance
  var item;
  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/onlinetamilportal";

  while (item = stream.read()) {
    //if(item.title.startsWith("Azhagu") || item.title.startsWith("Kalyanaparisu")){
      var title=item.title;
      title=title.replace(/ \| /g," ");
      title=title.replace(/ - /g," ");
      //title=title.replace(/Vision Time/g,"");
      title=title.trim();

      var link=item.link;
      var startindex=link.indexOf("watch?v=");
      var videoid=link.substring(startindex+8,link.Length);
      var pubdate=item.pubdate;
      var date=item.date;
      console.log("Title: "+title);

var dt = new Date();
var dateStr=dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+"T"+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()+"."+dt.getMilliseconds();

var tags="";
var serialname="";
var episode="";
var serialdate="";

  if(item.title.includes("Episode")){
    var titleArr=item.title.split(" ");
    var stindex=titleArr.indexOf("Episode");
    episode=titleArr[stindex+1];
    if(!item.title.includes("Promo")){
      serialdate=titleArr[stindex+2]+""+titleArr[stindex+3]+""+titleArr[stindex+4];
    }

  }
  if(item.title.includes("CHANDRALEKHA")){
    tags="CHANDRALEKHA"+","+"tamil serial"+"suntv";
    serialname="chandralekha";
  }
  if(item.title.includes("VALLI")){
    tags="VALLI"+","+"tamil serial"+",+"+"suntv";
    serialname="valli";
  }
  if(item.title.includes("ROJA")){
    tags="ROJA"+","+"tamil serial"+",+"+"suntv";
    serialname="roja";
  }


          var postobject={};
          postobject.title=title;
          postobject.description=title;
          postobject.keywords=title;
          postobject.img="Test";
          postobject.content=videoid;
          postobject.posttype="video";
          postobject.publishedby="Admin";
          postobject.publishedon=dateStr;
          postobject.category="Tv Serial";
          postobject.tags=tags;
          postobject.serialname=serialname;
          postobject.episode=parseInt(episode);
          postobject.serialdate=serialdate;


          MongoClient.connect(url, function(err, MongoClient) {
            if (err) throw err;
              var db = MongoClient.db("onlinetamilportal");
              var regex = new RegExp(["^", videoid, "$"].join(""), "i");

              db.collection("post").find({"content":regex}).count( function(err, result) {
                if (err) throw err;
                  if(result==0){

                    db.collection("post").insert(postobject,function(err, result) {
                      if (err) throw err;
                      console.log(postobject.title+"Success");

                    });

                  }


                });

              });
    //}
  }
  
  feedparser.on('end', function () {
    console.log('feedparser end event');
});
  
});




