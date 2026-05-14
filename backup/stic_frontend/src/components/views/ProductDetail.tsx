"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import "../../styles/productDetail.css";
import { fetchProductById } from "@/app/services/ProductService";
import { Product } from "@/app/types/Products";
import LoadingScreen from "./LoadingScreen";
import ErrorScreen from "./ErrorScreen";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [cejaOn, setCejaOn] = useState(false);
  const [selectedEspesor, setSelectedEspesor] = useState('1"');
  const [counter, setCounter] = useState(0);
  const [mainImage, setMainImage] = useState<string>("");

  const espesores = ['1"', '1.5"', '2"'];

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const data = await fetchProductById(Number(id));
        setProduct(data);
        setCejaOn(data?.cejaCentrada ?? false);
        setSelectedEspesor(data?.espesor ?? '1"');
        setMainImage(data?.image ?? ""); 
      } catch (error) {
        console.error("Error al obtener producto:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <LoadingScreen />; 

  if (!product) return <ErrorScreen />;

  const allImages = [product.image, ...(product.images || [])];

  return (
    <div className="product-detail-container">
      <div className="product-media">
        <div className="product-gallery">
          {allImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`thumb-${index}`}
              className={`product-thumbnail ${mainImage === img ? "selected" : ""}`}
              onClick={() => setMainImage(img)}
            />
          ))}
        </div>

        <div className="product-main">
          <img
            src={mainImage}
            alt={product.name}
            className="product-main-image"
          />
        </div>
      </div>

      <div className="product-detail-info">
        <h2 className="product-title">{product.name}</h2>
        <p className="product-price">Bs. {product.price}</p>
        <p className="product-description">{product.description}</p>

        <div className="product-specs">

          <div className="stock-info">
            <strong className="spec-label">Stock disponible</strong>
            <p className="spec-value">{product.stock}</p>
          </div>
        </div>


        <div className="action-row">
          <div className="counter">
            <button
              onClick={() => setCounter(counter > 0 ? counter - 1 : 0)}
              className="counter-button"
            >
              -
            </button>
            <span className="counter-value">{counter}</span>
            <button
              onClick={() => {
                if (counter < product.stock) {
                  setCounter(counter + 1);
                }
              }}
              className="counter-button"
            >
              +
            </button>

          </div>

          <a
            href={`https://wa.me/?text=Hola, me interesa el producto: ${product.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="whatsapp-button"
          >
            <FaWhatsapp size={20} />
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
