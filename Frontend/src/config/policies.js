// Company policy documents shown on the Policies page (and linked from
// Payslips & Docs). The PDFs live in public/policies/. `version` must match
// Backend/services/policyService.js's POLICIES — bump both when a revised PDF
// is published so every employee is asked to acknowledge the new version.
// Section `page` numbers are the PDF's own page numbers, used to jump the
// embedded viewer straight to that section.
export const POLICIES = [
  {
    id: 'code-of-conduct',
    title: 'Code of Conduct',
    file: '/policies/code-of-conduct.pdf',
    downloadName: 'MZOBS Code of Conduct.pdf',
    version: '1.0',
    effectiveDate: '1st October 2026',
    owner: 'Human Resources Department',
    approvedBy: 'Circle Business Head',
    appliesTo: 'All employees of MZOBS',
    summary: 'Standards of behaviour, ethics and professionalism expected from every member of the MZOBS workforce.',
    acknowledgementText:
      'I acknowledge that I have received, read and understood the MZOBS Code of Conduct. I agree to comply with its provisions and understand that any violation may result in disciplinary action, up to and including termination of employment. I also understand that I am responsible for asking questions and reporting concerns whenever I am uncertain or aware of a potential violation.',
    sections: [
      { title: 'Introduction', page: 3 },
      { title: 'General Conduct', page: 4 },
      { title: 'Workplace Relationships', page: 6 },
      { title: 'Communication and Technology Usage', page: 7 },
      { title: 'Confidentiality and Data Protection', page: 9 },
      { title: 'Health, Safety, and Environmental Responsibility', page: 10 },
      { title: 'Compliance and Reporting', page: 11 },
      { title: 'Consequences of Violations', page: 12 },
      { title: 'Policy Review and Updates', page: 13 },
      { title: 'Employee Acknowledgment', page: 14 },
    ],
    highlights: [
      { label: 'Gifts & bribery', text: 'Bribery and kickbacks are strictly prohibited. Gifts above a nominal value must be declared to HR.' },
      { label: 'Conflict of interest', text: 'Disclose any potential conflict in writing to your manager and HR. Outside work needs prior written approval.' },
      { label: 'Harassment', text: 'Zero tolerance. Sexual harassment complaints go to the Internal Committee under the POSH Act, 2013.' },
      { label: 'Data breach', text: 'Report any actual or suspected data breach to IT and HR within 24 hours of discovery.' },
      { label: 'Raising concerns', text: 'Report to your supervisor, HR (hr@mzobs.com) or the Internal Committee. Retaliation is prohibited.' },
      { label: 'Investigations', text: 'Complaints are acknowledged within 3 working days. Appeals go to the Managing Director within 7 days of a decision.' },
    ],
  },
  {
    id: 'hr-policy',
    title: 'HR Policy Overview',
    file: '/policies/hr-policy.pdf',
    downloadName: 'MZOBS HR Policy Overview.pdf',
    version: '1.0',
    effectiveDate: null,
    owner: 'Human Resources Department',
    approvedBy: null,
    appliesTo: 'All employees, including probationers, trainees and interns',
    summary: 'Employment terms, attendance, leave, payroll, conduct, safety and separation rules for all employees.',
    acknowledgementText:
      'I acknowledge that I have read and understood the MZOBS HR Policy Overview and agree to comply with these standards, subject to applicable law and my written employment terms.',
    sections: [
      { title: 'Purpose, Scope & Working Hours', page: 2 },
      { title: 'Employment Categories & Probation', page: 3 },
      { title: 'Code of Conduct & Attendance', page: 4 },
      { title: 'Compensation, Payroll & Performance', page: 5 },
      { title: 'Leave Policy', page: 5 },
      { title: 'Holidays, Maternity & Paternity Leave', page: 7 },
      { title: 'Overtime, Travel & Expenses', page: 8 },
      { title: 'Confidentiality & Intellectual Property', page: 9 },
      { title: 'Company Property & Conflict of Interest', page: 10 },
      { title: 'Prevention of Sexual Harassment & Safety', page: 11 },
      { title: 'Grievance Redressal & Disciplinary Action', page: 12 },
      { title: 'Separation from Employment', page: 13 },
      { title: 'Records & Statutory Compliance', page: 14 },
      { title: 'Employee, Manager & HR Responsibilities', page: 15 },
    ],
    highlights: [
      { label: 'Working hours', text: 'Work from office, Monday to Friday, 10:00 AM to 6:00 PM. Saturday and Sunday are weekly offs.' },
      { label: 'Attendance', text: 'Record attendance in the prescribed system. If you can\'t attend, inform your manager and HR before the workday starts.' },
      { label: 'Leave', text: 'Apply in advance and get approval. Casual, Sick, Earned, Maternity, Paternity/Adoption and Leave Without Pay are covered.' },
      { label: 'Payroll', text: 'Salary is processed monthly, subject to statutory deductions such as PF, professional tax, TDS and ESI.' },
      { label: 'Expenses', text: 'Claims must be accurate, business-related and backed by bills. False or inflated claims lead to disciplinary action.' },
      { label: 'Resignation', text: 'Submit it in writing and serve the notice period in your appointment letter, unless waived in writing.' },
    ],
  },
];

export function getPolicy(policyId) {
  return POLICIES.find(p => p.id === policyId) || null;
}

// The signed-in employee's acknowledgment of a policy's current version, if any.
export function findAcknowledgement(acknowledgements, policy, employeeId) {
  return acknowledgements.find(a =>
    a.policyId === policy.id && a.policyVersion === policy.version && a.employeeId === employeeId
  ) || null;
}

export function pendingPolicies(acknowledgements, employeeId) {
  return POLICIES.filter(p => !findAcknowledgement(acknowledgements, p, employeeId));
}
