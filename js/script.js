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
  window.setTimeout(() => {
    document.documentElement.classList.remove("theme-transitioning");
  }, 500);
}
themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  animateThemeSwitch(next);
};
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
const previewLabelEl = document.getElementById("previewLabel");
const rotateBtn = document.getElementById("rotateBtn");
const previewCarousel = document.getElementById("previewCarousel");
let currentIndex = 0;
let images = [new Image(), new Image(), new Image()];
let loaded = [false, false, false];
const defaultMainColor = "#ffffff";
const defaultBorderColor = "#000000";
let currentMainColor = defaultMainColor;
let currentBorderColor = defaultBorderColor;
let vanillaPresetActive = false;
function loadPreviews() {
  previewFiles.forEach((file, i) => {
    images[i].crossOrigin = "anonymous";
    images[i].src = "preview/" + file;
    images[i].onload = () => {
      loaded[i] = true;
      drawPreview(i);
    };
    images[i].onerror = () => {
      loaded[i] = false;
      const ctx = canvases[i].getContext("2d");
      canvases[i].width = 176;
      canvases[i].height = 166;
      ctx.fillStyle = "#111";
      ctx.fillRect(0,0,canvases[i].width,canvases[i].height);
      ctx.fillStyle = "#ddd";
      ctx.font = "14px sans-serif";
      ctx.fillText("Preview missing", 10, 20);
      console.error("Failed to load preview image:", file);
    };
  });
}
const mainColorPicker = document.getElementById("mainColorPicker");
const borderColorPicker = document.getElementById("borderColorPicker");
const mainColorFill = document.getElementById("mainColorFill");
const borderColorFill = document.getElementById("borderColorFill");
function setColorFill(el, hex) {
  if (!el) return;
  el.style.background = hex;
}
if (mainColorPicker) setColorFill(mainColorFill, mainColorPicker.value);
if (borderColorPicker) setColorFill(borderColorFill, borderColorPicker.value);
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
mainColorFill?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); mainColorPicker?.click(); }});
borderColorFill?.addEventListener("click", () => borderColorPicker?.click());
borderColorFill?.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); borderColorPicker?.click(); }});
function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  hex = hex.trim();
  if (!hex.startsWith("#")) return null;
  hex = hex.slice(1);
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  if (Number.isNaN(num)) return null;
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function isPureBlack(r, g, b) {
  return r === 0 && g === 0 && b === 0;
}
function drawPreview(i) {
  if (!images[i] || !loaded[i]) return;
  const img = images[i];
  const canvas = canvases[i];
  const ctx = canvas.getContext("2d");
  const cropWidth = 176;
  const cropHeight = 166;
  const startX = 0;
  const startY = 0;
  canvas.width = cropWidth;
  canvas.height = cropHeight;
  ctx.clearRect(0, 0, cropWidth, cropHeight);
  ctx.drawImage(img, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  const imageData = ctx.getImageData(0, 0, cropWidth, cropHeight);
  const data = imageData.data;
  const mainRgb = hexToRgb(currentMainColor) || hexToRgb(defaultMainColor);
  const borderRgb = hexToRgb(currentBorderColor) || hexToRgb(defaultBorderColor);
  for (let p = 0; p < data.length; p += 4) {
    let r = data[p];
    let g = data[p + 1];
    let b = data[p + 2];
    const a = data[p + 3];
    if (a === 0) continue;
    if (isPureBlack(r, g, b)) {
      r = borderRgb.r;
      g = borderRgb.g;
      b = borderRgb.b;
    } else {
      r = (r * mainRgb.r) / 255;
      g = (g * mainRgb.g) / 255;
      b = (b * mainRgb.b) / 255;
    }
    if (vanillaPresetActive) {
      r = Math.min(255, Math.round(r * 2.0));
      g = Math.min(255, Math.round(g * 2.0));
      b = Math.min(255, Math.round(b * 2.0));
    }
    data[p] = r;
    data[p + 1] = g;
    data[p + 2] = b;
  }
  ctx.putImageData(imageData, 0, 0);
}
function refreshAllPreviews() {
  for (let i = 0; i < 3; i++) drawPreview(i);
}
function setActiveIndex(newIndex) {
  currentIndex = (newIndex + slides.length) % slides.length;
  slides.forEach((slide, i) => {
    slide.classList.remove("active", "hidden-left", "hidden-right");
    if (i === currentIndex) slide.classList.add("active");
    else if (i < currentIndex) slide.classList.add("hidden-left");
    else slide.classList.add("hidden-right");
  });
  previewLabelEl.textContent = previewNames[currentIndex];
}
function rotatePreview(direction = 1) {
  setActiveIndex(currentIndex + direction);
}
rotateBtn?.addEventListener("click", () => rotatePreview(1));
let pointerDown = false;
let startX = 0;
let lastX = 0;
const SWIPE_THRESHOLD = 40;
previewCarousel?.addEventListener("pointerdown", (e) => {
  pointerDown = true;
  startX = e.clientX;
  lastX = startX;
  previewCarousel.setPointerCapture(e.pointerId);
});
previewCarousel?.addEventListener("pointermove", (e) => {
  if (!pointerDown) return;
  lastX = e.clientX;
});
previewCarousel?.addEventListener("pointerup", (e) => {
  if (!pointerDown) return;
  pointerDown = false;
  const dx = e.clientX - startX;
  if (dx <= -SWIPE_THRESHOLD) {
    rotatePreview(1);
  } else if (dx >= SWIPE_THRESHOLD) {
    rotatePreview(-1);
  }
  try { previewCarousel.releasePointerCapture(e.pointerId); } catch {}
});
previewCarousel?.addEventListener("pointercancel", () => { pointerDown = false; });
const vanillaPresetBtn = document.getElementById("vanillaPresetBtn");
const randomizeBtn = document.getElementById("randomizeBtn");
const resetBtn = document.getElementById("resetBtn");
const copyMainBtn = document.getElementById("copyMainBtn");
const copyBorderBtn = document.getElementById("copyBorderBtn");
vanillaPresetBtn.onclick = () => {
  vanillaPresetActive = !vanillaPresetActive;
  if (vanillaPresetActive) vanillaPresetBtn.classList.add("preset-active");
  else vanillaPresetBtn.classList.remove("preset-active");
  refreshAllPreviews();
};
resetBtn.onclick = () => {
  vanillaPresetActive = false;
  vanillaPresetBtn.classList.remove("preset-active");
  currentMainColor = defaultMainColor;
  currentBorderColor = defaultBorderColor;
  mainColorPicker.value = defaultMainColor;
  borderColorPicker.value = defaultBorderColor;
  setColorFill(mainColorFill, defaultMainColor);
  setColorFill(borderColorFill, defaultBorderColor);
  refreshAllPreviews();
};
function randomHexColor() {
  const n = Math.floor(Math.random() * 0xffffff);
  return "#" + n.toString(16).padStart(6, "0");
}
randomizeBtn.onclick = () => {
  vanillaPresetActive = false;
  vanillaPresetBtn.classList.remove("preset-active");
  const randMain = randomHexColor();
  const randBorder = randomHexColor();
  currentMainColor = randMain;
  currentBorderColor = randBorder;
  mainColorPicker.value = randMain;
  borderColorPicker.value = randBorder;
  setColorFill(mainColorFill, randMain);
  setColorFill(borderColorFill, randBorder);
  refreshAllPreviews();
};
copyMainBtn?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(mainColorPicker.value);
    copyMainBtn.textContent = "Copied";
    setTimeout(() => (copyMainBtn.textContent = "Copy"), 1200);
  } catch {
    copyMainBtn.textContent = "Err";
    setTimeout(() => (copyMainBtn.textContent = "Copy"), 1200);
  }
});
copyBorderBtn?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(borderColorPicker.value);
    copyBorderBtn.textContent = "Copied";
    setTimeout(() => (copyBorderBtn.textContent = "Copy"), 1200);
  } catch {
    copyBorderBtn.textContent = "Err";
    setTimeout(() => (copyBorderBtn.textContent = "Copy"), 1200);
  }
});
const classicVersions = [
  "1.12.0","1.12.1","1.12.2",
  "1.16.0","1.16.1","1.16.2","1.16.3","1.16.4","1.16.5",
  "1.18.0","1.18.1","1.18.2",
  "1.19.0","1.19.1","1.19.2","1.19.3","1.19.4",
  "1.20.0","1.20.1","1.20.2","1.20.3","1.20.4","1.20.5","1.20.6",
  "1.21.0","1.21.1","1.21.2","1.21.3","1.21.4","1.21.5","1.21.6","1.21.7","1.21.8","1.21.9","1.21.10","1.21.11"
];

const yearVersions = [
  "26.1",
  "26.2",
  "26.3",
  "26.4"
];

const mcVersionsOrderedAsc = [...classicVersions, ...yearVersions];

const classicMajorIndexMap = {};
classicVersions.forEach((v, idx) => {
  const parts = v.split(".");
  const majorMinor = parts[0] + "." + parts[1];
  if (!classicMajorIndexMap[majorMinor]) classicMajorIndexMap[majorMinor] = { first: idx, last: idx };
  else classicMajorIndexMap[majorMinor].last = idx;
});

const yearDropIndexMap = {};
yearVersions.forEach((v, idx) => {
  const parts = v.split(".");
  const dropKey = parts[0] + "." + parts[1];
  if (!yearDropIndexMap[dropKey]) yearDropIndexMap[dropKey] = [];
  yearDropIndexMap[dropKey].push(idx + classicVersions.length);
});

function isClassicVersion(v) {
  return v.startsWith("1.");
}

function isYearVersion(v) {
  return v.startsWith("26.");
}

function makeClassicSupportedSet(spec) {
  const set = new Set();
  if (typeof spec !== "string") return set;

  let m = spec.match(/^(\d+\.\d+)\.x$/);
  if (m) {
    const major = m[1];
    const range = classicMajorIndexMap[major];
    if (!range) return set;
    for (let i = range.first; i <= range.last; i++) set.add(classicVersions[i]);
    return set;
  }

  m = spec.match(/^(\d+\.\d+)\.x-(\d+\.\d+)\.x$/);
  if (m) {
    const startMajor = m[1];
    const endMajor = m[2];
    const startIdx = classicMajorIndexMap[startMajor]?.first ?? 0;
    const endIdx = classicMajorIndexMap[endMajor]?.last ?? (classicVersions.length - 1);
    for (let i = startIdx; i <= endIdx; i++) set.add(classicVersions[i]);
    return set;
  }

  m = spec.match(/^(\d+\.\d+)\.x-(\d+\.\d+)\.(\d+)$/);
  if (m) {
    const startMajor = m[1];
    const endMajor = m[2];
    const endPatch = parseInt(m[3], 10);
    const startIdx = classicMajorIndexMap[startMajor]?.first ?? 0;

    const endMajorIndices = classicVersions
      .map((v, i) => ({ v, i }))
      .filter(o => o.v.startsWith(endMajor + "."));
    let endIdx = endMajorIndices.find(o => {
      const parts = o.v.split(".");
      return parseInt(parts[2], 10) === endPatch;
    })?.i ?? (classicMajorIndexMap[endMajor]?.last ?? (classicVersions.length - 1));

    for (let i = startIdx; i <= endIdx; i++) set.add(classicVersions[i]);
    return set;
  }

  return set;
}

function makeYearSupportedSet(spec) {
  const set = new Set();
  if (typeof spec !== "string") return set;

  if (spec === "26.x" || spec === "26.x.x") {
    yearVersions.forEach(v => set.add(v));
    return set;
  }

  let m = spec.match(/^26\.(\d+)\.x$/);
  if (m) {
    const dropKey = "26." + m[1];
    const indices = yearDropIndexMap[dropKey] || [];
    indices.forEach(idx => set.add(mcVersionsOrderedAsc[idx]));
    return set;
  }

  m = spec.match(/^26\.(\d+)$/);
  if (m) {
    const dropKey = "26." + m[1];
    const indices = yearDropIndexMap[dropKey] || [];
    indices.forEach(idx => set.add(mcVersionsOrderedAsc[idx]));
    return set;
  }

  m = spec.match(/^26\.(\d+)-26\.(\d+)$/);
  if (m) {
    const startDrop = parseInt(m[1], 10);
    const endDrop = parseInt(m[2], 10);
    for (let d = startDrop; d <= endDrop; d++) {
      const dropKey = "26." + d;
      const indices = yearDropIndexMap[dropKey] || [];
      indices.forEach(idx => set.add(mcVersionsOrderedAsc[idx]));
    }
    return set;
  }

  return set;
}

function expandSpecToSet(spec) {
  const set = new Set();
  if (!spec) return set;

  const parts = spec.split(",").map(s => s.trim()).filter(Boolean);

  for (const p of parts) {
    if (p.startsWith("1.")) {
      const classicSet = makeClassicSupportedSet(p);
      classicSet.forEach(v => set.add(v));
    } else if (p.startsWith("26.")) {
      const yearSet = makeYearSupportedSet(p);
      yearSet.forEach(v => set.add(v));
    }
  }

  return set;
}

function classicSetToDisplay(supportedSet) {
  const out = [];
  const N = classicVersions.length;
  let i = 0;

  while (i < N) {
    const v = classicVersions[i];
    if (!supportedSet.has(v)) { i++; continue; }

    let j = i;
    while (j + 1 < N && supportedSet.has(classicVersions[j + 1])) j++;

    const start = i;
    const end = j;
    const startParts = classicVersions[start].split(".");
    const endParts = classicVersions[end].split(".");
    const startMajor = startParts[0] + "." + startParts[1];
    const endMajor = endParts[0] + "." + endParts[1];
    const startMajorRange = classicMajorIndexMap[startMajor];
    const endMajorRange = classicMajorIndexMap[endMajor];

    if (start === startMajorRange.first && end === endMajorRange.last) {
      if (startMajor === endMajor) out.push(startMajor + ".x");
      else out.push(startMajor + ".x-" + endMajor + ".x");
    } else if (start === end) {
      out.push(classicVersions[start]);
    } else {
      out.push(classicVersions[start] + "-" + classicVersions[end]);
    }

    i = j + 1;
  }

  return out;
}

function yearSetToDisplay(supportedSet) {
  const present = yearVersions.filter(v => supportedSet.has(v));
  if (!present.length) return [];

  const dropMap = new Map();
  for (const v of present) {
    const parts = v.split(".");
    const drop = parseInt(parts[1], 10);
    const isHotfix = parts.length > 2;
    if (!dropMap.has(drop)) dropMap.set(drop, { hasBase: false, hasHotfix: false });
    const info = dropMap.get(drop);
    if (isHotfix) info.hasHotfix = true;
    else info.hasBase = true;
  }

  const drops = Array.from(dropMap.keys()).sort((a, b) => a - b);
  const multipleDrops = drops.length > 1;
  const anyHotfix = drops.some(d => dropMap.get(d).hasHotfix);
  const allDropsHaveHotfix = drops.every(d => dropMap.get(d).hasHotfix);

  if (!multipleDrops) {
    const d = drops[0];
    const info = dropMap.get(d);
    if (info.hasHotfix) return [`26.${d}.x`];
    return [`26.${d}`];
  }

  if (!anyHotfix) {
    const first = drops[0];
    const last = drops[drops.length - 1];
    return [`26.${first}-26.${last}`];
  }

  if (allDropsHaveHotfix) return ["26.x.x"];

  const parts = [];
  for (const d of drops) {
    const info = dropMap.get(d);
    if (info.hasHotfix) parts.push(`26.${d}.x`);
    else parts.push(`26.${d}`);
  }
  return parts;
}

function setToRangesDisplay(supportedSet) {
  const classicSet = new Set();
  const yearSet = new Set();

  supportedSet.forEach(v => {
    if (isClassicVersion(v)) classicSet.add(v);
    else if (isYearVersion(v)) yearSet.add(v);
  });

  const parts = [];
  const classicParts = classicSetToDisplay(classicSet);
  const yearParts = yearSetToDisplay(yearSet);

  if (classicParts.length) parts.push(classicParts.join(", "));
  if (yearParts.length) parts.push(yearParts.join(", "));

  return parts.join(", ");
}

const versionFiles = {
  "Mainline (1.19.0+)": {
    "2026.1.1": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2026.1.1.zip",
      changelog: "changelogs/2026.1.1.txt",
      supportedSpec: "1.19.x-1.21.x, 26.1-snapshot-1"
    },
    "2025.10.31": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2025.10.31.zip",
      changelog: "changelogs/2025.10.31.txt",
      supportedSpec: "1.19.x-1.21.10"
    },
    "2025.10.1": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2025.10.1.zip",
      supportedSpec: "1.19.x-1.21.8"
    },
    "2025.8.1": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2025.8.1.zip",
      supportedSpec: "1.19.x-1.21.8"
    },
    "2025.7.1": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2025.7.1.zip",
      supportedSpec: "1.19.x-1.21.8"
    },
    "2025.6.1": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2025.6.1.zip",
      supportedSpec: "1.19.x-1.21.6"
    },
    "2025.5.1": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2025.5.1.zip",
      supportedSpec: "1.19.x-1.21.5"
    },
    "2025.4.5": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2025.4.5.zip",
      supportedSpec: "1.19.x-1.21.5"
    },
    "2025.4.1": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2025.4.1.zip",
      supportedSpec: "1.19.x-1.21.5"
    },
    "2025.3.25": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2025.3.25.zip",
      supportedSpec: "1.19.x-1.21.5"
    },
    "2024.11.10": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2024.11.10.zip",
      supportedSpec: "1.19.x-1.21.3"
    },
    "2024.9.12": {
      file: "Default-Dark-Mode-Expansion-1.19.0+-2024.9.12.zip",
      supportedSpec: "1.19.x-1.21.1"
    }
  },
  "Legacy (1.18.2)": {
    "2025.3.25": {
      file: "Default-Dark-Mode-Expansion-1.18.0+1.18.2-2025.3.25.zip",
      changelog: "changelogs/1.18.x-2025.3.25.txt",
      supportedSpec: "1.18.x"
    }
  },
  "Legacy (1.16.x)": {
    "2026.2.1 (unreleased)": {
      file: "Default-Dark-Mode-Expansion-1.16.x-2026.2.1.zip",
      supportedSpec: "1.16.x"
    }
  },
  "Legacy (1.12.2)": {
    "2025.10.31": {
      file: "Default-Dark-Mode-Expansion-1.12.x-2025.10.31.zip",
      changelog: "changelogs/1.12.x-2025.10.31.txt",
      supportedSpec: "1.12.x"
    }
  }
};

let activeFilters = new Set();

function expandFilterToSet(filterSpec) {
  return expandSpecToSet(filterSpec);
}

function releaseMatchesFilters(releaseSupportedSet) {
  if (activeFilters.size === 0) return true;

  for (const filter of activeFilters) {
    const filterSet = expandFilterToSet(filter);
    let intersects = false;
    for (const v of releaseSupportedSet) {
      if (filterSet.has(v)) {
        intersects = true;
        break;
      }
    }
    if (!intersects) return false;
  }

  return true;
}

function applyFilters() {
  const items = document.querySelectorAll(".version-item");

  items.forEach(item => {
    const key = item.getAttribute("data-key");
    const [group, label] = key.split("::");
    const entry = versionFiles[group][label];

    const supportedSet = expandSpecToSet(entry.supportedSpec);

    if (releaseMatchesFilters(supportedSet)) item.style.display = "";
    else item.style.display = "none";
  });
}

function addFilter(filterSpec) {
  activeFilters.add(filterSpec);
  applyFilters();
}

function removeFilter(filterSpec) {
  activeFilters.delete(filterSpec);
  applyFilters();
}

function clearAllFilters() {
  activeFilters.clear();
  applyFilters();
}

function toggleFilter(filterSpec, enabled) {
  if (enabled) activeFilters.add(filterSpec);
  else activeFilters.delete(filterSpec);
  applyFilters();
}

const versionListEl = document.getElementById("versionList");
const versionHint = document.getElementById("versionHint");
const downloadBtn = document.getElementById("downloadBtn");
const generateBtn = document.getElementById("generateBtn");
const backendStatus = document.getElementById("backendStatus");
let selectedVersionKey = null;

function buildVersionList() {
  if (!versionListEl) return;
  versionListEl.innerHTML = "";

  for (const group in versionFiles) {
    const groupLabel = document.createElement("div");
    groupLabel.className = "version-group-label small muted";
    groupLabel.textContent = group;
    versionListEl.appendChild(groupLabel);

    const entries = versionFiles[group];
    for (const label in entries) {
      const entry = entries[label];
      const key = `${group}::${label}`;

      const item = document.createElement("div");
      item.className = "version-item";
      item.setAttribute("data-key", key);

      const left = document.createElement("div");
      left.className = "version-left";

      const titleWrap = document.createElement("div");
      titleWrap.style.display = "flex";
      titleWrap.style.alignItems = "center";
      titleWrap.style.gap = "8px";

      const title = document.createElement("div");
      title.className = "version-label";
      title.textContent = label;
      titleWrap.appendChild(title);

      const supportedSet = expandSpecToSet(entry.supportedSpec);
      const compatText = supportedSet.size ? setToRangesDisplay(supportedSet) : "";
      if (compatText) {
        const compatEl = document.createElement("div");
        compatEl.className = "version-compat";
        compatEl.textContent = compatText;
        titleWrap.appendChild(compatEl);
      }

      const metaWrap = document.createElement("div");
      metaWrap.style.display = "flex";
      metaWrap.style.alignItems = "center";
      metaWrap.style.gap = "8px";

      const meta = document.createElement("div");
      meta.className = "version-meta";
      meta.textContent = entry.file;
      metaWrap.appendChild(meta);

      left.appendChild(titleWrap);
      left.appendChild(metaWrap);

      const right = document.createElement("div");
      right.className = "version-right";

      if (entry.changelog) {
        const btn = document.createElement("button");
        btn.className = "changelog-btn";
        btn.setAttribute("data-changelog", entry.changelog);
        btn.setAttribute("data-version", label);
        btn.title = "View changelog";
        btn.innerHTML = "Changelog";
        btn.addEventListener("click", async (e) => {
          e.stopPropagation();
          openChangelogForBtn(entry.changelog, label);
        });
        right.appendChild(btn);
      } else {
        const gap = document.createElement("div");
        gap.style.width = "72px";
        right.appendChild(gap);
      }
      item.appendChild(left);
      item.appendChild(right);
      item.addEventListener("click", () => {
        const all = Array.from(document.querySelectorAll(".version-item"));
        all.forEach(i => i.classList.remove("selected"));
        item.classList.add("selected");
        selectedVersionKey = key;
        const [g, l] = key.split("::");
        const ent = versionFiles[g][l];
        versionHint.innerHTML = `Selected: <strong>${l}</strong> — <code>${ent.file}</code>`;
      });
      versionListEl.appendChild(item);
    }
  }
}
buildVersionList();
function getSelectedVersion() {
  if (!selectedVersionKey) return null;
  const [group, label] = selectedVersionKey.split("::");
  const entry = versionFiles[group][label];
  return { group, label, file: entry.file, url: "releases/" + entry.file, changelog: entry.changelog || null };
}
downloadBtn.onclick = () => {
  const sel = getSelectedVersion();
  if (!sel) {
    versionHint.textContent = "Select a version above first.";
    return;
  }
  window.location.href = sel.url;
};
const changelogModal = document.getElementById("changelogModal");
const changelogTitle = document.getElementById("changelogTitle");
const changelogText = document.getElementById("changelogText");
const closeChangelog = document.getElementById("closeChangelog");
const changelogDownload = document.getElementById("changelogDownload");
const copyChangelog = document.getElementById("copyChangelog");
function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (m) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[m]);
}
function linkify(text) {
  return escapeHtml(text).replace(/(https?:\/\/[^\s)]+)(\)|\s|$)/g, (m, url, trailing) => {
    const t = trailing || "";
    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>${t}`;
  });
}
async function openChangelogForBtn(url, version) {
  changelogTitle.textContent = `Changelog — ${version}`;
  changelogText.textContent = "Loading...";
  changelogDownload.href = url;
  changelogDownload.style.display = "inline-block";
  changelogDownload.textContent = "Open raw";
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error("Missing changelog");
    const text = await resp.text();
    const md = text.replace(/\r\n/g, "\n");
    const html = marked.parse(md);
    const safe = DOMPurify.sanitize(html);
    changelogText.innerHTML = safe;
  } catch {
    changelogText.textContent = "No changelog available.";
    changelogDownload.style.display = "none";
  }
  showChangelogModal();
}
function showChangelogModal() {
  changelogModal.setAttribute("aria-hidden", "false");
  changelogModal.style.display = "flex";
  closeChangelog.focus();
  document.addEventListener("keydown", modalKeydown);
}
function hideChangelogModal() {
  changelogModal.setAttribute("aria-hidden", "true");
  changelogModal.style.display = "none";
  document.removeEventListener("keydown", modalKeydown);
}
function modalKeydown(e) {
  if (e.key === "Escape") hideChangelogModal();
}
closeChangelog.onclick = hideChangelogModal;
changelogModal.onclick = (e) => { if (e.target === changelogModal) hideChangelogModal(); };
copyChangelog.onclick = async () => {
  try {
    await navigator.clipboard.writeText(changelogText.innerText || changelogText.textContent);
    copyChangelog.textContent = "Copied";
    setTimeout(() => (copyChangelog.textContent = "Copy"), 1200);
  } catch {
    copyChangelog.textContent = "Err";
    setTimeout(() => (copyChangelog.textContent = "Copy"), 1200);
  }
};
async function recolorPngArrayBuffer(arrayBuffer, mainHex, borderHex, vanillaMode) {
  const blob = new Blob([arrayBuffer], { type: "image/png" });
  const bitmap = await createImageBitmap(blob);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const mainRgb = hexToRgb(mainHex) || hexToRgb(defaultMainColor);
  const borderRgb = hexToRgb(borderHex) || hexToRgb(defaultBorderColor);
  for (let p = 0; p < data.length; p += 4) {
    let r = data[p];
    let g = data[p + 1];
    let b = data[p + 2];
    const a = data[p + 3];
    if (a === 0) continue;
    if (isPureBlack(r, g, b)) {
      r = borderRgb.r;
      g = borderRgb.g;
      b = borderRgb.b;
    } else {
      r = (r * mainRgb.r) / 255;
      g = (g * mainRgb.g) / 255;
      b = (b * mainRgb.b) / 255;
    }
    if (vanillaMode) {
      r = Math.min(255, Math.round(r * 2.0));
      g = Math.min(255, Math.round(g * 2.0));
      b = Math.min(255, Math.round(b * 2.0));
    }
    data[p] = r;
    data[p + 1] = g;
    data[p + 2] = b;
  }
  ctx.putImageData(imageData, 0, 0);
  return new Promise(resolve => {
    canvas.toBlob(b => {
      const fr = new FileReader();
      fr.onload = () => resolve(new Uint8Array(fr.result));
      fr.readAsArrayBuffer(b);
    }, "image/png");
  });
}
async function generateCustomizedPack() {
  const sel = getSelectedVersion();
  if (!sel) {
    backendStatus.textContent = "Select a base version first.";
    return;
  }
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  backendStatus.textContent = "Downloading base pack...";
  try {
    const resp = await fetch(sel.url);
    if (!resp.ok) throw new Error("Download failed");
    const buf = await resp.arrayBuffer();
    backendStatus.textContent = "Recoloring textures in the browser...";
    const zip = await JSZip.loadAsync(buf);
    const newZip = new JSZip();
    const mainHex = currentMainColor;
    const borderHex = currentBorderColor;
    const vanillaMode = vanillaPresetActive;
    const files = [];
    zip.forEach((path, file) => files.push({ path, file }));
    const promises = files.map(async ({ path, file }) => {
      if (!file.dir && path.toLowerCase().endsWith(".png")) {
        const arrayBuffer = await file.async("arraybuffer");
        const recolored = await recolorPngArrayBuffer(arrayBuffer, mainHex, borderHex, vanillaMode);
        newZip.file(path, recolored);
      } else if (!file.dir) {
        const arrayBuffer = await file.async("arraybuffer");
        newZip.file(path, arrayBuffer);
      }
    });
    await Promise.all(promises);
    backendStatus.textContent = "Packing customized .zip...";
    const outBlob = await newZip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(outBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sel.file.replace(".zip", "") + "-customized.zip";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    backendStatus.textContent = "Customized pack generated.";
  } catch (e) {
    console.error(e);
    backendStatus.textContent = "Something went wrong while generating the customized pack.";
    alert("Failed to generate pack — check the console for details.");
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate customized pack";
  }
}
generateBtn.onclick = generateCustomizedPack;
loadPreviews();
setActiveIndex(currentIndex);
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const sel = getSelectedVersion();
    if (sel && sel.changelog) {
      openChangelogForBtn(sel.changelog, sel.label);
    }
  }
});
