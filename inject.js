var thumbsDone = [];
var mutationTrigger = 1;

function removeDone(value, index, self){
  return thumbsDone.indexOf(value) == -1;
}

function addIcon(){
  var nl = document.getElementsByTagName("ytd-thumbnail");
  var thumbs = [];
  for(var i = nl.length; i--; thumbs.unshift(nl[i]));
  thumbs = thumbs.filter( removeDone );
  var url = "https://www.youtube.com";
  for (let i = 0; i < thumbs.length; i++) {
    var node = document.createElement("yt-icon");
    var textnode = document.createTextNode("Q");
    node.appendChild(textnode);
    var cssT = `font-weight: 800;
      font-size: 19px;
      background-color: red;
      color: white;
      z-index: 2000;
      opacity: 0.7;
      width: 30px;
      height: 30px;
      cursor: pointer;`
    node.setAttribute("style", cssT);
    node.setAttribute("title", "Add to Queue");
    node.setAttribute("href", url + thumbs[i].children[0].getAttribute("href"));
    node.onmouseover = function(){
      this.style.opacity = "1";
    };
    node.onmouseleave = function(){
      this.style.opacity = "0.7";
      this.style.backgroundColor = "red";
    };
    node.onmousedown = function(){
      this.style.backgroundColor = "#96281B";
    }
    node.onmouseup = function(){
      this.style.backgroundColor = "red";
    }
    node.onclick = function(){
      var link = this.getAttribute("href");
      chrome.runtime.sendMessage({greeting: "addIconClicked", link : link}, function(res) {
        //Request sent to add video to queue
      });
    }
    thumbs[i].appendChild(node);
  }
  thumbsDone = thumbsDone.concat(thumbs);
}

MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
var observer = new MutationObserver(function(mutations, observer) {
    if(mutationTrigger == 1)
    {
      mutationTrigger = 0;
      setTimeout(function(){
        addIcon();
        mutationTrigger = 1;
      }, 2000)
      addIcon();
    }
});
observer.observe(document, {
  subtree: true,
  attributes: false,
  childList: true
});


// Add player to youtube
var player = document.createElement("DIV");
player.innerHTML = `<div id="ytbPlayerWrapper"><div class="row" id="youtubeQueuePlayer">
      <div id="ytbName">
          <span style="font-size:15px;"><br><br><br><br>Y<br>O<br>U<br>T<br>U<br>B<br>E<br><br>Q<br>U<br>E<br>U<br>E</span>
        </div>
            <div>
            <div id="controls">
              <div class="control-icon tooltipped" data-position="bottom" data-delay="50" data-tooltip="Previous" id="play_previous">
                <img src="chrome-extension://nfohabbemfafpmoahcoipdclfepcgped/images/wprevious.png">
              </div>
              <div class="control-icon tooltipped" data-position="bottom" data-delay="50" data-tooltip="Play/Pause" id="pause_play">
                <img src="chrome-extension://nfohabbemfafpmoahcoipdclfepcgped/images/wplay_pause.png">
              </div>
              <div class="control-icon tooltipped" data-position="bottom"  data-delay="50" data-tooltip="Next" id="play_next">
                <img src="chrome-extension://nfohabbemfafpmoahcoipdclfepcgped/images/wnext.png">
              </div>
                    <div class="control-icon tooltipped" data-position="bottom"  data-delay="50" data-tooltip="Loop" id="loop_all">
                        <img src="chrome-extension://nfohabbemfafpmoahcoipdclfepcgped/images/loop-all.png">
                    </div>
                    <div class="control-icon tooltipped" data-position="bottom" data-delay="50" data-tooltip="Empty Queue" id="empty">
                        <img src="chrome-extension://nfohabbemfafpmoahcoipdclfepcgped/images/empty.png">
                    </div>
            </div>
            <div>
                    <div class="col s12">
                    <ul class="tabs">
                            <li class="tab col s4"><a href="#test3">Store</a></li>
                      <li class="tab col s4"><a href="#test1">Playlists</a></li>
                      <li class="tab col s4"><a class="active" href="#test2">Queue(<span id="number">0</span>)</a></li>
                    </ul>
                        <div id="howToUse" class="tooltipped" data-position="bottom" data-delay="50" data-tooltip="How to use ?">
                            <img src="chrome-extension://nfohabbemfafpmoahcoipdclfepcgped/images/winfo1.png">
                        </div>
                </div>
                    <div id="test3" class="col s12">
                        <div id="searchStore">
                            <input type="text" id="searchStoreName" placeholder="Search Playlists">
                            <input type="submit" value="Seach" id="searchStoreButton">
                        </div>
                        <div id="loadStore">

                        </div>
                    </div>
                <div id="test1" class="col s12">
                        <div id="addPlaylist">
                            <input type="text" id="addPlaylistName">
                            <input type="submit" value="Add Playlist" id="addPlaylistButton">
                        </div>
                  <div id="loadBody">

                        </div>
                </div>
                <div id="test2" class="col s12">
                  <div id="yo">
                        </div>
                  <div id="a">
                        </div>
                </div>
                </div>
            </div>
            <div id="layer">
                a
            </div>
      </div>
        <div id="notifPopup">
            hello world
        </div>

        <div id="editWindow">
            <div id="editWindowHead">
                PLAYLIST NAME
            </div>
            <div id="editWindowBody">
                
            </div>
            <div id="editWindowDone">
                DONE
            </div>
        </div>

        <div id="yteinfo">
            <ul>
                <li>
                    <span class="number"></span>
                    <span>
                        <b>Please install 
                        <a href="https://chrome.google.com/webstore/detail/adblock-plus/cfhdojbkjhnklbpkdaibdccddilifddb" target="_blank">AdblockPlus</a>
                         for this extension to work properly.</b>
                    </span>
                </li>
                <li>
                    <span class="number">1.</span>
                    <span>Show your support by staring on Github.
                    <a href="https://github.com/adeora7/youtube_queue_extension" target="_blank">
                        <img id="starGithub" src="chrome-extension://nfohabbemfafpmoahcoipdclfepcgped/images/star_github.png">
                    </a>
                    </span>
                </li>
                <li>
                    <span class="number">2.</span>
                    <span>Click on the icon in left-top corner of a thumbnail to add it to the queue. If the video is currently playing <b>Double right click</b> on it to add video to the queue.
                    </span>.
                </li>
                <li>
                    <span class="number">3.</span>
                    <span>
                    Store is where playlists of all the users are saved. You can upload yours too.
                    </span>
                </li>
                <li>
                    <span class="number">4.</span>
                    <span>
                    Click on any video in Queue to play it. Queue is automatically saved when the browser closes and will resume playing the videos when you open your browser the next time.
                    </span>
                </li>
                <li>
                    <span class="number">5.</span>
                    <span>
                    Click on <b>'+'</b> icon of any video in queue and select the playlist you want the video to be added to.
                    </span>
                </li>
                <li>
                    <span class="number">6.</span>
                    <span>
                    Click on <b>"add playlist"</b> to add an empty playlist.
                    </span>
                </li>
                <li>
                    <span class="number">7.</span>
                    <span>
                    Click on a Playlist to show all the available options.
                    </span>
                </li>

                <li>
                    <span class="number">8.</span>
                    <span>
                    Click on Loop icon to toggle it. If turned on, it repeats all the songs in the queue.
                    </span>
                </li>

                <li>
                    <span class="number">9.</span>
                    <span>
                    Click on Empty icon to clear the queue.
                    </span>
                </li>
            </ul>
            <div id="yteinfoClose">
                Close
            </div>
        </div></div>`;
player = player.firstChild;
document.body.appendChild(player);
player.onmouseover = function(){
  player.style.right = "0px";
}
player.onmouseout = function(){
  player.style.right = "-329px";
}
console.log("hello world !!");