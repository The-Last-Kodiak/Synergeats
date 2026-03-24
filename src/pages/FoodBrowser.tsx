import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { type Food, type CartItem } from '../types';
import { FOOD_GROUP_LABELS, FOOD_GROUP_COLORS, computeDailyTargets } from '../lib/nutrition';
import NutritionBar from '../components/NutritionBar';
import { Search, SlidersHorizontal, X, ShoppingCart, Trash2, Check } from 'lucide-react';

const GROUPS = ['all', 'protein', 'dairy', 'grain', 'vegetable', 'fruit', 'fat', 'beverage', 'other'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'calories', label: 'Calories' },
  { value: 'protein_g', label: 'Protein' },
  { value: 'efficiency_score', label: 'Efficiency' },
  { value: 'price_usd', label: 'Price' },
  { value: 'dish_rating', label: 'Rating' },
];

const ZERO_TOTALS = {
  calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0,
  vitamin_d_mcg: 0, magnesium_mg: 0, antioxidant_score: 0, omega3_mg: 0,
};

const BAR_DEFS = [
  { key: 'calories' as const, label: 'Calories', color: '#f45c5c', unit: 'kcal' },
  { key: 'protein_g' as const, label: 'Protein', color: '#f47c3c', unit: 'g' },
  { key: 'carbs_g' as const, label: 'Carbs', color: '#f5c842', unit: 'g' },
  { key: 'fat_g' as const, label: 'Fat', color: '#4da3e8', unit: 'g' },
  { key: 'fiber_g' as const, label: 'Fiber', color: '#3dba7e', unit: 'g' },
  { key: 'vitamin_d_mcg' as const, label: 'Vit D', color: '#f5e642', unit: 'mcg' },
  { key: 'magnesium_mg' as const, label: 'Magnesium', color: '#3dd4c8', unit: 'mg' },
  { key: 'antioxidant_score' as const, label: 'Antioxidants', color: '#f472b6', unit: '' },
  { key: 'omega3_mg' as const, label: 'Omega-3', color: '#68d391', unit: 'mg' },
];

function sumCart(items: CartItem[]) {
  return items.reduce((acc, { food, quantity }) => ({
    calories: acc.calories + food.calories * quantity,
    protein_g: acc.protein_g + food.protein_g * quantity,
    carbs_g: acc.carbs_g + food.carbs_g * quantity,
    fat_g: acc.fat_g + food.fat_g * quantity,
    fiber_g: acc.fiber_g + food.fiber_g * quantity,
    vitamin_d_mcg: acc.vitamin_d_mcg + food.vitamin_d_mcg * quantity,
    magnesium_mg: acc.magnesium_mg + food.magnesium_mg * quantity,
    antioxidant_score: acc.antioxidant_score + food.antioxidant_score * quantity,
    omega3_mg: acc.omega3_mg + food.omega3_mg * quantity,
  }), { ...ZERO_TOTALS });
}

export default function FoodBrowser() {
  const { user, profile, todayLogs, refreshTodayLogs, refreshMealPlans } = useApp();
  const navigate = useNavigate();

  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner' | 'any'>('any');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [addedOk, setAddedOk] = useState(false);

  const targets = computeDailyTargets(profile);
  const todayTotals = sumCart(
    todayLogs.filter(l => l.food).map(l => ({ food: l.food!, quantity: l.quantity, meal_time: l.meal_time }))
  );
  const cartTotals = sumCart(cart);

  const fetchFoods = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('foods').select('*');
    if (group !== 'all') query = query.eq('food_group', group);
    if (search) query = query.ilike('name', `%${search}%`);
    query = query.order(sortBy, { ascending: sortDir === 'asc' });
    const { data } = await query;
    setFoods(data || []);
    setLoading(false);
  }, [group, search, sortBy, sortDir]);

  useEffect(() => {
    const t = setTimeout(fetchFoods, 300);
    return () => clearTimeout(t);
  }, [fetchFoods]);

  function setQty(food: Food, qty: number) {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.food.id !== food.id));
    } else {
      setCart(prev => {
        const existing = prev.find(c => c.food.id === food.id);
        if (existing) return prev.map(c => c.food.id === food.id ? { ...c, quantity: qty } : c);
        return [...prev, { food, quantity: qty, meal_time: mealTime }];
      });
    }
  }

  function getQty(foodId: string) {
    return cart.find(c => c.food.id === foodId)?.quantity ?? 0;
  }

  async function handleAddToToday() {
    if (!user || cart.length === 0) return;
    setSubmitting(true);
    const today = new Date().toISOString().split('T')[0];

    for (const item of cart) {
      await supabase.from('daily_logs').upsert(
        { user_id: user.id, log_date: today, food_id: item.food.id, meal_time: item.meal_time, quantity: item.quantity },
        { onConflict: 'user_id,log_date,food_id,meal_time' }
      );
    }

    let { data: todayPlan } = await supabase
      .from('meal_plans')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_today_plan', true)
      .maybeSingle();

    if (!todayPlan) {
      const { data: newPlan } = await supabase
        .from('meal_plans')
        .insert({ user_id: user.id, name: "Today's Plan", is_today_plan: true, today_plan_date: today })
        .select('id')
        .single();
      todayPlan = newPlan;
    }

    if (todayPlan) {
      for (const item of cart) {
        await supabase.from('meal_plan_items').upsert(
          { meal_plan_id: todayPlan.id, food_id: item.food.id, quantity: item.quantity, meal_time: item.meal_time },
          { onConflict: 'meal_plan_id,food_id,meal_time' }
        );
      }
    }

    await refreshTodayLogs();
    await refreshMealPlans();
    setSubmitting(false);
    setAddedOk(true);
    setTimeout(() => {
      setAddedOk(false);
      setCart([]);
      navigate('/today');
    }, 1000);
  }

  return (
    <div className="food-browser-layout">
      <div className="food-browser-main food-browser">
        <div className="food-browser__header">
          <h1>Food Browser</h1>

          <div className="food-browser__controls">
            <div className="food-browser__search">
              <Search size={16} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search foods..."
              />
              {search && <button type="button" onClick={() => setSearch('')}><X size={14} /></button>}
            </div>
            <button
              type="button"
              className={`food-browser__filter-btn ${showFilters ? 'food-browser__filter-btn--active' : ''}`}
              onClick={() => setShowFilters(s => !s)}
            >
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          {showFilters && (
            <div className="food-browser__filters">
              <div className="food-browser__filter-row">
                <label>Sort by</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <button
                  type="button"
                  className="sort-dir-btn"
                  onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')}
                >
                  {sortDir === 'asc' ? '↑ Asc' : '↓ Desc'}
                </button>
              </div>
              <div className="food-browser__filter-row">
                <label>Log as</label>
                <select value={mealTime} onChange={e => setMealTime(e.target.value as typeof mealTime)}>
                  <option value="any">Any</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                </select>
              </div>
            </div>
          )}

          <div className="food-browser__groups">
            {GROUPS.map(g => (
              <button
                type="button"
                key={g}
                className={`group-pill ${group === g ? 'group-pill--active' : ''}`}
                style={group === g && g !== 'all' ? {
                  background: FOOD_GROUP_COLORS[g],
                  color: '#fff',
                  borderColor: FOOD_GROUP_COLORS[g],
                } : {}}
                onClick={() => setGroup(g)}
              >
                {g === 'all' ? 'All' : FOOD_GROUP_LABELS[g]}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="food-browser__loading">
            <div className="spinner" />
            <span>Loading foods...</span>
          </div>
        ) : foods.length === 0 ? (
          <div className="food-browser__empty">
            <p>No foods found. Try a different search or category.</p>
          </div>
        ) : (
          <div className="food-browser__grid">
            {foods.map(food => {
              const qty = getQty(food.id);
              const groupColor = FOOD_GROUP_COLORS[food.food_group] || '#a0aec0';
              return (
                <div key={food.id} className="food-card">
                  <div className="food-card__image-wrap">
                    {food.image_url ? (
                      <img src={food.image_url} alt={food.name} className="food-card__image" />
                    ) : (
                      <div className="food-card__image-placeholder" style={{ background: groupColor + '33' }}>
                        <span style={{ fontSize: 28, color: groupColor }}>🌿</span>
                      </div>
                    )}
                    <span className="food-card__group-badge" style={{ background: groupColor }}>
                      {food.food_group}
                    </span>
                    {food.probiotics && (
                      <span className="food-card__probiotic-badge" title="Contains probiotics">🦠</span>
                    )}
                  </div>

                  <div className="food-card__body">
                    <div className="food-card__title-row">
                      <h3 className="food-card__name">{food.name}</h3>
                      <div className="food-card__rating">
                        <span style={{ color: '#f5c842', fontSize: 12 }}>★</span>
                        <span>{food.dish_rating.toFixed(1)}</span>
                      </div>
                    </div>

                    {food.brand && <p className="food-card__brand">{food.brand}</p>}

                    <div className="food-card__macros">
                      <span className="food-card__macro food-card__macro--cal">{Math.round(food.calories)} cal</span>
                      <span className="food-card__macro food-card__macro--protein">{Math.round(food.protein_g)}g P</span>
                      <span className="food-card__macro food-card__macro--carbs">{Math.round(food.carbs_g)}g C</span>
                      <span className="food-card__macro food-card__macro--fat">{Math.round(food.fat_g)}g F</span>
                    </div>

                    <div className="food-card__meta">
                      <span className="food-card__meta-item">${food.price_usd.toFixed(2)}</span>
                      {food.available_grocery && (
                        <span className="food-card__meta-item food-card__meta-item--green">Grocery</span>
                      )}
                      {food.available_delivery && (
                        <span className="food-card__meta-item food-card__meta-item--blue">Delivery</span>
                      )}
                    </div>

                    <div className="food-card__qty-row">
                      {qty > 0 ? (
                        <>
                          <button type="button" className="food-card__qty-btn" onClick={() => setQty(food, qty - 1)}>-</button>
                          <span className="food-card__qty-val">{qty}</span>
                          <button type="button" className="food-card__qty-btn" onClick={() => setQty(food, qty + 1)}>+</button>
                          <div className="food-card__in-cart" title="In cart">
                            <ShoppingCart size={13} color="#fff" />
                          </div>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="food-card__add-btn"
                          style={{ flex: 1 }}
                          onClick={() => setQty(food, 1)}
                        >
                          + Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="food-browser-panel">
        <div className="food-browser-panel__header">
          <span className="food-browser-panel__title">Nutrition Preview</span>
          <span className="food-browser-panel__count">{cart.length} items</span>
        </div>

        <div className="food-browser-panel__bars">
          {BAR_DEFS.map(({ key, label, color, unit }) => (
            <NutritionBar
              key={key}
              label={label}
              current={todayTotals[key]}
              target={targets[key]}
              preview={cartTotals[key]}
              unit={unit}
              color={color}
            />
          ))}
        </div>

        {cart.length > 0 && (
          <div className="food-browser-panel__cart">
            {cart.map(item => (
              <div key={item.food.id} className="cart-item">
                <span className="cart-item__name">{item.food.name}</span>
                <button type="button" className="cart-item__qty-btn" onClick={() => setQty(item.food, item.quantity - 1)}>-</button>
                <span className="cart-item__qty">{item.quantity}</span>
                <button type="button" className="cart-item__qty-btn" onClick={() => setQty(item.food, item.quantity + 1)}>+</button>
                <button type="button" className="cart-item__remove" onClick={() => setQty(item.food, 0)}>
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="food-browser-panel__actions">
          <button
            type="button"
            className="add-to-today-btn"
            onClick={handleAddToToday}
            disabled={cart.length === 0 || submitting || addedOk || !user}
          >
            {addedOk ? (
              <><Check size={14} /> Added!</>
            ) : submitting ? 'Adding...' : !user ? 'Sign in to log' : (
              <><ShoppingCart size={14} /> Add to Today's Plan</>
            )}
          </button>
          {cart.length > 0 && (
            <button type="button" className="clear-cart-btn" onClick={() => setCart([])}>
              Clear cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
