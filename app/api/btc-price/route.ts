import { NextResponse } from 'next/server';

// Cache para respetar los límites de Binance API
// Binance permite 6000 request weight/minuto
// Usamos caché de 1 segundo = 60 requests/minuto (muy por debajo del límite)
interface CacheEntry {
  price: number;
  timestamp: string;
  fetchedAt: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL_MS = 1000; // 1 segundo de caché

export async function GET() {
  try {
    const now = Date.now();

    // Si tenemos caché válido, retornarlo inmediatamente
    if (cache && (now - cache.fetchedAt) < CACHE_TTL_MS) {
      return NextResponse.json({
        price: cache.price,
        timestamp: cache.timestamp,
        cached: true,
      });
    }

    // Si no hay caché o expiró, hacer request a Binance
    const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT', {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Binance API returned ${response.status}`);
    }

    const data = await response.json();

    // Actualizar caché
    cache = {
      price: parseFloat(data.price),
      timestamp: new Date().toISOString(),
      fetchedAt: now,
    };

    return NextResponse.json({
      price: cache.price,
      timestamp: cache.timestamp,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching Bitcoin price:', error);

    // Si hay caché antiguo, retornarlo aunque esté expirado
    if (cache) {
      return NextResponse.json({
        price: cache.price,
        timestamp: cache.timestamp,
        cached: true,
        stale: true,
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch Bitcoin price' },
      { status: 500 }
    );
  }
}
