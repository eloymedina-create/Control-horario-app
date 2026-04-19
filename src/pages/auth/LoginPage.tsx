import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { loginSchema, type LoginFormData } from '@/lib/utils/validation';
import { ROUTES } from '@/lib/constants/routes';
import { Timer, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
    const { login } = useAuth();
    const { showError } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || ROUTES.DASHBOARD;

    const {
        register,
        handleSubmit,
        formState: { errors, isValid },
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data: LoginFormData) => {
        setIsSubmitting(true);
        try {
            await login(data.email, data.password);
            navigate(from, { replace: true });
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Error al iniciar sesión');
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
                    <h1>Control Horario</h1>
                    <p>Gestiona tu jornada laboral fácilmente</p>
                </div>

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

                    <div>
                        <label htmlFor="password" className="input-label">Contraseña</label>
                        <div className="input-password-wrapper">
                            <input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                className={`input-field${errors.password ? ' input-error' : ''}`}
                                placeholder="••••••••"
                                autoComplete="current-password"
                                style={{ paddingRight: '44px' }}
                                {...register('password')}
                            />
                            <button
                                type="button"
                                className="input-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.password && (
                            <p className="input-error-message">{errors.password.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={!isValid || isSubmitting}
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {isSubmitting ? (
                            <><div className="spinner" /> Iniciando sesión...</>
                        ) : (
                            <><LogIn size={20} /> Iniciar Sesión</>
                        )}
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                    <Link
                        to={ROUTES.FORGOT_PASSWORD}
                        style={{
                            color: 'var(--primary)',
                            fontSize: '0.875rem',
                            textDecoration: 'none',
                        }}
                    >
                        ¿Olvidaste tu contraseña?
                    </Link>
                </div>

                <div className="auth-divider">o</div>

                <div className="auth-footer">
                    ¿No tienes cuenta?{' '}
                    <Link to={ROUTES.REGISTER}>Regístrate</Link>
                </div>
            </div>
        </div>
    );
}
