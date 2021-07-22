'use strict';
  document.addEventListener("DOMContentLoaded",()=>{
    chrome.storage.sync.get("accept", function(result){

      if (result.accept !== true) {
        document.body.classList.add("noaccept");
      }
  
    });
    chrome.storage.sync.get("enable", function(result){
      let checkbox = document.getElementById("enableCheck");
      if (result.enable === true) {
        checkbox.checked = true;
      } else {
        checkbox.checked = false;
      }
  
    });
  }, false);
  document.getElementById("agreeBtn").addEventListener("click",()=>{
    chrome.storage.sync.set({"accept": true}, function(){ 
      document.body.classList.remove("noaccept");
    });
  }, false);
  document.getElementById("disagreeBtn").addEventListener("click", ()=>{
    window.close();
  })

  document.getElementById("enableCheck").addEventListener("click",()=>{
    let element = document.getElementById("enableCheck");
    if (element.checked) {
      chrome.storage.sync.set({"enable": true}, function(){});
    } else {
      chrome.storage.sync.set({"enable": false}, function(){});
    }
  }, false)
  document.getElementById("reload").addEventListener("click",()=>{
    console.log("clicked");
    chrome.tabs.query({}, (tabs)=>{
      tabs.forEach(element => {
        chrome.tabs.reload(element.id, false);
      });
    });
  }, false);