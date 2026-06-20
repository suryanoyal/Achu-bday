/* ╔══════════════════════════════════════════════════════════════╗
   ║  INVESTMENT CHART — Canvas-based animated line chart       ║
   ║  Shows growth of ₹100 invested on Aug 2, 2003             ║
   ╚══════════════════════════════════════════════════════════════╝ */

const InvestmentChart = (() => {
  let canvas, ctx;
  let animationProgress = 0;
  let animId;
  let datasets = [];
  let isAnimating = false;
  let tooltipData = null;

  const PADDING = { top: 30, right: 20, bottom: 50, left: 65 };
  const COLORS = {
    grid: 'rgba(245, 240, 232, 0.06)',
    axis: 'rgba(245, 240, 232, 0.15)',
    text: 'rgba(245, 240, 232, 0.4)',
    textBright: 'rgba(245, 240, 232, 0.7)',
  };

  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function init() {
    canvas = document.getElementById('investment-chart');
    if (!canvas) return;
    ctx = canvas.getContext('2d');

    resize();
    window.addEventListener('resize', () => {
      resize();
      if (!isAnimating && animationProgress >= 1) draw(1);
    });

    // Tooltip on hover
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', () => {
      tooltipData = null;
      if (!isAnimating) draw(1);
    });

    // Setup intersection observer to trigger animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(canvas);
  }

  function resize() {
    const container = canvas.parentElement;
    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    ctx.scale(dpr, dpr);
    canvas.logicalWidth = rect.width;
    canvas.logicalHeight = rect.height;
  }

  function setData(investmentData) {
    datasets = [];
    const keys = ['gold', 'sensex', 'nifty', 'fd'];

    keys.forEach(key => {
      const d = investmentData[key];
      if (d) {
        datasets.push({
          name: d.name,
          color: d.color,
          points: d.dataPoints,
          finalValue: d.returns,
        });
      }
    });
  }

  function startAnimation() {
    if (isAnimating) return;
    isAnimating = true;
    animationProgress = 0;
    animate();
  }

  function animate() {
    animationProgress += 0.012;
    if (animationProgress > 1) animationProgress = 1;

    draw(easeOutExpo(animationProgress));

    if (animationProgress < 1) {
      animId = requestAnimationFrame(animate);
    } else {
      isAnimating = false;
    }
  }

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  function draw(progress) {
    const w = canvas.logicalWidth;
    const h = canvas.logicalHeight;

    ctx.clearRect(0, 0, w, h);

    if (datasets.length === 0) return;

    const chartW = w - PADDING.left - PADDING.right;
    const chartH = h - PADDING.top - PADDING.bottom;

    // Find ranges
    let minYear = Infinity, maxYear = -Infinity;
    let maxValue = 0;

    datasets.forEach(ds => {
      ds.points.forEach(p => {
        minYear = Math.min(minYear, p.year);
        maxYear = Math.max(maxYear, p.year);
        maxValue = Math.max(maxValue, p.value);
      });
    });

    maxValue = Math.ceil(maxValue / 500) * 500;
    if (maxValue < 500) maxValue = 500;

    const xScale = (year) => PADDING.left + ((year - minYear) / (maxYear - minYear)) * chartW;
    const yScale = (value) => PADDING.top + chartH - (value / maxValue) * chartH;

    // Draw grid lines
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 0.5;
    const gridSteps = 5;
    for (let i = 0; i <= gridSteps; i++) {
      const y = PADDING.top + (chartH / gridSteps) * i;
      ctx.beginPath();
      ctx.moveTo(PADDING.left, y);
      ctx.lineTo(w - PADDING.right, y);
      ctx.stroke();

      // Y-axis labels
      const val = Math.round(maxValue - (maxValue / gridSteps) * i);
      ctx.fillStyle = COLORS.text;
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`₹${val.toLocaleString('en-IN')}`, PADDING.left - 10, y + 4);
    }

    // X-axis labels
    const yearStep = Math.max(1, Math.floor((maxYear - minYear) / 8));
    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'center';
    ctx.font = '11px Inter, sans-serif';
    for (let year = minYear; year <= maxYear; year += yearStep) {
      const x = xScale(year);
      ctx.fillText(year.toString(), x, h - PADDING.bottom + 25);
    }
    // Always show last year
    ctx.fillText(maxYear.toString(), xScale(maxYear), h - PADDING.bottom + 25);

    // Draw baseline
    ctx.strokeStyle = COLORS.axis;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PADDING.left, PADDING.top + chartH);
    ctx.lineTo(w - PADDING.right, PADDING.top + chartH);
    ctx.stroke();

    // Starting value line
    ctx.strokeStyle = 'rgba(245, 240, 232, 0.08)';
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(PADDING.left, yScale(100));
    ctx.lineTo(w - PADDING.right, yScale(100));
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = COLORS.text;
    ctx.textAlign = 'left';
    ctx.font = '10px Inter, sans-serif';
    ctx.fillText('₹100 invested', PADDING.left + 5, yScale(100) - 6);

    // Draw datasets
    datasets.forEach((ds, dsIndex) => {
      const points = ds.points;
      if (points.length < 2) return;

      // How many points to show based on progress
      const totalPoints = points.length;
      const visiblePoints = Math.ceil(totalPoints * progress);

      // Draw line
      ctx.strokeStyle = ds.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.beginPath();

      for (let i = 0; i < visiblePoints; i++) {
        const x = xScale(points[i].year);
        let y;

        if (i === visiblePoints - 1 && visiblePoints < totalPoints) {
          // Interpolate the last visible point
          const frac = (totalPoints * progress) - Math.floor(totalPoints * progress);
          const prevVal = points[i].value;
          const nextVal = i + 1 < totalPoints ? points[i + 1].value : prevVal;
          const val = prevVal + (nextVal - prevVal) * frac;
          y = yScale(val);
        } else {
          y = yScale(points[i].value);
        }

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw gradient fill under line
      if (visiblePoints > 1) {
        ctx.beginPath();
        for (let i = 0; i < visiblePoints; i++) {
          const x = xScale(points[i].year);
          const y = yScale(points[i].value);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(xScale(points[visiblePoints - 1].year), PADDING.top + chartH);
        ctx.lineTo(xScale(points[0].year), PADDING.top + chartH);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, PADDING.top, 0, PADDING.top + chartH);
        gradient.addColorStop(0, hexToRgba(ds.color, 0.15));
        gradient.addColorStop(1, hexToRgba(ds.color, 0));
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      // Draw endpoint dot
      if (progress >= 1 && points.length > 0) {
        const lastPoint = points[points.length - 1];
        const x = xScale(lastPoint.year);
        const y = yScale(lastPoint.value);

        // Glow
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(ds.color, 0.2);
        ctx.fill();

        // Dot
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = ds.color;
        ctx.fill();

        // Value label
        ctx.fillStyle = ds.color;
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(`₹${lastPoint.value.toLocaleString('en-IN')}`, x - 10, y - 10);
      }
    });

    // Draw tooltip
    if (tooltipData && !isAnimating) {
      drawTooltip(tooltipData.x, tooltipData.y, tooltipData.year, xScale, yScale);
    }
  }

  function handleMouseMove(e) {
    if (isAnimating || datasets.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const chartW = canvas.logicalWidth - PADDING.left - PADDING.right;

    if (mouseX < PADDING.left || mouseX > canvas.logicalWidth - PADDING.right) {
      tooltipData = null;
      draw(1);
      return;
    }

    // Find closest year
    let minYear = Infinity, maxYear = -Infinity;
    datasets.forEach(ds => {
      ds.points.forEach(p => {
        minYear = Math.min(minYear, p.year);
        maxYear = Math.max(maxYear, p.year);
      });
    });

    const yearRatio = (mouseX - PADDING.left) / chartW;
    const hoverYear = Math.round(minYear + yearRatio * (maxYear - minYear));

    tooltipData = { x: mouseX, y: mouseY, year: hoverYear };
    draw(1);
  }

  function drawTooltip(mouseX, mouseY, year, xScale, yScale) {
    const x = xScale(year);
    const chartH = canvas.logicalHeight - PADDING.top - PADDING.bottom;

    // Vertical line
    ctx.strokeStyle = 'rgba(245, 240, 232, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(x, PADDING.top);
    ctx.lineTo(x, PADDING.top + chartH);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw dots and values at intersection
    let tooltipLines = [`Year: ${year}`];
    datasets.forEach(ds => {
      const point = ds.points.find(p => p.year === year);
      if (point) {
        const py = yScale(point.value);
        ctx.beginPath();
        ctx.arc(x, py, 5, 0, Math.PI * 2);
        ctx.fillStyle = ds.color;
        ctx.fill();
        tooltipLines.push(`${ds.name}: ₹${point.value.toLocaleString('en-IN')}`);
      }
    });

    // Tooltip box
    ctx.font = '11px Inter, sans-serif';
    const boxWidth = 160;
    const lineHeight = 20;
    const boxHeight = tooltipLines.length * lineHeight + 16;
    let boxX = x + 15;
    let boxY = mouseY - boxHeight / 2;

    if (boxX + boxWidth > canvas.logicalWidth - 10) boxX = x - boxWidth - 15;
    if (boxY < 10) boxY = 10;
    if (boxY + boxHeight > canvas.logicalHeight - 10) boxY = canvas.logicalHeight - boxHeight - 10;

    // Background
    ctx.fillStyle = 'rgba(20, 20, 20, 0.9)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Text
    tooltipLines.forEach((line, i) => {
      ctx.fillStyle = i === 0 ? COLORS.textBright : COLORS.text;
      ctx.textAlign = 'left';
      ctx.fillText(line, boxX + 12, boxY + 22 + i * lineHeight);
    });
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  return {
    init,
    setData,
  };
})();
