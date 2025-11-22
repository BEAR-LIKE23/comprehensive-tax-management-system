
import React from 'react';

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  title: string;
  data: ChartDataPoint[];
  height?: number;
  valuePrefix?: string;
}

export const BarChart: React.FC<BarChartProps> = ({ title, data, height = 200, valuePrefix = '' }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md w-full">
      <h3 className="text-lg font-semibold text-gray-700 mb-6">{title}</h3>
      <div className="flex items-end space-x-4" style={{ height: `${height}px` }}>
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end group h-full relative">
            <div 
                className="w-full rounded-t-md transition-all duration-500 ease-out hover:opacity-80 relative"
                style={{ 
                    height: `${maxValue > 0 ? (point.value / maxValue) * 100 : 0}%`, 
                    backgroundColor: point.color || '#10B981' 
                }}
            >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {point.label}: {valuePrefix}{point.value.toLocaleString()}
                </div>
            </div>
            <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface DistributionChartProps {
    title: string;
    data: ChartDataPoint[];
}

export const DistributionChart: React.FC<DistributionChartProps> = ({ title, data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md w-full">
            <h3 className="text-lg font-semibold text-gray-700 mb-6">{title}</h3>
            <div className="space-y-4">
                {data.map((item, index) => (
                    <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-gray-600 font-medium">{item.label}</span>
                            <span className="text-gray-900 font-bold">{item.value.toLocaleString()} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className="h-2.5 rounded-full transition-all duration-1000 ease-out" 
                                style={{ 
                                    width: `${total > 0 ? (item.value / total) * 100 : 0}%`, 
                                    backgroundColor: item.color || '#3B82F6' 
                                }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
