"use client";
import { useEffect } from "react";
import {
  WebGLRenderer,
  Scene,
  PerspectiveCamera,
  AmbientLight,
  DirectionalLight,
  Mesh,
  MeshPhongMaterial,
  MeshBasicMaterial,
  CylinderGeometry,
  Color,
  Group,
  SRGBColorSpace,
} from "three";
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
// @ts-ignore
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader";
// @ts-ignore
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";

type SpacerProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  studCount?: number;
  hasCenterLip?: boolean;
  thickness?: number;
  boltPattern?: number;
  boltDiameter?: number;
  lipHeight?: number;
  lipDiameter?: number;
};

const SpacerScene = ({
  containerRef,
  studCount = 6,
  hasCenterLip = true,
  thickness = 20,
  boltPattern = 114.3,
  boltDiameter = 14,
  lipHeight = 10,
  lipDiameter = 60,
}: SpacerProps) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setClearColor(0xffffff);
    renderer.outputColorSpace = SRGBColorSpace;
    container.appendChild(renderer.domElement);

    const scene = new Scene();

    const camera = new PerspectiveCamera(45, width / height, 1, 1000);
    camera.position.set(0, 80, 180);
    camera.lookAt(0, 0, 0);

    scene.add(new AmbientLight(0x666666));
    const light = new DirectionalLight(0xffffff, 1);
    light.position.set(50, 50, 100);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.update();

    const spacerMat = new MeshPhongMaterial({ color: new Color(0x111111), shininess: 30 });
    const boltMat = new MeshPhongMaterial({ color: new Color(0x888888) });
    const lipMat = new MeshPhongMaterial({ color: new Color(0x333333) });
    const holeMat = new MeshBasicMaterial({ color: 0x888888 }); 

    const outerRadius = (boltPattern + 50) / 2;
    const centerHoleRadius = lipDiameter / 2;
    const boltRadius = boltDiameter / 2;
    const boltLength = 30;
    const boltCircleRadius = boltPattern / 2;
    const lipRadius = lipDiameter / 2;

    const spacer = new Mesh(
      new CylinderGeometry(outerRadius, outerRadius, thickness, 64),
      spacerMat
    );
    scene.add(spacer);

    const centerHole = new Mesh(
      new CylinderGeometry(centerHoleRadius, centerHoleRadius, thickness + 1, 32),
      holeMat
    );
    scene.add(centerHole);

    if (hasCenterLip) {
      const lip = new Mesh(
        new CylinderGeometry(lipRadius, lipRadius, lipHeight, 32),
        lipMat
      );
      lip.position.y = thickness / 2 + lipHeight / 2;
      scene.add(lip);
    }

    const totalPositions = studCount * 2;

    for (let i = 0; i < totalPositions; i++) {
      const angle = (i / totalPositions) * 2 * Math.PI;
      const x = boltCircleRadius * Math.cos(angle);
      const z = boltCircleRadius * Math.sin(angle);

      if (i % 2 === 0) {
        const bolt = new Mesh(
          new CylinderGeometry(boltRadius, boltRadius, boltLength, 32),
          boltMat
        );
        bolt.position.set(x, thickness / 2 + boltLength / 2, z);
        scene.add(bolt);
      } else {
        const topHoleRadius = 30 / 2;
        const bottomHoleRadius = 13.5 / 2;
        const bottomHoleDepth = 8;
        const topHoleDepth = thickness - bottomHoleDepth;

        const topHole = new Mesh(
          new CylinderGeometry(topHoleRadius, topHoleRadius, topHoleDepth + 0.01, 32),
          holeMat
        );
        topHole.position.y = (bottomHoleDepth / 2);

        const bottomHole = new Mesh(
          new CylinderGeometry(bottomHoleRadius, bottomHoleRadius, bottomHoleDepth + 0.01, 32),
          holeMat
        );
        bottomHole.position.y = -(topHoleDepth / 2); 

        const steppedHoleGroup = new Group();
        steppedHoleGroup.add(topHole);
        steppedHoleGroup.add(bottomHole);
        steppedHoleGroup.position.set(x, 0, z);
        scene.add(steppedHoleGroup);
      }
    }

    const loader = new FontLoader();
    loader.load("/fonts/helvetiker_regular.typeface.json", (font: Font) => {
      const textLines = ["S T I C", "62642431", "S T I C"];
      const textMaterial = new MeshPhongMaterial({ color: 0xffffff });

      textLines.forEach((line, index) => {
        const textGeo = new TextGeometry(line, {
          font: font,
          size: 6.5,
          height: 0.5,
          curveSegments: 6,
        });

        textGeo.computeBoundingBox();
        const width = textGeo.boundingBox!.max.x - textGeo.boundingBox!.min.x;
        const centerX = -width / 2;

        const textMesh = new Mesh(textGeo, textMaterial);
        const baseY = hasCenterLip
          ? thickness / 2 + lipHeight - 0.2
          : thickness / 2 - 0.2;

        textMesh.position.set(centerX, baseY, -9 + index * 9);
        textMesh.rotation.x = -Math.PI / 2;
        scene.add(textMesh);
      });
    });

    const animate = () => {
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      renderer.dispose();
      container.removeChild(renderer.domElement);
    };
  }, [containerRef, studCount, hasCenterLip, thickness, boltPattern, boltDiameter, lipHeight, lipDiameter]);

  return null;
};

export default SpacerScene;
