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
    const [isPulsing, setIsPulsing] = useState(false);
    const animationFrameRef = useRef<number | undefined>(undefined);
    const startTimeRef = useRef<number | undefined>(undefined);
    const startPriceRef = useRef<number>(previousPrice ?? price);

    const formatPrice = (price: number) => {
        return price.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
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

        // Activate decimal point pulse
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 300);

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

        // Find decimal point position
        const decimalIndex = formatted.indexOf('.');
        const isAfterDecimal = (index: number) => decimalIndex >= 0 && index > decimalIndex;

        return (
            <span className={`${className} tabular-nums`}>
                {chars.map((char, index) => {
                    // Check if this index is in the set of changed indices
                    let shouldColor = changingIndices.has(index);

                    // Special rule for decimal point:
                    // Only colored if the FIRST digit after decimal changed
                    if (char === '.' && decimalIndex >= 0) {
                        shouldColor = false;
                        // The first digit after decimal is at decimalIndex + 1
                        if (changingIndices.has(decimalIndex + 1)) {
                            shouldColor = true;
                        }
                    }

                    const colorClass = shouldColor
                        ? priceDirection === 'up'
                            ? 'text-green-500'
                            : priceDirection === 'down'
                                ? 'text-red-500'
                                : ''
                        : '';

                    // Make decimals smaller
                    const sizeClass = isAfterDecimal(index) ? 'text-[0.7em]' : '';

                    // Add pulse to decimal point when new price arrives
                    const pulseClass = (char === '.' && isPulsing) ? 'animate-ping' : '';

                    return (
                        <span
                            key={index}
                            className={`transition-colors duration-100 ${colorClass} ${sizeClass} ${pulseClass}`}
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
