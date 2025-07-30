"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import dynamic from "next/dynamic";
import Sidebar from "../components/sidebar";

// Import ApexCharts dynamically to avoid SSR issues
const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const StudyPlannerDashboard = () => {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [studyData, setStudyData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [testResults, setTestResults] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState(null);
  const [error, setError] = useState(null);

  // Task management state
  const [userTasks, setUserTasks] = useState([]);
  const [calendarTasks, setCalendarTasks] = useState({});
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  const [appliedRecommendations, setAppliedRecommendations] = useState(new Set());

  // Fetch all required data
  const fetchStudyData = async () => {
    try {
      setLoading(true);
      setError(null);

      let resultsData = null;
      let statsData = null;

      // Fetch test results
      const resultsResponse = await fetch(`http://localhost:5000/api/user-test-results/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (resultsResponse.ok) {
        resultsData = await resultsResponse.json();
        setTestResults(resultsData.results || []);
      }

      // Fetch user statistics
      const statsResponse = await fetch(`http://localhost:5000/api/user-stats/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (statsResponse.ok) {
        statsData = await statsResponse.json();
        setUserStats(statsData.stats || {});
      }

      // Generate Gemini analysis for AI recommendations
      if (resultsData?.results?.length > 0) {
        const latestTest = resultsData.results[0];
        const analysisData = {
          user_id: userId,
          test_results: latestTest,
          subject_performance: latestTest.subject_scores || {},
          user_profile: statsData?.stats || {}
        };

        try {
          const geminiResponse = await fetch('http://localhost:5000/api/gemini-analysis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(analysisData),
          });

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            setGeminiAnalysis(geminiData.analysis || null);
          }
        } catch (geminiError) {
          console.warn('Gemini analysis failed:', geminiError);
          // Continue without AI analysis
        }
      }

      // Process and combine data
      processStudyData();

      // Fetch user tasks
      await fetchUserTasks();

    } catch (error) {
      console.error('Error fetching study data:', error);
      setError('Failed to load study data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Task Management Functions
  const fetchUserTasks = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user-tasks/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setUserTasks(data.tasks || []);
      }
    } catch (error) {
      console.warn('Failed to fetch user tasks:', error);
    }
  };

  const fetchCalendarTasks = async (month, year) => {
    try {
      console.log(`Fetching calendar tasks for ${month}/${year}`);
      const response = await fetch(`http://localhost:5000/api/user-tasks/${userId}/calendar?month=${month}&year=${year}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Calendar tasks fetched:', data);
        setCalendarTasks(data.calendar_data || {});
      } else {
        console.error('Failed to fetch calendar tasks - response not ok:', response.status);
      }
    } catch (error) {
      console.warn('Failed to fetch calendar tasks:', error);
    }
  };

  const createTask = async (taskData) => {
    try {
      console.log('Creating task with data:', taskData);
      const response = await fetch('http://localhost:5000/api/user-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...taskData,
          user_id: userId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Task created successfully:', data.task);
        setUserTasks(prev => [...prev, data.task]);

        // Refresh calendar for both current month and task's scheduled month
        const taskDate = new Date(taskData.scheduled_date);
        const currentMonth = selectedDate.getMonth() + 1;
        const currentYear = selectedDate.getFullYear();
        const taskMonth = taskDate.getMonth() + 1;
        const taskYear = taskDate.getFullYear();

        // Always refresh current view
        await fetchCalendarTasks(currentMonth, currentYear);

        // If task is in a different month, refresh that too
        if (taskMonth !== currentMonth || taskYear !== currentYear) {
          await fetchCalendarTasks(taskMonth, taskYear);
        }

        return data.task;
      } else {
        const errorText = await response.text();
        console.error('Failed to create task - server response:', response.status, errorText);
        throw new Error(`Failed to create task: ${response.status} - ${errorText}`);
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
        setUserTasks(prev => prev.map(task => task._id === taskId ? data.task : task));
        await fetchCalendarTasks(selectedDate.getMonth() + 1, selectedDate.getFullYear());
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
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        setUserTasks(prev => prev.filter(task => task._id !== taskId));
        await fetchCalendarTasks(selectedDate.getMonth() + 1, selectedDate.getFullYear());
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  };



  useEffect(() => {
    if (isLoaded && userId) {
      fetchStudyData();
    }
  }, [isLoaded, userId]);

  useEffect(() => {
    if (userId && selectedDate) {
      fetchCalendarTasks(selectedDate.getMonth() + 1, selectedDate.getFullYear());
    }
  }, [userId, selectedDate]);

  // Force refresh calendar when userTasks changes
  useEffect(() => {
    if (userId && selectedDate && userTasks.length > 0) {
      fetchCalendarTasks(selectedDate.getMonth() + 1, selectedDate.getFullYear());
    }
  }, [userTasks.length]);

  // Debug function to check current state
  const debugCurrentState = () => {
    console.log('=== DEBUG STATE ===');
    console.log('userTasks:', userTasks);
    console.log('calendarTasks:', calendarTasks);
    console.log('selectedDate:', selectedDate);
    console.log('appliedRecommendations:', appliedRecommendations);
    console.log('==================');
  };

  // Process and combine data from different sources
  const processStudyData = () => {
    if (!testResults.length || !userStats) return;

    const processedData = {
      weeklyGoal: calculateWeeklyGoal(),
      studyHours: calculateStudyHours(),
      improvement: calculateImprovement(),
      studyStreak: calculateStudyStreak(),
      weeklyProgress: calculateWeeklyProgress(),
      aiRecommendations: generateAIRecommendations()
    };

    setStudyData(processedData);
  };

  const calculateWeeklyGoal = () => {
    const recentTests = testResults.slice(0, 7).length; // Tests in last week
    const targetTests = 5; // Target tests per week

    return {
      completed: recentTests,
      total: targetTests,
      percentage: Math.round((recentTests / targetTests) * 100)
    };
  };

  const calculateStudyHours = () => {
    // Calculate based on test frequency and average time
    const recentTests = testResults.slice(0, 7);
    const totalTime = recentTests.reduce((sum, test) => sum + (test.time_taken || 0), 0);
    const avgTimePerDay = totalTime / (7 * 3600); // Convert to hours per day

    return {
      daily: Math.round(avgTimePerDay * 10) / 10,
      average: Math.round(avgTimePerDay * 10) / 10
    };
  };

  const calculateImprovement = () => {
    if (testResults.length < 2) return { percentage: 0, trend: "neutral" };

    const recent = testResults.slice(0, 3);
    const older = testResults.slice(3, 6);

    const recentAvg = recent.reduce((sum, test) => sum + (test.percentage || 0), 0) / recent.length;
    const olderAvg = older.reduce((sum, test) => sum + (test.percentage || 0), 0) / older.length;

    const improvement = recentAvg - olderAvg;

    return {
      percentage: Math.round(Math.abs(improvement)),
      trend: improvement > 0 ? "up" : improvement < 0 ? "down" : "neutral"
    };
  };

  // Generate last 30 days calendar data
  const generateLast30DaysData = () => {
    if (!testResults || testResults.length === 0) {
      return Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000),
        hasActivity: false,
        isToday: i === 29
      }));
    }

    const today = new Date();
    const last30Days = [];

    // Create array of last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      last30Days.push({
        date: date,
        hasActivity: false,
        isToday: i === 0
      });
    }

    // Helper function to get date string for comparison
    const getDateString = (date) => {
      return date.toISOString().split('T')[0];
    };

    // Mark days with test activity
    const testDatesSet = new Set();
    testResults.forEach(test => {
      const testDate = new Date(test.completed_at);
      testDatesSet.add(getDateString(testDate));
    });

    // Update calendar with actual activity
    last30Days.forEach(day => {
      const dayString = getDateString(day.date);
      day.hasActivity = testDatesSet.has(dayString);
    });

    return last30Days;
  };

  const calculateStudyStreak = () => {
    // Calculate streak based on consecutive calendar days with test activity
    const last30DaysData = generateLast30DaysData();
    const completedDays = last30DaysData.filter(day => day.hasActivity).length;

    if (!testResults || testResults.length === 0) {
      return {
        current: 0,
        personal: 0,
        thisMonth: 0,
        last30DaysData: last30DaysData,
        completedDays: 0,
        totalDays: 30
      };
    }

    const today = new Date();
    const thisMonth = today.getMonth();
    const thisYear = today.getFullYear();

    // Get days in current month for validation
    const daysInMonth = new Date(thisYear, thisMonth + 1, 0).getDate();

    // Helper function to get calendar date string (YYYY-MM-DD) in local timezone
    const getDateString = (date) => {
      const localDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
      return localDate.toISOString().split('T')[0];
    };

    // Helper function to get date difference in calendar days
    const getCalendarDaysDiff = (date1, date2) => {
      const d1 = new Date(getDateString(date1));
      const d2 = new Date(getDateString(date2));
      return Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));
    };

    // Get unique test dates (one entry per calendar day)
    const testDatesSet = new Set();
    let monthlyTests = 0;

    testResults.forEach(test => {
      const testDate = new Date(test.completed_at);
      const dateString = getDateString(testDate);
      testDatesSet.add(dateString);

      // Count monthly tests
      if (testDate.getMonth() === thisMonth && testDate.getFullYear() === thisYear) {
        monthlyTests++;
      }
    });

    // Convert to sorted array of Date objects (most recent first)
    const uniqueTestDates = Array.from(testDatesSet)
      .map(dateStr => new Date(dateStr))
      .sort((a, b) => b - a);

    if (uniqueTestDates.length === 0) {
      return {
        current: 0,
        personal: 0,
        thisMonth: 0,
        last30DaysData: last30DaysData,
        completedDays: completedDays,
        totalDays: 30
      };
    }

    // Calculate current streak from the last 30 days data (working backwards from today)
    let currentStreak = 0;
    for (let i = last30DaysData.length - 1; i >= 0; i--) {
      if (last30DaysData[i].hasActivity) {
        currentStreak++;
      } else {
        break; // Streak is broken
      }
    }

    // Calculate maximum streak (longest consecutive sequence in history)
    let maxStreak = 0;
    let tempStreak = 0;

    if (uniqueTestDates.length > 0) {
      tempStreak = 1; // Start with first date

      for (let i = 1; i < uniqueTestDates.length; i++) {
        const currentDate = uniqueTestDates[i];
        const previousDate = uniqueTestDates[i - 1];
        const daysDiff = getCalendarDaysDiff(previousDate, currentDate);

        if (daysDiff === 1) {
          // Consecutive day
          tempStreak++;
        } else {
          // Gap found - update max and reset temp
          maxStreak = Math.max(maxStreak, tempStreak);
          tempStreak = 1;
        }
      }

      // Don't forget the last streak
      maxStreak = Math.max(maxStreak, tempStreak);
    }

    // Ensure current streak doesn't exceed max streak
    maxStreak = Math.max(maxStreak, currentStreak);

    // Apply realistic bounds checking
    currentStreak = Math.min(Math.max(0, currentStreak), 30); // Max 30 days for display
    maxStreak = Math.min(Math.max(0, maxStreak), 365); // Max 1 year streak
    monthlyTests = Math.min(Math.max(0, monthlyTests), daysInMonth); // Can't exceed days in month

    return {
      current: currentStreak,
      personal: maxStreak,
      thisMonth: monthlyTests,
      last30DaysData: last30DaysData,
      completedDays: completedDays,
      totalDays: 30
    };
  };

  const calculateWeeklyProgress = () => {
    // Generate weekly progress based on test scores
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      const weekTests = testResults.slice(i * 2, (i + 1) * 2);
      const avgScore = weekTests.length > 0
        ? weekTests.reduce((sum, test) => sum + (test.percentage || 0), 0) / weekTests.length
        : 0;
      weeks.unshift(Math.round(avgScore));
    }
    return weeks;
  };

  const generateAIRecommendations = () => {
    const recommendations = [];

    // Use Gemini analysis if available
    if (geminiAnalysis?.personalized_recommendations) {
      const geminiRecs = geminiAnalysis.personalized_recommendations;

      // Extract study plan recommendations
      if (geminiRecs.study_plan?.weekly_plan?.week_1) {
        const week1 = geminiRecs.study_plan.weekly_plan.week_1;
        recommendations.push({
          id: 1,
          subject: week1.primary_focus || "Focus Areas",
          priority: "High",
          description: `${week1.target_improvement || 'Improve performance'} by focusing on ${week1.primary_focus || 'weak areas'}.`,
          duration: "3-4 hours",
          improvement: "+20%",
          color: "bg-red-50 border-red-200"
        });
      }

      // Add subject-specific recommendations
      if (geminiAnalysis.subject_analysis) {
        Object.entries(geminiAnalysis.subject_analysis).forEach(([subject, analysis], index) => {
          if (analysis.recommendations && analysis.recommendations.length > 0) {
            recommendations.push({
              id: index + 2,
              subject: `${subject} Practice`,
              priority: analysis.accuracy < 60 ? "High" : analysis.accuracy < 80 ? "Medium" : "Low",
              description: analysis.recommendations[0] || `Focus on ${subject} concepts`,
              duration: "2-3 hours",
              improvement: "+15%",
              color: analysis.accuracy < 60 ? "bg-red-50 border-red-200" :
                     analysis.accuracy < 80 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"
            });
          }
        });
      }
    }

    // Fallback recommendations based on user stats
    if (recommendations.length === 0 && userStats?.weak_topics) {
      userStats.weak_topics.slice(0, 3).forEach((topic, index) => {
        recommendations.push({
          id: index + 1,
          subject: topic.topic || "Study Focus",
          priority: topic.accuracy < 50 ? "High" : topic.accuracy < 70 ? "Medium" : "Low",
          description: `Your accuracy in ${topic.topic} is ${Math.round(topic.accuracy)}%. Focus on understanding core concepts.`,
          duration: "2-3 hours",
          improvement: "+15%",
          color: topic.accuracy < 50 ? "bg-red-50 border-red-200" :
                 topic.accuracy < 70 ? "bg-yellow-50 border-yellow-200" : "bg-green-50 border-green-200"
        });
      });
    }

    // Default recommendations if no data
    if (recommendations.length === 0) {
      recommendations.push({
        id: 1,
        subject: "Take More Tests",
        priority: "High",
        description: "Start taking practice tests to get personalized AI recommendations based on your performance.",
        duration: "1 hour",
        improvement: "+10%",
        color: "bg-blue-50 border-blue-200"
      });
    }

    return recommendations.slice(0, 3); // Limit to 3 recommendations
  };

  const getCurrentMonth = () => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[selectedDate.getMonth()] + ' ' + selectedDate.getFullYear();
  };

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
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const generateWeeklySchedule = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const schedule = [];

    // Get current week dates
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - currentDay + 1);

    for (let i = 0; i < 3; i++) { // Show first 3 days
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];

      // Get real tasks for this date
      const realTasks = userTasks.filter(task => {
        const taskDate = new Date(task.scheduled_date);
        return taskDate.toISOString().split('T')[0] === dateKey;
      });

      const daySchedule = {
        name: days[i],
        date: date.toLocaleDateString(),
        activities: realTasks.length > 0 ? convertTasksToActivities(realTasks) : generateDayActivities(i)
      };

      schedule.push(daySchedule);
    }

    return schedule;
  };

  const convertTasksToActivities = (tasks) => {
    return tasks.map(task => ({
      title: task.title,
      duration: `${Math.round(task.duration / 60)} hour${task.duration >= 120 ? 's' : ''}`,
      type: task.category,
      color: task.category === 'study' ? 'bg-blue-500' :
             task.category === 'practice' ? 'bg-orange-500' :
             task.category === 'test' ? 'bg-red-500' :
             task.category === 'review' ? 'bg-green-500' :
             'bg-gray-500',
      tagColor: task.category === 'study' ? 'bg-blue-100 text-blue-700' :
                task.category === 'practice' ? 'bg-orange-100 text-orange-700' :
                task.category === 'test' ? 'bg-red-100 text-red-700' :
                task.category === 'review' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700',
      isRealTask: true,
      taskId: task._id,
      status: task.status
    }));
  };

  const generateDayActivities = (dayIndex) => {
    const activities = [];

    // Use Gemini analysis for personalized activities
    if (geminiAnalysis?.personalized_recommendations?.study_plan?.daily_schedule) {
      const dailyPlan = geminiAnalysis.personalized_recommendations.study_plan.daily_schedule;

      if (dayIndex === 0) { // Monday
        if (dailyPlan.morning_session) {
          activities.push({
            title: dailyPlan.morning_session.focus || "Theory Study",
            duration: dailyPlan.morning_session.duration || "2 hours",
            type: "theory",
            color: "bg-blue-500",
            tagColor: "bg-blue-100 text-blue-700"
          });
        }
        if (dailyPlan.afternoon_session) {
          activities.push({
            title: dailyPlan.afternoon_session.focus || "Practice Problems",
            duration: dailyPlan.afternoon_session.duration || "1.5 hours",
            type: "practice",
            color: "bg-orange-500",
            tagColor: "bg-orange-100 text-orange-700"
          });
        }
      } else if (dayIndex === 1) { // Tuesday
        activities.push({
          title: userStats?.weak_topics?.[0]?.topic ? `${userStats.weak_topics[0].topic} - Practice` : "Chemistry Practice",
          duration: "2 hours",
          type: "practice",
          color: "bg-orange-500",
          tagColor: "bg-orange-100 text-orange-700"
        });
        activities.push({
          title: "Mock Test",
          duration: "1 hour",
          type: "test",
          color: "bg-red-500",
          tagColor: "bg-red-100 text-red-700"
        });
      } else { // Wednesday
        activities.push({
          title: "Review Previous Tests",
          duration: "1.5 hours",
          type: "review",
          color: "bg-green-500",
          tagColor: "bg-green-100 text-green-700"
        });
        activities.push({
          title: userStats?.weak_topics?.[1]?.topic ? `${userStats.weak_topics[1].topic} - Theory` : "Mathematics Theory",
          duration: "2 hours",
          type: "theory",
          color: "bg-blue-500",
          tagColor: "bg-blue-100 text-blue-700"
        });
      }
    } else {
      // Fallback activities based on user stats
      if (dayIndex === 0) {
        activities.push({
          title: userStats?.weak_topics?.[0]?.topic ? `${userStats.weak_topics[0].topic} - Theory` : "Physics Theory",
          duration: "2 hours",
          type: "theory",
          color: "bg-blue-500",
          tagColor: "bg-blue-100 text-blue-700"
        });
        activities.push({
          title: "Practice Problems",
          duration: "1.5 hours",
          type: "practice",
          color: "bg-orange-500",
          tagColor: "bg-orange-100 text-orange-700"
        });
      } else if (dayIndex === 1) {
        activities.push({
          title: "Chemistry Practice",
          duration: "2 hours",
          type: "practice",
          color: "bg-orange-500",
          tagColor: "bg-orange-100 text-orange-700"
        });
        activities.push({
          title: "Mock Test",
          duration: "1 hour",
          type: "test",
          color: "bg-red-500",
          tagColor: "bg-red-100 text-red-700"
        });
      } else {
        activities.push({
          title: "Review Session",
          duration: "1.5 hours",
          type: "review",
          color: "bg-green-500",
          tagColor: "bg-green-100 text-green-700"
        });
        activities.push({
          title: "Mathematics Practice",
          duration: "2 hours",
          type: "practice",
          color: "bg-orange-500",
          tagColor: "bg-orange-100 text-orange-700"
        });
      }
    }

    return activities;
  };

  // Task Modal Component
  const TaskModal = () => {
    const [taskForm, setTaskForm] = useState({
      title: '',
      description: '',
      category: 'study',
      priority: 'medium',
      duration: 60,
      scheduled_date: selectedCalendarDate ? selectedCalendarDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      subject: '',
      tags: []
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const taskData = {
          ...taskForm,
          scheduled_date: new Date(taskForm.scheduled_date).toISOString()
        };

        if (editingTask) {
          await updateTask(editingTask._id, taskData);
        } else {
          await createTask(taskData);
        }

        setShowTaskModal(false);
        setEditingTask(null);
        setTaskForm({
          title: '',
          description: '',
          category: 'study',
          priority: 'medium',
          duration: 60,
          scheduled_date: new Date().toISOString().split('T')[0],
          subject: '',
          tags: []
        });
      } catch (error) {
        console.error('Failed to save task:', error);
      }
    };

    useEffect(() => {
      if (editingTask) {
        setTaskForm({
          title: editingTask.title || '',
          description: editingTask.description || '',
          category: editingTask.category || 'study',
          priority: editingTask.priority || 'medium',
          duration: editingTask.duration || 60,
          scheduled_date: editingTask.scheduled_date ? new Date(editingTask.scheduled_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          subject: editingTask.subject || '',
          tags: editingTask.tags || []
        });
      }
    }, [editingTask]);

    if (!showTaskModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                type="text"
                value={taskForm.title}
                onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2 h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={taskForm.category}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="study">Study</option>
                  <option value="practice">Practice</option>
                  <option value="test">Test</option>
                  <option value="review">Review</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={taskForm.priority}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
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
                  value={taskForm.duration}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  className="w-full border rounded-lg px-3 py-2"
                  min="15"
                  max="480"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  value={taskForm.scheduled_date}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, scheduled_date: e.target.value }))}
                  className="w-full border rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Subject (optional)</label>
              <input
                type="text"
                value={taskForm.subject}
                onChange={(e) => setTaskForm(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full border rounded-lg px-3 py-2"
                placeholder="e.g., Mathematics, Physics"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowTaskModal(false);
                  setEditingTask(null);
                }}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
              >
                {editingTask ? 'Update' : 'Create'} Task
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <div className="text-primary font-semibold text-lg">Loading Study Planner...</div>
            <p className="text-muted-foreground mt-2">Analyzing your performance data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Unable to Load Study Data</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <button
              onClick={fetchStudyData}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
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
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Strategic Study Framework</h1>
                <p className="text-muted-foreground text-base mt-2">AI-powered personalized learning dashboard</p>
              </div>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
                Export Report
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-6 p-8">
          {/* Left Sidebar - AI Recommendations */}
          <div className="w-80 space-y-6">
            {/* Welcome Message */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Welcome back, {user?.firstName || 'Student'}!</h3>
                  <p className="text-sm text-blue-700">Every step forward is progress. Keep pushing towards your goals!</p>
                </div>
              </div>
            </div>

            {/* Study Streak */}
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-orange-900">Study Streak</h3>
                  <p className="text-sm text-orange-700">Great momentum! You're on fire!'m sharig the des</p>
                </div>
              </div>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-orange-600 mb-1">{studyData?.studyStreak?.current}</div>
                <div className="text-sm text-orange-700">days streak</div>
              </div>

              <div className="space-y-3">
                <div className="text-sm text-orange-800">This Week's Progress</div>
                <div className="w-full bg-orange-200 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full"
                    style={{
                      width: `${(() => {
                        const weeklyGoal = studyData?.weeklyGoal?.total || 7;
                        const completed = studyData?.weeklyGoal?.completed || 0;
                        return Math.min((completed / weeklyGoal) * 100, 100);
                      })()}%`
                    }}
                  ></div>
                </div>
                
                <div className="text-sm text-orange-800">Last 30 Days</div>
                <div className="grid grid-cols-10 gap-1">
                  {(studyData?.studyStreak?.last30DaysData || []).map((day, i) => (
                    <div
                      key={i}
                      className={`w-3 h-3 rounded-sm ${
                        day.hasActivity ? 'bg-green-400' :
                        day.isToday ? 'bg-blue-400' : 'bg-gray-200'
                      }`}
                      title={day.date.toLocaleDateString()}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-orange-700">
                  <span>✅ Completed</span>
                  <span>📅 Today</span>
                  <span>⭕ Missed</span>
                </div>
                <div className="text-sm text-orange-800">
                  {studyData?.studyStreak?.completedDays || 0} / {studyData?.studyStreak?.totalDays || 30} days
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-orange-200">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-600">{studyData?.studyStreak?.personal}</div>
                  <div className="text-xs text-orange-700">Longest Streak<br/>Personal best</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-green-600">{studyData?.studyStreak?.thisMonth}</div>
                  <div className="text-xs text-green-700">This Month<br/>Study days</div>
                </div>
              </div>
            </div>

            {/* Keep Going Card */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-900">Keep Going!</h3>
                  <p className="text-sm text-yellow-700">
                    {(() => {
                      const completed = studyData?.studyStreak?.completedDays || 0;
                      const nextMilestone = Math.ceil((completed + 1) / 5) * 5; // Next multiple of 5
                      const remaining = nextMilestone - completed;
                      return remaining > 0
                        ? `Just ${remaining} more days to reach ${nextMilestone} days!`
                        : `Amazing! You've reached ${completed} days!`;
                    })()}
                  </p>
                </div>
              </div>

              <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${(() => {
                      const completed = studyData?.studyStreak?.completedDays || 0;
                      const nextMilestone = Math.ceil((completed + 1) / 5) * 5;
                      return Math.min((completed / nextMilestone) * 100, 100);
                    })()}%`
                  }}
                ></div>
              </div>
              <div className="text-sm text-yellow-800">
                Progress to next milestone: {studyData?.studyStreak?.completedDays || 0}/{(() => {
                  const completed = studyData?.studyStreak?.completedDays || 0;
                  return Math.ceil((completed + 1) / 5) * 5;
                })()}
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">AI Recommendations</h3>
                    <p className="text-sm text-muted-foreground">Personalized suggestions based on your performance</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={debugCurrentState}
                    className="text-gray-500 hover:text-gray-700 text-xs font-medium"
                  >
                    Debug
                  </button>
                  <button
                    onClick={fetchStudyData}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    Refresh
                  </button>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {studyData?.aiRecommendations?.map((rec) => (
                  <div key={rec.id} className={`${rec.color} border rounded-xl p-4`}>
                    <div className="flex items-start justify-between mb-3 gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            rec.priority === 'High' ? 'bg-red-500' :
                            rec.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <h4 className="font-medium text-sm truncate">{rec.subject}</h4>
                        </div>
                        <span className={`inline-block text-xs px-2 py-1 rounded-full ${
                          rec.priority === 'High' ? 'bg-red-100 text-red-700' :
                          rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {rec.priority} Priority
                        </span>
                      </div>
                      <button
                        className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                          appliedRecommendations.has(rec.id)
                            ? 'bg-green-600 text-white cursor-default'
                            : 'bg-primary text-primary-foreground hover:bg-primary/90'
                        }`}
                        onClick={async () => {
                          if (appliedRecommendations.has(rec.id)) return; // Already applied

                          try {
                            // Convert recommendation to task
                            const scheduledDate = new Date();
                            // If it's late in the day, schedule for tomorrow
                            if (scheduledDate.getHours() >= 18) {
                              scheduledDate.setDate(scheduledDate.getDate() + 1);
                              scheduledDate.setHours(9, 0, 0, 0); // 9 AM tomorrow
                            }

                            const taskData = {
                              title: `Study: ${rec.subject}`,
                              description: rec.description,
                              category: 'study',
                              priority: rec.priority.toLowerCase(),
                              duration: parseInt(rec.duration.match(/\d+/)?.[0] || '60') * 60, // Extract hours and convert to minutes
                              scheduled_date: scheduledDate.toISOString(),
                              subject: rec.subject,
                              tags: ['ai-recommendation', rec.priority.toLowerCase()]
                            };

                            // Create the task
                            const newTask = await createTask(taskData);
                            console.log('New task created:', newTask);

                            // Mark as applied
                            setAppliedRecommendations(prev => new Set([...prev, rec.id]));

                            // Force refresh of all data to ensure UI updates
                            await fetchStudyData();

                            // Show success feedback
                            console.log(`✅ Successfully added "${rec.subject}" to your calendar!`);

                            // Optional: Add visual feedback to the user
                            // You could implement a toast notification system here

                          } catch (error) {
                            console.error('❌ Failed to apply recommendation:', error);
                            // Optional: Show error feedback to user
                            // toast.error(`Failed to add "${rec.subject}" to calendar. Please try again.`);
                          }
                        }}
                        disabled={appliedRecommendations.has(rec.id)}
                      >
                        {appliedRecommendations.has(rec.id) ? (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Applied
                          </span>
                        ) : (
                          'Apply'
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{rec.description}</p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{rec.duration}</span>
                      <span className="text-green-600 font-medium">{rec.improvement} improvement</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-6">
            {/* Calendar Section */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">{getCurrentMonth()}</h2>
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
                    onClick={() => {
                      setSelectedCalendarDate(new Date());
                      setShowTaskModal(true);
                    }}
                    className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    + Add Task
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

              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth().map((day, index) => {
                  const currentDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day);
                  const dateKey = currentDate.toISOString().split('T')[0];
                  const dayTasks = calendarTasks[dateKey] || [];
                  const isToday = day === new Date().getDate() &&
                    selectedDate.getMonth() === new Date().getMonth() &&
                    selectedDate.getFullYear() === new Date().getFullYear();

                  return (
                    <div key={index} className="min-h-[120px] border border-gray-200 rounded-lg p-1">
                      {day && (
                        <>
                          <div
                            className={`text-sm font-medium mb-2 cursor-pointer p-1 rounded ${
                              isToday ? 'bg-primary text-primary-foreground' : 'hover:bg-gray-100'
                            }`}
                            onClick={() => {
                              setSelectedCalendarDate(currentDate);
                              setShowTaskModal(true);
                            }}
                          >
                            {day}
                          </div>

                          <div className="space-y-1">
                            {dayTasks.slice(0, 3).map((task) => (
                              <div
                                key={task._id}
                                className={`text-xs p-1 rounded cursor-pointer truncate ${
                                  task.category === 'study' ? 'bg-blue-100 text-blue-800' :
                                  task.category === 'practice' ? 'bg-orange-100 text-orange-800' :
                                  task.category === 'test' ? 'bg-red-100 text-red-800' :
                                  task.category === 'review' ? 'bg-green-100 text-green-800' :
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
                            {dayTasks.length > 3 && (
                              <div className="text-xs text-gray-500 text-center">
                                +{dayTasks.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

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
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span className="text-sm text-muted-foreground">Review</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gray-500 rounded-sm"></div>
                  <span className="text-sm text-muted-foreground">Custom</span>
                </div>
              </div>
            </div>

            {/* Progress Analytics */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Progress Analytics</h2>
                <button className="px-4 py-2 bg-accent text-accent-foreground rounded-xl text-sm font-medium hover:bg-accent/80">
                  Export Report
                </button>
              </div>

              <div className="grid grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-blue-600">{studyData?.weeklyGoal?.percentage}%</div>
                  <div className="text-sm text-muted-foreground">Weekly Goal</div>
                  <div className="text-xs text-blue-600">{studyData?.weeklyGoal?.completed}/{studyData?.weeklyGoal?.total} tasks completed</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{studyData?.studyHours?.daily}h</div>
                  <div className="text-sm text-muted-foreground">Study Hours</div>
                  <div className="text-xs text-green-600">{studyData?.studyHours?.average}h daily average</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">+{studyData?.improvement?.percentage}%</div>
                  <div className="text-sm text-muted-foreground">Improvement</div>
                  <div className="text-xs text-yellow-600">vs last week</div>
                </div>

                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="text-2xl font-bold text-purple-600">85%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                  <div className="text-xs text-purple-600">Overall performance</div>
                </div>
              </div>

              {/* Weekly Progress Chart */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Progress Trend</h3>
                <div className="h-64">
                  {typeof window !== 'undefined' && (
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'line',
                          toolbar: { show: false },
                          background: 'transparent'
                        },
                        stroke: {
                          curve: 'smooth',
                          width: 3
                        },
                        colors: ['hsl(var(--primary))'],
                        xaxis: {
                          categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                          labels: {
                            style: {
                              colors: 'hsl(var(--muted-foreground))'
                            }
                          }
                        },
                        yaxis: {
                          min: 0,
                          max: 100,
                          labels: {
                            style: {
                              colors: 'hsl(var(--muted-foreground))'
                            }
                          }
                        },
                        grid: {
                          borderColor: 'hsl(var(--border))',
                          strokeDashArray: 3
                        },
                        markers: {
                          size: 6,
                          colors: ['hsl(var(--primary))'],
                          strokeColors: '#fff',
                          strokeWidth: 2
                        }
                      }}
                      series={[{
                        name: 'Progress',
                        data: studyData?.weeklyProgress || [65, 72, 78, 85]
                      }]}
                      type="line"
                      height={240}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Week Schedule */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">
                    {geminiAnalysis?.personalized_recommendations?.study_plan?.weekly_plan?.week_1?.primary_focus
                      ? `Week 1: ${geminiAnalysis.personalized_recommendations.study_plan.weekly_plan.week_1.primary_focus}`
                      : "Week 1: Foundation Building"
                    }
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString()} - {new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="text-2xl font-bold text-red-600">{studyData?.weeklyGoal?.percentage || 0}%</div>
                  <div className="text-sm text-muted-foreground">{studyData?.weeklyGoal?.completed || 0}/{studyData?.weeklyGoal?.total || 5}</div>
                  <svg className="w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">
                    {geminiAnalysis?.personalized_recommendations?.study_plan?.weekly_plan?.week_1?.practice_questions
                      ? `${geminiAnalysis.personalized_recommendations.study_plan.weekly_plan.week_1.practice_questions * 7} questions planned`
                      : "35 questions planned"
                    }
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {userStats?.weak_topics?.slice(0, 2).map(topic => topic.topic).join(', ') || 'Physics, Chemistry'}
                    </span>
                    <div className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                      {studyData?.studyStreak?.current || 0}-day streak
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {generateWeeklySchedule().map((day, index) => (
                    <div key={index} className="border border-border rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-foreground">{day.name}</div>
                        <div className="text-sm text-muted-foreground">{day.date}</div>
                      </div>
                      <div className="space-y-2">
                        {day.activities.map((activity, actIndex) => (
                          <div key={actIndex} className={`flex items-center space-x-3 ${activity.status === 'completed' ? 'opacity-60' : ''}`}>
                            <div className={`w-4 h-4 ${activity.color} rounded-sm ${activity.status === 'completed' ? 'opacity-60' : ''}`}></div>
                            <span className={`text-sm ${activity.status === 'completed' ? 'line-through' : ''}`}>
                              {activity.title}
                              {activity.isRealTask && (
                                <span className="ml-2 text-xs text-green-600">● Applied</span>
                              )}
                            </span>
                            <span className="text-xs text-muted-foreground">{activity.duration}</span>
                            <span className={`text-xs px-2 py-1 rounded-full ${activity.tagColor}`}>
                              {activity.type}
                            </span>
                            {activity.status === 'completed' && (
                              <span className="text-xs text-green-600">✓</span>
                            )}
                          </div>
                        ))}
                        {day.activities.length === 0 && (
                          <div className="text-sm text-muted-foreground italic">
                            No tasks scheduled for this day
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="text-center py-4">
                    <button
                      onClick={() => router.push('/mockTests')}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      Take Practice Test →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal />
    </div>
  );
};

export default StudyPlannerDashboard;
