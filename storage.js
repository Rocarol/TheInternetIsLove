/**
 * LocalStorage Persistence Wrapper
 */
window.TII_App = window.TII_App || {};

window.TII_App.Storage = {
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem("TII_" + key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) { return defaultValue; }
  },
  set(key, value) {
    try { localStorage.setItem("TII_" + key, JSON.stringify(value)); } catch (e) {}
  },
  getUsers() { return this.get("registered_users", {}); },
  saveUser(phone, record) {
    const users = this.getUsers();
    users[phone] = record;
    this.set("registered_users", users);
  },
  isNicknameReserved(nickname, currentPhone = null) {
    const users = this.getUsers();
    for (const phone in users) {
      if (users[phone].nickname.toLowerCase() === nickname.toLowerCase()) {
        if (!currentPhone || currentPhone !== phone) return true;
      }
    }
    return false;
  }
};
