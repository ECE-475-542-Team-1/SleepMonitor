'use client';

import React, { useEffect, useState, useRef } from 'react';
import 'chartjs-adapter-date-fns';
import { Line } from 'react-chartjs-2';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
 // make sure this is available via shadcn or your tab library

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  ChartOptions,
  TimeScaleOptions,
  CartesianScaleOptions,
  ChartData, 
  ChartDataset
} from 'chart.js';

ChartJS.register(
  TimeScale,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface SensorData {
  timestamp: number;
  hr: number | null;
  spo2: number | null;
  respiratoryRate: number | null;
  movementRate: number | null;
}

interface SleepSession {
  start: number;
  end: number;
  data: SensorData[];
  avgHR: number | null;
  avgSpO2: number | null;
  avgRR: number | null;
  avgMvmnt: number | null;
}

interface UserStats {
  hrBaseline: number;
  rrBaseline: number;
  spo2Baseline: number;
  hrStd: number;
  rrStd: number;
  spo2Std: number;
}


// function inferSleepStage(
//   hr: number,
//   rr: number,
//   baselineHR: number,
//   baselineRR: number
// ): 'awake' | 'light' | 'deep' | 'rem' {
//   const hrDrop = (baselineHR - hr) / baselineHR;
//   const rrDrop = (baselineRR - rr) / baselineRR;

//   if (hrDrop < 0.05 || rrDrop < 0.05) return 'awake';
//   if (hrDrop > 0.2 && rrDrop > 0.25) return 'deep';
//   if (hrDrop > 0.1 && rrDrop < 0.1) return 'rem';
//   return 'light';
// }

function inferSleepStage(
    hr: number, rr: number, spo2: number,
  hrBaseline: number, rrBaseline: number, spo2Baseline: number,
  hrStd: number, rrStd: number, spo2Std: number
): 'awake' | 'light' | 'deep' | 'rem' {

  if (
    [hr, rr, spo2, hrBaseline, rrBaseline, spo2Baseline, hrStd, rrStd, spo2Std].some(
      v => v === undefined || v === null || isNaN(v) || v === 0
    )
  ) {
    return 'awake';
  }
  
  const hrZ = (hr - hrBaseline) / hrStd;
  const rrZ = (rr - rrBaseline) / rrStd;
  const spo2Z = (spo2 - spo2Baseline) / spo2Std;

  if (Math.abs(hrZ) < 0.3 && Math.abs(rrZ) < 0.3 && spo2Z > -0.3) {
    return 'awake';
  }

  if (hrZ < -0.5 && rrZ < -0.5 && spo2Z > -0.2) {
    return 'deep';
  }

  if (hrZ < -0.2 && rrZ >= -0.5 && spo2Z <= -0.3) {
    return 'rem';
  }

  return 'light';
}



function getStageColor(stage: string): string {
  switch (stage) {
    case 'deep': return '#1e3a8a';
    case 'light': return '#10b981';
    case 'rem': return '#9333ea';
    case 'awake': return '#f97316';
    default: return '#64748b';
  }
}



export default function DashboardClient() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [filter, setFilter] = useState<'all' | '24h' | '7d' | '30d'>('all');
  const [chartTab, setChartTab] = useState('hrspo2');
  const sessionScrollRef = useRef<HTMLDivElement>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);


  const scrollSessions = (direction: 'left' | 'right') => {
    if (!sessionScrollRef.current) return;
    sessionScrollRef.current.scrollBy({
      left: direction === 'left' ? -200 : 200,
      behavior: 'smooth',
    });
  };

// Fetch data from /api/data
  useEffect(() => {
    if (paused) return;

    const fetchData = async () => {
      try {
        const res = await fetch('/api/data');
        const data = await res.json();
        data.sort((a: SensorData, b: SensorData) => a.timestamp - b.timestamp);
        setSensorData(data);
        setLastUpdated(Date.now());
      } catch (err) {
        console.error('Failed to fetch sensor data:', err);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [paused]);

  useEffect(() => {
    fetch('/api/user-stats')
      .then(res => res.json())
      .then(setUserStats)
      .catch(console.error);
  }, []);

  const handleDeleteLatest = async () => {
    const confirmed = confirm('Delete the most recent reading?');
    if (!confirmed) return;

    try {
      const res = await fetch('/api/data', { method: 'DELETE' });
      if (res.ok) {
        const updated = await fetch('/api/data');
        const updatedData = await updated.json();
        updatedData.sort((a: SensorData, b: SensorData) => a.timestamp - b.timestamp);
        setSensorData(updatedData);
        setSessionIndex(sessions.length - 2);
      }
    } catch (err) {
      console.error('Error deleting latest datapoint:', err);
    }
  };

  const now = Math.floor(Date.now() / 1000);
  let filteredData = [...sensorData];
  

  if (filter === '24h') {
    filteredData = sensorData.filter(d => now - d.timestamp <= 86400);
  } else if (filter === '7d') {
    filteredData = sensorData.filter(d => now - d.timestamp <= 7 * 86400);
  } else if (filter === '30d') {
    filteredData = sensorData.filter(d => now - d.timestamp <= 30 * 86400);
  }

  const sessions = groupSleepSessions(filteredData);
  const activeSession = sessions[sessionIndex] ?? null;
  const [hasInitializedSession, setHasInitializedSession] = useState(false);

  useEffect(() => {
    if (!hasInitializedSession && sessions.length > 0) {
      setSessionIndex(sessions.length - 1);
      setHasInitializedSession(true);
    }
  }, [sessions, hasInitializedSession]);


  const groupedByTimestamp: Record<number, SensorData[]> = {};
  for (const d of activeSession?.data ?? []) {
    if (!groupedByTimestamp[d.timestamp]) {
      groupedByTimestamp[d.timestamp] = [];
    }
    groupedByTimestamp[d.timestamp].push(d);
  }


  const sortedData: SensorData[] = Object.entries(groupedByTimestamp)
    .map(([timestampStr, entries]) => {
      const timestamp = parseInt(timestampStr, 10);

      const avgIfPresent = (key: keyof SensorData) => {
        const validEntries = entries.filter(d => d[key] != null && d[key] !== 0);
        if (validEntries.length === 0) return null;
        return Math.round(
          validEntries.reduce((sum, d) => sum + (d[key] as number), 0) / validEntries.length
        );
      };

      return {
        timestamp,
        hr: avgIfPresent('hr'),
        spo2: avgIfPresent('spo2'),
        respiratoryRate: avgIfPresent('respiratoryRate'),
        movementRate: avgIfPresent('movementRate'),
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);


  console.log('Session data length:', activeSession?.data.length);
  console.log('Session range:', activeSession?.data.at(0)?.timestamp, 'to', activeSession?.data.at(-1)?.timestamp);

  const hrSpo2Data = {
    labels: sortedData.map(d => new Date(d.timestamp * 1000)),
    datasets: [
      {
        label: 'Heart Rate (bpm)',
        data: sortedData.map(d => ({ x: new Date(d.timestamp * 1000), y: d.hr })),
        borderColor: '#ef4444',
        spanGaps: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.7,
      },
      {
        label: 'SpO₂ (%)',
        data: sortedData.map(d => ({ x: new Date(d.timestamp * 1000), y: d.spo2 })),
        borderColor: '#3b82f6',
        spanGaps: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.7,
      },
    ],
  };

  const rrData = {
    labels: sortedData.map(d => new Date(d.timestamp * 1000)),
    datasets: [
      {
        label: 'Respiratory Rate (brpm)',
        data: sortedData.map(d => ({ x: new Date(d.timestamp * 1000), y: d.respiratoryRate ?? null })),
        borderColor: '#10b981',
        spanGaps: true,
        pointRadius: 0,
        borderWidth: 2,
        tension: 0.7,
      },
    ],
  };


  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 700,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#cbd5e1',
          font: { size: 13 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { size: 12 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'minute',
          displayFormats: {
            minute: 'h:mm',
          },
        },
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 12,
        },
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        } as Partial<CartesianScaleOptions['grid']>,  // 👈 force TS to accept
      },
      y: {
        beginAtZero: true,
        suggestedMax: 130,
        ticks: {
          color: '#94a3b8',
        },
        grid: {
          color: 'rgba(255,255,255,0.05)',
          drawBorder: false,
        } as Partial<CartesianScaleOptions['grid']>,
      },
    },
  };


  const rrChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales!,
      y: {
        ...chartOptions.scales!.y,
        suggestedMax: 60,
      },
    },
  };

  const stageLabelMap = {
    0: 'awake',
    1: 'light',
    2: 'rem',
    3: 'deep',
  } as Record<number, string>;

  const sleepStageMap: Record<string, number> = {
    awake: 0,
    light: 1,
    rem: 2,
    deep: 3,
  };

  // const stageData: ChartData<'line', { x: Date; y: number }[], Date> = {
  //   datasets: [
  //     {
  //       type: 'line',
  //       label: 'Inferred Sleep Stage',
  //       data: sortedData.map(d => ({
  //         x: new Date(d.timestamp * 1000),
  //         y: sleepStageMap[inferSleepStage(d.hr, d.respiratoryRate, baselineHR, baselineRR)],
  //       })),
  //       backgroundColor: sortedData.map(d =>
  //         getStageColor(inferSleepStage(d.hr, d.respiratoryRate, baselineHR, baselineRR))
  //       ),
  //       borderWidth: 0,
  //       pointRadius: 5,
  //       showLine: false,
  //       fill: false,
  //     } satisfies ChartDataset<'line', { x: Date; y: number }[]>,
  //   ],
  // };

  const spo2Baseline = userStats?.spo2Baseline ?? 0;

  const stageData: ChartData<'line', { x: Date; y: number }[], Date> | null = userStats
  ? {
      datasets: [
        {
          type: 'line',
          label: 'Inferred Sleep Stage',
          data: sortedData.map(d => {
            const { hr, respiratoryRate, spo2 } = d;
            const isValid = (v: number | null | undefined) => typeof v === 'number' && v > 0 && !isNaN(v);

            if (!isValid(hr) || !isValid(respiratoryRate)) {
              return {
                x: new Date(d.timestamp * 1000),
                y: sleepStageMap['unknown'], // You can also choose to `return null` and filter later
              };
            }

            const stage = inferSleepStage(
              hr!,
              respiratoryRate!,
              isValid(spo2) ? spo2! : userStats.spo2Baseline,
              userStats.hrBaseline,
              userStats.rrBaseline,
              userStats.spo2Baseline,
              userStats.hrStd,
              userStats.rrStd,
              userStats.spo2Std
            );

            return {
              x: new Date(d.timestamp * 1000),
              y: sleepStageMap[stage],
            };
          }),

          backgroundColor: sortedData.map(d => {
            const { hr, respiratoryRate, spo2 } = d;
            const isValid = (v: number | null | undefined) => typeof v === 'number' && v > 0 && !isNaN(v);

            if (!isValid(hr) || !isValid(respiratoryRate)) return getStageColor('unknown');

            const stage = inferSleepStage(
              hr!,
              respiratoryRate!,
              isValid(spo2) ? spo2! : userStats.spo2Baseline,
              userStats.hrBaseline,
              userStats.rrBaseline,
              userStats.spo2Baseline,
              userStats.hrStd,
              userStats.rrStd,
              userStats.spo2Std
            );
            return getStageColor(stage);
          }),

          borderWidth: 0,
          pointRadius: 5,
          showLine: false,
          fill: false,
        } satisfies ChartDataset<'line', { x: Date; y: number }[]>,
      ],
    }
  : null;

  const stageChartOptions: ChartOptions<'line'> = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        display: false,
      },
    },
    scales: {
      ...(chartOptions.scales ?? {}),
      y: {
        type: 'linear',
        min: -0.5,
        max: 3.5,
        ticks: {
          stepSize: 1,
          callback: (val) => {
            const n = typeof val === 'number' ? val : parseFloat(val);
            return stageLabelMap[Math.round(n)] ?? '';
          },
          color: '#94a3b8',
          font: {
            size: 12,
          },
        },
        reverse: true,
        grid: {
          color: 'rgba(255,255,255,0.05)',
          // @ts-expect-error: drawBorder is missing from inferred type, but valid in Chart.js
          drawBorder: false,
        },
      },
    },
  };



  const lastTimestamp = sensorData[sensorData.length - 1]?.timestamp ?? 0;
  const isConnected = now - lastTimestamp < 30;

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-white">Sleep Dashboard</h1>
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 rounded-full ${
                isConnected ? 'bg-green-400' : 'bg-red-500'
              }`}
              title={isConnected ? 'Receiving Data' : 'Disconnected'}
            />
            <button
              onClick={() => setPaused(prev => !prev)}
              className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold hover:bg-blue-700"
            >
              {paused ? 'Resume' : 'Pause'} Updates
            </button>
            <button
              onClick={handleDeleteLatest}
              className="rounded bg-yellow-600 px-4 py-1.5 text-sm font-semibold hover:bg-yellow-700"
            >
              Delete Latest
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <SummaryCard title="Avg HR" value={activeSession?.avgHR ?? '--'} unit="bpm" />
          <SummaryCard title="Avg SpO₂" value={activeSession?.avgSpO2 ?? '--'} unit="%" />
          <SummaryCard title="Avg Resp Rate" value={activeSession?.avgRR ?? '--'} unit="brpm" />
          <SummaryCard
                title="Data Points"
                value={
                  activeSession
                    ? `HR: ${activeSession.data.filter(d => d.hr != null).length}, ` +
                      `SpO₂: ${activeSession.data.filter(d => d.spo2 != null).length}, ` +
                      `RR: ${activeSession.data.filter(d => d.respiratoryRate != null).length}`
                    : '--'
                }
                unit=""
              />
        </div>

        <div className="mt-3 space-y-2">
            {/* Header: always visible */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <h2 className="text-sm font-medium text-slate-300">Sessions</h2>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                <label htmlFor="filter" className="text-slate-400">Time Range:</label>
                <select
                  id="filter"
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value as any);
                    setSessionIndex(sessions.length - 1);
                  }}
                  className="rounded bg-slate-800 px-3 py-1 text-white border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="24h">Last 24h</option>
                  <option value="7d">Last 7d</option>
                  <option value="30d">Last 30d</option>
                </select>
              </div>
            </div>

            {sessions.length > 0 ? (
              <div ref={sessionScrollRef} className="flex overflow-x-auto gap-2 pb-2">
            {sessions.map((s, i) => {
              const isMostRecent = i === sessions.length - 1;
              const isSelected = i === sessionIndex;

              return (
                <div
                  key={s.start}
                  className={`relative min-w-[160px] flex-shrink-0 rounded-lg px-3 py-2 text-left text-xs sm:text-sm font-medium transition-all cursor-pointer
                    ${isSelected ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700/80'}`}
                >
                  <button
                    onClick={() => setSessionIndex(i)}
                    className="w-full text-left"
                  >
                    <div className="font-semibold truncate">{new Date(s.start * 1000).toLocaleDateString()}</div>
                    <div className="text-xs opacity-70 truncate">
                      {new Date(s.start * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(s.end * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {isMostRecent && (
                      <div className="mt-1 text-[10px] font-bold text-amber-400">Most Recent</div>
                    )}
                  </button>

                  {/* 🗑 Delete icon positioned top-right */}
                  <button
                    onClick={async () => {
                      const confirmed = confirm('Delete this session?');
                      if (!confirmed) return;
                      try {
                        const res = await fetch(`/api/data?sessionStart=${s.start}`, { method: 'DELETE' });
                        if (res.ok) {
                          const updated = await fetch('/api/data');
                          const updatedData = await updated.json();
                          updatedData.sort((a: SensorData, b: SensorData) => a.timestamp - b.timestamp);
                          setSensorData(updatedData);
                          setSessionIndex(Math.max(0, sessions.length - 2)); // update index safely
                        }
                      } catch (err) {
                        console.error('Failed to delete session:', err);
                      }
                    }}
                    title="Delete session"
                    className="absolute top-1 right-1 text-slate-400 hover:text-red-400 p-1"
                  >
                    🗑
                  </button>
                </div>
              );
            })}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic mt-2">No sessions in this time range.</p>
            )}
          </div>

        <Tabs value={chartTab} onValueChange={setChartTab} className="w-full">
          <TabsList className="mb-4 bg-slate-400">
            <TabsTrigger value="hrspo2">Heart Rate & SpO₂</TabsTrigger>
            <TabsTrigger value="rr">Respiratory Rate</TabsTrigger>
            <TabsTrigger value="stages">Sleep Stages</TabsTrigger>
          </TabsList>

          <TabsContent value="hrspo2">
            <div className="relative h-[300px] rounded-xl bg-slate-800/70 backdrop-blur border border-slate-700 p-4 shadow-lg">
              {activeSession?.data.length > 0 ? (
                <Line data={hrSpo2Data} options={chartOptions} />
              ) : (
                <p className="text-slate-400">No HR/SpO₂ data available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="rr">
            <div className="relative h-[300px] rounded-xl bg-slate-800/70 backdrop-blur border border-slate-700 p-4 shadow-lg">
              {activeSession?.data.length > 0 ? (
                <Line data={rrData} options={rrChartOptions} />
              ) : (
                <p className="text-slate-400">No respiratory data available.</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="stages">
            <div className="relative h-[300px] rounded-xl bg-slate-800/70 backdrop-blur border border-slate-700 p-4 shadow-lg">
              {activeSession?.data.length > 0 && stageData ? (
                <Line data={stageData} options={stageChartOptions} />
              ) : (
                <p className="text-slate-400">No stage inference possible.</p>
              )}
            </div>
          </TabsContent>

        </Tabs>

      </div>
    </main>
  );
}

function groupSleepSessions(sensorData: SensorData[]): SleepSession[] {
  if (sensorData.length === 0) return [];
  const sorted = [...sensorData].sort((a, b) => a.timestamp - b.timestamp);
  const SLEEP_GAP = 30 * 60;
  const sessions: SleepSession[] = [];
  let current: SensorData[] = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    if (curr.timestamp - prev.timestamp > SLEEP_GAP) {
      sessions.push(createSession(current));
      current = [curr];
    } else {
      current.push(curr);
    }
  }

  if (current.length > 0) {
    sessions.push(createSession(current));
  }

  return sessions;
}

function createSession(data: SensorData[]): SleepSession {
  const start = data[0].timestamp;
  const end = data[data.length - 1].timestamp;

  const valid = (v: number | null | undefined) => typeof v === 'number' && v > 0 && !isNaN(v);

  const avg = (values: (number | null | undefined)[]) => {
    const filtered = values.filter(valid) as number[];
    return filtered.length > 0
      ? Math.round(filtered.reduce((a, b) => a + b, 0) / filtered.length)
      : null; // or 0 if you prefer default fallback
  };

  const avgHR = avg(data.map(d => d.hr));
  const avgSpO2 = avg(data.map(d => d.spo2));
  const avgRR = avg(data.map(d => d.respiratoryRate));
  const avgMvmnt = avg(data.map(d => d.movementRate));

  return { start, end, data, avgHR, avgSpO2, avgRR, avgMvmnt };
}


function SummaryCard({ title, value, unit }: { title: string; value: number | string; unit: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg bg-slate-800/80 backdrop-blur p-4 shadow border border-slate-700 hover:scale-[1.01] transition">
      <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
      <p className="mt-1 text-2xl font-bold text-white">
        {value}
        {unit && <span className="ml-1 text-base text-slate-400">{unit}</span>}
      </p>
    </div>
  );
}


