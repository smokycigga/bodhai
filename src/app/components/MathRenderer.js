"use client";
import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

/** 
 * MathRenderer that handles the specific LaTeX format from MongoDB
 */
const MathRenderer = ({ text }) => {
  if (!text) return null;

  try {
    // Step 1: Smart cleanup that preserves HTML but fixes LaTeX issues
    let cleanText = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      // Only convert specific <br> patterns that cause issues
      .replace(/<br\s*\/?><br\s*\/?>/gi, ' ')  // Double <br> to space
      .replace(/\n<br\s*\/?>/gi, ' ')          // Newline + <br> to space
      .replace(/<br\s*\/?>(?=\s*\$)/gi, ' ')   // <br> before $ to space
      // Fix common LaTeX issues from your MongoDB data
      .replace(/\\begin\{vmatrix\}/g, '\\begin{vmatrix}')
      .replace(/\\end\{vmatrix\}/g, '\\end{vmatrix}')
      // Fix escaped braces that should be literal
      .replace(/\\\{([^}]*)\\\}/g, '\\{$1\\}')
      // Fix common LaTeX command issues
      .replace(/\\over\s+/g, '\\over ')
      .replace(/\\left\s*\\\{/g, '\\left\\{')
      .replace(/\\right\s*\\\}/g, '\\right\\}')
      // Clean up excessive whitespace but preserve single spaces
      .replace(/\s{3,}/g, ' ')
      .trim();

    // Step 2: Parse and render the content
    return renderMathContent(cleanText);

  } catch (error) {
    console.error('MathRenderer error:', error);
    // Fallback: render as HTML
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  }
};

/**
 * Parse and render content with proper math and HTML handling
 */
const renderMathContent = (content) => {
  const elements = [];
  let currentIndex = 0;

  // Enhanced regex to handle both $$ and $ delimiters
  const mathRegex = /(?<!\\)(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g;
  let match;

  while ((match = mathRegex.exec(content)) !== null) {
    // Add text before the math expression
    if (match.index > currentIndex) {
      const textBefore = content.slice(currentIndex, match.index);
      if (textBefore.trim()) {
        // Render as HTML to handle <sup>, <sub>, <img>, etc.
        elements.push(
          <span
            key={`text-${currentIndex}`}
            dangerouslySetInnerHTML={{ __html: textBefore }}
          />
        );
      }
    }

    // Process the math expression
    const mathExpression = match[1];
    const isBlock = mathExpression.startsWith('$$') && mathExpression.endsWith('$$');

    // Extract math content
    let mathContent;
    if (isBlock) {
      mathContent = mathExpression.slice(2, -2).trim();
    } else {
      mathContent = mathExpression.slice(1, -1).trim();
    }

    // Clean up the LaTeX content
    mathContent = cleanLatexContent(mathContent);

    // Render the math - ALWAYS as inline to prevent line breaks
    if (mathContent) {
      try {
        // Force ALL math to be inline, regardless of $$ or $
        elements.push(
          <span key={`math-${match.index}`} style={{
            display: 'inline',
            verticalAlign: 'baseline',
            margin: '0 2px'
          }}>
            <InlineMath math={mathContent} />
          </span>
        );
      } catch (katexError) {
        console.error('KaTeX error:', katexError, 'Content:', mathContent);
        // Enhanced fallback: try to render simpler version
        const simplifiedContent = simplifyLatexForFallback(mathContent);
        try {
          elements.push(
            <span key={`fallback-${match.index}`} style={{
              display: 'inline',
              verticalAlign: 'baseline',
              margin: '0 2px'
            }}>
              <InlineMath math={simplifiedContent} />
            </span>
          );
        } catch (secondError) {
          // Final fallback: show styled error
          elements.push(
            <span key={`error-${match.index}`} style={{
              color: '#e74c3c',
              fontFamily: 'monospace',
              backgroundColor: '#ffeaa7',
              padding: '1px 3px',
              borderRadius: '2px',
              fontSize: '0.9em'
            }}>
              {mathExpression}
            </span>
          );
        }
      }
    }

    currentIndex = match.index + match[0].length;
  }

  // Add any remaining text
  if (currentIndex < content.length) {
    const remainingText = content.slice(currentIndex);
    if (remainingText.trim()) {
      // Render as HTML to handle any remaining HTML tags
      elements.push(
        <span
          key={`final-${currentIndex}`}
          dangerouslySetInnerHTML={{ __html: remainingText }}
        />
      );
    }
  }

  // If no math expressions found, render as HTML
  if (elements.length === 0) {
    return <span dangerouslySetInnerHTML={{ __html: content }} />;
  }

  return (
    <span style={{
      display: 'inline',
      lineHeight: 'inherit'
    }}>
      {elements}
    </span>
  );
};

/**
 * Clean up LaTeX content for proper rendering
 */
const cleanLatexContent = (content) => {
  return content
    // Fix common LaTeX issues
    .replace(/\\left\(/g, '\\left(')
    .replace(/\\right\)/g, '\\right)')
    .replace(/\\left\[/g, '\\left[')
    .replace(/\\right\]/g, '\\right]')
    .replace(/\\left\{/g, '\\left\\{')
    .replace(/\\right\}/g, '\\right\\}')
    .replace(/\\left\|/g, '\\left|')
    .replace(/\\right\|/g, '\\right|')
    // Fix matrix notation - convert vmatrix to simple vertical bars for better compatibility
    .replace(/\\begin\{vmatrix\}/g, '|')
    .replace(/\\end\{vmatrix\}/g, '|')
    // Fix over notation
    .replace(/\\over\s+/g, '\\over ')
    // Fix common fraction issues
    .replace(/\{([^}]+)\}\\over\{([^}]+)\}/g, '\\frac{$1}{$2}')
    // Fix spacing issues
    .replace(/\s+/g, ' ')
    // Fix specific issues from your data
    .replace(/\{\s*([^}]+)\s*\}/g, '{$1}') // Clean up braces
    .replace(/\^\s*\{/g, '^{') // Fix superscript spacing
    .replace(/_\s*\{/g, '_{') // Fix subscript spacing
    // Fix common chemistry notation
    .replace(/\{([^}]+)\}/g, '{$1}') // Ensure proper brace handling
    .trim();
};

/**
 * Simplify LaTeX for fallback rendering
 */
const simplifyLatexForFallback = (content) => {
  return content
    // Convert complex structures to simpler ones
    .replace(/\\begin\{[^}]+\}.*?\\end\{[^}]+\}/g, '[matrix]')
    .replace(/\\left[\\(\\[\\{|]/g, '')
    .replace(/\\right[\\)\\]\\}|]/g, '')
    .replace(/\\over/g, '/')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    // Keep basic math symbols
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\theta/g, 'θ')
    .replace(/\\pi/g, 'π')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\mu/g, 'μ')
    .trim();
};

export default MathRenderer;