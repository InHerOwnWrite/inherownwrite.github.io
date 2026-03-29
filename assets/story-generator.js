(function () {
  // ── config ──────────────────────────────────────────────────────────────────
  const BLOG_NAME = 'In Her Own Write';
  const BLOG_URL  = 'inherownwrite.com';
  const FONT      = '"EB Garamond", Georgia, serif';

  // ── state ───────────────────────────────────────────────────────────────────
  let currentQuote = '';
  let bubble = null;

  // ── helpers ─────────────────────────────────────────────────────────────────
  function getPostTitle() {
    const el = document.querySelector('h1.post-title, h1.entry-title, article h1, .post-heading h1, h1');
    return el ? el.textContent.trim() : document.title.replace(' – ' + BLOG_NAME, '').trim();
  }

  // ── styles ───────────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #qc-bubble {
      position: absolute; z-index: 99999;
      background: #1a1a1a; color: #faf9f6;
      border: none; border-radius: 3px;
      padding: 7px 13px; font-size: 13px;
      font-family: ${FONT};
      letter-spacing: 0.03em; cursor: pointer;
      box-shadow: 0 2px 12px rgba(0,0,0,0.18);
      white-space: nowrap; display: none;
    }
    #qc-bubble:hover { background: #333; }
    #qc-overlay {
      display: none; position: fixed; inset: 0;
      background: rgba(0,0,0,0.7); z-index: 100000;
      align-items: center; justify-content: center; flex-direction: column;
    }
    #qc-overlay.active { display: flex; }
    #qc-preview {
      max-height: 80vh; max-width: 90vw;
      border-radius: 6px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }
    #qc-actions {
      margin-top: 16px; display: flex; gap: 12px;
    }
    #qc-actions button {
      padding: 10px 24px; border: none; border-radius: 3px;
      font-family: ${FONT}; font-size: 16px; cursor: pointer;
    }
    #qc-download-btn { background: #fff; color: #1a1a1a; font-weight: 600; }
    #qc-close-btn { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.4) !important; }
  `;
  document.head.appendChild(style);

  // ── bubble ───────────────────────────────────────────────────────────────────
  function showBubble(x, y) {
    if (!bubble) {
      bubble = document.createElement('button');
      bubble.id = 'qc-bubble';
      bubble.textContent = '✦ Quote on Story';
      bubble.addEventListener('mousedown', function (e) {
        e.preventDefault();
        openPreview(currentQuote, getPostTitle());
      });
      document.body.appendChild(bubble);
    }
    bubble.style.left    = x + 'px';
    bubble.style.top     = (y - 44) + 'px';
    bubble.style.display = 'block';
  }

  function hideBubble() {
    if (bubble) bubble.style.display = 'none';
  }

  document.addEventListener('mouseup', function () {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { hideBubble(); return; }
    const text = sel.toString().trim();
    if (text.length < 10) { hideBubble(); return; }
    currentQuote = text;
    const range  = sel.getRangeAt(0);
    const rect   = range.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;
    showBubble(scrollX + rect.left + rect.width / 2 - 70, scrollY + rect.top);
  });

  document.addEventListener('mousedown', function (e) {
    if (bubble && e.target !== bubble) hideBubble();
  });

  // ── preview modal ─────────────────────────────────────────────────────────────
  function openPreview(quote, title) {
    hideBubble();

    // build overlay if it doesn't exist yet
    let overlay = document.getElementById('qc-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'qc-overlay';
      overlay.innerHTML = `
        <img id="qc-preview" alt="Story preview" />
        <div id="qc-actions">
          <button id="qc-download-btn">Download</button>
          <button id="qc-close-btn">Close</button>
        </div>`;
      document.body.appendChild(overlay);

      document.getElementById('qc-close-btn').addEventListener('click', closePreview);
      overlay.addEventListener('click', function (e) {
        if (e.target === overlay) closePreview();
      });
    }

    const dataUrl = renderCanvas(quote, title);
    document.getElementById('qc-preview').src = dataUrl;
    overlay.classList.add('active');

    document.getElementById('qc-download-btn').onclick = function () {
      const a = document.createElement('a');
      a.download = 'story-card.png';
      a.href = dataUrl;
      a.click();
    };
  }

  function closePreview() {
    const overlay = document.getElementById('qc-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  // ── canvas ────────────────────────────────────────────────────────────────────
  function renderCanvas(quote, title) {
    const W = 1080, H = 1920, pad = 110;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext('2d');

    // background
    ctx.fillStyle = '#faf9f6';
    ctx.fillRect(0, 0, W, H);

    // top accent bar
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, W, 6);

    ctx.textAlign = 'left';
    const maxW = W - pad * 2;

    // footer block: rule + title + url — measure first so we can center everything
    const TITLE_SIZE = 38;
    const URL_SIZE   = 28;
    const RULE_H     = 2;
    const footerH    = 50 + RULE_H + 48 + Math.round(TITLE_SIZE * 1.5) + 10 + Math.round(URL_SIZE * 1.5);

    // blog name — fixed near top of content area
    const EYEBROW_Y = 260;
    ctx.font = '400 28px ' + FONT;
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText('IN HER OWN WRITE', pad, EYEBROW_Y);

    // quote — responsive font size, non-italic
    const MAX_FONT = 66, MIN_FONT = 28;
    // available zone: between eyebrow and footer, with some breathing room
    const zoneTop = EYEBROW_Y + 60;
    const zoneBot = H - 160 - footerH;
    const zoneH   = zoneBot - zoneTop;

    let fontSize = MAX_FONT;
    let lines, lineH;
    do {
      lineH = Math.round(fontSize * 1.43);
      ctx.font = '400 ' + fontSize + 'px ' + FONT;
      const words = ('\u201C' + quote + '\u201D').split(' ');
      lines = [];
      let line = '';
      for (const w of words) {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxW) { lines.push(line); line = w; }
        else line = test;
      }
      if (line) lines.push(line);
      if (lines.length * lineH <= zoneH) break;
      fontSize -= 2;
    } while (fontSize > MIN_FONT);

    // vertically center the quote block in the zone
    const textBlockH = lines.length * lineH;
    let y = zoneTop + (zoneH - textBlockH) / 2 + lineH;

    ctx.font = '400 ' + fontSize + 'px ' + FONT;
    ctx.fillStyle = '#1a1a1a';
    for (const ln of lines) { ctx.fillText(ln, pad, y); y += lineH; }

    // footer — rule, title (single line), url
    let fy = H - 160 - footerH + 50;
    ctx.fillStyle = '#cccccc';
    ctx.fillRect(pad, fy, 90, RULE_H);
    fy += 48;

    // title: single line, truncate with ellipsis if too wide
    ctx.font = '400 ' + TITLE_SIZE + 'px ' + FONT;
    ctx.fillStyle = '#555555';
    let displayTitle = title;
    while (displayTitle.length > 0 && ctx.measureText(displayTitle + '…').width > maxW) {
      displayTitle = displayTitle.slice(0, -1);
    }
    if (displayTitle !== title) displayTitle += '…';
    ctx.fillText(displayTitle, pad, fy);
    fy += Math.round(TITLE_SIZE * 1.5) + 10;

    ctx.font = '400 ' + URL_SIZE + 'px ' + FONT;
    ctx.fillStyle = '#aaaaaa';
    ctx.fillText(BLOG_URL.toUpperCase(), pad, fy);

    return canvas.toDataURL('image/png');
  }
})();
