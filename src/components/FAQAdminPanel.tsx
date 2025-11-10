import React, { useState } from 'react';
import { Plus, CreditCard as Edit2, Trash2, GripVertical, Save, X, Eye, Settings, ChevronDown, ChevronRight, Download, Upload, BarChart3, CheckSquare, Square } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import RichTextEditor from './RichTextEditor';
import AnalyticsDashboard from './AnalyticsDashboard';

export default function FAQAdminPanel() {
  const [categories, setCategories] = useLocalStorage('faq-categories', [
    {
      id: 1,
      name: 'Booking & Reservations',
      description: 'Everything you need to know about making and managing your reservations',
      order: 0,
      expanded: true
    },
    {
      id: 2,
      name: 'Property Information',
      description: 'Details about our properties and amenities',
      order: 1,
      expanded: true
    }
  ]);

  const [faqs, setFaqs] = useLocalStorage('faq-items', [
    { 
      id: 1, 
      categoryId: 1, 
      question: 'How do I make a reservation?', 
      answer: 'Making a reservation is simple! Browse our available properties, select your dates, and click Book Now.', 
      order: 0, 
      isActive: true 
    },
    { 
      id: 2, 
      categoryId: 1, 
      question: 'Can I modify or cancel my reservation?', 
      answer: 'Yes! You can modify or cancel your reservation through your account dashboard.', 
      order: 1, 
      isActive: true 
    },
    { 
      id: 3, 
      categoryId: 2, 
      question: 'What amenities are included?', 
      answer: 'Amenities vary by property but typically include WiFi, kitchen, linens, and towels.', 
      order: 0, 
      isActive: true 
    }
  ]);

  const [activeTab, setActiveTab] = useState('faqs');
  const [selectedFaqs, setSelectedFaqs] = useState<number[]>([]);
  const [editingFaq, setEditingFaq] = useState(null);
  const [settings, setSettings] = useLocalStorage('faq-settings', {
    showSearchBox: true,
    autoExpandFirstCategory: false,
    autoExpandAllCategories: true
  });
  const [editingCategory, setEditingCategory] = useState(null);
  const [newFaq, setNewFaq] = useState({ categoryId: '', question: '', answer: '', isActive: true });
  const [newCategory, setNewCategory] = useState({ name: '', description: '', icon: '', expanded: false });
  const [draggedItem, setDraggedItem] = useState(null);
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(null);
  const [bulkAction, setBulkAction] = useState('');
  const [selectedRelatedQuestions, setSelectedRelatedQuestions] = useState<number[]>([]);
  const [relatedQuestionsFilter, setRelatedQuestionsFilter] = useState('');

  const handleAddFaq = () => {
    if (newFaq.categoryId && newFaq.question.trim() && newFaq.answer.trim()) {
      const categoryFaqs = faqs.filter(faq => faq.categoryId === parseInt(newFaq.categoryId));
      const maxOrder = categoryFaqs.length > 0 ? Math.max(...categoryFaqs.map(faq => faq.order)) : -1;
      
      const faq = {
        id: Date.now(),
        categoryId: parseInt(newFaq.categoryId),
        question: newFaq.question,
        answer: newFaq.answer,
        order: maxOrder + 1,
        isActive: newFaq.isActive,
        relatedQuestions: selectedRelatedQuestions
      };
      
      setFaqs([...faqs, faq]);
      setNewFaq({ categoryId: '', question: '', answer: '', isActive: true });
      setSelectedRelatedQuestions([]);
      setShowAddFaq(false);
    }
  };

  const handleEditFaq = (faq) => {
    setEditingFaq({ ...faq });
    setSelectedRelatedQuestions(faq.relatedQuestions || []);
    setRelatedQuestionsFilter('');
  };

  const handleSaveFaq = () => {
    setFaqs(faqs.map(faq => faq.id === editingFaq.id ? { ...editingFaq, relatedQuestions: selectedRelatedQuestions } : faq));
    setEditingFaq(null);
    setSelectedRelatedQuestions([]);
  };

  const handleDeleteFaq = (id) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter(faq => faq.id !== id));
    }
  };

  const toggleFaqStatus = (id) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, isActive: !faq.isActive } : faq
    ));
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const maxOrder = categories.length > 0 ? Math.max(...categories.map(cat => cat.order)) : -1;
      const category = {
        id: Date.now(),
        name: newCategory.name,
        description: newCategory.description,
        icon: newCategory.icon,
        order: maxOrder + 1,
        expanded: newCategory.expanded || false
      };
      
      setCategories([...categories, category]);
      setNewCategory({ name: '', description: '', icon: '', expanded: false });
      setShowAddCategory(false);
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory({ ...category });
  };

  const handleSaveCategory = () => {
    setCategories(categories.map(cat => cat.id === editingCategory.id ? editingCategory : cat));
    setEditingCategory(null);
  };

  const handleDeleteCategory = (id) => {
    const categoryFaqs = faqs.filter(faq => faq.categoryId === id);
    if (categoryFaqs.length > 0) {
      alert('Cannot delete category with existing FAQs. Please move or delete all FAQs first.');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(categories.filter(cat => cat.id !== id));
    }
  };

  const toggleCategoryExpansion = (id) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, expanded: !cat.expanded } : cat
    ));
  };

  const handleDragStart = (e, item, type) => {
    setDraggedItem({ ...item, type });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetItem, type) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.type !== type) return;

    if (type === 'faq' && draggedItem.categoryId === targetItem.categoryId) {
      const newFaqs = [...faqs];
      const draggedFaq = newFaqs.find(f => f.id === draggedItem.id);
      const targetFaq = newFaqs.find(f => f.id === targetItem.id);
      
      if (draggedFaq && targetFaq) {
        const tempOrder = draggedFaq.order;
        draggedFaq.order = targetFaq.order;
        targetFaq.order = tempOrder;
        setFaqs(newFaqs);
      }
    } else if (type === 'category') {
      const newCategories = [...categories];
      const draggedCat = newCategories.find(c => c.id === draggedItem.id);
      const targetCat = newCategories.find(c => c.id === targetItem.id);
      
      if (draggedCat && targetCat) {
        const tempOrder = draggedCat.order;
        draggedCat.order = targetCat.order;
        targetCat.order = tempOrder;
        setCategories(newCategories);
      }
    }

    setDraggedItem(null);
  };

  const handleIconUpload = (event, isEditing = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 1MB)
    if (file.size > 1024 * 1024) {
      alert('Image must be smaller than 1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (isEditing && editingCategory) {
        setEditingCategory({ ...editingCategory, icon: result });
      } else {
        setNewCategory({ ...newCategory, icon: result });
      }
      setUploadingIcon(null);
    };
    reader.readAsDataURL(file);
  };

  const removeIcon = (isEditing = false) => {
    if (isEditing && editingCategory) {
      setEditingCategory({ ...editingCategory, icon: '' });
    } else {
      setNewCategory({ ...newCategory, icon: '' });
    }
  };

  const toggleFaqSelection = (faqId: number) => {
    setSelectedFaqs(prev => 
      prev.includes(faqId) 
        ? prev.filter(id => id !== faqId)
        : [...prev, faqId]
    );
  };

  const selectAllFaqs = () => {
    const allFaqIds = faqs.map(faq => faq.id);
    setSelectedFaqs(selectedFaqs.length === allFaqIds.length ? [] : allFaqIds);
  };

  const handleBulkAction = () => {
    if (!bulkAction || selectedFaqs.length === 0) return;

    switch (bulkAction) {
      case 'activate':
        setFaqs(faqs.map(faq => 
          selectedFaqs.includes(faq.id) ? { ...faq, isActive: true } : faq
        ));
        break;
      case 'deactivate':
        setFaqs(faqs.map(faq => 
          selectedFaqs.includes(faq.id) ? { ...faq, isActive: false } : faq
        ));
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedFaqs.length} FAQ(s)?`)) {
          setFaqs(faqs.filter(faq => !selectedFaqs.includes(faq.id)));
        }
        break;
    }
    
    setSelectedFaqs([]);
    setBulkAction('');
  };

  const toggleRelatedQuestion = (questionId: number) => {
    setSelectedRelatedQuestions(prev => 
      prev.includes(questionId) 
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const getAvailableRelatedQuestions = (currentFaqId?: number) => {
    let availableFaqs = faqs.filter(faq => faq.isActive && faq.id !== currentFaqId);
    
    // Filter by category if selected
    if (relatedQuestionsFilter) {
      availableFaqs = availableFaqs.filter(faq => faq.categoryId === parseInt(relatedQuestionsFilter));
    }
    
    // Sort alphabetically by question
    return availableFaqs.sort((a, b) => a.question.localeCompare(b.question));
  };

  const exportData = () => {
    const data = { categories, faqs };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faq-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.categories && data.faqs) {
          setCategories(data.categories);
          setFaqs(data.faqs);
          alert('Data imported successfully!');
        } else {
          alert('Invalid file format');
        }
      } catch (error) {
        alert('Error importing file');
      }
    };
    reader.readAsText(file);
  };
  const getCategoryFaqs = (categoryId) => {
    return faqs
      .filter(faq => faq.categoryId === categoryId)
      .sort((a, b) => a.order - b.order);
  };

  const sortedCategories = categories.sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FAQ Admin Panel</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your frequently asked questions and categories</p>
            </div>
            <div className="flex space-x-2">
              <a
                href="/faq"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview Site
              </a>
              <button
                onClick={exportData}
                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
              <label className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('faqs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'faqs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              FAQs Management
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {activeTab === 'faqs' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage FAQs</h2>
              <div className="flex items-center space-x-3">
                {selectedFaqs.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Bulk Actions</option>
                      <option value="activate">Activate</option>
                      <option value="deactivate">Deactivate</option>
                      <option value="delete">Delete</option>
                    </select>
                    <button
                      onClick={handleBulkAction}
                      disabled={!bulkAction}
                      className="px-3 py-2 bg-gray-600 text-white rounded-md text-sm font-medium hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Apply ({selectedFaqs.length})
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setShowAddFaq(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New FAQ
                </button>
              </div>
            </div>

            {faqs.length > 0 && (
              <div className="mb-4 flex items-center space-x-4">
                <button
                  onClick={selectAllFaqs}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {selectedFaqs.length === faqs.length ? (
                    <CheckSquare className="w-4 h-4 mr-2" />
                  ) : (
                    <Square className="w-4 h-4 mr-2" />
                  )}
                  Select All
                </button>
                {selectedFaqs.length > 0 && (
                  <span className="text-sm text-gray-500">
                    {selectedFaqs.length} of {faqs.length} selected
                  </span>
                )}
              </div>
            )}

            {showAddFaq && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-medium mb-4">Add New FAQ</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={newFaq.categoryId}
                        onChange={(e) => setNewFaq({ ...newFaq, categoryId: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                      <input
                        type="text"
                        value={newFaq.question}
                        onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter FAQ question"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Answer</label>
                      <RichTextEditor
                        value={newFaq.answer}
                       onChange={(value) => setNewFaq({ ...newFaq, answer: value })}
                        placeholder="Enter FAQ answer"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={newFaq.isActive}
                        onChange={(e) => setNewFaq({ ...newFaq, isActive: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">Active</label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Related Questions</label>
                      <p className="text-xs text-gray-500 mb-2">Select questions that are related to this FAQ</p>
                      <div className="mb-3">
                        <select
                          value={relatedQuestionsFilter}
                          onChange={(e) => setRelatedQuestionsFilter(e.target.value)}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">All Categories</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                        {getAvailableRelatedQuestions().length === 0 ? (
                          <p className="text-sm text-gray-500">No other active FAQs available</p>
                        ) : (
                          getAvailableRelatedQuestions().map(faq => (
                            <label key={faq.id} className="flex items-start space-x-2 text-sm">
                              <input
                                type="checkbox"
                                checked={selectedRelatedQuestions.includes(faq.id)}
                                onChange={() => toggleRelatedQuestion(faq.id)}
                                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                              <span className="flex-1">{faq.question}</span>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => {
                        setShowAddFaq(false);
                        setRelatedQuestionsFilter('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddFaq}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add FAQ
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {sortedCategories.map(category => {
                const categoryFaqs = getCategoryFaqs(category.id);
                return (
                  <div key={category.id} className="bg-white rounded-lg shadow transition-shadow hover:shadow-md">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleCategoryExpansion(category.id)}
                            className="mr-2 p-1 hover:bg-gray-100 rounded transition-colors"
                          >
                            {category.expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>
                          <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
                          <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {categoryFaqs.length} FAQs
                          </span>
                        </div>
                      </div>
                    </div>

                    {category.expanded && (
                      <div className="p-6">
                        {categoryFaqs.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No FAQs in this category yet.</p>
                        ) : (
                          <div className="space-y-4">
                            {categoryFaqs.map(faq => (
                              <div
                                key={faq.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, faq, 'faq')}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, faq, 'faq')}
                                className={`border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow ${
                                  faq.isActive ? 'border-gray-200' : 'border-gray-200 bg-gray-50'
                                } ${draggedItem && draggedItem.id === faq.id ? 'opacity-50' : ''}`}
                              >
                                {editingFaq && editingFaq.id === faq.id ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center">
                                      <input
                                        type="checkbox"
                                        checked={selectedFaqs.includes(faq.id)}
                                        onChange={() => toggleFaqSelection(faq.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-3"
                                      />
                                    </div>
                                    <input
                                      type="text"
                                      value={editingFaq.question}
                                      onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <RichTextEditor
                                      value={editingFaq.answer}
                                     onChange={(value) => setEditingFaq({ ...editingFaq, answer: value })}
                                    />
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center">
                                        <input
                                          type="checkbox"
                                          checked={editingFaq.isActive}
                                          onChange={(e) => setEditingFaq({ ...editingFaq, isActive: e.target.checked })}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label className="ml-2 text-sm text-gray-700">Active</label>
                                      </div>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={handleSaveFaq}
                                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                                        >
                                          <Save className="w-3 h-3 mr-1" />
                                          Save
                                        </button>
                                        <button
                                          onClick={() => {
                                            setEditingFaq(null);
                                            setSelectedRelatedQuestions([]);
                                          }}
                                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                                        >
                                          <X className="w-3 h-3 mr-1" />
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                    <div>
                                      <label className="block text-sm font-medium text-gray-700 mb-2">Related Questions</label>
                                      <p className="text-xs text-gray-500 mb-2">Select questions that are related to this FAQ</p>
                                      <div className="mb-3">
                                        <select
                                          value={relatedQuestionsFilter}
                                          onChange={(e) => setRelatedQuestionsFilter(e.target.value)}
                                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                          <option value="">All Categories</option>
                                          {categories.map(cat => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-1">
                                        {getAvailableRelatedQuestions(editingFaq.id).length === 0 ? (
                                          <p className="text-sm text-gray-500">No other active FAQs available</p>
                                        ) : (
                                          getAvailableRelatedQuestions(editingFaq.id).map(faq => (
                                            <label key={faq.id} className="flex items-start space-x-2 text-sm">
                                              <input
                                                type="checkbox"
                                                checked={selectedRelatedQuestions.includes(faq.id)}
                                                onChange={() => toggleRelatedQuestion(faq.id)}
                                                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                              />
                                              <span className="flex-1">{faq.question}</span>
                                            </label>
                                          ))
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between">
                                    <div className="flex items-start">
                                      <input
                                        type="checkbox"
                                        checked={selectedFaqs.includes(faq.id)}
                                        onChange={() => toggleFaqSelection(faq.id)}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1 mr-3"
                                      />
                                      <GripVertical className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                                      <div className="flex-1">
                                        <h4 className={`font-medium ${faq.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                          {faq.question}
                                        </h4>
                                        <div 
                                          className={`mt-1 text-sm ${faq.isActive ? 'text-gray-600' : 'text-gray-400'} prose prose-sm max-w-none`}
                                          dangerouslySetInnerHTML={{ 
                                            __html: faq.answer.length > 100 ? `${faq.answer.substring(0, 100)}...` : faq.answer 
                                          }}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-2 ml-4">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        faq.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                      }`}>
                                        {faq.isActive ? 'Active' : 'Inactive'}
                                      </span>
                                      <button
                                        onClick={() => toggleFaqStatus(faq.id)}
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                      >
                                        <Settings className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleEditFaq(faq)}
                                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteFaq(faq.id)}
                                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Manage Categories</h2>
              <button
                onClick={() => setShowAddCategory(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            </div>

            {showAddCategory && (
              <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                  <h3 className="text-lg font-medium mb-4">Add New Category</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                      <input
                        type="text"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter category name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={newCategory.description}
                        onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                        rows={3}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter category description"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="expandedByDefault"
                        checked={newCategory.expanded || false}
                        onChange={(e) => setNewCategory({ ...newCategory, expanded: e.target.checked })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="expandedByDefault" className="ml-2 text-sm text-gray-700">
                        Expand category by default
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 ml-6">(shows questions when page loads)</p>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category Icon</label>
                      <p className="text-xs text-gray-500 mb-2">Upload an icon (32x32px recommended, WebP/PNG/JPG, max 1MB)</p>
                      
                      {newCategory.icon ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center overflow-hidden">
                            <img 
                              src={newCategory.icon} 
                              alt="Category icon" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeIcon(false)}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            Remove Icon
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                            <Upload className="w-4 h-4 mr-2" />
                            Choose Icon
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleIconUpload(e, false)}
                              className="hidden"
                            />
                          </label>
                          <span className="text-xs text-gray-400">32x32px, WebP/PNG/JPG</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      onClick={() => setShowAddCategory(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCategory}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add Category
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">FAQ Categories</h3>
                <p className="text-sm text-gray-500">Drag and drop to reorder categories</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {sortedCategories.map(category => (
                    <div
                      key={category.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, category, 'category')}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, category, 'category')}
                      className={`border rounded-lg p-4 cursor-move hover:shadow-md transition-shadow ${
                        draggedItem && draggedItem.id === category.id ? 'opacity-50' : ''
                      }`}
                    >
                      {editingCategory && editingCategory.id === category.id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <textarea
                            value={editingCategory.description}
                            onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                            rows={2}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id="editExpandedByDefault"
                              checked={editingCategory.expanded || false}
                              onChange={(e) => setEditingCategory({ ...editingCategory, expanded: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor="editExpandedByDefault" className="ml-2 text-sm text-gray-700">
                              Expand category by default
                            </label>
                            <p className="ml-2 text-xs text-gray-500">(shows questions when page loads)</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category Icon</label>
                            <p className="text-xs text-gray-500 mb-2">Upload an icon (32x32px recommended, WebP/PNG/JPG, max 1MB)</p>
                            
                            {editingCategory.icon ? (
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center overflow-hidden">
                                  <img 
                                    src={editingCategory.icon} 
                                    alt="Category icon" 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeIcon(true)}
                                  className="text-sm text-red-600 hover:text-red-800"
                                >
                                  Remove Icon
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-3">
                                <label className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                                  <Upload className="w-4 h-4 mr-2" />
                                  Choose Icon
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleIconUpload(e, true)}
                                    className="hidden"
                                  />
                                </label>
                                <span className="text-xs text-gray-400">32x32px, WebP/PNG/JPG</span>
                              </div>
                            )}
                          </div>
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleSaveCategory}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCategory(null)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <div className="flex items-start">
                            <GripVertical className="w-4 h-4 text-gray-400 mr-3 mt-1" />
                            {category.icon && (
                              <div className="w-6 h-6 rounded mr-3 mt-0.5 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={category.icon} 
                                  alt={`${category.name} icon`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <h4 className="font-medium text-gray-900">{category.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{category.description}</p>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
                                {getCategoryFaqs(category.id).length} FAQs
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.id)}
                              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h2>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-500">Real-time insights</span>
              </div>
            </div>
            <AnalyticsDashboard faqs={faqs} categories={categories} />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">FAQ Display Settings</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Show search box</label>
                    <p className="text-sm text-gray-500">Allow users to search through FAQs</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.showSearchBox}
                    onChange={(e) => setSettings(prev => ({ ...prev, showSearchBox: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Auto-expand first category</label>
                    <p className="text-sm text-gray-500">Automatically expand the first FAQ category</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoExpandFirstCategory}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      autoExpandFirstCategory: e.target.checked,
                      autoExpandAllCategories: e.target.checked ? false : prev.autoExpandAllCategories
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">Auto-expand all categories</label>
                    <p className="text-sm text-gray-500">Automatically expand all FAQ categories</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoExpandAllCategories}
                    onChange={(e) => setSettings(prev => ({ 
                      ...prev, 
                      autoExpandAllCategories: e.target.checked,
                      autoExpandFirstCategory: e.target.checked ? false : prev.autoExpandFirstCategory
                    }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}