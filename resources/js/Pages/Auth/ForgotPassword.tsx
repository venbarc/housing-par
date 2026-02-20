import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Forgot Password" />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="card p-8 space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-slate-900">Forgot Password</h1>
                            <p className="text-sm text-slate-500 mt-1">We'll send a reset link to your email.</p>
                        </div>
                        {status && <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{status}</div>}
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" className="form-input w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoFocus />
                                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                            </div>
                            <button type="submit" disabled={processing} className="btn-primary w-full">
                                {processing ? 'Sending…' : 'Send Reset Link'}
                            </button>
                        </form>
                        <p className="text-center text-sm text-slate-500">
                            <Link href="/login" className="text-primary-600 hover:underline">Back to login</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
