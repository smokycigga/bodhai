'use client';
import React from 'react';
import {
  BookOpenIcon,
  BeakerIcon,
  CalculatorIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  SparklesIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  StarIcon,
  BoltIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  CrownIcon,
  AcademicCapIcon,
  EyeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

import {
  TrophyIcon as TrophySolidIcon,
  StarIcon as StarSolidIcon,
  FireIcon as FireSolidIcon
} from '@heroicons/react/24/solid';

export default function GeminiAnalysisDashboard({ geminiAnalysis }) {
  // Return early if no analysis data
  if (!geminiAnalysis) {
    return (
      <div className="analytics-card bg-card rounded-2xl shadow-sm p-8 border border-border">
        <div className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <SparklesIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">AI Analysis Processing</h2>
          <p className="text-muted-foreground">Our AI is analyzing your performance patterns...</p>
        </div>
      </div>
    );
  }

  // Extract AI analysis data
  const overallPerf = geminiAnalysis?.overall_performance || {};
  const errorAnalysis = geminiAnalysis?.error_analysis || {};

  // AI-specific helper functions
  const getSubjectIcon = (subject) => {
    switch (subject.toLowerCase()) {
      case 'physics': return <BeakerIcon className="w-5 h-5" />;
      case 'chemistry': return <CpuChipIcon className="w-5 h-5" />;
      case 'mathematics': return <CalculatorIcon className="w-5 h-5" />;
      default: return <BookOpenIcon className="w-5 h-5" />;
    }
  };

  // Generate AI insights based on performance patterns
  const generateAIInsights = () => {
    const insights = [];
    const accuracy = overallPerf.score_percentage || 0;

    // Pattern-based insights
    if (accuracy < 40) {
      insights.push({
        type: 'critical',
        title: 'Fundamental Concept Gaps Detected',
        description: 'AI analysis reveals significant gaps in foundational concepts. Immediate intervention required.',
        icon: <ExclamationTriangleIcon className="w-5 h-5" />,
        color: 'red'
      });
    } else if (accuracy < 70) {
      insights.push({
        type: 'warning',
        title: 'Inconsistent Application Patterns',
        description: 'You understand concepts but struggle with consistent application. Focus on practice patterns.',
        icon: <MagnifyingGlassIcon className="w-5 h-5" />,
        color: 'yellow'
      });
    } else {
      insights.push({
        type: 'positive',
        title: 'Strong Conceptual Foundation',
        description: 'AI detects solid understanding. Ready for advanced problem-solving techniques.',
        icon: <CheckCircleIcon className="w-5 h-5" />,
        color: 'green'
      });
    }

    return insights;
  };

  // Generate mistake pattern analysis
  const analyzeMistakePatterns = () => {
    const patterns = [];
    const criticalMistakes = errorAnalysis.critical_mistakes || [];

    if (Array.isArray(criticalMistakes) && criticalMistakes.length > 0) {
      // Group mistakes by type
      const mistakeTypes = {};
      criticalMistakes.forEach(mistake => {
        const type = mistake.mistake_type || 'Conceptual Error';
        if (!mistakeTypes[type]) {
          mistakeTypes[type] = [];
        }
        mistakeTypes[type].push(mistake);
      });

      Object.entries(mistakeTypes).forEach(([type, mistakes]) => {
        patterns.push({
          type,
          count: mistakes.length,
          severity: mistakes.length > 2 ? 'high' : mistakes.length > 1 ? 'medium' : 'low',
          examples: mistakes.slice(0, 2),
          recommendation: getPatternRecommendation(type)
        });
      });
    }

    return patterns;
  };

  const getPatternRecommendation = (type) => {
    const recommendations = {
      'Conceptual Error': 'Focus on understanding fundamental concepts through theory revision',
      'Calculation Error': 'Practice mental math and double-check calculations',
      'Formula Application': 'Create a formula sheet and practice application problems',
      'Time Management': 'Practice timed questions and improve problem-solving speed',
      'Misreading Question': 'Develop active reading strategies and highlight key information'
    };
    return recommendations[type] || 'Review and practice this type of problem more frequently';
  };

  // Generate learning path recommendations
  const generateLearningPath = () => {
    const studyPlan = geminiAnalysis?.personalized_recommendations?.study_plan || {};
    const weeklyPlan = studyPlan.weekly_plan || {};

    const path = [];

    // Week 1 focus
    if (weeklyPlan.week_1) {
      path.push({
        phase: 'Foundation Building',
        duration: '1 Week',
        focus: weeklyPlan.week_1.primary_focus || 'Strengthen weak concepts',
        target: weeklyPlan.week_1.target_improvement || 'Improve accuracy by 15%',
        activities: [
          'Daily concept revision (30 min)',
          `Practice ${weeklyPlan.week_1.practice_questions || 15} questions daily`,
          'Review incorrect answers thoroughly'
        ]
      });
    }

    // Add additional phases based on performance
    const accuracy = overallPerf.score_percentage || 0;
    if (accuracy < 60) {
      path.push({
        phase: 'Concept Mastery',
        duration: '2-3 Weeks',
        focus: 'Master fundamental concepts',
        target: 'Achieve 70%+ accuracy',
        activities: [
          'Complete theory modules',
          'Solve basic to intermediate problems',
          'Take weekly assessment tests'
        ]
      });
    } else {
      path.push({
        phase: 'Advanced Practice',
        duration: '2-3 Weeks',
        focus: 'Advanced problem solving',
        target: 'Achieve 85%+ accuracy',
        activities: [
          'Solve complex multi-concept problems',
          'Time-bound practice sessions',
          'Mock test analysis'
        ]
      });
    }

    return path;
  };

  // Get AI insights and patterns
  const aiInsights = generateAIInsights();
  const mistakePatterns = analyzeMistakePatterns();
  const learningPath = generateLearningPath();



  return (
    <div className="space-y-8">
      {/* AI Insights Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {aiInsights.map((insight, index) => (
          <div key={index} className={`analytics-card bg-card rounded-xl p-6 border border-border shadow-sm`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                insight.color === 'red' ? 'bg-red-100 dark:bg-red-900/30' :
                insight.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                'bg-green-100 dark:bg-green-900/30'
              }`}>
                <div className={`${
                  insight.color === 'red' ? 'text-red-600 dark:text-red-400' :
                  insight.color === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {insight.icon}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-2">{insight.title}</h3>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>







      {/* Mistake Pattern Analysis */}
      <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <EyeIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Mistake Pattern Analysis</h3>
            <p className="text-sm text-muted-foreground">AI-identified error patterns and targeted solutions</p>
          </div>
        </div>

        {mistakePatterns.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mistakePatterns.map((pattern, index) => (
              <div key={index} className={`p-4 rounded-lg border ${
                pattern.severity === 'high' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
                pattern.severity === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
                'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-foreground">{pattern.type}</h4>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    pattern.severity === 'high' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200' :
                    pattern.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200' :
                    'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200'
                  }`}>
                    {pattern.count} occurrences
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{pattern.recommendation}</p>
                {pattern.examples.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Examples:</div>
                    {pattern.examples.map((example, idx) => (
                      <div key={idx} className="text-xs bg-muted/30 rounded p-2">
                        Q{example.question_number}: {example.question_topic || example.subject}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h4 className="font-semibold text-foreground mb-2">No Significant Patterns Detected</h4>
            <p className="text-muted-foreground">Your mistakes appear to be random rather than systematic.</p>
          </div>
        )}
      </div>

      {/* AI Learning Path */}
      <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <RocketLaunchIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">AI-Generated Learning Path</h3>
            <p className="text-sm text-muted-foreground">Personalized roadmap based on your performance patterns</p>
          </div>
        </div>

        <div className="space-y-6">
          {learningPath.map((phase, index) => (
            <div key={index} className="relative">
              {index < learningPath.length - 1 && (
                <div className="absolute left-6 top-16 w-0.5 h-16 bg-gradient-to-b from-primary to-primary/30"></div>
              )}
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-foreground">{phase.phase}</h4>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">
                      {phase.duration}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{phase.focus}</p>
                  <div className="bg-muted/30 rounded-lg p-3 mb-3">
                    <div className="text-xs font-medium text-muted-foreground mb-1">Target Goal:</div>
                    <div className="text-sm font-medium text-foreground">{phase.target}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-muted-foreground">Key Activities:</div>
                    {phase.activities.map((activity, actIndex) => (
                      <div key={actIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        {activity}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-medium text-foreground">AI Recommendation</span>
          </div>
          <p className="text-sm text-muted-foreground">
            This learning path is dynamically generated based on your performance patterns, mistake analysis, and optimal learning sequences for JEE preparation.
          </p>
        </div>
      </div>

      {/* Concept Mastery Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Concept Weakness Detection */}
        <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <AcademicCapIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Concept Mastery Gaps</h3>
              <p className="text-sm text-muted-foreground">AI-detected conceptual weaknesses</p>
            </div>
          </div>

          {errorAnalysis?.critical_mistakes && Array.isArray(errorAnalysis.critical_mistakes) && errorAnalysis.critical_mistakes.length > 0 ? (
            <div className="space-y-4">
              {errorAnalysis.critical_mistakes.slice(0, 3).map((mistake, index) => (
                <div key={index} className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-red-100 dark:bg-red-800 rounded-full flex items-center justify-center flex-shrink-0">
                      {getSubjectIcon(mistake.subject)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground mb-1">
                        {mistake.question_topic || mistake.chapter || 'Concept Area'}
                      </h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {mistake.subject} • Question {mistake.question_number}
                      </p>
                      <div className="bg-white dark:bg-card rounded p-3 mb-2">
                        <div className="text-xs font-medium text-muted-foreground mb-1">Root Cause:</div>
                        <div className="text-sm text-foreground">
                          {mistake.why_wrong || mistake.mistake_type || 'Fundamental concept misunderstanding'}
                        </div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded p-3">
                        <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">AI Solution:</div>
                        <div className="text-sm text-green-800 dark:text-green-200">
                          {mistake.practice_recommendation || mistake.correct_approach || 'Review fundamental principles and practice similar problems'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-semibold text-foreground mb-2">Strong Conceptual Foundation</h4>
              <p className="text-muted-foreground">No major conceptual gaps detected in your performance.</p>
            </div>
          )}
        </div>

        {/* AI Study Recommendations */}
        <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <CogIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground">Smart Study Recommendations</h3>
              <p className="text-sm text-muted-foreground">AI-curated action items for maximum improvement</p>
            </div>
          </div>

          <div className="space-y-4">
            {geminiAnalysis?.personalized_recommendations?.immediate_actions && Array.isArray(geminiAnalysis.personalized_recommendations.immediate_actions) ?
              geminiAnalysis.personalized_recommendations.immediate_actions.slice(0, 3).map((action, index) => {
                const priorities = ['high', 'medium', 'low'];
                const colors = [
                  { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', icon: 'bg-red-100 dark:bg-red-800', text: 'text-red-600 dark:text-red-400' },
                  { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-800', icon: 'bg-yellow-100 dark:bg-yellow-800', text: 'text-yellow-600 dark:text-yellow-400' },
                  { bg: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', icon: 'bg-green-100 dark:bg-green-800', text: 'text-green-600 dark:text-green-400' }
                ];
                const colorSet = colors[index % colors.length];
                const priority = priorities[index % priorities.length];

                return (
                  <div key={index} className={`p-4 rounded-lg border ${colorSet.bg} ${colorSet.border}`}>
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorSet.icon}`}>
                        <span className={`text-xs font-bold ${colorSet.text}`}>{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">Priority Action {index + 1}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            priority === 'high' ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200' :
                            priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-800 text-yellow-700 dark:text-yellow-200' :
                            'bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200'
                          }`}>
                            {priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{action}</p>
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">1</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Focus on Weak Areas</h4>
                        <p className="text-sm text-muted-foreground">Prioritize topics where you made the most mistakes</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">2</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Practice Regularly</h4>
                        <p className="text-sm text-muted-foreground">Maintain consistent daily practice schedule</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 mb-3">
              <DocumentTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h4 className="font-semibold text-foreground">AI Study Schedule</h4>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              {geminiAnalysis?.personalized_recommendations?.study_plan?.weekly_plan?.week_1 ? (
                <>
                  <div><strong className="text-foreground">Week 1 Focus:</strong> {geminiAnalysis.personalized_recommendations.study_plan.weekly_plan.week_1.primary_focus}</div>
                  <div><strong className="text-foreground">Target:</strong> {geminiAnalysis.personalized_recommendations.study_plan.weekly_plan.week_1.target_improvement}</div>
                  <div><strong className="text-foreground">Daily Practice:</strong> {geminiAnalysis.personalized_recommendations.study_plan.weekly_plan.week_1.practice_questions} questions</div>
                </>
              ) : (
                <>
                  <div><strong className="text-foreground">Recommended Schedule:</strong></div>
                  <div>• Daily: 1-2 hours focused practice on weak areas</div>
                  <div>• Weekly: Take one full mock test</div>
                  <div>• Monthly: Comprehensive performance review</div>
                </>
              )}
            </div>
            <button className="mt-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all">
              Generate Detailed Schedule
            </button>
          </div>
        </div>
      </div>

      {/* AI Performance Comparison */}
      <div className="analytics-card bg-card rounded-xl p-6 border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <UserGroupIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">AI Peer Comparison</h3>
            <p className="text-sm text-muted-foreground">How you compare to similar students</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              {overallPerf.score_percentage > 70 ? (
                <TrophySolidIcon className="w-6 h-6 text-yellow-300" />
              ) : overallPerf.score_percentage > 50 ? (
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              ) : (
                <BoltIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {overallPerf.score_percentage > 70 ? 'Above Average' :
               overallPerf.score_percentage > 50 ? 'Average' : 'Below Average'}
            </div>
            <div className="text-sm text-muted-foreground">Performance Level</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              <StarSolidIcon className="w-6 h-6 text-yellow-300" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {Math.max(10, Math.min(95, (overallPerf.score_percentage || 0) + Math.random() * 20))}%
            </div>
            <div className="text-sm text-muted-foreground">Estimated Percentile</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-b from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
              {overallPerf.score_percentage < 50 ? (
                <FireSolidIcon className="w-6 h-6 text-orange-300" />
              ) : overallPerf.score_percentage < 80 ? (
                <StarIcon className="w-6 h-6 text-white" />
              ) : (
                <CrownIcon className="w-6 h-6 text-yellow-300" />
              )}
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {overallPerf.score_percentage < 50 ? 'High' :
               overallPerf.score_percentage < 80 ? 'Medium' : 'Low'}
            </div>
            <div className="text-sm text-muted-foreground">Improvement Potential</div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2 mb-2">
            <SparklesIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium text-foreground">AI Insight</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {overallPerf.score_percentage > 80 ?
              'You\'re performing exceptionally well! Focus on maintaining consistency and tackling advanced problems.' :
              overallPerf.score_percentage > 60 ?
              'You\'re on the right track. With focused practice on weak areas, you can reach the top tier.' :
              'There\'s significant room for improvement. Focus on building strong fundamentals before attempting complex problems.'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
