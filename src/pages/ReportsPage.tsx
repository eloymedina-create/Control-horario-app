import { useState } from 'react';
import { BarChart3, Download, TrendingUp, Clock, CalendarDays } from 'lucide-react';
import { formatMinutesToDuration } from '@/lib/utils/formatting';

type Period = 'week' | 'month' | 'year';

export default function ReportsPage() {
    const [period, setPeriod] = useState<Period>('month');

    // Demo data
    const weeklyData = [
        { label: 'Lun', hours: 8.0 },
        { label: 'Mar', hours: 7.5 },
        { label: 'Mié', hours: 8.5 },
        { label: 'Jue', hours: 9.0 },
        { label: 'Vie', hours: 6.5 },
    ];

    const monthlyData = [
        { label: 'Sem 1', hours: 40 },
        { label: 'Sem 2', hours: 38.5 },
        { label: 'Sem 3', hours: 42 },
        { label: 'Sem 4', hours: 32.5 },
    ];

    const chartData = period === 'week' ? weeklyData : monthlyData;
    const maxH = Math.max(...chartData.map((d) => d.hours));

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BarChart3 size={24} /> Reportes
                </h1>
                <button className="btn btn-primary btn-sm">
                    <Download size={14} /> Exportar CSV
                </button>
            </div>

            {/* Selector de periodo */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '20px' }}>
                {(['week', 'month', 'year'] as Period[]).map((p) => (
                    <button
                        key={p}
                        className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setPeriod(p)}
                    >
                        {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                    </button>
                ))}
            </div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                <div className="card card-compact" style={{ textAlign: 'center' }}>
                    <Clock size={20} style={{ color: 'var(--primary)', marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {period === 'week' ? '39.5h' : period === 'month' ? '153h' : '1840h'}
                    </div>
                    <div className="stats-label">Horas totales</div>
                </div>
                <div className="card card-compact" style={{ textAlign: 'center' }}>
                    <TrendingUp size={20} style={{ color: 'var(--success)', marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>7.9h</div>
                    <div className="stats-label">Promedio diario</div>
                </div>
                <div className="card card-compact" style={{ textAlign: 'center' }}>
                    <CalendarDays size={20} style={{ color: 'var(--info)', marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                        {period === 'week' ? '5' : period === 'month' ? '20' : '230'}
                    </div>
                    <div className="stats-label">Días trabajados</div>
                </div>
                <div className="card card-compact" style={{ textAlign: 'center' }}>
                    <BarChart3 size={20} style={{ color: 'var(--warning)', marginBottom: '8px' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>45min</div>
                    <div className="stats-label">Pausa promedio</div>
                </div>
            </div>

            {/* Gráfico de barras */}
            <div className="card" style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '20px' }}>
                    Distribución de horas ({period === 'week' ? 'por día' : 'por semana'})
                </h2>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', height: '200px', padding: '0 8px' }}>
                    {chartData.map((item) => {
                        const heightPct = maxH > 0 ? (item.hours / maxH) * 90 : 0;
                        return (
                            <div key={item.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', height: '100%', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    {formatMinutesToDuration(item.hours * 60)}
                                </span>
                                <div style={{
                                    width: '100%',
                                    maxWidth: '64px',
                                    height: `${heightPct}%`,
                                    background: `linear-gradient(to top, var(--primary), var(--secondary))`,
                                    borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                                    transition: 'height var(--transition-slow)',
                                    minHeight: '4px',
                                }} />
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>{item.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Distribución de pausas */}
            <div className="card">
                <h2 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '16px' }}>Distribución de pausas</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { label: '🍽️ Comida', percentage: 55, time: '45min promedio' },
                        { label: '☕ Descanso', percentage: 35, time: '12min promedio' },
                        { label: '🔧 Otra', percentage: 10, time: '8min promedio' },
                    ].map((item) => (
                        <div key={item.label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.875rem' }}>
                                <span>{item.label}</span>
                                <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.time}</span>
                            </div>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{
                                    width: `${item.percentage}%`,
                                    background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                                }} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
