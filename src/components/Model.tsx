import { useEffect, useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRMLoaderPlugin, VRM, VRMUtils } from '@pixiv/three-vrm';
import * as THREE from 'three';

let expressionNamesLogged = false;

// Global mouse target for head tracking (normalized -1 to 1)
const mouse = { x: 0, y: 0 };
if (typeof window !== 'undefined') {
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth)  * 2 - 1;   // -1 left, +1 right
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;  // -1 bottom, +1 top
  });
}

export const Model = ({ audioLevel }: { audioLevel: number }) => {
  const [vrm, setVrm] = useState<VRM | null>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Smoothed values to prevent jitter
  const smoothMouth  = useRef(0);
  const smoothHeadX  = useRef(0);
  const smoothHeadY  = useRef(0);
  const blinkTimer   = useRef(0);
  const isBlinking   = useRef(false);
  const blinkValue   = useRef(0);
  const nextBlinkAt  = useRef(3.0 + Math.random() * 3.0); // fixed next blink time

  useEffect(() => {
    expressionNamesLogged = false;
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      '/model.glb',
      (gltf) => {
        const vrmData = gltf.userData.vrm as VRM;
        if (!vrmData) { console.error('No VRM in model.glb'); return; }

        VRMUtils.rotateVRM0(vrmData);

        // Ground the model: shift so feet sit at y=0
        const box = new THREE.Box3().setFromObject(vrmData.scene);
        vrmData.scene.position.y = -box.min.y;
        console.log(`VRM loaded, height=${(box.max.y - box.min.y).toFixed(2)}`);

        setVrm(vrmData);
      },
      undefined,
      (err) => console.error('VRM load error:', err)
    );
  }, []);

  useFrame((state, delta) => {
    if (!vrm) return;
    const t = state.clock.elapsedTime;
    const h = vrm.humanoid;
    const talking = audioLevel > 0.03;

    // Log expression names once for debugging
    if (!expressionNamesLogged && vrm.expressionManager) {
      const names = vrm.expressionManager.expressions.map(
        (e: any) => e.expressionName ?? e._expressionName ?? '?'
      );
      console.log('[VRM] expressions:', names);
      vrm.scene.traverse((c: any) => {
        if (c.isMesh && c.morphTargetDictionary)
          console.log('[VRM] morph targets on', c.name, ':', Object.keys(c.morphTargetDictionary));
      });
      expressionNamesLogged = true;
    }

    // ── MOUTH — subtle, pulsing like real speech ─────────────
    // Cap at 0.4 max and add natural phoneme oscillation so it
    // doesn't gape open — closes fast (0.35), opens slower (0.18)
    const rawTarget = talking ? Math.min(audioLevel * 1.6, 0.4) : 0;
    // Add a gentle sine oscillation when talking so mouth naturally pulses
    const phonemeOsc = talking ? Math.abs(Math.sin(t * 8.0)) * rawTarget * 0.5 : 0;
    const targetMouth = rawTarget + phonemeOsc;
    const lerpSpeed = smoothMouth.current > targetMouth ? 0.35 : 0.18;
    smoothMouth.current = THREE.MathUtils.lerp(smoothMouth.current, targetMouth, lerpSpeed);
    const mouth = smoothMouth.current;

    // ── BLINK — fixed next-blink time, only randomised after each blink ──
    blinkTimer.current += delta;
    if (!isBlinking.current && blinkTimer.current >= nextBlinkAt.current) {
      isBlinking.current = true;
      blinkTimer.current = 0;
      blinkValue.current = 0;
    }
    let blinkFinal = 0;
    if (isBlinking.current) {
      blinkValue.current += delta * 14; // ~0.14s full cycle
      if (blinkValue.current < 1) {
        blinkFinal = blinkValue.current;       // closing
      } else if (blinkValue.current < 2) {
        blinkFinal = 2 - blinkValue.current;  // opening
      } else {
        blinkFinal = 0;
        isBlinking.current = false;
        blinkValue.current = 0;
        nextBlinkAt.current = 2.8 + Math.random() * 3.2; // schedule next
      }
    }

    // ── MOUSE HEAD TRACKING ───────────────────────────────────
    // Map mouse -1..1 to small head rotation angles
    const targetHeadX = mouse.x * 0.35;   // yaw: left/right
    const targetHeadY = mouse.y * 0.2;    // pitch: up/down
    smoothHeadX.current = THREE.MathUtils.lerp(smoothHeadX.current, targetHeadX, 0.05);
    smoothHeadY.current = THREE.MathUtils.lerp(smoothHeadY.current, targetHeadY, 0.05);

    // ── ARMS — A-pose, natural idle sway ─────────────────────
    const lUA = h.getNormalizedBoneNode('leftUpperArm');
    const rUA = h.getNormalizedBoneNode('rightUpperArm');
    if (lUA) {
      lUA.rotation.z =  1.1 + Math.sin(t * 0.5) * 0.025;
      lUA.rotation.x =  0.1 + Math.sin(t * 0.35) * 0.015;
      lUA.rotation.y = -0.05;
    }
    if (rUA) {
      rUA.rotation.z = -1.1 + Math.sin(t * 0.5 + 1.0) * 0.025;
      rUA.rotation.x =  0.1 + Math.sin(t * 0.35 + 1.0) * 0.015;
      rUA.rotation.y =  0.05;
    }

    // ── LOWER ARMS ────────────────────────────────────────────
    const lLA = h.getNormalizedBoneNode('leftLowerArm');
    const rLA = h.getNormalizedBoneNode('rightLowerArm');
    if (lLA) {
      lLA.rotation.y = -0.25 + Math.sin(t * 0.28) * 0.04;
      lLA.rotation.z =  0.04;
    }
    if (rLA) {
      rLA.rotation.y =  0.25 + Math.sin(t * 0.28 + 1.3) * 0.04;
      rLA.rotation.z = -0.04;
    }

    // ── HANDS ─────────────────────────────────────────────────
    const lHand = h.getNormalizedBoneNode('leftHand');
    const rHand = h.getNormalizedBoneNode('rightHand');
    if (lHand) {
      lHand.rotation.x = -0.06 + Math.sin(t * 0.6) * 0.03;
      lHand.rotation.z =  Math.sin(t * 0.45) * 0.05;
    }
    if (rHand) {
      rHand.rotation.x = -0.06 + Math.sin(t * 0.6 + 0.8) * 0.03;
      rHand.rotation.z =  Math.sin(t * 0.45 + 0.8) * 0.05;
    }

    // ── SPINE / CHEST — breathing ─────────────────────────────
    const spine = h.getNormalizedBoneNode('spine');
    if (spine) {
      spine.rotation.x = Math.sin(t * 1.5) * 0.015;
      spine.rotation.z = Math.sin(t * 0.35) * 0.003;
    }
    const chest = h.getNormalizedBoneNode('upperChest') ?? h.getNormalizedBoneNode('chest');
    if (chest) chest.rotation.x = Math.sin(t * 1.5 + 0.3) * 0.008;

    // ── NECK — subtle idle + mouse influence ──────────────────
    const neck = h.getNormalizedBoneNode('neck');
    if (neck) {
      neck.rotation.x = -0.03 + smoothHeadY.current * 0.3 + Math.sin(t * 0.7) * 0.01;
      neck.rotation.y =  smoothHeadX.current * 0.3 + Math.sin(t * 0.4) * 0.02;
    }

    // ── HEAD — follows mouse ──────────────────────────────────
    const head = h.getNormalizedBoneNode('head');
    if (head) {
      head.rotation.y = smoothHeadX.current + (talking ? Math.sin(t * 1.6) * 0.04 : Math.sin(t * 0.5) * 0.02);
      head.rotation.x = smoothHeadY.current + (talking ? Math.sin(t * 2.0) * 0.015 : 0);
      head.rotation.z = Math.sin(t * 0.28) * 0.012;
    }

    // ── HIPS ──────────────────────────────────────────────────
    const hips = h.getNormalizedBoneNode('hips');
    if (hips) {
      hips.rotation.y = Math.sin(t * 0.2) * 0.01;
      hips.rotation.z = Math.sin(t * 0.3) * 0.004;
    }

    // ── EXPRESSIONS ───────────────────────────────────────────
    if (vrm.expressionManager) {
      const set = (name: string, val: number) => {
        try { vrm.expressionManager!.setValue(name, THREE.MathUtils.clamp(val, 0, 1)); } catch {}
      };

      // Mouth — only drive 'aa'/'a' (the primary open-mouth shape)
      // Mixing too many vowels at once causes weird expressions
      set('aa', mouth);
      set('a',  mouth);
      // 'oh'/'ou' only at very low levels to avoid wide-mouth look
      set('oh', mouth * 0.2);
      set('o',  mouth * 0.2);

      // Blink
      set('blink',      blinkFinal);
      set('blinkLeft',  blinkFinal);
      set('blinkRight', blinkFinal);

      // Gentle resting smile — same intensity whether talking or not
      // Do NOT change happy/joy while talking — they affect eye shape and cause twitching
      set('happy', 0.18);
      set('joy',   0.18);
    }

    // ── DIRECT MORPH FALLBACK for models with custom names ────
    vrm.scene.traverse((child: any) => {
      if (!child.isMesh || !child.morphTargetDictionary || !child.morphTargetInfluences) return;
      const dict = child.morphTargetDictionary;
      const inf  = child.morphTargetInfluences;
      for (const [key, idx] of Object.entries(dict) as [string, number][]) {
        const k = key.toLowerCase();
        if (k === 'a' || k === 'aa' || k === 'v_a' || k.startsWith('mth_a') ||
            k.includes('jawopen') || k === 'mouth_a' || k.includes('mouth open')) {
          inf[idx] = THREE.MathUtils.lerp(inf[idx], mouth, 0.3);
        }
      }
    });

    vrm.update(delta);
  });

  if (!vrm) return null;

  return (
    <group ref={groupRef}>
      <primitive object={vrm.scene} />
    </group>
  );
};
