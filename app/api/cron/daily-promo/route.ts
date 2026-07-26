import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with service role key for cron jobs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
    try {
        // Optional: Verify Vercel Cron Secret if set
        const authHeader = request.headers.get('authorization');
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const PROMO_LABEL = "PROMO HARIAN";

        // 1. Delete previous daily promos
        await supabase
            .from("flash_sales")
            .delete()
            .eq("label", PROMO_LABEL);

        // 2. Fetch all available packages
        const { data: packages, error: pkgError } = await supabase
            .from("packages")
            .select("*")
            .eq("is_available", true);

        if (pkgError || !packages || packages.length < 2) {
            return NextResponse.json({ error: "Not enough packages available" }, { status: 400 });
        }

        // 3. Shuffle and pick 2 random packages
        const shuffled = packages.sort(() => 0.5 - Math.random());
        const selectedPackages = shuffled.slice(0, 2);

        // 4. Calculate promos and insert
        const promosToInsert = selectedPackages.map(pkg => {
            const rawPrice = parseInt(pkg.price.replace(/\D/g, ""), 10) || 0;
            const costPrice = pkg.cost_price || 0;
            
            // Random discount between 5% and 10%
            let discountPercent = Math.floor(Math.random() * 6) + 5; // 5 to 10
            
            // Check if discounted price is below cost price
            let discountedPrice = Math.round(rawPrice * (1 - discountPercent / 100));
            
            if (discountedPrice < costPrice) {
                // If it hits cost, calculate the max possible discount that stays at or above cost
                // discountPercent = (rawPrice - costPrice) / rawPrice * 100
                const maxAllowedDiscount = Math.floor(((rawPrice - costPrice) / rawPrice) * 100);
                
                // If even 1% puts it below cost, don't give discount (or give 0)
                discountPercent = Math.max(0, maxAllowedDiscount);
                
                // Safety bound to max 10% just in case
                discountPercent = Math.min(10, discountPercent);
            }

            const now = new Date();
            // Start now, end in 24 hours
            const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

            return {
                package_id: pkg.id,
                discount_percent: discountPercent,
                label: PROMO_LABEL,
                start_time: now.toISOString(),
                end_time: endTime.toISOString(),
                is_active: true,
                max_orders: 0 // Will fallback to random 1-5 for FOMO
            };
        });

        // Insert new promos
        const { error: insertError } = await supabase
            .from("flash_sales")
            .insert(promosToInsert);

        if (insertError) {
            throw insertError;
        }

        return NextResponse.json({ success: true, generated: promosToInsert.length });

    } catch (error) {
        console.error("Daily promo cron error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
