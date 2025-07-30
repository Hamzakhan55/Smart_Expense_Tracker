'use client';

interface ScoreCardProps { 
  title: string; 
  score: number; 
}

const ScoreCard = ({ title, score }: ScoreCardProps) => (
  <div className="text-center">
    <p className="text-4xl font-bold text-blue-600">{score}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{title}</p>
  </div>
);

export const FinancialHealthScore = ({ income, expenses }: { income: number; expenses: number; }) => {
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const overallScore = Math.min(Math.max(Math.round(savingsRate * 2), 0), 100);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Financial Health Score</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <ScoreCard title="Overall Score" score={overallScore} />
        <ScoreCard title="Savings Rate" score={Math.round(savingsRate)} />
        <ScoreCard title="Budget Adherence" score={78} />
      </div>
    </div>
  );
};