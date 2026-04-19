import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/contexts/ToastContext';
import { ROUTES } from '@/lib/constants/routes';
import { LEAVE_TYPE_LABELS, LEAVE_DURATION_LABELS } from '@/types/leave';
import type { LeaveType, LeaveDuration } from '@/types/leave';
import { CalendarDays, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { leaveService } from '@/lib/firebase/services/leaveService';

export default function LeaveRequestPage() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { showSuccess, showError } = useToast();
    const [type, setType] = useState<LeaveType>('vacation');
    const [duration, setDuration] = useState<LeaveDuration>('full_day');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile?.id) return;
        
        setIsSubmitting(true);
        try {
            const start = new Date(startDate);
            const end = new Date(endDate || startDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const totalDays = duration === 'hours' ? 0.1 : duration === 'half_day' ? 0.5 : Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

            await leaveService.requestLeave(profile.id, {
                type,
                duration,
                start_date: startDate,
                end_date: endDate || startDate,
                start_time: null,
                end_time: null,
                total_days: totalDays,
                reason,
                attachment_url: null
            });

            showSuccess('¡Solicitud enviada correctamente!');
            navigate(ROUTES.LEAVE);
        } catch (error) {
            showError('Error al enviar la solicitud');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <button className="btn btn-ghost" onClick={() => navigate(ROUTES.LEAVE)} style={{ marginBottom: '16px' }}>
                <ArrowLeft size={18} /> Volver
            </button>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <CalendarDays size={24} /> Solicitar ausencia
            </h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Tipo */}
                <div className="card">
                    <label className="input-label">Tipo de ausencia</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', marginTop: '8px' }}>
                        {(Object.entries(LEAVE_TYPE_LABELS) as [LeaveType, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                className={`btn btn-sm ${type === key ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setType(key)}
                                style={{ justifyContent: 'flex-start' }}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duración */}
                <div className="card">
                    <label className="input-label">Duración</label>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                        {(Object.entries(LEAVE_DURATION_LABELS) as [LeaveDuration, string][]).map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                className={`btn btn-sm ${duration === key ? 'btn-primary' : 'btn-outline'}`}
                                onClick={() => setDuration(key)}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fechas */}
                <div className="card">
                    <div style={{ display: 'grid', gridTemplateColumns: duration === 'full_day' && type === 'vacation' ? '1fr 1fr' : '1fr', gap: '12px' }}>
                        <div>
                            <label htmlFor="start_date" className="input-label">
                                {duration === 'full_day' && type === 'vacation' ? 'Fecha inicio' : 'Fecha'}
                            </label>
                            <input
                                id="start_date"
                                type="date"
                                className="input-field"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.target.value);
                                    if (!endDate || endDate < e.target.value) setEndDate(e.target.value);
                                }}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>
                        {duration === 'full_day' && type === 'vacation' && (
                            <div>
                                <label htmlFor="end_date" className="input-label">Fecha fin</label>
                                <input
                                    id="end_date"
                                    type="date"
                                    className="input-field"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    min={startDate || new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    {/* Resumen */}
                    {startDate && (
                        <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            background: 'var(--primary-light)',
                            borderRadius: 'var(--radius)',
                            fontSize: '0.875rem',
                            color: 'var(--primary)',
                        }}>
                            📋 {LEAVE_TYPE_LABELS[type]} ·{' '}
                            {startDate === endDate || !endDate
                                ? new Date(startDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
                                : `${new Date(startDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} al ${new Date(endDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                        </div>
                    )}
                </div>

                {/* Notas */}
                <div className="card">
                    <label htmlFor="reason" className="input-label">Notas (opcional)</label>
                    <textarea
                        id="reason"
                        className="input-field"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Añade una descripción o motivo..."
                        rows={3}
                        maxLength={500}
                        style={{ resize: 'vertical' }}
                    />
                    <p className="input-helper">{reason.length}/500</p>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary btn-lg"
                    disabled={!startDate || isSubmitting}
                    style={{ width: '100%' }}
                >
                    {isSubmitting ? (
                        <><div className="spinner" /> Enviando...</>
                    ) : (
                        <><Send size={20} /> Solicitar ausencia</>
                    )}
                </button>
            </form>
        </div>
    );
}
