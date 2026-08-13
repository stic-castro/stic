import ProductsPage from '@/components/views/ProductsPage'

interface ProductsProps {
  searchParams: Promise<{
    categoryId?: string;
  }>;
}

export default async function Products({ searchParams }: ProductsProps) {
  const { categoryId } = await searchParams;
  const parsedCategoryId = Number(categoryId);
  const selectedCategoryId = Number.isInteger(parsedCategoryId)
    ? parsedCategoryId
    : undefined;

  return <ProductsPage categoryId={selectedCategoryId} />
}
