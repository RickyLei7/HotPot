(function () {
  function sendEvent(name, link) {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", name, {
      link_text: (link.textContent || "").trim(),
      link_url: link.href,
    });
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a");
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var text = (link.textContent || "").trim().toLowerCase();

    if (href.indexOf("tel:") === 0) {
      sendEvent("phone_click", link);
    } else if (href.indexOf("mailto:") === 0) {
      sendEvent("email_click", link);
    } else if (href.indexOf("google.com/maps") !== -1) {
      sendEvent("directions_click", link);
    } else if (href.indexOf("instagram.com") !== -1) {
      sendEvent("instagram_click", link);
    } else if (href.indexOf("facebook.com") !== -1) {
      sendEvent("facebook_click", link);
    } else if (href.indexOf("xiaohongshu.com") !== -1) {
      sendEvent("xiaohongshu_click", link);
    } else if (href === "#ayce-poster") {
      sendEvent("ayce_poster_click", link);
    } else if (href === "#specials" || text.indexOf("ayce") !== -1) {
      sendEvent("ayce_interest_click", link);
    } else if (href.indexOf("/menu") === 0 || href.indexOf("menu/") === 0) {
      sendEvent("menu_click", link);
    }
  });
})();
