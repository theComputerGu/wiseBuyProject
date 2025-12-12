export async function geocodeAddress(
    address: string
): Promise<{ lat: number; lon: number } | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                address
            )}&limit=1`,
            {
                headers: {
                    "User-Agent": "WiseBuyBackend/1.0",
                },
            }
        );

        const data = await res.json();
        if (!data?.length) return null;

        return {
            lat: Number(data[0].lat),
            lon: Number(data[0].lon),
        };
    } catch (e) {
        console.error("GEOCODE FAILED:", address);
        return null;
    }
}
