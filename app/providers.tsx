'use client'

import type { ReactNode } from 'react'
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { NextAuthProvider } from '@/components/providers/session-provider'
import { Toaster } from '@/components/ui/sonner'
import { getErrorMessage } from '@/lib/logger'
import { showApiErrorToast } from '@/lib/toast'
import { queryClientConfig } from '@/lib/query-client'

let browserQueryClient: QueryClient | undefined

function getQueryClient() {
  // Keep server requests isolated and preserve the browser cache across
  // renders. The mutation cache carries the global error safety net so even a
  // bare useMutation surfaces exactly one error toast (docs/
  // API_MUTATIONS_AND_TOASTS.md) — unless it opts out via meta.toastHandled.
  const client = new QueryClient({
    ...queryClientConfig,
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.toastHandled) return
        showApiErrorToast(getErrorMessage(error, 'Something went wrong'))
      },
    }),
  })
  if (typeof window === 'undefined') return client
  browserQueryClient ??= client
  return browserQueryClient
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <NextAuthProvider>
      <QueryClientProvider client={getQueryClient()}>
        {children}
        <Toaster position="top-right" richColors />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </NextAuthProvider>
  )
}
