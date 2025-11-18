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
        // Si no hay precio anterior, solo mostrar el precio actual
        if (previousPrice === null) {
            setDisplayPrice(price);
            return;
        }

        // Si el precio no cambió, no hacer nada
        if (price === previousPrice) {
            return;
        }

        // Activar el pulso del punto decimal
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 300);

        // Determinar dirección del cambio
        const direction = price > previousPrice ? 'up' : 'down';
        setPriceDirection(direction);

        // Identificar desde dónde empieza el cambio
        const previousFormatted = formatPrice(previousPrice);
        const currentFormatted = formatPrice(price);
        const changed = new Set<number>();

        // Encontrar el primer índice donde hay una diferencia en los DÍGITOS
        let firstChangedIndex = -1;
        const maxLen = Math.max(previousFormatted.length, currentFormatted.length);

        for (let i = 0; i < maxLen; i++) {
            const prevChar = previousFormatted[i] || '';
            const currChar = currentFormatted[i] || '';

            // Solo considerar dígitos para detectar cambio
            if (/\d/.test(prevChar) || /\d/.test(currChar)) {
                if (prevChar !== currChar) {
                    firstChangedIndex = i;
                    break;
                }
            }
        }

        // Si encontramos un cambio, marcar todo desde ahí hasta el final
        if (firstChangedIndex >= 0) {
            for (let i = firstChangedIndex; i < currentFormatted.length; i++) {
                changed.add(i);
            }
        }

        // Actualizar los índices que están cambiando (se mantienen coloreados permanentemente)
        setChangingIndices(changed);

        // Configurar la animación
        startPriceRef.current = previousPrice;
        startTimeRef.current = performance.now();

        const duration = 3000; // Duración de la animación en ms (3 segundos)

        const animate = (currentTime: number) => {
            if (!startTimeRef.current) return;

            const elapsed = currentTime - startTimeRef.current;
            const progress = Math.min(elapsed / duration, 1);

            // Función de easing para una animación más suave
            const easeOutQuad = (t: number) => t * (2 - t);
            const easedProgress = easeOutQuad(progress);

            // Calcular el precio animado
            const priceDiff = price - startPriceRef.current;
            const animatedPrice = startPriceRef.current + (priceDiff * easedProgress);

            setDisplayPrice(animatedPrice);

            if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
            // NO limpiar los índices cambiados - se mantienen coloreados permanentemente
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

        // Encontrar la posición del punto decimal
        const decimalIndex = formatted.indexOf('.');
        const isAfterDecimal = (index: number) => decimalIndex >= 0 && index > decimalIndex;

        return (
            <span className={`${className} tabular-nums`}>
                {chars.map((char, index) => {
                    // Verificar si este índice está en el set de índices que cambiaron
                    let shouldColor = changingIndices.has(index);

                    // Regla especial para el punto decimal:
                    // Solo se colorea si el PRIMER dígito después del decimal cambió
                    if (char === '.' && decimalIndex >= 0) {
                        shouldColor = false;
                        // El primer dígito después del decimal está en decimalIndex + 1
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

                    // Hacer los decimales más pequeños
                    const sizeClass = isAfterDecimal(index) ? 'text-[0.7em]' : '';

                    // Agregar pulso al punto decimal cuando llega nuevo precio
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
