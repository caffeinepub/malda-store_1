import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, ShoppingBasket } from "lucide-react";
import { useState } from "react";
import type { Product } from "../backend.d";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const imageUrl = product.image ? product.image.getDirectURL() : null;

  const handleAdd = () => {
    addToCart(product, qty);
    setQty(1);
  };

  return (
    <Card
      className="bg-card border border-border shadow-card rounded-xl overflow-hidden flex flex-col"
      data-ocid={`product.item.${index}`}
    >
      <div className="bg-secondary/50 h-36 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShoppingBasket className="w-14 h-14 text-primary/30" />
        )}
      </div>
      <CardContent className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="font-semibold text-sm leading-snug text-foreground">
            {product.name}
          </h3>
          <p className="text-primary font-bold text-lg mt-0.5">
            ₹{Number(product.price)}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-auto">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="px-2 py-1.5 hover:bg-muted transition-colors"
              aria-label="Decrease quantity"
              data-ocid={`product.minus_button.${index}`}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-1.5 text-sm font-medium min-w-[2rem] text-center">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              className="px-2 py-1.5 hover:bg-muted transition-colors"
              aria-label="Increase quantity"
              data-ocid={`product.plus_button.${index}`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button
            size="sm"
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold"
            onClick={handleAdd}
            data-ocid={`product.add_button.${index}`}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
