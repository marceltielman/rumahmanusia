import fs from "node:fs";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                     "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* Render-ready schedule: labels derived from the stored ISO month, and the
 * timeline/bar-chart geometry computed from the number of months so adding or
 * removing one redraws both charts. The canvas had these baked into the SVG.
 *
 * Timeline viewBox: 0 0 1080 150.  Bar chart viewBox: 0 0 200 60. */
export default function () {
  const months = JSON.parse(fs.readFileSync("content/schedule.json", "utf8"));
  const n = months.length;
  const firstYear = Number(months[0].month.slice(0, 4));

  const span = 1000;           // timeline drawing width, inset 40 either side
  const step = n > 1 ? span / (n - 1) : 0;
  const pitch = 196 / n;       // bar chart column pitch
  const barW = Math.max(2, pitch - 4);
  const unit = 10;             // bar height per topic
  const floor = 56;            // bar baseline

  return months.map((m, i) => {
    const [year, month] = m.month.split("-").map(Number);
    const label = MONTH_NAMES[month - 1] + (year === firstYear ? "" : ` ${year}`);
    const above = i % 2 === 1;   // labels alternate to avoid collisions
    const height = Math.min(m.topics.length * unit, floor);

    return {
      index: i,
      month: m.month,
      label,
      topics: m.topics,
      count: m.topics.length,
      // timeline
      x: Math.round((40 + i * step) * 100) / 100,
      labelY: above ? 34 : 116,
      tickY1: above ? 44 : 106,
      tickY2: above ? 66 : 84,
      // bar chart
      hitX: Math.round((2 + i * pitch) * 100) / 100,
      hitW: Math.round(pitch * 100) / 100,
      barX: Math.round((2 + i * pitch + 2) * 100) / 100,
      barW: Math.round(barW * 100) / 100,
      barY: floor - height,
      barH: height,
    };
  });
}
