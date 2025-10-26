const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const SKINS_LIST_URL = "https://www.csgodatabase.com/skins/"; // URL mit allen CS2-Skins

exports.handler = async function(event, context) {
  try {
    const skins = await fetchSkinsList();
    const marketData = await fetchMarketData(skins);
    saveMarketData(marketData);
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, items: marketData })
    };
  } catch (err) {
    console.error("Fehler beim Abrufen der Marktdaten:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: "Fehler beim Abrufen der Marktdaten" })
    };
  }
};

async function fetchSkinsList() {
  const response = await fetch(SKINS_LIST_URL);
  const html = await response.text();
  const skinNames = parseSkinNamesFromHTML(html);
  return skinNames;
}

function parseSkinNamesFromHTML(html) {
  // Hier wird der HTML-Inhalt geparsed, um die Skin-Namen zu extrahieren
  // Dies ist ein Platzhalter; die tatsächliche Implementierung hängt vom HTML-Aufbau der Seite ab
  return ["AK-47 | Redline (Field-Tested)", "AWP | Asiimov (Battle-Scarred)", "M4A4 | Desolate Space (Field-Tested)"];
}

async function fetchMarketData(skins) {
  const marketData = [];
  for (const skin of skins) {
    const url = `https://steamcommunity.com/market/priceoverview/?currency=3&appid=730&market_hash_name=${encodeURIComponent(skin)}`;
    const response = await fetch(url);
    const data = await response.json();
    marketData.push({
      name: skin,
      price: data.lowest_price || "N/A",
      volume: data.volume || "N/A",
      median: data.median_price || "N/A",
      market_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(skin)}`
    });
  }
  return marketData;
}

function saveMarketData(data) {
  const filePath = path.join(__dirname, "..", "marketData.json");
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
