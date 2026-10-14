/**
 * Floating Toast Notification System (Universal Special Characters)
 */
window.TII_App = window.TII_App || {};

window.TII_App.Notifications = {
  container: null,
  init() { this.container = document.getElementById("toast-container"); },
  show(msg, duration = 3400) {
    if (!this.container) this.container = document.getElementById("toast-container");
    if (!this.container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `<span style="color:var(--color-gold-radiant); font-family:var(--font-mono); font-weight:900;">[*]</span><span>${msg}</span>`;
    this.container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(100%)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
};
