(function () {
    let inject = document.createElement('script');
    inject.src = chrome.extension.getURL('plugin_shiv.js');
    (document.head || document.documentElement).appendChild(inject);
    
    let validation = document.createElement('script');
    validation.src = chrome.extension.getURL('library/validation.js');
    (document.head || document.documentElement).appendChild(validation);

    let style = document.createElement('link');
    style.rel = "stylesheet";
    style.type = "text/css";
    style.href = chrome.extension.getURL('plugin_shiv.css');
    (document.head || document.documentElement).appendChild(style);

})();