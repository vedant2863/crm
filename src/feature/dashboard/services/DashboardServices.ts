// fetch("/api/dashboard/kpis").then((r) => r.json()),
//         fetch("/api/dashboard/pipeline").then((r) => r.json()),
//         fetch("/api/dashboard/recent-activities").then((r) => r.json()),
//         fetch("/api/dashboard/tasks-stats").then((r) => r.json()),


class DashboardService {
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
}
