import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 images: {
    domains: ["summarist.vercel.app", 'firebasestorage.googleapis.com', 'storage.googleapis.com'],
},
};

export default nextConfig;
