'use client';

import * as React from 'react';
import {
  AmbientLight,
  CylinderGeometry,
  DirectionalLight,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type SpacerSceneProps = {
  studCount: number;
  thickness: number;
  boltPattern: number;
  centerBore: number;
};

export function SpacerScene({ studCount, thickness, boltPattern, centerBore }: SpacerSceneProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (studCount < 3 || thickness <= 0 || boltPattern <= 0) return;

    const container = containerRef.current;
    if (!container) return;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1200);
    camera.position.set(0, 80, Math.max(180, boltPattern * 1.65));
    scene.add(new AmbientLight(0x777777));
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(50, 70, 120);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const group = new Group();
    const outerRadius = (boltPattern + 50) / 2;
    const spacer = new Mesh(
      new CylinderGeometry(outerRadius, outerRadius, thickness, 96),
      new MeshPhongMaterial({ color: 0x151515, shininess: 35 })
    );
    group.add(spacer);

    const holeMaterial = new MeshBasicMaterial({ color: 0x9ca3af });
    const centerHole = new Mesh(new CylinderGeometry(centerBore / 2, centerBore / 2, thickness + 1, 64), holeMaterial);
    group.add(centerHole);

    const boltRadius = 7;
    const boltCircleRadius = boltPattern / 2;
    for (let i = 0; i < studCount * 2; i++) {
      const angle = (i / (studCount * 2)) * Math.PI * 2;
      const x = boltCircleRadius * Math.cos(angle);
      const z = boltCircleRadius * Math.sin(angle);
      const bolt = new Mesh(
        new CylinderGeometry(i % 2 === 0 ? boltRadius : 15, i % 2 === 0 ? boltRadius : 8, thickness + 18, 32),
        i % 2 === 0 ? new MeshPhongMaterial({ color: 0x9ca3af, shininess: 30 }) : holeMaterial
      );
      bolt.position.set(x, thickness / 2, z);
      group.add(bolt);
    }

    scene.add(group);

    let frame = 0;
    const loop = () => {
      group.rotation.y += 0.003;
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    };
    loop();

    const resizeObserver = new ResizeObserver(() => {
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [boltPattern, centerBore, studCount, thickness]);

  return <div ref={containerRef} className="h-full min-h-[22rem] w-full" />;
}
