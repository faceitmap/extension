chrome.runtime.onMessage.addListener(
    function (message, sender) {
        if (message == 'reload') {
            localStorage.tabToReload = sender.tab.id;
            chrome.runtime.reload();
        }
    });

