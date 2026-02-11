import { useQuery } from '@tanstack/react-query';

interface MarketPrice {
  symbol: string;
  name: string;
  price: number;
  change24h?: number;
}

export function useMarketPrices() {
  return useQuery<MarketPrice[]>({
    queryKey: ['marketPrices'],
    queryFn: async () => {
      try {
        const response = await fetch(
          'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,internet-computer&vs_currencies=usd&include_24hr_change=true'
        );

        if (!response.ok) {
          throw new Error('Failed to fetch market prices');
        }

        const data = await response.json();

        return [
          {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: data.bitcoin?.usd || 0,
            change24h: data.bitcoin?.usd_24h_change || 0,
          },
          {
            symbol: 'ETH',
            name: 'Ethereum',
            price: data.ethereum?.usd || 0,
            change24h: data.ethereum?.usd_24h_change || 0,
          },
          {
            symbol: 'USDT',
            name: 'Tether',
            price: data.tether?.usd || 1,
            change24h: data.tether?.usd_24h_change || 0,
          },
          {
            symbol: 'ICP',
            name: 'Internet Computer',
            price: data['internet-computer']?.usd || 0,
            change24h: data['internet-computer']?.usd_24h_change || 0,
          },
        ];
      } catch (error) {
        console.error('Market prices fetch error:', error);
        throw new Error('Unable to load market prices. Please try again later.');
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    retry: 2,
  });
}
