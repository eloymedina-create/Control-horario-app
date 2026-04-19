import { z } from 'zod';

export const loginSchema = z.object({
    email: z.string()
        .min(1, 'El email es obligatorio')
        .email('Email inválido'),
    password: z.string()
        .min(1, 'La contraseña es obligatoria'),
});

export const registerSchema = z.object({
    full_name: z.string()
        .min(2, 'El nombre debe tener al menos 2 caracteres')
        .max(100, 'El nombre es demasiado largo'),
    email: z.string()
        .min(1, 'El email es obligatorio')
        .email('Email inválido')
        .transform((v) => v.toLowerCase()),
    password: z.string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
        .regex(/[a-z]/, 'Debe contener al menos una minúscula')
        .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string()
        .min(1, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
    email: z.string()
        .min(1, 'El email es obligatorio')
        .email('Email inválido'),
});

export const timeEntryEditSchema = z.object({
    clock_in: z.string().min(1, 'La hora de entrada es obligatoria'),
    clock_out: z.string().min(1, 'La hora de salida es obligatoria'),
    notes: z.string().max(500, 'Las notas no pueden superar 500 caracteres').optional(),
});

export const leaveRequestSchema = z.object({
    type: z.enum(['vacation', 'sick_leave', 'personal', 'training', 'other'], {
        required_error: 'Selecciona el tipo de ausencia',
    }),
    duration: z.enum(['full_day', 'half_day', 'hours'], {
        required_error: 'Selecciona la duración',
    }),
    start_date: z.string().min(1, 'La fecha de inicio es obligatoria'),
    end_date: z.string().min(1, 'La fecha de fin es obligatoria'),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    reason: z.string().max(500).optional(),
});

/**
 * Calcula fortaleza de contraseña (0-4)
 */
export function getPasswordStrength(password: string): number {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
}

export const PASSWORD_STRENGTH_LABELS = ['', 'Débil', 'Regular', 'Buena', 'Fuerte'];
export const PASSWORD_STRENGTH_CLASSES = ['', 'weak', 'fair', 'good', 'strong'];

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type TimeEntryEditFormData = z.infer<typeof timeEntryEditSchema>;
export type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;
