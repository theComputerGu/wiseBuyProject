export async function geocode(address: string) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    const res = await fetch(url, { headers: { "User-Agent": "WiseBuy-Server" } });
    const data = await res.json();

    if (!data || data.length === 0) return { lat: 0, lon: 0 };

    return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
  } catch {
    return { lat: 0, lon: 0 };
  }
}
