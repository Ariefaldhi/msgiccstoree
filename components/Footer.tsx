import Link from "next/link";

export default function Footer() {
    return (
        <footer className="border-t border-border/40 bg-background/50 backdrop-blur-sm mt-20">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#18181b] text-white font-bold shadow-lg shadow-gray-200/20 italic text-xl">
                                M
                            </div>
                            <span className="text-xl font-bold">MSGICC<span className="text-red-500">STORE</span></span>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                            Platform top-up game dan aplikasi premium termurah, tercepat, dan terpercaya di Indonesia.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-foreground">Menu</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-red-500 transition-colors">Home</Link></li>
                            <li><Link href="/apps" className="hover:text-red-500 transition-colors">Apps</Link></li>
                            <li><Link href="/sosmed" className="hover:text-red-500 transition-colors">Sosmed</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold mb-4 text-foreground">Legal</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/privacy" className="hover:text-red-500 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-red-500 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/contact" className="hover:text-red-500 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-12 pt-8 border-t border-border/40 text-center text-xs text-muted-foreground">
                    &copy; 2026 MsgiccStore. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
