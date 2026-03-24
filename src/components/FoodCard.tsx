import { Star, ShoppingCart, Truck, Leaf, Zap } from 'lucide-react';
import { type Food } from '../types';
import { FOOD_GROUP_COLORS } from '../lib/nutrition';

interface FoodCardProps {
  food: Food;
  onAdd?: (food: Food) => void;
  addLabel?: string;
}

export default function FoodCard({ food, onAdd, addLabel = 'Add to Today' }: FoodCardProps) {
  const groupColor = FOOD_GROUP_COLORS[food.food_group] || '#a0aec0';

  return (
    <div className="food-card">
      <div className="food-card__image-wrap">
        {food.image_url ? (
          <img src={food.image_url} alt={food.name} className="food-card__image" />
        ) : (
          <div className="food-card__image-placeholder" style={{ background: groupColor + '33' }}>
            <Leaf size={32} style={{ color: groupColor }} />
          </div>
        )}
        <span className="food-card__group-badge" style={{ background: groupColor }}>
          {food.food_group}
        </span>
        {food.probiotics && (
          <span className="food-card__probiotic-badge" title="Contains probiotics">
            🦠
          </span>
        )}
      </div>

      <div className="food-card__body">
        <div className="food-card__title-row">
          <h3 className="food-card__name">{food.name}</h3>
          <div className="food-card__rating">
            <Star size={12} fill="#ecc94b" stroke="#ecc94b" />
            <span>{food.dish_rating.toFixed(1)}</span>
          </div>
        </div>

        {food.brand && <p className="food-card__brand">{food.brand}</p>}

        <div className="food-card__macros">
          <span className="food-card__macro food-card__macro--cal">{Math.round(food.calories)} cal</span>
          <span className="food-card__macro food-card__macro--protein">{Math.round(food.protein_g)}g protein</span>
          <span className="food-card__macro food-card__macro--carbs">{Math.round(food.carbs_g)}g carbs</span>
          <span className="food-card__macro food-card__macro--fat">{Math.round(food.fat_g)}g fat</span>
        </div>

        <div className="food-card__meta">
          <span className="food-card__meta-item">
            <Zap size={11} />
            {food.efficiency_score.toFixed(1)} eff.
          </span>
          <span className="food-card__meta-item">
            ${food.price_usd.toFixed(2)}/{food.serving_size}
          </span>
          {food.available_grocery && (
            <span className="food-card__meta-item food-card__meta-item--green">
              <ShoppingCart size={11} /> Grocery
            </span>
          )}
          {food.available_delivery && (
            <span className="food-card__meta-item food-card__meta-item--blue">
              <Truck size={11} /> Delivery
            </span>
          )}
        </div>

        {food.ai_health_notes && (
          <p className="food-card__notes">{food.ai_health_notes}</p>
        )}

        {onAdd && (
          <button className="food-card__add-btn" onClick={() => onAdd(food)}>
            {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
