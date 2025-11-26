/**
 * Articles Feature Types
 */

/**
 * Article summary for dashboard display
 */
export interface Article {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

/**
 * Full article detail
 */
export interface ArticleDetail {
  id: string;
  title: string;
  content: string;
  images: string[];
}
