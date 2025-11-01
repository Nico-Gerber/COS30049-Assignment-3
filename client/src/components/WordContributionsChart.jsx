import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
  LabelList,
} from "recharts";

const WordContributionsChart = ({ contributions = {}, topN = 10, height = 260 }) => {
  const data = Object.entries(contributions || {})
    .map(([word, value]) => ({ word, value: Number(value) }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    .slice(0, topN)
    .reverse();

  if (!data.length) return null;

  // reduce Y axis footprint so plot area is larger
  const yAxisWidth = 110;          // smaller than before
  const paddingBetweenAxisAndPlot = 20;
  const leftMargin = yAxisWidth + paddingBetweenAxisAndPlot - 150;
  const rightMargin = 100;          // more room on the right so bars aren't squashed
  const minPlotWidth = 200;

  const domainMax = Math.max(...data.map((d) => Math.abs(d.value))) || 1;
  // give more horizontal padding so bars aren't hugging the axis
  const domain = [-domainMax * 1.25, domainMax * 1.25];

  // render Y tick (color word to match its bar)
  const renderYTick = (props) => {
    const { x, y, payload } = props;
    const word = payload.value;
    const entry = data.find((d) => d.word === word) || { value: 0 };
    const color = "#060101ff" ;
    return (
      <text x={x - 6} y={y + 4} fill={color} textAnchor="end" fontSize={13}>
        {word}
      </text>
    );
  };

  return (
    <div style={{ width: "100%", minWidth: 0, height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: rightMargin, left: leftMargin, bottom: 8 }}
          barCategoryGap="30%"
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            domain={domain}
            tickFormatter={(v) => v.toFixed(2)}
            tickMargin={12}
          />
          <YAxis
            type="category"
            dataKey="word"
            width={yAxisWidth}
            tick={renderYTick}
            interval={0}        // force every label to render
            tickLine={false}   // hide small tick marks to reduce clutter
            axisLine={false}
          />
          <Tooltip formatter={(v) => Number(v).toFixed(3)} />
          <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={1} />
          <Bar dataKey="value" barSize={18} isAnimationActive={false}>
            {data.map((entry) => (
              <Cell key={entry.word} fill={entry.value >= 0 ? "#10b981" : "#ef4444"} />
            ))}
            <LabelList dataKey="value" position="right" formatter={(v) => Number(v).toFixed(3)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WordContributionsChart;