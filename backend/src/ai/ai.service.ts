import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { stripTrailingSlash } from '../common/url.util';

/** Phản hồi từ FastAPI `POST /ai/analyze`. */
export type AiAnalyzeResponse = {
  detected: boolean;
  confidence: number;
  labels: string[];
  predict?: Record<string, unknown>;
};

function normalizeLabelsFromAi(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .filter((x): x is string => typeof x === 'string')
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof raw === 'string') {
    return raw
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  private baseUrl(): string {
    const raw =
      this.config.get<string>('AI_SERVICE_URL') ?? 'http://127.0.0.1:8000';
    return stripTrailingSlash(raw);
  }

  /**
   * Gọi Python `POST {AI_SERVICE_URL}/ai/analyze` với `{ image_path }` = tên file trong uploads.
   */
  async analyze(imageFilename: string): Promise<AiAnalyzeResponse> {
    const url = `${this.baseUrl()}/ai/analyze`;
    const { data } = await firstValueFrom(
      this.http.post<AiAnalyzeResponse>(
        url,
        { image_path: imageFilename },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 120_000,
        },
      ),
    );
    if (!data || typeof data.detected !== 'boolean') {
      this.logger.warn(`AI analyze: response không hợp lệ từ ${url}`);
      throw new Error('AI_ANALYZE_INVALID_RESPONSE');
    }
    return {
      ...data,
      labels: normalizeLabelsFromAi(data.labels),
    };
  }
}
