'use strict';
let content;
let edit = true;
document.addEventListener("DOMContentLoaded", () => {
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    chrome.storage.sync.get("hostName", function (result0) {
      if (/http/.test(tabs[0].url) && tabs[0].url.indexOf("chrome.google.com/webstore/") === -1) {



        chrome.storage.sync.get("accept", function (result) {

          if (result.accept !== true) {
            document.body.classList.add("noaccept");
          } else if (result.accept === true) {
            chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
              let activeId = tabs[0].id;
              chrome.tabs.sendMessage(activeId, { message: 'siteNameList' });
            });
            addMessageReceive();
          }

        });
        chrome.storage.sync.get("enable", function (result) {
          let checkbox = document.getElementById("enableCheck");
          if (result.enable === true) {
            checkbox.checked = true;
          } else {
            checkbox.checked = false;
          }

        });
        document.getElementById("agreeBtn").addEventListener("click", () => {
          chrome.storage.sync.set({ "accept": true }, function () {
            addMessageReceive();
            resetList();
            document.body.classList.remove("noaccept");
          });
        }, false);
        document.getElementById("disagreeBtn").addEventListener("click", () => {
          window.close();
        })

        document.getElementById("enableCheck").addEventListener("click", () => {
          let element = document.getElementById("enableCheck");
          if (element.checked) {
            chrome.storage.sync.set({ "enable": true }, function () { });
          } else {
            chrome.storage.sync.set({ "enable": false }, function () { });
          }
        }, false)
        document.getElementById("reload").addEventListener("click", () => {
          chrome.tabs.query({}, (tabs) => {
            tabs.forEach(element => {
              chrome.tabs.reload(element.id, false);
            });
          });
        }, false);
        document.getElementById("resetBtn").addEventListener("click", resetList, false);
        let nameContent;
        document.getElementById("siteNames").addEventListener("input", () => {
          nameContent = document.getElementById("siteNames").value;
          if (nameContent) {
            nameContent = nameContent.trim();
            nameContent = nameContent.replace(/^\s*$(?:\r\n?|\n)/gm,"");
            let siteNameList = nameContent.split("\n");
            chrome.storage.sync.set({ "siteNameList": siteNameList });
            chrome.tabs.query({}, (tabs) => {
              tabs.forEach(element => {
                chrome.tabs.sendMessage(element.id, { message: 'changeStorage' });
              });
            });
          } else {
            edit = false;
            resetList();

          }
        });
        document.getElementById("siteNames").addEventListener("change", () => {
          if (nameContent) {
            document.getElementById("siteNames").value = nameContent;
          } else {
            edit = true;
            resetList();
          }
        }, false);

      } else {
        let body = document.body;
        body.style.width = "400px";
        body.textContent = "";
        let sorry = document.createElement("p");
        sorry.style.textAlign = "center";
        sorry.textContent = "このページはブラウザによって保護されているため、拡張機能は無効になっています。";
        let tryOther = document.createElement("p");
        tryOther.style.textAlign = "center";
        tryOther.textContent = "他のページで再度お試しください。";
        body.appendChild(sorry);
        body.appendChild(tryOther);
      }
    });
  });

  function resetList() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      let activeId = tabs[0].id;
      chrome.tabs.sendMessage(activeId, { message: 'defaultNames' });
    });
  }
}, false);

function addMessageReceive() {
  chrome.runtime.onMessage.addListener(function (mess) {
    let myMessage = mess.message;
    switch (myMessage) {
      case "ThisisSiteName":
        let siteNameList = mess.list;
        let listContents = "";
        for (let i = 0; i < siteNameList.length; i++) {
          const value = siteNameList[i];
          listContents += (i !== siteNameList.length - 1 ? value + "\n" : value);

        }
        document.getElementById("siteNames").value = listContents;
        break;

      case "ThisisDefaultName":
        let defaultSiteNameList = mess.list;
        let defaultListContents = "";
        for (let i = 0; i < defaultSiteNameList.length; i++) {
          const value = defaultSiteNameList[i];
          defaultListContents += (i !== defaultSiteNameList.length - 1 ? value + "\n" : value);

        }
        if (edit) {
          document.getElementById("siteNames").value = defaultListContents;
        }
        chrome.storage.sync.set({ "siteNameList": defaultSiteNameList });
        chrome.tabs.query({}, (tab) => {
          tab.forEach(element => {
            chrome.tabs.sendMessage(element.id, { message: 'changeStorage' });
          });
        });
        edit = true;
        
        break;
    }
  });
}
