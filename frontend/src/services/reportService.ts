import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Expense, Income } from '@/types';

type Transaction = 
  | { type: 'expense'; data: Expense } 
  | { type: 'income'; data: Income };

export const generateTransactionReport = (transactions: Transaction[], timeRange: string) => {
  // 1. Initialize a new PDF document
  const doc = new jsPDF();

  // 2. Set document properties and add a title
  doc.setFontSize(18);
  doc.text(`Transaction Report: ${timeRange}`, 14, 22);
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

  // 3. Define the columns for our table
  const columns = ["Date", "Type", "Category/Source", "Description", "Amount"];

  // 4. Map our transaction data to the format the table needs
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

  // 5. Use the autoTable plugin to draw the table
  autoTable(doc, {
    startY: 40,
    head: [columns],
    body: rows,
    theme: 'striped',
    headStyles: { fillColor: [22, 160, 133] }, // A nice teal color
  });

  // 6. Save the PDF with a dynamic filename
  doc.save(`report-${timeRange.toLowerCase()}-${Date.now()}.pdf`);
};