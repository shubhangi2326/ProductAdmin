# Product Admin Dashboard

A modern, high-performance **Product Admin Dashboard** built with **Next.js (App Router)**, **React**, **Tailwind CSS**, and **Axios**, powered by the [DummyJSON API](https://dummyjson.com).

---

## 🚀 Live Demo & Repository
- **Live Demo**: [https://product-admin-two.vercel.app/login](https://product-admin-two.vercel.app/login)
- **GitHub Repository**: [https://github.com/shubhangi2326/ProductAdmin](https://github.com/shubhangi2326/ProductAdmin)

---

## 📋 Features Completed

### 1. 🔐 Authentication & Protected Routes
- **Login Page (`/login`)**: Authenticates using `POST https://dummyjson.com/auth/login` with credentials `emilys` / `emilyspass`.
- **Error Feedback**: Displays clear inline error banners for wrong credentials.
- **Route Guard**: Only authenticated users can access product dashboard (`/products`) and details (`/products/[id]`). Unauthenticated attempts automatically redirect to `/login`.
- **Persistent Session**: Auth token stored securely in HTTP cookies (`js-cookie`) and `localStorage`, with auto-rehydration on reload.
- **Logout Action**: Top navbar logout button clears token and session, redirecting to `/login`.
- **Double-Submission Prevention**: Disables login button and shows a spinner during pending requests.

### 2. 📊 Product List & Responsive Layout
- Displays thumbnail image, product title, category badge, price ($), star rating, and stock status.
- **Responsive Views**: Clean, interactive Data Table on Desktop (`>768px`) and dynamic Card Grid on Mobile (`<768px`).

### 3. 📄 Pagination
- Server-side pagination using DummyJSON `limit` and `skip` (`skip = (page - 1) * limit`).
- Custom controls: Page numbers with ellipsis, Previous/Next buttons, page size selector (`10`, `20`, `50`).
- Status indicator: e.g. `"Showing 21–40 of 194 products"`.

### 4. 🔍 Debounced Search & Race Condition Prevention
- Searches products using `/products/search?q=`.
- Custom `useDebounce` hook (400ms delay) waits until typing stops before querying the API.
- **Race Condition Safeguard**: Uses Axios `AbortController` cancellation signals so fast typing and slow responses (`&delay=2000`) never overwrite newer results.
- Resets automatically to Page 1 on query changes.

### 5. 🏷️ Category Filter & Sorting
- Category dropdown populated dynamically via `GET /products/categories`.
- Sort by `price`, `rating`, or `title` with toggleable `Ascending` / `Descending` order.

### 6. 📱 Product Details (`/products/[id]`)
- Dynamic route displaying image gallery with thumbnail picker, pricing, discount badge, full description, specifications (SKU, weight, warranty, shipping), and verified customer reviews.
- Custom **404 Not Found** view for non-existent product IDs.

### 7. ✏️ Add, Edit & Delete Operations
- **Form Validation**: Validates title, category, price (>0), stock (>=0), and rating (0–5).
- **Delete Confirmation Modal**: Prompts user before deleting.
- **Rapid Submission Safeguard**: Action buttons disabled during pending async operations.

### 8. 🎨 UI States
- **Loading State**: Animated Skeleton UI for tables and cards.
- **Empty State**: Friendly banner when 0 products match search/filter.
- **Error State**: Error banner with a functional **Retry** button.

---

## 🛠️ Setup & Local Installation

### Prerequisites
- Node.js v18.x or higher
- npm or pnpm

### Steps
```bash
# 1. Clone the repository
git clone https://github.com/your-username/product-admin-dashboard.git
cd product-admin-dashboard

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open http://localhost:3000 in your browser
```

---

## 💡 Technical Design Choices & Explanations

### 1. Shared Axios Setup (`src/api/axios.ts`)
- Configured a single custom Axios instance with request and response interceptors.
- **Request Interceptor**: Automatically attaches `Authorization: Bearer <token>` to headers if a session token is active.
- **Response Interceptor**: Centralizes error handling and automatically redirects `401 Unauthorized` responses to `/login?expired=true`.

### 2. Solution to API Limitation: Search vs. Category Filter
- **Limitation**: The DummyJSON API does not natively support combining search (`/products/search?q=`) and category filtering (`/products/category/{cat}`) in a single request.
- **Our Approach**: When both a search term (`q`) and category filter are active, the app queries `/products/search?q=` and applies client-side category filtering on the returned result set. A small indicator badge alerts the user that hybrid filtering is active.

### 3. Solution to Simulated CRUD Backend Operations
- **Limitation**: DummyJSON returns mock JSON responses for `POST`, `PUT`, and `DELETE` requests without modifying its real database.
- **Our Approach**: We implemented a client-side state overlay (`ProductContext`) backed by `localStorage`. Newly created, edited, or deleted items are merged into API responses in real-time and persist across browser reloads.

### 4. URL State Synchronization & Robust Parameter Sanitization
- All dashboard filters (`page`, `limit`, `q`, `category`, `sortBy`, `order`) are bi-directionally synced with URL search parameters.
- Malformed parameters (e.g. `?page=abc` or `?limit=-99`) are defensively sanitized to default fallback values (`page=1`, `limit=10`) using `urlParams.ts`, preventing app crashes.

---

## 🐛 Problem Faced & Fix

### Problem: Race Conditions on Fast Typing
When a user typed quickly in the search input over a slow or delayed network (`&delay=2000`), earlier API requests could resolve after later requests, causing old search results to overwrite current results.

### Solution:
We implemented Axios `AbortController` in the custom `useProducts` hook. Whenever a new search term or filter parameter is triggered, any pending HTTP request is immediately aborted before dispatching the new request. Abort errors are caught and ignored cleanly.

---

## 🤖 AI Tool Assistance Note
AI tools were utilized during development for:
1. Drafting the technical implementation plan and mapping out assignment edge cases.
2. Structuring defensive TypeScript interface definitions.
3. Formulating modern Tailwind CSS aesthetic color palettes and glassmorphism styling patterns.

---

## 💻 Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **State & Cookies**: React Context, `js-cookie`
