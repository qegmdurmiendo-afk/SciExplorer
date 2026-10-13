import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
}

export interface StudentCurriculumContext {
  gradeLevel?: number;
  strand?: string;
  subject?: string;
  competencyStatement?: string;
  competencyCode?: string;
  sourceTitle?: string;
  sourceUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  async sendMessage(userMessage: string, topicName?: string, curriculumContext?: StudentCurriculumContext): Promise<string> {
    const apiKey = environment.aiApiKey?.trim();
    const isKeyPresent = !!apiKey && !/^replace|your_api|example|demo/i.test(apiKey);
    const proxyUrl = environment.aiProxyUrl?.trim();

    if (!isKeyPresent && !proxyUrl) {
      return this.buildFallbackResponse(
        userMessage,
        topicName,
        'The AI API is not connected yet. Add a valid Groq or OpenRouter key to use real chatbot responses.'
      );
    }

    const provider = (environment.aiProvider ?? 'groq').toLowerCase();
    const baseUrl = provider === 'openrouter'
      ? 'https://openrouter.ai/api/v1'
      : (environment.aiBaseUrl || 'https://api.groq.com/openai/v1');

    const model = environment.aiModel ?? 'openai/gpt-oss-20b';
    const curriculumSummary = curriculumContext
      ? `The learner is in Grade ${curriculumContext.gradeLevel ?? '11-12'} ${curriculumContext.strand ? `(${curriculumContext.strand})` : ''} and is studying ${curriculumContext.subject ?? 'the selected subject'}. The current DepEd-aligned competency is: ${curriculumContext.competencyStatement ?? 'General learning improvement'}. ${curriculumContext.competencyCode ? `Competency code: ${curriculumContext.competencyCode}.` : ''} ${curriculumContext.sourceTitle ? `This lesson is framed using official DepEd curriculum guidance: ${curriculumContext.sourceTitle}${curriculumContext.sourceUrl ? ` (${curriculumContext.sourceUrl})` : ''}.` : ''}`
      : 'The learner is studying a senior high school lesson.';

    const messages = [
      {
        role: 'system',
        content:
          `You are the SciExplore PH AI Learning Coach for Senior High School students. You help Grade 11 and Grade 12 learners improve in Science and Mathematics. Be encouraging, clear, and specific. Use Filipino/English examples when helpful, and always tie advice to the learner's current SHS lesson. ${curriculumSummary}`,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const payload = {
      model,
      messages,
      temperature: 0.7,
      max_tokens: 300,
      ...(proxyUrl ? { provider, apiKey } : {}),
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(proxyUrl || `${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(proxyUrl ? {} : {
            Authorization: `Bearer ${apiKey}`,
            ...(provider === 'openrouter'
              ? {
                  'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4200',
                  'X-Title': 'SciExplore PH',
                }
              : {}),
          }),
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`AI request failed: ${response.status}`);
      }

      const data = await response.json();

      if (proxyUrl) {
        const proxyReply = typeof data?.reply === 'string' ? data.reply.trim() : '';
        if (proxyReply) {
          return proxyReply;
        }
      }

      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === 'string' && content.trim()) {
        return content.trim();
      }
    } catch (error) {
      console.warn('SciExplore AI request failed, using fallback tutor advice.', error);
    }

    return this.buildFallbackResponse(
      userMessage,
      topicName,
      'The AI service is unavailable right now. This usually means an expired or invalid key, a blocked browser request, or provider-side limits. I’m switching to local study coaching until the connection is fixed.'
    );
  }

  private buildFallbackResponse(userMessage: string, topicName?: string, note?: string): string {
    const topicContext = topicName ? `for ${topicName}` : 'for your current lesson';
    const cleanedMessage = (userMessage || '').trim();

    if (!cleanedMessage) {
      return `${note ? `${note} ` : ''}I can help you study ${topicContext}. Ask me what concept is hard, and I’ll tell you the easiest way to improve.`;
    }

    const lowerMessage = cleanedMessage.toLowerCase();

    if (lowerMessage.includes('genetics') || lowerMessage.includes('inherit')) {
      return `${note ? `${note} ` : ''}For Genetics, start by reviewing DNA, genes, and inherited traits. Then rework one example question at a time and explain the answer in your own words before moving on.`;
    }

    if (lowerMessage.includes('ecosystem') || lowerMessage.includes('environment')) {
      return `${note ? `${note} ` : ''}For Ecosystems, focus on producers, consumers, and decomposers. Draw a simple food chain and explain how energy moves from the sun to plants to animals.`;
    }

    if (lowerMessage.includes('physics') || lowerMessage.includes('force') || lowerMessage.includes('gravity')) {
      return `${note ? `${note} ` : ''}For Physics, learn the idea behind the formula or rule, then connect it to a real object. Example: gravity pulls objects down, so explain why a ball falls and what force changes its motion.`;
    }

    if (lowerMessage.includes('probabil') || lowerMessage.includes('chance')) {
      return `${note ? `${note} ` : ''}For Probability, list the total outcomes first. Then identify the favorable outcomes and compare them. If you can describe the sample space, the answer becomes much easier.`;
    }

    if (lowerMessage.includes('stat') || lowerMessage.includes('mean') || lowerMessage.includes('average')) {
      return `${note ? `${note} ` : ''}For Statistics, focus on what the data is showing. Find the mean, median, or mode, then explain what it means in plain language instead of only computing the number.`;
    }

    if (lowerMessage.includes('function') || lowerMessage.includes('equation')) {
      return `${note ? `${note} ` : ''}For Functions, remember that each input should give only one output. Try one input, compute the output, and check whether the relationship matches the rule.`;
    }

    return `${note ? `${note} ` : ''}You can improve ${topicContext} by breaking the topic into 3 parts: review the key idea, do one worked example, then explain the answer without looking. Try that approach and ask me a specific question if you get stuck.`;
  }
}
