import { 
    Play, 
    Square, 
    Pause, 
    CalendarDays, 
    BarChart3, 
    CheckCircle2,
    Info,
    ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants/routes';

export default function ManualPage() {
    const navigate = useNavigate();

    return (
        <div className="slide-up" style={{ maxWidth: '800px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <div style={{ 
                    width: '64px', 
                    height: '64px', 
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    margin: '0 auto 20px',
                    boxShadow: 'var(--shadow-lg)'
                }}>
                    <Info size={32} />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px', color: 'var(--text-primary)' }}>
                    Guía de Uso Rápida 📖
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Todo lo que necesitas saber para gestionar tu jornada laboral.
                </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {/* Step 1: Control Horario */}
                <section className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '10px', 
                            backgroundColor: 'var(--success-light)', 
                            color: 'var(--success)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.1rem'
                        }}>1</div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Control de Jornada (Entrada/Salida)</h2>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                backgroundColor: 'var(--success)', 
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Play size={24} fill="currentColor" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Iniciar Jornada</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    Pulsa <strong style={{color: 'var(--success)'}}>ENTRAR</strong> al comenzar tu turno. Verás el cronómetro en marcha indicando tu tiempo de trabajo.
                                </p>
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '12px', 
                                backgroundColor: 'var(--error)', 
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <Square size={24} fill="currentColor" />
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '4px' }}>Finalizar Jornada</p>
                                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                                    Al terminar el día, pulsa <strong style={{color: 'var(--error)'}}>SALIR</strong> para registrar el total de horas y cerrar tu registro diario.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Step 2: Pausas */}
                <section className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '10px', 
                            backgroundColor: 'var(--warning-light)', 
                            color: 'var(--warning)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.1rem'
                        }}>2</div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Gestión de Pausas y Descansos</h2>
                    </div>
                    
                    <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
                        Es importante registrar tus descansos (comida, café, etc.) para que el cálculo de horas sea exacto.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px dashed var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
                            <Pause size={20} style={{ color: 'var(--warning)' }} />
                            <span style={{ fontSize: '0.9rem' }}>
                                Pulsa <strong style={{color: 'var(--warning)'}}>PAUSAR</strong> y elige el motivo (Comida, Descanso, etc.). El tiempo de trabajo se detendrá.
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px dashed var(--border-primary)', borderRadius: 'var(--radius-md)' }}>
                            <Play size={20} style={{ color: 'var(--success)' }} />
                            <span style={{ fontSize: '0.9rem' }}>
                                Cuando termines tu descanso, pulsa <strong style={{color: 'var(--success)'}}>REANUDAR</strong> para continuar contabilizando tu jornada.
                            </span>
                        </div>
                    </div>
                </section>

                {/* Step 3: Ausencias */}
                <section className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
                        <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '10px', 
                            backgroundColor: 'var(--primary-light)', 
                            color: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: '1.1rem'
                        }}>3</div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Vacaciones y Ausencias</h2>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <CalendarDays size={20} style={{ color: 'var(--primary)' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Nueva Solicitud</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Ve a la pestaña <strong onClick={() => navigate(ROUTES.LEAVE)} style={{color: 'var(--primary)', cursor: 'pointer'}}>Ausencias</strong> y pulsa "Solicitar". Selecciona las fechas y el motivo.
                            </p>
                        </div>
                        <div style={{ padding: '16px', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <CheckCircle2 size={20} style={{ color: 'var(--success)' }} />
                                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Estado de Solicitud</span>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                                Podrás ver si tu solicitud ha sido aceptada, rechazada o si sigue pendiente de revisión por administración.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Extra Section: Reportes */}
                <div style={{ 
                    padding: '24px', 
                    background: 'linear-gradient(to right, var(--bg-primary), var(--primary-light))', 
                    borderRadius: 'var(--radius-xl)', 
                    display: 'flex', 
                    gap: '20px', 
                    alignItems: 'center',
                    border: '1px solid var(--primary-light)',
                    marginTop: '8px'
                }}>
                    <div style={{ 
                        width: '56px', 
                        height: '56px', 
                        borderRadius: '50%', 
                        backgroundColor: 'white', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        boxShadow: 'var(--shadow-sm)',
                        flexShrink: 0
                    }}>
                        <BarChart3 size={28} />
                    </div>
                    <div>
                        <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)', marginBottom: '4px' }}>Control de Horas Extra</p>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                            En la sección de <strong>Reportes</strong> tienes gráficas visuales de tus horas semanales y mensuales para que nunca pierdas el control.
                        </p>
                    </div>
                </div>

                {/* Footer Action */}
                <div style={{ marginTop: '24px', textAlign: 'center', paddingBottom: '40px' }}>
                    <button className="btn btn-primary btn-lg" onClick={() => navigate(ROUTES.DASHBOARD)}>
                        <ArrowLeft size={20} /> ¡Entendido! Ir al Inicio
                    </button>
                    <p style={{ marginTop: '16px', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                        Si tienes más dudas, contacta con tu administrador.
                    </p>
                </div>
            </div>
        </div>
    );
}
