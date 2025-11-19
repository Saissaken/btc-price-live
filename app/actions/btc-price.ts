'use server';

// Next.js will automatically cache for 1 second using the revalidate option
// Binance allows 6000 request weight/minute, with 1 second cache = 60 requests/minute
export async function getBitcoinPrice() {
    const response = await fetch(
        'https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT',
        {
            next: { revalidate: 1 }, // Cache for 1 second
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
