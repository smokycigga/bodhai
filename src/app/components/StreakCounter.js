"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

const StreakCounter = ({ size = 'medium', showDetails = true }) => {
  const { userId } = useAuth();
  const [streakData, setStreakData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch streak data
  const fetchStreakData = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/user-streak/${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setStreakData(data.streak);
      } else {
        setError('Failed to load streak data');
      }
    } catch (err) {
      console.error('Error fetching streak data:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStreakData();
  }, [userId]);

  // Size variants
  const sizeClasses = {
    small: {
      container: 'p-3',
      number: 'text-2xl',
      label: 'text-sm',
      icon: 'w-4 h-4'
    },
    medium: {
      container: 'p-4',
      number: 'text-3xl',
      label: 'text-base',
      icon: 'w-5 h-5'
    },
    large: {
      container: 'p-6',
      number: 'text-4xl',
      label: 'text-lg',
      icon: 'w-6 h-6'
    }
  };

  const classes = sizeClasses[size];

  if (loading) {
    return (
      <div className={`bg-surface-200 rounded-lg ${classes.container} animate-pulse`}>
        <div className="flex items-center space-x-3">
          <div className="bg-primary/20 rounded-full p-2">
            <div className={`${classes.icon} bg-gray-400 rounded`}></div>
          </div>
          <div>
            <div className={`${classes.number} bg-gray-400 rounded w-12 h-8`}></div>
            <div className={`${classes.label} bg-gray-400 rounded w-16 h-4 mt-1`}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !streakData) {
    return (
      <div className={`bg-surface-200 rounded-lg ${classes.container} border border-error/20`}>
        <div className="flex items-center space-x-3">
          <div className="bg-error/20 rounded-full p-2">
            <svg className={`${classes.icon} text-error`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className={`${classes.number} font-bold text-text-primary`}>--</div>
            <div className={`${classes.label} text-text-secondary`}>Day Streak</div>
          </div>
        </div>
      </div>
    );
  }

  const { current_streak, longest_streak, last_test_date } = streakData;
  
  // Calculate streak status
  const getStreakStatus = () => {
    if (!last_test_date) return 'start';
    
    const today = new Date().toISOString().split('T')[0];
    const lastTest = new Date(last_test_date).toISOString().split('T')[0];
    const daysDiff = Math.floor((new Date(today) - new Date(lastTest)) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'active'; // Tested today
    if (daysDiff === 1) return 'pending'; // Can still maintain streak
    return 'broken'; // Streak broken
  };

  const streakStatus = getStreakStatus();
  
  // Status-based styling
  const getStatusStyles = () => {
    switch (streakStatus) {
      case 'active':
        return {
          containerBg: 'bg-primary/10 border-primary/30',
          iconBg: 'bg-primary/20',
          iconColor: 'text-primary',
          numberColor: 'text-primary',
          icon: (
            <svg className={`${classes.icon}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )
        };
      case 'pending':
        return {
          containerBg: 'bg-warning/10 border-warning/30',
          iconBg: 'bg-warning/20',
          iconColor: 'text-warning',
          numberColor: 'text-warning',
          icon: (
            <svg className={`${classes.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        };
      case 'broken':
        return {
          containerBg: 'bg-error/10 border-error/30',
          iconBg: 'bg-error/20',
          iconColor: 'text-error',
          numberColor: 'text-error',
          icon: (
            <svg className={`${classes.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        };
      default:
        return {
          containerBg: 'bg-surface-200 border-border',
          iconBg: 'bg-primary/20',
          iconColor: 'text-primary',
          numberColor: 'text-text-primary',
          icon: (
            <svg className={`${classes.icon}`} fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          )
        };
    }
  };

  const statusStyles = getStatusStyles();

  const getStatusMessage = () => {
    switch (streakStatus) {
      case 'active':
        return current_streak === 1 ? 'Great start! You tested today.' : `Amazing! ${current_streak} days strong!`;
      case 'pending':
        return 'Take a test today to keep your streak alive!';
      case 'broken':
        return 'Start a new streak by taking a test today!';
      default:
        return 'Take your first test to start your streak!';
    }
  };

  return (
    <div className={`rounded-lg border ${classes.container} ${statusStyles.containerBg}`}>
      <div className="flex items-center space-x-3">
        <div className={`rounded-full p-2 ${statusStyles.iconBg} ${statusStyles.iconColor}`}>
          {statusStyles.icon}
        </div>
        <div className="flex-1">
          <div className={`${classes.number} font-bold ${statusStyles.numberColor}`}>
            {current_streak}
          </div>
          <div className={`${classes.label} text-text-secondary`}>
            Day Streak
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="mt-3 pt-3 border-t border-border/20">
          <div className="text-sm text-text-secondary mb-2">
            {getStatusMessage()}
          </div>
          
          {longest_streak > 0 && (
            <div className="flex justify-between text-xs text-text-muted">
              <span>Best Streak: {longest_streak} days</span>
              {last_test_date && (
                <span>Last Test: {new Date(last_test_date).toLocaleDateString()}</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StreakCounter;
