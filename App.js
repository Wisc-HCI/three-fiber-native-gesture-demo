import React, { useRef, useState, useLayoutEffect } from "react";
import { StyleSheet, View } from "react-native";
import { Canvas, useFrame, useThree } from "@react-three/fiber/native";
import {
  GestureDetector,
  Gesture,
} from "react-native-gesture-handler";
import { animated, useSpring } from "@react-spring/three";

function Box(props) {
  const mesh = useRef(null);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  useFrame((state, delta) => (mesh.current.rotation.x += 0.01));
  return (
    <mesh
      {...props}
      ref={mesh}
      scale={active ? 1.5 : 1}
      onClick={(event) => setActive(!active)}
      onPointerOver={(event) => setHover(true)}
      onPointerOut={(event) => setHover(false)}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

const Camera = (props) => {
  const cameraRef = useRef();
  const set = useThree(({ set }) => set);
  const size = useThree(({ size }) => size);
  useLayoutEffect(() => {
    if (cameraRef.current) {
      cameraRef.current.aspect = size.width / size.height;
      cameraRef.current.updateProjectionMatrix();
    }
  }, [size, props]);

  useLayoutEffect(() => {
    set({ camera: cameraRef.current });
  }, []);

  return (
    <animated.perspectiveCamera
      ref={cameraRef}
      fov={75}
      // aspect={sizes.width / sizes.height}
      near={0.1}
      far={100}
      position={props.position}
    />
  );
};

export default function App() {
  const [{ position }, api] = useSpring(() => ({
    from: { position: [0, 0, 5] },
    to: { position: [0, 0, 10] },
  }));
  let savedPos = [0, 0, 10];
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      // console.log(e.translationX, e.translationY);
      api.start({
        from: { position: savedPos },
        to: {
          position: [
            savedPos[0] - e.translationX / 100,
            savedPos[1] + e.translationY / 100,
            savedPos[2],
          ],
        },
        immediate: true,
      });
    })
    .onEnd(() => {
      savedPos = position.goal;
    });

  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      console.log(e.scale);
      api.start({
        from: { position: savedPos },
        to: {
          position: [
            savedPos[0],
            savedPos[1],
            savedPos[2] - (e.scale - 1) * 5,
          ],
        },
        immediate: true,
      });
    })
    .onEnd(() => {
      savedPos = position.goal;
    });

  const composed = Gesture.Race(panGesture, pinchGesture);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={composed}>
        <View style={styles.canvasContainer}>
          <Canvas>
            <Camera position={position} />
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <Box position={[-1.2, 0, 0]} />
            <Box position={[1.2, 0, 0]} />
          </Canvas>
        </View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  canvasContainer: {
    width: "95%",
    height: "85%",
    backgroundColor: "#fff",
  },
});