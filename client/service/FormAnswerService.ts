import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { FormAnswer, CreateFormAnswerPayload, UpdateFormAnswerPayload } from "@/types/form.types";
import { firebaseService } from "@/lib/firebaseService";

class FormAnswerService {
    private async getHeaders() {
        const token = await firebaseService.getUserAccessToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async getAllFormAnswers(): Promise<FormAnswer[]> {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.FORM_ANSWERS.LIST, { headers });
        // Handle paginated responses from Django REST Framework
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    }

    async getFormAnswerById(id: number): Promise<FormAnswer> {
        const headers = await this.getHeaders();
        const url = API_CONTS.FORM_ANSWERS.GET.replace(":id", id.toString());
        const response = await api.get(url, { headers });
        return response.data;
    }

    async createFormAnswer(data: CreateFormAnswerPayload): Promise<FormAnswer> {
        const headers = await this.getHeaders();
        const response = await api.post(API_CONTS.FORM_ANSWERS.CREATE, data, { headers });
        return response.data;
    }

    async updateFormAnswer(id: number, data: Partial<UpdateFormAnswerPayload>): Promise<FormAnswer> {
        const headers = await this.getHeaders();
        const url = API_CONTS.FORM_ANSWERS.UPDATE.replace(":id", id.toString());
        const response = await api.put(url, data, { headers });
        return response.data;
    }

    async deleteFormAnswer(id: number): Promise<void> {
        const headers = await this.getHeaders();
        const url = API_CONTS.FORM_ANSWERS.DELETE.replace(":id", id.toString());
        await api.delete(url, { headers });
    }
}

export const formAnswerService = new FormAnswerService();
export default formAnswerService;
