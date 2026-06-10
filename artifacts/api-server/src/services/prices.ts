interface PriceCache {
  btcUsd: number;
  ethUsd: number;
  updatedAt: number;
}

const FALLBACK = { btcUsd: 67500, ethUsd: 3200 };
const CACHE_TTL = 5 * 60 * 1000;
let cache: PriceCache | null = null;

export async function getLivePrices(): Promise<{ btcUsd: number; ethUsd: number }> {
  if (cache && Date.now() - cache.updatedAt < CACHE_TTL) {
    return { btcUsd: cache.btcUsd, ethUsd: cache.ethUsd };
  }
  try {
    const r = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd",
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(4000) }
    );
    if (!r.ok) throw new Error(`CoinGecko ${r.status}`);
    const data = await r.json() as { bitcoin: { usd: number }; ethereum: { usd: number } };
    cache = { btcUsd: data.bitcoin.usd, ethUsd: data.ethereum.usd, updatedAt: Date.now() };
    return { btcUsd: cache.btcUsd, ethUsd: cache.ethUsd };
  } catch {
    return cache ? { btcUsd: cache.btcUsd, ethUsd: cache.ethUsd } : FALLBACK;
  }
}

export function getCachedPrices() {
  return cache ?? { ...FALLBACK, updatedAt: 0 };
}
