/**
 * Hook for fetching article detail by ID
 */

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../app/react-query/queryKeys';
import { fetchArticleById } from '../api/articles.api';

export function useArticleDetail(articleId: string) {
  return useQuery({
    queryKey: queryKeys.articles.detail(articleId),
    queryFn: () => fetchArticleById(articleId),
    enabled: !!articleId,
  });
}
