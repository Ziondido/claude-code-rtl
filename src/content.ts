export const MARKER_START = '/* RTL-AUTO: start */';
export const MARKER_END   = '/* RTL-AUTO: end */';

export const RTL_CSS = `
${MARKER_START}

.YBYrtl[class*="userMessage_"],
.YBYrtl[class*="userMessageContainer_"] {
    direction: rtl;
    unicode-bidi: plaintext;
    text-align: right !important;
    align-items: flex-end !important;
    margin-left: auto !important;
    margin-right: 0 !important;
}

.YBYrtl [class*="content_"] > span { unicode-bidi: plaintext; }

.YBYrtl [class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) {
    direction: rtl;
    unicode-bidi: plaintext;
}

.YBYrtl [class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(p, ul, ol, h1, h2, h3, h4, blockquote),
.YBYrtl [class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) > :is(ul, ol) li {
    text-align: right;
}

.YBYrtl [class*="root_"]:not([class*="thinkingContent_"] [class*="root_"]) a { unicode-bidi: plaintext; }

#root [class*="messageInputContainer_"] > * {
    unicode-bidi: plaintext;
    text-align: start;
}

.YBYrtl pre,
.YBYrtl code,
.YBYrtl [class*="codeBlockWrapper_"],
.YBYrtl [class*="toolUse_"],
.YBYrtl [class*="toolSummary_"],
.YBYrtl [class*="toolBody_"],
.YBYrtl [class*="toolResult_"],
.YBYrtl [class*="thinking_"],
.YBYrtl [class*="thinkingContent_"],
.YBYrtl [class*="thinkingContainer_"] {
    direction: ltr !important;
    unicode-bidi: isolate !important;
    text-align: left !important;
}

/* Toggle button */
#yby-rtl-btn {
    width: 26px;
    height: 26px;
    border-radius: 4px;
    border: none;
    cursor: pointer;
    background: transparent;
    color: var(--vscode-foreground, #ccc);
    font-size: 15px;
    flex-shrink: 0;
    opacity: 0.4;
    transition: opacity 0.2s, background 0.15s;
    margin: auto 4px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}
#yby-rtl-btn.yby-on {
    opacity: 1;
    color: #4da6ff;
}
#yby-rtl-btn:hover { opacity: 0.9; background: rgba(255,255,255,0.08); }

${MARKER_END}
`;

export const RTL_JS = `
${MARKER_START}
(function() {
    var RTL = /[\\u0590-\\u05FF\\u0600-\\u06FF\\u0750-\\u077F\\uFB50-\\uFDFF\\uFE70-\\uFEFF]/;
    var CLS = 'YBYrtl';
    var SEL = '[class*="timelineMessage_"],[class*="userMessageContainer_"]';
    var KEY = 'yby-rtl-on';

    var enabled = localStorage.getItem(KEY) !== 'false';

    function tagBubble(el) {
        if (!enabled) return;
        if (!el.matches || !el.matches(SEL) || el.classList.contains(CLS)) return;
        if (RTL.test(el.textContent || '')) { el.classList.add(CLS); return; }
        var obs = new MutationObserver(function() {
            if (!enabled) { obs.disconnect(); return; }
            if (RTL.test(el.textContent || '')) { el.classList.add(CLS); obs.disconnect(); }
        });
        obs.observe(el, { childList: true, subtree: true, characterData: true });
    }

    function clearAll() {
        document.querySelectorAll('.' + CLS).forEach(function(el) { el.classList.remove(CLS); });
    }

    function scanAll() {
        var root = document.getElementById('root');
        if (root) root.querySelectorAll(SEL).forEach(tagBubble);
    }

    function updateInput() {
        var inputs = document.querySelectorAll('[class*="messageInputContainer_"] > *');
        inputs.forEach(function(el) {
            el.style.unicodeBidi = enabled ? 'plaintext' : '';
            el.style.direction = enabled ? '' : '';
            el.style.textAlign = enabled ? 'start' : '';
        });
    }

    function updateBtn(btn) {
        btn.classList.toggle('yby-on', enabled);
        btn.title = enabled ? 'RTL: On — click to disable' : 'RTL: Off — click to enable';
    }

    function insertBtn() {
        if (document.getElementById('yby-rtl-btn')) return;
        var header = document.querySelector('[class*="header_"]');
        if (!header) return;
        var btn = document.createElement('button');
        btn.id = 'yby-rtl-btn';
        btn.textContent = '⇄';
        updateBtn(btn);
        btn.addEventListener('click', function() {
            enabled = !enabled;
            localStorage.setItem(KEY, enabled ? 'true' : 'false');
            updateBtn(btn);
            if (enabled) scanAll(); else clearAll();
            updateInput();
        });
        header.appendChild(btn);
    }

    function init() {
        var root = document.getElementById('root');
        if (!root) return;
        if (enabled) { scanAll(); updateInput(); }
        new MutationObserver(function(muts) {
            insertBtn();
            if (!enabled) return;
            muts.forEach(function(m) {
                m.addedNodes.forEach(function(nd) {
                    if (nd.nodeType !== 1) return;
                    if (nd.matches) tagBubble(nd);
                    if (nd.querySelectorAll) nd.querySelectorAll(SEL).forEach(tagBubble);
                });
            });
        }).observe(root, { childList: true, subtree: true });
        insertBtn();
    }

    if (document.readyState !== 'loading') init();
    else document.addEventListener('DOMContentLoaded', init);
})();
${MARKER_END}
`;
