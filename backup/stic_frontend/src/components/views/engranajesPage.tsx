"use client";
import React, { useState, useEffect } from "react";
import "../../styles/separadores.css";
import GearScene from "../UI/3d-views/Gear";
import FieldTooltip from "../UI/FieldTooltip";

import { calculateGearQuotation } from "@/app/services/GearQuotationService";
import { fetchMaterials } from "@/app/services/MaterialService";
import { GearQuotationResponse } from "@/app/types/Gears";
import { Material } from "@/app/types/Materials";

export default function EngranajesPage() {
  const [diametroExterior, setDiametroExterior] = useState("");
  const [diametroHueco, setDiametroHueco] = useState("");
  const [alturaDiente, setAlturaDiente] = useState("");
  const [espesor, setEspesor] = useState("");
  const [numDientes, setNumDientes] = useState("");
  const [tipoEngranaje, setTipoEngranaje] = useState("Spur");
  const [material, setMaterial] = useState("");

  const [cotizacion, setCotizacion] = useState<GearQuotationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [materiales, setMateriales] = useState<Material[]>([]);

  useEffect(() => {
    const loadMaterials = async () => {
      const data = await fetchMaterials();
      // Filtrar duplicados por nombre
      const uniqueMaterials = Array.from(new Map(data.map(item => [item.name, item])).values());
      setMateriales(uniqueMaterials);
    };
    loadMaterials();
  }, []);

  //Limpiar cotización cuando se edita cualquier campo
  const clearQuotationOnEdit = () => {
    if (cotizacion) {
      setCotizacion(null);
    }
  };

  const handleCalculate = async () => {
    if (!diametroExterior || !diametroHueco || !alturaDiente || !espesor || !numDientes || !material) {
      alert("Completa todos los campos");
      return;
    }

    setIsCalculating(true);

    const result = await calculateGearQuotation({
      toothCount: parseInt(numDientes),
      module: 2.5,
      pitchDiameter: parseFloat(diametroHueco),
      outerDiameter: parseFloat(diametroExterior),
      width: parseFloat(espesor),
      toothHeight: parseFloat(alturaDiente),
      gearType: tipoEngranaje,
      material: material,
    });

    setCotizacion(result);
    setIsCalculating(false);
  };

  const generarPDFEngranaje = async () => {
    if (!cotizacion) return;

    const html2pdf = (await import("html2pdf.js")).default;

    // Carga la plantilla del HTML
    const htmlResp = await fetch("/pdf/cotizacion-engranaje.html");
    const htmlTemplate = await htmlResp.text();

    // Calcula IVA y total
    const subtotal = cotizacion.price;
    const iva = subtotal * 0.13;
    const total = subtotal + iva;

    // Reemplaza los placeholders
    const htmlWithData = htmlTemplate
      .replace("{{fecha}}", new Date().toLocaleDateString())
      .replace("{{diametroExterior}}", diametroExterior)
      .replace("{{diametroHueco}}", diametroHueco)
      .replace("{{alturaDiente}}", alturaDiente)
      .replace("{{espesor}}", espesor)
      .replace("{{numDientes}}", numDientes)
      .replace("{{tipoEngranaje}}", tipoEngranaje)
      .replace("{{material}}", material)
      .replace(/\{\{subtotal\}\}/g, subtotal.toFixed(2))
      .replace(/\{\{iva\}\}/g, iva.toFixed(2))
      .replace(/\{\{total\}\}/g, total.toFixed(2))
      .replace("{{quotationId}}", cotizacion.id.toString());


    // Accede al iframe
    const iframe = document.getElementById("iframe-engranaje") as HTMLIFrameElement;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    doc.open();
    doc.write(htmlWithData);
    doc.close();

    iframe.onload = () => {
      const content = iframe.contentDocument?.body;
      if (!content) return;

      html2pdf().set({
        margin: 10,
        filename: `ENGRANAJE_${tipoEngranaje}_${Date.now()}.pdf`,
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(content).save();
    };
  };


  return (
    <div className="contenedor-principal">
      <h1 className="titulo">Engranajes</h1>
      <div className="contenedor">
        <div className="formulario">
          <p className="subtitulo">Detalles del producto</p>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">
              Diámetro exterior (mm)
              <FieldTooltip
                imagePath="/images/gear-help/diametro-exterior.png"
                altText="Diámetro exterior del engranaje"
              />
            </label>
            <input
              type="number"
              className="select"
              value={diametroExterior}
              onChange={(e) => { setDiametroExterior(e.target.value); clearQuotationOnEdit(); }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">
              Diámetro del hueco interior (mm)
              <FieldTooltip
                imagePath="/images/gear-help/diametro-hueco.png"
                altText="Diámetro del hueco interior (eje)"
              />
            </label>
            <input
              type="number"
              className="select"
              value={diametroHueco}
              onChange={(e) => { setDiametroHueco(e.target.value); clearQuotationOnEdit(); }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">
              Altura del diente (mm)
              <FieldTooltip
                imagePath="/images/gear-help/altura-diente.png"
                altText="Altura del diente del engranaje"
              />
            </label>
            <input
              type="number"
              className="select"
              value={alturaDiente}
              onChange={(e) => { setAlturaDiente(e.target.value); clearQuotationOnEdit(); }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">
              Espesor del engranaje (mm)
              <FieldTooltip
                imagePath="/images/gear-help/espesor-engranaje.png"
                altText="Espesor o ancho del engranaje"
              />
            </label>
            <input
              type="number"
              className="select"
              value={espesor}
              onChange={(e) => { setEspesor(e.target.value); clearQuotationOnEdit(); }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">
              Número de dientes
              <FieldTooltip
                imagePath="/images/gear-help/numero-dientes.png"
                altText="Cantidad total de dientes del engranaje"
              />
            </label>
            <input
              type="number"
              className="select"
              value={numDientes}
              onChange={(e) => { setNumDientes(e.target.value); clearQuotationOnEdit(); }}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">Material</label>
            <select
              className="select"
              value={material}
              onChange={(e) => { setMaterial(e.target.value); clearQuotationOnEdit(); }}
            >
              <option value="">Selecciona un material</option>
              {materiales.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {cotizacion && (
            <div
              className="precio-cotizado"
              style={{
                marginTop: "1.5rem",
                fontSize: "1.1rem",
                textAlign: "center",
                color: "#333",
                fontWeight: "bold",
              }}
            >
              Precio estimado: BOB {cotizacion.price.toFixed(2)}
            </div>
          )}
        </div>

        <div className="contenedor-visualizacion">
          <p className="subtitulo">Visualización 3D</p>
          <div className="contenedor-visualizacion-gear">
            {cotizacion ? (
              <GearScene
                numTeeth={numDientes ? parseInt(numDientes) : 0}
                outerDiameter={diametroExterior ? parseFloat(diametroExterior) : 0}
                innerDiameter={(diametroExterior ? parseFloat(diametroExterior) : 0) - (alturaDiente ? parseFloat(alturaDiente) : 0)}
                gearThickness={espesor ? parseFloat(espesor) : 0}
                holeDiameter={diametroHueco ? parseFloat(diametroHueco) : 0}
              />
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>
                Ingresa los datos y presiona <strong>Diseño completado</strong>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="botones">
        <button className="btn-outline">Cancelar</button>
        <button className="btn-rojo" disabled={isCalculating} onClick={handleCalculate}>
          {isCalculating ? "Calculando..." : "Diseño completado"}
        </button>
        {cotizacion && (
          <button className="btn-outline" onClick={generarPDFEngranaje}>
            Descargar PDF
          </button>
        )}
      </div>

      <iframe id="iframe-engranaje" style={{ display: "none" }} />

    </div>
  );
}
