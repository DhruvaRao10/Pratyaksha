import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Glowing Orb Top Right */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-gradient-to-b from-primary/20 to-transparent blur-3xl opacity-30" />
      
      {/* Glowing Orb Bottom Left */}
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-to-t from-blue-500/10 to-transparent blur-3xl opacity-20" />
      
      {/* Floating Elements */}
      <motion.div 
        className="absolute top-[15%] right-[20%] w-16 h-16 rounded-blob bg-primary/20 backdrop-blur-md border border-white/10"
        animate={{
          y: [0, 30, 0],
          rotate: [0, 10, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute top-[60%] left-[15%] w-20 h-20 rounded-blob bg-blue-600/10 backdrop-blur-md border border-white/10"
        animate={{
          y: [0, -40, 0],
          rotate: [0, -15, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute top-[30%] left-[25%] w-24 h-24 rounded-blob bg-white/5 backdrop-blur-md border border-white/10"
        animate={{
          y: [0, 50, 0],
          x: [0, 30, 0],
          rotate: [0, 20, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div 
        className="absolute bottom-[20%] right-[30%] w-32 h-32 rounded-full bg-primary/10 backdrop-blur-md border border-white/10"
        animate={{
          y: [0, -30, 0],
          x: [0, -20, 0],
          rotate: [0, -10, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Particles/Small dots */}
      <div className="absolute top-[25%] right-[40%] w-2 h-2 rounded-full bg-white/50" />
      <div className="absolute top-[55%] right-[30%] w-1 h-1 rounded-full bg-white/50" />
      <div className="absolute top-[75%] right-[60%] w-2 h-2 rounded-full bg-white/50" />
      <div className="absolute top-[35%] right-[70%] w-1 h-1 rounded-full bg-white/50" />
      <div className="absolute top-[85%] right-[20%] w-2 h-2 rounded-full bg-white/50" />
      <div className="absolute top-[15%] right-[50%] w-1 h-1 rounded-full bg-white/50" />
    </div>
  );
} 