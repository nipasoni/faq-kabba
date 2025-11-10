import React from 'react';
import { BarChart3, TrendingUp, Search, Eye, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useAnalytics } from '../hooks/useAnalytics';

interface AnalyticsDashboardProps {
  faqs: any[];
  categories: any[];
}

export default function AnalyticsDashboard({ faqs, categories }: AnalyticsDashboardProps) {
  const { analytics, getTopSearchTerms, getMostViewedFaqs } = useAnalytics();
  
  const topSearchTerms = getTopSearchTerms(5);
  const mostViewedFaqs = getMostViewedFaqs(5);
  
  const totalViews = Object.values(analytics.faqViews).reduce((sum, views) => sum + views, 0);
  const totalSearches = Object.values(analytics.searchTerms).reduce((sum, count) => sum + count, 0);
  
  const helpfulnessStats = Object.entries(analytics.helpfulVotes).map(([faqId, votes]) => {
    const faq = faqs.find(f => f.id === parseInt(faqId));
    const total = votes.helpful + votes.notHelpful;
    const helpfulPercentage = total > 0 ? Math.round((votes.helpful / total) * 100) : 0;
    
    return {
      faq,
      helpfulPercentage,
      totalVotes: total,
      ...votes
    };
  }).filter(stat => stat.faq && stat.totalVotes > 0)
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Views</p>
              <p className="text-2xl font-semibold text-gray-900">{totalViews.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Search className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Searches</p>
              <p className="text-2xl font-semibold text-gray-900">{totalSearches.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active FAQs</p>
              <p className="text-2xl font-semibold text-gray-900">{faqs.filter(f => f.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-semibold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Search Terms</h3>
          </div>
          <div className="p-6">
            {topSearchTerms.length > 0 ? (
              <div className="space-y-3">
                {topSearchTerms.map(([term, count], index) => (
                  <div key={term} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                      <span className="text-sm text-gray-900 ml-3">{term}</span>
                    </div>
                    <span className="text-sm text-gray-500">{count} searches</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No search data yet</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Most Viewed FAQs</h3>
          </div>
          <div className="p-6">
            {mostViewedFaqs.length > 0 ? (
              <div className="space-y-3">
                {mostViewedFaqs.map(({ id, views }, index) => {
                  const faq = faqs.find(f => f.id === id);
                  return faq ? (
                    <div key={id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                        <span className="text-sm text-gray-900 ml-3 truncate max-w-xs">
                          {faq.question}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">{views} views</span>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No view data yet</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">FAQ Helpfulness Ratings</h3>
        </div>
        <div className="p-6">
          {helpfulnessStats.length > 0 ? (
            <div className="space-y-4">
              {helpfulnessStats.map(({ faq, helpfulPercentage, totalVotes, helpful, notHelpful }) => (
                <div key={faq.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 flex-1 pr-4">
                      {faq.question}
                    </h4>
                    <span className={`text-sm font-medium px-2 py-1 rounded-full ${
                      helpfulPercentage >= 80 ? 'bg-green-100 text-green-800' :
                      helpfulPercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {helpfulPercentage}% helpful
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      {helpful} helpful
                    </div>
                    <div className="flex items-center">
                      <ThumbsDown className="w-4 h-4 mr-1" />
                      {notHelpful} not helpful
                    </div>
                    <span>({totalVotes} total votes)</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No rating data yet</p>
          )}
        </div>
      </div>
    </div>
  );
}