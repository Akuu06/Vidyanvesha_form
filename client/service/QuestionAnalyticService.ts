import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import {
    QuestionAnalytics,
    CreateQuestionAnalyticPayload,
    UpdateQuestionAnalyticPayload
} from "@/types/form.types";

class QuestionAnalyticService {
    private async getHeaders() {
        const token = await firebaseService.getUserAccessToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async getAllQuestionAnalytics() {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.QUESTION_ANALYTICS.LIST, { headers });
        return response.data.results as QuestionAnalytics[];
    }

    async getQuestionAnalyticById(id: number) {
        const headers = await this.getHeaders();
        const url = API_CONTS.QUESTION_ANALYTICS.GET.replace(":id", id.toString());
        const response = await api.get(url, { headers });
        return response.data as QuestionAnalytics;
    }

    async createQuestionAnalytic(data: CreateQuestionAnalyticPayload) {
        const headers = await this.getHeaders();
        const response = await api.post(API_CONTS.QUESTION_ANALYTICS.CREATE, data, { headers });
        return response.data as QuestionAnalytics;
    }

    async updateQuestionAnalytic(id: number, data: UpdateQuestionAnalyticPayload) {
        const headers = await this.getHeaders();
        const url = API_CONTS.QUESTION_ANALYTICS.UPDATE.replace(":id", id.toString());
        // Destructure to avoid sending id in the body if it conflicts with the URL id
        const { id: _, ...updateData } = data;
        const response = await api.put(url, updateData, { headers });
        return response.data as QuestionAnalytics;
    }

    async deleteQuestionAnalytic(id: number) {
        const headers = await this.getHeaders();
        const url = API_CONTS.QUESTION_ANALYTICS.DELETE.replace(":id", id.toString());
        await api.delete(url, { headers });
        return true;
    }
}

export const questionAnalyticService = new QuestionAnalyticService();
