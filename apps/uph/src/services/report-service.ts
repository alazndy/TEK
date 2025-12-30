import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Project } from '@/types/project';
import { InventoryItem } from '@/types'; // Update if needed based on actual type location

export const ReportService = {
  generateProjectPDF: (projects: Project[]) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text('Project Status Report', 14, 22);
    doc.setFontSize(11);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

    // Table Data
    const tableData = projects.map(p => [
      p.name,
      p.status,
      p.priority,
      `${p.progress || 0}%`,
      `$${p.spent?.toLocaleString() || 0} / $${p.budget?.toLocaleString() || 0}`
    ]);

    // Table
    autoTable(doc, {
      head: [['Project Name', 'Status', 'Priority', 'Progress', 'Budget (Spent/Total)']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [66, 66, 66] }
    });

    doc.save('project-report.pdf');
  },

  generateProjectExcel: (projects: Project[]) => {
    const data = projects.map(p => ({
      'Project Id': p.id,
      'Name': p.name,
      'Status': p.status,
      'Priority': p.priority,
      'Progress': `${p.progress}%`,
      'Start Date': new Date(p.startDate).toLocaleDateString(),
      'Deadline': p.deadline ? new Date(p.deadline).toLocaleDateString() : '-',
      'Budget': p.budget,
      'Spent': p.spent,
      'Remaining': (p.budget - p.spent)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Projects");
    
    // Auto-width columns roughly
    const max_width = data.reduce((w, r) => Math.max(w, r.Name.length), 10);
    worksheet["!cols"] = [ { wch: 20 }, { wch: max_width }, { wch: 10 }, { wch: 10 }, { wch: 10 } ];

    XLSX.writeFile(workbook, "project-report.xlsx");
  },

  generateInventoryPDF: (items: any[]) => { // Using any[] for flexibility, ideally strong typed
     const doc = new jsPDF();
     
     doc.setFontSize(18);
     doc.text('Inventory Report', 14, 22);
     doc.setFontSize(11);
     doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);

     const tableData = items.map(item => [
         item.name,
         item.sku || '-',
         item.category || '-',
         item.stock,
         `$${item.price || 0}`
     ]);

     autoTable(doc, {
         head: [['Item Name', 'SKU', 'Category', 'Stock', 'Unit Price']],
         body: tableData,
         startY: 40,
     });

     doc.save('inventory-report.pdf');
  },

  generateInventoryExcel: (items: any[]) => {
      const data = items.map(item => ({
          'Name': item.name,
          'SKU': item.sku,
          'Category': item.category,
          'Stock': item.stock,
          'Unit Price': item.price,
          'Total Value': item.stock * item.price
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

      XLSX.writeFile(workbook, "inventory-report.xlsx");
  }
};
