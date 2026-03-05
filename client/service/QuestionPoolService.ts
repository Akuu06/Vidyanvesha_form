import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { QuestionPool, CreateQuestionPoolPayload } from "@/types/form.types";
import { firebaseService } from "@/lib/firebaseService";

class QuestionPoolService {
    private async getHeaders() {
        const token = await firebaseService.getUserAccessToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async getAllQuestionPools(): Promise<QuestionPool[]> {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.QUESTION_POOLS.LIST, { headers });
        // Handle paginated responses from Django REST Framework
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    }

    async getQuestionPoolById(id: number): Promise<QuestionPool> {
        const headers = await this.getHeaders();
        const url = API_CONTS.QUESTION_POOLS.GET.replace(":id", id.toString());
        const response = await api.get(url, { headers });
        return response.data;
    }

    async createQuestionPool(data: CreateQuestionPoolPayload): Promise<QuestionPool> {
        const headers = await this.getHeaders();
        const response = await api.post(API_CONTS.QUESTION_POOLS.CREATE, data, { headers });
        return response.data;
    }

    async updateQuestionPool(id: number, data: Partial<CreateQuestionPoolPayload>): Promise<QuestionPool> {
        const headers = await this.getHeaders();
        const url = API_CONTS.QUESTION_POOLS.UPDATE.replace(":id", id.toString());
        const response = await api.put(url, data, { headers });
        return response.data;
    }

    async deleteQuestionPool(id: number): Promise<void> {
        const headers = await this.getHeaders();
        const url = API_CONTS.QUESTION_POOLS.DELETE.replace(":id", id.toString());
        await api.delete(url, { headers });
    }
}

export const questionPoolService = new QuestionPoolService();
