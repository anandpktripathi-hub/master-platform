import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

const billingService = {
  async getPlans() {
    return axios.get(API_BASE + "/billing/plans");
  },

  async subscribe(planId) {
    return axios.post(API_BASE + "/billing/subscribe", { planId });
  },

  async getInvoices() {
    return axios.get(API_BASE + "/billing/invoices");
  },

  async downloadInvoice(invoiceId) {
    return axios.get(API_BASE + "/billing/invoices/" + invoiceId + "/pdf", {
      responseType: "blob",
    });
  },
};

export default billingService;
