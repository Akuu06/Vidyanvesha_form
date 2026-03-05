import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { FormResponse, CreateFormResponsePayload, UpdateFormResponsePayload } from "@/types/form.types";
import { firebaseService } from "@/lib/firebaseService";

class FormResponseService {
    private async getHeaders() {
        const token = await firebaseService.getUserAccessToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async getAllFormResponses(): Promise<FormResponse[]> {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.RESPONSES.LIST, { headers });
        // Handle paginated responses from Django REST Framework
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    }

    async getFormResponseById(id: number): Promise<FormResponse> {
        const headers = await this.getHeaders();
        const url = API_CONTS.RESPONSES.GET.replace(":id", id.toString());
        const response = await api.get(url, { headers });
        return response.data;
    }

    async createFormResponse(data: CreateFormResponsePayload): Promise<FormResponse> {
        const headers = await this.getHeaders();
        const response = await api.post(API_CONTS.RESPONSES.CREATE, data, { headers });
        return response.data;
    }

    async updateFormResponse(id: number, data: Partial<UpdateFormResponsePayload>): Promise<FormResponse> {
        const headers = await this.getHeaders();
        const url = API_CONTS.RESPONSES.UPDATE.replace(":id", id.toString());
        const response = await api.put(url, data, { headers });
        return response.data;
    }

    async deleteFormResponse(id: number): Promise<void> {
        const headers = await this.getHeaders();
        const url = API_CONTS.RESPONSES.DELETE.replace(":id", id.toString());
        await api.delete(url, { headers });
    }
}

export const formResponseService = new FormResponseService();
