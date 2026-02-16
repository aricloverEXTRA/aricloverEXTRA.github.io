/* Theme */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const storedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", storedTheme);
themeIcon.textContent = storedTheme === "dark" ? "🌙" : "☀️";

function animateThemeSwitch(next) {
  document.documentElement.classList.add("theme-transitioning");
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeIcon.textContent = next === "dark" ? "🌙" : "☀️";
  setTimeout(() => document.documentElement.classList.remove("theme-transitioning"), 500);
}

themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  animateThemeSwitch(current === "dark" ? "light" : "dark");
};

/* Colors & presets */
let currentMainColor = "#ffffff";
let currentBorderColor = "#000000";
let vanillaPresetActive = false;

const mainColorPicker = document.getElementById("mainColorPicker");
const borderColorPicker = document.getElementById("borderColorPicker");
const mainColorFill = document.getElementById("mainColorFill");
const borderColorFill = document.getElementById("borderColorFill");

function setColorFill(el, hex) { if (el) el.style.background = hex; }

if (mainColorPicker) { currentMainColor = mainColorPicker.value; setColorFill(mainColorFill, currentMainColor); }
if (borderColorPicker) { currentBorderColor = borderColorPicker.value; setColorFill(borderColorFill, currentBorderColor); }

mainColorPicker?.addEventListener("input", () => {
  vanillaPresetActive = false;
  document.getElementById("vanillaPresetBtn")?.classList.remove("preset-active");
  currentMainColor = mainColorPicker.value;
  setColorFill(mainColorFill, currentMainColor);
  refreshAllPreviews();
});

borderColorPicker?.addEventListener("input", () => {
  vanillaPresetActive = false;
  document.getElementById("vanillaPresetBtn")?.classList.remove("preset-active");
  currentBorderColor = borderColorPicker.value;
  setColorFill(borderColorFill, currentBorderColor);
  refreshAllPreviews();
});

mainColorFill?.addEventListener("click", () => mainColorPicker?.click());
mainColorFill?.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mainColorPicker?.click(); }});
borderColorFill?.addEventListener("click", () => borderColorPicker?.click());
borderColorFill?.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); borderColorPicker?.click(); }});

document.getElementById("vanillaPresetBtn")?.addEventListener("click", () => {
  vanillaPresetActive = !vanillaPresetActive;
  document.getElementById("vanillaPresetBtn").classList.toggle("preset-active", vanillaPresetActive);
  refreshAllPreviews();
});

document.getElementById("resetBtn")?.addEventListener("click", () => {
  vanillaPresetActive = false;
  document.getElementById("vanillaPresetBtn")?.classList.remove("preset-active");
  currentMainColor = "#ffffff";
  currentBorderColor = "#000000";
  mainColorPicker.value = "#ffffff";
  borderColorPicker.value = "#000000";
  setColorFill(mainColorFill, "#ffffff");
  setColorFill(borderColorFill, "#000000");
  refreshAllPreviews();
});

function randomHexColor() {
  return "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
}

document.getElementById("randomizeBtn")?.addEventListener("click", () => {
  vanillaPresetActive = false;
  document.getElementById("vanillaPresetBtn")?.classList.remove("preset-active");
  const randMain = randomHexColor();
  const randBorder = randomHexColor();
  currentMainColor = randMain;
  currentBorderColor = randBorder;
  mainColorPicker.value = randMain;
  borderColorPicker.value = randBorder;
  setColorFill(mainColorFill, randMain);
  setColorFill(borderColorFill, randBorder);
  refreshAllPreviews();
});

document.getElementById("copyMainBtn")?.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(mainColorPicker.value); }
  catch {} 
  document.getElementById("copyMainBtn").textContent = "Copied";
  setTimeout(() => document.getElementById("copyMainBtn").textContent = "Copy", 1200);
});

document.getElementById("copyBorderBtn")?.addEventListener("click", async () => {
  try { await navigator.clipboard.writeText(borderColorPicker.value); }
  catch {}
  document.getElementById("copyBorderBtn").textContent = "Copied";
  setTimeout(() => document.getElementById("copyBorderBtn").textContent = "Copy", 1200);
});

/* Previews */
const previewNames = ["Inventory", "Enchanting Table", "Loom"];
const previewFiles = ["inventory.png", "enchanting_table.png", "loom.png"];
const slides = [document.getElementById("slide0"), document.getElementById("slide1"), document.getElementById("slide2")];
const canvases = [document.getElementById("canvas0"), document.getElementById("canvas1"), document.getElementById("canvas2")];
const previewLabelEl = document.getElementById("previewLabel");
const rotateBtn = document.getElementById("rotateBtn");
const previewCarousel = document.getElementById("previewCarousel");

let currentIndex = 0;
let images = [new Image(), new Image(), new Image()];
let loaded = [false, false, false];

function loadPreviews() {
  previewFiles.forEach((file, i) => {
    images[i].crossOrigin = "anonymous";
    images[i].src = "preview/" + file;
    images[i].onload = () => { loaded[i] = true; drawPreview(i); };
    images[i].onerror = () => {
      loaded[i] = false;
      const ctx = canvases[i].getContext("2d");
      canvases[i].width = 176; canvases[i].height = 166;
      ctx.fillStyle = "#111"; ctx.fillRect(0,0,176,166);
      ctx.fillStyle = "#ddd"; ctx.font = "14px sans-serif";
      ctx.fillText("Preview missing", 10, 20);
    };
  });
}

function drawPreview(i) {
  if (!loaded[i]) return;
  const canvas = canvases[i];
  const ctx = canvas.getContext("2d");
  canvas.width = 176; canvas.height = 166;
  ctx.clearRect(0, 0, 176, 166);
  ctx.drawImage(images[i], 0, 0, 176, 166, 0, 0, 176, 166);
  const imageData = ctx.getImageData(0, 0, 176, 166);
  applyRecolor(imageData, currentMainColor, currentBorderColor, vanillaPresetActive);
  ctx.putImageData(imageData, 0, 0);
}

function refreshAllPreviews() {
  for (let i = 0; i < 3; i++) drawPreview(i);
}

function setActiveIndex(n) {
  currentIndex = (n + slides.length) % slides.length;
  slides.forEach((s, i) => {
    s.classList.toggle("active", i === currentIndex);
    s.classList.toggle("hidden-left", i < currentIndex && i !== currentIndex);
    s.classList.toggle("hidden-right", i > currentIndex && i !== currentIndex);
  });
  previewLabelEl.textContent = previewNames[currentIndex];
}

function rotatePreview(dir = 1) {
  setActiveIndex(currentIndex + dir);
}

rotateBtn?.addEventListener("click", () => rotatePreview(1));

const SWIPE_THRESHOLD = 40;
let pointerDown = false;
let startX = 0;

previewCarousel?.addEventListener("pointerdown", e => {
  pointerDown = true;
  startX = e.clientX;
  previewCarousel.setPointerCapture(e.pointerId);
});

previewCarousel?.addEventListener("pointerup", e => {
  if (!pointerDown) return;
  pointerDown = false;
  const dx = e.clientX - startX;
  if (dx <= -SWIPE_THRESHOLD) rotatePreview(1);
  else if (dx >= SWIPE_THRESHOLD) rotatePreview(-1);
  try { previewCarousel.releasePointerCapture(e.pointerId); } catch {}
});

previewCarousel?.addEventListener("pointercancel", () => pointerDown = false);
