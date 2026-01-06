import { useEffect, useRef } from "react";
import { Chart, ChartType, ChartData, ChartOptions } from "chart.js/auto";

interface UseChartProps<TType extends ChartType> {
  type: TType;
  data: ChartData<TType>;
  options?: ChartOptions<TType>;
}

export function useChart<TType extends ChartType>({
  type,
  data,
  options,
}: UseChartProps<TType>) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart<TType> | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    chartRef.current?.destroy();

    chartRef.current = new Chart(canvasRef.current, {
      type,
      data,
      options,
    });

    return () => {
      chartRef.current?.destroy();
    };
  }, [type, data, options]);

  return canvasRef;
}
