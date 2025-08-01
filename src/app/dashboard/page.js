"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Sidebar from "../components/sidebar";

// Import ApexCharts dynamically to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// Constants for better organization
const TIME_RANGES = {
  all: "All Time",
  "7days": "Last 7 Days",
  "30days": "Last 30 Days",
  "90days": "Last 90 Days"
};

const CHART_COLORS = {
  primary: 'hsl(var(--chart-1))',
  secondary: 'hsl(var(--chart-2))',
  tertiary: 'hsl(var(--chart-3))',
  quaternary: 'hsl(var(--chart-4))',
  quinary: 'hsl(var(--chart-5))'
};

export default function Dashboard() {
  const { isLoaded, userId } = useAuth();
  const [testResults, setTestResults] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("all");
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.push('/login');
      return;
    }
  }, [isLoaded, userId, router]);

  const fetchTestResults = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch test results
      const resultsResponse = await fetch(`http://localhost:5000/api/user-test-results/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (resultsResponse.ok) {
        const resultsData = await resultsResponse.json();
        setTestResults(resultsData.results || []);
        console.log('Test results fetched:', resultsData.results?.length || 0, 'tests');
        console.log('Sample test result:', resultsData.results?.[0]);
      }

      // Fetch user statistics
      const statsResponse = await fetch(`http://localhost:5000/api/user-stats/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData);
        console.log('User stats fetched:', statsData);
        console.log('User stats details:', statsData.stats);
      }

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoaded && userId) fetchTestResults();
  }, [fetchTestResults, isLoaded, userId]);

  const getFilteredResults = () => {
    if (selectedTimeRange === "all") return testResults;

    const now = new Date();
    const filterDate = new Date();
    const days = { "7days": 7, "30days": 30, "90days": 90 }[selectedTimeRange];
    filterDate.setDate(now.getDate() - days);

    return testResults.filter(result => {
      const testDate = new Date(result.completedAt);
      return !isNaN(testDate) && testDate >= filterDate;
    });
  };

  const getStats = () => {
    const filtered = getFilteredResults();
    if (!filtered.length) return null;

    const totalTests = filtered.length;
    const totalQuestions = filtered.reduce((sum, test) => sum + (test.totalQuestions || 0), 0);
    const totalCorrect = filtered.reduce((sum, test) => sum + (test.correctAnswers || test.results?.correct_answers || 0), 0);
    const avgScore = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : '0.0';
    const avgTime = Math.round(filtered.reduce((sum, test) => sum + (test.timeTaken || 0), 0) / totalTests / 60);

    return { totalTests, avgScore, avgTime, totalQuestions };
  };

  const calculateTrends = () => {
    const filtered = getFilteredResults();
    if (filtered.length < 2) return { testsChange: '+0%', scoreChange: '+0%', questionsChange: '+0', timeChange: '+0m' };

    // Compare last 3 tests vs previous 3 tests (or available tests)
    const recentCount = Math.min(3, Math.floor(filtered.length / 2));
    const currentPeriod = filtered.slice(-recentCount);
    const previousPeriod = filtered.slice(-(recentCount * 2), -recentCount);

    if (previousPeriod.length === 0) return { testsChange: '+0%', scoreChange: '+0%', questionsChange: '+0', timeChange: '+0m' };

    // Calculate current metrics (recent tests)
    const currentTests = currentPeriod.length;
    const currentQuestions = currentPeriod.reduce((sum, test) => sum + (test.totalQuestions || 0), 0);
    const currentCorrect = currentPeriod.reduce((sum, test) => sum + (test.correctAnswers || test.results?.correct_answers || 0), 0);
    const currentAvgScore = currentQuestions > 0 ? (currentCorrect / currentQuestions) * 100 : 0;
    const currentAvgTime = currentPeriod.length > 0 ? currentPeriod.reduce((sum, test) => sum + (test.timeTaken || 0), 0) / currentPeriod.length / 60 : 0;

    // Calculate previous metrics (earlier tests)
    const previousTests = previousPeriod.length;
    const previousQuestions = previousPeriod.reduce((sum, test) => sum + (test.totalQuestions || 0), 0);
    const previousCorrect = previousPeriod.reduce((sum, test) => sum + (test.correctAnswers || test.results?.correct_answers || 0), 0);
    const previousAvgScore = previousQuestions > 0 ? (previousCorrect / previousQuestions) * 100 : 0;
    const previousAvgTime = previousPeriod.length > 0 ? previousPeriod.reduce((sum, test) => sum + (test.timeTaken || 0), 0) / previousPeriod.length / 60 : 0;

    // Calculate changes
    const testsChangePercent = previousTests > 0 ? ((currentTests - previousTests) / previousTests * 100).toFixed(1) : 0;
    const scoreChangePercent = previousAvgScore > 0 ? ((currentAvgScore - previousAvgScore) / previousAvgScore * 100).toFixed(1) : 0;
    
    // For questions, show average per test rather than total (more meaningful)
    const currentAvgQuestions = currentTests > 0 ? currentQuestions / currentTests : 0;
    const previousAvgQuestions = previousTests > 0 ? previousQuestions / previousTests : 0;
    const questionsChange = currentAvgQuestions - previousAvgQuestions;
    
    const timeChange = (previousAvgTime - currentAvgTime).toFixed(1); // Positive means faster

    // Calculate consistency (lower standard deviation = higher consistency)
    const allScores = filtered.map(test => parseFloat(test.results?.percentage || test.results?.accuracy || 0));
    const avgScore = allScores.reduce((sum, score) => sum + score, 0) / allScores.length;
    const variance = allScores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / allScores.length;
    const standardDeviation = Math.sqrt(variance);
    const consistency = Math.max(0, Math.min(100, 100 - (standardDeviation * 2))); // Scale to 0-100

    return {
      testsChange: `${testsChangePercent >= 0 ? '+' : ''}${testsChangePercent}%`,
      scoreChange: `${scoreChangePercent >= 0 ? '+' : ''}${scoreChangePercent}%`,
      questionsChange: `${questionsChange >= 0 ? '+' : ''}${questionsChange.toFixed(1)}`,
      timeChange: `${timeChange >= 0 ? '-' : '+'}${Math.abs(timeChange)}m`,
      consistency: consistency.toFixed(0)
    };
  };

  const getChartData = () => {
    const filtered = getFilteredResults();

    // Performance trend - limit to last 10 tests for cleaner visualization
    const recentTests = filtered.slice(-10);
    const performanceTrend = recentTests.map((test, index) => ({
      name: `Test ${recentTests.length - index}`,
      score: parseFloat(test.results?.percentage || test.results?.accuracy || 0),
      date: test.completedAt ? new Date(test.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `T${index + 1}`
    }));

    // Enhanced subject performance with better data handling
    const subjectData = {};
    let hasSubjectData = false;

    filtered.forEach(test => {
      const subjectResults = test.results?.subject_scores || test.subjectScores || {};

      // Handle different subject score formats
      Object.entries(subjectResults).forEach(([subject, data]) => {
        hasSubjectData = true;
        if (!subjectData[subject]) {
          subjectData[subject] = { total: 0, correct: 0, tests: 0 };
        }

        // Handle different data structures
        if (typeof data === 'object' && data !== null) {
          subjectData[subject].total += data.total || data.totalQuestions || 0;
          subjectData[subject].correct += data.correct || data.correctAnswers || 0;
        } else if (typeof data === 'number') {
          // If data is just a percentage
          subjectData[subject].total += 100;
          subjectData[subject].correct += data;
        }
        subjectData[subject].tests += 1;
      });
    });

    // Create subject performance array with validation
    const subjectPerformance = hasSubjectData
      ? Object.entries(subjectData)
        .filter(([_, data]) => data.total > 0) // Only include subjects with actual data
        .map(([subject, data]) => ({
          subject: subject.charAt(0).toUpperCase() + subject.slice(1), // Proper capitalization
          score: parseFloat(((data.correct / data.total) * 100).toFixed(1)),
          tests: data.tests
        }))
        .sort((a, b) => b.score - a.score) // Sort by performance
      : [];

    // Score distribution - show even with minimal data
    const scoreDistribution = filtered.length >= 1 ? (() => {
      const ranges = { "Excellent (90-100%)": 0, "Good (70-89%)": 0, "Needs Work (<70%)": 0 };
      filtered.forEach(test => {
        const score = parseFloat(test.results?.percentage || test.results?.accuracy || 0);
        if (score >= 90) ranges["Excellent (90-100%)"]++;
        else if (score >= 70) ranges["Good (70-89%)"]++;
        else ranges["Needs Work (<70%)"]++;
      });

      return Object.entries(ranges)
        .filter(([_, count]) => count > 0) // Only show ranges with data
        .map(([range, count]) => ({
          range,
          count,
          percentage: ((count / filtered.length) * 100).toFixed(0)
        }));
    })() : [];

    return {
      performanceTrend,
      subjectPerformance,
      scoreDistribution,
      hasSubjectData,
      totalTests: filtered.length
    };
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-primary font-semibold text-lg">Loading Dashboard...</div>
          </div>
        </div>
      </div>
    );
  }

  if (testResults.length === 0) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto text-center pt-20">
            <div className="w-20 h-20 mx-auto mb-8 bg-primary/10 rounded-2xl flex items-center justify-center">
              <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Welcome to Your Dashboard</h1>
            <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto">
              Start your AI-powered learning journey with personalized assessments and track your progress with detailed analytics.
            </p>
            <button
              onClick={() => router.push('/mockTests')}
              className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-lg"
            >
              Take Your First Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = getStats();
  const trends = calculateTrends();
  const chartData = getChartData();
  const COLORS = [CHART_COLORS.primary, CHART_COLORS.secondary, CHART_COLORS.tertiary];

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Premium Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
          <div className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-10">
            <div className="px-8 py-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Performance Analytics
                      </h1>
                      <p className="text-muted-foreground text-lg font-medium mt-1">
                        Executive insights into your learning journey
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-1 shadow-lg">
                    <select
                      value={selectedTimeRange}
                      onChange={(e) => setSelectedTimeRange(e.target.value)}
                      className="bg-transparent border-0 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                    >
                      {Object.entries(TIME_RANGES).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Export Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          {/* Premium Executive Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
              {/* Total Tests Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                        {stats.totalTests}
                      </div>
                      <div className={`text-sm font-semibold mt-1 ${trends.testsChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {trends.testsChange} this period
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Total Assessments</div>
                    <div className="text-foreground/80 text-xs mt-1">Comprehensive evaluations completed</div>
                  </div>
                </div>
              </div>

              {/* Average Score Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                        {stats.avgScore}%
                      </div>
                      <div className={`text-sm font-semibold mt-1 ${trends.scoreChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {trends.scoreChange} improvement
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Performance Index</div>
                    <div className="text-foreground/80 text-xs mt-1">Average accuracy across all tests</div>
                  </div>
                </div>
              </div>

              {/* Questions Solved Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .311-.06m0 0a5.99 5.99 0 0 1 2.448-2.448 14.9 14.9 0 0 1-.311.06" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-500 bg-clip-text text-transparent">
                        {stats.totalQuestions}
                      </div>
                      <div className={`text-sm font-semibold mt-1 ${trends.questionsChange.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {trends.questionsChange} avg per test
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Problem Mastery</div>
                    <div className="text-foreground/80 text-xs mt-1">Total questions attempted</div>
                  </div>
                </div>
              </div>

              {/* Average Time Card */}
              <div className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02]">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                    <div className="text-right">
                      <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">
                        {stats.avgTime}m
                      </div>
                      <div className={`text-sm font-semibold mt-1 ${trends.timeChange.startsWith('-') ? 'text-green-600' : 'text-red-600'}`}>
                        {trends.timeChange} {trends.timeChange.startsWith('-') ? 'faster' : 'slower'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-sm font-medium uppercase tracking-wider">Efficiency Metric</div>
                    <div className="text-foreground/80 text-xs mt-1">Average completion time</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Premium Performance Analytics */}
          <div className="mb-12">
            {/* Performance Trend - Full Width Premium Chart */}
            <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Performance Trajectory
                      </h3>
                      <p className="text-muted-foreground font-medium">Strategic learning progression analysis</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-semibold">
                      ↗ Trending Up
                    </div>
                    <button className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
                <div style={{ height: "350px" }} className="relative">
                  {typeof window !== 'undefined' && (
                    <ReactApexChart
                      type="line"
                      height={350}
                      options={{
                        chart: {
                          toolbar: {
                            show: false,
                          },
                          zoom: {
                            enabled: false,
                          },
                          background: 'transparent',
                          fontFamily: 'Inter, sans-serif',
                        },
                        stroke: {
                          curve: 'smooth',
                          width: 4,
                        },
                        colors: ['#3B82F6'],
                        fill: {
                          type: 'gradient',
                          gradient: {
                            shade: 'light',
                            type: 'vertical',
                            shadeIntensity: 0.3,
                            gradientToColors: ['#60A5FA'],
                            inverseColors: false,
                            opacityFrom: 0.6,
                            opacityTo: 0.05,
                          },
                        },
                        grid: {
                          borderColor: '#E5E7EB',
                          strokeDashArray: 3,
                          xaxis: {
                            lines: {
                              show: false,
                            },
                          },
                          yaxis: {
                            lines: {
                              show: true,
                            },
                          },
                        },
                        markers: {
                          size: 8,
                          colors: ['#3B82F6'],
                          strokeWidth: 3,
                          strokeColors: '#ffffff',
                          hover: {
                            size: 12,
                          },
                          discrete: chartData.performanceTrend.map((item, index) => ({
                            seriesIndex: 0,
                            dataPointIndex: index,
                            fillColor: '#3B82F6',
                            strokeColor: '#ffffff',
                            size: 8,
                          })),
                        },
                        xaxis: {
                          categories: chartData.performanceTrend.map(item => item.name),
                          labels: {
                            style: {
                              colors: '#374151',
                              fontSize: '14px',
                              fontWeight: 700,
                              fontFamily: 'Inter, sans-serif',
                            },
                            offsetY: 5,
                          },
                          axisBorder: {
                            show: true,
                            color: '#E5E7EB',
                            height: 1,
                          },
                          axisTicks: {
                            show: true,
                            color: '#E5E7EB',
                            height: 6,
                          },
                        },
                        yaxis: {
                          min: 0,
                          max: 100,
                          tickAmount: 5,
                          labels: {
                            style: {
                              colors: '#374151',
                              fontSize: '14px',
                              fontWeight: 700,
                              fontFamily: 'Inter, sans-serif',
                            },
                            formatter: (value) => `${value}%`,
                            offsetX: -10,
                          },
                        },
                        tooltip: {
                          theme: 'light',
                          style: {
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                          },
                          marker: {
                            show: true,
                          },
                          y: {
                            formatter: (value) => `${value}% accuracy`,
                            title: {
                              formatter: () => 'Performance: ',
                            },
                          },
                          custom: function ({ series, seriesIndex, dataPointIndex, w }) {
                            return '<div class="bg-white p-3 rounded-lg shadow-lg border">' +
                              '<div class="font-bold text-gray-800">' + w.globals.labels[dataPointIndex] + '</div>' +
                              '<div class="text-blue-600 font-semibold">' + series[seriesIndex][dataPointIndex] + '% Score</div>' +
                              '</div>';
                          },
                        },
                        legend: {
                          show: false,
                        },
                        dataLabels: {
                          enabled: true,
                          style: {
                            fontSize: '12px',
                            fontWeight: 'bold',
                            colors: ['#374151'],
                          },
                          background: {
                            enabled: true,
                            foreColor: '#ffffff',
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: '#E5E7EB',
                            opacity: 0.9,
                          },
                          offsetY: -10,
                          formatter: function (val) {
                            return val + '%';
                          },
                        },
                      }}
                      series={[
                        {
                          name: 'Performance Score',
                          data: chartData.performanceTrend.map(item => parseFloat(item.score)),
                        },
                      ]}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Premium Score Distribution Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            {/* Score Distribution Chart */}
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-transparent to-blue-500/3 opacity-50"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Score Distribution
                      </h3>
                      <p className="text-muted-foreground font-medium">Performance segmentation analysis</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center" style={{ height: "350px" }}>
                  {chartData.scoreDistribution.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center h-full">
                      <div className="w-20 h-20 bg-muted/20 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-foreground mb-2">No Score Data</h4>
                      <p className="text-muted-foreground text-sm">
                        Complete some tests to see your score distribution
                      </p>
                    </div>
                  ) : typeof window !== 'undefined' && (
                    <ReactApexChart
                      type="donut"
                      height={350}
                      options={{
                        chart: {
                          toolbar: {
                            show: false,
                          },
                          background: 'transparent',
                          fontFamily: 'Inter, sans-serif',
                        },
                        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
                        labels: chartData.scoreDistribution.map(item => item.range),
                        legend: {
                          position: 'bottom',
                          fontSize: '15px',
                          fontWeight: 700,
                          labels: {
                            colors: '#374151',
                            useSeriesColors: false,
                          },
                          markers: {
                            width: 14,
                            height: 14,
                            radius: 7,
                            offsetX: -5,
                          },
                          itemMargin: {
                            horizontal: 15,
                            vertical: 8,
                          },
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: '60%',
                              labels: {
                                show: true,
                                name: {
                                  show: true,
                                  fontSize: '18px',
                                  fontWeight: 700,
                                  color: '#374151',
                                  offsetY: -10,
                                },
                                value: {
                                  show: true,
                                  fontSize: '32px',
                                  fontWeight: 800,
                                  color: '#1F2937',
                                  offsetY: 10,
                                  formatter: function (val) {
                                    return parseInt(val);
                                  },
                                },
                                total: {
                                  show: true,
                                  showAlways: true,
                                  label: 'Total Tests',
                                  fontSize: '16px',
                                  fontWeight: 600,
                                  color: '#6B7280',
                                  formatter: function (w) {
                                    return w.globals.seriesTotals.reduce((a, b) => {
                                      return a + b;
                                    }, 0);
                                  },
                                },
                              },
                            },
                          },
                        },
                        dataLabels: {
                          enabled: true,
                          formatter: (val, opts) => {
                            return Math.round(val) + '%';
                          },
                          style: {
                            fontSize: '14px',
                            fontWeight: 800,
                            colors: ['#ffffff'],
                          },
                          dropShadow: {
                            enabled: true,
                            top: 2,
                            left: 2,
                            blur: 3,
                            opacity: 0.8,
                          },
                        },
                        tooltip: {
                          theme: 'light',
                          style: {
                            fontSize: '14px',
                            fontFamily: 'Inter, sans-serif',
                          },
                          y: {
                            formatter: (value) => `${value} tests`,
                            title: {
                              formatter: (seriesName) => seriesName + ': ',
                            },
                          },
                        },
                        stroke: {
                          width: 4,
                          colors: ['#ffffff'],
                        },
                        states: {
                          hover: {
                            filter: {
                              type: 'lighten',
                              value: 0.1,
                            },
                          },
                        },
                      }}
                      series={chartData.scoreDistribution.map(item => item.count)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="space-y-6">
              <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-6 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">Excellence Rate</h4>
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {chartData.scoreDistribution.length > 0 
                      ? chartData.scoreDistribution.filter(item => item.range.includes('Excellent')).reduce((sum, item) => sum + parseInt(item.percentage), 0)
                      : Math.round((getFilteredResults().filter(test => parseFloat(test.results?.percentage || test.results?.accuracy || 0) >= 80).length / getFilteredResults().length) * 100)
                    }%
                  </div>
                  <p className="text-sm text-muted-foreground">Tests scoring 80% or above</p>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-6 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">Growth Trend</h4>
                  <div className={`text-3xl font-bold mb-1 ${trends.scoreChange.startsWith('+') ? 'text-blue-600' : 'text-red-600'}`}>
                    {trends.scoreChange}
                  </div>
                  <p className="text-sm text-muted-foreground">Score improvement this period</p>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-6 shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent"></div>
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-bold text-foreground mb-2">Consistency</h4>
                  <div className="text-3xl font-bold text-orange-600 mb-1">{trends.consistency}%</div>
                  <p className="text-sm text-muted-foreground">Performance stability</p>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Recent Activity */}
          <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 mb-12">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/3 via-transparent to-gray-500/3 opacity-50"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                      Recent Activity
                    </h3>
                    <p className="text-muted-foreground font-medium">Latest assessment performance</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary/10 text-primary rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {getFilteredResults().slice(-5).reverse().map((test, index) => (
                  <div key={index} className="group relative overflow-hidden bg-gradient-to-r from-background/50 to-background/30 border border-border/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01]">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${parseFloat(test.results?.percentage || test.results?.accuracy || 0) >= 80
                            ? 'bg-gradient-to-br from-green-500 to-green-600'
                            : parseFloat(test.results?.percentage || test.results?.accuracy || 0) >= 60
                              ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                              : 'bg-gradient-to-br from-red-500 to-red-600'
                          }`}>
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-bold text-foreground text-lg mb-1">{test.testName}</div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m0 0h2a2 2 0 002-2V7a2 2 0 00-2-2H9m0 0V3m0 2v2m0-2h2m-2 0H7m2 0v2m0 0V9m0-2h2m-2 2H7" />
                              </svg>
                              <span>
                                {test.completedAt && !isNaN(new Date(test.completedAt))
                                  ? new Date(test.completedAt).toLocaleDateString()
                                  : 'Recent'}
                              </span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              <span>{Math.round((test.timeTaken || 0) / 60)}m</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-3xl font-bold mb-1 ${parseFloat(test.results?.percentage || test.results?.accuracy || 0) >= 80
                            ? 'text-green-600'
                            : parseFloat(test.results?.percentage || test.results?.accuracy || 0) >= 60
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                          {test.results?.percentage || test.results?.accuracy || '0'}%
                        </div>
                        <div className={`text-xs font-semibold px-3 py-1 rounded-full ${parseFloat(test.results?.percentage || test.results?.accuracy || 0) >= 80
                            ? 'bg-green-100 text-green-800'
                            : parseFloat(test.results?.percentage || test.results?.accuracy || 0) >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {parseFloat(test.results?.percentage || test.results?.accuracy || 0) >= 80
                            ? 'Excellent'
                            : parseFloat(test.results?.percentage || test.results?.accuracy || 0) >= 60
                              ? 'Good'
                              : 'Needs Work'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Premium Action Center */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 rounded-3xl blur-lg opacity-30 transform scale-110"></div>
              <button
                onClick={() => router.push('/mockTests')}
                className="relative px-12 py-5 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-3xl font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl"
              >
                <span className="flex items-center space-x-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Launch New Assessment</span>
                </span>
              </button>
            </div>
            <p className="text-muted-foreground text-sm mt-4 font-medium">
              Continue your learning journey with AI-powered assessments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}