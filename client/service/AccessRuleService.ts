import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import {
    FormAccessRule,
    CreateAccessRulePayload,
    UpdateAccessRulePayload
} from "@/types/form.types";

class AccessRuleService {
    private async getHeaders() {
        const token = await firebaseService.getUserAccessToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async getAllAccessRules(): Promise<FormAccessRule[]> {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.ACCESS_RULES.LIST, { headers });
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    }

    async getAccessRuleById(id: number): Promise<FormAccessRule> {
        const headers = await this.getHeaders();
        const url = API_CONTS.ACCESS_RULES.GET.replace(":id", id.toString());
        const response = await api.get(url, { headers });
        return response.data as FormAccessRule;
    }

    async createAccessRule(data: CreateAccessRulePayload): Promise<FormAccessRule> {
        const headers = await this.getHeaders();
        const response = await api.post(API_CONTS.ACCESS_RULES.CREATE, data, { headers });
        return response.data as FormAccessRule;
    }

    async updateAccessRule(id: number, data: UpdateAccessRulePayload): Promise<FormAccessRule> {
        const headers = await this.getHeaders();
        const url = API_CONTS.ACCESS_RULES.UPDATE.replace(":id", id.toString());
        const { id: _, ...updateData } = data;
        const response = await api.put(url, updateData, { headers });
        return response.data as FormAccessRule;
    }

    async deleteAccessRule(id: number): Promise<void> {
        const headers = await this.getHeaders();
        const url = API_CONTS.ACCESS_RULES.DELETE.replace(":id", id.toString());
        await api.delete(url, { headers });
    }
}

export const accessRuleService = new AccessRuleService();
