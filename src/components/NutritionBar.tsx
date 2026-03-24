interface NutritionBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  addAmount?: number;
  preview?: number;
  color?: string;
}

export default function NutritionBar({
  label,
  current,
  target,
  unit = '',
  addAmount = 0,
  preview = 0,
  color = '#3dba7e',
}: NutritionBarProps) {
  const effectiveAdd = addAmount || preview;
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const addPct = target > 0
    ? Math.min(((current + effectiveAdd) / target) * 100, 100) - pct
    : 0;
  const isOver = current + effectiveAdd > target;

  return (
    <div className="nutrition-bar">
      <div className="nutrition-bar__header">
        <span className="nutrition-bar__label">{label}</span>
        <span className="nutrition-bar__values">
          {Math.round(current)}
          {effectiveAdd > 0 ? (
            <span className={`nutrition-bar__add${isOver ? ' nutrition-bar__add--over' : ''}`}>
              {' '}+{Math.round(effectiveAdd)}
            </span>
          ) : null}
          {' '}/ {Math.round(target)}{unit ? ` ${unit}` : ''}
        </span>
      </div>
      <div className="nutrition-bar__track">
        <div
          className="nutrition-bar__fill"
          style={{ width: `${pct}%`, background: color }}
        />
        {effectiveAdd > 0 && (
          <div
            className="nutrition-bar__preview"
            style={{
              left: `${pct}%`,
              width: `${Math.max(addPct, 0)}%`,
              background: isOver ? '#f45c5c' : color,
            }}
          />
        )}
      </div>
    </div>
  );
}
