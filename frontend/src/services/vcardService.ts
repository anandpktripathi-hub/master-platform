import api from "../lib/api";

export interface VcardPayload {
  displayName: string;
  jobTitle?: string;
  companyName?: string;
  primaryEmail?: string;
  primaryPhone?: string;
  emails?: string[];
  phones?: string[];
  websiteUrl?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  socialLinks?: { label: string; url: string }[];
  qrCodeData?: string;
}

const vcardService = {
  async list() {
    return api.get("/vcards");
  },

  async create(payload: VcardPayload) {
    return api.post("/vcards", payload);
  },

  async update(id: string, payload: Partial<VcardPayload>) {
    return api.put("/vcards/" + id, payload);
  },

  async remove(id: string) {
    return api.delete("/vcards/" + id);
  },

  async getPublic(id: string) {
    return api.get("/public/vcards/" + id);
  },
};

export default vcardService;
