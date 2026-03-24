
interface NutritionBarProps {
  label: string;
  current: number;
  target: number;
  unit: string;
  addAmount?: number;
  color?: string;
}

export default function NutritionBar({
  label,
  current,
  target,
  unit,
  addAmount = 0,
  color = '#48bb78',
}: NutritionBarProps) {
  const pct = Math.min((current / target) * 100, 100);
  const addPct = Math.min(((current + addAmount) / target) * 100, 100) - pct;
  const isOver = current + addAmount > target;

  return (
    <div className="nutrition-bar">
      <div className="nutrition-bar__header">
        <span className="nutrition-bar__label">{label}</span>
        <span className="nutrition-bar__values">
          {Math.round(current)}{addAmount > 0 ? <span className="nutrition-bar__add"> +{Math.round(addAmount)}</span> : null} / {Math.round(target)} {unit}
        </span>
      </div>
      <div className="nutrition-bar__track">
        <div
          className="nutrition-bar__fill"
          style={{ width: `${pct}%`, background: color }}
        />
        {addAmount > 0 && (
          <div
            className="nutrition-bar__preview"
            style={{
              left: `${pct}%`,
              width: `${Math.max(addPct, 0)}%`,
              background: isOver ? '#fc8181' : '#68d391',
            }}
          />
        )}
      </div>
    </div>
  );
}
