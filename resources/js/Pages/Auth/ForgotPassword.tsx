import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../components/auth/AuthLayout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/forgot-password');
    };

    return (
        <>
            <Head title="Forgot password" />
            <AuthLayout
                title="Forgot password"
                subtitle="Enter your email to receive a reset link."
                footer={<Link href="/login" className="btn-link">Back to sign in</Link>}
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
                    <button type="submit" className="btn-primary w-full" disabled={processing}>
                        {processing ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>
            </AuthLayout>
        </>
    );
}
