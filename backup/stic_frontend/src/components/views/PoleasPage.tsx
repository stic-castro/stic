"use client";
import React, { useState, useEffect } from "react";
import "../../styles/separadores.css";
import GearScene from "../UI/3d-views/Gear";
import FieldTooltip from "../UI/FieldTooltip";
import { calculatePulleyQuotation } from "@/app/services/pulleyQuotationService";
import { fetchMaterials } from "@/app/services/MaterialService";
import { Material } from "@/app/types/Materials";
import { PulleyQuotationResponse } from "@/app/types/Pulleys";
import PulleyScene from "../UI/3d-views/Pulley";

export default function PoleasPage() {
  const [diametroExterior, setDiametroExterior] = useState("");
  const [diametroHueco, setDiametroHueco] = useState("");
  const [numCanales, setNumCanales] = useState("");
  const [tipoCanal, setTipoCanal] = useState("C");
  const [material, setMaterial] = useState("");

  const [cotizacion, setCotizacion] = useState<PulleyQuotationResponse | null>(null);
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

  // Limpiar cotización cuando se edita cualquier campo
  const clearQuotationOnEdit = () => {
    if (cotizacion) {
      setCotizacion(null);
    }
  };

  const handleCalculate = async () => {
    if (!diametroExterior || !diametroHueco || !numCanales || !tipoCanal || !material) {
      alert("Completa todos los campos");
      return;
    }

    setIsCalculating(true);
    const data = {
      outerDiameter: parseFloat(diametroExterior),
      innerBoreDiameter: parseFloat(diametroHueco),
      width: 3,
      grooveCount: parseInt(numCanales),
      grooveType: tipoCanal,
      material: material,
    };

    const result = await calculatePulleyQuotation(data);
    setCotizacion(result);
    setIsCalculating(false);
  };

  const generarPDFPolea = async () => {
    if (!cotizacion) return;

    const html2pdf = (await import("html2pdf.js")).default;

    const htmlResp = await fetch("/pdf/cotizacion-polea.html");
    const htmlTemplate = await htmlResp.text();

    // Calcula IVA y total
    const subtotal = cotizacion.price;
    const iva = subtotal * 0.13;
    const total = subtotal + iva;

    // Lógica para singular/plural de canales
    const canalesText = parseInt(numCanales) === 1 ? "canal" : "canales";

    // Genera un ID de cotización usando el id del backend o un timestamp como fallback
    const quotationId = cotizacion.id?.toString() || `POL-${Date.now()}`;

    const htmlWithData = htmlTemplate
      .replace("{{fecha}}", new Date().toLocaleDateString())
      .replace("{{diametroExterior}}", diametroExterior)
      .replace("{{diametroHueco}}", diametroHueco)
      .replace("{{numCanales}}", numCanales)
      .replace("{{canalesText}}", canalesText)
      .replace("{{tipoCanal}}", tipoCanal)
      .replace("{{material}}", material)
      .replace(/\{\{subtotal\}\}/g, subtotal.toFixed(2))
      .replace(/\{\{iva\}\}/g, iva.toFixed(2))
      .replace(/\{\{total\}\}/g, total.toFixed(2))
      .replace("{{quotationId}}", quotationId);

    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    document.body.appendChild(iframe);

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
        filename: `POLEA_${tipoCanal}_${Date.now()}.pdf`,
        html2canvas: {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff'
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }).from(content).save();

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    };
  };


  return (
    <div className="contenedor-principal">
      <h1 className="titulo">Poleas</h1>
      <div className="contenedor">
        <div className="formulario">
          <p className="subtitulo">Detalles del producto</p>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">
              Diámetro exterior (mm)
              <FieldTooltip
                imagePath="/images/pulley-help/diametro-exterior.png"
                altText="Diámetro exterior de la polea"
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
              Diámetro del hueco interior
              <FieldTooltip
                imagePath="/images/pulley-help/diametro-hueco.png"
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
              Número de canales
            </label>
            <input
              type="number"
              className="select"
              value={numCanales}
              onChange={(e) => { setNumCanales(e.target.value); clearQuotationOnEdit(); }}
              min={1}
            />
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">
              Tipo de canal
            </label>
            <div className="opciones-espesor">
              {["A", "B", "C"].map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => { setTipoCanal(tipo); clearQuotationOnEdit(); }}
                  className={`espesor-btn ${tipoCanal === tipo ? "activo" : ""}`}
                >
                  {tipo}
                </button>
              ))}
            </div>
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
              <PulleyScene
                outerDiameter={Number(diametroExterior)}
                holeDiameter={Number(diametroHueco)}
                numGrooves={Number(numCanales)}
                beltType={tipoCanal as "A" | "B" | "C"}
                landRatio={0.35}
                rearFlangeRatio={1}
                frontFlangeRatio={0.3}
                noShading={false}
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
          <button className="btn-outline" onClick={generarPDFPolea}>
            Descargar PDF
          </button>
        )}

      </div>
    </div>
  );
}
