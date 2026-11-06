/* ==========================================================================
   Coding Tutorials: shared behaviour (The Backward Pass)
   Vanilla JS, no dependencies. Load after blogs.js:
     <script src="../../assets/js/code-tutorial.js?v=1"></script>
   Public helpers on window.CT: highlight, stepper, ease, lerp, svg, copyText.
   Usage notes live at the top of docs/code-tutorial-template.html.
   ========================================================================== */
(function () {
  "use strict";

  const REPO = "https://github.com/srini-anirudh/blog-coding-tutorials";
  const REPO_BLOB = REPO + "/blob/main/";
  const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------------
     Small utilities
     ------------------------------------------------------------------------ */
  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function el(tag, cls, html) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  const ICON_COPY = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="9" height="9" rx="1.5"/><path d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"/></svg>';
  const ICON_DONE = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5"/></svg>';
  const ICON_GH = '<svg viewBox="0 0 16 16" aria-hidden="true" style="fill:currentColor;stroke:none"><path d="M8 .2a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.35c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.66 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 .2z"/></svg>';

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    }
    return Promise.resolve(fallbackCopy(text));
  }

  function fallbackCopy(text) {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;";
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    area.remove();
    return ok;
  }

  function copyButton(getText, label) {
    const btn = el("button", "ct-btn ct-copy");
    btn.type = "button";
    const base = label || "Copy";
    btn.setAttribute("aria-label", base === "Copy" ? "Copy code" : base);
    btn.innerHTML = ICON_COPY + "<span>" + base + "</span>";
    const status = el("span", "ct-sr");
    status.setAttribute("aria-live", "polite");
    status.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);";
    btn.appendChild(status);
    let timer = 0;
    btn.addEventListener("click", () => {
      copyText(getText()).then(() => {
        btn.classList.add("is-done");
        btn.firstChild.outerHTML = ICON_DONE;
        btn.querySelector("span").textContent = "Copied";
        status.textContent = "Copied to clipboard";
        clearTimeout(timer);
        timer = setTimeout(() => {
          btn.classList.remove("is-done");
          btn.firstChild.outerHTML = ICON_COPY;
          btn.querySelector("span").textContent = base;
          status.textContent = "";
        }, 1600);
      });
    });
    return btn;
  }

  /* Read the code text from <pre><code>. textContent is already unescaped,
     so &lt; in the HTML becomes < here, and we escape again on output. */
  function readCode(container) {
    const code = container.querySelector("pre code") || container.querySelector("pre");
    if (!code) return { code: null, text: "" };
    let text = code.textContent;
    if (text.startsWith("\r\n")) text = text.slice(2);
    else if (text.startsWith("\n")) text = text.slice(1);
    text = text.replace(/\r\n/g, "\n").replace(/\n$/, "");
    return { code, text };
  }

  /* ------------------------------------------------------------------------
     Syntax highlighter
     ------------------------------------------------------------------------ */
  const PY_KW = new Set("and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case type".split(" "));
  const PY_CONST = new Set(["True", "False", "None", "Ellipsis", "NotImplemented"]);
  const PY_SELF = new Set(["self", "cls"]);
  const PY_BUILTIN = new Set("abs all any bool bytes callable chr dict dir divmod enumerate eval filter float format frozenset getattr globals hasattr hash hex id input int isinstance issubclass iter len list locals map max min next object oct open ord pow print property range repr reversed round set setattr slice sorted staticmethod classmethod str sum super tuple vars zip Exception ValueError TypeError RuntimeError KeyError IndexError AssertionError NotImplementedError StopIteration AttributeError ImportError OSError FileNotFoundError __name__ __file__ __init__".split(" "));
  const SH_KW = new Set("if then else elif fi for while until do done case esac in function select return export local readonly unset source alias time".split(" "));
  const SH_KEEP_CMD = new Set("if then else elif do while until time sudo env exec nohup xargs".split(" "));

  function lineHead(text, pos) {
    const start = text.lastIndexOf("\n", pos - 1) + 1;
    return text.slice(start, pos);
  }

  function nextChar(text, pos) {
    const m = /[^ \t]/g;
    m.lastIndex = pos;
    const r = m.exec(text);
    return r ? r[0] : "";
  }

  function tokenizePython(text) {
    const out = [];
    let pos = 0;
    let prevWord = "";
    const rules = [
      ["com", /#[^\n]*/y],
      ["str", /(?:[rRbBuUfF]{1,2})?(?:"""[\s\S]*?(?:"""|$)|'''[\s\S]*?(?:'''|$))/y],
      ["str", /(?:[rRbBuUfF]{1,2})?(?:"(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)/y],
      ["dec", /@[A-Za-z_][\w.]*/y],
      ["id", /[A-Za-z_]\w*/y],
      ["num", /(?:0[xX][\da-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?[jJ]?)/y],
      ["op", /->|[+\-*\/%=<>!&|^~@:]+/y],
    ];
    while (pos < text.length) {
      let matched = false;
      for (const [type, re] of rules) {
        re.lastIndex = pos;
        const m = re.exec(text);
        if (!m || !m[0]) continue;
        const word = m[0];
        if (type === "dec" && !/^[ \t]*$/.test(lineHead(text, pos))) continue;
        let t = type;
        if (type === "id") {
          if (prevWord === "def" || prevWord === "class") t = "def";
          else if (PY_KW.has(word)) t = "kw";
          else if (PY_CONST.has(word)) t = "const";
          else if (PY_SELF.has(word)) t = "self";
          else if (PY_BUILTIN.has(word) && text[pos - 1] !== ".") t = "builtin";
          else if (nextChar(text, pos + word.length) === "(") t = "call";
          else t = "";
          prevWord = word;
        } else if (type !== "op") {
          prevWord = "";
        }
        if (type === "op") t = "";
        out.push([t, word]);
        pos += word.length;
        matched = true;
        break;
      }
      if (!matched) {
        const ch = text[pos];
        if (!/\s/.test(ch)) prevWord = ch === "." ? prevWord : "";
        out.push(["", ch]);
        pos += 1;
      }
    }
    return out;
  }

  function tokenizeShell(text) {
    const out = [];
    let pos = 0;
    let cmdPos = true;
    while (pos < text.length) {
      const ch = text[pos];
      const rest = text.slice(pos, pos + 2);
      let m;
      if (ch === "\n") {
        const contd = text[pos - 1] === "\\";
        out.push(["", ch]);
        pos += 1;
        cmdPos = !contd;
        continue;
      }
      if (ch === "#" && (pos === 0 || /\s/.test(text[pos - 1]))) {
        m = /#[^\n]*/y; m.lastIndex = pos; const r = m.exec(text);
        out.push(["com", r[0]]); pos += r[0].length; continue;
      }
      if (ch === '"') {
        m = /"(?:\\[\s\S]|[^"\\])*"?/y; m.lastIndex = pos; const r = m.exec(text);
        out.push(["str", r[0]]); pos += r[0].length; cmdPos = false; continue;
      }
      if (ch === "'") {
        m = /'[^']*'?/y; m.lastIndex = pos; const r = m.exec(text);
        out.push(["str", r[0]]); pos += r[0].length; cmdPos = false; continue;
      }
      if (ch === "$") {
        m = /\$(?:\{[^}\n]*\}|\([^)\n]*\)|[A-Za-z_]\w*|[0-9@#?*$!-])/y; m.lastIndex = pos; const r = m.exec(text);
        if (r) { out.push(["var", r[0]]); pos += r[0].length; cmdPos = false; continue; }
      }
      if (rest === "&&" || rest === "||") {
        out.push(["op", rest]); pos += 2; cmdPos = true; continue;
      }
      if (/[|;&()]/.test(ch)) {
        out.push(["op", ch]); pos += 1; cmdPos = true; continue;
      }
      if (/[<>]/.test(ch)) {
        out.push(["op", ch]); pos += 1; continue;
      }
      if (ch === "-" && (pos === 0 || /\s/.test(text[pos - 1])) && !cmdPos) {
        m = /--?[A-Za-z0-9][\w-]*/y; m.lastIndex = pos; const r = m.exec(text);
        if (r) { out.push(["flag", r[0]]); pos += r[0].length; continue; }
      }
      m = /[A-Za-z0-9_.\/~+:@%,-][\w.\/~+:@%,=-]*/y; m.lastIndex = pos;
      const r = m.exec(text);
      if (r) {
        const word = r[0];
        let t = "";
        if (SH_KW.has(word)) t = "kw";
        else if (cmdPos && /^[A-Za-z_]\w*=/.test(word)) t = "var";
        else if (cmdPos) t = "cmd";
        else if (/^\d+(?:\.\d+)?$/.test(word)) t = "num";
        out.push([t, word]);
        pos += word.length;
        if (t === "var") cmdPos = true;
        else cmdPos = SH_KEEP_CMD.has(word);
        continue;
      }
      out.push(["", ch]);
      pos += 1;
    }
    return out;
  }

  function tokenizeJson(text) {
    const out = [];
    let pos = 0;
    while (pos < text.length) {
      let m = /"(?:\\.|[^"\\\n])*"?/y; m.lastIndex = pos; let r = m.exec(text);
      if (r) {
        const after = /\s*:/y; after.lastIndex = pos + r[0].length;
        out.push([after.test(text) ? "key" : "str", r[0]]); pos += r[0].length; continue;
      }
      m = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y; m.lastIndex = pos; r = m.exec(text);
      if (r) { out.push(["num", r[0]]); pos += r[0].length; continue; }
      m = /\b(?:true|false|null)\b/y; m.lastIndex = pos; r = m.exec(text);
      if (r) { out.push(["const", r[0]]); pos += r[0].length; continue; }
      m = /\/\/[^\n]*/y; m.lastIndex = pos; r = m.exec(text);
      if (r) { out.push(["com", r[0]]); pos += r[0].length; continue; }
      out.push(["", text[pos]]); pos += 1;
    }
    return out;
  }

  function tokenizeYaml(text) {
    const out = [];
    let pos = 0;
    while (pos < text.length) {
      const ch = text[pos];
      const head = lineHead(text, pos);
      let m, r;
      if (ch === "#" && (pos === 0 || /\s/.test(text[pos - 1]))) {
        m = /#[^\n]*/y; m.lastIndex = pos; r = m.exec(text);
        out.push(["com", r[0]]); pos += r[0].length; continue;
      }
      if (/^[ \t]*(?:-[ \t]+)*$/.test(head)) {
        m = /(?:[A-Za-z_$][\w.\-$\/ ]*?|"[^"\n]*"|'[^'\n]*')(?=[ \t]*:(?:[ \t]|\n|$))/y; m.lastIndex = pos; r = m.exec(text);
        if (r && r[0]) { out.push(["key", r[0]]); pos += r[0].length; continue; }
        if (ch === "-" && /[ \t\n]/.test(text[pos + 1] || "\n")) { out.push(["op", "-"]); pos += 1; continue; }
      }
      if (ch === '"' || ch === "'") {
        m = ch === '"' ? /"(?:\\.|[^"\\\n])*"?/y : /'[^'\n]*'?/y; m.lastIndex = pos; r = m.exec(text);
        out.push(["str", r[0]]); pos += r[0].length; continue;
      }
      if (ch === "&" || ch === "*") {
        m = /[&*][\w-]+/y; m.lastIndex = pos; r = m.exec(text);
        if (r) { out.push(["var", r[0]]); pos += r[0].length; continue; }
      }
      m = /[^\s#,\[\]{}]+/y; m.lastIndex = pos; r = m.exec(text);
      if (r) {
        const w = r[0];
        let t = "";
        if (/^-?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(w)) t = "num";
        else if (/^(?:true|false|null|yes|no|on|off|~|True|False|None)$/.test(w)) t = "const";
        out.push([t, w]); pos += w.length; continue;
      }
      out.push(["", ch]); pos += 1;
    }
    return out;
  }

  const LANGS = {
    python: tokenizePython, py: tokenizePython,
    bash: tokenizeShell, shell: tokenizeShell, sh: tokenizeShell, zsh: tokenizeShell, console: tokenizeShell,
    json: tokenizeJson, jsonl: tokenizeJson,
    yaml: tokenizeYaml, yml: tokenizeYaml, toml: tokenizeYaml,
  };

  const LANG_LABEL = { python: "Python", py: "Python", bash: "Bash", shell: "Shell", sh: "Shell", zsh: "Shell", console: "Shell", json: "JSON", jsonl: "JSONL", yaml: "YAML", yml: "YAML", toml: "TOML", text: "Text", txt: "Text" };

  /* Returns one HTML string per source line. Tokens that span lines (for
     example a triple-quoted docstring) are split so every line is balanced. */
  function highlight(text, lang) {
    const tok = LANGS[(lang || "").toLowerCase()];
    const tokens = tok ? tok(text) : [["", text]];
    const lines = [""];
    for (const [type, value] of tokens) {
      const parts = value.split("\n");
      parts.forEach((part, i) => {
        if (i > 0) lines.push("");
        if (!part) return;
        lines[lines.length - 1] += type ? '<span class="tok-' + type + '">' + esc(part) + "</span>" : esc(part);
      });
    }
    return lines;
  }

  /* ------------------------------------------------------------------------
     Code listings
     ------------------------------------------------------------------------ */
  function parseRange(value) {
    if (!value) return null;
    const m = String(value).trim().match(/^L?(\d+)(?:\s*[-–:]\s*L?(\d+))?$/);
    if (!m) return null;
    const a = parseInt(m[1], 10);
    const b = m[2] ? parseInt(m[2], 10) : a;
    return [a, b];
  }

  /* "5,9-11" is relative to the listing (1 = first line shown).
     "L23" or "L23-L25" is an absolute file line number. */
  function parseHighlight(value, start) {
    const rel = new Set();
    if (!value) return rel;
    String(value).split(",").forEach((part) => {
      const p = part.trim();
      if (!p) return;
      const abs = /^L/i.test(p);
      const m = p.replace(/L/gi, "").match(/^(\d+)(?:\s*-\s*(\d+))?$/);
      if (!m) return;
      let a = parseInt(m[1], 10);
      let b = m[2] ? parseInt(m[2], 10) : a;
      if (abs) { a = a - start + 1; b = b - start + 1; }
      for (let i = Math.min(a, b); i <= Math.max(a, b); i++) rel.add(i);
    });
    return rel;
  }

  function githubUrl(src, range) {
    const path = src.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/");
    let url = REPO_BLOB + path;
    if (range) url += range[0] === range[1] ? "#L" + range[0] : "#L" + range[0] + "-L" + range[1];
    return url;
  }

  function pathHtml(src) {
    const parts = src.split("/");
    const file = parts.pop();
    const dir = parts.length ? esc(parts.join("/")) + "/" : "";
    return "<bdi>" + dir + "<b>" + esc(file) + "</b></bdi>";
  }

  let listingCount = 0;

  function initListing(fig) {
    if (fig.dataset.ctReady) return;
    fig.dataset.ctReady = "1";
    listingCount += 1;
    const { code, text } = readCode(fig);
    if (!code) return;
    const pre = code.closest("pre") || code;
    const src = (fig.dataset.src || "").trim();
    const lang = (fig.dataset.lang || (src.match(/\.(py|sh|json|jsonl|ya?ml|toml)$/) || [])[1] || "text").toLowerCase();
    const range = parseRange(fig.dataset.lines);
    const start = range ? range[0] : parseInt(fig.dataset.start || "1", 10) || 1;
    const isDiff = fig.hasAttribute("data-diff");

    if (!fig.id) {
      const base = src ? src.replace(/^.*\//, "").replace(/[^\w]+/g, "-").toLowerCase() : "code";
      fig.id = "listing-" + listingCount + "-" + base;
    }

    // Split the diff markers from the code so the highlighter sees clean code.
    const rawLines = text.split("\n");
    const marks = [];
    const clean = rawLines.map((line) => {
      if (!isDiff) { marks.push(""); return line; }
      if (line.startsWith("@@")) { marks.push("hunk"); return line; }
      const c = line[0];
      if (c === "+") { marks.push("add"); return line.slice(1); }
      if (c === "-") { marks.push("del"); return line.slice(1); }
      marks.push("ctx");
      return c === " " ? line.slice(1) : line;
    });
    const html = highlight(clean.join("\n"), lang);
    const hl = parseHighlight(fig.dataset.highlight, start);

    let n = start;
    const width = String(start + rawLines.length).length;
    fig.style.setProperty("--ct-gutter", (Math.max(width, 2) + 1.6) + "ch");
    const rows = html.map((lineHtml, i) => {
      const mark = marks[i];
      const cls = ["ct-line"];
      let num = "";
      let markAttr = "";
      if (mark === "hunk") {
        cls.push("is-hunk");
        const reset = clean[i].match(/\+(\d+)/);
        if (reset) n = parseInt(reset[1], 10);
      } else if (mark === "del") {
        cls.push("is-del");
        markAttr = ' data-mark="-"';
      } else {
        num = String(n);
        n += 1;
        if (mark === "add") { cls.push("is-add"); markAttr = ' data-mark="+"'; }
      }
      if (hl.has(i + 1)) cls.push("is-hl");
      return '<span class="' + cls.join(" ") + '" data-n="' + num + '"' + markAttr + '><span class="ct-src">' + (lineHtml || "") + "</span>\n</span>";
    });
    code.innerHTML = rows.join("");
    code.classList.add("language-" + lang);
    pre.setAttribute("tabindex", "0");
    pre.setAttribute("aria-label", (src || "Code") + (range ? ", lines " + range[0] + " to " + range[1] : ""));

    // Copy gives the code as it stands after the change (no diff markers).
    const copySource = isDiff
      ? clean.filter((_, i) => marks[i] === "ctx" || marks[i] === "add").join("\n")
      : text;

    const head = el("div", "ct-file-head");
    const tab = el("div", "ct-file-tab");
    tab.appendChild(el("span", "ct-file-icon"));
    const title = src || fig.dataset.title || LANG_LABEL[lang] || lang;
    const path = el("span", "ct-file-path", src ? pathHtml(src) : "<bdi><b>" + esc(title) + "</b></bdi>");
    path.title = title;
    tab.appendChild(path);
    head.appendChild(tab);
    const meta = el("div", "ct-file-meta");
    meta.appendChild(el("span", "ct-lang", esc(LANG_LABEL[lang] || lang)));
    if (range) meta.appendChild(el("span", "ct-range", "L" + range[0] + (range[1] !== range[0] ? "&ndash;" + range[1] : "")));
    if (isDiff) meta.appendChild(el("span", "ct-range", "diff"));
    if (src) {
      const gh = el("a", "ct-btn ct-gh", ICON_GH + '<span><span class="ct-btn-label-long">View on </span>GitHub</span>');
      gh.href = githubUrl(src, range);
      gh.target = "_blank";
      gh.rel = "noopener noreferrer";
      gh.setAttribute("aria-label", "View " + src + (range ? " lines " + range[0] + " to " + range[1] : "") + " on GitHub");
      meta.appendChild(gh);
    }
    meta.appendChild(copyButton(() => copySource));
    head.appendChild(meta);
    fig.insertBefore(head, fig.firstChild);

    if (isDiff) {
      const legend = el("div", "ct-diff-legend", '<span class="add">added</span><span class="del">removed</span>');
      pre.insertAdjacentElement("afterend", legend);
    }
  }

  /* ------------------------------------------------------------------------
     Multi-file tabs
     ------------------------------------------------------------------------ */
  let tabsCount = 0;
  function initTabs(box) {
    if (box.dataset.ctReady) return;
    box.dataset.ctReady = "1";
    tabsCount += 1;
    const panels = [...box.querySelectorAll(":scope > .code-listing")];
    if (!panels.length) return;
    const list = el("div", "ct-tablist");
    list.setAttribute("role", "tablist");
    list.setAttribute("aria-label", box.dataset.label || "Files");
    const buttons = panels.map((panel, i) => {
      const label = panel.dataset.tab || (panel.dataset.src || panel.dataset.title || "File " + (i + 1)).replace(/^.*\//, "");
      const btn = el("button", null, esc(label));
      btn.type = "button";
      btn.id = "ct-tab-" + tabsCount + "-" + i;
      btn.setAttribute("role", "tab");
      btn.setAttribute("aria-controls", panel.id);
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", btn.id);
      btn.addEventListener("click", () => select(i, true));
      btn.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
          e.preventDefault();
          const j = (i + (e.key === "ArrowRight" ? 1 : -1) + panels.length) % panels.length;
          select(j, true);
          buttons[j].focus();
        }
      });
      list.appendChild(btn);
      return btn;
    });
    function select(k, user) {
      panels.forEach((p, i) => { p.hidden = i !== k; });
      buttons.forEach((b, i) => {
        b.setAttribute("aria-selected", String(i === k));
        b.tabIndex = i === k ? 0 : -1;
      });
      if (user) document.dispatchEvent(new CustomEvent("ct:layout"));
    }
    box.insertBefore(list, box.firstChild);
    select(Math.max(0, panels.findIndex((p) => p.hasAttribute("data-active"))), false);
  }

  /* ------------------------------------------------------------------------
     Terminal and output blocks
     ------------------------------------------------------------------------ */
  function decorateOutput(lineHtml) {
    return lineHtml
      .replace(/\b(\d+ passed|PASSED|passed|OK)\b/g, '<span class="tok-pass">$1</span>')
      .replace(/\b(\d+ failed|FAILED|FAIL|Error|\w*Error(?=:)|Traceback)\b/g, '<span class="tok-fail">$1</span>')
      .replace(/\b(\d+ (?:warnings?|skipped|deselected|xfailed))\b/g, '<span class="tok-warn">$1</span>');
  }

  function initTerminal(fig) {
    if (fig.dataset.ctReady) return;
    fig.dataset.ctReady = "1";
    const { code, text } = readCode(fig);
    if (!code) return;
    const prompt = fig.dataset.prompt || "$";
    const lines = text.split("\n");
    const commands = [];
    const parts = [];
    let inCmd = false;
    let cmdBuf = [];
    lines.forEach((line) => {
      const isStart = line.startsWith(prompt + " ") || line === prompt;
      if (isStart || inCmd) {
        const body = isStart ? line.slice(prompt.length + 1) : line;
        cmdBuf.push(body);
        const shown = highlight(body, "bash")[0] || "";
        parts.push('<span class="ct-cmd">' + (isStart ? '<span class="ct-prompt" aria-hidden="true">' + esc(prompt) + "</span>" : '<span class="ct-prompt" aria-hidden="true">' + "&nbsp;".repeat(prompt.length) + "</span>") + shown + "\n</span>");
        inCmd = /\\$/.test(line);
        if (!inCmd) { commands.push(cmdBuf.join("\n")); cmdBuf = []; }
      } else {
        parts.push('<span class="ct-out">' + (decorateOutput(esc(line)) || " ") + "\n</span>");
      }
    });
    if (cmdBuf.length) commands.push(cmdBuf.join("\n"));
    code.innerHTML = parts.join("");
    const pre = code.closest("pre") || code;
    pre.setAttribute("tabindex", "0");

    const head = el("div", "ct-term-head");
    head.appendChild(el("span", "ct-term-glyph", "&gt;_"));
    head.appendChild(el("span", null, esc(fig.dataset.label || "Terminal")));
    if (fig.dataset.cwd) head.appendChild(el("span", "ct-term-cwd", "~/" + esc(fig.dataset.cwd.replace(/^~\//, ""))));
    if (commands.length) {
      const btn = copyButton(() => commands.join("\n"), commands.length > 1 ? "Copy commands" : "Copy command");
      head.appendChild(btn);
    }
    fig.insertBefore(head, fig.firstChild);
  }

  function initOutput(fig) {
    if (fig.dataset.ctReady) return;
    fig.dataset.ctReady = "1";
    const { code, text } = readCode(fig);
    if (!code) return;
    code.innerHTML = esc(text)
      .replace(/torch\.Size\(\[[^\]]*\]\)/g, '<span class="tok-shape">$&</span>')
      .replace(/\b(?:dtype|device)=[\w.:']+/g, '<span class="tok-dtype">$&</span>')
      .replace(/\b(shape)([=:] ?)(\([^)\n]*\))/g, '$1$2<span class="tok-shape">$3</span>');
    const pre = code.closest("pre") || code;
    pre.setAttribute("tabindex", "0");
    const head = el("div", "ct-out-head");
    head.appendChild(el("span", null, esc(fig.dataset.label || "Output")));
    if (fig.dataset.from) head.appendChild(el("span", "ct-out-from", "&middot; " + esc(fig.dataset.from)));
    fig.insertBefore(head, fig.firstChild);
  }

  /* ------------------------------------------------------------------------
     Shape tables and repo trees
     ------------------------------------------------------------------------ */
  function initShapeTable(table) {
    if (table.parentElement && table.parentElement.classList.contains("shape-table-wrap")) return;
    const wrap = el("div", "shape-table-wrap");
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  }

  function initRepoTree(pre) {
    if (pre.dataset.ctReady) return;
    pre.dataset.ctReady = "1";
    const lines = pre.textContent.replace(/^\n/, "").replace(/\n$/, "").split("\n");
    pre.innerHTML = lines.map((line) => {
      const m = line.match(/^([\s│├└─|`\-+]*)(.*?)(\s+#.*)?$/);
      if (!m) return esc(line);
      const branch = m[1] || "";
      const name = m[2] || "";
      const note = m[3] || "";
      const nameCls = /\/$/.test(name) ? "tree-dir" : "tree-file";
      return '<span class="tree-branch">' + esc(branch) + "</span>" + (name ? '<span class="' + nameCls + '">' + esc(name) + "</span>" : "") + (note ? '<span class="tree-note">' + esc(note) + "</span>" : "");
    }).join("\n");
  }

  /* ------------------------------------------------------------------------
     Build steps, progress rail, and narrow-screen pill
     ------------------------------------------------------------------------ */
  function initBuildSteps() {
    const steps = [...document.querySelectorAll("section.build-step")];
    if (!steps.length) return;
    const total = steps.length;
    const info = steps.map((step, i) => {
      const badge = step.querySelector(".build-step__badge");
      const num = step.dataset.step || (badge ? (badge.textContent.match(/\d+/) || [])[0] : "") || String(i + 1).padStart(2, "0");
      const h = step.querySelector("h2, h3");
      const title = step.dataset.stepTitle || (h ? h.textContent.trim() : "Step " + num);
      const files = [];
      const seen = new Set();
      step.querySelectorAll(".code-listing[data-src]").forEach((fig) => {
        const src = fig.dataset.src.trim();
        if (seen.has(src)) return;
        seen.add(src);
        files.push({ src, id: fig.id });
      });
      const top = step.querySelector(".build-step__topline");
      if (top && !top.querySelector(".build-step__dots")) {
        const dots = el("span", "build-step__dots");
        dots.setAttribute("aria-hidden", "true");
        for (let k = 0; k < total; k++) dots.appendChild(el("i", k < i ? "is-done" : k === i ? "is-here" : ""));
        top.appendChild(dots);
      }
      return { step, num, title, files };
    });
    if (total < 2) return;

    // Wide rail
    const rail = el("nav", "build-rail");
    rail.setAttribute("aria-label", "Build progress");
    rail.innerHTML = '<p class="build-rail__title">Build progress</p><p class="build-rail__count"></p><div class="build-rail__bar"><i></i></div>';
    const list = el("ol");
    info.forEach((s) => {
      const li = el("li");
      const a = el("a", "build-rail__step", "<b>" + esc(s.num) + "</b><span>" + esc(s.title) + "</span>");
      a.href = "#" + s.step.id;
      li.appendChild(a);
      if (s.files.length) {
        const fl = el("ul", "build-rail__files");
        fl.style.listStyle = "none";
        s.files.forEach((f) => {
          const fi = el("li");
          const fa = el("a", "build-rail__file", esc(f.src.replace(/^.*\//, "")));
          fa.href = "#" + f.id;
          fa.title = f.src;
          fi.appendChild(fa);
          fl.appendChild(fi);
        });
        li.appendChild(fl);
      }
      list.appendChild(li);
      s.li = li;
      s.link = a;
    });
    rail.appendChild(list);
    document.body.appendChild(rail);
    const countEl = rail.querySelector(".build-rail__count");
    const barEl = rail.querySelector(".build-rail__bar i");

    // Narrow pill
    const pill = el("div", "build-pill");
    const pillBtn = el("button");
    pillBtn.type = "button";
    pillBtn.setAttribute("aria-expanded", "false");
    pillBtn.setAttribute("aria-haspopup", "true");
    const menu = el("ol", "build-pill__menu");
    menu.hidden = true;
    menu.id = "build-pill-menu";
    pillBtn.setAttribute("aria-controls", menu.id);
    info.forEach((s) => {
      const li = el("li");
      const a = el("a", null, esc(s.num) + " &middot; " + esc(s.title));
      a.href = "#" + s.step.id;
      a.addEventListener("click", () => toggleMenu(false));
      li.appendChild(a);
      menu.appendChild(li);
      s.pillLink = a;
    });
    pill.append(menu, pillBtn);
    document.body.appendChild(pill);
    function toggleMenu(open) {
      menu.hidden = !open;
      pillBtn.setAttribute("aria-expanded", String(open));
    }
    pillBtn.addEventListener("click", () => toggleMenu(menu.hidden));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { toggleMenu(false); pillBtn.focus(); } });
    document.addEventListener("click", (e) => { if (!pill.contains(e.target)) toggleMenu(false); });

    const RAIL_MIN = 1280;
    let intruders = [];
    let dirty = true;
    let current = -1;
    let ticking = false;
    const main = document.querySelector("main") || document.body;

    function measure() {
      dirty = false;
      intruders = [];
      if (window.innerWidth < RAIL_MIN) return;
      const railLeft = window.innerWidth - 24 - 196 - 12;
      // Walk the tree, but do not descend into boxes that clip their
      // children (scroll containers, SVGs): only the box itself can intrude.
      (function walk(node) {
        for (const child of node.children) {
          const cs = getComputedStyle(child);
          if (cs.display === "none" || cs.position === "fixed") continue;
          const r = child.getBoundingClientRect();
          if (r.width >= 2 && r.height >= 2 && r.right > railLeft && cs.visibility !== "hidden") {
            intruders.push(child);
            continue;
          }
          const clips = child.tagName.toLowerCase() === "svg" || cs.overflowX !== "visible";
          if (!clips) walk(child);
        }
      })(main);
    }

    function update() {
      ticking = false;
      if (dirty) measure();
      const vh = window.innerHeight;
      const line = Math.max(120, vh * 0.32);
      let idx = -1;
      info.forEach((s, i) => { if (s.step.getBoundingClientRect().top <= line) idx = i; });
      const firstTop = info[0].step.getBoundingClientRect().top;
      const lastBottom = info[total - 1].step.getBoundingClientRect().bottom;
      const inRegion = firstTop < vh * 0.75 && lastBottom > vh * 0.3;
      const shown = Math.max(0, idx);
      if (shown !== current) {
        current = shown;
        info.forEach((s, i) => {
          s.li.classList.toggle("is-done", i < current);
          s.li.classList.toggle("is-current", i === current);
          if (i === current) { s.link.setAttribute("aria-current", "step"); s.pillLink.setAttribute("aria-current", "step"); }
          else { s.link.removeAttribute("aria-current"); s.pillLink.removeAttribute("aria-current"); }
        });
        countEl.textContent = "Step " + (current + 1) + " of " + total;
        barEl.style.width = ((current + 1) / total) * 100 + "%";
        pillBtn.innerHTML = "<b>" + esc(info[current].num) + "/" + String(total).padStart(2, "0") + "</b><span>" + esc(info[current].title) + "</span>";
        pillBtn.setAttribute("aria-label", "Build progress: step " + (current + 1) + " of " + total + ", " + info[current].title + ". Open step list");
        const a = info[current].link;
        if (a.offsetTop < rail.scrollTop || a.offsetTop + a.offsetHeight > rail.scrollTop + rail.clientHeight) rail.scrollTop = a.offsetTop - 60;
      }
      const wide = window.innerWidth >= RAIL_MIN;
      let blocked = false;
      if (wide && inRegion) {
        const top = 92;
        const bottom = top + rail.offsetHeight + 8;
        blocked = intruders.some((node) => {
          const r = node.getBoundingClientRect();
          return r.bottom > top && r.top < bottom;
        });
      }
      rail.classList.toggle("is-visible", wide && inRegion && !blocked);
      pill.classList.toggle("is-visible", !wide && inRegion);
      if (!(!wide && inRegion)) toggleMenu(false);
    }

    function request() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", () => { dirty = true; request(); }, { passive: true });
    window.addEventListener("load", () => { dirty = true; request(); });
    document.addEventListener("ct:layout", () => { dirty = true; request(); });
    document.querySelectorAll("details").forEach((d) => d.addEventListener("toggle", () => { dirty = true; request(); }));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { dirty = true; request(); });
    update();
  }

  /* ------------------------------------------------------------------------
     Stepper for animated figures (follows the blog ANIMATION CONTRACT)
     CT.stepper(figure, {
       frames: [{ note: "..." }, ...]   // or a number of frames
       render(i, t, from)               // draw frame i; t in [0,1] eased; from = previous frame
       tween: 900, hold: 1700,          // ms at 1x
       autoplay: true, loop: true
     })
     ------------------------------------------------------------------------ */
  function ease(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function svg(tag, attrs, parent) {
    const node = document.createElementNS("http://www.w3.org/2000/svg", tag);
    if (attrs) Object.keys(attrs).forEach((k) => {
      if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    if (parent) parent.appendChild(node);
    return node;
  }

  function buildControls(fig) {
    const c = el("div", "ct-controls");
    c.setAttribute("role", "group");
    c.setAttribute("aria-label", "Animation controls");
    c.innerHTML =
      '<button type="button" data-action="previous" aria-label="Previous animation frame">Previous</button>' +
      '<button type="button" data-action="play-pause" aria-label="Pause animation" aria-pressed="true">Pause</button>' +
      '<button type="button" data-action="next" aria-label="Next animation frame">Next</button>' +
      '<button type="button" data-speed="0.5" aria-label="Play animation at half speed" aria-pressed="false">0.5x</button>' +
      '<button type="button" data-speed="1" aria-label="Play animation at normal speed" aria-pressed="true">1x</button>' +
      '<button type="button" data-speed="2" aria-label="Play animation at double speed" aria-pressed="false">2x</button>' +
      '<span class="ct-status" aria-live="polite">Frame 01 / 01</span>';
    const cap = fig.querySelector(":scope > figcaption");
    if (cap) fig.insertBefore(c, cap);
    else fig.appendChild(c);
    return c;
  }

  function stepper(fig, opts) {
    const frames = typeof opts.frames === "number" ? Array.from({ length: opts.frames }, () => ({})) : opts.frames;
    const total = frames.length;
    const controls = fig.querySelector(".ct-controls") || buildControls(fig);
    const status = controls.querySelector(".ct-status");
    const playBtn = controls.querySelector('[data-action="play-pause"]');
    const speedBtns = [...controls.querySelectorAll("[data-speed]")];
    const note = fig.querySelector(".ct-figure__note");
    const stage = fig.querySelector(".ct-figure__stage");
    if (note) note.setAttribute("aria-live", "polite");
    if (stage && !stage.hasAttribute("tabindex")) stage.tabIndex = 0;
    if (REDUCED) fig.classList.add("is-reduced");

    const tweenMs = opts.tween || 900;
    const holdMs = opts.hold || 1700;
    const loop = opts.loop !== false;
    let index = 0;
    let from = 0;
    let speed = 1;
    let playing = !REDUCED && opts.autoplay !== false;
    let visible = false;
    let phase = "hold";
    let elapsed = holdMs;
    let last = 0;
    let raf = 0;

    function pad(n) { return String(n).padStart(2, "0"); }

    function draw(t) {
      opts.render(index, REDUCED ? 1 : ease(Math.min(1, Math.max(0, t))), from);
    }

    function setStatus() {
      if (status) status.textContent = "Frame " + pad(index + 1) + " / " + pad(total);
      if (note && frames[index] && frames[index].note != null) note.innerHTML = frames[index].note;
    }

    function setPlayUi() {
      playBtn.textContent = playing ? "Pause" : "Play";
      playBtn.setAttribute("aria-pressed", String(playing));
      playBtn.setAttribute("aria-label", playing ? "Pause animation" : "Play animation");
    }

    function go(target, animate) {
      from = index;
      index = (target + total) % total;
      setStatus();
      if (!animate || REDUCED) { phase = "hold"; elapsed = 0; draw(1); return; }
      phase = "tween";
      elapsed = 0;
      draw(0);
      kick();
    }

    function tick(now) {
      raf = 0;
      const dt = last ? Math.min(64, now - last) : 16;
      last = now;
      elapsed += dt * speed;
      if (phase === "tween") {
        draw(elapsed / tweenMs);
        if (elapsed >= tweenMs) { phase = "hold"; elapsed = 0; }
      } else if (playing && visible) {
        if (elapsed >= holdMs) {
          if (!loop && index === total - 1) { playing = false; setPlayUi(); }
          else go(index + 1, true);
        }
      }
      if (phase === "tween" || (playing && visible)) { if (!raf) raf = requestAnimationFrame(tick); }
      else last = 0;
    }

    function kick() {
      if (!raf) { last = 0; raf = requestAnimationFrame(tick); }
    }

    function pause() { playing = false; setPlayUi(); }

    controls.addEventListener("click", (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
      const action = btn.dataset.action;
      if (action === "previous") { pause(); go(index - 1, true); }
      else if (action === "next") { pause(); go(index + 1, true); }
      else if (action === "play-pause") {
        playing = !playing;
        if (playing && phase === "hold") elapsed = Math.min(elapsed, holdMs * 0.6);
        setPlayUi();
        kick();
      } else if (btn.dataset.speed) {
        speed = parseFloat(btn.dataset.speed) || 1;
        speedBtns.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      }
    });

    if (stage) stage.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); pause(); go(index + 1, true); }
      if (e.key === "ArrowLeft") { e.preventDefault(); pause(); go(index - 1, true); }
    });
    // Manual interaction inside the stage (for example a slider) pauses playback.
    fig.addEventListener("pointerdown", (e) => { if (!controls.contains(e.target) && playing) pause(); });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((en) => { visible = en.isIntersecting; if (visible) kick(); });
      }, { threshold: 0.35 }).observe(fig);
    } else {
      visible = true;
    }

    setPlayUi();
    setStatus();
    draw(1);
    if (opts.start) go(opts.start, false);

    return {
      go: (i) => { pause(); go(i, true); },
      get index() { return index; },
      total,
      redraw: () => draw(1),
    };
  }

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function boot() {
    document.querySelectorAll("figure.code-listing, div.code-listing").forEach(initListing);
    document.querySelectorAll(".code-tabs").forEach(initTabs);
    document.querySelectorAll(".terminal").forEach(initTerminal);
    document.querySelectorAll(".code-output").forEach(initOutput);
    document.querySelectorAll("table.shape-table").forEach(initShapeTable);
    document.querySelectorAll(".repo-tree pre").forEach(initRepoTree);
    initBuildSteps();
    document.documentElement.classList.add("ct-ready");
  }

  window.CT = { highlight, stepper, ease, lerp, svg, copyText, githubUrl, REPO };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
