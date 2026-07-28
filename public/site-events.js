(function () {
  var measurementId = "G-JN2E0S7E36";
  var googleAdsId = "AW-18149812430";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

  if (!window.__hotpotGaConfigured) {
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
    window.gtag("config", googleAdsId);
    window.__hotpotGaConfigured = true;
  }
  window.__hotpotAnalyticsReady = true;

  var campaignParams = new URLSearchParams(window.location.search);
  var campaignSource = campaignParams.get("utm_source") || "";
  var googleClickId = campaignParams.get("gclid") || campaignParams.get("gbraid") || campaignParams.get("wbraid") || "";
  if (campaignSource && !window.__hotpotCampaignLandingSent) {
    window.gtag("event", "campaign_landing", {
      campaign_source: campaignSource,
      campaign_medium: campaignParams.get("utm_medium") || "",
      campaign_name: campaignParams.get("utm_campaign") || "",
      campaign_content: campaignParams.get("utm_content") || "",
      page_path: window.location.pathname,
    });
    window.__hotpotCampaignLandingSent = true;
  }
  if (googleClickId && !window.__hotpotGoogleAdsLandingSent) {
    window.gtag("event", "google_ads_landing", {
      page_path: window.location.pathname,
      landing_page: window.location.pathname,
      ads_click_id_present: true,
    });
    window.__hotpotGoogleAdsLandingSent = true;
  }

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
    window.gtag("event", name, Object.assign({
      link_text: getText(link),
      link_url: link.href,
      cta_location: getLocation(link),
      page_path: window.location.pathname,
    }, params || {}));
  }

  function sendAdsCallConversion(event, link) {
    var navigated = false;
    var followLink = function () {
      if (navigated) return;
      navigated = true;
      window.location.href = link.href;
    };

    event.preventDefault();
    window.gtag("event", "conversion", {
      send_to: "AW-18149812430/gbFACOTUn9QcEM7RwM5D",
      value: 1.0,
      currency: "CAD",
      event_callback: followLink,
    });
    window.setTimeout(followLink, 800);
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
      sendAdsCallConversion(event, link);
    } else if (href.indexOf("mailto:") === 0) {
      sendEvent("email_click", link, { method: "email" });
    } else if (isMenuPdf(href)) {
      sendEvent(link.hasAttribute("download") ? "menu_download" : "menu_pdf_open", link);
    } else if (href.indexOf("google.com/maps") !== -1 && text.indexOf("review") !== -1) {
      sendEvent("google_review_click", link);
    } else if (href.indexOf("google.com/maps") !== -1) {
      sendEvent("directions_click", link);
      sendEvent("generate_lead", link, { method: "directions", lead_type: "directions" });
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
