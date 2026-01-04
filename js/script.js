/* ------------------------------------------------ */
/* THEME TOGGLE */
/* ------------------------------------------------ */
const themeToggle = document.getElementById("themeToggle");
document.documentElement.setAttribute("data-theme", localStorage.getItem("theme") || "dark");

themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
};

/* ------------------------------------------------ */
/* PREVIEW IMAGES */
/* ------------------------------------------------ */
const previewNames = ["Inventory", "Enchanting Table", "Loom"];
const previewFiles = ["inventory.png", "enchanting_table.png", "loom.png"];

const slides = [
  document.getElementById("slide0"),
  document.getElementById("slide1"),
  document.getElementById("slide2")
];

const canvases = [
  document.getElementById("canvas0"),
  document.getElementById("canvas1"),
  document.getElementById("canvas2")
];

const previewNameEl = document.getElementById("previewName");

let currentIndex = 0;
let images = [new Image(), new Image(), new Image()];
let loaded = [false, false, false];

function loadPreviews() {
  previewFiles.forEach((file, i) => {
    images[i].src = "preview/" + file;
    images[i].onload = () => {
      loaded[i] = true;
      drawPreview(i);
    };
  });
}

function drawPreview(i) {
  if (!loaded[i]) return;
  const img = images[i];
  const canvas = canvases[i];
  const ctx = canvas.getContext("2d");

  canvas.width = img.width;
  canvas.height = img.height;

  ctx.drawImage(img, 0, 0);
}

function rotatePreview() {
  currentIndex = (currentIndex + 1) % 3;

  slides.forEach((slide, i) => {
    slide.classList.remove("active", "hidden-left", "hidden-right");
    if (i === currentIndex) slide.classList.add("active");
    else if (i < currentIndex) slide.classList.add("hidden-left");
    else slide.classList.add("hidden-right");
  });

  previewNameEl.textContent = previewNames[currentIndex];
}

loadPreviews();
setInterval(rotatePreview, 30000);

/* ------------------------------------------------ */
/* VERSION SELECT */
/* ------------------------------------------------ */
const versionSelect = document.getElementById("versionSelect");
const versionHint = document.getElementById("versionHint");
const downloadBtn = document.getElementById("downloadBtn");

const versionFiles = {
  "Mainline (1.19.0+)": {
    "2026.1.1": "Default-Dark-Mode-Expansion-1.19.0+-2026.1.1.zip",
    "2025.10.31": "Default-Dark-Mode-Expansion-1.19.0+-2025.10.31.zip",
    "2025.10.1": "Default-Dark-Mode-Expansion-1.19.0+-2025.10.1.zip",
    "2025.8.1": "Default-Dark-Mode-Expansion-1.19.0+-2025.8.1.zip",
    "2025.7.1": "Default-Dark-Mode-Expansion-1.19.0+-2025.7.1.zip",
    "2025.6.1": "Default-Dark-Mode-Expansion-1.19.0+-2025.6.1.zip",
    "2025.5.1": "Default-Dark-Mode-Expansion-1.19.0+-2025.5.1.zip",
    "2025.4.5": "Default-Dark-Mode-Expansion-1.19.0+-2025.4.5.zip",
    "2025.4.1": "Default-Dark-Mode-Expansion-1.19.0+-2025.4.1.zip",
    "2025.3.25": "Default-Dark-Mode-Expansion-1.19.0+-2025.3.25.zip"
  },

  "Legacy (1.18.2)": {
    "2025.3.25": "Default-Dark-Mode-Expansion-1.18.0+1.18.2-2025.3.25.zip"
  },

  "Legacy (1.12.2)": {
    "2025.10.31": "Default-Dark-Mode-Expansion-1.12.x-2025.10.31.zip"
  }
};

function buildVersionOptions() {
  let html = "";
  for (const group in versionFiles) {
    html += `<optgroup label="${group}">`;
    for (const label in versionFiles[group]) {
      html += `<option value="${group}::${label}">${label}</option>`;
    }
    html += `</optgroup>`;
  }
  versionSelect.innerHTML = html;
}

buildVersionOptions();

function getSelectedVersion() {
  const val = versionSelect.value;
  if (!val.includes("::")) return null;
  const [group, label] = val.split("::");
  return {
    label,
    file: versionFiles[group][label],
    url: "releases/" + versionFiles[group][label]
  };
}

versionSelect.onchange = () => {
  const sel = getSelectedVersion();
  if (!sel) return;
  versionHint.innerHTML = `Selected: <strong>${sel.label}</strong> — File: <code>${sel.file}</code>`;
};

downloadBtn.onclick = () => {
  const sel = getSelectedVersion();
  if (!sel) return;
  window.location.href = sel.url;
};
