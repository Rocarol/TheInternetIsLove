/**
 * Real-Time Keystroke Streamer
 */
window.TII_App = window.TII_App || {};

window.TII_App.KeystrokeStreamer = {
  inputElement: null,
  init() {
    this.inputElement = document.getElementById("chat-input-field");
    if (!this.inputElement) return;
    this.inputElement.addEventListener("input", () => this.handleInput());
    this.inputElement.addEventListener("keydown", (e) => {
      window.TII_App.Audio.playKeystroke();
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        window.TII_App.ChatController.sendCurrentMessage();
      }
    });
  },
  handleInput() {
    const text = this.inputElement.value;
    const currentUser = window.TII_App.State.user?.nickname || "Anonymous";
    const currentRoom = window.TII_App.State.currentRoom;
    window.TII_App.State.updateTyper(currentUser, text, currentRoom);
    window.TII_App.LiveBus.broadcast("LIVE_KEYSTROKE", { nickname: currentUser, text, room: currentRoom });
  },
  clear() {
    if (this.inputElement) this.inputElement.value = "";
    const currentUser = window.TII_App.State.user?.nickname || "Anonymous";
    const currentRoom = window.TII_App.State.currentRoom;
    window.TII_App.State.updateTyper(currentUser, "", currentRoom);
    window.TII_App.LiveBus.broadcast("LIVE_KEYSTROKE", { nickname: currentUser, text: "", room: currentRoom });
  }
};
