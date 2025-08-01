"use client";
import React, { useState, useEffect } from 'react';
import MathRenderer from './MathRenderer';

// Single Choice Question Component (MCQ)
const SingleChoiceQuestion = ({ question, questionIndex, userAnswer, onAnswerChange, isReviewMode = false }) => {
  const handleOptionSelect = (optionId) => {
    if (!isReviewMode) {
      onAnswerChange(questionIndex, optionId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {question.options?.map((option, index) => {
          // Handle different option formats
          const optionId = option.identifier || option.id || String.fromCharCode(65 + index); // A, B, C, D
          const optionContent = option.content || option.text || option;

          return (
            <div
              key={optionId}
              onClick={() => handleOptionSelect(optionId)}
              className={`
                cursor-pointer border-2 rounded-xl p-4 transition-all hover:scale-[1.02]
                ${userAnswer === optionId
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-border bg-card hover:border-primary/50'
                }
                ${isReviewMode ? 'cursor-default' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1
                  ${userAnswer === optionId
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground'
                  }
                `}>
                  <span className="text-sm font-semibold">
                    {optionId}
                  </span>
                </div>
                <div className="flex-1 text-foreground">
                  <MathRenderer text={optionContent} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Multiple Choice Question Component (MCQM)
const MultipleChoiceQuestion = ({ question, questionIndex, userAnswer, onAnswerChange, isReviewMode = false }) => {
  const selectedOptions = Array.isArray(userAnswer) ? userAnswer : [];

  const handleOptionToggle = (optionId) => {
    if (isReviewMode) return;

    const newSelection = selectedOptions.includes(optionId)
      ? selectedOptions.filter(id => id !== optionId)
      : [...selectedOptions, optionId];

    onAnswerChange(questionIndex, newSelection);
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Multiple Correct Question - Select all correct options
          </span>
        </div>
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
          Marking: +4 for all correct, -2 for each wrong selection
        </div>
      </div>

      <div className="grid gap-3">
        {question.options?.map((option, index) => {
          // Handle different option formats
          const optionId = option.identifier || option.id || String.fromCharCode(65 + index); // A, B, C, D
          const optionContent = option.content || option.text || option;

          return (
            <div
              key={optionId}
              onClick={() => handleOptionToggle(optionId)}
              className={`
                cursor-pointer border-2 rounded-xl p-4 transition-all hover:scale-[1.02]
                ${selectedOptions.includes(optionId)
                  ? 'border-primary bg-primary/10 shadow-lg'
                  : 'border-border bg-card hover:border-primary/50'
                }
                ${isReviewMode ? 'cursor-default' : ''}
              `}
            >
              <div className="flex items-start space-x-3">
                <div className={`
                  w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1
                  ${selectedOptions.includes(optionId)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground'
                  }
                `}>
                  {selectedOptions.includes(optionId) && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 text-foreground">
                  <span className="font-semibold text-sm mr-2 text-foreground">{optionId}.</span>
                  <MathRenderer text={optionContent} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Numerical Answer Question Component
const NumericalQuestion = ({ question, questionIndex, userAnswer, onAnswerChange, isReviewMode = false }) => {
  const [inputValue, setInputValue] = useState(userAnswer || '');

  useEffect(() => {
    setInputValue(userAnswer || '');
  }, [userAnswer]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow numbers, decimal point, and negative sign
    if (/^-?\d*\.?\d*$/.test(value) || value === '') {
      setInputValue(value);
      onAnswerChange(questionIndex, value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Numerical Answer Question
          </span>
        </div>
        <div className="text-xs text-green-600 dark:text-green-400 mt-1">
          Enter your answer as a decimal number (e.g., 2.5, -1.23, 0.001)
        </div>
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-medium text-foreground mb-2">
          Your Answer:
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={isReviewMode}
          placeholder="Enter numerical answer"
          className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none text-lg font-mono text-center bg-card"
        />
        <div className="text-xs text-muted-foreground mt-2">
          No negative marking for numerical questions
        </div>
      </div>
    </div>
  );
};

// Integer Answer Question Component  
const IntegerQuestion = ({ question, questionIndex, userAnswer, onAnswerChange, isReviewMode = false }) => {
  const [inputValue, setInputValue] = useState(userAnswer || '');

  useEffect(() => {
    setInputValue(userAnswer || '');
  }, [userAnswer]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only integers (positive and negative)
    if (/^-?\d*$/.test(value) || value === '') {
      setInputValue(value);
      onAnswerChange(questionIndex, value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
          <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
            Integer Answer Question
          </span>
        </div>
        <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
          Enter your answer as a whole number (e.g., 5, -2, 0, 123)
        </div>
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-medium text-foreground mb-2">
          Your Answer:
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={isReviewMode}
          placeholder="Enter integer answer"
          className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none text-lg font-mono text-center bg-card"
        />
        <div className="text-xs text-muted-foreground mt-2">
          Answer must be a whole number (integer)
        </div>
      </div>
    </div>
  );
};

// Fill in the Blanks Question Component (14.7% of questions)
const FillBlanksQuestion = ({ question, questionIndex, userAnswer, onAnswerChange, isReviewMode = false }) => {
  const [inputValue, setInputValue] = useState(userAnswer || '');

  useEffect(() => {
    setInputValue(userAnswer || '');
  }, [userAnswer]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    onAnswerChange(questionIndex, value);
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
            Fill in the Blanks
          </span>
        </div>
        <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
          Fill in the missing word(s) or value(s)
        </div>
      </div>

      <div className="max-w-md">
        <label className="block text-sm font-medium text-foreground mb-2">
          Your Answer:
        </label>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          disabled={isReviewMode}
          placeholder="Enter your answer"
          className="w-full px-4 py-3 border-2 border-border rounded-xl focus:border-primary focus:outline-none text-lg bg-card"
        />
      </div>
    </div>
  );
};

// Image-Based Question Component (15.7% of questions)
const ImageBasedQuestion = ({ question, questionIndex, userAnswer, onAnswerChange, isReviewMode = false }) => {
  // This is essentially an MCQ but with special handling for images
  return (
    <div className="space-y-4">
      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-indigo-800 dark:text-indigo-200">
            Image-Based Question
          </span>
        </div>
        <div className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
          Refer to the image(s) in the question to answer
        </div>
      </div>

      <SingleChoiceQuestion
        question={question}
        questionIndex={questionIndex}
        userAnswer={userAnswer}
        onAnswerChange={onAnswerChange}
        isReviewMode={isReviewMode}
      />
    </div>
  );
};

// Main Question Renderer Component
const QuestionRenderer = ({ question, questionIndex, userAnswer, onAnswerChange, isReviewMode = false }) => {
  // Determine question type based on actual data analysis
  const getQuestionType = () => {
    if (question.question_type) {
      return question.question_type;
    }

    // Enhanced detection based on actual data patterns
    const content = (question.content || '').toLowerCase();
    const options = question.options || [];
    const correctOptions = question.correct_options || [];

    // Check for integer type (22.4% of JEE Main, 32.4% of JEE Advanced)
    if (question.type === 'integer') {
      return 'integer';
    }

    // Check for multiple correct (2.8% of questions)
    if (question.type === 'mcqm' || correctOptions.length > 1) {
      return 'mcqm';
    }

    // Check for no options (numerical/integer answer)
    if (!options || options.length === 0) {
      if (content.includes('integer') || content.includes('whole number')) {
        return 'integer_answer';
      }
      return 'numerical_answer';
    }

    // Check for fill in the blanks (14.7% of questions)
    if (content.includes('_____') || content.includes('fill')) {
      return 'fill_blanks';
    }

    // Check for image-based questions (15.7% of questions)
    if (content.includes('<img') || content.includes('src=') ||
      options.some(opt => typeof opt === 'object' && opt.content && opt.content.includes('<img'))) {
      return 'image_based';
    }

    // Default to single correct MCQ (80.8% of questions)
    return 'mcq';
  };

  const questionType = getQuestionType();

  // Render appropriate component based on question type
  const renderQuestionComponent = () => {
    switch (questionType) {
      case 'mcqm':
        return (
          <MultipleChoiceQuestion
            question={question}
            questionIndex={questionIndex}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            isReviewMode={isReviewMode}
          />
        );

      case 'numerical_answer':
        return (
          <NumericalQuestion
            question={question}
            questionIndex={questionIndex}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            isReviewMode={isReviewMode}
          />
        );

      case 'integer':
      case 'integer_answer':
        return (
          <IntegerQuestion
            question={question}
            questionIndex={questionIndex}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            isReviewMode={isReviewMode}
          />
        );

      case 'fill_blanks':
        return (
          <FillBlanksQuestion
            question={question}
            questionIndex={questionIndex}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            isReviewMode={isReviewMode}
          />
        );

      case 'image_based':
        return (
          <ImageBasedQuestion
            question={question}
            questionIndex={questionIndex}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            isReviewMode={isReviewMode}
          />
        );

      case 'mcq':
      default:
        return (
          <SingleChoiceQuestion
            question={question}
            questionIndex={questionIndex}
            userAnswer={userAnswer}
            onAnswerChange={onAnswerChange}
            isReviewMode={isReviewMode}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Question Content */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-semibold text-sm">
                {questionIndex + 1}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{question.subject}</span>
              {question.chapter && <span> • {question.chapter}</span>}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-xs font-medium">
              +{question.marks || 4}
            </div>
            {question.negMarks > 0 && (
              <div className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-full text-xs font-medium">
                -{question.negMarks}
              </div>
            )}
            <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-xs font-medium uppercase">
              {questionType}
            </div>
          </div>
        </div>

        <div className="prose prose-sm max-w-none dark:prose-invert mb-6 text-foreground">
          <MathRenderer text={question.content || question.question || 'Question content not available'} />
        </div>

        {/* Question Component */}
        {renderQuestionComponent()}
      </div>
    </div>
  );
};

export default QuestionRenderer;