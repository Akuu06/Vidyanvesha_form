import api from "@/config/axios";
import { API_CONTS } from "@/lib/api";
import { firebaseService } from "@/lib/firebaseService";
import {
    QuestionSnapshot,
    CreateQuestionSnapshotPayload,
    UpdateQuestionSnapshotPayload
} from "@/types/form.types";

class QuestionSnapshotService {
    private async getHeaders() {
        const token = await firebaseService.getUserAccessToken();
        return {
            Authorization: `Bearer ${token}`,
        };
    }

    async getAllQuestionSnapshots(): Promise<QuestionSnapshot[]> {
        const headers = await this.getHeaders();
        const response = await api.get(API_CONTS.QUESTION_SNAPSHOTS.LIST, { headers });
        if (response.data && response.data.results && Array.isArray(response.data.results)) {
            return response.data.results;
        }
        return Array.isArray(response.data) ? response.data : [];
    }

    async getQuestionSnapshotById(id: number): Promise<QuestionSnapshot> {
        const headers = await this.getHeaders();
        const url = API_CONTS.QUESTION_SNAPSHOTS.GET.replace(":id", id.toString());
        const response = await api.get(url, { headers });
        return response.data as QuestionSnapshot;
    }

    async createQuestionSnapshot(data: CreateQuestionSnapshotPayload): Promise<QuestionSnapshot> {
        const headers = await this.getHeaders();
        const response = await api.post(API_CONTS.QUESTION_SNAPSHOTS.CREATE, data, { headers });
        return response.data as QuestionSnapshot;
    }

    async updateQuestionSnapshot(id: number, data: UpdateQuestionSnapshotPayload): Promise<QuestionSnapshot> {
        const headers = await this.getHeaders();
        const url = API_CONTS.QUESTION_SNAPSHOTS.UPDATE.replace(":id", id.toString());
        const { id: _, ...updateData } = data;
        const response = await api.put(url, updateData, { headers });
        return response.data as QuestionSnapshot;
    }

    async deleteQuestionSnapshot(id: number): Promise<void> {
        const headers = await this.getHeaders();
        const url = API_CONTS.QUESTION_SNAPSHOTS.DELETE.replace(":id", id.toString());
        await api.delete(url, { headers });
    }
}

export const questionSnapshotService = new QuestionSnapshotService();
