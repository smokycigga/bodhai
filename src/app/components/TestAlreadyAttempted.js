"use client";
import React from 'react';

const TestAlreadyAttempted = ({ testData, testResults, onCreateNewTest, onViewResults }) => {
  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="mb-8">
        <div className="w-24 h-24 bg-orange-100 dark:bg-orange-900/20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
          <svg className="w-12 h-12 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">Test Already Attempted!</h1>
        <p className="text-muted-foreground text-lg">You have already completed this test</p>
      </div>

      {/* Test Summary */}
      <div className="bg-card border border-border rounded-2xl p-8 mb-8 shadow-sm">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-muted-foreground text-sm">Questions</span>
            <p className="font-semibold text-foreground text-lg">{testData?.totalQuestions || 'N/A'}</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-muted-foreground text-sm">Duration</span>
            <p className="font-semibold text-foreground text-lg">{testData?.timeLimit || 'N/A'} min</p>
          </div>
        </div>

        {/* Previous Score Display */}
        {testResults && (
          <div className="bg-muted/30 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Your Previous Score</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {testResults.correct_answers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {testResults.incorrect_answers || 0}
                </div>
                <div className="text-sm text-muted-foreground">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {testResults.accuracy || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Accuracy</div>
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Test completed on {testResults?.completedAt ? new Date(testResults.completedAt).toLocaleDateString() : 'Unknown date'}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        {testResults && (
          <button
            onClick={onViewResults}
            className="w-full px-8 py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
          >
            View Detailed Results
          </button>
        )}
        <button
          onClick={onCreateNewTest}
          className="w-full px-8 py-4 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
        >
          Create New Test
        </button>
      </div>

      {/* Info Message */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Why can't I retake this test?</p>
            <p>To maintain the integrity of your performance tracking, each test can only be attempted once. Create a new test with similar settings to practice more.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestAlreadyAttempted;