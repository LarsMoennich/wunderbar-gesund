const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector("#site-nav");

const closeNav = () => {
  nav?.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
  toggle?.setAttribute("aria-label", "Menü öffnen");
};

toggle?.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
});

const scrollTargets = {
  methoden: ".methods-copy",
  "ueber-mich": "#ueber-mich",
  vorteile: "#vorteile .section-heading",
  preise: "#preise .section-heading",
  kontakt: "#kontakt > div",
};

const getScrollTarget = (hash) => {
  const id = hash.replace("#", "");
  if (!id) return null;
  const section = document.getElementById(id);
  if (!section) return null;
  return document.querySelector(scrollTargets[id]) || section;
};

const getMenuScrollOffset = (hash) => {
  if (hash === "#start") return 0;
  if (hash === "#ueber-mich") {
    return window.matchMedia("(max-width: 820px)").matches ? 72 : 92;
  }
  return window.matchMedia("(max-width: 820px)").matches ? 140 : 152;
};

const scrollToHashContent = (hash, behavior = "smooth") => {
  const target = getScrollTarget(hash);
  if (!target) return false;
  const top = target.getBoundingClientRect().top + window.scrollY - getMenuScrollOffset(hash);
  window.scrollTo({ top, behavior });
  return true;
};

nav?.addEventListener("click", (event) => {
  const clicked = event.target instanceof Element ? event.target : event.target?.parentElement;
  if (clicked) {
    const link = clicked.closest("a");
    const href = link?.getAttribute("href");
    if (href?.startsWith("#") && scrollToHashContent(href, "auto")) {
      event.preventDefault();
      history.pushState(null, "", href);
      requestLogoStateUpdate();
    }
    closeNav();
  }
});

document.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  if (!event.target.closest(".site-header") && nav?.classList.contains("is-open")) {
    closeNav();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && nav?.classList.contains("is-open")) {
    closeNav();
  }
});

const formStatus = document.querySelector("[data-form-status]");
const contactStatus = new URLSearchParams(window.location.search).get("kontakt");

if (formStatus && contactStatus === "ok") {
  formStatus.textContent = "Danke, deine Nachricht wurde gesendet. Ich melde mich bei dir.";
  formStatus.classList.add("is-success");
}

if (formStatus && contactStatus === "error") {
  formStatus.textContent = "Die Nachricht konnte leider nicht gesendet werden. Bitte schreibe mir direkt an lars@wunderbar-gesund.de.";
  formStatus.classList.add("is-error");
}

document.querySelectorAll("[data-accordion] .accordion-trigger").forEach((trigger) => {
  trigger.addEventListener("click", () => {
    const item = trigger.closest(".accordion-item");
    const isOpen = item.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", String(isOpen));
  });
});

let logoTicking = false;

const updateLogoState = () => {
  if (!document.querySelector(".hero-logo")) {
    logoTicking = false;
    return;
  }
  const isFlatMidWidth = window.innerWidth >= 821 && window.innerWidth <= 1180 && window.innerHeight <= 620;
  const end = window.innerWidth < 540 ? 300 : 420;
  const morphStart = window.innerWidth < 540 ? 76 : 110;
  const progress = Math.min(1, Math.max(0, window.scrollY / end));
  const morphRaw = Math.min(1, Math.max(0, (window.scrollY - morphStart) / (end - morphStart)));
  const morph = morphRaw * morphRaw * (3 - (2 * morphRaw));
  const startSize = isFlatMidWidth ? Math.min(188, window.innerWidth * 0.22) : Math.min(250, window.innerWidth * 0.32);
  const endSize = window.innerWidth < 540 ? 74 : 92;
  const logoSize = startSize - ((startSize - endSize) * progress);
  document.body.style.setProperty("--logo-progress", progress.toFixed(3));
  document.body.style.setProperty("--logo-morph", morph.toFixed(3));
  document.body.style.setProperty("--logo-size", `${logoSize.toFixed(1)}px`);
  logoTicking = false;
};

const requestLogoStateUpdate = () => {
  if (logoTicking) return;
  logoTicking = true;
  window.requestAnimationFrame(updateLogoState);
};

updateLogoState();
window.addEventListener("scroll", requestLogoStateUpdate, { passive: true });
window.addEventListener("hashchange", () => {
  scrollToHashContent(window.location.hash);
  requestLogoStateUpdate();
}, { passive: true });

const cookieConsent = document.querySelector("[data-cookie-consent]");
const cookieOptional = document.querySelector("[data-cookie-optional]");
const cookieAccept = document.querySelector("[data-cookie-accept]");
const cookieDecline = document.querySelector("[data-cookie-decline]");
const cookieSave = document.querySelector("[data-cookie-save]");
const cookieStorageKey = "wunderbarGesundCookieConsent";

const getCookieConsent = () => {
  try {
    return localStorage.getItem(cookieStorageKey) || document.cookie.includes(`${cookieStorageKey}=`);
  } catch {
    return document.cookie.includes(`${cookieStorageKey}=`);
  }
};

const saveCookieConsent = (optionalAccepted) => {
  try {
    localStorage.setItem(cookieStorageKey, JSON.stringify({
      necessary: true,
      optional: Boolean(optionalAccepted),
      savedAt: new Date().toISOString(),
    }));
  } catch {
    document.cookie = `${cookieStorageKey}=necessary; max-age=15552000; path=/; SameSite=Lax`;
  }
  cookieConsent?.setAttribute("hidden", "");
};

if (cookieConsent && !getCookieConsent()) {
  cookieConsent.removeAttribute("hidden");
}

cookieAccept?.addEventListener("click", () => saveCookieConsent(true));
cookieDecline?.addEventListener("click", () => saveCookieConsent(false));
cookieSave?.addEventListener("click", () => saveCookieConsent(cookieOptional?.checked));

if (window.location.hash) {
  window.setTimeout(() => {
    scrollToHashContent(window.location.hash, "auto");
    requestLogoStateUpdate();
  }, 0);
}

const auraContent = {
  body: {
    layer: "Körper",
    title: "Wo Symptome sichtbar werden",
    text: "Der Körper zeigt häufig, was auf tieferen Ebenen bereits länger in Spannung ist. Symptome können Hinweise darauf geben, welche Themen im Energiefeld, in Emotionen oder Glaubensmustern betrachtet werden möchten.",
  },
  etheric: {
    layer: "Ätherkörper",
    title: "Abbild des physischen Körpers",
    text: "Organe und Strukturen sind feinstofflich repräsentiert. In dieser Ebene können körpernahe Belastungen, Spannungen und gespeicherte Informationen sichtbar werden.",
  },
  emotional: {
    layer: "Emotionalkörper",
    title: "Konflikte und gespeicherte Gefühle",
    text: "Hier zeigen sich emotionale Ladungen, alte Verletzungen und innere Spannungen. Die Arbeit unterstützt dabei, unbewusste Reaktionen und festgehaltene Gefühle zu lösen.",
  },
  mental: {
    layer: "Mentaler Körper",
    title: "Glaubenssätze und innere Programme",
    text: "Diese Ebene umfasst Gedankenmuster, Überzeugungen und wiederkehrende innere Programme. Wenn sie erkannt werden, können neue Klarheit und Handlungsspielraum entstehen.",
  },
  astral: {
    layer: "Astralkörper",
    title: "Spuren vergangener Erfahrungen",
    text: "Hier können karmische Muster, miasmatische Belastungen und transgenerationale Prägungen betrachtet werden, die heute noch im System nachwirken.",
  },
};

document.querySelector("[data-aura]")?.addEventListener("click", (event) => {
  const dot = event.target.closest(".aura-dot");
  if (!dot) return;

  const explorer = dot.closest("[data-aura]");
  const content = auraContent[dot.dataset.auraKey];
  if (!explorer || !content) return;

  explorer.querySelectorAll(".aura-dot").forEach((item) => {
    item.classList.remove("is-active");
    item.setAttribute("aria-pressed", "false");
  });
  dot.classList.add("is-active");
  dot.setAttribute("aria-pressed", "true");
  explorer.querySelector("[data-aura-layer]").textContent = content.layer;
  explorer.querySelector("[data-aura-title]").textContent = content.title;
  explorer.querySelector("[data-aura-text]").textContent = content.text;
});
