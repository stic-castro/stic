"use client";
import { useEffect, useRef } from "react";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  MeshPhongMaterial,
  Mesh,
  Shape,
  ExtrudeGeometry,
  Vector2,
  Color,
  Path,
  EllipseCurve,
  SRGBColorSpace,
} from "three";
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';




type GearSceneProps = {
  numTeeth?: number;
  outerDiameter?: number;
  innerDiameter?: number;
  gearThickness?: number;
  holeDiameter?: number;
};

const GearScene = ({
  numTeeth = 18,
  outerDiameter = 8,
  innerDiameter = 7,
  gearThickness = 1.5,
  holeDiameter = 1.5,
}: GearSceneProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Validaciones mínimas para evitar errores en la geometría
    if (
      !numTeeth || numTeeth < 2 ||
      outerDiameter <= 0 || innerDiameter <= 0 ||
      gearThickness <= 0 || holeDiameter < 0
    ) {
      console.warn("⚠️ Parámetros inválidos para GearScene. Render cancelado.");
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.outputColorSpace = SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(45, width / height, 1, 2000);
    camera.position.set(0, 0, outerDiameter * 2.5);
    camera.lookAt(0, 0, 0);

    const controlsPosition = new OrbitControls(camera, renderer.domElement);
    controlsPosition.target.set(0, 0, 0);
    controlsPosition.update();



    const ambientLight = new AmbientLight(0x666666);
    const directionalLight = new DirectionalLight(0xeeeeee);
    directionalLight.position.set(-1, 1, 1);
    scene.add(ambientLight, directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);

    const createShape = (
      count = numTeeth,
      outRadius = outerDiameter / 2,
      inRadius = innerDiameter / 2,
      holeRadius = holeDiameter / 2
    ) => {
      const shape = new Shape();
      const outDeg = (Math.PI * 2) / count;
      let theta = 0;
      const step = 3 * 10;
      const degStep = outDeg / step;

      let first = false;
      for (let i = 0; i < count; i++) {
        for (let j = 0; j < step; j++) {
          theta += degStep;
          const inside = theta % outDeg > (outDeg * 2) / 3;
          let radius = inside ? inRadius : outRadius;
          let radiusOffset = 0;

          if (!inside) {
            const value = theta % outDeg;
            const radiusDiff = outRadius - inRadius;
            const left = (outDeg * 2) / 3 / 3;
            const right = (((outDeg * 2) / 3) * 2) / 3;

            if (value <= left) {
              radiusOffset = (-(value / left) + 1) * radiusDiff;
            } else if (value > right) {
              radiusOffset = ((value - right) / left) * radiusDiff;
            }
          }

          radius -= radiusOffset;
          const currentPos = new Vector2(
            radius * Math.sin(theta),
            radius * Math.cos(theta)
          );

          if (!first) {
            shape.moveTo(currentPos.x, currentPos.y);
            first = true;
          } else {
            shape.lineTo(currentPos.x, currentPos.y);
          }
        }
      }

      shape.closePath();

      const hole = new EllipseCurve(
        0,
        0,
        holeRadius,
        holeRadius,
        0,
        2 * Math.PI
      );
      const points = hole.getPoints(60);
      shape.holes = [new Path(points)];

      return shape;
    };

    const material = new MeshPhongMaterial({
      color: new Color(1, 1, 1),
      wireframe: false,
    });

    const shape = createShape();
    const extrudeGeometry = new ExtrudeGeometry(shape, {
      steps: 1,
      depth: gearThickness,
      bevelEnabled: false,
    });

    const gear = new Mesh(extrudeGeometry, material);
    scene.add(gear);

    // Rotación con mouse
    let isDragging = false;
    let lastMousePosition = { x: 0, y: 0 };

    const onMouseDown = (event: MouseEvent) => {
      isDragging = true;
      lastMousePosition = { x: event.clientX, y: event.clientY };
    };

    const onMouseMove = (event: MouseEvent) => {
      if (isDragging) {
        const deltaX = event.clientX - lastMousePosition.x;
        const deltaY = event.clientY - lastMousePosition.y;
        gear.rotation.x += deltaY * 0.01;
        gear.rotation.y += deltaX * 0.01;
        lastMousePosition = { x: event.clientX, y: event.clientY };
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [
    numTeeth,
    outerDiameter,
    innerDiameter,
    gearThickness,
    holeDiameter,
  ]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%", minHeight: "320px" }} />;
};

export default GearScene;
