'use client';

import { useState } from 'react';
import ResponseSuggestionManager from '@/components/ResponseSuggestionManager';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-100 to-green-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🍊 Mikan-Assist AI
          </h1>
          <p className="text-lg text-gray-600">
            農家向け AI 返信文提案システム
          </p>
          <div className="mt-4 px-6 py-2 bg-orange-200 rounded-full inline-block">
            <span className="text-orange-800 font-semibold">
              「ファンとの絆を、もっと強く、もっと楽に。」
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <ResponseSuggestionManager />
        </div>

        {/* Footer */}
        <footer className="text-center mt-12 text-gray-500">
          <p>Built with ❤️ for farmers who care about their customers</p>
        </footer>
      </div>
    </main>
  );
}