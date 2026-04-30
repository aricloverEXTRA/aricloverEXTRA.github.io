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

const yearDropIndexMap = {};
yearVersions.forEach((v, i) => {
  const parts = v.split(".");
  const dropKey = parts[0] + "." + parts[1];
  if (!yearDropIndexMap[dropKey]) yearDropIndexMap[dropKey] = [];
  yearDropIndexMap[dropKey].push(i + classicVersions.length);
});

const snapshotIndexMap = {};
snapshotVersions.forEach((v, i) => {
  const match = v.match(/^26\.(\d+)-snapshot-(\d+)$/);
  if (match) {
    const dropKey = "26." + match[1];
    if (!snapshotIndexMap[dropKey]) snapshotIndexMap[dropKey] = [];
    snapshotIndexMap[dropKey].push(i + classicVersions.length + yearVersions.length);
  }
});

function isClassicVersion(v) { return v.startsWith("1."); }
function isYearVersion(v) { return v.startsWith("26.") && !v.includes("snapshot"); }
function isSnapshotVersion(v) { return v.includes("snapshot"); }

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

  // Handle ranges like "26.1.x-26.2.x"
  let m = spec.match(/^26\.(\d+)\.x-26\.(\d+)\.x$/);
  if (m) {
    const startDrop = parseInt(m[1], 10);
    const endDrop = parseInt(m[2], 10);
    for (let d = startDrop; d <= endDrop; d++) {
      const dropKey = "26." + d;
      yearVersions.forEach(v => {
        if (v.startsWith(dropKey + ".") || v === dropKey) set.add(v);
      });
    }
    return set;
  }

  // Handle single drops like "26.1.x"
  m = spec.match(/^26\.(\d+)\.x$/);
  if (m) {
    const dropKey = "26." + m[1];
    yearVersions.forEach(v => {
      if (v.startsWith(dropKey + ".") || v === dropKey) set.add(v);
    });
    return set;
  }

  // Handle all year versions
  if (spec === "26.x" || spec === "26.x.x") {
    yearVersions.forEach(v => set.add(v));
    return set;
  }

  // Handle single version like "26.1"
  m = spec.match(/^26\.(\d+)$/);
  if (m) {
    const dropKey = "26." + m[1];
    yearVersions.forEach(v => {
      if (v.startsWith(dropKey + ".") || v === dropKey) set.add(v);
    });
    return set;
  }

  return set;
}

function makeSnapshotSupportedSet(spec) {
  const set = new Set();
  if (typeof spec !== "string") return set;

  // Handle ranges like "26.2-snapshot-1-26.2-snapshot-3"
  let m = spec.match(/^26\.(\d+)-snapshot-(\d+)-26\.(\d+)-snapshot-(\d+)$/);
  if (m) {
    const startDrop = parseInt(m[1], 10);
    const endSnap = parseInt(m[2], 10);
    const endDrop = parseInt(m[3], 10);
    
    if (startDrop === endDrop) {
      for (let i = parseInt(m[2], 10); i <= parseInt(m[4], 10); i++) {
        set.add(`26.${startDrop}-snapshot-${i}`);
      }
    }
    return set;
  }

  // Handle single snapshot range like "26.2-snapshot-1-3"
  m = spec.match(/^26\.(\d+)-snapshot-(\d+)-(\d+)$/);
  if (m) {
    const drop = parseInt(m[1], 10);
    const startSnap = parseInt(m[2], 10);
    const endSnap = parseInt(m[3], 10);
    for (let i = startSnap; i <= endSnap; i++) {
      set.add(`26.${drop}-snapshot-${i}`);
    }
    return set;
  }

  // Handle single snapshot like "26.2-snapshot-1"
  m = spec.match(/^26\.(\d+)-snapshot-(\d+)$/);
  if (m) {
    set.add(spec);
    return set;
  }

  return set;
}

function expandSpecToSet(spec) {
  const set = new Set();
  if (!spec) return set;

  const parts = spec.split(",").map(s => s.trim()).filter(Boolean);

  for (const p of parts) {
    if (p.includes("snapshot")) {
      const snapshotSet = makeSnapshotSupportedSet(p);
      snapshotSet.forEach(v => set.add(v));
    } else if (p.startsWith("1.")) {
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
    if (!dropMap.has(drop)) dropMap.set(drop, { versions: [] });
    dropMap.get(drop).versions.push(v);
  }

  const drops = Array.from(dropMap.keys()).sort((a, b) => a - b);
  const out = [];

  for (const drop of drops) {
    const versions = dropMap.get(drop).versions;
    const hasBase = versions.includes(`26.${drop}`);
    const hasHotfixes = versions.some(v => v !== `26.${drop}`);

    if (versions.length === 1 && hasBase) {
      out.push(`26.${drop}`);
    } else if (hasBase && hasHotfixes) {
      out.push(`26.${drop}.x`);
    } else if (hasHotfixes) {
      out.push(...versions);
    }
  }

  return out;
}

function snapshotSetToDisplay(supportedSet) {
  const present = snapshotVersions.filter(v => supportedSet.has(v));
  if (!present.length) return [];

  const dropMap = new Map();
  for (const v of present) {
    const match = v.match(/^26\.(\d+)-snapshot-(\d+)$/);
    if (match) {
      const drop = parseInt(match[1], 10);
      if (!dropMap.has(drop)) dropMap.set(drop, []);
      dropMap.get(drop).push(parseInt(match[2], 10));
    }
  }

  const out = [];
  for (const [drop, snaps] of dropMap) {
    snaps.sort((a, b) => a - b);
    if (snaps.length === 1) {
      out.push(`26.${drop}-snapshot-${snaps[0]}`);
    } else {
      out.push(`26.${drop}-snapshot-${snaps[0]}-${snaps[snaps.length - 1]}`);
    }
  }

  return out;
}

function setToRangesDisplay(supportedSet) {
  const classicSet = new Set();
  const yearSet = new Set();
  const snapshotSet = new Set();

  supportedSet.forEach(v => {
    if (isClassicVersion(v)) classicSet.add(v);
    else if (isSnapshotVersion(v)) snapshotSet.add(v);
    else if (isYearVersion(v)) yearSet.add(v);
  });

  const parts = [];
  const classicParts = classicSetToDisplay(classicSet);
  const yearParts = yearSetToDisplay(yearSet);
  const snapshotParts = snapshotSetToDisplay(snapshotSet);

  if (classicParts.length) parts.push(classicParts.join(", "));
  if (yearParts.length) parts.push(yearParts.join(", "));
  if (snapshotParts.length) parts.push(snapshotParts.join(", "));

  return parts.join(", ");
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
    item.style.display = releaseMatchesFilters(supportedSet) ? "" : "none";
  });
}

function addFilter(spec) { activeFilters.add(spec); applyFilters(); }
function removeFilter(spec) { activeFilters.delete(spec); applyFilters(); }
function clearAllFilters() { activeFilters.clear(); applyFilters(); }
function toggleFilter(spec, enabled) { enabled ? activeFilters.add(spec) : activeFilters.delete(spec); applyFilters(); }
