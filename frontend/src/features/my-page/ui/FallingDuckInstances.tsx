import FallingDuck from "./FallingDuck";
import { useGLTF, Instances } from "@react-three/drei";
import duckModel from "@/assets/models/betting-duck.glb";
import { BufferGeometry } from "three";

interface DuckGeometry {
  Mesh1: { geometry: BufferGeometry };
}

export function FallingDuckInstances({ duckCount }: { duckCount: number }) {
  const { nodes, materials } = useGLTF(duckModel);
  const duckGeometry = (nodes as unknown as DuckGeometry).Mesh1.geometry;
  const duckMaterial = materials["Material.001"];

  return (
    <Instances geometry={duckGeometry} material={duckMaterial}>
      {Array.from({ length: duckCount }).map((_, index) => (
        <FallingDuck key={index} />
      ))}
    </Instances>
  );
}
