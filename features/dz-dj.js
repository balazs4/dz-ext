(function($, browser, dzPlayer) {
    var log = function(text) {
        console.info("[dzdj] " + text);
    }

    var dependencies = [
        "https://cdn.firebase.com/js/client/2.2.7/firebase.js"
    ];

    dependencies.forEach(function(item) {
        var s = browser.document.createElement('script');
        s.src = item;
        browser.document.head.appendChild(s);
        log("DI done");
    });

    log("Init...");

    var registerObserver = function(browser, on) {
        var observer = new browser.MutationObserver(on);
        $("#player .player-track").each(function() {
            observer.observe(this, {
                childList: true,
                attributes: true,
                characterData: true,
                subtree: true
            });
        });
        return observer;
    }

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

        var song = item.raw;

        var known = dzPlayer.getTrackList().some(function(s) {
            return s.SNG_ID == song.SNG_ID;
        });

        if (known) {
            //return;
        }

        dzPlayer.addNextTracks([song], dzPlayer.context);
    };

    var addShareButton = function() {

        if ($("a#dzdj-share").length) {
            $("a#dzdj-share").find("span.icon").removeClass("active");
            return;
        }

        var controls = $("div.player-actions")[0];

        $(controls)
            .append('<a id="dzdj-share" class="evt-over evt-out action" href="#" title="Deezer DJ"> <span class="icon-32 icon-stack icon-stack-hover icon-stack-circle"> <span class="icon icon-share"> </span> </span> </a>');
        $(controls)
            .removeAttr("data-action");

        $("a#dzdj-share").click(function(event) {
            event.preventDefault();
            dzdj.promote();
            $(this)
                .find("span.icon")
                .addClass("active");
        });
    }

    var removeShareButton = function() {
        $("a#dzdj-share").remove();
    }

    var refreshToggleButton = function(isOn) {

        if ($("a.nav-link[data-type='apps']").length > 0) {
            var button = $("a.nav-link[data-type='apps']")[0];
            $(button).removeAttr("data-type");
            $(button).find("span.icon").removeClass("icon-app");
            $(button).find("span.icon").addClass("icon-share");
            $(button).find("span").not("span.icon").attr("id", "message");
            $(button).attr("id", "dzdj-toggle");
            $(button).attr("onclick", "dzdj.toggle();")
        }

        $("#dzdj-toggle").find("#message").text(isOn ? "DEEZER DJ: ON" : "DEEZER DJ: OFF");
    }

    var config = {
        firebase: undefined,
        observer: undefined
    };

    var dj = {
        getUser: function() {
            return $("#naboo_menu_collection_user_name").text() || "Unknown user";
        },
        on: function() {
            connect(function(fb) {
                config.observer = registerObserver(browser, function(s) {
                    addShareButton();
                    //this.promote(); // Auto promoting
                });
                fb.on("child_added", onNewSong);
                addShareButton();
                refreshToggleButton(true);

                log("Subscribed");
                config.firebase = fb;
            });
        },
        off: function() {
            refreshToggleButton(false);
            config.firebase.off("child_added", onNewSong);
            config.firebase.unauth();
            delete(config.firebase);

            config.observer.disconnect();
            delete(config.observer);

            removeShareButton();

            log("Unsubscribed");
        },
        isOn: function() {
            return config.firebase != undefined;
        },
        promote: function() {
            var song = dzPlayer.getCurrentSong();
            if (!song) return;

            var data = {
                date: new Date().toString(),
                user: this.getUser(),
                song: song.SNG_TITLE + " // " + song.ART_NAME,
                raw: song,
            };
            
            config.firebase.push(data);
        },
        toggle: function() {
            if (this.isOn()) {
                this.off();
            } else {
                this.on();
            }
        }
    };

    setTimeout(function() {
        dj.on(); //Auto-on
        browser.dzdj = dj;
    }, 1000);

    refreshToggleButton(false);

})($, window, window.dzPlayer);
