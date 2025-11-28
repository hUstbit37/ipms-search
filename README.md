# IMPS Search - Hệ thống Tra cứu Sở hữu Trí tuệ

Ứng dụng web tra cứu dữ liệu sở hữu trí tuệ (Intellectual Property Management System) được xây dựng với các công nghệ hiện đại.

## 🚀 Công nghệ

- **Next.js 16** - React framework với App Router
- **TypeScript** - Type safety
- **TanStack Query** - Server state management & caching
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful & accessible component library
- **Axios** - HTTP client

## 📋 Yêu cầu hệ thống

- Node.js 18.17 trở lên
- npm, yarn, hoặc pnpm

## ⚡ Cài đặt & Chạy

### 1. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 2. Cấu hình môi trường

Tạo file `.env.local` từ template:

```bash
cp .env.local.example .env.local
```

Chỉnh sửa file `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### 3. Chạy development server

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

### 4. Build production

```bash
npm run build
npm run start
```

## 📁 Cấu trúc Project

```
imps-search/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── providers.tsx        # React Query provider
│   └── globals.css          # Global styles
├── components/              # React components
│   └── ui/                  # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── label.tsx
│       └── badge.tsx
├── lib/                     # Utilities & helpers
│   ├── utils.ts            # Utility functions
│   └── api-client.ts       # Axios configuration
├── types/                   # TypeScript types
│   └── ip.ts               # IP data types
├── public/                  # Static assets
├── components.json          # shadcn/ui config
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```

## 🎨 Thêm Components shadcn/ui

Để thêm components mới từ shadcn/ui:

```bash
npx shadcn@latest add [component-name]
```

Ví dụ:

```bash
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add form
```

Xem danh sách components: [shadcn/ui Components](https://ui.shadcn.com/docs/components)

## 🔧 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build cho production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint

## 📦 Dependencies chính

### Production
- `next` - ^16.0.5
- `react` - ^19.0.0
- `react-dom` - ^19.0.0
- `@tanstack/react-query` - Latest
- `axios` - Latest
- `tailwindcss` - Latest
- `class-variance-authority` - Latest (cho shadcn/ui)
- `clsx` - Latest (cho shadcn/ui)
- `tailwind-merge` - Latest (cho shadcn/ui)

### Development
- `typescript` - ^5
- `@types/node` - ^22
- `@types/react` - ^19
- `@types/react-dom` - ^19
- `eslint` - ^9
- `eslint-config-next` - ^16.0.5

## 🎯 Features sẵn có

✅ Next.js 16 App Router  
✅ TypeScript configuration  
✅ Tailwind CSS v4 setup  
✅ shadcn/ui components  
✅ TanStack Query provider  
✅ Axios HTTP client  
✅ Dark mode support  
✅ ESLint configuration  
✅ Type-safe development  

## 🌐 API Integration

API client được cấu hình sẵn trong `lib/api-client.ts` với:

- Base URL configuration
- Request/Response interceptors
- Error handling
- Timeout configuration

Ví dụ sử dụng:

```typescript
import apiClient from '@/lib/api-client';

// GET request
const response = await apiClient.get('/endpoint');

// POST request
const response = await apiClient.post('/endpoint', data);
```

## 🎨 Customization

### Thay đổi theme

Chỉnh sửa `app/globals.css` để thay đổi color scheme:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  /* ... */
}
```

### Cấu hình TanStack Query

Chỉnh sửa `app/providers.tsx`:

```typescript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
})
```

## 📝 Notes

- Project sử dụng Tailwind CSS v4
- shadcn/ui components có thể customize qua `components.json`
- TanStack Query DevTools được bật ở development mode
- API endpoint có thể thay đổi qua biến môi trường

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 📄 License

MIT
