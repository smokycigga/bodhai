"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import Sidebar from "../components/sidebar";
import MathRenderer from "../components/MathRenderer";
import GeminiAnalysisDashboard from './GeminiAnalysisDashboard';
import TestAnalyticsSection from './TestAnalyticsSection';

export default function TakeTest() {
  const [testData, setTestData] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [markedForReview, setMarkedForReview] = useState({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const { isLoaded, userId } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      router.push('/login');
      return;
    }
  }, [isLoaded, userId, router]);

  const handleSubmitTest = useCallback(async () => {
    if (!testData || !testData.questions || !userId) {
      console.error("Test data or user not available");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/evaluate-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          test_id: testData.testId || `test_${Date.now()}`,
          test_name: testData.testName || 'Custom Test',
          questions: testData.questions,
          answers: Object.fromEntries(
            Object.entries(userAnswers).map(([key, value]) => [String(key), value])
          ),
          time_taken: (testData.timeLimit * 60) - timeLeft,
        }),
      });

      if (response.ok) {
        const results = await response.json();
        
        // Transform server response to match expected format
        const transformedResults = {
          total_questions: results.total_questions,
          correct_answers: results.correct_answers,
          incorrect_answers: results.incorrect_answers,
          unattempted_answers: results.total_questions - results.correct_answers - results.incorrect_answers,
          score: results.score,
          score_percentage: results.percentage, // Add this field
          max_score: results.total_questions * 4,
          accuracy: results.percentage,
          subject_scores: results.subject_scores || {}
        };
        
        setTestResults(transformedResults);
        
        // Generate Gemini AI analysis
        generateGeminiAnalysis(transformedResults, userId);

        try {
          const testResultData = {
            userId: userId,
            testId: testData.testId || `test_${Date.now()}`,
            testName: testData.testName || 'Custom Test',
            testType: testData.testType || 'custom',
            subjects: testData.subjects || [],
            totalQuestions: transformedResults.total_questions,
            correctAnswers: transformedResults.correct_answers,
            score: transformedResults.score,
            timeTaken: (testData.timeLimit * 60) - timeLeft,
            subjectScores: transformedResults.subject_scores,
            results: {
              score: transformedResults.score,
              total_questions: transformedResults.total_questions,
              correct_answers: transformedResults.correct_answers,
              incorrect_answers: transformedResults.incorrect_answers,
              unattempted_answers: transformedResults.unattempted_answers,
              accuracy: transformedResults.accuracy,
              percentage: transformedResults.accuracy, // For dashboard compatibility
              subject_scores: transformedResults.subject_scores,
              performance_insights: []
            },
            timeLimit: testData.timeLimit * 60,
            completedAt: new Date().toISOString(),
            timestamp: new Date().toISOString()
          };

          // Test result is already saved by the evaluate-test endpoint
          console.log('Test result saved successfully');
        } catch (saveError) {
          console.error('Could not process test result:', saveError);
        }
      } else {
        throw new Error('Failed to evaluate test');
      }
    } catch (error) {
      console.error('Error submitting test:', error);
      alert('Error submitting test. Please try again.');
    } finally {
      setIsLoading(false);
      setTestCompleted(true);
    }
  }, [testData, userAnswers, timeLeft, userId]);

  useEffect(() => {
    if (isLoaded && userId) {
      try {
        const storedTest = localStorage.getItem('currentTest');
        if (storedTest) {
          const parsedTest = JSON.parse(storedTest);

          if (!parsedTest.questions || parsedTest.questions.length === 0) {
            alert('Error: Test has no questions. Please create a new test.');
            router.push('/mockTests');
            return;
          }

          // Check if options are in old format (objects instead of strings)
          const firstQuestion = parsedTest.questions[0];
          if (firstQuestion && firstQuestion.options && firstQuestion.options.length > 0) {
            const firstOption = firstQuestion.options[0];
            if (typeof firstOption === 'object' && firstOption.content !== undefined) {
              // Old format detected - clear localStorage and redirect
              console.log('Old test format detected, clearing cache...');
              localStorage.removeItem('currentTest');
              alert('Test format updated. Please generate a new test.');
              router.push('/mockTests');
              return;
            }
          }

          setTestData(parsedTest);
          setTimeLeft(parsedTest.timeLimit * 60);
        } else {
          router.push('/mockTests');
        }
      } catch (error) {
        console.error('Error loading test data:', error);
        alert('Error loading test data. Please create a new test.');
        router.push('/mockTests');
      }
    }
  }, [router, isLoaded, userId]);

  useEffect(() => {
    if (timeLeft > 0 && !testCompleted && testData) {
      if (timeLeft === 300) {
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 5000);
      }

      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !testCompleted && testData) {
      handleSubmitTest();
    }
  }, [timeLeft, testCompleted, testData, handleSubmitTest]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (questionIndex, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: answer,
    }));
  };

  const toggleMarkForReview = (questionIndex) => {
    setMarkedForReview(prev => ({
      ...prev,
      [questionIndex]: !prev[questionIndex]
    }));
  };

  const generateGeminiAnalysis = async (testResults, userId) => {
    try {
      setLoadingAnalysis(true);
      
      // Create detailed mistakes array from available data
      const detailedMistakes = [];
      
      // Try to build mistakes from userAnswers if available
      if (userAnswers && testData?.questions) {
        testData.questions.forEach((question, index) => {
          const userAnswer = userAnswers[index];
          if (userAnswer && userAnswer !== question.correct_answer) {
            detailedMistakes.push({
              question_number: index + 1,
              question_topic: question.topic || 'Unknown Topic',
              subject: question.subject || 'Unknown Subject',
              chapter: question.chapter || 'Unknown Chapter',
              user_answer: userAnswer,
              correct_answer: question.correct_answer,
              mistake_type: 'Incorrect Answer'
            });
          }
        });
      }

      const analysisData = {
        user_id: userId,
        test_results: testResults,
        subject_performance: testResults.subject_scores || {},
        test_questions: testData?.questions || [],
        user_answers: userAnswers,
        detailed_mistakes: detailedMistakes,
        intelligence_insights: {
          time_taken: (testData?.timeLimit * 60) - timeLeft,
          time_per_question: ((testData?.timeLimit * 60) - timeLeft) / Math.max(testResults.total_questions, 1),
          subjects_tested: Object.keys(testResults.subject_scores || {}),
          difficulty_distribution: testData?.questions?.reduce((acc, q) => {
            const diff = q.difficulty || 'medium';
            acc[diff] = (acc[diff] || 0) + 1;
            return acc;
          }, {}) || {}
        }
      };

      const response = await fetch('http://localhost:5000/api/gemini-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analysisData),
      });

      if (response.ok) {
        const analysisResult = await response.json();
        if (analysisResult.analysis && typeof analysisResult.analysis === 'object') {
          setGeminiAnalysis(analysisResult.analysis);
        } else {
          throw new Error('Invalid analysis structure received');
        }
      } else {
        const errorText = await response.text();
        throw new Error(`Analysis generation failed: ${errorText}`);
      }
    } catch (error) {
      console.error('Error generating Gemini analysis:', error);
      // Set fallback analysis
      setGeminiAnalysis({
        overall_performance: {
          summary: 'Analysis temporarily unavailable due to technical issues.',
          score_percentage: testResults.accuracy || 0,
          performance_level: testResults.accuracy >= 80 ? 'Excellent' : testResults.accuracy >= 60 ? 'Good' : 'Needs Improvement',
          total_questions: testResults.total_questions || 0,
          correct_answers: testResults.correct_answers || 0,
          incorrect_answers: testResults.incorrect_answers || 0,
          unattempted_answers: testResults.unattempted_answers || 0
        },
        error_analysis: {
          total_errors: testResults.incorrect_answers || 0,
          critical_mistakes: []
        }
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const getSubjectStats = () => {
    if (!testResults || !testData) return {};
    
    // Use subject_scores from backend response if available
    if (testResults.subject_scores) {
      const subjectStats = {};
      Object.keys(testResults.subject_scores).forEach((subject) => {
        const subjectData = testResults.subject_scores[subject];
        subjectStats[subject] = {
          total: subjectData.total || 0,
          correct: subjectData.correct || 0,
          percentage: (subjectData.percentage || 0).toFixed(1),
        };
      });
      return subjectStats;
    }
    
    // Fallback: calculate from questions if subject_scores not available
    const subjectStats = {};
    const subjects = [...new Set(testData.questions.map((q) => q.subject))];

    subjects.forEach((subject) => {
      const subjectQuestions = testData.questions.filter((q) => q.subject === subject);
      // Since we don't have individual question results, use overall accuracy
      const estimatedCorrect = Math.round((subjectQuestions.length * (testResults.accuracy || 0)) / 100);
      
      subjectStats[subject] = {
        total: subjectQuestions.length,
        correct: estimatedCorrect,
        percentage: (testResults.accuracy || 0).toFixed(1),
      };
    });
    return subjectStats;
  };

  if (!isLoaded || !testData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-primary font-medium">Loading Bodh.ai Test...</div>
        </div>
      </div>
    );
  }

  if (testCompleted && testResults) {
    const subjectStats = getSubjectStats();

    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold text-foreground mb-4">Assessment Complete!</h1>
              <p className="text-muted-foreground text-lg">Your detailed performance analysis is ready</p>
            </div>

            {/* JEE Score Display */}
            <div className="bg-card rounded-2xl shadow-sm p-8 mb-8 border border-border">
              <div className="text-center mb-8">
                <div className="text-6xl font-bold text-primary mb-4">
                  {testResults.score}/{testResults.max_score || (testResults.total_questions * 4)}
                </div>
                <div className="text-3xl font-semibold text-foreground mb-2">
                  Score: {testResults.accuracy}%
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  JEE Marking Scheme: +4 Correct | -1 Incorrect | 0 Unattempted
                </div>
                <div className="w-24 h-1 bg-primary rounded-full mx-auto"></div>
              </div>

              {/* Score Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 text-center border border-green-200 dark:border-green-800">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {testResults.correct_answers}
                  </div>
                  <div className="text-green-700 dark:text-green-300 font-medium">Correct (+4 each)</div>
                  <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                    +{testResults.correct_answers * 4} marks
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 text-center border border-red-200 dark:border-red-800">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-800 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
                    {testResults.incorrect_answers}
                  </div>
                  <div className="text-red-700 dark:text-red-300 font-medium">Incorrect (-1 each)</div>
                  <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                    -{testResults.incorrect_answers} marks
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 text-center border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                    {testResults.unattempted_answers}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 font-medium">Unattempted (0 each)</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    0 marks
                  </div>
                </div>
              </div>

      {/* Subject-wise Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(subjectStats).map(([subject, stats]) => (
          <div key={subject} className="bg-muted/30 rounded-xl p-6 text-center hover:bg-muted/50 transition-colors">
            <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="font-semibold text-foreground mb-2 text-lg">{subject}</div>
            <div className="text-3xl font-bold text-primary mb-2">
              {stats.correct}/{stats.total}
            </div>
            <div className="text-muted-foreground font-medium">{stats.percentage}% Accuracy</div>
          </div>
        ))}
      </div>

      {/* Section Divider */}
      <div className="text-center py-8">
        <div className="w-24 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Detailed Performance Analysis</h2>
        <p className="text-muted-foreground">Comprehensive insights into your test performance</p>
      </div>

      {/* Detailed Test Analytics Section */}
      <TestAnalyticsSection
        testResults={testResults}
        testData={testData}
        timeTaken={(testData.timeLimit * 60) - timeLeft}
      />

      {/* AI Analysis Section Divider */}
      <div className="text-center py-8">
        <div className="w-24 h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50 rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-foreground mb-2">AI-Powered Analysis</h2>
        <p className="text-muted-foreground">Advanced pattern recognition and personalized learning recommendations</p>
      </div>

      {/* Gemini AI Analysis Dashboard */}
      {loadingAnalysis ? (
        <div className="bg-card rounded-2xl shadow-sm p-8 border border-border">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-primary font-medium">Generating AI-powered analysis...</div>
            <div className="text-sm text-muted-foreground mt-2">This may take a few moments</div>
          </div>
        </div>
      ) : (
        <GeminiAnalysisDashboard
          geminiAnalysis={geminiAnalysis}
        />
      )}
            </div>

            <div className="text-center space-x-4">
              <button
                onClick={() => router.push('/mockTests')}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-lg"
              >
                Take Another Test
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg text-lg"
              >
                View Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;
  const unattemptedCount = testData.questions.length - answeredCount;

  // MathRenderer is now imported from components

  // Get subject-wise question counts
  const getSubjectCounts = () => {
    const subjects = {};
    testData.questions.forEach((q, index) => {
      const subject = q.subject || 'Unknown';
      if (!subjects[subject]) {
        subjects[subject] = { total: 0, answered: 0, questions: [] };
      }
      subjects[subject].total++;
      subjects[subject].questions.push(index);
      if (userAnswers.hasOwnProperty(index)) {
        subjects[subject].answered++;
      }
    });
    return subjects;
  };

  const subjectCounts = getSubjectCounts();

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-slate-800 rounded-lg p-6 max-w-sm mx-4 border border-slate-700 shadow-xl">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-red-500 mb-2">Time Warning!</h3>
              <p className="text-slate-300">Only 5 minutes remaining</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded overflow-hidden">
                <img 
                  src="/bodh-logo.svg" 
                  alt="Bodh.ai Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-white">BODH.AI</span>
            </div>

            {/* Subject Tabs */}
            <div className="flex gap-1">
              {Object.entries(subjectCounts).map(([subject, data]) => (
                <button
                  key={subject}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`text-lg font-mono ${timeLeft <= 300 ? 'text-red-400' : 'text-slate-300'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              disabled={isLoading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Main Question Area */}
        <div className="flex-1 p-6">
          {/* Question Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-white">Q{currentQuestionIndex + 1}</span>
                <span className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                  {currentQuestion.subject}
                </span>
              </div>
              <span className="text-slate-400 text-sm">
                {currentQuestionIndex + 1} of {testData.questions.length}
              </span>
            </div>
          </div>

          {/* Question Content */}
          <div className="bg-slate-800 rounded-xl p-6 mb-6">
            <div className="text-lg text-slate-100 mb-6 leading-relaxed">
              <MathRenderer text={currentQuestion.question} />
            </div>

            {currentQuestion.image_data && (
              <div className="mb-6 bg-slate-700 rounded-lg p-4">
                <img
                  src={currentQuestion.image_data}
                  alt="Question diagram"
                  className="max-w-full h-auto rounded-lg mx-auto"
                />
              </div>
            )}

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-4">
              {currentQuestion.options.map((option, optionIndex) => {
                const optionLabel = String.fromCharCode(65 + optionIndex);
                const isSelected = userAnswers[currentQuestionIndex] === optionLabel;

                return (
                  <label
                    key={optionIndex}
                    className={`relative p-4 rounded-lg cursor-pointer transition-all border-2 ${isSelected
                        ? "bg-green-600/20 border-green-500 text-white"
                        : "bg-slate-700 border-slate-600 hover:border-slate-500 text-slate-200"
                      }`}
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestionIndex}`}
                      value={optionLabel}
                      checked={isSelected}
                      onChange={() => handleAnswerSelect(currentQuestionIndex, optionLabel)}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${isSelected ? 'bg-green-500 text-white' : 'bg-slate-600 text-slate-300'
                        }`}>
                        {optionLabel}
                      </div>
                      <div className="flex-1 text-sm">
                        <MathRenderer text={option} />
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button
                onClick={() => setUserAnswers(prev => {
                  const newAnswers = { ...prev };
                  delete newAnswers[currentQuestionIndex];
                  return newAnswers;
                })}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Clear Response
              </button>

              <button
                onClick={() => toggleMarkForReview(currentQuestionIndex)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${markedForReview[currentQuestionIndex]
                    ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                {markedForReview[currentQuestionIndex] ? "Unmark" : "Mark for Review"}
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              <button
                onClick={() => setCurrentQuestionIndex(Math.min(testData.questions.length - 1, currentQuestionIndex + 1))}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Question Navigator */}
        <div className="w-80 bg-slate-900 border-l border-slate-700 p-4 overflow-y-auto">
          {/* Subject-wise Question Grid */}
          <div className="space-y-4">
            {Object.entries(subjectCounts).map(([subject, data]) => {
              const subjectColors = {
                'Physics': { bg: 'bg-blue-600', border: 'border-blue-500', dot: 'bg-blue-500' },
                'Chemistry': { bg: 'bg-green-600', border: 'border-green-500', dot: 'bg-green-500' },
                'Mathematics': { bg: 'bg-purple-600', border: 'border-purple-500', dot: 'bg-purple-500' },
                'General': { bg: 'bg-gray-600', border: 'border-gray-500', dot: 'bg-gray-500' }
              };

              const colors = subjectColors[subject] || subjectColors['General'];

              return (
                <div key={subject} className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${colors.dot}`}></div>
                    <h3 className="text-white font-semibold">{subject}</h3>
                    <span className="text-slate-400 text-sm">{data.questions.length} Questions</span>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {data.questions.map((questionIndex) => {
                      const isAnswered = userAnswers.hasOwnProperty(questionIndex);
                      const isMarked = markedForReview[questionIndex];
                      const isCurrent = questionIndex === currentQuestionIndex;

                      let buttonClass = "w-10 h-10 rounded-lg text-sm font-bold transition-all duration-200 border-2 ";

                      if (isCurrent) {
                        buttonClass += "bg-blue-600 border-blue-400 text-white shadow-lg scale-110 ring-2 ring-blue-300";
                      } else if (isAnswered && isMarked) {
                        buttonClass += "bg-orange-600 border-orange-400 text-white"; // Answered & Marked
                      } else if (isAnswered) {
                        buttonClass += "bg-green-600 border-green-400 text-white"; // Answered
                      } else if (isMarked) {
                        buttonClass += "bg-yellow-600 border-yellow-400 text-white"; // Marked for Review
                      } else {
                        buttonClass += "bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600 hover:border-slate-500"; // Not Answered
                      }

                      return (
                        <button
                          key={questionIndex}
                          onClick={() => setCurrentQuestionIndex(questionIndex)}
                          className={buttonClass}
                          title={`Question ${questionIndex + 1}${isAnswered ? ' (Answered)' : ''}${isMarked ? ' (Marked)' : ''}`}
                        >
                          {questionIndex + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-white font-semibold mb-3">Legend:</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-slate-700 border-2 border-slate-600 rounded"></div>
                <span className="text-slate-300">Not Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-600 border-2 border-green-400 rounded"></div>
                <span className="text-slate-300">Answered</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-blue-600 border-2 border-blue-400 rounded scale-110 ring-1 ring-blue-300"></div>
                <span className="text-slate-300">Current</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-600 border-2 border-yellow-400 rounded"></div>
                <span className="text-slate-300">Marked for Review</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-600 border-2 border-orange-400 rounded"></div>
                <span className="text-slate-300">Answered & Marked</span>
              </div>
            </div>
          </div>

          {/* Status Summary */}
          <div className="mt-4 bg-slate-800 rounded-lg p-4 border border-slate-700">
            <h4 className="text-white font-semibold mb-3">Summary:</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{answeredCount}</div>
                <div className="text-xs text-green-300">Answered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">{unattemptedCount}</div>
                <div className="text-xs text-slate-400">Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{Object.keys(markedForReview).filter(key => markedForReview[key]).length}</div>
                <div className="text-xs text-yellow-300">Marked</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{testData.questions.length}</div>
                <div className="text-xs text-blue-300">Total</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            disabled={isLoading}
            className="w-full mt-6 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 shadow-lg"
          >
            {isLoading ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl p-8 max-w-md w-full mx-4 border border-slate-700 shadow-2xl">
            <div className="text-center">
              {/* Close button */}
              <button
                onClick={() => setShowSubmitModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Clock Icon */}
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-white mb-3">Submit Test?</h3>
              <p className="text-slate-300 mb-6">Are you sure you want to submit Test?</p>

              {/* Test Summary */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-6 text-left">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Answered:</span>
                    <span className="text-green-400 font-semibold ml-2">{answeredCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Remaining:</span>
                    <span className="text-red-400 font-semibold ml-2">{unattemptedCount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Marked:</span>
                    <span className="text-yellow-400 font-semibold ml-2">{Object.keys(markedForReview).filter(key => markedForReview[key]).length}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Time Left:</span>
                    <span className="text-blue-400 font-semibold ml-2">{formatTime(timeLeft)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowSubmitModal(false);
                    handleSubmitTest();
                  }}
                  disabled={isLoading}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Submitting...' : 'Submit Test'}
                </button>

                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                >
                  Go Back to Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
