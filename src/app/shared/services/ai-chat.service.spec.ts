import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { environment } from '../../../environments/environment';
import { AiChatService } from './ai-chat.service';

describe('AiChatService', () => {
  let service: AiChatService;
  const originalApiKey = environment.aiApiKey;
  const originalProxyUrl = environment.aiProxyUrl;

  beforeEach(() => {
    service = new AiChatService();
    environment.aiApiKey = '';
    environment.aiProxyUrl = '';
  });

  afterEach(() => {
    environment.aiApiKey = originalApiKey;
    environment.aiProxyUrl = originalProxyUrl;
    vi.restoreAllMocks();
  });

  it('returns a helpful fallback when no API key is configured', async () => {
    const response = await service.sendMessage('I missed a genetics quiz question about inheritance.', 'Genetics');

    expect(response.toLowerCase()).toContain('genetics') || response.toLowerCase().includes('study');
  });
});
