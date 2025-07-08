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

// Nueva paleta de colores más distinguible y moderna, con especificación para Jr, SSr, Sr
const seniorityColors: { [key: string]: { base: string; gradient?: string } } = {
  'Junior':        { base: '#fca5a5', gradient: '#ef4444' }, // Rojo
  'Semi-Senior':   { base: '#fde047', gradient: '#facc15' }, // Amarillo
  'Senior':        { base: '#86efac', gradient: '#22c55e' }, // Verde
  'Lead':          { base: '#93c5fd', gradient: '#60a5fa' }, // Azul
  'Architect':     { base: '#c084fc', gradient: '#a855f7' }, // Púrpura
  'Manager':       { base: '#fbbf24', gradient: '#f59e0b' }, // Naranja
  'No Especificado':{ base: '#e5e7eb', gradient: '#d1d5db' }, // Gris
  'Otro':          { base: '#67e8f9', gradient: '#22d3ee' }, // Turquesa
};

// Helper para obtener el color base o un color por defecto
const getColor = (seniorityKey: string, type: 'base' | 'gradient' = 'base'): string => {
  const colorPair = seniorityColors[seniorityKey] || seniorityColors['Otro'];
  return type === 'gradient' ? (colorPair.gradient || colorPair.base) : colorPair.base;
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
  // Ordenar para consistencia en la leyenda
  return Array.from(keys).sort((a,b) => {
    const order = ['Junior', 'Semi-Senior', 'Senior', 'Lead', 'Architect', 'Manager', 'Otro', 'No Especificado'];
    return order.indexOf(a) - order.indexOf(b);
  }); 
};

const RoleSeniorityChart: React.FC<RoleSeniorityChartProps> = ({ data, onFilterChange, selectedRole, selectedSeniority }) => {
  if (!data || data.length === 0) {
    return <p className="text-center text-gray-500 py-4">No hay datos de roles para mostrar en el gráfico.</p>;
  }

  const seniorityKeys = getSeniorityKeys(data);

  const handleBarClick = (role: string, seniorityKey: string) => {
    // Si se hace clic en una barra específica, se filtra por ese rol Y seniority
    onFilterChange(role, seniorityKey);
  };

  const handleLegendClick = (dataKey: string) => {
    // Si se hace clic en la leyenda (seniority), se filtra por ese seniority en CUALQUIER rol
    // Para simplificar, por ahora, si se hace clic en leyenda, se limpia el filtro de rol y se aplica solo seniority
    // O, si ya está seleccionado ese seniority, se limpia todo.
    if (selectedSeniority === dataKey && !selectedRole) {
        onFilterChange(null, null); 
    } else {
        onFilterChange(null, dataKey); 
    }
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 70 }} barGap={4} barCategoryGap="20%">
        <defs>
          {seniorityKeys.map((key) => (
            <linearGradient id={`grad-${key.replace(/\s+/g, '-')}`} x1="0" y1="0" x2="0" y2="1" key={`grad-def-${key}`}>
              <stop offset="5%" stopColor={getColor(key, 'base')} stopOpacity={0.9}/>
              <stop offset="95%" stopColor={getColor(key, 'gradient')} stopOpacity={1}/>
            </linearGradient>
          ))}
        </defs>
        {/* <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" /> */}
        <XAxis 
          dataKey="role" 
          angle={-40} 
          textAnchor="end" 
          height={80} 
          interval={0}
          tick={{ fontSize: 10, fill: '#6b7280' }}
          axisLine={{ stroke: '#d1d5db' }}
          tickLine={{ stroke: '#d1d5db' }}
        />
        <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
        <Tooltip 
          cursor={{ fill: 'rgba(230, 230, 230, 0.3)' }}
          contentStyle={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
            borderRadius: '8px', 
            borderColor: '#cbd5e1',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            padding: '8px 12px'
          }}
          itemStyle={{ fontSize: 12, color: '#4b5563' }}
          labelStyle={{ fontSize: 13, fontWeight: '600', color: '#1f2937', marginBottom: '4px', borderBottom: '1px solid #e5e7eb', paddingBottom: '4px' }}
        />
        <Legend 
          verticalAlign="top" 
          height={36} 
          iconSize={10}
          iconType="circle"
          wrapperStyle={{ fontSize: '11px', color: '#4b5563', paddingBottom: '10px' }}
          onClick={(e) => handleLegendClick(String(e.dataKey))}
        />
        {seniorityKeys.map((key) => (
          <Bar 
            key={key} 
            dataKey={key} 
            stackId="a" 
            fill={`url(#grad-${key.replace(/\s+/g, '-')})`} 
            onClick={(barProps) => handleBarClick(barProps.role, key)}
            radius={[6, 6, 0, 0]} // Bordes redondeados arriba un poco más pronunciados
            animationDuration={500}
          >
            {data.map((entry, entryIndex) => (
              <Cell 
                key={`cell-${entryIndex}-${key}`}
                cursor="pointer"
                // Opacidad si no está seleccionado o si otro filtro está activo
                opacity={
                  (!selectedRole && !selectedSeniority) || // Nada seleccionado, todo opaco
                  (selectedRole === entry.role && selectedSeniority === key) || // Exactamente esta barra seleccionada
                  (selectedRole === entry.role && !selectedSeniority) || // Este rol seleccionado, cualquier seniority
                  (!selectedRole && selectedSeniority === key) // Este seniority seleccionado, cualquier rol
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
