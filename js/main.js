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

    for (const label in versionFiles[group]) {
      const entry = versionFiles[group][label];
      const key = `${group}::${label}`;

      const item = document.createElement("div");
      item.className = "version-item";
      item.dataset.key = key;

      const left = document.createElement("div");
      left.className = "version-left";

      const titleWrap = document.createElement("div");
      titleWrap.style.cssText = "display:flex;align-items:center;gap:8px";

      const title = document.createElement("div");
      title.className = "version-label";
      title.textContent = label;
      titleWrap.appendChild(title);

      const supportedSet = expandSpecToSet(entry.supportedSpec);
      if (supportedSet.size) {
        const compat = document.createElement("div");
        compat.className = "version-compat";
        compat.textContent = setToRangesDisplay(supportedSet);
        titleWrap.appendChild(compat);
      }

      const meta = document.createElement("div");
      meta.className = "version-meta";
      meta.textContent = entry.file;

      left.appendChild(titleWrap);
      left.appendChild(meta);

      const right = document.createElement("div");
      right.className = "version-right";

      if (entry.changelog) {
        const btn = document.createElement("button");
        btn.className = "changelog-btn";
        btn.textContent = "Changelog";
        btn.title = "View changelog";
        btn.onclick = e => { e.stopPropagation(); openChangelog(entry.changelog, label); };
        right.appendChild(btn);
      } else {
        right.style.width = "72px";
      }

      item.appendChild(left);
      item.appendChild(right);

      item.onclick = () => {
        document.querySelectorAll(".version-item").forEach(i => i.classList.remove("selected"));
        item.classList.add("selected");
        selectedVersionKey = key;
        const ent = versionFiles[group][label];
        versionHint.innerHTML = `Selected: <strong>${label}</strong> — <code>${ent.file}</code>`;
      };

      versionListEl.appendChild(item);
    }
  }
}

buildVersionList();

function getSelectedVersion() {
  if (!selectedVersionKey) return null;
  const [group, label] = selectedVersionKey.split("::");
  const entry = versionFiles[group][label];
  return { file: entry.file, url: "releases/" + entry.file, changelog: entry.changelog || null, label };
}

downloadBtn.onclick = () => {
  const sel = getSelectedVersion();
  if (!sel) { versionHint.textContent = "Select a version above first."; return; }
  window.location.href = sel.url;
};

/* Changelog modal */
const changelogModal = document.getElementById("changelogModal");
const changelogTitle = document.getElementById("changelogTitle");
const changelogText = document.getElementById("changelogText");
const closeChangelog = document.getElementById("closeChangelog");
const changelogDownload = document.getElementById("changelogDownload");
const copyChangelog = document.getElementById("copyChangelog");

async function openChangelog(url, version) {
  changelogTitle.textContent = `Changelog — ${version}`;
  changelogText.textContent = "Loading...";
  changelogDownload.href = url;
  changelogDownload.style.display = "inline-block";

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw 0;
    const md = (await resp.text()).replace(/\r\n/g, "\n");
    changelogText.innerHTML = DOMPurify.sanitize(marked.parse(md));
  } catch {
    changelogText.textContent = "No changelog available.";
    changelogDownload.style.display = "none";
  }
  changelogModal.style.display = "flex";
  changelogModal.setAttribute("aria-hidden", "false");
  closeChangelog.focus();
}

function hideChangelog() {
  changelogModal.style.display = "none";
  changelogModal.setAttribute("aria-hidden", "true");
}

closeChangelog.onclick = hideChangelog;
changelogModal.onclick = e => { if (e.target === changelogModal) hideChangelog(); };
document.addEventListener("keydown", e => { if (e.key === "Escape") hideChangelog(); });

copyChangelog.onclick = async () => {
  try { await navigator.clipboard.writeText(changelogText.innerText); copyChangelog.textContent = "Copied"; }
  catch { copyChangelog.textContent = "Err"; }
  setTimeout(() => copyChangelog.textContent = "Copy", 1200);
};

/* Generator */
async function recolorPngArrayBuffer(buf) {
  const bitmap = await createImageBitmap(new Blob([buf]));
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  applyRecolor(imageData, currentMainColor, currentBorderColor, vanillaPresetActive);
  ctx.putImageData(imageData, 0, 0);
  return new Promise(resolve => canvas.toBlob(b => {
    const fr = new FileReader();
    fr.onload = () => resolve(new Uint8Array(fr.result));
    fr.readAsArrayBuffer(b);
  }, "image/png"));
}

async function generateCustomizedPack() {
  const sel = getSelectedVersion();
  if (!sel) { backendStatus.textContent = "Select a base version first."; return; }

  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  backendStatus.textContent = "Downloading base pack...";

  try {
    const resp = await fetch(sel.url);
    if (!resp.ok) throw 0;
    const buf = await resp.arrayBuffer();
    backendStatus.textContent = "Recoloring textures...";

    const zip = await JSZip.loadAsync(buf);
    const newZip = new JSZip();

    const tasks = [];
    zip.forEach((path, file) => {
      if (file.dir) return;
      tasks.push(file.async("arraybuffer").then(data => {
        if (path.toLowerCase().endsWith(".png")) {
          return recolorPngArrayBuffer(data).then(recolored => newZip.file(path, recolored));
        }
        newZip.file(path, data);
      }));
    });

    await Promise.all(tasks);
    backendStatus.textContent = "Packing customized .zip...";
    const blob = await newZip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = sel.file.replace(".zip", "") + "-customized.zip";
    a.click();
    URL.revokeObjectURL(url);
    backendStatus.textContent = "Customized pack generated.";
  } catch (e) {
    console.error(e);
    backendStatus.textContent = "Generation failed.";
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate customized pack";
  }
}

generateBtn.onclick = generateCustomizedPack;

/* Init */
loadPreviews();
setActiveIndex(0);

document.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    const sel = getSelectedVersion();
    if (sel?.changelog) openChangelog(sel.changelog, sel.label);
  }
});
