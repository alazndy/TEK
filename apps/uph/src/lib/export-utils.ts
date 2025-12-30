/**
 * Export Utilities for UPH
 * PDF, Excel, and CSV export functions
 */

import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Extend jsPDF type for autotable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
  }
}

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
  orientation?: 'portrait' | 'landscape';
}

// === PDF Export ===

export function exportToPDF(options: ExportOptions): void {
  const { title, subtitle, filename, columns, data, orientation = 'portrait' } = options;
  
  const doc = new jsPDF({ orientation });
  
  // Title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(subtitle, 14, 30);
  }
  
  // Date
  doc.setFontSize(9);
  doc.text(`Oluşturulma: ${new Date().toLocaleDateString('tr-TR')}`, 14, subtitle ? 38 : 30);
  
  // Table
  const tableColumns = columns.map(col => col.header);
  const tableRows = data.map(row => 
    columns.map(col => String(row[col.key] ?? ''))
  );
  
  doc.autoTable({
    head: [tableColumns],
    body: tableRows,
    startY: subtitle ? 45 : 38,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [59, 130, 246] }, // Blue
  });
  
  doc.save(`${filename}.pdf`);
}

// === Excel Export ===

export function exportToExcel(options: ExportOptions): void {
  const { title, filename, columns, data } = options;
  
  // Prepare data
  const worksheetData = [
    [title],
    [],
    columns.map(col => col.header),
    ...data.map(row => columns.map(col => row[col.key]))
  ];
  
  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  
  // Set column widths
  worksheet['!cols'] = columns.map(col => ({ wch: col.width || 15 }));
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
  
  // Save
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

// === CSV Export ===

export function exportToCSV(options: ExportOptions): void {
  const { filename, columns, data } = options;
  
  // Header row
  const header = columns.map(col => `"${col.header}"`).join(',');
  
  // Data rows
  const rows = data.map(row => 
    columns.map(col => {
      const value = row[col.key];
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return String(value ?? '');
    }).join(',')
  );
  
  // Combine
  const csv = [header, ...rows].join('\n');
  
  // Download
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// === Report Templates ===

export interface ProjectReportData {
  project: {
    name: string;
    status: string;
    startDate: string;
    deadline: string;
    budget: number;
    spent: number;
    completionPercentage: number;
  };
  tasks: { name: string; status: string; assignee: string; dueDate: string }[];
  risks: { id: string; description: string; impact: string; probability: string }[];
}

export function exportProjectReport(data: ProjectReportData): void {
  const doc = new jsPDF();
  const { project, tasks, risks } = data;
  
  // Header
  doc.setFontSize(20);
  doc.text('Proje Raporu', 14, 22);
  
  doc.setFontSize(14);
  doc.text(project.name, 14, 32);
  
  // Project info
  doc.setFontSize(10);
  doc.text(`Durum: ${project.status}`, 14, 42);
  doc.text(`Başlangıç: ${project.startDate}`, 14, 48);
  doc.text(`Bitiş: ${project.deadline}`, 14, 54);
  doc.text(`Bütçe: ${project.budget.toLocaleString('tr-TR')} TRY`, 14, 60);
  doc.text(`Harcanan: ${project.spent.toLocaleString('tr-TR')} TRY`, 14, 66);
  doc.text(`Tamamlanma: %${project.completionPercentage}`, 14, 72);
  
  // Tasks table
  if (tasks.length > 0) {
    doc.setFontSize(12);
    doc.text('Görevler', 14, 85);
    
    doc.autoTable({
      head: [['Görev', 'Durum', 'Sorumlu', 'Bitiş']],
      body: tasks.map(t => [t.name, t.status, t.assignee, t.dueDate]),
      startY: 90,
      styles: { fontSize: 9 },
    });
  }
  
  // Risks table
  if (risks.length > 0) {
    const startY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 90;
    
    doc.setFontSize(12);
    doc.text('Riskler', 14, startY + 15);
    
    doc.autoTable({
      head: [['ID', 'Açıklama', 'Etki', 'Olasılık']],
      body: risks.map(r => [r.id, r.description, r.impact, r.probability]),
      startY: startY + 20,
      styles: { fontSize: 9 },
    });
  }
  
  doc.save(`${project.name.replace(/\s+/g, '_')}_rapor.pdf`);
}
