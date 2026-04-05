import { createClient } from "@/lib/supabase/server";

export default async function ThemeRegistry() {
    const supabase = await createClient();
    const { data: settings } = await supabase.from("store_settings").select("*").eq("id", 1).single();

    if (!settings) return null;

    // Define color mappings for supported theme colors
    const themes: Record<string, Record<string, string>> = {
        'blue': {
            '50': '#eff6ff',
            '100': '#dbeafe',
            '200': '#bfdbfe',
            '300': '#93c5fd',
            '400': '#60a5fa',
            '500': '#3b82f6',
            '600': '#2563eb', // primary blue
            '700': '#1d4ed8',
            '900': '#1e3a8a',
        },
        'red': {
            '50': '#fef2f2',
            '100': '#fee2e2',
            '200': '#fecaca',
            '300': '#fca5a5',
            '400': '#f87171',
            '500': '#ef4444',
            '600': '#dc2626', // primary red
            '700': '#b91c1c',
            '900': '#7f1d1d',
        },
        'emerald': {
            '50': '#ecfdf5',
            '100': '#d1fae5',
            '200': '#a7f3d0',
            '300': '#6ee7b7',
            '400': '#34d399',
            '500': '#10b981',
            '600': '#059669', // primary emerald
            '700': '#047857',
            '900': '#064e3b',
        },
        'purple': {
            '50': '#faf5ff',
            '100': '#f3e8ff',
            '200': '#e9d5ff',
            '300': '#d8b4fe',
            '400': '#c084fc',
            '500': '#a855f7',
            '600': '#9333ea', // primary purple
            '700': '#7e22ce',
            '900': '#581c87',
        },
        'orange': {
            '50': '#fff7ed',
            '100': '#ffedd5',
            '200': '#fed7aa',
            '300': '#fdba74',
            '400': '#fb923c',
            '500': '#f97316',
            '600': '#ea580c', // primary orange
            '700': '#c2410c',
            '900': '#7c2d12',
        }
    };

    const color = settings.primary_color || 'blue';
    const activeTheme = themes[color] || themes['blue'];

    return (
        <style dangerouslySetInnerHTML={{
            __html: `
                :root {
                    --theme-50: ${activeTheme['50']};
                    --theme-100: ${activeTheme['100']};
                    --theme-200: ${activeTheme['200']};
                    --theme-300: ${activeTheme['300']};
                    --theme-400: ${activeTheme['400']};
                    --theme-500: ${activeTheme['500']};
                    --theme-600: ${activeTheme['600']};
                    --theme-700: ${activeTheme['700']};
                    --theme-900: ${activeTheme['900']};
                }
            `
        }} />
    );
}
