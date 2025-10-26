const fetch = require("node-fetch");
const fs = require("fs");
const path = require("path");

const LOCAL_SKINS_FILE = path.join(__dirname, "..", "data", "skins.json");

// Hilfsfunktion: Kategorie erkennen
function categorizeSkin(name) {
    const rifles = ["AK-47","M4A4","M4A1-S","FAMAS","Galil"];
    const pistols = ["USP-S","Glock-18","Desert Eagle"];
    const snipers = ["AWP","SSG 08"];
    const smgs = ["P90","MP9","UMP-45","MAC-10","MP7","PP-Bizon"];
    const shotguns = ["Nova","MAG-7","Sawed-Off"];

    if(rifles.some(r=>name.includes(r))) return "Rifle";
    if(pistols.some(p=>name.includes(r))) return "Pistol";
    if(snipers.some(s=>name.includes(s))) return "Sniper";
    if(smgs.some(s=>name.includes(s))) return "SMG";
    if(shotguns.some(s=>name.includes(s))) return "Shotgun";
    return "Other";
}

// Hauptfunktion für Netlify Function
exports.handler = async function(event, context) {
    try {
        // 1. Daten von API abrufen
        const response = await fetch("https://xpack.ai/server/unofficial-counter-strike-2-json-api/skins.json");
        let skins = await response.json();

        // 2. Kategorie und Link ergänzen
        skins = skins.map(skin => ({
            name: skin.name,
            image: skin.image_url,
            price: skin.price || "0,00€",
            volume: skin.volume || 0,
            median: skin.median || "0,00€",
            market_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(skin.name)}`,
            category: categorizeSkin(skin.name),
            rarity: skin.rarity || "Unknown"
        }));

        // 3. Lokale Kopie speichern (Backup)
        fs.writeFileSync(LOCAL_SKINS_FILE, JSON.stringify(skins, null, 2));

        // 4. Antwort an Frontend
        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, items: skins })
        };
    } catch (err) {
        console.error(err);

        // Fallback: Lokale skins.json
        let localSkins = [];
        try {
            localSkins = JSON.parse(fs.readFileSync(LOCAL_SKINS_FILE));
        } catch(e) {
            console.error("Lokale Datei fehlt oder fehlerhaft", e);
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, items: localSkins })
        };
    }
};
