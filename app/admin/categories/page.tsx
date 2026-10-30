"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, Save, X, Layers, Edit } from "lucide-react";
import { useRouter } from "next/navigation";

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
}

export default function AdminCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: "", slug: "", icon: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("categories")
            .select("*")
            .order("created_at", { ascending: true });

        if (data) setCategories(data);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this category?")) return;

        const { error } = await supabase.from("categories").delete().eq("id", id);
        if (!error) {
            setCategories(categories.filter((c) => c.id !== id));
            router.refresh();
        } else {
            alert("Error deleting category: " + error.message);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (editCategory) {
            const { data, error } = await supabase
                .from("categories")
                .update(formData)
                .eq("id", editCategory.id)
                .select();

            if (!error && data) {
                setCategories(categories.map(c => c.id === editCategory.id ? data[0] : c));
                setIsModalOpen(false);
                setFormData({ name: "", slug: "", icon: "" });
                setEditCategory(null);
                router.refresh();
            } else {
                alert("Error updating category: " + (error?.message || "Unknown error"));
            }
        } else {
            const { data, error } = await supabase.from("categories").insert([formData]).select();

            if (!error && data) {
                setCategories([...categories, data[0]]);
                setIsModalOpen(false);
                setFormData({ name: "", slug: "", icon: "" });
                router.refresh();
            } else {
                alert("Error saving category: " + (error?.message || "Unknown error"));
            }
        }

        setIsSubmitting(false);
    };

    const openEdit = (cat: Category) => {
        setEditCategory(cat);
        setFormData({ name: cat.name, slug: cat.slug, icon: cat.icon });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <Layers className="w-6 h-6 text-blue-600" />
                        Kategori Produk
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Kelola kategori dan segmentasi produk katalog.</p>
                </div>
                <button
                    onClick={() => {
                        setEditCategory(null);
                        setFormData({ name: "", slug: "", icon: "" });
                        setIsModalOpen(true);
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Kategori
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Kategori...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between group hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3.5 min-w-0">
                                <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center text-xl border border-slate-100 shrink-0">
                                    {cat.icon || "📦"}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-semibold text-sm text-slate-900 truncate">{cat.name}</h3>
                                    <code className="text-[11px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200/60 mt-1 inline-block">/{cat.slug}</code>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    onClick={() => openEdit(cat)}
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                    title="Hapus"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="col-span-full py-16 text-center text-slate-400 text-sm bg-white border border-dashed border-slate-200 rounded-2xl">
                            Belum ada kategori. Klik &apos;Tambah Kategori&apos; untuk membuat kategori baru.
                        </div>
                    )}
                </div>
            )}

            {/* Add / Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                            <h2 className="text-base font-bold text-slate-900">{editCategory ? "Edit Kategori" : "Kategori Baru"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nama Kategori</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                    placeholder="Contoh: Premium Apps"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Slug URL</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                    placeholder="Contoh: premium-apps"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Ikon (Emoji)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                    placeholder="Contoh: 💎"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                            >
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <>
                                    <Save className="w-4 h-4" />
                                    <span>Simpan Kategori</span>
                                </>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
