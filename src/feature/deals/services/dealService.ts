import { Deal } from "../types/deal";

export interface DealsResponse {
  deals: Deal[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateDealRequest {
  title: string;
  description?: string;
  value: number;
  stage?: string;
  probability?: number;
  expectedCloseDate?: string;
  contactName?: string;
  company?: string;
  assignedTo?: string;
  tags?: string[];
  notes?: string;
  priority?: "low" | "medium" | "high";
}

export interface UpdateDealRequest extends CreateDealRequest {
  _id: string;
}

class DealService {
  private baseUrl = "/api/deals";

  async getDeals(params?: {
    search?: string;
    stage?: string;
    page?: number;
    limit?: number;
  }): Promise<DealsResponse> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append("search", params.search);
    if (params?.stage && params.stage !== "all") searchParams.append("stage", params.stage);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const url = searchParams.toString() 
      ? `${this.baseUrl}?${searchParams.toString()}`
      : this.baseUrl;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deals: ${response.statusText}`);
    }

    return response.json();
  }

  async getDeal(id: string): Promise<{ deal: Deal }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch deal: ${response.statusText}`);
    }

    return response.json();
  }

  async createDeal(deal: CreateDealRequest): Promise<{ deal: Deal }> {
    const response = await fetch(this.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deal),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to create deal: ${response.statusText}`);
    }

    return response.json();
  }

  async updateDeal(id: string, deal: Partial<CreateDealRequest>): Promise<{ deal: Deal }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(deal),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to update deal: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteDeal(id: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || `Failed to delete deal: ${response.statusText}`);
    }

    return response.json();
  }
}

export const dealService = new DealService();
