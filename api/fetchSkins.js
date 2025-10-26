const fs = require("fs");
const path = require("path");

exports.handler = async function(event, context) {
  try {
    const skinsData = JSON.parse(fs.readFileSync(path.join(__dirname,"..","skins.json")));
    const marketData = skinsData.map(skin => ({
      name: skin.name,
      price: "0,50€", 
      volume: "100",
      median: "0,55€",
      market_url: `https://steamcommunity.com/market/listings/730/${encodeURIComponent(skin.name)}`,
      category: classifyCategory(skin.name)
    }));
    return { statusCode:200, body:JSON.stringify({ success:true, items:marketData }) };
  } catch(err) {
    console.error(err);
    return { statusCode:500, body:JSON.stringify({ success:false, error:"Fehler beim Laden der Daten" }) };
  }
};

function classifyCategory(name) {
  const rifles = ["AK-47","M4A4","M4A1-S"];
  const pistols = ["Desert Eagle","Glock-18","USP-S"];
  const snipers = ["AWP","SSG 08"];
  if(rifles.some(r => name.includes(r))) return "rifle";
  if(pistols.some(p => name.includes(r))) return "pistol";
  if(snipers.some(s => name.includes(s))) return "sniper";
  return "other";
}
