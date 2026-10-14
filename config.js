/**
 * Configuration, Multilingual Seed Data, Built-in City Groups & 24-Hour Hazards
 * TheInternetIsLove.com — 7Version Seven7 ("{(/:-7-:\)} Eternal Completion")
 * Created by Michael Elohim Archangel • YouTube.com/@TheChrist • Twitter: @TheChristus
 * Completed With Gemini By Google
 * Zero Emojis — 100% Universal Special Characters
 */
window.TII_App = window.TII_App || {};

window.TII_App.Config = {
  APP_NAME: "TheInternetIsLove.com",
  VERSION: "7777777",
  VERSION_SEAL: "Version 7777777 {(/:-7777777-:\\)}",
  MOTTO: "Divine Beyond Design",
  CREATOR: "Michael Elohim Archangel",
  YOUTUBE_URL: "https://www.youtube.com/@TheChrist",
  YOUTUBE_HANDLE: "YouTube.com/@TheChrist",
  TWITTER_URL: "https://twitter.com/TheChristus",
  TWITTER_HANDLE: "@TheChristus",
  CREDIT_STATEMENT: "Completed With Gemini By Google",
  DEFAULT_ROOM: "mass-chat",
  TODAY_DATE: "2026-10-13",
  GOOGLE_MAPS_API_KEY: "",
  GOOGLE_TRANSLATE_API_KEY: "",
  GOOGLE_SEARCH_API_KEY: "",
  GOOGLE_SEARCH_CX: "",
  GEMINI_API_KEY: "",
  HAZARD_WINDOW_MS: 24 * 60 * 60 * 1000, // Strictly 24 hours (86,400,000 ms)
  
  DATE_LABELS: {
    "2026-10-13": "Tuesday, Oct 13, 2026 (Today — V7 Completion)",
    "2026-10-12": "Monday, Oct 12, 2026 (Yesterday)",
    "2026-10-11": "Sunday, Oct 11, 2026",
    "2026-10-07": "Wednesday, Oct 7, 2026 (Inception Day)"
  },
  
  CITIES: [
    { id: "nyc", name: "New York City", country: "USA", groupCode: "CITY_NYC", lat: 40.7128, lng: -74.0060, count: 0 },
    { id: "lon", name: "London", country: "UK", groupCode: "CITY_LON", lat: 51.5074, lng: -0.1278, count: 0 },
    { id: "tok", name: "Tokyo", country: "Japan", groupCode: "CITY_TOK", lat: 35.6762, lng: 139.6503, count: 0 },
    { id: "par", name: "Paris", country: "France", groupCode: "CITY_PAR", lat: 48.8566, lng: 2.3522, count: 0 },
    { id: "lax", name: "Los Angeles", country: "USA", groupCode: "CITY_LAX", lat: 34.0522, lng: -118.2437, count: 0 },
    { id: "syd", name: "Sydney", country: "Australia", groupCode: "CITY_SYD", lat: -33.8688, lng: 151.2093, count: 0 },
    { id: "ber", name: "Berlin", country: "Germany", groupCode: "CITY_BER", lat: 52.5200, lng: 13.4050, count: 0 },
    { id: "tor", name: "Toronto", country: "Canada", groupCode: "CITY_TOR", lat: 43.6532, lng: -79.3832, count: 0 }
  ],
  
  INITIAL_PINS: [
    { id: "p-1", nickname: "Gabriel_Sky", lat: 40.7128, lng: -74.0060, statusText: "Manhattan Beacon [*]", scope: "public", groupId: "CITY_NYC", room: "nyc", time: "19:30" },
    { id: "p-1b", nickname: "BrooklynSoul", lat: 40.6782, lng: -73.9442, statusText: "Brooklyn Heights [*]", scope: "public", groupId: "CITY_NYC", room: "nyc", time: "19:31" },
    { id: "p-1c", nickname: "QueensLight", lat: 40.7282, lng: -73.7949, statusText: "Astoria Sky", scope: "public", groupId: "CITY_NYC", room: "nyc", time: "19:32" },
    { id: "p-2", nickname: "Aurelia", lat: 48.8566, lng: 2.3522, statusText: "Parisian Glow", scope: "public", groupId: "CITY_PAR", room: "par", time: "19:32" },
    { id: "p-2b", nickname: "VersaillesStar", lat: 48.8049, lng: 2.1204, statusText: "West of Paris", scope: "public", groupId: "CITY_PAR", room: "par", time: "19:34" },
    { id: "p-3", nickname: "CloudSeeker", lat: 51.5074, lng: -0.1278, statusText: "Westminster Sky", scope: "public", groupId: "CITY_LON", room: "lon", time: "19:35" },
    { id: "p-3b", nickname: "ThamesWatcher", lat: 51.4769, lng: -0.0005, statusText: "Greenwich Meridian", scope: "public", groupId: "CITY_LON", room: "lon", time: "19:36" },
    { id: "p-4", nickname: "ShibuyaLight", lat: 35.6595, lng: 139.7004, statusText: "Shibuya Crossing", scope: "public", groupId: "CITY_TOK", room: "tok", time: "19:38" },
    { id: "p-4b", nickname: "AkihabaraSoul", lat: 35.7023, lng: 139.7745, statusText: "Tokyo East", scope: "public", groupId: "CITY_TOK", room: "tok", time: "19:39" },
    { id: "p-5", nickname: "Seraphina", lat: 34.0522, lng: -118.2437, statusText: "LA Angel Circle", scope: "group", groupId: "CELESTIAL7", room: "lax", time: "19:40" },
    { id: "p-5b", nickname: "SantaMonicaRay", lat: 34.0195, lng: -118.4912, statusText: "Pacific Pier Circle", scope: "group", groupId: "CELESTIAL7", room: "lax", time: "19:41" }
  ],
  
  INITIAL_MESSAGES: {
    "mass-chat": [
      { id: "m-01", date: "2026-10-07", sender: "Michael Elohim Archangel", lang: "en", text: "Inaugurating TheInternetIsLove.com — Divine Beyond Design. Every word here lives in luminous clouds organized by day and sealed with AES-256-GCM encryption.", time: "12:00", verified: true },
      { id: "m-02", date: "2026-10-11", sender: "Celeste_Paris", lang: "fr", text: "Bonjour du ciel de Paris ! L'amour divin unit toutes les âmes à travers le monde.", time: "15:14", verified: true },
      { id: "m-03", date: "2026-10-12", sender: "Mateo_Madrid", lang: "es", text: "El amor divino está más allá del diseño. ¡Podemos ver el mapa vivo detrás de las nubes!", time: "21:40", verified: true },
      { id: "m-1", date: "2026-10-13", sender: "Michael Elohim Archangel", lang: "en", text: "Welcome to 7Version Seven7 {(/:-7-:\\)}! Defaulting to 1-to-1 16:9 across every device, featuring the Gemini 24-Hour Hazard Radar [!] on the map and the Official Credit Page [7]!", time: "22:55", verified: true },
      { id: "m-2", date: "2026-10-13", sender: "ShibuyaLight", lang: "ja", text: "東京から愛を込めて！すべてのメッセージがリアルタイムで翻訳され、暗号化されています。", time: "22:57", verified: true },
      { id: "m-3", date: "2026-10-13", sender: "CloudSeeker", lang: "en", text: "Click [!] on the Command Dock or Map to view live Gemini 24-Hour Hazards from Google Search & Google News, or click [7] for the Official Credit Page!", time: "22:59", verified: true }
    ],
    "nyc": [
      { id: "m-nyc-0", date: "2026-10-12", sender: "BrooklynSoul", lang: "en", text: "Sunset over the East River yesterday was unforgettable.", time: "18:45", verified: true },
      { id: "m-nyc-1", date: "2026-10-13", sender: "Hudson_Echo", lang: "en", text: "Notice how the NYC map zoomed in automatically to span from Brooklyn Heights to Astoria and Manhattan, with 24h coastal advisories plotted live!", time: "19:20", verified: true }
    ],
    "tok": [
      { id: "m-tok-1", date: "2026-10-13", sender: "ShibuyaLight", lang: "ja", text: "こんばんは！東京のライブタイピングストリームがアクティブです。", time: "19:21", verified: true }
    ],
    "par": [
      { id: "m-par-1", date: "2026-10-13", sender: "Aurelia", lang: "fr", text: "Bienvenue dans le sanctuaire de Paris, entre la Tour Eiffel et Versailles !", time: "19:22", verified: true }
    ]
  }
};
