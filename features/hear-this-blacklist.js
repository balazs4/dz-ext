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

    var setup = function(elements) {
        var blacklist = storage.getBlacklist();

        $(elements)
            .each(function() {
                var id = $(this).attr("id");

                if (blacklist.indexOf(id) > -1) {
                    $(this).hide();
                    return;
                }

                if ($(this).find("." + storage.key).length > 1) {
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



    var init = function() {
        console.info("Setup " + storage.key);

        var elements = $("div#content section")
            .not(".divider")
            .not(".card-ads")
            .not(".card-sponsor");

        setup(elements);

        $("div#content").on('DOMNodeInserted', function(element) {
            setup(element.target);
        });
    };

    var waiting = setInterval(function() {
        var feeds = $("#content section");

        if ($(feeds).length > 0) {
            clearInterval(waiting);
            init();
        }

    }, 500);
})();
