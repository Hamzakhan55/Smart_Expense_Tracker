// Test utility for voice processing
export const testVoiceProcessing = () => {
  const testCases = [
    {
      input: "ordered pizza for 2000 rupees",
      expected: { amount: 2000, category: "Food & Drinks", description: "ordered pizza for 2000 rupees" }
    },
    {
      input: "paid 500 rs for uber ride",
      expected: { amount: 500, category: "Transport", description: "paid 500 rs for uber ride" }
    },
    {
      input: "bought shirt worth 1500 rupees",
      expected: { amount: 1500, category: "Shopping", description: "bought shirt worth 1500 rupees" }
    },
    {
      input: "movie ticket cost 300",
      expected: { amount: 300, category: "Entertainment", description: "movie ticket cost 300" }
    }
  ];

  console.log("Voice Processing Test Results:");
  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}: "${testCase.input}"`);
    console.log(`Expected: Amount=${testCase.expected.amount}, Category=${testCase.expected.category}`);
    console.log("---");
  });
};