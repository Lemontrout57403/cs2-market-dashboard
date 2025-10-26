const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

// Externe Quelle: vollständige Skin-Liste
const SKINS_API_URL = "https://bymykel.com/CSGO-API/skins.json";

exports.handler = async function(event, context) {
  try {
    // Prüfen, ob gecachte Daten existieren
    const cacheFile = path.join(__dirname, "..", "marketData.json");
    let useCache = false;
    if(fs.existsSync(cacheFile)) {
      const stats = fs.statSync(cacheFile);
      const age = (Date.now() - stats.mtimeMs) / 1000 / 60; // Minuten
      if(age < 5) useCache = true; // Cache < 5 Min
    }

    if(useCache) {
      const cachedData = JSON.parse(fs.readFileSync(cacheFile));
      return { statusCode:200, body:JSON.stringify({ success:true, items:cachedData }) };
    }

    // Alle Skins abrufen
    const skinsResponse = await fetch(SKINS_API_URL);
    const skinsData = await skinsResponse.json();

    // Marktdaten von Steam abrufen
    const marketData = [];
    for(const skin of skinsData) {
      const url = `https://steamcommunity.com/market/priceoverview/?currency=3&appid=730&market_hash_name=${encodeURIComponent(skin.name)}`;
      const response = await fetch(url);
      const data = await response.json();
      marketData.push({
        name: skin.name,
        price: data.lowest_price || "N/A",
        volume: data.volume || "N/A",
        median: data.median_price || "N/A",
        market_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(skin.name)}`,
        category: classifyCategory(skin.name)
      });
    }

    fs.writeFileSync(cacheFile, JSON.stringify(marketData, null, 2));
    return { statusCode:200, body:JSON.stringify({ success:true, items:marketData }) };

  } catch(err) {
    console.error(err);
    return { statusCode:500, body:JSON.stringify({ success:false, error:"Fehler beim Abrufen der Skindaten" }) };
  }
};

// Kategorien: Rifle / Pistol / Sniper
function classifyCategory(name) {
  const rifles = ["AK-47","M4A4","M4A1-S"];
  const pistols = ["Desert Eagle","Glock-18","USP-S"];
  const snipers = ["AWP","SSG 08"];
  if(rifles.some(r => name.includes(r))) return "rifle";
  if(pistols.some(p => name.includes(p))) return "pistol";
  if(snipers.some(s => name.includes(s))) return "sniper";
  return "other";
}
