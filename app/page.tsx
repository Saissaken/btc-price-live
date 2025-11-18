'use client';

import { useEffect, useState, useRef } from 'react';

interface PriceData {
  price: number;
  timestamp: string;
}

export default function Home() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<'up' | 'down' | null>(null);
  const priceDataRef = useRef<PriceData | null>(null);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchPrice = async () => {
      try {
        const response = await fetch('/api/btc-price');

        if (!response.ok) {
          throw new Error('Failed to fetch price');
        }

        const data: PriceData = await response.json();

        // Solo actualizar si el componente sigue montado
        if (!isMounted) return;

        // Detectar cambio de precio usando ref
        if (priceDataRef.current && data.price !== priceDataRef.current.price) {
          setPreviousPrice(priceDataRef.current.price);
          setPriceChange(data.price > priceDataRef.current.price ? 'up' : 'down');

          // Resetear el indicador después de 500ms
          setTimeout(() => setPriceChange(null), 500);
        }

        // Actualizar ref y state
        priceDataRef.current = data;
        setPriceData(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (!isMounted) return;
        setError('Error al obtener el precio');
        setLoading(false);
      }

      // Esperar 2 segundos después de que el request se complete
      // antes de hacer el siguiente request
      if (isMounted) {
        timeoutId = setTimeout(fetchPrice, 2000);
      }
    };

    // Fetch inicial
    fetchPrice();

    // Limpiar el timeout al desmontar
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Array vacío - solo ejecutar una vez al montar

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="w-full max-w-2xl px-6">
        <div className="rounded-3xl bg-white/5 p-12 backdrop-blur-xl border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-2xl font-light text-white/60 tracking-wide mb-2">
              Bitcoin Price
            </h1>
            <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-orange-500 to-transparent"></div>
          </div>

          {/* Precio */}
          <div className="text-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin"></div>
                <p className="text-white/40 text-sm">Cargando precio...</p>
              </div>
            ) : error ? (
              <div className="text-red-400 text-lg">{error}</div>
            ) : priceData ? (
              <div className="space-y-6">
                <div
                  className={`text-6xl font-bold transition-all duration-300 ${priceChange === 'up'
                    ? 'text-green-400 scale-105'
                    : priceChange === 'down'
                      ? 'text-red-400 scale-105'
                      : 'text-white scale-100'
                    }`}
                >
                  {formatPrice(priceData.price)}
                </div>

                {/* Indicador de cambio */}
                {previousPrice && (
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {priceChange === 'up' && (
                      <span className="text-green-400 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        +{formatPrice(priceData.price - previousPrice)}
                      </span>
                    )}
                    {priceChange === 'down' && (
                      <span className="text-red-400 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                        {formatPrice(priceData.price - previousPrice)}
                      </span>
                    )}
                  </div>
                )}

                {/* Timestamp */}
                <div className="text-white/30 text-xs">
                  Última actualización: {new Date(priceData.timestamp).toLocaleTimeString('es-ES')}
                </div>
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-white/20 text-xs">
              Actualización automática cada 2 segundos
            </p>
            <p className="text-white/20 text-xs mt-1">
              Datos de Binance
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
