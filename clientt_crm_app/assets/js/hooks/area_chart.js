/**
 * AreaChart Hook for Chart.js integration
 *
 * Renders time-series area charts with gradient fills.
 * Automatically adapts to dark/light theme changes.
 *
 * Usage:
 *   <div
 *     phx-hook="AreaChart"
 *     data-chart-data={Jason.encode!(@data)}
 *     data-data-key="submissions"
 *     data-label-key="name"
 *     data-color="#2278c0"
 *   >
 *     <canvas></canvas>
 *   </div>
 *
 * Note: Requires Chart.js to be installed via npm
 */

let Chart;

// Dynamically import Chart.js when needed
async function loadChart() {
  if (!Chart) {
    try {
      const module = await import('chart.js/auto');
      Chart = module.default;
    } catch (error) {
      console.warn('Chart.js not installed. Run: npm install --prefix clientt_crm_app/assets chart.js');
      return null;
    }
  }
  return Chart;
}

const AreaChart = {
  async mounted() {
    this.chart = null;

    // Load Chart.js
    const ChartJS = await loadChart();
    if (!ChartJS) {
      this.el.innerHTML = '<div class="alert alert-warning">Chart.js not installed</div>';
      return;
    }

    this.renderChart();

    // Watch for theme changes
    this.observer = new MutationObserver(() => {
      this.updateTheme();
    });
    this.observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    });
  },

  updated() {
    this.renderChart();
  },

  destroyed() {
    if (this.chart) {
      this.chart.destroy();
    }
    if (this.observer) {
      this.observer.disconnect();
    }
  },

  async renderChart() {
    const ChartJS = await loadChart();
    if (!ChartJS) return;

    const canvas = this.el.querySelector('canvas');
    if (!canvas) return;

    // Get data from attributes
    const data = JSON.parse(this.el.dataset.chartData || '[]');
    const dataKey = this.el.dataset.dataKey || 'submissions';
    const labelKey = this.el.dataset.labelKey || 'name';
    const color = this.el.dataset.color || '#2278c0';
    const showGrid = this.el.dataset.showGrid !== 'false';
    const showTooltip = this.el.dataset.showTooltip !== 'false';

    // Destroy existing chart
    if (this.chart) {
      this.chart.destroy();
    }

    // Check dark mode
    const isDark = document.documentElement.classList.contains('dark') ||
                   document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#ffffff' : '#18181b';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

    // Create gradient
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, `${color}4D`); // 30% opacity
    gradient.addColorStop(1, `${color}00`); // 0% opacity

    // Chart configuration
    const config = {
      type: 'line',
      data: {
        labels: data.map(d => d[labelKey]),
        datasets: [{
          label: dataKey.charAt(0).toUpperCase() + dataKey.slice(1),
          data: data.map(d => d[dataKey]),
          borderColor: color,
          backgroundColor: gradient,
          borderWidth: 3,
          fill: true,
          tension: 0.4, // Smooth curve
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: color,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: showTooltip,
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `${context.parsed.y} ${dataKey}`;
              }
            }
          },
        },
        scales: {
          x: {
            grid: {
              display: showGrid,
              color: gridColor,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 12,
              },
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              display: showGrid,
              color: gridColor,
              drawBorder: false,
            },
            ticks: {
              color: textColor,
              font: {
                size: 12,
              },
            },
          },
        },
      },
    };

    // Create chart
    this.chart = new ChartJS(ctx, config);
  },

  updateTheme() {
    if (this.chart) {
      this.renderChart();
    }
  },
};

export default AreaChart;
