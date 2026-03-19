import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Minus, Plus, Trash2, X } from "lucide-react";
import { useCart } from "../context/CartContext";

const MIN_ORDER = 100;
const DELIVERY_THRESHOLD = 200;
const DELIVERY_CHARGE = 20;

interface CartSidebarProps {
  onClose?: () => void;
  isSheet?: boolean;
}

export default function CartSidebar({ onClose, isSheet }: CartSidebarProps) {
  const { items, updateQty, removeFromCart, subtotal } = useCart();

  const deliveryCharge = subtotal >= DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const total = subtotal + deliveryCharge;
  const belowMinimum = subtotal > 0 && subtotal < MIN_ORDER;
  const canOrder = subtotal >= MIN_ORDER;

  const buildWhatsAppMessage = () => {
    const lines = items.map(
      (i) => `${i.name} x${i.quantity} - ₹${Number(i.price) * i.quantity}`,
    );
    const msg = [
      "Hello! I'd like to place an order from Malda Store:",
      "",
      ...lines,
      "",
      `Subtotal: ₹${subtotal}`,
      `Delivery: ${deliveryCharge === 0 ? "Free" : `₹${deliveryCharge}`}`,
      `Total: ₹${total}`,
      "",
      "Delivery Address: [Please fill your address here]",
    ].join("\n");
    return `https://wa.me/918370960080?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="font-bold text-base text-foreground">Cart Summary</h2>
        {isSheet && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded hover:bg-muted"
            data-ocid="cart.close_button"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div
          className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground p-6"
          data-ocid="cart.empty_state"
        >
          <MessageCircle className="w-10 h-10 opacity-30" />
          <p className="text-sm text-center">
            Your cart is empty. Add some items to get started!
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {items.map((item, idx) => (
              <div
                key={item.productId.toString()}
                className="flex items-center gap-2"
                data-ocid={`cart.item.${idx + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    ₹{Number(item.price)} each
                  </p>
                </div>
                <div className="flex items-center border border-border rounded-md overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => updateQty(item.productId, item.quantity - 1)}
                    className="px-1.5 py-1 hover:bg-muted transition-colors"
                    data-ocid={`cart.minus_button.${idx + 1}`}
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="px-2 text-xs font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    className="px-1.5 py-1 hover:bg-muted transition-colors"
                    data-ocid={`cart.plus_button.${idx + 1}`}
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-sm font-semibold w-14 text-right shrink-0">
                  ₹{Number(item.price) * item.quantity}
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1 text-destructive hover:bg-destructive/10 rounded"
                  data-ocid={`cart.delete_button.${idx + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      {items.length > 0 && (
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery</span>
            <span
              className={
                deliveryCharge === 0 ? "text-primary font-semibold" : ""
              }
            >
              {deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-base">
            <span>Total</span>
            <span>₹{total}</span>
          </div>
          {belowMinimum && (
            <p
              className="text-xs text-destructive bg-destructive/10 rounded p-2"
              data-ocid="cart.error_state"
            >
              Minimum order is ₹{MIN_ORDER}. Add ₹{MIN_ORDER - subtotal} more.
            </p>
          )}
          {subtotal >= DELIVERY_THRESHOLD && (
            <p className="text-xs text-primary bg-primary/10 rounded p-2">
              🎉 You qualify for free delivery!
            </p>
          )}
          <Button
            className="w-full bg-[#25D366] hover:bg-[#20b858] text-white font-semibold gap-2"
            disabled={!canOrder}
            onClick={() => window.open(buildWhatsAppMessage(), "_blank")}
            data-ocid="cart.whatsapp_button"
          >
            <MessageCircle className="w-4 h-4" />
            Order on WhatsApp
          </Button>
        </div>
      )}
    </div>
  );
}
