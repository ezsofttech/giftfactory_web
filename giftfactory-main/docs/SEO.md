# SEO – Gift Factory

What’s in place and what you can do next.

---

## Implemented

### 1. **Root metadata** (`app/layout.tsx`)

- **Title template**: `%s | Gift Factory` so child pages get a consistent suffix.
- **Default title & description**: Brand name and a short, keyword-aware description.
- **Keywords**: gifts, hampers, corporate gifting, etc.
- **Open Graph**: `type`, `locale`, `url`, `siteName`, `title`, `description`.
- **Twitter**: `summary_large_image`, title, description.
- **Robots**: `index: true`, `follow: true`, `googleBot` same.
- **Canonical**: Default canonical for the site (from `NEXT_PUBLIC_SITE_URL`).
- **metadataBase**: Set from `NEXT_PUBLIC_SITE_URL` so relative URLs in OG/twitter resolve correctly.

**Env:** Set `NEXT_PUBLIC_SITE_URL` to your live URL (e.g. `https://www.giftfactory.in`).

---

### 2. **Product detail** (`app/products/[id]/layout.tsx`)

- **generateMetadata**:
  - Fetches product from API (with 60s revalidate).
  - **Title**: `product.seo.title` or `product.title`.
  - **Description**: `product.seo.sub_title` or `product.sub_title` or truncated `product.description` or fallback from brand/category.
  - **Canonical**: `{SITE_URL}/products/{id}`.
  - **Open Graph & Twitter**: title, description, product image when available.
- **JSON-LD** (Product):
  - `name`, `description`, `sku` (slug), `url`, `image` (all baseImageUrl), `offers` (price, INR, InStock).

Backend: Populate `product.seo.title` and `product.seo.sub_title` for best product titles and meta descriptions.

---

### 3. **Products list** (`app/products/layout.tsx`)

- **Title**: “All Products”.
- **Description**: Short, keyword-focused.
- **OG** and **canonical** for `/products`.

---

### 4. **Sitemap** (`app/sitemap.ts`)

- **Static**: `/`, `/products`, `/sell`, `/help` with sensible `changeFrequency` and `priority`.
- **Dynamic**: Fetches products from API (limit 5000, revalidate 1h) and adds `/products/{id}`.
- Served at `/sitemap.xml`.

---

### 5. **Robots** (`app/robots.ts`)

- **Allow**: `/` for all user agents.
- **Disallow**: `/api/`, `/checkout`, `/orders`, `/profile`, `/settings`, `/cart`.
- **Sitemap**: `{SITE_URL}/sitemap.xml`.

---

## What you can do next

### Content & meta

1. **Per-page metadata**  
   Add `metadata` or `generateMetadata` to other important routes (e.g. `/sell`, `/help`, `/sellers/[id]`) with unique titles and descriptions.

2. **Better product descriptions**  
   Encourage unique, readable descriptions (150–160 chars for meta, longer for page content) and use `product.seo.title` / `product.seo.sub_title` in the backend for product meta.

3. **Structured data**
   - **BreadcrumbList** on product and category pages (Home → Category → Product).
   - **Organization** on the homepage (logo, name, url, sameAs).
   - **FAQPage** on `/help` if you have a clear FAQ list.

### Technical

4. **Canonical and hreflang**  
   If you add more locales, use `alternates.canonical` and `alternates.languages` in metadata and/or in sitemap.

5. **Image SEO**  
   - Use Next.js `<Image>` with meaningful `alt` (you already do in many places).  
   - For OG, ensure product images are absolute URLs (already handled in product layout).  
   - Consider WebP and explicit width/height where it helps LCP.

6. **Core Web Vitals**  
   Lazy-load below-the-fold content, keep main product image and LCP element fast; monitor with Search Console and PageSpeed Insights.

7. **Sitemap index**  
   If product count grows a lot, split sitemap into index + multiple product sitemaps and reference them from `robots.ts` / sitemap index.

8. **Seller pages**  
   Add `generateMetadata` and optional JSON-LD (e.g. `ProfilePage` or local business) for `/sellers/[id]` if you want those pages to rank.

### Analytics & search

9. **Google Search Console**  
   Verify the domain, submit sitemap, fix coverage and mobile issues.

10. **Bing Webmaster**  
    Submit sitemap and verify site.

11. **Structured data testing**  
    Use Google Rich Results Test and Schema validator to confirm Product (and any new types) are valid.

---

## Env checklist

- `NEXT_PUBLIC_SITE_URL` = production URL (no trailing slash), e.g. `https://www.giftfactory.in`.

This is used for:

- `metadataBase`, canonicals, OG URLs, sitemap base, and robots sitemap URL.
