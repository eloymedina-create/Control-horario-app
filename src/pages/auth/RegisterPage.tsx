import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { registerSchema, getPasswordStrength, PASSWORD_STRENGTH_LABELS, PASSWORD_STRENGTH_CLASSES, type RegisterFormData } from '@/lib/utils/validation';
import { ROUTES } from '@/lib/constants/routes';
import { Timer, Eye, EyeOff, UserPlus } from 'lucide-react';

export default function RegisterPage() {
    const { register: registerUser } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors, isValid },
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
        mode: 'onChange',
    });

    const passwordValue = watch('password', '');
    const strength = getPasswordStrength(passwordValue);

    const onSubmit = async (data: RegisterFormData) => {
        setIsSubmitting(true);
        try {
            await registerUser(data.email, data.password, data.full_name);
            showSuccess('¡Cuenta creada con éxito!');
            navigate(ROUTES.DASHBOARD, { replace: true });
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Error al crear la cuenta');
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
                    <h1>Crear cuenta</h1>
                    <p>Empieza a controlar tu horario hoy</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="full_name" className="input-label">Nombre completo</label>
                        <input
                            id="full_name"
                            type="text"
                            className={`input-field${errors.full_name ? ' input-error' : ''}`}
                            placeholder="Juan García"
                            autoFocus
                            {...register('full_name')}
                        />
                        {errors.full_name && (
                            <p className="input-error-message">{errors.full_name.message}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="email" className="input-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            className={`input-field${errors.email ? ' input-error' : ''}`}
                            placeholder="tu@email.com"
                            autoComplete="email"
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
                                placeholder="Mínimo 8 caracteres"
                                autoComplete="new-password"
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
                        {passwordValue.length > 0 && (
                            <>
                                <div className="password-strength">
                                    {[1, 2, 3, 4].map((level) => (
                                        <div
                                            key={level}
                                            className={`password-strength-bar${strength >= level ? ` ${PASSWORD_STRENGTH_CLASSES[strength]}` : ''}`}
                                        />
                                    ))}
                                </div>
                                <p className="input-helper" style={{ color: strength >= 3 ? 'var(--success)' : strength >= 2 ? 'var(--warning)' : 'var(--error)' }}>
                                    {PASSWORD_STRENGTH_LABELS[strength]}
                                </p>
                            </>
                        )}
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="input-label">Confirmar contraseña</label>
                        <input
                            id="confirmPassword"
                            type={showPassword ? 'text' : 'password'}
                            className={`input-field${errors.confirmPassword ? ' input-error' : ''}`}
                            placeholder="Repite tu contraseña"
                            autoComplete="new-password"
                            {...register('confirmPassword')}
                        />
                        {errors.confirmPassword && (
                            <p className="input-error-message">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-lg"
                        disabled={!isValid || isSubmitting}
                        style={{ width: '100%', marginTop: '8px' }}
                    >
                        {isSubmitting ? (
                            <><div className="spinner" /> Creando cuenta...</>
                        ) : (
                            <><UserPlus size={20} /> Crear cuenta</>
                        )}
                    </button>
                </form>

                <div className="auth-divider">o</div>

                <div className="auth-footer">
                    ¿Ya tienes cuenta?{' '}
                    <Link to={ROUTES.LOGIN}>Inicia sesión</Link>
                </div>
            </div>
        </div>
    );
}
