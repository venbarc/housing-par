import { useEffect, FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';

interface Props {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    useEffect(() => {
        return () => { reset('password'); };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Log in" />
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    <div className="card p-8 space-y-6">
                        {/* Logo */}
                        <div className="text-center">
                            <div className="h-14 w-14 rounded-2xl bg-primary-100 text-primary-700 grid place-items-center font-bold text-2xl mx-auto mb-3">
                                HB
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900">Hospital Bed Manager</h1>
                            <p className="text-sm text-slate-500 mt-1">Sign in to your account</p>
                        </div>

                        {status && (
                            <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    className="form-input w-full"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    autoFocus
                                />
                                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    className="form-input w-full"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                    />
                                    Remember me
                                </label>
                                {canResetPassword && (
                                    <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="btn-primary w-full"
                            >
                                {processing ? 'Signing in…' : 'Sign in'}
                            </button>
                        </form>

                        <p className="text-center text-sm text-slate-500">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-primary-600 hover:underline">Register</Link>
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
