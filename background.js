chrome.runtime.onMessage.addListener(function (mes) {
	let myMessage = mes.message;
	switch (myMessage) {
        case "turnon":
            try {
                chrome.tabs.sendMessage(9999, {
                    message: 'alerta'
                });
            } catch (e) {
                 chrome.tabs.reload(mes.id, false);
            }
            break;
        case "turnoff":
            try {
                chrome.scripting.executeScript({
                    target: { tabId: mes.id },
                    function: alerta,
                  });
            } catch (e) {
                 chrome.tabs.reload(mes.id, false);
            }
            break;
    }
});