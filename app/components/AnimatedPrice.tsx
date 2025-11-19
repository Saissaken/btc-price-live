'use client';

import { useEffect, useState, useRef } from 'react';

interface AnimatedPriceProps {
    price: number;
    previousPrice: number | null;
    className?: string;
}

export default function AnimatedPrice({ price, previousPrice, className = '' }: AnimatedPriceProps) {
    const [displayPrice, setDisplayPrice] = useState(previousPrice ?? price);
    const [changingIndices, setChangingIndices] = useState<Set<number>>(new Set());
    const [priceDirection, setPriceDirection] = useState<'up' | 'down' | 'neutral'>('neutral');
    const animationFrameRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);
    const startPriceRef = useRef<number>(previousPrice ?? price);

    const formatPrice = (price: number) => {
        return Math.round(price).toLocaleString('en-US');
    };

    useEffect(() => {
        // If no previous price, just show current price
        if (previousPrice === null) {
            setDisplayPrice(price);
            return;
        }

        // If price didn't change, do nothing
        if (price === previousPrice) {
            return;
        }

        // Determine change direction
        const direction = price > previousPrice ? 'up' : 'down';
        setPriceDirection(direction);

        // Reset changed indices for new animation
        setChangingIndices(new Set());
        const accumulatedChanges = new Set<number>();

        // Configure animation
        startPriceRef.current = previousPrice;
        startTimeRef.current = performance.now();

        const startFormatted = formatPrice(previousPrice);

        const duration = 3000; // Animation duration in ms (3 seconds)

        const animate = (currentTime: number) => {
            if (!startTimeRef.current) return;

            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smoother animation
            const easeOutQuad = (t: number) => t * (2 - t);
            const easedProgress = easeOutQuad(progress);

            // Calculate animated price
            const priceDiff = price - startPriceRef.current;
            const animatedPrice = startPriceRef.current + (priceDiff * easedProgress);

            // Check for digit changes
            const currentFormatted = formatPrice(animatedPrice);
            let hasNewChanges = false;
            const maxLen = Math.max(startFormatted.length, currentFormatted.length);

            for (let i = 0; i < maxLen; i++) {
                const startChar = startFormatted[i] || '';
                const currChar = currentFormatted[i] || '';

                // Only consider digits to detect change
                if (/\d/.test(startChar) || /\d/.test(currChar)) {
                    if (startChar !== currChar) {
                        if (!accumulatedChanges.has(i)) {
                            accumulatedChanges.add(i);
                            hasNewChanges = true;
                        }
                    }
                }
            }

            if (hasNewChanges) {
                setChangingIndices(new Set(accumulatedChanges));
            }

            setDisplayPrice(animatedPrice);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [price, previousPrice]);

    const renderFormattedPrice = () => {
        const formatted = formatPrice(displayPrice);
        const chars = formatted.split('');

        return (
            <span className={`${className} tabular-nums`}>
                {chars.map((char, index) => {
                    const shouldColor = changingIndices.has(index);

                    const colorClass = shouldColor
                        ? priceDirection === 'up'
                            ? 'text-green-500'
                            : priceDirection === 'down'
                                ? 'text-red-500'
                                : ''
                        : '';

                    return (
                        <span
                            key={index}
                            className={`transition-colors duration-100 ${colorClass}`}
                        >
                            {char}
                        </span>
                    );
                })}
            </span>
        );
    };

    return renderFormattedPrice();
}
