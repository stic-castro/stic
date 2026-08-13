'use client';

import * as React from 'react';
import {
  AmbientLight,
  DirectionalLight,
  LatheGeometry,
  Mesh,
  MeshPhongMaterial,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const belt = {
  A: { w: 12, h: 7.9 },
  B: { w: 15.9, h: 10.3 },
  C: { w: 22, h: 14 },
} as const;

type PulleySceneProps = {
  outerDiameter: number;
  holeDiameter: number;
  numGrooves: number;
  beltType: keyof typeof belt;
};

export function PulleyScene({ outerDiameter, holeDiameter, numGrooves, beltType }: PulleySceneProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const spec = belt[beltType];
    if (!spec || numGrooves < 1 || outerDiameter <= holeDiameter) return;

    const container = containerRef.current;
    if (!container) return;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
    camera.position.set(0, 0, outerDiameter * 2);
    scene.add(new AmbientLight(0x777777));
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(-1, 1.2, 2);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const landWidth = spec.w * 0.4;
    const pitch = spec.w + landWidth;
    const bodyHalf = (numGrooves * pitch) / 2;
    const outerRadius = outerDiameter / 2;
    const rootRadius = outerRadius - spec.h;
    const innerRadius = holeDiameter / 2;
    const points: Vector2[] = [new Vector2(outerRadius, -bodyHalf - landWidth)];

    for (let groove = 0; groove < numGrooves; groove++) {
      const base = -bodyHalf + groove * pitch;
      points.push(new Vector2(outerRadius, base));
      points.push(new Vector2(outerRadius, base + landWidth));
      points.push(new Vector2(rootRadius, base + landWidth + spec.w * 0.38));
      points.push(new Vector2(rootRadius, base + landWidth + spec.w * 0.62));
      points.push(new Vector2(outerRadius, base + landWidth + spec.w));
    }

    points.push(new Vector2(outerRadius, bodyHalf + landWidth));
    points.push(new Vector2(innerRadius, bodyHalf + landWidth));
    points.push(new Vector2(innerRadius, -bodyHalf - landWidth));
    points.push(new Vector2(outerRadius, -bodyHalf - landWidth));

    const body = new Mesh(
      new LatheGeometry(points, Math.max(128, Math.round(outerRadius))),
      new MeshPhongMaterial({ color: 0xd0d0d3, shininess: 50 })
    );
    body.rotateX(Math.PI / 2);
    scene.add(body);

    let frame = 0;
    const loop = () => {
      body.rotation.z += 0.003;
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
  }, [beltType, holeDiameter, numGrooves, outerDiameter]);

  return <div ref={containerRef} className="h-full min-h-[22rem] w-full" />;
}
