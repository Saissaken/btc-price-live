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
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const priceDataRef = useRef<PriceData | null>(null);

  // Calculate how many points to show based on screen width
  // Approximately one point every 20px
  const maxPoints = Math.max(30, Math.floor(windowWidth / 20));

  useEffect(() => {
    setIsMounted(true);
    setWindowWidth(window.innerWidth);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: NodeJS.Timeout;

    const fetchPrice = async () => {
      try {
        const data = await getBitcoinPrice();
        if (!isMounted) return;

        // Save previous price before updating
        if (priceDataRef.current) {
          setPreviousPrice(priceDataRef.current.price);
        }

        priceDataRef.current = data;
        setPriceData(data);

        // Add to history (keep only the last N points dynamically)
        setPriceHistory(prev => {
          // If it's the first price, initialize with maxPoints copies of it
          if (prev.length === 0) {
            return Array(maxPoints).fill(data.price);
          }
          // Keep only the last maxPoints prices
          const updated = [...prev, data.price];
          return updated.slice(-maxPoints);
        });
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
  }, [maxPoints]);

  // Minimalist chart component
  const MiniChart = ({ prices }: { prices: number[] }) => {
    if (prices.length < 2) return null;

    const width = windowWidth || 1000;
    const height = 80;
    const padding = 0;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice || 1;

    const points = prices.map((price, index) => {
      const x = (index / (prices.length - 1)) * (width - 2 * padding) + padding;
      const y = height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding);
      return { x, y };
    });

    // Function to determine the color of each segment
    // Keeps previous color when price doesn't change
    const getLineColor = (index: number) => {
      const current = prices[index + 1];
      const previous = prices[index];

      if (current > previous) {
        return '#22c55e'; // Green if up
      } else if (current < previous) {
        return '#ef4444'; // Red if down
      }

      // If unchanged, find the color of the previous segment
      if (index > 0) {
        const prevCurrent = prices[index];
        const prevPrevious = prices[index - 1];
        if (prevCurrent > prevPrevious) {
          return '#22c55e';
        } else if (prevCurrent < prevPrevious) {
          return '#ef4444';
        }
      }

      return '#22c55e'; // Default green
    };

    // Create smooth curves using cubic bezier for smoother transitions
    const createSmoothCurve = (start: { x: number; y: number }, end: { x: number; y: number }) => {
      const deltaX = end.x - start.x;
      const control1X = start.x + deltaX * 0.5;
      const control1Y = start.y;
      const control2X = start.x + deltaX * 0.5;
      const control2Y = end.y;
      return `M ${start.x} ${start.y} C ${control1X} ${control1Y}, ${control2X} ${control2Y}, ${end.x} ${end.y}`;
    };

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
      >
        {/* Draw each curved segment with its color */}
        {points.map((point, i) => {
          if (i === points.length - 1) return null;
          const nextPoint = points[i + 1];
          return (
            <path
              key={`curve-${i}`}
              d={createSmoothCurve(point, nextPoint)}
              fill="none"
              stroke={getLineColor(i)}
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
    );
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
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
      {priceData && (
        <div className="w-full mt-16">
          <MiniChart prices={priceHistory} />
        </div>
      )}
    </div>
  );
}
