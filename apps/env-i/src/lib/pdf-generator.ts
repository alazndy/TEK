import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { DefectReport, InspectedProduct } from './types';
import { format } from 'date-fns';

export const generateDefectReportPDF = (defect: DefectReport) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // ======================
  // HEADER SECTION
  // ======================
  
  // Left: Company Info
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ADC DESIGN CONSULTING", 14, 20);
  doc.text("ENG.& SER. Co. LTD", 14, 25);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("KIZILIRMAK MAH.", 14, 35);
  doc.text("DUMLUPINAR BULVARI NO:3/C-1/160", 14, 40);
  doc.text("06000 ÇANKAYA ANKARA", 14, 45);
  doc.text("info@adctasarim.com", 14, 55);

  // Right: Form Title & Info
  doc.setFillColor(220, 53, 69); // Red color for title
  doc.setTextColor(220, 53, 69);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FAULT", pageWidth - 14, 15, { align: 'right' });
  doc.text("DETECTION/", pageWidth - 14, 22, { align: 'right' });
  doc.text("SERVICE FORM", pageWidth - 14, 29, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Date and Form No boxes
  const boxX = 140;
  const boxWidth = 55;
  
  // Date box
  doc.setDrawColor(0);
  doc.rect(boxX, 35, boxWidth, 8);
  doc.setFont("helvetica", "bold");
  doc.text("Date:", boxX + 2, 40);
  doc.setFont("helvetica", "normal");
  doc.text(format(defect.createdAt, 'dd.MM.yyyy'), boxX + 25, 40);
  
  // Form No box
  doc.rect(boxX, 43, boxWidth, 8);
  doc.setFont("helvetica", "bold");
  doc.text("Form No:", boxX + 2, 48);
  doc.setFont("helvetica", "normal");
  doc.text(defect.formNumber || 'N/A', boxX + 25, 48);

  // ======================
  // CUSTOMER & INSPECTOR INFO
  // ======================
  const infoStartY = 65;
  doc.setDrawColor(0);
  doc.line(14, infoStartY, pageWidth - 14, infoStartY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CUSTOMER:", 14, infoStartY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(defect.customerName ? defect.customerName.toUpperCase() : "N/A", 45, infoStartY + 8);
  
  doc.setFont("helvetica", "bold");
  doc.text("INSPECTOR:", 14, infoStartY + 16);
  doc.setFont("helvetica", "normal");
  const inspectorText = `${defect.inspectorName || 'N/A'}  /  ${format(defect.inspectorDate, 'dd.MM.yyyy')}`;
  doc.text(inspectorText, 45, infoStartY + 16);

  // ======================
  // 1. INSPECTED PRODUCTS TABLE
  // ======================
  const productsStartY = infoStartY + 25;
  doc.setFont("helvetica", "bold");
  doc.text("INSPECTED PRODUCTS", 14, productsStartY);

  // Build table data from inspectedProducts array
  const productTableData = defect.inspectedProducts.map((product, index) => [
    String(index + 1),
    product.productType || '',
    `${product.brand || ''} ${product.model || ''}`.trim(),
    `${product.partNumber || ''} / ${product.serialNumber || ''}`
  ]);

  autoTable(doc, {
    startY: productsStartY + 5,
    head: [['', 'PRODUCT / TYPE', 'BRAND / MODAL', 'PART NO / S-N']],
    body: productTableData,
    theme: 'grid',
    headStyles: { 
      fillColor: [255, 255, 255], 
      textColor: [0, 0, 0], 
      lineWidth: 0.1, 
      lineColor: [0, 0, 0],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      fontSize: 9
    },
    styles: {
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { cellWidth: 'auto' }
    }
  });

  // ======================
  // 2. CUSTOMER STATEMENT
  // ======================
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("2. CUSTOMER STATEMENT", 14, finalY);
  
  finalY += 7;
  doc.setFont("helvetica", "normal");
  
  // Draw a border box for the statement
  const statementText = defect.customerStatement || "No statement provided.";
  const splitStatement = doc.splitTextToSize(statementText, pageWidth - 32);
  const statementHeight = Math.max(splitStatement.length * 5 + 6, 20);
  
  doc.setDrawColor(0);
  doc.rect(14, finalY - 4, pageWidth - 28, statementHeight);
  doc.text(splitStatement, 16, finalY);
  finalY += statementHeight + 10;

  // ======================
  // 3. TECHNICAL SERVICE EVALUATION
  // ======================
  // Check if we need a new page
  if (finalY > 240) {
    doc.addPage();
    finalY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.text("3. TECHNICAL SERVICE EVALUATION", 14, finalY);
  finalY += 7;

  doc.setFont("helvetica", "normal");
  doc.text("As a result of the detailed physical and technical inspection performed on the product:", 14, finalY);
  finalY += 7;
  
  doc.setFont("helvetica", "bold");
  doc.text("Findings:", 14, finalY);
  finalY += 7;
  
  doc.setFont("helvetica", "normal");
  const inspectionText = defect.inspectionResult || "Examination pending or no details provided.";
  const splitFindings = doc.splitTextToSize(inspectionText, pageWidth - 32);
  const findingsHeight = Math.max(splitFindings.length * 5 + 6, 30);
  
  // Draw border box for findings
  doc.setDrawColor(0);
  doc.rect(14, finalY - 4, pageWidth - 28, findingsHeight);
  doc.text(splitFindings, 16, finalY);

  // ======================
  // FOOTER
  // ======================
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Left footer: Form version
    doc.text("Form: ATF1R0", 14, pageHeight - 10);
    
    // Center footer: Email
    doc.text("info@adctasarim.com", pageWidth / 2, pageHeight - 10, { align: 'center' });
    
    // Right footer: Page number
    doc.text(`${i}/${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  }

  // Save the PDF
  doc.save(`${defect.formNumber || 'ServiceForm'}.pdf`);
};

// Generate PDF as Blob for preview (doesn't download)
export const generateDefectReportPDFBlob = (defect: DefectReport): Blob => {
  const jsPDF = require('jspdf').default;
  const autoTable = require('jspdf-autotable').default;
  
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Header
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("ADC DESIGN CONSULTING", 14, 20);
  doc.text("ENG.& SER. Co. LTD", 14, 25);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("KIZILIRMAK MAH.", 14, 35);
  doc.text("DUMLUPINAR BULVARI NO:3/C-1/160", 14, 40);
  doc.text("06000 ÇANKAYA ANKARA", 14, 45);
  doc.text("info@adctasarim.com", 14, 55);

  // Title
  doc.setFillColor(220, 53, 69);
  doc.setTextColor(220, 53, 69);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("FAULT", pageWidth - 14, 15, { align: 'right' });
  doc.text("DETECTION/", pageWidth - 14, 22, { align: 'right' });
  doc.text("SERVICE FORM", pageWidth - 14, 29, { align: 'right' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const boxX = 140;
  const boxWidth = 55;
  
  doc.setDrawColor(0);
  doc.rect(boxX, 35, boxWidth, 8);
  doc.setFont("helvetica", "bold");
  doc.text("Date:", boxX + 2, 40);
  doc.setFont("helvetica", "normal");
  doc.text(format(defect.createdAt, 'dd.MM.yyyy'), boxX + 25, 40);
  
  doc.rect(boxX, 43, boxWidth, 8);
  doc.setFont("helvetica", "bold");
  doc.text("Form No:", boxX + 2, 48);
  doc.setFont("helvetica", "normal");
  doc.text(defect.formNumber || 'N/A', boxX + 25, 48);

  // Customer & Inspector
  const infoStartY = 65;
  doc.setDrawColor(0);
  doc.line(14, infoStartY, pageWidth - 14, infoStartY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("CUSTOMER:", 14, infoStartY + 8);
  doc.setFont("helvetica", "normal");
  doc.text(defect.customerName ? defect.customerName.toUpperCase() : "N/A", 45, infoStartY + 8);
  
  doc.setFont("helvetica", "bold");
  doc.text("INSPECTOR:", 14, infoStartY + 16);
  doc.setFont("helvetica", "normal");
  const inspectorText = `${defect.inspectorName || 'N/A'}  /  ${format(defect.inspectorDate, 'dd.MM.yyyy')}`;
  doc.text(inspectorText, 45, infoStartY + 16);

  // Products Table
  const productsStartY = infoStartY + 25;
  doc.setFont("helvetica", "bold");
  doc.text("INSPECTED PRODUCTS", 14, productsStartY);

  const productTableData = defect.inspectedProducts.map((product, index) => [
    String(index + 1),
    product.productType || '',
    `${product.brand || ''} ${product.model || ''}`.trim(),
    `${product.partNumber || ''} / ${product.serialNumber || ''}`
  ]);

  autoTable(doc, {
    startY: productsStartY + 5,
    head: [['', 'PRODUCT / TYPE', 'BRAND / MODAL', 'PART NO / S-N']],
    body: productTableData,
    theme: 'grid',
    headStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { textColor: [0, 0, 0], lineWidth: 0.1, lineColor: [0, 0, 0], fontSize: 9 },
    columnStyles: { 0: { cellWidth: 10, halign: 'center' } }
  });

  // Customer Statement
  let finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFont("helvetica", "bold");
  doc.text("2. CUSTOMER STATEMENT", 14, finalY);
  finalY += 7;
  doc.setFont("helvetica", "normal");
  const statementText = defect.customerStatement || "No statement provided.";
  const splitStatement = doc.splitTextToSize(statementText, pageWidth - 32);
  const statementHeight = Math.max(splitStatement.length * 5 + 6, 20);
  doc.rect(14, finalY - 4, pageWidth - 28, statementHeight);
  doc.text(splitStatement, 16, finalY);
  finalY += statementHeight + 10;

  // Technical Evaluation
  if (finalY > 240) { doc.addPage(); finalY = 20; }
  doc.setFont("helvetica", "bold");
  doc.text("3. TECHNICAL SERVICE EVALUATION", 14, finalY);
  finalY += 7;
  doc.setFont("helvetica", "normal");
  doc.text("As a result of the detailed physical and technical inspection performed on the product:", 14, finalY);
  finalY += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Findings:", 14, finalY);
  finalY += 7;
  doc.setFont("helvetica", "normal");
  const inspectionText = defect.inspectionResult || "Examination pending or no details provided.";
  const splitFindings = doc.splitTextToSize(inspectionText, pageWidth - 32);
  const findingsHeight = Math.max(splitFindings.length * 5 + 6, 30);
  doc.rect(14, finalY - 4, pageWidth - 28, findingsHeight);
  doc.text(splitFindings, 16, finalY);

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.text("Form: ATF1R0", 14, pageHeight - 10);
    doc.text("info@adctasarim.com", pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`${i}/${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  }

  return doc.output('blob');
};

