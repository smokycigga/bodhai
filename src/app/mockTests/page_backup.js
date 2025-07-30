"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/sidebar";
import { useAuth } from "@clerk/nextjs";
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function CreateMockTest() {
  const [selectedSubjects, setSelectedSubjects] = useState({
    Physics: { selected: true, questions: 25, maxQuestions: 50 },
    Chemistry: { selected: true, questions: 25, maxQuestions: 50 },
    Mathematics: { selected: true, questions: 25, maxQuestions: 50 }
  });
  const [difficultyLevel, setDifficultyLevel] = useState('mixed');
  const [testMode, setTestMode] = useState('timed');
  const [duration, setDuration] = useState('1hour');
  const [isLoading, setIsLoading] = useState(false);
  const [testCreated, setTestCreated] = useState(false);
  const [testData, setTestData] = useState(null);
  const { isLoaded, userId } = useAuth();
  const [testId, setTestId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;
    if (!userId) {
      router.push("/login");
      return;
    }
  }, [isLoaded, userId, router]);

  // Helper functions
  const getTotalQuestions = () => {
    return Object.values(selectedSubjects).reduce((total, subject) => 
      subject.selected ? total + subject.questions : total, 0
    );
  };

  const getDurationInMinutes = () => {
    switch(duration) {
      case '15min': return 15;
      case '30min': return 30;
      case '1hour': return 60;
      case '3hours': return 180;
      default: return 60;
    }
  };

  const handleSubjectToggle = (subjectName) => {
    setSelectedSubjects(prev => ({
      ...prev,
      [subjectName]: {
        ...prev[subjectName],
        selected: !prev[subjectName].selected,
        questions: !prev[subjectName].selected ? 25 : 0
      }
    }));
  };

  const handleQuestionCountChange = (subjectName, count) => {
    setSelectedSubjects(prev => ({
      ...prev,
      [subjectName]: {
        ...prev[subjectName],
        questions: Math.min(Math.max(5, count), prev[subjectName].maxQuestions)
      }
    }));
  };

  const generateQuestionsForSubject = async (subject, count) => {
    try {
      console.log(`Generating exactly ${count} questions for ${subject}`);
      const response = await fetch("http://localhost:5000/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: subject,
          count: count,
          difficulty: difficultyLevel
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Generated ${data.questions?.length || 0} questions for ${subject}`);
      return data.questions || [];
    } catch (error) {
      console.error(`Error generating questions for ${subject}:`, error);
      return [];
    }
  };

  const handleCreateTest = async () => {
    setIsLoading(true);
    console.log('🚀 Starting test creation...');
    
    try {
      let allQuestions = [];
      const selectedSubjectsList = Object.entries(selectedSubjects)
        .filter(([_, data]) => data.selected)
        .map(([name, data]) => ({ name, count: data.questions }));

      console.log('📋 Selected subjects:', selectedSubjectsList);

      for (const subject of selectedSubjectsList) {
        console.log(`🔄 Generating questions for ${subject.name}...`);
        const questions = await generateQuestionsForSubject(subject.name, subject.count);
        
        if (questions && questions.length > 0) {
          console.log(`✅ Successfully generated ${questions.length} questions for ${subject.name}`);
          allQuestions = [...allQuestions, ...questions];
        } else {
          console.warn(`⚠️ No questions generated for ${subject.name}`);
        }
      }

      console.log(`📊 Total questions generated: ${allQuestions.length}`);

      if (allQuestions.length === 0) {
        alert('No questions were generated. Please check your internet connection and try again.');
        setIsLoading(false);
        return;
      }

      const testConfig = {
        questions: allQuestions,
        timeLimit: getDurationInMinutes(),
        testType: "custom",
        subjects: selectedSubjectsList.map(s => s.name),
        totalQuestions: allQuestions.length,
        difficultyLevel,
        testMode
      };

      if (userId) {
        const response = await fetch("http://localhost:5000/api/save-test", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            testConfig
          }),
        });

        if (response.ok) {
          const result = await response.json();
          setTestId(result.testId);
          console.log('✅ Test saved successfully with ID:', result.testId);
        }
      }

      setTestData(testConfig);
      setTestCreated(true);
      console.log('🎉 Test creation completed successfully!');
    } catch (error) {
      console.error('❌ Error creating test:', error);
      alert('Failed to create test. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTakeTest = () => {
    localStorage.setItem("currentTest", JSON.stringify({ ...testData, testId }));
    router.push("/takeTest");
  };

  // Chart configurations with distinct colors
  const pieChartOptions = {
    chart: {
      type: 'donut',
      background: 'transparent'
    },
    colors: ['#60A5FA', '#34D399', '#A78BFA'], // Brighter colors for better dark mode visibility: Light Blue, Light Green, Light Purple
    labels: Object.keys(selectedSubjects).filter(key => selectedSubjects[key].selected),
    legend: {
      position: 'bottom',
      fontSize: '14px',
      fontWeight: 600,
      labels: {
        colors: 'hsl(var(--foreground))', // Dynamic color that adapts to theme
        useSeriesColors: false
      },
      markers: {
        width: 12,
        height: 12,
        strokeWidth: 0,
        strokeColor: '#fff',
        fillColors: undefined,
        radius: 12,
        customHTML: undefined,
        onClick: undefined,
        offsetX: 0,
        offsetY: 0
      },
      itemMargin: {
        horizontal: 15,
        vertical: 8
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '16px',
        fontWeight: 'bold',
        colors: ['#FFFFFF'] // White text for better contrast on colored backgrounds
      },
      dropShadow: {
        enabled: true,
        top: 1,
        left: 1,
        blur: 1,
        color: '#000',
        opacity: 0.45
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '60%',
          labels: {
            show: true,
            total: {
              show: true,
              showAlways: true,
              label: 'Total Questions',
              fontSize: '16px',
              fontWeight: 600,
              color: 'hsl(var(--foreground))', // Dynamic color
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
              }
            }
          }
        }
      }
    },
    theme: {
      mode: 'light' // Will be overridden by CSS variables
    }
  };

  const pieChartSeries = Object.values(selectedSubjects).map(subject => 
    subject.selected ? subject.questions : 0
  );

  const barChartOptions = {
    chart: {
      type: 'bar',
      background: 'transparent',
      toolbar: {
        show: false
      },
      height: 280,
      offsetY: 0,
      offsetX: 0,
      margin: {
        top: 20,
        right: 30,
        bottom: 60,
        left: 30
      }
    },
    colors: ['#60A5FA', '#34D399', '#A78BFA'],
    xaxis: {
      categories: Object.keys(selectedSubjects)
        .filter(key => selectedSubjects[key].selected)
        .map(subject => {
          if (subject === 'Mathematics') return 'Maths';
          if (subject === 'Chemistry') return 'Chemistry';
          if (subject === 'Physics') return 'Physics';
          return subject;
        }),
      labels: {
        style: {
          colors: 'hsl(var(--foreground))',
          fontSize: '13px',
          fontWeight: 600
        },
        rotate: 0,
        offsetY: 0,
        maxHeight: 120,
        trim: false,
        hideOverlappingLabels: false,
        minHeight: 30
      },
      axisBorder: {
        show: true,
        color: 'hsl(var(--border))',
        offsetY: 0
      },
      axisTicks: {
        show: true,
        color: 'hsl(var(--border))',
        offsetY: 0
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: 'hsl(var(--foreground))',
          fontSize: '14px',
          fontWeight: 600
        }
      },
      axisBorder: {
        show: true,
        color: 'hsl(var(--border))'
      }
    },
    grid: {
      borderColor: 'hsl(var(--border))',
      strokeDashArray: 3,
      opacity: 0.3,
      yaxis: {
        lines: {
          show: true
        }
      },
      xaxis: {
        lines: {
          show: false
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        colors: 'hsl(var(--foreground))',
        fontSize: '16px',
        fontWeight: 'bold'
      },
      offsetY: -15
    },
    plotOptions: {
      bar: {
        distributed: true,
        borderRadius: 8,
        columnWidth: '15%',
        dataLabels: {
          position: 'top'
        }
      }
    },
    legend: {
      show: false
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      style: {
        fontSize: '12px'
      },
      y: {
        formatter: function(val) {
          return val + " questions";
        }
      }
    },
    theme: {
      mode: 'light'
    }
  };

  const barChartSeries = [{
    name: 'Questions',
    data: Object.entries(selectedSubjects)
      .filter(([_, data]) => data.selected)
      .map(([_, data]) => data.questions)
  }];

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-primary text-xl animate-pulse">Loading Bodh.ai...</div>
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  if (testCreated && testData) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card rounded-xl border border-border p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h1 className="text-3xl font-bold text-card-foreground mb-4">Test Created Successfully!</h1>
              <p className="text-muted-foreground mb-6">
                Your custom test with {testData.totalQuestions} questions is ready.
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{testData.totalQuestions}</div>
                  <div className="text-sm text-primary">Questions</div>
                </div>
                <div className="bg-primary/10 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{testData.timeLimit} min</div>
                  <div className="text-sm text-primary">Duration</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleTakeTest}
                  className="px-8 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-all"
                >
                  Take Test Now
                </button>
                <button
                  onClick={() => setTestCreated(false)}
                  className="px-8 py-3 bg-muted hover:bg-muted/80 text-muted-foreground rounded-lg font-semibold transition-all"
                >
                  Create Another Test
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        Assessment Builder
                      </h1>
                      <p className="text-muted-foreground text-lg font-medium mt-1">
                        Craft your personalized learning experience
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Quick Start
                  </button>
                  <button className="px-6 py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Save Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Configuration */}
              <div className="lg:col-span-2 space-y-8">
                {/* Premium Subject Selection */}
                <div className="relative overflow-hidden bg-gradient-to-br from-card via-card to-card/50 border border-border/50 rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 via-transparent to-purple-500/3 opacity-50"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center space-x-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 011-1.732l4-2.5a1 1 0 011.464.684V5a2 2 0 012 2h2a2 2 0 012-2V1.732a1 1 0 011.464-.684l4 2.5A1 1 0 0121 5v2a2 2 0 012 2v2" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                            Subject Configuration
                          </h2>
                          <p className="text-muted-foreground font-medium">Select and customize your assessment domains</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-xl text-sm font-semibold">
                        {Object.values(selectedSubjects).filter(s => s.selected).length} Selected
                      </div>
                    </div>

                    <div className="space-y-6">
                      {Object.entries(selectedSubjects).map(([subject, data]) => (
                        <div key={subject} className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-500 transform hover:scale-[1.02] ${
                          data.selected
                            ? 'bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/30 shadow-lg hover:shadow-xl'
                            : 'bg-gradient-to-br from-background/50 to-background/30 border-2 border-border/30 hover:border-border/50 shadow-md hover:shadow-lg'
                        }`}>
                          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                              <label className="flex items-center gap-4 cursor-pointer">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={data.selected}
                                    onChange={() => handleSubjectToggle(subject)}
                                    className="w-6 h-6 text-primary rounded-lg focus:ring-primary focus:ring-2 transition-all"
                                  />
                                  {data.selected && (
                                    <div className="absolute inset-0 bg-primary rounded-lg flex items-center justify-center pointer-events-none">
                                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                      </svg>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                                    subject === 'Physics' ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                                    subject === 'Chemistry' ? 'bg-gradient-to-br from-green-500 to-green-600' :
                                    'bg-gradient-to-br from-purple-500 to-purple-600'
                                  }`}>
                                    {subject === 'Physics' ? (
                                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                      </svg>
                                    ) : subject === 'Chemistry' ? (
                                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <span className="font-bold text-foreground text-lg">{subject}</span>
                                    <div className="text-sm text-muted-foreground font-medium">
                                      Advanced {subject.toLowerCase()} concepts
                                    </div>
                                  </div>
                                </div>
                              </label>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-foreground">{data.questions}</div>
                                <div className="text-sm text-muted-foreground font-medium">questions</div>
                              </div>
                            </div>

                            {data.selected && (
                              <div className="mt-6 p-4 bg-gradient-to-r from-background/50 to-background/30 rounded-xl border border-border/30">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center space-x-2">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                    <span className="font-semibold text-foreground">Question Count</span>
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm">
                                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-semibold">
                                      {data.questions} selected
                                    </span>
                                    <span className="text-muted-foreground">
                                      Max: {data.maxQuestions}
                                    </span>
                                  </div>
                                </div>
                                <div className="relative">
                                  <input
                                    type="range"
                                    min="5"
                                    max={data.maxQuestions}
                                    value={data.questions}
                                    onChange={(e) => handleQuestionCountChange(subject, parseInt(e.target.value))}
                                    className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                    style={{
                                      background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(data.questions / data.maxQuestions) * 100}%, #E5E7EB ${(data.questions / data.maxQuestions) * 100}%, #E5E7EB 100%)`
                                    }}
                                  />
                                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                                    <span>5</span>
                                    <span>{Math.floor(data.maxQuestions / 2)}</span>
                                    <span>{data.maxQuestions}</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Summary */}
              <div className="space-y-8">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold text-card-foreground mb-4">Test Summary</h3>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{getTotalQuestions()}</div>
                      <div className="text-sm text-muted-foreground">Total Questions</div>
                    </div>
                  </div>
                </div>

                {/* Launch Button */}
                <button
                  onClick={handleCreateTest}
                  disabled={isLoading || getTotalQuestions() === 0}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all ${
                    isLoading || getTotalQuestions() === 0
                      ? 'bg-muted text-muted-foreground cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Creating Test...
                    </div>
                  ) : (
                    `Create Test (${getTotalQuestions()} Questions)`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
