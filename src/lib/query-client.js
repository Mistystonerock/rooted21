import { QueryClient } from '@tanstack/react-query';


export const queryClientInstance = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 60 * 1000,
			gcTime: 10 * 60 * 1000,
			refetchOnWindowFocus: false,
			retry: (failureCount, error) => {
				const status = error?.response?.status || error?.status;
				if (status >= 400 && status < 500 && status !== 408 && status !== 429) return false;
				return failureCount < 2;
			},
			retryDelay: attempt => Math.min(800 * 2 ** attempt, 5000),
		},
		mutations: {
			retry: 1,
			retryDelay: 1000,
		},
	},
});