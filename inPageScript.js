console.log("Youtube Queue Extension is active on this tab.");

var ChromeRequest = (function(){
  var requestId = 0;

  function getData(data) {
    var id = requestId++;

    return new Promise(function(resolve, reject) {
      var listener = function(evt) {
        if( evt.detail.requestId == id) {
          // Deregister self
          window.removeEventListener("sendChromeData", listener);
          resolve(evt.detail.data);
        }
      }

      window.addEventListener("sendChromeData", listener);

      var payload = { data: data, id: id };

      window.dispatchEvent(new CustomEvent("getChromeData", {detail: payload}));
    });        
  }

  return { getData: getData };
})();

function pp(){

document.querySelector('.ytp-play-button').click();
}

var video = document.getElementsByTagName("video")[0];
if(video) {
  video.addEventListener("ended", function() {
    ChromeRequest.getData("whatever").then(function(data){});
  });
}
window.addEventListener("pause_play", function(evt) {
    //document.querySelector('.ytp-play-button').click();
    // alert("hello");
    pp();
}, false);

var side = document.getElementById("watch7-sidebar-contents");
side.innerHTML = "<div>Hello world</div>" + side.innerHTML;