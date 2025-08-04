'use client';

import { useState } from 'react';
import { HelpCircle, X, BookOpen } from 'lucide-react';

interface GlossaryTerm {
  term: string;
  definition: string;
  example?: string;
}

const glossaryTerms: GlossaryTerm[] = [
  {
    term: "Expenses",
    definition: "Money you spend on goods and services. This includes everything from groceries and rent to entertainment and shopping.",
    example: "Your monthly expenses might include: rent (PKR 25,000), groceries (PKR 8,000), transport (PKR 3,000), etc."
  },
  {
    term: "Income",
    definition: "Money you receive, typically from your job, business, or other sources like investments or gifts.",
    example: "Your monthly income could be your salary (PKR 50,000) plus any side income (PKR 5,000)."
  },
  {
    term: "Savings Rate",
    definition: "The percentage of your income that you don't spend. It shows how much money you're able to save each month.",
    example: "If you earn PKR 50,000 and spend PKR 40,000, your savings rate is 20% (you saved PKR 10,000)."
  },
  {
    term: "Budget",
    definition: "A plan for how much money you want to spend in different categories each month.",
    example: "You might budget PKR 8,000 for food, PKR 3,000 for transport, and PKR 2,000 for entertainment."
  },
  {
    term: "Category",
    definition: "A way to group similar expenses together, like 'Food & Drinks', 'Transport', or 'Shopping'.",
    example: "Restaurant meals, groceries, and coffee all go in the 'Food & Drinks' category."
  },
  {
    term: "Forecast/Prediction",
    definition: "An estimate of how much you might spend in the future, based on your past spending patterns.",
    example: "If you usually spend PKR 45,000 per month, the AI might predict you'll spend PKR 47,000 next month."
  },
  {
    term: "Net Worth",
    definition: "The total value of everything you own (assets) minus everything you owe (debts).",
    example: "If you have PKR 100,000 in savings but owe PKR 30,000, your net worth is PKR 70,000."
  }
];

const FinancialGlossary = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 z-40 bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
        title="Financial Terms Help"
      >
        <HelpCircle size={20} />
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                <BookOpen className="text-blue-500" size={24} />
                <h2 className="text-xl font-bold text-gray-800">Financial Terms Guide</h2>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setSelectedTerm(null);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {!selectedTerm ? (
                <div className="space-y-3">
                  <p className="text-gray-600 mb-4">
                    Click on any term below to learn what it means and see examples:
                  </p>
                  {glossaryTerms.map((term, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTerm(term)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200 hover:border-blue-200"
                    >
                      <span className="font-semibold text-blue-600">{term.term}</span>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {term.definition}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <button
                    onClick={() => setSelectedTerm(null)}
                    className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                  >
                    ← Back to all terms
                  </button>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                      {selectedTerm.term}
                    </h3>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-gray-700 leading-relaxed">
                        {selectedTerm.definition}
                      </p>
                    </div>
                    
                    {selectedTerm.example && (
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-green-800 mb-2">Example:</h4>
                        <p className="text-green-700">
                          {selectedTerm.example}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-500 text-center">
                💡 Understanding these terms will help you make better financial decisions
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FinancialGlossary;