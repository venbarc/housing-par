import { FormEventHandler, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../components/auth/AuthLayout';

export default function ResetPassword({ token, email }: { token: string; email: string }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    useEffect(() => () => reset('password', 'password_confirmation'), []);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/reset-password');
    };

    return (
        <>
            <Head title="Reset password" />
            <AuthLayout
                title="Reset password"
                subtitle="Set a new password for your account."
                footer={<Link href="/login" className="btn-link">Back to sign in</Link>}
            >
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="field-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={data.email}
                            onChange={(event) => setData('email', event.target.value)}
                            required
                        />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="field-label">New Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            required
                        />
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    </div>
                    <div>
                        <label className="field-label">Confirm Password</label>
                        <input
                            type="password"
                            className="form-input"
                            value={data.password_confirmation}
                            onChange={(event) => setData('password_confirmation', event.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-primary w-full" disabled={processing}>
                        {processing ? 'Resetting...' : 'Reset password'}
                    </button>
                </form>
            </AuthLayout>
        </>
    );
}
