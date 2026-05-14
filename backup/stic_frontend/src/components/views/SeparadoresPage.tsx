"use client";
import React, { useState, useEffect, useRef } from "react";
import "../../styles/separadores.css";
import SpacerScene from "../UI/3d-views/Spacer";
import FieldTooltip from "../UI/FieldTooltip";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

import {
  fetchMakes,
  fetchModelsByMake,
  fetchYearsByMakeAndModel,
} from "@/app/services/VehicleService";

import { fetchMaterials } from "@/app/services/MaterialService";
import { calculateSpacerQuotation } from "@/app/services/spacerQuotationService";
import { QuotationResponse } from "@/app/types/Spacers";
import { Material } from "@/app/types/Materials";

export default function SeparadoresPage() {
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [anio, setAnio] = useState("");
  const [espesor, setEspesor] = useState("1");
  const [materialSeleccionado, setMaterialSeleccionado] = useState("");

  const [makeOptions, setMakeOptions] = useState<string[]>([]);
  const [modelOptions, setModelOptions] = useState<string[]>([]);
  const [yearOptions, setYearOptions] = useState<number[]>([]);
  const [materiales, setMateriales] = useState<Material[]>([]);

  const [isLoadingMakes, setIsLoadingMakes] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [isLoadingYears, setIsLoadingYears] = useState(false);
  const [isLoadingMaterials, setIsLoadingMaterials] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  const [cotizacion, setCotizacion] = useState<QuotationResponse | null>(null);
  const threeContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const loadMakes = async () => {
      setIsLoadingMakes(true);
      const makes = await fetchMakes();
      setMakeOptions(makes);
      setIsLoadingMakes(false);
    };
    loadMakes();
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      setModelo("");
      setAnio("");
      setYearOptions([]);
      setModelOptions([]);
      setCotizacion(null);

      if (marca) {
        setIsLoadingModels(true);
        const models = await fetchModelsByMake(marca);
        setModelOptions(models);
        setIsLoadingModels(false);
      }
    };
    loadModels();
  }, [marca]);

  useEffect(() => {
    const loadYears = async () => {
      setAnio("");
      setYearOptions([]);
      setCotizacion(null);

      if (marca && modelo) {
        setIsLoadingYears(true);
        const years = await fetchYearsByMakeAndModel(marca, modelo);
        setYearOptions(years);
        setIsLoadingYears(false);
      }
    };
    loadYears();
  }, [modelo]);

  useEffect(() => {
    const loadMaterials = async () => {
      setIsLoadingMaterials(true);
      const data = await fetchMaterials();
      // Filtrar duplicados por nombre
      const uniqueMaterials = Array.from(new Map(data.map(item => [item.name, item])).values());
      setMateriales(uniqueMaterials);
      setIsLoadingMaterials(false);
    };
    loadMaterials();
  }, []);

  // Limpiar cotización cuando se edita cualquier campo
  const clearQuotationOnEdit = () => {
    if (cotizacion) {
      setCotizacion(null);
    }
  };

  const handleCalculateDesign = async () => {
    if (!marca || !modelo || !anio || !espesor || !materialSeleccionado) {
      alert("Completa todos los campos antes de generar la cotización.");
      return;
    }

    setIsCalculating(true);
    const data = {
      make: marca,
      model: modelo,
      year: parseInt(anio),
      inches: parseFloat(espesor),
      material: materialSeleccionado,
    };

    const result = await calculateSpacerQuotation(data);
    setCotizacion(result);
    setIsCalculating(false);
  };



  const generarPDF = async () => {
    if (!cotizacion || !threeContainerRef.current) return;

    const html2pdf = (await import("html2pdf.js")).default;

    // Captura de imagen 3D
    const canvas = await html2canvas(threeContainerRef.current);
    const captura3D = canvas.toDataURL("image/png");

    // Carga HTML embebido con estilos inline
    const htmlResp = await fetch("/pdf/cotizacion-separadores-template.html");
    let htmlTemplate = await htmlResp.text();

    // Calcula IVA y total
    const subtotal = cotizacion.price;
    const iva = subtotal * 0.13;
    const total = subtotal + iva;

    // Formato combinado para patrón de pernos: tornillos x patrón
    const patronCompleto = `${cotizacion.boltCount}x${cotizacion.boltPattern}`;

    // Reemplaza los placeholders
    const htmlWithData = htmlTemplate
      .replace("{{logo}}", "/LOGO.jpg")
      .replace("{{fecha}}", new Date().toLocaleDateString())
      .replace("{{marca}}", marca)
      .replace("{{modelo}}", modelo)
      .replace("{{anio}}", anio)
      .replace("{{espesor}}", espesor)
      .replace("{{material}}", materialSeleccionado)
      .replace("{{patronCompleto}}", patronCompleto)
      .replace("{{centro}}", cotizacion.centerBore.toString())
      .replace(/\{\{subtotal\}\}/g, subtotal.toFixed(2))
      .replace(/\{\{iva\}\}/g, iva.toFixed(2))
      .replace(/\{\{total\}\}/g, total.toFixed(2))
      .replace("{{imagen3d}}", captura3D)
      .replace("{{quotationId}}", cotizacion.id.toString());

    // Usa el iframe oculto ya existente
    const iframe = document.getElementById("mi-iframe") as HTMLIFrameElement | null;
    if (!iframe) {
      alert("No se encontró el iframe 'mi-iframe'");
      return;
    }

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      alert("No se pudo acceder al documento del iframe");
      return;
    }

    // Escribe el contenido generado en el iframe
    doc.open();
    doc.write(htmlWithData);
    doc.close();

    // Espera a que las imágenes y el DOM se carguen completamente
    iframe.onload = () => {
      const images = iframe.contentDocument?.images || [];
      const allImagesLoaded = Array.from(images).every(img => img.complete);

      if (allImagesLoaded) {
        generarPDFDesdeIframe(iframe, html2pdf);
      } else {
        // Esperar hasta que TODAS las imágenes se hayan cargado
        let loadedCount = 0;
        Array.from(images).forEach(img => {
          img.onload = () => {
            loadedCount++;
            if (loadedCount === images.length) {
              generarPDFDesdeIframe(iframe, html2pdf);
            }
          };
        });
      }
    };
  };

  const generarPDFDesdeIframe = (iframe: HTMLIFrameElement, html2pdf: any) => {
    const content = iframe.contentDocument?.body;
    if (!content) return;

    html2pdf().set({
      margin: 10,
      filename: `SEP-${Date.now()}.pdf`,
      html2canvas: {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
    }).from(content).save();
  };

  return (
    <div className="contenedor-principal">
      <h1 className="titulo">Separadores</h1>
      <div className="contenedor">
        <div className="formulario">
          <p className="subtitulo">Detalles del producto</p>

          <div className="fila-selectores" style={{ gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label className="label">Marca</label>
              <select
                className="select"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                disabled={isLoadingMakes}
              >
                <option value="">
                  {isLoadingMakes ? "Cargando..." : "Selecciona la marca"}
                </option>
                {makeOptions.map((make) => (
                  <option key={make} value={make}>
                    {make}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Modelo</label>
              <select
                className="select"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                disabled={!marca || isLoadingModels}
              >
                <option value="">
                  {isLoadingModels ? "Cargando..." : "Selecciona el modelo"}
                </option>
                {modelOptions.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Año</label>
              <select
                className="select"
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
                disabled={!modelo || isLoadingYears}
              >
                <option value="">
                  {isLoadingYears ? "Cargando..." : "Selecciona el año"}
                </option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">Espesor</label>
            <div className="opciones-espesor">
              {["1", "1.5", "2"].map((val) => (
                <button
                  key={val}
                  onClick={() => { setEspesor(val); clearQuotationOnEdit(); }}
                  className={`espesor-btn ${espesor === val ? "activo" : ""}`}
                >
                  {val}"
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label className="label">Material</label>
            <select
              className="select"
              value={materialSeleccionado}
              onChange={(e) => { setMaterialSeleccionado(e.target.value); clearQuotationOnEdit(); }}
              disabled={isLoadingMaterials}
            >
              <option value="">
                {isLoadingMaterials ? "Cargando..." : "Selecciona el material"}
              </option>
              {materiales.map((mat) => (
                <option key={mat.id} value={mat.name}>
                  {mat.name}
                </option>
              ))}
            </select>
          </div>

          {
            cotizacion && (
              <div className="precio-cotizado" style={{ marginTop: "1.5rem", fontSize: "1.1rem", textAlign: "center", color: "#333", fontWeight: "bold" }}>
                Precio estimado: BOB {cotizacion.price.toFixed(2)}
              </div>
            )
          }
        </div >

        <div className="contenedor-visualizacion">
          <p className="subtitulo" style={{ color: "#f00" }}>Visualización 3D</p>
          <div
            ref={threeContainerRef}
            style={{ margin: 0, padding: 0, height: "50vh" }}
            className="contenedor-visualizacion-gear"
          >
            {cotizacion ? (
              <SpacerScene
                containerRef={threeContainerRef}
                studCount={cotizacion.boltCount}
                hasCenterLip={true}
                thickness={cotizacion.thicknessMm * 25}
                boltPattern={cotizacion.boltPattern}
                boltDiameter={12}
                lipHeight={8}
                lipDiameter={cotizacion.centerBore}
              />
            ) : (
              <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>
                Completa los campos y haz clic en <strong>Diseño completado</strong>
              </div>
            )}
          </div>
        </div>
      </div >

      <div className="botones">
        <button className="btn-outline">Cancelar</button>
        <button
          className="btn-rojo"
          disabled={isCalculating}
          onClick={handleCalculateDesign}
        >
          {isCalculating ? "Calculando..." : "Diseño completado"}
        </button>

        {cotizacion && (
          <button className="btn-outline" onClick={generarPDF}>
            Descargar PDF
          </button>
        )}
      </div>
      <iframe id="mi-iframe" style={{ display: "none" }}></iframe>
    </div >
  );
}
