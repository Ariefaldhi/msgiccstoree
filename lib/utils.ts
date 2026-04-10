import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function toLocalISOString(date: Date) {
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISODate = new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
    return localISODate;
}
