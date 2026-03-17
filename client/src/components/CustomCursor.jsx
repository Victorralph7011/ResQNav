import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState('default');
  const [textHeight, setTextHeight] = useState(16);
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseMove = useCallback((e) => {
    setPosition({ x: e.clientX, y: e.clientY });
    if (!isVisible) setIsVisible(true);
  }, [isVisible]);

  const handleMouseOver = useCallback((e) => {
    const target = e.target;

    // Priority 1: button or link (check ancestors too)
    if (target.closest('button, a')) {
      setCursorVariant('button');
      return;
    }

    // Priority 2: text elements AND input fields
    const isTextTag = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'SPAN', 'LI', 'LABEL'].includes(target.tagName);
    const isInputTag = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (isTextTag || isInputTag) {
      const fontSize = parseFloat(window.getComputedStyle(target).fontSize);
      setTextHeight(fontSize + 4);
      setCursorVariant('text');
      return;
    }

    // Default
    setCursorVariant('default');
  }, []);

  useEffect(() => {
    const handleLeave = () => setIsVisible(false);
    const handleEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseleave', handleLeave);
    document.addEventListener('mouseenter', handleEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleLeave);
      document.removeEventListener('mouseenter', handleEnter);
    };
  }, [handleMouseMove, handleMouseOver]);

  // Cursor shape variants
  const variants = {
    default: {
      width: 16,
      height: 16,
      borderRadius: '50%',
      backgroundColor: '#ffffff',
      border: '0px solid transparent',
    },
    button: {
      width: 40,
      height: 40,
      borderRadius: '50%',
      backgroundColor: 'transparent',
      border: '1.5px solid #ffffff',
    },
    text: {
      width: 2,
      height: textHeight,
      borderRadius: '0%',
      backgroundColor: '#ffffff',
      border: '0px solid transparent',
    },
  };

  // Offset so the cursor shape stays centered on the pointer
  const currentVariant = variants[cursorVariant];
  const offsetX = position.x - currentVariant.width / 2;
  const offsetY = position.y - currentVariant.height / 2;

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none mix-blend-difference"
      animate={{
        x: offsetX,
        y: offsetY,
        opacity: isVisible ? 1 : 0,
        ...currentVariant,
      }}
      transition={{
        x: { duration: 0.08, ease: 'easeOut' },
        y: { duration: 0.08, ease: 'easeOut' },
        width: { type: 'tween', ease: 'backOut', duration: 0.2 },
        height: { type: 'tween', ease: 'backOut', duration: 0.2 },
        borderRadius: { type: 'tween', ease: 'backOut', duration: 0.2 },
        backgroundColor: { duration: 0.15 },
        border: { duration: 0.15 },
        opacity: { duration: 0.15 },
      }}
    />
  );
}
