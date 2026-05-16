/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, Eraser, Percent, Divide, X, Minus, Plus, Equal } from 'lucide-react';

type Operator = '+' | '-' | '*' | '/' | null;

export default function App() {
  const [display, setDisplay] = useState('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [shouldResetScreen, setShouldResetScreen] = useState(false);

  const calculate = (first: number, second: number, op: Operator): number => {
    switch (op) {
      case '+': return first + second;
      case '-': return first - second;
      case '*': return first * second;
      case '/': return second !== 0 ? first / second : 0;
      default: return second;
    }
  };

  const handleNumber = useCallback((num: string) => {
    if (display === '0' || shouldResetScreen) {
      setDisplay(num);
      setShouldResetScreen(false);
    } else {
      setDisplay(display + num);
    }
  }, [display, shouldResetScreen]);

  const handleOperator = useCallback((op: Operator) => {
    const currentValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(currentValue);
    } else if (operator) {
      const result = calculate(prevValue, currentValue, operator);
      setPrevValue(result);
      setDisplay(String(result));
    }

    setOperator(op);
    setShouldResetScreen(true);
  }, [display, prevValue, operator]);

  const handleEqual = useCallback(() => {
    if (operator === null || prevValue === null) return;

    const currentValue = parseFloat(display);
    const result = calculate(prevValue, currentValue, operator);

    setDisplay(String(result));
    setPrevValue(null);
    setOperator(null);
    setShouldResetScreen(true);
  }, [display, prevValue, operator]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperator(null);
    setShouldResetScreen(false);
  }, []);

  const handleDelete = useCallback(() => {
    if (shouldResetScreen) return;
    if (display.length === 1) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, shouldResetScreen]);

  const handleDecimal = useCallback(() => {
    if (shouldResetScreen) {
      setDisplay('0.');
      setShouldResetScreen(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, shouldResetScreen]);

  const handlePercent = useCallback(() => {
    const currentValue = parseFloat(display);
    setDisplay(String(currentValue / 100));
  }, [display]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
      if (e.key === '.') handleDecimal();
      if (e.key === '+') handleOperator('+');
      if (e.key === '-') handleOperator('-');
      if (e.key === '*') handleOperator('*');
      if (e.key === '/') handleOperator('/');
      if (e.key === 'Enter' || e.key === '=') handleEqual();
      if (e.key === 'Escape') handleClear();
      if (e.key === 'Backspace') handleDelete();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, handleEqual, handleClear, handleDelete, handleDecimal]);

  const Button = ({ 
    children, 
    onClick, 
    className = "", 
    variant = "default" 
  }: { 
    children: ReactNode; 
    onClick: () => void; 
    className?: string;
    variant?: "default" | "operator" | "action" | "accent"
  }) => {
    const baseStyles = "flex items-center justify-center text-2xl font-medium rounded-2xl h-16 w-full transition-all active:scale-95";
    const variants = {
      default: "bg-white/10 hover:bg-white/20 text-white",
      operator: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20",
      action: "bg-white/5 hover:bg-white/10 text-indigo-300",
      accent: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
    };

    return (
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        className={`${baseStyles} ${variants[variant]} ${className}`}
      >
        {children}
      </motion.button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[360px] bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-6 shadow-2xl shadow-black/50 overflow-hidden"
      >
        {/* Display Area */}
        <div className="flex flex-col items-end justify-end h-40 mb-6 px-2 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={prevValue + (operator || '')}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-indigo-300/60 text-lg font-mono mb-1 h-6"
            >
              {prevValue !== null && `${prevValue} ${operator}`}
            </motion.div>
          </AnimatePresence>
          
          <motion.div 
            layout
            className="text-white text-6xl font-light tracking-tight truncate w-full text-right"
          >
            {display}
          </motion.div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-3">
          <Button variant="action" onClick={handleClear}><Eraser size={24} /></Button>
          <Button variant="action" onClick={handleDelete}><Delete size={24} /></Button>
          <Button variant="action" onClick={handlePercent}><Percent size={24} /></Button>
          <Button variant="operator" onClick={() => handleOperator('/')}><Divide size={24} /></Button>

          <Button onClick={() => handleNumber('7')}>7</Button>
          <Button onClick={() => handleNumber('8')}>8</Button>
          <Button onClick={() => handleNumber('9')}>9</Button>
          <Button variant="operator" onClick={() => handleOperator('*')}><X size={24} /></Button>

          <Button onClick={() => handleNumber('4')}>4</Button>
          <Button onClick={() => handleNumber('5')}>5</Button>
          <Button onClick={() => handleNumber('6')}>6</Button>
          <Button variant="operator" onClick={() => handleOperator('-')}><Minus size={24} /></Button>

          <Button onClick={() => handleNumber('1')}>1</Button>
          <Button onClick={() => handleNumber('2')}>2</Button>
          <Button onClick={() => handleNumber('3')}>3</Button>
          <Button variant="operator" onClick={() => handleOperator('+')}><Plus size={24} /></Button>

          <Button onClick={() => handleNumber('0')} className="col-span-1">0</Button>
          <Button onClick={handleDecimal}>.</Button>
          <Button variant="accent" onClick={handleEqual} className="col-span-2"><Equal size={24} /></Button>
        </div>
      </motion.div>
    </div>
  );
}

