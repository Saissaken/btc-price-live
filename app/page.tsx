'use client';

import { useEffect, useState, useRef } from 'react';
import { getBitcoinPrice } from './actions/btc-price';

interface PriceData {
  price: number;
  timestamp: string;
}

export default function Home() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [secondsSinceUpdate, setSecondsSinceUpdate] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const priceDataRef = useRef<PriceData | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchPrice = async () => {
      try {
        const data = await getBitcoinPrice();
        if (!isMounted) return;

        priceDataRef.current = data;
        setPriceData(data);
        setSecondsSinceUpdate(0);
      } catch (err) {
        console.error(err);
      }

      if (isMounted) {
        timeoutId = setTimeout(fetchPrice, 2000);
      }
    };

    fetchPrice();

    return () => {
      isMounted = false;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsSinceUpdate(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [priceData]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="text-center px-4">
        {priceData && (
          <>
            <div className="text-6xl sm:text-8xl md:text-9xl font-light">
              ${formatPrice(priceData.price)}
            </div>
            <div className="text-sm sm:text-base mt-4" suppressHydrationWarning>
              {secondsSinceUpdate}s
            </div>
          </>
        )}
      </main>
    </div>
  );
}
