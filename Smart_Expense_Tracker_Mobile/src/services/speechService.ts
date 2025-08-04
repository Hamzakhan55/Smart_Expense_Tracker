import * as Speech from 'expo-speech';

// Simple client-side speech processing fallback
export const processAudioLocally = async (audioUri: string): Promise<string> => {
  // Since we can't do actual speech-to-text without a backend service,
  // we'll return a placeholder that indicates the audio was captured
  // In a real implementation, you would use:
  // - Google Speech-to-Text API
  // - Azure Speech Services
  // - AWS Transcribe
  // - Or similar cloud services
  
  console.log('Audio captured at:', audioUri);
  return 'Audio recorded - transcription requires backend service';
};

// Enhanced voice processing with better parsing
export const parseVoiceText = (text: string): { description: string; category: string; amount: number } => {
  const lowerText = text.toLowerCase();
  
  // Extract amount using multiple patterns
  let amount = 0;
  const amountPatterns = [
    /(?:for|cost|paid|spent|worth)\\s*(?:rs\\.?|rupees?)\\s*(\\d+(?:\\.\\d+)?)/i,
    /(?:rs\\.?|rupees?)\\s*(\\d+(?:\\.\\d+)?)/i,
    /(\\d+(?:\\.\\d+)?)\\s*(?:rs\\.?|rupees?)/i,
    /(\\d+(?:\\.\\d+)?)\\s*(?:dollars?|usd|\\$)/i,
    /\\$\\s*(\\d+(?:\\.\\d+)?)/i,
    /(\\d+(?:\\.\\d+)?)(?=\\s|$)/g // fallback: any number
  ];
  
  for (const pattern of amountPatterns) {
    const match = lowerText.match(pattern);
    if (match && match[1]) {
      amount = parseFloat(match[1]);
      if (amount > 0) break;
    }
  }
  
  // Category prediction based on keywords
  const categoryMap = {
    'Food & Drinks': ['pizza', 'food', 'restaurant', 'meal', 'lunch', 'dinner', 'breakfast', 'coffee', 'drink', 'burger', 'sandwich', 'snack'],
    'Transport': ['uber', 'taxi', 'bus', 'train', 'metro', 'fuel', 'petrol', 'gas', 'parking', 'transport'],
    'Shopping': ['shopping', 'clothes', 'shirt', 'shoes', 'bag', 'bags', 'purchase', 'buy', 'bought', 'store', 'mall'],
    'Entertainment': ['movie', 'cinema', 'game', 'concert', 'show', 'entertainment', 'fun', 'party'],
    'Bills & Fees': ['bill', 'electricity', 'water', 'internet', 'phone', 'rent', 'fee', 'subscription'],
    'Healthcare': ['doctor', 'medicine', 'hospital', 'pharmacy', 'health', 'medical', 'clinic'],
    'Education': ['book', 'course', 'class', 'school', 'college', 'education', 'tuition', 'study']
  };
  
  let category = 'Other';
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    if (keywords.some(keyword => lowerText.includes(keyword))) {
      category = cat;
      break;
    }
  }
  
  // Clean up description
  let description = text.trim();
  if (description.length > 100) {
    description = description.substring(0, 100) + '...';
  }
  
  return { description, category, amount };
};