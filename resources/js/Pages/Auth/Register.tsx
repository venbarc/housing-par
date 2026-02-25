import { FormEventHandler, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AuthLayout from '../../components/auth/AuthLayout';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => () => reset('password', 'password_confirmation'), []);

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post('/register');
    };

    return (
        <>
            <Head title="Register" />
            <AuthLayout
                title="Create account"
                subtitle="Register a staff profile to access bed management."
                footer={(
                    <p>
                        Already registered? <Link href="/login" className="btn-link">Sign in</Link>
                    </p>
                )}
            >
                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="field-label">Full Name</label>
                        <input
                            type="text"
                            className="form-input"
                            value={data.name}
                            onChange={(event) => setData('name', event.target.value)}
                            required
                            autoFocus
                        />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                    </div>
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
                        {processing ? 'Creating account...' : 'Create account'}
                    </button>
                </form>
            </AuthLayout>
        </>
    );
}
