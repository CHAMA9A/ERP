/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  // Use default extensions so App Router files like app/(app)/page.tsx work correctly.
  pageExtensions: ["ts", "tsx", "js", "jsx", "mdx"],
  // Use the existing src directory
  // and keep Tailwind/shadcn config as-is.
};

export default nextConfig;

