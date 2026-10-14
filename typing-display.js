/**
 * Live Typing Cloud Puffs Renderer (Universal Special Characters)
 */
window.TII_App = window.TII_App || {};

window.TII_App.TypingDisplay = {
  container: null,
  init() {
    this.container = document.getElementById("live-typers-flow");
    window.TII_App.Bus.on("typers:updated", () => this.render());
    window.TII_App.Bus.on("room:changed", () => this.render());
    this.render();
  },
  render() {
    if (!this.container) return;
    const typers = window.TII_App.State.activeTypers;
    const currentRoom = window.TII_App.State.currentRoom;
    const myNick = window.TII_App.State.user?.nickname;
    const activeInRoom = Object.keys(typers).filter(nick => {
      const data = typers[nick];
      return data.room === currentRoom && data.text && data.text.length > 0;
    });
    if (activeInRoom.length === 0) {
      this.container.innerHTML = `<span style="font-size:0.76rem; color:rgba(242,249,255,0.78); font-style:italic;">[~] Type below to stream your live cloud keystrokes in real time...</span>`;
      return;
    }
    this.container.innerHTML = activeInRoom.map(nick => {
      const data = typers[nick];
      const tag = nick === myNick ? " (You)" : "";
      return `
        <div class="live-typer-bubble">
          <span class="live-typer-name">[~] ${this.escapeHtml(nick)}${tag}:</span>
          <span class="live-keystroke-text">${this.escapeHtml(data.text)}<span class="live-cursor"></span></span>
        </div>
      `;
    }).join("");
    if (window.TII_App.OSResizer) window.TII_App.OSResizer.decorateAllResizable();
  },
  escapeHtml(str) {
    if (!str) return "";
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};
