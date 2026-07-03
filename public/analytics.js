(function () {
  function getText(link) {
    return (link.textContent || "").replace(/\s+/g, " ").trim();
  }

  function getLocation(link) {
    var section = link.closest && link.closest("section");
    if (section) return section.id || section.className || "section";
    var nav = link.closest && link.closest("nav");
    if (nav) return "navigation";
    if (link.classList && link.classList.contains("reserve-sticky")) return "sticky_reserve";
    return "page";
  }

  function sendEvent(name, link, params) {
    if (typeof window.gtag !== "function") return;

    window.gtag("event", name, Object.assign({
      link_text: getText(link),
      link_url: link.href,
      cta_location: getLocation(link),
      page_path: window.location.pathname,
    }, params || {}));
  }

  function isMenuPdf(href) {
    return href.indexOf("centre-street-japanese-hotpot-menu.pdf") !== -1 || /\.pdf($|\?)/.test(href);
  }

  function socialPlatform(href) {
    if (href.indexOf("instagram.com") !== -1) return "instagram";
    if (href.indexOf("facebook.com") !== -1) return "facebook";
    if (href.indexOf("threads.com") !== -1) return "threads";
    if (href.indexOf("tiktok.com") !== -1) return "tiktok";
    if (href.indexOf("xiaohongshu.com") !== -1) return "xiaohongshu";
    return "";
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a");
    if (!link) return;

    var href = link.getAttribute("href") || "";
    var text = getText(link).toLowerCase();
    var platform = socialPlatform(href);

    if (href.indexOf("tel:") === 0) {
      sendEvent("reservation_click", link, { method: "phone" });
      sendEvent("phone_click", link, { method: "phone" });
      sendEvent("generate_lead", link, { method: "phone" });
    } else if (href.indexOf("mailto:") === 0) {
      sendEvent("email_click", link, { method: "email" });
    } else if (isMenuPdf(href)) {
      sendEvent(link.hasAttribute("download") ? "menu_download" : "menu_pdf_open", link);
    } else if (href.indexOf("google.com/maps") !== -1 && text.indexOf("review") !== -1) {
      sendEvent("google_review_click", link);
    } else if (href.indexOf("google.com/maps") !== -1) {
      sendEvent("directions_click", link);
    } else if (platform) {
      sendEvent("social_click", link, { platform: platform });
      sendEvent(platform + "_click", link, { platform: platform });
    } else if (href === "#ayce-poster") {
      sendEvent("ayce_poster_click", link);
    } else if (href === "#specials" || text.indexOf("ayce") !== -1 || text.indexOf("all-you-can-eat") !== -1) {
      sendEvent("ayce_interest_click", link);
    } else if (href.indexOf("/menu") === 0 || href.indexOf("menu/") === 0) {
      sendEvent("menu_click", link);
    }
  });
})();
