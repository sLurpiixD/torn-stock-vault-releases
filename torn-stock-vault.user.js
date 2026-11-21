// ==UserScript==
// @name         Torn Stock Vault – Block Goals
// @namespace    https://github.com/sLurpiixD/torn-stock-vault
// @version      0.1.1
// @homepageURL  https://github.com/sLurpiixD/torn-stock-vault-releases
// @updateURL    https://raw.githubusercontent.com/sLurpiixD/torn-stock-vault-releases/main/torn-stock-vault.user.js
// @downloadURL  https://raw.githubusercontent.com/sLurpiixD/torn-stock-vault-releases/main/torn-stock-vault.user.js
// @description  Plan stock deposits, withdrawals and rebalancing on Torn's stock page.
// @author       sLurpiixD (fork), Noobler (Smart Stock Vault), TheALFA (Stock Manager & Advisor)
// @license      MIT
// @match        https://www.torn.com/page.php?sid=stocks*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
  'use strict';
  // Benefit thresholds from Smart Stock Vault 10.2.17.
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
  const settingsKey = 'slurpiixd.stockVault.v1';
  const symbols = Object.keys(STOCK_DATA);
  const money = cents => (cents / 100).toLocaleString('en-US', {style:'currency',currency:'USD'});
  const count = n => n.toLocaleString('en-US');

  function integer(raw, label) {
    const text = String(raw ?? '').trim().replaceAll(',', '');
    if (!/^\d+$/.test(text) || !Number.isSafeInteger(Number(text))) throw Error('Check ' + label + '.');
    return Number(text);
  }

  function cents(raw, label) {
    const text = String(raw ?? '').trim().replace(/^\$/, '').replaceAll(',', '');
    if (!/^\d+(\.\d{1,2})?$/.test(text)) throw Error('Cannot read ' + label + '.');
    const [whole, fraction = ''] = text.split('.');
    return integer(whole + fraction.padEnd(2, '0'), label);
  }

  function threshold(symbol, tier) {
    const stock = STOCK_DATA[symbol];
    if (!stock || !Number.isInteger(tier) || tier < 1 || (stock.type === 'P' && tier !== 1)) throw Error('Invalid benefit tier for ' + symbol + '.');
    const shares = stock.base * (2 ** tier - 1);
    if (!Number.isSafeInteger(shares)) throw Error('Tier is too large.');
    return shares;
  }

  function protectedCount(symbol, owned, cfg, swing) {
    const stock = STOCK_DATA[symbol];
    const tier = stock.type === 'P' ? Number(owned >= stock.base) : Math.floor(Math.log2(1 + owned / stock.base));
    const earned = cfg.lockBlocks && tier ? threshold(symbol, tier) : 0;
    const goal = symbol === cfg.goal ? threshold(symbol, cfg.tier) : 0;
    return Math.min(owned, Math.max(earned, goal) + swing);
  }

  // All budgets and prices are in cents. Round the estimated proceeds down.
  function proceeds(n, p) { return Math.floor(n * p * 0.999); }

  function plan(mode, rows, budget, needed, cfg) {
    const orders = [];
    let left = budget;
    const goal = rows.find(r => r.symbol === cfg.goal);
    if (mode === 'Deposit' && goal) {
      const gap = Math.max(0, threshold(goal.symbol, cfg.tier) - goal.owned);
      const qty = Math.min(gap, Math.floor(left / goal.price));
      if (qty) orders.push({action:'Buy', symbol:goal.symbol, qty});
      left -= qty * goal.price;
      if (qty < gap) return {orders, left};
    }
    if (mode === 'Deposit') {
      // Equal cash allocation; roll unused cents forward in symbol order.
      rows.forEach((r, i) => {
        const qty = Math.floor(left / (rows.length - i) / r.price);
        if (qty) orders.push({action:'Buy',symbol:r.symbol,qty});
        left -= qty * r.price;
      });
    } else if (mode === 'Withdraw') {
      left = needed;
      const sorted = [...rows].sort((a,b) => b.loose*b.price - a.loose*a.price);
      for (const r of sorted) {
        if (!left) break;
        const qty = Math.min(r.loose, Math.ceil(left / (r.price * 0.999)));
        if (qty) orders.push({action:'Sell',symbol:r.symbol,qty});
        left = Math.max(0, left - proceeds(qty,r.price));
      }
    } else {
      // Equalize loose holdings only. Sell excess first, then re-read cash after the trades.
      const target = rows.reduce((sum,r) => sum + r.loose*r.price, budget) / rows.length;
      for (const r of rows) {
        const qty = Math.floor((r.loose*r.price - target) / r.price);
        if (qty > 0) orders.push({action:'Sell',symbol:r.symbol,qty});
      }
      if (!orders.length) for (const r of rows) {
        const qty = Math.floor(Math.min(left,target - r.loose*r.price) / r.price);
        if (qty > 0) {
          orders.push({action:'Buy',symbol:r.symbol,qty});
          left -= qty*r.price;
        }
      }
    }
    return {orders, left};
  }

  function readJSON(key, fallback) {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  }

  function loadSettings() {
    const own = readJSON(settingsKey,null);
    if (own) return own;
    const old = readJSON('alfa_vault_config',{});
    return {stocks:old.stocks || [], locks:old.lockedStocks || [], reserve:old.keepAmount ?? 5000,
      goal:'',tier:1, lockBlocks:localStorage.getItem('alfa_vault_lock') !== 'false'};
  }

  function snapshot(cfg) {
    const positions = readJSON('alfa_swing_trades',{}).activePositions ?? [];
    const bySymbol = new Map();
    for (const row of document.querySelectorAll("ul[class^='stock_'], ul[id^='stock_']")) {
      const logo = row.querySelector('img[src*="logos/"]')?.getAttribute('src') || '';
      const match = logo.match(/logos\/([A-Z]+)\.svg/i);
      if (match) bySymbol.set(match[1].toUpperCase(),row);
    }
    return cfg.stocks.filter(sym => !cfg.locks.includes(sym)).map(symbol => {
      const row = bySymbol.get(symbol);
      if (!row) throw Error('Load the Torn stock row for ' + symbol + ' and try again.');
      const id = row.id.replace(/^stock_/i,'');
      const priceEl = row.querySelector('[class~="price_' + CSS.escape(id) + '"]') ||
        [...row.querySelectorAll('[class*="price_"]')].find(el =>
          [...el.classList].some(name => /^price_\d+$/.test(name)));
      const sharesEl = row.querySelector("p[class^='count']") || row.querySelectorAll(':scope > div')[4];
      const owned = integer(sharesEl?.textContent, symbol + ' owned shares');
      const price = cents(priceEl?.textContent, symbol + ' share price');
      if (price <= 0) throw Error('Missing price for ' + symbol + '.');
      const swing = positions.filter(p => String(p.symbol).toUpperCase() === symbol)
        .reduce((sum,p) => sum + integer(p.shares,'saved swing shares'),0);
      return {symbol, owned, price, loose:owned - protectedCount(symbol,owned,cfg,swing)};
    });
  }

  if (typeof document === 'undefined') {
    if (typeof module !== 'undefined') module.exports = {plan,protectedCount,threshold,integer,cents};
    return;
  }
  if (new URLSearchParams(location.search).get('sid') !== 'stocks' || document.getElementById('slurp-stock-vault')) return;
  const panel = document.createElement('details');
  panel.id = 'slurp-stock-vault';
  panel.open = true;
  panel.style.cssText = 'margin:10px;padding:12px;background:#202529;color:#eee;border:1px solid #697378;border-radius:6px;line-height:1.6';
  panel.innerHTML = `<summary><strong>Stock Vault</strong></summary>
    <label>Vault tickers <input data-id="stocks" placeholder="SYM, TCT"></label>
    <label>Locked tickers <input data-id="locks" placeholder="Optional"></label><br>
    <label>Keep cash ($) <input data-id="reserve" size="9"></label>
    <label><input type="checkbox" data-id="lockBlocks"> Protect earned blocks</label><br>
    <label>Block goal <select data-id="goal"><option value="">None</option></select></label>
    <label>Tier <input data-id="tier" type="number" min="1" style="width:4em"></label>
    <button type="button" data-mode="Save">Save settings</button><br>
    <button type="button" data-mode="Deposit">Plan deposit</button>
    <button type="button" data-mode="Rebalance">Plan rebalance</button>
    <label>Withdraw ($) <input data-id="needed" size="9"></label>
    <button type="button" data-mode="Withdraw">Plan withdrawal</button>
    <pre aria-live="polite" style="white-space:pre-wrap"></pre>`;
  const field = name => panel.querySelector('[data-id="' + name + '"]');
  const out = panel.querySelector('pre');
  for (const sym of symbols.sort()) field('goal').add(new Option(sym,sym));
  const host = document.querySelector('#mainContainer, main, #content') || document.body;
  host.prepend(panel);
  try {
    const cfg = loadSettings();
    for (const k of ['stocks','locks']) field(k).value = cfg[k].join(', ');
    for (const k of ['reserve','goal','tier']) field(k).value = cfg[k];
    field('lockBlocks').checked = cfg.lockBlocks;
  } catch {
    out.textContent = 'Saved settings could not be read. Review all fields before saving.';
  }
  function tickers(raw) {
    const list = [...new Set(raw.toUpperCase().split(/[\s,]+/).filter(Boolean))];
    for (const sym of list) if (!symbols.includes(sym)) throw Error('Unknown ticker: ' + sym);
    return list;
  }
  panel.addEventListener('input',() => { out.textContent = ''; });
  panel.addEventListener('click', e => {
    const mode = e.target.closest('button')?.dataset.mode;
    if (!mode || !e.isTrusted || document.hidden || !document.hasFocus()) return;
    try {
      const cfg = {stocks:tickers(field('stocks').value),locks:tickers(field('locks').value),
        goal:field('goal').value,tier:integer(field('tier').value,'tier'),
        reserve:cents(field('reserve').value,'cash reserve')/100,lockBlocks:field('lockBlocks').checked};
      if (cfg.goal) {
        threshold(cfg.goal,cfg.tier);
        if (cfg.locks.includes(cfg.goal)) throw Error('Unlock the goal ticker to allocate deposits to it.');
        if (!cfg.stocks.includes(cfg.goal)) cfg.stocks.push(cfg.goal);
      }
      if (mode === 'Save') {
        localStorage.setItem(settingsKey,JSON.stringify(cfg));
        field('stocks').value = cfg.stocks.join(', ');
        out.textContent = 'Settings saved.';
        return;
      }
      const rows = snapshot(cfg);
      if (!rows.length) throw Error('Choose at least one unlocked vault ticker.');
      let available = 0, needed = 0;
      if (mode === 'Withdraw') needed = cents(field('needed').value,'withdrawal amount');
      else {
        const wallet = document.querySelector('#user-money');
        available = Math.max(0,cents(wallet?.getAttribute('data-money') || wallet?.textContent,'wallet balance') - Math.round(cfg.reserve*100));
      }
      const {orders,left} = plan(mode,rows,available,needed,cfg);
      const lines = [];
      const goal = rows.find(r => r.symbol === cfg.goal);
      if (goal) lines.push(goal.symbol + ' goal: ' + count(goal.owned) + ' / ' + count(threshold(goal.symbol,cfg.tier)) + ' shares.');
      const looseValue = rows.reduce((total,r) => total + r.loose*r.price,0);
      lines.push('Available stock value before fees: ' + money(looseValue));
      if (!orders.length) lines.push('No trades suggested.');
      for (const o of orders) lines.push(o.action + ' ' + count(o.qty) + ' ' + o.symbol);
      if (mode === 'Withdraw' && left) lines.push('Withdrawal shortfall after estimated fees: ' + money(left));
      if (mode === 'Deposit') lines.push('Unallocated deposit: ' + money(left));
      if (orders.length) lines.push('Use Torn’s stock controls to place each trade. Recalculate after trades or price changes.');
      out.textContent = lines.join('\n');
    } catch (err) { out.textContent = err.message; }
  });
})();
