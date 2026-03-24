import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { type MealPlan, type MealPlanItem, type Food } from '../types';
import { Plus, Trash2, ChevronRight, ArrowLeft, Sunrise, Sun, Moon } from 'lucide-react';

const DAYS = [
  { key: 'days_monday', label: 'M' },
  { key: 'days_tuesday', label: 'T' },
  { key: 'days_wednesday', label: 'W' },
  { key: 'days_thursday', label: 'Th' },
  { key: 'days_friday', label: 'F' },
  { key: 'days_saturday', label: 'Sa' },
  { key: 'days_sunday', label: 'Su' },
];

export default function MealPlanner() {
  const { user, mealPlans, refreshMealPlans } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<MealPlan | null>(null);
  const [editingName, setEditingName] = useState('');
  const [showFoodSearch, setShowFoodSearch] = useState(false);
  const [foodSearch, setFoodSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Food[]>([]);
  const [addMealTime, setAddMealTime] = useState<'breakfast' | 'lunch' | 'dinner' | 'any'>('any');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (selectedPlan) {
      const updated = mealPlans.find(p => p.id === selectedPlan.id);
      if (updated) setSelectedPlan(updated);
    }
  }, [mealPlans]);

  async function createPlan() {
    if (!user || mealPlans.length >= 7) return;
    setSaving(true);
    const { data } = await supabase
      .from('meal_plans')
      .insert({ user_id: user.id, name: `Plan ${mealPlans.length + 1}` })
      .select()
      .single();
    await refreshMealPlans();
    if (data) setSelectedPlan(data);
    setSaving(false);
  }

  async function deletePlan(id: string) {
    await supabase.from('meal_plans').delete().eq('id', id);
    await refreshMealPlans();
    if (selectedPlan?.id === id) setSelectedPlan(null);
  }

  async function updatePlanName(plan: MealPlan, name: string) {
    await supabase.from('meal_plans').update({ name, updated_at: new Date().toISOString() }).eq('id', plan.id);
    await refreshMealPlans();
  }

  async function toggleDay(plan: MealPlan, dayKey: string) {
    const val = !(plan as any)[dayKey];
    await supabase.from('meal_plans').update({ [dayKey]: val }).eq('id', plan.id);
    await refreshMealPlans();
  }

  async function searchFoods(q: string) {
    setFoodSearch(q);
    if (!q.trim()) { setSearchResults([]); return; }
    const { data } = await supabase.from('foods').select('*').ilike('name', `%${q}%`).limit(10);
    setSearchResults(data || []);
  }

  async function addItemToPlan(food: Food) {
    if (!selectedPlan) return;
    await supabase.from('meal_plan_items').insert({
      meal_plan_id: selectedPlan.id,
      food_id: food.id,
      quantity: 1,
      meal_time: addMealTime,
    });
    await refreshMealPlans();
    setShowFoodSearch(false);
    setFoodSearch('');
    setSearchResults([]);
  }

  async function updateItemQuantity(item: MealPlanItem, delta: number) {
    const newQty = Math.max(1, item.quantity + delta);
    await supabase.from('meal_plan_items').update({ quantity: newQty }).eq('id', item.id);
    await refreshMealPlans();
  }

  async function removeItem(itemId: string) {
    await supabase.from('meal_plan_items').delete().eq('id', itemId);
    await refreshMealPlans();
  }

  async function setItemMealTime(item: MealPlanItem, mt: 'breakfast' | 'lunch' | 'dinner' | 'any') {
    await supabase.from('meal_plan_items').update({ meal_time: mt }).eq('id', item.id);
    await refreshMealPlans();
  }

  if (selectedPlan) {
    const items = selectedPlan.items || [];
    const breakfastItems = items.filter(i => i.meal_time === 'breakfast');
    const lunchItems = items.filter(i => i.meal_time === 'lunch');
    const dinnerItems = items.filter(i => i.meal_time === 'dinner');
    const anyItems = items.filter(i => i.meal_time === 'any');

    return (
      <div className="meal-planner">
        <div className="meal-planner__plan-header">
          <button className="back-btn" onClick={() => setSelectedPlan(null)}>
            <ArrowLeft size={18} /> Plans
          </button>

          <div className="plan-name-edit">
            <input
              value={editingName || selectedPlan.name}
              onChange={e => setEditingName(e.target.value)}
              onBlur={() => {
                if (editingName && editingName !== selectedPlan.name) updatePlanName(selectedPlan, editingName);
              }}
              className="plan-name-input"
            />
          </div>

          <div className="plan-days">
            {DAYS.map(d => (
              <button
                key={d.key}
                className={`day-toggle ${(selectedPlan as any)[d.key] ? 'day-toggle--active' : ''}`}
                onClick={() => toggleDay(selectedPlan, d.key)}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        <div className="meal-planner__plan-body">
          {[
            { key: 'breakfast', label: 'Breakfast', icon: <Sunrise size={16} />, items: breakfastItems },
            { key: 'lunch', label: 'Lunch', icon: <Sun size={16} />, items: lunchItems },
            { key: 'dinner', label: 'Dinner', icon: <Moon size={16} />, items: dinnerItems },
            { key: 'any', label: 'Any Time', icon: null, items: anyItems },
          ].map(section => (
            <div key={section.key} className="plan-section">
              <div className="plan-section__header">
                {section.icon}
                <h3>{section.label}</h3>
                <span className="plan-section__count">{section.items.length}</span>
              </div>
              {section.items.length === 0 && (
                <p className="plan-section__empty">No items yet</p>
              )}
              {section.items.map(item => (
                <div key={item.id} className="plan-item">
                  <div className="plan-item__info">
                    <span className="plan-item__name">{item.food?.name}</span>
                    <span className="plan-item__cal">{Math.round((item.food?.calories || 0) * item.quantity)} cal</span>
                  </div>
                  <div className="plan-item__controls">
                    <button className="qty-btn" onClick={() => updateItemQuantity(item, -1)}>-</button>
                    <span className="qty-val">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateItemQuantity(item, 1)}>+</button>
                    <div className="meal-time-icons">
                      <button
                        className={`mt-icon-btn ${item.meal_time === 'breakfast' ? 'mt-icon-btn--active' : ''}`}
                        onClick={() => setItemMealTime(item, 'breakfast')}
                        title="Breakfast"
                      >
                        <Sunrise size={14} />
                      </button>
                      <button
                        className={`mt-icon-btn ${item.meal_time === 'lunch' ? 'mt-icon-btn--active' : ''}`}
                        onClick={() => setItemMealTime(item, 'lunch')}
                        title="Lunch"
                      >
                        <Sun size={14} />
                      </button>
                      <button
                        className={`mt-icon-btn ${item.meal_time === 'dinner' ? 'mt-icon-btn--active' : ''}`}
                        onClick={() => setItemMealTime(item, 'dinner')}
                        title="Dinner"
                      >
                        <Moon size={14} />
                      </button>
                    </div>
                    <button className="plan-item__delete" onClick={() => removeItem(item.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="meal-planner__add-section">
          {showFoodSearch ? (
            <div className="food-search-panel">
              <div className="food-search-panel__header">
                <input
                  autoFocus
                  type="text"
                  value={foodSearch}
                  onChange={e => searchFoods(e.target.value)}
                  placeholder="Search for a food..."
                />
                <select
                  value={addMealTime}
                  onChange={e => setAddMealTime(e.target.value as typeof addMealTime)}
                >
                  <option value="any">Any</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
                <button onClick={() => { setShowFoodSearch(false); setFoodSearch(''); setSearchResults([]); }}>
                  Cancel
                </button>
              </div>
              <div className="food-search-results">
                {searchResults.map(f => (
                  <button key={f.id} className="food-search-result" onClick={() => addItemToPlan(f)}>
                    <span className="food-search-result__name">{f.name}</span>
                    <span className="food-search-result__cal">{f.calories} cal</span>
                  </button>
                ))}
                {foodSearch && searchResults.length === 0 && (
                  <p className="food-search-empty">No results found</p>
                )}
              </div>
            </div>
          ) : (
            <button className="add-item-btn" onClick={() => setShowFoodSearch(true)}>
              <Plus size={16} /> Add Food Item
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="meal-planner">
      <div className="meal-planner__header">
        <h1>Meal Planner</h1>
        <p>Create up to 7 weekly meal plans</p>
      </div>

      <div className="meal-planner__plans-grid">
        {mealPlans.map(plan => (
          <div key={plan.id} className="plan-card">
            <button className="plan-card__body" onClick={() => { setSelectedPlan(plan); setEditingName(plan.name); }}>
              <h3>{plan.name}</h3>
              <div className="plan-card__days">
                {DAYS.map(d => (
                  <span
                    key={d.key}
                    className={`plan-card__day ${(plan as any)[d.key] ? 'plan-card__day--active' : ''}`}
                  >
                    {d.label}
                  </span>
                ))}
              </div>
              <p className="plan-card__count">{(plan.items || []).length} items</p>
              <ChevronRight size={16} className="plan-card__arrow" />
            </button>
            <button className="plan-card__delete" onClick={() => deletePlan(plan.id)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}

        {mealPlans.length < 7 && (
          <button className="plan-card plan-card--new" onClick={createPlan} disabled={saving}>
            <Plus size={24} />
            <span>{saving ? 'Creating...' : 'New Plan'}</span>
          </button>
        )}
      </div>

      {mealPlans.length === 0 && !saving && (
        <div className="meal-planner__empty">
          <p>No meal plans yet. Create your first plan to get started!</p>
        </div>
      )}
    </div>
  );
}
