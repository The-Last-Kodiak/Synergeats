import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { type DailyLog } from '../types';
import NutritionBar from '../components/NutritionBar';
import { computeDailyTargets, FOOD_GROUP_COLORS } from '../lib/nutrition';
import { Trash2 } from 'lucide-react';

function formatDate(d: Date) {
  return d.toISOString().split('T')[0];
}

export default function NutritionTracker() {
  const { user, profile, todayLogs, refreshTodayLogs } = useApp();
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [logs, setLogs] = useState<DailyLog[]>(todayLogs);
  const [loadingDate, setLoadingDate] = useState(false);

  const targets = computeDailyTargets(profile);

  useEffect(() => {
    if (selectedDate === formatDate(new Date())) {
      setLogs(todayLogs);
    } else {
      loadLogsForDate(selectedDate);
    }
  }, [selectedDate, todayLogs]);

  async function loadLogsForDate(date: string) {
    if (!user) return;
    setLoadingDate(true);
    const { data } = await supabase
      .from('daily_logs')
      .select('*, food:foods(*)')
      .eq('user_id', user.id)
      .eq('log_date', date);
    setLogs(data || []);
    setLoadingDate(false);
  }

  async function removeLog(id: string) {
    await supabase.from('daily_logs').delete().eq('id', id);
    if (selectedDate === formatDate(new Date())) {
      refreshTodayLogs();
    } else {
      loadLogsForDate(selectedDate);
    }
  }

  const totals = logs.reduce(
    (acc, log) => {
      const f = log.food;
      if (!f) return acc;
      const q = log.quantity;
      return {
        calories: acc.calories + f.calories * q,
        protein_g: acc.protein_g + f.protein_g * q,
        carbs_g: acc.carbs_g + f.carbs_g * q,
        fat_g: acc.fat_g + f.fat_g * q,
        fiber_g: acc.fiber_g + f.fiber_g * q,
        vitamin_d_mcg: acc.vitamin_d_mcg + f.vitamin_d_mcg * q,
        magnesium_mg: acc.magnesium_mg + f.magnesium_mg * q,
        antioxidant_score: acc.antioxidant_score + f.antioxidant_score * q,
        omega3_mg: acc.omega3_mg + f.omega3_mg * q,
      };
    },
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0, vitamin_d_mcg: 0, magnesium_mg: 0, antioxidant_score: 0, omega3_mg: 0 }
  );

  const calPct = Math.min(Math.round((totals.calories / targets.calories) * 100), 100);

  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 27 + i);
    return formatDate(d);
  });

  return (
    <div className="nutrition-tracker">
      <div className="nutrition-tracker__header">
        <h1>Nutrition Tracker</h1>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          max={formatDate(new Date())}
          className="date-picker"
        />
      </div>

      <div className="nutrition-tracker__calendar">
        {calendarDays.map(d => {
          const isToday = d === formatDate(new Date());
          const isSelected = d === selectedDate;
          return (
            <button
              key={d}
              className={`cal-dot ${isToday ? 'cal-dot--today' : ''} ${isSelected ? 'cal-dot--selected' : ''}`}
              onClick={() => setSelectedDate(d)}
              title={d}
            >
              {new Date(d + 'T12:00:00').getDate()}
            </button>
          );
        })}
      </div>

      <div className="nutrition-tracker__summary">
        <div className="cal-ring">
          <svg viewBox="0 0 80 80" className="cal-ring__svg">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="34"
              fill="none"
              stroke={calPct >= 100 ? '#e53e3e' : '#48bb78'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - calPct / 100)}`}
              transform="rotate(-90 40 40)"
            />
          </svg>
          <div className="cal-ring__label">
            <span className="cal-ring__pct">{calPct}%</span>
            <span className="cal-ring__sub">calories</span>
          </div>
        </div>

        <div className="macro-summary">
          {[
            { label: 'Protein', val: totals.protein_g, target: targets.protein_g, unit: 'g', color: '#ed8936' },
            { label: 'Carbs', val: totals.carbs_g, target: targets.carbs_g, unit: 'g', color: '#ecc94b' },
            { label: 'Fats', val: totals.fat_g, target: targets.fat_g, unit: 'g', color: '#4299e1' },
          ].map(m => (
            <div key={m.label} className="macro-pill">
              <span className="macro-pill__val" style={{ color: m.color }}>{Math.round(m.val)}{m.unit}</span>
              <span className="macro-pill__label">{m.label}</span>
              <span className="macro-pill__target">/ {m.target}{m.unit}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="nutrition-tracker__bars">
        <NutritionBar label="Calories" current={totals.calories} target={targets.calories} unit="kcal" color="#e53e3e" />
        <NutritionBar label="Protein" current={totals.protein_g} target={targets.protein_g} unit="g" color="#ed8936" />
        <NutritionBar label="Carbohydrates" current={totals.carbs_g} target={targets.carbs_g} unit="g" color="#ecc94b" />
        <NutritionBar label="Fats" current={totals.fat_g} target={targets.fat_g} unit="g" color="#4299e1" />
        <NutritionBar label="Fiber" current={totals.fiber_g} target={targets.fiber_g} unit="g" color="#48bb78" />
        <NutritionBar label="Vitamin D" current={totals.vitamin_d_mcg} target={targets.vitamin_d_mcg} unit="mcg" color="#f6e05e" />
        <NutritionBar label="Magnesium" current={totals.magnesium_mg} target={targets.magnesium_mg} unit="mg" color="#76e4f7" />
        <NutritionBar label="Antioxidants" current={totals.antioxidant_score} target={targets.antioxidant_score} unit="score" color="#fc8181" />
        <NutritionBar label="Omega-3" current={totals.omega3_mg} target={targets.omega3_mg} unit="mg" color="#68d391" />
      </div>

      <div className="nutrition-tracker__logs">
        <h2>Food Log</h2>
        {loadingDate ? (
          <div className="spinner-row"><div className="spinner" /></div>
        ) : logs.length === 0 ? (
          <p className="tracker-empty">No foods logged for this day.</p>
        ) : (
          <div className="log-list">
            {logs.map(log => {
              const f = log.food;
              if (!f) return null;
              const groupColor = FOOD_GROUP_COLORS[f.food_group] || '#a0aec0';
              return (
                <div key={log.id} className="log-item">
                  <div className="log-item__dot" style={{ background: groupColor }} />
                  <div className="log-item__info">
                    <span className="log-item__name">{f.name}</span>
                    <span className="log-item__detail">
                      x{log.quantity} · {Math.round(f.calories * log.quantity)} cal · {Math.round(f.protein_g * log.quantity)}g protein
                    </span>
                  </div>
                  <span className="log-item__time">{log.meal_time}</span>
                  <button className="log-item__delete" onClick={() => removeLog(log.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
