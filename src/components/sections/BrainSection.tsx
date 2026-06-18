import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Float, Center } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';
import { BRAIN_REGIONS } from '../../constants/app';
import { useTheme } from '../../contexts/ThemeContext';

/* ============================================
   BRAIN MODEL COMPONENT
   ============================================ */

interface BrainModelProps {
  targetRotation: number[];
  isAutoRotating: boolean;
}

const BrainModel: React.FC<BrainModelProps> = ({ targetRotation, isAutoRotating }) => {
  const { scene } = useGLTF('/assets/models/brain_point_cloud.glb');
  const groupRef = useRef<THREE.Group>(null);

  const clonedScene = useMemo(() => {
    const cloned = scene.clone();

    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;
        child.frustumCulled = true;

        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => {
              mat.side = THREE.DoubleSide;
              mat.visible = true;
            });
          } else {
            child.material.side = THREE.DoubleSide;
            child.material.visible = true;
          }
        }
      }
    });

    return cloned;
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isAutoRotating) {
      easing.damp(groupRef.current.rotation, 'x', 0, 0.3, delta);
      easing.damp(groupRef.current.rotation, 'z', 0, 0.3, delta);
      groupRef.current.rotation.y += delta * 0.15;

      if (groupRef.current.rotation.y > Math.PI * 2) {
        groupRef.current.rotation.y %= (Math.PI * 2);
      }
    } else {
      easing.dampE(groupRef.current.rotation, targetRotation as [number, number, number], 0.3, delta);
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.2}>
        <Center>
          <primitive object={clonedScene} scale={2.8} />
        </Center>
      </Float>
    </group>
  );
};

/* ============================================
   BRAIN SECTION COMPONENT
   ============================================ */

const BrainSection: React.FC = () => {
  const { isDark } = useTheme();
  const [activeRegionId, setActiveRegionId] = useState<string | null>(null);
  const [targetRotation, setTargetRotation] = useState([0, 0, 0]);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para ativar o Canvas apenas quando visível
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  const handleCardClick = (region: typeof BRAIN_REGIONS[0]) => {
    if (activeRegionId === region.id) {
      setActiveRegionId(null);
      setIsAutoRotating(true);
    } else {
      setActiveRegionId(region.id);
      setTargetRotation(region.rotation);
      setIsAutoRotating(false);
    }
  };

  return (
    <section
      ref={sectionRef}
      style={{
        paddingTop: '80px',
        paddingBottom: '80px',
        backgroundColor: isDark ? '#121212' : 'var(--light)',
        overflow: 'hidden'
      }}
      id="brain-section"
    >
      <div className="container">
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ color: 'var(--dark)' }}>Exploração Anatômica</h2>
          <p style={{
            color: 'var(--text-muted)',
            maxWidth: '600px',
            margin: '0 auto',
            fontSize: '1.125rem'
          }}>
            Clique em um card para focar na região correspondente. Clique novamente para voltar a girar.
          </p>
        </div>

        {/* 3D Canvas Container */}
        <div style={{
          width: '100%',
          height: '400px',
          position: 'relative',
          marginBottom: '4rem',
          backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          {!isVisible ? (
            // Placeholder enquanto o Canvas não está ativo
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
              color: isDark ? '#666' : '#999',
              fontFamily: 'Inter, sans-serif',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '1rem' }}>🧠</div>
              <p style={{ margin: 0, fontSize: '16px' }}>Carregando visualização 3D...</p>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#ccc' }}>Role para ver o cérebro interativo</p>
            </div>
          ) : (
            // Canvas renderizado apenas quando visível
            <Canvas
              dpr={[1, 1.5]}
              camera={{ position: [0, 0, 10], fov: 9 }}
              gl={{
                antialias: true,
                alpha: true,
                preserveDrawingBuffer: false,
                powerPreference: 'high-performance',
              }}
              performance={{ min: 0.5, max: 1 }}
            >
              <ambientLight intensity={0.7} />
              <pointLight position={[10, 10, 10]} intensity={1.3} />
              <pointLight position={[-10, -10, 10]} intensity={0.5} />

              <BrainModel targetRotation={targetRotation} isAutoRotating={isAutoRotating} />

              <OrbitControls
                enableZoom={false}
                enablePan={false}
                autoRotate={isAutoRotating}
                autoRotateSpeed={2}
              />
            </Canvas>
          )}
        </div>

        {/* Brain Regions Cards */}
        <div style={{ position: 'relative' }}>
          <div
            className="synapse-wire"
            style={{
              position: 'absolute',
              top: '24px',
              left: '0',
              right: '0',
              height: '2px',
              opacity: 0.4,
              zIndex: 0
            }}
          />

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(260px, 1fr))',
            gap: '2.5rem',
            position: 'relative',
            zIndex: 1,
            maxWidth: '1120px',
            margin: '0 auto',
            justifyContent: 'center'
          }}>
            {BRAIN_REGIONS.map((region) => (
              <div
                key={region.id}
                className={`brain-card ${activeRegionId === region.id ? 'active' : ''}`}
                onClick={() => handleCardClick(region)}
                style={{
                  backgroundColor: isDark ? '#1e1e30' : 'white',
                  borderRadius: '20px',
                  padding: '2.5rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Region Indicator */}
                <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                  <div style={{
                    position: 'absolute',
                    width: '40px',
                    height: '40px',
                    backgroundColor: region.color,
                    borderRadius: '50%',
                    opacity: 0.3,
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }} />
                  <div style={{
                    position: 'relative',
                    width: '14px',
                    height: '14px',
                    backgroundColor: region.color,
                    borderRadius: '50%',
                    border: `3px solid ${isDark ? '#1e1e30' : 'white'}`
                  }} />
                </div>

                {/* Region Content */}
                <h3 style={{ color: 'var(--dark)', marginBottom: '1rem' }}>{region.name}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
                  {region.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrainSection;

// Precarregar o modelo para quando o usuário chegar na seção
useGLTF.preload('/assets/models/brain_point_cloud.glb');
