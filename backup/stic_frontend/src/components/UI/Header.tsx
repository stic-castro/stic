"use client";

import { useState } from "react";
import Link from "next/link";
import { FaUser } from "react-icons/fa";
import "../../styles/globals.css";
import Image from "next/image";
import logo from "@/assets/image/logo.jpg";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import { FiLogOut, FiMenu, FiSettings, FiX } from "react-icons/fi";

export default function Header() {
  const { user, isAdmin, logout } = useFirebaseUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="header-container">
      <div className="header-top">
        <Link href="/" onClick={closeMenu}>
          <Image
            src={logo}
            alt="Logo"
            className="logo"
            width={60}
            height={90}
          />
        </Link>

        <button
          className="mobile-menu-btn"
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-label={isMenuOpen ? "Cerrar menu" : "Abrir menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      <div className={`header-menu ${isMenuOpen ? "open" : ""}`}>
        <div className="header-left">
        <nav className="nav-links">
          <Link href="/productos?categoryId=3" className="nav-item" onClick={closeMenu}>
            POLEAS
          </Link>
          <Link href="/productos?categoryId=2" className="nav-item" onClick={closeMenu}>
            ENGRANAJES
          </Link>
          <Link href="/productos?categoryId=1" className="nav-item" onClick={closeMenu}>
            SEPARADORES
          </Link>
          <Link href="/arma-tu-kit" className="nav-item" onClick={closeMenu}>
            COTIZACIONES
          </Link>
        </nav>
      </div>

      <div className="header-right">
        {!user ? (
          <>
            <Link href="/login" className="login-link" onClick={closeMenu}>
              Log In
            </Link>
            <Link href="/signup" onClick={closeMenu}>
              <button className="signup-btn">Sign Up</button>
            </Link>
          </>
        ) : (
          <div className="user-info">
            
              <FaUser size={18} />
        
            <span className="user-name">{user.displayName || user.email}</span>
            
            {/* Enlace al Panel Admin - solo visible para administradores */}
            {isAdmin() && (
              <Link href="/adminpanel" className="admin-panel-link" onClick={closeMenu}>
                <FiSettings size={18} />
                <span>Admin</span>
              </Link>
            )}
            
            <button onClick={() => { logout(); closeMenu(); }} className="logout-btn">
              <FiLogOut size={18} />
              <span>Salir</span>
            </button>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}
