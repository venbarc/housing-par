import { useEffect, FormEventHandler } from 'react';
import { Head, useForm } from '@inertiajs/react';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => { return () => { reset('password', 'password_confirmation'); }; }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <>
            <Head title="Reset Password" />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="card p-8 space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-slate-900">Reset Password</h1>
                        </div>
                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" className="form-input w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">New Password</label>
                                <input type="password" className="form-input w-full" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                <input type="password" className="form-input w-full" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required />
                            </div>
                            <button type="submit" disabled={processing} className="btn-primary w-full">
                                {processing ? 'Resetting…' : 'Reset Password'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
