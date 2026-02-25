import { FormEventHandler, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../components/auth/AuthLayout';

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

    useEffect(() => () => reset('password'), []);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/login');
    };

    return (
        <>
            <Head title="Log in" />
            <AuthLayout
                title="Sign in"
                subtitle="Use your staff credentials to access hospital operations."
                footer={(
                    <p>
                        No account yet? <Link href="/register" className="btn-link">Create one</Link>
                    </p>
                )}
            >
                {status && (
                    <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="field-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            required
                            autoFocus
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="field-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            required
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-slate-600">
                            <input
                                type="checkbox"
                                checked={data.remember}
                                onChange={(event) => setData('remember', event.target.checked)}
                            />
                            Remember me
                        </label>
                        {canResetPassword && (
                            <Link href="/forgot-password" className="btn-link text-xs">
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <button type="submit" className="btn-primary w-full" disabled={processing}>
                        {processing ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>
            </AuthLayout>
        </>
    );
}
