interface OfferAndShopInRadius {
  product_id: number;

  offer_id: number;
  price: Prisma.Decimal;
  quantity: number;
  searchKeywords: string[];
  created_at: Date;
  updated_at: Date;

  shop_id: number;
  store_name: string;
  owner_name: string;
  address: string;
  email: string;
  phone: string;
  registered_at: Date
  shop_lat: number;
  shop_long: number;
  distance_km: number;
}