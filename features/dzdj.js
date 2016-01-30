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

  var config = {
    firebase: undefined,
    observer: undefined,
    subscribedSince: undefined
  };


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
      dbname: "dzdj",
      auth: "6ZSDzLtPVU6RQF1xakF99ODdgRIcWzP3he5rrl3X"
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

  var addSongToPlaylist = function(item) {
    var song = JSON.parse(item.raw);

    var known = dzPlayer.getTrackList().some(function(s) {
      return s.SNG_ID == song.SNG_ID;
    });

    if (known) {
      return;
    }

    log(song);
    dzPlayer.addNextTracks([song], dzPlayer.context);
  }

  var onNewSong = function(data) {
    var item = data.exportVal();

    if (Date.parse(item.date) < config.subscribedSince) {
      return;
    }
    addSongToPlaylist(item);
  };

  var onSnapshot = function(data) {
    var restore = browser.localStorage.getItem('dzdj.restore');

    if (restore != true) {
      return;
    }

    var root = data.exportVal();

    Object.keys(root).forEach(function(key) {
      var song = root[key];
      log(song);
      addSongToPlaylist(song);
    });
  }

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

  var refreshToggleButton = function(message) {

    if ($("a.nav-link[data-type='apps']").length > 0) {
      var button = $("a.nav-link[data-type='apps']")[0];
      $(button).removeAttr("data-type");
      $(button).find("span.icon").removeClass("icon-app");
      $(button).find("span.icon").addClass("icon-share");
      $(button).find("span").not("span.icon").attr("id", "message");
      $(button).attr("id", "dzdj-toggle");
      $(button).attr("onclick", "dzdj.toggle();")
    }

    $("#dzdj-toggle")
      .find("#message")
      .text(message);
  }

  var dj = {
    getUser: function() {
      var key = 'dzdj';

      if (!browser.localStorage.getItem(key)) {
        var newuser = prompt("Deezer DJ username", "") || "";
        browser.localStorage.setItem(key, newuser);
        log('Hey, ' + newuser);
      }

      var user = browser.localStorage.getItem(key);
      $("#naboo_menu_collection_user_name").text(user);

      return user;
    },
    on: function() {
      refreshToggleButton("Connecting...");
      connect(function(fb) {
        config.observer = registerObserver(browser, function(s) {
          addShareButton();
          //this.promote(); // Auto promoting
        });

        config.subscribedSince = Date.parse(new Date());

        fb.on("child_added", onNewSong);
        fb.on("value", onSnapshot);

        addShareButton();
        refreshToggleButton("Online");

        log("Subscribed");
        config.firebase = fb;
      });
    },
    off: function() {
      refreshToggleButton("Offline");
      config.firebase.off("value", onSnapshot);
      config.firebase.off("child_added", onNewSong);
      config.firebase.unauth();
      delete(config.firebase);

      config.observer.disconnect();
      delete(config.observer);

      delete(config.subscribedSince);
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
        raw: JSON.stringify(song),
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
    browser.dzdj = dj;
    refreshToggleButton("Offline");
  }, 1000);

})($, window, window.dzPlayer);
