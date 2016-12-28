//injecting the script
var s = document.createElement('script');
s.src = chrome.extension.getURL('inPageScript.js');
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head || document.documentElement).appendChild(s);

var pause_play = 0;
var load_save = 0 // 0 for save 1 for load
var songToAdd = -1;

//event listener for video ending
window.addEventListener("getChromeData", function(evt) {
  var request = evt.detail;
  var response = {requestId: request.id};
  //background script play next video
  chrome.storage.sync.get("youtube_queue_extension_toggle", function(data){
    chrome.runtime.sendMessage({greeting: "next_video", toggle : data["youtube_queue_extension_toggle"]}, function(response) {
      refresh();
    });
  });
  window.dispatchEvent(new CustomEvent("sendChromeData", {detail: response}));
}, false);
//in video controls start
document.getElementById("play_next").addEventListener('click', play_next, false);
document.getElementById("pause_play").addEventListener('click', play_pause, false);
document.getElementById("play_previous").addEventListener('click', play_previous, false);
document.getElementById("loop_all").addEventListener('click', toggle_loop, false);
document.getElementById("empty").addEventListener('click', empty_queue, false);


function hideP(){
  $("#dropdown1").removeClass("active");
  $("#dropdown1").css({'display':'none', 'opacity':'0'});
}

function play_next(){
  chrome.storage.sync.get("youtube_queue_extension_toggle", function(data){
    chrome.runtime.sendMessage({greeting: "next_video", toggle : data["youtube_queue_extension_toggle"]}, function(response) {
      refresh();
    });
  });
}
function play_pause()
{
  chrome.runtime.sendMessage({greeting: "pp"}, function(response){
    chrome.tabs.executeScript(response.res, {
        code: 'document.querySelector(".ytp-play-button").click()'
      }, function() {
    });
  });
}
function play_previous()
{
  chrome.runtime.sendMessage({greeting: "previous_video"}, function(response){
    refresh();
  });
}

function empty_queue(){
  chrome.runtime.sendMessage({greeting : "empty_queue"}, function(response){
    refresh();
  })
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

//loop functions start
function toggle_loop(){
  chrome.storage.sync.get("youtube_queue_extension_toggle", function(data){
    if(data["youtube_queue_extension_toggle"] == undefined || (data["youtube_queue_extension_toggle"] != "no_loop" && data["youtube_queue_extension_toggle"] != "loop")  ){
      chrome.storage.sync.set({"youtube_queue_extension_toggle" : "loop"}, function(){

      });
    }
    else{
      if(data["youtube_queue_extension_toggle"] == "loop"){
        chrome.storage.sync.set({"youtube_queue_extension_toggle" : "no_loop"}, function(){
          $('#loop_all').tooltip('remove');
          $("#loop_all").attr("data-tooltip", "No Loop");
          $("#loop_all").tooltip();
          $("#loop_all").css("opacity", "0.3");
        });
      }
      else
      {
        chrome.storage.sync.set({"youtube_queue_extension_toggle" : "loop"}, function(){
          $("#loop_all").tooltip('remove');
          $("#loop_all").attr("data-tooltip", "Loop");
          $("#loop_all").tooltip();
          $("#loop_all").css("opacity", "1");
        });
      }
    }

  });
}
//loop functions end

function load_tooltips(){
  chrome.storage.sync.get("youtube_queue_extension_toggle", function(data){
    if(data["youtube_queue_extension_toggle"] == undefined || (data["youtube_queue_extension_toggle"] != "no_loop" && data["youtube_queue_extension_toggle"] != "loop")  ){
      chrome.storage.sync.set({"youtube_queue_extension_toggle" : "loop"}, function(){

      });
    }
    chrome.storage.sync.get("youtube_queue_extension_toggle", function(data){
      if(data["youtube_queue_extension_toggle"] == "no_loop"){
        $("#loop_all").attr("data-tooltip", "No Loop");
        $("#loop_all").css("opacity", "0.3");
      }
      else
        $("#loop_all").attr("data-tooltip", "Loop");
    });
  });


}
load_tooltips();

//refresh function starts
function refresh(){
    chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
    	
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
          a.innerHTML +=  "<div class='songEach'><span class='play playingThis' songId='"+ i +"' title='play'>" + songs[i].name.substring(0, 25) +"..</span><div class='add dropdown-button' songId='"+ i +"' data-activates='dropdown1' title='Choose playlist to add video'>+</div><div class='close' songId='"+ i +"' title='Remove video'>X</div></div>";
        else
          a.innerHTML +=  "<div class='songEach'><span class='play' songId='"+ i +"' title='play'>" + songs[i].name.substring(0, 25) +"..</span><div class='add dropdown-button' songId='"+ i +"' data-activates='dropdown1' title='Choose playlist to add video'>+</div><div class='close' songId='"+ i +"' title='Remove video'>X</div></div>";
      
      }
      if(songs.length == 0)
        a.innerHTML = "<span id='playlistEmpty'>Playlist empty.</span>";
      
      var sel = document.getElementsByClassName('add');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            songToAdd = this.getAttribute('songId');
            $("#dropdown1").addClass("active");
            $("#dropdown1").css({'display':'block', 'opacity':'1'});
          }
        }
      $(window).click(function() {
        hideP();
      });
      $('.add').click(function(event){
        event.stopPropagation();
      });  

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
      fillLoadlist();
    });

}//refresh function ends
function cclear(){
  var pls = [];
  chrome.storage.sync.set({'allPlaylists' : pls}, function(){

  });
}
refresh();
fillLoadlist();

function notif(data){
  var notif = document.getElementById("notifPopup");
  notif.innerHTML = data;
  notif.style.bottom = "10px";
  setTimeout(function(){
    notif.style.bottom = "-40px";
  }, 2000);

}


function deleteSongFromPlaylist(songId, name){
  chrome.storage.sync.get(name, function(data){
    if(data[name] === undefined)
    {
      notif("Can not delete song.");
    }
    else
    {
      var sgs = data[name];
      sgs.splice(songId, 1);
      var obj = {};
      obj[name] = sgs;
      chrome.storage.sync.set(obj, function(){
        populateSongs(name);
      });

    }
  });
}

function populateSongs(name){
  if(name.length == 0)
  {
    notif("Corrupt playlist.");
  }
  else
  {
    chrome.storage.sync.get(name, function(data){
      var sgs = data[name];
      var el = document.getElementById("editWindowBody");
      el.innerHTML = "";
      if(sgs.length == 0)
        el.innerHTML = "<span style='font-size:16px;color:gray;'>Playlist empty.</span>";
      for(var i = 0; i < sgs.length; i++){
        el.innerHTML += "<div class='editEach'><div class='editEachName'>"+ sgs[i].name.substring(0, 25) +"</div><div class='editEachIcon' title='Remove video' songId='"+ i +"'><img src='images/wdelete.png'></div></div>";
      }
      var sel = document.getElementsByClassName('editEachIcon');
      for(var i = 0; i < sel.length; i++) {
        var se = sel[i];
        se.onclick = function() {
          deleteSongFromPlaylist(this.getAttribute('songId'), name);
        }
      }
      $("#editWindowHead").html(name.substring(0,15));
      $("#layer").fadeIn("fast");
      $("#editWindow").fadeIn("medium");
    });
  }
}

function fillLoadlist(){
  var z = document.getElementById("yo");
  z.innerHTML = "";
  z.innerHTML = "<ul id='dropdown1' class='dropdown-content'></ul>";
  var y = document.getElementById("loadBody");
  var x = document.getElementById("dropdown1");
  y.innerHTML = "";
  x.innerHTML = "";
  chrome.storage.sync.get('allPlaylists', function(data){
    if(data.allPlaylists === undefined)
    {
      y.innerHTML += "<h6 style='color:gray;'>No playlists found</h6>";
      x.innerHTML += "<h6 style='color:gray;'>No playlists found</h6>";
    }
    else
    {
      if(data.allPlaylists.length<=0)
      {
        y.innerHTML += "<h6 style='color:gray;'>No playlists found</h6>";
        x.innerHTML += "<h6 style='color:gray;'>No playlists found</h6>";
      }
      else
      {
        for(var i = 0; i< data.allPlaylists.length;i++)
        {
          y.innerHTML += "<div><div class='loadEachList'>"+ data.allPlaylists[i].substring(0,20) +"</div><div class='editImage' name='"+ data.allPlaylists[i] +"' title='Edit playlist'><img src='images/edit.png'></div><div class='deleteImage' name='"+ data.allPlaylists[i] +"' title='Delete playlist'><img src='images/delete.png'></div></div>";
          x.innerHTML += "<li><a href='#!' class='dropEachList' name='"+ data.allPlaylists[i] +"'>"+ data.allPlaylists[i].substring(0, 12) +"</a></li>";
        }

        var sel = document.getElementsByClassName('loadEachList');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            loadPlaylist(this.innerHTML);
          }
        }

        var sel = document.getElementsByClassName('deleteImage');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            deletePlaylist(this.getAttribute('name'));
          }
        }

        var sel = document.getElementsByClassName('editImage');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            populateSongs(this.getAttribute('name'));
          }
        }

        var sel = document.getElementsByClassName('dropEachList');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            addVideoToPlaylist(this.name);
          }
        }

      }
    }
  });
}

function addVideoToPlaylist(name){
  if(songToAdd == -1)
    notif("Not a valid video.");
  else{
    chrome.storage.sync.get(name, function(data){
      if(data[name] === undefined){
        notif("Playlist does not exist.");
      }
      else{

        var pls = data[name];
        if(songToAdd >=songs.length){
          notif("Invalid video");
        }
        else{
          var obj = {};
          pls.push(songs[songToAdd]);
          obj[name] = pls;
          chrome.storage.sync.set( obj , function(){
            notif("Video added to Playlist.");
          });
        }
      }
    });
  }
}

function createNewplaylist(name){

    name = name.replace( /'/g, "" );
    if(name.length <=0){
      notif("Please choose a name.");
    }
    else{
      chrome.storage.sync.get('allPlaylists', function(data){
        if(data.allPlaylists === undefined)
        {
          var pls = [];
          var mobj = {};
          mobj[name] = [];
          chrome.storage.sync.set(mobj, function() {
            pls.push(name);
            chrome.storage.sync.set({'allPlaylists': pls}, function(){
              fillLoadlist();
              notif("Playlist created");
            });
          });  
        }
        else
        {
          var pls = data.allPlaylists;
          if(pls.indexOf(name)==-1){
            var mobj = {};
            mobj[name] = [];
            chrome.storage.sync.set(mobj, function() {
              pls.push(name);
              chrome.storage.sync.set({'allPlaylists': pls}, function(){
                fillLoadlist();
                notif("Playlist created");
              });
            });
          }
          else{
            notif("Please chose some other name!");
          }
        }
      });
    }
}

function deletePlaylist(name){
  chrome.storage.sync.get(name, function(data){
    if(data[name] === undefined){

      chrome.storage.sync.get('allPlaylists', function(data){
          var tempPlaylist = data.allPlaylists;
          var xi = tempPlaylist.indexOf(name);
          if(xi>=0){
            tempPlaylist.splice(xi, 1);
            chrome.storage.sync.set( {'allPlaylists' : tempPlaylist} , function() {
              fillLoadlist();
              notif("Playlist deleted.");
            });
          }
          else
          {
            notif("Corrupt playlist.");
          }
          
        });

    }
    else{
      chrome.storage.sync.remove(name, function(){
        chrome.storage.sync.get('allPlaylists', function(data){
          var tempPlaylist = data.allPlaylists;
          var xi = tempPlaylist.indexOf(name);
          if(xi>=0){
            tempPlaylist.splice(xi, 1);
            chrome.storage.sync.set( {'allPlaylists' : tempPlaylist} , function() {
              fillLoadlist();
              notif("Playlist deleted.");
            });
          }
          else
          {
            notif("Corrupt playlist.");
          }
        });  
      });
    }
  });
}


function loadPlaylist(name){
  chrome.storage.sync.get(name, function(data){
    if(data[name] === undefined)
    {
      notif("Playlist does not exist");
    }
    else
    {
      if(data[name].length > 0)
      {
        chrome.runtime.sendMessage({greeting: "loadState", list : data[name]}, function(response){
          refresh();
          notif("Playlist loaded.");
        });
      }
      else
      {
        notif("Playlist empty.");
      }
    }
  });
}


function githubfunc(){
  chrome.tabs.create({'url': 'https://github.com/adeora7/youtube_queue_extension'}, function(tab) {
    tabId = tab.id;
  });
}

var apb = document.getElementById("addPlaylistButton");

apb.addEventListener('click', function(){
  var nn = document.getElementById("addPlaylistName").value;
  createNewplaylist(nn);
}, false);

$(window).click(function() {
  hideP();
});

$("#howToUse").click(function(){
  $("#layer").fadeIn("fast");
  $("#info").fadeIn("medium");
});

$("#editWindowDone").click(function(){
  $("#editWindow").fadeOut("medium");
  $("#layer").fadeOut("fast");
});

$("#infoClose").click(function(){
  $("#info").fadeOut("medium");
  $("#layer").fadeOut("fast");
});

$("#github").click(function(){
  githubfunc();
});

$(document).ready(function(){
  $("#layer").hide();
  $("#editWindow").hide();
  $("#info").hide();
});