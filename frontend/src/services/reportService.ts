import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Expense, Income } from '@/types';

type Transaction = 
  | { type: 'expense'; data: Expense } 
  | { type: 'income'; data: Income };

export const generateTransactionReport = (transactions: Transaction[], timeRange: string) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`Transaction Report: ${timeRange}`, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  const columns = ["Date", "Type", "Category/Source", "Description", "Amount"];

  const rows = transactions.map(t => {
    const isExpense = t.type === 'expense';
    return [
      new Date(t.data.date).toLocaleDateString(),
      isExpense ? 'Expense' : 'Income',
      isExpense ? t.data.category : t.data.category,
      t.data.description,
      `${isExpense ? '-' : '+'} ${t.data.amount.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: 40,
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 133] },
  });

  doc.save(`report-${timeRange.toLowerCase()}-${Date.now()}.pdf`);
};