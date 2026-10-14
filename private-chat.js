/**
 * Private 1-on-1 & Secret Code Rooms
 */
window.TII_App = window.TII_App || {};

window.TII_App.PrivateChat = {
  init() {
    const createPrivateBtn = document.getElementById("btn-create-private");
    if (createPrivateBtn) createPrivateBtn.addEventListener("click", () => this.createOrJoinRoom());
  },
  createOrJoinRoom() {
    const code = prompt("Enter a Private Room Code or Soul Nickname (e.g. GRACE7):");
    if (!code || !code.trim()) return;
    const roomId = "private-" + code.trim().toLowerCase();
    window.TII_App.State.setCloudsHidden(false, false);
    window.TII_App.State.setRoom(roomId, "private", true);
    window.TII_App.CityManager.syncUIWithRoom(roomId, "private");
    window.TII_App.Notifications.show(`Entered Private Cloud [${code.trim()}]`);
  }
};
