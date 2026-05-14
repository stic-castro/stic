import React from "react";
import "../../styles/productDetail.css";

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="loading-card">
        <div className="loading-image"></div>
        <div className="loading-text">
          <div className="loading-title"></div>
          <div className="loading-price"></div>
          <div className="loading-description"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;