'use strict';
let content;
let enableHostList = [];
let edit = true;

chrome.tabs.query({
    active: true,
    lastFocusedWindow: true
}, (tabs) => {

    if (!/^(?=.*https:\/\/chrome\.google\.com)(?=.*\/webstore\/).*$/.test(tabs[0].url) && /http\:\/\/|https\:\/\/|file\:\/\//.test(tabs[0].url)) {


        chrome.storage.sync.get("accept", function (result) {

            if (result.accept !== true) {
                document.body.classList.add("noaccept");
            } else if (result.accept === true) {
                chrome.tabs.query({
                    active: true,
                    lastFocusedWindow: true
                }, (tabs) => {
                    let activeId = tabs[0].id;
                    chrome.tabs.sendMessage(activeId, {
                        message: 'siteNameList'
                    });
                    chrome.runtime.sendMessage({
                        message: 'turnon',
                        id: activeId
                    });
                });
                addMessageReceive();
                showList();
                chrome.storage.sync.get("force", function (force) {
                    switch (force.force) {
                        case "enable":
                            document.getElementById("force-header").classList.add("open");
                            document.getElementById("allSelect").checked = true;
                            break;
                        case "disable":
                            document.getElementById("force-header").classList.add("open");
                            document.getElementById("allRemove").checked = true;
                            break;
                        case "none":
                            document.getElementById("force-header").classList.remove("open");
                            document.getElementById("host-header").classList.add("open");
                            break;
                    }
                });
            }

        });
        chrome.storage.sync.get("hostList", function (result) {
            if (result.hostList) {
                enableHostList = result.hostList;
            }

        });
        document.getElementById("disagreeBtn").addEventListener("click", () => {
            window.close();
        });
        document.getElementById("agreeBtn").addEventListener("click", () => {
            chrome.storage.sync.set({
                "accept": true
            }, function () {
                addMessageReceive();
                chrome.storage.sync.set({
                    "hostList": []
                });
                showList();
                resetList();
                document.body.classList.remove("noaccept");
            });
        }, false);


        document.getElementById("resetBtn").addEventListener("click", resetList, false);
        let nameContent;
        document.getElementById("siteNames").addEventListener("input", () => {
            nameContent = document.getElementById("siteNames").value;
            nameContent = nameContent.trim();
            nameContent = nameContent.replace(/^\s*$(?:\r\n?|\n)/gm, "");
            if (nameContent) {
                let siteNameList = nameContent.split("\n");
                chrome.storage.sync.set({
                    "siteNameList": siteNameList
                });
                chrome.tabs.query({}, (tabs) => {
                    tabs.forEach(element => {
                        chrome.tabs.sendMessage(element.id, {
                            message: 'changeStorage'
                        });
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
        chrome.storage.sync.get("accept", function (result) {

            if (result.accept !== true) {
                document.body.classList.add("noaccept");
            } else if (result.accept === true) {
                document.getElementById("siteNames").textContent = "このページはブラウザによって保護されているため、拡張機能が無効になっています。\n他のページにて再度お試しください。";
            }
        });
        document.getElementById("dark").style.display = "flex";
        document.body.style.pointerEvents = "none";
        document.body.style.userSelect = "none";
    }

});

function resetList() {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, (tabs) => {
        let activeId = tabs[0].id;
        chrome.tabs.sendMessage(activeId, {
            message: 'defaultNames'
        });
    });
}

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
                chrome.storage.sync.set({
                    "siteNameList": defaultSiteNameList
                });
                chrome.tabs.query({}, (tab) => {
                    tab.forEach(element => {
                        chrome.tabs.sendMessage(element.id, {
                            message: 'changeStorage'
                        });
                    });
                });
                edit = true;

                break;
        }
    });
}

document.getElementById("host-header").addEventListener("click", () => {
    chrome.storage.sync.get("force", function (force) {

        if (force.force === "enable" || force.force === "disable") {
            chrome.tabs.query({}, (tabs) => {
                chrome.storage.sync.set({
                    "force": "none"
                });
                tabs.forEach(element => {
                    if (!/^(?=.*https:\/\/chrome\.google\.com)(?=.*\/webstore\/).*$/.test(element.url) && /http\:\/\/|https\:\/\/|file\:\/\//.test(element.url)) {
                        chrome.tabs.reload(element.id, false);
                    }
                });


            });
            document.getElementById("allSelect").checked = false;
            document.getElementById("allRemove").checked = false;
        }
    });
});

function showList() {
    let hostList = [];
    chrome.tabs.query({}, tabs => {
        tabs.forEach(element => {
            if (!/^(?=.*https:\/\/chrome\.google\.com)(?=.*\/webstore\/).*$/.test(element.url) && /http\:\/\/|https\:\/\/|file\:\/\//.test(element.url)) {
                chrome.storage.sync.get("hostList", function (result) {


                    const host = new URL(element.url).host;
                    if (hostList.indexOf(host) === -1) {

                        let newDiv = document.createElement("div");
                        document.getElementById("tabsArea").appendChild(newDiv);
                        let newElement = document.createElement("input");
                        newElement.setAttribute("type", "checkbox");
                        newElement.setAttribute("id", host);

                        newElement.classList = "enableCheck";
                        newElement.setAttribute("target", element.id);
                        if (result.hostList && result.hostList.indexOf(host) !== -1) {
                            newElement.setAttribute("checked", true);
                        }
                        chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, activeTabs => {
                            let activveTabUrl = new URL(activeTabs[0].url).host;
                            let newLabel = document.createElement("label");
                            newLabel.textContent = host + (host === activveTabUrl ? " (現在のタブ)" : "");
                            newLabel.setAttribute("for", host);
                            newLabel.classList = "label-inline";
                            newDiv.appendChild(newElement);
                            newDiv.appendChild(newLabel);
                            hostList.push(host);
                        });
                        newElement.addEventListener("click", () => {

                            document.getElementById("allSelect").checked = false;
                            document.getElementById("allRemove").checked = false;

                            if (newElement.checked) {

                                enableHostList.push(newElement.getAttribute("id"));

                            } else {

                                enableHostList.splice(enableHostList.indexOf(newElement.getAttribute("id")), 1);
                            }
                            chrome.storage.sync.set({
                                "hostList": enableHostList
                            });


                            const tabIds = document.getElementById(host).getAttribute("target").split(",");
                            for (let i = 0; i < tabIds.length; i++) {
                                chrome.tabs.reload(Number(tabIds[i]), false);
                            }


                            chrome.storage.sync.set({
                                "force": "none"
                            });




                        });
                    } else {
                        let target = document.getElementById(host).getAttribute("target");

                        document.getElementById(host).setAttribute("target", target + "," + element.id);
                    }


                });
            }

        });
    });


}

document.getElementById("allSelect").addEventListener("click", () => {
    chrome.storage.sync.set({
        "force": "enable"
    });
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(element => {
            if (!/^(?=.*https:\/\/chrome\.google\.com)(?=.*\/webstore\/).*$/.test(element.url) && /http\:\/\/|https\:\/\/|file\:\/\//.test(element.url)) {
                chrome.tabs.reload(element.id, false);
            }
        });

    });
});

document.getElementById("allRemove").addEventListener("click", () => {
    chrome.storage.sync.set({
        "force": "disable"
    });
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach(element => {
            if (!/^(?=.*https:\/\/chrome\.google\.com)(?=.*\/webstore\/).*$/.test(element.url) && /http\:\/\/|https\:\/\/|file\:\/\//.test(element.url)) {
                chrome.tabs.reload(element.id, false);
            }
        });

    });

});
const acoHeader = document.getElementsByClassName("aco-header");
for (let i = 0; i < acoHeader.length; i++) {
    const element = acoHeader[i];
    element.addEventListener("click", () => {

        if (element.classList.contains("open")) {
            element.classList.remove("open");
        } else {

            if (element.getAttribute("name")) {
                const bothMenu = document.getElementsByName(element.getAttribute("name"));

                for (let i = 0; i < bothMenu.length; i++) {
                    bothMenu[i].classList.remove("open");
                }
            }
            element.classList.add("open");
        }
    });
}

