"use client";
import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

/** 
 * MathRenderer that handles the specific LaTeX format from MongoDB
 */
const MathRenderer = ({ text }) => {
  // Handle null, undefined, or empty text
  if (!text) return null;

  // Debug: Log problematic matrix content
  if (text.includes('\\begin{matrix}')) {
    console.log('Matrix content detected:', text);
    console.log('Text length:', text.length);
    console.log('Contains $:', text.includes('$'));
  }

  // Handle non-string inputs (objects, arrays, etc.)
  if (typeof text !== 'string') {
    console.warn('MathRenderer received non-string input:', text);
    // Try to extract text from object if it has common text properties
    if (typeof text === 'object') {
      if (text.content) return <MathRenderer text={text.content} />;
      if (text.text) return <MathRenderer text={text.text} />;
      if (text.id) return <span>{text.id}</span>; // For option IDs
      // If it's a plain object, try to stringify it safely
      try {
        return <span>{JSON.stringify(text)}</span>;
      } catch {
        return <span>[Invalid Content]</span>;
      }
    }
    // Convert other types to string
    return <span>{String(text)}</span>;
  }

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

      // SUPER COMPREHENSIVE MATRIX FIXING - Multiple passes with different patterns
      
      // Pass 0: Handle SQUARE BRACKET patterns first (the actual issue!)
      .replace(/\\left\[\s*\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}\s*\\right\]/g, (match, content) => {
        console.log('Pass 0 - Square bracket matrix (MAIN ISSUE):', match.substring(0, 100) + '...');
        return `\\begin{bmatrix}${content.replace(/\\\\/g, ' \\\\ ').replace(/\s*&\s*/g, ' & ')}\\end{bmatrix}`;
      })
      
      // Pass 1: Handle the most complex nested patterns first
      .replace(/\\left\{\s*\{\s*\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}\s*\}\s*\\right\]/g, (match, content) => {
        console.log('Pass 1 - Complex nested matrix:', match.substring(0, 100) + '...');
        return `\\begin{bmatrix}${content.replace(/\\\\/g, ' \\\\ ').replace(/\s*&\s*/g, ' & ')}\\end{bmatrix}`;
      })
      
      // Pass 2: Handle patterns with single braces
      .replace(/\\left\{\s*\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}\s*\\right\]/g, (match, content) => {
        console.log('Pass 2 - Single brace matrix:', match.substring(0, 100) + '...');
        return `\\begin{bmatrix}${content.replace(/\\\\/g, ' \\\\ ').replace(/\s*&\s*/g, ' & ')}\\end{bmatrix}`;
      })
      
      // Pass 3: Handle any remaining \begin{matrix} patterns
      .replace(/\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}/g, (match, content) => {
        console.log('Pass 3 - Basic matrix:', match.substring(0, 100) + '...');
        return `\\begin{pmatrix}${content.replace(/\\\\/g, ' \\\\ ').replace(/\s*&\s*/g, ' & ')}\\end{pmatrix}`;
      })
      
      // Pass 4: Handle any leftover \left{ and \right] combinations
      .replace(/\\left\{\s*([^{}]*(?:\{[^{}]*\}[^{}]*)*)\s*\\right\]/g, (match, content) => {
        if (content.includes('&') || content.includes('\\\\')) {
          console.log('Pass 4 - Leftover matrix pattern:', match.substring(0, 100) + '...');
          return `\\begin{bmatrix}${content.replace(/\\\\/g, ' \\\\ ').replace(/\s*&\s*/g, ' & ')}\\end{bmatrix}`;
        }
        return match; // Don't change if it doesn't look like a matrix
      })
      
      // Pass 5: Clean up any remaining matrix-like patterns
      .replace(/\\left\{\s*/g, '\\begin{bmatrix}')
      .replace(/\s*\\right\]/g, '\\end{bmatrix}')
      
      // Pass 6: Fix any double matrix declarations
      .replace(/\\begin\{bmatrix\}\\begin\{bmatrix\}/g, '\\begin{bmatrix}')
      .replace(/\\end\{bmatrix\}\\end\{bmatrix\}/g, '\\end{bmatrix}')

      // Fix common LaTeX issues from your MongoDB data
      .replace(/\\begin\{vmatrix\}/g, '\\begin{vmatrix}')
      .replace(/\\end\{vmatrix\}/g, '\\end{vmatrix}')
      // Fix matrix syntax issues - comprehensive matrix handling
      .replace(/\\left\{\s*\{\\begin\{matrix\}([\s\S]*?)\\end\{matrix\}\s*\}\s*\\right\]/g, (match, content) => {
        console.log('Replacing complex matrix pattern:', match);
        return `\\begin{bmatrix}${content.replace(/\\\\/g, ' \\\\ ').replace(/\s*&\s*/g, ' & ')}\\end{bmatrix}`;
      })
      .replace(/\\left\{\s*\\matrix\{([^}]+)\}\s*\\right\|/g, '\\begin{vmatrix}$1\\end{vmatrix}')
      .replace(/\\left\|\s*\\matrix\{([^}]+)\}\s*\\right\|/g, '\\begin{vmatrix}$1\\end{vmatrix}')
      .replace(/\\left\{\s*\\matrix\{/g, '\\begin{vmatrix}')
      .replace(/\}\s*\\right\|/g, '\\end{vmatrix}')
      .replace(/\\matrix\{/g, '\\begin{matrix}')
      .replace(/\\cr/g, '\\\\')
      // Fix nested braces in matrices
      .replace(/\{\s*\{([^}]+)\}\s*\}/g, '{$1}')
      // Fix matrix element separators
      .replace(/\s*&\s*/g, ' & ')
      .replace(/\\\\\s*\\\\/g, '\\\\')
      // Fix escaped braces that should be literal
      .replace(/\\\{([^}]*)\\\}/g, '\\{$1\\}')
      // Fix common LaTeX command issues
      .replace(/\\over\s+/g, '\\over ')
      .replace(/\\left\s*\\\{/g, '\\left\\{')
      .replace(/\\right\s*\\\}/g, '\\right\\}')
      // Fix overline notation
      .replace(/\\overline\s+([^}]+)/g, '\\overline{$1}')
      // Clean up excessive whitespace but preserve single spaces
      .replace(/\s{3,}/g, ' ')
      .trim();

    // Step 2: Special handling for matrix content that might not be wrapped in $
    if ((cleanText.includes('\\begin{matrix}') || cleanText.includes('\\begin{bmatrix}') || cleanText.includes('\\begin{pmatrix}')) && !cleanText.includes('$')) {
      console.log('Forcing matrix content to be treated as math:', cleanText);
      cleanText = `$${cleanText}$`;
    }

    // Step 2.5: NUCLEAR OPTION - String-based matrix fixing for stubborn cases
    if (cleanText.includes('\\begin{matrix}') && (cleanText.includes('\\left{') || cleanText.includes('\\right]'))) {
      console.log('NUCLEAR OPTION: Applying string-based matrix fixes');
      
      // Use string manipulation instead of regex for maximum reliability
      let fixedText = cleanText;
      
      // Replace all variations of the problematic pattern (INCLUDING SQUARE BRACKETS!)
      const patterns = [
        // Square bracket patterns (THE MAIN ISSUE)
        { from: '\\left[ \\begin{matrix}', to: '\\begin{bmatrix}' },
        { from: '\\left[\\begin{matrix}', to: '\\begin{bmatrix}' },
        { from: '\\end{matrix} \\right]', to: '\\end{bmatrix}' },
        { from: '\\end{matrix}\\right]', to: '\\end{bmatrix}' },
        
        // Curly bracket patterns (backup)
        { from: '\\left{ {\\begin{matrix}', to: '\\begin{bmatrix}' },
        { from: '\\left{\\begin{matrix}', to: '\\begin{bmatrix}' },
        { from: '\\left{ \\begin{matrix}', to: '\\begin{bmatrix}' },
        { from: '\\end{matrix} } \\right]', to: '\\end{bmatrix}' },
        { from: '\\end{matrix}} \\right]', to: '\\end{bmatrix}' }
      ];
      
      patterns.forEach(pattern => {
        while (fixedText.includes(pattern.from)) {
          fixedText = fixedText.replace(pattern.from, pattern.to);
          console.log(`Replaced: ${pattern.from} -> ${pattern.to}`);
        }
      });
      
      cleanText = fixedText;
    }
    
    // Step 2.6: Force math treatment for any matrix content
    if ((cleanText.includes('\\begin{matrix}') || cleanText.includes('\\begin{bmatrix}') || cleanText.includes('\\begin{pmatrix}')) && !cleanText.includes('$')) {
      console.log('Forcing matrix content to be treated as math');
      cleanText = `$${cleanText}$`;
    }

    // Step 3: Parse and render the content
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
            className="text-inherit"
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
          className="text-inherit"
        />
      );
    }
  }

  // If no math expressions found, render as HTML
  if (elements.length === 0) {
    return <span dangerouslySetInnerHTML={{ __html: content }} className="text-inherit" />;
  }

  return (
    <span style={{
      display: 'inline',
      lineHeight: 'inherit'
    }} className="text-inherit">
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
    // Enhanced matrix handling - keep proper matrix syntax
    .replace(/\\begin\{vmatrix\}/g, '\\begin{vmatrix}')
    .replace(/\\end\{vmatrix\}/g, '\\end{vmatrix}')
    .replace(/\\begin\{matrix\}/g, '\\begin{matrix}')
    .replace(/\\end\{matrix\}/g, '\\end{matrix}')
    .replace(/\\begin\{pmatrix\}/g, '\\begin{pmatrix}')
    .replace(/\\end\{pmatrix\}/g, '\\end{pmatrix}')
    .replace(/\\begin\{bmatrix\}/g, '\\begin{bmatrix}')
    .replace(/\\end\{bmatrix\}/g, '\\end{bmatrix}')
    // Fix matrix row separators
    .replace(/\\cr/g, '\\\\')
    .replace(/\\\\\s*\\\\/g, '\\\\')
    // Fix matrix delimiters that might be malformed
    .replace(/\\left\s*\\\{/g, '\\left\\{')
    .replace(/\\right\s*\\\}/g, '\\right\\}')
    // Fix overline notation in matrices
    .replace(/\\overline\s+/g, '\\overline ')
    .replace(/\{\\overline\s+([^}]+)\}/g, '{\\overline{$1}}')
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