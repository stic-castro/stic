'use client'

import '../../styles/productsList.css'
import { FiSearch, FiRefreshCw } from 'react-icons/fi'
import ProductCard from '../UI/ProductCard'
import { Product } from '@/app/types/Products';
import { useEffect, useState } from 'react';
import { fetchProducts } from '@/app/services/ProductService';
import Link from 'next/link';

interface ProductsPageProps {
  categoryId?: number;
}

const categoryNames: Record<number, string> = {
  1: 'Separadores',
  2: 'Engranajes',
  3: 'Poleas',
};

const quotationRoutes: Record<number, string> = {
  1: '/separadores',
  2: '/engranajes',
  3: '/poleas',
};

export default function ProductsPage({ categoryId }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadProducts = async () => {
    const result = await fetchProducts();
    setProducts(result);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const productsByCategory = categoryId
    ? products.filter((product) => product.categoryId === categoryId)
    : products;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredProducts = normalizedSearch
    ? productsByCategory.filter((product) => {
        const searchableText = [
          product.name,
          product.description,
          product.price?.toString(),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchableText.includes(normalizedSearch);
      })
    : productsByCategory;

  const pageTitle = categoryId && categoryNames[categoryId]
    ? categoryNames[categoryId]
    : 'Productos';

  const quotationHref = categoryId ? quotationRoutes[categoryId] : '/arma-tu-kit';
  const quotationLabel = categoryId
    ? `Solicitar cotización de ${pageTitle.toLowerCase()}`
    : 'Crear cotización personalizada';

  const handleRefresh = async () => {
    setSearchTerm('');
    await loadProducts();
  };

  return (
    <div className="products-container">
      <div className="products-header">
        <h1>{pageTitle}</h1>
        <div className="filters-actions">
          <div className="search-box">
            <FiSearch size={18} />
            <input
              type="search"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <button className="icon-button" title="Refrescar productos" onClick={handleRefresh}>
            <FiRefreshCw size={24} />
          </button>

          <Link href={quotationHref} className="custom-quote-link">
            {quotationLabel}
          </Link>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              image={product.image}
              name={product.name}
              price={product.price}
            />
          ))
        ) : (
          <p className="products-empty">No se encontraron productos con esa busqueda.</p>
        )}
      </div>
    </div>
  )
}
