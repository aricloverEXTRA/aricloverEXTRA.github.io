function hexToRgb(hex) {
  if (!hex || typeof hex !== "string") return null;
  hex = hex.trim().slice(1);
  if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
  if (hex.length !== 6) return null;
  const num = parseInt(hex, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function isPureBlack(r, g, b) {
  return r === 0 && g === 0 && b === 0;
}

function applyRecolor(imageData, mainHex, borderHex, vanillaMode) {
  const data = imageData.data;
  const mainRgb = hexToRgb(mainHex) || { r: 255, g: 255, b: 255 };
  const borderRgb = hexToRgb(borderHex) || { r: 0, g: 0, b: 0 };

  for (let p = 0; p < data.length; p += 4) {
    let r = data[p], g = data[p + 1], b = data[p + 2];
    const a = data[p + 3];
    if (a === 0) continue;
    if (isPureBlack(r, g, b)) {
      r = borderRgb.r; g = borderRgb.g; b = borderRgb.b;
    } else {
      r = (r * mainRgb.r) / 255;
      g = (g * mainRgb.g) / 255;
      b = (b * mainRgb.b) / 255;
    }
    if (vanillaMode) {
      r = Math.min(255, Math.round(r * 2));
      g = Math.min(255, Math.round(g * 2));
      b = Math.min(255, Math.round(b * 2));
    }
    data[p] = r; data[p + 1] = g; data[p + 2] = b;
  }
}

/* Version spec parsing (unchanged from original) */
const classicMajorIndexMap = {};
classicVersions.forEach((v, i) => {
  const parts = v.split(".");
  const majorMinor = parts[0] + "." + parts[1];
  if (!classicMajorIndexMap[majorMinor]) classicMajorIndexMap[majorMinor] = { first: i, last: i };
  else classicMajorIndexMap[majorMinor].last = i;
});

const yearDropIndexMap = {};
yearVersions.forEach((v, i) => {
  const parts = v.split(".");
  const dropKey = parts[0] + "." + parts[1];
  if (!yearDropIndexMap[dropKey]) yearDropIndexMap[dropKey] = [];
  yearDropIndexMap[dropKey].push(i + classicVersions.length);
});

function isClassicVersion(v) { return v.startsWith("1."); }
function isYearVersion(v) { return v.startsWith("26."); }

function makeClassicSupportedSet(spec) { /* full original function body */ }
function makeYearSupportedSet(spec) { /* full original function body */ }
function expandSpecToSet(spec) { /* full original function body */ }
function classicSetToDisplay(supportedSet) { /* full original function body */ }
function yearSetToDisplay(supportedSet) { /* full original function body */ }
function setToRangesDisplay(supportedSet) { /* full original function body */ }

let activeFilters = new Set();

function releaseMatchesFilters(releaseSupportedSet) {
  if (activeFilters.size === 0) return true;
  for (const filter of activeFilters) {
    const filterSet = expandSpecToSet(filter);
    if (![...releaseSupportedSet].some(v => filterSet.has(v))) return false;
  }
  return true;
}

function applyFilters() {
  document.querySelectorAll(".version-item").forEach(item => {
    const key = item.getAttribute("data-key");
    const [group, label] = key.split("::");
    const entry = versionFiles[group][label];
    const supportedSet = expandSpecToSet(entry.supportedSpec);
    item.style.display = releaseMatchesFilters(supportedSet) ? "" : "none";
  });
}

function addFilter(spec) { activeFilters.add(spec); applyFilters(); }
function removeFilter(spec) { activeFilters.delete(spec); applyFilters(); }
function clearAllFilters() { activeFilters.clear(); applyFilters(); }
function toggleFilter(spec, enabled) { enabled ? activeFilters.add(spec) : activeFilters.delete(spec); applyFilters(); }
