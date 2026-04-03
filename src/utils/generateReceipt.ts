import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Student } from '../types';
import { logoBase64 } from './logoBase64';

// Define minimal GState type for jsPDF
interface GState {
  opacity: number;
}

// Define minimal jsPDF extended type for internal properties
interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

export const generateReceiptPDF = (student: Student) => {
  // A4 size, portrait is default. The image looks like portrait A5 or A4. Let's use A4.
  const doc = new jsPDF('p', 'pt', 'a4') as jsPDFWithAutoTable;
  
  // Outer Border (Thick)
  doc.setLineWidth(3);
  doc.setDrawColor(0, 0, 0); // Black
  doc.rect(20, 20, 555, 802);
  
  // Inner Border (Thin)
  doc.setLineWidth(1);
  doc.rect(25, 25, 545, 792);
  
  // Background Color (Light Blue-Gray) - matching image
  // Fill color inside inner border
  doc.setFillColor(166, 188, 208); // Approximate #a6bcd0
  doc.rect(25, 25, 545, 792, 'F');
  
  // Set inner border again over the fill
  doc.setLineWidth(1);
  doc.setDrawColor(0,0,0);
  doc.rect(25, 25, 545, 792);

  // Logo
  const logoWidth = 130;
  const logoHeight = 133;
  const logoX = (595 - logoWidth) / 2;
  const logoY = 40;
  doc.addImage(logoBase64, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Title: "The Achiever's Academy" in cursive-like font
  // Since jsPDF standard only has times, helvetica, courier, we use 'times' 'italic' to simulate cursive
  doc.setFont("times", "italic");
  doc.setFontSize(36);
  doc.text("The Achiever's Academy", 298, 210, { align: "center" });

  // Academic Year
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text(student.academicYear, 298, 250, { align: "center" });

  // Watermark (Diagonal FEE CARD)
  doc.saveGraphicsState();
  const gState: GState = { opacity: 0.15 };
  // Use a targeted suppression for jsPDF's internal API if necessary
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  doc.setGState(new (doc as any).GState(gState)); 
  doc.setFont("helvetica", "bold");
  doc.setFontSize(60);
  doc.setTextColor(0, 0, 0);
  // jsPDF text rotation
  doc.text(`FEE CARD ${student.academicYear}`, 150, 600, { angle: 45 });
  doc.restoreGraphicsState();

  // Student Details
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  
  const startX = 60;
  let currentY = 310;
  const lineSpacing = 30;

  doc.text(`Name of the student : `, startX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(student.fullName, startX + 150, currentY);
  
  currentY += lineSpacing;
  doc.setFont("helvetica", "bold");
  doc.text(`Std.                       : `, startX, currentY);
  doc.setFont("helvetica", "normal");
  const romanGrade = student.grade === 5 ? 'V' : student.grade === 6 ? 'VI' : student.grade === 7 ? 'VII' : student.grade === 8 ? 'VIII' : student.grade === 9 ? 'IX' : 'X';
  doc.text(romanGrade, startX + 150, currentY);

  currentY += lineSpacing;
  doc.setFont("helvetica", "bold");
  doc.text(`Annual fees: Rs.${student.feeStructure.annualFees}/-`, startX, currentY);

  currentY += lineSpacing;
  doc.text(`M No.  : `, startX, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(student.mobileNumber, startX + 65, currentY);

  // Table
  // According to image, headers: blank, Amount, Date, Signature
  const head = [["", "Amount", "Date", "Signature"]];
  const body = [];

  for (let i = student.joiningInstallment - 1; i < student.feeStructure.installments.length; i++) {
    const instNum = i + 1;
    const pastPayment = student.paymentHistory.find(p => p.installmentNumber === instNum);
    const nth = instNum === 1 ? '1st' : instNum === 2 ? '2nd' : '3rd';
    
    if (pastPayment) {
        body.push([
            `${nth} installment`, 
            `Rs.${pastPayment.amount}/-`, 
            format(new Date(pastPayment.datePaid), 'dd/MM/yyyy'), 
            "" // Signature placeholder
        ]);
    } else {
        body.push([
            `${nth} installment`, 
            `Rs.${student.feeStructure.installments[i]}/-`, 
            "-", 
            ""
        ]);
    }
  }

  currentY += 20;

  autoTable(doc, {
    startY: currentY,
    head: head,
    body: body,
    theme: 'grid',
    margin: { left: startX, right: startX },
    styles: { 
      fillColor: [166, 188, 208], // match background
      textColor: 0,
      lineColor: 0,
      lineWidth: 1,
      fontSize: 12,
      font: "helvetica",
      valign: 'middle',
      halign: 'center'
    },
    headStyles: {
      fillColor: [166, 188, 208],
      fontStyle: 'bold',
      halign: 'center'
    },
    columnStyles: {
      0: { fontStyle: 'italic', font: 'times', halign: 'left', cellWidth: 120 },
      1: { cellWidth: 100 },
      2: { cellWidth: 100 },
      3: { cellWidth: 100 }
    },
    didDrawCell: (data) => {
      // Draw signature curve if it's the signature column and there is a payment
      if (data.section === 'body' && data.column.index === 3) {
        const rowIdx = data.row.index;
        // Verify payment exists
        const instNum = student.joiningInstallment + rowIdx;
        const pastPayment = student.paymentHistory.find(p => p.installmentNumber === instNum);
        
        if (pastPayment) {
          // Draw standard curly signature placeholder centered
          const x = data.cell.x + data.cell.width / 2;
          const y = data.cell.y + data.cell.height / 2;
          
          doc.setDrawColor(0, 0, 0);
          doc.setLineWidth(1.5);
          // Simplified Bézier to mimic the swirl
          doc.lines([[10, 10], [-5, 5], [-10, -5], [5, -15], [15, -5], [-10, 10], [5, 5]], x - 5, y, [1, 1]);
        }
      }
    }
  });

  // Footer Message: No Refund
  const finalY = doc.lastAutoTable.finalY + 50;
  doc.setFont("times", "italic");
  doc.setFontSize(22);
  doc.text("No Refund", 298, finalY, { align: "center" });

  // Save PDF
  const safeName = student.fullName.replace(/\s+/g, '_');
  const fileName = `${safeName}_Fee_Receipt.pdf`;
  
  doc.save(fileName);
};
