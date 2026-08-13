"use client";
import React, { useState } from "react";

interface FieldTooltipProps {
    imagePath: string;
    altText: string;
}

export default function FieldTooltip({ imagePath, altText }: FieldTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div style={{ position: "relative", display: "inline-block", marginLeft: "8px" }}>
            {/* Question mark icon */}
            <button
                type="button"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={() => setIsVisible(!isVisible)}
                style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2px solid #3498db",
                    backgroundColor: "white",
                    color: "#3498db",
                    fontSize: "12px",
                    fontWeight: "bold",
                    cursor: "help",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                    transition: "all 0.2s ease",
                }}
                onMouseDown={(e) => e.preventDefault()} // Prevent focus outline
                aria-label="Mostrar ayuda"
            >
                ?
            </button>

            {/* Tooltip with image */}
            {isVisible && (
                <div
                    style={{
                        position: "absolute",
                        top: "-10px",
                        left: "30px",
                        zIndex: 1000,
                        backgroundColor: "white",
                        border: "2px solid #3498db",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                        padding: "10px",
                        minWidth: "250px",
                        maxWidth: "350px",
                    }}
                    onMouseEnter={() => setIsVisible(true)}
                    onMouseLeave={() => setIsVisible(false)}
                >
                    {/* Arrow pointing left */}
                    <div
                        style={{
                            position: "absolute",
                            left: "-10px",
                            top: "15px",
                            width: 0,
                            height: 0,
                            borderTop: "8px solid transparent",
                            borderBottom: "8px solid transparent",
                            borderRight: "10px solid #3498db",
                        }}
                    />
                    <div
                        style={{
                            position: "absolute",
                            left: "-7px",
                            top: "16px",
                            width: 0,
                            height: 0,
                            borderTop: "7px solid transparent",
                            borderBottom: "7px solid transparent",
                            borderRight: "9px solid white",
                        }}
                    />

                    <img
                        src={imagePath}
                        alt={altText}
                        style={{
                            width: "100%",
                            height: "auto",
                            display: "block",
                            borderRadius: "4px",
                        }}
                    />
                    <p
                        style={{
                            margin: "8px 0 0 0",
                            fontSize: "11px",
                            color: "#666",
                            textAlign: "center",
                        }}
                    >
                        {altText}
                    </p>
                </div>
            )}
        </div>
    );
}
