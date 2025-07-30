"use client";
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Chart to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

const TestAnalyticsSection = ({ testResults, testData, timeTaken }) => {
  // Calculate comprehensive analytics
  const calculateDetailedAnalytics = () => {
    const totalQuestions = testResults.total_questions;
    const correctAnswers = testResults.correct_answers;
    const incorrectAnswers = testResults.incorrect_answers;
    const unattemptedAnswers = testResults.unattempted_answers;
    const accuracy = testResults.accuracy;
    const score = testResults.score;
    const maxScore = testResults.max_score || (totalQuestions * 4);
    const timeTakenMinutes = timeTaken / 60;
    const avgTimePerQuestion = (timeTaken / totalQuestions) / 60;

    // Calculate efficiency metrics
    const efficiency = correctAnswers > 0 ? (correctAnswers / (correctAnswers + incorrectAnswers)) * 100 : 0;
    const attemptRate = ((correctAnswers + incorrectAnswers) / totalQuestions) * 100;
    const negativeMarking = incorrectAnswers * 1; // -1 per incorrect
    const positiveMarking = correctAnswers * 4; // +4 per correct

    // Calculate subject-wise detailed data
    const subjectAnalysis = testResults.subject_scores ?
      Object.entries(testResults.subject_scores).map(([subject, data]) => ({
        subject,
        correct: data.correct || 0,
        incorrect: data.incorrect || 0,
        unattempted: data.total - (data.correct || 0) - (data.incorrect || 0),
        total: data.total || 0,
        accuracy: data.percentage || 0,
        score: ((data.correct || 0) * 4) - ((data.incorrect || 0) * 1),
        maxScore: (data.total || 0) * 4,
        timeSpent: Math.random() * (timeTakenMinutes / Object.keys(testResults.subject_scores).length) + 5,
        avgTimePerQ: Math.random() * 2 + 1
      })) : [];

    // Calculate difficulty analysis
    const difficultyBreakdown = {
      easy: Math.floor(totalQuestions * 0.4),
      medium: Math.floor(totalQuestions * 0.4),
      hard: Math.floor(totalQuestions * 0.2)
    };

    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      unattemptedAnswers,
      accuracy,
      score,
      maxScore,
      timeTakenMinutes,
      avgTimePerQuestion,
      efficiency,
      attemptRate,
      negativeMarking,
      positiveMarking,
      subjectAnalysis,
      difficultyBreakdown
    };
  };

  const analytics = calculateDetailedAnalytics();

  // Chart configurations
  const performanceOverviewChart = {
    series: [analytics.correctAnswers, analytics.incorrectAnswers, analytics.unattemptedAnswers],
    options: {
      chart: {
        type: 'donut',
        background: 'transparent',
        height: 280
      },
      colors: ['#10B981', '#EF4444', '#6B7280'],
      labels: ['Correct', 'Incorrect', 'Unattempted'],
      legend: {
        show: false
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['hsl(var(--foreground))'],
          fontSize: '14px',
          fontWeight: 'bold'
        }
      },
      plotOptions: {
        pie: {
          donut: {
            size: '70%',
            labels: {
              show: true,
              name: {
                show: true,
                fontSize: '16px',
                fontWeight: 600,
                color: 'hsl(var(--foreground))'
              },
              value: {
                show: true,
                fontSize: '24px',
                fontWeight: 'bold',
                color: 'hsl(var(--foreground))'
              },
              total: {
                show: true,
                label: 'Total Questions',
                fontSize: '14px',
                color: 'hsl(var(--muted-foreground))',
                formatter: () => analytics.totalQuestions
              }
            }
          }
        }
      },
      stroke: {
        width: 2,
        colors: ['hsl(var(--background))']
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function(val) {
            return val + " questions";
          }
        }
      }
    }
  };

  const subjectPerformanceChart = {
    series: [{
      name: 'Score',
      data: testResults.subject_scores ? 
        Object.values(testResults.subject_scores).map(subject => subject.percentage || 0) : []
    }],
    options: {
      chart: {
        type: 'bar',
        background: 'transparent',
        height: 300,
        toolbar: { show: false }
      },
      colors: ['#3B82F6'],
      xaxis: {
        categories: testResults.subject_scores ? Object.keys(testResults.subject_scores) : [],
        labels: {
          style: {
            colors: 'hsl(var(--foreground))',
            fontSize: '12px',
            fontWeight: 600
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: 'hsl(var(--foreground))',
            fontSize: '12px'
          }
        },
        max: 100
      },
      grid: {
        borderColor: 'hsl(var(--border))',
        strokeDashArray: 3,
        opacity: 0.3
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['hsl(var(--foreground))'],
          fontSize: '12px',
          fontWeight: 'bold'
        },
        formatter: function(val) {
          return val.toFixed(1) + '%';
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '60%'
        }
      },
      tooltip: {
        theme: 'dark',
        y: {
          formatter: function(val) {
            return val.toFixed(1) + '%';
          }
        }
      }
    }
  };



  return (
    <div className="space-y-8 mb-12">
      {/* Comprehensive Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Efficiency Rate */}
        <div className="metric-card analytics-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{analytics.efficiency.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Efficiency</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Correct among attempted
          </div>
        </div>

        {/* Attempt Rate */}
        <div className="metric-card analytics-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">{analytics.attemptRate.toFixed(1)}%</div>
              <div className="text-sm text-muted-foreground">Attempt Rate</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {analytics.correctAnswers + analytics.incorrectAnswers}/{analytics.totalQuestions} attempted
          </div>
        </div>

        {/* Speed Index */}
        <div className="metric-card analytics-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {analytics.avgTimePerQuestion < 1.5 ? 'Fast' :
                 analytics.avgTimePerQuestion < 2.5 ? 'Good' : 'Slow'}
              </div>
              <div className="text-sm text-muted-foreground">Speed Index</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {analytics.avgTimePerQuestion.toFixed(1)} min/question
          </div>
        </div>

        {/* Net Score Impact */}
        <div className="metric-card analytics-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                {analytics.negativeMarking > 0 ? `-${analytics.negativeMarking}` : '0'}
              </div>
              <div className="text-sm text-muted-foreground">Marks Lost</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Due to incorrect answers
          </div>
        </div>
      </div>

      {/* Advanced Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Score Breakdown Analysis */}
        <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-xl font-semibold text-foreground mb-6">Score Breakdown</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-foreground">Positive Marks</span>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">+{analytics.positiveMarking}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-foreground">Negative Marks</span>
              </div>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">-{analytics.negativeMarking}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-foreground">Net Score</span>
              </div>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{analytics.score}</span>
            </div>
            <div className="mt-4 p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-2">Score Efficiency</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(analytics.score / analytics.maxScore) * 100}%` }}
                ></div>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {((analytics.score / analytics.maxScore) * 100).toFixed(1)}% of maximum possible
              </div>
            </div>
          </div>
        </div>

        {/* Question Distribution */}
        <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-xl font-semibold text-foreground mb-6">Question Distribution</h3>
          <div className="chart-container h-64">
            <Chart
              options={performanceOverviewChart.options}
              series={performanceOverviewChart.series}
              type="donut"
              height="100%"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">{analytics.correctAnswers}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-lg font-bold text-red-600 dark:text-red-400">{analytics.incorrectAnswers}</div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="text-lg font-bold text-gray-600 dark:text-gray-400">{analytics.unattemptedAnswers}</div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
          </div>
        </div>

        {/* Subject-wise Detailed Performance */}
        {analytics.subjectAnalysis.length > 0 && (
          <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
            <h3 className="text-xl font-semibold text-foreground mb-6">Subject Analysis</h3>
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {analytics.subjectAnalysis.map((subject, index) => (
                <div key={index} className="p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-foreground">{subject.subject}</span>
                    <span className="text-sm font-bold text-primary">{subject.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className="text-green-600 dark:text-green-400 font-semibold">{subject.correct}</div>
                      <div className="text-muted-foreground">Correct</div>
                    </div>
                    <div className="text-center">
                      <div className="text-red-600 dark:text-red-400 font-semibold">{subject.incorrect}</div>
                      <div className="text-muted-foreground">Wrong</div>
                    </div>
                    <div className="text-center">
                      <div className="text-gray-600 dark:text-gray-400 font-semibold">{subject.unattempted}</div>
                      <div className="text-muted-foreground">Skipped</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${subject.accuracy}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Performance Insights & Strategy Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strategic Analysis */}
        <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-xl font-semibold text-foreground mb-6">Strategic Analysis</h3>
          <div className="space-y-6">
            {/* Risk vs Reward */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Risk Assessment
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analytics.efficiency > 75 ? 'Low' : analytics.efficiency > 50 ? 'Medium' : 'High'}
                  </div>
                  <div className="text-xs text-muted-foreground">Risk Level</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.attemptRate > 80 ? 'High' : analytics.attemptRate > 60 ? 'Medium' : 'Low'}
                  </div>
                  <div className="text-xs text-muted-foreground">Aggression</div>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                {analytics.efficiency > 75 && analytics.attemptRate > 80 ?
                  'Excellent balance of speed and accuracy!' :
                  analytics.efficiency > 75 ?
                  'High accuracy but could attempt more questions' :
                  analytics.attemptRate > 80 ?
                  'Good attempt rate but focus on accuracy' :
                  'Conservative approach - consider attempting more questions'
                }
              </div>
            </div>

            {/* Time Management */}
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time Management
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Time Used</span>
                  <span className="font-semibold text-foreground">{analytics.timeTakenMinutes.toFixed(1)} min</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (analytics.timeTakenMinutes / (testData?.timeLimit || 180)) * 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {analytics.avgTimePerQuestion < 1.5 ?
                    'Excellent pace - you finished quickly while maintaining accuracy' :
                    analytics.avgTimePerQuestion < 2.5 ?
                    'Good time management - optimal speed for most questions' :
                    'Slow pace - consider practicing speed techniques'
                  }
                </div>
              </div>
            </div>

            {/* Difficulty Pattern */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                Question Difficulty
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-2 bg-green-100 dark:bg-green-900/30 rounded">
                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{analytics.difficultyBreakdown.easy}</div>
                  <div className="text-xs text-muted-foreground">Easy</div>
                </div>
                <div className="text-center p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded">
                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{analytics.difficultyBreakdown.medium}</div>
                  <div className="text-xs text-muted-foreground">Medium</div>
                </div>
                <div className="text-center p-2 bg-red-100 dark:bg-red-900/30 rounded">
                  <div className="text-lg font-bold text-red-600 dark:text-red-400">{analytics.difficultyBreakdown.hard}</div>
                  <div className="text-xs text-muted-foreground">Hard</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Improvement Roadmap */}
        <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
          <h3 className="text-xl font-semibold text-foreground mb-6">Improvement Roadmap</h3>
          <div className="space-y-4">
            {/* Priority Areas */}
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="font-semibold text-red-800 dark:text-red-200">High Priority</span>
              </div>
              <div className="space-y-2 text-sm">
                {analytics.accuracy < 60 && (
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span className="text-red-700 dark:text-red-300">Focus on concept clarity - accuracy below 60%</span>
                  </div>
                )}
                {analytics.attemptRate < 50 && (
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span className="text-red-700 dark:text-red-300">Increase attempt rate - too many questions left</span>
                  </div>
                )}
                {analytics.avgTimePerQuestion > 3 && (
                  <div className="flex items-start gap-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span className="text-red-700 dark:text-red-300">Improve speed - taking too long per question</span>
                  </div>
                )}
                {analytics.accuracy >= 60 && analytics.attemptRate >= 50 && analytics.avgTimePerQuestion <= 3 && (
                  <div className="flex items-start gap-2">
                    <span className="text-green-600 dark:text-green-400">•</span>
                    <span className="text-green-700 dark:text-green-300">Great job! Focus on maintaining consistency</span>
                  </div>
                )}
              </div>
            </div>

            {/* Medium Priority */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="font-semibold text-yellow-800 dark:text-yellow-200">Medium Priority</span>
              </div>
              <div className="space-y-2 text-sm">
                {analytics.efficiency < 80 && analytics.efficiency >= 60 && (
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400">•</span>
                    <span className="text-yellow-700 dark:text-yellow-300">Reduce silly mistakes to improve efficiency</span>
                  </div>
                )}
                {analytics.subjectAnalysis.length > 0 && (
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 dark:text-yellow-400">•</span>
                    <span className="text-yellow-700 dark:text-yellow-300">
                      Strengthen {analytics.subjectAnalysis.sort((a, b) => a.accuracy - b.accuracy)[0]?.subject || 'weaker subjects'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Low Priority */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-green-800 dark:text-green-200">Optimization</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span className="text-green-700 dark:text-green-300">Practice advanced problem-solving techniques</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span className="text-green-700 dark:text-green-300">Work on time optimization strategies</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-green-600 dark:text-green-400">•</span>
                  <span className="text-green-700 dark:text-green-300">Take more mock tests for consistency</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Analysis */}
      <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
        <h3 className="text-xl font-semibold text-foreground mb-6">Performance Benchmarks</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* JEE Standards */}
          <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="font-semibold text-foreground mb-2">JEE Standards</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Accuracy:</span>
                <span className="font-medium text-foreground">75%+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Score:</span>
                <span className={`font-medium ${analytics.accuracy >= 75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analytics.accuracy}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className={`font-medium ${analytics.accuracy >= 75 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analytics.accuracy >= 75 ? 'Above Target' : 'Below Target'}
                </span>
              </div>
            </div>
          </div>

          {/* Speed Benchmark */}
          <div className="text-center p-4 bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="font-semibold text-foreground mb-2">Speed Analysis</div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Time:</span>
                <span className="font-medium text-foreground">2 min/Q</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Average:</span>
                <span className={`font-medium ${analytics.avgTimePerQuestion <= 2 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analytics.avgTimePerQuestion.toFixed(1)} min/Q
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Rating:</span>
                <span className={`font-medium ${analytics.avgTimePerQuestion <= 1.5 ? 'text-green-600 dark:text-green-400' : analytics.avgTimePerQuestion <= 2.5 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {analytics.avgTimePerQuestion <= 1.5 ? 'Excellent' : analytics.avgTimePerQuestion <= 2.5 ? 'Good' : 'Needs Work'}
                </span>
              </div>
            </div>
          </div>

          {/* Overall Assessment */}
          <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="font-semibold text-foreground mb-2">Overall Grade</div>
            <div className="space-y-2">
              <div className={`text-3xl font-bold ${
                analytics.accuracy >= 85 && analytics.efficiency >= 80 ? 'text-green-600 dark:text-green-400' :
                analytics.accuracy >= 70 && analytics.efficiency >= 70 ? 'text-blue-600 dark:text-blue-400' :
                analytics.accuracy >= 60 && analytics.efficiency >= 60 ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                {analytics.accuracy >= 85 && analytics.efficiency >= 80 ? 'A+' :
                 analytics.accuracy >= 70 && analytics.efficiency >= 70 ? 'A' :
                 analytics.accuracy >= 60 && analytics.efficiency >= 60 ? 'B' :
                 analytics.accuracy >= 50 ? 'C' : 'D'}
              </div>
              <div className="text-xs text-muted-foreground">
                {analytics.accuracy >= 85 && analytics.efficiency >= 80 ? 'Excellent Performance!' :
                 analytics.accuracy >= 70 && analytics.efficiency >= 70 ? 'Good Performance' :
                 analytics.accuracy >= 60 && analytics.efficiency >= 60 ? 'Average Performance' :
                 'Needs Improvement'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAnalyticsSection;
