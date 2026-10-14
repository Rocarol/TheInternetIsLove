/**
 * City-Based Rooms Manager
 */
window.TII_App = window.TII_App || {};

window.TII_App.CityManager = {
  init() {
    this.renderCityList();
    const addCityBtn = document.getElementById("btn-add-custom-city");
    if (addCityBtn) addCityBtn.addEventListener("click", () => this.promptAddCity());
  },
  renderCityList() {
    const list = document.getElementById("city-channels-list");
    if (!list) return;
    const cities = window.TII_App.Config.CITIES;
    const currentRoom = window.TII_App.State.currentRoom;
    list.innerHTML = cities.map(city => {
      const active = currentRoom === city.id ? "active" : "";
      return `
        <div class="channel-item ${active}" data-city-id="${city.id}">
          <div class="channel-info">
            <span class="channel-icon">[::]</span>
            <span>${city.name}</span>
          </div>
          <span class="channel-badge">${city.count}</span>
        </div>
      `;
    }).join("");
    list.querySelectorAll(".channel-item").forEach(item => {
      item.addEventListener("click", () => {
        const cityId = item.getAttribute("data-city-id");
        const found = cities.find(c => c.id === cityId);
        window.TII_App.State.setCloudsHidden(false, false);
        window.TII_App.State.setRoom(cityId, "city", true);
        this.syncUIWithRoom(cityId, "city");
        if (found && window.TII_App.RadarMap) window.TII_App.RadarMap.centerOnLatLng(found.lat, found.lng);
      });
    });
  },
  syncUIWithRoom(roomId, roomType) {
    const titleEl = document.getElementById("current-room-title");
    const navMass = document.getElementById("nav-channel-mass");
    if (navMass) navMass.classList.toggle("active", roomId === "mass-chat");
    if (roomId === "mass-chat") {
      if (titleEl) titleEl.textContent = "[*] Mass Global Cloud Chat";
    } else if (roomType === "city") {
      const found = window.TII_App.Config.CITIES.find(c => c.id === roomId);
      if (titleEl) titleEl.textContent = found ? `[::] ${found.name} (${found.country})` : `[::] ${roomId}`;
    } else if (roomType === "private") {
      if (titleEl) titleEl.textContent = `[#] Private Cloud: ${roomId.replace("private-", "")}`;
    }
    this.renderCityList();
  },
  promptAddCity() {
    const name = prompt("Enter a city name to open its live cloud room:");
    if (!name || !name.trim()) return;
    const id = "city-" + name.toLowerCase().replace(/\s+/g, "-");
    window.TII_App.Config.CITIES.push({
      id, name: name.trim(), country: "Earth",
      lat: (Math.random() - 0.3) * 90, lng: (Math.random() - 0.5) * 240, count: 1
    });
    window.TII_App.State.setCloudsHidden(false, false);
    window.TII_App.State.setRoom(id, "city", true);
    this.syncUIWithRoom(id, "city");
    window.TII_App.Notifications.show(`Opened live cloud room for ${name.trim()}!`);
  }
};
