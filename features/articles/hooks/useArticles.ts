/**
 * Hook for fetching articles list
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../app/react-query/queryKeys';
import { fetchArticles } from '../api/articles.api';

export function useArticles() {
  return useQuery({
    queryKey: queryKeys.articles.list(),
    queryFn: fetchArticles,
  });
}
