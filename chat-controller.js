/**
 * Chat Controller, Date-Organized Cloud Renderer, Auto-Translator & AES-256-GCM Sealer
 * Uses 100% Universal Special Characters (Zero Emojis)
 */
window.TII_App = window.TII_App || {};

window.TII_App.ChatController = {
  init() {
    const sendBtn = document.getElementById("btn-send-message");
    if (sendBtn) sendBtn.addEventListener("click", () => this.sendCurrentMessage());
    
    const openDatesBtn = document.getElementById("btn-open-date-directory");
    if (openDatesBtn) {
      openDatesBtn.addEventListener("click", () => {
        window.TII_App.DateDirectory.toggleDrawer(!window.TII_App.State.dateDrawerOpen);
      });
    }
    
    window.TII_App.Bus.on("room:changed", () => this.renderMessages());
    window.TII_App.Bus.on("date:changed", () => this.renderMessages());
    window.TII_App.Bus.on("message:received", () => this.renderMessages());
    
    this.renderMessages();
  },
  
  async sendCurrentMessage() {
    const input = document.getElementById("chat-input-field");
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;
    
    const user = window.TII_App.State.user;
    const activeDate = window.TII_App.State.selectedDate === "ALL"
      ? window.TII_App.Config.TODAY_DATE
      : window.TII_App.State.selectedDate;
      
    const msgId = "msg-" + Date.now();
    if (window.TII_App.CryptoVault) {
      await window.TII_App.CryptoVault.sealText(msgId, text);
    }
    
    const msg = {
      id: msgId,
      date: activeDate,
      sender: user.nickname,
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      verified: !!user.isVerified,
      room: window.TII_App.State.currentRoom
    };
    
    window.TII_App.State.addMessage(msg);
    window.TII_App.LiveBus.broadcast("CHAT_MESSAGE", msg);
    window.TII_App.KeystrokeStreamer.clear();
  },
  
  renderMessages() {
    const stream = document.getElementById("messages-stream");
    if (!stream) return;
    
    const currentRoom = window.TII_App.State.currentRoom;
    const selectedDate = window.TII_App.State.selectedDate;
    const allMessages = window.TII_App.State.messages[currentRoom] || [];
    const myNick = window.TII_App.State.user?.nickname;
    
    const filtered = selectedDate === "ALL"
      ? allMessages
      : allMessages.filter(m => (m.date || window.TII_App.Config.TODAY_DATE) === selectedDate);
      
    const hintPill = `<div class="sky-gap-hint">[#] AES-256-GCM • [~] Auto-Translate • [$] Riddle of Symbol Manual • [⊕] Click Sky Between Clouds for Full Map</div>`;
    
    if (filtered.length === 0) {
      stream.innerHTML = hintPill + `
        <div class="cloud-box" style="align-self:center; text-align:center;">
          <div class="message-body">[*] Pure Sky on this Date — Type below to create the first encrypted cloud!</div>
        </div>
      `;
      if (window.TII_App.OSResizer) window.TII_App.OSResizer.decorateAllResizable();
      return;
    }
    
    const groupedByDate = {};
    filtered.forEach(m => {
      const d = m.date || window.TII_App.Config.TODAY_DATE;
      if (!groupedByDate[d]) groupedByDate[d] = [];
      groupedByDate[d].push(m);
    });
    
    const sortedDates = Object.keys(groupedByDate).sort();
    let html = hintPill;
    
    sortedDates.forEach(dateKey => {
      const label = window.TII_App.Config.DATE_LABELS[dateKey] || `§ ${dateKey}`;
      html += `<div class="date-chapter-banner" data-date-banner="${dateKey}" title="Click to isolate this day">[§] ${label} (${groupedByDate[dateKey].length} Clouds)</div>`;
      
      groupedByDate[dateKey].forEach((m, idx) => {
        const isMe = m.sender === myNick;
        const verifiedBadge = m.verified ? `<span title="Phone + 7-Digit PIN Verified">[*]</span>` : "";
        const delay = (idx % 4) * 0.4;
        
        const tr = (window.TII_App.State.features.autoTranslate && window.TII_App.Translator) ? window.TII_App.Translator.getSyncTranslation(m) : null;
        const showOrig = window.TII_App.Translator?.showOriginalMap?.[m.id];
        const displayedText = (tr && !showOrig) ? tr.translatedText : m.text;
        
        const translateBadgeHtml = tr
          ? `<span class="translate-badge" data-tr-id="${m.id}" title="Translated by Google Cloud Translation API — Click to toggle original">[~] ${tr.detectedSourceLanguage.toUpperCase()} -> ${window.TII_App.Translator.targetLang.toUpperCase()} (${showOrig ? 'Show Translation' : 'Original'})</span>`
          : "";
          
        html += `
          <div class="cloud-box ${isMe ? 'outgoing' : ''}" style="animation-delay: -${delay}s;">
            <div class="message-meta">
              <span class="message-sender ${m.verified ? 'verified' : ''}">(o) ${this.escapeHtml(m.sender)} ${verifiedBadge}</span>
              <span class="message-time">${m.time} • ${dateKey}</span>
            </div>
            <div class="message-body">${this.escapeHtml(displayedText)}</div>
            <div class="cloud-Sub-bar">
              <span class="crypto-seal-badge" data-seal-id="${m.id}" title="Click to inspect AES-256-GCM Ciphertext & SHA-256 Seal">[#] AES-256-GCM</span>
              ${translateBadgeHtml}
            </div>
          </div>
        `;
      });
    });
    
    stream.innerHTML = html;
    
    stream.querySelectorAll(".date-chapter-banner").forEach(banner => {
      banner.addEventListener("click", () => {
        const dKey = banner.getAttribute("data-date-banner");
        const nextDate = window.TII_App.State.selectedDate === dKey ? "ALL" : dKey;
        window.TII_App.State.setSelectedDate(nextDate, true);
      });
    });
    
    stream.querySelectorAll(".crypto-seal-badge").forEach(badge => {
      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        window.TII_App.CryptoVault.inspectSeal(badge.getAttribute("data-seal-id"));
      });
    });
    
    stream.querySelectorAll(".translate-badge").forEach(badge => {
      badge.addEventListener("click", (e) => {
        e.stopPropagation();
        const mid = badge.getAttribute("data-tr-id");
        window.TII_App.Translator.showOriginalMap[mid] = !window.TII_App.Translator.showOriginalMap[mid];
        this.renderMessages();
      });
    });
    
    if (window.TII_App.OSResizer) window.TII_App.OSResizer.decorateAllResizable();
    stream.scrollTop = stream.scrollHeight;
  },
  
  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};
