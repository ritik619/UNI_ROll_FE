# Unified Axios Implementation Guide

This document describes the unified axios implementation for handling API requests in our application.

## Overview

We've consolidated our axios implementations into a single, unified approach that provides:
- A standard axios instance for regular requests
- An authenticated axios instance for requests requiring auth
- Utility functions for both types of requests
- A centralized endpoint configuration

## Key Files

- `src/lib/axios-unified.ts` - The main implementation
- `src/auth/context/auth-axios-provider-unified.tsx` - Provider for auth tokens
- `src/auth/hooks/use-auth-axios-unified.ts` - Hook for component-level usage

## How to Use

### Making Regular API Requests

```typescript
import { axiosInstance, endpoints } from 'src/lib/axios-unified';

// Simple GET request
const response = await axiosInstance.get(endpoints.product.list);

// With parameters
const response = await axiosInstance.get(endpoints.product.search, { 
  params: { query: 'search term' } 
});
```

### Making Authenticated API Requests

```typescript
import { authAxiosInstance, endpoints } from 'src/lib/axios-unified';

// The auth token is automatically added
const response = await authAxiosInstance.get(endpoints.agents.list);

// With parameters
const response = await authAxiosInstance.post(endpoints.agents.list, {
  firstName: 'John',
  lastName: 'Doe',
  // ...other fields
});
```

### Using the Utility Functions

```typescript
import { fetcher, authFetcher, endpoints } from 'src/lib/axios-unified';

// Regular fetcher
const data = await fetcher(endpoints.product.list);

// Auth fetcher
const data = await authFetcher(endpoints.agents.list);

// With parameters
const data = await authFetcher([
  endpoints.agents.list, 
  { params: { page: 1, limit: 10 } }
]);
```

### Using Endpoints

Always use the centralized endpoints from `src/lib/axios-unified.ts`:

```typescript
import { endpoints } from 'src/lib/axios-unified';

// Static endpoints
const url = endpoints.agents.list;  // 'agents'

// Dynamic endpoints
const url = endpoints.agents.details('123');  // 'agents/123'
```

## Authentication

Authentication is handled automatically by the `AuthAxiosProvider` that's set up in the app's root layout. No additional configuration is needed in your components.

## Adding New Endpoints

When adding new API endpoints, update the `endpoints` object in `src/lib/axios-unified.ts`:

```typescript
export const endpoints = {
  // Existing endpoints...
  
  // Add your new endpoints here
  newFeature: {
    list: 'new-feature',
    details: (id: string) => `new-feature/${id}`,
    search: 'new-feature/search',
  },
};
```

## Best Practices

1. Always use the `endpoints` object for URL paths
2. Use `authAxiosInstance` for authenticated requests
3. Use `axiosInstance` for public/unauthenticated requests
4. Handle errors properly with try/catch blocks
5. Use the TypeScript interfaces for better type safety

## Migration

We're migrating from the old `axios.ts` and `authAxios.ts` approach. 
If you find code still using the old files, please update them to use this unified approach.