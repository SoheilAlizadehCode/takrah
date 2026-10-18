import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // فایل‌های دانلودی گیت دانش‌آموزی داخل باندل تابع سروری قرار می‌گیرند
  // تا بدون تأیید گیت هیچ‌گز قابل دسترسی نباشند.
  outputFileTracingIncludes: {
    "/api/student/file/[id]": ["./private-downloads/**/*"],
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
