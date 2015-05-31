(function() {
    console.info("Waiting for modal...");
    var tries = 0;

    var modalWatcher = setInterval(function() {
        tries++;

        var close = $("#modal-close");

        if ($(close).length > 0) {
            $(close).trigger('click');
            
            clearInterval(modalWatcher);
            console.info("Modal closed!");

        } else if (tries === 100) {
            console.info("Modal watcher giving up...");
            clearInterval(modalWatcher);
        }
        
    }, 500);
})();
