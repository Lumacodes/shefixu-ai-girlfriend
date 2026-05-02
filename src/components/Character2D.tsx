import { motion } from 'framer-motion';

interface Character2DProps {
  audioLevel: number;
}

export const Character2D = ({ audioLevel }: Character2DProps) => {
  // Normalize audio level to drive animations
  const isSpeaking = audioLevel > 0.05;
  const bounceIntensity = isSpeaking ? audioLevel * 10 : 0;
  
  return (
    <div className="character-2d-container">
      <motion.img 
        src="/waifu.png" 
        alt="Anime Companion"
        className="waifu-image"
        animate={{ 
          y: isSpeaking ? [0, -10 - bounceIntensity, 0] : [0, -3, 0], // Breathe when idle, bounce when speaking
          scale: isSpeaking ? [1, 1.02, 1] : 1,
        }}
        transition={{ 
          repeat: Infinity, 
          duration: isSpeaking ? 0.15 : 4, // Fast bounce vs slow breathing
          ease: "easeInOut" 
        }}
      />
      
      {/* Dynamic Glow behind the character based on speech */}
      <motion.div 
        className="waifu-glow"
        animate={{
          opacity: isSpeaking ? 0.6 + audioLevel : 0.2,
          scale: isSpeaking ? 1.1 + (audioLevel * 0.5) : 1
        }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};
