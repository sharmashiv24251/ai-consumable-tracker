/**
 * Articles API
 * Mock endpoints for articles/news
 */

import { apiClient } from '../../../common/api';
import { MOCK_NETWORK_DELAY_MS } from '../../../src/config/mockConfig';
import type { Article, ArticleDetail } from '../types';

/**
 * Mock articles for dashboard
 */
const MOCK_ARTICLES: Article[] = [
  {
    id: 'article_001',
    title: 'New Superfood Delivery?',
    description: 'See why matcha is gaining popularity for its potential health benefits',
    imageUrl: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&h=600&fit=crop',
  },
  {
    id: 'article_002',
    title: 'Sustainable Packaging Guide',
    description:
      'Learn how to identify eco-friendly packaging and reduce your environmental impact',
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop',
  },
];

/**
 * Mock article details
 */
const MOCK_ARTICLE_DETAILS: Record<string, ArticleDetail> = {
  article_001: {
    id: 'article_001',
    title: 'New Superfood Delivery?',
    images: [
      'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1761839257874-e56dfa2260cb?q=80&w=2369&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582454591155-240974305fa9?w=800&h=600&fit=crop',
    ],
    content: `Matcha has exploded in popularity over recent years, and for good reason. This vibrant green powder, made from specially grown and processed green tea leaves, offers a unique combination of health benefits that set it apart from regular tea.

**Rich in Antioxidants**

Matcha is packed with catechins, a type of antioxidant that helps fight cell damage and prevent chronic disease. In fact, matcha contains up to 137 times more antioxidants than regular green tea.

**Boosts Brain Function**

The combination of caffeine and L-theanine in matcha provides a calm, focused energy without the jitters often associated with coffee. Studies show it can improve attention, memory, and reaction time.

**Supports Heart Health**

Regular consumption of matcha has been linked to reduced risk of heart disease. The catechins in matcha help lower LDL cholesterol levels and reduce the risk of stroke.

**How to Enjoy Matcha**

From traditional tea ceremonies to modern matcha lattes, smoothie bowls, and baked goods, there are countless ways to incorporate this superfood into your daily routine. Start with high-quality ceremonial grade matcha for the best flavor and health benefits.`,
  },
  article_002: {
    id: 'article_002',
    title: 'Sustainable Packaging Guide',
    images: [
      'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800&h=600&fit=crop',
    ],
    content: `Understanding sustainable packaging is crucial for making environmentally conscious purchasing decisions. This guide will help you identify truly eco-friendly packaging and avoid greenwashing.

**What Makes Packaging Sustainable?**

Sustainable packaging minimizes environmental impact through recyclability, biodegradability, or reusability. Look for materials like cardboard, glass, aluminum, or certified compostable plastics.

**Common Packaging Materials Ranked**

1. **Best:** Glass, aluminum, cardboard, paper
2. **Good:** #1 and #2 plastics (widely recyclable)
3. **Okay:** #4 and #5 plastics (less commonly recycled)
4. **Avoid:** #3, #6, #7 plastics, mixed materials, non-recyclable laminates

**Reading Recycling Symbols**

The recycling symbol with a number (1-7) indicates the type of plastic. Just because it has a recycling symbol doesn't mean it's widely recycled in your area. Check with local facilities.

**What You Can Do**

- Choose products with minimal packaging
- Look for recyclable or compostable materials
- Support brands using sustainable packaging
- Properly sort and clean recyclables
- Consider package-free alternatives when available`,
  },
};

/**
 * Fetch list of articles for dashboard
 * In real implementation, this would be GET /api/articles
 */
export async function fetchArticles(): Promise<Article[]> {
  console.log('[Articles API] Fetching articles...');

  const response = await apiClient.get<Article[]>(
    '/articles',
    MOCK_ARTICLES,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}

/**
 * Fetch article detail by ID
 * In real implementation, this would be GET /api/articles/{id}
 */
export async function fetchArticleById(id: string): Promise<ArticleDetail> {
  console.log(`[Articles API] Fetching article ${id}...`);

  const article = MOCK_ARTICLE_DETAILS[id];

  if (!article) {
    throw new Error(`Article ${id} not found`);
  }

  const response = await apiClient.get<ArticleDetail>(
    `/articles/${id}`,
    article,
    MOCK_NETWORK_DELAY_MS
  );

  return response.data;
}
