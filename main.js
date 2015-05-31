(function() {
    function inject(jsName) {
        var s = document.createElement('script');
        s.src = chrome.extension.getURL(jsName);
        (document.head || document.documentElement).appendChild(s);
    }
    var scripts = chrome.runtime.getManifest()["web_accessible_resources"];

    scripts.forEach(inject);

    console.info(scripts.length + " script(s) injected");
})();
