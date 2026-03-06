import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import {
    ResponseFileUpload,
    CreateFileUploadPayload,
    UpdateFileUploadPayload
} from "@/types/form.types";

class FileUploadService {
    private async getHeaders() {
        const token = await firebaseService.getUserAccessToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async getAllFileUploads(): Promise<ResponseFileUpload[]> {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.FILE_UPLOADS.LIST, { headers });
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    }

    async getFileUploadById(id: number): Promise<ResponseFileUpload> {
        const headers = await this.getHeaders();
        const url = API_CONTS.FILE_UPLOADS.GET.replace(":id", id.toString());
        const response = await api.get(url, { headers });
        return response.data as ResponseFileUpload;
    }

    async createFileUpload(data: CreateFileUploadPayload): Promise<ResponseFileUpload> {
        const headers = await this.getHeaders();
        const response = await api.post(API_CONTS.FILE_UPLOADS.CREATE, data, { headers });
        return response.data as ResponseFileUpload;
    }

    async updateFileUpload(id: number, data: UpdateFileUploadPayload): Promise<ResponseFileUpload> {
        const headers = await this.getHeaders();
        const url = API_CONTS.FILE_UPLOADS.UPDATE.replace(":id", id.toString());
        const { id: _, ...updateData } = data;
        const response = await api.put(url, updateData, { headers });
        return response.data as ResponseFileUpload;
    }

    async deleteFileUpload(id: number): Promise<void> {
        const headers = await this.getHeaders();
        const url = API_CONTS.FILE_UPLOADS.DELETE.replace(":id", id.toString());
        await api.delete(url, { headers });
    }
}

export const fileUploadService = new FileUploadService();
