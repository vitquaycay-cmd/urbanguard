import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { readFile } from "fs/promises";

export type AiDetection = {
  label: string;
  confidence: number;
};

export type AiAnalyzeResponse = {
  detections?: AiDetection[];
  isRelevant?: boolean;
  reason?: string;
  [key: string]: unknown;
};

@Injectable()
export class AiService {
  private readonly aiBaseUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:5000";

  async analyzeImage(filePath: string, originalName = "report.jpg"): Promise<AiAnalyzeResponse> {
    try {
      const buffer = await readFile(filePath);

      const formData = new FormData();
      const blob = new Blob([buffer]);
      formData.append("file", blob, originalName);

      const res = await fetch(`${this.aiBaseUrl}/analyze`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(`AI /analyze lỗi ${res.status}`);
      }

      return data as AiAnalyzeResponse;
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : "Không gọi được AI service",
      );
    }
  }
}