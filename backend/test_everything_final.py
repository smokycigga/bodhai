#!/usr/bin/env python3
"""
FINAL COMPREHENSIVE TEST - ALL mathematical expressions
"""

from server import format_latex_content

test_cases = [
    # 1. FRACTIONS
    "\\frac{1}{2}",
    "{9 \\over {16}}",
    "\\frac{a+b}{c-d}",
    
    # 2. SQUARE ROOTS
    "\\sqrt{x}",
    "\\sqrt{x^2 + y^2}",
    "\\sqrt{\\frac{a}{b}}",
    
    # 3. GREEK LETTERS
    "\\alpha + \\beta = \\pi",
    "\\Delta G = -nFE^0",
    "\\theta, \\phi, \\psi, \\omega",
    
    # 4. SUPERSCRIPTS/SUBSCRIPTS
    "x^2 + y_1 = z",
    "E = mc^2",
    "a^{n+1} + b_{i,j}",
    
    # 5. VECTORS
    "\\overrightarrow{a} \\times \\overrightarrow{b}",
    "|\\vec{v}| = \\sqrt{v_x^2 + v_y^2}",
    
    # 6. MATRICES
    "\\begin{pmatrix} 1 & 2 \\\\ 3 & 4 \\end{pmatrix}",
    "\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}",
    "\\begin{vmatrix} x & y \\\\ z & w \\end{vmatrix}",
    
    # 7. OPERATORS
    "a \\times b \\rightarrow c",
    "x \\leq y \\geq z",
    "p \\approx q \\equiv r",
    
    # 8. FUNCTIONS
    "\\sin x + \\cos y = \\log z",
    "\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1",
    "\\max(a,b) \\neq \\min(c,d)",
    
    # 9. INTEGRALS/SUMS
    "\\int_0^{\\infty} e^{-x^2} dx",
    "\\sum_{n=1}^{\\infty} \\frac{1}{n^2}",
    "\\prod_{i=1}^n a_i",
    
    # 10. CHEMICAL FORMULAS
    "H2SO4 + NaOH",
    "CaCO3 → CaO + CO2",
    "C6H12O6",
    
    # 11. COMPLEX IONS
    "[Cr(NH3)6]Cl3",
    "[Fe(CN)6]3-",
    "K4[Fe(CN)6]",
    
    # 12. CHEMICAL IONS
    "Mn2+, Fe2+, Ti2+, Cr2+",
    "Al3+ + 3OH- → Al(OH)3",
    
    # 13. DIMENSIONAL ANALYSIS
    "[MLT^{-2}]",
    "[ML^2T^{-3}]",
    "[M^0L^3T^{-1}]",
    
    # 14. SPECIAL SYMBOLS
    "\\infty, \\partial, \\nabla",
    "\\exists x \\forall y",
    "\\angle ABC \\perp XYZ",
    
    # 15. COMPLEX EXPRESSIONS
    "\\int_0^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}",
    "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
    
    # 16. PHYSICS FORMULAS
    "F = ma",
    "E = \\frac{1}{2}mv^2",
    "\\nabla \\times \\vec{E} = -\\frac{\\partial \\vec{B}}{\\partial t}",
    
    # 17. ORIGINAL PROBLEM CASES
    "{r_4} = {9 \\over {16}}{r_3}",
    "Which ion has maximum magnetic moment: Mn2+, Fe2+?",
    "[Cr(NH3)6]Cl3 complex"
]

print("🧪 FINAL COMPREHENSIVE TEST - ALL Mathematical Expressions")
print("=" * 80)

for i, test in enumerate(test_cases, 1):
    print(f"\n📝 Test {i:2d}:")
    print(f"Input:  {test}")
    result = format_latex_content(test)
    print(f"Output: {result}")
    print("-" * 60)

print("\n✅ ALL COMPREHENSIVE TESTS COMPLETED!")