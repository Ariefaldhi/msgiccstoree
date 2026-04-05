"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash2, Loader2, Save, X, Edit, Package as PackageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

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
    features?: string[];
}

export default function AdminProducts() {
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
        category_id: "", title: "", price: "", tag: "", tag_color: "yellow", image_url: "", terms_conditions: ""
    });
    const [editForm, setEditForm] = useState<{
        category_id: string; title: string; price: string;
        tag: string; tag_color: "yellow" | "red" | "blue" | "purple"; image_url: string; terms_conditions: string;
    }>({
        category_id: "", title: "", price: "", tag: "", tag_color: "yellow", image_url: "", terms_conditions: ""
    });
    const [packageForm, setPackageForm] = useState<{
        name: string; price: string; cost_price: string; duration: string; type: string; is_available: boolean; features: string[];
    }>({
        name: "", price: "", cost_price: "0", duration: "", type: "", is_available: true, features: []
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
            setProductForm({ category_id: "", title: "", price: "", tag: "", tag_color: "yellow", image_url: "", terms_conditions: "" });
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
        setPackageForm({ name: "", price: "", cost_price: "0", duration: "", type: "", features: [] });
        setIsPackageModalOpen(true);
    };

    const openEditPackageModal = (product: Product, pkg: Package) => {
        setEditingPackage(pkg);
        setSelectedProduct(product);
        setPackageForm({ 
            name: pkg.name, 
            price: pkg.price, 
            cost_price: pkg.cost_price.toString(), 
            duration: pkg.duration, 
            type: pkg.type, 
            is_available: pkg.is_available ?? true,
            features: pkg.features || [] 
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
                setPackageForm({ name: "", price: "", cost_price: "0", duration: "", type: "", is_available: true, features: [] });
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


    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Products</h1>
                    <p className="text-slate-500 mt-1">Manage products and their packages.</p>
                </div>
                <button
                    onClick={() => setIsProductModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Add Product
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center h-64"><Loader2 className="w-8 h-8 text-blue-600 animate-spin" /></div>
            ) : (
                <div className="space-y-6">
                    {products.map((product) => (
                        <div key={product.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            {/* Product Header */}
                            <div className="p-6 flex items-start justify-between border-b border-slate-50 bg-slate-50/50">
                                <div className="flex gap-4">
                                    <div className="w-16 h-16 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-3xl font-black text-slate-900 overflow-hidden relative">
                                        {product.image_url ? (
                                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                                        ) : (
                                            product.title.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <div className="flex gap-2 mb-1">
                                            {product.tag && (
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md text-white bg-${product.tag_color === 'yellow' ? 'yellow-500' : product.tag_color === 'red' ? 'red-500' : 'blue-500'}`}>
                                                    {product.tag}
                                                </span>
                                            )}
                                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-200 text-slate-600">
                                                {categories.find(c => c.id === product.category_id)?.name || "Unknown Category"}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900">{product.title}</h3>
                                        <p className="text-blue-600 font-bold">{product.price}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openPackageModal(product)}
                                        className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> Add Package
                                    </button>
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit Product"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Packages List */}
                            <div className="p-4 bg-white">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 pl-2">Packages Available</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {product.packages?.map(pkg => (
                                        <div key={pkg.id} className="border border-slate-100 rounded-xl p-3 flex justify-between items-center bg-slate-50/30 hover:bg-slate-50 transition-colors">
                                            <div>
                                                <p className="font-bold text-sm text-slate-900">{pkg.name}</p>
                                                <p className="text-xs text-blue-600 font-bold">{pkg.price} <span className="text-slate-400 font-normal">• {pkg.duration}</span></p>
                                                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wide">{pkg.type}</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="flex flex-col items-center gap-1 mr-2">
                                                    <label className="relative inline-flex items-center cursor-pointer scale-75">
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
                                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                                    </label>
                                                    <span className={`text-[8px] font-bold uppercase tracking-tighter ${pkg.is_available ?? true ? 'text-blue-600' : 'text-slate-400'}`}>
                                                        {pkg.is_available ?? true ? 'ON' : 'OFF'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                <button
                                                    onClick={() => openEditPackageModal(product, pkg)}
                                                    className="p-1.5 text-slate-300 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeletePackage(pkg.id, product.id)}
                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                    {(!product.packages || product.packages.length === 0) && (
                                        <div className="col-span-full text-center py-4 text-xs text-slate-400 italic">
                                            No packages added yet.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}

                    {products.length === 0 && (
                        <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            No products. Add your first product to start selling.
                        </div>
                    )}
                </div>
            )}

            {/* --- MODALS --- */}

            {/* Add Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-black text-slate-900">New Product</h2>
                            <button onClick={() => setIsProductModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateProduct} className="space-y-4">
                            <div>
                                <label className="label-admin">Product Logo</label>
                                <div className="flex items-center gap-4">
                                    {imagePreview ? (
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => { setImageFile(null); setImagePreview(null); }}
                                                className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => setShowCropper(true)}
                                            className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-500 hover:text-blue-500 transition-all bg-slate-50"
                                        >
                                            <Plus className="w-6 h-6" />
                                        </button>
                                    )}
                                    <div className="text-xs text-slate-400">
                                        <p>Upload clean product logo.</p>
                                        <p>Square ratio recommended.</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="label-admin">Terms & Conditions (Optional)</label>
                                <textarea className="input-admin min-h-[100px]" placeholder="Syarat dan ketentuan untuk produk ini..."
                                    value={productForm.terms_conditions} onChange={e => setProductForm({ ...productForm, terms_conditions: e.target.value })}></textarea>
                            </div>

                            <div>
                                <label className="label-admin">Category</label>
                                <select
                                    required
                                    className="input-admin"
                                    value={productForm.category_id}
                                    onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-admin">Product Title</label>
                                <input required type="text" className="input-admin" placeholder="e.g. Netflix Premium"
                                    value={productForm.title} onChange={e => setProductForm({ ...productForm, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="label-admin">Starting Price</label>
                                <input required type="text" className="input-admin" placeholder="e.g. 25000"
                                    value={productForm.price} onChange={e => setProductForm({ ...productForm, price: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-admin">Tag (Optional)</label>
                                    <input type="text" className="input-admin" placeholder="e.g. PROMO"
                                        value={productForm.tag} onChange={e => setProductForm({ ...productForm, tag: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-admin">Tag Color</label>
                                    <select className="input-admin" value={productForm.tag_color} onChange={e => setProductForm({ ...productForm, tag_color: e.target.value as any })}>
                                        <option value="yellow">Yellow</option>
                                        <option value="red">Red</option>
                                        <option value="blue">Blue</option>
                                        <option value="purple">Purple</option>
                                    </select>
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="btn-admin-submit mt-4">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create Product"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Product Modal */}
            {isEditModalOpen && editingProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Edit Product</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{editingProduct.title}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateProduct} className="space-y-4">
                            <div>
                                <label className="label-admin">Category</label>
                                <select
                                    required
                                    className="input-admin"
                                    value={editForm.category_id}
                                    onChange={e => setEditForm({ ...editForm, category_id: e.target.value })}
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="label-admin">Product Title</label>
                                <input required type="text" className="input-admin" placeholder="e.g. Netflix Premium"
                                    value={editForm.title} onChange={e => setEditForm({ ...editForm, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="label-admin">Starting Price</label>
                                <input required type="text" className="input-admin" placeholder="e.g. 25000 atau Rp 25.000"
                                    value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-admin">Tag (Optional)</label>
                                    <input type="text" className="input-admin" placeholder="e.g. PROMO"
                                        value={editForm.tag} onChange={e => setEditForm({ ...editForm, tag: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-admin">Tag Color</label>
                                    <select className="input-admin" value={editForm.tag_color} onChange={e => setEditForm({ ...editForm, tag_color: e.target.value as any })}>
                                        <option value="yellow">Yellow</option>
                                        <option value="red">Red</option>
                                        <option value="blue">Blue</option>
                                        <option value="purple">Purple</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="label-admin">Image URL (Optional)</label>
                                <input type="text" className="input-admin" placeholder="https://..."
                                    value={editForm.image_url} onChange={e => setEditForm({ ...editForm, image_url: e.target.value })} />
                                {editForm.image_url && (
                                    <img src={editForm.image_url} className="mt-2 w-16 h-16 rounded-xl object-cover border border-slate-200" alt="preview" />
                                )}
                            </div>
                            <div>
                                <label className="label-admin">Terms & Conditions (Optional)</label>
                                <textarea className="input-admin min-h-[100px]" placeholder="Syarat dan ketentuan untuk produk ini..."
                                    value={editForm.terms_conditions} onChange={e => setEditForm({ ...editForm, terms_conditions: e.target.value })}></textarea>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="btn-admin-submit mt-4">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Package Modal */}
            {isPackageModalOpen && selectedProduct && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{editingPackage ? "Edit Package" : "Add Package"}</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">For {selectedProduct.title}</p>
                            </div>
                            <button onClick={() => setIsPackageModalOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleCreatePackage} className="space-y-4">
                            <div>
                                <label className="label-admin">Package Name</label>
                                <input required type="text" className="input-admin" placeholder="e.g. 1 Bulan Sharing"
                                    value={packageForm.name} onChange={e => setPackageForm({ ...packageForm, name: e.target.value })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-admin">Sell Price</label>
                                    <input required type="text" className="input-admin" placeholder="e.g. 29000"
                                        value={packageForm.price} onChange={e => setPackageForm({ ...packageForm, price: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-admin">Cost Price (Modal)</label>
                                    <input required type="text" className="input-admin" placeholder="e.g. 25000"
                                        value={packageForm.cost_price} onChange={e => setPackageForm({ ...packageForm, cost_price: e.target.value })} />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-admin">Duration</label>
                                    <input required type="text" className="input-admin" placeholder="e.g. 30 Hari"
                                        value={packageForm.duration} onChange={e => setPackageForm({ ...packageForm, duration: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-admin">Type</label>
                                    <input required type="text" className="input-admin" placeholder="e.g. PRIVAT"
                                        value={packageForm.type} onChange={e => setPackageForm({ ...packageForm, type: e.target.value })} />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={packageForm.is_available} 
                                        onChange={e => setPackageForm({ ...packageForm, is_available: e.target.checked })} />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Package Available</span>
                            </div>

                            {/* Features Input */}
                            <div>
                                <label className="label-admin">Features (Unlimited)</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        className="input-admin"
                                        placeholder="Add a feature (e.g. Garansi 7 Hari)"
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
                                            const val = input.value.trim();
                                            if (val) {
                                                setPackageForm(prev => ({ ...prev, features: [...prev.features, val] }));
                                                input.value = "";
                                            }
                                        }}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 rounded-xl font-bold transition-colors"
                                    >
                                        <Plus className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {packageForm.features.map((feat, idx) => (
                                        <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                            <span className="text-xs font-bold text-slate-700">{feat}</span>
                                            <button
                                                type="button"
                                                onClick={() => setPackageForm(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))}
                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {packageForm.features.length === 0 && (
                                        <p className="text-xs text-slate-400 italic">No features added. Press Enter to add.</p>
                                    )}
                                </div>
                            </div>

                            <button type="submit" disabled={isSubmitting} className="btn-admin-submit mt-4">
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : editingPackage ? "Save Package" : "Add Package"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
        .label-admin {
            @apply block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2;
        }
        .input-admin {
            @apply w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all;
        }
        .btn-admin-submit {
            @apply w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2;
        }
      `}</style>

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
