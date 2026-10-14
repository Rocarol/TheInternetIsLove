/**
 * Central Reactive Store (Version 6)
 * By default on anonymous load: ONLY Whole World Chat & Map are active;
 * Pinch/Expand and extra features are toggled OFF until enabled or restored from Save State!
 */
window.TII_App = window.TII_App || {};

window.TII_App.State = {
  user: null, // { displayName, handle, countryCode, phone, isVerified, biometricId }
  currentRoom: "mass-chat",
  currentRoomType: "mass",
  selectedDate: "ALL",
  dateDrawerOpen: false,
  activeTypers: {},
  messages: {},
  locationPins: [],
  currentGroup: "public",
  joinedGroups: ["public", "CELESTIAL7"],
  cloudsHidden: false,
  activeModal: null,
  soulsCount: 1,
  
  // All optional features default to OFF for clean anonymous World Chat + Map entry!
  features: {
    pinchExpand: false,
    autoTranslate: false,
    audioChimes: false,
    dateChapters: false,
    cryptoSeals: false,
    telemetryBar: false
  },
  
  savedElementSizes: {}, // { [elementSelectorOrId]: { width, height, fontSize } }
  
  init() {
    this.messages = JSON.parse(JSON.stringify(window.TII_App.Config.INITIAL_MESSAGES));
    this.locationPins = JSON.parse(JSON.stringify(window.TII_App.Config.INITIAL_PINS));
    
    const savedSession = window.TII_App.Storage.get("current_session", null);
    if (savedSession && savedSession.nickname) {
      this.user = savedSession;
    } else {
      const rand = Math.floor(100 + Math.random() * 899);
      this.user = {
        nickname: "Guest", // Temporary non-unique display name
        displayName: "Guest",
        handle: "@guest_" + rand, // Separate unique handle
        countryCode: "+1",
        phone: null,
        isVerified: false,
        biometricCredentialId: null
      };
    }
    
    // Load saved feature toggles if user previously saved state
    const savedFeatures = window.TII_App.Storage.get("saved_feature_toggles", null);
    if (savedFeatures) {
      this.features = { ...this.features, ...savedFeatures };
    }
    this.applyFeatureBodyClasses();
  },
  
  toggleFeature(key, explicitVal = null) {
    if (!(key in this.features)) return;
    this.features[key] = explicitVal !== null ? !!explicitVal : !this.features[key];
    if (key === "audioChimes" && window.TII_App.Audio) {
      window.TII_App.Audio.enabled = this.features.audioChimes;
    }
    this.applyFeatureBodyClasses();
    window.TII_App.Storage.set("saved_feature_toggles", this.features);
    window.TII_App.Bus.emit("features:updated", this.features);
    if (window.TII_App.ChatController) window.TII_App.ChatController.renderMessages();
    if (window.TII_App.SaveState) window.TII_App.SaveState.syncToServer();
    return this.features[key];
  },
  
  applyFeatureBodyClasses() {
    document.body.classList.toggle("feature-pinch-expand-on", !!this.features.pinchExpand);
    document.body.classList.toggle("feature-telemetry-on", !!this.features.telemetryBar);
    document.body.classList.toggle("feature-dates-on", !!this.features.dateChapters);
    document.body.classList.toggle("feature-seals-on", !!this.features.cryptoSeals);
    if (window.TII_App.Audio) {
      window.TII_App.Audio.enabled = !!this.features.audioChimes;
    }
  },
  
  setRoom(roomId, roomType = "city", recordHistory = true) {
    this.currentRoom = roomId;
    this.currentRoomType = roomType;
    if (!this.messages[roomId]) this.messages[roomId] = [];
    window.TII_App.Bus.emit("room:changed", { roomId, roomType });
    if (recordHistory && window.TII_App.HistoryRouter) {
      window.TII_App.HistoryRouter.pushCurrentState();
    }
  },
  
  setSelectedDate(dateKey, recordHistory = true) {
    this.selectedDate = dateKey || "ALL";
    window.TII_App.Bus.emit("date:changed", this.selectedDate);
    if (recordHistory && window.TII_App.HistoryRouter) {
      window.TII_App.HistoryRouter.pushCurrentState();
    }
  },
  
  setCloudsHidden(hidden, recordHistory = true) {
    this.cloudsHidden = !!hidden;
    document.body.classList.toggle("map-full-view", this.cloudsHidden);
    window.TII_App.Bus.emit("clouds:toggled", this.cloudsHidden);
    if (recordHistory && window.TII_App.HistoryRouter) {
      window.TII_App.HistoryRouter.pushCurrentState();
    }
  },
  
  setUser(userData) {
    this.user = userData;
    window.TII_App.Storage.set("current_session", userData);
    window.TII_App.Bus.emit("user:updated", userData);
    if (window.TII_App.SaveState) window.TII_App.SaveState.syncToServer();
  },
  
  updateTyper(nickname, text, room) {
    if (!text || text.trim() === "") {
      delete this.activeTypers[nickname];
    } else {
      this.activeTypers[nickname] = { text, timestamp: Date.now(), room };
    }
    window.TII_App.Bus.emit("typers:updated", this.activeTypers);
  },
  
  addMessage(msg) {
    const room = msg.room || this.currentRoom;
    if (!msg.date) msg.date = window.TII_App.Config.TODAY_DATE;
    if (!this.messages[room]) this.messages[room] = [];
    this.messages[room].push(msg);
    window.TII_App.Bus.emit("message:received", msg);
  },
  
  addLocationPin(pin) {
    this.locationPins = this.locationPins.filter(p => p.nickname !== pin.nickname);
    this.locationPins.push(pin);
    window.TII_App.Bus.emit("pins:updated", this.locationPins);
  }
};
