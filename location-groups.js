/**
 * Location Privacy Groups Manager (Includes Built-In City Groups + Custom Groups)
 */
window.TII_App = window.TII_App || {};

window.TII_App.LocationGroups = {
  init() {
    // Populate built-in city groups into joinedGroups
    const cityGroups = window.TII_App.Config.CITIES.map(c => c.groupCode);
    cityGroups.forEach(code => {
      if (!window.TII_App.State.joinedGroups.includes(code)) {
        window.TII_App.State.joinedGroups.push(code);
      }
    });
    
    const manageGroupBtn = document.getElementById("btn-manage-groups");
    if (manageGroupBtn) manageGroupBtn.addEventListener("click", () => this.openGroupModal());
    const closeBtn = document.getElementById("close-group-modal");
    if (closeBtn) closeBtn.addEventListener("click", () => this.closeGroupModal());
    const joinBtn = document.getElementById("btn-join-group-code");
    if (joinBtn) joinBtn.addEventListener("click", () => this.joinByCode());
    this.renderGroupChips();
  },
  openGroupModal() {
    window.TII_App.State.activeModal = "groups";
    const modal = document.getElementById("group-modal-backdrop");
    if (modal) modal.classList.add("open");
    window.TII_App.HistoryRouter.pushCurrentState();
  },
  closeGroupModal() {
    window.TII_App.State.activeModal = null;
    const modal = document.getElementById("group-modal-backdrop");
    if (modal) modal.classList.remove("open");
    window.TII_App.HistoryRouter.pushCurrentState();
  },
  joinByCode() {
    const input = document.getElementById("group-code-input");
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    if (!code) return;
    if (!window.TII_App.State.joinedGroups.includes(code)) {
      window.TII_App.State.joinedGroups.push(code);
    }
    input.value = "";
    this.selectGroup(code);
    this.closeGroupModal();
    window.TII_App.Notifications.show(`[#] Active Location Group set to [${code}] — Map auto-scaled to group bounds!`);
  },
  selectGroup(groupId) {
    window.TII_App.State.currentGroup = groupId;
    const badge = document.getElementById("current-group-badge");
    if (badge) badge.textContent = groupId === "public" ? "[~] Global Map" : `[#] Group: ${groupId}`;
    this.renderGroupChips();
    if (window.TII_App.RadarMap) window.TII_App.RadarMap.fitBoundsToActiveUsers(true);
  },
  renderGroupChips() {
    const container = document.getElementById("group-chip-list");
    if (!container) return;
    const current = window.TII_App.State.currentGroup;
    container.innerHTML = window.TII_App.State.joinedGroups.map(gid => {
      const active = gid === current ? "active" : "";
      const icon = gid === "public" ? "[~] Global Public" : gid.startsWith("CITY_") ? "[::] " + gid : "[#] " + gid;
      return `<div class="group-tag ${active}" data-gid="${gid}">${icon}</div>`;
    }).join("");
    container.querySelectorAll(".group-tag").forEach(tag => {
      tag.addEventListener("click", () => this.selectGroup(tag.getAttribute("data-gid")));
    });
  }
};
