import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { 
  Users, TrendingUp, TrendingDown, Clock, Target, AlertTriangle,
  CheckCircle, XCircle, BarChart3, PieChart as PieChartIcon, Activity,
  Calendar, RefreshCw, Lock, Eye, EyeOff, Database
} from 'lucide-react';
import { getLocalEvents, calculateDashboardData, saveApiEvents, DashboardData } from '../../lib/analyticsData';
import { QuizEvent } from '../../lib/analytics';
import { getEventsFromSupabase, convertToQuizEvent } from '../../lib/supabase';

const COLORS = ['#F7D844', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];

interface DateRange {
  start: Date;
  end: Date;
  label: string;
}

export const Dashboard: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<QuizEvent[]>([]);
  const [selectedRange, setSelectedRange] = useState<string>('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'funnel' | 'answers' | 'events'>('overview');
  const [dataSource, setDataSource] = useState<'local' | 'supabase' | 'mixed'>('local');

  const dateRanges: Record<string, DateRange> = {
    '24h': { start: subDays(new Date(), 1), end: new Date(), label: 'Últimas 24 horas' },
    '7d': { start: subDays(new Date(), 7), end: new Date(), label: 'Últimos 7 dias' },
    '30d': { start: subDays(new Date(), 30), end: new Date(), label: 'Últimos 30 dias' },
    '90d': { start: subDays(new Date(), 90), end: new Date(), label: 'Últimos 90 dias' },
    'all': { start: new Date(2020, 0, 1), end: new Date(), label: 'Todo o período' }
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    const correctPassword = 'admin123';
    
    if (password === correctPassword) {
      setIsAuthenticated(true);
      loadEvents();
    } else {
      setError('Senha incorreta');
    }
    
    setLoading(false);
  };

  const loadEvents = async () => {
    setLoading(true);
    
    const localEvents = getLocalEvents();
    let allEvents: QuizEvent[] = [...localEvents];
    let source: 'local' | 'supabase' | 'mixed' = 'local';

    try {
      const supabaseEvents = await getEventsFromSupabase();
      if (supabaseEvents.length > 0) {
        const convertedEvents = supabaseEvents.map(convertToQuizEvent);
        allEvents = [...localEvents, ...convertedEvents];
        source = localEvents.length > 0 ? 'mixed' : 'supabase';
      }
    } catch (error) {
      console.warn('Could not fetch from Supabase:', error);
    }

    const uniqueEvents = Array.from(
      new Map(allEvents.map(e => [e.id, e])).values()
    );
    
    setEvents(uniqueEvents);
    setDataSource(source);
    setLoading(false);
  };

  const dashboardData = useMemo(() => {
    const range = dateRanges[selectedRange];
    return calculateDashboardData(events, { 
      start: startOfDay(range.start), 
      end: endOfDay(range.end) 
    });
  }, [events, selectedRange]);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Quiz Analytics</h1>
            <p className="text-gray-400">Digite a senha para acessar</p>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                placeholder="Senha"
                className="w-full bg-gray-700/50 border border-gray-600 rounded-xl py-3 pl-11 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleLogin}
              disabled={loading || !password}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-yellow-500/25"
            >
              {loading ? 'Verificando...' : 'Acessar o Dashboard'}
            </button>
          </div>

          <p className="text-gray-500 text-xs text-center mt-6">
            Senha padrão: admin123
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <header className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Quiz Analytics Dashboard</h1>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-400">{events.length} eventos registrados</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs flex items-center gap-1 ${
                    dataSource === 'supabase' ? 'bg-green-500/20 text-green-400' :
                    dataSource === 'mixed' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    <Database className="w-3 h-3" />
                    {dataSource === 'supabase' ? 'Supabase' : dataSource === 'mixed' ? 'Local + Supabase' : 'Local'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={selectedRange}
                onChange={(e) => setSelectedRange(e.target.value)}
                className="bg-gray-700/50 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-500"
              >
                {Object.entries(dateRanges).map(([key, range]) => (
                  <option key={key} value={key}>{range.label}</option>
                ))}
              </select>

              <button
                onClick={loadEvents}
                disabled={loading}
                className="bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-lg p-2 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          <div className="flex gap-1 mt-4 overflow-x-auto pb-2">
            {(['overview', 'funnel', 'answers', 'events'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'bg-yellow-500 text-black'
                    : 'bg-gray-700/50 hover:bg-gray-700 text-gray-300'
                }`}
              >
                {tab === 'overview' && 'Resumo'}
                {tab === 'funnel' && 'Funil'}
                {tab === 'answers' && 'Respostas'}
                {tab === 'events' && 'Eventos'}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {activeTab === 'overview' && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                title="Sessões Totais"
                value={dashboardData.totalSessions}
                icon={<Users className="w-5 h-5" />}
                color="blue"
              />
              <StatCard
                title="Concluídos"
                value={dashboardData.completedSessions}
                subtitle={`${dashboardData.completionRate.toFixed(1)}%`}
                icon={<CheckCircle className="w-5 h-5" />}
                color="green"
              />
              <StatCard
                title="Abandonos"
                value={dashboardData.abandonedSessions}
                icon={<XCircle className="w-5 h-5" />}
                color="red"
              />
              <StatCard
                title="Tempo Médio"
                value={formatTime(dashboardData.avgCompletionTime)}
                icon={<Clock className="w-5 h-5" />}
                color="purple"
                isText
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-yellow-500" />
                  Sessões por Dia
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dashboardData.timeSeriesData}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F7D844" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#F7D844" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#F7D844' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="sessions" name="Sessões" stroke="#F7D844" fillOpacity={1} fill="url(#colorSessions)" />
                      <Area type="monotone" dataKey="completions" name="Concluídos" stroke="#4ECDC4" fillOpacity={1} fill="url(#colorCompletions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-yellow-500" />
                  Status das Sessões
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Concluídos', value: dashboardData.completedSessions, color: '#4ECDC4' },
                          { name: 'Abandonados', value: dashboardData.abandonedSessions, color: '#FF6B6B' },
                          { name: 'Em Andamento', value: Math.max(0, dashboardData.totalSessions - dashboardData.completedSessions - dashboardData.abandonedSessions), color: '#F7D844' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {[
                          { name: 'Concluídos', value: dashboardData.completedSessions, color: '#4ECDC4' },
                          { name: 'Abandonados', value: dashboardData.abandonedSessions, color: '#FF6B6B' },
                          { name: 'Em Andamento', value: Math.max(0, dashboardData.totalSessions - dashboardData.completedSessions - dashboardData.abandonedSessions), color: '#F7D844' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                Taxa de Abandono por Etapa
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.stepStats.filter(s => s.step <= 14)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis type="number" domain={[0, 100]} stroke="#9CA3AF" tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                    <YAxis dataKey="stepName" type="category" stroke="#9CA3AF" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                      formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taxa de Abandono']}
                    />
                    <Bar dataKey="abandonRate" fill="#FF6B6B" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}

        {activeTab === 'funnel' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-yellow-500" />
              Funil de Conversão
            </h3>
            <div className="space-y-3">
              {dashboardData.funnel.filter(f => f.step <= 18).map((step, index) => {
                const maxUsers = dashboardData.funnel[0]?.users || 1;
                const widthPercent = (step.users / maxUsers) * 100;
                
                return (
                  <div key={step.step} className="relative">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{step.stepName}</span>
                          <span className="text-gray-400">{step.users} usuários</span>
                        </div>
                        <div className="h-8 bg-gray-700 rounded-lg overflow-hidden relative">
                          <div
                            className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
                            style={{ width: `${widthPercent}%` }}
                          />
                          {step.dropoff > 0 && (
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-red-400 font-medium">
                              -{step.dropoff} ({step.dropoffRate.toFixed(1)}%)
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    {index < dashboardData.funnel.filter(f => f.step <= 18).length - 1 && step.dropoff > 0 && (
                      <div className="ml-4 pl-8 py-1">
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'answers' && (
          <div className="space-y-6">
            {Object.entries(dashboardData.answerDistribution).map(([stepNum, answers]) => {
              const step = parseInt(stepNum);
              const stepStats = dashboardData.stepStats.find(s => s.step === step);
              const sortedAnswers = Object.entries(answers)
                .sort(([, a], [, b]) => b - a);
              const totalAnswers = sortedAnswers.reduce((sum, [, count]) => sum + count, 0);

              return (
                <div key={step} className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Etapa {step}: {stepStats?.stepName}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {sortedAnswers.map(([answer, count], index) => {
                        const percentage = (count / totalAnswers) * 100;
                        return (
                          <div key={answer} className="relative">
                            <div className="flex justify-between text-sm mb-1">
                              <span className="truncate pr-4">{answer}</span>
                              <span className="text-gray-400 whitespace-nowrap">{count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-6 bg-gray-700 rounded overflow-hidden">
                              <div
                                className="h-full transition-all duration-500"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: COLORS[index % COLORS.length]
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={sortedAnswers.map(([name, value]) => ({ name, value }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                            dataKey="value"
                            label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                          >
                            {sortedAnswers.map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}

            {Object.keys(dashboardData.answerDistribution).length === 0 && (
              <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-12 text-center">
                <PieChartIcon className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Ainda não há dados de respostas disponíveis</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-700">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-yellow-500" />
                Eventos Recentes
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Hora</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tipo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Etapa</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Resposta</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Tempo</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-400">Sessão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {dashboardData.recentEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm text-gray-300">
                        {format(new Date(event.timestamp), 'dd/MM HH:mm:ss')}
                      </td>
                      <td className="px-4 py-3">
                        <EventTypeBadge type={event.eventType} />
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="text-gray-400">#{event.step}</span> {event.stepName}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-300 max-w-xs truncate">
                        {event.answer || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {event.timeSpentOnStep ? formatTime(event.timeSpentOnStep / 1000) : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 font-mono">
                        {event.sessionId.slice(0, 8)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {dashboardData.recentEvents.length === 0 && (
                <div className="p-12 text-center">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Ainda não há eventos registrados</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'purple' | 'yellow';
  isText?: boolean;
}> = ({ title, value, subtitle, icon, color, isText }) => {
  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/30',
    green: 'from-green-500/20 to-green-600/20 border-green-500/30',
    red: 'from-red-500/20 to-red-600/20 border-red-500/30',
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
    yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30',
  };

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl border rounded-2xl p-4`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColors[color]}>{icon}</span>
        <span className="text-gray-400 text-sm">{title}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`${isText ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>
          {value}
        </span>
        {subtitle && (
          <span className="text-green-400 text-sm font-medium">{subtitle}</span>
        )}
      </div>
    </div>
  );
};

const EventTypeBadge: React.FC<{ type: string }> = ({ type }) => {
  const styles: Record<string, string> = {
    quiz_start: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    step_view: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    step_complete: 'bg-green-500/20 text-green-400 border-green-500/30',
    answer_selected: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    quiz_complete: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    quiz_abandon: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const labels: Record<string, string> = {
    quiz_start: 'Início',
    step_view: 'Visualização',
    step_complete: 'Concluído',
    answer_selected: 'Resposta',
    quiz_complete: 'Finalizado',
    quiz_abandon: 'Abandono',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[type] || styles.step_view}`}>
      {labels[type] || type}
    </span>
  );
};

export default Dashboard;
