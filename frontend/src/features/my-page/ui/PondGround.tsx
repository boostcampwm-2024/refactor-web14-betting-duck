import { usePlane } from "@react-three/cannon";
import { Mesh } from "three";

export function PondGround() {
  const [ref] = usePlane<Mesh>(() => ({
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, -6.5, 0],
    type: "Static",
    material: {
      friction: 0.5,
      restitution: 0.7,
    },
  }));

  return (
    <mesh ref={ref} receiveShadow>
      <circleGeometry args={[16, 16]} />
      <meshStandardMaterial
        color={"#80aae9"}
        roughness={0.2}
        metalness={0.05}
      />
    </mesh>
  );
}
