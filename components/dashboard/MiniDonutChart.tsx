import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface DataItem {
  name: string;
  value: number;
  color: string;
  [key: string]: string | number;
}

interface MiniDonutChartProps {
  data: DataItem[];
  centerLabel?: string;
  centerValue?: string;
}

export const MiniDonutChart = ({ data, centerLabel, centerValue }: MiniDonutChartProps) => {
  return (
    <div className="relative w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload as DataItem;
                return (
                  <div className="bg-popover px-3 py-2 rounded-lg border border-border shadow-lg z-50">
                    <p className="text-sm font-medium text-foreground">{data.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {data.value.toLocaleString()} IP ({((data.value / getTotalValue()) * 100).toFixed(1)}%)
                    </p>
                  </div>
                );
              }
              return null;
            }}
            wrapperStyle={{ zIndex: 1000 }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Label */}
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
          {centerValue && (
            <span className="text-2xl font-display font-bold text-foreground">{centerValue}</span>
          )}
          {centerLabel && (
            <span className="text-xs text-muted-foreground">{centerLabel}</span>
          )}
        </div>
      )}
    </div>
  );

  function getTotalValue() {
    return data.reduce((sum, item) => sum + item.value, 0);
  }
};
