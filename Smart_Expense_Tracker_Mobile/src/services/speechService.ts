import * as Speech from 'expo-speech';

// Enhanced audio validation and processing
export const validateAudioFile = async (audioUri: string): Promise<boolean> => {
  try {
    const response = await fetch(audioUri);
    const blob = await response.blob();
    
    // Check file size (should be > 1KB for valid audio)
    if (blob.size < 1024) {
      console.warn('Audio file too small:', blob.size, 'bytes');
      return false;
    }
    
    // Check if it's actually audio
    if (!blob.type.startsWith('audio/')) {
      console.warn('Invalid audio type:', blob.type);
      return false;
    }
    
    console.log('Audio validation passed:', blob.size, 'bytes,', blob.type);
    return true;
  } catch (error) {
    console.error('Audio validation failed:', error);
    return false;
  }
};

// Simple client-side speech processing fallback
export const processAudioLocally = async (audioUri: string): Promise<string> => {
  console.log('Audio captured at:', audioUri);
  
  const isValid = await validateAudioFile(audioUri);
  if (!isValid) {
    return 'Invalid audio file - please try recording again';
  }
  
  return 'Audio recorded - transcription requires backend service';
};

// Enhanced voice processing with better parsing
export const parseVoiceText = (text: string): { description: string; category: string; amount: number } => {
  const lowerText = text.toLowerCase();
  
  // Extract amount using multiple patterns with better regex
  let amount = 0;
  const amountPatterns = [
    // Handle comma-separated numbers (e.g., "50,000", "1,234.56")
    /\b\d{1,3}(?:,\d{3})+(?:\.\d+)?\b/g,
    // Context-based patterns
    /(?:for|cost|paid|spent|worth)\s*(?:rs\.?|rupees?|dollars?|\$)?\s*(\d+(?:[,.]\d+)*)/i,
    /(?:rs\.?|rupees?)\s*(\d+(?:[,.]\d+)*)/i,
    /(\d+(?:[,.]\d+)?)\s*(?:rs\.?|rupees?)/i,
    /(\d+(?:[,.]\d+)?)\s*(?:dollars?|usd)/i,
    /\$\s*(\d+(?:[,.]\d+)*)/i,
    // Fallback: any number
    /(\d+(?:[,.]\d+)*)(?=\s|$)/g
  ];
  
  for (const pattern of amountPatterns) {
    const matches = lowerText.match(pattern);
    if (matches) {
      for (const match of matches) {
        // Extract number from match, handling commas
        const numStr = match.replace(/[^\d.,]/g, '').replace(/,/g, '');
        const num = parseFloat(numStr);
        if (num > 0 && num > amount) {
          amount = num;
        }
      }
    }
  }
  
  // Category prediction with expanded keywords
  const categoryMap = {
    'Food & Drinks': ['pizza', 'food', 'restaurant', 'meal', 'lunch', 'dinner', 'breakfast', 'coffee', 'drink', 'burger', 'sandwich', 'snack', 'eat', 'ate', 'hungry', 'cafe', 'tea', 'juice', 'water', 'milk'],
    'Transport': ['uber', 'taxi', 'bus', 'train', 'metro', 'fuel', 'petrol', 'gas', 'parking', 'transport', 'travel', 'ride', 'auto', 'rickshaw', 'flight', 'ticket'],
    'Shopping': ['shopping', 'clothes', 'shirt', 'shoes', 'bag', 'bags', 'purchase', 'buy', 'bought', 'store', 'mall', 'dress', 'pants', 'jacket', 'watch', 'jewelry'],
    'Entertainment': ['movie', 'cinema', 'game', 'concert', 'show', 'entertainment', 'fun', 'party', 'music', 'netflix', 'youtube', 'spotify'],
    'Bills & Fees': ['bill', 'electricity', 'water', 'internet', 'phone', 'rent', 'fee', 'subscription', 'utility', 'wifi', 'mobile', 'recharge'],
    'Healthcare': ['doctor', 'medicine', 'hospital', 'pharmacy', 'health', 'medical', 'clinic', 'checkup', 'treatment', 'pills', 'tablets'],
    'Education': ['book', 'course', 'class', 'school', 'college', 'education', 'tuition', 'study', 'fees', 'notebook', 'pen', 'pencil']
  };
  
  let category = 'Other';
  let maxMatches = 0;
  
  for (const [cat, keywords] of Object.entries(categoryMap)) {
    const matches = keywords.filter(keyword => lowerText.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      category = cat;
    }
  }
  
  // Clean up description
  let description = text.trim();
  if (description.length > 100) {
    description = description.substring(0, 100) + '...';
  }
  
  return { description, category, amount };
};