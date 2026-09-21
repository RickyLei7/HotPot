const BOOKING_ORIGIN = "https://reservation.centrestjhotpot.ca";
const BOOKING_URL = `${BOOKING_ORIGIN}/book`;
const EMBED_URL = `${BOOKING_ORIGIN}/embed/book`;
const SANDBOX = "allow-forms allow-scripts allow-same-origin";
let modal;
const ATTRIBUTION_KEYS = ["source", "medium", "campaignName", "campaignId", "content", "term", "adGroupId", "assetGroupId", "creativeId", "network", "device", "matchType", "clickIdType", "clickId", "landingPage", "referrerHost"];

export function bookingUrlWithAttribution(base, attribution = {}) {
  const url = new URL(base);
  for (const key of ATTRIBUTION_KEYS) {
    const value = attribution[key];
    if (typeof value === "string" && value) url.searchParams.set(key, value.slice(0, 200));
  }
  return url.href;
}

function loadStyles() {
  if (document.querySelector("link[data-reservation-modal-styles]")) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = "/reservation-modal.css?v=20260919-compact";
  link.dataset.reservationModalStyles = "";
  document.head.append(link);
}

function isMinimalLifecycleMessage(data) {
  if (!data || typeof data !== "object" || data.source !== "hotpot-booking") return false;
  const requiredKeys = {
    "booking:ready": ["source", "type"],
    "booking:dirty": ["source", "type", "dirty"],
    "booking:completed": ["source", "type", "status"],
    "booking:request-close": ["source", "type"],
  }[data.type];
  if (!requiredKeys) return false;
  const allowedKeys = data.type === "booking:completed" ? [...requiredKeys, "partySize"] : requiredKeys;
  if (!requiredKeys.every((key) => Object.hasOwn(data, key)) || !Object.keys(data).every((key) => allowedKeys.includes(key))) return false;
  return (data.type !== "booking:dirty" || typeof data.dirty === "boolean")
    && (data.type !== "booking:completed" || (["confirmed", "pending"].includes(data.status)
      && (!Object.hasOwn(data, "partySize") || (Number.isInteger(data.partySize) && data.partySize >= 1 && data.partySize <= 40))));
}

function isTrustedMessage(event, frame) {
  const data = event.data;
  return event.origin === BOOKING_ORIGIN
    && event.source === frame.contentWindow
    && isMinimalLifecycleMessage(data);
}

function closeModal() {
  if (!modal) return;
  const current = modal;
  modal = null;
  window.clearTimeout(current.timeout);
  window.removeEventListener("message", current.onMessage);
  window.removeEventListener("keydown", current.onKeydown);
  document.body.style.cssText = current.bodyStyle;
  current.root.remove();
  window.scrollTo(0, current.scrollY);
  current.trigger.focus({ preventScroll: true });
}

function requestClose() {
  if (!modal) return;
  if (!modal.dirty) return closeModal();
  modal.discard.hidden = false;
  modal.discard.querySelector("button").focus();
}

function loadFrame(current) {
  current.loading.hidden = false;
  current.problem.hidden = true;
  current.frame.removeAttribute("src");
  current.frame.src = current.embedUrl;
  window.clearTimeout(current.timeout);
  current.timeout = window.setTimeout(() => {
    if (modal !== current || current.ready) return;
    current.loading.hidden = true;
    current.problem.hidden = false;
  }, 15_000);
}

export function openReservationModal({ trigger, language = "en", attribution = {} }) {
  if (modal) return modal.root;
  loadStyles();
  const scrollY = window.scrollY;
  const directUrl = bookingUrlWithAttribution(BOOKING_URL, attribution);
  const embedUrl = bookingUrlWithAttribution(EMBED_URL, attribution);
  const root = document.createElement("div");
  root.className = "reservation-dialog-root";
  root.dataset.reservationDialog = "";
  root.innerHTML = `
    <div class="reservation-dialog-backdrop" data-reservation-dialog-backdrop=""></div>
    <section class="reservation-dialog" role="dialog" aria-modal="true" aria-labelledby="reservation-dialog-title" tabindex="-1">
      <h2 id="reservation-dialog-title">${language === "zh-Hant" ? "網上訂位" : "Reserve a table"}</h2>
      <button class="reservation-dialog-close" type="button" data-reservation-close="" aria-label="Close booking dialog">×</button>
      <p class="reservation-dialog-loading" data-reservation-loading="">Loading booking…</p>
      <div class="reservation-dialog-problem" data-reservation-problem="" hidden>
        <p>Booking is taking longer than expected.</p>
        <button type="button" data-reservation-retry="">Try again</button>
        <a href="${directUrl}" data-reservation-direct>Open booking page</a>
      </div>
      <iframe title="${language === "zh-Hant" ? "網上訂位" : "Online booking"}" sandbox="${SANDBOX}"></iframe>
      <div class="reservation-dialog-discard" data-reservation-discard="" hidden>
        <p>Discard your unfinished booking?</p>
        <button type="button">Keep booking</button>
        <button type="button">Discard</button>
      </div>
    </section>`;
  document.body.append(root);

  const frame = root.querySelector("iframe");
  const current = {
    root,
    frame,
    trigger,
    scrollY,
    bodyStyle: document.body.style.cssText,
    loading: root.querySelector("[data-reservation-loading]"),
    problem: root.querySelector("[data-reservation-problem]"),
    discard: root.querySelector("[data-reservation-discard]"),
    dirty: false,
    ready: false,
    timeout: 0,
    embedUrl,
  };
  modal = current;
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = "100%";
  document.body.style.overflow = "hidden";

  current.onMessage = (event) => {
    if (!isTrustedMessage(event, frame)) return;
    const data = event.data;
    if (data.type === "booking:ready") {
      current.ready = true;
      current.loading.hidden = true;
      window.clearTimeout(current.timeout);
    } else if (data.type === "booking:dirty" && typeof data.dirty === "boolean") {
      current.dirty = data.dirty;
    } else if (data.type === "booking:completed" && (data.status === "confirmed" || data.status === "pending")) {
      current.dirty = false;
      window.dispatchEvent(new CustomEvent("hotpot:booking-completed", { detail: { status: data.status, partySize: data.partySize } }));
    } else if (data.type === "booking:request-close") {
      requestClose();
    }
  };
  current.onKeydown = (event) => {
    if (event.key === "Escape") requestClose();
  };
  window.addEventListener("message", current.onMessage);
  window.addEventListener("keydown", current.onKeydown);
  root.querySelector("[data-reservation-close]").addEventListener("click", requestClose);
  root.querySelector("[data-reservation-retry]").addEventListener("click", () => loadFrame(current));
  current.discard.querySelector("button").addEventListener("click", () => { current.discard.hidden = true; });
  current.discard.querySelectorAll("button")[1].addEventListener("click", closeModal);
  root.querySelector(".reservation-dialog").focus({ preventScroll: true });
  loadFrame(current);
  return root;
}
