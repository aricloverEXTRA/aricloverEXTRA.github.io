/* THEME (default light) */
const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const storedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", storedTheme);
themeIcon.textContent = storedTheme === "dark" ? "🌙" : "☀️";

themeToggle.onclick = () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeIcon.textContent = next === "dark" ? "🌙" : "☀️";
};

/* PREVIEW IMAGES */
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

const defaultMainColor = "#ffffff";
const defaultBorderColor = "#000000";

let currentMainColor = defaultMainColor;
let currentBorderColor = defaultBorderColor;

function loadPreviews() {
  previewFiles.forEach((file, i) => {
    images[i].src = "preview/" + file;
    images[i].onload = () => {
      loaded[i] = true;
      drawPreview(i);
    };
  });
}

function hexToRgb(hex) {
  hex = hex.trim();
  if (!hex.startsWith("#")) return null;
  hex = hex.slice(1);
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function drawPreview(i) {
  if (!loaded[i]) return;
  const img = images[i];
  const canvas = canvases[i];
  const ctx = canvas.getContext("2d");

  const size = 256;
  canvas.width = size;
  canvas.height = size;

  ctx.clearRect(0, 0, size, size);
  ctx.drawImage(img, 0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;

  const mainRgb = hexToRgb(currentMainColor) || hexToRgb(defaultMainColor);
  const borderRgb = hexToRgb(currentBorderColor) || hexToRgb(defaultBorderColor);

  for (let p = 0; p < data.length; p += 4) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const a = data[p + 3];
    if (a === 0) continue;

    const brightness = (r + g + b) / 3;

    if (brightness < 50) {
      data[p] = borderRgb.r;
      data[p + 1] = borderRgb.g;
      data[p + 2] = borderRgb.b;
    } else {
      data[p] = (r * mainRgb.r) / 255;
      data[p + 1] = (g * mainRgb.g) / 255;
      data[p + 2] = (b * mainRgb.b) / 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

function refreshAllPreviews() {
  for (let i = 0; i < 3; i++) {
    drawPreview(i);
  }
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

/* COLOR CONTROLS (Preferences) */
const mainColorPicker = document.getElementById("mainColorPicker");
const mainColorHex = document.getElementById("mainColorHex");
const borderColorPicker = document.getElementById("borderColorPicker");
const borderColorHex = document.getElementById("borderColorHex");

const applyBtn = document.getElementById("applyBtn");
const resetBtn = document.getElementById("resetBtn");

function syncColorInputsFromPickers() {
  mainColorHex.value = mainColorPicker.value;
  borderColorHex.value = borderColorPicker.value;
}

mainColorPicker.addEventListener("input", () => {
  mainColorHex.value = mainColorPicker.value;
  currentMainColor = mainColorPicker.value;
  refreshAllPreviews();
});

borderColorPicker.addEventListener("input", () => {
  borderColorHex.value = borderColorPicker.value;
  currentBorderColor = borderColorPicker.value;
  refreshAllPreviews();
});

mainColorHex.addEventListener("change", () => {
  if (!hexToRgb(mainColorHex.value)) {
    mainColorHex.value = currentMainColor;
    return;
  }
  mainColorPicker.value = mainColorHex.value;
  currentMainColor = mainColorHex.value;
  refreshAllPreviews();
});

borderColorHex.addEventListener("change", () => {
  if (!hexToRgb(borderColorHex.value)) {
    borderColorHex.value = currentBorderColor;
    return;
  }
  borderColorPicker.value = borderColorHex.value;
  currentBorderColor = borderColorHex.value;
  refreshAllPreviews();
});

applyBtn.onclick = () => {
  if (!hexToRgb(mainColorHex.value) || !hexToRgb(borderColorHex.value)) return;
  currentMainColor = mainColorHex.value;
  currentBorderColor = borderColorHex.value;
  mainColorPicker.value = currentMainColor;
  borderColorPicker.value = currentBorderColor;
  refreshAllPreviews();
};

resetBtn.onclick = () => {
  currentMainColor = defaultMainColor;
  currentBorderColor = defaultBorderColor;
  mainColorPicker.value = defaultMainColor;
  borderColorPicker.value = defaultBorderColor;
  syncColorInputsFromPickers();
  refreshAllPreviews();
};

syncColorInputsFromPickers();

/* VERSION DATA (used for base + customization) */
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

/* VERSIONS UI (VERTICAL LIST) */
const versionListEl = document.getElementById("versionList");
const versionHint = document.getElementById("versionHint");
const downloadBtn = document.getElementById("downloadBtn");
let selectedVersionKey = null;

function buildVersionList() {
  let html = "";
  for (const group in versionFiles) {
    html += `<div class="version-group-label">${group}</div>`;
    const entries = versionFiles[group];
    for (const label in entries) {
      const key = `${group}::${label}`;
      html += `
        <div class="version-item" data-key="${key}">
          <div class="version-label">${label}</div>
          <div class="version-meta">${entries[label]}</div>
        </div>
      `;
    }
  }
  versionListEl.innerHTML = html;

  const items = Array.from(document.querySelectorAll(".version-item"));
  items.forEach(item => {
    item.addEventListener("click", () => {
      items.forEach(i => i.classList.remove("selected"));
      item.classList.add("selected");
      selectedVersionKey = item.getAttribute("data-key");
      const [group, label] = selectedVersionKey.split("::");
      const file = versionFiles[group][label];
      versionHint.innerHTML = `Selected: <strong>${label}</strong> — File: <code>${file}</code>`;
    });
  });
}

buildVersionList();

function getSelectedVersion() {
  if (!selectedVersionKey) return null;
  const [group, label] = selectedVersionKey.split("::");
  const file = versionFiles[group][label];
  return {
    group,
    label,
    file,
    url: "releases/" + file
  };
}

downloadBtn.onclick = () => {
  const sel = getSelectedVersion();
  if (!sel) {
    versionHint.textContent = "Select a version above first.";
    return;
  }
  window.location.href = sel.url;
};

/* BACKEND-LIKE CUSTOM ZIP GENERATION (IN BROWSER) */
const generateBtn = document.getElementById("generateBtn");
const backendStatus = document.getElementById("backendStatus");

async function recolorPngArrayBuffer(arrayBuffer, mainHex, borderHex) {
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
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const a = data[p + 3];
    if (a === 0) continue;

    const brightness = (r + g + b) / 3;

    if (brightness < 50) {
      data[p] = borderRgb.r;
      data[p + 1] = borderRgb.g;
      data[p + 2] = borderRgb.b;
    } else {
      data[p] = (r * mainRgb.r) / 255;
      data[p + 1] = (g * mainRgb.g) / 255;
      data[p + 2] = (b * mainRgb.b) / 255;
    }
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

generateBtn.onclick = async () => {
  const sel = getSelectedVersion();
  if (!sel) {
    backendStatus.textContent = "Select a base version first.";
    return;
  }

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

    const promises = [];

    zip.forEach((path, file) => {
      if (!file.dir && path.toLowerCase().endsWith(".png")) {
        const p = file.async("arraybuffer").then(async arrayBuffer => {
          const recolored = await recolorPngArrayBuffer(arrayBuffer, mainHex, borderHex);
          newZip.file(path, recolored);
        });
        promises.push(p);
      } else if (!file.dir) {
        const p = file.async("arraybuffer").then(arrayBuffer => {
          newZip.file(path, arrayBuffer);
        });
        promises.push(p);
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
    backendStatus.textContent = "Something went wrong while generating the customized pack.";
  }
};
