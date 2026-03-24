import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabase';
import { computeDailyTargets } from '../lib/nutrition';
import NutritionBar from '../components/NutritionBar';
import { ChevronRight, ChevronLeft, Target, Flame } from 'lucide-react';

const GOALS = [
  { key: 'bulk', label: 'Bulk', desc: 'Build muscle & gain mass', color: '#f47c3c' },
  { key: 'cut', label: 'Cut', desc: 'Lose fat, preserve muscle', color: '#4da3e8' },
  { key: 'maintain', label: 'Maintain', desc: 'Stay balanced & healthy', color: '#3dba7e' },
];

const ALLERGIES = ['Gluten', 'Dairy', 'Nuts', 'Shellfish', 'Soy', 'Eggs', 'Fish', 'Vegan'];

export default function Dashboard() {
  const { user, profile, todayLogs, refreshProfile } = useApp();

  const [onboardingStep, setOnboardingStep] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  const [goal, setGoal] = useState<'bulk' | 'cut' | 'maintain'>('maintain');
  const [weight, setWeight] = useState('');
  const [workoutHours, setWorkoutHours] = useState('');
  const [age, setAge] = useState('');
  const [hasDiabetes, setHasDiabetes] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const showOnboarding = !dismissed && !profile?.onboarding_complete;
  const targets = computeDailyTargets(profile);

  const todayTotals = todayLogs.reduce(
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

  function toggleAllergy(a: string) {
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  }

  async function saveOnboarding() {
    if (!user) {
      setError('Please sign in to save your profile.');
      return;
    }
    setError('');
    setSaving(true);

    const payload = {
      user_id: user.id,
      goal,
      current_weight_lbs: parseFloat(weight) || 0,
      weekly_workout_hours: parseFloat(workoutHours) || 0,
      age: parseInt(age) || 25,
      has_diabetes: hasDiabetes,
      allergies,
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };

    const { error: err } = await supabase
      .from('user_profiles')
      .upsert(payload, { onConflict: 'user_id' });

    setSaving(false);

    if (err) {
      setError(err.message);
    } else {
      await refreshProfile();
    }
  }

  const today = new Date();
  const calendarDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - 6 + i);
    return d;
  });

  return (
    <div className="dashboard">
      {showOnboarding && (
        <div className="onboarding-overlay">
          <div className="onboarding-card">
            <div className="onboarding-header">
              <div className="onboarding-step-dots">
                {[0, 1, 2].map(i => (
                  <span
                    key={i}
                    className={`onboarding-dot${i === onboardingStep ? ' onboarding-dot--active' : i < onboardingStep ? ' onboarding-dot--done' : ''}`}
                  />
                ))}
              </div>
              <button
                type="button"
                className="onboarding-skip"
                onClick={() => setDismissed(true)}
              >
                Skip for now
              </button>
            </div>

            {onboardingStep === 0 && (
              <div className="onboarding-step">
                <h2>What's your goal?</h2>
                <p>We'll personalize your daily nutrition targets.</p>
                <div className="onboarding-goals">
                  {GOALS.map(g => (
                    <button
                      type="button"
                      key={g.key}
                      className={`onboarding-goal-btn${goal === g.key ? ' onboarding-goal-btn--active' : ''}`}
                      style={goal === g.key ? { borderColor: g.color, background: g.color + '22' } : {}}
                      onClick={() => setGoal(g.key as 'bulk' | 'cut' | 'maintain')}
                    >
                      <strong style={goal === g.key ? { color: g.color } : {}}>{g.label}</strong>
                      <span>{g.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {onboardingStep === 1 && (
              <div className="onboarding-step">
                <h2>Tell us about you</h2>
                <p>Used to calculate your personalized targets.</p>
                <div className="onboarding-fields">
                  <div className="onboarding-field">
                    <label>Current weight (lbs)</label>
                    <input
                      type="number"
                      value={weight}
                      onChange={e => setWeight(e.target.value)}
                      placeholder="165"
                      min="60"
                      max="500"
                    />
                  </div>
                  <div className="onboarding-field">
                    <label>Weekly workout hours</label>
                    <input
                      type="number"
                      value={workoutHours}
                      onChange={e => setWorkoutHours(e.target.value)}
                      placeholder="5"
                      min="0"
                      max="40"
                    />
                  </div>
                  <div className="onboarding-field">
                    <label>Age</label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      placeholder="28"
                      min="13"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="onboarding-step">
                <h2>Any dietary considerations?</h2>
                <p>We'll factor these into your recommendations.</p>
                <label className="onboarding-checkbox">
                  <input
                    type="checkbox"
                    checked={hasDiabetes}
                    onChange={e => setHasDiabetes(e.target.checked)}
                  />
                  <span>I have diabetes (lower carb targets)</span>
                </label>
                <p className="onboarding-subhead">Allergies & Restrictions</p>
                <div className="onboarding-allergies">
                  {ALLERGIES.map(a => (
                    <button
                      type="button"
                      key={a}
                      className={`onboarding-allergy-btn${allergies.includes(a) ? ' onboarding-allergy-btn--active' : ''}`}
                      onClick={() => toggleAllergy(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                {error && <p className="onboarding-error">{error}</p>}
              </div>
            )}

            <div className="onboarding-footer">
              {onboardingStep > 0 && (
                <button
                  type="button"
                  className="onboarding-back"
                  onClick={() => setOnboardingStep(s => s - 1)}
                >
                  <ChevronLeft size={16} /> Back
                </button>
              )}
              {onboardingStep < 2 ? (
                <button
                  type="button"
                  className="onboarding-next"
                  onClick={() => setOnboardingStep(s => s + 1)}
                >
                  Next <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="onboarding-next"
                  onClick={saveOnboarding}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Get Started'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard__content">
        <div className="dashboard__top">
          <div className="dashboard__greeting">
            <h1>Today's Nutrition</h1>
            <p className="dashboard__date">
              {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="dashboard__mini-cal">
            {calendarDays.map((d, i) => {
              const isToday = d.toDateString() === today.toDateString();
              return (
                <div
                  key={i}
                  className={`mini-cal-day${isToday ? ' mini-cal-day--today' : ''}`}
                >
                  <span className="mini-cal-weekday">
                    {d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)}
                  </span>
                  <span className="mini-cal-num">{d.getDate()}</span>
                </div>
              );
            })}
          </div>
        </div>

        {profile ? (
          <div className="dashboard__goal-badge">
            <Target size={13} />
            Goal: <strong>{profile.goal.charAt(0).toUpperCase() + profile.goal.slice(1)}</strong>
            {profile.current_weight_lbs > 0 && <span> · {profile.current_weight_lbs} lbs</span>}
          </div>
        ) : (
          <div className="dashboard__goal-badge" style={{ cursor: 'pointer' }} onClick={() => setDismissed(false)}>
            <Flame size={13} />
            Set your goal to personalize nutrition targets
          </div>
        )}

        <div className="dashboard__bars">
          <p className="dashboard__bars-title">Daily Progress</p>
          <NutritionBar label="Calories" current={todayTotals.calories} target={targets.calories} unit="kcal" color="#f45c5c" />
          <NutritionBar label="Protein" current={todayTotals.protein_g} target={targets.protein_g} unit="g" color="#f47c3c" />
          <NutritionBar label="Carbohydrates" current={todayTotals.carbs_g} target={targets.carbs_g} unit="g" color="#f5c842" />
          <NutritionBar label="Fats" current={todayTotals.fat_g} target={targets.fat_g} unit="g" color="#4da3e8" />
          <NutritionBar label="Fiber" current={todayTotals.fiber_g} target={targets.fiber_g} unit="g" color="#3dba7e" />
          <NutritionBar label="Vitamin D" current={todayTotals.vitamin_d_mcg} target={targets.vitamin_d_mcg} unit="mcg" color="#f5e642" />
          <NutritionBar label="Magnesium" current={todayTotals.magnesium_mg} target={targets.magnesium_mg} unit="mg" color="#3dd4c8" />
          <NutritionBar label="Antioxidants" current={todayTotals.antioxidant_score} target={targets.antioxidant_score} unit="score" color="#f472b6" />
          <NutritionBar label="Omega-3" current={todayTotals.omega3_mg} target={targets.omega3_mg} unit="mg" color="#68d391" />
        </div>

        {todayLogs.length > 0 && (
          <div className="dashboard__today-foods">
            <h2>Logged Today</h2>
            <div className="today-foods-list">
              {todayLogs.map(log => (
                <div key={log.id} className="today-food-item">
                  <div className="today-food-item__info">
                    <span className="today-food-item__name">{log.food?.name}</span>
                    <span className="today-food-item__detail">
                      x{log.quantity} · {Math.round((log.food?.calories || 0) * log.quantity)} cal
                    </span>
                  </div>
                  <span className="today-food-item__time">{log.meal_time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {todayLogs.length === 0 && (
          <div className="dashboard__empty">
            <p>No foods logged today. Head to Food Browser to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
}
