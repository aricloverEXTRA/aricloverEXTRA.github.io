var classicVersions = [
  "1.12.0","1.12.1","1.12.2",
  "1.16.0","1.16.1","1.16.2","1.16.3","1.16.4","1.16.5",
  "1.18.0","1.18.1","1.18.2",
  "1.19.0","1.19.1","1.19.2","1.19.3","1.19.4",
  "1.20.0","1.20.1","1.20.2","1.20.3","1.20.4","1.20.5","1.20.6",
  "1.21.0","1.21.1","1.21.2","1.21.3","1.21.4","1.21.5","1.21.6","1.21.7","1.21.8","1.21.9","1.21.10","1.21.11"
];

var yearVersions = ["26.1","26.2","26.3","26.4"];

var mcVersionsOrderedAsc = [...classicVersions, ...yearVersions];

var versionFiles = {
  "Mainline (1.19.0+)": {
    "2026.3.24": { file: "Default-Dark-Mode-Expansion-1.19.0+-2026.3.24.zip", changelog: "changelogs/2026.3.24.txt", supportedSpec: "1.19.x-1.21.x, 26.1" },
    "2026.2.1": { file: "Default-Dark-Mode-Expansion-1.19.0+-2026.2.1.zip", changelog: "changelogs/2026.2.1.txt", supportedSpec: "1.19.x-1.21.x, 26.1-snapshot-6" },
    "2026.1.1": { file: "Default-Dark-Mode-Expansion-1.19.0+-2026.1.1.zip", changelog: "changelogs/2026.1.1.txt", supportedSpec: "1.19.x-1.21.x" },
    "2025.10.31": { file: "Default-Dark-Mode-Expansion-1.19.0+-2025.10.31.zip", supportedSpec: "1.19.x-1.21.10" },
    "2025.10.1": { file: "Default-Dark-Mode-Expansion-1.19.0+-2025.10.1.zip", supportedSpec: "1.19.x-1.21.8" },
    "2025.8.1": { file: "Default-Dark-Mode-Expansion-1.19.0+-2025.8.1.zip", supportedSpec: "1.19.x-1.21.8" },
    "2025.7.1": { file: "Default-Dark-Mode-Expansion-1.19.0+-2025.7.1.zip", supportedSpec: "1.19.x-1.21.8" },
    "2025.6.1": { file: "Default-Dark-Mode-Expansion-1.19.0+-2025.6.1.zip", supportedSpec: "1.19.x-1.21.6" },
    "2025.5.1": { file: "Default-Dark-Mode-Expansion-1.19.0+-2025.5.1.zip", supportedSpec: "1.19.x-1.21.5" },
    "2025.4.5": { file: "Default-Dark-Mode-Expansion-1.19.0+-2025.4.5.zip", supportedSpec: "1.19.x-1.21.5" },
    "2025.4.1": { file: "Default-Dark-Mode-Expansion-1.19.0+-2025.4.1.zip", supportedSpec: "1.19.x-1.21.5" },
    "2025.3.25": { file: "Default-Dark-Mode-Expansion-1.19.0+-2025.3.25.zip", supportedSpec: "1.19.x-1.21.5" },
    "2024.11.10": { file: "Default-Dark-Mode-Expansion-1.19.0+-2024.11.10.zip", supportedSpec: "1.19.x-1.21.3" },
    "2024.9.12": { file: "Default-Dark-Mode-Expansion-1.19.0+-2024.9.12.zip", supportedSpec: "1.19.x-1.21.1" }
  },
  "Legacy (1.18.x)": {
    "2025.3.25": { file: "Default-Dark-Mode-Expansion-1.18.0+1.18.2-2025.3.25.zip", changelog: "changelogs/1.18.x-2025.3.25.txt", supportedSpec: "1.18.x" }
  },
  "Legacy (1.16.x)": {
    "2026.2.1": { file: "Default-Dark-Mode-Expansion-1.16.x-2026.2.1.zip", changelog: "changelogs/1.16.x-2026.2.1.txt", supportedSpec: "1.16.x" }
  },
  "Legacy (1.12.x)": {
    "2025.10.31": { file: "Default-Dark-Mode-Expansion-1.12.x-2025.10.31.zip", changelog: "changelogs/1.12.x-2025.10.31.txt", supportedSpec: "1.12.x" }
  }
};
