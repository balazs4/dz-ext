(function() {
    console.info("Waiting for modal...");
    var tries = 0;

    var modalWatcher = setInterval(function() {
        tries++;

        if (modal.ready) {
            modal.close();
            clearInterval(modalWatcher);
            console.info("Modal closed!");

        } else if (tries === 50) {
            console.info("Modal watcher giving up...");
            clearInterval(modalWatcher);
        }
        
    }, 200);
})();
