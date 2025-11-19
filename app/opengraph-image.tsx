import { ImageResponse } from 'next/og';
import { getBitcoinPrice } from './actions/btc-price';

export const runtime = 'edge';

export const alt = 'Bitcoin Price Live';
export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

// Revalidate every 60 seconds
export const revalidate = 60;

export default async function Image() {
    // Fetch Roboto Mono font
    const fontData = await fetch(
        new URL('https://fonts.gstatic.com/s/robotomono/v23/L0x5DF4xlVMF-BfR8bXMIjhLq3-cXbKDO1w.woff2', import.meta.url)
    ).then((res) => res.arrayBuffer());

    let price = 'Loading...';
    try {
        const data = await getBitcoinPrice();
        price = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(data.price);
    } catch (e) {
        console.error('Failed to fetch price for OG image', e);
        price = 'BTC Live';
    }

    return new ImageResponse(
        (
            <div
                style={{
                    background: '#0a0a0a',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Roboto Mono"',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                    }}
                >
                    {/* Bitcoin Logo SVG */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: '20px',
                        }}
                    >
                        <svg
                            width="80"
                            height="80"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <circle cx="12" cy="12" r="12" fill="#f7931a" />
                            <path
                                d="M16.662 10.661c.235-1.57-0.962-2.412-2.6-2.973l.532-2.13-1.294-.323-.518 2.073c-.34-.085-.69-.165-1.039-.244l.52-2.08-1.295-.323-.53 2.126c-.282-.064-.559-.128-.832-.19l.002-.008-1.786-.446-.345 1.383s.962.22.942.234c.525.13.62.476.603.75l-.604 2.42c.036.01.083.024.135.046-.043-.01-.09-.022-.137-.034l-.846 3.39c-.064.158-.227.396-.594.305.02.015-.941-.235-.941-.235l-.644 1.486 1.685.42c.314.079.623.162.923.238l-.536 2.144 1.295.323.53-2.12c.354.096.7.186 1.048.27l-.528 2.11 1.294.324.537-2.144c2.207.417 3.868.25 4.566-1.747.563-1.608-.028-2.534-1.188-3.138.845-.195 1.482-.75 1.652-1.897zm-2.947 4.15c-.4 1.608-3.108.84-3.988.622l.712-2.85c.88.22 3.61.655 3.276 2.228zm.4-4.17c-.365 1.463-2.62.72-3.353.537l.645-2.585c.733.183 3.018.523 2.708 2.048z"
                                fill="white"
                            />
                        </svg>
                    </div>
                    <div
                        style={{
                            fontSize: '40px',
                            color: '#888',
                        }}
                    >
                        BTC / USDT
                    </div>
                </div>
                <div
                    style={{
                        fontSize: '120px',
                        fontWeight: 'bold',
                        color: 'white',
                        letterSpacing: '-4px',
                    }}
                >
                    {price}
                </div>
                <div
                    style={{
                        marginTop: '40px',
                        fontSize: '24px',
                        color: '#22c55e',
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            background: '#22c55e',
                            marginRight: '10px',
                        }}
                    />
                    Live Price
                </div>
            </div>
        ),
        {
            ...size,
        }
    );
}
