import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { forgotPasswordSchema, type ForgotPasswordFormData } from '@/lib/utils/validation';
import { ROUTES } from '@/lib/constants/routes';
import { Timer, Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const { forgotPassword } = useAuth();
    const { showError } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
        getValues,
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data: ForgotPasswordFormData) => {
        setIsSubmitting(true);
        try {
            await forgotPassword(data.email);
            setIsSent(true);
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Error al enviar el email');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card slide-up">
                <div className="auth-logo">
                    <div className="auth-logo-icon">
                        <Timer size={28} />
                    </div>
                    <h1>Recuperar contraseña</h1>
                    <p>Te enviaremos un enlace para restablecer tu contraseña</p>
                </div>

                {isSent ? (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--success-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 16px',
                            color: 'var(--success)',
                        }}>
                            <CheckCircle size={32} />
                        </div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>
                            Email enviado
                        </h2>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '24px' }}>
                            Hemos enviado un enlace de recuperación a <strong>{getValues('email')}</strong>.
                            Revisa tu bandeja de entrada.
                        </p>
                        <Link
                            to={ROUTES.LOGIN}
                            className="btn btn-primary"
                            style={{ textDecoration: 'none' }}
                        >
                            <ArrowLeft size={18} /> Volver al login
                        </Link>
                    </div>
                ) : (
                    <>
                        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                            <div>
                                <label htmlFor="email" className="input-label">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    className={`input-field${errors.email ? ' input-error' : ''}`}
                                    placeholder="tu@email.com"
                                    autoComplete="email"
                                    autoFocus
                                    {...register('email')}
                                />
                                {errors.email && (
                                    <p className="input-error-message">{errors.email.message}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary btn-lg"
                                disabled={!isValid || isSubmitting}
                                style={{ width: '100%', marginTop: '8px' }}
                            >
                                {isSubmitting ? (
                                    <><div className="spinner" /> Enviando...</>
                                ) : (
                                    <><Mail size={20} /> Enviar enlace de recuperación</>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <Link to={ROUTES.LOGIN} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <ArrowLeft size={14} /> Volver al login
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
