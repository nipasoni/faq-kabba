import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface AnalyticsData {
  faqViews: Record<number, number>;
  searchTerms: Record<string, number>;
  categoryViews: Record<number, number>;
  helpfulVotes: Record<number, { helpful: number; notHelpful: number }>;
}

const initialAnalytics: AnalyticsData = {
  faqViews: {},
  searchTerms: {},
  categoryViews: {},
  helpfulVotes: {}
};

export function useAnalytics() {
  const [analytics, setAnalytics] = useLocalStorage<AnalyticsData>('faq-analytics', initialAnalytics);

  const trackFaqView = (faqId: number) => {
    setAnalytics(prev => ({
      ...prev,
      faqViews: {
        ...prev.faqViews,
        [faqId]: (prev.faqViews[faqId] || 0) + 1
      }
    }));
  };

  const trackSearch = (term: string) => {
    if (term.trim().length > 0) {
      setAnalytics(prev => ({
        ...prev,
        searchTerms: {
          ...prev.searchTerms,
          [term.toLowerCase()]: (prev.searchTerms[term.toLowerCase()] || 0) + 1
        }
      }));
    }
  };

  const trackCategoryView = (categoryId: number) => {
    setAnalytics(prev => ({
      ...prev,
      categoryViews: {
        ...prev.categoryViews,
        [categoryId]: (prev.categoryViews[categoryId] || 0) + 1
      }
    }));
  };

  const trackHelpfulVote = (faqId: number, isHelpful: boolean) => {
    setAnalytics(prev => ({
      ...prev,
      helpfulVotes: {
        ...prev.helpfulVotes,
        [faqId]: {
          helpful: (prev.helpfulVotes[faqId]?.helpful || 0) + (isHelpful ? 1 : 0),
          notHelpful: (prev.helpfulVotes[faqId]?.notHelpful || 0) + (!isHelpful ? 1 : 0)
        }
      }
    }));
  };

  const getTopSearchTerms = (limit = 10) => {
    return Object.entries(analytics.searchTerms)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit);
  };

  const getMostViewedFaqs = (limit = 10) => {
    return Object.entries(analytics.faqViews)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([id, views]) => ({ id: parseInt(id), views }));
  };

  return {
    analytics,
    trackFaqView,
    trackSearch,
    trackCategoryView,
    trackHelpfulVote,
    getTopSearchTerms,
    getMostViewedFaqs
  };
}