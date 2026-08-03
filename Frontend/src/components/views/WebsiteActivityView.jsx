import React, { useState } from 'react';
import { Search, Globe, Package, Wrench, Handshake, Users, Mail, Phone, MapPin, Briefcase } from 'lucide-react';

const PRODUCT_ENQUIRY_STATUSES = ['new', 'contacted', 'converted', 'closed'];
const AFTER_SALES_STATUSES = ['new', 'in-progress', 'resolved', 'closed'];
const BECOME_PARTNER_STATUSES = ['new', 'contacted', 'approved', 'rejected'];
const CAREER_APPLICATION_STATUSES = ['new', 'reviewing', 'shortlisted', 'rejected'];

const STATUS_STYLES = {
  new: 'bg-blue-50 text-blue-600 border-blue-100',
  contacted: 'bg-amber-50 text-amber-600 border-amber-100',
  'in-progress': 'bg-amber-50 text-amber-600 border-amber-100',
  converted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  approved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  resolved: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  shortlisted: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  reviewing: 'bg-amber-50 text-amber-600 border-amber-100',
  closed: 'bg-slate-100 text-slate-500 border-slate-200',
  rejected: 'bg-red-50 text-red-600 border-red-100',
};

const StatusBadge = ({ status }) => (
  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${STATUS_STYLES[status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
    {status || 'new'}
  </span>
);

const StatusSelect = ({ value, options, onChange, disabled }) => (
  <select
    value={value || options[0]}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    className="px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold uppercase text-slate-600 focus:outline-none focus:border-blue-500 disabled:opacity-50 cursor-pointer"
  >
    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
  </select>
);

const EmptyRow = ({ colSpan, label }) => (
  <tr>
    <td colSpan={colSpan} className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
      {label}
    </td>
  </tr>
);

function ProductEnquiriesTab({ items, search, onUpdateStatus }) {
  const [savingId, setSavingId] = useState(null);
  const filtered = items.filter(i => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [i.firstName, i.lastName, i.email, i.phone, i.product].some(v => (v || '').toLowerCase().includes(q));
  });

  const handleStatus = async (id, status) => {
    setSavingId(id);
    try {
      await onUpdateStatus(id, status);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(item => (
              <tr key={item._id} className="hover:bg-slate-50/60 transition-colors align-top">
                <td className="px-5 py-3.5">
                  <p className="font-bold text-xs text-slate-800">{item.firstName} {item.lastName}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3 shrink-0" /> {item.email}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 shrink-0" /> {item.phone}</p>
                  {item.address && (
                    <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 shrink-0" /> {item.address} {item.pinCode}</p>
                  )}
                </td>
                <td className="px-5 py-3.5 text-xs font-semibold text-slate-600 max-w-[180px]">{item.product}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[240px]">{item.message || '--'}</td>
                <td className="px-5 py-3.5 text-[10px] text-slate-400 whitespace-nowrap">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : '--'}
                </td>
                <td className="px-5 py-3.5">
                  <StatusSelect
                    value={item.status}
                    options={PRODUCT_ENQUIRY_STATUSES}
                    disabled={savingId === item._id}
                    onChange={(status) => handleStatus(item._id, status)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <EmptyRow colSpan={5} label="No product enquiries yet." />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AfterSalesTab({ items, search, onUpdateStatus }) {
  const [savingId, setSavingId] = useState(null);
  const filtered = items.filter(i => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [i.firstName, i.lastName, i.email, i.phone, i.model, i.serial].some(v => (v || '').toLowerCase().includes(q));
  });

  const handleStatus = async (id, status) => {
    setSavingId(id);
    try {
      await onUpdateStatus(id, status);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(item => (
              <tr key={item._id} className="hover:bg-slate-50/60 transition-colors align-top">
                <td className="px-5 py-3.5">
                  <p className="font-bold text-xs text-slate-800">{item.firstName} {item.lastName}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3 shrink-0" /> {item.email}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 shrink-0" /> {item.phone}</p>
                </td>
                <td className="px-5 py-3.5 text-xs font-semibold text-slate-600">
                  {item.model}
                  <p className="text-[10px] text-slate-400 font-normal mt-0.5">SN: {item.serial}</p>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[240px]">{item.issue || '--'}</td>
                <td className="px-5 py-3.5 text-[10px] text-slate-400 whitespace-nowrap">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : '--'}
                </td>
                <td className="px-5 py-3.5">
                  <StatusSelect
                    value={item.status}
                    options={AFTER_SALES_STATUSES}
                    disabled={savingId === item._id}
                    onChange={(status) => handleStatus(item._id, status)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <EmptyRow colSpan={5} label="No after-sales service requests yet." />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BecomePartnersTab({ items, search, onUpdateStatus }) {
  const [savingId, setSavingId] = useState(null);
  const filtered = items.filter(i => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return Object.values(i).some(v => typeof v === 'string' && v.toLowerCase().includes(q));
  });

  const handleStatus = async (id, status) => {
    setSavingId(id);
    try {
      await onUpdateStatus(id, status);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  // Fields aren't known ahead of time (collection was empty when this view
  // was built) — render whatever the website's form actually submitted.
  const HIDDEN_KEYS = new Set(['_id', '__v', 'status', 'createdAt', 'updatedAt']);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="divide-y divide-slate-50">
        {filtered.map(item => (
          <div key={item._id} className="px-5 py-4 flex flex-col md:flex-row md:items-start justify-between gap-3">
            <div className="flex-1 min-w-0 grid grid-cols-2 gap-x-4 gap-y-1">
              {Object.entries(item).filter(([k]) => !HIDDEN_KEYS.has(k)).map(([k, v]) => (
                <div key={k} className="text-xs">
                  <span className="text-slate-400 font-semibold">{k}: </span>
                  <span className="text-slate-700">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                </div>
              ))}
              <p className="text-[10px] text-slate-400 col-span-2 mt-1">
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
              </p>
            </div>
            <StatusSelect
              value={item.status}
              options={BECOME_PARTNER_STATUSES}
              disabled={savingId === item._id}
              onChange={(status) => handleStatus(item._id, status)}
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="px-5 py-10 text-center text-xs text-slate-400 font-semibold">
            No partner requests yet.
          </div>
        )}
      </div>
    </div>
  );
}

function WebsiteUsersTab({ items, search }) {
  const filtered = items.filter(u => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = `${u.fullname?.firstname || ''} ${u.fullname?.lastname || ''}`;
    return [name, u.email, u.phone].some(v => (v || '').toLowerCase().includes(q));
  });

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Name</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Signed Up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(u => (
              <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 text-xs font-bold text-slate-800">
                  {u.fullname?.firstname} {u.fullname?.lastname}
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-600">{u.email}</td>
                <td className="px-5 py-3.5 text-xs text-slate-600">{u.phone}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{u.address || '--'}</td>
                <td className="px-5 py-3.5 text-[10px] text-slate-400 whitespace-nowrap">
                  {u.createdAt ? new Date(u.createdAt).toLocaleString() : '--'}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <EmptyRow colSpan={5} label="No website sign-ups yet." />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Recruitment data — unlike the tabs above, this one is HR/Admin-only (see
// careerApplicationController.js). The parent decides whether to include
// this tab in TABS based on the viewer's role.
function CareerApplicationsTab({ items, search, onUpdateStatus }) {
  const [savingId, setSavingId] = useState(null);
  const filtered = items.filter(i => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return [i.firstName, i.lastName, i.email, i.phone, i.department].some(v => (v || '').toLowerCase().includes(q));
  });

  const handleStatus = async (id, status) => {
    setSavingId(id);
    try {
      await onUpdateStatus(id, status);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Experience</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Message</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted</th>
              <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.map(item => (
              <tr key={item._id} className="hover:bg-slate-50/60 transition-colors align-top">
                <td className="px-5 py-3.5">
                  <p className="font-bold text-xs text-slate-800">{item.firstName} {item.lastName}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Mail className="w-3 h-3 shrink-0" /> {item.email}</p>
                  <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3 shrink-0" /> {item.phone}</p>
                </td>
                <td className="px-5 py-3.5 text-xs font-semibold text-slate-600 max-w-[180px]">{item.department}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{item.experience || '--'}</td>
                <td className="px-5 py-3.5 text-xs text-slate-500 max-w-[240px]">{item.message || '--'}</td>
                <td className="px-5 py-3.5 text-[10px] text-slate-400 whitespace-nowrap">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : '--'}
                </td>
                <td className="px-5 py-3.5">
                  <StatusSelect
                    value={item.status}
                    options={CAREER_APPLICATION_STATUSES}
                    disabled={savingId === item._id}
                    onChange={(status) => handleStatus(item._id, status)}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <EmptyRow colSpan={6} label="No career applications yet." />}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const BASE_TABS = [
  { id: 'enquiries', label: 'Product Enquiries', icon: Package },
  { id: 'service', label: 'After-Sales Requests', icon: Wrench },
  { id: 'partners', label: 'Become a Partner', icon: Handshake },
  { id: 'users', label: 'Website Sign-ups', icon: Users },
];

export default function WebsiteActivityView({
  employee,
  productEnquiries = [],
  afterSalesServices = [],
  becomePartners = [],
  websiteUsers = [],
  careerApplications = [],
  onUpdateProductEnquiryStatus,
  onUpdateAfterSalesServiceStatus,
  onUpdateBecomePartnerStatus,
  onUpdateCareerApplicationStatus,
}) {
  const [tab, setTab] = useState('enquiries');
  const [search, setSearch] = useState('');

  // Career applications are HR/Admin-only (the API already enforces this —
  // req.user.role gate in careerApplicationController.js — this just keeps
  // the tab from showing up for roles that can't open it anyway).
  const canViewCareerApplications = employee?.role === 'Admin' || employee?.role === 'HR';
  const TABS = canViewCareerApplications
    ? [...BASE_TABS, { id: 'careers', label: 'Career Applications', icon: Briefcase }]
    : BASE_TABS;

  const counts = {
    enquiries: productEnquiries.length,
    service: afterSalesServices.length,
    partners: becomePartners.length,
    users: websiteUsers.length,
    careers: careerApplications.length,
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto font-sans text-slate-800 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" /> Website Activity
          </h2>
          <p className="text-xs text-slate-500 mt-1">Enquiries, service requests, partner leads, and sign-ups from the public website.</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                tab === t.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'bg-white border border-slate-100 text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${tab === t.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'}`}>
                {counts[t.id]}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center gap-2.5">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by name, email, phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
        />
      </div>

      {tab === 'enquiries' && (
        <ProductEnquiriesTab items={productEnquiries} search={search} onUpdateStatus={onUpdateProductEnquiryStatus} />
      )}
      {tab === 'service' && (
        <AfterSalesTab items={afterSalesServices} search={search} onUpdateStatus={onUpdateAfterSalesServiceStatus} />
      )}
      {tab === 'partners' && (
        <BecomePartnersTab items={becomePartners} search={search} onUpdateStatus={onUpdateBecomePartnerStatus} />
      )}
      {tab === 'users' && (
        <WebsiteUsersTab items={websiteUsers} search={search} />
      )}
      {tab === 'careers' && canViewCareerApplications && (
        <CareerApplicationsTab items={careerApplications} search={search} onUpdateStatus={onUpdateCareerApplicationStatus} />
      )}
    </div>
  );
}
