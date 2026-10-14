/**
 * Operable Interactive World & Celestial Radar Map
 * Includes automatic Bounding-Box Scaling (fitBoundsToActiveUsers) so local maps
 * for City Groups, Private Groups, and Direct Messages zoom to show the exact range
 * contained by the furthest current users!
 */
window.TII_App = window.TII_App || {};

window.TII_App.RadarMap = {
  canvas: null,
  ctx: null,
  sweepAngle: 0,
  zoom: 1.15,
  panX: 0,
  panY: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  hitTargets: [],
  
  init() {
    this.canvas = document.getElementById("radar-canvas");
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
    this.bindInteractions();
    
    // Auto-scale map whenever room, group, or pins change!
    window.TII_App.Bus.on("room:changed", () => this.fitBoundsToActiveUsers());
    window.TII_App.Bus.on("pins:updated", () => this.fitBoundsToActiveUsers());
    
    this.startLoop();
    setTimeout(() => this.fitBoundsToActiveUsers(), 120);
  },
  
  resize() {
    if (!this.canvas || !this.canvas.parentElement) return;
    this.canvas.width = this.canvas.parentElement.clientWidth;
    this.canvas.height = this.canvas.parentElement.clientHeight;
  },
  
  /**
   * Computes the bounding box of all active users in the current City Group,
   * Private Group, or Direct Message chat, and scales/centers the map to frame
   * the furthest users!
   */
  fitBoundsToActiveUsers(notify = false) {
    if (!this.canvas) return;
    const st = window.TII_App.State;
    const currentRoom = st.currentRoom;
    const currentGroup = st.currentGroup;
    const allPins = st.locationPins || [];
    
    // Filter pins belonging to the active room or group
    let relevantPins = allPins.filter(p => {
      if (currentGroup !== "public") return p.groupId === currentGroup;
      if (currentRoom !== "mass-chat") return p.room === currentRoom || p.groupId === ("CITY_" + currentRoom.toUpperCase());
      return p.scope === "public";
    });
    
    // If a city room has fewer than 2 pins, include the city center coordinate
    if (relevantPins.length === 0 && currentRoom !== "mass-chat") {
      const city = window.TII_App.Config.CITIES.find(c => c.id === currentRoom);
      if (city) {
        relevantPins = [
          { lat: city.lat + 0.04, lng: city.lng - 0.05, nickname: "North_Beacon" },
          { lat: city.lat - 0.04, lng: city.lng + 0.05, nickname: "South_Beacon" }
        ];
      }
    }
    
    if (relevantPins.length === 0) return;
    
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    relevantPins.forEach(p => {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    });
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const latSpan = Math.max(0.08, (maxLat - minLat) * 1.45);
    const lngSpan = Math.max(0.08, (maxLng - minLng) * 1.45);
    
    // Compute zoom factor so the furthest users fit comfortably inside the viewport
    const zoomLat = 135 / latSpan;
    const zoomLng = 260 / lngSpan;
    this.zoom = Math.max(1.05, Math.min(18.0, Math.min(zoomLat, zoomLng)));
    
    const w = this.canvas.width || 900;
    const h = this.canvas.height || 600;
    this.panX = -(centerLng / 180) * (w * 0.42) * this.zoom;
    this.panY = (centerLat / 90) * (h * 0.38) * this.zoom;
    
    // Calculate furthest-soul span in km
    const spanKm = window.TII_App.GoogleMapsBridge
      ? window.TII_App.GoogleMapsBridge.haversineKm(minLat, minLng, maxLat, maxLng)
      : 0;
      
    const spanEl = document.getElementById("map-bounds-readout");
    if (spanEl) {
      spanEl.textContent = `[+] Auto-Framed Furthest Souls: ${spanKm < 1 ? (spanKm * 1000).toFixed(0) + ' m' : spanKm.toFixed(1) + ' km'} span (${relevantPins.length} Active)`;
    }
    
    if (window.TII_App.GoogleMapsBridge) {
      window.TII_App.GoogleMapsBridge.syncBoundsWithGoogleMap({ minLat, maxLat, minLng, maxLng });
    }
    
    if (notify && window.TII_App.Notifications) {
      window.TII_App.Notifications.show(`[+] Map zoomed to fit furthest souls (${spanKm.toFixed(1)} km range, ${relevantPins.length} beacons)`);
    }
  },
  
  bindInteractions() {
    this.canvas.addEventListener("mousedown", (e) => {
      this.isDragging = true;
      this.dragMoved = false;
      this.dragStartX = e.clientX - this.panX;
      this.dragStartY = e.clientY - this.panY;
    });
    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.dragMoved = true;
      this.panX = e.clientX - this.dragStartX;
      this.panY = e.clientY - this.dragStartY;
    });
    window.addEventListener("mouseup", (e) => {
      if (this.isDragging && !this.dragMoved) this.handleCanvasClick(e.clientX, e.clientY);
      this.isDragging = false;
    });
    this.canvas.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.dragStartX = e.touches[0].clientX - this.panX;
        this.dragStartY = e.touches[0].clientY - this.panY;
      }
    }, { passive: true });
    this.canvas.addEventListener("touchmove", (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      this.panX = e.touches[0].clientX - this.dragStartX;
      this.panY = e.touches[0].clientY - this.dragStartY;
    }, { passive: true });
    this.canvas.addEventListener("touchend", () => { this.isDragging = false; });
    this.canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.15 : 0.87;
      this.zoom = Math.max(0.6, Math.min(20.0, this.zoom * factor));
    }, { passive: false });
    
    const zIn = document.getElementById("btn-map-zoom-in");
    const zOut = document.getElementById("btn-map-zoom-out");
    const zReset = document.getElementById("btn-map-reset");
    if (zIn) zIn.addEventListener("click", () => { this.zoom = Math.min(20.0, this.zoom * 1.3); });
    if (zOut) zOut.addEventListener("click", () => { this.zoom = Math.max(0.6, this.zoom * 0.75); });
    if (zReset) zReset.addEventListener("click", () => this.fitBoundsToActiveUsers(true));
  },
  
  centerOnLatLng(lat, lng) {
    this.fitBoundsToActiveUsers();
  },
  
  project(lat, lng, w, h) {
    const cx = w / 2 + this.panX;
    const cy = h / 2 + this.panY;
    return {
      x: cx + (lng / 180) * (w * 0.42) * this.zoom,
      y: cy - (lat / 90) * (h * 0.38) * this.zoom
    };
  },
  
  handleCanvasClick(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const mx = clientX - rect.left;
    const my = clientY - rect.top;
    for (const t of this.hitTargets) {
      if (Math.hypot(mx - t.x, my - t.y) <= 18) {
        if (t.type === "pin") {
          window.TII_App.Notifications.show(`[¤] Encrypted Soul Beacon: ${t.data.nickname} — "${t.data.statusText || 'Radiating love'}"`);
        } else if (t.type === "city") {
          window.TII_App.Notifications.show(`[::] ${t.data.name} Built-in Group — Auto-zooming map to local souls!`);
          window.TII_App.State.setRoom(t.data.id, "city", true);
          window.TII_App.CityManager.syncUIWithRoom(t.data.id, "city");
        } else if (t.type === "hazard") {
          const hz = t.data;
          const age = window.TII_App.HazardRadar ? window.TII_App.HazardRadar.formatAge(hz.epochMs) : "<24h";
          window.TII_App.Notifications.show(`[!] 24H HAZARD (${hz.severity}): ${hz.title} — ${hz.summary} [${age}]`);
        }
        return;
      }
    }
  },
  
  startLoop() {
    const render = () => {
      this.draw();
      this.sweepAngle += 0.012;
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
  },
  
  draw() {
    if (!this.canvas || !this.ctx) return;
    const w = this.canvas.width, h = this.canvas.height;
    const cx = w / 2 + this.panX, cy = h / 2 + this.panY;
    const maxR = Math.min(w, h) * 0.44 * Math.min(this.zoom, 3.5);
    this.hitTargets = [];
    
    const bgGrad = this.ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h) * 0.75);
    bgGrad.addColorStop(0, "#123768");
    bgGrad.addColorStop(0.6, "#091e3a");
    bgGrad.addColorStop(1, "#040d1a");
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, w, h);
    
    this.ctx.strokeStyle = "rgba(88, 180, 236, 0.16)";
    this.ctx.lineWidth = 1;
    for (let lng = -150; lng <= 180; lng += 30) {
      const p1 = this.project(80, lng, w, h), p2 = this.project(-80, lng, w, h);
      this.ctx.beginPath(); this.ctx.moveTo(p1.x, p1.y); this.ctx.lineTo(p2.x, p2.y); this.ctx.stroke();
    }
    for (let lat = -60; lat <= 60; lat += 30) {
      const p1 = this.project(lat, -180, w, h), p2 = this.project(lat, 180, w, h);
      this.ctx.beginPath(); this.ctx.moveTo(p1.x, p1.y); this.ctx.lineTo(p2.x, p2.y); this.ctx.stroke();
    }
    
    const continents = window.TII_App.WorldCartography?.CONTINENTS || [];
    this.ctx.save();
    this.ctx.fillStyle = "rgba(41, 130, 214, 0.28)";
    this.ctx.strokeStyle = "rgba(163, 231, 247, 0.65)";
    this.ctx.lineWidth = 1.5;
    this.ctx.shadowColor = "rgba(88, 180, 236, 0.7)";
    this.ctx.shadowBlur = 12;
    continents.forEach(poly => {
      this.ctx.beginPath();
      poly.forEach(([lat, lng], idx) => {
        const pt = this.project(lat, lng, w, h);
        if (idx === 0) this.ctx.moveTo(pt.x, pt.y);
        else this.ctx.lineTo(pt.x, pt.y);
      });
      this.ctx.closePath();
      this.ctx.fill();
      this.ctx.stroke();
    });
    this.ctx.restore();
    
    this.ctx.strokeStyle = "rgba(255, 224, 51, 0.22)";
    for (let r = maxR * 0.35; r <= maxR * 1.05; r += maxR * 0.35) {
      this.ctx.beginPath(); this.ctx.arc(cx, cy, r, 0, Math.PI * 2); this.ctx.stroke();
    }
    
    window.TII_App.Config.CITIES.forEach(city => {
      const pt = this.project(city.lat, city.lng, w, h);
      this.hitTargets.push({ type: "city", x: pt.x, y: pt.y, data: city });
      this.ctx.fillStyle = "rgba(163, 231, 247, 0.85)";
      this.ctx.beginPath(); this.ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2); this.ctx.fill();
      this.ctx.font = "600 10px sans-serif";
      this.ctx.fillStyle = "rgba(234, 244, 252, 0.82)";
      this.ctx.fillText(city.name, pt.x + 7, pt.y + 3);
    });
    
    const currentGroup = window.TII_App.State.currentGroup;
    const visiblePts = [];
    window.TII_App.State.locationPins.forEach(pin => {
      if (pin.scope === "group" && pin.groupId !== currentGroup && !currentGroup.startsWith("CITY_")) return;
      const pt = this.project(pin.lat, pin.lng, w, h);
      visiblePts.push(pt);
      this.hitTargets.push({ type: "pin", x: pt.x, y: pt.y, data: pin });
      const pulseSize = (Date.now() / 220) % 20;
      this.ctx.strokeStyle = pin.scope === "group" ? "rgba(196, 181, 253, 0.9)" : "rgba(255, 224, 51, 0.95)";
      this.ctx.lineWidth = 1.8;
      this.ctx.beginPath(); this.ctx.arc(pt.x, pt.y, 6 + pulseSize, 0, Math.PI * 2); this.ctx.stroke();
      this.ctx.fillStyle = pin.scope === "group" ? "#c4b5fd" : "#ffe033";
      this.ctx.beginPath(); this.ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2); this.ctx.fill();
      this.ctx.font = "bold 11.5px sans-serif";
      this.ctx.fillStyle = "#ffffff";
      this.ctx.fillText(pin.nickname + (pin.scope === "group" ? " [#]" : " [*]"), pt.x + 10, pt.y - 4);
      if (pin.statusText) {
        this.ctx.font = "italic 10px monospace";
        this.ctx.fillStyle = "#ffe033";
        this.ctx.fillText('"' + pin.statusText + '"', pt.x + 10, pt.y + 10);
      }
    });
    
    // Draw subtle Golden Bounding Perimeter around furthest users when in a City or Private Group
    if (visiblePts.length >= 2 && (window.TII_App.State.currentRoom !== "mass-chat" || currentGroup !== "public")) {
      const xs = visiblePts.map(p => p.x), ys = visiblePts.map(p => p.y);
      const minX = Math.min(...xs) - 24, maxX = Math.max(...xs) + 24;
      const minY = Math.min(...ys) - 24, maxY = Math.max(...ys) + 24;
      this.ctx.save();
      this.ctx.strokeStyle = "rgba(255, 224, 51, 0.45)";
      this.ctx.setLineDash([6, 6]);
      this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
      this.ctx.restore();
    }
    // Version 7: Render Gemini 24-Hour Local & Global Hazards (Strictly < 24h) on the Map!
    const activeHazards = window.TII_App.HazardRadar ? window.TII_App.HazardRadar.getActive24hHazards() : [];
    activeHazards.forEach(hz => {
      const pt = this.project(hz.lat, hz.lng, w, h);
      this.hitTargets.push({ type: "hazard", x: pt.x, y: pt.y, data: hz });
      
      const isHigh = hz.severity === "CRITICAL" || hz.severity === "HIGH";
      const ringColor = isHigh ? "rgba(255, 77, 77, 0.22)" : "rgba(255, 165, 0, 0.18)";
      const strokeColor = isHigh ? "#ff4d4d" : "#ffa500";
      const pulseR = 14 + ((Date.now() / 160) % 16);
      
      // Hazard Radius Zone
      this.ctx.save();
      this.ctx.fillStyle = ringColor;
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 1.6;
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, pulseR, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Hazard Core Marker [!]
      this.ctx.fillStyle = strokeColor;
      this.ctx.beginPath();
      this.ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
      this.ctx.fill();
      
      this.ctx.font = "900 10px monospace";
      this.ctx.fillStyle = "#040d1a";
      this.ctx.fillText("!", pt.x - 3, pt.y + 3.5);
      
      // Hazard Label
      this.ctx.font = "bold 10.5px sans-serif";
      this.ctx.fillStyle = isHigh ? "#ff9999" : "#ffd27f";
      this.ctx.fillText("[!] " + hz.title.slice(0, 28), pt.x + 11, pt.y + 14);
      this.ctx.restore();
    });
  }
};
