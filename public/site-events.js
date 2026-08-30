(function () {
  var measurementId = "G-JN2E0S7E36";
  var googleAdsId = "AW-18149812430";
  var metaPixelId = "1108307461722381";
  var attributionStorageKey = "hotpot_campaign_attribution_v2";
  var landingStorageKey = "hotpot_session_landing_v1";

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments);
  };

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

  function cleanValue(value, limit) {
    return String(value || "")
      .replace(/[^\p{L}\p{N} _.-]/gu, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, limit || 100);
  }

  function numericValue(value) {
    return String(value || "").replace(/\D/g, "").slice(0, 24);
  }

  function readSession(key) {
    try {
      return window.sessionStorage.getItem(key) || "";
    } catch (_error) {
      return "";
    }
  }

  function writeSession(key, value) {
    try {
      window.sessionStorage.setItem(key, value);
    } catch (_error) {
      // Tracking must never block the page when storage is unavailable.
    }
  }

  function pageLanguage() {
    return document.documentElement.lang === "zh-Hant" ? "zh-Hant" : "en";
  }

  function pageType() {
    var path = window.location.pathname.replace(/\/zh-hant(?=\/|$)/, "") || "/";
    if (path === "/") return "home";
    if (path.indexOf("/google-ads-") === 0) return "ads_landing";
    if (path.indexOf("/ayce-hot-pot-calgary") === 0) return "ayce";
    if (path.indexOf("/menu") === 0) return "menu";
    if (path.indexOf("/contact") === 0) return "contact";
    if (path.indexOf("/restaurant-info") === 0) return "restaurant_info";
    if (path.indexOf("/calgary-taiwanese-hot-pot") === 0) return "taiwanese_hot_pot";
    if (path.indexOf("/calgary-hot-pot-guide") === 0) return "calgary_guide";
    if (path.indexOf("/first-time-hot-pot-calgary") === 0) return "first_time_guide";
    if (path.indexOf("/faq") === 0) return "faq";
    if (path.indexOf("/about") === 0) return "about";
    return "content";
  }

  function referrerHost() {
    if (!document.referrer) return "";
    try {
      return new URL(document.referrer).hostname.replace(/^www\./, "").slice(0, 100);
    } catch (_error) {
      return "";
    }
  }

  function clickIdType(params) {
    if (params.get("gclid")) return "gclid";
    if (params.get("gbraid")) return "gbraid";
    if (params.get("wbraid")) return "wbraid";
    return "";
  }

  function campaignFromUrl(params) {
    var source = cleanValue(params.get("utm_source"), 50).toLowerCase();
    if (source === "google_ads") source = "google";
    var result = {
      campaign_source: source,
      campaign_medium: cleanValue(params.get("utm_medium"), 50).toLowerCase(),
      campaign_name: cleanValue(params.get("utm_campaign"), 100),
      campaign_id: cleanValue(params.get("utm_id"), 100),
      campaign_content: cleanValue(params.get("utm_content"), 100),
      campaign_term: cleanValue(params.get("utm_term"), 100),
      ads_campaign_id: numericValue(params.get("campaign_id") || params.get("campaignid") || params.get("utm_id")),
      ads_ad_group_id: numericValue(params.get("ad_group_id") || params.get("adgroupid")),
      ads_asset_group_id: numericValue(params.get("asset_group_id") || params.get("assetgroupid")),
      ads_creative_id: numericValue(params.get("creative")),
      ads_network: cleanValue(params.get("network"), 20).toLowerCase(),
      ads_device: cleanValue(params.get("device"), 20).toLowerCase(),
      ads_match_type: cleanValue(params.get("matchtype"), 20).toLowerCase(),
      ads_click_id_type: clickIdType(params),
    };
    return result;
  }

  function hasCampaignData(data) {
    return Boolean(data.campaign_source || data.campaign_medium || data.campaign_name || data.campaign_id || data.ads_click_id_type);
  }

  function isGooglePaid(data) {
    var paidMedium = data.campaign_medium === "cpc" || data.campaign_medium === "ppc" || data.campaign_medium === "paid";
    return Boolean(data.ads_click_id_type || (data.campaign_source === "google" && paidMedium));
  }

  function storedAttribution() {
    var raw = readSession(attributionStorageKey);
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (_error) {
      return {};
    }
  }

  var campaignParams = new URLSearchParams(window.location.search);
  var directAttribution = campaignFromUrl(campaignParams);
  var attribution = hasCampaignData(directAttribution) ? directAttribution : storedAttribution();
  if (hasCampaignData(directAttribution)) {
    writeSession(attributionStorageKey, JSON.stringify(directAttribution));
  }

  var sessionLandingPage = readSession(landingStorageKey);
  if (!sessionLandingPage) {
    sessionLandingPage = window.location.pathname;
    writeSession(landingStorageKey, sessionLandingPage);
  }

  function attributionParams() {
    var params = {};
    [
      "campaign_source",
      "campaign_medium",
      "campaign_name",
      "campaign_id",
      "campaign_content",
      "ads_campaign_id",
      "ads_ad_group_id",
      "ads_asset_group_id",
      "ads_network",
      "ads_device",
      "ads_match_type",
      "ads_click_id_type",
    ].forEach(function (key) {
      if (attribution[key] !== "") params[key] = attribution[key];
    });
    return params;
  }

  function baseParams() {
    return Object.assign({
      page_path: window.location.pathname,
      page_type: pageType(),
      site_language: pageLanguage(),
      page_language: document.documentElement.lang || "en-CA",
      session_landing_page: sessionLandingPage,
    }, attributionParams());
  }

  function loadGoogleTag() {
    if (window.__hotpotGoogleTagLoading) return;
    window.__hotpotGoogleTagLoading = true;

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return;
    }

    var script = document.createElement("script");
    script.async = true;
    script.src = "/t662/";
    document.head.appendChild(script);
  }

  function loadMetaPixel() {
    if (window.__hotpotMetaPixelConfigured) return;
    window.__hotpotMetaPixelConfigured = true;

    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
      return;
    }

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);

    window.fbq("init", metaPixelId);
    window.fbq("track", "PageView");
  }

  function scheduleGoogleTag() {
    var loadFromIntent = function () {
      loadGoogleTag();
      window.removeEventListener("pointerdown", loadFromIntent);
      window.removeEventListener("keydown", loadFromIntent);
      window.removeEventListener("scroll", loadFromIntent);
    };

    window.addEventListener("pointerdown", loadFromIntent, { passive: true, once: true });
    window.addEventListener("keydown", loadFromIntent, { once: true });
    window.addEventListener("scroll", loadFromIntent, { passive: true, once: true });

    var loadWhenPageSettles = function () {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadGoogleTag, { timeout: 3500 });
      } else {
        window.setTimeout(loadGoogleTag, 2500);
      }
    };

    if (document.readyState === "complete") {
      loadWhenPageSettles();
    } else {
      window.addEventListener("load", loadWhenPageSettles, { once: true });
    }
  }

  if (!window.__hotpotGaConfigured) {
    var sharedConfig = baseParams();
    window.gtag("js", new Date());
    window.gtag("set", sharedConfig);
    window.gtag("config", measurementId, sharedConfig);
    window.gtag("config", googleAdsId, sharedConfig);
    window.__hotpotGaConfigured = true;
  }
  window.__hotpotAnalyticsReady = true;
  loadMetaPixel();
  scheduleGoogleTag();

  if (hasCampaignData(directAttribution) && !window.__hotpotCampaignLandingSent) {
    window.gtag("event", "campaign_landing", Object.assign(baseParams(), {
      landing_page: window.location.pathname,
      referrer_host: referrerHost(),
      campaign_term: directAttribution.campaign_term,
      ads_creative_id: directAttribution.ads_creative_id,
      attribution_version: "v2",
    }));
    window.__hotpotCampaignLandingSent = true;
  }
  if (isGooglePaid(directAttribution) && !window.__hotpotGoogleAdsLandingSent) {
    window.gtag("event", "google_ads_landing", Object.assign(baseParams(), {
      landing_page: window.location.pathname,
      referrer_host: referrerHost(),
      campaign_term: directAttribution.campaign_term,
      ads_creative_id: directAttribution.ads_creative_id,
      ads_click_id_present: Boolean(directAttribution.ads_click_id_type),
      attribution_version: "v2",
    }));
    window.__hotpotGoogleAdsLandingSent = true;
  }

  function getText(link) {
    return (link.textContent || "").replace(/\s+/g, " ").trim();
  }

  function getLocation(link) {
    if (link.classList && link.classList.contains("reserve-sticky")) return "sticky_reserve";
    var section = link.closest && link.closest("section");
    if (section) return cleanValue(section.id || section.className.split(/\s+/)[0] || "section", 60);
    var nav = link.closest && link.closest("nav");
    if (nav) return "navigation";
    var footer = link.closest && link.closest("footer");
    if (footer) return "footer";
    return "page";
  }

  function safeDestination(link) {
    var href = link.getAttribute("href") || "";
    if (href.indexOf("tel:") === 0) return "phone";
    if (href.indexOf("mailto:") === 0) return "email";
    try {
      var url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin) return (url.pathname || "/") + (url.hash || "");
      return url.hostname.replace(/^www\./, "").slice(0, 100);
    } catch (_error) {
      return "unknown";
    }
  }

  function ctaName(link) {
    var href = link.getAttribute("href") || "";
    var text = getText(link).toLowerCase();
    if (href.indexOf("tel:") === 0) return /reserve|reservation|book|订位|預訂|預約|预约/.test(text) ? "reserve_by_phone" : "call_restaurant";
    if (href.indexOf("mailto:") === 0) return "email_restaurant";
    if (href.indexOf("google.com/maps") !== -1 && /review|評論|评论/.test(text)) return "google_review";
    if (href.indexOf("google.com/maps") !== -1) return "google_maps_directions";
    return cleanValue(link.getAttribute("data-track-label") || getText(link), 80).toLowerCase();
  }

  function offerType(link) {
    var haystack = ((link.getAttribute("href") || "") + " " + getText(link) + " " + getLocation(link)).toLowerCase();
    if (/ayce|all.you.can.eat|火鍋自助|火锅自助/.test(haystack)) return "ayce";
    if (/personal|19\.99|個人火鍋|个人火锅/.test(haystack)) return "personal_hot_pot";
    if (/beef.noodle|牛肉麵|牛肉面/.test(haystack)) return "beef_noodle";
    if (/light.meal|飯|饭|rice|noodle/.test(haystack)) return "light_meals";
    if (/drink|tea|奶茶|飲料|饮料/.test(haystack)) return "drinks";
    return "";
  }

  function sendEvent(name, link, params) {
    window.gtag("event", name, Object.assign(baseParams(), {
      cta_name: ctaName(link),
      link_destination: safeDestination(link),
      cta_location: getLocation(link),
    }, params || {}));

    if (window.__hotpotMetaStandaloneEvents) return;

    if (name === "phone_click") {
      window.fbq("track", "Contact", {
        content_name: "Phone Reservation",
        content_category: "contact",
      });
    } else if (name === "directions_click") {
      window.fbq("track", "FindLocation", {
        content_name: "Centre Street Japanese HotPot",
        content_category: "restaurant_location",
      });
    } else if (
      name === "menu_click" ||
      name === "menu_pdf_open" ||
      name === "menu_download" ||
      name === "menu_image_open"
    ) {
      window.fbq("track", "ViewContent", {
        content_name: "Restaurant Menu",
        content_category: "menu",
        content_ids: ["restaurant_menu"],
        content_type: "product",
      });
    }
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
      event_timeout: 800,
    });
    window.setTimeout(followLink, 850);
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

  function setupStickyReserve() {
    var sticky = document.querySelector(".reserve-sticky");
    if (!sticky) return;

    if (!document.querySelector(".sticky-directions")) {
      sticky.classList.add("reserve-sticky-call");
      var directions = document.createElement("a");
      directions.className = "reserve-sticky sticky-directions";
      directions.href = "https://www.google.com/maps/dir/?api=1&destination=Centre+Street+Japanese+HotPot%2C+2213+Centre+St+N%2C+Calgary%2C+AB";
      directions.target = "_blank";
      directions.rel = "noreferrer";
      directions.textContent = /^zh/i.test(document.documentElement.lang) ? "導航" : "Directions";
      sticky.insertAdjacentElement("afterend", directions);
    }

    var stickyButtons = document.querySelectorAll(".reserve-sticky");
    var setVisible = function (visible) {
      stickyButtons.forEach(function (button) {
        button.classList.toggle("is-visible", visible);
      });
    };

    var heroRegion = document.querySelector(".hero, .page-hero, .ads-hero, .homepage-ayce, .localized-hero");
    if (!heroRegion || !("IntersectionObserver" in window)) {
      var updateFromScroll = function () {
        var revealAt = Math.min(360, window.innerHeight * 0.45);
        setVisible(window.scrollY > revealAt);
      };
      window.addEventListener("scroll", updateFromScroll, { passive: true });
      updateFromScroll();
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      setVisible(!entries[0].isIntersecting);
    }, { threshold: 0.05 });
    observer.observe(heroRegion);
  }

  function sectionOfferType(section) {
    var identity = ((section.id || "") + " " + (section.className || "")).toLowerCase();
    if (/homepage-ayce|ayce-promo|ads-hero|ads-menu-summary/.test(identity)) return "ayce";
    if (/ayce-snack/.test(identity)) return "ayce_snacks";
    if (/personal-value|personal-hot-pot/.test(identity)) return "personal_hot_pot";
    if (/beef-noodle/.test(identity)) return "beef_noodle";
    if (/light-meals/.test(identity)) return "light_meals";
    if (/drink-feature/.test(identity)) return "drinks";
    if (/homepage-visit|localized-visit|ayce-reserve/.test(identity)) return "visit";
    return "";
  }

  function setupOfferViews() {
    if (!("IntersectionObserver" in window)) return;
    var seen = {};
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var type = sectionOfferType(entry.target);
        if (!type || seen[type] || !entry.isIntersecting || entry.intersectionRatio < 0.45) return;
        seen[type] = true;
        window.gtag("event", "offer_view", Object.assign(baseParams(), {
          offer_type: type,
          section_id: cleanValue(entry.target.id || entry.target.className.split(/\s+/)[0], 60),
        }));
        observer.unobserve(entry.target);
      });
    }, { threshold: [0.45] });

    document.querySelectorAll("main section").forEach(function (section) {
      if (sectionOfferType(section)) observer.observe(section);
    });
  }

  function setupPosterModals() {
    var lastTrigger = null;

    function activeModal() {
      if (!window.location.hash) return null;
      var target = document.getElementById(window.location.hash.slice(1));
      return target && target.classList.contains("poster-modal") ? target : null;
    }

    function syncModalState() {
      var modal = activeModal();
      document.body.classList.toggle("poster-open", Boolean(modal));
      if (modal) {
        var fullImage = modal.querySelector("img[data-full-src]");
        if (fullImage) {
          fullImage.src = fullImage.getAttribute("data-full-src");
          fullImage.removeAttribute("data-full-src");
        }
        var close = modal.querySelector(".modal-close");
        if (close) close.focus({ preventScroll: true });
      } else if (lastTrigger) {
        lastTrigger.focus({ preventScroll: true });
        lastTrigger = null;
      }
    }

    document.addEventListener("click", function (event) {
      var trigger = event.target.closest && event.target.closest(".poster-thumbnail");
      if (trigger) lastTrigger = trigger;
    });
    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") return;
      var modal = activeModal();
      if (!modal) return;
      var close = modal.querySelector(".modal-close");
      if (close) close.click();
    });
    window.addEventListener("hashchange", syncModalState);
    syncModalState();
  }

  setupStickyReserve();
  setupOfferViews();
  setupPosterModals();

  document.addEventListener("click", function (event) {
    var openMore = document.querySelector(".nav-more[open]");
    if (openMore && !(event.target.closest && event.target.closest(".nav-more"))) {
      openMore.removeAttribute("open");
    }

    var link = event.target.closest && event.target.closest("a");
    if (!link) return;
    if (link.closest && link.closest(".nav-more-links") && openMore) openMore.removeAttribute("open");

    var href = link.getAttribute("href") || "";
    var text = getText(link).toLowerCase();
    var platform = socialPlatform(href);
    var offer = offerType(link);

    if (link.classList && link.classList.contains("language-option")) {
      sendEvent("language_switch", link, {
        from_language: pageLanguage(),
        to_language: link.getAttribute("hreflang") === "zh-Hant-CA" ? "zh-Hant" : "en",
        destination_path: new URL(link.href, window.location.href).pathname,
      });
      return;
    }

    if (href.indexOf("tel:") === 0) {
      loadGoogleTag();
      var intent = /reserve|reservation|book|订位|預訂|預約|预约/.test(text) ? "reservation" : "phone";
      sendEvent("phone_click", link, { method: "phone", cta_intent: intent });
      sendAdsCallConversion(event, link);
    } else if (href.indexOf("mailto:") === 0) {
      sendEvent("email_click", link, { method: "email" });
    } else if (isMenuPdf(href)) {
      sendEvent(link.hasAttribute("download") ? "menu_download" : "menu_pdf_open", link, { document_type: "menu" });
    } else if (href.indexOf("google.com/maps") !== -1 && /review|評論|评论/.test(text)) {
      sendEvent("google_review_click", link);
    } else if (href.indexOf("google.com/maps") !== -1) {
      sendEvent("directions_click", link, { method: "directions" });
    } else if (platform) {
      sendEvent("social_click", link, { platform: platform });
      sendEvent(platform + "_click", link, { platform: platform });
    } else if (link.classList && link.classList.contains("poster-thumbnail")) {
      sendEvent("menu_image_open", link, { document_type: href.indexOf("ayce") !== -1 ? "ayce_menu" : "menu_page" });
    } else if (href.indexOf("/menu") === 0 || href.indexOf("menu/") === 0 || href.indexOf("/zh-hant/menu") === 0) {
      sendEvent("menu_click", link, { menu_context: offer || "full_menu", offer_type: offer || "menu" });
      if (offer) sendEvent("offer_interest_click", link, { offer_type: offer });
    } else if (offer === "ayce") {
      sendEvent("ayce_interest_click", link, { offer_type: "ayce" });
      sendEvent("offer_interest_click", link, { offer_type: "ayce" });
    } else if (offer) {
      sendEvent("offer_interest_click", link, { offer_type: offer });
    }
  });
})();
