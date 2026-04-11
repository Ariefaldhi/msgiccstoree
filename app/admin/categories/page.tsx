"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, Save, X } from "lucide-react";
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
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Categories</h1>
                    <p className="text-slate-500 mt-1">Manage product categories.</p>
                </div>
                <button
                    onClick={() => {
                        setEditCategory(null);
                        setFormData({ name: "", slug: "", icon: "" });
                        setIsModalOpen(true);
                    }}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Category
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {categories.map((cat) => (
                        <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between group relative">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100">
                                    {cat.icon || "📦"}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{cat.name}</h3>
                                    <code className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded-md">/{cat.slug}</code>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-all">
                                <button
                                    onClick={() => openEdit(cat)}
                                    className="p-2 rounded-xl bg-blue-50 text-blue-500 hover:bg-blue-100"
                                    title="Edit"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(cat.id)}
                                    className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-100"
                                    title="Delete"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {categories.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No categories found. Create one to get started.
                        </div>
                    )}
                </div>
            )}

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900">{editCategory ? "Edit Category" : "New Category"}</h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="e.g. Premium Apps"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Slug</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.slug}
                                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="e.g. premium-apps"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Icon (Emoji)</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="e.g. 💎"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 mt-4"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>
                                    <Save className="w-5 h-5" />
                                    <span>Save Category</span>
                                </>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
