export class DashboardService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = "/api/dashboard";
    }

    async getKpis() {
        const response = await fetch(`${this.baseUrl}/kpis`);
        return response.json();
    }

    async getPipelineStats() {
        const response = await fetch(`${this.baseUrl}/pipeline`);
        return response.json();
    }

    async getRecentActivities() {
        const response = await fetch(`${this.baseUrl}/recent-activities`);
        return response.json();
    }

    async getTaskStats() {
        const response = await fetch(`${this.baseUrl}/tasks-stats`);
        return response.json();
    }

    async getAnalytics() {
        const response = await fetch(`${this.baseUrl}/analytics`);
        return response.json();
    }
}

export const dashboardService = new DashboardService();
