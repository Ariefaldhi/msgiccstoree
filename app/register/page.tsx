"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Loader2, ArrowRight } from "lucide-react";

export default function RegisterPage() {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            router.push("/login?registered=true");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-md bg-white border border-slate-200/90 p-6 sm:p-8 rounded-2xl shadow-sm">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center size-12 rounded-xl bg-blue-50 mb-3 border border-blue-100 text-blue-600">
                        <User className="size-5" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Daftar Akun Baru</h1>
                    <p className="text-slate-500 text-xs sm:text-sm mt-1 font-normal">Buat akun untuk mempermudah transaksi</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Nama Lengkap</label>
                        <div className="relative">
                            <User className="absolute left-3.5 top-3 size-4 text-slate-400" />
                            <input
                                type="text"
                                required
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-3.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-sm font-medium transition-all placeholder:text-slate-400"
                                placeholder="Nama Anda"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-3 size-4 text-slate-400" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-3.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-sm font-medium transition-all placeholder:text-slate-400"
                                placeholder="nama@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700 block mb-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-3 size-4 text-slate-400" />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-3.5 focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-sm font-medium transition-all placeholder:text-slate-400"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-3 rounded-xl font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 text-sm mt-2"
                    >
                        {loading ? <Loader2 className="size-4 animate-spin" /> : <>
                            <span>Daftar Akun</span>
                            <ArrowRight className="size-4" />
                        </>}
                    </button>
                </form>

                <p className="text-center mt-6 text-slate-500 text-xs font-medium">
                    Sudah memiliki akun?{" "}
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-bold">
                        Masuk sekarang
                    </Link>
                </p>
            </div>
        </div>
    );
}
