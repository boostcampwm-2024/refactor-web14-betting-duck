import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/cannon";
import { Suspense, useState } from "react";
import {
  OrbitControls,
  Environment,
  OrthographicCamera,
} from "@react-three/drei";
import { PondGround } from "./PondGround";
import { useLoadEnv } from "../hooks/useLoadEnv";
import { useSlowlyIncreaseCount } from "../hooks/useSlowlyIncreaseCount";
import { FallingDuckInstances } from "./FallingDuckInstances";

function Pond({ realDuck }: { realDuck: number }) {
  const [envMap, setEnvMap] = useState<string | null>(null);
  const [duckCount, setDuckCount] = useState(1);

  useLoadEnv(setEnvMap);
  useSlowlyIncreaseCount(realDuck, duckCount, setDuckCount);

  return (
    <Canvas shadows gl={{ antialias: false }} dpr={[1, 1.5]}>
      <OrthographicCamera
        makeDefault
        zoom={32}
        position={[5.2, 1.0, 7.0]}
        near={-1000}
        far={1000}
      />
      <color attach="background" args={["#f0f4fa"]} />
      <fog attach="fog" args={["#f0f4fa", 80, 100]} />
      <ambientLight intensity={0.6} />
      <directionalLight
        castShadow
        intensity={1.5}
        position={[10, 8, 6]}
        shadow-mapSize={[1024, 1024]}
        color={"#ffffff"}
      >
        <orthographicCamera
          attach="shadow-camera"
          left={-20}
          right={20}
          top={20}
          bottom={-20}
        />
      </directionalLight>
      <Suspense fallback={null}>
        <Physics
          iterations={15}
          gravity={[0, -9.81, 0]}
          defaultContactMaterial={{
            friction: 0.5,
            restitution: 0.3,
          }}
        >
          <FallingDuckInstances duckCount={duckCount} />
          <PondGround />
        </Physics>
      </Suspense>
      {envMap && <Environment files={envMap} />}
      <OrbitControls
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 1.9}
        makeDefault
        enableRotate={false}
        enableZoom={false}
        enablePan={false}
      />
    </Canvas>
  );
}

export default Pond;
