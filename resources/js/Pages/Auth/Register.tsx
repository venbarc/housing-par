import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => { reset('password', 'password_confirmation'); };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Register" />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="card p-8 space-y-6">
                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-primary-100 text-primary-700 grid place-items-center font-bold text-2xl mx-auto mb-3">
                                HB
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
                            <p className="text-sm text-slate-500 mt-1">Hospital Bed Manager</p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                                <input type="text" className="form-input w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required autoFocus />
                                {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input type="email" className="form-input w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input type="password" className="form-input w-full" value={data.password} onChange={(e) => setData('password', e.target.value)} required />
                                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                                <input type="password" className="form-input w-full" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} required />
                            </div>
                            <button type="submit" disabled={processing} className="btn-primary w-full">
                                {processing ? 'Creating account…' : 'Create account'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-primary-600 hover:underline">Sign in</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
