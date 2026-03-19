import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import {
  Leaf,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  ShoppingBasket,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import {
  useAddProduct,
  useDeleteProduct,
  useGetProducts,
  useUpdateProduct,
} from "../hooks/useQueries";

const ADMIN_USERNAME = "ADMINMJ";
const ADMIN_PASSWORD = "Admin098";

const CATEGORIES = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Bakery",
  "Beverages",
  "Meat & Seafood",
  "Snacks",
  "Household",
  "Woman",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Fruits & Vegetables": "bg-green-100 text-green-800",
  "Dairy & Eggs": "bg-yellow-100 text-yellow-800",
  Bakery: "bg-orange-100 text-orange-800",
  Beverages: "bg-blue-100 text-blue-800",
  "Meat & Seafood": "bg-red-100 text-red-800",
  Snacks: "bg-purple-100 text-purple-800",
  Household: "bg-gray-100 text-gray-800",
  Woman: "bg-pink-100 text-pink-800",
  Other: "bg-slate-100 text-slate-700",
};

interface ProductFormData {
  name: string;
  price: string;
  category: string;
  imageFile?: File;
}

const EMPTY_FORM: ProductFormData = { name: "", price: "", category: "Other" };

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const { data: products, isLoading: productsLoading } = useGetProducts();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<bigint | null>(null);
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setIsLoggedIn(true);
      setLoginError("");
    } else {
      setLoginError("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setLoginError("");
  };

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-[80vh] flex flex-col items-center justify-center p-6"
        data-ocid="admin.panel"
      >
        <Card className="w-full max-w-sm shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-3">
              <Leaf className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  data-ocid="admin.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  data-ocid="admin.input"
                />
              </div>
              {loginError && (
                <p
                  className="text-sm text-destructive font-medium"
                  data-ocid="admin.error_state"
                >
                  {loginError}
                </p>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={!username || !password}
                data-ocid="admin.submit_button"
              >
                Login
              </Button>
            </form>
            <div className="mt-4 text-center">
              <Link to="/">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  data-ocid="admin.back_button"
                >
                  ← Back to Store
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setAddOpen(true);
  };

  const openEdit = (product: Product) => {
    setForm({
      name: product.name,
      price: String(Number(product.price)),
      category: product.category || "Other",
    });
    setEditProduct(product);
  };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.price) return;
    try {
      await addProduct.mutateAsync({
        name: form.name.trim(),
        price: BigInt(Math.round(Number(form.price))),
        category: form.category,
        imageFile: form.imageFile,
      });
      toast.success("Product added!");
      setAddOpen(false);
    } catch {
      toast.error("Failed to add product");
    }
  };

  const handleEdit = async () => {
    if (!editProduct || !form.name.trim() || !form.price) return;
    try {
      await updateProduct.mutateAsync({
        id: editProduct.id,
        name: form.name.trim(),
        price: BigInt(Math.round(Number(form.price))),
        category: form.category,
        imageFile: form.imageFile,
      });
      toast.success("Product updated!");
      setEditProduct(null);
    } catch {
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProduct.mutateAsync(deleteId);
      toast.success("Product deleted!");
      setDeleteId(null);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <main
      className="max-w-4xl mx-auto px-4 sm:px-6 py-8"
      data-ocid="admin.panel"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Product Management</h1>
          <p className="text-muted-foreground text-sm">
            Add, edit, or remove products from your store.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/">
            <Button variant="outline" size="sm" data-ocid="admin.back_button">
              ← Store
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            data-ocid="admin.secondary_button"
          >
            <LogOut className="w-4 h-4 mr-1" /> Logout
          </Button>
          <Button
            onClick={openAdd}
            size="sm"
            data-ocid="admin.open_modal_button"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Product
          </Button>
        </div>
      </div>

      <Card data-ocid="admin.table">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Products ({products?.length ?? 0})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {productsLoading ? (
            <div className="p-4 space-y-3" data-ocid="admin.loading_state">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !products?.length ? (
            <div
              className="flex flex-col items-center justify-center py-16 text-muted-foreground"
              data-ocid="admin.empty_state"
            >
              <ShoppingBasket className="w-12 h-12 opacity-20 mb-2" />
              <p className="text-sm">
                No products yet. Add your first product!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {products.map((product, idx) => (
                <div
                  key={product.id.toString()}
                  className="flex items-center gap-3 px-4 py-3"
                  data-ocid={`admin.row.${idx + 1}`}
                >
                  <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image.getDirectURL()}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBasket className="w-5 h-5 text-primary/40" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm truncate">
                        {product.name}
                      </p>
                      {product.category && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                            CATEGORY_COLORS[product.category] ??
                            "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {product.category}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      ₹{Number(product.price)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(product)}
                      data-ocid={`admin.edit_button.${idx + 1}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleteId(product.id)}
                      data-ocid={`admin.delete_button.${idx + 1}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Product Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>
          <ProductForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddOpen(false)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdd}
              disabled={
                addProduct.isPending || !form.name.trim() || !form.price
              }
              data-ocid="admin.submit_button"
            >
              {addProduct.isPending ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : null}
              Add Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog
        open={!!editProduct}
        onOpenChange={(o) => !o && setEditProduct(null)}
      >
        <DialogContent data-ocid="admin.dialog">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <ProductForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditProduct(null)}
              data-ocid="admin.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEdit}
              disabled={
                updateProduct.isPending || !form.name.trim() || !form.price
              }
              data-ocid="admin.save_button"
            >
              {updateProduct.isPending ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent data-ocid="admin.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently
              removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="admin.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="admin.confirm_button"
            >
              {deleteProduct.isPending ? (
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}

function ProductForm({
  form,
  setForm,
}: {
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="product-name">Product Name</Label>
        <Input
          id="product-name"
          placeholder="e.g. Water Bottle 1L"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          data-ocid="admin.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="product-price">Price (₹)</Label>
        <Input
          id="product-price"
          type="number"
          min="1"
          placeholder="e.g. 20"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          data-ocid="admin.input"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="product-category">Category</Label>
        <Select
          value={form.category}
          onValueChange={(val) => setForm((f) => ({ ...f, category: val }))}
        >
          <SelectTrigger id="product-category" data-ocid="admin.select">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="product-image">Image (optional)</Label>
        <Input
          id="product-image"
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm((f) => ({ ...f, imageFile: e.target.files?.[0] }))
          }
          data-ocid="admin.upload_button"
        />
      </div>
    </div>
  );
}
