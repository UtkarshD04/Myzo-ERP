import nodemailer from 'nodemailer';

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  return transporter;
}

function money(n) {
  return `Rs. ${Number(n || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

function buildQuotationEmailHtml(quotation) {
  const rows = (quotation.items || []).map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${item.productName || ''}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(item.unitPrice)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(item.lineTotal)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h2 style="color:#2563eb;margin-bottom:4px;">Quotation ${quotation.id}</h2>
      ${quotation.referenceNumber ? `<p style="color:#94a3b8;font-size:12px;margin-top:0;">Ref: ${quotation.referenceNumber}</p>` : ''}
      <p>Dear ${quotation.customerName || 'Customer'},</p>
      <p>${quotation.subject || 'Please find your quotation details below.'}</p>
      <table style="width:100%;border-collapse:collapse;margin-top:16px;">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="padding:8px;text-align:left;">Product</th>
            <th style="padding:8px;text-align:center;">Qty</th>
            <th style="padding:8px;text-align:right;">Rate</th>
            <th style="padding:8px;text-align:right;">Amount</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <table style="width:100%;margin-top:12px;">
        <tr><td style="text-align:right;padding:4px;">Subtotal:</td><td style="text-align:right;padding:4px;width:130px;">${money(quotation.subtotal)}</td></tr>
        ${quotation.discountTotal ? `<tr><td style="text-align:right;padding:4px;">Discount:</td><td style="text-align:right;padding:4px;">-${money(quotation.discountTotal)}</td></tr>` : ''}
        ${quotation.cgstRate ? `<tr><td style="text-align:right;padding:4px;">CGST (${quotation.cgstRate}%):</td><td style="text-align:right;padding:4px;">${money(quotation.cgstAmount)}</td></tr>` : ''}
        ${quotation.sgstRate ? `<tr><td style="text-align:right;padding:4px;">SGST (${quotation.sgstRate}%):</td><td style="text-align:right;padding:4px;">${money(quotation.sgstAmount)}</td></tr>` : ''}
        ${quotation.igstRate ? `<tr><td style="text-align:right;padding:4px;">IGST (${quotation.igstRate}%):</td><td style="text-align:right;padding:4px;">${money(quotation.igstAmount)}</td></tr>` : ''}
        ${quotation.taxAmount ? `<tr><td style="text-align:right;padding:4px;">${quotation.taxType}:</td><td style="text-align:right;padding:4px;">${money(quotation.taxAmount)}</td></tr>` : ''}
        <tr>
          <td style="text-align:right;padding:8px 4px;font-weight:bold;font-size:16px;border-top:2px solid #e2e8f0;">Total:</td>
          <td style="text-align:right;padding:8px 4px;font-weight:bold;font-size:16px;color:#2563eb;border-top:2px solid #e2e8f0;">${money(quotation.totalAmount)}</td>
        </tr>
      </table>
      ${quotation.termsAndConditions ? `<p style="margin-top:20px;font-size:13px;color:#64748b;"><strong>Terms &amp; Conditions:</strong><br/>${quotation.termsAndConditions}</p>` : ''}
      ${quotation.customerNotes ? `<p style="font-size:13px;color:#64748b;">${quotation.customerNotes}</p>` : ''}
      <p style="margin-top:24px;">Regards,<br/>${quotation.salespersonName || 'Sales Team'}</p>
    </div>
  `;
}

function buildQuotationFollowUpEmailHtml(quotation) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h2 style="color:#2563eb;margin-bottom:4px;">Following up on Quotation ${quotation.id}</h2>
      ${quotation.referenceNumber ? `<p style="color:#94a3b8;font-size:12px;margin-top:0;">Ref: ${quotation.referenceNumber}</p>` : ''}
      <p>Dear ${quotation.customerName || 'Customer'},</p>
      <p>Just checking in on the quotation we sent over${quotation.quoteDate ? ` on ${quotation.quoteDate}` : ''}. Let us know if you have any questions or would like to proceed.</p>
      <table style="width:100%;margin-top:12px;">
        <tr><td style="text-align:right;padding:8px 4px;font-weight:bold;font-size:16px;border-top:2px solid #e2e8f0;">Total:</td>
        <td style="text-align:right;padding:8px 4px;font-weight:bold;font-size:16px;color:#2563eb;border-top:2px solid #e2e8f0;width:130px;">${money(quotation.totalAmount)}</td></tr>
      </table>
      ${quotation.validUntil ? `<p style="font-size:13px;color:#64748b;">This quotation is valid until ${quotation.validUntil}.</p>` : ''}
      <p style="margin-top:24px;">Regards,<br/>${quotation.salespersonName || 'Sales Team'}</p>
    </div>
  `;
}

function buildLeaveStatusEmailHtml(leave) {
  const isApproved = leave.status === 'Approved';
  const color = isApproved ? '#059669' : '#dc2626';

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h2 style="color:${color};margin-bottom:4px;">Leave Request ${leave.status}</h2>
      <p>Dear ${leave.employeeName || 'Employee'},</p>
      <p>Your ${leave.leaveType} leave request has been <strong style="color:${color};">${leave.status.toLowerCase()}</strong>.</p>
      <table style="width:100%;margin-top:16px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;">From:</td><td style="padding:6px 0;font-weight:bold;">${leave.startDate}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">To:</td><td style="padding:6px 0;font-weight:bold;">${leave.endDate}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Days:</td><td style="padding:6px 0;font-weight:bold;">${leave.days}</td></tr>
        ${leave.reviewComments ? `<tr><td style="padding:6px 0;color:#64748b;">Remarks:</td><td style="padding:6px 0;">${leave.reviewComments}</td></tr>` : ''}
      </table>
      <p style="margin-top:24px;">Regards,<br/>MYZO ERP</p>
    </div>
  `;
}

export async function sendLeaveStatusEmail(leave, employee) {
  const t = getTransporter();
  if (!t) {
    const error = new Error('Email service is not configured (missing SMTP credentials).');
    error.statusCode = 500;
    throw error;
  }
  if (!employee?.officialEmail) {
    const error = new Error('Employee email is required to send this notification.');
    error.statusCode = 400;
    throw error;
  }

  await t.sendMail({
    from: `"MYZO ERP" <${process.env.SMTP_USER}>`,
    to: employee.officialEmail,
    subject: `Leave Request ${leave.status} - ${leave.startDate} to ${leave.endDate}`,
    html: buildLeaveStatusEmailHtml(leave)
  });
}

export async function sendQuotationEmail(quotation) {
  const t = getTransporter();
  if (!t) {
    const error = new Error('Email service is not configured (missing SMTP credentials).');
    error.statusCode = 500;
    throw error;
  }
  if (!quotation.customerEmail) {
    const error = new Error('Customer email is required to send this quotation.');
    error.statusCode = 400;
    throw error;
  }

  await t.sendMail({
    from: `"MYZO ERP" <${process.env.SMTP_USER}>`,
    to: quotation.customerEmail,
    subject: `Quotation ${quotation.id} from MYZO`,
    html: buildQuotationEmailHtml(quotation)
  });
}

export async function sendQuotationFollowUpEmail(quotation) {
  const t = getTransporter();
  if (!t) {
    const error = new Error('Email service is not configured (missing SMTP credentials).');
    error.statusCode = 500;
    throw error;
  }
  if (!quotation.customerEmail) {
    const error = new Error('Customer email is required to send this follow-up.');
    error.statusCode = 400;
    throw error;
  }

  await t.sendMail({
    from: `"MYZO ERP" <${process.env.SMTP_USER}>`,
    to: quotation.customerEmail,
    subject: `Following up: Quotation ${quotation.id} from MYZO`,
    html: buildQuotationFollowUpEmailHtml(quotation)
  });
}
