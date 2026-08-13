'use client'

import { useEffect, useState } from 'react';
import HeroBanner from '@/components/UI/HeroBanner';
import ProductCarousel from '@/components/UI/ProductCarousel';
import KitOptions from '@/components/UI/KitOptions';
import FloatingCart from '@/components/UI/FloatingChat';
import { fetchProducts } from './services/ProductService'; 
import { Product } from '@/app/types/Products';

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      const result = await fetchProducts();
      setProducts(result);
    };
    loadProducts();
  }, []);

  const separadores = products.filter(p => p.categoryId === 1);
  const engranajes = products.filter(p => p.categoryId === 2);
  const poleas = products.filter(p => p.categoryId === 3);

  return (
    <>
      <HeroBanner />
      <ProductCarousel title="Separadores" products={separadores} categoryId={1} />
      <ProductCarousel title="Poleas" products={poleas} categoryId={3} />
      <KitOptions />
      <ProductCarousel title="Engranajes" products={engranajes} categoryId={2} />
      <FloatingCart />
    </>
  );
}
