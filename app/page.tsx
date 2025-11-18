'use client';

import { useEffect, useState, useRef } from 'react';
import { getBitcoinPrice } from './actions/btc-price';
import AnimatedPrice from './components/AnimatedPrice';

interface PriceData {
  price: number;
  timestamp: string;
}

export default function Home() {
  const [priceData, setPriceData] = useState<PriceData | null>(null);
  const [previousPrice, setPreviousPrice] = useState<number | null>(null);
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

        // Guardar el precio anterior antes de actualizar
        if (priceDataRef.current) {
          setPreviousPrice(priceDataRef.current.price);
        }

        priceDataRef.current = data;
        setPriceData(data);
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

  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="text-center px-4">
        {priceData && (
          <div className="text-6xl sm:text-8xl md:text-9xl font-light">
            $<AnimatedPrice
              price={priceData.price}
              previousPrice={previousPrice}
            />
          </div>
        )}
      </main>
    </div>
  );
}
