let siteName;
chrome.runtime.sendMessage({
    message: 'defaultSiteName'
}, function(response) {
    chrome.storage.sync.get("siteNameList", function(result3) {
        siteName = result3.siteNameList ? result3.siteNameList : response.list;
    });



    let title;
    chrome.storage.sync.get("accept", function(result) {

        if (result.accept) {
            chrome.storage.sync.get("enable", function(enable) {
                if (enable) {
                    chrome.storage.sync.remove("enable");
                }
            });
            chrome.storage.sync.get("hostList", function(host) {
                chrome.storage.sync.get("force", function(force) {
                    if (force.force === "enable" || (host.hostList && host.hostList.indexOf(location.host) !== -1 && force.force !== "disable")) {
                        title = siteName[getRandomInt()];
                        document.title = title;
                        deleteIcon();
                        setNewIcon();
                        const target = document.querySelector("head");
                        const config = {
                            subtree: true,
                            characterData: true,
                            childList: true,
                            attributes: true,
                        };
                        const observer = new MutationObserver(function() {
                            observer.disconnect();
                            document.title = title;
                            deleteIcon();
                            setNewIcon();
                            observer.observe(target, config);
                        });

                        observer.observe(target, config);
                    }
                });
            });
        }

    });
});

function getRandomInt() {
    return Math.floor(Math.random() * siteName.length);
}

function setNewIcon() {
    let newIcon = document.createElement("link");
    newIcon.setAttribute("rel", "icon");
    newIcon.setAttribute("type", "image/png");
    newIcon.setAttribute("sizes", "32x32");
    let image = chrome.runtime.getURL("/favicon.png");
    newIcon.setAttribute("href", image);
    newIcon.classList = "newIcon";
    let parent = document.head;
    parent.appendChild(newIcon);
}

function deleteIcon() {
    let metaDiscre = document.head.children;
    let metaLength = metaDiscre.length;
    for (let i = 0; i < metaLength; i++) {
        if (metaDiscre[i]) {
            let proper = metaDiscre[i].getAttribute('rel');
            if (proper && proper.indexOf("icon") !== -1) {
                metaDiscre[i].setAttribute("href", chrome.runtime.getURL("/favicon.png"));
            }
        }
    }
}
chrome.runtime.onMessage.addListener(function(mes) {
    let myMessage = mes.message;
    switch (myMessage) {
        case "changeStorage":
            loadStorage();
            break;
        case "alerta":
            alerta();
            break;
    }
});

function loadStorage() {
    chrome.storage.sync.get("siteNameList", function(result3) {
        if (result3.siteNameList) {
            siteName = result3.siteNameList;
        }
    });
}




function alerta() {
    alert("a");
}
