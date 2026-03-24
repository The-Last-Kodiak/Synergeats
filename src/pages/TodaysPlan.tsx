import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { type MealPlan, type MealPlanItem } from '../types';
import { FOOD_GROUP_COLORS } from '../lib/nutrition';
import { Sunrise, Sun, Moon, Trash2, Plus, CalendarCheck, ShoppingCart } from 'lucide-react';

const MEAL_SECTIONS = [
  { key: 'breakfast', label: 'Breakfast', icon: <Sunrise size={15} /> },
  { key: 'lunch', label: 'Lunch', icon: <Sun size={15} /> },
  { key: 'dinner', label: 'Dinner', icon: <Moon size={15} /> },
  { key: 'any', label: 'Any Time', icon: null },
] as const;

export default function TodaysPlan() {
  const { user, mealPlans, refreshMealPlans } = useApp();
  const navigate = useNavigate();
  const [todayPlan, setTodayPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = mealPlans.find(p => p.is_today_plan);
    setTodayPlan(found || null);
    setLoading(false);
  }, [mealPlans]);

  async function removeItem(itemId: string) {
    await supabase.from('meal_plan_items').delete().eq('id', itemId);
    await refreshMealPlans();
  }

  async function updateQty(item: MealPlanItem, delta: number) {
    const newQty = Math.max(1, item.quantity + delta);
    await supabase.from('meal_plan_items').update({ quantity: newQty }).eq('id', item.id);
    await refreshMealPlans();
  }

  async function setMealTime(item: MealPlanItem, mt: 'breakfast' | 'lunch' | 'dinner' | 'any') {
    await supabase.from('meal_plan_items').update({ meal_time: mt }).eq('id', item.id);
    await refreshMealPlans();
  }

  if (!user) {
    return (
      <div className="todays-plan todays-plan--empty">
        <CalendarCheck size={48} />
        <h2>Sign in to view Today's Plan</h2>
        <p>Your daily cart resets every 24 hours.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="todays-plan todays-plan--loading">
        <div className="spinner" />
      </div>
    );
  }

  const items = todayPlan?.items || [];

  if (!todayPlan || items.length === 0) {
    return (
      <div className="todays-plan todays-plan--empty">
        <CalendarCheck size={48} />
        <h2>Today's Plan is empty</h2>
        <p>Add items from the Food Browser to build your day's plan.</p>
        <button type="button" className="add-to-today-btn" onClick={() => navigate('/food')}>
          <Plus size={14} /> Browse Foods
        </button>
      </div>
    );
  }

  const totalCal = items.reduce((sum, i) => sum + (i.food?.calories || 0) * i.quantity, 0);
  const totalProtein = items.reduce((sum, i) => sum + (i.food?.protein_g || 0) * i.quantity, 0);

  return (
    <div className="todays-plan">
      <div className="todays-plan__header">
        <div>
          <div className="plan-card__today-badge"><CalendarCheck size={12} /> Today</div>
          <h1>Today's Plan</h1>
          <p>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="todays-plan__summary">
          <span className="todays-plan__stat"><strong>{Math.round(totalCal)}</strong> cal</span>
          <span className="todays-plan__stat"><strong>{Math.round(totalProtein)}g</strong> protein</span>
          <span className="todays-plan__stat"><strong>{items.length}</strong> items</span>
        </div>
      </div>

      {MEAL_SECTIONS.map(({ key, label, icon }) => {
        const sectionItems = items.filter(i => i.meal_time === key);
        if (sectionItems.length === 0) return null;
        return (
          <div key={key} className="plan-section">
            <div className="plan-section__header">
              {icon}
              <h3>{label}</h3>
              <span className="plan-section__count">{sectionItems.length}</span>
            </div>
            {sectionItems.map(item => {
              const groupColor = FOOD_GROUP_COLORS[item.food?.food_group || 'other'] || '#a0aec0';
              return (
                <div key={item.id} className="plan-item">
                  <div className="plan-item__color-bar" style={{ background: groupColor }} />
                  <div className="plan-item__info">
                    <span className="plan-item__name">{item.food?.name}</span>
                    <span className="plan-item__cal">{Math.round((item.food?.calories || 0) * item.quantity)} cal</span>
                  </div>
                  <div className="plan-item__controls">
                    <button type="button" className="qty-btn" onClick={() => updateQty(item, -1)}>-</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button type="button" className="qty-btn" onClick={() => updateQty(item, 1)}>+</button>
                    <div className="meal-time-icons">
                      <button type="button" className={`mt-icon-btn${item.meal_time === 'breakfast' ? ' mt-icon-btn--active' : ''}`} onClick={() => setMealTime(item, 'breakfast')} title="Breakfast"><Sunrise size={13} /></button>
                      <button type="button" className={`mt-icon-btn${item.meal_time === 'lunch' ? ' mt-icon-btn--active' : ''}`} onClick={() => setMealTime(item, 'lunch')} title="Lunch"><Sun size={13} /></button>
                      <button type="button" className={`mt-icon-btn${item.meal_time === 'dinner' ? ' mt-icon-btn--active' : ''}`} onClick={() => setMealTime(item, 'dinner')} title="Dinner"><Moon size={13} /></button>
                    </div>
                    <button type="button" className="plan-item__delete" onClick={() => removeItem(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="todays-plan__actions">
        <button type="button" className="add-to-today-btn" onClick={() => navigate('/food')}>
          <Plus size={14} /> Add More Foods
        </button>
        <button type="button" className="add-to-today-btn" style={{ background: 'linear-gradient(135deg, #f47c3c, #f5c842)' }} onClick={() => navigate('/planner')}>
          <ShoppingCart size={14} /> View Meal Plans
        </button>
      </div>
    </div>
  );
}
