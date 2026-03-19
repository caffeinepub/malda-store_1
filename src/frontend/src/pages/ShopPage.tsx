import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingBasket } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Product } from "../backend.d";
import CartSidebar from "../components/CartSidebar";
import ProductCard from "../components/ProductCard";
import { useGetProducts } from "../hooks/useQueries";

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 1n,
    active: true,
    name: "Water Bottle 1L",
    price: 20n,
    category: "Beverages",
  },
  {
    id: 2n,
    active: true,
    name: "Water Bottle 500ml",
    price: 10n,
    category: "Beverages",
  },
  {
    id: 3n,
    active: true,
    name: "Eggs 12 pcs",
    price: 72n,
    category: "Dairy & Eggs",
  },
  {
    id: 4n,
    active: true,
    name: "Whole Wheat Bread",
    price: 45n,
    category: "Bakery",
  },
  {
    id: 5n,
    active: true,
    name: "Fresh Tomatoes 500g",
    price: 30n,
    category: "Fruits & Vegetables",
  },
  {
    id: 6n,
    active: true,
    name: "Potato Chips",
    price: 20n,
    category: "Snacks",
  },
];

interface ShopPageProps {
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

export default function ShopPage({ cartOpen, setCartOpen }: ShopPageProps) {
  const { data: products, isLoading } = useGetProducts();
  const displayProducts =
    products && products.length > 0 ? products : FALLBACK_PRODUCTS;

  const [selectedCategory, setSelectedCategory] = useState("All");

  // Build unique category list from products that actually exist
  const presentCategories = Array.from(
    new Set(displayProducts.map((p) => p.category).filter(Boolean)),
  ) as string[];

  const filteredProducts =
    selectedCategory === "All"
      ? displayProducts
      : displayProducts.filter((p) => p.category === selectedCategory);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
      <div className="flex gap-6">
        {/* Product Grid */}
        <section className="flex-1 min-w-0">
          <h2 className="text-lg font-bold mb-4 text-foreground">
            Featured Products
          </h2>

          {/* Category filter tabs */}
          {!isLoading && presentCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {["All", ...presentCategories].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                  data-ocid="product.filter.tab"
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-20 text-muted-foreground"
              data-ocid="product.empty_state"
            >
              <ShoppingBasket className="w-16 h-16 opacity-20 mb-3" />
              <p>No products in this category.</p>
            </div>
          ) : (
            <motion.div
              key={selectedCategory}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.07 } },
              }}
            >
              {filteredProducts.map((product, idx) => (
                <motion.div
                  key={product.id.toString()}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.3 },
                    },
                  }}
                >
                  <ProductCard product={product} index={idx + 1} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Desktop Cart Sidebar */}
        <aside className="hidden md:block w-80 shrink-0">
          <div className="bg-card rounded-xl border border-border shadow-card sticky top-24">
            <CartSidebar />
          </div>
        </aside>
      </div>

      {/* Mobile Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent
          side="right"
          className="p-0 w-80 max-w-full flex flex-col"
          data-ocid="cart.sheet"
        >
          <CartSidebar onClose={() => setCartOpen(false)} isSheet />
        </SheetContent>
      </Sheet>
    </main>
  );
}
