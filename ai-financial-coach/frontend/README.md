# AI Financial Coach - Modern Frontend

A modern, TypeScript-first financial coaching application built with the latest technologies and best practices.

## 🚀 Modern Tech Stack

### Core Framework
- **Next.js 15** with App Router for optimal performance and SEO
- **React 19** with latest features and concurrent rendering
- **TypeScript** for type safety and better developer experience

### Styling & UI
- **Tailwind CSS 4** with modern utility-first approach
- **Radix UI** for accessible, unstyled components
- **Lucide React** for beautiful, consistent icons
- **CSS Variables** for theming and dark mode support

### State Management & Data Fetching
- **Zustand** for lightweight, modern state management
- **TanStack Query** for server state management and caching
- **React Hook Form** with Zod validation for forms

### Development Experience
- **ESLint** with Next.js and Prettier configurations
- **Prettier** for consistent code formatting
- **Husky** for git hooks and pre-commit checks
- **TypeScript** strict mode for maximum type safety

## ✨ Features

### 🎯 Modern Architecture
- **App Router** for better performance and SEO
- **Server Components** where appropriate
- **Client Components** with proper hydration
- **Type-safe** API calls and state management

### 🎨 Beautiful UI/UX
- **Responsive design** that works on all devices
- **Accessible components** following WCAG guidelines
- **Smooth animations** and transitions
- **Dark mode ready** (CSS variables setup)

### 🔧 Developer Experience
- **Hot reloading** with Turbopack
- **Type checking** in real-time
- **Linting** and formatting on save
- **Git hooks** for code quality

### 📊 Financial Features
- **AI-powered spending analysis** with beautiful charts
- **Interactive dashboard** with real-time updates
- **Goal setting** with progress tracking
- **Transaction management** with bulk operations
- **Personalized recommendations** from AI

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running on port 5002

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check formatting
npm run type-check   # Run TypeScript type checking

# Git Hooks
npm run prepare      # Install Husky git hooks
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Global styles with CSS variables
│   ├── layout.tsx          # Root layout with providers
│   └── page.tsx            # Home page
├── components/             # React components
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx      # Button component with variants
│   │   ├── card.tsx        # Card components
│   │   └── input.tsx       # Input component
│   ├── dashboard.tsx       # Main dashboard component
│   ├── goal-setter.tsx     # Goal setting component
│   └── onboarding.tsx      # Welcome/onboarding component
├── hooks/                  # Custom React hooks
│   └── use-api.ts          # API hooks with TanStack Query
├── lib/                    # Utility functions
│   ├── api.ts              # API client with Axios
│   └── utils.ts            # Utility functions (cn, etc.)
├── store/                  # State management
│   └── app-store.ts        # Zustand store
└── types/                  # TypeScript type definitions
    └── index.ts            # Shared types
```

## 🔧 Configuration Files

- `next.config.ts` - Next.js configuration with API rewrites
- `tailwind.config.ts` - Tailwind CSS configuration with custom theme
- `tsconfig.json` - TypeScript configuration with path mapping
- `.eslintrc.json` - ESLint configuration with Prettier integration
- `.prettierrc` - Prettier configuration for consistent formatting

## 🌟 Key Improvements Over Previous Version

### Performance
- **Next.js 15** with App Router for better performance
- **Turbopack** for faster development builds
- **Server Components** for reduced client-side JavaScript
- **Optimized bundle** with tree shaking

### Developer Experience
- **TypeScript** strict mode for better type safety
- **Modern tooling** with ESLint, Prettier, and Husky
- **Path mapping** for cleaner imports (`@/components/*`)
- **Hot reloading** with instant feedback

### Code Quality
- **Consistent formatting** with Prettier
- **Linting** with ESLint and Next.js rules
- **Git hooks** for pre-commit checks
- **Type safety** throughout the application

### UI/UX
- **Modern design system** with Radix UI components
- **Accessible** components following WCAG guidelines
- **Responsive design** that works on all devices
- **Beautiful animations** and smooth transitions

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Vercel
```bash
npx vercel
```

### Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5002
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and commit: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is part of the HackTX 2025 submission.

---

**Built with ❤️ using modern web technologies**