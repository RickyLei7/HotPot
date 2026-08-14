(function () {
  var pixelId = "1108307461722381";

  if (window.__hotpotMetaStandaloneEvents) return;
  window.__hotpotMetaStandaloneEvents = true;

  window.fbq = window.fbq || function () {
    window.fbq.callMethod
      ? window.fbq.callMethod.apply(window.fbq, arguments)
      : window.fbq.queue.push(arguments);
  };
  if (!window._fbq) window._fbq = window.fbq;
  window.fbq.push = window.fbq;
  window.fbq.loaded = true;
  window.fbq.version = "2.0";
  window.fbq.queue = window.fbq.queue || [];

  if (!window.__hotpotMetaPixelConfigured) {
    window.__hotpotMetaPixelConfigured = true;

    if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      var script = document.createElement("script");
      script.async = true;
      script.src = "https://connect.facebook.net/en_US/fbevents.js";
      document.head.appendChild(script);

      window.fbq("init", pixelId);
      window.fbq("track", "PageView");
    }
  }

  function isMenuLink(link, href) {
    var text = (link.textContent || "").toLowerCase();
    return Boolean(
      link.classList.contains("poster-thumbnail") ||
      href.indexOf("/menu") !== -1 ||
      href.indexOf("menu/") !== -1 ||
      /\.pdf($|\?)/.test(href) ||
      /menu|菜单|菜單/.test(text)
    );
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a");
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var text = (link.textContent || "").toLowerCase();

    if (href.indexOf("tel:") === 0) {
      window.fbq("track", "Contact", {
        content_name: "Phone Reservation",
        content_category: "contact",
      });
    } else if (href.indexOf("google.com/maps") !== -1 && !/review|評論|评论/.test(text)) {
      window.fbq("track", "FindLocation", {
        content_name: "Centre Street Japanese HotPot",
        content_category: "restaurant_location",
      });
    } else if (isMenuLink(link, href)) {
      window.fbq("track", "ViewContent", {
        content_name: "Restaurant Menu",
        content_category: "menu",
        content_ids: ["restaurant_menu"],
        content_type: "product",
      });
    }
  });
})();
