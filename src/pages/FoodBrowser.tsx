import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';
import { type Food } from '../types';
import FoodCard from '../components/FoodCard';
import { FOOD_GROUP_LABELS, FOOD_GROUP_COLORS } from '../lib/nutrition';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const GROUPS = ['all', 'protein', 'dairy', 'grain', 'vegetable', 'fruit', 'fat', 'beverage', 'other'];
const SORT_OPTIONS = [
  { value: 'name', label: 'Name' },
  { value: 'calories', label: 'Calories' },
  { value: 'protein_g', label: 'Protein' },
  { value: 'efficiency_score', label: 'Efficiency' },
  { value: 'price_usd', label: 'Price' },
  { value: 'dish_rating', label: 'Rating' },
];

export default function FoodBrowser() {
  const { user, refreshTodayLogs } = useApp();
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [mealTime, setMealTime] = useState<'breakfast' | 'lunch' | 'dinner' | 'any'>('any');
  const [adding, setAdding] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

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

  async function handleAddToday(food: Food) {
    if (!user) return;
    setAdding(food.id);
    const today = new Date().toISOString().split('T')[0];
    await supabase.from('daily_logs').upsert(
      { user_id: user.id, log_date: today, food_id: food.id, meal_time: mealTime, quantity: 1 },
      { onConflict: 'user_id,log_date,food_id,meal_time' }
    );
    await refreshTodayLogs();
    setAddedId(food.id);
    setAdding(null);
    setTimeout(() => setAddedId(null), 2000);
  }

  return (
    <div className="food-browser">
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
            {search && <button onClick={() => setSearch('')}><X size={14} /></button>}
          </div>

          <button
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
          {foods.map(food => (
            <FoodCard
              key={food.id}
              food={food}
              onAdd={user ? handleAddToday : undefined}
              addLabel={
                adding === food.id ? 'Adding...' :
                addedId === food.id ? 'Added!' :
                'Add to Today'
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
