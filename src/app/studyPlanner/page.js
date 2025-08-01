"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import Sidebar from "../components/sidebar";
import StudyStreakWidget from "../components/StudyStreakWidget";

const StudyPlannerDashboard = () => {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  
  // Core state
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // UI state
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user data and test results
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch test results
      const resultsResponse = await fetch(`http://localhost:5000/api/user-test-results/${userId}`);
      if (resultsResponse.ok) {
        const data = await resultsResponse.json();
        setTestResults(data.results || []);
      }

      // Fetch user stats
      const statsResponse = await fetch(`http://localhost:5000/api/user-stats/${userId}`);
      if (statsResponse.ok) {
        const data = await statsResponse.json();
        setUserStats(data.stats || {});
      }

      // Fetch existing tasks
      await fetchTasks();

    } catch (error) {
      console.error('Error fetching user data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user tasks
  const fetchTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-tasks/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (error) {
      console.warn('Failed to fetch tasks:', error);
    }
  };

  // Generate AI suggestions based on performance
  const generateAISuggestions = async () => {
    if (!testResults.length || aiLoading) return;

    try {
      setAiLoading(true);

      // Get recent test performance and detailed analysis
      const recentTests = testResults.slice(0, 3);
      const detailedAnalysis = performDetailedAnalysis(recentTests);

      // Enhanced prompt data with specific mistake analysis
      const promptData = {
        user_id: userId,
        detailed_analysis: detailedAnalysis,
        request_type: 'specific_study_suggestions'
      };

      const response = await fetch('http://localhost:5000/api/detailed-ai-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promptData),
      });

      if (response.ok) {
        const data = await response.json();
        setAiSuggestions(data.suggestions || []);
      } else {
        // Fallback to enhanced rule-based suggestions
        setAiSuggestions(generateEnhancedSuggestions(detailedAnalysis));
      }

    } catch (error) {
      console.warn('AI suggestions failed, using enhanced fallback:', error);
      const detailedAnalysis = performDetailedAnalysis(testResults.slice(0, 3));
      setAiSuggestions(generateEnhancedSuggestions(detailedAnalysis));
    } finally {
      setAiLoading(false);
    }
  };

  // Identify weak topics from test results
  const identifyWeakTopics = (tests) => {
    const topicScores = {};
    
    tests.forEach(test => {
      if (test.subject_scores) {
        Object.entries(test.subject_scores).forEach(([subject, score]) => {
          if (!topicScores[subject]) topicScores[subject] = [];
          
          let numericScore = 0;
          if (typeof score === 'object' && score !== null) {
            if (score.total > 0) {
              numericScore = (score.correct / score.total) * 100;
            }
          } else if (typeof score === 'number') {
            numericScore = score;
          } else if (typeof score === 'string') {
            numericScore = parseFloat(score) || 0;
          }
          
          if (numericScore >= 0 && numericScore <= 100) {
            topicScores[subject].push(numericScore);
          }
        });
      }
    });

    // Calculate average scores and identify weak areas
    const weakTopics = [];
    Object.entries(topicScores).forEach(([subject, scores]) => {
      if (scores.length > 0) {
        const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        if (avgScore < 70) {
          weakTopics.push({ 
            subject: String(subject), 
            score: Number(avgScore.toFixed(1))
          });
        }
      }
    });

    return weakTopics.sort((a, b) => a.score - b.score);
  };

  // Perform detailed analysis of test mistakes and patterns
  const performDetailedAnalysis = (tests) => {
    const analysis = {
      specific_mistakes: [],
      weak_topics: [],
      mistake_patterns: {},
      concept_gaps: [],
      overall_score: calculateAverageScore(tests)
    };

    tests.forEach((test, testIndex) => {
      if (test.detailed_results) {
        test.detailed_results.forEach((result, questionIndex) => {
          if (!result.is_correct) {
            // Capture specific mistake details
            const mistake = {
              test_name: test.testName || `Test ${testIndex + 1}`,
              question_number: questionIndex + 1,
              subject: result.subject || 'Unknown',
              chapter: result.chapter || 'Unknown', 
              topic: result.topic || 'Unknown',
              question_type: result.question_type || 'Unknown',
              user_answer: result.user_answer,
              correct_answer: result.correct_answer,
              difficulty: result.difficulty || 'medium'
            };
            
            analysis.specific_mistakes.push(mistake);
            
            // Track patterns by topic
            const topicKey = `${result.subject}-${result.topic}`;
            if (!analysis.mistake_patterns[topicKey]) {
              analysis.mistake_patterns[topicKey] = {
                subject: result.subject,
                topic: result.topic,
                chapter: result.chapter,
                mistakes: 0,
                total_questions: 0,
                question_types: {}
              };
            }
            
            analysis.mistake_patterns[topicKey].mistakes++;
            
            // Track question types causing issues
            const qType = result.question_type || 'Unknown';
            if (!analysis.mistake_patterns[topicKey].question_types[qType]) {
              analysis.mistake_patterns[topicKey].question_types[qType] = 0;
            }
            analysis.mistake_patterns[topicKey].question_types[qType]++;
          }
          
          // Track total questions per topic
          const topicKey = `${result.subject}-${result.topic}`;
          if (analysis.mistake_patterns[topicKey]) {
            analysis.mistake_patterns[topicKey].total_questions++;
          }
        });
      }
    });

    // Calculate error rates and identify weak topics
    Object.entries(analysis.mistake_patterns).forEach(([topicKey, data]) => {
      const errorRate = (data.mistakes / data.total_questions) * 100;
      if (errorRate > 30) { // More than 30% error rate
        analysis.weak_topics.push({
          subject: data.subject,
          topic: data.topic,
          chapter: data.chapter,
          error_rate: errorRate.toFixed(1),
          mistakes: data.mistakes,
          total: data.total_questions,
          main_issue_types: Object.entries(data.question_types)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 2)
            .map(([type]) => type)
        });
      }
    });

    // Sort weak topics by error rate (worst first)
    analysis.weak_topics.sort((a, b) => parseFloat(b.error_rate) - parseFloat(a.error_rate));

    return analysis;
  };

  // Generate enhanced rule-based suggestions using detailed analysis
  const generateEnhancedSuggestions = (analysis) => {
    const suggestions = [];
    
    // Generate specific topic-based suggestions
    analysis.weak_topics.slice(0, 3).forEach((weakTopic, index) => {
      const mainIssues = weakTopic.main_issue_types.join(' and ');
      
      suggestions.push({
        id: index + 1,
        title: `Master ${weakTopic.topic}`,
        description: `You're struggling with ${weakTopic.topic} in ${weakTopic.subject} (${weakTopic.error_rate}% error rate). Focus on ${mainIssues} questions.`,
        priority: parseFloat(weakTopic.error_rate) > 70 ? "high" : "medium",
        duration: "2 hours",
        category: "practice",
        specific_focus: {
          subject: weakTopic.subject,
          topic: weakTopic.topic,
          chapter: weakTopic.chapter,
          problem_types: weakTopic.main_issue_types
        }
      });
    });

    // Add concept review if many basics are wrong
    const basicConceptErrors = analysis.specific_mistakes.filter(m => 
      m.difficulty === 'easy' || m.question_type === 'Definition'
    ).length;
    
    if (basicConceptErrors > 3) {
      suggestions.push({
        id: suggestions.length + 1,
        title: "Strengthen Fundamentals",
        description: `Review basic concepts - you missed ${basicConceptErrors} fundamental questions. Build a solid foundation before advancing.`,
        priority: "high",
        duration: "3 hours", 
        category: "study"
      });
    }

    // Add targeted practice if pattern emerges
    const questionTypeIssues = {};
    analysis.specific_mistakes.forEach(mistake => {
      const qType = mistake.question_type;
      if (!questionTypeIssues[qType]) questionTypeIssues[qType] = 0;
      questionTypeIssues[qType]++;
    });

    const topProblemType = Object.entries(questionTypeIssues)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (topProblemType && topProblemType[1] > 2) {
      suggestions.push({
        id: suggestions.length + 1,
        title: `Practice ${topProblemType[0]} Questions`,
        description: `You've made ${topProblemType[1]} mistakes on ${topProblemType[0]} questions. Practice this question type specifically.`,
        priority: "medium",
        duration: "1.5 hours",
        category: "practice"
      });
    }

    // Ensure we have at least one suggestion
    if (suggestions.length === 0) {
      suggestions.push({
        id: 1,
        title: "Review Recent Mistakes",
        description: "Go through your recent test results and understand where you went wrong",
        priority: "medium", 
        duration: "1 hour",
        category: "review"
      });
    }

    return suggestions.slice(0, 3);
  };

  // Calculate average score
  const calculateAverageScore = (tests) => {
    if (!tests.length) return 0;
    const totalScore = tests.reduce((sum, test) => sum + (test.percentage || 0), 0);
    return (totalScore / tests.length).toFixed(1);
  };

  // Generate rule-based suggestions as fallback
  const generateRuleBasedSuggestions = () => {
    const suggestions = [];
    const weakTopics = identifyWeakTopics(testResults.slice(0, 3));
    const avgScore = calculateAverageScore(testResults.slice(0, 3));

    // Generate suggestions based on performance
    if (avgScore < 60) {
      suggestions.push({
        id: 1,
        title: "Foundation Building",
        description: "Focus on basic concepts and fundamentals",
        priority: "high",
        duration: "2 hours",
        category: "study"
      });
    }

    if (weakTopics.length > 0) {
      weakTopics.slice(0, 2).forEach((topic, index) => {
        suggestions.push({
          id: suggestions.length + 1,
          title: `Improve ${topic.subject}`,
          description: `Focus on ${topic.subject} - current score: ${topic.score}%`,
          priority: topic.score < 50 ? "high" : "medium",
          duration: "1.5 hours",
          category: "practice"
        });
      });
    }

    suggestions.push({
      id: suggestions.length + 1,
      title: "Practice Test",
      description: "Take a full-length practice test to assess progress",
      priority: "medium",
      duration: "3 hours",
      category: "test"
    });

    return suggestions;
  };

  // Task CRUD operations
  const createTask = async (taskData) => {
    try {
      const response = await fetch('http://localhost:5000/api/user-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, user_id: userId }),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(prev => [...prev, data.task]);
        return data.task;
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  const updateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(prev => prev.map(task => task._id === taskId ? data.task : task));
        return data.task;
      }
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(prev => prev.filter(task => task._id !== taskId));
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  // Apply AI suggestion as a task
  const applySuggestion = async (suggestion) => {
    try {
      // Create date in IST (UTC+5:30)
      const now = new Date();
      const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
      const istTime = new Date(now.getTime() + istOffset);
      
      // Set to 9 AM IST today
      const taskDate = new Date(istTime.getFullYear(), istTime.getMonth(), istTime.getDate(), 9, 0, 0);
      
      const taskData = {
        title: suggestion.title,
        description: suggestion.description,
        category: suggestion.category,
        priority: suggestion.priority,
        duration: parseInt(suggestion.duration.match(/\d+/)?.[0] || '60') * 60, // minutes
        scheduled_date: taskDate.toISOString(),
        tags: ['ai-suggestion']
      };

      await createTask(taskData);
      
      // Remove from suggestions
      setAiSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
      
    } catch (error) {
      console.error('Failed to apply suggestion:', error);
    }
  };

  // Calendar helpers
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getTasksForDate = (day) => {
    if (!day) return [];
    const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    
    return tasks.filter(task => {
      const taskDate = new Date(task.scheduled_date).toISOString().split('T')[0];
      return taskDate === dateString;
    });
  };

  const getCurrentMonth = () => {
    return selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Effects
  useEffect(() => {
    if (isLoaded && userId) {
      fetchUserData();
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    if (testResults.length > 0) {
      generateAISuggestions();
    }
  }, [testResults]);

  // Authentication check
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-primary font-semibold text-lg">Loading Study Planner...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!userId) {
    router.push('/login');
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="text-destructive text-lg mb-4">{error}</div>
            <button 
              onClick={fetchUserData}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Study Planner</h1>
              <p className="text-muted-foreground">AI-powered personalized study recommendations</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={generateAISuggestions}
                disabled={aiLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {aiLoading ? 'Generating...' : 'Get AI Suggestions'}
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                + Add Task
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Stats & Streak */}
            <div className="space-y-6">
              {/* Performance Overview */}
              <div className="bg-card border border-border rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Score</span>
                    <span className="font-semibold">{calculateAverageScore(testResults.slice(0, 5))}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tests Completed</span>
                    <span className="font-semibold">{testResults.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Active Tasks</span>
                    <span className="font-semibold">{tasks.filter(t => t.status !== 'completed').length}</span>
                  </div>
                </div>
              </div>

              {/* Study Streak Widget */}
              <StudyStreakWidget />

              {/* Weak Topics */}
              {identifyWeakTopics(testResults.slice(0, 3)).length > 0 && (
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h2 className="text-xl font-semibold mb-4">Areas to Improve</h2>
                  <div className="space-y-3">
                    {identifyWeakTopics(testResults.slice(0, 3)).slice(0, 3).map((topic, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{topic.subject}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-red-500 h-2 rounded-full" 
                              style={{ width: `${topic.score}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-muted-foreground">{topic.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Calendar */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">{getCurrentMonth()}</h2>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                      className="p-2 hover:bg-accent rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                    >
                      Today
                    </button>
                    <button 
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                      className="p-2 hover:bg-accent rounded-lg"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-2">
                  {getDaysInMonth().map((day, index) => {
                    const dayTasks = getTasksForDate(day);
                    const isToday = day === new Date().getDate() &&
                      selectedDate.getMonth() === new Date().getMonth() &&
                      selectedDate.getFullYear() === new Date().getFullYear();

                    return (
                      <div key={index} className="min-h-[100px] border border-border rounded-lg p-2">
                        {day && (
                          <>
                            <div
                              className={`text-sm font-medium mb-2 cursor-pointer p-1 rounded ${
                                isToday ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                              }`}
                              onClick={() => {
                                setEditingTask(null);
                                setShowTaskModal(true);
                              }}
                            >
                              {day}
                            </div>

                            <div className="space-y-1">
                              {dayTasks.slice(0, 2).map((task) => (
                                <div
                                  key={task._id}
                                  className={`text-xs p-1 rounded cursor-pointer truncate ${
                                    task.category === 'study' ? 'bg-blue-100 text-blue-800' :
                                    task.category === 'practice' ? 'bg-orange-100 text-orange-800' :
                                    task.category === 'test' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  } ${task.status === 'completed' ? 'opacity-60 line-through' : ''}`}
                                  onClick={() => {
                                    setEditingTask(task);
                                    setShowTaskModal(true);
                                  }}
                                  title={task.title}
                                >
                                  {task.title}
                                </div>
                              ))}
                              {dayTasks.length > 2 && (
                                <div className="text-xs text-muted-foreground text-center">
                                  +{dayTasks.length - 2} more
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 mt-6 pt-4 border-t border-border">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
                    <span className="text-sm text-muted-foreground">Study</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-sm"></div>
                    <span className="text-sm text-muted-foreground">Practice</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                    <span className="text-sm text-muted-foreground">Test</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Recommendations - Landscape Mode */}
          <div className="mt-8">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">AI Recommendations</h2>
                <div className="flex items-center space-x-4">
                  {aiLoading && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>}
                  <button
                    onClick={generateAISuggestions}
                    disabled={aiLoading}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm"
                  >
                    {aiLoading ? 'Generating...' : 'Refresh Suggestions'}
                  </button>
                </div>
              </div>
              
              {aiSuggestions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="text-lg font-medium mb-2">No AI suggestions available</div>
                  <div className="text-muted-foreground mb-4">Take a few tests to get personalized recommendations</div>
                  <button
                    onClick={generateAISuggestions}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Generate Suggestions
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {aiSuggestions.map((suggestion) => (
                    <div key={suggestion.id} className="relative group bg-gradient-to-br from-white to-gray-50 border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${
                            suggestion.priority === 'high' ? 'bg-red-500' :
                            suggestion.priority === 'medium' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}></div>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                            suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
                            suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {suggestion.priority}
                          </span>
                        </div>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          suggestion.category === 'study' ? 'bg-blue-100 text-blue-600' :
                          suggestion.category === 'practice' ? 'bg-orange-100 text-orange-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {suggestion.category === 'study' ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z"/>
                            </svg>
                          ) : suggestion.category === 'practice' ? (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29l-1.43-1.43z"/>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                            </svg>
                          )}
                        </div>
                      </div>
                      
                      <h3 className="font-semibold text-lg mb-2 text-gray-900">{suggestion.title}</h3>
                      <div className="relative">
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{suggestion.description}</p>
                        
                        {/* Hover Tooltip */}
                        <div className="absolute bottom-full left-0 right-0 mb-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                          <div className="bg-gray-900 text-white text-sm rounded-lg p-4 shadow-xl max-w-sm mx-auto">
                            <div className="font-medium mb-2">{suggestion.title}</div>
                            <div className="text-gray-300 leading-relaxed">{suggestion.description}</div>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>{suggestion.duration}</span>
                        </div>
                        <button
                          onClick={() => applySuggestion(suggestion)}
                          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 text-sm font-medium transition-colors"
                        >
                          Add to Calendar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <TaskModal
          isOpen={showTaskModal}
          onClose={() => {
            setShowTaskModal(false);
            setEditingTask(null);
          }}
          task={editingTask}
          onSave={async (taskData) => {
            try {
              if (editingTask) {
                await updateTask(editingTask._id, taskData);
              } else {
                await createTask(taskData);
              }
              setShowTaskModal(false);
              setEditingTask(null);
            } catch (error) {
              console.error('Failed to save task:', error);
            }
          }}
          onDelete={editingTask ? async () => {
            await deleteTask(editingTask._id);
            setShowTaskModal(false);
            setEditingTask(null);
          } : null}
        />
      )}
    </div>
  );
};

// Simple Task Modal Component
const TaskModal = ({ isOpen, onClose, task, onSave, onDelete }) => {
  // Helper function to get IST datetime string
  const getISTDateTime = (date = new Date()) => {
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istTime = new Date(date.getTime() + istOffset);
    
    // Format for datetime-local input (YYYY-MM-DDTHH:MM)
    const year = istTime.getFullYear();
    const month = String(istTime.getMonth() + 1).padStart(2, '0');
    const day = String(istTime.getDate()).padStart(2, '0');
    const hours = String(istTime.getHours()).padStart(2, '0');
    const minutes = String(istTime.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'study',
    priority: 'medium',
    duration: 60,
    scheduled_date: getISTDateTime(),
    status: 'pending'
  });

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        category: task.category || 'study',
        priority: task.priority || 'medium',
        duration: task.duration || 60,
        scheduled_date: getISTDateTime(new Date(task.scheduled_date)),
        status: task.status || 'pending'
      });
    } else {
      // Reset form for new task
      setFormData({
        title: '',
        description: '',
        category: 'study',
        priority: 'medium',
        duration: 60,
        scheduled_date: getISTDateTime(),
        status: 'pending'
      });
    }
  }, [task]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {task ? 'Edit Task' : 'Create Task'}
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Task description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="study">Study</option>
                <option value="practice">Practice</option>
                <option value="test">Test</option>
                <option value="review">Review</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                min="15"
                step="15"
              />
            </div>

            {task && (
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>
        </div>

        <div className="flex justify-between space-x-3 mt-6">
          <div>
            {onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Convert IST datetime back to UTC
                const istDateTime = new Date(formData.scheduled_date);
                const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
                const utcDateTime = new Date(istDateTime.getTime() - istOffset);
                
                const taskData = {
                  ...formData,
                  scheduled_date: utcDateTime.toISOString()
                };
                onSave(taskData);
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              {task ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlannerDashboard;
