var main = {
  songs : [],
  tab_create : 0
}
var tabId = 0;
var next_video = 1;

function createTab(){
  if(main.songs.length > 0){
    chrome.tabs.create({'url': main.songs[0].url}, function(tab) {
     tabId = tab.id;
    });
    main.tab_create = 1;
    next_video = 1;
  }
}

function playNextVideo(){
  chrome.tabs.get(tabId, function(tab){
    var l = main.songs.length;
    if(l == 0)
    {
     chrome.tabs.update(tabId, {'url': 'https://www.youtube.com'});
    }
    else
    {  
     chrome.tabs.update(tabId, {'url': main.songs[next_video].url}); 
    }
    next_video = (next_video+1)%l;

  });
}

function playPreviousVideo(){
  chrome.tabs.get(tabId, function(tab){
    var l = main.songs.length;
    var prev = (next_video + l-2)%l;
    next_video = (next_video + l-1)%l;
    if(main.songs.length == 0)
    { 
      chrome.tabs.update(tabId, {'url': 'https://www.youtube.com'});
    }
    else
    {  
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
  var n = Number(songnum);
  if(n>=0 && n<main.songs.length)
    main.songs.splice(n,1);
}

chrome.tabs.onRemoved.addListener(function(tabid){
  if(tabId == tabid)
    main.tab_create = 0;
});

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
function addtodisplay(name, url)
{
	       var data = {"name":name, "url":url};
         main.songs.push(data);
         
}

var getJson = function(url){
  var s = url.split("/watch?v=")
  var first = "https://www.googleapis.com/youtube/v3/videos?id=";
  var second = "&key=AIzaSyDNwkpSo1Jyb6Yo3LDyHH1xm7Syfe2NWQg&part=snippet";
  var new_url = first + s[1] + second;

  var x = new XMLHttpRequest();
  x.open('get', new_url, true);
  x.responseType = 'json';
  x.onreadystatechange = function() {
  if (x.readyState == 4 && x.status == 200) {
    var the_name = x.response.items[0].snippet.title;
    addtodisplay(the_name, url);
    }
  };
    x.send();
};

function somefunction(info, tab){
	if(validateYouTubeUrl(info.linkUrl))
	{
		getJson(info.linkUrl);
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

chrome.contextMenus.create({"title":"Add video to queue", "contexts" : ["link"], 
	"onclick": somefunction});

chrome.contextMenus.create({"title":"Add video to queue", "contexts" : ["video"], 
  "onclick": somefunction2});


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
      playNextVideo();
      sendResponse({res:"next video playing"});
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
  });