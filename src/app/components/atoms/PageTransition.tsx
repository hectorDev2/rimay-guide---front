import { motion, type HTMLMotionProps } from 'motion/react';

interface PageTransitionProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export function PageTransition({ children, className = '', ...props }: PageTransitionProps) {
  // h-full es imprescindible: sin altura definida, los h-full de las pantallas
  // hijas colapsan a "auto" y el overflow-hidden del frame de la app corta el
  // contenido sin permitir scroll.
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`h-full ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function SlideUp({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
