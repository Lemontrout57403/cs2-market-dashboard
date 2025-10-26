// ======================================================
// CS2 Market Analyzer API
// Lädt Preisdaten zu CS2-Items vom Steam Community Market
// ======================================================

export default async function handler(req, res) {
  try {
    // Beispielhafte Item-Liste (du kannst sie später erweitern)
    const items = [
      "AK-47 | Redline (Field-Tested)",
      "AWP | Asiimov (Battle-Scarred)",
      "M4A4 | Desolate Space (Field-Tested)",
      "Desert Eagle | Blaze (Factory New)",
      "AK-47 | Slate (Minimal Wear)"
    ];

    const marketData = await Promise.all(
      items.map(async (item) => {
        const url = `https://steamcommunity.com/market/priceoverview/?currency=3&appid=730&market_hash_name=${encodeURIComponent(
          item
        )}`;
        const response = await fetch(url);
        const data = await response.json();

        return {
          name: item,
          price: data.lowest_price || "N/A",
          volume: data.volume || "N/A",
          median: data.median_price || "N/A"
        };
      })
    );

    res.status(200).json({ success: true, items: marketData });
  } catch (error) {
    console.error("Fehler beim Laden der Steam-Daten:", error);
    res.status(500).json({ success: false, error: "Steam API Fehler" });
  }
}
