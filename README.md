# FAQ Admin System & Customer Portal

A comprehensive FAQ management system with an admin panel for content management and a customer-facing portal for end users.

## 🚀 Features

### Admin Panel
- **FAQ Management**: Create, edit, delete, and reorder FAQs with drag-and-drop
- **Category Management**: Organize FAQs into collapsible categories
- **Bulk Operations**: Select multiple FAQs for batch actions (activate/deactivate/delete)
- **Rich Text Editor**: WYSIWYG editor with formatting options for FAQ answers
- **Analytics Dashboard**: Track FAQ views, search terms, and user feedback
- **Import/Export**: Backup and restore FAQ data via JSON files
- **Real-time Preview**: Direct link to customer-facing page

### Customer Portal
- **Smart Search**: Debounced search with highlighted results
- **Keyboard Navigation**: Full accessibility with arrow keys and shortcuts
- **Responsive Design**: Mobile-first design that works on all devices
- **User Feedback**: Thumbs up/down voting system for FAQ helpfulness
- **Related Questions**: Contextual suggestions for similar FAQs
- **Category Filtering**: Collapsible category sections for better organization

### Technical Features
- **Data Persistence**: All changes saved to localStorage
- **Performance Optimized**: Debounced search, lazy loading, smooth animations
- **Type Safety**: Full TypeScript implementation
- **Error Handling**: Comprehensive error boundaries and user feedback
- **Analytics Tracking**: Real-time usage analytics and insights

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Rich Text**: React Quill
- **Build Tool**: Vite
- **State Management**: React Hooks + Custom Hooks
- **Data Storage**: localStorage (easily replaceable with API)

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
src/
├── components/
│   ├── FAQAdminPanel.tsx      # Main admin interface
│   ├── FAQPage.tsx            # Customer-facing FAQ page
│   ├── RichTextEditor.tsx     # WYSIWYG editor component
│   └── AnalyticsDashboard.tsx # Analytics and insights
├── hooks/
│   ├── useLocalStorage.ts     # Persistent storage hook
│   └── useAnalytics.ts        # Analytics tracking hook
├── App.tsx                    # Main app with routing
├── main.tsx                   # App entry point
└── index.css                  # Global styles
```

## 🚦 Usage

### Admin Panel (`/admin`)
1. **Manage FAQs**: Add, edit, delete, and reorder questions
2. **Organize Categories**: Create and manage FAQ categories
3. **Upload Icons**: Add custom icons for categories (32x32px recommended)
3. **Bulk Actions**: Select multiple items for batch operations
4. **View Analytics**: Monitor usage patterns and user feedback
5. **Import/Export**: Backup and restore FAQ data

### **Icon Management**
- **File Upload**: Click "Choose Icon" button to select image files
- **File Validation**: Only accepts image files (WebP, PNG, JPG, etc.)
- **Size Limit**: Maximum 1MB file size with clear error messages
- **Recommended Format**: WebP for optimal file size and quality

### Customer Portal (`/faq`)
1. **Browse FAQs**: Navigate through categorized questions
2. **Search**: Use the search bar to find specific information
3. **Provide Feedback**: Vote on FAQ helpfulness
4. **Keyboard Navigation**: Use arrow keys for accessibility

## 🔧 Configuration

### Default Categories
The system comes with sample categories that can be modified:
- Booking & Reservations
- Property Information

### Customization
- **Colors**: Modify Tailwind classes for brand colors
- **Layout**: Adjust responsive breakpoints in components
- **Analytics**: Extend tracking in `useAnalytics.ts`
- **Storage**: Replace localStorage with API calls in `useLocalStorage.ts`

## 📊 Analytics Features

The system tracks:
- FAQ view counts
- Search term frequency
- Category interaction
- User feedback (helpful/not helpful votes)
- Most popular questions
- Search success rates

## 🔒 Data Management

### Storage
- Uses localStorage for persistence
- Easily replaceable with REST API or GraphQL
- JSON import/export for data portability

### Data Structure
```typescript
interface FAQ {
  id: number;
  categoryId: number;
  question: string;
  answer: string;
  order: number;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
  description: string;
  order: number;
  expanded: boolean;
}
```

## 🎨 Design System

- **Colors**: Blue (#3B82F6) primary, Green (#10B981) success
- **Spacing**: 8px grid system
- **Typography**: System fonts with proper hierarchy
- **Components**: Consistent card-based layout
- **Animations**: Smooth transitions and hover effects

## 🚀 Deployment

The project is ready for deployment to any static hosting service:

```bash
# Build for production
npm run build

# Deploy dist/ folder to your hosting service
```

Compatible with:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Known Issues

- None currently reported

## 🔮 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication and roles
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Email notifications for feedback
- [ ] API documentation generation
- [ ] Automated testing suite
- [ ] Performance monitoring

## 📞 Support

For questions or support, please contact the development team or create an issue in the repository.