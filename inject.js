console.log("Youtube Queue Extension is active on this tab.");

var video = document.getElementsByTagName("video")[0];
if(video) {
  video.addEventListener("ended", function() {
  	  chrome.storage.sync.get("youtube_queue_extension_toggle", function(data){
	    chrome.runtime.sendMessage({greeting: "next_video", toggle : data["youtube_queue_extension_toggle"]}, function(res) {
	      //need to refresh queue but can't call refresh here.
	    });
	  });
  });
}

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


// function pp(){
// 	document.querySelector('.ytp-play-button').click();
// }

// window.addEventListener("pause_play", function(evt) {
//     pp();
// }, false);	