'use client';

import * as React from 'react';
import {
  AmbientLight,
  Color,
  DirectionalLight,
  EllipseCurve,
  ExtrudeGeometry,
  Mesh,
  MeshPhongMaterial,
  Path,
  PerspectiveCamera,
  Scene,
  Shape,
  SRGBColorSpace,
  Vector2,
  WebGLRenderer,
} from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

type GearSceneProps = {
  numTeeth: number;
  outerDiameter: number;
  innerDiameter: number;
  gearThickness: number;
  holeDiameter: number;
};

export function GearScene({
  numTeeth,
  outerDiameter,
  innerDiameter,
  gearThickness,
  holeDiameter,
}: GearSceneProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (numTeeth < 2 || outerDiameter <= 0 || innerDiameter <= 0 || gearThickness <= 0 || holeDiameter < 0) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 2000);
    camera.position.set(0, 0, Math.max(outerDiameter * 2.5, 120));
    scene.add(new AmbientLight(0x777777));
    const directionalLight = new DirectionalLight(0xffffff, 1);
    directionalLight.position.set(-1, 1, 2);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const shape = new Shape();
    const outerRadius = outerDiameter / 2;
    const innerRadius = innerDiameter / 2;
    const step = (Math.PI * 2) / (numTeeth * 4);

    for (let i = 0; i <= numTeeth * 4; i++) {
      const radius = i % 4 < 2 ? outerRadius : innerRadius;
      const angle = i * step;
      const point = new Vector2(Math.sin(angle) * radius, Math.cos(angle) * radius);
      if (i === 0) shape.moveTo(point.x, point.y);
      else shape.lineTo(point.x, point.y);
    }
    shape.closePath();

    const hole = new EllipseCurve(0, 0, holeDiameter / 2, holeDiameter / 2, 0, Math.PI * 2);
    shape.holes = [new Path(hole.getPoints(80))];

    const gear = new Mesh(
      new ExtrudeGeometry(shape, { depth: gearThickness, bevelEnabled: false }),
      new MeshPhongMaterial({ color: new Color(0.92, 0.92, 0.9), shininess: 45 })
    );
    gear.rotation.x = 0.35;
    scene.add(gear);

    let frame = 0;
    const loop = () => {
      gear.rotation.z += 0.003;
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
  }, [gearThickness, holeDiameter, innerDiameter, numTeeth, outerDiameter]);

  return <div ref={containerRef} className="h-full min-h-[22rem] w-full" />;
}
