// ==UserScript==
// @name         Torn Stock Vault – Block Goals
// @namespace    https://github.com/sLurpiixD/torn-stock-vault
// @version      0.3.8
// @description  Build stock blocks with a share of each deposit, protect goal shares, and preview withdrawal gains or losses after fees in Torn.
// @author       sLurpiixD
// Original Smart Stock Vault by Noobler: https://greasyfork.org/en/scripts/564798-smart-stock-vault
// @homepageURL  https://github.com/sLurpiixD/torn-stock-vault-releases
// @supportURL   https://github.com/sLurpiixD/torn-stock-vault-releases/issues
// @match        https://www.torn.com/page.php?sid=stocks*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @connect      tornsy.com
// @connect      api.torn.com
// @run-at       document-idle
// @license      MIT
// @downloadURL  https://raw.githubusercontent.com/sLurpiixD/torn-stock-vault-releases/main/torn-stock-vault.user.js
// @updateURL    https://raw.githubusercontent.com/sLurpiixD/torn-stock-vault-releases/main/torn-stock-vault.user.js
// ==/UserScript==


(() => {
  // src/shared/theme.js
  var tokens = {
    accent: "#caa14a",
    accentMuted: "rgba(202, 161, 74, 0.35)",
    accentSubtle: "rgba(202, 161, 74, 0.12)",
    accentText: "#f0e3c0",
    panelBg: "linear-gradient(180deg, #23252b, #1b1d22)",
    panelHeaderBg: "linear-gradient(180deg, #2c2f37, #23252b)",
    panelBorder: "#34373f",
    surface: "#15161a",
    text: "#d7d9de",
    textMuted: "#8a8d96",
    textDim: "#71747d",
    success: "#6fcf86",
    successBg: "#16341f",
    successBorder: "#2c6b3c",
    warning: "#ffd966",
    warningBg: "#332b13",
    warningBorder: "#6b5a1f",
    danger: "#ff6b6b",
    dangerBg: "#341818",
    dangerBorder: "#6b2c2c",
    info: "#8dbdf0",
    infoBg: "#15263d",
    infoBorder: "#2c4f7b",
    hover: "#d8b25c",
    font: "'Trebuchet MS', Verdana, sans-serif",
    radius: "8px",
    shadow: "0 2px 10px rgba(0, 0, 0, 0.35)",
    statDex: "#8a7ff0",
    statDef: "#e07a4f",
    statStr: "#3fae84",
    statSpd: "#4a97e6"
  };
  var STYLE_ID = "hf-torn-theme";
  function injectStyles(scopeClass = "hf-torn") {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const css = `
    .${scopeClass} {
      --hf-accent: ${tokens.accent};
      --hf-accent-muted: ${tokens.accentMuted};
      --hf-accent-subtle: ${tokens.accentSubtle};
      --hf-accent-text: ${tokens.accentText};
      --hf-panel-bg: ${tokens.panelBg};
      --hf-panel-header-bg: ${tokens.panelHeaderBg};
      --hf-panel-border: ${tokens.panelBorder};
      --hf-surface: ${tokens.surface};
      --hf-text: ${tokens.text};
      --hf-text-muted: ${tokens.textMuted};
      --hf-text-dim: ${tokens.textDim};
      --hf-success: ${tokens.success};
      --hf-success-bg: ${tokens.successBg};
      --hf-success-border: ${tokens.successBorder};
      --hf-warning: ${tokens.warning};
      --hf-warning-bg: ${tokens.warningBg};
      --hf-warning-border: ${tokens.warningBorder};
      --hf-danger: ${tokens.danger};
      --hf-danger-bg: ${tokens.dangerBg};
      --hf-danger-border: ${tokens.dangerBorder};
      --hf-info: ${tokens.info};
      --hf-info-bg: ${tokens.infoBg};
      --hf-info-border: ${tokens.infoBorder};
      --hf-hover: ${tokens.hover};
      --hf-radius: ${tokens.radius};
      --hf-shadow: ${tokens.shadow};
      --hf-font: ${tokens.font};
      --hf-stat-dex: ${tokens.statDex};
      --hf-stat-def: ${tokens.statDef};
      --hf-stat-str: ${tokens.statStr};
      --hf-stat-spd: ${tokens.statSpd};
      color: var(--hf-text);
      font-family: var(--hf-font);
      font-size: 12px;
      line-height: 1.4;
      box-sizing: border-box;
    }

    .${scopeClass} *, .${scopeClass} *::before, .${scopeClass} *::after {
      box-sizing: border-box;
    }

    .${scopeClass} .hf-btn {
      appearance: none;
      border: 1px solid var(--hf-panel-border);
      border-radius: 5px;
      background: var(--hf-surface);
      color: var(--hf-accent-text);
      cursor: pointer;
      padding: 6px 10px;
      font: inherit;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    .${scopeClass} .hf-btn:hover {
      background: var(--hf-accent-subtle);
      border-color: var(--hf-accent);
      color: #fff;
    }

    .${scopeClass} .hf-btn:disabled {
      opacity: 0.65;
      cursor: wait;
      pointer-events: none;
    }

    .${scopeClass} .hf-btn.is-active,
    .${scopeClass} .hf-btn--primary {
      background: var(--hf-accent);
      border-color: var(--hf-accent);
      color: #1b1d22;
      font-weight: 700;
    }

    .${scopeClass} .hf-btn.is-active:hover,
    .${scopeClass} .hf-btn--primary:hover {
      background: var(--hf-hover);
      border-color: var(--hf-hover);
    }

    .${scopeClass} .hf-muted {
      color: var(--hf-text-muted);
    }

    .${scopeClass} .hf-dim {
      color: var(--hf-text-dim);
    }

    .${scopeClass} .hf-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--hf-accent);
      color: #1b1d22;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }

    .${scopeClass} .hf-input,
    .${scopeClass} .hf-select {
      width: 100%;
      box-sizing: border-box;
      padding: 6px 8px;
      background: var(--hf-surface);
      border: 1px solid var(--hf-panel-border);
      color: var(--hf-accent-text);
      border-radius: 5px;
      font: inherit;
      font-size: 12px;
    }

    .${scopeClass} .hf-label {
      display: block;
      font-size: 11px;
      color: var(--hf-text-muted);
      margin: 12px 0 4px;
    }

    .${scopeClass} .hf-table {
      width: 100%;
      border-collapse: collapse;
    }

    .${scopeClass} .hf-table th,
    .${scopeClass} .hf-table td {
      padding: 4px 6px;
      text-align: left;
      border-bottom: 1px solid var(--hf-panel-border);
      color: var(--hf-text) !important;
      background: transparent !important;
    }

    .${scopeClass} .hf-table th {
      font-weight: bold;
      color: var(--hf-accent-text) !important;
    }

    .${scopeClass} .hf-table tbody tr:hover td {
      background: var(--hf-accent-subtle) !important;
    }

    .${scopeClass} .hf-table .hf-pos--1 {
      color: #e8c547 !important;
      font-weight: 700;
    }

    .${scopeClass} .hf-table .hf-pos--2 {
      color: #c4c9d4 !important;
      font-weight: 700;
    }

    .${scopeClass} .hf-table .hf-pos--3 {
      color: #c98a5a !important;
      font-weight: 700;
    }

    .${scopeClass} .hf-racing-log-toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-bottom: 10px;
    }

    .${scopeClass} .hf-racing-log-hint {
      font-size: 11px;
      color: var(--hf-text-muted);
    }

    .${scopeClass} strong {
      color: var(--hf-accent-text);
    }

    .${scopeClass} hr {
      border: none;
      border-top: 1px solid var(--hf-panel-border);
      margin: 10px 0;
    }

    .${scopeClass} .hf-section-break {
      box-sizing: border-box;
      border-top: 1px solid var(--hf-panel-border);
      margin-top: 10px;
      padding-top: 12px;
    }

    .${scopeClass} .hf-guide-row {
      margin: 0 0 4px;
    }

    .${scopeClass} .hf-guide-row:first-child {
      margin-top: 0;
    }

    .${scopeClass} .hf-guide-tune {
      color: var(--hf-text-muted);
      font-size: 11px;
    }

    .${scopeClass} .hf-racing-car-row {
      margin-bottom: 10px;
    }

    .${scopeClass} .hf-placement-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      margin: 4px 0 2px;
    }

    .${scopeClass} .hf-placement-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      width: auto;
      max-width: none;
      flex: 0 0 auto;
      padding: 3px 7px 3px 5px;
      border-radius: 5px;
      border: 1px solid var(--hf-panel-border);
      background: var(--hf-surface);
      font-size: 11px;
      font-weight: 700;
      font-variant-numeric: tabular-nums;
      line-height: 1;
    }

    .${scopeClass} .hf-placement-chip.is-zero {
      opacity: 0.35;
    }

    .${scopeClass} .hf-placement-chip svg.hf-placement-icon {
      width: 14px !important;
      height: 14px !important;
      min-width: 14px !important;
      max-width: 14px !important;
      min-height: 14px !important;
      max-height: 14px !important;
      flex: 0 0 14px !important;
      display: block !important;
      overflow: visible !important;
      vertical-align: middle;
    }

    .${scopeClass} .hf-placement-chip--gold {
      color: #e8c547;
      border-color: rgba(232, 197, 71, 0.35);
      background: rgba(232, 197, 71, 0.1);
    }

    .${scopeClass} .hf-placement-chip--silver {
      color: #c4c9d4;
      border-color: rgba(196, 201, 212, 0.35);
      background: rgba(196, 201, 212, 0.08);
    }

    .${scopeClass} .hf-placement-chip--bronze {
      color: #c98a5a;
      border-color: rgba(201, 138, 90, 0.35);
      background: rgba(201, 138, 90, 0.1);
    }

    .${scopeClass} .hf-placement-chip--out {
      color: var(--hf-text-muted);
      border-color: var(--hf-panel-border);
      background: rgba(0, 0, 0, 0.15);
    }

    .${scopeClass}.hf-panel {
      margin: 0 0 12px;
      border-radius: var(--hf-radius);
      background: var(--hf-panel-bg);
      border: 1px solid var(--hf-panel-border);
      box-shadow: var(--hf-shadow);
      overflow: hidden;
    }

    .${scopeClass}.hf-panel--page {
      width: 100%;
    }

    .${scopeClass}.hf-panel--fixed {
      position: fixed;
      z-index: 9999;
    }

    .${scopeClass} .hf-panel-header {
      background: var(--hf-panel-header-bg);
      border-bottom: 1px solid var(--hf-panel-border);
      border-radius: var(--hf-radius) var(--hf-radius) 0 0;
    }

    .${scopeClass} .hf-panel-tabs {
      border-bottom: 1px solid var(--hf-panel-border);
    }

    .${scopeClass} .hf-panel-body {
      padding: 12px 13px;
    }

    .${scopeClass}.hf-panel--page .hf-panel-body {
      max-height: min(70vh, 640px);
      overflow-y: auto;
    }

    .${scopeClass}.hf-panel--page.hf-panel--grow .hf-panel-body {
      max-height: none;
      overflow: visible;
    }

    .${scopeClass}.hf-overlay,
    .${scopeClass} .hf-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      z-index: 99999;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .${scopeClass}.hf-modal,
    .${scopeClass} .hf-modal {
      background: #1f2127;
      border: 1px solid var(--hf-panel-border);
      border-radius: var(--hf-radius);
      width: min(440px, 92vw);
      max-height: 84vh;
      overflow-y: auto;
      padding: 18px;
      color: var(--hf-text);
    }

    .${scopeClass}.hf-modal h2,
    .${scopeClass} .hf-modal h2 {
      margin: 0 0 14px;
      font-size: 15px;
      color: var(--hf-accent-text);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .${scopeClass} .hf-mini {
      font-size: 10px;
      color: var(--hf-text-dim);
      margin-top: 3px;
      line-height: 1.4;
    }
  `;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
  }
  var theme = {
    tokens,
    injectStyles
  };

  // src/shared/storage.js
  var PREFIX = "smart.torn";
  var LEGACY_PREFIX = "hf.torn";
  function namespaced(key) {
    return `${PREFIX}.${key}`;
  }
  function legacyNamespaced(key) {
    return `${LEGACY_PREFIX}.${key}`;
  }
  function getLocal(key, fallback = null) {
    try {
      const raw = localStorage.getItem(namespaced(key));
      if (raw !== null) {
        return JSON.parse(raw);
      }
      const legacyRaw = localStorage.getItem(legacyNamespaced(key));
      if (legacyRaw !== null) {
        localStorage.setItem(namespaced(key), legacyRaw);
        return JSON.parse(legacyRaw);
      }
      return fallback;
    } catch {
      return fallback;
    }
  }
  function setLocal(key, value) {
    localStorage.setItem(namespaced(key), JSON.stringify(value));
  }
  function removeLocal(key) {
    localStorage.removeItem(namespaced(key));
    localStorage.removeItem(legacyNamespaced(key));
  }
  var DB_NAME = "smart-torn";
  var LEGACY_DB_NAME = "heartflower-torn";
  var DB_VERSION = 1;
  var dbPromise = null;
  function openDbByName(name) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(name, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("races")) {
          const store = db.createObjectStore("races", { keyPath: "id" });
          store.createIndex("timestamp", "timestamp", { unique: false });
          store.createIndex("track", "track", { unique: false });
          store.createIndex("carKey", "carKey", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
    });
  }
  async function migrateLegacyDb(target) {
    if (typeof indexedDB.databases !== "function") {
    }
    let legacy;
    try {
      legacy = await openDbByName(LEGACY_DB_NAME);
    } catch {
      return;
    }
    if (!legacy.objectStoreNames.contains("races") || !target.objectStoreNames.contains("races")) {
      legacy.close();
      return;
    }
    const rows = await new Promise((resolve, reject) => {
      const tx = legacy.transaction("races", "readonly");
      const request = tx.objectStore("races").getAll();
      request.onsuccess = () => resolve(
        /** @type {Record<string, unknown>[]} */
        request.result ?? []
      );
      request.onerror = () => reject(request.error ?? new Error("Legacy IDB read failed"));
    });
    if (rows.length > 0) {
      await new Promise((resolve, reject) => {
        const tx = target.transaction("races", "readwrite");
        const store = tx.objectStore("races");
        for (const row of rows) {
          store.put(row);
        }
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error ?? new Error("Legacy IDB migrate failed"));
      });
    }
    legacy.close();
  }
  function openDb() {
    if (dbPromise) {
      return dbPromise;
    }
    dbPromise = (async () => {
      const db = await openDbByName(DB_NAME);
      const migratedKey = "idb.migratedFromHeartflower";
      if (getLocal(migratedKey, false) !== true) {
        try {
          await migrateLegacyDb(db);
        } catch {
        }
        setLocal(migratedKey, true);
      }
      return db;
    })();
    return dbPromise;
  }
  async function withStore(storeName, mode, run) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);
      const request = run(store);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed"));
    });
  }
  async function replaceAllRecords(storeName, records) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readwrite");
      const store = tx.objectStore(storeName);
      store.clear();
      for (const record of records) {
        store.put(record);
      }
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("IndexedDB replaceAll failed"));
    });
  }
  async function putRecord(storeName, record) {
    await withStore(storeName, "readwrite", (store) => store.put(record));
  }
  async function deleteRecord(storeName, key) {
    await withStore(storeName, "readwrite", (store) => store.delete(key));
  }
  async function getRecord(storeName, key) {
    return withStore(storeName, "readonly", (store) => store.get(key));
  }
  async function getAllRecords(storeName, query, limit) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, "readonly");
      const store = tx.objectStore(storeName);
      const request = store.getAll(query, limit);
      request.onsuccess = () => resolve(
        /** @type {Record<string, unknown>[]} */
        request.result ?? []
      );
      request.onerror = () => reject(request.error ?? new Error("IndexedDB getAll failed"));
    });
  }
  async function getByIndex(storeName, indexName, key) {
    return withStore(storeName, "readonly", (store) => store.index(indexName).getAll(key));
  }
  var storage = {
    PREFIX,
    LEGACY_PREFIX,
    getLocal,
    setLocal,
    removeLocal,
    putRecord,
    deleteRecord,
    getRecord,
    getAllRecords,
    getByIndex,
    replaceAllRecords
  };

  // src/shared/dom.js
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  async function waitFor(selector, options = {}) {
    const { timeout = 1e4, interval = 100, root = document } = options;
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = root.querySelector(selector);
      if (el) {
        return el;
      }
      await sleep(interval);
    }
    throw new Error(`waitFor timeout: ${selector}`);
  }
  async function waitForOptional(selector, options = {}) {
    try {
      return await waitFor(selector, options);
    } catch {
      return null;
    }
  }
  function isHeaderBarNode(node) {
    if (!(node instanceof HTMLElement)) {
      return node.parentElement ? isHeaderBarNode(node.parentElement) : false;
    }
    return Boolean(node.closest(
      'a[class*="bar-link"], [class*="bar-stats"], #header, header, [class*="topBar"], [class*="top-bar"], [class*="status-bar"]'
    ));
  }
  function isHeaderBarOnlyMutations(mutations) {
    return mutations.length > 0 && mutations.every((mutation) => isHeaderBarNode(mutation.target));
  }
  function observeMutations(root, callback, options = {}) {
    const { debounce = 50, ignoreHeaderBars = true } = options;
    let timer = null;
    const observer = new MutationObserver((mutations) => {
      if (ignoreHeaderBars && isHeaderBarOnlyMutations(mutations)) {
        return;
      }
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(callback, debounce);
    });
    observer.observe(root, { childList: true, subtree: true });
    callback();
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      observer.disconnect();
    };
  }
  function onAnchorClick(callback) {
    const handler = (event) => {
      const target = (
        /** @type {Element} */
        event.target
      );
      if (target.tagName === "A" || target.closest("a")) {
        setTimeout(callback, 150);
      }
    };
    document.body.addEventListener("click", handler);
    return () => document.body.removeEventListener("click", handler);
  }
  function normalizeText(text) {
    return text.replace(/\s+/g, " ").trim();
  }
  var dom = {
    sleep,
    waitFor,
    waitForOptional,
    observeMutations,
    onAnchorClick,
    normalizeText
  };

  // src/shared/mount.js
  var MOUNT_PRESETS = {
    racing: {
      waitFor: ["#racingMainContainer"],
      target: "#racingMainContainer",
      position: "before"
    },
    gym: {
      waitFor: ["#gymroot"],
      target: "#gymroot",
      position: "prepend"
    },
    gymBar: {
      waitFor: ["#gymroot"],
      target: "#gymroot",
      position: "before"
    },
    stocksBar: {
      waitFor: ["#stockmarketroot"],
      target: "#stockmarketroot",
      position: "before"
    },
    disposalBar: {
      waitFor: ['[class*="disposal-root"]'],
      target: '[class*="disposal-root"]',
      position: "before"
    },
    pickpocketBar: {
      waitFor: [".pickpocketing-root"],
      target: ".pickpocketing-root",
      position: "before"
    },
    rosterBar: {
      waitFor: [".employees-wrap"],
      target: ".employees-wrap",
      position: "before"
    },
    targetsBar: {
      waitFor: [".tableWrapper", '[class*="tableWrapper"]'],
      target: ".tableWrapper",
      position: "before"
    },
    hofBar: {
      waitFor: ["#hof-root"],
      target: "#hof-root",
      position: "before"
    },
    jailBar: {
      waitFor: [".users-list-title", "ul.user-info-list-wrap"],
      target: ".users-list-title, ul.user-info-list-wrap",
      position: "before"
    },
    contentTitle: {
      waitFor: [".content-title", ".body > .content-title", "div.content-title"],
      target: ".content-title",
      position: "after"
    }
  };
  function resolveMountConfig(mount2) {
    if (!mount2) {
      return MOUNT_PRESETS.contentTitle;
    }
    if (typeof mount2 === "string") {
      if (mount2 === "page") {
        return MOUNT_PRESETS.contentTitle;
      }
      return MOUNT_PRESETS[mount2] ?? MOUNT_PRESETS.contentTitle;
    }
    return mount2;
  }
  function findMountTarget(config) {
    const pageReady = config.waitFor.some((selector) => document.querySelector(selector));
    if (!pageReady) {
      return null;
    }
    return document.querySelector(config.target);
  }
  function insertAt(target, element, position) {
    switch (position) {
      case "before":
        target.insertAdjacentElement("beforebegin", element);
        break;
      case "after":
        target.insertAdjacentElement("afterend", element);
        break;
      case "prepend":
        target.prepend(element);
        break;
      case "append":
        target.append(element);
        break;
    }
  }
  function isMountedAt(element, target, position) {
    if (!element.isConnected) {
      return false;
    }
    switch (position) {
      case "before":
        return element.nextElementSibling === target;
      case "after":
        return element.previousElementSibling === target;
      case "prepend":
        return target.firstElementChild === element;
      case "append":
        return target.lastElementChild === element;
      default:
        return false;
    }
  }
  function mountElement(config, element) {
    const target = findMountTarget(config);
    if (!target) {
      return false;
    }
    if (isMountedAt(element, target, config.position)) {
      return true;
    }
    insertAt(target, element, config.position);
    return true;
  }
  function getMountWatchRoot(config) {
    const target = findMountTarget(config);
    if (!target) {
      return null;
    }
    if (config.position === "before" || config.position === "after") {
      return target.parentElement;
    }
    return target;
  }
  function isOwnPanelMutation(mutations) {
    return mutations.every((mutation) => {
      if (mutation.target instanceof HTMLElement && mutation.target.closest(".hf-torn")) {
        return true;
      }
      for (const node of mutation.addedNodes) {
        if (node instanceof HTMLElement && (node.classList.contains("hf-torn") || node.closest(".hf-torn"))) {
          continue;
        }
        if (node.nodeType === Node.TEXT_NODE && node.parentElement?.closest(".hf-torn")) {
          continue;
        }
        return false;
      }
      for (const node of mutation.removedNodes) {
        if (node instanceof HTMLElement && (node.classList.contains("hf-torn") || node.closest(".hf-torn"))) {
          continue;
        }
        if (node.nodeType === Node.TEXT_NODE && node.parentElement?.closest(".hf-torn")) {
          continue;
        }
        return false;
      }
      return true;
    });
  }
  function watchMount(config, getElement) {
    let stopped = false;
    const start = Date.now();
    const timeoutMs = 15e3;
    let observer = null;
    let debounceTimer = null;
    let watchedRoot = null;
    const disconnectObserver = () => {
      observer?.disconnect();
      observer = null;
      watchedRoot = null;
    };
    const tryMount = () => {
      if (stopped) {
        return;
      }
      const element = getElement();
      mountElement(config, element);
    };
    const scheduleTryMount = () => {
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer);
      }
      debounceTimer = window.setTimeout(() => {
        debounceTimer = null;
        tryMount();
      }, 80);
    };
    const attachObserver = () => {
      const watchRoot = getMountWatchRoot(config);
      if (!watchRoot || watchRoot === watchedRoot) {
        return Boolean(watchRoot);
      }
      disconnectObserver();
      watchedRoot = watchRoot;
      observer = new MutationObserver((mutations) => {
        if (isOwnPanelMutation(mutations)) {
          return;
        }
        scheduleTryMount();
      });
      observer.observe(watchRoot, {
        childList: true,
        subtree: config.position === "prepend" || config.position === "append"
      });
      return true;
    };
    const poll = window.setInterval(() => {
      tryMount();
      attachObserver();
      if (findMountTarget(config) || Date.now() - start > timeoutMs) {
        window.clearInterval(poll);
      }
    }, 250);
    tryMount();
    attachObserver();
    return () => {
      stopped = true;
      window.clearInterval(poll);
      if (debounceTimer !== null) {
        window.clearTimeout(debounceTimer);
      }
      disconnectObserver();
    };
  }
  var mount = {
    MOUNT_PRESETS,
    resolveMountConfig,
    findMountTarget,
    insertAt,
    isMountedAt,
    mountElement,
    watchMount
  };

  // src/shared/api.js
  var API_BASE = "https://api.torn.com/v2";
  var SETTINGS_KEY = "smart.torn.settings";
  var LEGACY_SETTINGS_KEY = "hf.torn.settings";
  function loadSettings() {
    try {
      let raw = GM_getValue(SETTINGS_KEY, null);
      if (raw == null || raw === "" || raw === "{}") {
        const legacy = GM_getValue(LEGACY_SETTINGS_KEY, null);
        if (legacy != null && legacy !== "" && legacy !== "{}") {
          GM_setValue(SETTINGS_KEY, typeof legacy === "string" ? legacy : JSON.stringify(legacy));
          raw = legacy;
        }
      }
      const parsed = typeof raw === "string" ? JSON.parse(raw || "{}") : raw ?? {};
      return {
        apiKey: String(parsed?.apiKey ?? "").trim()
      };
    } catch {
      return { apiKey: "" };
    }
  }
  function saveSettings(patch) {
    const current = loadSettings();
    const next = JSON.stringify({ ...current, ...patch });
    GM_setValue(SETTINGS_KEY, next);
  }
  function parseTornError(json) {
    if (!json || typeof json !== "object" || !("error" in json)) {
      return null;
    }
    const err = (
      /** @type {{ error?: unknown }} */
      json.error
    );
    if (typeof err === "string") {
      return new Error(err);
    }
    if (err && typeof err === "object") {
      const detail = (
        /** @type {{ error?: string, message?: string, code?: number }} */
        err
      );
      const error = new Error(detail.error || detail.message || `Torn API error (${detail.code ?? "unknown"})`);
      if (typeof detail.code === "number") {
        error.tornCode = detail.code;
      }
      return error;
    }
    return new Error("Torn API error");
  }
  function tornGet(path, params, apiKey) {
    const url = new URL(`${API_BASE}/${path.replace(/^\//, "")}`);
    url.searchParams.set("key", apiKey);
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== void 0 && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: "GET",
        url: url.toString(),
        timeout: 2e4,
        onload: (response) => {
          try {
            const json = JSON.parse(response.responseText || "{}");
            const apiError = parseTornError(json);
            if (apiError) {
              reject(apiError);
              return;
            }
            resolve(json);
          } catch (error) {
            reject(error instanceof Error ? error : new Error("Invalid API response"));
          }
        },
        onerror: () => reject(new Error("Network error")),
        ontimeout: () => reject(new Error("API request timed out"))
      });
    });
  }
  var api = {
    loadSettings,
    saveSettings,
    parseTornError,
    tornGet,
    SETTINGS_KEY,
    LEGACY_SETTINGS_KEY
  };

  // src/shared/ui.js
  function panelCollapsedKey(panelId) {
    return `panel.${panelId}.collapsed`;
  }
  function readPanelCollapsed(panelId, legacyKeys = []) {
    const stored = getLocal(panelCollapsedKey(panelId), void 0);
    if (stored === true || stored === "true") {
      return true;
    }
    if (stored === false || stored === "false") {
      return false;
    }
    for (const key of legacyKeys) {
      const raw = localStorage.getItem(key);
      if (raw === "true") {
        setLocal(panelCollapsedKey(panelId), true);
        return true;
      }
      if (raw === "false") {
        setLocal(panelCollapsedKey(panelId), false);
        return false;
      }
    }
    return false;
  }
  var PANELS = /* @__PURE__ */ new Map();
  function createPanel(options) {
    const existing = PANELS.get(options.id);
    if (existing?.element.isConnected) {
      return existing;
    }
    if (existing) {
      PANELS.delete(options.id);
    }
    injectStyles();
    const mountOption = options.mount ?? "racing";
    const isFixed = mountOption === "fixed";
    const mountConfig = isFixed ? null : resolveMountConfig(mountOption);
    const pageBody = options.pageBody ?? "cap";
    const growPageBody = !isFixed && pageBody === "grow";
    const root = document.createElement("section");
    root.id = options.id;
    root.className = isFixed ? "hf-torn hf-panel hf-panel--fixed" : `hf-torn hf-panel hf-panel--page${growPageBody ? " hf-panel--grow" : ""}`;
    applyPanelLayout(root, isFixed, options.position ?? "bottom-right");
    const header = document.createElement("div");
    header.className = "hf-panel-header";
    header.style.cssText = `
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 13px;
    cursor: pointer;
    user-select: none;
  `;
    const titleWrap = document.createElement("div");
    titleWrap.style.display = "flex";
    titleWrap.style.alignItems = "center";
    titleWrap.style.gap = "10px";
    titleWrap.style.flex = "1";
    titleWrap.style.minWidth = "0";
    if (options.badge) {
      const badge = document.createElement("span");
      badge.className = "hf-badge";
      badge.textContent = options.badge;
      titleWrap.appendChild(badge);
    } else if (options.title) {
      const title = document.createElement("div");
      title.textContent = options.title;
      title.style.fontWeight = "700";
      title.style.fontSize = "13px";
      title.style.color = "var(--hf-accent-text)";
      titleWrap.appendChild(title);
    }
    const right = document.createElement("div");
    right.className = "hf-panel-right";
    right.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
    flex-shrink: 0;
  `;
    const subtitle = document.createElement("div");
    subtitle.className = "hf-muted hf-panel-subtitle";
    subtitle.style.cssText = `
    font-size: 11px;
    max-width: min(280px, 40vw);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    pointer-events: none;
  `;
    const headerIcon = (className, title, html, onClick) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = className;
      btn.title = title;
      btn.innerHTML = html;
      btn.style.cssText = `
      font-size: 15px;
      color: var(--hf-text-muted);
      background: none;
      border: none;
      cursor: pointer;
      padding: 0 4px;
      line-height: 1;
      flex-shrink: 0;
      position: relative;
      z-index: 2;
    `;
      const run = (event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      };
      btn.addEventListener("mousedown", run);
      btn.addEventListener("click", run);
      btn.addEventListener("mouseenter", () => {
        btn.style.color = "#fff";
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.color = "var(--hf-text-muted)";
      });
      return btn;
    };
    const refresh = options.onRefresh ? headerIcon("hf-panel-refresh", "Refresh page", "&#8635;", () => options.onRefresh?.()) : null;
    const gear = options.onSettings ? headerIcon("hf-panel-gear", "Settings", "&#9881;", () => options.onSettings?.()) : null;
    const toggle = document.createElement("span");
    toggle.className = "hf-panel-chev";
    toggle.textContent = "\u25BC";
    toggle.style.cssText = "font-size:12px;color:var(--hf-text-muted);transition:transform .2s;flex-shrink:0;";
    right.appendChild(subtitle);
    if (refresh) {
      right.appendChild(refresh);
    }
    if (gear) {
      right.appendChild(gear);
    }
    right.appendChild(toggle);
    header.appendChild(titleWrap);
    header.appendChild(right);
    const tabBar = document.createElement("div");
    tabBar.className = "hf-panel-tabs";
    tabBar.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 6px 8px;
  `;
    const body = document.createElement("div");
    body.className = "hf-panel-body";
    if (growPageBody) {
      body.style.maxHeight = "none";
      body.style.overflow = "visible";
    }
    root.appendChild(header);
    if (options.tabs.length > 1) {
      root.appendChild(tabBar);
    }
    root.appendChild(body);
    let collapsed = readPanelCollapsed(options.id, options.collapsedLegacyKeys);
    let activeTabId = options.tabs[0]?.id ?? "";
    const tabButtons = /* @__PURE__ */ new Map();
    const setCollapsed = (value) => {
      collapsed = value;
      const hideBody = collapsed;
      if (options.tabs.length > 1) {
        tabBar.style.display = collapsed ? "none" : "flex";
      }
      body.style.display = hideBody ? "none" : "block";
      toggle.style.transform = collapsed ? "rotate(-90deg)" : "";
      root.classList.toggle("is-collapsed", collapsed);
      setLocal(panelCollapsedKey(options.id), value);
    };
    let renderGeneration = 0;
    const renderActiveTab = async () => {
      const generation = ++renderGeneration;
      const tab = options.tabs.find((item) => item.id === activeTabId);
      body.replaceChildren();
      if (!tab) {
        body.textContent = "No tab selected.";
        return;
      }
      const content = await tab.render();
      if (generation !== renderGeneration) {
        return;
      }
      body.replaceChildren();
      body.appendChild(content);
    };
    const setTab = (id) => {
      activeTabId = id;
      tabButtons.forEach((btn, tabId) => {
        btn.classList.toggle("is-active", tabId === id);
      });
      renderActiveTab();
    };
    if (options.tabs.length > 1) {
      for (const tab of options.tabs) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "hf-btn";
        btn.textContent = tab.label;
        btn.addEventListener("click", (event) => {
          event.stopPropagation();
          setTab(tab.id);
        });
        tabButtons.set(tab.id, btn);
        tabBar.appendChild(btn);
      }
    }
    header.addEventListener("click", (event) => {
      if (
        /** @type {Element} */
        event.target.closest(".hf-panel-gear, .hf-panel-refresh")
      ) {
        return;
      }
      if (
        /** @type {Element} */
        event.target.closest("button")
      ) {
        return;
      }
      setCollapsed(!collapsed);
    });
    setTab(activeTabId);
    setCollapsed(collapsed);
    let stopWatching = null;
    const ensureMounted = () => {
      if (isFixed) {
        if (root.parentElement !== document.body) {
          document.body.appendChild(root);
        }
        return;
      }
      if (mountConfig) {
        mountElement(mountConfig, root);
      }
    };
    if (isFixed) {
      ensureMounted();
    } else if (mountConfig) {
      stopWatching = watchMount(mountConfig, () => root);
    }
    const panel2 = {
      element: root,
      setTab,
      getActiveTabId: () => activeTabId,
      refresh: () => {
        if (options.getSubtitle) {
          subtitle.textContent = options.getSubtitle() ?? "";
        }
        renderActiveTab();
      },
      setSubtitle: (text) => {
        subtitle.textContent = text;
      },
      ensureMounted,
      destroy: () => {
        stopWatching?.();
        root.remove();
        PANELS.delete(options.id);
      }
    };
    if (options.getSubtitle) {
      subtitle.textContent = options.getSubtitle() ?? "";
    }
    PANELS.set(options.id, panel2);
    return panel2;
  }
  function applyPanelLayout(el, isFixed, position) {
    if (!isFixed) {
      el.style.cssText = `
      position: static;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    `;
      return;
    }
    el.style.cssText = `
    position: fixed;
    z-index: 9999;
    width: min(420px, calc(100vw - 24px));
    max-height: min(70vh, 560px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  `;
    applyFixedPosition(el, position);
  }
  function applyFixedPosition(el, position) {
    el.style.top = "";
    el.style.right = "";
    el.style.bottom = "";
    el.style.left = "";
    switch (position) {
      case "top-right":
        el.style.top = "12px";
        el.style.right = "12px";
        break;
      case "bottom-left":
        el.style.bottom = "12px";
        el.style.left = "12px";
        break;
      case "bottom-right":
      default:
        el.style.bottom = "12px";
        el.style.right = "12px";
        break;
    }
  }
  function emptyState(message) {
    const div = document.createElement("div");
    div.className = "hf-muted";
    div.textContent = message;
    return div;
  }
  var ui = {
    createPanel,
    emptyState
  };

  // src/shared/percent.js
  function parsePercent(raw, fallback = 0) {
    if (raw === null || raw === void 0 || raw === "") {
      return fallback;
    }
    if (typeof raw === "number") {
      return Number.isFinite(raw) ? raw : fallback;
    }
    const cleaned = String(raw).trim().replace("%", "").replace(",", ".");
    const value = parseFloat(cleaned);
    return Number.isFinite(value) ? value : fallback;
  }
  function weightToPercent(weight) {
    return Math.round(weight * 1e3) / 10;
  }
  function weightSharePercent(weight, weights) {
    const sum = Object.values(weights).reduce((total, w) => total + (w > 0 ? w : 0), 0);
    if (sum <= 0 || weight <= 0) {
      return 0;
    }
    return weight / sum * 100;
  }
  function percentToWeight(raw, fallback = 0) {
    const pct = parsePercent(raw, fallback * 100);
    return pct / 100;
  }
  function weightsToShares(weights) {
    const sum = Object.values(weights).reduce((total, w) => total + (w > 0 ? w : 0), 0);
    if (sum <= 0) {
      return {};
    }
    const out = {};
    for (const [stat, w] of Object.entries(weights)) {
      out[stat] = w > 0 ? w / sum * 100 : 0;
    }
    return out;
  }
  function normalizeWeightsToShares(weights) {
    const sum = Object.values(weights).reduce((total, w) => total + (w > 0 ? w : 0), 0);
    if (sum <= 0) {
      return weights;
    }
    const out = {};
    for (const [stat, w] of Object.entries(weights)) {
      out[stat] = w > 0 ? w / sum * 100 : 0;
    }
    return out;
  }
  function parseShareInputs(inputsByStat) {
    const raw = {};
    let sum = 0;
    for (const [stat, value] of Object.entries(inputsByStat)) {
      const pct = Math.max(0, parsePercent(value, 0));
      raw[stat] = pct;
      sum += pct;
    }
    if (sum <= 0) {
      return raw;
    }
    const out = {};
    for (const [stat, pct] of Object.entries(raw)) {
      out[stat] = pct > 0 ? pct / sum * 100 : 0;
    }
    return out;
  }
  function bonusesToMultiplier(bonuses) {
    const f = parsePercent(bonuses?.faction, 0);
    const e = parsePercent(bonuses?.education, 0);
    const p = parsePercent(bonuses?.property, 0);
    return (1 + f / 100) * (1 + e / 100) * (1 + p / 100);
  }
  function multiplierToTotalPercent(multiplier) {
    if (!Number.isFinite(multiplier) || multiplier <= 1) {
      return 0;
    }
    return Math.round((multiplier - 1) * 1e3) / 10;
  }
  function formatPercent(pct, digits = 1) {
    const rounded = Math.round(pct * Math.pow(10, digits)) / Math.pow(10, digits);
    const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(digits);
    return `${text}%`;
  }
  function formatWeightSummary(weights, shortLabels) {
    const parts = Object.entries(weights).filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]).map(([stat, w]) => `${shortLabels[stat] ?? stat} ${formatPercent(weightSharePercent(w, weights), 0)}`);
    return parts.join(" \xB7 ");
  }
  var percent = {
    parsePercent,
    weightToPercent,
    weightSharePercent,
    percentToWeight,
    weightsToShares,
    normalizeWeightsToShares,
    parseShareInputs,
    bonusesToMultiplier,
    multiplierToTotalPercent,
    formatPercent,
    formatWeightSummary
  };

  // src/shared/bars.js
  var FILL_SELECTORS = [
    '[class*="bar-fill"]',
    '[class*="barFill"]',
    '[class*="progress-fill"]',
    '[class*="progressFill"]',
    '[class*="progressBar"]',
    '[class*="progress-bar"]'
  ].join(", ");
  function applyBarFill(box, pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    let updated = false;
    box.querySelectorAll(FILL_SELECTORS).forEach((fill) => {
      if (!(fill instanceof HTMLElement)) {
        return;
      }
      fill.style.width = `${clamped}%`;
      fill.style.transform = "";
      updated = true;
    });
    const progressbar = box.matches('[role="progressbar"]') ? box : box.querySelector('[role="progressbar"]');
    if (progressbar instanceof HTMLElement) {
      progressbar.setAttribute("aria-valuenow", String(Math.round(clamped)));
      const inner = progressbar.firstElementChild;
      if (inner instanceof HTMLElement) {
        inner.style.width = `${clamped}%`;
        inner.style.transform = `scaleX(${clamped / 100})`;
        inner.style.transformOrigin = "left center";
        updated = true;
      }
    }
    if (!updated) {
      for (const child of box.children) {
        if (!(child instanceof HTMLElement) || child.tagName === "P") {
          continue;
        }
        if (child.querySelector(FILL_SELECTORS)) {
          continue;
        }
        child.style.width = `${clamped}%`;
        child.style.transform = `scaleX(${clamped / 100})`;
        child.style.transformOrigin = "left center";
        updated = true;
      }
    }
  }
  function applyBarVisual(box, bar) {
    if (!box || !bar?.max) {
      return;
    }
    const val = box.querySelector('p[class*="bar-value"], [class*="bar-value"]');
    if (val) {
      val.textContent = `${bar.current}/${bar.max}`;
    }
    const pct = bar.max > 0 ? bar.current / bar.max * 100 : 0;
    applyBarFill(box, pct);
    box.querySelectorAll("[aria-valuemax]").forEach((el) => {
      el.setAttribute("aria-valuenow", String(bar.current));
      el.setAttribute("aria-valuemax", String(bar.max));
    });
  }
  function findBarBox(label) {
    const labels = document.querySelectorAll('[class*="bar-name"], .wai');
    for (const el of labels) {
      const text = el.textContent.trim();
      if (text.toLowerCase().startsWith(label.toLowerCase())) {
        return el.closest('[class*="bar-stats"], [aria-roledescription="progress indicator"]') || el.parentElement;
      }
    }
    const slug = label.toLowerCase();
    const link = document.querySelector(
      `a.bar-link[class*="${slug}"], a[class*="bar-link"][class*="${slug}"]`
    );
    return link;
  }
  function syncBarVisuals(bars2) {
    if (bars2.energy) {
      applyBarVisual(findBarBox("Energy"), bars2.energy);
    }
    if (bars2.happy) {
      applyBarVisual(findBarBox("Happy"), bars2.happy);
    }
    if (bars2.nerve) {
      applyBarVisual(findBarBox("Nerve"), bars2.nerve);
    }
    if (bars2.life) {
      applyBarVisual(findBarBox("Life"), bars2.life);
    }
  }
  var bars = {
    applyBarVisual,
    findBarBox,
    syncBarVisuals
  };

  // src/shared/index.js
  var HF = {
    version: "1.0.0",
    theme,
    storage,
    dom,
    mount,
    api,
    ui,
    percent,
    bars
  };

  // src/stocks/legacy-app.js
  function bootstrapStocksApp(opts = {}) {
    var $;
    const MOUNT_SELECTOR = opts.mountRoot || "#smart-stocks-root";
    function resolveJQuery() {
      if (typeof jQuery !== "undefined" && jQuery.fn) {
        return jQuery;
      }
      if (typeof unsafeWindow !== "undefined" && unsafeWindow.jQuery && unsafeWindow.jQuery.fn) {
        return unsafeWindow.jQuery;
      }
      if (typeof window !== "undefined" && window.jQuery && window.jQuery.fn) {
        return window.jQuery;
      }
      return null;
    }
    function mountVaultHtml(html) {
      const cleaned = html.replace(/<div class="alfa-vault-header">[\s\S]*?<\/div>\s*<\/div>\s*/g, "");
      $(MOUNT_SELECTOR).html(cleaned);
    }
    const STOCK_DATA = {
      "ASS": { base: 1e6, type: "A" },
      "BAG": { base: 3e6, type: "A" },
      "CNC": { base: 75e5, type: "A" },
      "EWM": { base: 1e6, type: "A" },
      "ELT": { base: 5e6, type: "P" },
      "EVL": { base: 1e5, type: "A" },
      "FHG": { base: 2e6, type: "A" },
      "GRN": { base: 5e5, type: "A" },
      "CBD": { base: 35e4, type: "A" },
      "HRG": { base: 1e7, type: "A" },
      "IIL": { base: 1e6, type: "P" },
      "IOU": { base: 3e6, type: "A" },
      "IST": { base: 1e5, type: "P" },
      "LAG": { base: 75e4, type: "A" },
      "LOS": { base: 75e5, type: "P" },
      "LSC": { base: 5e5, type: "A" },
      "MCS": { base: 35e4, type: "A" },
      "MSG": { base: 3e5, type: "P" },
      "MUN": { base: 5e6, type: "A" },
      "PRN": { base: 1e6, type: "A" },
      "PTS": { base: 1e7, type: "A" },
      "SYM": { base: 5e5, type: "A" },
      "SYS": { base: 3e6, type: "P" },
      "TCP": { base: 1e6, type: "P" },
      "TMI": { base: 6e6, type: "A" },
      "TGP": { base: 25e5, type: "P" },
      "TCT": { base: 1e5, type: "A" },
      "TSB": { base: 3e6, type: "A" },
      "TCC": { base: 75e5, type: "A" },
      "THS": { base: 15e4, type: "A" },
      "TCI": { base: 15e5, type: "P" },
      "TCM": { base: 1e6, type: "P" },
      "WSU": { base: 1e6, type: "P" },
      "WLT": { base: 9e6, type: "P" },
      "YAZ": { base: 1e6, type: "P" }
    };
    let STOCK_ID_MAP = {
      1: "TCI",
      2: "TCC",
      3: "SYS",
      4: "LAG",
      5: "IOU",
      6: "GRN",
      7: "THS",
      8: "CBD",
      9: "TCT",
      10: "EVL",
      11: "MCS",
      12: "WSU",
      13: "IIL",
      14: "FHG",
      15: "SYM",
      16: "LSC",
      17: "PRN",
      18: "EWM",
      19: "TCM",
      20: "MSG",
      21: "MUN",
      22: "YAZ",
      23: "IST",
      24: "BAG",
      25: "ASS",
      26: "CNC",
      27: "TMI",
      28: "ELT",
      29: "HRG",
      30: "TGP",
      31: "TSB",
      32: "WLT",
      33: "LOS",
      34: "TCP",
      35: "PTS"
    };
    let SYMBOL_TO_ID = {};
    for (const [id, sym] of Object.entries(STOCK_ID_MAP)) {
      SYMBOL_TO_ID[sym] = parseInt(id);
    }
    function buildStockIdMap() {
      for (const [sym, domId] of Object.entries(stockId)) {
        const numId = parseInt(domId.replace("stock_", ""));
        if (!isNaN(numId)) {
          STOCK_ID_MAP[numId] = sym;
          SYMBOL_TO_ID[sym] = numId;
        }
      }
    }
    const LOG_TYPE_BUY = 5510;
    const LOG_TYPE_SELL = 5511;
    const STOCK_SELL_FEE_RATE = 1e-3;
    function stockSellFee(tx) {
      if (!tx || tx.type === "buy") return 0;
      const logged = Number(tx.fees);
      if (Number.isFinite(logged) && logged > 0) return logged;
      const worth = Number(tx.totalValue) || 0;
      return worth > 0 ? worth * STOCK_SELL_FEE_RATE : 0;
    }
    function stockNetProfit(tx) {
      if (!tx || tx.type !== "sell") return 0;
      return (Number(tx.profit) || 0) - stockSellFee(tx);
    }
    function stockNetFromGross(gross) {
      return (Number(gross) || 0) * (1 - STOCK_SELL_FEE_RATE);
    }
    function stockGrossFromNet(net) {
      const n = Number(net) || 0;
      const keep = 1 - STOCK_SELL_FEE_RATE;
      return keep > 0 ? n / keep : n;
    }
    function formatWithdrawMoney(num) {
      const n = Number(num);
      if (!isFinite(n)) return "$0";
      return "$" + Math.round(n).toLocaleString("en-US");
    }
    function fillWithdrawToGross(plan, stockInfo, targetGross) {
      const lockBlocks = blocksEnabled();
      let remaining = targetGross - plan.reduce((sum, p) => sum + p.value, 0);
      if (remaining <= 0) return plan;
      const roomFor = (stock) => {
        const planned = plan.find((p) => p.symbol === stock.symbol);
        const already = planned ? planned.shares : 0;
        const maxShares = lockBlocks ? stock.looseShares : stock.owned;
        return Math.max(0, maxShares - already);
      };
      const order = [
        ...stockInfo.filter((s) => plan.some((p) => p.symbol === s.symbol)),
        ...stockInfo.filter((s) => !plan.some((p) => p.symbol === s.symbol))
      ];
      for (const stock of order) {
        if (remaining <= 0) break;
        if (stock.price <= 0) continue;
        const available = roomFor(stock);
        if (available <= 0) continue;
        const addShares = Math.min(available, Math.ceil(remaining / stock.price));
        if (addShares <= 0) continue;
        const addValue = addShares * stock.price;
        const existing = plan.find((p) => p.symbol === stock.symbol);
        if (existing) {
          existing.shares += addShares;
          existing.value += addValue;
          if (!lockBlocks && existing.shares > stock.looseShares) {
            existing.type = "tier";
            existing.warning = existing.warning || "May reduce benefit tier!";
          }
        } else {
          const intoTier = !lockBlocks && addShares > stock.looseShares;
          plan.push({
            symbol: stock.symbol,
            shares: addShares,
            price: stock.price,
            value: addValue,
            type: intoTier ? "tier" : "loose",
            warning: intoTier ? "May reduce benefit tier!" : void 0,
            swingProtected: stock.hasSwingTrade
          });
        }
        remaining -= addValue;
      }
      return plan;
    }
    let portfolioData = {
      transactions: [],
      // All stock transactions from API log
      lastSyncTimestamp: 0,
      // Last transaction timestamp we synced
      costBasis: {},
      // Per-stock cost basis tracking { symbol: { totalShares: 0, totalCost: 0, lots: [] } }
      realizedPL: 0,
      // Total realized profit/loss
      lastFullSync: 0
      // Timestamp of last full sync
    };
    try {
      let savedPortfolio = JSON.parse(localStorage.getItem("alfa_portfolio_data"));
      if (savedPortfolio) {
        portfolioData = { ...portfolioData, ...savedPortfolio };
      }
    } catch (e) {
      console.error("Failed to load portfolio data:", e);
    }
    let swingTradeData = {
      activePositions: [],
      // Current open swing trades
      completedTrades: [],
      // Historical completed trades
      watchlist: [],
      // Stocks being watched for entry
      settings: {
        defaultTargetPercent: 3,
        // Default take profit %
        defaultStopPercent: 2,
        // Default stop loss %
        minSwingPercent: 0.5,
        // Minimum price swing to trigger signal
        rsiOversold: 30,
        // RSI threshold for buy signals
        rsiOverbought: 70,
        // RSI threshold for sell signals
        bollingerEntryThreshold: 0.2,
        // Entry when below this position (0-1)
        bollingerExitThreshold: 0.8,
        // Exit when above this position (0-1)
        adxMinThreshold: 25,
        // ADX must be >= this for full RSI weight (filters weak trends)
        adxPartialThreshold: 20,
        // Between 20-25, RSI gets 50% weight; below 20, RSI ignored
        volumeMinMultiplier: 1,
        // Volume must be >= 7d avg for full signal (filters fakeouts)
        volumePartialMultiplier: 0.8,
        // Between 0.8-1, partial weight; below 0.8, discount
        atrTargetMultiplier: 2,
        // Target = ATR% * this (e.g. 2x ATR for take profit)
        atrStopMultiplier: 1.5,
        // Stop = ATR% * this (e.g. 1.5x ATR for stop loss)
        enableAlerts: true,
        // Show visual alerts for signals
        autoTrack: false
        // Auto-add buy transactions as positions
      },
      lastSignalCheck: 0
    };
    try {
      let savedSwingData = JSON.parse(localStorage.getItem("alfa_swing_trades"));
      if (savedSwingData) {
        swingTradeData = { ...swingTradeData, ...savedSwingData };
        swingTradeData.completedTrades.forEach((t) => {
          if (!t.tags) t.tags = [];
        });
      }
    } catch (e) {
      console.error("Failed to load swing trade data:", e);
    }
    let lastClosedPosition = null;
    let undoCloseTimeout = null;
    function saveSwingTradeData() {
      localStorage.setItem("alfa_swing_trades", JSON.stringify(swingTradeData));
    }
    function generateTradeId() {
      return `ST_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    }
    function addSwingPosition(symbol, entryPrice, shares, targetPercent = null, stopPercent = null, notes = "", targetPrice = null, stopPrice = null) {
      const settings = swingTradeData.settings;
      targetPercent = targetPercent ?? settings.defaultTargetPercent;
      stopPercent = stopPercent ?? settings.defaultStopPercent;
      let finalTargetPrice, finalStopPrice, finalTargetPercent, finalStopPercent;
      if (targetPrice != null && targetPrice > 0) {
        finalTargetPrice = targetPrice;
        finalTargetPercent = entryPrice > 0 ? (targetPrice / entryPrice - 1) * 100 : 0;
      } else {
        finalTargetPrice = entryPrice * (1 + targetPercent / 100);
        finalTargetPercent = targetPercent;
      }
      if (stopPrice != null && stopPrice > 0) {
        finalStopPrice = stopPrice;
        finalStopPercent = entryPrice > 0 ? (1 - stopPrice / entryPrice) * 100 : 0;
      } else {
        finalStopPrice = entryPrice * (1 - stopPercent / 100);
        finalStopPercent = stopPercent;
      }
      const position = {
        id: generateTradeId(),
        symbol: symbol.toUpperCase(),
        type: "long",
        entryPrice,
        entryDate: Date.now(),
        shares,
        targetPrice: finalTargetPrice,
        stopPrice: finalStopPrice,
        targetPercent: finalTargetPercent,
        stopPercent: finalStopPercent,
        status: "active",
        notes,
        currentPrice: entryPrice,
        currentPL: 0,
        currentPLPercent: 0
      };
      swingTradeData.activePositions.push(position);
      saveSwingTradeData();
      return position;
    }
    function updatePositionPrice(positionId, currentPrice, opts2 = {}) {
      const persist = opts2.persist !== false;
      const position = swingTradeData.activePositions.find((p) => p.id === positionId);
      if (!position) return null;
      position.currentPrice = currentPrice;
      position.currentPL = (currentPrice - position.entryPrice) * position.shares;
      position.currentPLPercent = (currentPrice - position.entryPrice) / position.entryPrice * 100;
      let statusChanged = false;
      if (currentPrice >= position.targetPrice && position.status === "active") {
        position.status = "target_hit";
        statusChanged = true;
      } else if (currentPrice <= position.stopPrice && position.status === "active") {
        position.status = "stopped";
        statusChanged = true;
      }
      if (persist && statusChanged) saveSwingTradeData();
      return position;
    }
    function updateAllPositionPrices() {
      let statusChanged = false;
      for (const position of swingTradeData.activePositions) {
        const currentPrice = getPrice(position.symbol);
        if (currentPrice > 0) {
          const before = position.status;
          updatePositionPrice(position.id, currentPrice, { persist: false });
          if (position.status !== before) statusChanged = true;
        }
      }
      if (statusChanged) saveSwingTradeData();
    }
    function closeSwingPosition(positionId, exitPrice = null, exitReason = "manual_close", sharesToClose = null) {
      const posIndex = swingTradeData.activePositions.findIndex((p) => p.id === positionId);
      if (posIndex === -1) return null;
      const position = swingTradeData.activePositions[posIndex];
      exitPrice = exitPrice || position.currentPrice || getPrice(position.symbol);
      const isFullClose = sharesToClose == null || sharesToClose >= position.shares;
      const closeShares = isFullClose ? position.shares : Math.min(Math.max(1, Math.floor(sharesToClose)), position.shares - 1);
      const grossProceeds = exitPrice * closeShares;
      const fee = grossProceeds * 1e-3;
      const netProceeds = grossProceeds - fee;
      const cost = position.entryPrice * closeShares;
      const completedTrade = {
        id: isFullClose ? position.id : generateTradeId(),
        symbol: position.symbol,
        type: position.type,
        entryPrice: position.entryPrice,
        entryDate: position.entryDate,
        exitPrice,
        exitDate: Date.now(),
        shares: closeShares,
        grossPnl: grossProceeds - cost,
        fee,
        pnl: netProceeds - cost,
        pnlPercent: cost > 0 ? (netProceeds - cost) / cost * 100 : 0,
        holdingDays: Math.ceil((Date.now() - position.entryDate) / (1e3 * 60 * 60 * 24)),
        exitReason,
        notes: position.notes || "",
        tags: position.tags || []
      };
      if (isFullClose) {
        lastClosedPosition = { position: JSON.parse(JSON.stringify(position)), completedTrade };
        if (undoCloseTimeout) clearTimeout(undoCloseTimeout);
        undoCloseTimeout = setTimeout(() => {
          lastClosedPosition = null;
        }, 15e3);
        swingTradeData.activePositions.splice(posIndex, 1);
      } else {
        position.shares -= closeShares;
      }
      swingTradeData.completedTrades.unshift(completedTrade);
      if (swingTradeData.completedTrades.length > 100) {
        swingTradeData.completedTrades = swingTradeData.completedTrades.slice(0, 100);
      }
      saveSwingTradeData();
      return completedTrade;
    }
    function recalculateCompletedTrade(trade) {
      const cost = trade.entryPrice * trade.shares;
      const grossProceeds = trade.exitPrice * trade.shares;
      const fee = grossProceeds * 1e-3;
      const netProceeds = grossProceeds - fee;
      trade.grossPnl = grossProceeds - cost;
      trade.fee = fee;
      trade.pnl = netProceeds - cost;
      trade.pnlPercent = cost > 0 ? (netProceeds - cost) / cost * 100 : 0;
      trade.holdingDays = Math.ceil((trade.exitDate - trade.entryDate) / (1e3 * 60 * 60 * 24));
      return trade;
    }
    function undoClosePosition() {
      if (!lastClosedPosition) return false;
      const { position, completedTrade } = lastClosedPosition;
      const idx = swingTradeData.completedTrades.findIndex((t) => t.id === completedTrade.id);
      if (idx === -1) return false;
      swingTradeData.completedTrades.splice(idx, 1);
      swingTradeData.activePositions.unshift(position);
      lastClosedPosition = null;
      if (undoCloseTimeout) {
        clearTimeout(undoCloseTimeout);
        undoCloseTimeout = null;
      }
      saveSwingTradeData();
      return true;
    }
    function showUndoCloseBanner() {
      const existing = document.getElementById("swing-undo-banner");
      if (existing) existing.remove();
      const banner = document.createElement("div");
      banner.id = "swing-undo-banner";
      banner.className = "swing-undo-banner";
      banner.innerHTML = `Position closed. <button id="swing-undo-btn" class="swing-undo-btn">Undo</button>`;
      const swingEl = document.querySelector(".swing-content") || document.querySelector("#swing-content");
      const parent = swingEl || document.body;
      if (parent) {
        parent.insertBefore(banner, parent.firstChild);
        banner.querySelector("#swing-undo-btn").onclick = () => {
          if (undoClosePosition()) {
            $("#swing-positions-list").html(renderSwingPositions());
            refreshSwingJournal();
            bindSwingPositionActions();
          }
          banner.remove();
        };
      }
    }
    function deleteJournalEntry(tradeId) {
      const idx = swingTradeData.completedTrades.findIndex((t) => t.id === tradeId);
      if (idx === -1) return false;
      swingTradeData.completedTrades.splice(idx, 1);
      saveSwingTradeData();
      return true;
    }
    function getSwingTradeStats(period = "all") {
      const startTimestamp = getPeriodStartTimestamp(period);
      const trades = swingTradeData.completedTrades.filter((t) => t.exitDate >= startTimestamp);
      if (trades.length === 0) {
        return { totalTrades: 0, winRate: 0, avgPnl: 0, avgPnlPercent: 0, totalPnl: 0, avgHoldDays: 0, bestTrade: null, worstTrade: null };
      }
      const winners = trades.filter((t) => t.pnl > 0);
      const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
      const totalPnlPercent = trades.reduce((sum, t) => sum + t.pnlPercent, 0);
      const avgHoldDays = trades.reduce((sum, t) => sum + t.holdingDays, 0) / trades.length;
      const sortedByPnl = [...trades].sort((a, b) => b.pnl - a.pnl);
      return {
        totalTrades: trades.length,
        winners: winners.length,
        losers: trades.length - winners.length,
        winRate: winners.length / trades.length * 100,
        avgPnl: totalPnl / trades.length,
        avgPnlPercent: totalPnlPercent / trades.length,
        totalPnl,
        avgHoldDays,
        bestTrade: sortedByPnl[0],
        worstTrade: sortedByPnl[sortedByPnl.length - 1]
      };
    }
    function analyzeSwingOpportunity(analysis) {
      if (!analysis) return null;
      const settings = swingTradeData.settings;
      const signals = [];
      let score = 0;
      const adx = analysis.adx ?? 25;
      const adxMin = settings.adxMinThreshold ?? 25;
      const adxPartial = settings.adxPartialThreshold ?? 20;
      const rsiAdxFactor = adx >= adxMin ? 1 : adx >= adxPartial ? 0.5 : 0;
      let rsiWeight = 0;
      if (analysis.rsi < settings.rsiOversold) {
        rsiWeight = 30;
        signals.push({ type: "rsi", direction: "bullish", message: `RSI oversold (${analysis.rsi.toFixed(0)})${rsiAdxFactor < 1 ? " [weak trend]" : ""}`, weight: 30 });
      } else if (analysis.rsi < 40) {
        rsiWeight = 15;
        signals.push({ type: "rsi", direction: "bullish", message: `RSI low (${analysis.rsi.toFixed(0)})${rsiAdxFactor < 1 ? " [weak trend]" : ""}`, weight: 15 });
      } else if (analysis.rsi > settings.rsiOverbought) {
        rsiWeight = -30;
        signals.push({ type: "rsi", direction: "bearish", message: `RSI overbought (${analysis.rsi.toFixed(0)})${rsiAdxFactor < 1 ? " [weak trend]" : ""}`, weight: -30 });
      } else if (analysis.rsi > 60) {
        rsiWeight = -15;
        signals.push({ type: "rsi", direction: "bearish", message: `RSI elevated (${analysis.rsi.toFixed(0)})${rsiAdxFactor < 1 ? " [weak trend]" : ""}`, weight: -15 });
      }
      score += rsiWeight * rsiAdxFactor;
      if (analysis.bollingerPosition <= settings.bollingerEntryThreshold) {
        signals.push({ type: "bollinger", direction: "bullish", message: `Near lower Bollinger band`, weight: 25 });
        score += 25;
      } else if (analysis.bollingerPosition >= settings.bollingerExitThreshold) {
        signals.push({ type: "bollinger", direction: "bearish", message: `Near upper Bollinger band`, weight: -25 });
        score -= 25;
      }
      if (analysis.support > 0 && analysis.price <= analysis.support * 1.02) {
        signals.push({ type: "support", direction: "bullish", message: `At support level ($${analysis.support.toFixed(2)})`, weight: 20 });
        score += 20;
      }
      if (analysis.resistance > 0 && analysis.price >= analysis.resistance * 0.98) {
        signals.push({ type: "resistance", direction: "bearish", message: `At resistance ($${analysis.resistance.toFixed(2)})`, weight: -20 });
        score -= 20;
      }
      if (analysis.momentum7d < -3) {
        signals.push({ type: "momentum", direction: "bullish", message: `Momentum reversal potential (${analysis.momentum7d.toFixed(1)}%)`, weight: 15 });
        score += 15;
      } else if (analysis.momentum7d > 5) {
        signals.push({ type: "momentum", direction: "bearish", message: `Extended momentum (${analysis.momentum7d.toFixed(1)}%)`, weight: -15 });
        score -= 15;
      }
      if (analysis.dipFrom7d < -3) {
        signals.push({ type: "sma", direction: "bullish", message: `${analysis.dipFrom7d.toFixed(1)}% below 7-day avg`, weight: 20 });
        score += 20;
      } else if (analysis.dipFrom7d > 3) {
        signals.push({ type: "sma", direction: "bearish", message: `+${analysis.dipFrom7d.toFixed(1)}% above 7-day avg`, weight: -20 });
        score -= 20;
      }
      const volMult = analysis.volumeMultiplier ?? 1;
      const volMin = settings.volumeMinMultiplier ?? 1;
      const volPartial = settings.volumePartialMultiplier ?? 0.8;
      const volumeFactor = volMult >= volMin ? 1 : volMult >= volPartial ? 0.5 : 0;
      score *= volumeFactor;
      let overallSignal = "neutral";
      if (score >= 50) overallSignal = "strong_buy";
      else if (score >= 25) overallSignal = "buy";
      else if (score >= 10) overallSignal = "watch";
      else if (score <= -50) overallSignal = "strong_sell";
      else if (score <= -25) overallSignal = "sell";
      else if (score <= -10) overallSignal = "take_profit";
      const atr = analysis.atr ?? 0;
      const atrPercent = analysis.price > 0 && atr > 0 ? atr / analysis.price * 100 : 0;
      const atrTargetMult = settings.atrTargetMultiplier ?? 2;
      const atrStopMult = settings.atrStopMultiplier ?? 1.5;
      const suggestedTarget = Math.max(
        settings.defaultTargetPercent,
        atrPercent * atrTargetMult,
        // ATR-based: 2x ATR % for target
        analysis.volatility * 1.5,
        // 1.5x volatility
        analysis.resistance > 0 ? (analysis.resistance - analysis.price) / analysis.price * 100 : 0
      );
      const suggestedStop = Math.max(
        settings.defaultStopPercent,
        atrPercent * atrStopMult,
        // ATR-based: 1.5x ATR % for stop
        analysis.volatility * 1.2,
        // 1.2x volatility for stop
        analysis.support > 0 ? (analysis.price - analysis.support) / analysis.price * 100 + 0.5 : 0
      );
      return {
        symbol: analysis.symbol,
        price: analysis.price,
        score,
        signal: overallSignal,
        signals,
        suggestedTarget: Math.round(Math.min(suggestedTarget, 10) * 2) / 2,
        // Cap at 10%, round to 0.5%
        suggestedStop: Math.round(Math.min(suggestedStop, 5) * 2) / 2,
        // Cap at 5%, round to 0.5%
        volatility: analysis.volatility,
        rsi: analysis.rsi,
        adx,
        atr: analysis.atr,
        volumeMultiplier: analysis.volumeMultiplier,
        bollingerPosition: analysis.bollingerPosition,
        support: analysis.support,
        resistance: analysis.resistance
      };
    }
    async function scanSwingOpportunities() {
      const opportunities = [];
      const symbols = (vaultConfig.stocks || []).filter((sym) => STOCK_DATA[sym]);
      if (symbols.length === 0) {
        swingTradeData.lastSignalCheck = Date.now();
        swingTradeData.lastSignalBySymbol = {};
        return opportunities;
      }
      for (let i = 0; i < symbols.length; i++) {
        const sym = symbols[i];
        let analysis = vaultAnalysisCache[sym];
        let fetched = false;
        if (!analysis) {
          analysis = await analyzeStockForVault(sym);
          fetched = true;
        }
        if (analysis) {
          const opportunity = analyzeSwingOpportunity(analysis);
          if (opportunity) {
            opportunity.hasActivePosition = swingTradeData.activePositions.some((p) => p.symbol === sym);
            opportunity.currentShares = getOwnedShares(sym);
            opportunities.push(opportunity);
          }
        }
        if (fetched && i < symbols.length - 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      opportunities.sort((a, b) => b.score - a.score);
      swingTradeData.lastSignalCheck = Date.now();
      swingTradeData.lastSignalBySymbol = {};
      opportunities.forEach((o) => {
        swingTradeData.lastSignalBySymbol[o.symbol] = o;
      });
      return opportunities;
    }
    async function getTopSwingSignals(limit = 5) {
      const opportunities = await scanSwingOpportunities();
      const buySignals = opportunities.filter((o) => ["strong_buy", "buy", "watch"].includes(o.signal)).slice(0, limit);
      const sellSignals = opportunities.filter((o) => ["strong_sell", "sell", "take_profit"].includes(o.signal)).slice(0, limit);
      return { buySignals, sellSignals, all: opportunities };
    }
    async function refreshPositionSignals() {
      const positions = swingTradeData.activePositions;
      if (positions.length === 0) return;
      if (!swingTradeData.lastSignalBySymbol) swingTradeData.lastSignalBySymbol = {};
      const symbols = [...new Set(positions.map((p) => p.symbol))];
      for (const sym of symbols) {
        let analysis = vaultAnalysisCache[sym];
        if (!analysis) analysis = await analyzeStockForVault(sym);
        if (analysis) {
          const opportunity = analyzeSwingOpportunity(analysis);
          if (opportunity) swingTradeData.lastSignalBySymbol[sym] = opportunity;
        }
      }
      swingTradeData.lastSignalCheck = Date.now();
    }
    function formatSignalAge(msAgo) {
      if (msAgo < 6e4) return "&lt;1m";
      if (msAgo < 36e5) return Math.floor(msAgo / 6e4) + "m";
      if (msAgo < 864e5) return Math.floor(msAgo / 36e5) + "h";
      return Math.floor(msAgo / 864e5) + "d";
    }
    const SIGNAL_STALE_MS = 30 * 60 * 1e3;
    function renderSwingPositions() {
      updateAllPositionPrices();
      const positions = swingTradeData.activePositions;
      if (positions.length === 0) {
        return `<div class="swing-empty">
            <div style="font-size:24px; margin-bottom:8px;">\u{1F4CA}</div>
            <div>No active swing trades</div>
            <div style="font-size:10px; color:#666; margin-top:5px;">Add a position or use signals to find opportunities</div>
        </div>`;
      }
      let totalPL = 0;
      let totalValue = 0;
      const positionRows = positions.map((pos) => {
        const currentPrice = getPrice(pos.symbol) || pos.currentPrice;
        const pl = (currentPrice - pos.entryPrice) * pos.shares;
        const plPercent = (currentPrice - pos.entryPrice) / pos.entryPrice * 100;
        const value = currentPrice * pos.shares;
        totalPL += pl;
        totalValue += value;
        const priceRange = pos.targetPrice - pos.stopPrice;
        const currentProgress = currentPrice - pos.stopPrice;
        const progressPercent = Math.max(0, Math.min(100, currentProgress / priceRange * 100));
        const statusClass = pos.status === "target_hit" ? "target-hit" : pos.status === "stopped" ? "stopped" : "";
        const statusIcon = pos.status === "target_hit" ? "\u{1F3AF}" : pos.status === "stopped" ? "\u{1F6D1}" : "";
        const entryDate = new Date(pos.entryDate).toLocaleDateString();
        const holdDays = Math.ceil((Date.now() - pos.entryDate) / (1e3 * 60 * 60 * 24));
        const signalColors = { strong_buy: "#00e676", buy: "#66bb6a", watch: "#ffd54f", neutral: "#888", take_profit: "#ffb74d", sell: "#ff7043", strong_sell: "#ef5350" };
        const signalLabels = { strong_buy: "STRONG BUY", buy: "BUY", watch: "WATCH", neutral: "NEUTRAL", take_profit: "TAKE PROFIT", sell: "SELL", strong_sell: "STRONG SELL" };
        const opportunity = swingTradeData.lastSignalBySymbol?.[pos.symbol];
        const msAgo = swingTradeData.lastSignalCheck ? Date.now() - swingTradeData.lastSignalCheck : Infinity;
        const isStale = msAgo > SIGNAL_STALE_MS;
        let signalBadge = "";
        if (opportunity && opportunity.signal !== "neutral") {
          const ageStr = formatSignalAge(msAgo);
          const staleClass = isStale ? " swing-signal-stale" : "";
          signalBadge = `<span class="swing-pos-signal${staleClass}" style="background:${signalColors[opportunity.signal]}22; color:${signalColors[opportunity.signal]};" title="${isStale ? "Stale - click Refresh signals" : ""}">${signalLabels[opportunity.signal]} (${ageStr})</span>`;
        }
        return `
        <div class="swing-position ${statusClass}" data-id="${pos.id}">
            <div class="swing-pos-header">
                <div class="swing-pos-title-group">
                    <span class="swing-pos-symbol">${pos.symbol}</span>
                    ${signalBadge}
                </div>
                <div class="swing-pos-header-right">
                    <span class="swing-pos-pl ${pl >= 0 ? "positive" : "negative"}">${pl >= 0 ? "+" : ""}${formatMoney(pl)} (${plPercent >= 0 ? "+" : ""}${plPercent.toFixed(2)}%)</span>
                    ${statusIcon ? `<span class="swing-pos-status">${statusIcon}</span>` : ""}
                </div>
            </div>
            <div class="swing-pos-details">
                <div class="swing-pos-row">
                    <span>Entry: $${pos.entryPrice.toFixed(2)}</span>
                    <span>Current: $${currentPrice.toFixed(2)}</span>
                    <span>${pos.shares.toLocaleString()} shares</span>
                </div>
                <div class="swing-pos-row">
                    <span class="swing-stop">Stop: $${pos.stopPrice.toFixed(2)} (-${pos.stopPercent}%)</span>
                    <span class="swing-target">Target: $${pos.targetPrice.toFixed(2)} (+${pos.targetPercent}%)</span>
                </div>
                <div class="swing-pos-progress">
                    <div class="swing-progress-bar">
                        <div class="swing-progress-fill" style="width:${progressPercent}%"></div>
                        <div class="swing-progress-marker" style="left:${progressPercent}%"></div>
                    </div>
                    <div class="swing-progress-labels">
                        <span>Stop</span>
                        <span>Target</span>
                    </div>
                </div>
                <div class="swing-pos-meta">
                    <span>Opened: ${entryDate} (${holdDays}d)</span>
                    <span>Value: ${formatMoney(value)}</span>
                </div>
            </div>
            <div class="swing-pos-actions">
                <button class="swing-close-btn" data-id="${pos.id}" data-sym="${pos.symbol}">Close Position</button>
                <button class="swing-merge-btn" data-id="${pos.id}" title="Add shares to this position">Merge</button>
                <button class="swing-edit-btn" data-id="${pos.id}">Edit</button>
            </div>
        </div>`;
      }).join("");
      const summaryHtml = `
    <div class="swing-positions-summary">
        <div class="swing-summary-item">
            <span class="swing-summary-label">Active Positions</span>
            <span class="swing-summary-value">${positions.length}</span>
        </div>
        <div class="swing-summary-item ${totalPL >= 0 ? "positive" : "negative"}">
            <span class="swing-summary-label">Open P&L</span>
            <span class="swing-summary-value">${totalPL >= 0 ? "+" : ""}${formatMoney(totalPL)}</span>
        </div>
        <div class="swing-summary-item">
            <span class="swing-summary-label">Total Value</span>
            <span class="swing-summary-value">${formatMoney(totalValue)}</span>
        </div>
    </div>`;
      return summaryHtml + positionRows;
    }
    function renderSwingSignals(opportunities = null) {
      if (!opportunities) {
        return `<div class="swing-empty">
            <div style="font-size:24px; margin-bottom:8px;">\u{1F50D}</div>
            <div>Click "Scan" to analyze vault stocks</div>
        </div>`;
      }
      const signalColors = {
        "strong_buy": "#00e676",
        "buy": "#66bb6a",
        "watch": "#ffd54f",
        "neutral": "#888",
        "take_profit": "#ffb74d",
        "sell": "#ff7043",
        "strong_sell": "#ef5350"
      };
      const signalLabels = {
        "strong_buy": "\u{1F7E2} STRONG BUY",
        "buy": "\u{1F7E2} BUY",
        "watch": "\u{1F7E1} WATCH",
        "neutral": "\u26AA NEUTRAL",
        "take_profit": "\u{1F7E0} TAKE PROFIT",
        "sell": "\u{1F534} SELL",
        "strong_sell": "\u{1F534} STRONG SELL"
      };
      const interesting = opportunities.filter((o) => o.signal !== "neutral");
      if (interesting.length === 0) {
        return `<div class="swing-empty">
            <div style="font-size:24px; margin-bottom:8px;">\u{1F634}</div>
            <div>No strong signals right now</div>
            <div style="font-size:10px; color:#666; margin-top:5px;">Vault stocks only \u2014 add stocks in Settings \u2192 Vault</div>
        </div>`;
      }
      const buySignals = interesting.filter((o) => o.score > 0).slice(0, 8);
      const sellSignals = interesting.filter((o) => o.score < 0).slice(0, 8);
      let html = "";
      if (buySignals.length > 0) {
        html += `<div class="swing-signal-group">
            <div class="swing-signal-group-title" style="color:#66bb6a;">\u{1F4C8} Buy Opportunities</div>
            ${buySignals.map((sig) => `
            <div class="swing-signal-card buy" data-sym="${sig.symbol}">
                <div class="swing-signal-header">
                    <span class="swing-signal-symbol">${sig.symbol}</span>
                    <span class="swing-signal-badge" style="background:${signalColors[sig.signal]}22; color:${signalColors[sig.signal]};">${signalLabels[sig.signal]}</span>
                    <span class="swing-signal-score">Score: ${sig.score}</span>
                </div>
                <div class="swing-signal-price">$${sig.price.toFixed(2)}</div>
                <div class="swing-signal-reasons">
                    ${sig.signals.filter((s) => s.direction === "bullish").map((s) => `<span class="swing-reason bullish">\u2713 ${s.message}</span>`).join("")}
                </div>
                <div class="swing-signal-targets">
                    <span>Target: +${sig.suggestedTarget.toFixed(1)}% ($${(sig.price * (1 + sig.suggestedTarget / 100)).toFixed(2)})</span>
                    <span>Stop: -${sig.suggestedStop.toFixed(1)}% ($${(sig.price * (1 - sig.suggestedStop / 100)).toFixed(2)})</span>
                </div>
                <div class="swing-signal-actions">
                    ${!sig.hasActivePosition ? `<button class="swing-signal-track-btn" data-sym="${sig.symbol}" data-price="${sig.price}" data-target="${sig.suggestedTarget}" data-stop="${sig.suggestedStop}">Track Position</button>` : '<span class="swing-already-tracking">Already tracking</span>'}
                </div>
            </div>`).join("")}
        </div>`;
      }
      if (sellSignals.length > 0) {
        html += `<div class="swing-signal-group">
            <div class="swing-signal-group-title" style="color:#ef5350;">\u{1F4C9} Take Profit / Exit Signals</div>
            ${sellSignals.map((sig) => `
            <div class="swing-signal-card sell" data-sym="${sig.symbol}">
                <div class="swing-signal-header">
                    <span class="swing-signal-symbol">${sig.symbol}</span>
                    <span class="swing-signal-badge" style="background:${signalColors[sig.signal]}22; color:${signalColors[sig.signal]};">${signalLabels[sig.signal]}</span>
                    <span class="swing-signal-score">Score: ${sig.score}</span>
                </div>
                <div class="swing-signal-price">$${sig.price.toFixed(2)}</div>
                <div class="swing-signal-reasons">
                    ${sig.signals.filter((s) => s.direction === "bearish").map((s) => `<span class="swing-reason bearish">\u26A0 ${s.message}</span>`).join("")}
                </div>
                ${sig.currentShares > 0 ? `<div class="swing-signal-holding">You own ${sig.currentShares.toLocaleString()} shares</div>` : ""}
            </div>`).join("")}
        </div>`;
      }
      return html;
    }
    function renderSwingStats() {
      const stats = getSwingTradeStats("all");
      if (stats.totalTrades === 0) {
        return `<div class="swing-stats-empty">No completed trades yet</div>`;
      }
      return `
    <div class="swing-stats-grid">
        <div class="swing-stat-card">
            <span class="swing-stat-label">Total Trades</span>
            <span class="swing-stat-value">${stats.totalTrades}</span>
        </div>
        <div class="swing-stat-card ${stats.winRate >= 50 ? "positive" : "negative"}">
            <span class="swing-stat-label">Win Rate</span>
            <span class="swing-stat-value">${stats.winRate.toFixed(1)}%</span>
            <span class="swing-stat-sub">${stats.winners}W / ${stats.losers}L</span>
        </div>
        <div class="swing-stat-card ${stats.totalPnl >= 0 ? "positive" : "negative"}">
            <span class="swing-stat-label">Total P&L</span>
            <span class="swing-stat-value">${stats.totalPnl >= 0 ? "+" : ""}${formatMoneyWhole(stats.totalPnl)}</span>
        </div>
        <div class="swing-stat-card">
            <span class="swing-stat-label">Avg P&L</span>
            <span class="swing-stat-value ${stats.avgPnl >= 0 ? "positive" : "negative"}">${stats.avgPnl >= 0 ? "+" : ""}${formatMoneyWhole(stats.avgPnl)}</span>
            <span class="swing-stat-sub">(${stats.avgPnlPercent >= 0 ? "+" : ""}${stats.avgPnlPercent.toFixed(2)}%)</span>
        </div>
        <div class="swing-stat-card">
            <span class="swing-stat-label">Avg Hold</span>
            <span class="swing-stat-value">${stats.avgHoldDays.toFixed(1)} days</span>
        </div>
        ${stats.bestTrade ? `
        <div class="swing-stat-card positive">
            <span class="swing-stat-label">Best Trade</span>
            <span class="swing-stat-value">${stats.bestTrade.symbol}</span>
            <span class="swing-stat-sub">+${formatMoneyWhole(stats.bestTrade.pnl)}</span>
        </div>
        ` : ""}
    </div>`;
    }
    const JOURNAL_PRESET_TAGS = ["swing", "scalp", "mistake", "lesson", "rebalance", "vault"];
    function renderSwingJournalEntry(trade, editingTradeId = null) {
      const isEditing = editingTradeId === trade.id;
      const entryDate = new Date(trade.entryDate).toLocaleDateString();
      const exitDate = new Date(trade.exitDate).toLocaleDateString();
      const exitReasonLabels = { "target_hit": "\u{1F3AF} Target", "stopped": "\u{1F6D1} Stopped", "manual_close": "\u270B Manual" };
      const tags = trade.tags || [];
      if (isEditing) {
        return `
        <div class="swing-journal-entry swing-journal-entry-editing ${trade.pnl >= 0 ? "winner" : "loser"}" data-id="${trade.id}">
            <div class="swing-journal-inline-edit">
                <div class="swing-journal-inline-row">
                    <span class="swing-journal-symbol">${trade.symbol}</span>
                    <div class="swing-journal-inline-fields">
                        <label>Entry $</label><input type="number" class="swing-inline-input" data-field="entryPrice" step="0.01" value="${trade.entryPrice}">
                        <label>Exit $</label><input type="number" class="swing-inline-input" data-field="exitPrice" step="0.01" value="${trade.exitPrice}">
                        <label>Shares</label><input type="number" class="swing-inline-input" data-field="shares" value="${trade.shares}">
                    </div>
                </div>
                <div class="swing-journal-inline-actions">
                    <button class="swing-inline-save alfa-mini-btn" style="border-color:#66bb6a; color:#66bb6a;">Save</button>
                    <button class="swing-inline-cancel alfa-mini-btn" style="border-color:#888; color:#888;">Cancel</button>
                </div>
            </div>
        </div>`;
      }
      const notesRaw = trade.notes || "";
      const notesPreview = notesRaw ? notesRaw.length > 40 ? notesRaw.substring(0, 40) + "\u2026" : notesRaw : "";
      const notesEscaped = notesPreview.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
      return `
        <div class="swing-journal-entry ${trade.pnl >= 0 ? "winner" : "loser"}" data-id="${trade.id}">
            <div class="swing-journal-header">
                <span class="swing-journal-symbol">${trade.symbol}</span>
                <div class="swing-journal-header-right">
                    <span class="swing-journal-pnl ${trade.pnl >= 0 ? "positive" : "negative"}">${trade.pnl >= 0 ? "+" : ""}${formatMoneyWhole(trade.pnl)} (${trade.pnlPercent >= 0 ? "+" : ""}${trade.pnlPercent.toFixed(2)}%)</span>
                    <div class="swing-journal-actions">
                        <button class="swing-journal-edit-btn" data-id="${trade.id}" title="Quick edit">\u270F\uFE0F</button>
                        <button class="swing-journal-full-edit-btn" data-id="${trade.id}" title="Full edit">\u{1F4DD}</button>
                        <button class="swing-journal-delete-btn" data-id="${trade.id}" title="Delete">\u{1F5D1}\uFE0F</button>
                    </div>
                </div>
            </div>
            <div class="swing-journal-details">
                <span>Entry: $${trade.entryPrice.toFixed(2)} \u2192 Exit: $${trade.exitPrice.toFixed(2)}</span>
                <span>${trade.shares.toLocaleString()} shares</span>
            </div>
            <div class="swing-journal-meta">
                <span>${entryDate} \u2192 ${exitDate} (${trade.holdingDays}d)</span>
                <span>${exitReasonLabels[trade.exitReason] || trade.exitReason}</span>
                ${trade.fee > 0 ? `<span style="color:#ff9800;">Fee: ${formatMoneyWhole(trade.fee)}</span>` : ""}
            </div>
            ${tags.length ? `<div class="swing-journal-tags">${tags.map((t) => `<span class="swing-journal-tag">${(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`).join("")}</div>` : ""}
            ${notesPreview ? `<div class="swing-journal-notes-preview" title="${(trade.notes || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")}">${notesEscaped}</div>` : ""}
        </div>`;
    }
    function renderSwingJournal(editingTradeId = null) {
      const trades = swingTradeData.completedTrades.slice(0, 20);
      if (trades.length === 0) {
        return `<div class="swing-empty">
            <div style="font-size:24px; margin-bottom:8px;">\u{1F4D3}</div>
            <div>No completed trades</div>
        </div>`;
      }
      return trades.map((trade) => renderSwingJournalEntry(trade, editingTradeId)).join("");
    }
    function bindSwingPositionActions() {
      $(".swing-close-btn").off("click").on("click", function() {
        const id = $(this).data("id");
        const pos = swingTradeData.activePositions.find((p) => p.id === id);
        if (pos) openClosePositionModal(pos);
      });
      $(".swing-merge-btn").off("click").on("click", function() {
        openMergeIntoPositionModal($(this).data("id"));
      });
      $(".swing-edit-btn").off("click").on("click", function() {
        const id = $(this).data("id");
        openEditPositionModal(id);
      });
    }
    function bindSwingJournalActions(editingTradeId = null) {
      $(".swing-journal-edit-btn").off("click").on("click", function() {
        const id = $(this).data("id");
        $("#swing-journal-list").html(renderSwingJournal(id));
        bindSwingJournalActions(id);
      });
      $(".swing-journal-full-edit-btn").off("click").on("click", function() {
        openEditJournalEntryModal($(this).data("id"));
      });
      $(".swing-journal-delete-btn").off("click").on("click", function() {
        const id = $(this).data("id");
        const trade = swingTradeData.completedTrades.find((t) => t.id === id);
        if (trade && confirm(`Delete journal entry for ${trade.symbol}?
P&L: ${formatMoney(trade.pnl)}`)) {
          deleteJournalEntry(id);
          refreshSwingJournal();
        }
      });
      $(".swing-inline-save").off("click").on("click", function() {
        const entry = $(this).closest(".swing-journal-entry");
        const id = entry.data("id");
        const trade = swingTradeData.completedTrades.find((t) => t.id === id);
        if (!trade) return;
        trade.entryPrice = parseFloat(entry.find('[data-field="entryPrice"]').val()) || trade.entryPrice;
        trade.exitPrice = parseFloat(entry.find('[data-field="exitPrice"]').val()) || trade.exitPrice;
        trade.shares = parseInt(entry.find('[data-field="shares"]').val()) || trade.shares;
        recalculateCompletedTrade(trade);
        saveSwingTradeData();
        refreshSwingJournal();
      });
      $(".swing-inline-cancel").off("click").on("click", function() {
        refreshSwingJournal();
      });
    }
    function refreshSwingJournal() {
      $("#swing-stats").html(renderSwingStats());
      $("#swing-journal-list").html(renderSwingJournal());
      bindSwingJournalActions();
    }
    function openEditJournalEntryModal(tradeId) {
      const trade = swingTradeData.completedTrades.find((t) => t.id === tradeId);
      if (!trade) return;
      const tags = trade.tags || [];
      const tagsStr = tags.join(", ");
      const exitReasonOptions = [
        { v: "target_hit", l: "\u{1F3AF} Target" },
        { v: "stopped", l: "\u{1F6D1} Stopped" },
        { v: "manual_close", l: "\u270B Manual" }
      ].map((o) => `<option value="${o.v}" ${trade.exitReason === o.v ? "selected" : ""}>${o.l}</option>`).join("");
      const html = `
    <div class="add-position-form">
        <div class="form-group">
            <label>Stock: ${trade.symbol}</label>
            <input type="hidden" id="journal-edit-id" value="${trade.id}">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Entry Price ($)</label>
                <input type="number" id="journal-entry-price" class="alfa-input" step="0.01" value="${trade.entryPrice}">
            </div>
            <div class="form-group">
                <label>Exit Price ($)</label>
                <input type="number" id="journal-exit-price" class="alfa-input" step="0.01" value="${trade.exitPrice}">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Shares</label>
                <input type="number" id="journal-shares" class="alfa-input" value="${trade.shares}">
            </div>
            <div class="form-group">
                <label>Exit Reason</label>
                <select id="journal-exit-reason" class="alfa-select">${exitReasonOptions}</select>
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Entry Date</label>
                <input type="text" id="journal-entry-date" class="alfa-input" value="${new Date(trade.entryDate).toISOString().slice(0, 10)}" placeholder="YYYY-MM-DD">
            </div>
            <div class="form-group">
                <label>Exit Date</label>
                <input type="text" id="journal-exit-date" class="alfa-input" value="${new Date(trade.exitDate).toISOString().slice(0, 10)}" placeholder="YYYY-MM-DD">
            </div>
        </div>
        <div class="form-group">
            <label>Tags (comma-separated)</label>
            <input type="text" id="journal-tags" class="alfa-input" value="${tagsStr}" placeholder="swing, lesson, mistake">
            <span class="form-hint">Presets: ${JOURNAL_PRESET_TAGS.join(", ")}</span>
        </div>
        <div class="form-group">
            <label>Notes</label>
            <textarea id="journal-notes" class="alfa-input journal-notes-textarea" rows="4" placeholder="Lessons learned...">${(trade.notes || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
        </div>
        <div class="form-actions">
            <button id="journal-edit-save" class="alfa-main-btn" style="border-color:#caa14a; color:#caa14a; flex:1;">Save</button>
            <button id="journal-edit-cancel" class="alfa-main-btn" style="border-color:#888; color:#888;">Cancel</button>
        </div>
    </div>`;
      createModal("\u270F\uFE0F Edit Journal Entry", html);
      $("#journal-edit-save").on("click", function() {
        const id = $("#journal-edit-id").val();
        const t = swingTradeData.completedTrades.find((x) => x.id === id);
        if (!t) return;
        t.entryPrice = parseFloat($("#journal-entry-price").val()) || t.entryPrice;
        t.exitPrice = parseFloat($("#journal-exit-price").val()) || t.exitPrice;
        t.shares = parseInt($("#journal-shares").val()) || t.shares;
        t.exitReason = $("#journal-exit-reason").val() || t.exitReason;
        const ed = $("#journal-entry-date").val();
        const exd = $("#journal-exit-date").val();
        if (ed) t.entryDate = new Date(ed).getTime();
        if (exd) t.exitDate = new Date(exd).getTime();
        t.notes = $("#journal-notes").val().trim();
        const tagsInput = $("#journal-tags").val().trim();
        t.tags = tagsInput ? tagsInput.split(",").map((s) => s.trim()).filter(Boolean) : [];
        recalculateCompletedTrade(t);
        saveSwingTradeData();
        closeModal();
        refreshSwingJournal();
      });
      $("#journal-edit-cancel").on("click", closeModal);
    }
    function bindSwingSignalActions() {
      $(".swing-signal-track-btn").off("click").on("click", function() {
        const sym = $(this).data("sym");
        const price = parseFloat($(this).data("price"));
        const target = parseFloat($(this).data("target"));
        const stop = parseFloat($(this).data("stop"));
        openAddPositionModal(sym, price, target, stop);
      });
    }
    function updateSignalCardsForTrackedSymbol(symbol) {
      $(".swing-signal-card.buy[data-sym='" + symbol + "']").each(function() {
        const $btn = $(this).find(".swing-signal-track-btn");
        if ($btn.length) {
          $btn.replaceWith('<span class="swing-already-tracking">Already tracking</span>');
        }
      });
    }
    function openAddPositionModal(prefillSym = "", prefillPrice = 0, prefillTarget = 3, prefillStop = 2) {
      const stockOptions = Object.keys(STOCK_DATA).sort().map(
        (sym) => `<option value="${sym}" ${sym === prefillSym ? "selected" : ""}>${sym}</option>`
      ).join("");
      let currentPrice = prefillPrice;
      if (prefillSym && !currentPrice) {
        currentPrice = getPrice(prefillSym) || 0;
      }
      let currentShares = 0;
      if (prefillSym) {
        currentShares = getOwnedShares(prefillSym);
      }
      const html = `
    <div class="add-position-form">
        <div class="form-group">
            <label>Stock Symbol</label>
            <select id="pos-symbol" class="alfa-select">
                <option value="">Select Stock...</option>
                ${stockOptions}
            </select>
        </div>
        
        <div id="pos-merge-notice" class="pos-merge-notice" style="display:none;">
            <span>You already have an open position for <strong id="pos-merge-sym"></strong>.</span>
            <div class="pos-merge-buttons">
                <button id="pos-merge-btn" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a;">Add to existing</button>
                <button id="pos-create-new-btn" class="alfa-mini-btn" style="border-color:#888; color:#888;">Create new position</button>
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Entry Price ($)</label>
                <input type="number" id="pos-entry-price" class="alfa-input" step="0.01" value="${currentPrice.toFixed(2)}" placeholder="0.00">
                <span class="form-hint" id="pos-current-price">Current: $${currentPrice.toFixed(2)}</span>
            </div>
            <div class="form-group">
                <label id="pos-shares-label">Shares</label>
                <input type="number" id="pos-shares" class="alfa-input" value="${currentShares}" placeholder="0">
                <span class="form-hint" id="pos-owned-shares">Owned: ${currentShares.toLocaleString()}</span>
            </div>
        </div>

        <div class="form-group pos-source-modes">
            <label class="quick-trade-label">Position source</label>
            <div class="pos-source-options">
                <label class="pos-source-option"><input type="radio" name="pos-source" value="track" ${currentShares > 0 ? "checked" : ""}> Track owned</label>
                <label class="pos-source-option"><input type="radio" name="pos-source" value="buy" ${currentShares > 0 ? "" : "checked"}> Buy with cash</label>
                <label class="pos-source-option"><input type="radio" name="pos-source" value="track_buy"> Track + buy more</label>
            </div>
            <div id="pos-buy-extra-wrap" class="form-group" style="display:none; margin-top:4px;">
                <label id="pos-buy-amount-label">Amount to buy ($)</label>
                <input type="text" id="pos-buy-amount" class="alfa-input" value="" placeholder="e.g. 100k, 1m">
                <span class="form-hint" id="pos-cash-hint">Cash: -- \u2248 0 shares</span>
            </div>
            <div id="pos-trade-status" class="swing-trade-status" style="margin-top:6px;"></div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label id="pos-target-label">Target % Gain</label>
                <div class="form-row" style="gap:8px; align-items:center;">
                    <input type="number" id="pos-target" class="alfa-input" step="0.01" value="${prefillTarget}" placeholder="3" style="flex:1;">
                    <select id="pos-target-unit" class="alfa-select" style="width:56px;">
                        <option value="pct">%</option>
                        <option value="dol">$</option>
                    </select>
                </div>
                <span class="form-hint" id="pos-target-hint">Target: $${(currentPrice * (1 + prefillTarget / 100)).toFixed(2)}</span>
            </div>
            <div class="form-group">
                <label id="pos-stop-label">Stop % Loss</label>
                <div class="form-row" style="gap:8px; align-items:center;">
                    <input type="number" id="pos-stop" class="alfa-input" step="0.01" value="${prefillStop}" placeholder="2" style="flex:1;">
                    <select id="pos-stop-unit" class="alfa-select" style="width:56px;">
                        <option value="pct">%</option>
                        <option value="dol">$</option>
                    </select>
                </div>
                <span class="form-hint" id="pos-stop-hint">Stop: $${(currentPrice * (1 - prefillStop / 100)).toFixed(2)}</span>
            </div>
        </div>
        
        <div class="form-group">
            <label>Notes (optional)</label>
            <textarea id="pos-notes" class="alfa-input journal-notes-textarea" rows="2" placeholder="Why are you taking this trade?"></textarea>
        </div>
        
        <div class="form-summary" id="pos-summary">
            <div class="summary-row">
                <span>Position Value:</span>
                <span id="pos-value">$${(currentPrice * currentShares).toLocaleString("en-US", { maximumFractionDigits: 2 })}</span>
            </div>
            <div class="summary-row" id="pos-buy-cost-row" style="display:none;">
                <span>Buy Cost:</span>
                <span id="pos-buy-cost">$0</span>
            </div>
            <div class="summary-row">
                <span>Potential Profit:</span>
                <span id="pos-potential-profit" class="positive">+$${(currentPrice * (prefillTarget / 100) * currentShares).toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Max Loss:</span>
                <span id="pos-max-loss" class="negative">-$${(currentPrice * (prefillStop / 100) * currentShares).toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Risk/Reward:</span>
                <span id="pos-risk-reward">${(prefillTarget / prefillStop).toFixed(2)}:1</span>
            </div>
        </div>
        
        <div class="form-actions">
            <button id="pos-submit" class="alfa-main-btn" style="border-color:#66bb6a; color:#66bb6a; flex:1;">Add Position</button>
            <button id="pos-cancel" class="alfa-main-btn" style="border-color:#888; color:#888;">Cancel</button>
        </div>
    </div>`;
      createModal("\u{1F4CA} Add Swing Position", html);
      (function enhancePosSymbolSelect() {
        const $sel = $("#pos-symbol");
        if (!$sel.length || $sel.data("enhanced")) return;
        $sel.data("enhanced", true);
        const $wrap = $('<div class="pos-symbol-wrap"></div>');
        $sel.before($wrap);
        $wrap.append($sel.addClass("pos-symbol-native"));
        const selectedLabel = () => {
          const t = $sel.find("option:selected").text();
          return t || "Select Stock...";
        };
        const $btn = $(`<button type="button" class="alfa-select pos-symbol-trigger">${selectedLabel()}</button>`);
        const $menu = $('<div class="pos-symbol-menu" hidden></div>');
        $wrap.append($btn, $menu);
        function rebuildMenu() {
          $menu.empty();
          $sel.find("option").each(function() {
            const val = String(this.value);
            const text = $(this).text();
            const $item = $(`<button type="button" class="pos-symbol-option" data-value="${val}"></button>`).text(text);
            if (val === String($sel.val() || "")) $item.addClass("is-selected");
            $menu.append($item);
          });
        }
        function closeMenu() {
          $menu.prop("hidden", true);
          $btn.attr("aria-expanded", "false");
        }
        function openMenu() {
          rebuildMenu();
          $menu.prop("hidden", false);
          $btn.attr("aria-expanded", "true");
        }
        $btn.on("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          if ($menu.prop("hidden")) openMenu();
          else closeMenu();
        });
        $menu.on("click", ".pos-symbol-option", function(e) {
          e.preventDefault();
          e.stopPropagation();
          const val = String($(this).data("value") ?? "");
          $sel.val(val).trigger("change");
          $btn.text($(this).text());
          closeMenu();
        });
        $("#alfa-modal-overlay").on("mousedown.posSymbol", function(e) {
          if (!$(e.target).closest(".pos-symbol-wrap").length) closeMenu();
        });
      })();
      function checkMergeNotice() {
        const sym = $("#pos-symbol").val();
        const existing = swingTradeData.activePositions.find((p) => p.symbol === sym);
        if (existing) {
          $("#pos-merge-notice").show();
          $("#pos-merge-sym").text(sym);
        } else {
          $("#pos-merge-notice").hide();
        }
      }
      $("#pos-merge-btn").on("click", function() {
        const sym = $("#pos-symbol").val();
        const existing = swingTradeData.activePositions.find((p) => p.symbol === sym);
        if (existing) {
          closeModal();
          openMergeIntoPositionModal(existing.id);
        }
      });
      $("#pos-create-new-btn").on("click", function() {
        $("#pos-merge-notice").hide();
      });
      function getPosSourceMode() {
        return $("input[name='pos-source']:checked").val() || "track";
      }
      function syncPosSourceUI(opts2 = {}) {
        const mode = getPosSourceMode();
        const sym = $("#pos-symbol").val();
        const owned = sym ? getOwnedShares(sym) : 0;
        const cash = getMoneyFast() || 0;
        $("#pos-owned-shares").text(`Owned: ${owned.toLocaleString()}`);
        $("#pos-cash-hint").text(`Cash: ${formatMoney(cash)} \u2248 0 shares`);
        if (mode === "track") {
          $("#pos-shares-label").text("Shares to track");
          $("#pos-shares").closest(".form-group").show();
          $("#pos-buy-extra-wrap").hide();
          $("#pos-buy-cost-row").hide();
          $("#pos-submit").text("Add Position");
          if (opts2.resetShares) $("#pos-shares").val(owned > 0 ? owned : 0);
        } else if (mode === "buy") {
          $("#pos-shares").closest(".form-group").hide();
          $("#pos-buy-extra-wrap").show();
          $("#pos-buy-cost-row").show();
          $("#pos-submit").text("Buy & Add");
          if (opts2.resetShares) $("#pos-buy-amount").val(cash > 0 ? String(Math.round(cash)) : "");
        } else {
          $("#pos-shares-label").text("Shares to track");
          $("#pos-shares").closest(".form-group").show();
          $("#pos-buy-extra-wrap").show();
          $("#pos-buy-cost-row").show();
          $("#pos-submit").text("Buy & Add");
          if (opts2.resetShares) {
            $("#pos-shares").val(owned > 0 ? owned : 0);
            $("#pos-buy-amount").val("");
          }
        }
        updatePositionSummary();
      }
      $("#pos-symbol").on("change", function() {
        const sym = $(this).val();
        if (sym) {
          const price = getPrice(sym) || 0;
          const owned = getOwnedShares(sym);
          $("#pos-entry-price").val(price.toFixed(2));
          $("#pos-current-price").text(`Current: $${price.toFixed(2)}`);
          $("input[name='pos-source'][value='" + (owned > 0 ? "track" : "buy") + "']").prop("checked", true);
          syncPosSourceUI({ resetShares: true });
          checkMergeNotice();
        } else {
          $("#pos-merge-notice").hide();
        }
      });
      checkMergeNotice();
      syncPosSourceUI({ resetShares: false });
      $("input[name='pos-source']").on("change", function() {
        syncPosSourceUI({ resetShares: true });
      });
      $("#pos-entry-price, #pos-shares, #pos-buy-amount, #pos-target, #pos-stop, #pos-target-unit, #pos-stop-unit").on("input change", updatePositionSummary);
      function getTargetStopPrices() {
        const price = parseFloat($("#pos-entry-price").val()) || 0;
        const targetVal = parseFloat($("#pos-target").val());
        const stopVal = parseFloat($("#pos-stop").val());
        const targetUnit = $("#pos-target-unit").val();
        const stopUnit = $("#pos-stop-unit").val();
        let targetPrice, stopPrice, targetPercent, stopPercent;
        if (targetUnit === "dol" && targetVal != null && !isNaN(targetVal)) {
          targetPrice = targetVal;
          targetPercent = price > 0 ? (targetPrice / price - 1) * 100 : 0;
        } else {
          targetPercent = targetVal != null && !isNaN(targetVal) ? targetVal : 3;
          targetPrice = price * (1 + targetPercent / 100);
        }
        if (stopUnit === "dol" && stopVal != null && !isNaN(stopVal)) {
          stopPrice = stopVal;
          stopPercent = price > 0 ? (1 - stopPrice / price) * 100 : 0;
        } else {
          stopPercent = stopVal != null && !isNaN(stopVal) ? stopVal : 2;
          stopPrice = price * (1 - stopPercent / 100);
        }
        return { price, targetPrice, stopPrice, targetPercent, stopPercent };
      }
      function resolvePosBuyShares(tradePrice) {
        const mode = getPosSourceMode();
        if (mode !== "buy" && mode !== "track_buy") return 0;
        if (tradePrice <= 0) return 0;
        const raw = String($("#pos-buy-amount").val() || "").trim();
        if (!raw) return 0;
        const dollars = parseTornNumber(raw);
        if (!dollars || dollars <= 0 || isNaN(dollars)) return 0;
        return Math.floor(dollars / tradePrice);
      }
      function updatePositionSummary() {
        const { price, targetPrice, stopPrice, targetPercent, stopPercent } = getTargetStopPrices();
        const mode = getPosSourceMode();
        const trackShares = parseInt($("#pos-shares").val(), 10) || 0;
        const tradePrice = getPriceForTrade($("#pos-symbol").val()) || price;
        const buyShares = resolvePosBuyShares(tradePrice);
        const totalShares = mode === "buy" ? buyShares : mode === "track_buy" ? trackShares + buyShares : trackShares;
        const value = tradePrice * totalShares;
        const potentialProfit = (targetPrice - tradePrice) * totalShares;
        const maxLoss = (tradePrice - stopPrice) * totalShares;
        const riskReward = tradePrice - stopPrice > 0 ? (targetPrice - tradePrice) / (tradePrice - stopPrice) : 0;
        const buyCost = buyShares * tradePrice;
        $("#pos-target-hint").text($("#pos-target-unit").val() === "pct" ? `Target: $${targetPrice.toFixed(2)}` : `Target: ${targetPercent.toFixed(2)}%`);
        $("#pos-stop-hint").text($("#pos-stop-unit").val() === "pct" ? `Stop: $${stopPrice.toFixed(2)}` : `Stop: ${stopPercent.toFixed(2)}%`);
        $("#pos-value").text(`$${value.toLocaleString("en-US", { maximumFractionDigits: 2 })}`);
        $("#pos-buy-cost").text(formatMoney(buyCost));
        $("#pos-potential-profit").text(`+$${potentialProfit.toFixed(2)}`);
        $("#pos-max-loss").text(`-$${maxLoss.toFixed(2)}`);
        $("#pos-risk-reward").text(`${riskReward.toFixed(2)}:1`);
        const cash = getMoneyFast() || 0;
        $("#pos-cash-hint").text(`Cash: ${formatMoney(cash)} \u2248 ${buyShares.toLocaleString()} shares`);
      }
      $("#pos-target-unit").on("change", function() {
        const price = parseFloat($("#pos-entry-price").val()) || 0;
        const targetVal = parseFloat($("#pos-target").val());
        if (price <= 0) return;
        if ($(this).val() === "dol") {
          const pct = targetVal != null && !isNaN(targetVal) ? targetVal : 3;
          $("#pos-target").val((price * (1 + pct / 100)).toFixed(2));
        } else {
          const dol = targetVal != null && !isNaN(targetVal) ? targetVal : price * 1.03;
          $("#pos-target").val(price > 0 ? ((dol / price - 1) * 100).toFixed(2) : 3);
        }
        updatePositionSummary();
      });
      $("#pos-stop-unit").on("change", function() {
        const price = parseFloat($("#pos-entry-price").val()) || 0;
        const stopVal = parseFloat($("#pos-stop").val());
        if (price <= 0) return;
        if ($(this).val() === "dol") {
          const pct = stopVal != null && !isNaN(stopVal) ? stopVal : 2;
          $("#pos-stop").val((price * (1 - pct / 100)).toFixed(2));
        } else {
          const dol = stopVal != null && !isNaN(stopVal) ? stopVal : price * 0.98;
          $("#pos-stop").val(price > 0 ? ((1 - dol / price) * 100).toFixed(2) : 2);
        }
        updatePositionSummary();
      });
      $("#pos-submit").on("click", async function() {
        const sym = $("#pos-symbol").val();
        const entryInput = parseFloat($("#pos-entry-price").val()) || 0;
        const mode = getPosSourceMode();
        const trackShares = parseInt($("#pos-shares").val(), 10) || 0;
        const notes = $("#pos-notes").val().trim();
        const { targetPrice, stopPrice, targetPercent, stopPercent } = getTargetStopPrices();
        const $btn = $(this);
        const $status = $("#pos-trade-status");
        if (!sym) {
          alert("Please select a stock");
          return;
        }
        if (entryInput <= 0) {
          alert("Please enter a valid entry price");
          return;
        }
        let finalShares = 0;
        let finalEntry = entryInput;
        if (mode === "track") {
          if (trackShares <= 0) {
            alert("Please enter number of shares to track");
            return;
          }
          const owned = getOwnedShares(sym);
          if (trackShares > owned) {
            alert("You only own " + owned.toLocaleString() + " shares. Switch to Buy, or lower shares.");
            return;
          }
          finalShares = trackShares;
          finalEntry = entryInput;
        } else if (mode === "buy") {
          const tradePrice = getPriceForTrade(sym);
          if (tradePrice <= 0) {
            alert("Price unavailable");
            return;
          }
          const buyShares = resolvePosBuyShares(tradePrice);
          if (buyShares <= 0) {
            alert("Enter a dollar amount to buy (e.g. 100k)");
            return;
          }
          const cash = getMoneyFast() || 0;
          const cost = buyShares * tradePrice;
          if (cost > cash) {
            alert("Insufficient cash. Need " + formatMoney(cost - cash) + " more.");
            return;
          }
          $btn.prop("disabled", true).text("Buying...");
          $status.html('<span style="color:#ffb74d;">Buying ' + buyShares.toLocaleString() + " shares...</span>");
          try {
            await postTradeAsync(sym, buyShares, "buyShares");
            finalShares = buyShares;
            finalEntry = tradePrice;
          } catch (e) {
            console.error("Swing buy error:", e);
            $status.html('<span style="color:#ef5350;">Buy failed: ' + (e.message || e) + "</span>");
            $btn.prop("disabled", false).text("Buy & Add");
            return;
          }
        } else {
          const tradePrice = getPriceForTrade(sym) || entryInput;
          const buyShares = resolvePosBuyShares(tradePrice);
          if (trackShares <= 0 && buyShares <= 0) {
            alert("Enter shares to track and/or a buy amount");
            return;
          }
          if (trackShares > 0) {
            const owned = getOwnedShares(sym);
            if (trackShares > owned) {
              alert("You only own " + owned.toLocaleString() + " shares to track.");
              return;
            }
          }
          if (buyShares > 0) {
            if (tradePrice <= 0) {
              alert("Price unavailable");
              return;
            }
            const cash = getMoneyFast() || 0;
            const cost = buyShares * tradePrice;
            if (cost > cash) {
              alert("Insufficient cash. Need " + formatMoney(cost - cash) + " more.");
              return;
            }
            $btn.prop("disabled", true).text("Buying...");
            $status.html('<span style="color:#ffb74d;">Buying ' + buyShares.toLocaleString() + " shares...</span>");
            try {
              await postTradeAsync(sym, buyShares, "buyShares");
              finalShares = trackShares + buyShares;
              finalEntry = finalShares > 0 ? (trackShares * entryInput + buyShares * tradePrice) / finalShares : tradePrice;
            } catch (e) {
              console.error("Swing buy error:", e);
              $status.html('<span style="color:#ef5350;">Buy failed: ' + (e.message || e) + "</span>");
              $btn.prop("disabled", false).text("Buy & Add");
              return;
            }
          } else {
            finalShares = trackShares;
            finalEntry = entryInput;
          }
        }
        if (finalShares <= 0) {
          alert("Please enter a valid amount");
          return;
        }
        addSwingPosition(sym, finalEntry, finalShares, targetPercent, stopPercent, notes, targetPrice, stopPrice);
        closeModal();
        updateVaultDisplay(true);
        $("#swing-positions-list").html(renderSwingPositions());
        bindSwingPositionActions();
        updateSignalCardsForTrackedSymbol(sym);
      });
      $("#pos-cancel").on("click", closeModal);
    }
    function getSwingBenefitLockedShares(sym, owned) {
      return blockReserve(sym, owned, blocksEnabled());
    }
    function blocksEnabled() {
      const toggle = $("#alfa-lock-toggle");
      return toggle.length ? toggle.is(":checked") : localStorage.getItem("alfa_vault_lock") === "true";
    }
    const blockBenefitLabels = {
      "WSU": "Education · 10% shorter courses",
      "IST": "Education · Free courses",
      "THS": "Medical · Box of Medical Supplies",
      "SYM": "Drugs · Drug Pack",
      "MCS": "Training · 100 energy",
      "EVL": "Training · 1,000 happiness",
      "FHG": "Training · Hotel coupon",
      "MUN": "Training · Energy drink six-pack",
      "PRN": "Training · Erotic DVD",
      "CBD": "Crimes · 50 nerve",
      "LAG": "Crimes · Lawyer business card",
      "PTS": "Points · 100 points",
      "TCI": "Banking · 10% interest bonus",
      "TCM": "Racing · 10% racing skill boost",
      "WLT": "Travel · Private jet access",
      "HRG": "Property · Random property",
      "ELT": "Property · 10% upgrade discount",
      "ASS": "Alcohol · Six-pack",
      "BAG": "Combat · Ammunition pack",
      "EWM": "Combat · Grenade box",
      "TCC": "Clothing · Clothing cache",
      "LOS": "Missions · 25% more credits and cash",
      "IIL": "Coding · 50% shorter virus coding time",
      "SYS": "Security · Advanced firewall",
      "TCP": "Company · Sales boost",
      "TGP": "Company · Advertising boost",
      "MSG": "Advertising · Free classifieds",
      "YAZ": "Advertising · Free banners",
      "LSC": "Lottery · Voucher",
      "CNC": "Cash · $80M",
      "GRN": "Cash · $4M",
      "IOU": "Cash · $12M",
      "TMI": "Cash · $25M",
      "TCT": "Cash · $1M",
      "TSB": "Cash · $50M"
    };
    let educationCheck = null;
    function pagePlayerId() {
      try { return Number(JSON.parse(document.getElementById("torn-user")?.value || "{}").id) || 0; }
      catch { return 0; }
    }
    function educationProgress(catalog, record) {
      if (!Array.isArray(catalog) || !catalog.length || !Array.isArray(record?.complete) ||
          !Object.hasOwn(record, "current")) return "unknown";
      const valid = id => Number.isSafeInteger(id) && id > 0;
      if (!record.complete.every(valid)) return "unknown";
      const required = new Set();
      for (const department of catalog) {
        if (!Array.isArray(department?.courses) || !department.courses.length) return "unknown";
        for (const course of department.courses) {
          if (!valid(course?.id) || required.has(course.id)) return "unknown";
          required.add(course.id);
        }
      }
      if (record.current !== null) return "unfinished";
      const completed = new Set(record.complete);
      return [...required].every(id => completed.has(id)) ? "complete" : "unfinished";
    }
    function educationVerified() {
      return educationCheck?.state === "complete" && Date.now() < educationCheck.expires &&
        educationCheck.player === pagePlayerId() && educationCheck.key === localStorage.getItem("alfa_vault_apikey");
    }
    async function refreshEducation() {
      const key = localStorage.getItem("alfa_vault_apikey");
      const player = pagePlayerId();
      if (!key || !player) { educationCheck = null; return "unknown"; }
      if (educationCheck?.key === key && educationCheck.player === player && Date.now() < educationCheck.expires)
        return educationCheck.pending || educationCheck.state;
      const check = {key, player, expires: Date.now() + 300000, state: "unknown"};
      educationCheck = check;
      check.pending = (async () => {
        try {
          const query = "?key=" + encodeURIComponent(key);
          const [identity, user, master] = await Promise.all([
            tornApiFetch("https://api.torn.com/user/" + query + "&selections=basic"),
            tornApiFetch("https://api.torn.com/v2/user/education" + query),
            tornApiFetch("https://api.torn.com/v2/torn/education" + query)
          ]);
          if (Number(identity?.player_id) === player && pagePlayerId() === player && !user?.error && !master?.error)
            check.state = educationProgress(master?.education, user?.education);
        } catch { check.state = "unknown"; }
        check.pending = null;
        if (check.state === "unknown") check.expires = Date.now() + 30000;
        return check.state;
      })();
      return check.pending;
    }
    function nextBlockProgress(symbol) {
      const owned = Math.max(getOwnedShares(symbol), getOwnedSharesFromDom(symbol));
      if (!Number.isSafeInteger(owned) || owned < 0) return null;
      const tier = getBenefitTier(symbol, owned).tier + 1;
      const target = goalThreshold(symbol, {symbol, tier});
      if (!target) return {complete: true};
      const remaining = target - owned;
      const priceCents = Math.round(getPrice(symbol) * 100);
      const cost = remaining * priceCents;
      const cents = priceCents > 0 && Number.isSafeInteger(cost) ? cost : null;
      return {symbol, tier, owned, target, remaining, cents};
    }
    function benefitOption(symbol, label) {
      const progress = stockRows[symbol] ? nextBlockProgress(symbol) : null;
      const locked = vaultConfig.lockedStocks?.includes(symbol);
      let detail = "Holdings unavailable";
      if (progress?.complete) detail = "Complete · 0 shares needed · $0 left";
      else if (progress) {
        const percent = Math.floor(progress.owned / progress.target * 1000) / 10;
        const cost = progress.cents === null ? "price unavailable" :
          "$" + (progress.cents / 100).toLocaleString("en-US", {maximumFractionDigits: 2}) + " left";
        detail = "Tier " + progress.tier + " · " + percent + "% · " + progress.remaining.toLocaleString("en-US") + " shares needed · " + cost;
      }
      const disabled = locked || !progress || progress.complete || progress.cents === null;
      return `<option value="${symbol}" ${disabled ? "disabled" : ""}>${label} (${symbol}) · ${detail}${locked ? " · Locked" : ""}</option>`;
    }
    function easiestBlockGoal(symbols = Object.keys(STOCK_DATA).sort()) {
      let best = null;
      for (const symbol of symbols) {
        if (vaultConfig.lockedStocks?.includes(symbol)) continue;
        const next = nextBlockProgress(symbol);
        if (next?.remaining > 0 && next.cents !== null && (!best || next.cents < best.cents)) best = next;
      }
      return best;
    }
    function goalThreshold(sym, goal) {
      if (!goal || goal.symbol !== sym || (sym === "MCS" && goal.tier > 10)) return 0;
      const stock = STOCK_DATA[sym];
      if (!stock || !Number.isSafeInteger(goal.tier) || goal.tier < 1 || (stock.type === "P" && goal.tier !== 1)) return 0;
      const required = stock.base * (2 ** goal.tier - 1);
      return Number.isSafeInteger(required) ? required : 0;
    }
    function blockReserve(sym, owned, enabled) {
      if (!enabled || !STOCK_DATA[sym]) return 0;
      if (sym === "WSU" && vaultConfig.educationProtection)
        return educationVerified() ? 0 : Math.min(owned, STOCK_DATA.WSU.base);
      const tier = getBenefitTier(sym, owned).tier;
      const earned = STOCK_DATA[sym].base * (2 ** tier - 1);
      return Math.min(owned, Math.max(earned, goalThreshold(sym, vaultConfig.blockGoal)));
    }
    function checkGoalSale(sym, shares) {
      const target = goalThreshold(sym, vaultConfig.blockGoal);
      const educationGuard = sym === "WSU" && vaultConfig.educationProtection;
      if (educationGuard && vaultConfig.lockedStocks?.includes(sym)) throw new Error("WSU is manually locked.");
      if ((!target && !educationGuard) || !blocksEnabled()) return;
      const owned = Math.min(getOwnedShares(sym), getOwnedSharesFromDom(sym));
      if (shares > owned - blockReserve(sym, owned, true)) {
        throw new Error("Sale would use shares protected for " + sym + ". Refresh the plan or change the goal in Protection settings.");
      }
    }
    function openClosePositionModal(pos) {
      if (!pos) return;
      const currentPrice = getPriceForTrade(pos.symbol) || getPrice(pos.symbol) || pos.currentPrice || pos.entryPrice;
      const totalShares = pos.shares;
      const owned = getOwnedShares(pos.symbol);
      const benefitLocked = getSwingBenefitLockedShares(pos.symbol, owned);
      const goalActive = blocksEnabled() && (goalThreshold(pos.symbol, vaultConfig.blockGoal) > 0 || (pos.symbol === "WSU" && vaultConfig.educationProtection));
      const maxOwnedSellable = Math.max(0, owned - (goalActive ? benefitLocked : 0));
      const exitReasonOptions = [
        { v: "manual_close", l: "\u270B Manual" },
        { v: "target_hit", l: "\u{1F3AF} Target" },
        { v: "stopped", l: "\u{1F6D1} Stopped" }
      ].map((o) => `<option value="${o.v}">${o.l}</option>`).join("");
      const html = `
    <div class="quick-trade-container">
        <div class="quick-trade-header">
            <span class="quick-trade-symbol">${pos.symbol}</span>
            <span class="quick-trade-price">${formatMoney(currentPrice)}</span>
        </div>

        <div class="quick-trade-info">
            <div class="quick-trade-info-row">
                <span>Entry Price</span>
                <span>${formatMoney(pos.entryPrice)}</span>
            </div>
            <div class="quick-trade-info-row">
                <span>Total Shares</span>
                <span>${pos.shares.toLocaleString()}</span>
            </div>
            <div class="quick-trade-info-row">
                <span>Gross Proceeds</span>
                <span id="close-pos-gross">-</span>
            </div>
            <div class="quick-trade-info-row">
                <span>Fee (0.1%)</span>
                <span id="close-pos-fee" style="color:#888;">-</span>
            </div>
        </div>

        <div class="quick-trade-calc">
            <div class="quick-trade-calc-row highlight">
                <span>Net P&L</span>
                <span id="close-pos-pnl">-</span>
            </div>
        </div>

        <div class="quick-trade-input-section">
            <label class="quick-trade-label">Shares to close</label>
            <div class="form-row" style="gap:8px; align-items:center;">
                <input type="number" id="close-pos-shares" class="alfa-input" min="1" max="${totalShares}" value="${totalShares}" placeholder="${totalShares}" style="flex:1;">
                <span class="form-hint" style="margin:0;">of ${totalShares.toLocaleString()}</span>
            </div>
            <span class="form-hint" id="close-pos-partial-hint" style="display:none;">Partial close: position will stay open with remaining shares.</span>
            <div class="quick-trade-hint" id="close-pos-tier-hint" style="display:none;"></div>
        </div>

        <div class="quick-trade-input-section">
            <label class="quick-trade-label">Exit Reason</label>
            <select id="close-pos-exit-reason" class="alfa-select" style="width:100%;">${exitReasonOptions}</select>
        </div>

        <div class="quick-trade-input-section">
            <label class="swing-sell-toggle">
                <input type="checkbox" id="close-pos-sell" ${maxOwnedSellable > 0 ? "checked" : ""} ${maxOwnedSellable <= 0 ? "disabled" : ""}>
                <span>Sell shares on close</span>
            </label>
            <div class="quick-trade-hint" id="close-pos-sell-hint">${maxOwnedSellable > 0 ? "Sells the full close amount at market, then closes tracking." : "No owned shares to sell. Uncheck sell to close tracking only."}</div>
        </div>

        <div id="close-pos-status" class="swing-trade-status" style="margin-top:8px;"></div>

        <div class="quick-trade-actions">
            <button id="close-pos-confirm" class="alfa-main-btn qb-btn-sell">Close & Sell</button>
            <button id="close-pos-cancel" class="alfa-main-btn qb-btn-close">Cancel</button>
        </div>
    </div>`;
      createModal(`Close ${pos.symbol} Position`, html);
      function updateCloseSummary() {
        let sh = parseInt($("#close-pos-shares").val(), 10);
        if (isNaN(sh) || sh < 1) sh = 1;
        if (sh > totalShares) sh = totalShares;
        $("#close-pos-shares").val(sh);
        const sellOn = $("#close-pos-sell").is(":checked");
        const sellShares = sellOn ? Math.min(sh, maxOwnedSellable) : sh;
        const grossProceeds = currentPrice * sellShares;
        const fee = grossProceeds * 1e-3;
        const netProceeds = grossProceeds - fee;
        const cost = pos.entryPrice * sellShares;
        const netPnl = netProceeds - cost;
        const pnlPercent = cost > 0 ? (netProceeds - cost) / cost * 100 : 0;
        const isPositive = netPnl >= 0;
        $("#close-pos-gross").text(formatMoney(grossProceeds));
        $("#close-pos-fee").text("-" + formatMoney(fee));
        $("#close-pos-pnl").attr("style", "color:" + (isPositive ? "#8bc34a" : "#ef5350") + ";").text((isPositive ? "+" : "") + formatMoney(netPnl) + " (" + (pnlPercent >= 0 ? "+" : "") + pnlPercent.toFixed(1) + "%)");
        if (sh < totalShares) {
          $("#close-pos-partial-hint").show();
        } else {
          $("#close-pos-partial-hint").hide();
        }
        const dipsIntoTier = sellOn && benefitLocked > 0 && sellShares > Math.max(0, owned - benefitLocked);
        if (dipsIntoTier) {
          $("#close-pos-tier-hint").html(`\u26A0 Selling ${sellShares.toLocaleString()} may drop your benefit tier (tier needs ${benefitLocked.toLocaleString()} shares).`).show();
        } else {
          $("#close-pos-tier-hint").hide().text("");
        }
        if (sellOn && sellShares < sh) {
          $("#close-pos-sell-hint").text(`You own ${owned.toLocaleString()} \u2014 will sell ${sellShares.toLocaleString()} and close that many.`);
        } else if (sellOn) {
          $("#close-pos-sell-hint").text(`Will sell all ${sellShares.toLocaleString()} shares at market, then close tracking.`);
        } else {
          $("#close-pos-sell-hint").text("Closes tracking only \u2014 no market sell.");
        }
        $("#close-pos-confirm").text(sellOn ? "Close & Sell" : "Close Position");
      }
      updateCloseSummary();
      $("#close-pos-shares").on("input change", updateCloseSummary);
      $("#close-pos-sell").on("change", updateCloseSummary);
      $("#close-pos-confirm").on("click", async function() {
        let sh = parseInt($("#close-pos-shares").val(), 10);
        if (isNaN(sh) || sh < 1) {
          alert("Enter at least 1 share to close.");
          return;
        }
        if (sh > totalShares) {
          alert("Shares to close cannot exceed " + totalShares.toLocaleString() + ".");
          return;
        }
        const exitReason = $("#close-pos-exit-reason").val() || "manual_close";
        const sellOn = $("#close-pos-sell").is(":checked");
        const $btn = $(this);
        const $status = $("#close-pos-status");
        const $cancel = $("#close-pos-cancel");
        if (sellOn) {
          const toSell = Math.min(sh, maxOwnedSellable);
          if (toSell <= 0) {
            $status.html('<span style="color:#ef5350;">No owned shares to sell. Uncheck sell to close tracking only.</span>');
            return;
          }
          $btn.prop("disabled", true).text("Selling...");
          $cancel.prop("disabled", true);
          $status.html('<span style="color:#ffb74d;">Placing sell order...</span>');
          try {
            await postTradeAsync(pos.symbol, toSell, "sellShares");
            const sharesToClose2 = toSell >= totalShares ? null : toSell;
            closeSwingPosition(pos.id, currentPrice, exitReason, sharesToClose2);
            closeModal();
            updateVaultDisplay(true);
            $("#swing-positions-list").html(renderSwingPositions());
            bindSwingPositionActions();
            refreshSwingJournal();
          } catch (e) {
            console.error("Swing close sell error:", e);
            $status.html(`<span style="color:#ef5350;">Sell failed: ${e.message || e}</span>`);
            $btn.prop("disabled", false).text("Close & Sell");
            $cancel.prop("disabled", false);
          }
          return;
        }
        const sharesToClose = sh >= totalShares ? null : sh;
        closeModal();
        closeSwingPosition(pos.id, null, exitReason, sharesToClose);
        $("#swing-positions-list").html(renderSwingPositions());
        bindSwingPositionActions();
        refreshSwingJournal();
        showUndoCloseBanner();
      });
      $("#close-pos-cancel").on("click", closeModal);
    }
    function openMergeIntoPositionModal(existingPositionId) {
      const pos = swingTradeData.activePositions.find((p) => p.id === existingPositionId);
      if (!pos) return;
      const totalOwned = getOwnedShares(pos.symbol);
      const looseShares = Math.max(0, totalOwned - pos.shares);
      const costBasisPrice = getLooseSharesAvgPrice(pos.symbol, looseShares);
      const currentPrice = getPrice(pos.symbol) || pos.entryPrice;
      const prefillPrice = costBasisPrice || currentPrice;
      const priceSource = costBasisPrice ? "cost basis" : "current (sync portfolio for cost basis)";
      const html = `
    <div class="add-position-form">
        <div class="form-group">
            <label>Merge into existing ${pos.symbol} position</label>
            <div class="merge-existing-info">
                Position: ${pos.shares.toLocaleString()} shares @ $${pos.entryPrice.toFixed(2)} (avg)
                <br>Target: ${pos.targetPercent}% | Stop: ${pos.stopPercent}%
            </div>
        </div>
        <div class="form-group merge-shares-context">
            <span>You own <strong>${totalOwned.toLocaleString()}</strong> total</span>
            <span>\u2192 <strong>${looseShares.toLocaleString()}</strong> loose shares available to merge</span>
        </div>
        ${looseShares === 0 ? `
        <div class="merge-no-loose">
            No loose shares to merge. Your position (${pos.shares.toLocaleString()}) matches or exceeds total owned (${totalOwned.toLocaleString()}).
        </div>
        ` : ""}
        <div class="form-row">
            <div class="form-group">
                <label>Price per share ($)</label>
                <input type="number" id="merge-price" class="alfa-input" step="0.01" value="${prefillPrice.toFixed(2)}">
                <span class="form-hint" id="merge-price-hint">${costBasisPrice ? "From " + priceSource : priceSource}</span>
            </div>
            <div class="form-group">
                <label>Shares to add</label>
                <input type="number" id="merge-shares" class="alfa-input" value="${looseShares}" placeholder="0">
                <button id="merge-use-all" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a; margin-top:4px;">Use all loose</button>
            </div>
        </div>
        <div class="form-group" id="merge-result" style="display:none;">
            <label>New weighted average</label>
            <div class="merge-result-value">
                <span id="merge-new-avg">-</span> / <span id="merge-new-shares">-</span> shares
            </div>
        </div>
        <div class="form-actions">
            <button id="merge-submit" class="alfa-main-btn" style="border-color:#66bb6a; color:#66bb6a; flex:1;" ${looseShares === 0 ? "disabled" : ""}>Merge</button>
            <button id="merge-cancel" class="alfa-main-btn" style="border-color:#888; color:#888;">Cancel</button>
        </div>
    </div>`;
      createModal("\u2795 Merge into Position", html);
      $("#merge-use-all").on("click", function() {
        $("#merge-shares").val(looseShares);
        updateMergePreview();
      });
      function updateMergePreview() {
        const newPrice = parseFloat($("#merge-price").val()) || 0;
        const newShares = parseInt($("#merge-shares").val()) || 0;
        if (newShares <= 0) {
          $("#merge-result").hide();
          return;
        }
        const oldCost = pos.entryPrice * pos.shares;
        const newCost = newPrice * newShares;
        const totalShares = pos.shares + newShares;
        const newAvg = totalShares > 0 ? (oldCost + newCost) / totalShares : pos.entryPrice;
        $("#merge-new-avg").text(`$${newAvg.toFixed(2)}`);
        $("#merge-new-shares").text(totalShares.toLocaleString());
        $("#merge-result").show();
      }
      $("#merge-price, #merge-shares").on("input change", updateMergePreview);
      if (looseShares > 0) updateMergePreview();
      $("#merge-submit").on("click", function() {
        const newPrice = parseFloat($("#merge-price").val()) || 0;
        const newShares = parseInt($("#merge-shares").val()) || 0;
        if (newShares <= 0) {
          alert("Enter shares to add");
          return;
        }
        if (newPrice <= 0) {
          alert("Enter valid price");
          return;
        }
        const oldCost = pos.entryPrice * pos.shares;
        const newCost = newPrice * newShares;
        const totalShares = pos.shares + newShares;
        pos.entryPrice = (oldCost + newCost) / totalShares;
        pos.shares = totalShares;
        pos.targetPrice = pos.entryPrice * (1 + pos.targetPercent / 100);
        pos.stopPrice = pos.entryPrice * (1 - pos.stopPercent / 100);
        saveSwingTradeData();
        closeModal();
        $("#swing-positions-list").html(renderSwingPositions());
        bindSwingPositionActions();
      });
      $("#merge-cancel").on("click", closeModal);
    }
    function openEditPositionModal(positionId) {
      const pos = swingTradeData.activePositions.find((p) => p.id === positionId);
      if (!pos) return;
      const html = `
    <div class="add-position-form">
        <div class="form-group">
            <label>Stock: ${pos.symbol}</label>
            <input type="hidden" id="edit-pos-id" value="${pos.id}">
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Entry Price ($)</label>
                <input type="number" id="edit-entry-price" class="alfa-input" step="0.01" value="${pos.entryPrice.toFixed(2)}">
            </div>
            <div class="form-group">
                <label>Shares</label>
                <input type="number" id="edit-shares" class="alfa-input" value="${pos.shares}">
            </div>
        </div>
        
        <div class="form-row">
            <div class="form-group">
                <label>Target</label>
                <div class="form-row" style="gap:8px; align-items:center;">
                    <input type="number" id="edit-target" class="alfa-input" step="0.01" value="${(pos.targetPercent != null ? pos.targetPercent : pos.entryPrice && pos.targetPrice ? (pos.targetPrice / pos.entryPrice - 1) * 100 : 3).toFixed(2)}" style="flex:1;">
                    <select id="edit-target-unit" class="alfa-select" style="width:56px;">
                        <option value="pct">%</option>
                        <option value="dol">$</option>
                    </select>
                </div>
                <span class="form-hint" id="edit-target-hint">Target: $${(pos.targetPrice != null ? pos.targetPrice : pos.entryPrice * (1 + (pos.targetPercent || 0) / 100)).toFixed(2)}</span>
            </div>
            <div class="form-group">
                <label>Stop</label>
                <div class="form-row" style="gap:8px; align-items:center;">
                    <input type="number" id="edit-stop" class="alfa-input" step="0.01" value="${(pos.stopPercent != null ? pos.stopPercent : pos.entryPrice && pos.stopPrice ? (1 - pos.stopPrice / pos.entryPrice) * 100 : 2).toFixed(2)}" style="flex:1;">
                    <select id="edit-stop-unit" class="alfa-select" style="width:56px;">
                        <option value="pct">%</option>
                        <option value="dol">$</option>
                    </select>
                </div>
                <span class="form-hint" id="edit-stop-hint">Stop: $${(pos.stopPrice != null ? pos.stopPrice : pos.entryPrice * (1 - (pos.stopPercent || 0) / 100)).toFixed(2)}</span>
            </div>
        </div>
        
        <div class="form-group">
            <label>Notes</label>
            <textarea id="edit-notes" class="alfa-input journal-notes-textarea" rows="4" placeholder="Trade notes...">${(pos.notes || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</textarea>
        </div>
        
        <div class="form-actions">
            <button id="edit-save" class="alfa-main-btn" style="border-color:#caa14a; color:#caa14a; flex:1;">Save Changes</button>
            <button id="edit-cancel" class="alfa-main-btn" style="border-color:#888; color:#888;">Cancel</button>
        </div>
    </div>`;
      createModal("\u270F\uFE0F Edit Position", html);
      function editGetTargetStopPrices() {
        const entry = parseFloat($("#edit-entry-price").val()) || pos.entryPrice;
        const targetVal = parseFloat($("#edit-target").val());
        const stopVal = parseFloat($("#edit-stop").val());
        const targetUnit = $("#edit-target-unit").val();
        const stopUnit = $("#edit-stop-unit").val();
        let targetPrice, stopPrice, targetPercent, stopPercent;
        if (targetUnit === "dol" && targetVal != null && !isNaN(targetVal)) {
          targetPrice = targetVal;
          targetPercent = entry > 0 ? (targetPrice / entry - 1) * 100 : pos.targetPercent;
        } else {
          targetPercent = targetVal != null && !isNaN(targetVal) ? targetVal : pos.targetPercent;
          targetPrice = entry * (1 + targetPercent / 100);
        }
        if (stopUnit === "dol" && stopVal != null && !isNaN(stopVal)) {
          stopPrice = stopVal;
          stopPercent = entry > 0 ? (1 - stopPrice / entry) * 100 : pos.stopPercent;
        } else {
          stopPercent = stopVal != null && !isNaN(stopVal) ? stopVal : pos.stopPercent;
          stopPrice = entry * (1 - stopPercent / 100);
        }
        return { targetPrice, stopPrice, targetPercent, stopPercent };
      }
      function editUpdateHints() {
        const { targetPrice, stopPrice, targetPercent, stopPercent } = editGetTargetStopPrices();
        $("#edit-target-hint").text($("#edit-target-unit").val() === "pct" ? `Target: $${targetPrice.toFixed(2)}` : `Target: ${targetPercent.toFixed(2)}%`);
        $("#edit-stop-hint").text($("#edit-stop-unit").val() === "pct" ? `Stop: $${stopPrice.toFixed(2)}` : `Stop: ${stopPercent.toFixed(2)}%`);
      }
      $("#edit-entry-price, #edit-target, #edit-stop, #edit-target-unit, #edit-stop-unit").on("input change", editUpdateHints);
      $("#edit-target-unit").on("change", function() {
        const entry = parseFloat($("#edit-entry-price").val()) || pos.entryPrice;
        const targetVal = parseFloat($("#edit-target").val());
        if (entry <= 0) return;
        if ($(this).val() === "dol") {
          const pct = targetVal != null && !isNaN(targetVal) ? targetVal : pos.targetPercent;
          $("#edit-target").val((entry * (1 + pct / 100)).toFixed(2));
        } else {
          const dol = targetVal != null && !isNaN(targetVal) ? targetVal : pos.targetPrice;
          $("#edit-target").val(entry > 0 ? ((dol / entry - 1) * 100).toFixed(2) : pos.targetPercent);
        }
        editUpdateHints();
      });
      $("#edit-stop-unit").on("change", function() {
        const entry = parseFloat($("#edit-entry-price").val()) || pos.entryPrice;
        const stopVal = parseFloat($("#edit-stop").val());
        if (entry <= 0) return;
        if ($(this).val() === "dol") {
          const pct = stopVal != null && !isNaN(stopVal) ? stopVal : pos.stopPercent;
          $("#edit-stop").val((entry * (1 - pct / 100)).toFixed(2));
        } else {
          const dol = stopVal != null && !isNaN(stopVal) ? stopVal : pos.stopPrice;
          $("#edit-stop").val(entry > 0 ? ((1 - dol / entry) * 100).toFixed(2) : pos.stopPercent);
        }
        editUpdateHints();
      });
      $("#edit-save").on("click", function() {
        const id = $("#edit-pos-id").val();
        const position = swingTradeData.activePositions.find((p) => p.id === id);
        if (!position) return;
        position.entryPrice = parseFloat($("#edit-entry-price").val()) || position.entryPrice;
        position.shares = parseInt($("#edit-shares").val()) || position.shares;
        const { targetPrice, stopPrice, targetPercent, stopPercent } = editGetTargetStopPrices();
        position.targetPrice = targetPrice;
        position.stopPrice = stopPrice;
        position.targetPercent = targetPercent;
        position.stopPercent = stopPercent;
        position.notes = $("#edit-notes").val().trim();
        saveSwingTradeData();
        closeModal();
        $("#swing-positions-list").html(renderSwingPositions());
        bindSwingPositionActions();
      });
      $("#edit-cancel").on("click", closeModal);
    }
    function savePortfolioData() {
      try {
        localStorage.setItem("alfa_portfolio_data", JSON.stringify(portfolioData));
      } catch (e) {
        console.error("Failed to save portfolio data:", e);
      }
    }
    async function fetchStockTransactionLogs(fullSync = false, statusCallback = null, pageLimit = Infinity) {
      const key = localStorage.getItem("alfa_vault_apikey");
      if (!key) {
        console.error("No API key for portfolio sync");
        return { success: false, error: "No API key" };
      }
      const results = { buys: [], sells: [], newTransactions: 0, pagesScanned: 0, totalLogsScanned: 0 };
      let hasMore = true;
      let nextUrl = null;
      let pagesWithNoStocks = 0;
      const maxPagesWithNoStocks = 50;
      const fromTimestamp = fullSync ? 0 : portfolioData.lastSyncTimestamp;
      try {
        let baseUrl = `https://api.torn.com/v2/user/log?key=${key}&limit=100&sort=desc&log=5510,5511`;
        if (fromTimestamp > 0) {
          baseUrl += `&from=${fromTimestamp}`;
        }
        let useTypeFilter = true;
        let data = await tornApiFetch(baseUrl);
        if (data.error || !data.log) {
          useTypeFilter = false;
          baseUrl = `https://api.torn.com/v2/user/log?key=${key}&limit=100&sort=desc`;
          if (fromTimestamp > 0) {
            baseUrl += `&from=${fromTimestamp}`;
          }
          if (statusCallback) statusCallback("Using unfiltered log fetch (slower)...");
        }
        while (hasMore) {
          results.pagesScanned++;
          if (statusCallback) {
            const stockCount = results.buys.length + results.sells.length;
            statusCallback(`Scanning logs... (${stockCount} stock transactions found, page ${results.pagesScanned})`);
          }
          if (results.pagesScanned > 1 || !useTypeFilter) {
            const url = nextUrl || baseUrl;
            data = await tornApiFetch(url);
          }
          if (data.error) {
            console.error("API Error:", data.error);
            if (useTypeFilter && results.pagesScanned === 1) {
              useTypeFilter = false;
              baseUrl = `https://api.torn.com/v2/user/log?key=${key}&limit=100&sort=desc`;
              if (fromTimestamp > 0) {
                baseUrl += `&from=${fromTimestamp}`;
              }
              continue;
            }
            return { success: false, error: data.error.error || "API Error" };
          }
          if (!data.log || data.log.length === 0) {
            hasMore = false;
            break;
          }
          results.totalLogsScanned += data.log.length;
          let foundStocksThisPage = 0;
          for (const entry of data.log) {
            if (entry.details && (entry.details.id === LOG_TYPE_BUY || entry.details.id === LOG_TYPE_SELL)) {
              const symbol = STOCK_ID_MAP[entry.data.stock];
              if (!symbol) continue;
              const transaction = {
                id: entry.id,
                timestamp: entry.timestamp,
                type: entry.details.id === LOG_TYPE_BUY ? "buy" : "sell",
                symbol,
                stockId: entry.data.stock,
                shares: entry.data.amount,
                totalValue: entry.data.worth,
                pricePerShare: parseFloat(String(entry.data.price).replace(/,/g, "")),
                fees: entry.data.fees || 0,
                profit: entry.data.profit || 0
                // Only present on sells
              };
              if (transaction.type === "buy") {
                results.buys.push(transaction);
              } else {
                results.sells.push(transaction);
              }
              results.newTransactions++;
              foundStocksThisPage++;
            }
          }
          if (!useTypeFilter) {
            if (foundStocksThisPage === 0) {
              pagesWithNoStocks++;
              if (pagesWithNoStocks >= maxPagesWithNoStocks && results.newTransactions > 0) {
                if (statusCallback) {
                  statusCallback(`Reached end of stock history (${maxPagesWithNoStocks} pages with no stocks)`);
                }
                hasMore = false;
                break;
              }
            } else {
              pagesWithNoStocks = 0;
            }
          }
          if (data._metadata && data._metadata.links && data._metadata.links.prev) {
            const prevLink = data._metadata.links.prev;
            if (prevLink.includes("?")) {
              nextUrl = prevLink + `&key=${key}`;
            } else {
              nextUrl = prevLink + `?key=${key}`;
            }
          } else {
            hasMore = false;
          }
          if (hasMore && results.pagesScanned >= pageLimit) return {success: false, limited: true};
          if (hasMore) {
            await new Promise((r) => setTimeout(r, 150));
          }
        }
        if (statusCallback) {
          statusCallback(`Found ${results.newTransactions} stock transactions in ${results.pagesScanned} pages`);
        }
        return { success: true, ...results };
      } catch (e) {
        console.error("Transaction fetch error:", e);
        return { success: false, error: e.message };
      }
    }
    function processTransactions(fetchResult) {
      if (!fetchResult.success) return;
      const allTransactions = [...fetchResult.buys, ...fetchResult.sells];
      allTransactions.sort((a, b) => a.timestamp - b.timestamp);
      const existingIds = new Set(portfolioData.transactions.map((t) => t.id));
      const newTransactions = allTransactions.filter((t) => !existingIds.has(t.id));
      if (newTransactions.length === 0) {
        return { added: 0 };
      }
      portfolioData.transactions.push(...newTransactions);
      portfolioData.transactions.sort((a, b) => a.timestamp - b.timestamp);
      if (portfolioData.transactions.length > 0) {
        const latest = portfolioData.transactions[portfolioData.transactions.length - 1];
        portfolioData.lastSyncTimestamp = latest.timestamp;
      }
      recalculateCostBasis();
      savePortfolioData();
      return { added: newTransactions.length };
    }
    function getLooseSharesAvgPrice(symbol, looseShares) {
      const basis = portfolioData.costBasis[symbol];
      if (!basis?.lots?.length || looseShares <= 0) return null;
      let sharesNeeded = looseShares;
      let totalCost = 0;
      let sharesTaken = 0;
      for (let i = basis.lots.length - 1; i >= 0 && sharesNeeded > 0; i--) {
        const lot = basis.lots[i];
        const take = Math.min(lot.shares, sharesNeeded);
        totalCost += take * lot.pricePerShare;
        sharesTaken += take;
        sharesNeeded -= take;
      }
      return sharesTaken > 0 ? totalCost / sharesTaken : null;
    }
    function recalculateCostBasis() {
      portfolioData.costBasis = {};
      portfolioData.realizedPL = 0;
      for (const tx of portfolioData.transactions) {
        const sym = tx.symbol;
        if (!portfolioData.costBasis[sym]) {
          portfolioData.costBasis[sym] = {
            totalShares: 0,
            totalCost: 0,
            lots: [],
            // FIFO lots: [{ shares, pricePerShare, timestamp }]
            realizedPL: 0,
            totalBought: 0,
            totalSold: 0
          };
        }
        const basis = portfolioData.costBasis[sym];
        if (tx.type === "buy") {
          basis.lots.push({
            shares: tx.shares,
            pricePerShare: tx.pricePerShare,
            timestamp: tx.timestamp
          });
          basis.totalShares += tx.shares;
          basis.totalCost += tx.totalValue;
          basis.totalBought += tx.totalValue;
        } else {
          let sharesToSell = tx.shares;
          let costOfSold = 0;
          while (sharesToSell > 0 && basis.lots.length > 0) {
            const lot = basis.lots[0];
            if (lot.shares <= sharesToSell) {
              costOfSold += lot.shares * lot.pricePerShare;
              sharesToSell -= lot.shares;
              basis.lots.shift();
            } else {
              costOfSold += sharesToSell * lot.pricePerShare;
              lot.shares -= sharesToSell;
              sharesToSell = 0;
            }
          }
          basis.totalShares -= tx.shares;
          basis.totalCost -= costOfSold;
          basis.totalSold += tx.totalValue;
          const netProfit = stockNetProfit(tx);
          basis.realizedPL += netProfit;
          portfolioData.realizedPL += netProfit;
        }
      }
    }
    function getPeriodStartTimestamp(period) {
      const now = Math.floor(Date.now() / 1e3);
      const today = /* @__PURE__ */ new Date();
      switch (period) {
        case "day":
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          return Math.floor(startOfDay.getTime() / 1e3);
        case "week":
          return now - 7 * 24 * 60 * 60;
        case "month":
          return now - 30 * 24 * 60 * 60;
        case "year":
          return now - 365 * 24 * 60 * 60;
        case "ytd":
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          return Math.floor(startOfYear.getTime() / 1e3);
        case "all":
        default:
          return 0;
      }
    }
    function calculatePeriodPL(period = "all") {
      const startTimestamp = getPeriodStartTimestamp(period);
      const periodTransactions = portfolioData.transactions.filter((tx) => tx.timestamp >= startTimestamp);
      const result = {
        period,
        startTimestamp,
        buys: periodTransactions.filter((tx) => tx.type === "buy"),
        sells: periodTransactions.filter((tx) => tx.type === "sell"),
        totalBuyValue: 0,
        totalSellValue: 0,
        realizedPL: 0,
        fees: 0,
        netInvested: 0
        // Buys - Sells (net cash flow into stocks)
      };
      for (const tx of result.buys) {
        result.totalBuyValue += tx.totalValue;
      }
      for (const tx of result.sells) {
        result.totalSellValue += tx.totalValue;
        result.realizedPL += stockNetProfit(tx);
        result.fees += stockSellFee(tx);
      }
      result.netInvested = result.totalBuyValue - result.totalSellValue;
      return result;
    }
    function getPeriodLabel(period) {
      switch (period) {
        case "day":
          return "Today";
        case "week":
          return "7 Days";
        case "month":
          return "30 Days";
        case "year":
          return "1 Year";
        case "ytd":
          return "YTD";
        case "all":
          return "All Time";
        default:
          return period;
      }
    }
    function calculatePortfolioPL() {
      const result = {
        totalCostBasis: 0,
        totalCurrentValue: 0,
        unrealizedPL: 0,
        unrealizedPLPercent: 0,
        realizedPL: portfolioData.realizedPL,
        totalFees: 0,
        perStock: {},
        hasIncompleteData: false
        // Flag when we have sells without matching buys
      };
      const allSymbols = /* @__PURE__ */ new Set([
        ...Object.keys(portfolioData.costBasis),
        ...Object.keys(STOCK_DATA)
      ]);
      for (const sym of allSymbols) {
        const basis = portfolioData.costBasis[sym] || {
          totalShares: 0,
          totalCost: 0,
          realizedPL: 0,
          totalBought: 0,
          totalSold: 0,
          lots: []
        };
        const actualShares = getOwnedShares(sym);
        const currentPrice = getPrice(sym);
        const currentValue = actualShares * currentPrice;
        if (actualShares <= 0 && basis.totalBought === 0 && basis.realizedPL === 0) continue;
        const trackedShares = Math.max(0, basis.totalShares);
        let avgCostPerShare = 0;
        let costBasisForHoldings = 0;
        if (actualShares > 0 && basis.lots && basis.lots.length > 0) {
          let sharesAccounted = 0;
          for (const lot of basis.lots) {
            if (sharesAccounted >= actualShares) break;
            const lotShares = Math.min(lot.shares, actualShares - sharesAccounted);
            costBasisForHoldings += lotShares * lot.pricePerShare;
            sharesAccounted += lotShares;
          }
          if (actualShares > sharesAccounted) {
            costBasisForHoldings += (actualShares - sharesAccounted) * currentPrice;
          }
          avgCostPerShare = actualShares > 0 ? costBasisForHoldings / actualShares : 0;
        } else if (trackedShares > 0 && basis.totalCost > 0) {
          avgCostPerShare = basis.totalCost / trackedShares;
          if (actualShares <= trackedShares) {
            costBasisForHoldings = actualShares * avgCostPerShare;
          } else {
            costBasisForHoldings = basis.totalCost + (actualShares - trackedShares) * currentPrice;
          }
        }
        if (basis.totalShares < 0 || actualShares > 0 && trackedShares === 0 && basis.totalBought === 0) {
          result.hasIncompleteData = true;
        }
        const unrealizedPL = currentValue - costBasisForHoldings;
        const unrealizedPLPercent = costBasisForHoldings > 0 ? unrealizedPL / costBasisForHoldings * 100 : 0;
        result.perStock[sym] = {
          shares: actualShares,
          trackedShares,
          avgCost: avgCostPerShare,
          totalCost: costBasisForHoldings,
          currentPrice,
          currentValue,
          unrealizedPL,
          unrealizedPLPercent,
          realizedPL: basis.realizedPL,
          totalBought: basis.totalBought,
          totalSold: basis.totalSold,
          hasIncompleteData: basis.totalShares < 0 || actualShares > 0 && basis.totalBought === 0
        };
        if (actualShares > 0) {
          result.totalCostBasis += costBasisForHoldings;
          result.totalCurrentValue += currentValue;
        }
      }
      result.unrealizedPL = result.totalCurrentValue - result.totalCostBasis;
      result.unrealizedPLPercent = result.totalCostBasis > 0 ? result.unrealizedPL / result.totalCostBasis * 100 : 0;
      for (const tx of portfolioData.transactions) {
        result.totalFees += stockSellFee(tx);
      }
      return result;
    }
    async function fullPortfolioSync(statusCallback = null) {
      if (statusCallback) statusCallback("Starting full sync...");
      const result = await fetchStockTransactionLogs(true, statusCallback);
      if (!result.success) {
        if (statusCallback) statusCallback(`Sync failed: ${result.error}`);
        return { success: false, error: result.error };
      }
      const allTransactions = [...result.buys || [], ...result.sells || []];
      allTransactions.sort((a, b) => a.timestamp - b.timestamp);
      if (allTransactions.length === 0) {
        if (statusCallback) {
          statusCallback("Sync returned 0 transactions \u2014 keeping existing portfolio data");
        }
        return { success: false, error: "No transactions returned", keptExisting: true };
      }
      portfolioData.transactions = allTransactions;
      portfolioData.lastSyncTimestamp = allTransactions[allTransactions.length - 1].timestamp;
      recalculateCostBasis();
      portfolioData.lastFullSync = Date.now();
      savePortfolioData();
      if (statusCallback) {
        statusCallback(`Synced ${allTransactions.length} transactions`);
      }
      return { success: true, transactions: allTransactions.length };
    }
    async function incrementalPortfolioSync(statusCallback = null) {
      if (statusCallback) statusCallback("Checking for new transactions...");
      const result = await fetchStockTransactionLogs(false, statusCallback);
      if (result.success) {
        const processed = processTransactions(result);
        if (statusCallback) {
          if (processed && processed.added > 0) {
            statusCallback(`Added ${processed.added} new transactions`);
          } else {
            statusCallback("Portfolio up to date");
          }
        }
        return { success: true, added: processed ? processed.added : 0 };
      } else {
        if (statusCallback) statusCallback(`Sync failed: ${result.error}`);
        return { success: false, error: result.error };
      }
    }
    const ADVISOR_ITEMS = {
      364: "Box of Grenades",
      365: "Box of Medical Supplies",
      366: "Erotic DVD",
      367: "Feathery Hotel Coupon",
      368: "Lawyer's Business Card",
      369: "Lottery Voucher",
      370: "Drug Pack",
      817: "Six-Pack of Alcohol",
      818: "Six-Pack of Energy Drink",
      1057: "Gentleman's Cache",
      1112: "Elegant Cache",
      1113: "Naughty Cache",
      1114: "Elderly Cache",
      1115: "Denim Cache",
      1116: "Wannabe Cache",
      1117: "Cutesy Cache"
    };
    const TCC_CACHE_IDS = [1057, 1112, 1113, 1114, 1115, 1116, 1117];
    const ADVISOR_DATA = {
      "MUN": { type: "item", id: 818, freq: 7 },
      "ASS": { type: "item", id: 817, freq: 7 },
      "HRG": { type: "manual", label: "Avg Property Value", freq: 31 },
      "LSC": { type: "item", id: 369, freq: 7 },
      "LAG": { type: "item", id: 368, freq: 7 },
      "FHG": { type: "item", id: 367, freq: 7 },
      "PRN": { type: "item", id: 366, freq: 7 },
      "SYM": { type: "item", id: 370, freq: 7 },
      "TCC": { type: "average", ids: TCC_CACHE_IDS, freq: 31 },
      "THS": { type: "item", id: 365, freq: 7 },
      "EWM": { type: "item", id: 364, freq: 7 },
      "BAG": { type: "passive" },
      "CNC": { type: "cash", val: 8e7, freq: 31 },
      "TSB": { type: "cash", val: 5e7, freq: 31 },
      "TMI": { type: "cash", val: 25e6, freq: 31 },
      "IOU": { type: "cash", val: 12e6, freq: 31 },
      "GRN": { type: "cash", val: 4e6, freq: 31 },
      "TCT": { type: "cash", val: 1e6, freq: 31 }
    };
    let lastNwCache = null;
    let lastSync = 0;
    let itemPrices = {};
    try {
      itemPrices = JSON.parse(localStorage.getItem("alfa_advisor_prices")) || {};
    } catch (e) {
      itemPrices = {};
    }
    let networthSettings = { sources: { inventory: false, points: true, stocks: true }, excludedStocks: [], excludeMode: "all" };
    try {
      let savedNW = JSON.parse(localStorage.getItem("alfa_advisor_networth"));
      if (savedNW) {
        networthSettings = savedNW;
        if (!networthSettings.excludeMode) networthSettings.excludeMode = "all";
      }
    } catch (e) {
    }
    const BANK_BASE_RATES = { "1w": 0.7917, "2w": 1.7833, "1m": 4.3, "2m": 9.8, "3m": 16.5 };
    let bankSettings = { roi_1w: 0, roi_2w: 0, roi_1m: 0, roi_2m: 0, roi_3m: 0, active_period: "2w" };
    try {
      let savedBank = JSON.parse(localStorage.getItem("alfa_advisor_bank"));
      if (savedBank) bankSettings = savedBank;
    } catch (e) {
    }
    let stocks = {}, stockId = {}, stockRows = {}, localShareCache = {};
    const TORNSY_API = "https://tornsy.com/api";
    const CACHE_TTL = {
      stocks: 60 * 1e3,
      // 1 minute (matches Tornsy update frequency)
      ohlc: 5 * 60 * 1e3,
      // 5 minutes (historical data doesn't change much)
      analysis: 5 * 60 * 1e3
      // 5 minutes (computed indicators)
    };
    const DEFAULT_VAULT_CONFIG = {
      stocks: [],
      blockGoal: null,
      lockedStocks: [],
      // Stocks protected from vault spread/withdraw
      depositStrategy: "swing_strategy",
      // swing_strategy | equal | dip_weighted | rsi_weighted | roi_priority
      withdrawStrategy: "proportional",
      // loose_first | proportional | worst_roi | best_performers | swing_strategy
      keepAmount: 5e3,
      skipOvervalued: false,
      // Smart spread: skip stocks with SELL/TAKE PROFIT signals
      minimalMode: false,
      // Show only Vault Spread, Rebalance, Withdraw + Lock Blocks/Smart Mode
      modules: { portfolio: true, swing: true, stocks: true },
      // Visibility: Settings → Modules
      excludeLockedBlocksFromValue: false
      // When true, Total Vault Value = loose + swing only (excludes locked blocks)
    };
    const VAULT_SWING_PRESET_SYMBOLS = ["ASS", "BAG", "CBD", "CNC", "ELT", "EWM", "FHG", "GRN", "IOU", "IST", "LAG", "LSC", "MCS", "MUN", "PRN", "SYM", "SYS", "TCC", "TCI", "TCM", "TCP", "TCT", "TGP", "THS", "TMI", "TSB", "WLT"];
    let vaultConfig = {};
    try {
      let saved = JSON.parse(localStorage.getItem("alfa_vault_config"));
      if (saved) vaultConfig = { ...DEFAULT_VAULT_CONFIG, ...saved };
      else vaultConfig = { ...DEFAULT_VAULT_CONFIG };
    } catch (e) {
      vaultConfig = { ...DEFAULT_VAULT_CONFIG };
    }
    let vaultAnalysisCache = {};
    let vaultCacheMem = null;
    let vaultCacheFlushTimer = null;
    function loadVaultCacheMem() {
      if (vaultCacheMem) return vaultCacheMem;
      try {
        vaultCacheMem = JSON.parse(localStorage.getItem("alfa_vault_cache")) || {};
      } catch (e) {
        vaultCacheMem = {};
      }
      return vaultCacheMem;
    }
    function scheduleVaultCacheFlush() {
      if (vaultCacheFlushTimer) return;
      vaultCacheFlushTimer = setTimeout(() => {
        vaultCacheFlushTimer = null;
        try {
          localStorage.setItem("alfa_vault_cache", JSON.stringify(vaultCacheMem || {}));
        } catch (e) {
          console.error("Cache write error:", e);
        }
      }, 500);
    }
    function getCached(key, maxAge) {
      try {
        const cache = loadVaultCacheMem();
        const entry = cache[key];
        if (entry && Date.now() - entry.timestamp < maxAge) {
          return entry.data;
        }
      } catch (e) {
        console.error("Cache read error:", e);
      }
      return null;
    }
    function setCache(key, data) {
      try {
        const cache = loadVaultCacheMem();
        cache[key] = { data, timestamp: Date.now() };
        scheduleVaultCacheFlush();
      } catch (e) {
        console.error("Cache write error:", e);
      }
    }
    function clearVaultCache() {
      vaultCacheMem = {};
      if (vaultCacheFlushTimer) {
        clearTimeout(vaultCacheFlushTimer);
        vaultCacheFlushTimer = null;
      }
      try {
        localStorage.removeItem("alfa_vault_cache");
      } catch (e) {
      }
    }
    let _gmXhrFn = void 0;
    let _tornsyUnavailableWarned = false;
    function resolveGmXhr() {
      if (_gmXhrFn !== void 0) return _gmXhrFn;
      try {
        if (typeof GM_xmlhttpRequest === "function") {
          _gmXhrFn = GM_xmlhttpRequest;
          return _gmXhrFn;
        }
      } catch (e) {
      }
      try {
        if (typeof GM !== "undefined" && GM && typeof GM.xmlHttpRequest === "function") {
          _gmXhrFn = GM.xmlHttpRequest.bind(GM);
          return _gmXhrFn;
        }
      } catch (e) {
      }
      try {
        if (typeof unsafeWindow !== "undefined" && unsafeWindow && typeof unsafeWindow.GM_xmlhttpRequest === "function") {
          _gmXhrFn = unsafeWindow.GM_xmlhttpRequest;
          return _gmXhrFn;
        }
      } catch (e) {
      }
      _gmXhrFn = null;
      return null;
    }
    function isGmXhrAvailable() {
      return !!resolveGmXhr();
    }
    function warnTornsyUnavailable(extra) {
      if (_tornsyUnavailableWarned) return;
      _tornsyUnavailableWarned = true;
      const msg = extra || "Tornsy unavailable (no GM_xmlhttpRequest). Using DOM prices; signal weighting skipped. Desktop Tampermonkey/Violentmonkey recommended.";
      console.warn("[Smart Stock Vault]", msg);
      try {
        const el = $("#vault-status");
        if (el && el.length) {
          el.html('<span style="color:#ffb74d;">' + msg + "</span>");
        }
      } catch (e) {
      }
    }
    function gmFetch(url) {
      return new Promise((resolve) => {
        const xhr = resolveGmXhr();
        if (!xhr) {
          warnTornsyUnavailable();
          resolve(null);
          return;
        }
        try {
          xhr({
            method: "GET",
            url,
            onload: function(response) {
              try {
                const data = JSON.parse(response.responseText);
                resolve(data);
              } catch (e) {
                console.error("JSON parse error:", e);
                resolve(null);
              }
            },
            onerror: function(error) {
              console.error("GM_xmlhttpRequest error:", error);
              resolve(null);
            }
          });
        } catch (e) {
          console.error("GM_xmlhttpRequest invoke error:", e);
          warnTornsyUnavailable("Tornsy request failed to start: " + (e && e.message ? e.message : e));
          resolve(null);
        }
      });
    }
    async function tornApiFetch(url) {
      const xhr = resolveGmXhr();
      if (xhr) {
        return await new Promise((resolve, reject) => {
          try {
            xhr({
              method: "GET",
              url,
              onload: function(response) {
                try {
                  resolve(JSON.parse(response.responseText));
                } catch (e) {
                  reject(e);
                }
              },
              onerror: function() {
                reject(new Error("GM_xmlhttpRequest error"));
              }
            });
          } catch (e) {
            reject(e);
          }
        });
      }
      const res = await fetch(url);
      return await res.json();
    }
    async function fetchWithCache(url, cacheKey, maxAge) {
      const cached = getCached(cacheKey, maxAge);
      if (cached) return cached;
      try {
        let data;
        if (url.includes("tornsy.com")) {
          if (!isGmXhrAvailable()) {
            warnTornsyUnavailable();
            return null;
          }
          data = await gmFetch(url);
        } else {
          data = await tornApiFetch(url);
        }
        if (data) setCache(cacheKey, data);
        return data;
      } catch (e) {
        console.error("Fetch error:", e);
        return null;
      }
    }
    async function fetchTornsyStocks() {
      const url = `${TORNSY_API}/stocks?interval=d1,d7,d14,d30`;
      return await fetchWithCache(url, "tornsy_stocks", CACHE_TTL.stocks);
    }
    async function fetchTornsyOHLC(symbol, interval = "d1", limit = 30) {
      const url = `${TORNSY_API}/${symbol.toLowerCase()}?interval=${interval}&limit=${limit}`;
      return await fetchWithCache(url, `tornsy_ohlc_${symbol}_${interval}`, CACHE_TTL.ohlc);
    }
    function calculateSMA(ohlcData, period) {
      if (!ohlcData || ohlcData.length < period) return 0;
      const closes = ohlcData.slice(-period).map((d) => parseFloat(d[4] || d[1]));
      return closes.reduce((a, b) => a + b, 0) / period;
    }
    function calculateEMA(ohlcData, period) {
      if (!ohlcData || ohlcData.length < period) return 0;
      const closes = ohlcData.map((d) => parseFloat(d[4] || d[1]));
      const multiplier = 2 / (period + 1);
      let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
      for (let i = period; i < closes.length; i++) {
        ema = (closes[i] - ema) * multiplier + ema;
      }
      return ema;
    }
    function calculateRSI(ohlcData, period = 14) {
      if (!ohlcData || ohlcData.length < period + 1) return 50;
      const closes = ohlcData.map((d) => parseFloat(d[4] || d[1]));
      let gains = 0, losses = 0;
      for (let i = 1; i <= period; i++) {
        const change = closes[i] - closes[i - 1];
        if (change > 0) gains += change;
        else losses += Math.abs(change);
      }
      let avgGain = gains / period;
      let avgLoss = losses / period;
      for (let i = period + 1; i < closes.length; i++) {
        const change = closes[i] - closes[i - 1];
        if (change > 0) {
          avgGain = (avgGain * (period - 1) + change) / period;
          avgLoss = avgLoss * (period - 1) / period;
        } else {
          avgGain = avgGain * (period - 1) / period;
          avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
        }
      }
      if (avgLoss === 0) return 100;
      const rs = avgGain / avgLoss;
      return 100 - 100 / (1 + rs);
    }
    function calculateVolatility(ohlcData, period = 14) {
      if (!ohlcData || ohlcData.length < period + 1) return 0;
      const closes = ohlcData.slice(-period - 1).map((d) => parseFloat(d[4] || d[1]));
      const returns = [];
      for (let i = 1; i < closes.length; i++) {
        const ret = (closes[i] - closes[i - 1]) / closes[i - 1];
        returns.push(ret);
      }
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;
      return Math.sqrt(variance) * 100;
    }
    function calculateBollingerBands(ohlcData, period = 20, stdDev = 2) {
      if (!ohlcData || ohlcData.length < period) return { upper: 0, middle: 0, lower: 0, position: 0.5 };
      const closes = ohlcData.slice(-period).map((d) => parseFloat(d[4] || d[1]));
      const middle = closes.reduce((a, b) => a + b, 0) / period;
      const squaredDiffs = closes.map((c) => Math.pow(c - middle, 2));
      const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
      const sd = Math.sqrt(variance);
      const upper = middle + stdDev * sd;
      const lower = middle - stdDev * sd;
      const currentPrice = closes[closes.length - 1];
      const position = upper - lower > 0 ? (currentPrice - lower) / (upper - lower) : 0.5;
      return { upper, middle, lower, position: Math.max(0, Math.min(1, position)) };
    }
    function calculateMomentum(ohlcData, period = 7) {
      if (!ohlcData || ohlcData.length < period + 1) return 0;
      const closes = ohlcData.map((d) => parseFloat(d[4] || d[1]));
      const currentPrice = closes[closes.length - 1];
      const pastPrice = closes[closes.length - 1 - period];
      if (pastPrice === 0) return 0;
      return (currentPrice - pastPrice) / pastPrice * 100;
    }
    function calculateADXAndATR(ohlcData, period = 14) {
      const defaultResult = { adx: 25, atr: 0 };
      if (!ohlcData || ohlcData.length < period + 2) return defaultResult;
      const highs = ohlcData.map((d) => parseFloat(d[2] || d[1]));
      const lows = ohlcData.map((d) => parseFloat(d[3] || d[1]));
      const closes = ohlcData.map((d) => parseFloat(d[4] || d[1]));
      const tr = [];
      const plusDM = [];
      const minusDM = [];
      for (let i = 1; i < ohlcData.length; i++) {
        const high = highs[i], low = lows[i], prevHigh = highs[i - 1], prevLow = lows[i - 1], prevClose = closes[i - 1];
        tr.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)));
        const upMove = high - prevHigh;
        const downMove = prevLow - low;
        plusDM.push(upMove > downMove && upMove > 0 ? upMove : 0);
        minusDM.push(downMove > upMove && downMove > 0 ? downMove : 0);
      }
      function wilderSmooth(arr) {
        const result = [];
        let sum = 0;
        for (let i = 0; i < arr.length; i++) {
          if (i < period) {
            sum += arr[i];
            result.push(i === period - 1 ? sum / period : 0);
          } else {
            const smoothed = (result[i - 1] * (period - 1) + arr[i]) / period;
            result.push(smoothed);
          }
        }
        return result;
      }
      const smoothedTR = wilderSmooth(tr);
      const smoothedPlusDM = wilderSmooth(plusDM);
      const smoothedMinusDM = wilderSmooth(minusDM);
      const dxValues = [];
      for (let i = period; i < smoothedTR.length; i++) {
        const atr2 = smoothedTR[i];
        if (atr2 <= 0) {
          dxValues.push(0);
          continue;
        }
        const plusDI = 100 * (smoothedPlusDM[i] / atr2);
        const minusDI = 100 * (smoothedMinusDM[i] / atr2);
        const diSum = plusDI + minusDI;
        const dx = diSum > 0 ? 100 * Math.abs(plusDI - minusDI) / diSum : 0;
        dxValues.push(dx);
      }
      if (dxValues.length < period) return defaultResult;
      let adxSum = dxValues.slice(0, period).reduce((a, b) => a + b, 0) / period;
      for (let i = period; i < dxValues.length; i++) {
        adxSum = (adxSum * (period - 1) + dxValues[i]) / period;
      }
      const atr = smoothedTR[smoothedTR.length - 1] || 0;
      return {
        adx: Math.min(100, Math.max(0, adxSum)),
        atr
      };
    }
    function calculateADX(ohlcData, period = 14) {
      const result = calculateADXAndATR(ohlcData, period);
      return typeof result === "object" ? result.adx : result;
    }
    function calculateVolumeMultiplier(ohlcData, period = 7) {
      if (!ohlcData || ohlcData.length < period + 1) return 1;
      const volumes = ohlcData.map((d) => parseFloat(d[5] || 0));
      const currentVolume = volumes[volumes.length - 1];
      const prevVolumes = volumes.slice(-period - 1, -1);
      const avgVolume = prevVolumes.reduce((a, b) => a + b, 0) / period;
      if (avgVolume <= 0 || currentVolume <= 0) return 1;
      return currentVolume / avgVolume;
    }
    function findSupportResistance(ohlcData) {
      if (!ohlcData || ohlcData.length === 0) return { support: 0, resistance: 0 };
      let high = -Infinity, low = Infinity;
      for (const candle of ohlcData) {
        const candleHigh = parseFloat(candle[2] || candle[1]);
        const candleLow = parseFloat(candle[3] || candle[1]);
        if (candleHigh > high) high = candleHigh;
        if (candleLow < low) low = candleLow;
      }
      return { support: low, resistance: high };
    }
    function getSignalFromAnalysis(analysis) {
      let signal = "hold";
      if (analysis.rsi > 70 && analysis.dipFrom7d > 5) signal = "sell";
      else if (analysis.rsi > 60 || analysis.dipFrom7d > 3) signal = "take_profit";
      else if (analysis.rsi < 30 && analysis.dipFrom7d < -3) signal = "buy";
      else if (analysis.rsi < 40 || analysis.dipFrom7d < -2) signal = "good";
      const adx = analysis.adx ?? 25;
      const adxMin = swingTradeData?.settings?.adxMinThreshold ?? 25;
      const adxPartial = swingTradeData?.settings?.adxPartialThreshold ?? 20;
      if (adx < adxPartial) {
        if (signal === "sell") signal = "take_profit";
        else if (signal === "take_profit" || signal === "buy" || signal === "good") signal = "hold";
      } else if (adx < adxMin) {
        if (signal === "sell") signal = "take_profit";
        else if (signal === "take_profit") signal = "hold";
        else if (signal === "buy") signal = "good";
      }
      const volMult = analysis.volumeMultiplier ?? 1;
      const volMin = swingTradeData?.settings?.volumeMinMultiplier ?? 1;
      const volPartial = swingTradeData?.settings?.volumePartialMultiplier ?? 0.8;
      if (volMult < volPartial) {
        if (signal === "sell") signal = "take_profit";
        else if (signal === "take_profit" || signal === "buy" || signal === "good") signal = "hold";
      } else if (volMult < volMin) {
        if (signal === "take_profit") signal = "hold";
        else if (signal === "buy") signal = "good";
      }
      return signal;
    }
    async function analyzeStockForVault(symbol) {
      const cached = getCached(`analysis_${symbol}`, CACHE_TTL.analysis);
      if (freshSpreadAnalysis(cached)) {
        vaultAnalysisCache[symbol] = cached;
        return cached;
      }
      if (!isGmXhrAvailable()) {
        warnTornsyUnavailable();
        return null;
      }
      try {
        const ohlcResult = await fetchTornsyOHLC(symbol, "d1", 30);
        if (!ohlcResult || !ohlcResult.data || ohlcResult.data.length === 0) {
          return null;
        }
        const ohlcData = ohlcResult.data;
        const currentPrice = parseFloat(ohlcData[ohlcData.length - 1][4] || ohlcData[ohlcData.length - 1][1]);
        const sma7 = calculateSMA(ohlcData, 7);
        const sma14 = calculateSMA(ohlcData, 14);
        const sma30 = calculateSMA(ohlcData, Math.min(30, ohlcData.length));
        const rsi = calculateRSI(ohlcData, 14);
        const volatility = calculateVolatility(ohlcData, 14);
        const bollinger = calculateBollingerBands(ohlcData, 20, 2);
        const momentum7d = calculateMomentum(ohlcData, 7);
        const { support, resistance } = findSupportResistance(ohlcData);
        const { adx, atr } = calculateADXAndATR(ohlcData, 14);
        const volumeMultiplier = calculateVolumeMultiplier(ohlcData, 7);
        const analysis = {
          symbol,
          price: currentPrice,
          sma7,
          sma14,
          sma30,
          dipFrom7d: sma7 > 0 ? (currentPrice - sma7) / sma7 * 100 : 0,
          dipFrom14d: sma14 > 0 ? (currentPrice - sma14) / sma14 * 100 : 0,
          dipFrom30d: sma30 > 0 ? (currentPrice - sma30) / sma30 * 100 : 0,
          rsi,
          volatility,
          bollingerPosition: bollinger.position,
          bollingerUpper: bollinger.upper,
          bollingerLower: bollinger.lower,
          momentum7d,
          support,
          resistance,
          adx,
          atr,
          volumeMultiplier,
          signal: "neutral",
          timestamp: Date.now()
        };
        analysis.signal = getSignalFromAnalysis(analysis);
        setCache(`analysis_${symbol}`, analysis);
        vaultAnalysisCache[symbol] = analysis;
        return analysis;
      } catch (e) {
        console.error(`Analysis error for ${symbol}:`, e);
        return null;
      }
    }
    async function analyzeAllVaultStocks(statusCallback) {
      const results = {};
      const stocksToAnalyze = vaultConfig.stocks.length > 0 ? vaultConfig.stocks : Object.keys(STOCK_DATA);
      for (let i = 0; i < stocksToAnalyze.length; i++) {
        const sym = stocksToAnalyze[i];
        if (statusCallback) statusCallback(`Analyzing ${sym}... (${i + 1}/${stocksToAnalyze.length})`);
        const analysis = await analyzeStockForVault(sym);
        if (analysis) {
          results[sym] = analysis;
        }
        if (i < stocksToAnalyze.length - 1) {
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      vaultAnalysisCache = results;
      return results;
    }
    async function getQuickStockAnalysis() {
      const stocksData = await fetchTornsyStocks();
      if (!stocksData || !stocksData.data) return {};
      const results = {};
      const intervals = stocksData.intervals || {};
      for (const stock of stocksData.data) {
        if (stock.index) continue;
        const sym = stock.stock;
        const currentPrice = parseFloat(stock.price);
        let price7d = currentPrice, price14d = currentPrice, price30d = currentPrice;
        if (stock.interval) {
          if (stock.interval.d7) price7d = parseFloat(stock.interval.d7.price);
          if (stock.interval.d14) price14d = parseFloat(stock.interval.d14.price);
          if (stock.interval.d30) price30d = parseFloat(stock.interval.d30.price);
        }
        results[sym] = {
          symbol: sym,
          price: currentPrice,
          dipFrom7d: price7d > 0 ? (currentPrice - price7d) / price7d * 100 : 0,
          dipFrom14d: price14d > 0 ? (currentPrice - price14d) / price14d * 100 : 0,
          dipFrom30d: price30d > 0 ? (currentPrice - price30d) / price30d * 100 : 0,
          investors: stock.investors || 0
        };
      }
      return results;
    }
    function loadVaultConfig() {
      try {
        const saved = JSON.parse(localStorage.getItem("alfa_vault_config"));
        if (saved) vaultConfig = { ...DEFAULT_VAULT_CONFIG, ...saved };
        else vaultConfig = { ...DEFAULT_VAULT_CONFIG };
      } catch (e) {
        vaultConfig = { ...DEFAULT_VAULT_CONFIG };
      }
      return vaultConfig;
    }
    function saveVaultConfig() {
      try {
        localStorage.setItem("alfa_vault_config", JSON.stringify(vaultConfig));
      } catch (e) {
        console.error("Failed to save vault config:", e);
      }
    }
    const withdrawalRiskCache = new Map();
    function holdingRisk(rows, endDay, days) {
      const closes = new Map();
      for (const row of rows) {
        if (!Array.isArray(row)) continue;
        const day = Math.floor(Number(row[0]) / 86400);
        const price = Number(row[4]);
        if (Number.isInteger(day) && day >= endDay - 90 && day < endDay && Number.isFinite(price) && price > 0) closes.set(day, price);
      }
      const losses = [];
      let count = 0;
      for (const [day, entry] of closes) {
        const exit = closes.get(day + days);
        if (exit === undefined) continue;
        count++;
        const loss = 1 - stockNetFromGross(exit) / entry;
        if (loss > 1e-12) losses.push(loss * 1000000);
      }
      losses.sort((a, b) => a - b);
      const mid = Math.floor(losses.length / 2);
      const median = losses.length ? (losses[mid] + losses[Math.floor((losses.length - 1) / 2)]) / 2 : null;
      return {count, frequency: count ? losses.length / count : null, median};
    }
    const withdrawalRiskPanel = `
      <details class="vault-risk-panel" style="margin:8px 0">
        <summary style="cursor:pointer">Compare withdrawal risk</summary>
        <p class="settings-note">Historical holds using daily closing prices and the sale fee. Typical loss is the median per $1M among losing holds. At least 20 overlapping holds are required.</p>
        <button type="button" class="alfa-mini-btn vault-risk-load">Load comparison</button>
        <label>Holding period <select class="alfa-select vault-risk-days"><option value="1">1 day</option><option value="3">3 days</option><option value="7" selected>7 days</option></select></label>
        <label>Sort by <select class="alfa-select vault-risk-sort">
          <option value="frequency">Lowest loss frequency</option><option value="median">Smallest typical loss</option><option value="ticker">Ticker</option>
        </select></label>
        <p class="vault-risk-status" aria-live="polite"></p>
        <div style="max-height:230px;overflow:auto"><table class="alfa-table" style="width:100%;text-align:left">
          <thead><tr><th>Ticker</th><th>Loss frequency</th><th>Typical loss / $1M</th><th>Holds</th></tr></thead>
          <tbody></tbody>
        </table></div>
      </details>`;
    function bindWithdrawalRisk(symbols) {
      const panel = document.querySelector("#alfa-modal-overlay .vault-risk-panel");
      if (!panel) return;
      const sort = panel.querySelector(".vault-risk-sort");
      const days = panel.querySelector(".vault-risk-days");
      const load = panel.querySelector("button");
      const body = panel.querySelector("tbody");
      const status = panel.querySelector(".vault-risk-status");
      const results = new Map();
      function render() {
        const ranked = symbols.slice().sort((a, b) => {
          if (sort.value === "ticker") return a.localeCompare(b);
          const score = sym => {
            const row = results.get(sym)?.[days.value];
            return row?.count >= 20 ? row[sort.value] ?? Infinity : Infinity;
          };
          return score(a) - score(b) || a.localeCompare(b);
        });
        body.replaceChildren();
        for (const sym of ranked) {
          const row = results.get(sym)?.[days.value];
          const tr = body.insertRow();
          const enough = row?.count >= 20;
          const frequency = enough ? (row.frequency * 100).toFixed(1) + "%" : row ? "Limited history" : results.has(sym) ? "Unavailable" : "Loading…";
          const median = enough && row.median !== null ? "$" + Math.round(row.median).toLocaleString("en-US") : "—";
          for (const value of [sym, frequency, median, row?.count ?? "—"]) tr.insertCell().textContent = value;
        }
      }
      sort.addEventListener("change", () => { if (results.size || load.disabled) render(); });
      days.addEventListener("change", () => { if (results.size || load.disabled) render(); });
      load.addEventListener("click", async () => {
        if (load.disabled) return;
        const day = Math.floor(Date.now() / 86400000);
        const date = d => new Date(d * 86400000).toISOString().slice(0, 10);
        const period = date(day - 90) + " to " + date(day - 1) + " UTC";
        load.disabled = true;
        status.textContent = "Loading " + period + "…";
        results.clear();
        render();
        const pending = symbols.slice();
        async function next() {
          while (panel.isConnected && pending.length) {
            const sym = pending.shift();
            const cached = withdrawalRiskCache.get(sym);
            let row = cached?.day === day ? cached.row : null;
            if (!row) {
              const url = TORNSY_API + "/" + sym.toLowerCase() + "?interval=d1&from=" + (day - 90) * 86400 + "&to=" + day * 86400 + "&limit=90";
              const history = await gmFetch(url);
              if (Array.isArray(history?.data)) {
                row = Object.fromEntries([1, 3, 7].map(n => [n, holdingRisk(history.data, day, n)]));
                withdrawalRiskCache.set(sym, {day, row});
              }
            }
            results.set(sym, row);
            if (panel.isConnected) {
              status.textContent = period + " · " + results.size + " of " + symbols.length + " tickers checked";
              render();
            }
          }
        }
        try {
          await Promise.all([next(), next(), next()]);
          status.textContent = period + " · " + results.size + " tickers checked";
        } finally {
          load.disabled = false;
          load.textContent = "Reload comparison";
        }
      });
    }
    function openSettingsModal() {
      const savedKey = localStorage.getItem("alfa_vault_apikey") || "";
      const lockBlocksChecked = localStorage.getItem("alfa_vault_lock") === "true";
      const allStocks = Object.keys(STOCK_DATA).sort();
      const stockCheckboxes = allStocks.map((sym) => {
        const isSelected = vaultConfig.stocks.includes(sym);
        const stockData = STOCK_DATA[sym];
        const typeLabel = stockData.type === "P" ? "P" : "A";
        return `<label class="vault-stock-option ${isSelected ? "selected" : ""}" data-sym="${sym}">
            <input type="checkbox" class="vault-stock-check" value="${sym}" ${isSelected ? "checked" : ""}>
            <span class="vault-stock-sym">${sym}</span>
            <span class="vault-stock-type">${typeLabel}</span>
        </label>`;
      }).join("");
      const bankInputs = ["1w", "2w", "1m", "2m", "3m"].map(
        (t) => `<div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; color:#aaa; font-weight:bold; width:35px;">${t}</span>
            <input id="bank-${t}" class="alfa-tbl-input" style="width:70px;" value="${bankSettings["roi_" + t] || 0}">
         </div>`
      ).join("");
      const mod = vaultConfig.modules || { ...DEFAULT_VAULT_CONFIG.modules };
      const html = `
    <div class="settings-tabs">
        <button class="settings-tab active" data-tab="api">API</button>
        <button class="settings-tab" data-tab="vault">Vault</button>
        <button class="settings-tab" data-tab="protection">Protection</button>
        <button class="settings-tab" data-tab="modules">Modules</button>
        <button class="settings-tab" data-tab="advanced">Advanced</button>
    </div>
    
    <div class="settings-content">
        <!-- API Tab -->
        <div class="settings-tab-content" id="settings-tab-api">
            <div class="settings-section">
                <div class="settings-section-title">Torn API Key</div>
                <input type="password" id="settings-apikey" class="alfa-input" style="width:100%; text-align:center; letter-spacing:2px; margin-bottom:10px;" placeholder="Paste your API key here" value="${savedKey}">
                <div id="settings-api-status" class="settings-api-status">
                    ${savedKey ? '<span style="color:#8bc34a;">\u2713 API key configured</span>' : '<span style="color:#888;">No API key set</span>'}
                </div>
                <div class="settings-warning">
                    <strong>Note:</strong> Full Access API key required for P&L tracking and transaction history features.
                </div>
                <button id="settings-validate-key" class="alfa-mini-btn" style="width:100%; margin-top:10px; border-color:#caa14a; color:#caa14a;">Validate API Key</button>
            </div>
        </div>
        
        <!-- Vault Tab -->
        <div class="settings-tab-content" id="settings-tab-vault" style="display:none;">
            <div class="settings-section">
                <div class="settings-section-title">
                    Vault Stocks
                    <span class="settings-stock-count">Selected: <strong id="vault-selected-count">${vaultConfig.stocks.length}</strong></span>
                </div>
                <div class="vault-stock-grid" id="vault-stock-grid">
                    ${stockCheckboxes}
                </div>
                ${withdrawalRiskPanel}
                <div class="vault-quick-actions" style="margin-top:10px;">
                    <button id="vault-select-none" class="alfa-mini-btn" style="border-color:#888; color:#888;">Clear All</button>
                    <button id="vault-select-active" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a;">Select Active (A)</button>
                    <button id="vault-select-swing" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a;" title="Select vault stocks from swing list">Swing List</button>
                    <button id="vault-select-all" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a;">Select All</button>
                </div>
            </div>
            
            <div class="settings-row">
                <div class="settings-section" style="flex:1;">
                    <div class="settings-section-title">Deposit Strategy</div>
                    <select id="vault-deposit-strategy" class="alfa-select" style="width:100%;">
                        <option value="swing_strategy" ${vaultConfig.depositStrategy === "swing_strategy" ? "selected" : ""}>Swing Strategy</option>
                        <option value="rsi_weighted" ${vaultConfig.depositStrategy === "rsi_weighted" ? "selected" : ""}>Weighted by RSI</option>
                        <option value="cash_flow" ${vaultConfig.depositStrategy === "cash_flow" ? "selected" : ""}>Cash-flow rebalancing (buy underweight)</option>
                        <option value="equal" ${vaultConfig.depositStrategy === "equal" ? "selected" : ""}>Equal Split</option>
                        <option value="dip_weighted" ${vaultConfig.depositStrategy === "dip_weighted" ? "selected" : ""}>Weighted by Dip</option>
                        <option value="roi_priority" ${vaultConfig.depositStrategy === "roi_priority" ? "selected" : ""}>ROI Priority</option>
                    </select>
                </div>
                <div class="settings-section" style="flex:1;">
                    <div class="settings-section-title">Withdrawal Strategy</div>
                    <select id="vault-withdraw-strategy" class="alfa-select" style="width:100%;">
                        <option value="fewest_orders" ${vaultConfig.withdrawStrategy === "fewest_orders" ? "selected" : ""}>Fewest Sell Orders</option>
                    <option value="profitable_first" ${vaultConfig.withdrawStrategy === "profitable_first" ? "selected" : ""}>Profitable First</option>
                    <option value="overweight_first" ${vaultConfig.withdrawStrategy === "overweight_first" ? "selected" : ""}>Sell Overweight First</option>
                        <option value="proportional" ${vaultConfig.withdrawStrategy === "proportional" ? "selected" : ""}>Proportional</option>
                        <option value="loose_first" ${vaultConfig.withdrawStrategy === "loose_first" ? "selected" : ""}>Loose Shares First</option>
                        <option value="swing_strategy" ${vaultConfig.withdrawStrategy === "swing_strategy" ? "selected" : ""}>Swing Strategy</option>
                        <option value="worst_roi" ${vaultConfig.withdrawStrategy === "worst_roi" ? "selected" : ""}>Worst ROI First</option>
                        <option value="best_performers" ${vaultConfig.withdrawStrategy === "best_performers" ? "selected" : ""}>Best Performers</option>
                    </select>
                <label><input id="vault-profit-rebal" type="checkbox" ${vaultConfig.profitFirstRebalance ? "checked" : ""}> Rebalance sell order: Profitable First</label>
                <label>Withdrawal loss policy <select id="vault-break-even" class="alfa-select">
                  <option value="any" ${!vaultConfig.breakEvenOnly && !vaultConfig.preferBreakEven ? "selected" : ""}>Allow sales at a loss</option>
                  <option value="strict" ${vaultConfig.breakEvenOnly ? "selected" : ""}>Only withdraw at break-even or better</option>
                  <option value="prefer" ${vaultConfig.preferBreakEven && !vaultConfig.breakEvenOnly ? "selected" : ""}>Prefer break-even, then cover the shortfall</option>
                </select></label>
                </div>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Default Keep Amount</div>
                <input type="text" id="vault-keep-amount" class="alfa-input" style="width:150px;" 
                    value="${vaultConfig.keepAmount > 0 ? vaultConfig.keepAmount.toLocaleString("en-US") : ""}" 
                    placeholder="e.g. 1m, 500k">
                <span style="font-size:11px; color:#666; margin-left:10px;">Cash to keep when using Vault Spread</span>
            </div>
        </div>
        
        <!-- Protection Tab -->
        <div class="settings-tab-content" id="settings-tab-protection" style="display:none;">
            <div class="settings-section">
                <div class="settings-section-title">Block Protection</div>
                <label class="settings-checkbox-label">
                    <input type="checkbox" id="settings-lock-blocks" ${lockBlocksChecked ? "checked" : ""}>
                    <span><strong>Lock Blocks</strong> - Protect benefit tier shares from being sold during withdrawals and rebalancing</span>
                </label>
                <label>Partial block goal <select id="vault-block-goal" class="alfa-select">
                    <option value="">None</option>
                    ${allStocks.map(sym => `<option value="${sym}" ${vaultConfig.blockGoal?.symbol === sym ? "selected" : ""}>${sym}</option>`).join("")}
                </select></label>
                <button type="button" id="vault-easiest-goal" class="alfa-mini-btn">Select easiest block</button>
                <button type="button" id="vault-needed-goal" class="alfa-mini-btn">Select a needed stock block</button>
                <label><input type="checkbox" id="vault-education-protection" ${vaultConfig.educationProtection ? "checked" : ""}> With Lock Blocks on, protect WSU until all education is verified complete</label>
                <label>Choose by benefit <select class="alfa-select" id="vault-benefit-choice">
                  <option value="">Select a benefit…</option>
                  ${Object.entries(blockBenefitLabels).sort((a,b) => a[1].localeCompare(b[1])).map(([sym,label]) => benefitOption(sym, label)).join("")}
                </select></label>
                <div id="vault-easiest-result" aria-live="polite"></div>
                <label>Target tier <input id="vault-goal-tier" class="alfa-input" type="number" min="1" step="1" style="width:65px" value="${Number(vaultConfig.blockGoal?.tier) || 1}"></label>
                <label for="vault-goal-share">Deposit toward goal <output id="vault-goal-percent"></output></label>
                <input type="range" id="vault-goal-share" min="0" max="100" step="1" value="${goalPercent(vaultConfig.blockGoal)}" style="width:100%">
                <div id="vault-goal-help"></div>
                <div>With Lock Blocks on, reserve shares toward this tier. Shares above the protected amount remain available.</div>
                <label class="settings-checkbox-label">
                    <input type="checkbox" id="settings-skip-overvalued" ${vaultConfig.skipOvervalued ? "checked" : ""}>
                    <span><strong>Smart Mode</strong> - Skip stocks with SELL or TAKE PROFIT signals when spreading/rebalancing</span>
                </label>
                <label class="settings-checkbox-label">
                    <input type="checkbox" id="settings-exclude-locked-from-value" ${vaultConfig.excludeLockedBlocksFromValue ? "checked" : ""}>
                    <span><strong>Exclude locked blocks from Total Vault Value</strong> - Show only loose + swing-protected value (locked block shares not counted)</span>
                </label>
            </div>
        </div>
        
        <!-- Modules Tab -->
        <div class="settings-tab-content" id="settings-tab-modules" style="display:none;">
            <div class="settings-section">
                <div class="settings-section-title">Visible modules</div>
                <div class="settings-note">Uncheck to hide sections on the main screen. Hidden modules are not loaded until shown (saves work on load).</div>
                <label class="settings-checkbox-label"><input type="checkbox" id="settings-mod-portfolio" ${mod.portfolio ? "checked" : ""}> <span>Portfolio P&L</span></label>
                <label class="settings-checkbox-label"><input type="checkbox" id="settings-mod-swing" ${mod.swing ? "checked" : ""}> <span>Swing Trading</span></label>
                <label class="settings-checkbox-label"><input type="checkbox" id="settings-mod-stocks" ${mod.stocks ? "checked" : ""}> <span>Vault Stocks (vault breakdown)</span></label>
            </div>
            <div class="settings-section">
                <div class="settings-section-title">Display</div>
                <label class="settings-checkbox-label">
                    <input type="checkbox" id="settings-minimal-mode" ${vaultConfig.minimalMode ? "checked" : ""}>
                    <span><strong>Minimal Mode</strong> - Show only Vault Spread, Rebalance, Withdraw, and options (Lock Blocks, Smart Mode). Use Torn's default stock display.</span>
                </label>
            </div>
        </div>
        
        <!-- Advanced Tab -->
        <div class="settings-tab-content" id="settings-tab-advanced" style="display:none;">
            <div class="settings-section">
                <div class="settings-section-title">Bank ROI Rates (% APR)</div>
                <div class="settings-note">Used for daily income calculations</div>
                <div class="settings-bank-inputs">
                    ${bankInputs}
                </div>
                <button id="settings-fetch-bank" class="alfa-mini-btn" style="width:100%; margin-top:10px; border-color:#caa14a; color:#caa14a;">Fetch Rates (API)</button>
            </div>
            
            <div class="settings-section">
                <div class="settings-section-title">Cache Management</div>
                <button id="settings-clear-cache" class="alfa-mini-btn" style="width:100%; border-color:#ef5350; color:#ef5350;">Clear Analysis Cache</button>
            </div>
        </div>
    </div>
    
    <div class="settings-actions">
        <button id="settings-save" class="alfa-main-btn" style="flex:1; border-color:#8bc34a; color:#8bc34a;">Save & Close</button>
    </div>`;
      createModal("Settings", html);
      bindWithdrawalRisk(allStocks);
      $(".settings-tab").on("click", function() {
        const tab = $(this).data("tab");
        $(".settings-tab").removeClass("active");
        $(this).addClass("active");
        $(".settings-tab-content").hide();
        $(`#settings-tab-${tab}`).show();
      });
      $("#settings-apikey").on("keyup change", function() {
        localStorage.setItem("alfa_vault_apikey", $(this).val().trim());
        if ($(this).val().trim()) {
          $("#settings-api-status").html('<span style="color:#ffd54f;">Key updated - click Validate to test</span>');
        } else {
          $("#settings-api-status").html('<span style="color:#888;">No API key set</span>');
        }
      });
      $("#settings-validate-key").on("click", async function() {
        const key = localStorage.getItem("alfa_vault_apikey");
        if (!key) {
          $("#settings-api-status").html('<span style="color:#ef5350;">No API key to validate</span>');
          return;
        }
        $(this).prop("disabled", true).text("Validating...");
        try {
          const data = await tornApiFetch(`https://api.torn.com/user/?selections=basic&key=${key}`);
          if (data.error) {
            $("#settings-api-status").html(`<span style="color:#ef5350;">\u2717 Invalid: ${data.error.error}</span>`);
          } else {
            $("#settings-api-status").html(`<span style="color:#8bc34a;">\u2713 Valid key for ${data.name} [${data.player_id}]</span>`);
          }
        } catch (e) {
          $("#settings-api-status").html('<span style="color:#ef5350;">\u2717 Connection error</span>');
        }
        $(this).prop("disabled", false).text("Validate API Key");
      });
      $(".vault-stock-check").on("change", function() {
        const sym = $(this).val();
        const isChecked = $(this).is(":checked");
        $(this).closest(".vault-stock-option").toggleClass("selected", isChecked);
        if (isChecked && !vaultConfig.stocks.includes(sym)) {
          vaultConfig.stocks.push(sym);
        } else if (!isChecked) {
          vaultConfig.stocks = vaultConfig.stocks.filter((s) => s !== sym);
        }
        $("#vault-selected-count").text(vaultConfig.stocks.length);
      });
      $("#vault-select-none").on("click", function() {
        $(".vault-stock-check").prop("checked", false);
        $(".vault-stock-option").removeClass("selected");
        vaultConfig.stocks = [];
        $("#vault-selected-count").text(0);
      });
      $("#vault-select-active").on("click", function() {
        $(".vault-stock-check").prop("checked", false);
        $(".vault-stock-option").removeClass("selected");
        vaultConfig.stocks = [];
        Object.keys(STOCK_DATA).forEach((sym) => {
          if (STOCK_DATA[sym].type === "A") {
            $(`.vault-stock-check[value="${sym}"]`).prop("checked", true);
            $(`.vault-stock-option[data-sym="${sym}"]`).addClass("selected");
            vaultConfig.stocks.push(sym);
          }
        });
        $("#vault-selected-count").text(vaultConfig.stocks.length);
      });
      $("#vault-select-swing").on("click", function() {
        $(".vault-stock-check").prop("checked", false);
        $(".vault-stock-option").removeClass("selected");
        vaultConfig.stocks = [];
        VAULT_SWING_PRESET_SYMBOLS.forEach((sym) => {
          if ($(`.vault-stock-check[value="${sym}"]`).length) {
            $(`.vault-stock-check[value="${sym}"]`).prop("checked", true);
            $(`.vault-stock-option[data-sym="${sym}"]`).addClass("selected");
            vaultConfig.stocks.push(sym);
          }
        });
        $("#vault-selected-count").text(vaultConfig.stocks.length);
      });
      $("#vault-select-all").on("click", function() {
        $(".vault-stock-check").prop("checked", false);
        $(".vault-stock-option").removeClass("selected");
        vaultConfig.stocks = [];
        Object.keys(STOCK_DATA).forEach((sym) => {
          $(`.vault-stock-check[value="${sym}"]`).prop("checked", true);
          $(`.vault-stock-option[data-sym="${sym}"]`).addClass("selected");
          vaultConfig.stocks.push(sym);
        });
        $("#vault-selected-count").text(vaultConfig.stocks.length);
      });
      $("#vault-deposit-strategy").on("change", function() {
        vaultConfig.depositStrategy = $(this).val();
      });
      $("#vault-profit-rebal").on("change", function() { vaultConfig.profitFirstRebalance = this.checked; });
      $("#vault-break-even").on("change", function() { vaultConfig.breakEvenOnly = this.value === "strict"; vaultConfig.preferBreakEven = this.value === "prefer"; });
      $("#vault-withdraw-strategy").on("change", function() {
        vaultConfig.withdrawStrategy = $(this).val();
      });
      $("#vault-keep-amount").on("change keyup", function() {
        vaultConfig.keepAmount = parseTornNumber($(this).val()) || 0;
      });
      $("#settings-lock-blocks").on("change", function() {
        localStorage.setItem("alfa_vault_lock", $(this).is(":checked"));
      });
      $("#settings-skip-overvalued").on("change", function() {
        vaultConfig.skipOvervalued = $(this).is(":checked");
      });
      $("#settings-minimal-mode").on("change", function() {
        vaultConfig.minimalMode = $(this).is(":checked");
      });
      $(".alfa-tbl-input").on("change keyup", function() {
        ["1w", "2w", "1m", "2m", "3m"].forEach((t) => {
          bankSettings["roi_" + t] = parseFloat($(`#bank-${t}`).val()) || 0;
        });
      });
      $("#settings-fetch-bank").on("click", fetchBankRates);
      $("#settings-clear-cache").on("click", function() {
        if (confirm("Clear all cached analysis data?")) {
          clearVaultCache();
          vaultAnalysisCache = {};
          $(this).text("Cleared!").css("color", "#8bc34a");
          setTimeout(() => $(this).text("Clear Analysis Cache").css("color", "#ef5350"), 1500);
        }
      });
      function updateGoalControls() {
        const symbol = $("#vault-block-goal").val();
        const passive = STOCK_DATA[symbol]?.type === "P";
        const tier = $("#vault-goal-tier");
        tier.prop("disabled", !symbol || passive);
        if (passive) tier.val(1);
        const slider = $("#vault-goal-share").prop("disabled", !symbol);
        $("#vault-goal-percent").text(slider.val() + "%");
        $("#vault-goal-help").text(!symbol ? "Select a block to allocate deposits." :
          (passive ? symbol + " has one benefit tier. " : "") +
          "Vault Spread splits cash after your keep amount. Unused goal cash goes to other eligible stocks.");
      }
      function applyBlockSuggestion(symbol) {
        const best = symbol ? easiestBlockGoal([symbol]) : easiestBlockGoal();
        const result = $("#vault-easiest-result");
        if (!best) {
          result.text((symbol ? symbol + ": " : "") + "No eligible next block. Check the stock lock, current price and completed tiers. Your current goal is still selected.");
          return;
        }
        $("#vault-block-goal").val(best.symbol);
        $("#vault-goal-tier").val(best.tier);
        updateGoalControls();
        result.text(best.symbol + " tier " + best.tier + " needs " + best.remaining.toLocaleString() +
          " more shares (~" + formatWithdrawMoney(best.cents / 100) +
          "). Set the deposit percentage below and save to use this goal.");
      }
      $("#vault-easiest-goal").on("click", () => applyBlockSuggestion());
      $("#vault-needed-goal").on("click", async function() {
        const button = this;
        button.disabled = true;
        $("#vault-easiest-result").text("Checking education and starter blocks…");
        try {
          const state = await refreshEducation();
          if (!button.isConnected) return;
          const firstTier = symbol => easiestBlockGoal([symbol])?.tier === 1;
          const educationFirst = state !== "complete" && firstTier("WSU");
          const symbol = educationFirst ? "WSU" : firstTier("TCT") ? "TCT" : null;
          if (symbol) applyBlockSuggestion(symbol);
          else $("#vault-easiest-result").text("No eligible first-tier starter block at current quotes. Your current goal is still selected.");
          const note = state === "unknown" ? "Education unverified." : state === "complete" ? "All courses verified complete." : "Education unfinished.";
          $("#vault-easiest-result").append(document.createTextNode(" " + note + (symbol === "TCT" ? " TCT provides a recurring cash payout." : "")));
        } finally { button.disabled = false; }
      });
      $("#vault-benefit-choice").on("focus", function() {
        for (const option of Array.from(this.options).slice(1)) {
          option.outerHTML = benefitOption(option.value, blockBenefitLabels[option.value]);
        }
      });
      $("#vault-benefit-choice").on("change", function() {
        if (this.value) applyBlockSuggestion(this.value);
        this.value = "";
      });
      $("#vault-block-goal, #vault-goal-tier").on("change", function() {
        $("#vault-easiest-result").empty();
        updateGoalControls();
      });
      $("#vault-goal-share").on("input change", updateGoalControls);
      updateGoalControls();
      $("#settings-save").on("click", function() {
        const goalSymbol = $("#vault-block-goal").val();
        const goal = goalSymbol ? {symbol: goalSymbol, tier: Number($("#vault-goal-tier").val()), percent: Number($("#vault-goal-share").val())} : null;
        if (goal && !goalThreshold(goalSymbol, goal)) {
          alert("Enter a valid target tier. Passive stocks support tier 1 only and MCS supports up to 10.");
          return;
        }
        vaultConfig.educationProtection = $("#vault-education-protection").is(":checked");
        vaultConfig.blockGoal = goal;
        if ($("#settings-exclude-locked-from-value").length) vaultConfig.excludeLockedBlocksFromValue = $("#settings-exclude-locked-from-value").is(":checked");
        if ($("#settings-mod-portfolio").length) {
          vaultConfig.modules = {
            portfolio: $("#settings-mod-portfolio").is(":checked"),
            swing: $("#settings-mod-swing").is(":checked"),
            stocks: $("#settings-mod-stocks").is(":checked")
          };
        }
        saveVaultConfig();
        localStorage.setItem("alfa_advisor_networth", JSON.stringify(networthSettings));
        localStorage.setItem("alfa_advisor_bank", JSON.stringify(bankSettings));
        $(this).text("Saved!").css("background", "#8bc34a").css("color", "#111");
        setTimeout(() => {
          $("#alfa-modal-overlay").remove();
          updateVaultDisplay();
        }, 500);
      });
    }
    function openVaultConfigModal() {
      const allStocks = Object.keys(STOCK_DATA).sort();
      const stockCheckboxes = allStocks.map((sym) => {
        const isSelected = vaultConfig.stocks.includes(sym);
        const stockData = STOCK_DATA[sym];
        const typeLabel = stockData.type === "P" ? "P" : "A";
        return `<label class="vault-stock-option ${isSelected ? "selected" : ""}" data-sym="${sym}">
            <input type="checkbox" class="vault-stock-check" value="${sym}" ${isSelected ? "checked" : ""}>
            <span class="vault-stock-sym">${sym}</span>
            <span class="vault-stock-type">${typeLabel}</span>
        </label>`;
      }).join("");
      const html = `
    <div class="vault-config-container">
        <div class="vault-config-section">
            <div class="vault-config-header">
                <span class="vault-config-title">Select Vault Stocks</span>
                <span class="vault-stock-count">Selected: <strong id="vault-selected-count">${vaultConfig.stocks.length}</strong></span>
            </div>
            <div class="vault-stock-grid" id="vault-stock-grid">
                ${stockCheckboxes}
            </div>
                ${withdrawalRiskPanel}
            <div class="vault-quick-actions">
                <button id="vault-select-none" class="alfa-mini-btn" style="border-color:#888; color:#888;">Clear All</button>
                <button id="vault-select-active" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a;">Select Active (A)</button>
                <button id="vault-select-swing" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a;" title="Select vault stocks from swing list">Swing List</button>
                <button id="vault-select-all" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a;">Select All</button>
            </div>
        </div>
        
        <div class="vault-config-row">
            <div class="vault-config-section" style="flex:1;">
                <div class="vault-config-header">
                    <span class="vault-config-title">Deposit Strategy</span>
                </div>
                <select id="vault-deposit-strategy" class="alfa-select" style="width:100%;">
                    <option value="swing_strategy" ${vaultConfig.depositStrategy === "swing_strategy" ? "selected" : ""}>Swing Strategy (matches swing scan)</option>
                    <option value="rsi_weighted" ${vaultConfig.depositStrategy === "rsi_weighted" ? "selected" : ""}>Weighted by RSI (oversold priority)</option>
                    <option value="cash_flow" ${vaultConfig.depositStrategy === "cash_flow" ? "selected" : ""}>Cash-flow rebalancing (buy underweight)</option>
                    <option value="equal" ${vaultConfig.depositStrategy === "equal" ? "selected" : ""}>Equal Split</option>
                    <option value="dip_weighted" ${vaultConfig.depositStrategy === "dip_weighted" ? "selected" : ""}>Weighted by Dip (% below avg)</option>
                    <option value="roi_priority" ${vaultConfig.depositStrategy === "roi_priority" ? "selected" : ""}>ROI Priority (benefit earners)</option>
                </select>
                <div class="vault-strategy-desc" id="deposit-strategy-desc">Prioritize oversold stocks (RSI < 30 gets more allocation)</div>
            </div>
            
            <div class="vault-config-section" style="flex:1;">
                <div class="vault-config-header">
                    <span class="vault-config-title">Withdrawal Strategy</span>
                </div>
                <select id="vault-withdraw-strategy" class="alfa-select" style="width:100%;">
                    <option value="fewest_orders" ${vaultConfig.withdrawStrategy === "fewest_orders" ? "selected" : ""}>Fewest Sell Orders</option>
                    <option value="profitable_first" ${vaultConfig.withdrawStrategy === "profitable_first" ? "selected" : ""}>Profitable First</option>
                    <option value="overweight_first" ${vaultConfig.withdrawStrategy === "overweight_first" ? "selected" : ""}>Sell Overweight First</option>
                    <option value="proportional" ${vaultConfig.withdrawStrategy === "proportional" ? "selected" : ""}>Proportional (equal % from each)</option>
                    <option value="loose_first" ${vaultConfig.withdrawStrategy === "loose_first" ? "selected" : ""}>Loose Shares First (Recommended)</option>
                    <option value="swing_strategy" ${vaultConfig.withdrawStrategy === "swing_strategy" ? "selected" : ""}>Swing Strategy</option>
                    <option value="worst_roi" ${vaultConfig.withdrawStrategy === "worst_roi" ? "selected" : ""}>Worst ROI First</option>
                    <option value="best_performers" ${vaultConfig.withdrawStrategy === "best_performers" ? "selected" : ""}>Best Performers (take profits)</option>
                </select>
                <label><input id="vault-profit-rebal" type="checkbox" ${vaultConfig.profitFirstRebalance ? "checked" : ""}> Rebalance sell order: Profitable First</label>
                <label>Withdrawal loss policy <select id="vault-break-even" class="alfa-select">
                  <option value="any" ${!vaultConfig.breakEvenOnly && !vaultConfig.preferBreakEven ? "selected" : ""}>Allow sales at a loss</option>
                  <option value="strict" ${vaultConfig.breakEvenOnly ? "selected" : ""}>Only withdraw at break-even or better</option>
                  <option value="prefer" ${vaultConfig.preferBreakEven && !vaultConfig.breakEvenOnly ? "selected" : ""}>Prefer break-even, then cover the shortfall</option>
                </select></label>
                <div class="vault-strategy-desc" id="withdraw-strategy-desc">Sell equal percentage from each stock</div>
            </div>
        </div>
        
        <div class="vault-config-section">
            <div class="vault-config-header">
                <span class="vault-config-title">Default Keep Amount</span>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
                <input type="text" id="vault-keep-amount" class="alfa-input" style="width:150px;" 
                    value="${vaultConfig.keepAmount > 0 ? vaultConfig.keepAmount.toLocaleString("en-US") : ""}" 
                    placeholder="e.g. 1m, 500k">
                <span style="font-size:11px; color:#666;">Cash to keep when using Vault Spread</span>
            </div>
        </div>
        
        <div class="vault-config-actions">
            <button id="vault-config-clear-cache" class="alfa-main-btn" style="border-color:#ef5350; color:#ef5350;">Clear Cache</button>
            <button id="vault-config-save" class="alfa-main-btn" style="border-color:#8bc34a; color:#8bc34a; flex:1;">Save Configuration</button>
        </div>
    </div>`;
      createModal("Vault Configuration", html);
      bindWithdrawalRisk(allStocks);
      const depositDescs = {
          cash_flow: "Use deposits to equalize the value of loose holdings, starting with the smallest.",
        "swing_strategy": "Same multi-indicator logic as swing scan (RSI, Bollinger, S/R, ADX, volume)",
        "equal": "Distribute cash evenly across all vault stocks",
        "dip_weighted": "Put more cash into stocks trading below their 7-day average",
        "rsi_weighted": "Prioritize oversold stocks (RSI < 30 gets more allocation)",
        "roi_priority": "Allocate based on benefit ROI (higher ROI = more cash)"
      };
      const withdrawDescs = {
        fewest_orders: "Use the fewest eligible stocks needed to raise the requested amount.",
        profitable_first: "Prefer the highest estimated after-fee FIFO return on each proposed sale. Unknown costs rank last.",
        overweight_first: "Sell the largest loose holdings first, then draw evenly as their values converge.",
        "loose_first": "Sell shares above benefit thresholds first (protects tiers)",
        "proportional": "Sell equal percentage from each vault stock",
        "swing_strategy": "Sell first from stocks with SELL/TAKE PROFIT signals (same logic as swing scan)",
        "worst_roi": "Sell from lowest ROI stocks first (keep the good ones)",
        "best_performers": "Sell from stocks that are up (take profits)"
      };
      $("#deposit-strategy-desc").text(depositDescs[vaultConfig.depositStrategy] || depositDescs["swing_strategy"]);
      $("#withdraw-strategy-desc").text(withdrawDescs[vaultConfig.withdrawStrategy] || withdrawDescs["proportional"]);
      $(".vault-stock-check").on("change", function() {
        const sym = $(this).val();
        const isChecked = $(this).is(":checked");
        $(this).closest(".vault-stock-option").toggleClass("selected", isChecked);
        if (isChecked && !vaultConfig.stocks.includes(sym)) {
          vaultConfig.stocks.push(sym);
        } else if (!isChecked) {
          vaultConfig.stocks = vaultConfig.stocks.filter((s) => s !== sym);
        }
        $("#vault-selected-count").text(vaultConfig.stocks.length);
      });
      $("#vault-select-none").on("click", function() {
        $(".vault-stock-check").prop("checked", false);
        $(".vault-stock-option").removeClass("selected");
        vaultConfig.stocks = [];
        $("#vault-selected-count").text(0);
      });
      $("#vault-select-active").on("click", function() {
        $(".vault-stock-check").prop("checked", false);
        $(".vault-stock-option").removeClass("selected");
        vaultConfig.stocks = [];
        Object.keys(STOCK_DATA).forEach((sym) => {
          if (STOCK_DATA[sym].type === "A") {
            $(`.vault-stock-check[value="${sym}"]`).prop("checked", true);
            $(`.vault-stock-option[data-sym="${sym}"]`).addClass("selected");
            vaultConfig.stocks.push(sym);
          }
        });
        $("#vault-selected-count").text(vaultConfig.stocks.length);
      });
      $("#vault-select-all").on("click", function() {
        $(".vault-stock-check").prop("checked", false);
        $(".vault-stock-option").removeClass("selected");
        vaultConfig.stocks = [];
        Object.keys(STOCK_DATA).forEach((sym) => {
          $(`.vault-stock-check[value="${sym}"]`).prop("checked", true);
          $(`.vault-stock-option[data-sym="${sym}"]`).addClass("selected");
          vaultConfig.stocks.push(sym);
        });
        $("#vault-selected-count").text(vaultConfig.stocks.length);
      });
      $("#vault-deposit-strategy").on("change", function() {
        vaultConfig.depositStrategy = $(this).val();
        $("#deposit-strategy-desc").text(depositDescs[vaultConfig.depositStrategy]);
      });
      $("#vault-profit-rebal").on("change", function() { vaultConfig.profitFirstRebalance = this.checked; });
      $("#vault-break-even").on("change", function() { vaultConfig.breakEvenOnly = this.value === "strict"; vaultConfig.preferBreakEven = this.value === "prefer"; });
      $("#vault-withdraw-strategy").on("change", function() {
        vaultConfig.withdrawStrategy = $(this).val();
        $("#withdraw-strategy-desc").text(withdrawDescs[vaultConfig.withdrawStrategy]);
      });
      $("#vault-keep-amount").on("change keyup", function() {
        vaultConfig.keepAmount = parseTornNumber($(this).val()) || 0;
      });
      $("#vault-config-clear-cache").on("click", function() {
        if (confirm("Clear all cached Tornsy data?")) {
          clearVaultCache();
          vaultAnalysisCache = {};
          $(this).text("Cleared!").css("color", "#8bc34a");
          setTimeout(() => $(this).text("Clear Cache").css("color", "#ef5350"), 1500);
        }
      });
      $("#vault-config-save").on("click", function() {
        saveVaultConfig();
        $(this).text("Saved!").css("background", "#8bc34a").css("color", "#111");
        setTimeout(() => {
          $(this).text("Save Configuration").css("background", "transparent").css("color", "#8bc34a");
          $("#alfa-modal-overlay").remove();
          updateVaultDisplay();
        }, 800);
      });
    }
    async function calculateDailyIncome() {
      let stockIncome = 0;
      let ownedBlocks = [];
      const symbols = Object.keys(STOCK_DATA);
      const IGNORED = ["BAG", "EVL", "CBD", "MCS"];
      for (let sym of symbols) {
        if (IGNORED.includes(sym)) continue;
        let stockData = STOCK_DATA[sym];
        let sharePrice = getPrice(sym);
        if (sharePrice === 0) continue;
        let owned = getOwnedShares(sym);
        let increment = stockData.base;
        let dailyYield = getDailyYield(sym);
        if (sym === "PTS") {
          let ptsPrice = itemPrices["points"] || 0;
          if (ptsPrice > 0) dailyYield = ptsPrice * 100 / 7;
        }
        let currentLevel = 0;
        if (stockData.type === "P") {
          currentLevel = owned >= increment ? 1 : 0;
        } else if (owned >= increment) {
          currentLevel = Math.floor(Math.log2(owned / increment + 1));
        }
        if (currentLevel > 0 && dailyYield > 0) {
          if (stockData.type === "P") {
            let blockCost = increment * sharePrice;
            let blockRoi = blockCost > 0 ? dailyYield * 365 / blockCost * 100 : 0;
            stockIncome += dailyYield;
            ownedBlocks.push({ name: sym, tier: 1, income: dailyYield, value: blockCost, roi: blockRoi });
          } else {
            for (let i = 1; i <= currentLevel; i++) {
              let tierShares = increment * Math.pow(2, i - 1);
              let tierCost = tierShares * sharePrice;
              let tierRoi = tierCost > 0 ? dailyYield * 365 / tierCost * 100 : 0;
              stockIncome += dailyYield;
              ownedBlocks.push({ name: sym, tier: i, income: dailyYield, value: tierCost, roi: tierRoi });
            }
          }
        }
      }
      let bankIncome = 0;
      let bankPrincipal = 0;
      let bankRate = null;
      const nwData = lastNwCache && lastNwCache.nwFromApi ? await getLiquidNetworth(true) : await getLiquidNetworth(false);
      if (nwData && nwData.bankActive) {
        bankIncome = nwData.dailyBank;
        bankPrincipal = nwData.bankPrincipal;
        bankRate = nwData.bankRate ?? null;
      }
      return {
        stockIncome,
        bankIncome,
        totalIncome: bankIncome == null ? null : stockIncome + bankIncome,
        bankPrincipal,
        bankRate,
        ownedBlocks
      };
    }
    function getBlockStatus(sym) {
      const stockData = STOCK_DATA[sym];
      if (!stockData) return null;
      const owned = getOwnedShares(sym);
      const price = getPrice(sym);
      const base = stockData.base;
      const isPassive = stockData.type === "P";
      let currentTier = 0;
      if (isPassive) {
        currentTier = owned >= base ? 1 : 0;
      } else if (owned >= base) {
        currentTier = Math.floor(Math.log2(owned / base + 1));
      }
      const maxTier = isPassive ? 1 : null;
      const isMaxed = isPassive && currentTier >= 1;
      let sharesForNextTier, nextTierTotal;
      if (isPassive) {
        sharesForNextTier = base;
        nextTierTotal = base;
      } else {
        const nextTier = currentTier + 1;
        nextTierTotal = base * (Math.pow(2, nextTier) - 1);
        sharesForNextTier = base * Math.pow(2, nextTier - 1);
      }
      const sharesNeeded = Math.max(0, nextTierTotal - owned);
      const progress = nextTierTotal > 0 ? Math.min(100, owned / nextTierTotal * 100) : 0;
      const costToComplete = sharesNeeded * price;
      const dailyYield = getDailyYield(sym);
      const tierCost = sharesForNextTier * price;
      const roi = tierCost > 0 ? dailyYield * 365 / tierCost * 100 : 0;
      const userCash = getMoneyFast();
      const canAfford = costToComplete <= userCash;
      const isClose = progress >= 80 && progress < 100;
      const hasOpportunity = !isMaxed && (isClose || canAfford) && sharesNeeded > 0;
      return {
        symbol: sym,
        currentTier,
        maxTier,
        isMaxed,
        isPassive,
        sharesOwned: owned,
        sharesForNextTier: nextTierTotal,
        sharesNeeded,
        progress,
        costToComplete,
        roi,
        canAfford,
        isClose,
        hasOpportunity,
        price,
        dailyYield
      };
    }
    function calculateTotalVaultValue() {
      const excludeLocked = vaultConfig.excludeLockedBlocksFromValue === true;
      const lockBlocks = $("#alfa-lock-toggle").length > 0 ? $("#alfa-lock-toggle").is(":checked") : localStorage.getItem("alfa_vault_lock") === "true";
      let total = 0;
      for (const sym of vaultConfig.stocks) {
        const owned = getOwnedShares(sym);
        const price = getPrice(sym);
        if (!excludeLocked || !lockBlocks) {
          total += owned * price;
          continue;
        }
        const benefitLockedShares = blockReserve(sym, owned, lockBlocks);
        total += Math.max(0, owned - benefitLockedShares) * price;
      }
      return total;
    }
    function calculateVaultBreakdown() {
      const breakdown = [];
      const totalValue = calculateTotalVaultValue();
      const excludeLocked = vaultConfig.excludeLockedBlocksFromValue === true;
      const checkbox = $("#alfa-lock-toggle");
      const lockBlocks = checkbox.length > 0 ? checkbox.is(":checked") : localStorage.getItem("alfa_vault_lock") === "true";
      for (const sym of vaultConfig.stocks) {
        const owned = getOwnedShares(sym);
        const price = getPrice(sym);
        const tierInfo = getBenefitTier(sym, owned);
        const stockData = STOCK_DATA[sym];
        const swingProtectedShares = swingTradeData.activePositions.filter((p) => (p.symbol || "").toUpperCase() === (sym || "").toUpperCase()).reduce((sum, p) => sum + (p.shares || 0), 0);
        const benefitLockedShares = blockReserve(sym, owned, lockBlocks);
        const totalProtected = benefitLockedShares + swingProtectedShares;
        const looseShares = Math.max(0, owned - totalProtected);
        const looseValue = looseShares * price;
        const isLocked = vaultConfig.lockedStocks && vaultConfig.lockedStocks.includes(sym);
        let value = owned * price;
        if (excludeLocked && lockBlocks) {
          value = Math.max(0, owned - benefitLockedShares) * price;
        }
        const percentage = totalValue > 0 ? value / totalValue * 100 : 0;
        breakdown.push({
          symbol: sym,
          owned,
          price,
          value,
          percentage,
          tier: tierInfo.tier,
          lockedShares: totalProtected,
          benefitLockedShares,
          swingProtectedShares,
          looseShares,
          looseValue,
          isLocked,
          hasSwingTrade: swingProtectedShares > 0,
          analysis: vaultAnalysisCache[sym] || null
        });
      }
      return breakdown.sort((a, b) => b.value - a.value);
    }
    function formatCompactNumber(num) {
      const n = Number(num);
      if (!isFinite(n)) return "0";
      const abs = Math.abs(n);
      if (abs >= 1e9) return (n / 1e9).toFixed(2) + "B";
      if (abs >= 1e6) return (n / 1e6).toFixed(2) + "M";
      if (abs >= 1e3) return (n / 1e3).toFixed(2) + "K";
      return n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    function getSignalBadge(analysis) {
      if (!analysis) return "";
      const signals = {
        "buy": { color: "#66bb6a", text: "BUY", icon: "\u25B2" },
        "good": { color: "#81c784", text: "GOOD", icon: "\u25B2" },
        "hold": { color: "#ffd54f", text: "HOLD", icon: "\u25CF" },
        "take_profit": { color: "#ffb74d", text: "TAKE PROFIT", icon: "\u25BC" },
        "sell": { color: "#ef5350", text: "SELL", icon: "\u25BC" }
      };
      const sig = signals[analysis.signal] || signals.hold;
      return `<span class="vault-signal-badge" style="background:${sig.color}20; color:${sig.color}; border-color:${sig.color};">${sig.icon} ${sig.text}</span>`;
    }
    function persistVaultModuleExpandedState() {
      if ($("#vault-trade-view").is(":visible") || $("#vault-main-content").length && !$("#vault-main-content").is(":visible")) {
        return;
      }
      if ($("#vault-pl-content").length) localStorage.setItem("alfa_pl_expanded", $("#vault-pl-content").is(":visible") ? "true" : "false");
      if ($("#swing-content").length) localStorage.setItem("alfa_swing_expanded", $("#swing-content").is(":visible") ? "true" : "false");
      if ($("#stocks-content").length) localStorage.setItem("alfa_stocks_expanded", $("#stocks-content").is(":visible") ? "true" : "false");
    }
    const vaultColumns = {
      symbol: "Ticker", value: "Value", percentage: "Vault %", gain: "Gain/loss %",
      dip: "7-day deviation %", rsi: "RSI", looseValue: "Loose value"
    };
    let holdingsSort = {column: "value", direction: -1};
    function recentSalesSummary(transactions, now, ownedFor) {
      const since = now - 30 * 86400;
      const summary = {sales: 0, fees: 0, pnl: 0, unknownPnl: 0, quickShares: 0, quickGross: 0, unknownAge: 0};
      const bySymbol = new Map();
      for (const tx of transactions) {
        if (tx.timestamp > now || !["buy", "sell"].includes(tx.type)) continue;
        if (!bySymbol.has(tx.symbol)) bySymbol.set(tx.symbol, []);
        bySymbol.get(tx.symbol).push(tx);
      }
      for (const [symbol, history] of bySymbol) {
        history.sort((a,b) => a.timestamp - b.timestamp);
        if (!history.some(tx => tx.type === "sell" && tx.timestamp >= since)) continue;
        const owned = ownedFor(symbol);
        let net = 0, lowest = 0;
        for (const tx of history) {
          net += (tx.type === "buy" ? 1 : -1) * Number(tx.shares);
          lowest = Math.min(lowest, net);
        }
        const opening = owned - net;
        const reconciled = Number.isSafeInteger(owned) && Number.isSafeInteger(opening) && opening >= -lowest;
        const lots = opening > 0 ? [{shares: opening, time: null, price: null}] : [];
        let head = 0;
        for (const tx of history) {
          const shares = Number(tx.shares);
          if (tx.type === "buy") {
            lots.push({shares, time: tx.timestamp, price: Number(tx.pricePerShare)});
            continue;
          }
          const recent = tx.timestamp >= since;
          const gross = Number(tx.totalValue);
          let left = shares, cost = 0, knownCost = reconciled;
          while (left > 0 && head < lots.length) {
            const lot = lots[head];
            const used = Math.min(left, lot.shares);
            if (!(lot.price > 0)) knownCost = false;
            else cost += used * lot.price;
            if (recent && reconciled) {
              if (lot.time === null) summary.unknownAge += used;
              else if (tx.timestamp - lot.time <= 48 * 3600) {
                summary.quickShares += used;
                summary.quickGross += gross * used / shares;
              }
            }
            left -= used;
            lot.shares -= used;
            if (!lot.shares) head++;
          }
          if (!recent) continue;
          summary.sales++;
          summary.unknownAge += reconciled ? left : shares;
          const fee = stockSellFee(tx);
          summary.fees += fee;
          if (knownCost && left === 0) summary.pnl += gross - cost - fee;
          else if (Number.isFinite(tx.profit) && tx.profit !== 0) summary.pnl += stockNetProfit(tx);
          else summary.unknownPnl++;
        }
      }
      return summary;
    }
    function sortedHoldings(stocks, perStock) {
      const {column, direction} = holdingsSort;
      function field(stock) {
        if (column === "gain") {
          const basis = perStock[stock.symbol];
          return basis?.totalCost > 0 ? basis.unrealizedPLPercent : null;
        }
        if (column === "dip") return stock.analysis?.dipFrom7d;
        if (column === "rsi") return stock.analysis?.rsi;
        return stock[column];
      }
      return stocks.slice().sort((a,b) => {
        if (column === "symbol") return direction * a.symbol.localeCompare(b.symbol);
        const left = field(a), right = field(b);
        if (Number.isFinite(left) !== Number.isFinite(right)) return Number.isFinite(left) ? -1 : 1;
        return (Number.isFinite(left) ? direction * (left - right) : 0) || a.symbol.localeCompare(b.symbol);
      });
    }
    function renderVaultSection() {
      if (vaultConfig.educationProtection) void refreshEducation();
      persistVaultModuleExpandedState();
      $("#alfa-vault-section").remove();
      const savedKey = localStorage.getItem("alfa_vault_apikey") || "";
      const lockBlocks = localStorage.getItem("alfa_vault_lock") === "true";
      if (vaultConfig.stocks.length === 0 && !goalPercent(vaultConfig.blockGoal)) {
        const html2 = `
        <div id="alfa-vault-section" class="alfa-vault-section">
            <div class="alfa-vault-header">
                <span class="alfa-vault-title">Smart Stock Vault</span>
                <div class="alfa-vault-actions">
                    <button id="vault-config-btn" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a;">Settings</button>
                </div>
            </div>
            <div class="alfa-vault-empty">
                <div style="font-size:14px; margin-bottom:8px;">No vault stocks configured</div>
                <div style="font-size:11px; color:#666;">Click Settings to configure your vault</div>
            </div>
        </div>`;
        mountVaultHtml(html2);
        return;
      }
      const minimalMode = vaultConfig.minimalMode === true;
      const mod = vaultConfig.modules || { ...DEFAULT_VAULT_CONFIG.modules };
      const totalValue = calculateTotalVaultValue();
      const breakdown = calculateVaultBreakdown();
      const lockBlocksChecked = localStorage.getItem("alfa_vault_lock") === "true";
      let plData, hasPortfolioData, lastSyncDate, currentPeriod, periodPL;
      if (!minimalMode && (mod.portfolio || mod.stocks)) {
        plData = calculatePortfolioPL();
        hasPortfolioData = portfolioData.transactions.length > 0;
        lastSyncDate = portfolioData.lastFullSync > 0 ? new Date(portfolioData.lastFullSync).toLocaleDateString() : "Never";
        currentPeriod = localStorage.getItem("alfa_pl_period") || "all";
        periodPL = calculatePeriodPL(currentPeriod);
      }
      const stockBars = !minimalMode && mod.stocks ? sortedHoldings(breakdown, plData.perStock).map((stock) => {
        const barWidth = Math.max(5, stock.percentage);
        const dipDisplay = stock.analysis ? `<span class="${stock.analysis.dipFrom7d < 0 ? "vault-dip-neg" : "vault-dip-pos"}">7d vs avg ${stock.analysis.dipFrom7d >= 0 ? "+" : ""}${stock.analysis.dipFrom7d.toFixed(1)}%</span>` : "";
        const rsiDisplay = stock.analysis ? `<span class="vault-rsi ${stock.analysis.rsi < 30 ? "oversold" : stock.analysis.rsi > 70 ? "overbought" : ""}">RSI:${stock.analysis.rsi.toFixed(0)}</span>` : "";
        const lockedClass = stock.isLocked ? "vault-row-locked" : "";
        const stockPL = plData.perStock[stock.symbol];
        let plDisplay = "";
        if (stockPL && stockPL.totalCost > 0) {
          const plColor = stockPL.unrealizedPL >= 0 ? "#8bc34a" : "#ef5350";
          const plSign = stockPL.unrealizedPL >= 0 ? "+" : "";
          plDisplay = `<span class="vault-stock-pl" style="color:${plColor};">P&amp;L ${plSign}${stockPL.unrealizedPLPercent.toFixed(1)}%</span>`;
        }
        const swingIndicator = stock.hasSwingTrade ? `<span class="vault-swing-badge" title="Protected by swing trade (${stock.swingProtectedShares.toLocaleString()} shares)">\u{1F4C8}</span>` : "";
        const blockStatus = getBlockStatus(stock.symbol);
        let blockIcon = "";
        let blockProgressBar = "";
        if (blockStatus) {
          const tierLabel = blockStatus.currentTier > 0 ? blockStatus.isPassive ? "1" : blockStatus.currentTier : "";
          let iconClass = "no-block";
          let iconTitle = "No block - click to complete";
          if (blockStatus.isMaxed) {
            iconClass = "maxed";
            iconTitle = "Maximum tier reached \u2713";
          } else if (blockStatus.canAfford) {
            iconClass = "can-afford";
            iconTitle = `Can afford next tier! Cost: ${formatMoney(blockStatus.costToComplete)}`;
          } else if (blockStatus.currentTier > 0) {
            iconClass = blockStatus.isClose ? "has-tier close" : "has-tier";
            iconTitle = `Tier ${blockStatus.currentTier} - ${blockStatus.progress.toFixed(0)}% to next (${formatMoney(blockStatus.costToComplete)})`;
          } else if (blockStatus.isClose) {
            iconClass = "close";
            iconTitle = `${blockStatus.progress.toFixed(0)}% to first tier (${formatMoney(blockStatus.costToComplete)})`;
          }
          blockIcon = `
                <span class="vault-block-icon ${iconClass}" 
                      data-sym="${stock.symbol}" 
                      title="${iconTitle}">
                    <span class="block-icon-shape">\u25A3</span>
                    ${tierLabel ? `<span class="block-tier-num">${tierLabel}</span>` : ""}
                </span>`;
          if (!blockStatus.isMaxed && blockStatus.progress > 0 && blockStatus.progress < 100) {
            blockProgressBar = `
                    <div class="vault-block-progress" title="${blockStatus.sharesOwned.toLocaleString()} / ${blockStatus.sharesForNextTier.toLocaleString()} shares">
                        <div class="vault-block-progress-fill ${blockStatus.isClose ? "close" : ""}" style="width:${blockStatus.progress}%;"></div>
                    </div>`;
          }
        }
        return `
        <div class="vault-stock-row ${lockedClass}" data-sym="${stock.symbol}">
            <div class="vault-stock-info">
                <span class="vault-stock-name">${stock.symbol}</span>
                ${swingIndicator}
                <span class="vault-stock-value">$${formatCompactNumber(stock.value)}</span>
                <span class="vault-stock-pct">(Vault ${stock.percentage.toFixed(1)}%)</span>
                ${plDisplay}
                ${getSignalBadge(stock.analysis)}
                <div class="vault-stock-actions">
                    <button class="vault-action-btn vault-quick-buy" data-sym="${stock.symbol}" title="Quick buy">Buy</button>
                    <button class="vault-action-btn vault-quick-sell" data-sym="${stock.symbol}" title="Sell loose shares" ${stock.looseShares <= 0 ? "disabled" : ""}>Sell</button>
                    <button class="vault-action-btn vault-toggle-lock ${stock.isLocked ? "locked" : ""}" data-sym="${stock.symbol}" title="${stock.isLocked ? "Unlock stock" : "Lock stock"}">${stock.isLocked ? "\u{1F512}" : "\u{1F513}"}</button>
                    ${blockIcon}
                </div>
            </div>
            <div class="vault-stock-bar-container">
                <div class="vault-stock-bar" style="width:${barWidth}%;">
                    <div class="vault-stock-bar-loose" style="width:${stock.looseShares > 0 ? stock.looseValue / stock.value * 100 : 0}%;"></div>
                </div>
            </div>
            ${blockProgressBar}
            <div class="vault-stock-details">
                ${dipDisplay} ${rsiDisplay}
                ${stock.looseShares > 0 ? `<span class="vault-loose">Loose: $${formatCompactNumber(stock.looseValue)}</span>` : ""}
            </div>
        </div>`;
      }).join("") : "";
      const html = `
    <div id="alfa-vault-section" class="alfa-vault-section">
        <div class="alfa-vault-header">
            <span class="alfa-vault-title">Smart Stock Vault</span>
            <div class="alfa-vault-actions">
                <button id="vault-config-btn" class="alfa-mini-btn" style="border-color:#888; color:#888;">Settings</button>
            </div>
        </div>
        
        <div id="vault-main-content">
        ${!minimalMode ? `
        <div class="alfa-vault-summary">
            <div class="alfa-vault-total">
                <span class="alfa-vault-total-label">Total Vault Value</span>
                <span class="alfa-vault-total-value">${formatMoneyWhole(totalValue)}</span>
            </div>
            <div class="alfa-vault-meta">
                <span>${vaultConfig.stocks.length} stocks</span>
            </div>
        </div>
        
        <div class="alfa-vault-income-row" id="vault-income-row">
            <span class="vault-income-icon">\u{1F4B0}</span>
            <span class="vault-income-label">Daily Income:</span>
            <span class="vault-income-value" id="vault-daily-income">--</span>
            <span class="vault-income-sep">|</span>
            <span class="vault-income-bank" id="vault-bank-info">\u{1F3E6} Loading...</span>
        </div>
        
        ${mod.portfolio ? `
        <div class="alfa-vault-pl-section" id="vault-pl-section">
            <div class="vault-pl-header" id="vault-pl-toggle">
                <span class="vault-pl-title">\u{1F4CA} Portfolio P&L</span>
                <span class="alfa-caret ${localStorage.getItem("alfa_pl_expanded") !== "false" ? "rotated" : ""}">\u25BC</span>
            </div>
            <div class="vault-pl-content" id="vault-pl-content" style="display:${localStorage.getItem("alfa_pl_expanded") !== "false" ? "block" : "none"};">
                <details id="vault-month-sales" style="margin:6px 0">
                  <summary style="cursor:pointer">Last 30 days · sales, fees and 48-hour holds</summary>
                  <div class="vault-month-detail"></div>
                </details>
                ${hasPortfolioData ? `
                <div class="vault-pl-period-filters">
                    <button class="pl-period-btn ${currentPeriod === "day" ? "active" : ""}" data-period="day">Day</button>
                    <button class="pl-period-btn ${currentPeriod === "week" ? "active" : ""}" data-period="week">Week</button>
                    <button class="pl-period-btn ${currentPeriod === "month" ? "active" : ""}" data-period="month">Month</button>
                    <button class="pl-period-btn ${currentPeriod === "ytd" ? "active" : ""}" data-period="ytd">YTD</button>
                    <button class="pl-period-btn ${currentPeriod === "year" ? "active" : ""}" data-period="year">Year</button>
                    <button class="pl-period-btn ${currentPeriod === "all" ? "active" : ""}" data-period="all">All</button>
                </div>
                <div class="vault-pl-period-summary">
                    <div class="pl-period-title">${getPeriodLabel(currentPeriod)} Activity</div>
                    <div class="pl-period-stats">
                        <div class="pl-period-stat">
                            <span class="pl-stat-label">Buys</span>
                            <span class="pl-stat-value">${periodPL.buys.length} (${formatMoneyWhole(periodPL.totalBuyValue)})</span>
                        </div>
                        <div class="pl-period-stat">
                            <span class="pl-stat-label">Sells</span>
                            <span class="pl-stat-value">${periodPL.sells.length} (${formatMoneyWhole(periodPL.totalSellValue)})</span>
                        </div>
                        <div class="pl-period-stat ${periodPL.realizedPL >= 0 ? "pl-positive" : "pl-negative"}">
                            <span class="pl-stat-label">Realized P&L</span>
                            <span class="pl-stat-value">${periodPL.realizedPL >= 0 ? "+" : ""}${formatMoneyWhole(periodPL.realizedPL)}</span>
                        </div>
                        <div class="pl-period-stat">
                            <span class="pl-stat-label">Fees</span>
                            <span class="pl-stat-value" style="color:#ff9800;">${formatMoneyWhole(periodPL.fees)}</span>
                        </div>
                        <div class="pl-period-stat">
                            <span class="pl-stat-label">Net Flow</span>
                            <span class="pl-stat-value" style="color:${periodPL.netInvested > 0 ? "#66bb6a" : periodPL.netInvested < 0 ? "#ef5350" : "#888"};">${periodPL.netInvested > 0 ? "+" : ""}${formatMoneyWhole(periodPL.netInvested)}</span>
                        </div>
                    </div>
                </div>
                
                <div class="vault-pl-divider"></div>
                
                <div class="vault-pl-section-title">Portfolio Totals</div>
                <div class="vault-pl-grid">
                    <div class="vault-pl-item">
                        <span class="vault-pl-label">Cost Basis</span>
                        <span class="vault-pl-value">${plData.totalCostBasis > 0 ? formatMoneyWhole(plData.totalCostBasis) : "Unknown"}</span>
                    </div>
                    <div class="vault-pl-item">
                        <span class="vault-pl-label">Current Value</span>
                        <span class="vault-pl-value">${formatMoneyWhole(plData.totalCurrentValue)}</span>
                    </div>
                    <div class="vault-pl-item ${plData.unrealizedPL >= 0 ? "pl-positive" : "pl-negative"}">
                        <span class="vault-pl-label" ${plData.hasIncompleteData ? 'title="Cost basis may be incomplete when older buys are outside Torn log history"' : ""}>Unrealized P&L</span>
                        <span class="vault-pl-value">${plData.totalCostBasis > 0 ? (plData.unrealizedPL >= 0 ? "+" : "") + formatMoneyWhole(plData.unrealizedPL) + " (" + (plData.unrealizedPLPercent >= 0 ? "+" : "") + plData.unrealizedPLPercent.toFixed(2) + "%)" : "N/A"}</span>
                    </div>
                    <div class="vault-pl-item ${plData.realizedPL >= 0 ? "pl-positive" : "pl-negative"}">
                        <span class="vault-pl-label">Realized P&L \u2713</span>
                        <span class="vault-pl-value">${plData.realizedPL >= 0 ? "+" : ""}${formatMoneyWhole(plData.realizedPL)}</span>
                    </div>
                    <div class="vault-pl-item">
                        <span class="vault-pl-label">Total Fees</span>
                        <span class="vault-pl-value" style="color:#ff9800;">${formatMoneyWhole(plData.totalFees)}</span>
                    </div>
                    <div class="vault-pl-item">
                        <span class="vault-pl-label">Transactions</span>
                        <span class="vault-pl-value">${portfolioData.transactions.length}</span>
                    </div>
                </div>
                <div class="vault-pl-actions">
                    <button id="vault-pl-sync" class="alfa-mini-btn" style="border-color:#caa14a; color:#caa14a;">Sync New</button>
                    <button id="vault-pl-full-sync" class="alfa-mini-btn" style="border-color:#ff9800; color:#ff9800;">Full Sync</button>
                    <button id="vault-pl-history" class="alfa-mini-btn" style="border-color:#888; color:#888;">History</button>
                    <span class="vault-pl-sync-info">Last: ${lastSyncDate}</span>
                </div>
                ` : `
                <div class="vault-pl-empty">
                    <div style="margin-bottom:10px;">No portfolio data yet</div>
                    <button id="vault-pl-initial-sync" class="alfa-main-btn" style="border-color:#caa14a; color:#caa14a;">
                        Sync Transaction History
                    </button>
                    <div style="font-size:10px; color:#666; margin-top:8px;">
                        This will fetch your stock buy/sell history from Torn's logs
                    </div>
                </div>
                `}
            </div>
        </div>
        ` : ""}
        
        
        ${!minimalMode && mod.swing ? `
        <div class="alfa-swing-section" id="swing-section">
            <div class="swing-header" id="swing-toggle">
                <span class="swing-title">\u{1F4C8} Swing Trading</span>
                <span class="alfa-caret ${localStorage.getItem("alfa_swing_expanded") !== "false" ? "rotated" : ""}">\u25BC</span>
            </div>
            <div class="swing-content" id="swing-content" style="display:${localStorage.getItem("alfa_swing_expanded") !== "false" ? "block" : "none"};">
                <div class="swing-tabs">
                    <button class="swing-tab active" data-tab="positions">Positions</button>
                    <button class="swing-tab" data-tab="signals">Signals</button>
                    <button class="swing-tab" data-tab="journal">Journal</button>
                </div>
                
                <div class="swing-tab-content" id="swing-tab-positions">
                    <div class="swing-positions-list" id="swing-positions-list">
                        ${renderSwingPositions()}
                    </div>
                    <div class="swing-actions">
                        <button id="swing-add-position" class="alfa-mini-btn" style="border-color:#66bb6a; color:#66bb6a;">+ Add Position</button>
                        <button id="swing-refresh-signals" class="alfa-mini-btn" style="border-color:#ffd54f; color:#ffd54f;" title="Update prices and signals for your positions">Refresh signals</button>
                    </div>
                </div>
                
                <div class="swing-tab-content" id="swing-tab-signals" style="display:none;">
                    <div class="swing-signals-list" id="swing-signals-list">
                        <div class="swing-loading">Click "Scan" to find opportunities...</div>
                    </div>
                    <div class="swing-actions">
                        <button id="swing-scan-signals" class="alfa-mini-btn" style="border-color:#ffd54f; color:#ffd54f;">\u{1F50D} Scan All Stocks</button>
                    </div>
                </div>
                
                <div class="swing-tab-content" id="swing-tab-journal" style="display:none;">
                    <div class="swing-stats" id="swing-stats">
                        ${renderSwingStats()}
                    </div>
                    <div class="swing-journal-list" id="swing-journal-list">
                        ${renderSwingJournal()}
                    </div>
                </div>
            </div>
        </div>
        ` : ""}
        
        ${!minimalMode && mod.stocks ? `
        <div class="alfa-stocks-section" id="stocks-section">
            <div class="stocks-header" id="stocks-toggle">
                <span class="stocks-title">\u{1F4CB} Vault Stocks</span>
                <span class="alfa-caret ${localStorage.getItem("alfa_stocks_expanded") !== "false" ? "rotated" : ""}" id="stocks-caret">\u25BC</span>
            </div>
            <div class="stocks-content" id="stocks-content" style="display:${localStorage.getItem("alfa_stocks_expanded") !== "false" ? "block" : "none"};">
                <div role="group" aria-label="Sort vault holdings" style="display:flex;flex-wrap:wrap;gap:4px">
                  ${Object.entries(vaultColumns).map(([key,label]) => `<button type="button" class="alfa-mini-btn vault-sort-column" data-column="${key}" aria-pressed="${holdingsSort.column === key}">${label}${holdingsSort.column === key ? holdingsSort.direction === 1 ? " ↑" : " ↓" : ""}</button>`).join("")}
                </div>
                <div class="alfa-vault-breakdown" id="vault-breakdown">
                    ${stockBars}
                </div>
            </div>
        </div>
        ` : ""}
        
        ` : ""}
        
        <div class="alfa-vault-controls">
            <div class="alfa-vault-control-group">
                <button id="vault-spread-btn" class="alfa-main-btn vault-spread-btn">Vault Spread</button>
                <input type="text" id="vault-spread-keep" class="alfa-input" style="width:80px;" placeholder="Keep" 
                    value="${vaultConfig.keepAmount > 0 ? vaultConfig.keepAmount : ""}">
            </div>
            <div class="alfa-vault-control-group">
                <button id="vault-rebalance-btn" class="alfa-main-btn vault-rebalance-btn" title="Rebalance portfolio based on current strategy">Rebalance</button>
                ${!minimalMode && mod.stocks ? `<button id="vault-analyze-btn" class="alfa-main-btn vault-analyze-btn" title="Refresh analysis and update signals on vault stocks">Analyze</button>` : ""}
            </div>
            <div class="alfa-vault-control-group">
                <input type="text" id="vault-withdraw-amt" class="alfa-input" style="width:100px;" placeholder="Net cash" title="Cash you want after the 0.1% sell fee">
                <button id="vault-withdraw-btn" class="alfa-main-btn vault-withdraw-btn">Withdraw</button>
            </div>
        </div>
        
        <details id="vault-capacity" style="margin:6px 0">
          <summary style="cursor:pointer">Available at break-even after fees: ~${formatWithdrawMoney(withdrawalCapacity(breakdown).safe)}</summary>
          <div class="vault-capacity-detail"></div><div class="vault-shortfall"></div>
        </details>
        <div class="alfa-vault-options">
            <label class="vault-option-label" title="Protect benefit tier shares from being sold">
                <input type="checkbox" id="alfa-lock-toggle" ${lockBlocksChecked ? "checked" : ""}>
                <span>Lock Blocks</span>
            </label>
            <label class="vault-option-label" title="Skip stocks with SELL or TAKE PROFIT signals">
                <input type="checkbox" id="vault-skip-overvalued" ${vaultConfig.skipOvervalued ? "checked" : ""}>
                <span>Smart Mode</span>
            </label>
        </div>
        
        <div id="vault-status" class="alfa-vault-status"></div>
        </div>
        
        <div id="vault-trade-view" class="vault-trade-view" style="display:none;"></div>
    </div>`;
      mountVaultHtml(html);
      $(".vault-sort-column").on("click", function() {
        const column = this.dataset.column;
        holdingsSort = {column, direction: holdingsSort.column === column ? -holdingsSort.direction : column === "symbol" ? 1 : -1};
        renderVaultSection();
      });
      $("#vault-month-sales").on("toggle", function() {
        if (!this.open) return;
        const report = recentSalesSummary(portfolioData.transactions, Math.floor(Date.now()/1000),
          sym => stockRows[sym] ? getOwnedShares(sym) : null);
        this.querySelector(".vault-month-detail").textContent = report.sales ?
          report.sales + " synced sales · Fees: " + formatSalePnl(report.fees) +
          " · Realized after fees: " + formatSalePnl(report.pnl) + (report.unknownPnl ? " (known portion; " + report.unknownPnl + " sales unavailable)" : "") +
          " · Sold within 48h of purchase (FIFO): " + report.quickShares.toLocaleString() + " shares, " +
          formatWithdrawMoney(report.quickGross) + " gross" + (report.unknownAge ? " · Age unknown: " + report.unknownAge.toLocaleString() + " shares" : "") :
          "No synced sales in the last 30 days. Sync your transaction history for coverage.";
      });
      function refreshCapacity() {
        const panel = document.getElementById("vault-capacity");
        if (!panel) return;
        const capacity = withdrawalCapacity(calculateVaultBreakdown());
        panel.querySelector("summary").textContent = "Available at break-even after fees: ~" + formatWithdrawMoney(capacity.safe);
        panel.querySelector(".vault-capacity-detail").textContent =
          "Estimated net at displayed prices · Protected or locked: " + formatWithdrawMoney(capacity.protected) +
          " · Behind FIFO break-even limit: " + formatWithdrawMoney(capacity.below) +
          " · Cost unknown: " + formatWithdrawMoney(capacity.unknown) +
          (capacity.noQuote ? " · Missing quote: " + capacity.noQuote + " holdings" : "");
        panel.querySelector(".vault-shortfall").textContent = shortfallPreview(capacity, parseTornNumber($("#vault-withdraw-amt").val()));
      }
      $("#vault-capacity").on("toggle", refreshCapacity);
      $("#vault-withdraw-amt").on("input", refreshCapacity);
      $("#vault-spread-btn").on("click", vaultSpread);
      $("#vault-rebalance-btn").on("click", vaultRebalance);
      $("#vault-withdraw-btn").on("click", () => smartWithdraw(parseTornNumber($("#vault-withdraw-amt").val())));
      $("#vault-analyze-btn").on("click", vaultAnalyze);
      $("#vault-pl-toggle").on("click", function() {
        $("#vault-pl-content").slideToggle(150, function() {
          localStorage.setItem("alfa_pl_expanded", $("#vault-pl-content").is(":visible") ? "true" : "false");
        });
        $(this).find(".alfa-caret").toggleClass("rotated");
      });
      $(".pl-period-btn").on("click", function() {
        const period = $(this).data("period");
        localStorage.setItem("alfa_pl_period", period);
        $(".pl-period-btn").removeClass("active");
        $(this).addClass("active");
        const periodPL2 = calculatePeriodPL(period);
        $(".pl-period-title").text(getPeriodLabel(period) + " Activity");
        $(".pl-period-stats").html(`
            <div class="pl-period-stat">
                <span class="pl-stat-label">Buys</span>
                <span class="pl-stat-value">${periodPL2.buys.length} (${formatMoneyWhole(periodPL2.totalBuyValue)})</span>
            </div>
            <div class="pl-period-stat">
                <span class="pl-stat-label">Sells</span>
                <span class="pl-stat-value">${periodPL2.sells.length} (${formatMoneyWhole(periodPL2.totalSellValue)})</span>
            </div>
            <div class="pl-period-stat ${periodPL2.realizedPL >= 0 ? "pl-positive" : "pl-negative"}">
                <span class="pl-stat-label">Realized P&L</span>
                <span class="pl-stat-value">${periodPL2.realizedPL >= 0 ? "+" : ""}${formatMoneyWhole(periodPL2.realizedPL)}</span>
            </div>
            <div class="pl-period-stat">
                <span class="pl-stat-label">Fees</span>
                <span class="pl-stat-value" style="color:#ff9800;">${formatMoneyWhole(periodPL2.fees)}</span>
            </div>
            <div class="pl-period-stat">
                <span class="pl-stat-label">Net Flow</span>
                <span class="pl-stat-value" style="color:${periodPL2.netInvested > 0 ? "#66bb6a" : periodPL2.netInvested < 0 ? "#ef5350" : "#888"};">${periodPL2.netInvested > 0 ? "+" : ""}${formatMoneyWhole(periodPL2.netInvested)}</span>
            </div>
        `);
      });
      $("#vault-pl-sync, #vault-pl-initial-sync").on("click", async function() {
        const btn = $(this);
        const status = $("#vault-status");
        btn.prop("disabled", true).text("Syncing...");
        const syncResult = await incrementalPortfolioSync((msg) => {
          status.html(`<span style="color:#ffd54f;">${msg}</span>`);
        });
        updateVaultDisplay();
        const statusAfter = $("#vault-status");
        if (syncResult && !syncResult.success) {
          statusAfter.html(`<span style="color:#ef5350;">${syncResult.error || "Sync failed"}</span>`);
        }
        setTimeout(() => statusAfter.html(""), 4e3);
      });
      $("#vault-pl-full-sync").on("click", async function() {
        if (!confirm("Full sync will fetch ALL your stock transaction history. This may take a while. Continue?")) {
          return;
        }
        const btn = $(this);
        const status = $("#vault-status");
        btn.prop("disabled", true).text("Syncing...");
        const syncResult = await fullPortfolioSync((msg) => {
          status.html(`<span style="color:#ffd54f;">${msg}</span>`);
        });
        updateVaultDisplay();
        const statusAfter = $("#vault-status");
        if (!syncResult.success) {
          statusAfter.html(`<span style="color:#ef5350;">${syncResult.error || "Sync failed"}</span>`);
        }
        setTimeout(() => statusAfter.html(""), 4e3);
      });
      $("#vault-pl-history").on("click", openTransactionHistoryModal);
      $("#swing-toggle").on("click", function() {
        $("#swing-content").slideToggle(150, function() {
          localStorage.setItem("alfa_swing_expanded", $("#swing-content").is(":visible") ? "true" : "false");
        });
        $(this).find(".alfa-caret").toggleClass("rotated");
      });
      $("#stocks-toggle").on("click", function() {
        $("#stocks-content").slideToggle(150, function() {
          localStorage.setItem("alfa_stocks_expanded", $("#stocks-content").is(":visible") ? "true" : "false");
        });
        $(this).find(".alfa-caret").toggleClass("rotated");
      });
      $(".swing-tab").on("click", function() {
        const tab = $(this).data("tab");
        $(".swing-tab").removeClass("active");
        $(this).addClass("active");
        $(".swing-tab-content").hide();
        $(`#swing-tab-${tab}`).show();
        if (tab === "journal") bindSwingJournalActions();
      });
      $("#swing-add-position").on("click", openAddPositionModal);
      $("#swing-refresh-signals").on("click", async function() {
        const btn = $(this);
        const positions = swingTradeData.activePositions;
        if (positions.length === 0) return;
        btn.prop("disabled", true).text("Updating...");
        try {
          updateAllPositionPrices();
          await refreshPositionSignals();
          $("#swing-positions-list").html(renderSwingPositions());
          bindSwingPositionActions();
        } catch (e) {
          console.error("Refresh signals error:", e);
        }
        btn.prop("disabled", false).text("Refresh signals");
      });
      $("#swing-scan-signals").on("click", async function() {
        const btn = $(this);
        btn.prop("disabled", true).text("Scanning...");
        try {
          const { all } = await getTopSwingSignals(10);
          $("#swing-signals-list").html(renderSwingSignals(all));
          $("#swing-positions-list").html(renderSwingPositions());
          bindSwingSignalActions();
          bindSwingPositionActions();
        } catch (e) {
          console.error("Signal scan error:", e);
          $("#swing-signals-list").html(`<div class="swing-error">Error scanning: ${e.message}</div>`);
        }
        btn.prop("disabled", false).text("\u{1F50D} Scan All Stocks");
      });
      bindSwingPositionActions();
      $("#vault-spread-keep").on("change", function() {
        vaultConfig.keepAmount = parseTornNumber($(this).val()) || 0;
        saveVaultConfig();
      });
      $("#alfa-lock-toggle").on("change", function() {
        localStorage.setItem("alfa_vault_lock", $(this).is(":checked"));
        updateVaultDisplay();
      });
      $("#vault-skip-overvalued").on("change", function() {
        vaultConfig.skipOvervalued = $(this).is(":checked");
        saveVaultConfig();
      });
      $(".vault-quick-buy").on("click", function(e) {
        e.stopPropagation();
        const sym = $(this).data("sym");
        vaultQuickBuy(sym);
      });
      $(".vault-quick-sell").on("click", function(e) {
        e.stopPropagation();
        const sym = $(this).data("sym");
        vaultQuickSell(sym);
      });
      $(".vault-toggle-lock").on("click", function(e) {
        e.stopPropagation();
        const sym = $(this).data("sym");
        toggleStockLock(sym);
      });
      $(".vault-block-icon").on("click", function(e) {
        e.stopPropagation();
        const sym = $(this).data("sym");
        openQuickBlockModal(sym);
      });
      loadDailyIncomeDisplay();
    }
    function openQuickBlockModal(sym) {
      const blockStatus = getBlockStatus(sym);
      if (!blockStatus) {
        alert("Unable to get block status for " + sym);
        return;
      }
      const stockData = STOCK_DATA[sym];
      const tierType = stockData.type === "P" ? "Passive" : "Active";
      const currentTierDisplay = blockStatus.currentTier > 0 ? blockStatus.isPassive ? "Passive Block" : `Tier ${blockStatus.currentTier}` : "No Block";
      const nextTierDisplay = blockStatus.isPassive ? "Passive Block" : `Tier ${blockStatus.currentTier + 1}`;
      const progressWidth = Math.min(100, blockStatus.progress);
      const progressClass = blockStatus.isClose ? "close" : "";
      const breakdown = calculateVaultBreakdown();
      let totalLooseValue = 0;
      const looseStocks = [];
      for (const stock of breakdown) {
        if (stock.symbol !== sym && stock.looseShares > 0) {
          totalLooseValue += stock.looseValue;
          looseStocks.push({
            symbol: stock.symbol,
            shares: stock.looseShares,
            value: stock.looseValue,
            price: stock.price
          });
        }
      }
      const currentCash = getMoneyFast();
      const combinedFunds = currentCash + totalLooseValue;
      let affordStatus = "";
      let buyBtnDisabled = "";
      let rebalanceBtnDisabled = "";
      let canRebalance = false;
      if (blockStatus.isMaxed) {
        affordStatus = '<span style="color:#8bc34a;">\u2713 Maximum tier reached</span>';
        buyBtnDisabled = "disabled";
        rebalanceBtnDisabled = "disabled";
      } else if (blockStatus.canAfford) {
        affordStatus = '<span style="color:#8bc34a;">\u2713 You can afford this!</span>';
        rebalanceBtnDisabled = "disabled";
      } else {
        const missing = blockStatus.costToComplete - currentCash;
        if (combinedFunds >= blockStatus.costToComplete) {
          canRebalance = true;
          affordStatus = `<span style="color:#ffd54f;">Need ${formatMoney(missing)} more - Rebalance available!</span>`;
          buyBtnDisabled = "disabled";
        } else {
          affordStatus = `<span style="color:#ef5350;">Missing ${formatMoney(missing)} (${formatMoney(blockStatus.costToComplete - combinedFunds)} after rebalance)</span>`;
          buyBtnDisabled = "disabled";
          rebalanceBtnDisabled = "disabled";
        }
      }
      let rebalanceInfo = "";
      if (!blockStatus.isMaxed && totalLooseValue > 0) {
        rebalanceInfo = `
        <div class="quick-block-rebalance-info">
            <div class="qb-rebalance-header">
                <span>\u{1F504} Rebalance Option</span>
                <span class="qb-rebalance-total">${formatMoney(totalLooseValue)} available</span>
            </div>
            <div class="qb-rebalance-detail">
                Sell loose shares from ${looseStocks.length} stock${looseStocks.length > 1 ? "s" : ""} to fund this block
            </div>
            <div class="qb-rebalance-funds">
                <span>Cash: ${formatMoney(currentCash)}</span>
                <span>+</span>
                <span>Loose: ${formatMoney(totalLooseValue)}</span>
                <span>=</span>
                <span style="color:${combinedFunds >= blockStatus.costToComplete ? "#8bc34a" : "#ef5350"};">${formatMoney(combinedFunds)}</span>
            </div>
        </div>`;
      }
      const html = `
    <div class="quick-block-container">
        <div class="quick-block-header">
            <span class="quick-block-symbol">${sym}</span>
            <span class="quick-block-type">${tierType}</span>
        </div>
        
        <div class="quick-block-status">
            <div class="quick-block-current">
                <span class="quick-block-label">Current</span>
                <span class="quick-block-value">${currentTierDisplay}</span>
            </div>
            <span class="quick-block-arrow">\u2192</span>
            <div class="quick-block-next">
                <span class="quick-block-label">Next</span>
                <span class="quick-block-value ${blockStatus.isMaxed ? "maxed" : ""}">${blockStatus.isMaxed ? "Maxed" : nextTierDisplay}</span>
            </div>
        </div>
        
        ${!blockStatus.isMaxed ? `
        <div class="quick-block-progress-section">
            <div class="quick-block-progress-header">
                <span>Progress to ${nextTierDisplay}</span>
                <span>${blockStatus.progress.toFixed(1)}%</span>
            </div>
            <div class="quick-block-progress-bar">
                <div class="quick-block-progress-fill ${progressClass}" style="width:${progressWidth}%;"></div>
            </div>
            <div class="quick-block-shares">
                ${blockStatus.sharesOwned.toLocaleString()} / ${blockStatus.sharesForNextTier.toLocaleString()} shares
            </div>
        </div>
        
        <div class="quick-block-details">
            <div class="quick-block-detail-row">
                <span>Shares Needed</span>
                <span>${blockStatus.sharesNeeded.toLocaleString()}</span>
            </div>
            <div class="quick-block-detail-row">
                <span>Current Price</span>
                <span>${formatMoney(blockStatus.price)}</span>
            </div>
            <div class="quick-block-detail-row highlight">
                <span>Cost to Complete</span>
                <span>${formatMoney(blockStatus.costToComplete)}</span>
            </div>
            <div class="quick-block-detail-row">
                <span>Tier ROI</span>
                <span style="color:#caa14a;">${blockStatus.roi.toFixed(2)}% APR</span>
            </div>
            ${blockStatus.dailyYield > 0 ? `
            <div class="quick-block-detail-row">
                <span>Daily Income</span>
                <span style="color:#8bc34a;">${formatMoney(Math.floor(blockStatus.dailyYield))}/day</span>
            </div>
            ` : ""}
        </div>
        
        ${rebalanceInfo}
        
        <div class="quick-block-afford">
            ${affordStatus}
        </div>
        ` : ""}
        
        <div class="quick-block-actions">
            ${!blockStatus.isMaxed ? `
            <button id="quick-block-buy" class="alfa-main-btn qb-btn-buy" ${buyBtnDisabled} data-sym="${sym}" data-shares="${blockStatus.sharesNeeded}">
                \u{1F4B5} Buy with Cash
            </button>
            <button id="quick-block-rebalance" class="alfa-main-btn qb-btn-rebalance" ${rebalanceBtnDisabled} data-sym="${sym}" data-shares="${blockStatus.sharesNeeded}" data-cost="${blockStatus.costToComplete}">
                \u{1F504} Rebalance
            </button>
            ` : ""}
            <button id="quick-block-close" class="alfa-main-btn qb-btn-close">Close</button>
        </div>
    </div>`;
      createModal(`Complete Block: ${sym}`, html);
      $("#quick-block-chart-btn").on("click", function() {
        const expandEl = document.getElementById("quick-block-chart-expand");
        const container = document.getElementById("quick-block-chart-container");
        const btn = this;
        if (!expandEl || !container) return;
        if (expandEl.style.display === "none") {
          expandEl.style.display = "block";
          btn.textContent = "Hide Chart";
          container.innerHTML = "";
          const interval = document.getElementById("quick-block-chart-interval")?.value || "d1";
          renderQuickBlockChart(sym, container, interval);
        } else {
          expandEl.style.display = "none";
          btn.textContent = "Chart";
        }
      });
      $("#quick-block-chart-interval").on("change", function() {
        const container = document.getElementById("quick-block-chart-container");
        const expandEl = document.getElementById("quick-block-chart-expand");
        if (container && expandEl && expandEl.style.display !== "none") {
          const interval = $(this).val();
          container.innerHTML = "";
          renderQuickBlockChart(sym, container, interval);
        }
      });
      $("#alfa-modal-close").off("click").on("click", function() {
        $("#alfa-modal-overlay").remove();
      });
      $("#alfa-modal-overlay").off("click").on("click", function(e) {
        if (e.target.id === "alfa-modal-overlay") {
          $("#alfa-modal-overlay").remove();
        }
      });
      $("#quick-block-buy").on("click", async function() {
        const sym2 = $(this).data("sym");
        const shares = parseInt($(this).data("shares"));
        const $btn = $(this);
        $btn.prop("disabled", true).text("Buying...");
        $("#quick-block-rebalance").prop("disabled", true);
        try {
          await postTradeAsync(sym2, shares, "buyShares");
          $btn.text("Success!").css("background", "#8bc34a").css("color", "#111");
          setTimeout(() => {
            $("#alfa-modal-overlay").remove();
            updateVaultDisplay();
          }, 1e3);
        } catch (e) {
          $btn.text("Error!").css("color", "#ef5350");
          console.error("Quick block buy error:", e);
        }
      });
      $("#quick-block-rebalance").on("click", function() {
        const targetSym = $(this).data("sym");
        const sharesNeeded = parseInt($(this).data("shares"));
        const totalCost = parseFloat($(this).data("cost"));
        $("#alfa-modal-overlay").remove();
        const currentCash2 = getMoneyFast();
        let amountNeeded = totalCost - currentCash2;
        if (amountNeeded <= 0) {
          alert("You already have enough cash! Use 'Buy with Cash' instead.");
          return;
        }
        const sellFeeMultiplier = 1.001;
        const safetyBuffer = 1.01;
        const adjustedAmountNeeded = amountNeeded * sellFeeMultiplier * safetyBuffer;
        const breakdown2 = calculateVaultBreakdown();
        const sellOrders = [];
        let remainingToSell = adjustedAmountNeeded;
        for (const stock of breakdown2) {
          if (remainingToSell <= 0) break;
          if (stock.symbol === targetSym || stock.looseShares <= 0) continue;
          const maxSellValue = Math.min(stock.looseValue, remainingToSell);
          const sharesToSell = Math.ceil(maxSellValue / stock.price);
          const actualSell = Math.min(sharesToSell, stock.looseShares);
          if (actualSell > 0) {
            const grossValue = actualSell * stock.price;
            sellOrders.push({
              symbol: stock.symbol,
              shares: actualSell,
              value: grossValue
            });
            remainingToSell -= grossValue;
          }
        }
        if (sellOrders.length === 0) {
          alert("No loose shares available to sell for rebalancing.");
          return;
        }
        const tradeStates = {
          sells: sellOrders.map(() => "pending"),
          buy: "pending"
        };
        let completedCount = 0;
        const totalTrades = sellOrders.length + 1;
        const tradeQueue = [];
        sellOrders.forEach((order, idx) => {
          tradeQueue.push({ type: "sell", symbol: order.symbol, shares: order.shares, index: idx });
        });
        tradeQueue.push({ type: "buy", symbol: targetSym, shares: sharesNeeded, index: -1 });
        let currentTradeIndex = 0;
        function updateProgress() {
          const sellsCompleted = tradeStates.sells.filter((s) => s === "completed").length;
          const buyCompleted = tradeStates.buy === "completed" ? 1 : 0;
          completedCount = sellsCompleted + buyCompleted;
          const progressText = `Progress: ${completedCount}/${totalTrades} trades completed`;
          $("#qb-rebal-progress").text(progressText);
        }
        function updateRowState(index, type, state) {
          if (type === "sell") {
            tradeStates.sells[index] = state;
            const $row = $(`.rebal-row[data-qb-sell-index="${index}"]`);
            if (state === "pending") {
              $row.removeClass("rebal-row-executing rebal-row-completed rebal-row-failed");
            } else if (state === "executing") {
              $row.addClass("rebal-row-executing");
            } else if (state === "completed") {
              $row.removeClass("rebal-row-executing").addClass("rebal-row-completed");
            } else if (state === "failed") {
              $row.removeClass("rebal-row-executing").addClass("rebal-row-failed");
            }
          } else if (type === "buy") {
            tradeStates.buy = state;
            const $row = $(".rebal-section:has(.rebal-section-header:contains('Buy Order')) .rebal-row");
            if (state === "pending") {
              $row.removeClass("rebal-row-executing rebal-row-completed rebal-row-failed");
            } else if (state === "executing") {
              $row.addClass("rebal-row-executing");
            } else if (state === "completed") {
              $row.removeClass("rebal-row-executing").addClass("rebal-row-completed");
            } else if (state === "failed") {
              $row.removeClass("rebal-row-executing").addClass("rebal-row-failed");
            }
          }
          updateProgress();
        }
        const sellsHtml = `
            <div class="rebal-section">
                <div class="rebal-section-header" style="color:#ef5350;">\u{1F4C9} Sell Orders (${sellOrders.length}) - Freeing up funds</div>
                <div class="rebal-table">
                    ${sellOrders.map((order, idx) => {
          return `<div class="rebal-row" data-qb-sell-index="${idx}">
                            <span class="rebal-sym">${order.symbol}</span>
                            <span class="rebal-signal" style="color:#ef5350;">SELL</span>
                            <span class="rebal-reason"></span>
                            <span class="rebal-shares">-${order.shares.toLocaleString()}</span>
                            <span class="rebal-value" style="color:#ef5350;">$${formatCompactNumber(order.value)}</span>
                        </div>`;
        }).join("")}
                </div>
            </div>`;
        const html2 = `
        <div class="rebal-container">
            <div class="rebal-summary">
                <div class="rebal-summary-item">
                    <span class="rebal-summary-label">Target</span>
                    <span class="rebal-summary-value">${targetSym}</span>
                </div>
                <div class="rebal-summary-item">
                    <span class="rebal-summary-label">Shares Needed</span>
                    <span class="rebal-summary-value">${sharesNeeded.toLocaleString()}</span>
                </div>
                <div class="rebal-summary-item">
                    <span class="rebal-summary-label">Total Cost</span>
                    <span class="rebal-summary-value" style="color:#caa14a;">$${formatCompactNumber(totalCost)}</span>
                </div>
            </div>
        ${sellsHtml}
            <div class="rebal-section">
                <div class="rebal-section-header" style="color:#66bb6a;">\u{1F4C8} Buy Order</div>
                <div class="rebal-table">
                    <div class="rebal-row">
                        <span class="rebal-sym">${targetSym}</span>
                        <span class="rebal-signal" style="color:#66bb6a;">BUY</span>
                        <span class="rebal-reason"></span>
                        <span class="rebal-shares">+${sharesNeeded.toLocaleString()}</span>
                        <span class="rebal-value" style="color:#66bb6a;">$${formatCompactNumber(totalCost)}</span>
                    </div>
                </div>
            </div>
            <div class="rebal-warning">
                \u26A0\uFE0F Click the button to execute trades sequentially. Market prices may vary slightly.
            </div>
            <div id="qb-rebal-progress" style="text-align:center; padding:10px; color:#ffd54f; font-weight:bold;">Progress: 0/${totalTrades} trades completed</div>
            <div class="rebal-actions">
                <button id="qb-rebal-cycle-btn" class="alfa-main-btn" style="margin-right:10px;">${tradeQueue.length > 0 ? (tradeQueue[0].type === "sell" ? "Selling" : "Buying") + " " + tradeQueue[0].symbol + " (1/" + tradeQueue.length + ")" : "No trades"}</button>
                <button id="qb-rebal-cancel" class="alfa-main-btn" style="border-color:#888; color:#888;">Close</button>
            </div>
        </div>`;
        createModal(`Rebalance to Buy ${targetSym}`, html2);
        $("#qb-rebal-cancel").on("click", function() {
          $("#alfa-modal-overlay").remove();
        });
        $("#qb-rebal-cycle-btn").on("click", async function() {
          if (currentTradeIndex >= tradeQueue.length) return;
          const trade = tradeQueue[currentTradeIndex];
          const $btn = $(this);
          $btn.prop("disabled", true).text("Executing...");
          updateRowState(trade.index, trade.type, "executing");
          try {
            await postTradeAsync(
              trade.symbol,
              trade.shares,
              trade.type === "sell" ? "sellShares" : "buyShares"
            );
            updateRowState(trade.index, trade.type, "completed");
            updateVaultDisplay();
            currentTradeIndex++;
            if (currentTradeIndex >= tradeQueue.length) {
              $btn.prop("disabled", true).text("Completed!").css("background", "#8bc34a").css("color", "#111");
              setTimeout(() => {
                $("#alfa-modal-overlay").remove();
              }, 1500);
            } else {
              const nextTrade = tradeQueue[currentTradeIndex];
              $btn.prop("disabled", false).text(`${nextTrade.type === "sell" ? "Selling" : "Buying"} ${nextTrade.symbol} (${currentTradeIndex + 1}/${tradeQueue.length})`);
            }
          } catch (e) {
            console.error(`Trade failed for ${trade.symbol}:`, e);
            updateRowState(trade.index, trade.type, "failed");
            $btn.prop("disabled", false).text(`${trade.type === "sell" ? "Selling" : "Buying"} ${trade.symbol} (${currentTradeIndex + 1}/${tradeQueue.length}) - Retry`);
          }
        });
      });
      $("#quick-block-close").on("click", function() {
        $("#alfa-modal-overlay").remove();
      });
    }
    async function ensureItemPrices(force = false) {
      const key = localStorage.getItem("alfa_vault_apikey");
      if (!key) return;
      const last = Number(localStorage.getItem("alfa_advisor_prices_ts") || 0);
      if (!force && Date.now() - last < 6 * 60 * 60 * 1e3 && Object.keys(itemPrices).length > 3) {
        return;
      }
      const idSet = /* @__PURE__ */ new Set();
      for (const b of Object.values(ADVISOR_DATA)) {
        if (b.type === "item" && b.id) idSet.add(b.id);
        if (b.type === "average" && Array.isArray(b.ids)) b.ids.forEach((id) => idSet.add(id));
      }
      if (idSet.size === 0) return;
      try {
        const data = await tornApiFetch(`https://api.torn.com/v2/torn/items?ids=${[...idSet].join(",")}&key=${key}`);
        const items = data.items || data.item || data;
        const list = Array.isArray(items) ? items : Object.values(items || {});
        let updated = 0;
        for (const item of list) {
          if (!item || item.id == null) continue;
          const value = item.averageprice || item.market_value || item.value || item.sell_price || 0;
          if (value > 0) {
            itemPrices[item.id] = value;
            updated++;
          }
        }
        if (updated > 0) {
          localStorage.setItem("alfa_advisor_prices", JSON.stringify(itemPrices));
          localStorage.setItem("alfa_advisor_prices_ts", String(Date.now()));
        }
      } catch (e) {
        console.error("Item price fetch error:", e);
      }
    }
    async function loadDailyIncomeDisplay() {
      if ($("#vault-daily-income").length === 0) return;
      const savedKey = localStorage.getItem("alfa_vault_apikey");
      if (!savedKey) {
        $("#vault-daily-income").text("--");
        $("#vault-bank-info").text("\u{1F3E6} Set API key in Settings");
        return;
      }
      try {
        await ensureItemPrices(false);
        const incomeData = await calculateDailyIncome();
        $("#vault-daily-income").text(incomeData.totalIncome == null ? formatMoney(Math.floor(incomeData.stockIncome)) + "/day stocks · bank income unknown" : formatMoney(Math.floor(incomeData.totalIncome)) + "/day");
        if (incomeData.bankPrincipal > 0) {
          $("#vault-bank-info").html(
            `\u{1F3E6} ${formatCompactNumber(incomeData.bankPrincipal)} bank balance · ${incomeData.bankRate == null ? "locked rate unavailable" : incomeData.bankRate.toFixed(2) + "% locked rate"}`
          );
        } else {
          $("#vault-bank-info").text("\u{1F3E6} No bank investment");
        }
      } catch (e) {
        console.error("Income calculation error:", e);
        $("#vault-daily-income").text("Error");
        $("#vault-bank-info").text("");
      }
    }
    let vaultDisplayTimer = null;
    function updateVaultDisplay(immediate = false) {
      const run = () => {
        vaultDisplayTimer = null;
        renderVaultSection();
      };
      if (immediate) {
        if (vaultDisplayTimer) {
          clearTimeout(vaultDisplayTimer);
          vaultDisplayTimer = null;
        }
        run();
        return;
      }
      if (vaultDisplayTimer) clearTimeout(vaultDisplayTimer);
      vaultDisplayTimer = setTimeout(run, 150);
    }
    async function vaultSpread() {
      const status = $("#vault-status");
      if (vaultConfig.stocks.length === 0 && !goalPercent(vaultConfig.blockGoal)) {
        status.html('<span style="color:#ef5350;">No vault stocks configured! Click Settings to set up your vault.</span>');
        setTimeout(() => status.html(""), 3e3);
        return;
      }
      let money = $("#alfa-use-api").is(":checked") ? await syncWallet(false) : getMoneyFast();
      if (money === 0 && !$("#alfa-use-api").is(":checked")) money = await syncWallet(false);
      if (money <= 0) {
        status.html('<span style="color:#ef5350;">No cash available!</span>');
        setTimeout(() => status.html(""), 3e3);
        return;
      }
      const keepText = String($("#vault-spread-keep").val() ?? "").trim();
      const keepAmount = Math.max(0, keepText ? parseTornNumber(keepText) || 0 : vaultConfig.keepAmount || 0);
      let availableCash = money - keepAmount;
      if (availableCash <= 0) {
        status.html('<span style="color:#ef5350;">Not enough cash after keeping amount!</span>');
        setTimeout(() => status.html(""), 3e3);
        return;
      }
      status.html('<span style="color:#ffd54f;">Calculating allocations...</span>');
      if (!isGmXhrAvailable()) {
        warnTornsyUnavailable();
      }
      const review = {checked: 0, notes: []};
      const allocations = await calculateSpreadAllocations(availableCash, vaultConfig.depositStrategy, review);
      if (allocations.length === 0 && !review.notes.length) {
        status.html('<span style="color:#ef5350;">Could not calculate allocations!</span>');
        setTimeout(() => status.html(""), 3e3);
        return;
      }
      status.html("");
      showSpreadModal(allocations, availableCash, keepAmount);
      if (review.checked || review.notes.length) {
        $("<div>").addClass("rebal-warning").text("Smart Mode checked " + review.checked + " tickers. " + review.notes.join(" · ")).insertBefore("#alfa-modal-overlay .rebal-section:first");
      }
    }
    function goalPercent(goal) {
      return Number.isInteger(goal?.percent) && goal.percent >= 0 && goal.percent <= 100 ? goal.percent : 0;
    }
    function spreadGoalOrder(goal, totalCash) {
      const symbol = goal.symbol;
      const target = goalThreshold(symbol, goal);
      const price = getPrice(symbol);
      const unitCents = Math.round(price * 100);
      if (!(target > 0 && unitCents > 0)) return null;
      const owned = Math.max(getOwnedShares(symbol), getOwnedSharesFromDom(symbol));
      const goalCents = Math.floor(Math.round(totalCash * 100) * goalPercent(goal) / 100);
      const shares = Math.min(target - owned, Math.floor(goalCents / unitCents));
      return shares > 0 ? {symbol, shares, price, cost: shares * unitCents / 100, goalTarget: target} : null;
    }
    function freshSpreadAnalysis(analysis) {
      const age = Date.now() - analysis?.timestamp;
      return age >= 0 && age < CACHE_TTL.analysis && analysis.price > 0 &&
        Number.isFinite(analysis.rsi) && Number.isFinite(analysis.dipFrom7d) && !!analysis.signal;
    }
    async function calculateSpreadAllocations(totalCash, strategy, review = {checked: 0, notes: []}) {
      if (vaultConfig.educationProtection) await refreshEducation();
      const savedGoal = vaultConfig.blockGoal;
      const goal = savedGoal?.symbol === "WSU" && vaultConfig.educationProtection && educationVerified() ? null : savedGoal;
      const percent = goalPercent(goal);
      let stocks2 = percent ? [...new Set([...vaultConfig.stocks, goal.symbol])] : vaultConfig.stocks;
      if (vaultConfig.lockedStocks && vaultConfig.lockedStocks.length > 0) {
        stocks2 = stocks2.filter((sym) => !vaultConfig.lockedStocks.includes(sym));
      }
      if (vaultConfig.skipOvervalued || $("#vault-skip-overvalued").is(":checked")) {
        const eligible = [];
        for (const sym of stocks2) {
          review.checked++;
          let analysis = vaultAnalysisCache[sym];
          if (!freshSpreadAnalysis(analysis)) analysis = await analyzeStockForVault(sym);
          let signal = null;
          if (freshSpreadAnalysis(analysis)) {
            signal = strategy === "swing_strategy" ? analyzeSwingOpportunity(analysis)?.signal : analysis.signal;
          }
          const allowed = ["buy","strong_buy","watch","good","hold","neutral"].includes(signal);
          if (allowed) {
            eligible.push(sym);
            continue;
          }
          const reason = ["sell","strong_sell","take_profit"].includes(signal) ? signal.replace("_"," ").toUpperCase() : "signal unavailable";
          review.notes.push(sym + " skipped · " + reason);
        }
        stocks2 = eligible;
        if (percent && !stocks2.includes(goal.symbol) && goalThreshold(goal.symbol, goal) >
            Math.max(getOwnedShares(goal.symbol), getOwnedSharesFromDom(goal.symbol))) {
          const reserve = Math.floor(Math.round(totalCash * 100) * percent / 100);
          totalCash = (Math.round(totalCash * 100) - reserve) / 100;
          review.notes.push(formatWithdrawMoney(reserve / 100) + " kept in cash for " + goal.symbol + " this spread.");
        }
      }
      if (stocks2.length === 0) {
        $("#vault-status").html('<span style="color:#ffb74d;">No eligible stocks! Check locks or run analysis.</span>');
        return [];
      }
      let goalOrder = null;
      if (percent > 0 && stocks2.includes(goal.symbol)) {
        goalOrder = spreadGoalOrder(goal, totalCash);
        stocks2 = stocks2.filter(symbol => symbol !== goal.symbol);
        if (goalOrder) totalCash = (Math.round(totalCash * 100) - Math.round(goalOrder.cost * 100)) / 100;
      }
      if (!stocks2.length || totalCash <= 0) return goalOrder ? [goalOrder] : [];
      if (strategy === "cash_flow") {
        const buys = cashFlowAllocation(totalCash, stocks2);
        return goalOrder ? [goalOrder, ...buys] : buys;
      }
      let allocations = [];
      switch (strategy) {
        case "swing_strategy":
          allocations = await swingStrategyAllocation(totalCash, stocks2);
          break;
        case "dip_weighted":
          allocations = await dipWeightedAllocation(totalCash, stocks2);
          break;
        case "rsi_weighted":
          allocations = await rsiWeightedAllocation(totalCash, stocks2);
          break;
        case "roi_priority":
          allocations = await roiPriorityAllocation(totalCash, stocks2);
          break;
        case "equal":
        default:
          allocations = await equalSplitAllocation(totalCash, stocks2);
          break;
      }
      allocations = adjustForBenefitTiers(allocations, totalCash);
      if (goalOrder) allocations.unshift(goalOrder);
      return allocations.filter((a) => a.shares > 0);
    }
    function cashFlowAllocation(totalCash, stocks) {
      const eligible = new Set(stocks);
      const rows = calculateVaultBreakdown()
        .filter(row => eligible.has(row.symbol) && row.price > 0 && Number.isFinite(row.price))
        .map(row => {
          const cents = Math.round(row.price * 100);
          return {symbol: row.symbol, cents, value: row.looseShares * cents, shares: 0};
        })
        .filter(row => row.cents > 0)
        .sort((a, b) => a.value - b.value || a.symbol.localeCompare(b.symbol));
      if (!rows.length) return [];

      // Raise the lowest holdings together until the next holding joins them.
      const budget = Math.round(totalCash * 100);
      let remaining = budget;
      let level = rows[0].value;
      for (let i = 1; i < rows.length; i++) {
        const cost = (rows[i].value - level) * i;
        if (cost > remaining) {
          level += remaining / i;
          remaining = 0;
          break;
        }
        remaining -= cost;
        level = rows[i].value;
      }
      level += remaining / rows.length;

      let change = budget;
      for (const row of rows) {
        row.shares = Math.floor(Math.max(0, level - row.value) / row.cents);
        change -= row.shares * row.cents;
        row.shortfall = level - row.value - row.shares * row.cents;
      }
      // Spend rounding change only if another whole share brings the holding closer.
      rows.sort((a, b) => b.shortfall - a.shortfall || a.symbol.localeCompare(b.symbol));
      for (const row of rows) {
        if (row.cents <= change && row.shortfall > row.cents / 2) {
          row.shares++;
          change -= row.cents;
        }
      }
      return rows.filter(row => row.shares > 0).map(row => ({
        symbol: row.symbol, shares: row.shares, price: row.cents / 100, cost: row.shares * row.cents / 100
      }));
    }
    async function swingStrategyAllocation(totalCash, stocks2) {
      const allocations = [];
      let weights = {};
      let totalWeight = 0;
      for (const sym of stocks2) {
        let analysis = vaultAnalysisCache[sym];
        if (!analysis) {
          analysis = await analyzeStockForVault(sym);
        }
        const opportunity = analysis ? analyzeSwingOpportunity(analysis) : null;
        let weight = 1;
        if (opportunity) {
          weight = Math.max(0.5, 1 + opportunity.score / 100);
        }
        weights[sym] = weight;
        totalWeight += weight;
      }
      for (const sym of stocks2) {
        const price = getPrice(sym);
        if (price <= 0 || totalWeight <= 0) continue;
        const allocation = weights[sym] / totalWeight * totalCash;
        const shares = Math.floor(allocation / price);
        if (shares > 0) {
          allocations.push({
            symbol: sym,
            shares,
            cost: shares * price,
            price,
            weight: weights[sym]
          });
        }
      }
      return redistributeRemainder(allocations, totalCash, weights, totalWeight);
    }
    async function equalSplitAllocation(totalCash, stocks2) {
      const allocations = [];
      let weights = {};
      let totalWeight = 0;
      for (const sym of stocks2) {
        let weight = 1;
        let analysis = vaultAnalysisCache[sym];
        if (!analysis) analysis = await analyzeStockForVault(sym);
        if (analysis) {
          const signal = analysis.signal;
          if (signal === "buy") weight *= 1.3;
          else if (signal === "good") weight *= 1.15;
          const volMult = analysis.volumeMultiplier ?? 1;
          const volMin = swingTradeData?.settings?.volumeMinMultiplier ?? 1;
          const volPartial = swingTradeData?.settings?.volumePartialMultiplier ?? 0.8;
          const volFactor = volMult >= volMin ? 1 : volMult >= volPartial ? 0.5 : 0;
          weight = weight * volFactor + (1 - volFactor);
        }
        weights[sym] = weight;
        totalWeight += weight;
      }
      for (const sym of stocks2) {
        const price = getPrice(sym);
        if (price <= 0 || totalWeight <= 0) continue;
        const allocation = weights[sym] / totalWeight * totalCash;
        const shares = Math.floor(allocation / price);
        if (shares > 0) {
          allocations.push({
            symbol: sym,
            shares,
            cost: shares * price,
            price,
            weight: weights[sym]
          });
        }
      }
      return redistributeRemainder(allocations, totalCash, weights, totalWeight);
    }
    function redistributeRemainder(allocations, totalCash, weights, totalWeight) {
      if (allocations.length === 0) return allocations;
      let totalSpent = allocations.reduce((sum, a) => sum + a.cost, 0);
      let remainder = totalCash - totalSpent;
      const sorted = [...allocations].sort((a, b) => (b.weight || 1) - (a.weight || 1));
      let iterations = 0;
      const maxIterations = allocations.length * 3;
      while (remainder > 0 && iterations < maxIterations) {
        let addedAny = false;
        for (const alloc of sorted) {
          if (alloc.price <= remainder) {
            alloc.shares += 1;
            alloc.cost = alloc.shares * alloc.price;
            remainder -= alloc.price;
            addedAny = true;
            if (remainder <= 0) break;
          }
        }
        if (!addedAny) break;
        iterations++;
      }
      return allocations;
    }
    async function dipWeightedAllocation(totalCash, stocks2) {
      const allocations = [];
      let weights = {};
      let totalWeight = 0;
      for (const sym of stocks2) {
        let analysis = vaultAnalysisCache[sym];
        if (!analysis) {
          analysis = await analyzeStockForVault(sym);
        }
        let weight = 1;
        if (analysis && analysis.dipFrom7d < 0) {
          weight = Math.abs(analysis.dipFrom7d) + 1;
        } else if (analysis && analysis.dipFrom7d > 3) {
          weight = 0.5;
        }
        if (analysis) {
          const volMult = analysis.volumeMultiplier ?? 1;
          const volMin = swingTradeData?.settings?.volumeMinMultiplier ?? 1;
          const volPartial = swingTradeData?.settings?.volumePartialMultiplier ?? 0.8;
          const volFactor = volMult >= volMin ? 1 : volMult >= volPartial ? 0.5 : 0;
          weight = weight * volFactor + (1 - volFactor);
        }
        if (analysis) {
          const signal = analysis.signal;
          if (signal === "buy") weight *= 1.3;
          else if (signal === "good") weight *= 1.15;
        }
        weights[sym] = weight;
        totalWeight += weight;
      }
      for (const sym of stocks2) {
        const price = getPrice(sym);
        if (price <= 0 || totalWeight <= 0) continue;
        const allocation = weights[sym] / totalWeight * totalCash;
        const shares = Math.floor(allocation / price);
        if (shares > 0) {
          allocations.push({
            symbol: sym,
            shares,
            cost: shares * price,
            price,
            weight: weights[sym]
          });
        }
      }
      return redistributeRemainder(allocations, totalCash, weights, totalWeight);
    }
    async function rsiWeightedAllocation(totalCash, stocks2) {
      const allocations = [];
      let weights = {};
      let totalWeight = 0;
      for (const sym of stocks2) {
        let analysis = vaultAnalysisCache[sym];
        if (!analysis) {
          analysis = await analyzeStockForVault(sym);
        }
        let weight = 1;
        if (analysis && analysis.rsi) {
          weight = Math.max(0.5, (100 - analysis.rsi) / 30);
          const adx = analysis.adx ?? 25;
          const adxMin = swingTradeData?.settings?.adxMinThreshold ?? 25;
          const adxPartial = swingTradeData?.settings?.adxPartialThreshold ?? 20;
          const rsiAdxFactor = adx >= adxMin ? 1 : adx >= adxPartial ? 0.5 : 0;
          weight = weight * rsiAdxFactor + (1 - rsiAdxFactor);
        }
        if (analysis) {
          const volMult = analysis.volumeMultiplier ?? 1;
          const volMin = swingTradeData?.settings?.volumeMinMultiplier ?? 1;
          const volPartial = swingTradeData?.settings?.volumePartialMultiplier ?? 0.8;
          const volFactor = volMult >= volMin ? 1 : volMult >= volPartial ? 0.5 : 0;
          weight = weight * volFactor + (1 - volFactor);
        }
        if (analysis) {
          const signal = analysis.signal;
          if (signal === "buy") weight *= 1.3;
          else if (signal === "good") weight *= 1.15;
        }
        weights[sym] = weight;
        totalWeight += weight;
      }
      for (const sym of stocks2) {
        const price = getPrice(sym);
        if (price <= 0 || totalWeight <= 0) continue;
        const allocation = weights[sym] / totalWeight * totalCash;
        const shares = Math.floor(allocation / price);
        if (shares > 0) {
          allocations.push({
            symbol: sym,
            shares,
            cost: shares * price,
            price,
            weight: weights[sym]
          });
        }
      }
      return redistributeRemainder(allocations, totalCash, weights, totalWeight);
    }
    async function roiPriorityAllocation(totalCash, stocks2) {
      const allocations = [];
      let weights = {};
      let totalWeight = 0;
      for (const sym of stocks2) {
        const price = getPrice(sym);
        const dailyYield = getDailyYield(sym);
        const stockData = STOCK_DATA[sym];
        if (!stockData || price <= 0) continue;
        const tierCost = stockData.base * price;
        const roi = tierCost > 0 ? dailyYield * 365 / tierCost * 100 : 0;
        let weight = Math.max(0.5, roi / 10);
        if (isGmXhrAvailable()) {
          let analysis = vaultAnalysisCache[sym];
          if (!analysis) analysis = await analyzeStockForVault(sym);
          if (analysis) {
            const volMult = analysis.volumeMultiplier ?? 1;
            const volMin = swingTradeData?.settings?.volumeMinMultiplier ?? 1;
            const volPartial = swingTradeData?.settings?.volumePartialMultiplier ?? 0.8;
            const volFactor = volMult >= volMin ? 1 : volMult >= volPartial ? 0.5 : 0;
            weight = weight * volFactor + (1 - volFactor);
            const signal = analysis.signal;
            if (signal === "buy") weight *= 1.3;
            else if (signal === "good") weight *= 1.15;
          }
        }
        weights[sym] = weight;
        totalWeight += weight;
      }
      for (const sym of stocks2) {
        const price = getPrice(sym);
        if (price <= 0 || totalWeight <= 0) continue;
        const allocation = weights[sym] / totalWeight * totalCash;
        const shares = Math.floor(allocation / price);
        if (shares > 0) {
          allocations.push({
            symbol: sym,
            shares,
            cost: shares * price,
            price,
            weight: weights[sym]
          });
        }
      }
      return redistributeRemainder(allocations, totalCash, weights, totalWeight);
    }
    function adjustForBenefitTiers(allocations, budget) {
      let spareCents = Math.round(budget * 100) - allocations.reduce((sum, order) => sum + Math.round(order.cost * 100), 0);
      return allocations.map((alloc) => {
        const stockData = STOCK_DATA[alloc.symbol];
        if (!stockData) return alloc;
        const currentOwned = getOwnedShares(alloc.symbol);
        const totalAfter = currentOwned + alloc.shares;
        if (stockData.type === "P") {
          const tierTarget = stockData.base;
          if (currentOwned < tierTarget && totalAfter >= tierTarget * 0.9 && totalAfter < tierTarget) {
            const sharesToTier = tierTarget - currentOwned;
            const costToTier = sharesToTier * alloc.price;
            const extraCents = Math.round(costToTier * 100) - Math.round(alloc.cost * 100);
            if (costToTier <= alloc.cost * 1.2 && extraCents <= spareCents) {
              spareCents -= extraCents;
              alloc.shares = sharesToTier;
              alloc.cost = costToTier;
            }
          }
        } else {
          const base = stockData.base;
          const currentTier = getBenefitTier(alloc.symbol, currentOwned);
          const nextTierShares = currentTier.next || base;
          if (totalAfter >= nextTierShares * 0.9 && totalAfter < nextTierShares) {
            const sharesToTier = nextTierShares - currentOwned;
            const costToTier = sharesToTier * alloc.price;
            const extraCents = Math.round(costToTier * 100) - Math.round(alloc.cost * 100);
            if (costToTier <= alloc.cost * 1.2 && extraCents <= spareCents) {
              spareCents -= extraCents;
              alloc.shares = sharesToTier;
              alloc.cost = costToTier;
            }
          }
        }
        return alloc;
      });
    }
    function showSpreadModal(allocations, availableCash, keepAmount) {
      const totalAllocated = allocations.reduce((sum, a) => sum + a.cost, 0);
      const strategyLabel = vaultConfig.depositStrategy.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const tradeStates = allocations.map(() => "pending");
      let completedCount = 0;
      const tradeQueue = allocations.map((alloc, idx) => ({
        type: "buy",
        symbol: alloc.symbol,
        shares: alloc.shares,
        goalTarget: alloc.goalTarget,
        index: idx
      }));
      let currentTradeIndex = 0;
      function updateProgress() {
        completedCount = tradeStates.filter((s) => s === "completed").length;
        const progressText = `Progress: ${completedCount}/${allocations.length} trades completed`;
        $("#spread-progress").text(progressText);
      }
      function updateRowState(index, state) {
        const $row = $(`.rebal-row[data-spread-index="${index}"]`);
        tradeStates[index] = state;
        if (state === "pending") {
          $row.removeClass("rebal-row-executing rebal-row-completed rebal-row-failed");
        } else if (state === "executing") {
          $row.addClass("rebal-row-executing");
        } else if (state === "completed") {
          $row.removeClass("rebal-row-executing").addClass("rebal-row-completed");
        } else if (state === "failed") {
          $row.removeClass("rebal-row-executing").addClass("rebal-row-failed");
        }
        updateProgress();
      }
      const allocationsHtml = `
        <div class="rebal-section">
            <div class="rebal-section-header" style="color:#66bb6a;">\u{1F4C8} Buy Orders (${allocations.length})</div>
            <div class="rebal-table">
                ${allocations.map((alloc, idx) => {
        return `<div class="rebal-row" data-spread-index="${idx}">
                        <span class="rebal-sym">${alloc.symbol}</span>
                        <span class="rebal-signal" style="color:#66bb6a;">BUY</span>
                        ${alloc.goalTarget ? '<span class="rebal-block-goal">Block&nbsp;Goal</span>' : ""}
                        <span class="rebal-shares">+${alloc.shares.toLocaleString()}</span>
                        <span class="rebal-value" style="color:#66bb6a;">$${formatCompactNumber(alloc.cost)}</span>
                    </div>`;
      }).join("")}
            </div>
            <div class="rebal-subtotal" style="color:#66bb6a;">Total: $${formatCompactNumber(totalAllocated)}</div>
        </div>`;
      const html = `
    <div class="rebal-container">
        <div class="rebal-summary">
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Strategy</span>
                <span class="rebal-summary-value">${strategyLabel}</span>
            </div>
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Amount to Spread</span>
                <span class="rebal-summary-value" style="color:#66bb6a;">$${formatCompactNumber(availableCash)}</span>
            </div>
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Keeping</span>
                <span class="rebal-summary-value">$${formatCompactNumber(keepAmount)}</span>
            </div>
        </div>
        ${allocationsHtml}
        <div class="rebal-warning">
            \u26A0\uFE0F Click the button to execute trades sequentially. Market prices may vary slightly.
        </div>
        <div id="spread-progress" style="text-align:center; padding:10px; color:#66bb6a; font-weight:bold;">Progress: 0/${allocations.length} trades completed</div>
        <div class="rebal-actions">
            <button id="spread-cycle-btn" ${tradeQueue.length ? "" : "disabled"} class="alfa-main-btn" style="margin-right:10px;">${tradeQueue.length > 0 ? `Buying ${tradeQueue[0].symbol} (1/${tradeQueue.length})` : "No trades"}</button>
            <button id="spread-cancel" class="alfa-main-btn" style="border-color:#888; color:#888;">Close</button>
        </div>
    </div>`;
      createModal("Vault Spread", html);
      $("#spread-cancel").on("click", function() {
        $("#alfa-modal-overlay").remove();
      });
      $("#spread-cycle-btn").on("click", async function() {
        if (currentTradeIndex >= tradeQueue.length) return;
        const trade = tradeQueue[currentTradeIndex];
        const $btn = $(this);
        $btn.prop("disabled", true).text("Executing...");
        updateRowState(trade.index, "executing");
        try {
          if (trade.goalTarget) {
            const owned = Math.max(getOwnedShares(trade.symbol), getOwnedSharesFromDom(trade.symbol));
            if (owned + trade.shares > trade.goalTarget) throw new Error("Holdings changed. Close and recalculate Vault Spread.");
          }
          await postTradeAsync(trade.symbol, trade.shares, "buyShares");
          updateRowState(trade.index, "completed");
          updateVaultDisplay();
          currentTradeIndex++;
          if (currentTradeIndex >= tradeQueue.length) {
            $btn.prop("disabled", true).text("Completed!").css("background", "#8bc34a").css("color", "#111");
          } else {
            const nextTrade = tradeQueue[currentTradeIndex];
            $btn.prop("disabled", false).text(`Buying ${nextTrade.symbol} (${currentTradeIndex + 1}/${tradeQueue.length})`);
          }
        } catch (e) {
          console.error(`Buy failed for ${trade.symbol}:`, e);
          updateRowState(trade.index, "failed");
          $("#spread-progress").text(e.message || "Buy failed.");
          $btn.prop("disabled", false).text(`Buying ${trade.symbol} (${currentTradeIndex + 1}/${tradeQueue.length}) - Retry`);
        }
      });
    }
    async function executeSpreadTrades(allocations) {
      const status = $("#vault-status");
      let successCount = 0;
      let failCount = 0;
      for (let i = 0; i < allocations.length; i++) {
        const alloc = allocations[i];
        status.html(`<span style="color:#ffd54f;">Buying ${alloc.symbol}... (${i + 1}/${allocations.length})</span>`);
        try {
          await new Promise((resolve, reject) => {
            $.post(
              `https://www.torn.com/page.php?sid=StockMarket&step=buyShares&rfcv=${getRFC()}`,
              { stockId: stockId[alloc.symbol], amount: alloc.shares }
            ).done(function(r) {
              try {
                if (typeof r === "string") r = JSON.parse(r);
                if (r.success) {
                  updateLocalCache(alloc.symbol, alloc.shares);
                  successCount++;
                  resolve();
                } else {
                  failCount++;
                  console.error(`Trade failed for ${alloc.symbol}:`, r.text);
                  resolve();
                }
              } catch (e) {
                successCount++;
                resolve();
              }
            }).fail(function() {
              failCount++;
              resolve();
            });
          });
          if (i < allocations.length - 1) {
            await new Promise((r) => setTimeout(r, 300));
          }
        } catch (e) {
          failCount++;
          console.error(`Error trading ${alloc.symbol}:`, e);
        }
      }
      updateVaultDisplay();
      if (failCount === 0) {
        status.html(`<span style="color:#8bc34a;">Vault spread complete! ${successCount} trades executed.</span>`);
      } else {
        status.html(`<span style="color:#ffb74d;">Completed with ${failCount} failed trades. ${successCount} succeeded.</span>`);
      }
      setTimeout(() => status.html(""), 5e3);
    }
    async function vaultAnalyze() {
      const status = $("#vault-status");
      if (vaultConfig.stocks.length === 0) {
        status.html('<span style="color:#ef5350;">No vault stocks configured!</span>');
        setTimeout(() => status.html(""), 3e3);
        return;
      }
      status.html('<span style="color:#ffd54f;">Analyzing stocks...</span>');
      await analyzeAllVaultStocks((msg) => status.html(`<span style="color:#ffd54f;">${msg}</span>`));
      renderVaultSection();
      $("#vault-status").html('<span style="color:#8bc34a;">Analysis complete! Signals updated.</span>');
      setTimeout(() => $("#vault-status").html(""), 3e3);
    }
    async function vaultRebalance() {
      if (vaultConfig.educationProtection) await refreshEducation();
      const status = $("#vault-status");
      if (vaultConfig.stocks.length === 0) {
        alert("No vault stocks configured! Click Config to set up your vault.");
        return;
      }
      if (Object.keys(vaultAnalysisCache).length === 0) {
        if (isGmXhrAvailable()) {
          status.html('<span style="color:#ffd54f;">Running analysis first...</span>');
          await analyzeAllVaultStocks((msg) => status.html(`<span style="color:#ffd54f;">${msg}</span>`));
        } else {
          warnTornsyUnavailable();
        }
      }
      status.html('<span style="color:#ffd54f;">Calculating rebalance plan...</span>');
      const breakdown = calculateVaultBreakdown();
      let eligibleStocks = vaultConfig.stocks.filter(
        (sym) => !vaultConfig.lockedStocks || !vaultConfig.lockedStocks.includes(sym)
      );
      if (eligibleStocks.length === 0) {
        status.html('<span style="color:#ef5350;">All stocks are locked!</span>');
        return;
      }
      const totalVaultValue = breakdown.filter((s) => eligibleStocks.includes(s.symbol)).reduce((sum, s) => sum + s.owned * s.price, 0);
      if (totalVaultValue <= 0) {
        status.html('<span style="color:#ef5350;">No vault holdings to rebalance!</span>');
        return;
      }
      const rebalancePlan = await calculateSmartRebalancePlan(breakdown, eligibleStocks, totalVaultValue);
      if (rebalancePlan.sells.length === 0 && rebalancePlan.buys.length === 0) {
        status.html('<span style="color:#8bc34a;">Portfolio is already balanced!</span>');
        setTimeout(() => status.html(""), 3e3);
        return;
      }
      showRebalanceModal(rebalancePlan, breakdown, null);
    }
    function plannerSignal(analysis, strategy) {
      return strategy === "swing_strategy" ? analyzeSwingOpportunity(analysis)?.signal || "neutral" : analysis?.signal || "hold";
    }
    async function calculateSmartRebalancePlan(currentBreakdown, eligibleStocks, totalVaultValue) {
      const sells = [];
      const buys = [];
      const strategy = vaultConfig.depositStrategy;
      const smartMode = vaultConfig.skipOvervalued || $("#vault-skip-overvalued").is(":checked");
      const overvaluedSignals = ["strong_sell", "sell", "take_profit"];
      
      const currentMap = {};
      for (const stock of currentBreakdown) {
        if (eligibleStocks.includes(stock.symbol)) {
          currentMap[stock.symbol] = stock;
        }
      }
      const idealAllocations = await calculateIdealRebalanceAllocations(totalVaultValue, eligibleStocks, smartMode);
      const idealMap = {};
      for (const alloc of idealAllocations) {
        idealMap[alloc.symbol] = alloc;
      }
      let totalSellValue = 0;
      let totalBuyValue = 0;
      for (const sym of eligibleStocks) {
        const current = currentMap[sym];
        const ideal = idealMap[sym];
        const currentValue = current ? current.owned * current.price : 0;
        const currentShares = current ? current.owned : 0;
        const idealValue = ideal ? ideal.cost : 0;
        const idealShares = ideal ? ideal.shares : 0;
        const price = current ? current.price : ideal ? ideal.price : getPrice(sym);
        if (price <= 0) continue;
        const valueDiff = idealValue - currentValue;
        const analysis = vaultAnalysisCache[sym];
        const signal = plannerSignal(analysis, strategy);
        const threshold = Math.max(Math.max(currentValue, idealValue) * 0.02, 5e3);
        if (Math.abs(valueDiff) < threshold) continue;
        if (valueDiff < 0) {
          const excessValue = Math.abs(valueDiff);
          const sharesToSell = Math.min(Math.floor(excessValue / price), current?.looseShares || 0);
          if (sharesToSell > 0) {
            const sellValue = sharesToSell * price;
            let reason = "Over target allocation";
            if (smartMode && overvaluedSignals.includes(signal)) {
              reason = `${signal.toUpperCase()} signal`;
            }
            sells.push({
              symbol: sym,
              shares: sharesToSell,
              value: sellValue,
              price,
              currentShares,
              idealShares,
              analysis,
              reason,
              pnl: fifoWithdrawal(sym, currentShares, price, sharesToSell).pnl
            });
            totalSellValue += sellValue;
          }
        } else if (valueDiff > 0) {
          const shortfallValue = valueDiff;
          const sharesToBuy = Math.floor(shortfallValue / price);
          if (sharesToBuy > 0) {
            buys.push({
              symbol: sym,
              shares: sharesToBuy,
              value: sharesToBuy * price,
              price,
              currentShares,
              idealShares,
              analysis
            });
            totalBuyValue += sharesToBuy * price;
          }
        }
      }
      // Round each order down to cents before combining its available proceeds.
      const netCents = sells.reduce((sum, sell) => sum + Math.floor(stockNetFromGross(sell.value) * 100 + 1e-7), 0);
      const netSellValue = netCents / 100;
      if (totalBuyValue > netSellValue) {
        const scale = netSellValue / totalBuyValue;
        let remainingCents = netCents;
        const rounded = buys.map(buy => {
          const desired = buy.shares;
          const scaled = desired * scale;
          const unitCents = Math.round(buy.price * 100);
          buy.shares = Math.floor(scaled);
          remainingCents -= buy.shares * unitCents;
          return {buy, desired, unitCents, fraction: scaled - buy.shares};
        }).sort((a,b) => b.fraction - a.fraction);
        for (const item of rounded) {
          if (item.buy.shares < item.desired && remainingCents >= item.unitCents) {
            item.buy.shares++;
            remainingCents -= item.unitCents;
          }
        }
        for (const item of rounded) item.buy.value = item.buy.shares * item.unitCents / 100;
        totalBuyValue = (netCents - remainingCents) / 100;
        const funded = buys.filter(buy => buy.shares > 0);
        buys.length = 0;
        buys.push(...funded);
      }
      const signalPriority = { "strong_sell": 0, "strong_buy": 6, "watch": 4, "sell": 1, "take_profit": 2, "hold": 3, "good": 4, "buy": 5 };
      sells.sort((a, b) => {
        if (vaultConfig.profitFirstRebalance) {
          const ar = saleReturn(a.pnl, a.value), br = saleReturn(b.pnl, b.value);
          if (ar !== br) return br - ar;
        }
        const aPri = signalPriority[plannerSignal(a.analysis, strategy)] ?? 3;
        const bPri = signalPriority[plannerSignal(b.analysis, strategy)] ?? 3;
        return aPri - bPri;
      });
      buys.sort((a, b) => {
        const aPri = signalPriority[plannerSignal(a.analysis, strategy)] ?? 3;
        const bPri = signalPriority[plannerSignal(b.analysis, strategy)] ?? 3;
        return bPri - aPri;
      });
      return {
        sells,
        buys,
        totalSellValue,
        totalBuyValue,
        netSellValue,
        netCashFlow: netSellValue - totalBuyValue
      };
    }
    async function calculateIdealRebalanceAllocations(totalValue, stocks2, smartMode) {
      const strategy = vaultConfig.depositStrategy;
      const overvaluedSignals = ["sell", "take_profit"];
      let allocations = [];
      let weights = {};
      let totalWeight = 0;
      for (const sym of stocks2) {
        let analysis = vaultAnalysisCache[sym];
        if (!analysis) {
          analysis = await analyzeStockForVault(sym);
        }
        const signal = analysis ? analysis.signal : "hold";
        const opportunity = analysis ? analyzeSwingOpportunity(analysis) : null;
        const swingOvervalued = ["strong_sell", "sell", "take_profit"];
        const isOvervalued = strategy === "swing_strategy" && opportunity ? swingOvervalued.includes(opportunity.signal) : overvaluedSignals.includes(signal);
        if (smartMode && isOvervalued) {
          weights[sym] = 0;
          continue;
        }
        let weight = 1;
        switch (strategy) {
          case "swing_strategy":
            if (opportunity) {
              weight = Math.max(0.5, 1 + opportunity.score / 100);
            }
            break;
          case "rsi_weighted":
            if (analysis && analysis.rsi) {
              weight = Math.max(0.5, (100 - analysis.rsi) / 30);
              const adx = analysis.adx ?? 25;
              const adxMin = swingTradeData?.settings?.adxMinThreshold ?? 25;
              const adxPartial = swingTradeData?.settings?.adxPartialThreshold ?? 20;
              const rsiAdxFactor = adx >= adxMin ? 1 : adx >= adxPartial ? 0.5 : 0;
              weight = weight * rsiAdxFactor + (1 - rsiAdxFactor);
              const volMult = analysis.volumeMultiplier ?? 1;
              const volMin = swingTradeData?.settings?.volumeMinMultiplier ?? 1;
              const volPartial = swingTradeData?.settings?.volumePartialMultiplier ?? 0.8;
              const volFactor = volMult >= volMin ? 1 : volMult >= volPartial ? 0.5 : 0;
              weight = weight * volFactor + (1 - volFactor);
            }
            break;
          case "dip_weighted":
            if (analysis && analysis.dipFrom7d < 0) {
              weight = Math.abs(analysis.dipFrom7d) + 1;
            } else if (analysis && analysis.dipFrom7d > 3) {
              weight = 0.5;
            }
            if (analysis) {
              const volMult = analysis.volumeMultiplier ?? 1;
              const volMin = swingTradeData?.settings?.volumeMinMultiplier ?? 1;
              const volPartial = swingTradeData?.settings?.volumePartialMultiplier ?? 0.8;
              const volFactor = volMult >= volMin ? 1 : volMult >= volPartial ? 0.5 : 0;
              weight = weight * volFactor + (1 - volFactor);
            }
            break;
          case "roi_priority":
            const price = getPrice(sym);
            const dailyYield = getDailyYield(sym);
            const stockData = STOCK_DATA[sym];
            if (stockData && price > 0) {
              const tierCost = stockData.base * price;
              const roi = tierCost > 0 ? dailyYield * 365 / tierCost * 100 : 0;
              weight = Math.max(0.5, roi / 10);
            }
            if (analysis) {
              const volMult = analysis.volumeMultiplier ?? 1;
              const volMin = swingTradeData?.settings?.volumeMinMultiplier ?? 1;
              const volPartial = swingTradeData?.settings?.volumePartialMultiplier ?? 0.8;
              const volFactor = volMult >= volMin ? 1 : volMult >= volPartial ? 0.5 : 0;
              weight = weight * volFactor + (1 - volFactor);
            }
            break;
          case "equal":
          default:
            weight = 1;
            if (analysis) {
              const volMult = analysis.volumeMultiplier ?? 1;
              const volMin = swingTradeData?.settings?.volumeMinMultiplier ?? 1;
              const volPartial = swingTradeData?.settings?.volumePartialMultiplier ?? 0.8;
              const volFactor = volMult >= volMin ? 1 : volMult >= volPartial ? 0.5 : 0;
              weight = weight * volFactor + (1 - volFactor);
            }
            break;
        }
        if (analysis) {
          if (signal === "buy") weight *= 1.3;
          else if (signal === "good") weight *= 1.15;
        }
        weights[sym] = weight;
        totalWeight += weight;
      }
      for (const sym of stocks2) {
        const price = getPrice(sym);
        if (price <= 0 || totalWeight <= 0) continue;
        const weight = weights[sym] || 0;
        const allocation = weight / totalWeight * totalValue;
        const shares = Math.floor(allocation / price);
        allocations.push({
          symbol: sym,
          shares,
          cost: shares * price,
          price,
          weight
        });
      }
      return allocations;
    }
    function rebalanceImpact(breakdown, plan) {
      const values = new Map(breakdown.map(row => [row.symbol, row.owned * row.price]));
      function largest() {
        let total = 0, value = 0, symbol = "";
        for (const [ticker, amount] of values) {
          total += amount;
          if (amount > value) { value = amount; symbol = ticker; }
        }
        return total > 0 ? symbol + " " + (100 * value / total).toFixed(1) + "%" : "No stock holdings";
      }
      const before = largest();
      for (const sell of plan.sells) values.set(sell.symbol, values.get(sell.symbol) - sell.value);
      for (const buy of plan.buys) values.set(buy.symbol, (values.get(buy.symbol) || 0) + buy.value);
      const fees = plan.sells.reduce((sum, sell) => sum + sell.value * STOCK_SELL_FEE_RATE, 0);
      return "Estimated sale fees: " + formatSalePnl(fees) + " · Largest share of vault stock value: " + before + " → " + largest();
    }
    function showRebalanceModal(plan, currentBreakdown, idealAllocations) {
      const signalColors = {
        "buy": "#66bb6a",
        "good": "#81c784",
        "hold": "#ffd54f",
        "take_profit": "#ffb74d",
        "sell": "#ef5350"
      };
      const tradeStates = {
        sells: plan.sells.map(() => "pending"),
        buys: plan.buys.map(() => "pending")
      };
      let completedCount = 0;
      const totalTrades = plan.sells.length + plan.buys.length;
      const tradeQueue = [];
      plan.sells.forEach((s, idx) => {
        tradeQueue.push({ type: "sell", symbol: s.symbol, shares: s.shares, index: idx });
      });
      plan.buys.forEach((b, idx) => {
        tradeQueue.push({ type: "buy", symbol: b.symbol, shares: b.shares, index: idx });
      });
      let currentTradeIndex = 0;
      function updateProgress() {
        completedCount = tradeStates.sells.filter((s) => s === "completed").length + tradeStates.buys.filter((b) => b === "completed").length;
        const progressText = totalTrades > 0 ? `Progress: ${completedCount}/${totalTrades} trades completed` : "";
        $("#rebal-progress").text(progressText);
      }
      function updateRowState(index, type, state) {
        const typeKey = type + "s";
        tradeStates[typeKey][index] = state;
        const $row = type === "sell" ? $(`.rebal-row[data-sell-index="${index}"]`) : $(`.rebal-row[data-buy-index="${index}"]`);
        if (state === "pending") {
          $row.removeClass("rebal-row-executing rebal-row-completed rebal-row-failed");
        } else if (state === "executing") {
          $row.addClass("rebal-row-executing");
        } else if (state === "completed") {
          $row.removeClass("rebal-row-executing").addClass("rebal-row-completed");
        } else if (state === "failed") {
          $row.removeClass("rebal-row-executing").addClass("rebal-row-failed");
        }
        updateProgress();
      }
      let sellsHtml = "";
      if (plan.sells.length > 0) {
        sellsHtml = `
        <div class="rebal-section">
            <div class="rebal-section-header" style="color:#ef5350;">\u{1F4C9} Sell Orders (${plan.sells.length}) - Freeing up funds</div>
            <div class="rebal-table">
                ${plan.sells.map((s, idx) => {
          const signal = plannerSignal(s.analysis, vaultConfig.depositStrategy);
          const signalColor = signalColors[signal] || "#888";
          const reason = s.reason || "";
          const reasonTip = reason.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
          const reasonHtml = reason ? `<span class="rebal-reason rebal-reason-tip" title="${reasonTip}" aria-label="${reasonTip}">\u24D8</span>` : `<span class="rebal-reason"></span>`;
          return `<div class="rebal-row" data-sell-index="${idx}">
                        <span class="rebal-sym">${s.symbol}</span>
                        <span class="rebal-signal" style="color:${signalColor};">${signal.toUpperCase()}</span>
                        ${reasonHtml}
                        <span>After-fee P&amp;L: ${formatSalePnl(s.pnl)}</span>
                        <span class="rebal-shares">-${s.shares.toLocaleString()}</span>
                        <span class="rebal-value" style="color:#ef5350;">${formatCompactNumber(s.value)}</span>
                    </div>`;
        }).join("")}
            </div>
            <div class="rebal-subtotal" style="color:#ef5350;">Net proceeds to redistribute: $${formatCompactNumber(plan.netSellValue)}</div>
        </div>`;
      } else {
        sellsHtml = `
        <div class="rebal-section">
            <div class="rebal-section-header" style="color:#888;">\u{1F4C9} No Sell Orders</div>
            <div style="padding:10px; color:#666; font-size:11px; text-align:center;">
                No overvalued or overweight positions found to sell.
                ${vaultConfig.skipOvervalued ? '<br>Try disabling "Smart" mode to include more stocks.' : ""}
            </div>
        </div>`;
      }
      let buysHtml = "";
      if (plan.buys.length > 0) {
        buysHtml = `
        <div class="rebal-section">
            <div class="rebal-section-header" style="color:#66bb6a;">\u{1F4C8} Buy Orders (${plan.buys.length}) - Redistributing to undervalued</div>
            <div class="rebal-table">
                ${plan.buys.map((b, idx) => {
          const signal = plannerSignal(b.analysis, vaultConfig.depositStrategy);
          const signalColor = signalColors[signal] || "#888";
          return `<div class="rebal-row" data-buy-index="${idx}">
                        <span class="rebal-sym">${b.symbol}</span>
                        <span class="rebal-signal" style="color:${signalColor};">${signal.toUpperCase()}</span>
                        <span class="rebal-reason"></span>
                        <span class="rebal-shares">+${b.shares.toLocaleString()}</span>
                        <span class="rebal-value" style="color:#66bb6a;">$${formatCompactNumber(b.value)}</span>
                    </div>`;
        }).join("")}
            </div>
            <div class="rebal-subtotal" style="color:#66bb6a;">Total Buy: $${formatCompactNumber(plan.totalBuyValue)}</div>
        </div>`;
      } else if (plan.sells.length > 0) {
        buysHtml = `
        <div class="rebal-section">
            <div class="rebal-section-header" style="color:#888;">\u{1F4C8} No Buy Orders</div>
            <div style="padding:10px; color:#666; font-size:11px; text-align:center;">
                No eligible stocks to buy into. Freed funds will remain as cash.
            </div>
        </div>`;
      }
      const netFlow = plan.netCashFlow;
      const hasAction = plan.sells.length > 0 || plan.buys.length > 0;
      let summaryHtml = "";
      if (plan.sells.length > 0 && plan.buys.length > 0) {
        summaryHtml = `
        <div class="rebal-summary">
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Strategy</span>
                <span class="rebal-summary-value">${vaultConfig.depositStrategy.replace("_", " ")}</span>
            </div>
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Sell \u2192 Buy</span>
                <span class="rebal-summary-value" style="color:#caa14a;">$${formatCompactNumber(plan.netSellValue)}</span>
            </div>
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Total Trades</span>
                <span class="rebal-summary-value">${totalTrades}</span>
            </div>
        </div>`;
      } else if (plan.sells.length > 0) {
        summaryHtml = `
        <div class="rebal-summary">
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Action</span>
                <span class="rebal-summary-value">Sell Only</span>
            </div>
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Cash Out</span>
                <span class="rebal-summary-value" style="color:#ef5350;">$${formatCompactNumber(plan.netSellValue)}</span>
            </div>
        </div>`;
      }
      const html = `
    <div class="rebal-container">
        ${summaryHtml}
        ${sellsHtml}
        ${buysHtml}
        
        ${hasAction ? `<div class="rebal-warning">
            \u26A0\uFE0F Click the button to execute trades sequentially. Market prices may vary slightly.
        </div>` : ""}
        
        ${hasAction ? `<div id="rebal-progress" style="text-align:center; padding:10px; color:#caa14a; font-weight:bold;">Progress: 0/${totalTrades} trades completed</div>` : ""}
        
        <div class="rebal-actions">
            ${hasAction && tradeQueue.length > 0 ? `<button id="rebal-cycle-btn" class="alfa-main-btn" style="margin-right:10px;">${tradeQueue[0].type === "sell" ? "Selling" : "Buying"} ${tradeQueue[0].symbol} (1/${tradeQueue.length})</button>` : ""}
            <button id="rebal-cancel" class="alfa-main-btn" style="border-color:#888; color:#888;">Close</button>
        </div>
    </div>`;
      createModal("Rebalance Portfolio", html);
      $("<div>").addClass("rebal-warning").text(rebalanceImpact(currentBreakdown, plan)).insertBefore("#alfa-modal-overlay .rebal-section:first");
      $("#rebal-cancel").on("click", function() {
        $("#alfa-modal-overlay").remove();
      });
      if (hasAction && tradeQueue.length > 0) {
        $("#rebal-cycle-btn").on("click", async function() {
          if (currentTradeIndex >= tradeQueue.length) return;
          const trade = tradeQueue[currentTradeIndex];
          const $btn = $(this);
          $btn.prop("disabled", true).text("Executing...");
          updateRowState(trade.index, trade.type, "executing");
          try {
            if (trade.type === "sell") checkWithdrawalOrder(trade, false);
            await postTradeAsync(
              trade.symbol,
              trade.shares,
              trade.type === "sell" ? "sellShares" : "buyShares"
            );
            updateRowState(trade.index, trade.type, "completed");
            updateVaultDisplay();
            currentTradeIndex++;
            if (currentTradeIndex >= tradeQueue.length) {
              $btn.prop("disabled", true).text("Completed!").css("background", "#8bc34a").css("color", "#111");
            } else {
              const nextTrade = tradeQueue[currentTradeIndex];
              $btn.prop("disabled", false).text(`${nextTrade.type === "sell" ? "Selling" : "Buying"} ${nextTrade.symbol} (${currentTradeIndex + 1}/${tradeQueue.length})`);
            }
          } catch (e) {
            console.error(`Trade failed for ${trade.symbol}:`, e);
            updateRowState(trade.index, trade.type, "failed");
            $btn.prop("disabled", false).text(`${trade.type === "sell" ? "Selling" : "Buying"} ${trade.symbol} (${currentTradeIndex + 1}/${tradeQueue.length}) - Retry`);
          }
        });
      }
    }
    async function executeRebalance(plan) {
      const status = $("#vault-status");
      let successCount = 0;
      let failCount = 0;
      for (let i = 0; i < plan.sells.length; i++) {
        const sell = plan.sells[i];
        status.html(`<span style="color:#ffd54f;">Selling ${sell.symbol}... (${i + 1}/${plan.sells.length})</span>`);
        try {
          checkGoalSale(sell.symbol, sell.shares);
          await new Promise((resolve) => {
            $.post(
              `https://www.torn.com/page.php?sid=StockMarket&step=sellShares&rfcv=${getRFC()}`,
              { stockId: stockId[sell.symbol], amount: sell.shares }
            ).done(function(r) {
              try {
                if (typeof r === "string") r = JSON.parse(r);
                if (r.success) {
                  updateLocalCache(sell.symbol, -sell.shares);
                  successCount++;
                } else {
                  failCount++;
                  console.error(`Sell failed for ${sell.symbol}:`, r.text);
                }
              } catch (e) {
                successCount++;
              }
              resolve();
            }).fail(function() {
              failCount++;
              resolve();
            });
          });
          await new Promise((r) => setTimeout(r, 300));
        } catch (e) {
          failCount++;
        }
      }
      if (plan.sells.length > 0 && plan.buys.length > 0) {
        status.html('<span style="color:#ffd54f;">Processing buys...</span>');
        await new Promise((r) => setTimeout(r, 500));
      }
      for (let i = 0; i < plan.buys.length; i++) {
        const buy = plan.buys[i];
        status.html(`<span style="color:#ffd54f;">Buying ${buy.symbol}... (${i + 1}/${plan.buys.length})</span>`);
        try {
          await new Promise((resolve) => {
            $.post(
              `https://www.torn.com/page.php?sid=StockMarket&step=buyShares&rfcv=${getRFC()}`,
              { stockId: stockId[buy.symbol], amount: buy.shares }
            ).done(function(r) {
              try {
                if (typeof r === "string") r = JSON.parse(r);
                if (r.success) {
                  updateLocalCache(buy.symbol, buy.shares);
                  successCount++;
                } else {
                  failCount++;
                  console.error(`Buy failed for ${buy.symbol}:`, r.text);
                }
              } catch (e) {
                successCount++;
              }
              resolve();
            }).fail(function() {
              failCount++;
              resolve();
            });
          });
          await new Promise((r) => setTimeout(r, 300));
        } catch (e) {
          failCount++;
        }
      }
      updateVaultDisplay();
      const totalTrades = plan.sells.length + plan.buys.length;
      if (failCount === 0) {
        status.html(`<span style="color:#8bc34a;">Rebalance complete! ${successCount}/${totalTrades} trades executed.</span>`);
      } else {
        status.html(`<span style="color:#ffb74d;">Rebalance done with ${failCount} failed trades. ${successCount}/${totalTrades} succeeded.</span>`);
      }
      setTimeout(() => status.html(""), 5e3);
    }
    function fifoWithdrawal(symbol, owned, price, shares) {
      const basis = portfolioData.costBasis?.[symbol];
      const lots = basis?.lots;
      if (!lots?.length || basis.totalShares !== owned || !Number.isFinite(price) || price <= 0 ||
          lots.some(lot => !Number.isSafeInteger(lot.shares) || lot.shares <= 0 ||
            !Number.isFinite(lot.pricePerShare) || lot.pricePerShare <= 0) ||
          lots.reduce((n, lot) => n + lot.shares, 0) !== owned || shares > owned) {
        return {eligible: 0, pnl: null};
      }
      let left = shares, cost = 0, eligible = 0;
      const netPrice = stockNetFromGross(price);
      for (const lot of lots) {
        const qty = Math.min(left, lot.shares);
        // Stop at the first underwater FIFO lot. Later lots cannot be sold first.
        if (eligible === shares - left && netPrice + 1e-9 >= lot.pricePerShare) eligible += qty;
        cost += qty * lot.pricePerShare;
        left -= qty;
        if (!left) break;
      }
      return {eligible, pnl: stockNetFromGross(shares * price) - cost};
    }
    function saleReturn(pnl, gross) {
      return Number.isFinite(pnl) && gross > 0 ? pnl / gross : -Infinity;
    }
    function withdrawalCapacity(stocks) {
      const totals = {safe: 0, protected: 0, unknown: 0, below: 0, noQuote: 0, remaining: []};
      for (const stock of stocks) {
        if (stock.owned <= 0) continue;
        const {symbol, owned, price} = stock;
        if (!(price > 0 && Number.isFinite(price))) { totals.noQuote++; continue; }
        const loose = stock.isLocked ? 0 : stock.looseShares;
        const netPrice = stockNetFromGross(price);
        totals.protected += (owned - loose) * netPrice;
        if (!loose) continue;
        const fifo = fifoWithdrawal(symbol, owned, price, loose);
        if (fifo.pnl === null) { totals.unknown += loose * netPrice; continue; }
        totals.safe += fifo.eligible * netPrice;
        if (fifo.eligible < loose) {
          totals.below += (loose - fifo.eligible) * netPrice;
          totals.remaining.push({symbol, owned, price, loose, start: fifo.eligible});
        }
      }
      return totals;
    }
    function coverShortfall(capacity, need) {
      const queues = [];
      for (const row of capacity.remaining) {
        let skip = row.start, room = row.loose - row.start;
        const lots = [];
        for (const lot of portfolioData.costBasis[row.symbol].lots) {
          const offset = Math.min(skip, lot.shares);
          skip -= offset;
          const available = Math.min(room, lot.shares - offset);
          if (available > 0) lots.push({shares: available, cost: lot.pricePerShare});
          room -= available;
          if (!room) break;
        }
        queues.push({row, lots, head: 0, sold: 0});
      }
      let raised = 0, pnl = 0;
      while (need - raised > 0.005) {
        let best = null, bestRate = -Infinity, bestWeight = -Infinity;
        for (const queue of queues) {
          const lot = queue.lots[queue.head];
          if (!lot) continue;
          const row = queue.row;
          const rate = 1 - lot.cost / stockNetFromGross(row.price);
          const weight = (row.loose - row.start - queue.sold) * row.price;
          if (rate > bestRate || (rate === bestRate && weight > bestWeight)) {
            best = queue;
            bestRate = rate;
            bestWeight = weight;
          }
        }
        if (!best) break;
        const lot = best.lots[best.head];
        const net = stockNetFromGross(best.row.price);
        const qty = Math.min(lot.shares, Math.ceil((need - raised) / net));
        raised += qty * net;
        pnl += qty * (net - lot.cost);
        best.sold += qty;
        lot.shares -= qty;
        if (!lot.shares) best.head++;
      }
      return {raised, pnl, orders: queues.filter(q => q.sold > 0).map(q => ({...q.row, extra: q.sold}))};
    }
    function shortfallPreview(capacity, target) {
      const need = target - capacity.safe;
      if (!(need > 0.005)) return "";
      const {raised, pnl} = coverShortfall(capacity, need);
      return "Break-even shortfall: " + formatWithdrawMoney(need) + ". " +
        (raised ? "Known-cost FIFO estimate: " + formatWithdrawMoney(raised) +
          " additional cash, after-fee gain/loss " + formatSalePnl(pnl) + ". " : "") +
        (need - raised > 0.005 ? formatWithdrawMoney(need - raised) + " still uncovered by known-cost shares." : "");
    }
    function offerShortfall(plan, target, exclusions, history = []) {
      const safeCash = stockNetFromGross(plan.reduce((sum, order) => sum + order.value, 0));
      const need = target - safeCash;
      if (need <= 0.005) return false;
      const capacity = withdrawalCapacity(calculateVaultBreakdown());
      const full = new Map(plan.map(item => [item.symbol, {...item}]));
      // Only extend tickers whose entire break-even prefix is in this preview.
      capacity.remaining = capacity.remaining.filter(row => (full.get(row.symbol)?.shares || 0) === row.start);
      const cover = coverShortfall(capacity, need);
      if (!cover.orders.length) return false;
      for (const row of cover.orders) {
        const shares = row.start + row.extra;
        const pnl = fifoWithdrawal(row.symbol, row.owned, row.price, shares).pnl;
        full.set(row.symbol, {...full.get(row.symbol), symbol: row.symbol, shares, price: row.price,
          value: shares * row.price, pnl, approvedOwned: row.owned, safePrefix: row.start});
      }
      const combined = safeCash + cover.raised;
      createModal("Choose withdrawal amount", `<p>Requested: ${formatWithdrawMoney(target)} net. Available at break-even: ${formatWithdrawMoney(safeCash)}.</p>
        <p>Additional net cash: ${formatWithdrawMoney(cover.raised)} · Estimated gain/loss on those extra shares: ${formatSalePnl(cover.pnl)}.</p>
        ${target - combined > 0.005 ? "<p>Remaining shortfall: " + formatWithdrawMoney(target - combined) + "</p>" : ""}
        <div class="rebal-actions"><button class="alfa-main-btn" id="withdraw-safe-choice">${safeCash ? "Review " + formatWithdrawMoney(safeCash) + " at break-even" : "Keep holdings"}</button>
        <button class="alfa-main-btn" id="withdraw-cover-choice">Review ${formatWithdrawMoney(combined)} including shortfall sales</button></div>`);
      showHistoryNotice(history);
      $("#withdraw-safe-choice").on("click", () => {
        if (plan.length) showWithdrawModal(plan, target, exclusions, history);
        else $("#alfa-modal-overlay").remove();
      });
      $("#withdraw-cover-choice").on("click", () => showWithdrawModal([...full.values()], target, [], history));
      return true;
    }
    function rankedWithdrawal(target, stocks, strategy) {
      const candidates = stocks.filter(stock => stock.looseShares > 0);
      const orders = [];
      let remaining = target;
      while (remaining > 0 && candidates.length) {
        let best;
        for (const stock of candidates) {
          const shares = Math.min(stock.looseShares, Math.ceil(remaining / stock.price));
          const value = shares * stock.price;
          const pnl = fifoWithdrawal(stock.symbol, stock.actualOwned, stock.price, shares).pnl;
          const score = strategy === "fewest_orders" ? stock.looseValue : saleReturn(pnl, value);
          if (!best || score > best.score || (score === best.score && value > best.value)) {
            best = {stock, shares, value, score};
          }
        }
        orders.push({symbol: best.stock.symbol, price: best.stock.price, shares: best.shares, value: best.value});
        remaining -= best.value;
        candidates.splice(candidates.indexOf(best.stock), 1);
      }
      return orders;
    }
    function formatSalePnl(pnl) {
      return Number.isFinite(pnl) ? pnl.toLocaleString("en-US", {style:"currency", currency:"USD"}) : "Unknown";
    }
    function overweightWithdrawPlan(target, stocks) {
      const rows = stocks.filter(s => s.looseShares > 0);
      if (!rows.length) return [];
      // Find the remaining dollar level common to holdings from which we can sell.
      let low = 0, high = Math.max(...rows.map(s => s.holdingValue));
      for (let i = 0; i < 55; i++) {
        const level = (low + high) / 2;
        const gross = rows.reduce((n,s) => n + Math.min(s.looseValue, Math.max(0,s.holdingValue - level)), 0);
        if (gross > target) low = level;
        else high = level;
      }
      const orders = rows.map(s => {
        const shares = Math.min(s.looseShares, Math.floor(Math.max(0, s.holdingValue - high) / s.price));
        return {symbol:s.symbol, price:s.price, shares, value:shares*s.price, available:s.looseShares, remainingValue:s.holdingValue-shares*s.price};
      }).sort((a,b) => b.remainingValue - a.remainingValue || a.symbol.localeCompare(b.symbol));
      let gross = orders.reduce((n,o) => n + o.value,0);
      for (const order of orders) {
        if (gross + 1e-8 >= target) break;
        if (order.shares < order.available) {
          order.shares++;
          order.value = order.shares * order.price;
          gross += order.price;
        }
      }
      return orders.filter(o => o.shares > 0);
    }
    function checkWithdrawalOrder(order, strict) {
      const symbol = order.symbol;
      const cached = getOwnedShares(symbol);
      const displayed = getOwnedSharesFromDom(symbol);
      if (strict && cached !== displayed) throw new Error("Holdings changed. Refresh and recalculate.");
      const owned = Math.min(cached, displayed);
      const price = getPrice(symbol);
      const swing = swingTradeData.activePositions.filter(p => p.symbol?.toUpperCase() === symbol)
        .reduce((n,p) => n + (p.shares || 0), 0);
      if (vaultConfig.lockedStocks?.includes(symbol) || !(price > 0) ||
          order.shares > owned - blockReserve(symbol, owned, blocksEnabled()) - swing)
        throw new Error("Holdings, protections or quote changed. Close and recalculate.");
      if (strict && fifoWithdrawal(symbol, owned, price, order.shares).eligible < order.shares)
        throw new Error("Sale no longer qualifies after fees or cost history is incomplete. Close and recalculate.");
    }
    function withdrawalHistoryGaps() {
      const gaps = [];
      for (const stock of calculateVaultBreakdown()) {
        if (stock.isLocked || stock.looseShares <= 0) continue;
        const basis = portfolioData.costBasis?.[stock.symbol];
        const lots = Array.isArray(basis?.lots) ? basis.lots : [];
        const accounted = lots.reduce((n, lot) => n + (Number.isSafeInteger(lot.shares) && lot.shares > 0 &&
          Number.isFinite(lot.pricePerShare) && lot.pricePerShare > 0 ? lot.shares : 0), 0);
        if (accounted !== stock.owned || basis?.totalShares !== stock.owned) {
          gaps.push(stock.symbol + ": " + accounted.toLocaleString() + " shares accounted for; " +
            stock.owned.toLocaleString() + " held" + (accounted === stock.owned ? " (ledger total differs)" : ""));
        }
      }
      return gaps;
    }
    let withdrawalSync = null;
    async function checkWithdrawalHistory(status) {
      const gaps = withdrawalHistoryGaps();
      if (!gaps.length) return [];
      if (!localStorage.getItem("alfa_vault_apikey")) return ["Quick sync requires an API key.", ...gaps];
      status.text("Checking recent stock transactions…");
      if (!withdrawalSync) {
        withdrawalSync = fetchStockTransactionLogs(false, null, 3).then(result => {
          if (result.success) processTransactions(result);
          return result;
        }).catch(() => ({success: false})).finally(() => { withdrawalSync = null; });
      }
      const result = await withdrawalSync;
      const remaining = withdrawalHistoryGaps();
      if (!remaining.length) return [];
      const note = result.limited ? "Quick sync reached its page limit." : result.success ? "Purchase history still incomplete." : "Quick sync unavailable.";
      return [note + " Check Portfolio P&L → Full Sync.", ...remaining];
    }
    async function smartWithdraw(targetAmount) {
      if (vaultConfig.educationProtection) await refreshEducation();
      const status = $("#vault-status");
      if (!targetAmount || targetAmount <= 0) {
        status.html('<span style="color:#ef5350;">Enter a valid withdrawal amount!</span>');
        setTimeout(() => status.html(""), 3e3);
        return;
      }
      if (vaultConfig.stocks.length === 0) {
        status.html('<span style="color:#ef5350;">No vault stocks configured! Click Settings to set up your vault.</span>');
        setTimeout(() => status.html(""), 3e3);
        return;
      }
      const history = await checkWithdrawalHistory(status);
      if (vaultConfig.withdrawStrategy === "swing_strategy") {
        status.html('<span style="color:#ffd54f;">Analyzing stocks...</span>');
        await analyzeAllVaultStocks((msg) => status.html(`<span style="color:#ffd54f;">${msg}</span>`));
      }
      status.html('<span style="color:#ffd54f;">Calculating withdrawal plan...</span>');
      const exclusions = [];
      const plan = calculateWithdrawPlan(stockGrossFromNet(targetAmount), vaultConfig.withdrawStrategy, exclusions);
      status.html("");
      if (vaultConfig.preferBreakEven && !vaultConfig.breakEvenOnly && offerShortfall(plan, targetAmount, exclusions, history)) return;
      showWithdrawModal(plan, targetAmount, exclusions, history);
    }
    function calculateWithdrawPlan(targetAmount, strategy, exclusions = []) {
      let stocks2 = vaultConfig.stocks;
      if (stocks2.length === 0) return [];
      if (vaultConfig.lockedStocks && vaultConfig.lockedStocks.length > 0) {
        stocks2 = stocks2.filter((sym) => !vaultConfig.lockedStocks.includes(sym));
      }
      if (stocks2.length === 0) {
        $("#vault-status").html('<span style="color:#ffb74d;">All stocks are locked!</span>');
        return [];
      }
      const stockInfo = [];
      for (const sym of stocks2) {
        const owned = getOwnedShares(sym);
        const price = getPrice(sym);
        if (owned <= 0 || price <= 0) continue;
        const stockData = STOCK_DATA[sym];
        const tierInfo = getBenefitTier(sym, owned);
        const swingProtectedShares = swingTradeData.activePositions.filter((p) => (p.symbol || "").toUpperCase() === (sym || "").toUpperCase()).reduce((sum, p) => sum + (p.shares || 0), 0);
        const checkbox = $("#alfa-lock-toggle");
        const lockBlocks = checkbox.length > 0 ? checkbox.is(":checked") : localStorage.getItem("alfa_vault_lock") === "true";
        const lockedShares = blockReserve(sym, owned, lockBlocks);
        const totalProtected = lockedShares + swingProtectedShares;
        const looseShares = Math.max(0, owned - totalProtected);
        const fifo = fifoWithdrawal(sym, owned, price, looseShares);
        const available = (vaultConfig.breakEvenOnly || vaultConfig.preferBreakEven) ? fifo.eligible : looseShares;
        if (available < looseShares) {
          const sellSignal = ["sell","strong_sell","take_profit"].includes(plannerSignal(vaultAnalysisCache[sym], strategy));
          exclusions.push(sym + (sellSignal ? " (sell signal)" : "") + ": " + (looseShares - available).toLocaleString() +
            (fifo.pnl === null ? " shares excluded — incomplete cost history" : " shares excluded — FIFO break-even limit"));
        }
        const value = available * price;
        const looseValue = looseShares * price;
        const dailyYield = getDailyYield(sym);
        const roi = lockedShares > 0 && price > 0 ? dailyYield * 365 / (lockedShares * price) * 100 : 0;
        const analysis = vaultAnalysisCache[sym];
        const dipFrom7d = analysis ? analysis.dipFrom7d : 0;
        stockInfo.push({
          symbol: sym,
          actualOwned: owned,
          holdingValue: looseValue,
          owned: available,
          price,
          value,
          lockedShares: 0,
          // Includes benefit tier + swing trade protection
          benefitLockedShares: lockedShares,
          swingProtectedShares,
          looseShares: available,
          looseValue: value,
          tier: tierInfo.tier,
          roi,
          dipFrom7d,
          hasSwingTrade: swingProtectedShares > 0,
          analysis
        });
      }
      let plan = [];
      switch (strategy) {
        case "fewest_orders":
        case "profitable_first":
          plan = rankedWithdrawal(targetAmount, stockInfo, strategy);
          break;
        case "overweight_first":
          plan = overweightWithdrawPlan(targetAmount, stockInfo);
          break;
        case "proportional":
          plan = proportionalPlan(targetAmount, stockInfo);
          break;
        case "swing_strategy":
          plan = swingStrategyWithdrawPlan(targetAmount, stockInfo);
          break;
        case "worst_roi":
          plan = worstRoiFirstPlan(targetAmount, stockInfo);
          break;
        case "best_performers":
          plan = bestPerformersPlan(targetAmount, stockInfo);
          break;
        case "loose_first":
        default:
          plan = looseSharesFirstPlan(targetAmount, stockInfo);
          break;
      }
      plan = fillWithdrawToGross(plan, stockInfo, targetAmount);
      return plan.filter(p => p.shares > 0).map(p => {
        const stock = stockInfo.find(s => s.symbol === p.symbol);
        const pnl = fifoWithdrawal(p.symbol, stock.actualOwned, p.price, p.shares).pnl;
        return {...p, pnl};
      });
    }
    function looseSharesFirstPlan(targetAmount, stockInfo) {
      const plan = [];
      let remaining = targetAmount;
      const lockBlocks = blocksEnabled();
      for (const stock of stockInfo) {
        if (remaining <= 0) break;
        if (stock.looseShares <= 0) continue;
        const maxSellValue = Math.min(stock.looseValue, remaining);
        const sharesToSell = Math.min(stock.looseShares, Math.ceil(maxSellValue / stock.price));
        const sellValue = sharesToSell * stock.price;
        if (sharesToSell > 0) {
          plan.push({
            symbol: stock.symbol,
            shares: sharesToSell,
            price: stock.price,
            value: sellValue,
            type: "loose",
            swingProtected: stock.hasSwingTrade
          });
          remaining -= sellValue;
        }
      }
      if (remaining > 0 && !lockBlocks) {
        const stocksWithTiers = stockInfo.filter((s) => s.lockedShares > 0).sort((a, b) => a.roi - b.roi);
        for (const stock of stocksWithTiers) {
          if (remaining <= 0) break;
          const alreadyPlanned = plan.find((p) => p.symbol === stock.symbol);
          const alreadySelling = alreadyPlanned ? alreadyPlanned.shares : 0;
          const availableToSell = stock.owned - alreadySelling;
          if (availableToSell <= 0) continue;
          const maxSellValue = Math.min(availableToSell * stock.price, remaining);
          const sharesToSell = Math.ceil(maxSellValue / stock.price);
          const sellValue = sharesToSell * stock.price;
          if (sharesToSell > 0) {
            if (alreadyPlanned) {
              alreadyPlanned.shares += sharesToSell;
              alreadyPlanned.value += sellValue;
              alreadyPlanned.warning = "Will reduce benefit tier!";
            } else {
              plan.push({
                symbol: stock.symbol,
                shares: sharesToSell,
                price: stock.price,
                value: sellValue,
                type: "tier",
                warning: "Will reduce benefit tier!",
                swingProtected: stock.hasSwingTrade
              });
            }
            remaining -= sellValue;
          }
        }
      }
      return plan;
    }
    function swingStrategyWithdrawPlan(targetAmount, stockInfo) {
      const lockBlocks = blocksEnabled();
      const maxFractionPerStock = 0.5;
      const withScore = stockInfo.filter((s) => s.looseShares > 0).map((s) => {
        const opp = s.analysis ? analyzeSwingOpportunity(s.analysis) : null;
        const score = opp ? opp.score : 0;
        const weight = Math.max(1, 100 - score);
        return { ...s, score, weight };
      });
      const totalWeight = withScore.reduce((sum, s) => sum + s.weight, 0);
      const plan = [];
      const plannedBySym = {};
      let remaining = targetAmount;
      if (totalWeight > 0) {
        withScore.sort((a, b) => a.score - b.score);
        for (const stock of withScore) {
          const targetValue = stock.weight / totalWeight * targetAmount;
          const capValue = maxFractionPerStock * stock.looseValue;
          const maxSellValue = Math.min(stock.looseValue, capValue, targetValue, remaining);
          if (maxSellValue <= 0) continue;
          const sharesToSell = Math.min(stock.looseShares, Math.floor(maxSellValue / stock.price));
          if (sharesToSell <= 0) continue;
          const sellValue = sharesToSell * stock.price;
          plan.push({
            symbol: stock.symbol,
            shares: sharesToSell,
            price: stock.price,
            value: sellValue,
            type: "loose",
            swingProtected: stock.hasSwingTrade
          });
          plannedBySym[stock.symbol] = sharesToSell;
          remaining -= sellValue;
        }
        if (remaining > 0) {
          const sorted = [...withScore].sort((a, b) => a.score - b.score);
          for (const stock of sorted) {
            if (remaining <= 0) break;
            const alreadySelling = plannedBySym[stock.symbol] || 0;
            const looseAfter = stock.looseShares - alreadySelling;
            if (looseAfter <= 0) continue;
            const alreadyValue = alreadySelling * stock.price;
            const capValue = maxFractionPerStock * stock.looseValue;
            const roomValue = Math.max(0, capValue - alreadyValue);
            const takeValue = Math.min(roomValue, remaining, looseAfter * stock.price);
            if (takeValue <= 0) continue;
            const addShares = Math.min(looseAfter, Math.floor(takeValue / stock.price));
            if (addShares <= 0) continue;
            const addValue = addShares * stock.price;
            const entry = plan.find((p) => p.symbol === stock.symbol);
            if (entry) {
              entry.shares += addShares;
              entry.value += addValue;
            } else {
              plan.push({
                symbol: stock.symbol,
                shares: addShares,
                price: stock.price,
                value: addValue,
                type: "loose",
                swingProtected: stock.hasSwingTrade
              });
            }
            plannedBySym[stock.symbol] = (plannedBySym[stock.symbol] || 0) + addShares;
            remaining -= addValue;
          }
        }
      }
      if (remaining > 0 && !lockBlocks) {
        const withTierScore = stockInfo.filter((s) => s.lockedShares > 0).map((s) => {
          const opp = s.analysis ? analyzeSwingOpportunity(s.analysis) : null;
          const score = opp ? opp.score : 0;
          const weight = Math.max(1, 100 - score);
          return { ...s, score, weight };
        });
        const tierTotalWeight = withTierScore.reduce((sum, s) => sum + s.weight, 0);
        if (tierTotalWeight > 0) {
          withTierScore.sort((a, b) => a.score - b.score);
          for (const stock of withTierScore) {
            if (remaining <= 0) break;
            const alreadyPlanned = plan.find((p) => p.symbol === stock.symbol);
            const alreadySelling = alreadyPlanned ? alreadyPlanned.shares : 0;
            const availableToSell = stock.owned - alreadySelling;
            if (availableToSell <= 0) continue;
            const targetValue = stock.weight / tierTotalWeight * remaining;
            const tierCapValue = maxFractionPerStock * (stock.owned * stock.price);
            const alreadyValue = alreadySelling * stock.price;
            const roomValue = Math.max(0, tierCapValue - alreadyValue);
            const maxSellValue = Math.min(availableToSell * stock.price, remaining, roomValue, targetValue);
            if (maxSellValue <= 0) continue;
            const sharesToSell = Math.min(availableToSell, Math.floor(maxSellValue / stock.price));
            if (sharesToSell <= 0) continue;
            const sellValue = sharesToSell * stock.price;
            if (alreadyPlanned) {
              alreadyPlanned.shares += sharesToSell;
              alreadyPlanned.value += sellValue;
              alreadyPlanned.warning = "Will reduce benefit tier!";
            } else {
              plan.push({
                symbol: stock.symbol,
                shares: sharesToSell,
                price: stock.price,
                value: sellValue,
                type: "tier",
                warning: "Will reduce benefit tier!",
                swingProtected: stock.hasSwingTrade
              });
            }
            remaining -= sellValue;
          }
          if (remaining > 0) {
            withTierScore.sort((a, b) => a.score - b.score);
            for (const stock of withTierScore) {
              if (remaining <= 0) break;
              const alreadyPlanned = plan.find((p) => p.symbol === stock.symbol);
              const alreadySelling = alreadyPlanned ? alreadyPlanned.shares : 0;
              const availableToSell = stock.owned - alreadySelling;
              if (availableToSell <= 0) continue;
              const tierCapValue = maxFractionPerStock * (stock.owned * stock.price);
              const alreadyValue = alreadySelling * stock.price;
              const roomValue = Math.max(0, tierCapValue - alreadyValue);
              const takeValue = Math.min(roomValue, remaining, availableToSell * stock.price);
              if (takeValue <= 0) continue;
              const addShares = Math.min(availableToSell, Math.floor(takeValue / stock.price));
              if (addShares <= 0) continue;
              const addValue = addShares * stock.price;
              if (alreadyPlanned) {
                alreadyPlanned.shares += addShares;
                alreadyPlanned.value += addValue;
                alreadyPlanned.warning = "Will reduce benefit tier!";
              } else {
                plan.push({
                  symbol: stock.symbol,
                  shares: addShares,
                  price: stock.price,
                  value: addValue,
                  type: "tier",
                  warning: "Will reduce benefit tier!",
                  swingProtected: stock.hasSwingTrade
                });
              }
              remaining -= addValue;
            }
          }
        }
      }
      return plan;
    }
    function proportionalPlan(targetAmount, stockInfo) {
      const plan = [];
      const lockBlocks = blocksEnabled();
      let totalSellable = 0;
      for (const stock of stockInfo) {
        if (lockBlocks) {
          totalSellable += stock.looseValue;
        } else {
          totalSellable += stock.value;
        }
      }
      if (totalSellable <= 0) return plan;
      const sellPercentage = Math.min(1, targetAmount / totalSellable);
      for (const stock of stockInfo) {
        const maxValue = lockBlocks ? stock.looseValue : stock.value;
        const maxShares = lockBlocks ? stock.looseShares : stock.owned;
        if (maxShares <= 0) continue;
        const targetValue = maxValue * sellPercentage;
        const sharesToSell = Math.min(maxShares, Math.ceil(targetValue / stock.price));
        if (sharesToSell > 0) {
          const item = {
            symbol: stock.symbol,
            shares: sharesToSell,
            price: stock.price,
            value: sharesToSell * stock.price,
            type: sharesToSell > stock.looseShares ? "tier" : "loose",
            swingProtected: stock.hasSwingTrade
          };
          if (!lockBlocks && sharesToSell > stock.looseShares) {
            item.warning = "May reduce benefit tier!";
          }
          plan.push(item);
        }
      }
      return plan;
    }
    function worstRoiFirstPlan(targetAmount, stockInfo) {
      const plan = [];
      let remaining = targetAmount;
      const lockBlocks = blocksEnabled();
      const sortedStocks = [...stockInfo].sort((a, b) => a.roi - b.roi);
      for (const stock of sortedStocks) {
        if (remaining <= 0) break;
        const maxShares = lockBlocks ? stock.looseShares : stock.owned;
        if (maxShares <= 0) continue;
        const maxValue = maxShares * stock.price;
        const targetValue = Math.min(maxValue, remaining);
        const sharesToSell = Math.ceil(targetValue / stock.price);
        if (sharesToSell > 0) {
          const item = {
            symbol: stock.symbol,
            shares: sharesToSell,
            price: stock.price,
            value: sharesToSell * stock.price,
            type: sharesToSell > stock.looseShares ? "tier" : "loose",
            roi: stock.roi,
            swingProtected: stock.hasSwingTrade
          };
          if (!lockBlocks && sharesToSell > stock.looseShares) {
            item.warning = "May reduce benefit tier!";
          }
          plan.push(item);
          remaining -= item.value;
        }
      }
      return plan;
    }
    function bestPerformersPlan(targetAmount, stockInfo) {
      const plan = [];
      let remaining = targetAmount;
      const lockBlocks = blocksEnabled();
      const sortedStocks = [...stockInfo].sort((a, b) => b.dipFrom7d - a.dipFrom7d);
      for (const stock of sortedStocks) {
        if (remaining <= 0) break;
        const maxShares = lockBlocks ? stock.looseShares : stock.owned;
        if (maxShares <= 0) continue;
        const maxValue = maxShares * stock.price;
        const targetValue = Math.min(maxValue, remaining);
        const sharesToSell = Math.ceil(targetValue / stock.price);
        if (sharesToSell > 0) {
          const item = {
            symbol: stock.symbol,
            shares: sharesToSell,
            price: stock.price,
            value: sharesToSell * stock.price,
            type: sharesToSell > stock.looseShares ? "tier" : "loose",
            dipFrom7d: stock.dipFrom7d,
            swingProtected: stock.hasSwingTrade
          };
          if (!lockBlocks && sharesToSell > stock.looseShares) {
            item.warning = "May reduce benefit tier!";
          }
          plan.push(item);
          remaining -= item.value;
        }
      }
      return plan;
    }
    function showHistoryNotice(history) {
      if (history.length) $("<div>").addClass("rebal-warning").text(history.join(" · ")).prependTo("#alfa-modal-overlay .alfa-modal-body");
    }
    function showWithdrawModal(plan, targetAmount, exclusions = [], history = []) {
      const strict = !!(vaultConfig.breakEvenOnly || vaultConfig.preferBreakEven);
      const validPlan = plan.filter((p) => p.shares > 0);
      const totalAvailable = validPlan.reduce((sum, p) => sum + p.value, 0);
      const expectedCash = stockNetFromGross(totalAvailable);
      const strategyLabel = vaultConfig.withdrawStrategy.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
      const tradeStates = validPlan.map(() => "pending");
      let completedCount = 0;
      let cashReceived = 0;
      const tradeQueue = validPlan.map((item, idx) => ({
        type: "sell",
        symbol: item.symbol,
        shares: item.shares,
        value: item.value,
        index: idx
      }));
      let currentTradeIndex = 0;
      function updateProgress() {
        completedCount = tradeStates.filter((s) => s === "completed").length;
        const progressText = `Progress: ${completedCount}/${validPlan.length} trades completed`;
        $("#withdraw-progress").text(progressText);
        const netCash = stockNetFromGross(cashReceived);
        $("#withdraw-cash-received").text(`Cash Received: ~${formatWithdrawMoney(netCash)}`);
      }
      function updateRowState(index, state, value = 0) {
        tradeStates[index] = state;
        if (state === "completed" && value > 0) {
          cashReceived += value;
        }
        const $row = $(`.rebal-row[data-withdraw-index="${index}"]`);
        if (state === "pending") {
          $row.removeClass("rebal-row-executing rebal-row-completed rebal-row-failed");
        } else if (state === "executing") {
          $row.addClass("rebal-row-executing");
        } else if (state === "completed") {
          $row.removeClass("rebal-row-executing").addClass("rebal-row-completed");
        } else if (state === "failed") {
          $row.removeClass("rebal-row-executing").addClass("rebal-row-failed");
        }
        updateProgress();
      }
      const swingProtectedStocks = swingTradeData.activePositions.map((p) => p.symbol);
      const protectedInPlan = swingProtectedStocks.filter(
        (sym) => vaultConfig.stocks.includes(sym) && validPlan.some((p) => p.symbol === sym && p.shares > 0)
      );
      let warningHtml = "";
      const shortfall = targetAmount - expectedCash;
      if (shortfall >= 0.005) {
        warningHtml = `<div class="rebal-warning" style="background:#ff980022; border-color:#ff980055; color:#ffb74d;">
            \u26A0\uFE0F Only ~${formatWithdrawMoney(expectedCash)} net available · Shortfall: ${formatWithdrawMoney(shortfall)} (requested ${formatWithdrawMoney(targetAmount)})
        </div>`;
      }
      if (protectedInPlan.length > 0) {
        warningHtml += `<div class="rebal-warning" style="background:#caa14a22; border-color:#caa14a55; color:#caa14a;">
            \u{1F6E1}\uFE0F Swing Trade Protected: ${protectedInPlan.join(", ")}
        </div>`;
      }
      const sellsHtml = `
        <div class="rebal-section">
            <div class="rebal-section-header" style="color:#ef5350;">\u{1F4C9} Sell Orders (${validPlan.length})</div>
            <div class="rebal-table">
                ${validPlan.map((item, idx) => {
        const tipParts = [];
        if (item.warning) tipParts.push(item.warning);
        if (item.swingProtected) tipParts.push("Swing trade protected");
        const tip = tipParts.join(" \xB7 ");
        const tipEsc = tip.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
        const reasonHtml = tip ? `<span class="rebal-reason rebal-reason-tip" title="${tipEsc}" aria-label="${tipEsc}">\u24D8</span>` : `<span class="rebal-reason"></span>`;
        return `<div class="rebal-row" data-withdraw-index="${idx}">
                        <span class="rebal-sym">${item.symbol}</span>
                        <span class="rebal-signal" style="color:#ef5350;">SELL</span>
                        ${reasonHtml}
                        <span>After-fee P&amp;L: ${formatSalePnl(item.pnl)}</span>
                        <span class="rebal-shares">-${item.shares.toLocaleString()}</span>
                        <span class="rebal-value" style="color:#ef5350;">${formatCompactNumber(item.value)}</span>
                    </div>`;
      }).join("")}
            </div>
            <div class="rebal-subtotal" style="color:#ef5350;">Gross: ${formatWithdrawMoney(totalAvailable)}</div>
            <div class="rebal-subtotal" style="color:#8bc34a; margin-top:4px;">Net (after 0.1% fee): ~${formatWithdrawMoney(expectedCash)}</div>
        </div>`;
      const html = `
    <div class="rebal-container">
        <div class="rebal-summary">
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Strategy</span>
                <span class="rebal-summary-value">${strategyLabel}</span>
            </div>
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Requested (net)</span>
                <span class="rebal-summary-value">${formatWithdrawMoney(targetAmount)}</span>
            </div>
            <div class="rebal-summary-item">
                <span class="rebal-summary-label">Expected Cash</span>
                <span class="rebal-summary-value" style="color:#8bc34a;">~${formatWithdrawMoney(expectedCash)}</span>
            </div>
        </div>
        ${warningHtml}
        ${exclusions.length ? `<div class="rebal-warning">${exclusions.join("<br>")}</div>` : ""}
        ${sellsHtml}
        <div class="rebal-warning">
            \u26A0\uFE0F Click the button to execute trades sequentially. Market prices may vary slightly.
        </div>
        <div id="withdraw-progress" style="text-align:center; padding:10px; color:#ef5350; font-weight:bold;">Progress: 0/${validPlan.length} trades completed</div>
        <div id="withdraw-cash-received" style="text-align:center; padding:5px; color:#8bc34a; font-weight:bold;">Cash Received: ~$0</div>
        <div class="rebal-actions">
            ${tradeQueue.length > 0 ? `<button id="withdraw-cycle-btn" class="alfa-main-btn" style="margin-right:10px;">Selling ${tradeQueue[0].symbol} (1/${tradeQueue.length})</button>` : ""}
            <button id="withdraw-cancel" class="alfa-main-btn" style="border-color:#888; color:#888;">Close</button>
        </div>
    </div>`;
      createModal("Smart Withdraw", html);
      showHistoryNotice(history);
      $("#withdraw-cancel").on("click", function() {
        $("#alfa-modal-overlay").remove();
      });
      if (tradeQueue.length > 0) {
        $("#withdraw-cycle-btn").on("click", async function() {
          if (currentTradeIndex >= tradeQueue.length) return;
          const trade = tradeQueue[currentTradeIndex];
          const $btn = $(this);
          $btn.prop("disabled", true).text("Executing...");
          updateRowState(trade.index, "executing");
          try {
            const preview = validPlan[trade.index];
            if (preview.approvedOwned !== undefined && !vaultConfig.breakEvenOnly && vaultConfig.preferBreakEven) {
              checkWithdrawalOrder(trade, false);
              const owned = getOwnedSharesFromDom(trade.symbol);
              const price = getPrice(trade.symbol);
              const fifo = fifoWithdrawal(trade.symbol, owned, price, trade.shares);
              if (owned !== preview.approvedOwned || owned !== getOwnedShares(trade.symbol) ||
                  price < preview.price || fifo.pnl === null || fifo.pnl + 1e-7 < preview.pnl || fifo.eligible < preview.safePrefix)
                throw new Error("Quote, holdings or purchase history changed. Recalculate the withdrawal.");
            } else {
              checkWithdrawalOrder(trade, strict || vaultConfig.breakEvenOnly || vaultConfig.preferBreakEven);
            }
            await postTradeAsync(trade.symbol, trade.shares, "sellShares");
            updateRowState(trade.index, "completed", trade.value);
            updateVaultDisplay();
            currentTradeIndex++;
            if (currentTradeIndex >= tradeQueue.length) {
              $btn.prop("disabled", true).text("Completed!").css("background", "#8bc34a").css("color", "#111");
            } else {
              const nextTrade = tradeQueue[currentTradeIndex];
              $btn.prop("disabled", false).text(`Selling ${nextTrade.symbol} (${currentTradeIndex + 1}/${tradeQueue.length})`);
            }
          } catch (e) {
            console.error(`Sell failed for ${trade.symbol}:`, e);
            updateRowState(trade.index, "failed");
            $("#withdraw-progress").text(e.message || "Sale failed.");
            $btn.prop("disabled", false).text(`Selling ${trade.symbol} (${currentTradeIndex + 1}/${tradeQueue.length}) - Retry`);
          }
        });
      }
    }
    async function executeWithdrawPlan(plan) {
      const status = $("#vault-status");
      let successCount = 0;
      let failCount = 0;
      let totalCash = 0;
      for (let i = 0; i < plan.length; i++) {
        const item = plan[i];
        status.html(`<span style="color:#ffd54f;">Selling ${item.symbol}... (${i + 1}/${plan.length})</span>`);
        try {
          checkWithdrawalOrder(item, vaultConfig.breakEvenOnly || vaultConfig.preferBreakEven);
          checkGoalSale(item.symbol, item.shares);
          await new Promise((resolve, reject) => {
            $.post(
              `https://www.torn.com/page.php?sid=StockMarket&step=sellShares&rfcv=${getRFC()}`,
              { stockId: stockId[item.symbol], amount: item.shares }
            ).done(function(r) {
              try {
                if (typeof r === "string") r = JSON.parse(r);
                if (r.success) {
                  updateLocalCache(item.symbol, -item.shares);
                  successCount++;
                  totalCash += item.value * 0.999;
                  resolve();
                } else {
                  failCount++;
                  console.error(`Sell failed for ${item.symbol}:`, r.text);
                  resolve();
                }
              } catch (e) {
                successCount++;
                totalCash += item.value * 0.999;
                resolve();
              }
            }).fail(function() {
              failCount++;
              resolve();
            });
          });
          if (i < plan.length - 1) {
            await new Promise((r) => setTimeout(r, 300));
          }
        } catch (e) {
          failCount++;
          console.error(`Error selling ${item.symbol}:`, e);
        }
      }
      updateVaultDisplay();
      if (failCount === 0) {
        status.html(`<span style="color:#8bc34a;">Withdrawal complete! ~${formatMoney(totalCash)} received.</span>`);
      } else {
        status.html(`<span style="color:#ffb74d;">Completed with ${failCount} failed trades. ~${formatMoney(totalCash)} received.</span>`);
      }
      setTimeout(() => status.html(""), 5e3);
    }
    function openQuickBuyModal(sym) {
      const price = getPriceForTrade(sym);
      if (price <= 0) {
        const status = $("#vault-status");
        status.html('<span style="color:#ef5350;">Price error!</span>');
        return;
      }
      const currentCash = getMoneyFast();
      const maxShares = Math.floor(currentCash / price);
      const html = `
    <div class="quick-trade-container">
        <div class="quick-trade-header">
            <span class="quick-trade-symbol">${sym}</span>
            <span class="quick-trade-price">${formatMoney(price)}</span>
        </div>
        
        <div class="quick-trade-info">
            <div class="quick-trade-info-row">
                <span>Available Cash</span>
                <span style="color:#8bc34a;">${formatMoney(currentCash)}</span>
            </div>
            <div class="quick-trade-info-row">
                <span>Max Shares</span>
                <span>${maxShares.toLocaleString()}</span>
            </div>
        </div>
        
        <div class="quick-trade-input-section">
            <label class="quick-trade-label">Amount to Buy</label>
            <input type="text" id="quick-buy-input" class="alfa-input" style="width:100%;" placeholder="e.g. 100k, 1m, or share count" autofocus>
            <div class="quick-trade-hint">Enter dollar amount (100k, 1m) or share count</div>
        </div>
        
        <div class="quick-trade-calc" id="quick-buy-calc" style="display:none;">
            <div class="quick-trade-calc-row">
                <span>Shares</span>
                <span id="quick-buy-shares" style="font-weight:bold; color:#fff;">0</span>
            </div>
            <div class="quick-trade-calc-row highlight">
                <span>Total Cost</span>
                <span id="quick-buy-cost" style="font-weight:bold; color:#8bc34a;">$0</span>
            </div>
            <div id="quick-buy-warning" class="quick-trade-warning" style="display:none;"></div>
        </div>
        
        <div class="quick-trade-actions">
            <button id="quick-buy-execute" class="alfa-main-btn qb-btn-buy" disabled>Buy</button>
            <button id="quick-buy-cancel" class="alfa-main-btn qb-btn-close">Cancel</button>
        </div>
    </div>`;
      createModal(`Buy ${sym}`, html);
      const $input = $("#quick-buy-input");
      const $calc = $("#quick-buy-calc");
      const $shares = $("#quick-buy-shares");
      const $cost = $("#quick-buy-cost");
      const $warning = $("#quick-buy-warning");
      const $execute = $("#quick-buy-execute");
      $input.on("input", function() {
        const input = $(this).val().trim();
        if (!input) {
          $calc.hide();
          $execute.prop("disabled", true);
          return;
        }
        let sharesToBuy = 0;
        const parsed = parseTornNumber(input);
        if (parsed >= 1e3 && !input.match(/^\d+$/)) {
          sharesToBuy = Math.floor(parsed / price);
        } else {
          sharesToBuy = Math.floor(parsed);
        }
        if (sharesToBuy <= 0) {
          $calc.hide();
          $execute.prop("disabled", true);
          return;
        }
        const totalCost = sharesToBuy * price;
        $shares.text(sharesToBuy.toLocaleString());
        $cost.text(formatMoney(totalCost));
        $calc.show();
        if (totalCost > currentCash) {
          const short = totalCost - currentCash;
          $warning.html(`<span style="color:#ef5350;">Insufficient funds! Need ${formatMoney(short)} more.</span>`).show();
          $execute.prop("disabled", true);
        } else {
          $warning.hide();
          $execute.prop("disabled", false);
        }
      });
      $execute.on("click", async function() {
        const input = $input.val().trim();
        if (!input) return;
        let sharesToBuy = 0;
        const parsed = parseTornNumber(input);
        if (parsed >= 1e3 && !input.match(/^\d+$/)) {
          sharesToBuy = Math.floor(parsed / price);
        } else {
          sharesToBuy = Math.floor(parsed);
        }
        if (sharesToBuy <= 0) return;
        const $btn = $(this);
        $btn.prop("disabled", true).text("Buying...");
        $("#quick-buy-cancel").prop("disabled", true);
        try {
          await postTradeAsync(sym, sharesToBuy, "buyShares");
          $btn.text("Success!").css("background", "#8bc34a").css("color", "#111");
          setTimeout(() => {
            $("#alfa-modal-overlay").remove();
            updateVaultDisplay();
          }, 1e3);
        } catch (e) {
          $btn.text("Error!").css("color", "#ef5350");
          console.error("Quick buy error:", e);
          setTimeout(() => {
            $btn.text("Buy").prop("disabled", false);
            $("#quick-buy-cancel").prop("disabled", false);
          }, 2e3);
        }
      });
      $("#quick-buy-cancel").on("click", function() {
        $("#alfa-modal-overlay").remove();
      });
      $input.on("keypress", function(e) {
        if (e.which === 13 && !$execute.prop("disabled")) {
          $execute.click();
        }
      });
    }
    function openQuickSellModal(sym) {
      const breakdown = calculateVaultBreakdown();
      const stock = breakdown.find((s) => s.symbol === sym);
      if (!stock || stock.looseShares <= 0) {
        const status = $("#vault-status");
        if (stock && stock.hasSwingTrade && stock.swingProtectedShares >= stock.owned) {
          status.html('<span style="color:#ef5350;">All shares protected by swing trade!</span>');
        } else if (stock && stock.benefitLockedShares >= stock.owned) {
          status.html('<span style="color:#ef5350;">All shares reserved for a block!</span>');
        } else {
          status.html('<span style="color:#ef5350;">No loose shares to sell!</span>');
        }
        return;
      }
      const price = getPriceForTrade(sym);
      const looseValue = stock.looseShares * price;
      let protectionInfo = "";
      if (stock.hasSwingTrade || stock.benefitLockedShares > 0) {
        protectionInfo = '<div class="quick-trade-protection">';
        if (stock.hasSwingTrade) {
          protectionInfo += `<div class="quick-trade-protection-item">\u{1F6E1}\uFE0F Swing trade protected: ${stock.swingProtectedShares.toLocaleString()} shares</div>`;
        }
        if (stock.benefitLockedShares > 0) {
          protectionInfo += `<div class="quick-trade-protection-item">\u{1F512} Block reserve: ${stock.benefitLockedShares.toLocaleString()} shares</div>`;
        }
        protectionInfo += "</div>";
      }
      const html = `
    <div class="quick-trade-container">
        <div class="quick-trade-header">
            <span class="quick-trade-symbol">${sym}</span>
            <span class="quick-trade-price">${formatMoney(price)}</span>
        </div>
        
        <div class="quick-trade-info">
            <div class="quick-trade-info-row">
                <span>Available Loose Shares</span>
                <span style="color:#8bc34a;">${stock.looseShares.toLocaleString()}</span>
            </div>
            <div class="quick-trade-info-row">
                <span>Total Value</span>
                <span>${formatMoney(looseValue)}</span>
            </div>
        </div>
        
        ${protectionInfo}
        
        <div class="quick-trade-input-section">
            <label class="quick-trade-label">Amount to Sell</label>
            <input type="text" id="quick-sell-input" class="alfa-input" style="width:100%;" placeholder='e.g. "all", 50k, 1m, or share count' autofocus>
            <div class="quick-trade-hint">Enter "all", dollar amount (50k, 1m), or share count</div>
        </div>
        
        <div class="quick-trade-calc" id="quick-sell-calc" style="display:none;">
            <div class="quick-trade-calc-row">
                <span>Shares</span>
                <span id="quick-sell-shares" style="font-weight:bold; color:#fff;">0</span>
            </div>
            <div class="quick-trade-calc-row">
                <span>Gross Value</span>
                <span id="quick-sell-gross" style="font-weight:bold; color:#fff;">$0</span>
            </div>
            <div class="quick-trade-calc-row highlight">
                <span>Net Proceeds (after 0.1% fee)</span>
                <span id="quick-sell-net" style="font-weight:bold; color:#8bc34a;">$0</span>
            </div>
            <div class="quick-trade-calc-row"><span>After-fee gain/loss vs purchase</span><span class="sale-pnl">Unknown</span></div>
        </div>
        
        <div class="quick-trade-actions">
            <button id="quick-sell-execute" class="alfa-main-btn qb-btn-sell" disabled>Sell</button>
            <button id="quick-sell-cancel" class="alfa-main-btn qb-btn-close">Cancel</button>
        </div>
    </div>`;
      createModal(`Sell ${sym}`, html);
      const $input = $("#quick-sell-input");
      const $calc = $("#quick-sell-calc");
      const $shares = $("#quick-sell-shares");
      const $gross = $("#quick-sell-gross");
      const $net = $("#quick-sell-net");
      const $execute = $("#quick-sell-execute");
      $input.on("input", function() {
        const input = $(this).val().trim();
        if (!input) {
          $calc.hide();
          $execute.prop("disabled", true);
          return;
        }
        let sharesToSell = 0;
        if (input.toLowerCase() === "all") {
          sharesToSell = stock.looseShares;
        } else {
          const parsed = parseTornNumber(input);
          if (parsed >= 1e3 && !input.match(/^\d+$/)) {
            sharesToSell = Math.ceil(parsed / price);
          } else {
            sharesToSell = Math.ceil(parsed);
          }
        }
        sharesToSell = Math.min(sharesToSell, stock.looseShares);
        if (sharesToSell <= 0) {
          $calc.hide();
          $execute.prop("disabled", true);
          return;
        }
        const grossValue = sharesToSell * price;
        const netValue = grossValue * 0.999;
        $shares.text(sharesToSell.toLocaleString());
        $gross.text(formatMoney(grossValue));
        $net.text(formatMoney(netValue));
        $calc.find(".sale-pnl").text(formatSalePnl(fifoWithdrawal(sym, stock.owned, price, sharesToSell).pnl));
        $calc.show();
        $execute.prop("disabled", false);
      });
      $execute.on("click", async function() {
        const input = $input.val().trim();
        if (!input) return;
        let sharesToSell = 0;
        if (input.toLowerCase() === "all") {
          sharesToSell = stock.looseShares;
        } else {
          const parsed = parseTornNumber(input);
          if (parsed >= 1e3 && !input.match(/^\d+$/)) {
            sharesToSell = Math.ceil(parsed / price);
          } else {
            sharesToSell = Math.ceil(parsed);
          }
        }
        sharesToSell = Math.min(sharesToSell, stock.looseShares);
        if (sharesToSell <= 0) return;
        const $btn = $(this);
        $btn.prop("disabled", true).text("Selling...");
        $("#quick-sell-cancel").prop("disabled", true);
        try {
          await postTradeAsync(sym, sharesToSell, "sellShares");
          $btn.text("Success!").css("background", "#8bc34a").css("color", "#111");
          setTimeout(() => {
            $("#alfa-modal-overlay").remove();
            updateVaultDisplay();
          }, 1e3);
        } catch (e) {
          $btn.text("Error!").css("color", "#ef5350");
          console.error("Quick sell error:", e);
          setTimeout(() => {
            $btn.text("Sell").prop("disabled", false);
            $("#quick-sell-cancel").prop("disabled", false);
          }, 2e3);
        }
      });
      $("#quick-sell-cancel").on("click", function() {
        $("#alfa-modal-overlay").remove();
      });
      $input.on("keypress", function(e) {
        if (e.which === 13 && !$execute.prop("disabled")) {
          $execute.click();
        }
      });
    }
    function ensureVaultTradeViewPlacement() {
      const $main = $("#vault-main-content");
      const $trade = $("#vault-trade-view");
      if (!$trade.length || !$main.length) return;
      if ($.contains($main[0], $trade[0])) {
        $trade.detach().insertAfter($main);
      }
    }
    function closeVaultTradeView() {
      $("#vault-trade-view").empty().hide();
      $("#vault-main-content").show();
    }
    function openVaultTradeView(sym, type) {
      ensureVaultTradeViewPlacement();
      if (type === "buy") {
        openVaultBuyView(sym);
      } else {
        openVaultSellView(sym);
      }
    }
    function openVaultBuyView(sym) {
      const price = getPriceForTrade(sym);
      if (price <= 0) {
        $("#vault-status").html('<span style="color:#ef5350;">Price error!</span>');
        return;
      }
      const currentCash = getMoneyFast();
      const maxShares = Math.floor(currentCash / price);
      const html = `
    <div class="vault-trade-view-inner">
        <button id="vault-trade-back" class="alfa-mini-btn" style="border-color:#888; color:#888; margin-bottom:12px;">\u2190 Back to Vault</button>
        <div class="vault-trade-header">
            <span class="vault-trade-symbol">Buy ${sym}</span>
            <span class="vault-trade-price">${formatMoney(price)}</span>
        </div>
        <div class="quick-trade-container">
            <div class="quick-trade-info">
                <div class="quick-trade-info-row"><span>Available Cash</span><span style="color:#8bc34a;">${formatMoney(currentCash)}</span></div>
                <div class="quick-trade-info-row"><span>Max Shares</span><span>${maxShares.toLocaleString()}</span></div>
            </div>
            <div class="quick-trade-input-section">
                <label class="quick-trade-label">Amount to Buy</label>
                <input type="text" id="vault-trade-buy-input" class="alfa-input" style="width:100%;" placeholder="e.g. 100k, 1m, or share count" autofocus>
                <div class="quick-trade-hint">Enter dollar amount (100k, 1m) or share count</div>
            </div>
            <div class="quick-trade-calc" id="vault-trade-buy-calc" style="display:none;">
                <div class="quick-trade-calc-row"><span>Shares</span><span id="vault-trade-buy-shares" style="font-weight:bold; color:#fff;">0</span></div>
                <div class="quick-trade-calc-row highlight"><span>Total Cost</span><span id="vault-trade-buy-cost" style="font-weight:bold; color:#8bc34a;">$0</span></div>
                <div id="vault-trade-buy-warning" class="quick-trade-warning" style="display:none;"></div>
            </div>
            <div class="quick-trade-actions">
                <button id="vault-trade-buy-execute" class="alfa-main-btn qb-btn-buy" disabled>Buy</button>
            </div>
        </div>
    </div>`;
      $("#vault-main-content").hide();
      $("#vault-trade-view").html(html).show();
      $("#vault-trade-back").on("click", closeVaultTradeView);
      const $input = $("#vault-trade-buy-input");
      const $calc = $("#vault-trade-buy-calc");
      const $shares = $("#vault-trade-buy-shares");
      const $cost = $("#vault-trade-buy-cost");
      const $warning = $("#vault-trade-buy-warning");
      const $execute = $("#vault-trade-buy-execute");
      $input.on("input", function() {
        const input = $(this).val().trim();
        if (!input) {
          $calc.hide();
          $execute.prop("disabled", true);
          return;
        }
        let sharesToBuy = 0;
        const parsed = parseTornNumber(input);
        if (parsed >= 1e3 && !input.match(/^\d+$/)) sharesToBuy = Math.floor(parsed / price);
        else sharesToBuy = Math.floor(parsed);
        if (sharesToBuy <= 0) {
          $calc.hide();
          $execute.prop("disabled", true);
          return;
        }
        const totalCost = sharesToBuy * price;
        $shares.text(sharesToBuy.toLocaleString());
        $cost.text(formatMoney(totalCost));
        $calc.show();
        if (totalCost > currentCash) {
          $warning.html(`<span style="color:#ef5350;">Insufficient funds! Need ${formatMoney(totalCost - currentCash)} more.</span>`).show();
          $execute.prop("disabled", true);
        } else {
          $warning.hide();
          $execute.prop("disabled", false);
        }
      });
      $execute.on("click", async function() {
        const input = $input.val().trim();
        if (!input) return;
        let sharesToBuy = 0;
        const parsed = parseTornNumber(input);
        if (parsed >= 1e3 && !input.match(/^\d+$/)) sharesToBuy = Math.floor(parsed / price);
        else sharesToBuy = Math.floor(parsed);
        if (sharesToBuy <= 0) return;
        const $btn = $(this);
        $btn.prop("disabled", true).text("Buying...");
        try {
          await postTradeAsync(sym, sharesToBuy, "buyShares");
          localStorage.setItem("alfa_stocks_expanded", "true");
          $btn.text("Success!").css("background", "#8bc34a").css("color", "#111");
          closeVaultTradeView();
          updateVaultDisplay();
          setTimeout(async () => {
            await getLiquidNetworth(false);
            updateVaultDisplay();
          }, 600);
        } catch (e) {
          $btn.text("Error!").css("color", "#ef5350");
          console.error("Vault buy error:", e);
          setTimeout(() => {
            $btn.text("Buy").prop("disabled", false);
          }, 2e3);
        }
      });
      $input.on("keypress", function(e) {
        if (e.which === 13 && !$execute.prop("disabled")) $execute.click();
      });
    }
    function openVaultSellView(sym) {
      const breakdown = calculateVaultBreakdown();
      const stock = breakdown.find((s) => s.symbol === sym);
      if (!stock || stock.looseShares <= 0) {
        $("#vault-status").html(stock && stock.hasSwingTrade && stock.swingProtectedShares >= stock.owned ? '<span style="color:#ef5350;">All shares protected by swing trade!</span>' : stock && stock.benefitLockedShares >= stock.owned ? '<span style="color:#ef5350;">All shares reserved for a block!</span>' : '<span style="color:#ef5350;">No loose shares to sell!</span>');
        return;
      }
      const price = getPriceForTrade(sym);
      const looseValue = stock.looseShares * price;
      let protectionInfo = "";
      if (stock.hasSwingTrade || stock.benefitLockedShares > 0) {
        protectionInfo = '<div class="quick-trade-protection">';
        if (stock.hasSwingTrade) protectionInfo += `<div class="quick-trade-protection-item">\u{1F6E1}\uFE0F Swing trade protected: ${stock.swingProtectedShares.toLocaleString()} shares</div>`;
        if (stock.benefitLockedShares > 0) protectionInfo += `<div class="quick-trade-protection-item">\u{1F512} Block reserve: ${stock.benefitLockedShares.toLocaleString()} shares</div>`;
        protectionInfo += "</div>";
      }
      const html = `
    <div class="vault-trade-view-inner">
        <button id="vault-trade-back" class="alfa-mini-btn" style="border-color:#888; color:#888; margin-bottom:12px;">\u2190 Back to Vault</button>
        <div class="vault-trade-header">
            <span class="vault-trade-symbol">Sell ${sym}</span>
            <span class="vault-trade-price">${formatMoney(price)}</span>
        </div>
        <div class="quick-trade-container">
            <div class="quick-trade-info">
                <div class="quick-trade-info-row"><span>Available Loose Shares</span><span style="color:#8bc34a;">${stock.looseShares.toLocaleString()}</span></div>
                <div class="quick-trade-info-row"><span>Total Value</span><span>${formatMoney(looseValue)}</span></div>
            </div>
            ${protectionInfo}
            <div class="quick-trade-input-section">
                <label class="quick-trade-label">Amount to Sell</label>
                <input type="text" id="vault-trade-sell-input" class="alfa-input" style="width:100%;" placeholder='e.g. "all", 50k, 1m, or share count' autofocus>
                <div class="quick-trade-hint">Enter "all", dollar amount (50k, 1m), or share count</div>
            </div>
            <div class="quick-trade-calc" id="vault-trade-sell-calc" style="display:none;">
                <div class="quick-trade-calc-row"><span>Shares</span><span id="vault-trade-sell-shares" style="font-weight:bold; color:#fff;">0</span></div>
                <div class="quick-trade-calc-row"><span>Gross Value</span><span id="vault-trade-sell-gross" style="font-weight:bold; color:#fff;">$0</span></div>
                <div class="quick-trade-calc-row highlight"><span>Net Proceeds (after 0.1% fee)</span><span id="vault-trade-sell-net" style="font-weight:bold; color:#8bc34a;">$0</span></div>
            <div class="quick-trade-calc-row"><span>After-fee gain/loss vs purchase</span><span class="sale-pnl">Unknown</span></div>
            </div>
            <div class="quick-trade-actions">
                <button id="vault-trade-sell-execute" class="alfa-main-btn qb-btn-sell" disabled>Sell</button>
            </div>
        </div>
    </div>`;
      $("#vault-main-content").hide();
      $("#vault-trade-view").html(html).show();
      $("#vault-trade-back").on("click", closeVaultTradeView);
      const $input = $("#vault-trade-sell-input");
      const $calc = $("#vault-trade-sell-calc");
      const $shares = $("#vault-trade-sell-shares");
      const $gross = $("#vault-trade-sell-gross");
      const $net = $("#vault-trade-sell-net");
      const $execute = $("#vault-trade-sell-execute");
      $input.on("input", function() {
        const input = $(this).val().trim();
        if (!input) {
          $calc.hide();
          $execute.prop("disabled", true);
          return;
        }
        let sharesToSell = input.toLowerCase() === "all" ? stock.looseShares : 0;
        if (sharesToSell === 0) {
          const parsed = parseTornNumber(input);
          sharesToSell = parsed >= 1e3 && !input.match(/^\d+$/) ? Math.ceil(parsed / price) : Math.ceil(parsed);
        }
        sharesToSell = Math.min(sharesToSell, stock.looseShares);
        if (sharesToSell <= 0) {
          $calc.hide();
          $execute.prop("disabled", true);
          return;
        }
        const grossValue = sharesToSell * price;
        const netValue = grossValue * 0.999;
        $shares.text(sharesToSell.toLocaleString());
        $gross.text(formatMoney(grossValue));
        $net.text(formatMoney(netValue));
        $calc.find(".sale-pnl").text(formatSalePnl(fifoWithdrawal(sym, stock.owned, price, sharesToSell).pnl));
        $calc.show();
        $execute.prop("disabled", false);
      });
      $execute.on("click", async function() {
        const input = $input.val().trim();
        if (!input) return;
        let sharesToSell = input.toLowerCase() === "all" ? stock.looseShares : 0;
        if (sharesToSell === 0) {
          const parsed = parseTornNumber(input);
          sharesToSell = parsed >= 1e3 && !input.match(/^\d+$/) ? Math.ceil(parsed / price) : Math.ceil(parsed);
        }
        sharesToSell = Math.min(sharesToSell, stock.looseShares);
        if (sharesToSell <= 0) return;
        const $btn = $(this);
        $btn.prop("disabled", true).text("Selling...");
        try {
          await postTradeAsync(sym, sharesToSell, "sellShares");
          localStorage.setItem("alfa_stocks_expanded", "true");
          $btn.text("Success!").css("background", "#8bc34a").css("color", "#111");
          closeVaultTradeView();
          updateVaultDisplay();
          setTimeout(async () => {
            await getLiquidNetworth(false);
            updateVaultDisplay();
          }, 600);
        } catch (e) {
          $btn.text("Error!").css("color", "#ef5350");
          console.error("Vault sell error:", e);
          setTimeout(() => {
            $btn.text("Sell").prop("disabled", false);
          }, 2e3);
        }
      });
      $input.on("keypress", function(e) {
        if (e.which === 13 && !$execute.prop("disabled")) $execute.click();
      });
    }
    function vaultQuickBuy(sym) {
      openQuickBuyModal(sym);
    }
    function vaultQuickSell(sym) {
      openQuickSellModal(sym);
    }
    function toggleStockLock(sym) {
      if (!vaultConfig.lockedStocks) {
        vaultConfig.lockedStocks = [];
      }
      const index = vaultConfig.lockedStocks.indexOf(sym);
      if (index > -1) {
        vaultConfig.lockedStocks.splice(index, 1);
        $("#vault-status").html(`<span style="color:#81c784;">${sym} unlocked</span>`);
      } else {
        vaultConfig.lockedStocks.push(sym);
        $("#vault-status").html(`<span style="color:#ffd54f;">${sym} locked - excluded from spread/withdraw</span>`);
      }
      saveVaultConfig();
      setTimeout(() => {
        $("#vault-status").html("");
        updateVaultDisplay();
      }, 1500);
    }
    function openTransactionHistoryModal(initialPeriod = "all") {
      if (portfolioData.transactions.length === 0) {
        alert("No transaction history available. Please sync your portfolio first.");
        return;
      }
      let currentHistoryPeriod = localStorage.getItem("alfa_history_period") || initialPeriod;
      function buildHistoryContent(period) {
        const startTimestamp = getPeriodStartTimestamp(period);
        const sortedTx2 = [...portfolioData.transactions].filter((tx) => tx.timestamp >= startTimestamp).sort((a, b) => b.timestamp - a.timestamp);
        const plData2 = calculatePortfolioPL();
        const periodPL = calculatePeriodPL(period);
        const totalBuys2 = sortedTx2.filter((t) => t.type === "buy").length;
        const totalSells2 = sortedTx2.filter((t) => t.type === "sell").length;
        const totalBuyValue2 = sortedTx2.filter((t) => t.type === "buy").reduce((sum, t) => sum + t.totalValue, 0);
        const totalSellValue2 = sortedTx2.filter((t) => t.type === "sell").reduce((sum, t) => sum + t.totalValue, 0);
        const periodRealizedPL2 = periodPL.realizedPL;
        const periodFees2 = periodPL.fees;
        const stockSummary = {};
        for (const tx of sortedTx2) {
          if (!stockSummary[tx.symbol]) {
            stockSummary[tx.symbol] = { buys: 0, sells: 0, buyValue: 0, sellValue: 0, profit: 0 };
          }
          if (tx.type === "buy") {
            stockSummary[tx.symbol].buys += tx.shares;
            stockSummary[tx.symbol].buyValue += tx.totalValue;
          } else {
            stockSummary[tx.symbol].sells += tx.shares;
            stockSummary[tx.symbol].sellValue += tx.totalValue;
            stockSummary[tx.symbol].profit += stockNetProfit(tx);
          }
        }
        const stockRows3 = Object.entries(stockSummary).sort((a, b) => b[1].buyValue + b[1].sellValue - (a[1].buyValue + a[1].sellValue)).map(([sym, data]) => {
          const stockPL = plData2.perStock[sym];
          const unrealizedPL = stockPL ? stockPL.unrealizedPL : 0;
          const unrealizedColor = unrealizedPL >= 0 ? "#8bc34a" : "#ef5350";
          const realizedColor = data.profit >= 0 ? "#8bc34a" : "#ef5350";
          return `<tr>
                    <td style="font-weight:bold;">${sym}</td>
                    <td style="text-align:right;">${data.buys.toLocaleString()}</td>
                    <td style="text-align:right;">${data.sells.toLocaleString()}</td>
                    <td style="text-align:right;">${formatMoney(data.buyValue)}</td>
                    <td style="text-align:right;">${formatMoney(data.sellValue)}</td>
                    <td style="text-align:right; color:${realizedColor};">${data.profit >= 0 ? "+" : ""}${formatMoney(data.profit)}</td>
                    <td style="text-align:right; color:${unrealizedColor};">${stockPL ? (unrealizedPL >= 0 ? "+" : "") + formatMoney(unrealizedPL) : "-"}</td>
                </tr>`;
        }).join("");
        const txRows2 = sortedTx2.slice(0, 200).map((tx) => {
          const date = new Date(tx.timestamp * 1e3);
          const dateStr = date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          const typeColor = tx.type === "buy" ? "#66bb6a" : "#ef5350";
          const typeIcon = tx.type === "buy" ? "\u25B2" : "\u25BC";
          const netProfit = stockNetProfit(tx);
          const profitDisplay = tx.type === "sell" ? `<span style="color:${netProfit >= 0 ? "#8bc34a" : "#ef5350"};">${netProfit >= 0 ? "+" : ""}${formatMoney(netProfit)}</span>` : "-";
          return `<tr>
                <td style="font-size:10px; color:#888;">${dateStr}</td>
                <td style="color:${typeColor}; font-weight:bold;">${typeIcon} ${tx.type.toUpperCase()}</td>
                <td style="font-weight:bold;">${tx.symbol}</td>
                <td style="text-align:right;">${tx.shares.toLocaleString()}</td>
                <td style="text-align:right;">${formatMoney(tx.pricePerShare)}</td>
                <td style="text-align:right;">${formatMoney(tx.totalValue)}</td>
                <td style="text-align:right;">${profitDisplay}</td>
            </tr>`;
        }).join("");
        return { sortedTx: sortedTx2, totalBuys: totalBuys2, totalSells: totalSells2, totalBuyValue: totalBuyValue2, totalSellValue: totalSellValue2, periodRealizedPL: periodRealizedPL2, periodFees: periodFees2, stockRows: stockRows3, txRows: txRows2, plData: plData2 };
      }
      let contentData = buildHistoryContent(currentHistoryPeriod);
      const { sortedTx, totalBuys, totalSells, totalBuyValue, totalSellValue, periodRealizedPL, periodFees, stockRows: stockRows2, txRows, plData } = contentData;
      const html = `
    <div class="tx-history-container">
        <div class="tx-period-filter-row">
            <span class="tx-period-label">Period:</span>
            <button class="tx-period-btn ${currentHistoryPeriod === "day" ? "active" : ""}" data-period="day">Day</button>
            <button class="tx-period-btn ${currentHistoryPeriod === "week" ? "active" : ""}" data-period="week">Week</button>
            <button class="tx-period-btn ${currentHistoryPeriod === "month" ? "active" : ""}" data-period="month">Month</button>
            <button class="tx-period-btn ${currentHistoryPeriod === "ytd" ? "active" : ""}" data-period="ytd">YTD</button>
            <button class="tx-period-btn ${currentHistoryPeriod === "year" ? "active" : ""}" data-period="year">Year</button>
            <button class="tx-period-btn ${currentHistoryPeriod === "all" ? "active" : ""}" data-period="all">All</button>
        </div>
        
        <div class="tx-tabs">
            <button class="tx-tab active" data-tab="summary">Summary</button>
            <button class="tx-tab" data-tab="stocks">By Stock</button>
            <button class="tx-tab" data-tab="history">Transactions</button>
        </div>
        
        <div class="tx-tab-content" id="tab-summary">
            <div class="tx-period-badge">${getPeriodLabel(currentHistoryPeriod)}</div>
            <div class="tx-summary-grid">
                <div class="tx-summary-card">
                    <span class="tx-summary-label">Buys (${getPeriodLabel(currentHistoryPeriod)})</span>
                    <span class="tx-summary-value">${totalBuys}</span>
                    <span class="tx-summary-sub">${formatMoney(totalBuyValue)}</span>
                </div>
                <div class="tx-summary-card">
                    <span class="tx-summary-label">Sells (${getPeriodLabel(currentHistoryPeriod)})</span>
                    <span class="tx-summary-value">${totalSells}</span>
                    <span class="tx-summary-sub">${formatMoney(totalSellValue)}</span>
                </div>
                <div class="tx-summary-card ${periodRealizedPL >= 0 ? "pl-positive" : "pl-negative"}">
                    <span class="tx-summary-label">Realized P&L (${getPeriodLabel(currentHistoryPeriod)})</span>
                    <span class="tx-summary-value">${periodRealizedPL >= 0 ? "+" : ""}${formatMoney(periodRealizedPL)}</span>
                    <span class="tx-summary-sub">After 0.1% sell fees</span>
                </div>
                <div class="tx-summary-card">
                    <span class="tx-summary-label">Fees (${getPeriodLabel(currentHistoryPeriod)})</span>
                    <span class="tx-summary-value" style="color:#ff9800;">${formatMoney(periodFees)}</span>
                    <span class="tx-summary-sub">0.1% sell fee</span>
                </div>
                <div class="tx-summary-card ${plData.unrealizedPL >= 0 ? "pl-positive" : "pl-negative"}">
                    <span class="tx-summary-label">Unrealized P&L (Total)</span>
                    <span class="tx-summary-value">${plData.unrealizedPL >= 0 ? "+" : ""}${formatMoney(plData.unrealizedPL)}</span>
                    <span class="tx-summary-sub">${plData.unrealizedPLPercent >= 0 ? "+" : ""}${plData.unrealizedPLPercent.toFixed(2)}%</span>
                </div>
                <div class="tx-summary-card">
                    <span class="tx-summary-label">Cost Basis (Total)</span>
                    <span class="tx-summary-value">${formatMoney(plData.totalCostBasis)}</span>
                    <span class="tx-summary-sub">Current holdings</span>
                </div>
            </div>
        </div>
        
        <div class="tx-tab-content" id="tab-stocks" style="display:none;">
            <div style="max-height:400px; overflow-y:auto;">
                <table class="tx-table">
                    <thead>
                        <tr>
                            <th>Stock</th>
                            <th style="text-align:right;">Bought</th>
                            <th style="text-align:right;">Sold</th>
                            <th style="text-align:right;">Buy Val</th>
                            <th style="text-align:right;">Sell Val</th>
                            <th style="text-align:right;">Realized</th>
                            <th style="text-align:right;">Unrealized</th>
                        </tr>
                    </thead>
                    <tbody>${stockRows2}</tbody>
                </table>
            </div>
        </div>
        
        <div class="tx-tab-content" id="tab-history" style="display:none;">
            <div style="max-height:400px; overflow-y:auto;">
                <table class="tx-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Stock</th>
                            <th style="text-align:right;">Shares</th>
                            <th style="text-align:right;">Price</th>
                            <th style="text-align:right;">Total</th>
                            <th style="text-align:right;">P&L</th>
                        </tr>
                    </thead>
                    <tbody>${txRows}</tbody>
                </table>
            </div>
            ${sortedTx.length > 200 ? `<div style="text-align:center; padding:10px; color:#888; font-size:11px;">Showing 200 of ${sortedTx.length} transactions</div>` : `<div style="text-align:center; padding:10px; color:#888; font-size:11px;">${sortedTx.length} transactions</div>`}
        </div>
        
        <div class="tx-actions">
            <button id="tx-export-btn" class="alfa-main-btn" style="border-color:#888; color:#888;">Export CSV</button>
            <button id="tx-clear-btn" class="alfa-main-btn" style="border-color:#ef5350; color:#ef5350;">Clear Data</button>
        </div>
    </div>`;
      createModal("Transaction History & P&L", html);
      $(".tx-period-btn").on("click", function() {
        const newPeriod = $(this).data("period");
        localStorage.setItem("alfa_history_period", newPeriod);
        closeModal();
        openTransactionHistoryModal(newPeriod);
      });
      $(".tx-tab").on("click", function() {
        const tab = $(this).data("tab");
        $(".tx-tab").removeClass("active");
        $(this).addClass("active");
        $(".tx-tab-content").hide();
        $(`#tab-${tab}`).show();
      });
      $("#tx-export-btn").on("click", function() {
        exportTransactionCSV();
      });
      $("#tx-clear-btn").on("click", function() {
        if (confirm("This will clear ALL portfolio tracking data. You can re-sync at any time. Continue?")) {
          portfolioData = {
            transactions: [],
            lastSyncTimestamp: 0,
            costBasis: {},
            realizedPL: 0,
            lastFullSync: 0
          };
          savePortfolioData();
          $("#alfa-modal-overlay").remove();
          updateVaultDisplay();
        }
      });
    }
    function exportTransactionCSV() {
      if (portfolioData.transactions.length === 0) {
        alert("No transactions to export");
        return;
      }
      const headers = ["Date", "Type", "Symbol", "Shares", "Price Per Share", "Total Value", "Fees", "Profit/Loss"];
      const rows = portfolioData.transactions.map((tx) => {
        const date = new Date(tx.timestamp * 1e3).toISOString();
        return [
          date,
          tx.type.toUpperCase(),
          tx.symbol,
          tx.shares,
          tx.pricePerShare.toFixed(2),
          tx.totalValue,
          stockSellFee(tx),
          stockNetProfit(tx)
        ].join(",");
      });
      const csv = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `torn_stock_transactions_${(/* @__PURE__ */ new Date()).toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
    function createModal(title, contentHtml) {
      $("#alfa-modal-overlay").remove();
      let modal = `<div id="alfa-modal-overlay" class="alfa-modal-overlay hf-torn">
        <div class="alfa-modal"><div class="alfa-modal-header"><h3>${title}</h3><span id="alfa-modal-close" class="alfa-modal-close">&times;</span></div>
        <div class="alfa-modal-body">${contentHtml}</div></div></div>`;
      $("body").append(modal);
      $("#alfa-modal-close").on("click", function() {
        $("#alfa-modal-overlay").remove();
      });
      $("#alfa-modal-overlay").on("click", function(e) {
        if (e.target.id === "alfa-modal-overlay") $("#alfa-modal-overlay").remove();
      });
    }
    function closeModal() {
      $("#alfa-modal-overlay").remove();
    }
    function parseTornNumber(val) {
      if (typeof val !== "string") return 0;
      val = val.trim().toLowerCase();
      if (!val) return 0;
      if (val.endsWith("k")) return parseFloat(val.replace("k", "")) * 1e3;
      if (val.endsWith("m")) return parseFloat(val.replace("m", "")) * 1e6;
      if (val.endsWith("b")) return parseFloat(val.replace("b", "")) * 1e9;
      return parseFloat(val.replace(/,/g, ""));
    }
    function formatMoney(amount) {
      return "$" + amount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    function formatMoneyWhole(amount) {
      return "$" + formatCompactNumber(amount);
    }
    function getRFC() {
      var c = document.cookie.match(/rfc_v=([^;]+)/);
      return c ? c[1] : "";
    }
    function getBenefitTier(sym, shares) {
      const data = STOCK_DATA[sym];
      if (!data) return { tier: 0, next: 0, label: "Unknown" };
      if (data.type === "P") {
        return shares >= data.base ? { tier: 1, next: data.base, label: "Passive" } : { tier: 0, next: data.base, label: "None" };
      }
      if (shares < data.base) {
        return { tier: 0, next: data.base, label: "None" };
      }
      const tier = Math.floor(Math.log2(shares / data.base + 1));
      const next = data.base * (Math.pow(2, tier + 1) - 1);
      return { tier, next, label: "Tier " + tier };
    }
    async function syncWallet(silent = false) {
      let key = localStorage.getItem("alfa_vault_apikey");
      if (!key) return 0;
      if (Date.now() - lastSync < 2e3) return 0;
      lastSync = Date.now();
      if (!silent) $("#responseStock").html("Syncing...").css("color", "orange");
      try {
        const data = await tornApiFetch(`https://api.torn.com/user/?selections=money&key=${key}&ts=${Date.now()}`);
        if (data.money_onhand !== void 0) {
          let money = data.money_onhand;
          if ($("#user-money").length > 0) $("#user-money").attr("data-money", money).text("$" + money.toLocaleString());
          if (!silent) $("#responseStock").html(`Synced: $${money.toLocaleString()}`).css("color", "green");
          return money;
        }
      } catch (e) {
        if (!silent) $("#responseStock").html("Sync Failed").css("color", "red");
      }
      return 0;
    }
    function getMoneyFast() {
      let dataMoney = $("#user-money").attr("data-money");
      if (dataMoney) return parseFloat(dataMoney);
      let textMoney = $("#user-money").text();
      return textMoney ? parseTornNumber(textMoney) : 0;
    }
    function insert() {
      if ($("ul[class^='stock_']").length == 0) {
        setTimeout(insert, 500);
        return;
      }
      $("ul[class^='stock_']").each(function() {
        let sym = $("img", $(this)).attr("src").split("logos/")[1].split(".svg")[0];
        stockId[sym] = $(this).attr("id");
        stockRows[sym] = $(this);
        stocks[sym] = $(this);
      });
      buildStockIdMap();
      loadVaultConfig();
      if (portfolioData.transactions.length > 0) {
        recalculateCostBasis();
      }
      renderVaultSection();
      if (!window.__smartVaultShareCacheHooked) {
        let applyExternalStockBuy = function(sym, shares) {
          const symbol = String(sym || "").toUpperCase();
          const n = Math.floor(Number(shares) || 0);
          if (!symbol || n <= 0) return;
          updateLocalCache(symbol, n);
          updateVaultDisplay(true);
          try {
          } catch (e) {
          }
        };
        window.__smartVaultShareCacheHooked = true;
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") invalidateShareCache();
        });
        window.addEventListener("focus", () => invalidateShareCache());
        window.__smartStockVaultApplyBuy = applyExternalStockBuy;
        try {
          if (typeof unsafeWindow !== "undefined") {
            unsafeWindow.__smartStockVaultApplyBuy = applyExternalStockBuy;
          }
        } catch (e) {
        }
        document.addEventListener("smart-torn:stock-bought", (ev) => {
          const d = ev && ev.detail;
          if (!d) return;
          applyExternalStockBuy(d.symbol, d.shares);
        });
      }
    }
    function getOwnedSharesFromDom(id) {
      let row = stockRows[id];
      if (!row) return 0;
      let mobileEl = row.find("p[class^='count']");
      if (mobileEl.length > 0) return parseFloat(mobileEl.text().replace(/,/g, "")) || 0;
      let cols = row.children("div");
      if (cols.length >= 5) return parseFloat($(cols[4]).text().replace(/,/g, "")) || 0;
      return 0;
    }
    function invalidateShareCache(sym) {
      if (sym) delete localShareCache[sym];
      else localShareCache = {};
    }
    function getOwnedShares(id, opts2 = {}) {
      if (!opts2.forceDom && localShareCache[id] !== void 0) return localShareCache[id];
      const n = getOwnedSharesFromDom(id);
      localShareCache[id] = n;
      return n;
    }
    function updateLocalCache(sym, amt) {
      const current = localShareCache[sym] !== void 0 ? localShareCache[sym] : getOwnedSharesFromDom(sym);
      localShareCache[sym] = Math.max(0, current + amt);
    }
    function getSharePriceFromRow($row) {
      if (!$row || !$row.length) return 0;
      const rawId = String($row.attr("id") || "");
      const numericId = rawId.replace(/^stock_/i, "");
      if (numericId) {
        const byId = $row.find(`div.price_${numericId}`);
        if (byId.length) {
          const price = parseFloat(byId.first().text().replace(/,/g, ""));
          if (!Number.isNaN(price) && price > 0) return price;
        }
      }
      let best = 0;
      $row.find('div[class*="price_"]').each(function() {
        const cls = this.className || "";
        if (/price_change|price_diff|price_pct/i.test(cls)) return;
        const price = parseFloat($(this).text().replace(/,/g, ""));
        if (!Number.isNaN(price) && price > best) best = price;
      });
      return best;
    }
    function getPrice(id) {
      if (stockRows[id]) return getSharePriceFromRow(stockRows[id]);
      return 0;
    }
    function resolveTradeStockId(symb) {
      const raw = stockId[symb];
      if (raw) return raw;
      const numeric = SYMBOL_TO_ID[symb];
      if (numeric) return String(numeric);
      return null;
    }
    function getPriceForTrade(sym) {
      const live = getPrice(sym);
      if (live > 0) return live;
      const analysis = vaultAnalysisCache[sym];
      if (analysis && analysis.price > 0) return analysis.price;
      return 0;
    }
    async function postTradeRequest(symb, amt, step) {
      if (step === "sellShares") checkGoalSale(symb, amt);
      const tradeId = resolveTradeStockId(symb);
      if (!tradeId) throw new Error("Stock not found on page");
      const rfc = getRFC();
      const url = `https://www.torn.com/page.php?sid=StockMarket&step=${step}&rfcv=${encodeURIComponent(rfc)}`;
      const body = new URLSearchParams();
      body.set("stockId", tradeId);
      body.set("amount", String(amt));
      const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: body.toString()
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        const snippet = String(text || "").replace(/\s+/g, " ").trim().slice(0, 140);
        throw new Error(
          "Invalid response from Torn (HTTP " + res.status + (snippet ? ": " + snippet : ", empty body") + ")"
        );
      }
      if (!data.success) {
        throw new Error(data.message || data.text || "Trade failed");
      }
      return data;
    }
    function getDailyYield(sym) {
      let b = ADVISOR_DATA[sym];
      if (!b) return 0;
      let val = 0;
      if (b.type === "cash") val = b.val;
      else if (b.type === "item") val = itemPrices[b.id] || 0;
      else if (b.type === "manual") val = itemPrices["HRG_AVG"] || 0;
      else if (b.type === "average") {
        let t = 0, c = 0;
        for (let cid of b.ids) {
          let p = itemPrices[cid] || 0;
          if (p > 0) {
            t += p;
            c++;
          }
        }
        val = c > 0 ? t / c : 0;
      }
      return val > 0 && b.freq ? val / b.freq : 0;
    }
    async function getLiquidNetworth(fastMode = false) {
      if (fastMode && lastNwCache && Date.now() - lastNwCache.fetchedAt < 60000) return lastNwCache;
      let key = localStorage.getItem("alfa_vault_apikey");
      if (!key) return lastNwCache || { liquid: 0, pureCash: 0, wallet: 0, dailyBank: 0, bankActive: false, bankPrincipal: 0 };
      try {
        const data = await tornApiFetch(`https://api.torn.com/v2/user/money?key=${key}`);
        if (!data.money) return lastNwCache || { liquid: 0, pureCash: 0, wallet: 0, dailyBank: 0, bankActive: false, bankPrincipal: 0 };
        let m = data.money, dailyBank = 0, bankActive = false, bankPrincipal = 0;
        if (m.city_bank && m.city_bank.amount > 0) {
          bankPrincipal = m.city_bank.amount;
          const bank = m.city_bank;
          dailyBank = Number.isFinite(bank.profit) && bank.duration > 0 ? bank.profit / bank.duration : null;
          if (bank.until > 0 && bank.until <= Date.now() / 1000) dailyBank = 0;
          bankActive = true;
        }
        let pureCash = m.wallet || 0;
        if (networthSettings.sources.points && m.points > 0) pureCash += m.points * (itemPrices["points"] || 45e3);
        const wallet = m.wallet || 0;
        lastNwCache = { liquid: 0, pureCash, wallet, dailyBank, bankActive, bankPrincipal, fetchedAt: Date.now(), bankRate: Number.isFinite(m.city_bank?.interest_rate) ? m.city_bank.interest_rate : null, nwFromApi: true };
        return lastNwCache;
      } catch (e) {
        console.error("NW Error", e);
        return lastNwCache || { liquid: 0, pureCash: 0, wallet: 0, dailyBank: 0, bankActive: false, bankPrincipal: 0 };
      }
    }
    async function fetchUserPortfolio() {
      let key = localStorage.getItem("alfa_vault_apikey");
      if (!key) return;
      try {
        const data = await tornApiFetch(`https://api.torn.com/user/?selections=stocks&key=${key}&ts=${Date.now()}`);
        if (data.stocks) {
          let idToSym = {};
          for (let [sym, domId] of Object.entries(stockId)) {
            idToSym[domId.replace("stock_", "")] = sym;
          }
          for (let [sID, sData] of Object.entries(data.stocks)) {
            let sym = idToSym[sID];
            if (sym) localShareCache[sym] = sData.total_shares || 0;
          }
          for (let sym of Object.keys(stockRows)) {
            localShareCache[sym] = getOwnedSharesFromDom(sym);
          }
        }
      } catch (e) {
        console.error("Portfolio Sync Error", e);
      }
    }
    async function sellSmart(sym, shares) {
      let price = getPrice(sym);
      if (price <= 0) {
        alert("Price error.");
        return;
      }
      let confirmMsg = "";
      if ($("#alfa-lock-toggle").is(":checked")) {
        let owned = getOwnedShares(sym);
        let future = getBenefitTier(sym, owned - shares);
        let current = getBenefitTier(sym, owned);
        if (future.tier < current.tier) {
          confirmMsg = `WARNING: Selling this will drop your Block Tier!

`;
        }
      }
      let totalCash = formatMoney(shares * price);
      confirmMsg += `Sell ${shares.toLocaleString()} shares of ${sym} for approx ${totalCash}?`;
      if (confirm(confirmMsg)) {
        await postTrade(sym, shares, "sellShares", `Sold`);
        setTimeout(() => updateVaultDisplay(), 1e3);
      }
    }
    async function buySmart(sym, targetShares) {
      let money = await syncWallet(true);
      let price = getPrice(sym);
      if (price <= 0) {
        alert("Price error.");
        return;
      }
      let maxAffordable = Math.floor(money / price);
      let sharesToBuy = Math.min(maxAffordable, targetShares);
      if (sharesToBuy <= 0) {
        alert("Not enough cash!");
        return;
      }
      let totalCost = formatMoney(sharesToBuy * price);
      if (confirm(`Invest ${totalCost} to buy ${sharesToBuy.toLocaleString()} shares of ${sym}?`)) {
        await postTrade(sym, sharesToBuy, "buyShares", `Invested`);
        setTimeout(() => updateVaultDisplay(), 1e3);
      }
    }
    function postTrade(symb, amt, step, msg) {
      postTradeRequest(symb, amt, step).then(() => {
        updateLocalCache(symb, step === "buyShares" ? amt : -amt);
        updateVaultDisplay();
        setTimeout(async () => {
          await getLiquidNetworth(false);
          updateVaultDisplay();
        }, 600);
      }).catch((e) => console.log("Trade error", e));
    }
    async function postTradeAsync(symb, amt, step) {
      await postTradeRequest(symb, amt, step);
      updateLocalCache(symb, step === "buyShares" ? amt : -amt);
      return { success: true, symbol: symb, amount: amt, step };
    }
    async function fetchBankRates() {
      let key = localStorage.getItem("alfa_vault_apikey");
      if (!key) {
        alert("API Key missing");
        return;
      }
      const fetchBtn = $("#settings-fetch-bank, #adv-fetch-bank");
      fetchBtn.text("Fetching...");
      try {
        const dataRates = await tornApiFetch(`https://api.torn.com/v2/torn?selections=bank&key=${key}`);
        const dataPerks = await tornApiFetch(`https://api.torn.com/user/?selections=perks&key=${key}`);
        if (dataRates.error) throw new Error(dataRates.error.error);
        const parseInterest = (list) => {
          if (!list || !Array.isArray(list)) return 0;
          let bonus = 0;
          list.forEach((str) => {
            if (str.toLowerCase().includes("bank interest")) {
              let match = str.match(/(\d+(?:\.\d+)?)%/);
              if (match) bonus += parseFloat(match[1]);
            }
          });
          return bonus;
        };
        let totalBonus = 0;
        totalBonus += parseInterest(dataPerks.merit_perks);
        totalBonus += parseInterest(dataPerks.faction_perks);
        totalBonus += parseInterest(dataPerks.job_perks);
        totalBonus += parseInterest(dataPerks.property_perks);
        totalBonus += parseInterest(dataPerks.stock_perks);
        totalBonus += parseInterest(dataPerks.education_perks);
        totalBonus += parseInterest(dataPerks.book_perks);
        let multi = 1 + totalBonus / 100;
        let bankData = dataRates.bank;
        if (bankData) {
          ["1w", "2w", "1m", "2m", "3m"].forEach((term) => {
            if (bankData[term]) {
              let baseApr = parseFloat(bankData[term]);
              let finalApr = baseApr * multi;
              $(`#bank-${term}`).val(finalApr.toFixed(2)).trigger("change");
              bankSettings["roi_" + term] = finalApr;
            }
          });
          localStorage.setItem("alfa_advisor_bank", JSON.stringify(bankSettings));
          fetchBtn.text("Updated!");
        } else {
          fetchBtn.text("No Data");
        }
      } catch (e) {
        console.error("Bank Fetch Error:", e);
        fetchBtn.text("Error");
      }
      setTimeout(() => fetchBtn.text("Fetch Rates (API)"), 2e3);
    }
    function startVaultApp() {
      opts.registerSettings?.(openSettingsModal);
      insert();
    }
    function whenReady() {
      const jq = resolveJQuery();
      if (!jq) {
        return false;
      }
      $ = jq;
      return jq(MOUNT_SELECTOR).length > 0;
    }
    const deadline = Date.now() + 3e4;
    const tick = () => {
      if (whenReady()) {
        startVaultApp();
        return;
      }
      if (Date.now() > deadline) {
        console.error("[Smart Stock Vault] jQuery or panel mount not ready after 30s");
        return;
      }
      window.setTimeout(tick, 50);
    };
    tick();
  }

  // src/stocks/legacy-styles.js
  var LEGACY_STYLES = `
.alfa-card-head { cursor: pointer; user-select: none; } .alfa-card-head:hover .alfa-card-title { color: #fff; }
.alfa-card-details { display: none; margin-top: 10px; padding-top: 8px; border-top: 1px dashed #444; font-size: 11px; color: #ccc; }
.alfa-detail-row { display: flex; justify-content: space-between; padding: 2px 0; }
.alfa-detail-sub { color: #888; padding-left: 8px; }
.alfa-detail-total { border-top: 1px solid #333; margin-top: 4px; padding-top: 4px; font-weight: bold; color: #8bc34a; }
.alfa-detail-miss { border-top: 1px solid #333; margin-top: 4px; padding-top: 4px; font-weight: bold; color: #ef5350; }
.alfa-hero { cursor: pointer; transition: background 0.2s; background: linear-gradient(135deg, #2a2a2a 0%, #222 100%); border: 1px solid #333; border-radius: 8px; padding: 20px; text-align: center; position: relative; }
.alfa-hero:hover { border-color: var(--hf-accent, #caa14a); }
.alfa-breakdown { display: none; margin-top: 15px; border-top: 1px solid #444; padding-top: 10px; text-align: left; }
.alfa-break-row { display: flex; flex-direction: column; font-size: 11px; padding: 6px 0; border-bottom: 1px solid #222; color: #ccc; }
.alfa-break-row:last-child { border-bottom: none; }
.alfa-break-val { color: #8bc34a; font-weight: bold; }
.alfa-caret { float: right; transition: transform 0.3s; font-size: 10px; color: #666; }
.alfa-expanded .alfa-caret { transform: rotate(180deg); }
.alfa-header { display: flex; justify-content: space-between; align-items: center; width: 100%; gap: 10px; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 10px; }
.alfa-toolbar { display: flex; justify-content: space-between; align-items: center; width: 100%; margin-top: 5px; font-size: 11px; color: #888; }
.alfa-small-label { display: flex; align-items: center; gap: 4px; cursor: pointer; user-select: none; } .alfa-small-label:hover { color: #fff; }
.alfa-advisor-btn { background: #2a4040; border: 1px solid var(--hf-accent, #caa14a); color: #fff; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: bold; cursor: pointer; text-decoration: none; }
.alfa-advisor-btn:hover { background: var(--hf-accent, #caa14a); }
.alfa-input, .alfa-select { background: #333; color: #fff; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; height: 28px; box-sizing: border-box; }
.alfa-input { width: 130px; } .alfa-select { width: 150px; line-height: 20px; } .alfa-input:focus, .alfa-select:focus { border-color: var(--hf-accent, #caa14a); outline: none; }
textarea.alfa-input { height: auto; min-height: 60px; }
.journal-notes-textarea { width: 100% !important; min-height: 80px; box-sizing: border-box; }
.alfa-link { cursor: pointer; color: var(--hf-accent, #caa14a); text-decoration: underline; margin-left: auto; } .alfa-link:hover { color: #fff; }
.alfa-modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); z-index: 99999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(4px); }
.alfa-modal { background: #1e1e1e; width: 600px; max-width: 95%; border: 1px solid #333; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.9); display: flex; flex-direction: column; overflow: hidden; animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.alfa-modal-header { background: #252525; padding: 15px 20px; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }
.alfa-modal-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #fff; letter-spacing: 0.5px; }
.alfa-modal-close { cursor: pointer; font-size: 24px; color: #666; transition: color 0.2s; } .alfa-modal-close:hover { color: #fff; }
.alfa-modal-body { padding: 20px; color: #ccc; overflow-y: auto; max-height: 80vh; }
.alfa-dashboard { display: flex; flex-direction: column; gap: 20px; }
.alfa-hero-label { font-size: 11px; text-transform: uppercase; color: #888; letter-spacing: 1px; margin-bottom: 5px; }
.alfa-hero-val { font-size: 28px; font-weight: 700; color: #8bc34a; text-shadow: 0 2px 4px rgba(0,0,0,0.3); }
.alfa-hero-sub { font-size: 12px; color: #666; margin-top: 5px; }
.alfa-grid-section { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
.alfa-card { background: #252525; border: 1px solid #333; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; transition: transform 0.2s; } .alfa-card:hover { border-color: #444; transform: translateY(-2px); }
.alfa-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 8px; }
.alfa-card-title { font-size: 11px; font-weight: bold; color: #aaa; text-transform: uppercase; }
.alfa-card-roi { font-size: 18px; font-weight: bold; color: var(--hf-accent, #caa14a); }
.alfa-card-body { flex-grow: 1; display: flex; flex-direction: column; gap: 4px; }
.alfa-stock-name { font-size: 14px; font-weight: bold; color: #fff; }
.alfa-stock-cost { font-size: 12px; color: #888; }
.alfa-stock-gain { font-size: 12px; color: #8bc34a; margin-top: auto; padding-top: 10px; display: flex; align-items: center; gap: 5px; } .alfa-stock-gain::before { content: "\u25B2"; font-size: 8px; margin-right: 4px; }
.alfa-actions { display: flex; gap: 10px; border-top: 1px solid #333; padding-top: 20px; margin-top: 10px; }
.alfa-btn-main { flex: 1; background: #333; color: #fff; border: 1px solid #444; padding: 10px; border-radius: 6px; cursor: pointer; font-weight: bold; transition: all 0.2s; text-align: center; } .alfa-btn-main:hover { background: #444; border-color: var(--hf-accent, #caa14a); }
.alfa-settings-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.alfa-table { width: 100%; border-collapse: separate; border-spacing: 0; font-size: 12px; }
.alfa-table th { text-align: left; padding: 8px; color: #888; border-bottom: 1px solid #444; }
.alfa-table td { padding: 8px; border-bottom: 1px solid #333; }
.alfa-check-list { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; max-height: 200px; overflow-y: auto; background: #151515; padding: 10px; border-radius: 6px; border: 1px solid #333; }
.alfa-check-label { display: flex; align-items: center; gap: 8px; color: #ccc; cursor: pointer; font-size: 11px; } .alfa-check-label:hover { color: #fff; }
.alfa-tbl-input { width: 100%; background: #222; border: 1px solid #444; color: #fff; padding: 4px; text-align: right; border-radius: 4px; box-sizing: border-box; }
.alfa-shortage { color: #ef5350; font-weight: bold; }
.alfa-main-btn { background: #333; color: #ddd; border: 1px solid #555; border-radius: 4px; padding: 0 15px; height: 28px; font-size: 12px; font-weight: bold; cursor: pointer; transition: all 0.2s; } .alfa-main-btn:hover { background: #444; border-color: var(--hf-accent, #caa14a); color: #fff; }
.alfa-mini-btn { background: transparent; border: 1px solid #ef5350; color: #ef5350; font-size: 9px; padding: 1px 6px; border-radius: 3px; cursor: pointer; margin-left: 8px; text-transform: uppercase; }
.alfa-mini-btn:hover { background: #ef5350; color: #fff; }
#vault-trade-back.alfa-mini-btn:hover { background: var(--hf-accent, #caa14a); border-color: var(--hf-accent, #caa14a); color: #fff; }
.alfa-invest-btn { width: 100%; background: #2a4040; border: 1px solid var(--hf-accent, #caa14a); color: #fff; padding: 6px; margin-top: 8px; font-size: 11px; font-weight: bold; cursor: pointer; border-radius: 4px; }
.alfa-invest-btn:hover { background: var(--hf-accent, #caa14a); }
/* --- DIAGNOSTIC TOOL CSS --- */
.sim-row { transition: background 0.2s; }
.sim-row:hover { background: rgba(255,255,255,0.05) !important; }
/* Ensure inputs in the modal look right */
.alfa-tbl-input { background: #111; border: 1px solid #444; color: #fff; padding: 4px; border-radius: 4px; }
/* --- MULTI-STOCK VAULT CSS --- */
.alfa-vault-section { background: #111; padding: 12px; border: 1px solid #333; border-radius: 8px; margin-bottom: 15px; color: #ccc; font-family: Arial, sans-serif; font-size: 12px; }
.alfa-vault-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.alfa-vault-api-row { display: flex; gap: 10px; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #333; }
.alfa-vault-title { font-size: 14px; font-weight: bold; color: var(--hf-accent, #caa14a); }
.alfa-vault-actions { display: flex; gap: 5px; }
.alfa-vault-empty { text-align: center; padding: 20px; color: #888; }
.alfa-vault-summary { display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1a2a2a 0%, #151515 100%); padding: 12px; border-radius: 6px; margin-bottom: 12px; }
.alfa-vault-total-label { font-size: 10px; text-transform: uppercase; color: #888; display: block; margin-bottom: 2px; }
.alfa-vault-total-value { font-size: 20px; font-weight: bold; color: #8bc34a; }
.alfa-vault-meta { font-size: 11px; color: #666; }
.alfa-vault-breakdown { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; max-height: 200px; overflow-y: auto; }
.vault-stock-row { background: #1a1a1a; padding: 8px 10px; border-radius: 4px; border: 1px solid #252525; transition: border-color 0.2s; }
.vault-stock-row:hover { border-color: #444; }
.vault-stock-info { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
.vault-stock-name { font-weight: bold; color: #fff; min-width: 35px; }
.vault-swing-badge { font-size: 10px; cursor: help; }
.vault-stock-value { color: #8bc34a; font-weight: bold; }
.vault-stock-pct { color: #666; font-size: 10px; }
.vault-signal-badge { font-size: 9px; padding: 1px 5px; border-radius: 3px; border: 1px solid; font-weight: bold; }
.vault-stock-bar-container { height: 6px; background: #252525; border-radius: 3px; overflow: hidden; margin-bottom: 4px; }
.vault-stock-bar { height: 100%; background: linear-gradient(90deg, var(--hf-accent, #caa14a), #4a7a7a); border-radius: 3px; position: relative; min-width: 2px; transition: width 0.3s; }
.vault-stock-bar-loose { position: absolute; right: 0; top: 0; height: 100%; background: rgba(139, 195, 74, 0.5); }
.vault-stock-details { display: flex; gap: 10px; font-size: 10px; }
.vault-dip-neg { color: #ef5350; }
.vault-dip-pos { color: #8bc34a; }
.vault-rsi { color: #888; }
.vault-rsi.oversold { color: #66bb6a; font-weight: bold; }
.vault-rsi.overbought { color: #ef5350; font-weight: bold; }
.vault-loose { color: #81c784; }
.alfa-vault-controls { display: flex; flex-wrap: wrap; gap: 15px; justify-content: space-between; padding: 10px 0; border-top: 1px solid #333; margin-bottom: 8px; }
.alfa-vault-control-group { display: flex; gap: 5px; align-items: center; }
@media (max-width: 600px) {
    .alfa-vault-controls { flex-direction: column; align-items: stretch; gap: 10px; }
    .alfa-vault-control-group { justify-content: flex-start; flex-wrap: wrap; }
    .alfa-vault-control-group:last-child { flex-wrap: wrap; }
    #vault-withdraw-amt { flex: 1; min-width: 60px; max-width: 120px; }
}
.alfa-vault-options { display: flex; gap: 20px; padding: 8px 0; border-bottom: 1px solid #333; margin-bottom: 10px; }
.vault-option-label { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #888; cursor: pointer; }
.vault-option-label:hover { color: #fff; }
.vault-option-label input:checked + span { color: #8bc34a; }
.vault-spread-btn { border-color: #66bb6a !important; color: #66bb6a !important; }
.vault-spread-btn:hover { background: #66bb6a !important; color: #111 !important; }
.vault-withdraw-btn { border-color: #ef5350 !important; color: #ef5350 !important; }
.vault-withdraw-btn:hover { background: #ef5350 !important; color: #fff !important; }
/* --- SETTINGS MODAL CSS --- */
.settings-tabs { display: flex; gap: 5px; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px; }
.settings-tab { background: transparent; border: 1px solid #444; color: #888; padding: 8px 16px; border-radius: 4px 4px 0 0; cursor: pointer; font-size: 11px; text-transform: uppercase; transition: all 0.2s; }
.settings-tab:hover { color: #fff; border-color: var(--hf-accent, #caa14a); }
.settings-tab.active { background: var(--hf-accent, #caa14a); color: #fff; border-color: var(--hf-accent, #caa14a); }
.settings-content { min-height: 300px; }
.settings-tab-content { animation: fadeIn 0.2s ease-out; }
.settings-section { background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
.settings-section-title { font-size: 11px; font-weight: bold; color: var(--hf-accent, #caa14a); text-transform: uppercase; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
.settings-stock-count { font-size: 10px; color: #888; font-weight: normal; }
.settings-row { display: flex; gap: 10px; }
.settings-warning { background: #2a2a20; border: 1px solid #666633; border-radius: 4px; padding: 10px; font-size: 11px; color: #ffd54f; margin-top: 10px; }
.settings-api-status { text-align: center; font-size: 11px; padding: 8px; background: #151515; border-radius: 4px; }
.settings-checkbox-label { display: flex; align-items: flex-start; gap: 10px; padding: 8px; background: #151515; border-radius: 4px; margin-bottom: 8px; cursor: pointer; font-size: 11px; color: #ccc; }
.settings-checkbox-label:hover { background: #1a1a1a; }
.settings-checkbox-label input[type="checkbox"] { margin-top: 2px; }
.settings-checkbox-label strong { color: #fff; }
.settings-note { font-size: 10px; color: #666; margin-bottom: 8px; }
.settings-exclude-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 5px; max-height: 150px; overflow-y: auto; background: #151515; padding: 10px; border-radius: 4px; }
.settings-exclude-item { display: flex; align-items: center; gap: 5px; font-size: 10px; color: #888; cursor: pointer; }
.settings-exclude-item:hover { color: #fff; }
.settings-bank-inputs { display: flex; flex-direction: column; gap: 6px; }
.settings-actions { display: flex; gap: 10px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #333; }
/* --- DAILY INCOME ROW CSS --- */
.alfa-vault-income-row { display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: linear-gradient(135deg, #1a2520 0%, #151515 100%); border-radius: 6px; margin-bottom: 12px; font-size: 12px; }
.vault-income-icon { font-size: 14px; }
.vault-income-label { color: #888; }
.vault-income-value { color: #8bc34a; font-weight: bold; }
.vault-income-sep { color: #444; margin: 0 4px; }
.vault-income-bank { color: var(--hf-accent, #caa14a); font-size: 11px; }
/* --- BLOCK PROGRESS INDICATOR CSS --- */
/* Block Icon Styles */
.vault-block-icon { position: relative; display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; cursor: pointer; transition: all 0.2s; margin: 0 2px; }
.vault-block-icon .block-icon-shape { font-size: 18px; transition: all 0.2s; }
.vault-block-icon .block-tier-num { position: absolute; font-size: 8px; font-weight: bold; color: #fff; text-shadow: 0 0 2px #000; }
.vault-block-icon.no-block .block-icon-shape { color: #444; opacity: 0.5; }
.vault-block-icon.has-tier .block-icon-shape { color: var(--hf-accent, #caa14a); opacity: 1; }
.vault-block-icon.has-tier.close .block-icon-shape { color: #ffd54f; }
.vault-block-icon.close .block-icon-shape { color: #ffd54f; opacity: 0.8; }
.vault-block-icon.can-afford .block-icon-shape { color: #8bc34a; animation: blockIconPulse 1.5s ease-in-out infinite; }
.vault-block-icon.maxed .block-icon-shape { color: #8bc34a; opacity: 1; }
@keyframes blockIconPulse { 0%, 100% { filter: drop-shadow(0 0 4px rgba(139, 195, 74, 0.6)); transform: scale(1); } 50% { filter: drop-shadow(0 0 8px rgba(139, 195, 74, 0.9)); transform: scale(1.1); } }
.vault-block-icon:hover .block-icon-shape { transform: scale(1.15); }
.vault-block-progress { height: 3px; background: #252525; border-radius: 2px; margin: 2px 0 4px 0; overflow: hidden; }
.vault-block-progress-fill { height: 100%; background: linear-gradient(90deg, #444, var(--hf-accent, #caa14a)); border-radius: 2px; transition: width 0.3s; }
.vault-block-progress-fill.close { background: linear-gradient(90deg, #ffd54f, #ffb300); }
/* --- QUICK BLOCK MODAL CSS --- */
.quick-block-container { display: flex; flex-direction: column; gap: 15px; }
.quick-block-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #333; }
.quick-block-symbol { font-size: 24px; font-weight: bold; color: #fff; }
.quick-block-type { font-size: 11px; color: #888; text-transform: uppercase; background: #252525; padding: 4px 8px; border-radius: 4px; }
.quick-block-status { display: flex; align-items: center; justify-content: center; gap: 20px; padding: 15px; background: #1a1a1a; border-radius: 8px; }
.quick-block-current, .quick-block-next { text-align: center; }
.quick-block-label { display: block; font-size: 10px; color: #666; text-transform: uppercase; margin-bottom: 4px; }
.quick-block-value { font-size: 16px; font-weight: bold; color: var(--hf-accent, #caa14a); }
.quick-block-value.maxed { color: #8bc34a; }
.quick-block-arrow { font-size: 20px; color: #444; }
.quick-block-progress-section { background: #151515; padding: 12px; border-radius: 6px; }
.quick-block-progress-header { display: flex; justify-content: space-between; font-size: 11px; color: #888; margin-bottom: 8px; }
.quick-block-progress-bar { height: 8px; background: #252525; border-radius: 4px; overflow: hidden; }
.quick-block-progress-fill { height: 100%; background: linear-gradient(90deg, var(--hf-accent, #caa14a), #4a7a7a); border-radius: 4px; transition: width 0.3s; }
.quick-block-progress-fill.close { background: linear-gradient(90deg, #ffd54f, #ffb300); }
.quick-block-shares { text-align: center; font-size: 11px; color: #666; margin-top: 8px; }
.quick-block-details { background: #1a1a1a; padding: 12px; border-radius: 6px; }
.quick-block-detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #ccc; border-bottom: 1px solid #252525; }
.quick-block-detail-row:last-child { border-bottom: none; }
.quick-block-detail-row.highlight { background: #1a2a1a; margin: 0 -12px; padding: 8px 12px; font-weight: bold; color: #fff; }
.quick-block-afford { text-align: center; font-size: 12px; padding: 10px; background: #151515; border-radius: 6px; }
.quick-block-actions { display: flex; gap: 10px; margin-top: 5px; }
.qb-btn-buy { flex: 1; border-color: #8bc34a !important; color: #8bc34a !important; }
.qb-btn-buy:disabled { border-color: #444 !important; color: #666 !important; }
.qb-btn-rebalance { flex: 1; border-color: #ffd54f !important; color: #ffd54f !important; }
.qb-btn-rebalance:disabled { border-color: #444 !important; color: #666 !important; }
.qb-btn-close { flex: 0 0 80px; background: #333 !important; border-color: #555 !important; color: #888 !important; }
.quick-block-rebalance-info { background: linear-gradient(135deg, #2a2a1a 0%, #1a1a15 100%); border: 1px solid #554422; border-radius: 6px; padding: 12px; }
.qb-rebalance-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; font-size: 12px; font-weight: bold; color: #ffd54f; }
.qb-rebalance-total { font-size: 11px; color: #fff; background: #332211; padding: 2px 8px; border-radius: 4px; }
.qb-rebalance-detail { font-size: 10px; color: #888; margin-bottom: 8px; }
.qb-rebalance-funds { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 11px; color: #ccc; background: #1a1a1a; padding: 8px; border-radius: 4px; }
.alfa-vault-status { text-align: center; font-size: 11px; padding: 5px 0; min-height: 18px; }

/* --- VAULT CONFIG MODAL CSS --- */
.vault-config-container { display: flex; flex-direction: column; gap: 15px; }
.vault-config-section { background: #1a1a1a; border-radius: 6px; padding: 12px; }
.vault-config-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.vault-config-title { font-size: 11px; font-weight: bold; color: #888; text-transform: uppercase; }
.vault-stock-count { font-size: 11px; color: var(--hf-accent, #caa14a); }
.vault-stock-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; max-height: 200px; overflow-y: auto; padding: 5px; background: #111; border-radius: 4px; }
.vault-stock-option { display: flex; align-items: center; gap: 5px; padding: 5px 8px; background: #1a1a1a; border: 1px solid #333; border-radius: 4px; cursor: pointer; transition: all 0.15s; }
.vault-stock-option:hover { border-color: #555; }
.vault-stock-option.selected { border-color: var(--hf-accent, #caa14a); background: var(--hf-accent, #caa14a)15; }
.vault-stock-option input { display: none; }
.vault-stock-sym { font-weight: bold; color: #fff; font-size: 11px; }
.vault-stock-type { font-size: 9px; color: #666; }
.vault-quick-actions { display: flex; gap: 8px; margin-top: 10px; justify-content: flex-end; }
.vault-config-row { display: flex; gap: 15px; }
.vault-strategy-desc { font-size: 10px; color: #666; margin-top: 6px; line-height: 1.3; }
.vault-config-actions { display: flex; gap: 10px; padding-top: 10px; border-top: 1px solid #333; }

/* --- VAULT ACTION BUTTONS CSS --- */
.vault-stock-actions { display: flex; gap: 4px; margin-left: auto; }
.vault-action-btn { background: transparent; border: 1px solid #444; color: #888; font-size: 9px; padding: 2px 6px; border-radius: 3px; cursor: pointer; transition: all 0.15s; }
.vault-action-btn:hover:not(:disabled) { border-color: var(--hf-accent, #caa14a); color: #fff; }
.vault-action-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.vault-quick-buy:hover:not(:disabled) { border-color: #66bb6a; color: #66bb6a; }
.vault-quick-sell:hover:not(:disabled) { border-color: #ef5350; color: #ef5350; }
.vault-toggle-lock { font-size: 11px; padding: 1px 5px; }
.vault-toggle-lock.locked { border-color: #ffd54f; background: #ffd54f22; }
.vault-row-locked { border-color: #ffd54f44 !important; background: linear-gradient(90deg, #ffd54f08 0%, #1a1a1a 30%) !important; }
.vault-row-locked .vault-stock-name::after { content: ' \u{1F512}'; font-size: 9px; }


/* --- ANALYZE & REBALANCE BUTTON CSS --- */
.vault-analyze-btn { border-color: var(--hf-accent, #caa14a) !important; color: var(--hf-accent, #caa14a) !important; }
.vault-analyze-btn:hover { background: var(--hf-accent, #caa14a) !important; color: #fff !important; }
.vault-rebalance-btn { border-color: var(--hf-accent, #caa14a) !important; color: var(--hf-accent, #caa14a) !important; }
.vault-rebalance-btn:hover { background: var(--hf-accent, #caa14a) !important; color: #fff !important; }
.rebal-container { display: flex; flex-direction: column; gap: 15px; }
.rebal-summary { display: flex; justify-content: space-around; background: #1a1a1a; padding: 12px; border-radius: 6px; }
.rebal-summary-item { text-align: center; }
.rebal-summary-label { display: block; font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
.rebal-summary-value { font-size: 14px; font-weight: bold; color: #fff; text-transform: capitalize; }
.rebal-section { background: #151515; border-radius: 6px; padding: 10px; }
.rebal-section-header { font-size: 12px; font-weight: bold; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #333; }
.rebal-table { display: flex; flex-direction: column; gap: 4px; max-height: 150px; overflow-y: auto; }
.rebal-row { display: flex; align-items: center; padding: 4px 8px; background: #1a1a1a; border-radius: 4px; font-size: 11px; gap: 8px; }
.rebal-row-executing { background: #2a2a1a; border: 1px solid #554422; }
.rebal-row-completed { background: #1a2a1a; opacity: 0.7; }
.rebal-row-failed { background: #2a1a1a; border: 1px solid #554422; }
.rebal-action-btn { background: #333; color: #fff; border: 1px solid #555; border-radius: 4px; padding: 2px 10px; font-size: 10px; font-weight: bold; cursor: pointer; transition: all 0.2s; min-width: 50px; }
.rebal-action-btn:hover:not(:disabled) { background: #444; border-color: var(--hf-accent, #caa14a); }
.rebal-action-btn:disabled { opacity: 0.5; cursor: not-allowed; }
.rebal-action-btn[data-type="sell"] { border-color: #ef5350; color: #ef5350; }
.rebal-action-btn[data-type="sell"]:hover:not(:disabled) { background: #ef5350; color: #fff; }
.rebal-action-btn[data-type="buy"] { border-color: #66bb6a; color: #66bb6a; }
.rebal-action-btn[data-type="buy"]:hover:not(:disabled) { background: #66bb6a; color: #fff; }
.rebal-sym { font-weight: bold; color: #fff; min-width: 40px; }
.rebal-signal { font-size: 9px; min-width: 55px; text-transform: uppercase; }
.rebal-reason { font-size: 9px; color: #666; flex: 1; }
.rebal-shares { min-width: 70px; text-align: right; color: #ccc; }
.rebal-value { min-width: 60px; text-align: right; font-weight: bold; }
.rebal-subtotal { text-align: right; font-size: 12px; font-weight: bold; margin-top: 8px; padding-top: 8px; border-top: 1px dashed #333; }
.rebal-warning { font-size: 10px; color: #888; text-align: center; padding: 8px; background: #1a1a1a; border-radius: 4px; }
.rebal-actions { display: flex; gap: 10px; padding-top: 10px; border-top: 1px solid #333; }

/* --- PORTFOLIO P&L CSS --- */
.alfa-vault-pl-section { background: #151515; border: 1px solid #333; border-radius: 6px; margin-bottom: 12px; overflow: hidden; }
.vault-pl-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; cursor: pointer; transition: background 0.2s; }
.vault-pl-header:hover { background: #1a1a1a; }
.vault-pl-title { font-size: 12px; font-weight: bold; color: var(--hf-accent, #caa14a); }
.vault-pl-content { padding: 0 12px 12px; }
.vault-pl-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 10px; }
.vault-pl-item { background: #1a1a1a; padding: 10px; border-radius: 6px; text-align: center; }
.vault-pl-item.pl-positive { border-left: 3px solid #8bc34a; }
.vault-pl-item.pl-negative { border-left: 3px solid #ef5350; }
.vault-pl-label { display: block; font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
.vault-pl-value { display: block; font-size: 13px; font-weight: bold; color: #fff; }
.vault-pl-item.pl-positive .vault-pl-value { color: #8bc34a; }
.vault-pl-item.pl-negative .vault-pl-value { color: #ef5350; }
.vault-pl-actions { display: flex; gap: 8px; align-items: center; padding-top: 10px; border-top: 1px solid #333; }
.vault-pl-sync-info { font-size: 10px; color: #666; margin-left: auto; }
.vault-pl-empty { text-align: center; padding: 20px; color: #888; }
.vault-stock-pl { font-size: 10px; font-weight: bold; margin-left: 4px; }
.vault-pl-warning { background: #ff980022; border: 1px solid #ff980055; border-radius: 6px; padding: 10px; margin-bottom: 12px; font-size: 11px; color: #ffb74d; line-height: 1.4; }

/* Period Filter Buttons */
.vault-pl-period-filters { display: flex; gap: 5px; margin-bottom: 12px; flex-wrap: wrap; align-items: center; }
.pl-period-btn { background: transparent; border: 1px solid #444; color: #888; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; transition: all 0.2s; }
.pl-period-btn:hover { border-color: var(--hf-accent, #caa14a); color: #fff; }
.pl-period-btn.active { background: var(--hf-accent, #caa14a); border-color: var(--hf-accent, #caa14a); color: #fff; }

/* Period Summary */
.vault-pl-period-summary { background: #1a1a1a; border-radius: 6px; padding: 12px; margin-bottom: 12px; }
.pl-period-title { font-size: 12px; font-weight: bold; color: var(--hf-accent, #caa14a); margin-bottom: 10px; }
.pl-period-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.pl-period-stat { display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: #252525; border-radius: 4px; }
.pl-period-stat.pl-positive { border-left: 2px solid #8bc34a; }
.pl-period-stat.pl-negative { border-left: 2px solid #ef5350; }
.pl-stat-label { font-size: 10px; color: #888; text-transform: uppercase; }
.pl-stat-value { font-size: 12px; font-weight: bold; color: #fff; }
.pl-period-stat.pl-positive .pl-stat-value { color: #8bc34a; }
.pl-period-stat.pl-negative .pl-stat-value { color: #ef5350; }

.vault-pl-divider { border-top: 1px solid #333; margin: 12px 0; }
.vault-pl-section-title { font-size: 11px; color: #888; text-transform: uppercase; margin-bottom: 8px; font-weight: bold; }

.swing-trade-status { font-size: 11px; margin-top: 8px; min-height: 20px; }

/* --- SWING TRADING CSS --- */
.alfa-swing-section { background: #151515; border: 1px solid #333; border-radius: 6px; margin: 12px 0; }
.swing-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; cursor: pointer; transition: background 0.2s; }
.swing-header:hover { background: #1a1a1a; }
.swing-title { font-weight: bold; color: var(--hf-accent, #caa14a); font-size: 12px; }
.swing-content { padding: 0 12px 12px; overflow-x: hidden; }
.stocks-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 12px; cursor: pointer; transition: background 0.2s; }
.stocks-header:hover { background: #1a1a1a; }
.stocks-title { font-weight: bold; color: var(--hf-accent, #caa14a); font-size: 12px; }
.stocks-content { padding: 0 12px 12px; overflow-x: hidden; }
.alfa-stocks-section { background: #151515; border: 1px solid #333; border-radius: 6px; margin: 12px 0; overflow: hidden; }

.swing-tabs { display: flex; gap: 5px; margin-bottom: 12px; border-bottom: 1px solid #333; padding-bottom: 10px; }
.swing-tab { background: transparent; border: 1px solid #444; color: #888; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; transition: all 0.2s; }
.swing-tab:hover { border-color: var(--hf-accent, #caa14a); color: #fff; }
.swing-tab.active { background: var(--hf-accent, #caa14a); border-color: var(--hf-accent, #caa14a); color: #fff; }

.swing-tab-content { min-height: 100px; overflow-x: hidden; }
.swing-empty { text-align: center; padding: 30px 15px; color: #666; }
.swing-loading { text-align: center; padding: 20px; color: #888; }
.swing-error { text-align: center; padding: 20px; color: #ef5350; }

.swing-actions { display: flex; gap: 10px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #333; }

/* Positions Summary */
.swing-positions-summary { display: flex; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
.swing-summary-item { background: #252525; padding: 10px 15px; border-radius: 6px; text-align: center; flex: 1; min-width: 100px; }
.swing-summary-item.positive { border-left: 3px solid #8bc34a; }
.swing-summary-item.negative { border-left: 3px solid #ef5350; }
.swing-summary-label { display: block; font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
.swing-summary-value { font-size: 14px; font-weight: bold; color: #fff; }
.swing-summary-item.positive .swing-summary-value { color: #8bc34a; }
.swing-summary-item.negative .swing-summary-value { color: #ef5350; }

/* Position Cards */
.swing-position { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 12px; margin-bottom: 10px; transition: all 0.2s; }
.swing-position:hover { border-color: #555; }
.swing-position.target-hit { border-color: #8bc34a; background: #8bc34a11; }
.swing-position.stopped { border-color: #ef5350; background: #ef535011; }

.swing-pos-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.swing-pos-title-group { display: flex; align-items: center; gap: 8px; }
.swing-pos-header-right { display: flex; align-items: center; gap: 8px; }
.swing-pos-symbol { font-size: 16px; font-weight: bold; color: #fff; }
.swing-pos-signal { font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 4px; white-space: nowrap; }
.swing-signal-stale { opacity: 0.6; }
.swing-pos-pl { font-size: 14px; font-weight: bold; }
.swing-pos-pl.positive { color: #8bc34a; }
.swing-pos-pl.negative { color: #ef5350; }
.swing-pos-status { font-size: 16px; }

.swing-pos-details { font-size: 11px; color: #aaa; }
.swing-pos-row { display: flex; justify-content: space-between; margin-bottom: 6px; flex-wrap: wrap; gap: 5px; }
.swing-stop { color: #ef5350; }
.swing-target { color: #8bc34a; }

.swing-pos-progress { margin: 10px 0; }
.swing-progress-bar { height: 6px; background: linear-gradient(to right, #ef5350, #ffd54f 50%, #8bc34a); border-radius: 3px; position: relative; }
.swing-progress-fill { position: absolute; left: 0; top: 0; height: 100%; background: rgba(0,0,0,0.5); border-radius: 3px 0 0 3px; }
.swing-progress-marker { position: absolute; top: -3px; width: 4px; height: 12px; background: #fff; border-radius: 2px; transform: translateX(-50%); box-shadow: 0 0 5px rgba(0,0,0,0.5); }
.swing-progress-labels { display: flex; justify-content: space-between; font-size: 9px; color: #666; margin-top: 3px; }

.swing-pos-meta { display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-top: 8px; }

.swing-pos-actions { display: flex; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #333; }
.swing-close-btn, .swing-merge-btn, .swing-edit-btn { background: transparent; border: 1px solid #555; color: #888; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 10px; transition: all 0.2s; }
.swing-close-btn:hover { border-color: #ef5350; color: #ef5350; }
.swing-merge-btn:hover { border-color: var(--hf-accent, #caa14a); color: var(--hf-accent, #caa14a); }
.swing-edit-btn:hover { border-color: var(--hf-accent, #caa14a); color: var(--hf-accent, #caa14a); }

/* Signals */
.swing-signal-group { margin-bottom: 15px; }
.swing-signal-group-title { font-size: 12px; font-weight: bold; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #333; }

.swing-signal-card { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; padding: 12px; margin-bottom: 8px; }
.swing-signal-card.buy { border-left: 3px solid #66bb6a; }
.swing-signal-card.sell { border-left: 3px solid #ef5350; }

.swing-signal-header { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; flex-wrap: wrap; }
.swing-signal-symbol { font-size: 14px; font-weight: bold; color: #fff; }
.swing-signal-badge { padding: 3px 8px; border-radius: 12px; font-size: 10px; font-weight: bold; }
.swing-signal-score { font-size: 10px; color: #888; margin-left: auto; }
.swing-signal-price { font-size: 18px; font-weight: bold; color: #fff; margin-bottom: 8px; }

.swing-signal-reasons { display: flex; flex-direction: column; gap: 3px; margin-bottom: 8px; }
.swing-reason { font-size: 10px; padding: 3px 8px; border-radius: 4px; }
.swing-reason.bullish { background: #66bb6a22; color: #66bb6a; }
.swing-reason.bearish { background: #ef535022; color: #ef5350; }

.swing-signal-targets { display: flex; justify-content: space-between; font-size: 10px; color: #888; margin-bottom: 8px; }
.swing-signal-holding { font-size: 10px; color: #ffd54f; background: #ffd54f22; padding: 5px 10px; border-radius: 4px; margin-top: 5px; }

.swing-signal-actions { display: flex; gap: 8px; align-items: center; margin-top: 8px; flex-wrap: wrap; }
.swing-signal-actions .swing-signal-track-btn { flex: 1; min-width: 120px; }
.swing-signal-actions .swing-already-tracking { flex: 1; }
.swing-signal-track-btn { background: #66bb6a; border: none; color: #fff; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; }
.swing-signal-track-btn:hover { background: #4caf50; }
.swing-already-tracking { font-size: 10px; color: #888; font-style: italic; }

/* Stats */
.swing-stats { margin-bottom: 15px; }
.swing-stats-empty { text-align: center; padding: 15px; color: #666; font-size: 11px; }
.swing-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.swing-stat-card { background: #1a1a1a; padding: 12px; border-radius: 6px; text-align: center; }
.swing-stat-card.positive { border-bottom: 2px solid #8bc34a; }
.swing-stat-card.negative { border-bottom: 2px solid #ef5350; }
.swing-stat-label { display: block; font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 4px; }
.swing-stat-value { font-size: 16px; font-weight: bold; color: #fff; }
.swing-stat-value.positive { color: #8bc34a; }
.swing-stat-value.negative { color: #ef5350; }
.swing-stat-sub { display: block; font-size: 10px; color: #666; margin-top: 3px; }

/* Journal */
.swing-journal-list { max-height: 400px; overflow-y: auto; }
.swing-journal-entry { background: #1a1a1a; border: 1px solid #333; border-radius: 6px; padding: 10px; margin-bottom: 8px; }
.swing-journal-entry.winner { border-left: 3px solid #8bc34a; }
.swing-journal-entry.loser { border-left: 3px solid #ef5350; }

.swing-journal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
.swing-journal-symbol { font-size: 13px; font-weight: bold; color: #fff; }
.swing-journal-pnl { font-size: 12px; font-weight: bold; }
.swing-journal-pnl.positive { color: #8bc34a; }
.swing-journal-pnl.negative { color: #ef5350; }

.swing-journal-details { display: flex; justify-content: space-between; font-size: 10px; color: #aaa; margin-bottom: 3px; }
.swing-journal-meta { display: flex; justify-content: space-between; font-size: 9px; color: #666; flex-wrap: wrap; gap: 5px; }
.swing-journal-header { position: relative; }
.swing-journal-header-right { display: flex; align-items: center; gap: 8px; }
.swing-journal-actions { display: flex; gap: 4px; }
.swing-journal-edit-btn, .swing-journal-full-edit-btn, .swing-journal-delete-btn { background: transparent; border: 1px solid #444; color: #888; padding: 2px 6px; border-radius: 4px; cursor: pointer; font-size: 11px; transition: all 0.2s; }
.swing-journal-edit-btn:hover, .swing-journal-full-edit-btn:hover { border-color: var(--hf-accent, #caa14a); color: var(--hf-accent, #caa14a); }
.swing-journal-delete-btn:hover { border-color: #ef5350; color: #ef5350; }
.swing-journal-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 5px; }
.swing-journal-tag { background: #2a2a2a; color: var(--hf-accent, #caa14a); padding: 2px 8px; border-radius: 4px; font-size: 9px; }
.swing-journal-notes-preview { font-size: 10px; color: #888; margin-top: 4px; font-style: italic; }
.swing-journal-entry-editing .swing-journal-inline-edit { display: block; }
.swing-journal-inline-edit { display: flex; flex-direction: column; gap: 8px; }
.swing-journal-inline-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.swing-journal-inline-fields { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.swing-journal-inline-fields label { font-size: 10px; color: #888; }
.swing-inline-input { width: 70px; background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; }
.swing-journal-inline-actions { display: flex; gap: 8px; }
.swing-undo-banner { background: #2a3a2a; border: 1px solid #66bb6a; border-radius: 6px; padding: 10px 15px; margin-bottom: 10px; font-size: 12px; color: #8bc34a; display: flex; align-items: center; gap: 10px; }
.swing-undo-btn { background: #66bb6a; border: none; color: #fff; padding: 5px 12px; border-radius: 4px; cursor: pointer; font-size: 11px; font-weight: bold; }
.swing-undo-btn:hover { background: #7bc34a; }
.pos-merge-notice { background: #2a2a1a; border: 1px solid var(--hf-accent, #caa14a); border-radius: 6px; padding: 10px; margin-bottom: 10px; font-size: 12px; color: #aaa; }
.pos-merge-buttons { display: flex; gap: 8px; margin-top: 8px; }
.merge-existing-info { font-size: 11px; color: #888; margin-top: 5px; }
.merge-shares-context { background: #1a2a2a; border: 1px solid #333; border-radius: 6px; padding: 10px; font-size: 12px; color: #aaa; }
.merge-shares-context span { display: block; margin-bottom: 4px; }
.merge-shares-context span:last-child { margin-bottom: 0; }
.merge-no-loose { background: #2a2a1a; border: 1px solid #554422; border-radius: 6px; padding: 10px; font-size: 12px; color: #ffd54f; }
.merge-result-value { font-size: 13px; font-weight: bold; color: var(--hf-accent, #caa14a); margin-top: 5px; }

/* Add Position Modal */
.add-position-form { display: flex; flex-direction: column; gap: 15px; }
.form-group { display: flex; flex-direction: column; gap: 5px; }
.form-group label { font-size: 11px; color: #888; text-transform: uppercase; }
.form-row { display: flex; gap: 15px; }
.form-row .form-group { flex: 1; }
.form-hint { font-size: 10px; color: #666; }

.form-summary { background: #1a1a1a; padding: 15px; border-radius: 6px; }
.summary-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
.summary-row:last-child { margin-bottom: 0; }
.summary-row span:first-child { color: #888; }
.summary-row span:last-child { font-weight: bold; color: #fff; }
.summary-row .positive { color: #8bc34a !important; }
.summary-row .negative { color: #ef5350 !important; }

.form-actions { display: flex; gap: 10px; }

.alfa-select { background: #1a1a1a; border: 1px solid #333; color: #fff; padding: 10px; border-radius: 6px; font-size: 13px; width: 100%; min-height: 40px; line-height: 1.4; box-sizing: border-box; }
.alfa-select:focus { border-color: var(--hf-accent, #caa14a); outline: none; }

/* --- TRANSACTION HISTORY MODAL CSS --- */
.tx-history-container { display: flex; flex-direction: column; gap: 15px; }
.tx-period-filter-row { display: flex; align-items: center; gap: 8px; padding-bottom: 10px; border-bottom: 1px solid #333; flex-wrap: wrap; }
.tx-period-label { font-size: 11px; color: #888; }
.tx-period-btn { background: transparent; border: 1px solid #444; color: #888; padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 10px; transition: all 0.2s; }
.tx-period-btn:hover { border-color: var(--hf-accent, #caa14a); color: #fff; }
.tx-period-btn.active { background: var(--hf-accent, #caa14a); border-color: var(--hf-accent, #caa14a); color: #fff; }
.tx-period-badge { display: inline-block; background: var(--hf-accent, #caa14a)33; color: var(--hf-accent, #caa14a); padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; margin-bottom: 10px; }
.tx-tabs { display: flex; gap: 5px; border-bottom: 1px solid #333; padding-bottom: 10px; }
.tx-tab { background: transparent; border: 1px solid #444; color: #888; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 11px; transition: all 0.2s; }
.tx-tab:hover { border-color: var(--hf-accent, #caa14a); color: #fff; }
.tx-tab.active { background: var(--hf-accent, #caa14a); border-color: var(--hf-accent, #caa14a); color: #fff; }
.tx-tab-content { min-height: 200px; }
.tx-summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.tx-summary-card { background: #1a1a1a; padding: 15px; border-radius: 8px; text-align: center; border: 1px solid #252525; }
.tx-summary-card.pl-positive { border-color: #8bc34a44; }
.tx-summary-card.pl-negative { border-color: #ef535044; }
.tx-summary-label { display: block; font-size: 10px; color: #888; text-transform: uppercase; margin-bottom: 6px; }
.tx-summary-value { display: block; font-size: 18px; font-weight: bold; color: #fff; }
.tx-summary-card.pl-positive .tx-summary-value { color: #8bc34a; }
.tx-summary-card.pl-negative .tx-summary-value { color: #ef5350; }
.tx-summary-sub { display: block; font-size: 11px; color: #666; margin-top: 4px; }
.tx-table { width: 100%; border-collapse: collapse; font-size: 11px; }
.tx-table th { text-align: left; padding: 8px; color: #888; border-bottom: 1px solid #333; font-weight: bold; text-transform: uppercase; font-size: 10px; position: sticky; top: 0; background: #1e1e1e; }
.tx-table td { padding: 8px; border-bottom: 1px solid #252525; }
.tx-table tbody tr:hover { background: #252525; }
.tx-actions { display: flex; gap: 10px; padding-top: 15px; border-top: 1px solid #333; }

/* --- QUICK BUY/SELL MODAL CSS --- */
.vault-trade-view { padding: 12px 0; }
.vault-trade-view-inner { display: flex; flex-direction: column; gap: 15px; }
.vault-trade-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #333; }
.vault-trade-symbol { font-size: 20px; font-weight: bold; color: #fff; }
.vault-trade-price { font-size: 16px; color: #8bc34a; }
.quick-trade-container { display: flex; flex-direction: column; gap: 15px; }
.quick-trade-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 10px; border-bottom: 1px solid #333; }
.quick-trade-symbol { font-size: 24px; font-weight: bold; color: #fff; }
.quick-trade-price { font-size: 16px; font-weight: bold; color: var(--hf-accent, #caa14a); }
.quick-trade-info { background: #1a1a1a; padding: 12px; border-radius: 6px; }
.quick-trade-info-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #ccc; border-bottom: 1px solid #252525; }
.quick-trade-info-row:last-child { border-bottom: none; }
.quick-trade-protection { background: #2a2a1a; border: 1px solid #554422; border-radius: 6px; padding: 10px; margin-top: 5px; }
.quick-trade-protection-item { font-size: 11px; color: #ffd54f; margin-bottom: 5px; }
.quick-trade-protection-item:last-child { margin-bottom: 0; }
.quick-trade-input-section { display: flex; flex-direction: column; gap: 8px; }
.quick-trade-label { font-size: 11px; color: #888; text-transform: uppercase; }
.quick-trade-hint { font-size: 10px; color: #666; }
.quick-trade-calc { background: #151515; padding: 12px; border-radius: 6px; margin-top: 5px; }
.quick-trade-calc-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 12px; color: #ccc; border-bottom: 1px solid #252525; }
.quick-trade-calc-row:last-child { border-bottom: none; }
.quick-trade-calc-row.highlight { background: #1a2a1a; margin: 0 -12px; padding: 8px 12px; font-weight: bold; color: #fff; }
.quick-trade-warning { margin-top: 8px; padding: 8px; background: #2a1a1a; border-radius: 4px; font-size: 11px; }
.quick-trade-actions { display: flex; gap: 10px; margin-top: 5px; }
.qb-btn-sell { flex: 1; border-color: #ef5350 !important; color: #ef5350 !important; }
.qb-btn-sell:hover:not(:disabled) { background: #ef5350 !important; color: #fff !important; }
.qb-btn-sell:disabled { border-color: #444 !important; color: #666 !important; }
`;

  // src/stocks/styles.js
  var STYLE_ID2 = "hf-stocks-styles";
  function injectStocksStyles() {
    if (document.getElementById(STYLE_ID2)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID2;
    style.textContent = `
    ${LEGACY_STYLES}

    .hf-stocks-root {
      font-family: var(--hf-font);
      color: var(--hf-text);
    }

    .hf-stocks-root,
    .alfa-modal-overlay.hf-torn {
      --hf-stock-card-bg: rgba(21, 22, 26, 0.92);
      --hf-stock-card-bg-strong: rgba(27, 29, 34, 0.96);
      --hf-stock-card-hover: rgba(202, 161, 74, 0.08);
      --hf-stock-border-soft: rgba(202, 161, 74, 0.16);
    }

    .hf-stocks-root .alfa-vault-section {
      background: transparent;
      border: none;
      padding: 0;
      margin-bottom: 0;
      font-family: var(--hf-font);
      color: var(--hf-text);
    }

    /* Space content away from collapsible module header border */
    .hf-stocks-root .vault-pl-content,
    .hf-stocks-root .swing-content,
    .hf-stocks-root .stocks-content {
      padding-top: 12px;
    }

    .hf-stocks-root .alfa-vault-empty,
    .hf-stocks-root .alfa-vault-summary,
    .hf-stocks-root .alfa-vault-income-row,
    .hf-stocks-root .alfa-vault-pl-section,
    .hf-stocks-root .alfa-swing-section,
    .hf-stocks-root .alfa-stocks-section,
    .hf-stocks-root .vault-stock-row,
    .hf-stocks-root .swing-position,
    .hf-stocks-root .swing-signal-card,
    .hf-stocks-root .swing-journal-entry,
    .hf-stocks-root .tx-summary-card,
    .hf-stocks-root .vault-pl-item,
    .hf-stocks-root .swing-summary-item,
    .hf-stocks-root .swing-stat-card,
    .hf-stocks-root .rebal-section,
    .hf-stocks-root .rebal-summary,
    .hf-stocks-root .quick-trade-info,
    .hf-stocks-root .quick-trade-calc {
      background: var(--hf-stock-card-bg);
      border: 1px solid var(--hf-panel-border);
      border-radius: var(--hf-radius);
      color: var(--hf-text);
      box-shadow: none;
    }

    .hf-stocks-root .alfa-vault-summary,
    .hf-stocks-root .alfa-vault-income-row {
      background: linear-gradient(180deg, rgba(32, 34, 40, 0.96), rgba(21, 22, 26, 0.96));
      border-color: var(--hf-stock-border-soft);
    }

    .hf-stocks-root .alfa-vault-total-value,
    .hf-stocks-root .vault-stock-value,
    .hf-stocks-root .vault-income-value,
    .hf-stocks-root .quick-trade-price,
    .hf-stocks-root .vault-trade-price {
      color: var(--hf-success);
    }


    .hf-stocks-root .alfa-vault-total-label,
    .hf-stocks-root .vault-pl-label,
    .hf-stocks-root .swing-summary-label,
    .hf-stocks-root .swing-stat-label,
    .hf-stocks-root .quick-block-label,
    .hf-stocks-root .quick-trade-label,
    .hf-stocks-root .form-group label,
    .hf-stocks-root .tx-summary-label,
    .hf-stocks-root .pl-stat-label,
    .alfa-modal-overlay.hf-torn .form-group label,
    .alfa-modal-overlay.hf-torn .settings-section-title,
    .alfa-modal-overlay.hf-torn .vault-config-title {
      color: var(--hf-text-muted);
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.07em;
      text-transform: uppercase;
    }

    .hf-stocks-root .vault-pl-title,
    .hf-stocks-root .swing-title,
    .hf-stocks-root .stocks-title,
    .hf-stocks-root .pl-period-title,
    .hf-stocks-root .swing-signal-group-title,
    .alfa-modal-overlay.hf-torn .settings-section-title,
    .alfa-modal-overlay.hf-torn .vault-config-title {
      color: var(--hf-accent-text);
    }

    .hf-stocks-root .vault-pl-header,
    .hf-stocks-root .swing-header,
    .hf-stocks-root .stocks-header {
      background: var(--hf-panel-header-bg);
      border-bottom: 1px solid var(--hf-panel-border);
    }

    .hf-stocks-root .alfa-vault-pl-section,
    .hf-stocks-root .alfa-swing-section,
    .hf-stocks-root .alfa-stocks-section {
      overflow: hidden;
    }

    .hf-stocks-root .vault-pl-header:hover,
    .hf-stocks-root .swing-header:hover,
    .hf-stocks-root .stocks-header:hover,
    .hf-stocks-root .vault-stock-row:hover,
    .hf-stocks-root .swing-position:hover,
    .hf-stocks-root .swing-signal-card:hover,
    .hf-stocks-root .swing-journal-entry:hover {
      background: var(--hf-stock-card-hover);
      border-color: var(--hf-accent-muted);
    }

    .hf-stocks-root .alfa-vault-header,
    .hf-stocks-root .alfa-vault-title {
      display: none;
    }

    .hf-stocks-root .alfa-vault-control-group,
    .hf-stocks-root .vault-pl-actions,
    .hf-stocks-root .swing-actions,
    .hf-stocks-root .quick-block-actions,
    .hf-stocks-root .quick-trade-actions,
    .alfa-modal-overlay.hf-torn .form-actions,
    .alfa-modal-overlay.hf-torn .settings-actions,
    .alfa-modal-overlay.hf-torn .vault-config-actions {
      gap: 8px;
    }


    .hf-stocks-root .alfa-main-btn,
    .hf-stocks-root .alfa-mini-btn,
    .hf-stocks-root .alfa-btn,
    .hf-stocks-root .pl-period-btn,
    .hf-stocks-root .swing-tab,
    .hf-stocks-root .tx-tab,
    .hf-stocks-root .tx-period-btn,
    .hf-stocks-root .vault-action-btn,
    .hf-stocks-root .rebal-action-btn,
    .hf-stocks-root .swing-close-btn,
    .hf-stocks-root .swing-merge-btn,
    .hf-stocks-root .swing-edit-btn,
    .hf-stocks-root .swing-signal-track-btn,
    .hf-stocks-root .swing-journal-edit-btn,
    .hf-stocks-root .swing-journal-full-edit-btn,
    .hf-stocks-root .swing-journal-delete-btn,
    .alfa-modal-overlay.hf-torn .alfa-main-btn,
    .alfa-modal-overlay.hf-torn .alfa-mini-btn,
    .alfa-modal-overlay.hf-torn .settings-tab,
    .alfa-modal-overlay.hf-torn .vault-action-btn {
      appearance: none;
      border: 1px solid var(--hf-panel-border);
      border-radius: 5px;
      background: var(--hf-surface);
      color: var(--hf-accent-text);
      cursor: pointer;
      font: inherit;
      font-size: 11px;
      font-weight: 700;
      min-height: 28px;
      padding: 5px 10px;
      text-transform: none;
      transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, filter 0.15s ease;
    }

    .hf-stocks-root .alfa-mini-btn,
    .alfa-modal-overlay.hf-torn .alfa-mini-btn,
    .hf-stocks-root .vault-action-btn {
      margin-left: 0;
      min-height: 24px;
      padding: 3px 8px;
      font-size: 10px;
    }

    .hf-stocks-root .alfa-mini-btn:hover,
    .hf-stocks-root .alfa-btn:hover,
    .hf-stocks-root .alfa-main-btn:hover,
    .hf-stocks-root .pl-period-btn:hover,
    .hf-stocks-root .swing-tab:hover,
    .hf-stocks-root .tx-tab:hover,
    .hf-stocks-root .tx-period-btn:hover,
    .hf-stocks-root .vault-action-btn:hover:not(:disabled),
    .hf-stocks-root .rebal-action-btn:hover:not(:disabled),
    .hf-stocks-root .swing-merge-btn:hover,
    .hf-stocks-root .swing-edit-btn:hover,
    .alfa-modal-overlay.hf-torn .alfa-main-btn:hover,
    .alfa-modal-overlay.hf-torn .alfa-mini-btn:hover,
    .alfa-modal-overlay.hf-torn .settings-tab:hover,
    .alfa-modal-overlay.hf-torn .vault-action-btn:hover:not(:disabled) {
      background: var(--hf-accent-subtle);
      border-color: var(--hf-hover);
      color: var(--hf-hover);
    }

    .hf-stocks-root .alfa-mini-btn.active,
    .hf-stocks-root .alfa-btn.active,
    .hf-stocks-root .pl-period-btn.active,
    .hf-stocks-root .swing-tab.active,
    .hf-stocks-root .tx-tab.active,
    .hf-stocks-root .tx-period-btn.active,
    .alfa-modal-overlay.hf-torn .settings-tab.active {
      background: var(--hf-accent);
      border-color: var(--hf-accent);
      color: #1b1d22;
    }

    .hf-stocks-root .vault-spread-btn,
    .hf-stocks-root .qb-btn-buy,
    .hf-stocks-root .swing-signal-track-btn,
    .alfa-modal-overlay.hf-torn .qb-btn-buy {
      background: var(--hf-success-bg);
      border-color: var(--hf-success-border) !important;
      color: var(--hf-success) !important;
    }

    .hf-stocks-root .vault-withdraw-btn,
    .hf-stocks-root .qb-btn-sell,
    .hf-stocks-root .swing-close-btn,
    .hf-stocks-root .swing-journal-delete-btn,
    .alfa-modal-overlay.hf-torn .qb-btn-sell {
      background: var(--hf-danger-bg);
      border-color: var(--hf-danger-border) !important;
      color: var(--hf-danger) !important;
    }

    .hf-stocks-root .vault-rebalance-btn,
    .hf-stocks-root .vault-analyze-btn,
    .hf-stocks-root .qb-btn-rebalance {
      background: var(--hf-warning-bg);
      border-color: var(--hf-warning-border) !important;
      color: var(--hf-warning) !important;
    }

    .hf-stocks-root button:disabled,
    .alfa-modal-overlay.hf-torn button:disabled {
      cursor: not-allowed;
      filter: grayscale(0.45);
      opacity: 0.55;
    }

    .hf-stocks-root .alfa-input,
    .hf-stocks-root .alfa-select,
    .hf-stocks-root .alfa-tbl-input,
    .hf-stocks-root .swing-inline-input,
    .hf-stocks-root textarea.alfa-input,
    .alfa-modal-overlay.hf-torn .alfa-input,
    .alfa-modal-overlay.hf-torn .alfa-select,
    .alfa-modal-overlay.hf-torn .alfa-tbl-input,
    .alfa-modal-overlay.hf-torn .swing-inline-input,
    .alfa-modal-overlay.hf-torn textarea.alfa-input {
      background: var(--hf-surface);
      border: 1px solid var(--hf-panel-border);
      border-radius: 5px;
      color: var(--hf-accent-text);
      font: inherit;
      min-height: 30px;
      padding: 6px 8px;
    }

    .hf-stocks-root .alfa-input:focus,
    .hf-stocks-root .alfa-select:focus,
    .hf-stocks-root .alfa-tbl-input:focus,
    .hf-stocks-root .swing-inline-input:focus,
    .alfa-modal-overlay.hf-torn .alfa-input:focus,
    .alfa-modal-overlay.hf-torn .alfa-select:focus,
    .alfa-modal-overlay.hf-torn .alfa-tbl-input:focus,
    .alfa-modal-overlay.hf-torn .swing-inline-input:focus {
      border-color: var(--hf-accent);
      box-shadow: 0 0 0 2px var(--hf-accent-subtle);
      outline: none;
    }

    .hf-stocks-root .vault-stock-bar-container,
    .hf-stocks-root .vault-block-progress,
    .hf-stocks-root .quick-block-progress-bar {
      background: rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(255, 255, 255, 0.04);
    }

    .hf-stocks-root .vault-stock-bar,
    .hf-stocks-root .vault-block-progress-fill,
    .hf-stocks-root .quick-block-progress-fill {
      background: linear-gradient(90deg, var(--hf-accent), var(--hf-hover));
    }

    .hf-stocks-root .vault-row-locked {
      background: linear-gradient(90deg, rgba(255, 217, 102, 0.08), var(--hf-stock-card-bg) 38%) !important;
      border-color: var(--hf-warning-border) !important;
    }

    .hf-stocks-root .vault-pl-warning,
    .hf-stocks-root .settings-warning,
    .hf-stocks-root .quick-block-rebalance-info,
    .hf-stocks-root .quick-trade-protection,
    .hf-stocks-root .merge-no-loose,
    .alfa-modal-overlay.hf-torn .settings-warning,
    .alfa-modal-overlay.hf-torn .quick-block-rebalance-info,
    .alfa-modal-overlay.hf-torn .quick-trade-protection,
    .alfa-modal-overlay.hf-torn .merge-no-loose {
      background: var(--hf-warning-bg);
      border: 1px solid var(--hf-warning-border);
      border-radius: var(--hf-radius);
      color: var(--hf-warning);
    }

    .hf-stocks-root .settings-api-status,
    .hf-stocks-root .vault-stock-grid,
    .hf-stocks-root .settings-exclude-grid,
    .hf-stocks-root .settings-checkbox-label,
    .hf-stocks-root .vault-stock-option,
    .hf-stocks-root .quick-block-status,
    .hf-stocks-root .quick-block-progress-section,
    .hf-stocks-root .quick-block-details,
    .hf-stocks-root .quick-block-afford,
    .hf-stocks-root .form-summary,
    .alfa-modal-overlay.hf-torn .settings-api-status,
    .alfa-modal-overlay.hf-torn .vault-stock-grid,
    .alfa-modal-overlay.hf-torn .settings-exclude-grid,
    .alfa-modal-overlay.hf-torn .settings-checkbox-label,
    .alfa-modal-overlay.hf-torn .vault-stock-option,
    .alfa-modal-overlay.hf-torn .quick-block-status,
    .alfa-modal-overlay.hf-torn .quick-block-progress-section,
    .alfa-modal-overlay.hf-torn .quick-block-details,
    .alfa-modal-overlay.hf-torn .quick-block-afford,
    .alfa-modal-overlay.hf-torn .form-summary {
      background: var(--hf-stock-card-bg);
      border: 1px solid var(--hf-panel-border);
      border-radius: var(--hf-radius);
    }

    .hf-stocks-root .vault-stock-option.selected,
    .alfa-modal-overlay.hf-torn .vault-stock-option.selected {
      background: var(--hf-accent-subtle);
      border-color: var(--hf-accent);
    }

    .hf-stocks-root .vault-stock-name,
    .hf-stocks-root .swing-pos-symbol,
    .hf-stocks-root .swing-signal-symbol,
    .hf-stocks-root .swing-journal-symbol,
    .hf-stocks-root .quick-block-symbol,
    .hf-stocks-root .vault-trade-symbol,
    .hf-stocks-root .quick-trade-symbol,
    .alfa-modal-overlay.hf-torn .quick-block-symbol,
    .alfa-modal-overlay.hf-torn .vault-trade-symbol,
    .alfa-modal-overlay.hf-torn .quick-trade-symbol {
      color: var(--hf-accent-text);
    }

    #alfa-modal-overlay .vault-risk-panel {
      color-scheme: dark;
      background: #202126;
      color: #f0f1f3;
      padding: 8px;
    }
    #alfa-modal-overlay .vault-risk-panel :is(summary, label, p, th, td, button, select, option) {
      color: #f0f1f3 !important;
      text-shadow: none;
    }
    #alfa-modal-overlay .vault-risk-panel :is(button, select, option, th) {
      background: #34363d !important;
    }
    #alfa-modal-overlay .vault-risk-panel td {
      background: #202126 !important;
    }
    #alfa-modal-overlay .vault-risk-panel tr:nth-child(even) td {
      background: #292b31 !important;
    }
    #alfa-modal-overlay .vault-risk-panel button:disabled { opacity: 1; }

    .hf-stocks-root .alfa-table th,
    .hf-stocks-root .tx-table th,
    .alfa-modal-overlay.hf-torn .alfa-table th,
    .alfa-modal-overlay.hf-torn .tx-table th {
      background: var(--hf-panel-header-bg);
      border-bottom: 1px solid var(--hf-panel-border);
      color: var(--hf-text-muted);
    }

    .hf-stocks-root .alfa-table td,
    .hf-stocks-root .tx-table td,
    .alfa-modal-overlay.hf-torn .alfa-table td,
    .alfa-modal-overlay.hf-torn .tx-table td {
      border-bottom: 1px solid var(--hf-panel-border);
      color: var(--hf-text);
    }

    .hf-stocks-root .tx-table tbody tr:hover,
    .alfa-modal-overlay.hf-torn .tx-table tbody tr:hover {
      background: var(--hf-stock-card-hover);
    }

    .hf-stocks-root .alfa-hero:hover {
      border-color: var(--hf-accent);
    }

    .hf-stocks-root .alfa-overlay {
      z-index: 10050;
    }

    .hf-stocks-root .alfa-modal {
      font-family: var(--hf-font);
    }

    .alfa-modal-overlay.hf-torn {
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.62);
      backdrop-filter: blur(2px);
      color: var(--hf-text);
      font-family: var(--hf-font);
    }

    .alfa-modal-overlay.hf-torn .alfa-modal {
      display: flex;
      flex-direction: column;
      width: min(680px, 94vw);
      max-height: min(86vh, 760px);
      overflow: hidden;
      background: var(--hf-panel-bg);
      border: 1px solid var(--hf-panel-border);
      border-radius: var(--hf-radius);
      box-shadow: var(--hf-shadow);
      color: var(--hf-text);
      font-family: var(--hf-font);
    }

    .alfa-modal-overlay.hf-torn .alfa-modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      background: var(--hf-panel-header-bg);
      border-bottom: 1px solid var(--hf-panel-border);
      padding: 12px 14px;
      min-height: 48px;
      box-sizing: border-box;
    }

    .alfa-modal-overlay.hf-torn .alfa-modal-header h3 {
      margin: 0;
      padding: 0;
      color: var(--hf-accent-text);
      font-size: 14px;
      font-weight: 600;
      letter-spacing: 0.02em;
      line-height: 1.25;
      display: flex;
      align-items: center;
      gap: 6px;
      flex: 1;
      min-width: 0;
    }

    .alfa-modal-overlay.hf-torn .alfa-modal-close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      margin: 0;
      padding: 0;
      color: var(--hf-text-muted);
      font-size: 22px;
      line-height: 1;
    }

    .alfa-modal-overlay.hf-torn .alfa-modal-close:hover {
      color: var(--hf-hover);
    }

    .alfa-modal-overlay.hf-torn .alfa-modal-body {
      flex: 1 1 auto;
      min-height: 0;
      max-height: none; /* override legacy 80vh \u2014 was causing modal + body double scroll */
      overflow-y: auto;
      color: var(--hf-text);
      padding: 14px;
    }

    /* Rebalance / Spread / Withdraw layout
       Warnings/summary/actions stay content-sized; only .rebal-section grows + scrolls.
       (Previous grid 1fr row was assigned to the first warning \u2014 huge empty notice box.) */
    .alfa-modal-overlay.hf-torn .alfa-modal-body:has(.rebal-container) {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .alfa-modal-overlay.hf-torn .rebal-container {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow: hidden;
    }

    .alfa-modal-overlay.hf-torn .rebal-container > .rebal-summary,
    .alfa-modal-overlay.hf-torn .rebal-container > .rebal-warning,
    .alfa-modal-overlay.hf-torn .rebal-container > .rebal-actions,
    .alfa-modal-overlay.hf-torn .rebal-container > [id$="-progress"],
    .alfa-modal-overlay.hf-torn .rebal-container > [id$="-cash-received"] {
      flex: 0 0 auto;
    }

    .alfa-modal-overlay.hf-torn .rebal-warning {
      padding: 8px 10px;
      line-height: 1.35;
    }

    .alfa-modal-overlay.hf-torn .rebal-section {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      min-height: 160px;
      overflow: hidden;
    }

    .alfa-modal-overlay.hf-torn .rebal-section-header,
    .alfa-modal-overlay.hf-torn .rebal-subtotal {
      flex: 0 0 auto;
    }

    .alfa-modal-overlay.hf-torn .rebal-table {
      flex: 1 1 auto;
      min-height: 0;
      max-height: none;
      overflow-x: hidden;
      overflow-y: auto;
    }

    /* Portfolio rebalance: sell | buy side by side */
    .alfa-modal-overlay.hf-torn .rebal-container:has(> .rebal-section ~ .rebal-section) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      grid-auto-rows: auto;
      align-content: stretch;
      gap: 10px;
    }

    .alfa-modal-overlay.hf-torn .rebal-container:has(> .rebal-section ~ .rebal-section) > .rebal-summary,
    .alfa-modal-overlay.hf-torn .rebal-container:has(> .rebal-section ~ .rebal-section) > .rebal-warning,
    .alfa-modal-overlay.hf-torn .rebal-container:has(> .rebal-section ~ .rebal-section) > .rebal-actions,
    .alfa-modal-overlay.hf-torn .rebal-container:has(> .rebal-section ~ .rebal-section) > [id$="-progress"],
    .alfa-modal-overlay.hf-torn .rebal-container:has(> .rebal-section ~ .rebal-section) > [id$="-cash-received"] {
      grid-column: 1 / -1;
    }

    .alfa-modal-overlay.hf-torn .rebal-container:has(> .rebal-section ~ .rebal-section) > .rebal-section {
      min-height: min(36vh, 260px);
      max-height: min(42vh, 320px);
      height: auto;
      flex: unset;
    }

    .alfa-modal-overlay.hf-torn .rebal-row {
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
      overflow: hidden;
    }

    .alfa-modal-overlay.hf-torn .rebal-sym {
      flex: 0 0 36px;
      min-width: 36px;
    }

    .alfa-modal-overlay.hf-torn .rebal-signal {
      flex: 0 0 44px;
      min-width: 44px;
    }

    .alfa-modal-overlay.hf-torn .rebal-shares {
      flex: 1 1 auto;
      min-width: 0;
      text-align: right;
    }

    .alfa-modal-overlay.hf-torn .rebal-value {
      flex: 0 0 64px;
      min-width: 64px;
      text-align: right;
    }

    .alfa-modal-overlay.hf-torn .rebal-reason {
      flex: 0 0 16px;
      width: 16px;
      min-width: 16px;
      color: var(--hf-text-muted);
      font-size: 12px;
      line-height: 1;
      text-align: center;
    }

    .alfa-modal-overlay.hf-torn .rebal-block-goal {
      flex: 0 0 72px;
      font-size: 12px;
      color: var(--hf-text-muted);
      min-width: max-content;
      white-space: nowrap;
    }

    .alfa-modal-overlay.hf-torn .rebal-reason:empty {
      display: none;
    }

    .alfa-modal-overlay.hf-torn .rebal-reason-tip {
      display: inline-block;
      cursor: help;
      color: var(--hf-accent-text);
      opacity: 0.85;
    }

    .alfa-modal-overlay.hf-torn .rebal-reason-tip:hover {
      opacity: 1;
      color: var(--hf-hover);
    }

    /* Mobile / PDA: modal body scrolls so Execute/Close stay reachable */
    @media (max-width: 560px) {
      .alfa-modal-overlay.hf-torn {
        align-items: flex-start;
        padding: 8px 0;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }

      .alfa-modal-overlay.hf-torn .alfa-modal {
        width: min(680px, 96vw);
        max-height: min(92dvh, 92vh);
        margin: auto;
      }

      .alfa-modal-overlay.hf-torn .alfa-modal-body:has(.rebal-container) {
        overflow-x: hidden;
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }

      .alfa-modal-overlay.hf-torn .rebal-container {
        overflow: visible;
        flex: 0 0 auto;
        min-height: auto;
        height: auto;
      }

      .alfa-modal-overlay.hf-torn .rebal-container:has(> .rebal-section ~ .rebal-section) {
        display: flex;
        flex-direction: column;
        grid-template-columns: unset;
      }

      .alfa-modal-overlay.hf-torn .rebal-section,
      .alfa-modal-overlay.hf-torn .rebal-container:has(> .rebal-section ~ .rebal-section) > .rebal-section {
        flex: 0 0 auto;
        min-height: 0;
        max-height: none;
        height: auto;
        overflow: visible;
      }

      .alfa-modal-overlay.hf-torn .rebal-table {
        flex: 0 0 auto;
        max-height: min(40vw, 200px);
        overflow-y: auto;
      }

      .alfa-modal-overlay.hf-torn .rebal-actions {
        position: sticky;
        bottom: 0;
        z-index: 2;
        margin-top: 4px;
        padding-top: 10px;
        padding-bottom: 2px;
        background: var(--hf-panel-bg);
        flex-wrap: wrap;
      }

      .alfa-modal-overlay.hf-torn .rebal-actions .alfa-main-btn {
        flex: 1 1 auto;
        min-width: 120px;
      }
    }

    .alfa-modal-overlay.hf-torn .settings-tabs,
    .alfa-modal-overlay.hf-torn .swing-tabs,
    .alfa-modal-overlay.hf-torn .tx-tabs {
      border-bottom: 1px solid var(--hf-panel-border);
      gap: 6px;
      padding-bottom: 8px;
    }

    .alfa-modal-overlay.hf-torn .settings-section,
    .alfa-modal-overlay.hf-torn .vault-config-section,
    .alfa-modal-overlay.hf-torn .tx-summary-card,
    .alfa-modal-overlay.hf-torn .quick-block-container {
      color: var(--hf-text);
    }

    .alfa-modal-overlay.hf-torn .add-position-form {
      color: var(--hf-text);
      gap: 8px;
    }

    .alfa-modal-overlay.hf-torn .add-position-form .form-group {
      gap: 3px;
    }

    .alfa-modal-overlay.hf-torn .add-position-form .form-summary {
      padding: 10px 12px;
    }

    .alfa-modal-overlay.hf-torn .add-position-form #pos-notes.journal-notes-textarea {
      min-height: 44px;
    }

    .alfa-modal-overlay.hf-torn .pos-source-modes {
      margin: 0;
    }

    .alfa-modal-overlay.hf-torn .pos-source-options {
      display: flex;
      flex-wrap: wrap;
      gap: 6px 12px;
      margin-top: 4px;
    }

    .alfa-modal-overlay.hf-torn .pos-source-option,
    .alfa-modal-overlay.hf-torn .swing-sell-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--hf-text);
      cursor: pointer;
      user-select: none;
    }

    .alfa-modal-overlay.hf-torn .swing-sell-toggle {
      font-weight: 600;
    }

    /* Add Swing Position: compact custom stock dropdown (~half native height) */
    .alfa-modal-overlay.hf-torn .pos-symbol-wrap {
      position: relative;
    }

    .alfa-modal-overlay.hf-torn .pos-symbol-native {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      opacity: 0 !important;
      pointer-events: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: 0 !important;
    }

    .alfa-modal-overlay.hf-torn .pos-symbol-trigger {
      width: 100%;
      text-align: left;
      cursor: pointer;
    }

    .alfa-modal-overlay.hf-torn .pos-symbol-menu {
      position: absolute;
      z-index: 40;
      left: 0;
      right: 0;
      top: calc(100% + 4px);
      max-height: 200px;
      overflow-x: hidden;
      overflow-y: auto;
      background: var(--hf-stock-card-bg-strong);
      border: 1px solid var(--hf-panel-border);
      border-radius: 5px;
      box-shadow: var(--hf-shadow);
      padding: 4px;
    }

    .alfa-modal-overlay.hf-torn .pos-symbol-option {
      display: block;
      width: 100%;
      appearance: none;
      border: none;
      background: transparent;
      color: var(--hf-text);
      font: inherit;
      font-size: 12px;
      text-align: left;
      padding: 6px 8px;
      border-radius: 4px;
      cursor: pointer;
    }

    .alfa-modal-overlay.hf-torn .pos-symbol-option:hover,
    .alfa-modal-overlay.hf-torn .pos-symbol-option.is-selected {
      background: var(--hf-accent-subtle);
      color: var(--hf-accent-text);
    }

    #smart-stocks-panel.hf-panel--grow .hf-panel-body {
      padding-bottom: 16px;
    }

    .hf-stocks-root .alfa-vault-breakdown {
      max-height: 400px;
    }

    .hf-stocks-root #vault-main-content {
      overflow: visible;
    }
  `;
    document.head.appendChild(style);
  }

  // src/stocks/main.js
  var openVaultSettings = null;
  var panel = null;
  function buildMountRoot() {
    const root = document.createElement("div");
    root.id = "smart-stocks-root";
    root.className = "hf-stocks-root";
    return root;
  }
  async function init() {
    HF.theme.injectStyles();
    injectStocksStyles();
    panel = ui.createPanel({
      id: "smart-stocks-panel",
      badge: "Smart Stock Vault",
      mount: "stocksBar",
      pageBody: "grow",
      collapsedLegacyKeys: ["alfa_vault_collapsed"],
      onSettings: () => openVaultSettings?.(),
      tabs: [
        {
          id: "vault",
          label: "Vault",
          render: async () => buildMountRoot()
        }
      ]
    });
    panel.ensureMounted();
    bootstrapStocksApp({
      mountRoot: "#smart-stocks-root",
      registerSettings: (open) => {
        openVaultSettings = open;
      }
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();