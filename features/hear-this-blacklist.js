(function() {

    var storage = {
        key: "hear-this-blacklist",

        getBlacklist: function() {
            return window.localStorage.getItem(this.key) || "[]";
        },

        pushToBlacklist: function(item) {
            var blacklist = JSON.parse(this.getBlacklist());
            blacklist.push(item);
            window.localStorage.setItem(this.key, JSON.stringify(blacklist));
        }
    };

    var setup = function() {
        console.info("Setup " + storage.key);

        var blacklist = storage.getBlacklist();

        $("div#content section")
            .not(".divider")
            .not(".card-ads")
            .not(".card-sponsor")
            .each(function() {
                var id = $(this).attr("id");

                if (blacklist.indexOf(id) > -1) {
                    $(this).hide();
                    return;
                }

                var filterButton = "<div class='sticker sticker-white'><a class=" + storage.key + " href='#' data-id='" + id + "'>X</a></div>";
                var sticker = $(this).find("article.info .sticker").last();
                $(filterButton).insertAfter(sticker);

                $(this)
                    .find("a.hear-this-blacklist")
                    .on('click', function() {
                        event.preventDefault();
                        var sectionId = $(this).data("id")
                        storage.pushToBlacklist(sectionId);
                        $("section#" + sectionId).hide();
                    });
            });
    };

    var waiting = setInterval(function() {
        var feeds = $("#content section");

        if ($(feeds).length > 0) {
            clearInterval(waiting);
            setup();
        }

    }, 500);
})();
