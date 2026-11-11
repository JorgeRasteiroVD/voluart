"use strict";

const CONTACT_EMAIL = "contact.voluart@gmail.com";
const CONTACT_PHONE = "";
const CONTACT_WHATSAPP = "";
const INSTAGRAM_URL = "";
const BUSINESS_LOCATION = "";
const FORM_ENDPOINT = "FORM_ENDPOINT_PLACEHOLDER";
const PRIVACY_POLICY_URL = "";

const VIDEOS = [];

const GALLERIES = {
  sculptures: {
    title: "sculptureTitle",
    photos: ["sculptures-overview", "winged-sculpture", "classical-figure", "trident-figure", "movement-figure", "figure-study", "sculptures-in-space", "winged-sculpture-detail"],
  },
  wings: {
    title: "wingsTitle",
    photos: ["wings-in-context", "wings-on-wall", "wings-side-view", "wings-interior", "wings-mounting", "wings-frontal"],
  },
  columns: {
    title: "columnsTitle",
    photos: ["columns-double-interior", "column-close-interior", "column-event-interior", "column-fragment-interior", "column-tall-fragment", "columns-outdoors", "columns-outdoor-closeup", "columns-at-workshop"],
  },
  process: {
    title: "workshopTitle",
    photos: ["workshop-sculptures-raw", "sculpture-white-detail", "wing-carved", "wing-finishing-by-hand", "wings-carving-close", "raw-columns", "white-column-assembly", "column-sections", "column-surface-treatment", "fragment-color-finishing", "column-color-application", "column-parts-finishing"],
  },
};

const PHOTO_SIZES = {
  "workshop-sculptures-raw": [2048, 1536],
  "columns-outdoor-closeup": [480, 640],
  "sculpture-white-detail": [1500, 2000],
  "wing-finishing-by-hand": [1500, 2000],
  "wing-carved": [1500, 2000],
};

const root = document.documentElement;
const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-toggle");
const headerMenu = document.getElementById("header-menu");
const primaryLinks = Array.from(document.querySelectorAll(".primary-nav a"));
const languageButtons = document.querySelectorAll("[data-lang]");
const languageCodes = Object.keys(LANGUAGES);
const storageKey = "voluart.language";
const mediaQuery = window.matchMedia("(max-width: 980px)");
const form = document.getElementById("quote-form");
const formStatus = document.getElementById("form-status");
const formSubmit = form.querySelector("button[type='submit']");
const requiredFields = Array.from(form.querySelectorAll("[data-required]"));
const heroImage = document.getElementById("hero-photo");
const heroCaption = document.getElementById("hero-caption");
const heroThumbnails = document.querySelectorAll("[data-hero-photo]");
const dialog = document.getElementById("gallery-dialog");
const galleryStage = dialog.querySelector(".gallery-stage");
const galleryImage = document.getElementById("gallery-image");
const galleryCaption = document.getElementById("gallery-caption");
const galleryCounter = document.getElementById("gallery-counter");
const galleryThumbs = document.getElementById("gallery-thumbs");

let language;
let languageIndex;
let currentSection = document.getElementById("home");
let activeGallery = null;
let galleryOpener;
let galleryIndex = 0;
let gesture = null;
let statusKey = "";
let frameQueued = false;

const text = (key) => COPY[key][languageIndex];
const photoText = (id) => PHOTO_TEXT[id][languageIndex];
const photoPath = (group, id) => `assets/images/${group}/${id}.webp`;
const supported = (code) => Object.hasOwn(LANGUAGES, code);

function readLanguage() {
  const urlLanguage = new URLSearchParams(location.search).get("lang");
  if (supported(urlLanguage)) return urlLanguage;

  try {
    const saved = localStorage.getItem(storageKey);
    if (supported(saved)) return saved;
  } catch {
    // Site navigation also works when browser storage is blocked.
  }

  const preferences = navigator.languages?.length ? navigator.languages : [navigator.language];
  return preferences.map((tag) => tag?.toLowerCase().split("-")[0]).find(supported) || "en";
}

function setLanguage(code) {
  language = code;
  languageIndex = languageCodes.indexOf(code);
  root.lang = LANGUAGES[code].tag;
  document.title = text("metaTitle");

  const meta = {
    "name:description": text("metaDescription"),
    "property:og:title": text("metaTitle"),
    "property:og:description": text("metaDescription"),
    "property:og:locale": LANGUAGES[code].locale,
    "property:og:image:alt": photoText("winged-sculpture"),
    "name:twitter:title": text("metaTitle"),
    "name:twitter:description": text("metaDescription"),
    "name:twitter:image:alt": photoText("winged-sculpture"),
  };
  for (const [attribute, value] of Object.entries(meta)) {
    const separator = attribute.indexOf(":");
    document.querySelector(`meta[${attribute.slice(0, separator)}="${attribute.slice(separator + 1)}"]`).content = value;
  }
  document.querySelectorAll("[data-t]").forEach((element) => {
    element.textContent = text(element.dataset.t);
  });
  document.querySelectorAll("[data-aria]").forEach((element) => {
    element.setAttribute("aria-label", text(element.dataset.aria));
  });
  document.querySelectorAll("[data-photo]").forEach((element) => {
    element.alt = photoText(element.dataset.photo);
  });
  updateHeroPhotoLabels();
  updateQuoteLinks();
  languageButtons.forEach((button) => {
    const buttonLanguage = button.dataset.lang;
    button.setAttribute("aria-pressed", String(buttonLanguage === code));
    button.setAttribute("aria-label", LANGUAGES[buttonLanguage].name);
  });
  formStatus.textContent = statusKey ? text(statusKey) : "";
  requiredFields.forEach((field) => field.setCustomValidity(""));
  updateVideoLanguage();
}

function updateHeroPhotoLabels() {
  heroCaption.textContent = heroImage.alt;
  heroThumbnails.forEach((button) => {
    button.setAttribute("aria-label", `${text("heroShow")}: ${photoText(button.dataset.heroPhoto)}`);
  });
}

function setupHeroGallery() {
  for (const button of heroThumbnails) {
    button.addEventListener("click", () => {
      const thumbnail = button.querySelector("img");
      const previousSrc = heroImage.getAttribute("src");
      const previousPhoto = heroImage.dataset.photo;

      heroImage.src = thumbnail.getAttribute("src");
      heroImage.dataset.photo = button.dataset.heroPhoto;
      heroImage.alt = photoText(heroImage.dataset.photo);
      thumbnail.src = previousSrc;
      button.dataset.heroPhoto = previousPhoto;
      updateHeroPhotoLabels();
    });
  }
  document.querySelector(".hero-thumbnails").hidden = false;
}

function updateQuoteLinks() {
  const email = CONTACT_EMAIL.trim();
  const href = email && !httpsURL(FORM_ENDPOINT)
    ? `mailto:${email}?subject=${encodeURIComponent(text("quoteSubject"))}`
    : "#contact";
  document.querySelectorAll("[data-quote-link]").forEach((link) => { link.href = href; });
}

languageButtons.forEach((button) => button.addEventListener("click", () => {
  const code = button.dataset.lang;
  if (code === language) return;
  const reference = button.closest("footer") || currentSection;
  const previousTop = reference.getBoundingClientRect().top;
  setLanguage(code);
  const shift = reference.getBoundingClientRect().top - previousTop;
  if (shift) window.scrollBy({ top: shift, behavior: "instant" });

  try {
    localStorage.setItem(storageKey, code);
  } catch {
    // The current language still works without persistence.
  }
  const url = new URL(location.href);
  url.searchParams.set("lang", code);
  try {
    history.replaceState(history.state, "", url);
  } catch {
    // Some browsers limit URL changes for files opened directly from disk.
  }
  queueSectionUpdate();
}));

function toggleMenu(open, returnFocus = false) {
  menuButton.setAttribute("aria-expanded", String(open));
  headerMenu.classList.toggle("is-open", open);
  menuButton.querySelector("use").setAttribute("href", open ? "#i-close" : "#i-menu");
  if (returnFocus) menuButton.focus();
}

function menuIsOpen() {
  return menuButton.getAttribute("aria-expanded") === "true";
}

menuButton.addEventListener("click", () => toggleMenu(!menuIsOpen()));
headerMenu.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link || !menuIsOpen()) return;
  if (link.protocol === "mailto:") {
    toggleMenu(false, true);
    return;
  }
  toggleMenu(false);
  const target = document.getElementById(link.hash.slice(1));
  if (target) {
    target.tabIndex = -1;
    target.focus({ preventScroll: true });
  }
});
document.addEventListener("click", (event) => {
  if (menuIsOpen() && !header.contains(event.target)) {
    toggleMenu(false, headerMenu.contains(document.activeElement));
  }
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && menuIsOpen() && !dialog.open) {
    event.preventDefault();
    toggleMenu(false, true);
  }
});
mediaQuery.addEventListener("change", () => toggleMenu(false));

function updateSection() {
  frameQueued = false;
  const sections = document.querySelectorAll("main > section:not([hidden])");
  const headerBottom = header.getBoundingClientRect().bottom;
  const readingLine = Math.max(headerBottom + 26, innerHeight * 0.27);
  const atBottom = scrollY > 0 && scrollY + innerHeight >= root.scrollHeight - 4;
  currentSection = sections[0];

  for (const section of sections) {
    if (atBottom || section.getBoundingClientRect().top <= readingLine) currentSection = section;
  }
  primaryLinks.forEach((link) => {
    if (link.hash === `#${currentSection.id}`) link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  });
}

function queueSectionUpdate() {
  if (frameQueued) return;
  frameQueued = true;
  requestAnimationFrame(updateSection);
}

function setupSectionNavigation() {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(queueSectionUpdate, { rootMargin: "-15% 0px -55% 0px" });
    document.querySelectorAll("main > section:not([hidden])").forEach((section) => observer.observe(section));
  }
  window.addEventListener("scroll", queueSectionUpdate, { passive: true });
  window.addEventListener("resize", queueSectionUpdate);
  window.addEventListener("pageshow", queueSectionUpdate);
  updateSection();
}

function setImage(image, group, id, alt) {
  const [width, height] = PHOTO_SIZES[id] || [1536, 2048];
  image.width = width;
  image.height = height;
  image.alt = alt;
  image.src = photoPath(group, id);
}

function updateGallery(index) {
  const photos = GALLERIES[activeGallery].photos;
  galleryIndex = (index + photos.length) % photos.length;
  const id = photos[galleryIndex];
  galleryImage.hidden = false;
  setImage(galleryImage, activeGallery, id, photoText(id));
  galleryCaption.textContent = photoText(id);
  galleryCounter.textContent = `${galleryIndex + 1} / ${photos.length}`;
  Array.from(galleryThumbs.children).forEach((item, itemIndex) => {
    const button = item.firstElementChild;
    if (itemIndex === galleryIndex) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
}

function openGallery(group, opener) {
  activeGallery = group;
  galleryOpener = opener;
  const { title, photos } = GALLERIES[group];
  document.getElementById("gallery-title").textContent = text(title);
  galleryThumbs.replaceChildren();

  photos.forEach((id, index) => {
    const item = document.createElement("li");
    const button = document.createElement("button");
    const image = document.createElement("img");
    button.type = "button";
    button.setAttribute("aria-label", `${text("galleryShow").replace("{number}", index + 1)}: ${photoText(id)}`);
    image.loading = "lazy";
    image.decoding = "async";
    setImage(image, group, id, "");
    button.append(image);
    button.addEventListener("click", () => updateGallery(index));
    item.append(button);
    galleryThumbs.append(item);
  });

  updateGallery(0);
  document.body.classList.add("gallery-open");
  dialog.showModal();
  dialog.scrollTop = 0;
}

function setupGallery() {
  if (typeof dialog.showModal !== "function") return;
  document.querySelectorAll("[data-gallery]").forEach((link) => {
    link.setAttribute("aria-haspopup", "dialog");
    link.addEventListener("click", (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      openGallery(link.dataset.gallery, link);
    });
  });
  dialog.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-action]");
    if (event.target === dialog || button?.dataset.galleryAction === "close") dialog.close();
    if (button?.dataset.galleryAction === "prev") updateGallery(galleryIndex - 1);
    if (button?.dataset.galleryAction === "next") updateGallery(galleryIndex + 1);
  });
  dialog.addEventListener("close", () => {
    document.body.classList.remove("gallery-open");
    galleryOpener?.focus({ preventScroll: true });
    activeGallery = null;
    gesture = null;
  });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      updateGallery(galleryIndex + (event.key === "ArrowLeft" ? -1 : 1));
    }
    if (event.key === "Tab") {
      const first = dialog.querySelector("button");
      const last = galleryThumbs.lastElementChild?.firstElementChild;
      if (event.shiftKey && document.activeElement === first && last) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  galleryImage.addEventListener("error", () => {
    if (!dialog.open) return;
    galleryImage.hidden = true;
    galleryCaption.textContent = text("galleryError");
  });
  galleryStage.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch" || !event.isPrimary) return;
    gesture = { id: event.pointerId, x: event.clientX, y: event.clientY };
    galleryStage.setPointerCapture(event.pointerId);
  });
  galleryStage.addEventListener("pointerup", (event) => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const x = event.clientX - gesture.x;
    const y = event.clientY - gesture.y;
    gesture = null;
    if (Math.abs(x) > 48 && Math.abs(x) > Math.abs(y) * 1.4) {
      updateGallery(galleryIndex + (x > 0 ? -1 : 1));
    }
  });
  galleryStage.addEventListener("pointercancel", () => { gesture = null; });
}

function httpsURL(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function showContactLink(id, href, label) {
  if (!href) return;
  const link = document.getElementById(id);
  link.href = href;
  if (label) link.textContent = label;
  link.hidden = false;
  document.getElementById("contact-links").hidden = false;
}

function updateFormStatus(key, state = "") {
  statusKey = key;
  formStatus.textContent = key ? text(key) : "";
  formStatus.dataset.state = state;
}

function validateQuoteForm() {
  for (const field of requiredFields) {
    field.setCustomValidity("");
    const empty = field.type === "checkbox" ? !field.checked : !field.value.trim();
    if (empty || !field.validity.valid) field.setCustomValidity(text(field.dataset.required));
    field.setAttribute("aria-invalid", String(!field.validity.valid));
  }
  return form.reportValidity();
}

function setupContact() {
  const email = CONTACT_EMAIL.trim();
  const phone = CONTACT_PHONE.trim();
  const whatsapp = CONTACT_WHATSAPP.replace(/\D/g, "");
  if (email) showContactLink("contact-email", `mailto:${email}`, email);
  if (phone) showContactLink("contact-phone", `tel:${phone.replace(/[^+\d]/g, "")}`, phone);
  if (whatsapp) showContactLink("contact-whatsapp", `https://wa.me/${whatsapp}`);
  showContactLink("contact-instagram", httpsURL(INSTAGRAM_URL));
  if (BUSINESS_LOCATION.trim()) {
    const locationLabel = document.getElementById("contact-location");
    locationLabel.textContent = BUSINESS_LOCATION;
    locationLabel.hidden = false;
    document.getElementById("contact-links").hidden = false;
  }

  const endpoint = httpsURL(FORM_ENDPOINT);
  document.getElementById("contact-unavailable").hidden = Boolean(endpoint || email);
  document.getElementById("contact-email-only").hidden = Boolean(endpoint || !email);
  if (!endpoint) return;

  form.action = endpoint;
  form.noValidate = true;
  form.hidden = false;
  if (PRIVACY_POLICY_URL.trim()) {
    const policy = document.getElementById("privacy-link");
    policy.href = PRIVACY_POLICY_URL;
    policy.hidden = false;
    document.getElementById("privacy-pending").hidden = true;
  }

  for (const field of requiredFields) {
    field.addEventListener("input", () => {
      field.setCustomValidity("");
      field.removeAttribute("aria-invalid");
    });
  }
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (formSubmit.disabled || !validateQuoteForm()) return;
    if (form.elements._gotcha.value.trim()) {
      updateFormStatus("sendError", "error");
      return;
    }

    formSubmit.disabled = true;
    form.setAttribute("aria-busy", "true");
    updateFormStatus("sending");
    const data = new FormData(form);
    data.set("language", language);
    const abort = new AbortController();
    const timeout = setTimeout(() => abort.abort(), 15000);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
        signal: abort.signal,
      });
      if (!response.ok) throw new Error("Form submission failed");
      const result = await response.json();
      if (result.ok === false || result.errors?.length) throw new Error("Form rejected");
      form.reset();
      requiredFields.forEach((field) => field.removeAttribute("aria-invalid"));
      updateFormStatus("sent", "success");
    } catch {
      updateFormStatus("sendError", "error");
    } finally {
      clearTimeout(timeout);
      formSubmit.disabled = false;
      form.removeAttribute("aria-busy");
    }
  });
}

function updateVideoLanguage() {
  document.querySelectorAll(".video-card").forEach((card) => {
    const video = VIDEOS[Number(card.dataset.video)];
    const title = typeof video.title === "string" ? video.title : video.title[language] || video.title.en;
    card.querySelector("h3").textContent = title;
    const embed = card.querySelector("iframe");
    const player = card.querySelector("video");
    if (embed) embed.title = title;
    if (player) player.setAttribute("aria-label", title);
  });
}

function setupVideos() {
  const grid = document.getElementById("video-grid");
  VIDEOS.forEach((entry, index) => {
    const embed = httpsURL(entry.embed);
    if (!entry.title || !entry.poster || (!entry.src && !embed)) return;
    const card = document.createElement("article");
    const heading = document.createElement("h3");
    card.className = "video-card";
    card.dataset.video = index;

    if (embed) {
      const button = document.createElement("button");
      const poster = document.createElement("img");
      const label = document.createElement("span");
      button.type = "button";
      button.className = "video-embed";
      poster.src = entry.poster;
      poster.loading = "lazy";
      poster.decoding = "async";
      poster.alt = "";
      label.dataset.t = "playVideo";
      button.append(poster, label);
      button.addEventListener("click", () => {
        const frame = document.createElement("iframe");
        frame.src = embed;
        frame.title = heading.textContent;
        frame.referrerPolicy = "strict-origin-when-cross-origin";
        frame.allowFullscreen = true;
        frame.tabIndex = 0;
        button.replaceWith(frame);
        frame.focus();
      });
      card.append(button);
    } else {
      const video = document.createElement("video");
      video.controls = true;
      video.playsInline = true;
      video.preload = "none";
      video.poster = entry.poster;
      video.src = entry.src;
      for (const caption of entry.captions || []) {
        const track = document.createElement("track");
        track.kind = "captions";
        track.src = caption.src;
        track.srclang = caption.lang;
        track.label = caption.label;
        video.append(track);
      }
      card.append(video);
    }
    card.append(heading);
    grid.append(card);
  });
  if (grid.childElementCount) {
    document.getElementById("videos").hidden = false;
    document.querySelectorAll("[data-video-link]").forEach((link) => { link.hidden = false; });
  }
}

root.classList.add("js");
menuButton.hidden = false;
document.getElementById("year").textContent = new Date().getFullYear();
setupVideos();
setLanguage(readLanguage());
setupHeroGallery();
setupContact();
setupGallery();
setupSectionNavigation();
