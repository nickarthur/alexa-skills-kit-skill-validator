let loaded = false;
chrome.tabs.onUpdated.addListener(function(tabId, info) {
    if (info.status == "complete") {
        chrome.tabs.executeScript(tabId, { file: "plugin_inject.js" });
        loaded = true;
        
    }
});