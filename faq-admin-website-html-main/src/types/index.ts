export interface FAQ {
  id: number;
  categoryId: number;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
  relatedQuestions?: number[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  order: number;
  expanded: boolean;
  icon?: string;
}

export interface AnalyticsData {
  faqViews: Record<number, number>;
  searchTerms: Record<string, number>;
  categoryViews: Record<number, number>;
  helpfulVotes: Record<number, { helpful: number; notHelpful: number }>;
}

export interface SearchResult {
  faq: FAQ;
  category: Category;
  relevanceScore: number;
}

export type BulkAction = 'activate' | 'deactivate' | 'delete';

export type TabType = 'faqs' | 'categories' | 'analytics' | 'settings';