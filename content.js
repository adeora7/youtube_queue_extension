var pause_play = 0;
var load_save = 0 // 0 for save 1 for load
var songToAdd = -1;

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
  console.log("hello");
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
    		// if(i==curr)
      //     a.innerHTML +=  "<div class='songEach'><span class='play playingThis' songId='"+ i +"' title='play'>" + songs[i].name.substring(0, 25) +"..</span><div class='add dropdown-button' songId='"+ i +"' data-activates='dropdown1' title='Choose playlist to add video'>+</div><div class='close' songId='"+ i +"' title='Remove video'>X</div></div>";
      //   else
      //     a.innerHTML +=  "<div class='songEach'><span class='play' songId='"+ i +"' title='play'>" + songs[i].name.substring(0, 25) +"..</span><div class='add dropdown-button' songId='"+ i +"' data-activates='dropdown1' title='Choose playlist to add video'>+</div><div class='close' songId='"+ i +"' title='Remove video'>X</div></div>";
      
        a.innerHTML += "<div class='songEach'>"+
                          "<div class='songEachName' title='"+songs[i].name+"' songId='"+i+"'>"+
                            songs[i].name + "</div>"+
                          "<div class='songEachViews'>"+songs[i].views+" views</div>"+
                          "<div class='songEachDurationAndOptions'>"+
                            "<div class='songEachDuration'>"+songs[i].duration+"</div>"+
                            "<div class='songEachOptions'>"+
                              "<div class='songEachAdd dropdown-button' data-activates='dropdown1' title='Add to Playlist' songId='"+i+"'>"+
                                "<img src='images/playlist_gray.png'>"+
                              "</div>"+
                              "<div class='verticalRule'></div>"+
                              "<div class='songEachRemove' title='Remove' songId='"+i+"'>"+
                                "<img src='images/remove_gray.png'>"+
                              "</div>"+
                            "</div>"+
                          "</div>"+
                      "</div>";
      
        a.innerHTML += "<div class='horizontalRule'></div>";
      }
      var allSongsInQueue = $(".songEachName");
      for (var pc = 0; pc < allSongsInQueue.length; pc++) {
        if( parseInt(allSongsInQueue[pc].getAttribute('songId'), 10) == curr )
          $(allSongsInQueue[pc]).addClass("songEachCurrent");
      }
      if(songs.length == 0)
        a.innerHTML = "<span class='playlistEmpty'>Right Click on a Youtube video to add it to queue.</span>";
      
      var sel = document.getElementsByClassName('songEachAdd');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            songToAdd = this.getAttribute('songId');
            hideP();
            setTimeout(function(){
              $("#dropdown1").addClass("active");
              $("#dropdown1").css({'display':'block', 'opacity':'1'});
            }, 100);
            
          }
        }
      $(window).click(function() {
        hideP();
      });
      $('.songEachAdd').click(function(event){
        event.stopPropagation();
      });  

      var play = document.getElementsByClassName("songEachName");
      var close = document.getElementsByClassName("songEachRemove");


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

function notif(data){
  var notif = document.getElementById("notifPopup");
  notif.innerHTML = data;
  notif.style.bottom = "10px";
  var move = notif.offsetHeight + 10;
  setTimeout(function(){
    notif.style.bottom = "-" + move + "px";
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
        el.innerHTML += "<div class='editEach'><div class='editEachName' title='"+sgs[i].name+"'>"+ sgs[i].name.substring(0, 25) +"</div><div class='editEachIcon' title='Remove video' songId='"+ i +"'><img src='images/wdelete.png'></div></div>";
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
function showStorePlaylist(sgs, name){
  var el = document.getElementById("editWindowBody");
  el.innerHTML = "";
  if(sgs.length == 0)
    el.innerHTML = "<span style='font-size:16px;color:gray;'>Playlist empty.</span>";
  for(var i = 0; i < sgs.length; i++){
    el.innerHTML += "<div class='editEach'><div class='editEachName' title='"+sgs[i].name+"'>"+ sgs[i].name.substring(0, 25) +"</div></div>";
  }
  $("#editWindowHead").html(name.substring(0,15));
  $("#layer").fadeIn("fast");
  $("#editWindow").fadeIn("medium");
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
      y.innerHTML += "<span class='playlistEmpty'>No playlists found</span>";
      x.innerHTML += "<span class='playlistEmpty'>No playlists found</span>";
    }
    else
    {
      if(data.allPlaylists.length<=0)
      {
        y.innerHTML += "<span class='playlistEmpty'>No playlists found</span>";
        x.innerHTML += "<span class='playlistEmpty'>No playlists found</span>";
      }
      else
      {
        for(var i = 0; i< data.allPlaylists.length;i++)
        {
          y.innerHTML += "<div class='loadEachTile' name='"+ data.allPlaylists[i] +"'><div class='loadEachList' title='"+data.allPlaylists[i]+"'>"+
                          data.allPlaylists[i].substring(0,30) +"</div><div class='optionsEachPlaylist' name='"+ data.allPlaylists[i] +"'><div class='playImage' name='"
                          + data.allPlaylists[i] +"' title='Play'><img src='images/play_gray.png'></div><div class='editImage' name='"
                          + data.allPlaylists[i] +"' title='Edit'><img src='images/edit_gray.png'></div><div class='uploadImage' name='"
                          + data.allPlaylists[i] +"' title='Upload'><img src='images/upload_gray.png'></div><div class='deleteImage' name='"
                          + data.allPlaylists[i] +"' title='Delete'><img src='images/delete_gray.png'></div></div></div>";
          
          x.innerHTML += "<li><a href='#!' class='dropEachList' name='"+ data.allPlaylists[i] +"'>"+
                         data.allPlaylists[i].substring(0, 12) +"</a></li>";
        }
    
        var sel = document.getElementsByClassName('playImage');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            loadPlaylist(this.getAttribute('name'));
          }
        }

        var sel = document.getElementsByClassName('editImage');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            populateSongs(this.getAttribute('name'));
          }
        }

        var sel = document.getElementsByClassName('uploadImage');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            uploadPlaylist(this.getAttribute('name'));
          }
        }

        var sel = document.getElementsByClassName('deleteImage');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            deletePlaylist(this.getAttribute('name'));
          }
        }

        var sel = document.getElementsByClassName('dropEachList');
        for(var i = 0; i < sel.length; i++) {
          var se = sel[i];
          se.onclick = function() {
            addVideoToPlaylist(this.name);
          }
        }
        
        // $(".optionsEachPlaylist").css("height","0px");
        $(".optionsEachPlaylist").hide();

        $(".loadEachTile").click(function(){
            showElementByName( $(".optionsEachPlaylist"), this.getAttribute("name") );
            $(".loadEachList", this).toggleClass('bggray');
        });
        $(".loadEachTile").mouseleave(
          function(){
            hideElementByName( $(".optionsEachPlaylist"), this.getAttribute("name") );
            $(".loadEachList", this).removeClass('bggray');
          }
        );

      }
    }
  });
}

function showElementByName(elements, name)
{
  for(var i = 0; i < elements.length; i++) {
    if(elements[i].getAttribute('name') == name)
    {
      if($(elements[i]).is(":hidden")) 
      { 
        $(elements[i]).show();
        $(elements[i]).animate({height: "50px"});
      }
      else
        hideElementByName(elements, name);
      break;
    }

  } 
}

function hideElementByName(elements, name)
{

  for(var i = 0; i < elements.length; i++) {
    if(elements[i].getAttribute('name') == name)
    {
      $(elements[i]).animate({height: "0px"});
      $(elements[i]).hide();

      break;
    }  
  } 
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
              document.getElementById("addPlaylistName").value = "";
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
                document.getElementById("addPlaylistName").value = ""; 
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

function uploadPlaylist(name){
  if(name.length == 0)
  {
    notif("Corrupt playlist.");
  }
  else
  {
    notif("Uploading....");
    chrome.storage.sync.get(name, function(data){
      var sgs = data[name];
      for (var i = 0; i < sgs.length; i++) {
        for (var k in sgs[i]){
            if (sgs[i].hasOwnProperty(k) && k!="url") {
                 sgs[i][k] = sgs[i][k].replace(/[`~!@#$%^&*|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '');
            }
        }
      }
      sgs = JSON.stringify(sgs);
      console.log(sgs);
      var http = new XMLHttpRequest();
      var url = "https://multicultural-drake-14693.herokuapp.com/upload/playlist/";
      var params = "name="+name+"&videos="+sgs;
      http.open("POST", url, true);

      //Send the proper header information along with the request
      http.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

      http.onreadystatechange = function() {//Call a function when the state changes.
          if(http.readyState == 4 && http.status == 200) {
              notif(http.responseText);
          }
      }
      http.send(params);

    });
  }
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

function loadStorePlaylist(videos, name)
{
  if(videos.length > 0)
  {
    chrome.runtime.sendMessage({greeting: "loadState", list : videos}, function(response){
      refresh();
      notif("Playlist loaded.");
    });
  }
  else
  {
    notif("Playlist empty.");
  }
}

function savePlaylist(videos, name){

    name = name.replace( /'/g, "" );
    if(name.length <=0){
      notif("Not a valid name.");
    }
    else{
      chrome.storage.sync.get('allPlaylists', function(data){
        if(data.allPlaylists === undefined)
        {
          var pls = [];
          var mobj = {};
          mobj[name] = videos;
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
            mobj[name] = videos;
            chrome.storage.sync.set(mobj, function() {
              pls.push(name);
              chrome.storage.sync.set({'allPlaylists': pls}, function(){
                fillLoadlist();
                notif("Playlist created");
              });
            });
          }
          else{
            notif("Conflicting name with some local playlist.");
          }
        }
      });
    }
}

function loadDataInStore(name)
{
  var store = document.getElementById("loadStore");
  store.innerHTML = "<span class='playlistEmpty'>Loading...</span>";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200)
    {
      document.getElementById("searchStoreName").value = "";
      store.innerHTML = "";
      var data = xhttp.responseText;
      data = JSON.parse(data);
      
      if(data.length == 0)
        store.innerHTML = "<span class='playlistEmpty'>No results</span>";
      for(var i=0; i< data.length; i++)
      {
        store.innerHTML += "<div class='storeEachTile' name ='"+data[i].name+"'><div class='storeEachList' title='"+data[i].name+"'>"+ data[i].name.substring(0,30)+
                            "</div><div class='optionsEachStore' name ='"+data[i].name+"'><div class='playStoreImage' name='" +data[i].name +
                            "' title='Play'><img src='images/play_gray.png'></div><div class='showImage' name='" +data[i].name+
                            "' title='Show'><img src='images/folder_empty_gray.png'></div><div class='downloadImage' name='"+ 
                             data[i].name +"' title='Download'><img src='images/download_gray.png'></div></div></div>";
      } 

      var sel = document.getElementsByClassName('downloadImage');
      for(var i = 0; i < sel.length; i++) {
        var se = sel[i];
        se.onclick = function() {
          // deletePlaylist(this.getAttribute('name'));
          let pl_name = this.getAttribute('name');
          savePlaylist( data[data.findIndex(function(each){return each.name == pl_name;})].videos , pl_name);
        }
      }

      var sel = document.getElementsByClassName('showImage');
      for(var i = 0; i < sel.length; i++) {
        var se = sel[i];
        se.onclick = function() {
          let pl_name = this.getAttribute('name');
          // showStorePlaylist(data[this.getAttribute('name')], this.getAttribute('name'));
          showStorePlaylist( data[data.findIndex(function(each){return each.name == pl_name;})].videos , pl_name);
        }
      }

      var sel = document.getElementsByClassName('playStoreImage');
      for(var i = 0; i < sel.length; i++) {
        var se = sel[i];
        se.onclick = function() {
          let pl_name = this.getAttribute('name');
          loadStorePlaylist( data[data.findIndex(function(each){return each.name == pl_name;})].videos , pl_name);
        }
      }

      $(".optionsEachStore").css("height","0px");
      $(".optionsEachStore").hide();
      $(".storeEachTile").click(
        function(){
          showElementByName( $(".optionsEachStore"), this.getAttribute("name") );
          $(".storeEachList", this).toggleClass('bggray');
        }
      );
      $(".storeEachTile").mouseleave(
        function(){
          hideElementByName( $(".optionsEachStore"), this.getAttribute("name") );
          $(".storeEachList", this).removeClass('bggray');
        }
      );
      
    }
  };
  xhttp.open("GET", "https://multicultural-drake-14693.herokuapp.com/search/"+name+"?_=" + new Date().getTime(), true);
  xhttp.send();
}

function githubfunc(){
  chrome.tabs.create({'url': 'https://github.com/adeora7/youtube_queue_extension'}, function(tab) {
    tabId = tab.id;
  });
}

function getFeaturedPlaylists()
{
  var store = document.getElementById("loadStore");
  store.innerHTML = "<span class='playlistEmpty'>Loading...</span>";
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (xhttp.readyState == 4 && xhttp.status == 200)
    {
      document.getElementById("searchStoreName").value = "";
      store.innerHTML = "";
      var data = xhttp.responseText;
      data = JSON.parse(data);
      for (var i = 0; i < data.count; i++) {
        var eachPlaylist = '<div class="featuredEach" url="'+data.videos[i].url+'">'+
                            '<div class="featuredEachImage">'+
                                '<img src="'+data.videos[i].img+'">'+
                            '</div>'+
                            '<div class="featuredEachDetails">'+
                                '<span class="featuredName">'+data.videos[i].name+'</span>'+
                                '<span class="featuredViews">'+data.videos[i].views+' views</span>'+
                                '<span class="featuredDuration">'+data.videos[i].duration+'</span>'+
                            '</div>'+
                          '</div>';
        store.innerHTML += eachPlaylist;
      }
      store.innerHTML += "<div>Email to deoraabhishek1995@gmail.com to display your video here.</div>";
      var allFeatured = $(".featuredEach");
      for (var i = 0; i < allFeatured.length; i++) {
        allFeatured[i].onclick = function() {
          chrome.runtime.sendMessage({greeting: "playFeatured", url: this.getAttribute('url')}, function(response) {
            // alert(response.res);
            refresh();
            setTimeout(function(){ refresh(); }, 500);
          });
        };
      }
      
    }
  };
  xhttp.open("GET", "https://multicultural-drake-14693.herokuapp.com/featured?_=" + new Date().getTime(), true);
  xhttp.send();
}

function displayMessageStoreEmpty(){
  var store = document.getElementById("loadStore");
  store.innerHTML = "<span class='playlistEmpty'>Search Something</span>";
}
// //Queue saving functions start

// function saveQueue(currentQueue){
//   chrome.storage.sync.set({"youtube_queue_extension_queue": currentQueue}, function(){
//   });
// }

// //Queue saving functions end



var apb = document.getElementById("addPlaylistButton");
var ssb = document.getElementById("searchStoreButton");

apb.addEventListener('click', function(){
  var nn = document.getElementById("addPlaylistName").value;
  createNewplaylist(nn);
}, false);

ssb.addEventListener('click', function(){
  var nn = document.getElementById("searchStoreName").value;
  if(nn.length > 0)
    loadDataInStore(nn);
  else
    notif("Please enter something to search");
}, false);

$("#addPlaylistName").keypress(function(e) {
    if(e.which == 13) {
        apb.click();
    }
});

$("#searchStoreName").keypress(function(e) {
    if(e.which == 13) {
        ssb.click();
    }
});

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
  refresh();
  fillLoadlist();
  $("#layer").hide();
  $("#editWindow").hide();
  $("#info").hide();
  // getFeaturedPlaylists();
  displayMessageStoreEmpty();
});
