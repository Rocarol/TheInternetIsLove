/**
 * Identity, Country Code + Phone + 7-Digit PIN, Unique @Handle & Biometric WebAuthn Vault
 * Version 7777777 — Includes Chronological Genesis Sign-Up Numbering (Soul #1 Crown for First Sign-Up!)
 * Supports:
 * - Temporary, non-unique Display Usernames (multiple people can share the same display name)
 * - Separate strictly unique @handle (e.g., @michael_77)
 * - Country Code + Phone Number + 7-Digit PIN
 * - Device Biometric Authentication via W3C WebAuthn / Passkeys (Apple Face ID / Touch ID,
 *   Samsung Pass / Android Biometrics, Google Passkeys, Windows Hello)
 */
window.TII_App = window.TII_App || {};

window.TII_App.Auth = {
  currentPinInput: "",
  
  init() {
    const profileChip = document.getElementById("user-profile-chip");
    if (profileChip) {
      profileChip.addEventListener("click", (e) => {
        if (e.target.closest(".os-resize-handle")) return;
        this.openModal();
      });
    }
    const closeModalBtn = document.getElementById("close-auth-modal");
    if (closeModalBtn) closeModalBtn.addEventListener("click", () => this.closeModal());
    
    const tabGuest = document.getElementById("tab-guest-btn");
    const tabPhone = document.getElementById("tab-phone-btn");
    const tabBio = document.getElementById("tab-bio-btn");
    const panelGuest = document.getElementById("panel-guest");
    const panelPhone = document.getElementById("panel-phone");
    const panelBio = document.getElementById("panel-bio");
    
    const switchTab = (mode) => {
      if (tabGuest) tabGuest.classList.toggle("active", mode === "guest");
      if (tabPhone) tabPhone.classList.toggle("active", mode === "phone");
      if (tabBio) tabBio.classList.toggle("active", mode === "bio");
      if (panelGuest) panelGuest.style.display = mode === "guest" ? "block" : "none";
      if (panelPhone) panelPhone.style.display = mode === "phone" ? "block" : "none";
      if (panelBio) panelBio.style.display = mode === "bio" ? "block" : "none";
    };
    
    if (tabGuest) tabGuest.addEventListener("click", () => switchTab("guest"));
    if (tabPhone) tabPhone.addEventListener("click", () => switchTab("phone"));
    if (tabBio) tabBio.addEventListener("click", () => switchTab("bio"));
    
    // 1. Temporary Non-Unique Username + Unique @Handle Submit
    const guestSubmit = document.getElementById("btn-guest-submit");
    if (guestSubmit) {
      guestSubmit.addEventListener("click", () => {
        const dispInput = document.getElementById("guest-nickname-input");
        const handleInput = document.getElementById("guest-handle-input");
        const displayName = dispInput?.value.trim() || "Guest";
        let rawHandle = handleInput?.value.trim() || ("@soul_" + Math.floor(1000 + Math.random() * 9000));
        if (!rawHandle.startsWith("@")) rawHandle = "@" + rawHandle;
        rawHandle = rawHandle.toLowerCase().replace(/[^a-z0-9_@]/g, "");
        
        if (this.isHandleTaken(rawHandle, null)) {
          return window.TII_App.Notifications.show(`Handle ${rawHandle} is already taken! Display names can be shared, but your @handle must be unique.`);
        }
        
        const prevSignupNum = window.TII_App.State.user?.signupNumber || null;
        window.TII_App.State.setUser({
          nickname: `${displayName} (${rawHandle})`,
          displayName: displayName,
          handle: rawHandle,
          countryCode: "+1",
          phone: window.TII_App.State.user?.phone || null,
          isVerified: !!window.TII_App.State.user?.isVerified,
          signupNumber: prevSignupNum
        });
        if (window.TII_App.SoulsCounter) window.TII_App.SoulsCounter.sendHeartbeat();
        window.TII_App.Notifications.show(`Entered as "${displayName}" with unique handle ${rawHandle}!`);
        this.closeModal();
      });
    }
    
    // 2. 7-Digit PIN Keypad
    document.querySelectorAll(".keypad-key").forEach(btn => {
      btn.addEventListener("click", () => this.handlePinKey(btn.getAttribute("data-val")));
    });
    
    const phoneSubmit = document.getElementById("btn-phone-submit");
    if (phoneSubmit) phoneSubmit.addEventListener("click", () => this.submitPhoneAuth());
    
    // 3. Biometric WebAuthn Passkey Registration & Login (Apple Face ID / Samsung / Google)
    const bioRegBtn = document.getElementById("btn-biometric-register");
    const bioLoginBtn = document.getElementById("btn-biometric-login");
    if (bioRegBtn) bioRegBtn.addEventListener("click", () => this.registerBiometrics());
    if (bioLoginBtn) bioLoginBtn.addEventListener("click", () => this.loginWithBiometrics());
  },
  
  isHandleTaken(handle, currentFullPhone = null) {
    const users = window.TII_App.Storage.getUsers();
    for (const phoneKey in users) {
      if ((users[phoneKey].handle || "").toLowerCase() === handle.toLowerCase()) {
        if (!currentFullPhone || currentFullPhone !== phoneKey) return true;
      }
    }
    return false;
  },
  
  handlePinKey(val) {
    if (val === "DEL") this.currentPinInput = this.currentPinInput.slice(0, -1);
    else if (val === "CLEAR") this.currentPinInput = "";
    else if (this.currentPinInput.length < 7 && /^[0-9]$/.test(val)) {
      this.currentPinInput += val;
    }
    this.renderPinSlots();
  },
  
  renderPinSlots() {
    for (let i = 0; i < 7; i++) {
      const slot = document.getElementById(`pin-slot-${i}`);
      if (!slot) continue;
      const hasDigit = i < this.currentPinInput.length;
      slot.textContent = hasDigit ? "*" : "";
      slot.classList.toggle("filled", hasDigit);
    }
  },
  
  async submitPhoneAuth() {
    const cc = document.getElementById("phone-country-code")?.value || "+1";
    const rawPhone = (document.getElementById("phone-number-input")?.value || "").replace(/[^0-9]/g, "");
    const displayName = (document.getElementById("phone-nickname-input")?.value || "").trim() || "Sovereign_Soul";
    let rawHandle = (document.getElementById("phone-handle-input")?.value || "").trim();
    
    if (rawPhone.length < 7) {
      return window.TII_App.Notifications.show("[#] Enter a valid phone number (at least 7 digits).");
    }
    if (this.currentPinInput.length !== 7) {
      return window.TII_App.Notifications.show("[#] Enter all 7 digits of your secret PIN.");
    }
    
    const fullPhone = `${cc}${rawPhone}`;
    const users = window.TII_App.Storage.getUsers();
    const existing = users[fullPhone];
    
    if (!rawHandle) {
      rawHandle = existing?.handle || ("@" + displayName.toLowerCase().replace(/[^a-z0-9_]/g, "") + "_" + rawPhone.slice(-3));
    }
    if (!rawHandle.startsWith("@")) rawHandle = "@" + rawHandle;
    rawHandle = rawHandle.toLowerCase().replace(/[^a-z0-9_@]/g, "");
    
    if (this.isHandleTaken(rawHandle, fullPhone)) {
      return window.TII_App.Notifications.show(`[#] Handle ${rawHandle} is already registered to another phone number! Choose a unique @handle.`);
    }
    
    let pinHash = this.currentPinInput;
    if (window.TII_App.CryptoVault && window.TII_App.CryptoVault.hashPinPBKDF2) {
      try {
        pinHash = await window.TII_App.CryptoVault.hashPinPBKDF2(fullPhone, this.currentPinInput);
      } catch (e) {}
    }
    
    if (existing) {
      if (existing.pinHash !== pinHash && existing.pin !== this.currentPinInput) {
        return window.TII_App.Notifications.show("[#] Incorrect 7-Digit PIN for this phone number!");
      }
      const updatedUser = {
        ...existing,
        nickname: `${displayName} (${rawHandle})`,
        displayName,
        handle: rawHandle,
        countryCode: cc,
        phone: fullPhone,
        isVerified: true
      };
      users[fullPhone] = updatedUser;
      window.TII_App.Storage.set("registered_users", users);
      window.TII_App.State.setUser(updatedUser);
      if (existing.savedState && window.TII_App.SaveState) {
        window.TII_App.SaveState.restoreFromRecord(existing.savedState);
      }
      this.syncUserToServer(updatedUser);
      if (window.TII_App.SoulsCounter) window.TII_App.SoulsCounter.sendHeartbeat();
      window.TII_App.Notifications.show(`[*] Welcome back, Soul #${updatedUser.signupNumber || 1} (${displayName} ${rawHandle})! State restored.`);
      this.closeModal();
    } else {
      // NEW SIGN-UP: Assign chronological Genesis Sign-Up Number (#1 for the very first person!)
      const existingCount = Object.keys(users).length;
      const signupNumber = existingCount + 1;
      const newUser = {
        signupNumber,
        signupRankLabel: signupNumber === 1 ? "SOUL #1 • FIRST SOVEREIGN SIGN-UP" : `SOUL #${signupNumber}`,
        nickname: `${displayName} (${rawHandle})`,
        displayName,
        handle: rawHandle,
        countryCode: cc,
        phone: fullPhone,
        pinHash,
        isVerified: true,
        registeredAt: new Date().toISOString(),
        savedState: window.TII_App.SaveState ? window.TII_App.SaveState.captureFullWebsiteState() : null
      };
      users[fullPhone] = newUser;
      window.TII_App.Storage.set("registered_users", users);
      window.TII_App.State.setUser(newUser);
      this.syncUserToServer(newUser);
      if (window.TII_App.SoulsCounter) window.TII_App.SoulsCounter.sendHeartbeat();
      window.TII_App.Notifications.show(
        signupNumber === 1
          ? `[7] HAIL SOUL #1! ${displayName} (${rawHandle}) is officially registered as the FIRST PERSON on TheInternetIsLove.com!`
          : `[*] Registered Forever as Soul #${signupNumber}: ${displayName} (${rawHandle})!`
      );
      this.closeModal();
    }
  },
  
  async syncUserToServer(userRecord) {
    try {
      const resp = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userRecord)
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data.user && data.user.signupNumber) {
          userRecord.signupNumber = data.user.signupNumber;
          userRecord.signupRankLabel = data.user.signupRankLabel;
          window.TII_App.State.setUser(userRecord);
        }
      }
    } catch (e) {}
  },
  
  async registerBiometrics() {
    const user = window.TII_App.State.user;
    if (!window.PublicKeyCredential || !navigator.credentials?.create) {
      return window.TII_App.Notifications.show("[#] Biometric Passkeys require HTTPS or localhost in Safari/Chrome.");
    }
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const userId = new Uint8Array(16);
      window.crypto.getRandomValues(userId);
      
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: "TheInternetIsLove.com" },
          user: {
            id: userId,
            name: user.handle || "@soul",
            displayName: user.displayName || "Sovereign Soul"
          },
          pubKeyCredParams: [
            { type: "public-key", alg: -7 },
            { type: "public-key", alg: -257 }
          ],
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "required"
          },
          timeout: 60000
        }
      });
      if (cred) {
        const bioId = btoa(String.fromCharCode(...new Uint8Array(cred.rawId)));
        const users = window.TII_App.Storage.getUsers();
        const key = user.phone || user.handle || "@biometric_soul";
        const signupNumber = user.signupNumber || (Object.keys(users).length + 1);
        const updated = {
          ...user,
          signupNumber,
          signupRankLabel: signupNumber === 1 ? "SOUL #1 • FIRST SOVEREIGN SIGN-UP" : `SOUL #${signupNumber}`,
          isVerified: true,
          biometricCredentialId: bioId,
          registeredAt: user.registeredAt || new Date().toISOString()
        };
        users[key] = updated;
        window.TII_App.Storage.set("registered_users", users);
        window.TII_App.Storage.set("last_biometric_user", updated);
        window.TII_App.State.setUser(updated);
        this.syncUserToServer(updated);
        if (window.TII_App.SoulsCounter) window.TII_App.SoulsCounter.sendHeartbeat();
        window.TII_App.Notifications.show(`[#] Device Biometrics bound to Soul #${signupNumber} (${updated.handle})!`);
        this.closeModal();
      }
    } catch (err) {
      window.TII_App.Notifications.show("[#] Biometric prompt cancelled or requires HTTPS domain.");
    }
  },
  
  async loginWithBiometrics() {
    if (!window.PublicKeyCredential || !navigator.credentials?.get) {
      return window.TII_App.Notifications.show("[#] WebAuthn Biometrics require HTTPS or localhost.");
    }
    try {
      const challenge = new Uint8Array(32);
      window.crypto.getRandomValues(challenge);
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          userVerification: "required",
          timeout: 60000
        }
      });
      if (assertion) {
        const savedBioUser = window.TII_App.Storage.get("last_biometric_user", null);
        if (savedBioUser) {
          window.TII_App.State.setUser(savedBioUser);
          if (window.TII_App.SoulsCounter) window.TII_App.SoulsCounter.sendHeartbeat();
          window.TII_App.Notifications.show(`[*] Biometric identity verified! Welcome back, Soul #${savedBioUser.signupNumber || 1} (${savedBioUser.handle}).`);
          this.closeModal();
        }
      }
    } catch (err) {
      window.TII_App.Notifications.show("[#] Biometric verification cancelled or no Passkey registered yet on this device.");
    }
  },
  
  openModal() {
    window.TII_App.State.activeModal = "auth";
    const modal = document.getElementById("auth-modal-backdrop");
    if (modal) modal.classList.add("open");
    this.currentPinInput = "";
    this.renderPinSlots();
    if (window.TII_App.HistoryRouter) window.TII_App.HistoryRouter.pushCurrentState();
  },
  
  closeModal() {
    window.TII_App.State.activeModal = null;
    const modal = document.getElementById("auth-modal-backdrop");
    if (modal) modal.classList.remove("open");
    if (window.TII_App.HistoryRouter) window.TII_App.HistoryRouter.pushCurrentState();
  }
};
