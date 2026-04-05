"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Loader2, Upload, X, Check } from "lucide-react";
import getCroppedImg from "@/lib/cropImage"; // Helper we will create

interface ImageCropperProps {
    onCropComplete: (croppedImageBlob: Blob) => void;
    onCancel: () => void;
}

export default function ImageCropper({ onCropComplete, onCancel }: ImageCropperProps) {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const imageDataUrl = await readFile(file);
            setImageSrc(imageDataUrl as string);
        }
    };

    const readFile = (file: File) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.addEventListener("load", () => resolve(reader.result));
            reader.readAsDataURL(file);
        });
    };

    const handleCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = useCallback(async () => {
        if (!imageSrc || !croppedAreaPixels) return;
        try {
            setLoading(true);
            const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels);
            if (croppedImage) {
                onCropComplete(croppedImage);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, [imageSrc, croppedAreaPixels, onCropComplete]);

    if (!imageSrc) {
        return (
            <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
                <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl relative">
                    <button onClick={onCancel} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>

                    <div className="text-center mb-6">
                        <h3 className="text-lg font-black text-slate-900">Upload Logo</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">Select an image to crop</p>
                    </div>

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all relative group bg-slate-50/50">
                        <input type="file" accept="image/*" onChange={onFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                        <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-sm">
                            <Upload className="w-6 h-6" />
                        </div>
                        <p className="font-bold text-slate-700 text-sm">Click to browse</p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold uppercase tracking-wide">Max 2MB • JPG/PNG</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-bold text-slate-900">Crop Image</h3>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                </div>

                <div className="relative h-64 w-full bg-slate-900">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1} // Square logo
                        onCropChange={setCrop}
                        onCropComplete={handleCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <span className="text-xs font-bold text-slate-500">Zoom</span>
                        <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button onClick={() => setImageSrc(null)} className="flex-1 py-3 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50">
                            Change Image
                        </button>
                        <button onClick={showCroppedImage} disabled={loading} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Apply Crop</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
