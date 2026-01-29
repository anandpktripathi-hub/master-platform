import api from "../lib/api";

export interface PosOrderItemPayload {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface PosOrderPayload {
  items: PosOrderItemPayload[];
  paymentMethod?: string;
  customerName?: string;
}

export interface StockAdjustPayload {
  productId: string;
  quantityDelta: number;
  type: 'sale' | 'purchase' | 'adjustment';
  reason?: string;
  minStock?: number;
}

const posService = {
  async getSummary() {
    return api.get("/pos/summary") as Promise<{ totalSales: number; totalOrders: number; lowStockItems: number }>;
  },

  async getStock() {
    return api.get("/pos/stock");
  },

  async adjustStock(payload: StockAdjustPayload) {
    return api.post("/pos/stock/adjust", payload);
  },

  async getOrders() {
    return api.get("/pos/orders", { params: { limit: 50 } });
  },

  async createOrder(payload: PosOrderPayload) {
    return api.post("/pos/orders", payload);
  },

  async getProducts(page = 1, limit = 100) {
    return api.get("/products", { params: { page, limit } }) as Promise<{ data: any[]; total: number }>;
  },
};

export default posService;
