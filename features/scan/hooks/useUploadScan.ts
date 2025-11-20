/**
 * Scan React Query Hooks
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadScan } from '../api/scan.api';
import { queryKeys } from '../../../app/react-query/queryKeys';
import type { ScanUploadPayload, ScanResult } from '../types';

/**
 * Hook to upload and analyze a scanned product image
 * Returns mutation with isLoading, error, and data states
 */
export function useUploadScan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ScanUploadPayload) => uploadScan(payload),

    onSuccess: (data: ScanResult) => {
      console.log('[useUploadScan] Scan successful:', data.scanId);

      // Invalidate scan history to refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.scan.history(),
      });

      // Invalidate dashboard to update scores
      queryClient.invalidateQueries({
        queryKey: queryKeys.dashboard.all,
      });
    },

    onError: (error: Error) => {
      console.error('[useUploadScan] Scan failed:', error);
    },
  });
}
