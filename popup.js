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
                showList();
                loadSiteNames();
                updateDialog();
                chrome.storage.sync.get("force", function (force) {
                    switch (force.force) {
                        case "enable":
                            openAco(document.getElementById("force-header"));
                            document.getElementById("allSelect").checked = true;
                            break;
                        case "disable":
                            openAco(document.getElementById("force-header"));
                            document.getElementById("allRemove").checked = true;
                            break;
                        case "none":
                            closeAco(document.getElementById("force-header"));
                            openAco(document.getElementById("host-header"));
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
                chrome.storage.sync.set({
                    "hostList": []
                });
                updateDialog();
                showList();
                resetList();
                loadSiteNames()
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
    chrome.runtime.sendMessage({
        message: 'defaultSiteName'
    }, function (response) {
        let defaultSiteNameList = response.list;
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
                        chrome.runtime.sendMessage({
                            message: 'ajax',
                            id: element.id
                        });
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

                    if (!host) return; // ドメインが空白ならスキップ

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
                        let newLabel = document.createElement("label");
                        chrome.tabs.query({
                            'active': true,
                            'lastFocusedWindow': true
                        }, activeTabs => {
                            let targetNum = document.getElementById(host).getAttribute("target").split(",").length;
                            let activveTabUrl = new URL(activeTabs[0].url).host;
                            newLabel.textContent = host + (host === activveTabUrl ? " (現在のタブ" + (targetNum > 1 ? "と他" + (targetNum - 1) + "個" : "") + ")" : "");
                            newLabel.setAttribute("for", host);
                            newLabel.classList = "label-inline";
                        });
                        newDiv.appendChild(newElement);
                        newDiv.appendChild(newLabel);
                        hostList.push(host);
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
                                chrome.runtime.sendMessage({
                                    message: 'ajax',
                                    id: tabIds[i]
                                });
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
                chrome.runtime.sendMessage({
                    message: 'ajax',
                    id: element.id
                });
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
                chrome.runtime.sendMessage({
                    message: 'ajax',
                    id: element.id
                });
            }
        });

    });

});
const acoHeader = document.getElementsByClassName("aco-header");
for (let i = 0; i < acoHeader.length; i++) {
    const element = acoHeader[i];
    element.addEventListener("click", () => {

        if (element.classList.contains("open")) {
            closeAco(element);
        } else {
            openAco(element);
        }
    });
}

function loadSiteNames() {
    chrome.runtime.sendMessage({
        message: 'defaultSiteName'
    }, function (response) {
        chrome.storage.sync.get("siteNameList", function (result3) {
            let siteNameList = result3.siteNameList ? result3.siteNameList : response.list;
            let listContents = "";
            for (let i = 0; i < siteNameList.length; i++) {
                const value = siteNameList[i];
                listContents += (i !== siteNameList.length - 1 ? value + "\n" : value);

            }
            document.getElementById("siteNames").value = listContents;
        });
    });
}

function updateDialog() {
    chrome.storage.local.get("update12", function (result) {
        console.log(result.update12)
        if (!result.update12) {
            document.getElementById("update").style.display = "block";
            chrome.storage.local.set({
                "update12": true
            });
        } else {
            document.getElementById("update").remove();
        }
    });
}

function openAco(elem) {
    if (elem.getAttribute("name")) {
        const bothMenu = document.getElementsByName(elem.getAttribute("name"));

        for (let i = 0; i < bothMenu.length; i++) {
            closeAco(bothMenu[i]);
        }
    }
    elem.nextElementSibling.style.display = "block";
    elem.classList.add("open");
}

function closeAco(elem) {
    elem.classList.remove("open");
    elem.nextElementSibling.addEventListener("transitionend", handleTransitionEnd);
}

function handleTransitionEnd(e) {
    const element = e.target;
    if (element.className !== "aco-body") return;
    console.dir(element)
    element.style.display = "none";
    element.removeEventListener("transitionend", handleTransitionEnd);
}
 