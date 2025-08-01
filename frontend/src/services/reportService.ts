import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Expense, Income } from '@/types';

type Transaction = 
  | { type: 'expense'; data: Expense } 
  | { type: 'income'; data: Income };

// Utility functions
const getCurrencySymbol = (currency: string): string => {
  const symbols: { [key: string]: string } = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'PKR': '₨',
    'INR': '₹',
    'CAD': 'C$',
    'AUD': 'A$',
    'CNY': '¥',
    'KRW': '₩'
  };
  return symbols[currency] || currency;
};

const formatCurrency = (amount: number, currency: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    // Fallback if currency is not supported
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toFixed(2)}`;
  }
};

export const generateTransactionReport = (transactions: Transaction[], timeRange: string, currency: string = 'USD') => {
  const doc = new jsPDF();
  
  // App colors
  const primaryBlue = [59, 130, 246]; // Blue-500
  const darkBlue = [30, 64, 175]; // Blue-800
  const lightGray = [248, 250, 252]; // Slate-50
  const darkGray = [71, 85, 105]; // Slate-600
  const greenColor = [16, 185, 129]; // Emerald-500
  const redColor = [239, 68, 68]; // Red-500
  
  // Header background
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, 0, 210, 45, 'F');
  
  // App logo/icon area (circle)
  doc.setFillColor(255, 255, 255);
  doc.circle(25, 22, 8, 'F');
  doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  // Currency symbol for logo
  const currencySymbol = getCurrencySymbol(currency);
  doc.text(currencySymbol, 22, 26);
  
  // App name and tagline
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Smart Expense Tracker', 40, 20);
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Your Personal Finance Management Solution', 40, 28);
  
  // Report title section
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.rect(0, 45, 210, 25, 'F');
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2]);
  doc.text(`Financial Report - ${timeRange}`, 14, 58);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })}`, 14, 65);
  
  // Calculate summary statistics
  const expenses = transactions.filter(t => t.type === 'expense');
  const incomes = transactions.filter(t => t.type === 'income');
  const totalExpenses = expenses.reduce((sum, t) => sum + t.data.amount, 0);
  const totalIncome = incomes.reduce((sum, t) => sum + t.data.amount, 0);
  const netAmount = totalIncome - totalExpenses;
  
  // Summary cards
  const cardY = 80;
  const cardWidth = 60;
  const cardHeight = 25;
  
  // Income card
  doc.setFillColor(greenColor[0], greenColor[1], greenColor[2]);
  doc.roundedRect(14, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL INCOME', 16, cardY + 8);
  doc.setFontSize(14);
  doc.text(`${formatCurrency(totalIncome, currency)}`, 16, cardY + 16);
  doc.setFontSize(8);
  doc.text(`${incomes.length} transactions`, 16, cardY + 21);
  
  // Expense card
  doc.setFillColor(redColor[0], redColor[1], redColor[2]);
  doc.roundedRect(78, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('TOTAL EXPENSES', 80, cardY + 8);
  doc.setFontSize(14);
  doc.text(`${formatCurrency(totalExpenses, currency)}`, 80, cardY + 16);
  doc.setFontSize(8);
  doc.text(`${expenses.length} transactions`, 80, cardY + 21);
  
  // Net amount card
  const netColor = netAmount >= 0 ? greenColor : redColor;
  doc.setFillColor(netColor[0], netColor[1], netColor[2]);
  doc.roundedRect(142, cardY, cardWidth, cardHeight, 3, 3, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('NET AMOUNT', 144, cardY + 8);
  doc.setFontSize(14);
  doc.text(`${formatCurrency(Math.abs(netAmount), currency)}`, 144, cardY + 16);
  doc.setFontSize(8);
  doc.text(netAmount >= 0 ? 'Surplus' : 'Deficit', 144, cardY + 21);
  
  // Transaction table
  const columns = [
    { header: 'Date', dataKey: 'date' },
    { header: 'Type', dataKey: 'type' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Description', dataKey: 'description' },
    { header: 'Amount', dataKey: 'amount' }
  ];

  const rows = transactions.map(t => {
    const isExpense = t.type === 'expense';
    return {
      date: new Date(t.data.date).toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit' 
      }),
      type: isExpense ? 'Expense' : 'Income',
      category: t.data.category,
      description: t.data.description || 'No description',
      amount: `${isExpense ? '-' : '+'}${formatCurrency(t.data.amount, currency)}`
    };
  });

  autoTable(doc, {
    startY: 115,
    columns,
    body: rows,
    theme: 'grid',
    headStyles: { 
      fillColor: [darkBlue[0], darkBlue[1], darkBlue[2]],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 4
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    columnStyles: {
      0: { cellWidth: 25, halign: 'center' }, // Date
      1: { cellWidth: 25, halign: 'center' }, // Type
      2: { cellWidth: 35, halign: 'left' },   // Category
      3: { cellWidth: 70, halign: 'left' },   // Description
      4: { cellWidth: 30, halign: 'right' }   // Amount
    },
    didParseCell: function(data) {
      // Color code the amount column
      if (data.column.index === 4) {
        const cellText = data.cell.text[0];
        if (cellText && cellText.startsWith('-')) {
          data.cell.styles.textColor = [redColor[0], redColor[1], redColor[2]];
          data.cell.styles.fontStyle = 'bold';
        } else if (cellText && cellText.startsWith('+')) {
          data.cell.styles.textColor = [greenColor[0], greenColor[1], greenColor[2]];
          data.cell.styles.fontStyle = 'bold';
        }
      }
      // Color code the type column
      if (data.column.index === 1) {
        const cellText = data.cell.text[0];
        if (cellText === 'Expense') {
          data.cell.styles.textColor = [redColor[0], redColor[1], redColor[2]];
        } else if (cellText === 'Income') {
          data.cell.styles.textColor = [greenColor[0], greenColor[1], greenColor[2]];
        }
      }
    }
  });
  
  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(primaryBlue[0], primaryBlue[1], primaryBlue[2]);
  doc.rect(0, pageHeight - 20, 210, 20, 'F');
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255);
  doc.text('Smart Expense Tracker - Empowering your financial decisions', 14, pageHeight - 12);
  doc.text(`Report generated for ${transactions.length} transactions`, 14, pageHeight - 6);
  
  // Page number
  doc.text('Page 1', 190, pageHeight - 6);
  
  // Save with better filename
  const fileName = `SmartExpenseTracker_${timeRange.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};