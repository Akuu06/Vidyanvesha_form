import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { FormSection, CreateSectionPayload } from "@/types/form.types";
import { firebaseService } from "@/lib/firebaseService";

class FormSectionsService {
    private async getHeaders() {
        const token = await firebaseService.getUserAccessToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async getAllFormSections(): Promise<FormSection[]> {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.FORM_SECTIONS.LIST, { headers });
        // Handle paginated responses from Django REST Framework
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    }

    async getFormSectionById(id: number): Promise<FormSection> {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.FORM_SECTIONS.GET.replace(":id", id.toString()), { headers });
        return response.data;
    }

    async createFormSection(data: CreateSectionPayload): Promise<FormSection> {
        const headers = await this.getHeaders();
        const response = await api.post(API_CONTS.FORM_SECTIONS.CREATE, data, { headers });
        return response.data;
    }

    async updateFormSection(id: number, data: Partial<CreateSectionPayload>): Promise<FormSection> {
        const headers = await this.getHeaders();
        const response = await api.put(API_CONTS.FORM_SECTIONS.UPDATE.replace(":id", id.toString()), data, { headers });
        return response.data;
    }

    async deleteFormSection(id: number): Promise<void> {
        const headers = await this.getHeaders();
        await api.delete(API_CONTS.FORM_SECTIONS.DELETE.replace(":id", id.toString()), { headers });
    }
}

export const formSectionsService = new FormSectionsService();
