import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const billingService = {
  async getPlans() {
    const response = await axios.get(API_BASE + "/billing/plans");
    return response.data;
  },

  async subscribe(payload: any) {
    const response = await axios.post(API_BASE + "/billing/subscribe", payload);
    return response.data;
  },

  async getInvoices() {
    const response = await axios.get(API_BASE + "/billing/invoices");
    return response.data;
  },

  async downloadInvoice(invoiceId: string) {
    return axios.get(API_BASE + "/billing/invoices/" + invoiceId + "/pdf", {
      responseType: "blob",
    });
  },
};

export default billingService;
