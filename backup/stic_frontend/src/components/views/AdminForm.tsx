"use client";

import React, { useEffect, useMemo, useState } from "react";
import { notFound } from "next/navigation";
import { useFirebaseUser } from "@/hooks/useFirebaseUser";
import "../../styles/admin.css";
import {
  createProduct,
  deleteProduct,
  fetchProducts,
  updateProduct,
} from "@/app/services/ProductService";
import { fetchMaterials } from "@/app/services/MaterialService";
import { Product } from "@/app/types/Products";
import { Material } from "@/app/types/Materials";
import {
  FaBoxes,
  FaChevronLeft,
  FaChevronRight,
  FaCogs,
  FaEdit,
  FaFileInvoiceDollar,
  FaPlus,
  FaSignOutAlt,
  FaTachometerAlt,
  FaTrash,
} from "react-icons/fa";

type AdminTab =
  | "dashboard"
  | "productos"
  | "materiales"
  | "nuevo-producto"
  | "editar-producto"
  | "nuevo-material"
  | "editar-material";

type CategoryId = 1 | 2 | 3;

type SpacerQuotation = {
  id: number;
  make?: string;
  model?: string;
  year?: number;
  boltCount?: number;
  boltPattern?: number;
  thicknessMm?: number;
  centerBore?: number;
  isHubCentric?: boolean;
  price?: number;
};

type GearQuotation = {
  id: number;
  toothCount?: number;
  teethCount?: number;
  module?: number;
  pitchDiameter?: number;
  outerDiameter?: number;
  width?: number;
  toothHeight?: number;
  gearType?: string;
  material?: string;
  price?: number;
};

type PulleyQuotation = {
  id: number;
  outerDiameter?: number;
  innerBoreDiameter?: number;
  width?: number;
  grooveCount?: number;
  grooveType?: string;
  price?: number;
};

type TrendRow = {
  label: string;
  count: number;
  total: number;
  avg: number;
};

const categories: Array<{ id: CategoryId; label: string }> = [
  { id: 1, label: "Separadores" },
  { id: 2, label: "Engranajes" },
  { id: 3, label: "Poleas" },
];

const pageSize = 8;

const productTemplate: Partial<Product> = {
  name: "",
  description: "",
  price: 0,
  stock: 0,
  image: "",
  categoryId: 1,
};

const formatCurrency = (value: number) => `Bs. ${value.toFixed(2)}`;

const asNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : 0;

const groupBy = <T,>(items: T[], getKey: (item: T) => string): TrendRow[] => {
  const groups = new Map<string, { count: number; total: number }>();

  items.forEach((item: any) => {
    const label = getKey(item);
    const current = groups.get(label) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += asNumber(item.price);
    groups.set(label, current);
  });

  return Array.from(groups.entries())
    .map(([label, data]) => ({
      label,
      count: data.count,
      total: data.total,
      avg: data.count ? data.total / data.count : 0,
    }))
    .sort((a, b) => b.count - a.count || b.total - a.total)
    .slice(0, 6);
};

export default function AdminForm() {
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [spacerQuotations, setSpacerQuotations] = useState<SpacerQuotation[]>([]);
  const [gearQuotations, setGearQuotations] = useState<GearQuotation[]>([]);
  const [pulleyQuotations, setPulleyQuotations] = useState<PulleyQuotation[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [trendCategory, setTrendCategory] = useState<CategoryId>(1);
  const [trendMode, setTrendMode] = useState("bolt-thickness");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>(productTemplate);
  const [newMaterial, setNewMaterial] = useState<Partial<Material>>({});
  const { user, loading, logout, isAdmin } = useFirebaseUser();

  const admin = isAdmin();

  useEffect(() => {
    if (loading || !admin) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const [
          productsData,
          materialsData,
          spacersResponse,
          gearsResponse,
          pulleysResponse,
        ] = await Promise.all([
          fetchProducts(),
          fetchMaterials(),
          fetch("/api/spacer/quotation"),
          fetch("/api/gear/quotation"),
          fetch("/api/pulley/quotation"),
        ]);

        setProducts(productsData);
        setMaterials(materialsData);
        setSpacerQuotations(spacersResponse.ok ? await spacersResponse.json() : []);
        setGearQuotations(gearsResponse.ok ? await gearsResponse.json() : []);
        setPulleyQuotations(pulleysResponse.ok ? await pulleysResponse.json() : []);
      } catch (error) {
        console.error("Error al cargar datos del panel:", error);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [loading, admin]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    const defaultTrendMode: Record<CategoryId, string> = {
      1: "bolt-thickness",
      2: "type-module",
      3: "groove-width",
    };
    setTrendMode(defaultTrendMode[trendCategory]);
  }, [trendCategory]);

  const productsByCategory = products.filter(
    (product) => product.categoryId === selectedCategory
  );
  const totalPages = Math.max(1, Math.ceil(productsByCategory.length / pageSize));
  const paginatedProducts = productsByCategory.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const quotationTotal =
    spacerQuotations.length + gearQuotations.length + pulleyQuotations.length;

  const trendRows = useMemo(() => {
    if (trendCategory === 1) {
      return groupBy(spacerQuotations, (item) => {
        if (trendMode === "vehicle") {
          return `${item.make || "Marca sin dato"} ${item.model || "Modelo sin dato"} ${item.year ?? ""}`.trim();
        }
        if (trendMode === "thickness") return `${item.thicknessMm ?? "-"} pulgadas`;
        return `${item.boltCount ?? "-"}x${item.boltPattern ?? "-"} / ${item.thicknessMm ?? "-"} pulgadas`;
      });
    }

    if (trendCategory === 2) {
      return groupBy(gearQuotations, (item) => {
        if (trendMode === "material") return item.material || "Material sin dato";
        if (trendMode === "teeth") return `${item.toothCount ?? item.teethCount ?? "-"} dientes`;
        return `${item.gearType || "Tipo sin dato"} / Mod ${item.module ?? "-"}`;
      });
    }

    return groupBy(pulleyQuotations, (item) => {
      if (trendMode === "diameter") return `Diam. ${item.outerDiameter ?? "-"} mm`;
      if (trendMode === "groove") return `${item.grooveCount ?? "-"} ranuras tipo ${item.grooveType ?? "-"}`;
      return `${item.grooveCount ?? "-"} ranuras / ${item.width ?? "-"} mm ancho`;
    });
  }, [gearQuotations, pulleyQuotations, spacerQuotations, trendCategory, trendMode]);

  const quoteCountByCategory: Record<CategoryId, number> = {
    1: spacerQuotations.length,
    2: gearQuotations.length,
    3: pulleyQuotations.length,
  };

  if (!loading && !admin) {
    notFound();
  }

  if (loading || loadingData) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Verificando panel de administracion...</p>
      </div>
    );
  }

  const handleDeleteProduct = async (id: number) => {
    if (!confirm("Estas seguro de eliminar este producto?")) return;

    const deleted = await deleteProduct(id);
    if (deleted) {
      setProducts(products.filter((product) => product.id !== id));
      return;
    }

    alert("Error al eliminar el producto");
  };

  const handleDeleteMaterial = async (id: number) => {
    if (!confirm("Estas seguro de eliminar este material?")) return;
    setMaterials(materials.filter((material) => material.id !== id));
  };

  const handleSaveProduct = async (product: Partial<Product>) => {
    try {
      const saved = product.id
        ? await updateProduct(product.id, product)
        : await createProduct(product);

      if (!saved) throw new Error("No se recibio el producto guardado");

      if (product.id) {
        setProducts(products.map((item) => (item.id === product.id ? saved : item)));
        setEditingProduct(null);
      } else {
        setProducts([...products, saved]);
        setNewProduct(productTemplate);
      }

      setActiveTab("productos");
    } catch (error) {
      console.error("Error al guardar producto:", error);
      alert("Error al guardar el producto");
    }
  };

  const saveMaterialToAPI = async (material: Partial<Material>) => {
    const endpoint = material.id
      ? `http://localhost:5267/api/Material/${material.id}`
      : "http://localhost:5267/api/Material";
    const method = material.id ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pricePerKg: material.pricePerKg ?? 0,
        name: material.name ?? "",
        density: material.density ?? 0,
        pricePerHourMachine: material.pricePerHourMachine ?? 0,
        pricePerHourOperator: material.pricePerHourOperator ?? 0,
      }),
    });

    if (!response.ok) throw new Error("Error en la solicitud al guardar material");
    return await response.json();
  };

  const handleSaveMaterial = async (material: Partial<Material>) => {
    try {
      const saved = await saveMaterialToAPI(material);

      if (material.id) {
        setMaterials(materials.map((item) => (item.id === material.id ? saved : item)));
        setEditingMaterial(null);
      } else {
        setMaterials([...materials, saved]);
        setNewMaterial({});
      }

      setActiveTab("materiales");
    } catch (error) {
      console.error("Error al guardar material:", error);
      alert("Error al guardar el material");
    }
  };

  const renderTrendModeOptions = () => {
    if (trendCategory === 1) {
      return (
        <>
          <option value="bolt-thickness">Patron de pernos y espesor en pulgadas</option>
          <option value="thickness">Espesor en pulgadas</option>
          <option value="vehicle">Marca, modelo y año</option>
        </>
      );
    }

    if (trendCategory === 2) {
      return (
        <>
          <option value="type-module">Tipo y modulo</option>
          <option value="teeth">Cantidad de dientes</option>
          <option value="material">Material</option>
        </>
      );
    }

    return (
      <>
        <option value="groove-width">Ranuras y ancho</option>
        <option value="groove">Ranuras</option>
        <option value="diameter">Diametro exterior</option>
      </>
    );
  };

  const renderProductForm = (
    title: string,
    product: Partial<Product>,
    setProduct: React.Dispatch<React.SetStateAction<any>>
  ) => (
    <div className="admin-form-container">
      <h1>{title}</h1>

      <form
        className="admin-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSaveProduct(product);
        }}
      >
        <div className="form-group">
          <label htmlFor="product-name">Nombre</label>
          <input
            id="product-name"
            type="text"
            value={product.name || ""}
            onChange={(event) => setProduct({ ...product, name: event.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="product-description">Descripcion</label>
          <textarea
            id="product-description"
            value={product.description || ""}
            onChange={(event) =>
              setProduct({ ...product, description: event.target.value })
            }
            rows={4}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="product-price">Precio</label>
            <input
              id="product-price"
              type="number"
              value={product.price ?? ""}
              onChange={(event) =>
                setProduct({ ...product, price: parseFloat(event.target.value) })
              }
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="product-stock">Stock</label>
            <input
              id="product-stock"
              type="number"
              value={product.stock ?? ""}
              onChange={(event) =>
                setProduct({ ...product, stock: parseInt(event.target.value) })
              }
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="product-category">Categoria</label>
          <select
            id="product-category"
            value={product.categoryId || ""}
            onChange={(event) =>
              setProduct({ ...product, categoryId: parseInt(event.target.value) })
            }
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="product-image">URL de imagen</label>
          <input
            id="product-image"
            type="text"
            value={product.image || ""}
            onChange={(event) => setProduct({ ...product, image: event.target.value })}
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => setActiveTab("productos")}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );

  const renderMaterialForm = (
    title: string,
    material: Partial<Material>,
    setMaterial: React.Dispatch<React.SetStateAction<any>>
  ) => (
    <div className="admin-form-container">
      <h1>{title}</h1>

      <form
        className="admin-form"
        onSubmit={(event) => {
          event.preventDefault();
          handleSaveMaterial(material);
        }}
      >
        <div className="form-group">
          <label htmlFor="material-name">Nombre</label>
          <input
            id="material-name"
            type="text"
            value={material.name || ""}
            onChange={(event) => setMaterial({ ...material, name: event.target.value })}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="material-density">Densidad</label>
            <input
              id="material-density"
              type="number"
              value={material.density ?? ""}
              onChange={(event) =>
                setMaterial({ ...material, density: parseFloat(event.target.value) })
              }
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="material-price">Precio por kg</label>
            <input
              id="material-price"
              type="number"
              value={material.pricePerKg ?? ""}
              onChange={(event) =>
                setMaterial({ ...material, pricePerKg: parseFloat(event.target.value) })
              }
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="machine-price">Precio hora maquina</label>
            <input
              id="machine-price"
              type="number"
              value={material.pricePerHourMachine ?? ""}
              onChange={(event) =>
                setMaterial({
                  ...material,
                  pricePerHourMachine: parseFloat(event.target.value),
                })
              }
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="operator-price">Precio hora operador</label>
            <input
              id="operator-price"
              type="number"
              value={material.pricePerHourOperator ?? ""}
              onChange={(event) =>
                setMaterial({
                  ...material,
                  pricePerHourOperator: parseFloat(event.target.value),
                })
              }
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => setActiveTab("materiales")}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            Guardar
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div>
          <div className="admin-sidebar-header">
            <h2>STIC Admin</h2>
            <p>{user?.email}</p>
          </div>

          <nav className="admin-nav">
            <button
              className={`admin-nav-item ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
            >
              <FaTachometerAlt /> Dashboard
            </button>
            <button
              className={`admin-nav-item ${activeTab === "productos" ? "active" : ""}`}
              onClick={() => setActiveTab("productos")}
            >
              <FaBoxes /> Productos
            </button>
            <button
              className={`admin-nav-item ${activeTab === "materiales" ? "active" : ""}`}
              onClick={() => setActiveTab("materiales")}
            >
              <FaCogs /> Materiales
            </button>
          </nav>
        </div>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={logout}>
            <FaSignOutAlt /> Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="admin-content">
        {activeTab === "dashboard" && (
          <div className="admin-dashboard">
            <div className="admin-page-header">
              <div>
                <p className="admin-kicker">Resumen operativo</p>
                <h1>Dashboard</h1>
              </div>
            </div>

            <div className="admin-stats">
              <div className="admin-stat-card">
                <span><FaBoxes /></span>
                <h3>Productos</h3>
                <p className="stat-number">{products.length}</p>
              </div>
              <div className="admin-stat-card">
                <span><FaCogs /></span>
                <h3>Materiales</h3>
                <p className="stat-number">{materials.length}</p>
              </div>
              <div className="admin-stat-card">
                <span><FaFileInvoiceDollar /></span>
                <h3>Cotizaciones</h3>
                <p className="stat-number">{quotationTotal}</p>
              </div>
            </div>

            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-kicker">Cotizaciones por categoria</p>
                  <h2>Demanda registrada</h2>
                </div>
              </div>

              <div className="quote-category-grid">
                {categories.map((category) => (
                  <div key={category.id} className="quote-category-card">
                    <h3>{category.label}</h3>
                    <strong>{quoteCountByCategory[category.id]}</strong>
                    <span>cotizaciones</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="admin-panel">
              <div className="admin-panel-header">
                <div>
                  <p className="admin-kicker">Mas populares</p>
                  <h2>Patrones destacados</h2>
                </div>

                <div className="admin-filter-row compact">
                  <select
                    value={trendCategory}
                    onChange={(event) =>
                      setTrendCategory(parseInt(event.target.value) as CategoryId)
                    }
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={trendMode}
                    onChange={(event) => setTrendMode(event.target.value)}
                  >
                    {renderTrendModeOptions()}
                  </select>
                </div>
              </div>

              <div className="trend-list">
                {trendRows.length === 0 ? (
                  <p className="admin-empty">No hay cotizaciones para este filtro.</p>
                ) : (
                  trendRows.map((row, index) => (
                    <div key={row.label} className="trend-row">
                      <div className="trend-rank">{index + 1}</div>
                      <div className="trend-main">
                        <strong>{row.label}</strong>
                        <span>{row.count} cotizaciones</span>
                      </div>
                      <div className="trend-value">{formatCurrency(row.avg)} prom.</div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {activeTab === "productos" && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Catalogo</p>
                <h1>Gestion de productos</h1>
              </div>
              <button
                className="admin-add-btn"
                onClick={() => {
                  setEditingProduct(null);
                  setNewProduct(productTemplate);
                  setActiveTab("nuevo-producto");
                }}
              >
                <FaPlus /> Nuevo producto
              </button>
            </div>

            <div className="category-tabs">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={selectedCategory === category.id ? "active" : ""}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.label}
                  <span>{products.filter((item) => item.categoryId === category.id).length}</span>
                </button>
              ))}
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.id}</td>
                      <td>
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="admin-table-image"
                          />
                        )}
                      </td>
                      <td>{product.name}</td>
                      <td>
                        {categories.find((category) => category.id === product.categoryId)?.label ??
                          product.categoryId}
                      </td>
                      <td>{formatCurrency(product.price)}</td>
                      <td>{product.stock}</td>
                      <td>
                        <button
                          className="admin-edit-btn"
                          onClick={() => {
                            setEditingProduct(product);
                            setActiveTab("editar-producto");
                          }}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="admin-delete-btn"
                          onClick={() => handleDeleteProduct(product.id)}
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="admin-pagination">
              <span>
                Pagina {currentPage} de {totalPages}
              </span>
              <div>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <FaChevronLeft /> Anterior
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(totalPages, page + 1))
                  }
                >
                  Siguiente <FaChevronRight />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "materiales" && (
          <div className="admin-section">
            <div className="admin-section-header">
              <div>
                <p className="admin-kicker">Costos base</p>
                <h1>Gestion de materiales</h1>
              </div>
              <button
                className="admin-add-btn"
                onClick={() => {
                  setEditingMaterial(null);
                  setNewMaterial({});
                  setActiveTab("nuevo-material");
                }}
              >
                <FaPlus /> Nuevo material
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Densidad</th>
                    <th>Precio por kg</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {materials.map((material) => (
                    <tr key={material.id}>
                      <td>{material.id}</td>
                      <td>{material.name}</td>
                      <td>{material.density}</td>
                      <td>{formatCurrency(material.pricePerKg)}</td>
                      <td>
                        <button
                          className="admin-edit-btn"
                          onClick={() => {
                            setEditingMaterial(material);
                            setActiveTab("editar-material");
                          }}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className="admin-delete-btn"
                          onClick={() => handleDeleteMaterial(material.id || 0)}
                          title="Eliminar"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "nuevo-producto" &&
          renderProductForm("Nuevo producto", newProduct, setNewProduct)}

        {activeTab === "editar-producto" &&
          editingProduct &&
          renderProductForm("Editar producto", editingProduct, setEditingProduct)}

        {activeTab === "nuevo-material" &&
          renderMaterialForm("Nuevo material", newMaterial, setNewMaterial)}

        {activeTab === "editar-material" &&
          editingMaterial &&
          renderMaterialForm("Editar material", editingMaterial, setEditingMaterial)}
      </main>
    </div>
  );
}
