import { ResponseSuggestion, ResponseGenerationRequest, CustomerSummary, Message } from '../models/types';
import { v4 as uuidv4 } from 'uuid';

export class ResponseSuggestionService {
  async generateResponseSuggestions(request: ResponseGenerationRequest): Promise<ResponseSuggestion[]> {
    const suggestions: ResponseSuggestion[] = [];
    
    // Analyze customer message to determine message type and context
    const messageAnalysis = this.analyzeCustomerMessage(request.customerMessage);
    const customerContext = this.buildCustomerContext(request.customerSummary, request.conversationHistory);
    
    // Generate multiple response options with different tones
    const tones: Array<'friendly' | 'professional' | 'apologetic' | 'enthusiastic'> = 
      request.preferredTone ? [request.preferredTone] : ['friendly', 'professional'];
    
    for (const tone of tones) {
      const suggestion = await this.generateSingleResponse(
        request.customerMessage,
        messageAnalysis,
        customerContext,
        tone
      );
      suggestions.push(suggestion);
    }
    
    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  private analyzeCustomerMessage(message: string): {
    type: string;
    keywords: string[];
    sentiment: 'positive' | 'neutral' | 'negative';
    urgency: 'low' | 'medium' | 'high';
  } {
    const content = message.toLowerCase();
    
    // Determine message type
    let type = 'inquiry';
    if (content.includes('注文') || content.includes('購入') || content.includes('kg')) {
      type = 'order';
    } else if (content.includes('ありがとう') || content.includes('美味しい')) {
      type = 'feedback';
    } else if (content.includes('問題') || content.includes('不満') || content.includes('クレーム')) {
      type = 'complaint';
    }
    
    // Extract keywords
    const keywords = this.extractKeywords(content);
    
    // Analyze sentiment
    const sentiment = this.analyzeSentiment(content);
    
    // Determine urgency
    let urgency: 'low' | 'medium' | 'high' = 'low';
    if (content.includes('急ぎ') || content.includes('すぐ') || content.includes('至急')) {
      urgency = 'high';
    } else if (content.includes('できれば') || content.includes('お時間のある時')) {
      urgency = 'medium';
    }
    
    return { type, keywords, sentiment, urgency };
  }

  private buildCustomerContext(
    summary?: CustomerSummary,
    history?: Message[]
  ): string {
    let context = '';
    
    if (summary) {
      context += `顧客情報: `;
      if (summary.preferences.length > 0) {
        context += `好み（${summary.preferences.join(', ')}）`;
      }
      if (summary.purchaseHistory.length > 0) {
        context += ` 購入履歴（${summary.purchaseHistory.length}件）`;
      }
      context += ` 感情：${this.translateSentiment(summary.sentiment)}`;
    }
    
    if (history && history.length > 0) {
      const recentMessages = history.slice(-3);
      context += ` 最近のやり取り：${recentMessages.length}件`;
    }
    
    return context;
  }

  private async generateSingleResponse(
    customerMessage: string,
    analysis: any,
    context: string,
    tone: 'friendly' | 'professional' | 'apologetic' | 'enthusiastic'
  ): Promise<ResponseSuggestion> {
    
    // Generate response based on message type and tone
    let baseResponse = '';
    let confidence = 0.8;
    
    switch (analysis.type) {
      case 'order':
        baseResponse = this.generateOrderResponse(customerMessage, tone, analysis);
        confidence = 0.9;
        break;
      case 'feedback':
        baseResponse = this.generateFeedbackResponse(customerMessage, tone, analysis);
        confidence = 0.85;
        break;
      case 'complaint':
        baseResponse = this.generateComplaintResponse(customerMessage, tone, analysis);
        confidence = 0.8;
        break;
      default:
        baseResponse = this.generateGeneralResponse(customerMessage, tone, analysis);
        confidence = 0.7;
    }
    
    // Adjust confidence based on context availability
    if (context) {
      confidence += 0.1;
    }
    
    const reasoning = this.generateReasoning(analysis, tone, context);
    
    return {
      id: uuidv4(),
      content: baseResponse,
      tone,
      confidence: Math.min(confidence, 1.0),
      reasoning
    };
  }

  private generateOrderResponse(
    message: string,
    tone: 'friendly' | 'professional' | 'apologetic' | 'enthusiastic',
    analysis: any
  ): string {
    const toneTemplates = {
      friendly: [
        'ご注文ありがとうございます！{product}ですね。とても美味しく仕上がっておりますよ。',
        '{product}のご注文をいただき、ありがとうございます！心を込めてお送りいたします。'
      ],
      professional: [
        'ご注文を承りました。{product}について、詳細をご確認させていただきます。',
        '{product}のご注文ありがとうございます。お客様のご要望に沿って準備いたします。'
      ],
      enthusiastic: [
        'わぁ！{product}のご注文ありがとうございます！今年は特に美味しく育ちました！',
        '{product}のご注文、本当にありがとうございます！自信をもってお届けします！'
      ],
      apologetic: [
        'ご注文いただき恐縮です。{product}について、最善を尽くして対応いたします。'
      ]
    };
    
    const templates = toneTemplates[tone];
    const template = templates[Math.floor(Math.random() * templates.length)];
    
    // Extract product name from message
    let product = 'みかん';
    if (message.includes('青島')) product = '青島みかん';
    if (message.includes('温州')) product = '温州みかん';
    
    return template.replace('{product}', product);
  }

  private generateFeedbackResponse(
    message: string,
    tone: 'friendly' | 'professional' | 'apologetic' | 'enthusiastic',
    analysis: any
  ): string {
    if (analysis.sentiment === 'positive') {
      const toneTemplates = {
        friendly: [
          'お褒めの言葉をいただき、本当に嬉しいです！また美味しいみかんをお届けしますね。',
          'ありがとうございます！お客様に喜んでいただけて、農家冥利に尽きます。'
        ],
        professional: [
          'ご満足いただけましたこと、大変嬉しく思います。今後ともよろしくお願いいたします。',
          'お気に入りいただき、誠にありがとうございます。品質向上に努めてまいります。'
        ],
        enthusiastic: [
          'わぁ！そんなに喜んでいただけて、本当に嬉しいです！次回も期待してくださいね！',
          'ありがとうございます！お客様の笑顔が私たちの一番の喜びです！'
        ],
        apologetic: [
          'お気に入りいただき、恐縮です。これからも精進いたします。'
        ]
      };
      
      const templates = toneTemplates[tone];
      return templates[Math.floor(Math.random() * templates.length)];
    }
    
    return 'ご意見をいただき、ありがとうございます。今後の参考にさせていただきます。';
  }

  private generateComplaintResponse(
    message: string,
    tone: 'friendly' | 'professional' | 'apologetic' | 'enthusiastic',
    analysis: any
  ): string {
    const templates = [
      'この度は、ご不便をおかけして大変申し訳ございません。すぐに改善に努めます。',
      '申し訳ございません。ご指摘いただき、今後このようなことがないよう気をつけます。',
      '大変申し訳ございません。お客様のご意見を真摯に受け止め、対応いたします。'
    ];
    
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private generateGeneralResponse(
    message: string,
    tone: 'friendly' | 'professional' | 'apologetic' | 'enthusiastic',
    analysis: any
  ): string {
    const toneTemplates = {
      friendly: [
        'ご連絡ありがとうございます！何かお手伝いできることがあれば、お気軽におっしゃってくださいね。',
        'いつもありがとうございます！どのようなことでしょうか？'
      ],
      professional: [
        'お問い合わせいただき、ありがとうございます。詳細についてご回答いたします。',
        'ご質問をいただき、ありがとうございます。適切に対応させていただきます。'
      ],
      enthusiastic: [
        'ご連絡ありがとうございます！喜んでお答えします！',
        'いつもありがとうございます！何でもお気軽にお聞かせください！'
      ],
      apologetic: [
        'ご連絡いただき、恐縮です。可能な限り対応いたします。'
      ]
    };
    
    const templates = toneTemplates[tone];
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private extractKeywords(content: string): string[] {
    const keywords: string[] = [];
    const keywordPatterns = [
      'みかん', '青島', '温州', '注文', '購入', 'kg', '梱包', 
      '美味しい', 'ありがとう', '問題', '不満'
    ];
    
    for (const pattern of keywordPatterns) {
      if (content.includes(pattern)) {
        keywords.push(pattern);
      }
    }
    
    return keywords;
  }

  private analyzeSentiment(content: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['美味しい', 'ありがとう', '楽しみ', '良い', '最高'];
    const negativeWords = ['問題', '不満', 'クレーム', '悪い', '残念'];
    
    let positiveScore = 0;
    let negativeScore = 0;
    
    for (const word of positiveWords) {
      if (content.includes(word)) positiveScore++;
    }
    
    for (const word of negativeWords) {
      if (content.includes(word)) negativeScore++;
    }
    
    if (positiveScore > negativeScore) return 'positive';
    if (negativeScore > positiveScore) return 'negative';
    return 'neutral';
  }

  private translateSentiment(sentiment: 'positive' | 'neutral' | 'negative'): string {
    const translations = {
      positive: 'ポジティブ',
      neutral: 'ニュートラル',
      negative: 'ネガティブ'
    };
    return translations[sentiment];
  }

  private generateReasoning(analysis: any, tone: string, context: string): string {
    let reasoning = `メッセージタイプ「${analysis.type}」、感情「${this.translateSentiment(analysis.sentiment)}」`;
    reasoning += `に基づき、「${tone}」なトーンで回答を生成。`;
    
    if (context) {
      reasoning += ` 顧客コンテキストを考慮。`;
    }
    
    if (analysis.urgency === 'high') {
      reasoning += ` 緊急性が高いため、迅速な対応を意識。`;
    }
    
    return reasoning;
  }
}