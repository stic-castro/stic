import React from "react";
import { BsExclamationTriangle } from "react-icons/bs"; // Icono de error
import "../../styles/productDetail.css";

const ErrorScreen = () => {
  return (
    <div className="product-not-found">
      <div className="error-message">
        <BsExclamationTriangle size={60} className="error-icon" />
        <h2>¡Vaya! El producto no se encuentra disponible</h2>
        <p>Lo sentimos, pero el producto que buscas no está disponible en este momento. Tal vez quieras buscar algo más.</p>
        <a href="/" className="go-home">Volver al inicio</a>
      </div>
    </div>
  );
};

export default ErrorScreen;