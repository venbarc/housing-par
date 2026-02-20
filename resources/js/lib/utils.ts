import { clsx, type ClassValue } from 'clsx';
import toast from 'react-hot-toast';

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function withToast<T>(promise: Promise<T>, message: string): Promise<T> {
    return toast.promise(promise, {
        loading: 'Working...',
        success: message,
        error: (err: Error) => err.message || 'Something went wrong',
    });
}
