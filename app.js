/**
 * Main Application Orchestrator & Non-Blocking Bootstrapper — 7Version Seven7 ("{(/:-7-:\)}")
 * Binds all UI controllers synchronously at 0ms (never blocking on async WebCrypto)
 * and initializes the 16:9 1-to-1 Default Layout, Official Credit Page [7],
 * and Gemini 24-Hour Local & Global Hazard Radar [!]!
 */
window.TII_Booted = false;

window.TII_Bootstrap = function() {
  if (window.TII_Booted) return;
  window.TII_Booted = true;
  
  // 1. Initialize State & UI Controllers synchronously FIRST so every button responds at 0ms!
  window.TII_App.State.init();
  window.TII_App.Notifications.init();
  window.TII_App.Translator.init();
  window.TII_App.ViewportManager.init();
  window.TII_App.SaveState.init();
  window.TII_App.BitcoinDonate.init();
  window.TII_App.CreditsPage.init();
  window.TII_App.HazardRadar.init();
  window.TII_App.LiveBus.init();
  window.TII_App.TypingDisplay.init();
  window.TII_App.KeystrokeStreamer.init();
  window.TII_App.ChatController.init();
  window.TII_App.DateDirectory.init();
  window.TII_App.CityManager.init();
  window.TII_App.PrivateChat.init();
  window.TII_App.RadarMap.init();
  window.TII_App.GoogleMapsBridge.init();
  window.TII_App.LocationBlaster.init();
  window.TII_App.LocationGroups.init();
  window.TII_App.YouTubeHub.init();
  window.TII_App.GeminiGovernance.init();
  window.TII_App.Auth.init();
  window.TII_App.CloudToggle.init();
  window.TII_App.SoulsCounter.init();
  window.TII_App.SymbolCodex.init();
  window.TII_App.OSResizer.init();
  window.TII_App.HistoryRouter.init();
  window.TII_App.Diagnostics.init();
  
  // 2. Initialize WebCrypto asynchronously in background (never blocks button taps!)
  if (window.TII_App.CryptoVault) {
    window.TII_App.CryptoVault.init().catch(() => {});
  }
  
  const updateProfileUI = (user) => {
    const nameEl = document.getElementById("header-user-name");
    const statusEl = document.getElementById("header-user-status");
    if (nameEl) nameEl.textContent = user.displayName || user.nickname || "Guest";
    if (statusEl) statusEl.textContent = user.handle || "@guest";
  };
  updateProfileUI(window.TII_App.State.user);
  window.TII_App.Bus.on("user:updated", updateProfileUI);
  
  const audioBtn = document.getElementById("audio-toggle-btn");
  if (audioBtn) {
    audioBtn.addEventListener("click", () => {
      const enabled = window.TII_App.State.toggleFeature("audioChimes");
      audioBtn.textContent = enabled ? "*" : "-";
      window.TII_App.Notifications.show(enabled ? "[*] Harmonic chimes toggled ON" : "[-] Audio muted");
    });
  }
  
  const menuToggle = document.getElementById("menu-toggle-btn");
  const sidebar = document.getElementById("app-sidebar");
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => sidebar.classList.toggle("open"));
  }
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", window.TII_Bootstrap);
} else {
  window.TII_Bootstrap();
}
