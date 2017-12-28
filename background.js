var main = {
  songs : [],
  tab_create : 0
}

chrome.storage.sync.get('youtube_queue_extension_queue', function(data){
  if(data['youtube_queue_extension_queue'] == undefined)
  {
    data['youtube_queue_extension_queue'] = [];
  }
  else{
    main.songs = data['youtube_queue_extension_queue'];
  }
});

function saveQueue(currentQueue){
  chrome.storage.sync.set({'youtube_queue_extension_queue': currentQueue}, function(){

  });
}

var tabId = 0;
var next_video = 1;

function createTab(){
  if(main.songs.length > 0){
    chrome.tabs.create({'url': main.songs[0].url}, function(tab) {
      tabId = tab.id;
    });
    main.tab_create = 1;
    next_video = 1 % main.songs.length;
  }
}

function playNextVideo(){
  chrome.tabs.get(tabId, function(tab){
    var l = main.songs.length;
    if(l > 0)
    {  
     chrome.tabs.update(tabId, {'url': main.songs[next_video].url});
    }
    next_video = (next_video+1)%l;

  });
}

function playPreviousVideo(){
  chrome.tabs.get(tabId, function(tab){
    if(main.songs.length > 0)
    { 
      var l = main.songs.length;
      var prev = (next_video + l-2)%l;
      next_video = (next_video + l-1)%l;
      chrome.tabs.update(tabId, {'url': main.songs[prev].url});
    }
  });
}

function playSpecificVideo(songnum){
  var n = Number(songnum);
  if(n>=0 && n<main.songs.length)
  {
    chrome.tabs.update(tabId, {'url': main.songs[n].url});
    next_video = (n+1)%main.songs.length;
  }
}
function removeCertainVideo(songnum){
  //songnum is index
  var curr = next_video-1;
  if(curr == -1)
    curr = main.songs.length-1;
  var n = Number(songnum);
  if(n>=0 && n<main.songs.length)
  {
    main.songs.splice(n,1);
    if(n == curr  && n == main.songs.length)
      playSpecificVideo(n-1);
    else if( n == curr )
      playSpecificVideo(n);
    else if(n<curr){
      next_video = next_video-1;
    }
  }
  saveQueue(main.songs);
}

chrome.tabs.onRemoved.addListener(function(tabid){
  if(tabId == tabid)
    main.tab_create = 0;
});
function checkAttributionLink(url)
{
    var regExpAttributionLink = /https:\/\/www.youtube.com\/attribution_link\?a=(.*)&u=\/watch\?v%3D(\w{1,11})(.*)/;
    var matchAttribution = url.match(regExpAttributionLink);
    if(matchAttribution)
    {
      url = "https://www.youtube.com/watch?v=" + matchAttribution[2];
    }
    return url;
}
function validateYouTubeUrl(url)
{
        if (url != undefined || url != '') {
            var regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|\?v=)([^#\&\?]*).*/;
            var match = url.match(regExp);

            if (match && match[2].length == 11) {
				      return 1;  	   
            }
            else {
                return 0;
            }
        }
}

function addtodisplay(name, url, viewCount, duration)
{
	       var data = {"name":name, "url":url, "views": viewCount, "duration": duration};
         main.songs.push(data);
         if(next_video == 0)
            next_video = main.songs.length-1;
          saveQueue(main.songs);
}

var getJson = function(url, callback){
  var s = url.split("/watch?v=");
  var first = "https://www.googleapis.com/youtube/v3/videos?id=";
  var second = "&key=AIzaSyDNwkpSo1Jyb6Yo3LDyHH1xm7Syfe2NWQg&part=snippet,statistics,contentDetails";
  var new_url = first + s[1] + second;

  var x = new XMLHttpRequest();
  x.open('get', new_url, true);
  x.responseType = 'json';
  x.onreadystatechange = function() {
    if (x.readyState == 4 && x.status == 200) {
      var the_name = x.response.items[0].snippet.title;
      var viewCount = x.response.items[0].statistics.viewCount;
      var str = x.response.items[0].contentDetails.duration;
      
      str = str.substr(2);
      str = str.replace("H", "hrs ");
      str = str.replace("M", "mins ");
      str = str.replace("S", "sec");
      str = str.trim();
      
      addtodisplay(the_name, url, viewCount, str);
      if(callback)
        callback();
    }
  };
    x.send();
};

function somefunction(info, tab){
  url = checkAttributionLink(info.linkUrl);
	if(validateYouTubeUrl(url))
	{
		getJson(url);
	}
	else
	{
		alert("invalid url, can't be added");
	}
}

function somefunction2(info, tab){
  if(validateYouTubeUrl(tab.url))
  {
    getJson(tab.url);
  }
  else
  {
    alert("invalid url, can't be added");
  }
}

function empty_queue(){
  var s_len = main.songs.length;
  while(s_len--){
    // removeCertainVideo(0);
    main.songs.splice(0,1);
  }
  saveQueue(main.songs);
}

chrome.contextMenus.create({"title":"Add video to queue", "contexts" : ["link"], 
	"onclick": somefunction});

chrome.contextMenus.create({"title":"Add video to queue", "contexts" : ["video"], 
  "onclick": somefunction2});

chrome.tabs.onUpdated.addListener( function (tId, changeInfo, tab) {
  if (changeInfo.status == 'complete' && tId == tabId) {

    chrome.tabs.executeScript(tabId, {file: "videoEnd.js"});

  }
})

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.greeting == "hello")
      sendResponse({res: main, curr : next_video-1});
    else if(request.greeting == "create_tab"){
      createTab();
      sendResponse({res:"new tab created"});
    }
    else if(request.greeting == "next_video")
    {
      if(request.toggle == "no_loop" && next_video == 0){
          // chrome.tabs.update(tabId, {'url': 'https://www.youtube.com'});
          sendResponse({res:"No more in the queue videos to play!"});
      }
      else{
        playNextVideo();
        sendResponse({res:"next video playing"});
      }
    }
    else if(request.greeting == "previous_video")
    {
      playPreviousVideo();
      sendResponse({res: "previous video playing"});
    }
    else if(request.greeting == "playSpecific")
    {
      playSpecificVideo(request.songid);
      sendResponse({res:"playing specific video"});
    }
    else if(request.greeting == "removeSpecific")
    {
      removeCertainVideo(request.songid);
      sendResponse({res:"removed specific video"});
    }
    else if(request.greeting == "loadState")
    {
      main.songs = request.list;
      saveQueue(main.songs);
      if(main.songs.length > 0)
      {
        playSpecificVideo(0);
      }
      sendResponse({res:"state loaded"});
    }
    else if(request.greeting == "pp")
    {
      sendResponse({res:tabId});
    }
    else if(request.greeting == "empty_queue"){
      empty_queue();
      sendResponse({res: "Queue is now empty."});
    }
    else if(request.greeting == "playFeatured"){
      getJson(request.url, function(){
                            if(main.tab_create==0)
                              createTab();
                            playSpecificVideo( main.songs.length-1 );
                          } );
      sendResponse({res: "Featured video playing."});
    }
    else if(request.greeting == "addIconClicked"){
      var urlObj = { 
        url: request.link
      };
      somefunction2("hello", urlObj); 
    }
  });

