/**
 * Real-Time Live Broadcast & Network Synchronization
 */
window.TII_App = window.TII_App || {};

window.TII_App.LiveBus = {
  channel: null,
  init() {
    if (window.BroadcastChannel) {
      try {
        this.channel = new BroadcastChannel("TheInternetIsLove_LiveStream");
        this.channel.onmessage = (event) => this.handleIncoming(event.data);
      } catch (e) {}
    }
    this.startAmbientSimulation();
  },
  broadcast(type, payload) {
    const packet = { type, payload, timestamp: Date.now() };
    if (this.channel) {
      try { this.channel.postMessage(packet); } catch(e) {}
    }
  },
  handleIncoming(packet) {
    if (!packet || !packet.type) return;
    const { type, payload } = packet;
    if (type === "LIVE_KEYSTROKE") {
      window.TII_App.State.updateTyper(payload.nickname, payload.text, payload.room);
    } else if (type === "CHAT_MESSAGE") {
      window.TII_App.State.addMessage(payload);
    } else if (type === "LOCATION_BLAST") {
      window.TII_App.State.addLocationPin(payload);
      window.TII_App.Notifications.show(`[¤] ${payload.nickname} blasted location to the map!`);
    }
  },
  startAmbientSimulation() {
    const ambientTypers = [
      { name: "Seraphina", room: "mass-chat", thoughts: ["Every cloud box can be resized to any dimension! [*]", "Pull the left tab to browse chats organized by day.", "Divine Beyond Design..."] },
      { name: "Zephyr", room: "mass-chat", thoughts: ["Seeing everyone's live keystrokes in real time is magical.", "Blasting my beacon to the global map now!"] },
      { name: "NeoLondon", room: "lon", thoughts: ["London skies glowing tonight.", "Peace and love from across the Atlantic."] }
    ];
    setInterval(() => {
      const user = ambientTypers[Math.floor(Math.random() * ambientTypers.length)];
      if (user.name === window.TII_App.State.user?.nickname) return;
      const phrase = user.thoughts[Math.floor(Math.random() * user.thoughts.length)];
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        charIdx++;
        window.TII_App.State.updateTyper(user.name, phrase.slice(0, charIdx), user.room);
        if (charIdx >= phrase.length) {
          clearInterval(typeInterval);
          setTimeout(() => {
            if (Math.random() > 0.35) {
              window.TII_App.State.addMessage({
                id: "sim-" + Date.now(),
                date: window.TII_App.Config.TODAY_DATE,
                sender: user.name,
                text: phrase,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                verified: true,
                room: user.room
              });
            }
            window.TII_App.State.updateTyper(user.name, "", user.room);
          }, 1100);
        }
      }, 85);
    }, 11000);
  }
};
