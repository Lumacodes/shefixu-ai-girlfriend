import { Canvas } from '@react-three/fiber';
import { Experience } from './components/Experience';
import { ChatUI } from './components/ChatUI';
import { useState } from 'react';

function App() {
  // audioLevel is passed up from ChatUI so the 3D model can do lip sync
  const [audioLevel, setAudioLevel] = useState(0);

  return (
    <main className="main-container">
      <div className="canvas-container">
        <Canvas shadows gl={{ antialias: true }} style={{ background: '#000000' }}>
          <Experience audioLevel={audioLevel} />
        </Canvas>
      </div>
      <ChatUI onAudioLevel={setAudioLevel} />
    </main>
  );
}

export default App;
