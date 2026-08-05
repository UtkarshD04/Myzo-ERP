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

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Every value below comes from employee-editable records (quotations, leave
// requests, ...) that get emailed out verbatim as HTML — escape it or an
// employee can inject arbitrary markup/links into mail sent from the
// company's Gmail account (see quotationController's unrestricted create).
function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => HTML_ESCAPES[c]);
}

function buildQuotationEmailHtml(quotation) {
  const rows = (quotation.items || []).map(item => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${esc(item.productName)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${esc(item.quantity)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(item.unitPrice)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${money(item.lineTotal)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h2 style="color:#2563eb;margin-bottom:4px;">Quotation ${esc(quotation.id)}</h2>
      ${quotation.referenceNumber ? `<p style="color:#94a3b8;font-size:12px;margin-top:0;">Ref: ${esc(quotation.referenceNumber)}</p>` : ''}
      <p>Dear ${esc(quotation.customerName || 'Customer')},</p>
      <p>${esc(quotation.subject || 'Please find your quotation details below.')}</p>
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
        ${quotation.cgstRate ? `<tr><td style="text-align:right;padding:4px;">CGST (${esc(quotation.cgstRate)}%):</td><td style="text-align:right;padding:4px;">${money(quotation.cgstAmount)}</td></tr>` : ''}
        ${quotation.sgstRate ? `<tr><td style="text-align:right;padding:4px;">SGST (${esc(quotation.sgstRate)}%):</td><td style="text-align:right;padding:4px;">${money(quotation.sgstAmount)}</td></tr>` : ''}
        ${quotation.igstRate ? `<tr><td style="text-align:right;padding:4px;">IGST (${esc(quotation.igstRate)}%):</td><td style="text-align:right;padding:4px;">${money(quotation.igstAmount)}</td></tr>` : ''}
        ${quotation.taxAmount ? `<tr><td style="text-align:right;padding:4px;">${esc(quotation.taxType)}:</td><td style="text-align:right;padding:4px;">${money(quotation.taxAmount)}</td></tr>` : ''}
        <tr>
          <td style="text-align:right;padding:8px 4px;font-weight:bold;font-size:16px;border-top:2px solid #e2e8f0;">Total:</td>
          <td style="text-align:right;padding:8px 4px;font-weight:bold;font-size:16px;color:#2563eb;border-top:2px solid #e2e8f0;">${money(quotation.totalAmount)}</td>
        </tr>
      </table>
      ${quotation.termsAndConditions ? `<p style="margin-top:20px;font-size:13px;color:#64748b;"><strong>Terms &amp; Conditions:</strong><br/>${esc(quotation.termsAndConditions)}</p>` : ''}
      ${quotation.customerNotes ? `<p style="font-size:13px;color:#64748b;">${esc(quotation.customerNotes)}</p>` : ''}
      <p style="margin-top:24px;">Regards,<br/>${esc(quotation.salespersonName || 'Sales Team')}</p>
    </div>
  `;
}

function buildQuotationFollowUpEmailHtml(quotation) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h2 style="color:#2563eb;margin-bottom:4px;">Following up on Quotation ${esc(quotation.id)}</h2>
      ${quotation.referenceNumber ? `<p style="color:#94a3b8;font-size:12px;margin-top:0;">Ref: ${esc(quotation.referenceNumber)}</p>` : ''}
      <p>Dear ${esc(quotation.customerName || 'Customer')},</p>
      <p>Just checking in on the quotation we sent over${quotation.quoteDate ? ` on ${esc(quotation.quoteDate)}` : ''}. Let us know if you have any questions or would like to proceed.</p>
      <table style="width:100%;margin-top:12px;">
        <tr><td style="text-align:right;padding:8px 4px;font-weight:bold;font-size:16px;border-top:2px solid #e2e8f0;">Total:</td>
        <td style="text-align:right;padding:8px 4px;font-weight:bold;font-size:16px;color:#2563eb;border-top:2px solid #e2e8f0;width:130px;">${money(quotation.totalAmount)}</td></tr>
      </table>
      ${quotation.validUntil ? `<p style="font-size:13px;color:#64748b;">This quotation is valid until ${esc(quotation.validUntil)}.</p>` : ''}
      <p style="margin-top:24px;">Regards,<br/>${esc(quotation.salespersonName || 'Sales Team')}</p>
    </div>
  `;
}

function buildLeaveStatusEmailHtml(leave) {
  const isApproved = leave.status === 'Approved';
  const color = isApproved ? '#059669' : '#dc2626';

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h2 style="color:${color};margin-bottom:4px;">Leave Request ${esc(leave.status)}</h2>
      <p>Dear ${esc(leave.employeeName || 'Employee')},</p>
      <p>Your ${esc(leave.leaveType)} leave request has been <strong style="color:${color};">${esc((leave.status || '').toLowerCase())}</strong>.</p>
      <table style="width:100%;margin-top:16px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;">From:</td><td style="padding:6px 0;font-weight:bold;">${esc(leave.startDate)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">To:</td><td style="padding:6px 0;font-weight:bold;">${esc(leave.endDate)}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;">Days:</td><td style="padding:6px 0;font-weight:bold;">${esc(leave.days)}</td></tr>
        ${leave.reviewComments ? `<tr><td style="padding:6px 0;color:#64748b;">Remarks:</td><td style="padding:6px 0;">${esc(leave.reviewComments)}</td></tr>` : ''}
      </table>
      <p style="margin-top:24px;">Regards,<br/>MYZO ERP</p>
    </div>
  `;
}

function buildPasswordResetEmailHtml(employee, link) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h2 style="color:#2563eb;margin-bottom:4px;">Reset Your MYZO ERP Password</h2>
      <p>Dear ${esc(employee.name || 'Employee')},</p>
      <p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour and can only be used once.</p>
      <p style="margin:24px 0;">
        <a href="${esc(link)}" style="background:#2563eb;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">Reset Password</a>
      </p>
      <p style="font-size:12px;color:#94a3b8;">If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
      <p style="margin-top:24px;">Regards,<br/>MYZO ERP</p>
    </div>
  `;
}

function buildLateCheckoutEmailHtml(employee, reason, time) {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
      <h2 style="color:#dc2626;margin-bottom:4px;">Late Punch-Out</h2>
      <p><strong>${esc(employee.name)}</strong>${employee.department ? ` (${esc(employee.department)})` : ''} punched out at ${esc(time)}, after the 6:30 PM cutoff.</p>
      <table style="width:100%;margin-top:16px;border-collapse:collapse;">
        <tr><td style="padding:6px 0;color:#64748b;">Reason given:</td><td style="padding:6px 0;font-weight:bold;">${esc(reason)}</td></tr>
      </table>
      <p style="margin-top:24px;">Regards,<br/>MYZO ERP</p>
    </div>
  `;
}

// Best-effort by design: recipients is the current HR/Admin roster, looked up
// fresh by the caller (attendanceService) rather than hardcoded, and a
// missing SMTP config or empty roster should never block the punch-out itself.
export async function sendLateCheckoutEmail(employee, reason, time, recipients) {
  const t = getTransporter();
  if (!t || !recipients?.length) return;

  await t.sendMail({
    from: `"MYZO ERP" <${process.env.SMTP_USER}>`,
    to: recipients.join(','),
    subject: `Late Punch-Out: ${employee.name} at ${time}`,
    html: buildLateCheckoutEmailHtml(employee, reason, time)
  });
}

export async function sendPasswordResetEmail(employee, link) {
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
    subject: 'Reset Your MYZO ERP Password',
    html: buildPasswordResetEmailHtml(employee, link)
  });
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
