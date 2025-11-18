'use server';

// Next.js cacheará automáticamente por 1 segundo usando la opción revalidate
// Binance permite 6000 request weight/minuto, con 1 segundo de cache = 60 requests/minuto
export async function getBitcoinPrice() {
    const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
        {
            next: { revalidate: 1 }, // Cache por 1 segundo
        }
    );

    if (!response.ok) {
        throw new Error(`Binance API returned ${response.status}`);
    }

    const data = await response.json();

    return {
        price: parseFloat(data.price),
        timestamp: new Date().toISOString(),
    };
}
