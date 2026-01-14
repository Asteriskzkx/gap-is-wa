export function resizeChartsForPDF() {
  const ChartJS = (window as any).Chart;
  if (!ChartJS) return;

  ChartJS.helpers.each(ChartJS.instances, (chart: any) => {
    chart.resize(700, 400);
    chart.update();
  });
}

export function resetChartsAfterPDF() {
  const ChartJS = (window as any).Chart;
  if (!ChartJS) return;

  ChartJS.helpers.each(ChartJS.instances, (chart: any) => {
    chart.resize();
    chart.update();
  });
}
