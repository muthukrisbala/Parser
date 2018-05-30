var FeedParser = require('feedparser');
var request = require('request'); // for fetching the feed

var req = request('https://www.youtube.com/feeds/videos.xml?channel_id=UC-lJ-F5mlPP6SYPkkq6gjwA');
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

      var title=item.title;
      //console.log("change Month");

      title=title.replace(/ \| /g," ");
      title=title.replace(/-/g," ");

      title=title.replace(/,/g,"");
      title=title.replace("/","-");
      title=title.replace("/","-");
      title=title.replace("/","-");
      title=title.replace("/","-");
      title=title.replace(/-01-/g," January ");
      title=title.replace(/-02-/g," February ");
      title=title.replace(/-03-/g," March ");
      title=title.replace(/-04-/g," April ");
      title=title.replace("-05-"," May ");
      title=title.replace(/-06-/g," June ");
      title=title.replace(/-07-/g," July ");
      title=title.replace(/-08-/g," August ");
      title=title.replace(/-09-/g," September ");
      title=title.replace(/-10-/g," October ");
      title=title.replace(/-11-/g," November ");
      title=title.replace(/-12-/g," December ");
      title=title.trim();


      var link=item.link;
      var startindex=link.indexOf("watch?v=");
      var videoid=link.substring(startindex+8,link.Length);
      var pubdate=item.pubdate;
      var date=item.date;
    /*  console.log("Title: "+title);
      console.log("Link: "+link);
      console.log("Video ID: "+videoid);
      console.log("pubdate: "+pubdate);
      console.log("date: "+date);
console.log("Before Object construction");*/
var dt = new Date();
var dateStr=dt.getFullYear()+"-"+(dt.getMonth()+1)+"-"+dt.getDate()+"T"+dt.getHours()+":"+dt.getMinutes()+":"+dt.getSeconds()+"."+dt.getMilliseconds();
//console.log("dateSTR:"+dateStr);
var tags="";
  if(item.title.startsWith("Priyamanaval")){
    tags="Priyamanaval"+","+"tamil serial"+"suntv";
  }
  if(item.title.startsWith("Naayagi")){
    tags="Naayagi"+","+"tamil serial"+",+"+"suntv";
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
          //console.log("Before Object print");
        //  console.log("Object: "+postobject);

          MongoClient.connect(url, function(err, MongoClient) {
            if (err) throw err;
              var db = MongoClient.db("onlinetamilportal");
              console.log("Videoid: "+videoid);
              var regex = new RegExp(["^", videoid, "$"].join(""), "i");

              db.collection("post").find({"content":regex}).count( function(err, result) {
                if (err) throw err;
                //  console.log("Result1: "+result);
                  if(result==0){

                    db.collection("post").insert(postobject,function(err, result) {
                      if (err) throw err;
                      console.log(postobject.title+" Success");

                    });

                  }


                });

              });
    //}

  }

});
