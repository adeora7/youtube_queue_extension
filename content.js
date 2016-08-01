//injecting the script
var s = document.createElement('script');
s.src = chrome.extension.getURL('inPageScript.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);

var pause_play = 0;
var load_save = 0 // 0 for save 1 for load

//event listener for video ending
window.addEventListener("getChromeData", function(evt) {
  var request = evt.detail;
  var response = {requestId: request.id};
  //background script play next video

  chrome.runtime.sendMessage({greeting: "next_video"}, function(response) {
    refresh();
  });
  window.dispatchEvent(new CustomEvent("sendChromeData", {detail: response}));
}, false);
//in video controls start
document.getElementById("play_next").addEventListener('click', play_next, false);
document.getElementById("pause_play").addEventListener('click', play_pause, false);
document.getElementById("play_previous").addEventListener('click', play_previous, false);

function play_next(){
  chrome.runtime.sendMessage({greeting: "next_video"}, function(response) {
    refresh();
  });
}
function play_pause()
{
  //window.dispatchEvent(new CustomEvent("pause_play", {detail: "toggle"}));
  chrome.tabs.executeScript(null, {
        code: 'document.querySelector(".ytp-play-button").click()'
    }, function() {
    });
}
function play_previous()
{
  chrome.runtime.sendMessage({greeting: "previous_video"}, function(response){
    refresh();
  });
}
//in video controls end


var songs = [];
var localCopy;

//popup functions start

var playSpecific = function(){
  var songId = this.getAttribute("songId");
  chrome.runtime.sendMessage({greeting: "playSpecific", songid: songId}, function(response) {
    refresh();
  });
  
}

var removeSpecific = function(){
  var songId = this.getAttribute("songId");
  this.parentNode.remove();
  songs.splice(songId,1);
  for(var i = songId;i<close.length;i++)
  {
    if(Number(close[i].getAttribute("songId")) >= songId)
    {
      close[i].setAttribute("songId", Number(close[i].getAttribute("songId"))-1);
      play[i].setAttribute("songId", Number(play[i].getAttribute("songId"))-1);
    }
  }
  var xyz = document.getElementById("number");
  xyz.innerHTML = songs.length;
  chrome.runtime.sendMessage({greeting: "removeSpecific", songid: songId}, function(response) {
    refresh();
  });
}

//popup functions end


//refresh function starts
function refresh(){
chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
	
	//refreshing the list
  localCopy = response.res;
	var main = response.res;
  songs = main.songs;
  var curr = response.curr;
  if(curr == -1)
    curr = songs.length - 1;
	var a = document.getElementById('a');
  a.innerHTML = "";
  var xyz = document.getElementById('number');
	xyz.innerHTML = songs.length;
	for (var i = 0; i < songs.length ; i++) {
		if(i==curr)
      a.innerHTML +=  "<div class='songEach playingThis'><span class='play' songId='"+ i +"'>" + songs[i].name + "</span> <span class='close' songId='"+ i +"'>X</span></div>";
    else
      a.innerHTML +=  "<div class='songEach'><span class='play' songId='"+ i +"'>" + songs[i].name + "</span> <span class='close' songId='"+ i +"'>X</span></div>";
	}
  if(songs.length == 0)
    a.innerHTML = "<span id='playlistEmpty'>Playlist empty.</span>";

  var play = document.getElementsByClassName("play");
  var close = document.getElementsByClassName("close");

  for(i=0;i<play.length;i++)
  {
    play[i].addEventListener('click', playSpecific, false);
    close[i].addEventListener('click', removeSpecific, false);
  }

  if(main.tab_create == 0 && songs.length > 0)
  {

    chrome.runtime.sendMessage({greeting: "create_tab"}, function(response) {
      //alert(response.res);
    });
  }

});

}//refresh function ends
refresh();

// state functions start
function loadState(){
  document.getElementById("storageSlots").style.transition = 'all 0s linear';
  document.getElementById("storageSlots").style.bottom = '0px';
  setTimeout(function(){
    document.getElementById("storageSlots").style.transition = 'all 0.2s linear';
  document.getElementById("storageSlots").style.bottom = '30px';
  }, 100);
  load_save = 1;
}

function saveState(){
  document.getElementById("storageSlots").style.transition = 'all 0s linear';
  document.getElementById("storageSlots").style.bottom = '0px';
  setTimeout(function(){
    document.getElementById("storageSlots").style.transition = 'all 0.2s linear';
    document.getElementById("storageSlots").style.bottom = '30px';
  }, 100);
  load_save=0;
}
function slot1func(){
  if(load_save==0)
  {
    if(confirm("Currently saved playlist int slot 1 will be over-written. Are you sure you want to continue?")){
      chrome.storage.sync.set({'pl1': localCopy}, function() {
       // playlist saved
      });
    }
  }
  else if(load_save==1)
  {
    if(confirm("Last save state from slot 1 will be loaded. Are you sure you want to continue?")){
      chrome.storage.sync.get("pl1", function(data) {
        //console.log(data.pl.songs);
        chrome.runtime.sendMessage({greeting: "loadState", list : data.pl1.songs}, function(response){
          refresh();
        });
      });
    }
  }
  document.getElementById("storageSlots").style.bottom = '0px';
}
function slot2func(){
  if(load_save==0)
  {
    if(confirm("Currently saved playlist int slot 2 will be over-written. Are you sure you want to continue?")){
      chrome.storage.sync.set({'pl2': localCopy}, function() {
       // playlist saved
      });
    }
  }
  else if(load_save==1)
  {
    if(confirm("Last save state from slot 2 will be loaded. Are you sure you want to continue?")){
      chrome.storage.sync.get("pl2", function(data) {
        //console.log(data.pl.songs);
        chrome.runtime.sendMessage({greeting: "loadState", list : data.pl2.songs}, function(response){
          refresh();
        });
      });
    }
  }
  document.getElementById("storageSlots").style.bottom = '0px';
}

function slot3func(){
  if(load_save==0)
  {
    if(confirm("Currently saved playlist int slot 3 will be over-written. Are you sure you want to continue?")){
      chrome.storage.sync.set({'pl3': localCopy}, function() {
       // playlist saved
      });
    }
  }
  else if(load_save==1)
  {
    if(confirm("Last save state from slot 3 will be loaded. Are you sure you want to continue?")){
      chrome.storage.sync.get("pl3", function(data) {
        //console.log(data.pl.songs);
        chrome.runtime.sendMessage({greeting: "loadState", list : data.pl3.songs}, function(response){
          refresh();
        });
      });
    }
  }
  document.getElementById("storageSlots").style.bottom = '0px';
}

function githubfunc(){
  chrome.tabs.create({'url': 'https://github.com/adeora7/youtube_queue_extension'}, function(tab) {
    tabId = tab.id;
  });
}
function fbfunc(){
  chrome.tabs.create({'url': 'https://facebook.com/abhishek.deora.5'}, function(tab) {
    tabId = tab.id;
  });
}

var load = document.getElementById("loadState");
var save = document.getElementById("saveState");
var slot1 = document.getElementById("slot1");
var slot2 = document.getElementById("slot2");
var slot3 = document.getElementById("slot3");
var fb = document.getElementById("fb");
var github = document.getElementById("github");
load.addEventListener('click', loadState, false);
save.addEventListener('click', saveState, false);
slot1.addEventListener('click', slot1func, false);
slot2.addEventListener('click', slot2func, false);
slot3.addEventListener('click', slot3func, false);
github.addEventListener('click', githubfunc, false);
fb.addEventListener('click', fbfunc, false);


//state functions end