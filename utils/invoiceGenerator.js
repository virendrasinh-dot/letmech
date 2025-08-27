const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateInvoicePDF = (jobData, outputPath) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    doc.fontSize(20).text('Vehicle Service Invoice', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text(`Job Card ID: ${jobData.jobCardId}`);
    doc.text(`Vendor: ${jobData.vendor}`);
    doc.text(`Created By: ${jobData.createdBy}`);
    doc.text(`Customer: ${jobData.customer.name} (${jobData.customer.email})`);
    doc.moveDown();

    doc.text(`Vehicle: ${jobData.vehicle.brand} ${jobData.vehicle.model} (${jobData.vehicle.registrationNumber})`);
    doc.text(`Type: ${jobData.vehicle.type}`);
    doc.moveDown();

    doc.fontSize(14).text('Issues Reported:');
    jobData.issuesReported.forEach(i => doc.text(`- ${i}`));
    doc.moveDown();

    doc.fontSize(14).text('Work Done:');
    jobData.workDone.forEach(w => doc.text(`- ${w}`));
    doc.moveDown();

    doc.fontSize(14).text('Parts Used:');
    jobData.partsUsed.forEach(p => {
      doc.text(`- ${p.partName} x${p.quantity} @ ₹${p.unitPrice}`);
    });
    doc.moveDown();

    doc.fontSize(12).text(`Service Date: ${new Date(jobData.serviceDate).toLocaleDateString()}`);
    doc.text(`Delivery Date: ${new Date(jobData.deliveryDate).toLocaleDateString()}`);
    doc.fontSize(16).text(`\nTotal Cost: ₹${jobData.totalCost}`, { align: 'right' });

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
};

module.exports = generateInvoicePDF;
