"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, Save, X, Edit, Package as PackageIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAdminCurrency } from "@/components/admin/AdminCurrencyProvider";

import ImageCropper from "@/components/admin/ImageCropper";

// Types matching DB schema
interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    category_id: string;
    title: string;
    price: string;
    tag: string;
    tag_color: "yellow" | "red" | "blue" | "purple";
    image_url?: string;
    description?: string;
    terms_conditions?: string;
    packages?: Package[];
}

interface Package {
    id: string;
    product_id: string;
    name: string;
    price: string;
    cost_price: number;
    duration: string;
    type: string;
    is_available: boolean;
    terms_and_conditions?: string;
    features?: string[];
    reseller_price?: number;
}

const formatToIDR = (val: string | number) => {
    const num = typeof val === 'string' ? val.replace(/\D/g, '') : val.toString();
    if (!num) return "";
    return Number(num).toLocaleString('id-ID');
};

export default function AdminProducts() {
    const { isUSD, formatCurrency } = useAdminCurrency();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal States
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [editingPackage, setEditingPackage] = useState<Package | null>(null);

    // Forms
    const [productForm, setProductForm] = useState({
        category_id: "", title: "", price: "", tag: "", tag_color: "yellow" as "yellow" | "red" | "blue" | "purple", image_url: "", description: "", terms_conditions: ""
    });
    const [editForm, setEditForm] = useState<{
        category_id: string; title: string; price: string;
        tag: string; tag_color: "yellow" | "red" | "blue" | "purple"; image_url: string; description: string; terms_conditions: string;
    }>({
        category_id: "", title: "", price: "", tag: "", tag_color: "yellow", image_url: "", description: "", terms_conditions: ""
    });
    const [packageForm, setPackageForm] = useState<{
        name: string; price: string; cost_price: string; reseller_price: string; duration: string; type: string; is_available: boolean; features: string[]; terms_and_conditions: string;
    }>({
        name: "", price: "", cost_price: "0", reseller_price: "0", duration: "", type: "", is_available: true, features: [], terms_and_conditions: ""
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);

        // Fetch Categories for dropdown
        const { data: cats } = await supabase.from("categories").select("*");
        if (cats) setCategories(cats);

        // Fetch Products with Packages
        const { data: prods, error } = await supabase
            .from("products")
            .select("*, packages(*)")
            .order("created_at", { ascending: false });

        if (prods) setProducts(prods);
        setLoading(false);
    };

    // Image State
    const [imageFile, setImageFile] = useState<Blob | null>(null);
    const [showCropper, setShowCropper] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // --- PRODUCT HANDLERS ---

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Auto-fix price format if just number
        let formattedPrice = productForm.price;
        if (!productForm.price.startsWith("Rp")) {
            formattedPrice = `Rp ${Number(productForm.price.replace(/\D/g, '')).toLocaleString('id-ID')}`;
        }

        let imageUrl = productForm.image_url;

        // Upload Image if exists
        if (imageFile) {
            const fileName = `${Date.now()}-${productForm.title.replace(/\s+/g, '-').toLowerCase()}.jpg`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('products')
                .upload(fileName, imageFile, {
                    contentType: 'image/jpeg'
                });

            if (uploadError) {
                alert("Image upload failed: " + uploadError.message + "\nMake sure you created a public bucket named 'products'.");
                setIsSubmitting(false);
                return;
            }

            if (uploadData) {
                // Get Public URL
                const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
                imageUrl = publicUrl;
            }
        }

        const { data, error } = await supabase.from("products").insert([{
            ...productForm,
            price: formattedPrice,
            image_url: imageUrl
        }]).select();

        if (!error && data) {
            setProducts([data[0], ...products]);
            setIsProductModalOpen(false);
            setProductForm({ category_id: "", title: "", price: "", tag: "", tag_color: "yellow", image_url: "", description: "", terms_conditions: "" });
            setImageFile(null);
            setImagePreview(null);
            router.refresh();
        } else {
            alert("Error: " + error?.message);
        }
        setIsSubmitting(false);
    };

    const handleDeleteProduct = async (id: string) => {
        if (!confirm("Delete product? This will delete all its packages too.")) return;
        const { error } = await supabase.from("products").delete().eq("id", id);
        if (!error) {
            setProducts(products.filter(p => p.id !== id));
            router.refresh();
        }
    };

    // --- EDIT PRODUCT HANDLERS ---

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setEditForm({
            category_id: product.category_id,
            title: product.title,
            price: product.price,
            tag: product.tag || "",
            tag_color: product.tag_color || "yellow",
            image_url: product.image_url || "",
            description: product.description || "",
            terms_conditions: product.terms_conditions || "",
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingProduct) return;
        setIsSubmitting(true);

        let formattedPrice = editForm.price;
        if (!editForm.price.startsWith("Rp")) {
            formattedPrice = `Rp ${Number(editForm.price.replace(/\D/g, '')).toLocaleString('id-ID')}`;
        }

        const { error } = await supabase
            .from("products")
            .update({ ...editForm, price: formattedPrice })
            .eq("id", editingProduct.id);

        if (!error) {
            setProducts(products.map(p =>
                p.id === editingProduct.id
                    ? { ...p, ...editForm, price: formattedPrice }
                    : p
            ));
            setIsEditModalOpen(false);
            setEditingProduct(null);
        } else {
            alert("Error: " + error.message);
        }
        setIsSubmitting(false);
    };

    // --- PACKAGE HANDLERS ---

    const openPackageModal = (product: Product) => {
        setEditingPackage(null);
        setSelectedProduct(product);
        setPackageForm({ name: "", price: "", cost_price: "0", reseller_price: "0", duration: "", type: "", is_available: true, features: [], terms_and_conditions: "" });
        setIsPackageModalOpen(true);
    };

    const openEditPackageModal = (product: Product, pkg: Package) => {
        setEditingPackage(pkg);
        setSelectedProduct(product);
        setPackageForm({ 
            name: pkg.name, 
            price: pkg.price, 
            cost_price: pkg.cost_price.toString(), 
            reseller_price: pkg.reseller_price?.toString() || "0",
            duration: pkg.duration, 
            type: pkg.type, 
            is_available: pkg.is_available ?? true,
            features: pkg.features || [],
            terms_and_conditions: pkg.terms_and_conditions || ""
        });
        setIsPackageModalOpen(true);
    };

    const handleCreatePackage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProduct) return;
        setIsSubmitting(true);

        // Auto-fix price
        let formattedPrice = packageForm.price;
        if (!packageForm.price.startsWith("Rp")) {
            formattedPrice = `Rp ${Number(packageForm.price.replace(/\D/g, '')).toLocaleString('id-ID')}`;
        }

        const payload = {
            ...packageForm,
            price: formattedPrice,
            cost_price: parseInt(packageForm.cost_price.replace(/\D/g, '')) || 0,
            reseller_price: parseInt(packageForm.reseller_price.replace(/\D/g, '')) || 0,
            product_id: selectedProduct.id,
            features: packageForm.features
        };

        if (editingPackage) {
            const { error } = await supabase.from("packages").update(payload).eq("id", editingPackage.id);
            if (!error) {
                setProducts(products.map(p => {
                    if (p.id === selectedProduct.id) {
                        return { 
                            ...p, 
                            packages: (p.packages || []).map(pkg => pkg.id === editingPackage.id ? { ...pkg, ...payload } : pkg) 
                        };
                    }
                    return p;
                }));
                setIsPackageModalOpen(false);
                setEditingPackage(null);
            } else {
                alert("Error: " + error.message);
            }
        } else {
            const { data, error } = await supabase.from("packages").insert([payload]).select();

            if (!error && data) {
                setProducts(products.map(p => {
                    if (p.id === selectedProduct.id) {
                        return { ...p, packages: [...(p.packages || []), data[0]] };
                    }
                    return p;
                }));
                setIsPackageModalOpen(false);
                setPackageForm({ name: "", price: "", cost_price: "0", reseller_price: "0", duration: "", type: "", is_available: true, features: [], terms_and_conditions: "" });
            } else {
                alert("Error: " + error?.message);
            }
        }
        setIsSubmitting(false);
    };

    const handleDeletePackage = async (packageId: string, productId: string) => {
        if (!confirm("Delete this package?")) return;
        const { error } = await supabase.from("packages").delete().eq("id", packageId);
        if (!error) {
            setProducts(products.map(p => {
                if (p.id === productId) {
                    return { ...p, packages: p.packages?.filter(pkg => pkg.id !== packageId) };
                }
                return p;
            }));
        }
    };

    const getTagColorClass = (color?: string) => {
        switch (color) {
            case "yellow": return "bg-amber-50 text-amber-700 border-amber-200";
            case "red": return "bg-rose-50 text-rose-700 border-rose-200";
            case "purple": return "bg-purple-50 text-purple-700 border-purple-200";
            case "blue":
            default: return "bg-blue-50 text-blue-700 border-blue-200";
        }
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-5 border-b border-slate-200 gap-4">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <PackageIcon className="w-6 h-6 text-blue-600" />
                        Katalog Produk
                    </h1>
                    <p className="text-slate-500 text-xs md:text-sm mt-0.5">Kelola produk digital, varian paket, dan harga reseller.</p>
                </div>
                <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 text-xs font-semibold transition-colors shadow-xs"
                >
                    <Plus className="w-4 h-4" />
                    Tambah Produk
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 bg-white border border-slate-200/90 rounded-2xl">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Memuat Produk...</p>
                </div>
            ) : (
                <div className="space-y-5">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
                            {/* Product Header */}
                            <div className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-100 bg-slate-50/50 gap-4">
                                <div className="flex items-center gap-3.5 min-w-0">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-xs border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-900 overflow-hidden shrink-0">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            product.title.charAt(0)
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                            {product.tag && (
                                                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${getTagColorClass(product.tag_color)}`}>
                                                    {product.tag}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/60">
                                                {categories.find(c => c.id === product.category_id)?.name || "Kategori"}
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-900 truncate">{product.title}</h3>
                                        <p className="text-blue-600 font-bold text-xs mt-0.5">{formatCurrency(product.price)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                                    <button
                                        onClick={() => openPackageModal(product)}
                                        className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg px-3 py-1.5 transition-colors border border-blue-100"
                                    >
                                        <Plus className="w-3.5 h-3.5" /> Tambah Paket
                                    </button>
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit Produk"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        title="Hapus Produk"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Packages List */}
                            <div className="p-4 md:p-5">
                                <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Paket Tersedia</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {[...(product.packages || [])]
                                        .sort((a, b) => {
                                            const aAvail = a.is_available !== false;
                                            const bAvail = b.is_available !== false;
                                            if (aAvail && !bAvail) return -1;
                                            if (!aAvail && bAvail) return 1;
                                            const aPrice = parseInt(a.price.replace(/\D/g, "")) || 0;
                                            const bPrice = parseInt(b.price.replace(/\D/g, "")) || 0;
                                            return aPrice - bPrice;
                                        })
                                        .map(pkg => (
                                        <div key={pkg.id} className="border border-slate-200 rounded-xl p-3 flex justify-between items-center bg-white hover:bg-slate-50/60 transition-colors">
                                            <div>
                                                <p className="font-semibold text-xs text-slate-900">{pkg.name}</p>
                                                <p className="text-xs text-blue-600 font-bold mt-0.5">{formatCurrency(pkg.price)} <span className="text-slate-400 font-normal">• {pkg.duration}</span></p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">Modal: <span className="text-rose-600 font-semibold">{formatCurrency(pkg.cost_price)}</span></p>
                                                <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide font-medium">{pkg.type}</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex flex-col items-center gap-0.5 mr-1">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" className="sr-only peer" checked={pkg.is_available ?? true} 
                                                            onChange={async (e) => {
                                                                const newVal = e.target.checked;
                                                                const { error } = await supabase.from("packages").update({ is_available: newVal }).eq("id", pkg.id);
                                                                if (!error) {
                                                                    setProducts(products.map(p => {
                                                                        if (p.id === product.id) {
                                                                            return { ...p, packages: (p.packages || []).map(p_pkg => p_pkg.id === pkg.id ? { ...p_pkg, is_available: newVal } : p_pkg) };
                                                                        }
                                                                        return p;
                                                                    }));
                                                                }
                                                            }}
                                                        />
                                                        <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                    <span className={`text-[9px] font-semibold uppercase ${pkg.is_available ?? true ? 'text-blue-600' : 'text-slate-400'}`}>
                                                        {pkg.is_available ?? true ? 'ON' : 'OFF'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-0.5">
                                                    <button
                                                        onClick={() => openEditPackageModal(product, pkg)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit Paket"
                                                    >
                                                        <Edit className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeletePackage(pkg.id, product.id)}
                                                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                        title="Hapus Paket"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {(!product.packages || product.packages.length === 0) && (
                                        <div className="col-span-full py-6 text-center text-xs text-slate-400">
                                            Belum ada paket yang ditambahkan untuk produk ini.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {products.length === 0 && (
                        <div className="py-16 text-center text-slate-400 text-sm bg-white border border-dashed border-slate-200 rounded-2xl">
                            Belum ada produk. Klik &apos;Tambah Produk&apos; untuk mulai mengisi katalog.
                        </div>
                    )}
                </div>
            )}

            {/* --- MODALS --- */}

            {/* Add Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                            <h2 className="text-base font-bold text-slate-900">Tambah Produk Baru</h2>
                            <button onClick={() => setIsProductModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-3">Logo / Gambar Produk</label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group shrink-0">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowCropper(true)}
                                            className="w-20 h-20 rounded-xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-500 hover:border-blue-600 hover:text-blue-600 transition-colors bg-white shrink-0"
                                        >
                                            <Plus className="w-5 h-5" />
                                            <span className="text-[10px] font-semibold mt-1">Upload</span>
                                        </button>
                                    )}
                                    <div className="flex-1">
                                        <h4 className="text-xs font-semibold text-slate-900">Format Gambar 1:1</h4>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">Gunakan gambar persegi (square) resolusi tinggi untuk hasil terbaik di katalog.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Kategori Produk</label>
                                    <select
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer"
                                        value={productForm.category_id}
                                        onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                                    >
                                        <option value="">Pilih Kategori...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Judul Layanan</label>
                                    <input 
                                        required 
                                        type="text" 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                        placeholder="Contoh: Netflix Premium 4K"
                                        value={productForm.title} 
                                        onChange={e => setProductForm({ ...productForm, title: e.target.value })} 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Harga Mulai Dari</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                                            <input 
                                                required 
                                                type="text" 
                                                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                                placeholder="0"
                                                value={productForm.price.includes("Rp") ? productForm.price.replace("Rp ", "") : formatToIDR(productForm.price)} 
                                                onChange={e => setProductForm({ ...productForm, price: formatToIDR(e.target.value) })} 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Tag (Opsional)</label>
                                            <input 
                                                type="text" 
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                                placeholder="PROMO"
                                                value={productForm.tag} 
                                                onChange={e => setProductForm({ ...productForm, tag: e.target.value })} 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Warna Tag</label>
                                            <select 
                                                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer" 
                                                value={productForm.tag_color} 
                                                onChange={e => setProductForm({ ...productForm, tag_color: e.target.value as any })}
                                            >
                                                <option value="yellow">Kuning</option>
                                                <option value="red">Merah</option>
                                                <option value="blue">Biru</option>
                                                <option value="purple">Ungu</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 pt-1">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Deskripsi Produk</label>
                                    <textarea 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors min-h-[90px] resize-none" 
                                        placeholder="Tuliskan deskripsi lengkap mengenai produk ini..."
                                        value={productForm.description} 
                                        onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Syarat & Ketentuan (Opsional)</label>
                                    <textarea 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors min-h-[80px] resize-none" 
                                        placeholder="Syarat, garansi, atau kebijakan lainnya..."
                                        value={productForm.terms_conditions} 
                                        onChange={e => setProductForm({ ...productForm, terms_conditions: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>Konfirmasi & Tambah Produk</span>
                                        <Plus className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {isEditModalOpen && editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-lg w-full shadow-xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Edit Produk</h2>
                                <p className="text-xs text-slate-500">{editingProduct.title}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Kategori Produk</label>
                                    <select
                                        required
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer"
                                        value={editForm.category_id}
                                        onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}
                                    >
                                        <option value="">Pilih Kategori...</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Judul Layanan</label>
                                    <input 
                                        required 
                                        type="text" 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                        placeholder="Contoh: Netflix Premium 4K"
                                        value={editForm.title} 
                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })} 
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Harga Mulai Dari</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                                        <input 
                                            required 
                                            type="text" 
                                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                            placeholder="0"
                                            value={editForm.price.includes("Rp") ? editForm.price.replace("Rp ", "") : formatToIDR(editForm.price)} 
                                            onChange={e => setEditForm({ ...editForm, price: formatToIDR(e.target.value) })} 
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Tag (Opsional)</label>
                                        <input 
                                            type="text" 
                                            className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                            placeholder="PROMO"
                                            value={editForm.tag} 
                                            onChange={e => setEditForm({ ...editForm, tag: e.target.value })} 
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Warna Tag</label>
                                        <select 
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors cursor-pointer" 
                                            value={editForm.tag_color} 
                                            onChange={e => setEditForm({ ...editForm, tag_color: e.target.value as any })}
                                        >
                                            <option value="yellow">Kuning</option>
                                            <option value="red">Merah</option>
                                            <option value="blue">Biru</option>
                                            <option value="purple">Ungu</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-2">URL Gambar Produk</label>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="text" 
                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                        placeholder="https://example.com/image.jpg"
                                        value={editForm.image_url} 
                                        onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} 
                                    />
                                    {editForm.image_url && (
                                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0">
                                            <img src={editForm.image_url} className="w-full h-full object-cover" alt="preview" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3 pt-1">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Deskripsi Produk</label>
                                    <textarea 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors min-h-[90px] resize-none" 
                                        placeholder="Deskripsi lengkap produk..."
                                        value={editForm.description} 
                                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Syarat & Ketentuan (Opsional)</label>
                                    <textarea 
                                        className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors min-h-[80px] resize-none" 
                                        placeholder="Syarat, garansi, atau kebijakan lainnya..."
                                        value={editForm.terms_conditions} 
                                        onChange={e => setEditForm({ ...editForm, terms_conditions: e.target.value })}
                                    ></textarea>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>Simpan Perubahan Produk</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add / Edit Package Modal */}
            {isPackageModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                    <div className="bg-white rounded-2xl border border-slate-200 p-6 max-w-sm w-full shadow-xl max-h-[85vh] overflow-y-auto">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-900">{editingPackage ? "Edit Paket" : "Tambah Paket"}</h2>
                                <p className="text-xs text-slate-500">{selectedProduct.title}</p>
                            </div>
                            <button onClick={() => setIsPackageModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleCreatePackage} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Nama Paket</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                    placeholder="Contoh: 1 Bulan Sharing"
                                    value={packageForm.name} 
                                    onChange={e => setPackageForm({ ...packageForm, name: e.target.value })} 
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Harga Jual</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                                        <input 
                                            required 
                                            type="text" 
                                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                            placeholder="0"
                                            value={formatToIDR(packageForm.price)} 
                                            onChange={e => setPackageForm({ ...packageForm, price: formatToIDR(e.target.value) })} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Harga Modal</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                                        <input 
                                            required 
                                            type="text" 
                                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                            placeholder="0"
                                            value={formatToIDR(packageForm.cost_price)} 
                                            onChange={e => setPackageForm({ ...packageForm, cost_price: formatToIDR(e.target.value) })} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Harga Reseller</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Rp</span>
                                        <input 
                                            required 
                                            type="text" 
                                            className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                            placeholder="0"
                                            value={formatToIDR(packageForm.reseller_price)} 
                                            onChange={e => setPackageForm({ ...packageForm, reseller_price: formatToIDR(e.target.value) })} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Durasi / Tipe</label>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <input 
                                            required 
                                            type="text" 
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                            placeholder="30 Hari"
                                            value={packageForm.duration} 
                                            onChange={e => setPackageForm({ ...packageForm, duration: e.target.value })} 
                                        />
                                        <input 
                                            required 
                                            type="text" 
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors" 
                                            placeholder="Sharing"
                                            value={packageForm.type} 
                                            onChange={e => setPackageForm({ ...packageForm, type: e.target.value })} 
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={packageForm.is_available} 
                                        onChange={e => setPackageForm({ ...packageForm, is_available: e.target.checked })} />
                                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-xs font-semibold text-slate-700">Paket Tersedia (ON/OFF)</span>
                            </div>

                            {/* S&K Khusus Paket */}
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Syarat & Ketentuan Khusus (Opsional)</label>
                                <textarea 
                                    className="w-full bg-white border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors resize-none" 
                                    placeholder="Contoh: Pesanan akan diproses melalui WhatsApp..."
                                    rows={3}
                                    value={packageForm.terms_and_conditions}
                                    onChange={e => setPackageForm({ ...packageForm, terms_and_conditions: e.target.value })}
                                />
                            </div>

                            {/* Features Input */}
                            <div className="space-y-2">
                                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider">Fitur & Keunggulan</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                                        placeholder="Tambah fitur (Garansi Full)"
                                        id="feature-input"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                const val = e.currentTarget.value.trim();
                                                if (val) {
                                                    setPackageForm(prev => ({ ...prev, features: [...prev.features, val] }));
                                                    e.currentTarget.value = "";
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const input = document.getElementById('feature-input') as HTMLInputElement;
                                            const val = input?.value.trim();
                                            if (val) {
                                                setPackageForm(prev => ({ ...prev, features: [...prev.features, val] }));
                                                input.value = "";
                                            }
                                        }}
                                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 rounded-lg flex items-center justify-center transition-colors border border-blue-100"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                                    {packageForm.features.map((feat, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
                                            <span className="text-xs font-medium text-slate-700">{feat}</span>
                                            <button
                                                type="button"
                                                onClick={() => setPackageForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))}
                                                className="text-slate-400 hover:text-rose-600 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                    {packageForm.features.length === 0 && (
                                        <p className="text-[11px] text-slate-400 italic text-center py-1">Belum ada fitur. Tekan Enter untuk menambah.</p>
                                    )}
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2.5 text-xs font-semibold transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <span>{editingPackage ? "Simpan Perubahan Paket" : "Tambah Paket Ke Produk"}</span>
                                        {!editingPackage && <Plus className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showCropper && (
                <ImageCropper
                    onCropComplete={(blob) => {
                        setImageFile(blob);
                        setImagePreview(URL.createObjectURL(blob));
                        setShowCropper(false);
                    }}
                    onCancel={() => setShowCropper(false)}
                />
            )}
        </div>
    );
}
