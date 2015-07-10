(function() {
    var dependencies = [
        "https://cdn.firebase.com/js/client/2.2.7/firebase.js"
    ];

    dependencies.forEach(function(item) {
        var s = window.document.createElement('script');
        s.src = item;
        window.document.head.appendChild(s);
    });
})();


(function() {
    var log = function(text) {
        console.info("[dz-dj] " + text);
    }

    log("Init...");

    var connect = function(onSuccess) {
        var secret = {
            dbname: "dz-dj",
            auth: "RfpZoSMvdEJmsl2g1olO58wrUPMCubGBm8lmqwoL"
        };

        var fb = new Firebase("http://" + secret.dbname + ".firebaseio.com/");

        fb.authWithCustomToken(secret.auth, function(error, authData) {
            if (error) {
                log("Login Failed!", error);
            } else {
                log("Login Succeeded!");
                onSuccess(fb);
            }
        });
    };

    var onNewSong = function(data) {
        var item = data.exportVal();
        log("New song:" + JSON.stringify(item));
    };

    var connection = {
      firebase : undefined
    };
    var dj = {
        getUser: function() {
            return $("#naboo_menu_collection_user_name").text() || "Unknown user";
        },
        on: function() {
            connect(function(fb) {
                fb.on("child_added", onNewSong);
                log("Subscribed");
                connection.firebase = fb;
            });
        },
        off: function() {
            connection.firebase.off("child_added", onNewSong);
            connection.firebase.unauth();
            delete(connection.firebase);
            log("Unsubscribed");
        },
        isOn: function() {
            return connection.firebase != undefined;
        }
    };

    setTimeout(function() {
        dj.on();
        window.dzdj = dj;
    }, 1000);

})();
