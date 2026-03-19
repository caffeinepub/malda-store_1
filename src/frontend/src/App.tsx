import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useState } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { CartProvider } from "./context/CartContext";
import AdminPage from "./pages/AdminPage";
import ShopPage from "./pages/ShopPage";

const queryClient = new QueryClient();

function ShopRoute() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <>
      <Header onCartClick={() => setCartOpen(true)} />
      <ShopPage cartOpen={cartOpen} setCartOpen={setCartOpen} />
      <Footer />
    </>
  );
}

function AdminRoute() {
  return (
    <>
      <Header />
      <AdminPage />
      <Footer />
    </>
  );
}

const rootRoute = createRootRoute();

const shopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: ShopRoute,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminRoute,
});

const routeTree = rootRoute.addChildren([shopRoute, adminRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} />
        <Toaster richColors />
      </CartProvider>
    </QueryClientProvider>
  );
}
