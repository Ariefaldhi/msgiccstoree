import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "pjglhequxmfpxekztjza.supabase.co",
            },
        ],
    },
};

export default nextConfig;
