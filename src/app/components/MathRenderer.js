"use client";
import React, { useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';

const MathRenderer = ({ text }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && text) {
      // Import renderMathInElement dynamically
      import('katex/dist/contrib/auto-render.min.js').then((renderMathInElement) => {
        const renderMath = renderMathInElement.default || renderMathInElement;
        
        // Comprehensive text processing for all LaTeX cases
        let cleanText = text
          .replace(/&nbsp;/g, ' ')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&amp;/g, '&')
          .replace(/<br\s*\/?>/gi, ' ')
          .replace(/<\/?[^>]+(>|$)/g, ' ')
          .trim();

        // Advanced LaTeX processing for all mathematical cases
        cleanText = processAdvancedLatex(cleanText);

        // Set the content
        containerRef.current.innerHTML = cleanText;

        // Render math using KaTeX auto-render with comprehensive settings
        renderMath(containerRef.current, {
          delimiters: [
            {left: "$$", right: "$$", display: true},
            {left: "$", right: "$", display: false},
            {left: "\\[", right: "\\]", display: true},
            {left: "\\(", right: "\\)", display: false}
          ],
          throwOnError: false,
          errorColor: '#ff6b6b',
          strict: false,
          trust: true,
          macros: {
            // Fractions and divisions
            "\\over": "\\frac{#1}{#2}",
            
            // Number sets
            "\\R": "\\mathbb{R}",
            "\\C": "\\mathbb{C}",
            "\\N": "\\mathbb{N}",
            "\\Z": "\\mathbb{Z}",
            "\\Q": "\\mathbb{Q}",
            
            // Physics constants
            "\\hbar": "\\hslash",
            
            // Custom macros for common expressions
            "\\degree": "^\\circ",
            "\\celsius": "^\\circ\\text{C}",
            "\\fahrenheit": "^\\circ\\text{F}",
            
            // Chemical arrows
            "\\yields": "\\rightarrow",
            "\\equilibrium": "\\rightleftharpoons"
          }
        });
      }).catch((error) => {
        console.error('Failed to load KaTeX auto-render:', error);
        // Fallback to plain text
        if (containerRef.current) {
          containerRef.current.innerHTML = text;
        }
      });
    }
  }, [text]);

  if (!text) return null;

  return (
    <span 
      ref={containerRef}
      style={{ 
        display: 'inline', 
        lineHeight: '1.8',
        verticalAlign: 'baseline'
      }}
    />
  );
};

// Comprehensive LaTeX processing function
function processAdvancedLatex(text) {
  // Don't process if already has proper $ delimiters
  if (text.includes('$') && text.match(/\$[^$]+\$/)) {
    return text;
  }

  // 1. MATRICES AND DETERMINANTS
  text = text.replace(/\\begin\{(matrix|pmatrix|bmatrix|vmatrix|Vmatrix|smallmatrix)\}([\s\S]*?)\\end\{\1\}/g, 
    '$\\begin{$1}$2\\end{$1}$');
  
  // 2. COMPLEX NUMBERS
  text = text.replace(/([+-]?\d*\.?\d*)\s*([+-])\s*([+-]?\d*\.?\d*)\s*i\b/g, '$1 $2 $3i$');
  text = text.replace(/\b(\d+)\s*\+\s*(\d+)i\b/g, '$1 + $2i$');
  text = text.replace(/\b(\d+)\s*-\s*(\d+)i\b/g, '$1 - $2i$');
  
  // 3. DIMENSIONAL ANALYSIS
  text = text.replace(/\[([MLT\^\{\}\-\d\s]+)\]/g, '$[$1]$');
  text = text.replace(/\[([A-Z]+)(\^?\{?[\-\d]+\}?)*\]/g, '$[$1$2]$');
  
  // 4. PHYSICS FORMULAS
  text = text.replace(/\\vec\{([^}]+)\}/g, '$\\vec{$1}$');
  text = text.replace(/\\hat\{([^}]+)\}/g, '$\\hat{$1}$');
  text = text.replace(/\\overrightarrow\{([^}]+)\}/g, '$\\overrightarrow{$1}$');
  text = text.replace(/\\dot\{([^}]+)\}/g, '$\\dot{$1}$');
  text = text.replace(/\\ddot\{([^}]+)\}/g, '$\\ddot{$1}$');
  
  // 5. CHEMICAL EQUATIONS AND FORMULAS
  // Handle chemical formulas with subscripts
  text = text.replace(/([A-Z][a-z]?)(\d+)/g, '$1_{$2}$');
  text = text.replace(/([A-Z][a-z]?)\{(\d+)\}/g, '$1_{$2}$');
  
  // Handle chemical charges
  text = text.replace(/([A-Z][a-z]?)(\d*)([+-]+)/g, '$1$2^{$3}$');
  text = text.replace(/(\d+)([+-])/g, '^{$1$2}$');
  
  // Chemical arrows
  text = text.replace(/\\rightarrow/g, '$\\rightarrow$');
  text = text.replace(/\\leftarrow/g, '$\\leftarrow$');
  text = text.replace(/\\rightleftharpoons/g, '$\\rightleftharpoons$');
  text = text.replace(/\\to/g, '$\\to$');
  
  // 6. INTEGRALS AND LIMITS
  text = text.replace(/\\int/g, '$\\int$');
  text = text.replace(/\\iint/g, '$\\iint$');
  text = text.replace(/\\iiint/g, '$\\iiint$');
  text = text.replace(/\\oint/g, '$\\oint$');
  text = text.replace(/\\lim/g, '$\\lim$');
  text = text.replace(/\\sum/g, '$\\sum$');
  text = text.replace(/\\prod/g, '$\\prod$');
  
  // 7. SYSTEM OF EQUATIONS
  text = text.replace(/\\begin\{(cases|align|aligned|equation|eqnarray)\}([\s\S]*?)\\end\{\1\}/g, 
    '$\\begin{$1}$2\\end{$1}$');
  
  // 8. FRACTIONS
  text = text.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '$\\frac{$1}{$2}$');
  text = text.replace(/\{([^{}]*?)\\over\s*([^{}]*?)\}/g, '$\\frac{$1}{$2}$');
  text = text.replace(/([^$])\\over([^$])/g, '$1$\\over$$2');
  
  // 9. GREEK LETTERS
  const greekLetters = [
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'varepsilon', 'zeta', 'eta', 'theta', 'vartheta',
    'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'varpi', 'rho', 'varrho',
    'sigma', 'varsigma', 'tau', 'upsilon', 'phi', 'varphi', 'chi', 'psi', 'omega',
    'Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa',
    'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon',
    'Phi', 'Chi', 'Psi', 'Omega'
  ];
  
  greekLetters.forEach(letter => {
    const regex = new RegExp(`\\\\${letter}(?![a-zA-Z])`, 'g');
    text = text.replace(regex, `$\\${letter}$`);
  });
  
  // 10. SUPERSCRIPTS AND SUBSCRIPTS
  text = text.replace(/([A-Za-z0-9])\^(\{[^}]+\}|\w)/g, '$1^{$2}$');
  text = text.replace(/([A-Za-z0-9])_(\{[^}]+\}|\w)/g, '$1_{$2}$');
  
  // 11. MATHEMATICAL OPERATORS
  const operators = [
    'times', 'cdot', 'div', 'pm', 'mp', 'ast', 'star', 'circ', 'bullet',
    'leq', 'geq', 'neq', 'approx', 'equiv', 'sim', 'simeq', 'cong', 'propto',
    'subset', 'supset', 'subseteq', 'supseteq', 'in', 'notin', 'ni', 'owns',
    'cup', 'cap', 'setminus', 'emptyset', 'varnothing', 'infty', 'partial',
    'nabla', 'exists', 'forall', 'neg', 'land', 'lor', 'angle', 'perp', 'parallel'
  ];
  
  operators.forEach(op => {
    const regex = new RegExp(`\\\\${op}(?![a-zA-Z])`, 'g');
    text = text.replace(regex, `$\\${op}$`);
  });
  
  // 12. TRIGONOMETRIC AND MATHEMATICAL FUNCTIONS
  const functions = [
    'sin', 'cos', 'tan', 'sec', 'csc', 'cot', 'sinh', 'cosh', 'tanh', 'sech', 'csch', 'coth',
    'arcsin', 'arccos', 'arctan', 'arcsec', 'arccsc', 'arccot',
    'log', 'ln', 'lg', 'exp', 'max', 'min', 'sup', 'inf', 'det', 'dim', 'ker', 'deg', 'gcd', 'lcm'
  ];
  
  functions.forEach(func => {
    const regex = new RegExp(`\\\\${func}(?![a-zA-Z])`, 'g');
    text = text.replace(regex, `$\\${func}$`);
  });
  
  // 13. SPECIAL SYMBOLS AND ARROWS
  const arrows = [
    'rightarrow', 'leftarrow', 'leftrightarrow', 'Rightarrow', 'Leftarrow', 'Leftrightarrow',
    'uparrow', 'downarrow', 'updownarrow', 'Uparrow', 'Downarrow', 'Updownarrow',
    'nearrow', 'searrow', 'swarrow', 'nwarrow'
  ];
  
  arrows.forEach(arrow => {
    const regex = new RegExp(`\\\\${arrow}(?![a-zA-Z])`, 'g');
    text = text.replace(regex, `$\\${arrow}$`);
  });
  
  // 14. TEXT FORMATTING IN MATH
  text = text.replace(/\\text\{([^{}]+)\}/g, '$\\text{$1}$');
  text = text.replace(/\\mathrm\{([^{}]+)\}/g, '$\\mathrm{$1}$');
  text = text.replace(/\\mathbf\{([^{}]+)\}/g, '$\\mathbf{$1}$');
  text = text.replace(/\\mathit\{([^{}]+)\}/g, '$\\mathit{$1}$');
  text = text.replace(/\\mathcal\{([^{}]+)\}/g, '$\\mathcal{$1}$');
  text = text.replace(/\\mathbb\{([^{}]+)\}/g, '$\\mathbb{$1}$');
  text = text.replace(/\\mathfrak\{([^{}]+)\}/g, '$\\mathfrak{$1}$');
  
  // 15. SQUARE ROOTS AND RADICALS
  text = text.replace(/\\sqrt\{([^{}]+)\}/g, '$\\sqrt{$1}$');
  text = text.replace(/\\sqrt\[([^\]]+)\]\{([^{}]+)\}/g, '$\\sqrt[$1]{$2}$');
  
  // 16. BRACKETS AND DELIMITERS
  text = text.replace(/\\left\(/g, '$\\left($');
  text = text.replace(/\\right\)/g, '$\\right)$');
  text = text.replace(/\\left\[/g, '$\\left[$');
  text = text.replace(/\\right\]/g, '$\\right]$');
  text = text.replace(/\\left\{/g, '$\\left\\{$');
  text = text.replace(/\\right\}/g, '$\\right\\}$');
  text = text.replace(/\\left\|/g, '$\\left|$');
  text = text.replace(/\\right\|/g, '$\\right|$');
  
  // 17. COMPLEX EXPRESSIONS (handle variables in braces)
  text = text.replace(/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/g, '${$1}$');
  
  // 18. UNITS AND MEASUREMENTS
  text = text.replace(/(\d+)\s*(kg|g|mg|m|cm|mm|km|s|ms|A|V|W|J|N|Pa|bar|mol|K|°C|°F)\b/g, '$1$ $2');
  
  // Clean up multiple consecutive $ signs and empty math blocks
  text = text.replace(/\$+/g, '$');
  text = text.replace(/\$\s*\$/g, '');
  text = text.replace(/\$([^$]*)\$/g, (match, content) => {
    if (!content.trim()) return '';
    return match;
  });
  
  return text;
}

export default MathRenderer;