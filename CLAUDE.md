# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Expo React Native application using feature-first architecture with React Query for data management. Currently uses mock APIs to simulate backend calls while the real backend is being developed.

## Development Commands

```bash
# Start development server
npm start              # Interactive mode (choose platform)
npm run ios           # iOS simulator
npm run android       # Android emulator
npm run web           # Web browser

# Code quality
npm run lint          # Run ESLint and Prettier checks
npm run format        # Auto-fix ESLint and Prettier issues

# Build
npm run prebuild      # Generate native code
npm run vercel-build  # Export for Vercel deployment
```

## Architecture

### Feature-First Structure

Code is organized by feature, not by technical layer. Each feature is self-contained:

```
features/
├── dashboard/        # Home screen with scores and feed
├── scan/            # Camera-based product scanning
├── askAI/           # AI chat interface
└── profile/         # User profile and settings
```

Each feature follows this internal structure:

```
feature-name/
├── api/             # API client functions
├── hooks/           # React Query hooks (useQuery/useMutation)
├── screens/         # UI components
├── types.ts         # TypeScript types
└── index.ts         # Public API exports
```

**Important**: Always import from feature barrel exports, never deep imports:

```typescript
// ✅ Good
import { DashboardHome } from 'features/dashboard';

// ❌ Bad
import { DashboardHome } from 'features/dashboard/screens/DashboardHome';
```

### React Query Data Flow

All server state is managed through TanStack React Query:

1. **Query Keys** - Centralized in `app/react-query/queryKeys.ts`
   - Organized by feature (dashboard, scan, ai, profile)
   - Enables precise cache invalidation

2. **API Layer** - Each `feature/*/api/*.api.ts` file contains API functions
   - Uses `common/api/mockClient.ts` (switchable to real client)
   - Returns typed responses

3. **Hooks** - Each `feature/*/hooks/*.ts` file wraps React Query
   - `useQuery` for GET operations
   - `useMutation` for POST/PUT/DELETE operations
   - Handles loading, error, and success states

4. **Screens** - UI components consume hooks
   - No direct API calls in UI code
   - Use `common/components` for loading/error states

### Mock API System

The app currently uses mock APIs to simulate backend:

- **Configuration**: `src/config/mockConfig.ts`
  - `MOCK_NETWORK_DELAY_MS = 1500` - Standard network latency
  - `MOCK_PROCESSING_DELAY_MS = 2000` - For processing-heavy operations
  - `USE_MOCK_API` - Toggle via `EXPO_PUBLIC_USE_MOCK_API` env var

- **Mock Client**: `common/api/mockClient.ts`
  - Methods: `get()`, `post()`, `upload()`, `put()`, `delete()`
  - All methods simulate network latency with `setTimeout`
  - Console logs show `[MockClient] METHOD /path` for debugging

**Switching to Real API**: Update `common/api/index.ts` to export a real HTTP client instead of `mockClient`.

### Global State

- **React Query** - Primary state management for server data
- **AppContext** (`contexts/AppContext.tsx`) - Legacy context for backward compatibility
  - Stores health/environment scores
  - `updateScores()` called after successful scan
  - Will be deprecated once full React Query migration is complete

### Routing

Uses Expo Router (file-based routing):

- `app/(tabs)/` - Main tab navigation
  - `index.tsx` → Dashboard (home)
  - `scan.tsx` → Product scanner
  - `chat.tsx` → AI chat
- `app/_layout.tsx` - Root layout with providers

## TypeScript Configuration

- Base URL set to project root
- Path alias: `@/*` maps to `src/*`
- Strict mode enabled
- Use `npx tsc --noEmit` to check types before committing

## Styling

Uses NativeWind (Tailwind CSS for React Native):

- Utility-first CSS classes work across iOS/Android/Web
- Global styles in `global.css`
- Tailwind config in `tailwind.config.js`
- responsiveness is handled using Tailwind's responsive prefixes (e.g., `xs:text-sm`) , available breakpoints
  screens: {
  xxs: '360px',
  xs: '375px',
  sm: '390px',
  md: '414px',
  lg: '430px',
  xl: '480px',
  },

## Common Patterns

### Adding a New Feature

1. Create feature directory: `features/new-feature/`
2. Define types in `types.ts`
3. Create API functions in `api/feature.api.ts` (use mock responses)
4. Create React Query hooks in `hooks/useFeature.ts`
5. Build screen components in `screens/FeatureScreen.tsx`
6. Export public API from `index.ts`
7. Add query keys to `app/react-query/queryKeys.ts`

### Making API Calls

Always go through the established layers:

```typescript
// 1. Define types (features/example/types.ts)
export interface ExampleData {
  id: string;
  value: number;
}

// 2. Create API function (features/example/api/example.api.ts)
import { apiClient } from 'common/api';

export async function fetchExample(): Promise<ExampleData> {
  const mockData: ExampleData = { id: '123', value: 42 };
  const response = await apiClient.get('/example', mockData);
  return response.data;
}

// 3. Create hook (features/example/hooks/useExample.ts)
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'app/react-query/queryKeys';
import { fetchExample } from '../api/example.api';

export function useExample() {
  return useQuery({
    queryKey: queryKeys.example.data(),
    queryFn: fetchExample,
  });
}

// 4. Use in component (features/example/screens/ExampleScreen.tsx)
import { useExample } from '../hooks/useExample';
import { LoadingPlaceholder, ErrorPlaceholder } from 'common/components';

export function ExampleScreen() {
  const { data, isLoading, isError, error, refetch } = useExample();

  if (isLoading) return <LoadingPlaceholder />;
  if (isError) return <ErrorPlaceholder error={error} onRetry={refetch} />;

  return <View>{/* Render data */}</View>;
}
```

### Cache Invalidation

Invalidate queries when mutations succeed:

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'app/react-query/queryKeys';

export function useUpdateExample() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExample,
    onSuccess: () => {
      // Invalidate related queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.example.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.data() });
    },
  });
}
```

## Key Files

- `app/_layout.tsx` - Root layout, wraps app with QueryClientProvider
- `app/react-query/client.ts` - QueryClient configuration (stale time, cache time, retries)
- `app/react-query/queryKeys.ts` - Centralized query keys for cache management
- `common/api/index.ts` - API client export (switch between mock/real here)
- `src/config/mockConfig.ts` - Mock API configuration
- `contexts/AppContext.tsx` - Legacy context (avoid for new features)

## Feature-Specific Notes

### Scan Feature

- Uses `expo-camera` for image capture
- Upload triggers mutation: `useUploadScan()`
- Shows loading animation with Nubo mascot during processing
- On success: updates AppContext scores and invalidates dashboard query
- Response format has `health` and `environment` objects with `good/ok/bad` arrays

### Dashboard Feature

- Displays health and environment scores
- Shows feed of recent activities
- Refetches automatically on mount and every 5 minutes (React Query config)

### AskAI Feature

- Chat interface with AI
- Supports text messages and image uploads
- Mock responses use keyword matching (8 canned responses)
- Maintains conversation history (last 10 messages)

## Deployment

Configured for Vercel web deployment:

- `vercel.json` - Vercel configuration
- `npm run vercel-build` - Exports static build to `dist/`
- Build serves from `index.html` with SPA routing
