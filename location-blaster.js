/**
 * Location Blaster Engine
 */
window.TII_App = window.TII_App || {};

window.TII_App.LocationBlaster = {
  blastScope: "public",
  init() {
    const blastBtn = document.getElementById("btn-blast-location");
    if (blastBtn) blastBtn.addEventListener("click", () => this.blastNow());
    const scopePublic = document.getElementById("scope-btn-public");
    const scopeGroup = document.getElementById("scope-btn-group");
    if (scopePublic && scopeGroup) {
      scopePublic.addEventListener("click", () => {
        this.blastScope = "public";
        scopePublic.classList.add("active");
        scopeGroup.classList.remove("active");
      });
      scopeGroup.addEventListener("click", () => {
        this.blastScope = "group";
        scopeGroup.classList.add("active");
        scopePublic.classList.remove("active");
      });
    }
  },
  blastNow() {
    const user = window.TII_App.State.user;
    const currentGroup = window.TII_App.State.currentGroup;
    if (this.blastScope === "group" && currentGroup === "public") {
      window.TII_App.Notifications.show("[#] Select or join a Private Group first, or switch to Public Map!");
      window.TII_App.LocationGroups.openGroupModal();
      return;
    }
    const statusMsg = prompt("Enter a live note to blast with your location beacon:", "Divine Beyond Design [*]");
    if (statusMsg === null) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => this.executeBlast(pos.coords.latitude, pos.coords.longitude, statusMsg, user, currentGroup),
        () => this.executeFallbackBlast(statusMsg, user, currentGroup),
        { timeout: 2500 }
      );
    } else {
      this.executeFallbackBlast(statusMsg, user, currentGroup);
    }
  },
  executeFallbackBlast(statusMsg, user, currentGroup) {
    const city = window.TII_App.Config.CITIES.find(c => c.id === window.TII_App.State.currentRoom);
    const baseLat = city ? city.lat : 40.0 + (Math.random() - 0.5) * 25;
    const baseLng = city ? city.lng : -75.0 + (Math.random() - 0.5) * 40;
    this.executeBlast(baseLat + (Math.random() - 0.5) * 2, baseLng + (Math.random() - 0.5) * 2, statusMsg, user, currentGroup);
  },
  executeBlast(lat, lng, statusMsg, user, currentGroup) {
    const pin = {
      id: "pin-" + Date.now(),
      nickname: user.nickname,
      lat, lng,
      statusText: statusMsg || "Live Beacon",
      scope: this.blastScope,
      groupId: this.blastScope === "group" ? currentGroup : "public",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    window.TII_App.State.addLocationPin(pin);
    window.TII_App.LiveBus.broadcast("LOCATION_BLAST", pin);
    window.TII_App.Audio.playBlastChime();
    window.TII_App.RadarMap.centerOnLatLng(lat, lng);
    const targetDesc = this.blastScope === "public" ? "Everyone on the Global Map" : `Private Group [${currentGroup}]`;
    window.TII_App.Notifications.show(`[¤] Location blasted to ${targetDesc}!`);
  }
};
