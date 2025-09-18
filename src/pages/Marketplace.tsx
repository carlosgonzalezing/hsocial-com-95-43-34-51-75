import { FullScreenPageLayout } from "@/components/layout/FullScreenPageLayout";
import { MarketplaceFeed } from "@/components/marketplace/MarketplaceFeed";
import { Store, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Marketplace() {
  return (
    <FullScreenPageLayout title="Marketplace">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Marketplace</h1>
              <p className="text-muted-foreground">
                Compra y vende productos entre estudiantes
              </p>
            </div>
          </div>
          <Button className="gap-2">
            <Package className="h-4 w-4" />
            Vender Producto
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Productos Populares</h3>
              <p className="text-sm text-muted-foreground">Más vendidos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Categorías</h3>
              <p className="text-sm text-muted-foreground">Libros, Tech, Ropa</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Store className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Vendedores</h3>
              <p className="text-sm text-muted-foreground">Estudiantes verificados</p>
            </CardContent>
          </Card>
        </div>

        <MarketplaceFeed />
      </div>
    </FullScreenPageLayout>
  );
}