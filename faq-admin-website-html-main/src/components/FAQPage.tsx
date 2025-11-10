import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, HelpCircle, Mail, ArrowLeft, ThumbsUp, ThumbsDown, ExternalLink, Lightbulb, MessageCircle } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAnalytics } from '../hooks/useAnalytics';

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 300);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<number[]>([]);
  const [votedFaqs, setVotedFaqs] = useLocalStorage<Record<number, 'helpful' | 'not-helpful'>>('faq-votes', {});
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const { trackFaqView, trackSearch, trackCategoryView, trackHelpfulVote } = useAnalytics();

  const [settings] = useLocalStorage('faq-settings', {
    showSearchBox: true,
    autoExpandFirstCategory: false,
    autoExpandAllCategories: true
  });

  const [categories] = useLocalStorage('faq-categories', [
    {
      id: 1,
      name: 'Booking & Reservations',
      description: 'Everything you need to know about making and managing your reservations',
      order: 0,
      icon: '🏠',
      expanded: true
    },
    {
      id: 2,
      name: 'Property Information',
      description: 'Details about our properties and amenities',
      order: 1,
      icon: '🏢',
      expanded: false
    }
  ]);

  const [faqs] = useLocalStorage('faq-items', [
    { 
      id: 1, 
      categoryId: 1, 
      question: 'How do I make a reservation?', 
      answer: 'Making a reservation is simple! Browse our available properties, select your dates, and click Book Now. You\'ll be guided through a secure checkout process where you can enter your payment information and confirm your booking.',
      order: 0, 
      isActive: true 
    },
    { 
      id: 2, 
      categoryId: 1, 
      question: 'Can I modify or cancel my reservation?', 
      answer: 'Yes! You can modify or cancel your reservation through your account dashboard. Simply log in, go to "My Reservations," and select the booking you want to change. Please note that cancellation policies may vary depending on the property and timing.',
      order: 1, 
      isActive: true 
    },
    { 
      id: 3, 
      categoryId: 2, 
      question: 'What amenities are included?', 
      answer: 'Amenities vary by property but typically include WiFi, kitchen facilities, linens, towels, and basic toiletries. Each property listing includes a detailed amenities section. Premium properties may include additional features like pools, fitness centers, or concierge services.',
      order: 0, 
      isActive: true 
    },
    { 
      id: 4, 
      categoryId: 1, 
      question: 'What is your cancellation policy?', 
      answer: 'Our cancellation policy varies by property. Most properties offer free cancellation up to 24-48 hours before check-in. Some properties may have stricter policies during peak seasons. You can find the specific cancellation policy for each property on its listing page.',
      order: 2, 
      isActive: true 
    },
    { 
      id: 5, 
      categoryId: 2, 
      question: 'Is parking available?', 
      answer: 'Parking availability depends on the specific property. Many of our properties offer free parking, while others may have paid parking or street parking only. Check the property details for parking information, and contact us if you have specific parking needs.',
      order: 1, 
      isActive: true 
    }
  ]);

  // Track search when debounced term changes
  React.useEffect(() => {
    if (debouncedSearchTerm) {
      trackSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, trackSearch]);

  // Initialize expanded categories based on their default expanded setting
  React.useEffect(() => {

  }, []);

  const filteredFaqs = faqs.filter(faq => 
    faq.isActive && (
      faq.question.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    )
  );

  const allVisibleFaqs = filteredFaqs.sort((a, b) => a.order - b.order);

  const getCategoryFaqs = (categoryId) => {
    return filteredFaqs
      .filter(faq => faq.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  };

  const toggleFaq = (faqId) => {
    trackFaqView(faqId);
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  const toggleCategory = (categoryId) => {
    trackCategoryView(categoryId);
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleVote = (faqId: number, isHelpful: boolean) => {
    const voteType = isHelpful ? 'helpful' : 'not-helpful';
    setVotedFaqs(prev => ({ ...prev, [faqId]: voteType }));
    trackHelpfulVote(faqId, isHelpful);
  };

  const getRelatedFaqs = (currentFaq: any) => {
    // First, try to get manually selected related questions
    if (currentFaq.relatedQuestions && currentFaq.relatedQuestions.length > 0) {
      return faqs
        .filter(faq => 
          faq.isActive && 
          currentFaq.relatedQuestions.includes(faq.id)
        )
        .slice(0, 3);
    }
    
    // Fallback to same category questions if no manual selection
    return faqs
      .filter(faq => 
        faq.isActive && 
        faq.id !== currentFaq.id && 
        faq.categoryId === currentFaq.categoryId
      )
      .slice(0, 3);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, allVisibleFaqs.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && focusedIndex >= 0) {
      e.preventDefault();
      toggleFaq(allVisibleFaqs[focusedIndex].id);
    } else if (e.key === 'Escape') {
      setFocusedIndex(-1);
      setExpandedFaq(null);
    }
  };

  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };
  const sortedCategories = categories.sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <a
                href="/admin"
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Admin Panel
              </a>
              <div className="hidden sm:block w-px h-6 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Help Center</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <a
                href="mailto:support@example.com"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </a>
              <a
                href="/admin"
                className="inline-flex items-center px-6 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-white hover:text-blue-600 transition-colors"
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Admin Panel
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Find answers to questions about our equipment rentals & services.
            </p>
            
            {/* Search Box - only show if enabled in settings */}
            {settings.showSearchBox && (
              <div className="relative max-w-lg mx-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                  placeholder="Search for answers..."
                  autoComplete="off"
                />
                {searchTerm && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {settings.showSearchBox && searchTerm && (
              <div className="mt-4 text-sm text-gray-600">
                {filteredFaqs.length === 0 ? (
                  <div className="flex items-center space-x-2">
                    <span>No results found. Try different keywords or</span>
                    <button 
                      onClick={() => setSearchTerm('')}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      browse all FAQs
                    </button>
                  </div>
                ) : (
                  <span>Found {filteredFaqs.length} result{filteredFaqs.length === 1 ? '' : 's'}</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          {sortedCategories.map(category => {
            const categoryFaqs = getCategoryFaqs(category.id);
            
            if (debouncedSearchTerm && categoryFaqs.length === 0) {
              return null;
            }

            return (
              <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div 
                  className="px-6 py-5 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded flex items-center justify-center overflow-hidden">
                        {category.icon ? (
                          // Check if icon is a URL (starts with http, https, data:, or /)
                          category.icon.startsWith('http') || 
                          category.icon.startsWith('https') || 
                          category.icon.startsWith('data:') || 
                          category.icon.startsWith('/') ? (
                            <img 
                              src={category.icon} 
                              alt={`${category.name} icon`} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            // Render as emoji or text
                            <span className="text-2xl">{category.icon}</span>
                          )
                        ) : (
                          <span className="text-2xl">📁</span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {categoryFaqs.length} question{categoryFaqs.length === 1 ? '' : 's'}
                      </span>
                      {expandedCategories.includes(category.id) ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>

                {(expandedCategories.includes(category.id) || debouncedSearchTerm) && (
                  <div className="border-t border-gray-200">
                    {categoryFaqs.length === 0 ? (
                      <div className="px-6 py-8 text-center text-gray-500">
                        No questions found in this category.
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {categoryFaqs.map((faq, index) => {
                          const globalIndex = allVisibleFaqs.findIndex(f => f.id === faq.id);
                          const isFocused = globalIndex === focusedIndex;
                          const relatedFaqs = getRelatedFaqs(faq);
                          
                          return (
                          <div 
                            key={faq.id} 
                            className={`px-6 py-4 transition-colors ${isFocused ? 'bg-blue-50' : ''}`}
                          >
                            <button
                              onClick={() => toggleFaq(faq.id)}
                              className="w-full text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg group"
                            >
                              <div className="flex items-start justify-between">
                                <h4 
                                  className="text-base font-medium text-gray-900 group-hover:text-blue-600 transition-colors pr-4"
                                  dangerouslySetInnerHTML={{ 
                                    __html: highlightText(faq.question, debouncedSearchTerm) 
                                  }}
                                />
                                {expandedFaq === faq.id ? (
                                  <ChevronUp className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                            
                            {expandedFaq === faq.id && (
                              <div className="mt-3 pr-6">
                                <div 
                                  className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                                  dangerouslySetInnerHTML={{ 
                                    __html: highlightText(faq.answer, debouncedSearchTerm) 
                                  }}
                                />
                                
                                {/* Helpfulness voting */}
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Was this helpful?</span>
                                    <div className="flex items-center space-x-2">
                                      {votedFaqs[faq.id] ? (
                                        <span className="text-sm text-gray-500">
                                          Thanks for your feedback!
                                        </span>
                                      ) : (
                                        <>
                                          <button
                                            onClick={() => handleVote(faq.id, true)}
                                            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                          >
                                            <ThumbsUp className="w-4 h-4 mr-1" />
                                            Yes
                                          </button>
                                          <button
                                            onClick={() => handleVote(faq.id, false)}
                                            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                          >
                                            <ThumbsDown className="w-4 h-4 mr-1" />
                                            No
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* Related questions */}
                                {relatedFaqs.length > 0 && (
                                  <div className="mt-6 pt-4 border-t border-gray-200">
                                    <div className="flex items-center mb-3">
                                      <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                                      <span className="text-sm font-medium text-gray-700">Related Questions</span>
                                    </div>
                                    <div className="space-y-2">
                                      {relatedFaqs.map(relatedFaq => (
                                        <button
                                          key={relatedFaq.id}
                                          onClick={() => toggleFaq(relatedFaq.id)}
                                          className="block w-full text-left text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                        >
                                          {relatedFaq.question}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          
          {/* Search suggestions when no results */}
          {debouncedSearchTerm && filteredFaqs.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="max-w-md mx-auto">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any FAQs matching "{debouncedSearchTerm}". Try:
                </p>
                <ul className="text-sm text-gray-500 space-y-1 mb-6">
                  <li>• Using different keywords</li>
                  <li>• Checking your spelling</li>
                  <li>• Using more general terms</li>
                </ul>
                <button
                  onClick={() => setSearchTerm('')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Browse All FAQs
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Contact Support Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Still need help?
          </h3>
          <p className="text-blue-100 mb-6">
            Can't find what you're looking for? Our support team is here to help you with any questions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="sms:+11234567890"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Click to Text Us
            </a>
            <a
              href="tel:+11234567890"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Call Us: (123) 456-7890
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}