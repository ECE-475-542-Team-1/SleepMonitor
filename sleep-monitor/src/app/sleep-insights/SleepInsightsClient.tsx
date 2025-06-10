'use client';

import React, { useState, useEffect } from 'react';
import { Brain, Info, AlertTriangle } from 'lucide-react';

export default function SleepInsightsClient() {
  const [insights, setInsights] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [heartRateArray, setHeartRateArray] = useState<number[]>([]);
  const [spo2Array, setSpo2Array] = useState<number[]>([]);
  const [rrArray, setRRArray] = useState<number[]>([]);

  useEffect(() => {
    const fetchAverages = async () => {
      try {
        const res = await fetch('/api/averages');
        const data = await res.json();
        setHeartRateArray(data.heartRateArray || []);
        setSpo2Array(data.spo2Array || []);
        setRRArray(data.rrArray || [])
      } catch (err) {
        console.error('Failed to fetch average data:', err);
      }
    };

    fetchAverages();
  }, []);

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

  const avgHR = avg(heartRateArray);
  const avgSpO2 = avg(spo2Array);
  const avgRR = avg(rrArray);

  const logicalInsights = [
    avgHR > 80
      ? 'Your average heart rate is slightly elevated during sleep, which may suggest restlessness, stress, or lack of deep sleep.'
      : 'Your heart rate is within a healthy resting range — a good indicator of restful sleep.',
    avgSpO2 < 95
      ? 'Your average SpO₂ is below the optimal level, which may indicate potential breathing disruptions such as mild apnea.'
      : 'Your SpO₂ levels are consistently strong — excellent oxygenation during sleep.',
    avgRR < 7
      ? 'Your breathing rates slow significantly during the night, which could be a sign of sleep apnea or other breathing condition.'
      : 'Your breathing rate seems consistent and within normal range.'
  ];

  const handleAnalyze = async () => {
    setLoading(true);
    setInsights('');

    try {
      const response = await fetch('/api/sleepAnalysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ heartRateArray, spo2Array }),
      });
      const json = await response.json();
      setInsights(json.insights || 'No AI insights available.');
    } catch (err) {
      console.error('Failed to fetch AI insights:', err);
      setInsights('Error retrieving AI insights.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-3xl space-y-8">
        <header className="space-y-1">
          <h1 className="text-4xl font-bold tracking-tight text-white">Sleep Insights</h1>
          <p className="text-slate-400">
            Personalized feedback based on your heart rate, SpO₂, and Respiration data.
          </p>
        </header>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <MetricCard label="Avg HR" value={avgHR} unit="bpm" />
          <MetricCard label="Avg SpO₂" value={avgSpO2} unit="%" />
          <MetricCard label="Avg RR" value={avgRR} unit="/min" />
        </div>

        <InsightCard
          title="Core Observations"
          icon={<Info className="text-cyan-400" size={20} />}
          color="bg-gradient-to-br from-slate-800 to-slate-900/60 backdrop-blur-md border border-slate-700/30"
          content={logicalInsights}
        />

        <InsightCard
          title="AI Insights"
          icon={<Brain className="text-purple-400" size={20} />}
          color="bg-gradient-to-br from-purple-900/40 to-slate-900/60 backdrop-blur-md border border-purple-500/30"
          content={
            insights ? (
              <div className="space-y-4 text-slate-300">
                {insights.split('\n').map((line, i) => {
                  const trimmed = line.trim();

                  if (trimmed.startsWith('-')) {
                    const text = trimmed.replace(/^-+\s*/, '');
                    return (
                      <li key={i} className="ml-4 list-disc marker:text-indigo-400 leading-relaxed">
                        <MarkdownText text={text} />
                      </li>
                    );
                  }

                  if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                    return (
                      <h3 key={i} className="text-lg font-semibold text-indigo-300 mt-4">
                        {trimmed.replace(/\*\*/g, '')}
                      </h3>
                    );
                  }

                  return (
                    <p key={i} className="leading-relaxed">
                      <MarkdownText text={trimmed} />
                    </p>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-400">Click below to generate AI-based feedback.</p>
            )
          }
          action={
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-40"
            >
              {loading ? 'Analyzing...' : 'Generate AI Insight'}
            </button>
          }
        />

        {(avgHR > 75 || avgSpO2 < 95) && (
          <InsightCard
            title="Suggestions"
            icon={<AlertTriangle className="text-yellow-400" size={20} />}
            color="bg-yellow-900/20 backdrop-blur border border-yellow-600/30"
            content={[
              avgHR > 75 && 'Try reducing screen time, stress, or caffeine intake before bed.',
              avgSpO2 < 95 &&
                'Ensure good airflow in your sleeping environment and consider evaluating for snoring or sleep apnea.',
            ].filter(Boolean)}
          />
        )}

        <footer className="pt-4 border-t border-slate-700/40 text-sm text-slate-500">
          Disclaimer: This is a prototype and should not be considered medical advice.
        </footer>
      </div>
    </main>
  );
}

function MetricCard({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-800/80 backdrop-blur p-4 shadow hover:scale-[1.02] transition-all border border-slate-700/30">
      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{label}</h3>
      <p className="mt-1 text-3xl font-bold text-white">
        {value}
        <span className="ml-1 text-base font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  );
}

function InsightCard({
  title,
  icon,
  color,
  content,
  action,
}: {
  title: string;
  icon?: React.ReactNode;
  color?: string;
  content: string[] | React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className={`rounded-xl ${color ?? 'bg-slate-800'} p-6 shadow space-y-4`}>
      <div className="flex items-center gap-3 border-b border-slate-700/30 pb-3">
        {icon}
        <h2 className="text-lg font-semibold text-white">{title}</h2>
      </div>
      <div className="space-y-2">
        {Array.isArray(content)
          ? content.map((line, i) => (
              <p key={i} className="text-slate-300 leading-relaxed">
                • <MarkdownText text={line} />
              </p>
            ))
          : content}
      </div>
      {action}
    </section>
  );
}

function MarkdownText({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}





