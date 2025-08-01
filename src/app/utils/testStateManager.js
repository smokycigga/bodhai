// Test State Management Utility
export const TestStateManager = {
  // Set test as completed
  markTestCompleted: (testId) => {
    const completedTests = JSON.parse(localStorage.getItem('completedTests') || '[]');
    if (!completedTests.includes(testId)) {
      completedTests.push(testId);
      localStorage.setItem('completedTests', JSON.stringify(completedTests));
    }
  },

  // Check if test is completed
  isTestCompleted: (testId) => {
    const completedTests = JSON.parse(localStorage.getItem('completedTests') || '[]');
    return completedTests.includes(testId);
  },

  // Get test results from localStorage
  getTestResults: (testId) => {
    const testResults = localStorage.getItem(`testResults_${testId}`);
    return testResults ? JSON.parse(testResults) : null;
  },

  // Save test results
  saveTestResults: (testId, results) => {
    localStorage.setItem(`testResults_${testId}`, JSON.stringify(results));
  },

  // Clear test data (for new test)
  clearTestData: (testId) => {
    localStorage.removeItem(`testResults_${testId}`);
    const completedTests = JSON.parse(localStorage.getItem('completedTests') || '[]');
    const updatedTests = completedTests.filter(id => id !== testId);
    localStorage.setItem('completedTests', JSON.stringify(updatedTests));
  },

  // Get current test from localStorage
  getCurrentTest: () => {
    const currentTest = localStorage.getItem('currentTest');
    return currentTest ? JSON.parse(currentTest) : null;
  }
};