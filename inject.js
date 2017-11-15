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

function pp(){
	document.querySelector('.ytp-play-button').click();
}

window.addEventListener("pause_play", function(evt) {
    //document.querySelector('.ytp-play-button').click();
    // alert("hello");
    pp();
}, false);	