import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { useTheme } from 'next-themes';

interface ChartDataPoint {
  role: string;
  [seniority: string]: number | string;
}

interface RoleSeniorityChartProps {
  data: ChartDataPoint[];
  onFilterChange: (role: string | null, seniority: string | null) => void;
  selectedRole: string | null;
  selectedSeniority: string | null;
}

const seniorityColors: { [key: string]: string } = {
  'Junior':        '#fca5a5',
  'Semi-Senior':   '#fde047',
  'Senior':        '#86efac',
  'Lead':          '#93c5fd',
  'Architect':     '#c084fc',
  'Manager':       '#fbbf24',
  'No Especificado':'#e5e7eb',
  'Otro':          '#67e8f9',
};

const getColor = (seniorityKey: string): string => {
  return seniorityColors[seniorityKey] || seniorityColors['Otro'];
};

const getSeniorityKeys = (data: ChartDataPoint[]): string[] => {
  if (data.length === 0) return [];
  const keys = new Set<string>();
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'role') {
        keys.add(key);
      }
    });
  });
  const order = ['Junior', 'Semi-Senior', 'Senior', 'Lead', 'Architect', 'Manager', 'Otro', 'No Especificado'];
  return Array.from(keys).sort((a, b) => order.indexOf(a) - order.indexOf(b));
};

const RoleSeniorityChart: React.FC<RoleSeniorityChartProps> = ({ data, onFilterChange, selectedRole, selectedSeniority }) => {
  const { theme } = useTheme();
  const tickColor = theme === 'dark' ? '#a1a1aa' : '#374151';

  if (!data || data.length === 0) {
    return <p className="text-center text-muted-foreground py-4">No hay datos de roles para mostrar.</p>;
  }

  const seniorityKeys = getSeniorityKeys(data);

  const handleBarClick = (role: string, seniorityKey: string) => {
    onFilterChange(role, seniorityKey);
  };

  const handleLegendClick = (dataKey: string) => {
    if (selectedSeniority === dataKey && !selectedRole) {
        onFilterChange(null, null); 
    } else {
        onFilterChange(null, dataKey); 
    }
  };

  return (
    <ResponsiveContainer width="100%" height={data.length * 50 + 40}>
      <BarChart 
        data={data} 
        layout="vertical"
        margin={{ top: 5, right: 20, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={tickColor} strokeOpacity={0.2} />
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: tickColor }} axisLine={{ stroke: tickColor, strokeOpacity: 0.5 }} tickLine={{ stroke: tickColor, strokeOpacity: 0.5 }} />
        <YAxis 
          type="category" 
          dataKey="role" 
          width={150}
          tick={{ fontSize: 12, fill: tickColor, width: 140 }}
          axisLine={false}
          tickLine={false}
          interval={0}
        />
        <Tooltip 
          cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
          contentStyle={{ 
            backgroundColor: theme === 'dark' ? 'hsl(var(--background))' : '#ffffff',
            borderRadius: '0.5rem', 
            borderColor: 'hsl(var(--border))',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          }}
        />
        <Legend 
          iconSize={10}
          iconType="circle"
          wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
          onClick={(e) => handleLegendClick(String(e.dataKey))}
        />
        {seniorityKeys.map((key) => (
          <Bar 
            key={key} 
            dataKey={key} 
            stackId="a" 
            fill={getColor(key)}
            radius={[0, 6, 6, 0]}
            animationDuration={500}
          >
            {data.map((entry, entryIndex) => (
              <Cell 
                key={`cell-${entryIndex}-${key}`}
                cursor="pointer"
                onClick={() => handleBarClick(entry.role, key)}
                opacity={
                  (!selectedRole && !selectedSeniority) ||
                  (selectedRole === entry.role && selectedSeniority === key) ||
                  (selectedRole === entry.role && !selectedSeniority) ||
                  (!selectedRole && selectedSeniority === key)
                  ? 1 : 0.3
                }
              />
            ))}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default RoleSeniorityChart;
