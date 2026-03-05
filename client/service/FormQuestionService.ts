import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { FormQuestion, CreateFormQuestionPayload, UpdateFormQuestionPayload } from "@/types/form.types";
import { firebaseService } from "@/lib/firebaseService";
import axios from "axios";

class FormQuestionService {
    private async getHeaders() {
        const token = await firebaseService.getUserAccessToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async getAllFormQuestions(): Promise<FormQuestion[]> {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.FORM_QUESTIONS.LIST, { headers });
        // Handle paginated responses from Django REST Framework
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    }

    async getFormQuestionById(id: number): Promise<FormQuestion> {
        const headers = await this.getHeaders();
        const url = API_CONTS.FORM_QUESTIONS.GET.replace(":id", id.toString());
        const response = await api.get(url, { headers });
        return response.data;
    }

    async createFormQuestion(data: CreateFormQuestionPayload): Promise<FormQuestion> {
        const headers = await this.getHeaders();
        const response = await api.post(API_CONTS.FORM_QUESTIONS.CREATE, data, { headers });
        return response.data;
    }

    async updateFormQuestion(id: number, data: Partial<UpdateFormQuestionPayload>): Promise<FormQuestion> {
        const headers = await this.getHeaders();
        const url = API_CONTS.FORM_QUESTIONS.UPDATE.replace(":id", id.toString());
        const response = await api.put(url, data, { headers });
        return response.data;
    }

    async deleteFormQuestion(id: number): Promise<void> {
        const headers = await this.getHeaders();
        const url = API_CONTS.FORM_QUESTIONS.DELETE.replace(":id", id.toString());
        await api.delete(url, { headers });
    }

    /**
     * Fetch questions from the external Question Bank microservice
     */
    async fetchExternalQuestions(): Promise<any[]> {
        const token = await firebaseService.getUserAccessToken();
        const externalApiUrl = "http://34.234.69.85:8001/api/questions/";
        try {
            const response = await axios.get(externalApiUrl, { headers: { Authorization: `Bearer ${token}` } });
            // Assuming the external API might also be paginated
            if (response.data && response.data.results && Array.isArray(response.data.results)) {
                return response.data.results;
            }
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error("Error fetching external questions:", error);
            throw error;
        }
    }
}

export const formQuestionService = new FormQuestionService();
export default formQuestionService;
