"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

const StudyStreakWidget = () => {
  const { userId } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [backendStatus, setBackendStatus] = useState('checking');

  // Check if backend is running
  const checkBackendStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/health');
      if (response.ok) {
        setBackendStatus('online');
        return true;
      } else {
        setBackendStatus('offline');
        return false;
      }
    } catch (err) {
      setBackendStatus('offline');
      return false;
    }
  };

  // Fetch streak data
  const fetchStreakData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      console.log('Fetching streak data for user:', userId);
      
      // Check backend status first
      const isBackendOnline = await checkBackendStatus();
      
      if (!isBackendOnline) {
        console.log('Backend is offline, using default streak data');
        const defaultStreak = {
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_test_date: null,
          streak_start_date: null
        };
        setStreakData(defaultStreak);
        generateProgressData(defaultStreak);
        return;
      }
      
      // Add cache busting to ensure fresh data
      const response = await fetch(`http://localhost:5000/api/user-streak/${userId}?t=${Date.now()}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Received streak data:', data);
        setStreakData(data.streak);
        generateProgressData(data.streak);
      } else if (response.status === 404) {
        console.log('Streak endpoint not found, creating default streak data');
        // Create default streak data for new users
        const defaultStreak = {
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_test_date: null,
          streak_start_date: null
        };
        setStreakData(defaultStreak);
        generateProgressData(defaultStreak);
      } else {
        console.error('Failed to fetch streak data:', response.status);
        // Use default data on error
        const defaultStreak = {
          user_id: userId,
          current_streak: 0,
          longest_streak: 0,
          last_test_date: null,
          streak_start_date: null
        };
        setStreakData(defaultStreak);
        generateProgressData(defaultStreak);
      }
    } catch (err) {
      console.error('Error fetching streak data:', err);
      // Use default data on network error
      const defaultStreak = {
        user_id: userId,
        current_streak: 0,
        longest_streak: 0,
        last_test_date: null,
        streak_start_date: null
      };
      setStreakData(defaultStreak);
      generateProgressData(defaultStreak);
    } finally {
      setLoading(false);
    }
  };

  // Generate progress data for the last 30 days
  const generateProgressData = (streak) => {
    // Get IST time
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const today = new Date(now.getTime() + istOffset);
    const todayStr = today.toISOString().split('T')[0];
    
    const lastTestDate = streak?.last_test_date ? new Date(streak.last_test_date) : null;
    
    // Generate last 30 days data
    const monthlyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      let status = 'missed'; // Default to missed for past dates
      
      // Check if this date has a test completed
      if (lastTestDate) {
        const lastTestStr = lastTestDate.toISOString().split('T')[0];
        
        if (streak.current_streak > 0) {
          // Calculate streak start date
          const streakStartDate = new Date(lastTestDate);
          streakStartDate.setDate(lastTestDate.getDate() - streak.current_streak + 1);
          const streakStartStr = streakStartDate.toISOString().split('T')[0];
          
          // If date is within streak range
          if (dateStr >= streakStartStr && dateStr <= lastTestStr) {
            status = 'completed';
          }
        } else if (dateStr === lastTestStr) {
          status = 'completed';
        }
      }
      
      // Mark today
      if (dateStr === todayStr) {
        // If today is already in completed range, keep it completed
        // Otherwise mark as today (pending)
        if (status !== 'completed') {
          status = 'today';
        }
      }
      
      // Future dates should be empty
      if (date > today) {
        status = 'empty';
      }
      
      monthlyData.push({ 
        date: dateStr, 
        status,
        day: date.getDate()
      });
    }
    
    console.log('Generated monthly progress:', monthlyData);
    setMonthlyProgress(monthlyData);
  };

  useEffect(() => {
    fetchStreakData();
  }, [userId]);

  // Auto-refresh every 30 seconds to catch test updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchStreakData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [userId]);

  // Manual refresh function
  const handleRefresh = () => {
    fetchStreakData();
  };

  // Calculate this week's progress percentage
  const getWeekProgress = () => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekData = monthlyProgress.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= startOfWeek && dayDate <= today;
    });
    
    const completedDays = weekData.filter(day => day.status === 'completed').length;
    return Math.round((completedDays / 7) * 100);
  };

  // Calculate this month's completed days
  const getThisMonthCount = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    return monthlyProgress.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate.getMonth() === currentMonth && 
             dayDate.getFullYear() === currentYear && 
             day.status === 'completed';
    }).length;
  };

  // Calculate next milestone
  const getNextMilestone = (currentStreak) => {
    const milestones = [5, 10, 15, 20, 30, 50, 100];
    const nextMilestone = milestones.find(m => m > currentStreak) || currentStreak + 10;
    const remaining = nextMilestone - currentStreak;
    return { milestone: nextMilestone, remaining };
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-2 bg-gray-200 rounded w-full mb-4"></div>
        <div className="grid grid-cols-10 gap-1 mb-4">
          {Array.from({length: 30}).map((_, i) => (
            <div key={i} className="w-6 h-6 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  const currentStreak = streakData?.current_streak || 0;
  const longestStreak = streakData?.longest_streak || 0;
  const thisMonthCount = getThisMonthCount();
  const weekProgress = getWeekProgress();
  const nextMilestone = getNextMilestone(currentStreak);
  const completedDays = monthlyProgress.filter(d => d.status === 'completed').length;

  // Debug info
  console.log('Component render - Streak data:', {
    currentStreak,
    longestStreak,
    lastTestDate: streakData?.last_test_date,
    monthlyProgressLength: monthlyProgress.length,
    completedDays
  });

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Study Streak</h3>
        </div>
        <button 
          onClick={handleRefresh}
          className="w-5 h-5 text-gray-400 hover:text-gray-600 transition-colors"
          title="Refresh streak data"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Backend Status & Motivational message */}
      {backendStatus === 'offline' && (
        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="text-sm text-yellow-800">
              Backend server is offline. Showing demo data. Start the backend server to see real streak data.
            </span>
          </div>
        </div>
      )}
      
      <p className="text-gray-500 mb-4 flex items-center space-x-1">
        <span>
          {currentStreak > 0 
            ? `Great momentum! You're on fire!` 
            : backendStatus === 'offline' 
            ? "Demo mode: Take a test to see your real streak!" 
            : "Start your streak today! Take a test to begin your journey."
          }
        </span>
        {currentStreak > 0 && (
          <svg className="w-4 h-4 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        )}
      </p>

      {/* Current streak display */}
      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-2xl p-6 mb-6 text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <svg className="w-6 h-6 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.6 2.65.6 4.04 0 2.65-2.15 4.8-4.81 4.8z"/>
          </svg>
          <span className="text-4xl font-bold text-orange-600">{currentStreak}</span>
        </div>
        <p className="text-orange-700 font-medium">days streak</p>
      </div>

      {/* This Week's Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-semibold text-gray-900">This Week's Progress</h4>
          <span className="text-blue-600 font-bold">{weekProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${weekProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Last 30 Days */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Last 30 Days</h4>
        {monthlyProgress.length > 0 ? (
          <div className="grid grid-cols-10 gap-2 mb-3">
            {monthlyProgress.map((day, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-all duration-200 border ${
                  day.status === 'completed' 
                    ? 'bg-green-500 text-white border-green-600' 
                    : day.status === 'today'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : day.status === 'missed'
                    ? 'bg-red-100 text-red-500 border-red-200'
                    : 'bg-gray-100 text-gray-400 border-gray-200'
                }`}
                title={`${day.date} - ${day.status}`}
              >
                {day.status === 'completed' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                ) : day.status === 'today' ? (
                  <span className="text-white font-bold text-xs">0</span>
                ) : day.status === 'missed' ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                ) : (
                  <span className="text-gray-400">-</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            <p>Loading calendar data...</p>
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Today</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-100 rounded"></div>
              <span className="text-gray-600">Missed</span>
            </div>
          </div>
          <span className="text-gray-500 font-medium">{completedDays} / 30 days</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-blue-600 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5,16L3,14L5,12L6.5,13.5L11,9L16,14L22,8V10L16,16L11,11L6.5,15.5L5,16Z"/>
            </svg>
            <span className="text-2xl font-bold text-blue-600">{longestStreak}</span>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">Longest Streak</div>
            <div className="text-gray-500">Personal best</div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-2xl p-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <svg className="w-5 h-5 text-green-600 mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z"/>
            </svg>
            <span className="text-2xl font-bold text-green-600">{thisMonthCount}</span>
          </div>
          <div className="text-sm">
            <div className="font-semibold text-gray-900">This Month</div>
            <div className="text-gray-500">Study days</div>
          </div>
        </div>
      </div>

      {/* Keep Going Section */}
      {currentStreak > 0 && (
        <div className="bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl p-4">
          <div className="flex items-center space-x-2 mb-2">
            <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11 17l-5-5 1.41-1.41L11 14.17l8.59-8.58L21 7l-10 10z"/>
            </svg>
            <h4 className="font-bold text-gray-900">Keep Going!</h4>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Just {nextMilestone.remaining} more days to reach {nextMilestone.milestone} days!
          </p>
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Progress to next milestone</span>
            <span>{currentStreak}/{nextMilestone.milestone}</span>
          </div>
          <div className="w-full bg-yellow-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-orange-400 to-yellow-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStreak / nextMilestone.milestone) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyStreakWidget;
