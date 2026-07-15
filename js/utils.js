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

const classicMajorIndexMap = {};
classicVersions.forEach((v, i) => {
  const parts = v.split(".");
  const majorMinor = parts[0] + "." + parts[1];
  if (!classicMajorIndexMap[majorMinor]) classicMajorIndexMap[majorMinor] = { first: i, last: i };
  else classicMajorIndexMap[majorMinor].last = i;
});

function isClassicVersion(v) { return v.startsWith("1."); }
function isSnapshot(v) { return v.includes("snapshot"); }

function makeClassicSupportedSet(spec) {
  const set = new Set();
  if (typeof spec !== "string") return set;

  // Handle range like "1.19.0-1.19.4"
  let m = spec.match(/^(\d+\.\d+\.\d+)-(\d+\.\d+\.\d+)$/);
  if (m) {
    const startVersion = m[1];
    const endVersion = m[2];
    const startIdx = classicVersions.indexOf(startVersion);
    const endIdx = classicVersions.indexOf(endVersion);
    if (startIdx !== -1 && endIdx !== -1) {
      for (let i = startIdx; i <= endIdx; i++) set.add(classicVersions[i]);
    }
    return set;
  }

  // Handle range like "1.19.x-1.21.x"
  m = spec.match(/^(\d+\.\d+)\.x-(\d+\.\d+)\.x$/);
  if (m) {
    const startMajor = m[1];
    const endMajor = m[2];
    const startIdx = classicMajorIndexMap[startMajor]?.first ?? 0;
    const endIdx = classicMajorIndexMap[endMajor]?.last ?? (classicVersions.length - 1);
    for (let i = startIdx; i <= endIdx; i++) set.add(classicVersions[i]);
    return set;
  }

  // Handle range like "1.19.x-1.21.10"
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

  // Handle major.minor.x like "1.19.x"
  m = spec.match(/^(\d+\.\d+)\.x$/);
  if (m) {
    const major = m[1];
    const range = classicMajorIndexMap[major];
    if (!range) return set;
    for (let i = range.first; i <= range.last; i++) set.add(classicVersions[i]);
    return set;
  }

  // Handle exact version like "1.19.0"
  if (classicVersions.includes(spec)) {
    set.add(spec);
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

function setToRangesDisplay(supportedSet) {
  const classicSet = new Set();

  supportedSet.forEach(v => {
    if (isClassicVersion(v)) classicSet.add(v);
  });

  const classicParts = classicSetToDisplay(classicSet);
  return classicParts.join(", ");
}

var activeFilters = new Set();

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
    const shouldShow = releaseMatchesFilters(supportedSet);
    item.style.display = shouldShow ? "" : "none";
    
    // Smooth animation for showing/hiding
    if (shouldShow) {
      item.style.animation = "slideUp 0.3s ease-out";
    }
  });
}

function addFilter(spec) { activeFilters.add(spec); applyFilters(); }
function removeFilter(spec) { activeFilters.delete(spec); applyFilters(); }
function clearAllFilters() { activeFilters.clear(); applyFilters(); }
function toggleFilter(spec, enabled) { enabled ? activeFilters.add(spec) : activeFilters.delete(spec); applyFilters(); }
