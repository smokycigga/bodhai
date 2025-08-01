"use client";
import React, { useState, useEffect } from 'react';

const TestCountdown = ({ onCountdownComplete, testData }) => {
  const [countdown, setCountdown] = useState(3);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      // Countdown finished, start fade out
      setIsVisible(false);
      setTimeout(() => {
        onCountdownComplete();
      }, 500); // Wait for fade out animation
    }
  }, [countdown, onCountdownComplete]);

  if (!isVisible && countdown === 0) {
    return null;
  }

  return (
    <div className={`fixed inset-0 bg-gray-900 flex flex-col items-center justify-center transition-opacity duration-500 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`} style={{ zIndex: 10000, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Header text */}
        <div className="mb-8">
          <h1 className="text-white text-2xl md:text-3xl font-semibold mb-2">
            Grab Your Pen & Paper
          </h1>
          <p className="text-gray-300 text-lg">
            Test starts in
          </p>
        </div>

        {/* Countdown number */}
        <div className="mb-8">
          {countdown > 0 ? (
            <div className="text-blue-400 text-8xl md:text-9xl font-bold animate-pulse">
              {countdown}
            </div>
          ) : (
            <div className="text-green-400 text-6xl md:text-7xl font-bold animate-bounce">
              GO!
            </div>
          )}
        </div>

        {/* Test info */}
        {testData && (
          <div className="text-gray-400 text-sm space-y-1">
            <p>{testData.totalQuestions} Questions</p>
            <p>{testData.timeLimit} Minutes</p>
            <p className="capitalize">{testData.examType?.replace('_', ' ') || 'Custom Test'}</p>
          </div>
        )}

        {/* Progress indicator */}
        <div className="mt-8 flex justify-center space-x-2">
          {[3, 2, 1].map((num) => (
            <div
              key={num}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                countdown <= num - 1 
                  ? 'bg-blue-400 scale-110' 
                  : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Animated circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full animate-ping"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-green-500/10 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-purple-500/10 rounded-full animate-ping animation-delay-2000"></div>
      </div>
    </div>
  );
};

export default TestCountdown;