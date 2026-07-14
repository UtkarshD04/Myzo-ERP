import React from 'react';
import { FolderOpen, Upload, File, FileText, Image, Trash2 } from 'lucide-react';

export default function DocumentsView() {
  const documents = [
    { id: 1, name: 'Employee Handbook 2026.pdf', type: 'pdf', size: '2.4 MB', date: '2026-01-15' },
    { id: 2, name: 'Leave Policy.docx', type: 'doc', size: '1.2 MB', date: '2026-02-20' },
    { id: 3, name: 'Company Org Chart.png', type: 'image', size: '3.8 MB', date: '2026-03-10' },
    { id: 4, name: 'Benefits Guide.pdf', type: 'pdf', size: '4.1 MB', date: '2026-04-05' },
    { id: 5, name: 'Expense Policy.pdf', type: 'pdf', size: '1.8 MB', date: '2026-05-12' },
  ];

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-8 h-8 text-red-500" />;
      case 'doc': return <FileText className="w-8 h-8 text-blue-500" />;
      case 'image': return <Image className="w-8 h-8 text-purple-500" />;
      default: return <File className="w-8 h-8 text-slate-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Documents</h2>
            <p className="text-xs text-slate-500 mt-1">Access and manage company documents</p>
          </div>
          <button 
            className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                {getFileIcon(doc.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-slate-800 truncate">{doc.name}</h4>
                <div className="flex items-center space-x-2 mt-1 text-[10px] text-slate-400">
                  <span>{doc.size}</span>
                  <span>•</span>
                  <span>{doc.date}</span>
                </div>
              </div>

              <button className="p-2 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>

            <div className="mt-4 flex items-center space-x-2">
              <button className="flex-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-all">
                View
              </button>
              <button className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-semibold rounded-lg transition-all">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
