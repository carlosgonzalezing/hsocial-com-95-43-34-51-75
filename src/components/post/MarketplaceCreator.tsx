
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface Marketplace {
  type: 'selling' | 'buying' | 'service';
  title: string;
  description: string;
  price?: number;
  location?: string;
  contact_info: string;
}

interface MarketplaceCreatorProps {
  marketplace: Marketplace;
  setMarketplace: (marketplace: Marketplace) => void;
}

export function MarketplaceCreator({ 
  marketplace, 
  setMarketplace 
}: MarketplaceCreatorProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="marketplace-type">Tipo</Label>
        <Select 
          value={marketplace.type} 
          onValueChange={(value: 'selling' | 'buying' | 'service') => 
            setMarketplace({ ...marketplace, type: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona el tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="selling">Vender</SelectItem>
            <SelectItem value="buying">Comprar</SelectItem>
            <SelectItem value="service">Servicio</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="marketplace-title">Título</Label>
        <Input
          id="marketplace-title"
          placeholder="Título del producto/servicio"
          value={marketplace.title}
          onChange={(e) => setMarketplace({ ...marketplace, title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="marketplace-description">Descripción</Label>
        <Textarea
          id="marketplace-description"
          placeholder="Describe tu producto o servicio"
          value={marketplace.description}
          onChange={(e) => setMarketplace({ ...marketplace, description: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="marketplace-price">Precio (opcional)</Label>
        <Input
          id="marketplace-price"
          type="number"
          placeholder="0.00"
          value={marketplace.price || ""}
          onChange={(e) => setMarketplace({ ...marketplace, price: parseFloat(e.target.value) || 0 })}
        />
      </div>

      <div>
        <Label htmlFor="marketplace-location">Ubicación (opcional)</Label>
        <Input
          id="marketplace-location"
          placeholder="Ubicación"
          value={marketplace.location || ""}
          onChange={(e) => setMarketplace({ ...marketplace, location: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="marketplace-contact">Información de contacto</Label>
        <Input
          id="marketplace-contact"
          placeholder="Email, teléfono, etc."
          value={marketplace.contact_info}
          onChange={(e) => setMarketplace({ ...marketplace, contact_info: e.target.value })}
        />
      </div>
    </div>
  );
}
