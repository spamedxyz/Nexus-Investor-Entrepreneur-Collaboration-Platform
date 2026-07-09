/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FileText, Upload, Plus, Shield, CheckCircle, Clock, Check, FileCheck, HelpCircle, Download, AlertTriangle, UserCheck, Trash2 } from 'lucide-react';

interface DocumentsPanelProps {
  user: any;
  profile: any;
  onNavigateToTab: (tab: string) => void;
}

export default function DocumentsPanel({ user, profile, onNavigateToTab }: DocumentsPanelProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Upload States
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState<'pitch_deck' | 'financials' | 'term_sheet' | 'cap_table' | 'legal'>('pitch_deck');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Active Doc Preview States
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [signerTitle, setSignerTitle] = useState('');
  const [signError, setSignError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [selectedCategory]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let query = '/api/documents';
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch(query, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (selectedCategory) {
        setDocuments(data.filter((d: any) => d.category === selectedCategory));
      } else {
        setDocuments(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setUploadTitle(file.name);
      setUploadDesc(`Uploaded via secure Drag-and-Drop: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    }
  };

  const handleManualFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setUploadTitle(file.name);
      setUploadDesc(`Secured via manual browse: ${file.name} (${Math.round(file.size / 1024)} KB)`);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadError(null);
    setUploadSuccess(false);

    if (!uploadTitle) {
      setUploadError('Please select a file or specify a document title');
      return;
    }

    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: uploadTitle,
          description: uploadDesc,
          category: uploadCategory,
          // Simulated secure document URL thumbnail fallback
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80'
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to submit document');

      setUploadSuccess(true);
      setUploadTitle('');
      setUploadDesc('');
      fetchDocuments();
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setUploadError(err.message);
    }
  };

  const handleSignDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignError(null);

    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch(`/api/documents/${previewDoc.id}/sign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: signerTitle || 'Executive Partner' })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signature execution failed');

      setPreviewDoc(data);
      setSignerTitle('');
      fetchDocuments();
    } catch (err: any) {
      setSignError(err.message);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm('Are you absolutely sure you want to delete this document from the chamber?')) return;
    try {
      const token = localStorage.getItem('nexus_auth_token');
      const response = await fetch(`/api/documents/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete document');
      }

      setPreviewDoc(null);
      fetchDocuments();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div id="documents-panel" className="space-y-6 animate-in fade-in duration-300">
      
      {/* Visual Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-10%] w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-72 h-72 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 relative">
          <div className="space-y-1">
            <h1 className="text-2xl md:text-3xl font-display font-semibold tracking-tight">Venture Document Chamber</h1>
            <p className="text-slate-300 text-sm">
              Review investment materials, cap tables, and legal structures with cryptographically stamped multi-party e-signatures.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Grid: Upload & Document Directory */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Categories Tab Bar */}
          <div className="flex gap-1.5 flex-wrap">
            {[
              { label: 'All Files', value: '' },
              { label: 'Pitch Decks', value: 'pitch_deck' },
              { label: 'Financials', value: 'financials' },
              { label: 'Term Sheets', value: 'term_sheet' },
              { label: 'Cap Tables', value: 'cap_table' },
              { label: 'Legal Structures', value: 'legal' }
            ].map(tab => (
              <button
                key={tab.value}
                onClick={() => setSelectedCategory(tab.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedCategory === tab.value 
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Directory Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1,2].map(n => <div key={n} className="h-32 rounded-xl bg-slate-100 dark:bg-slate-900 animate-pulse"></div>)}
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <p className="text-xs text-slate-400">No documents registered in this chamber category</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const isSigned = doc.electronicSignatures.some((s: any) => s.userId === user.id);
                const signedCount = doc.electronicSignatures.length;

                return (
                  <div 
                    key={doc.id} 
                    id={`doc-card-${doc.id}`}
                    onClick={() => setPreviewDoc(doc)}
                    className={`p-4 rounded-xl border flex flex-col justify-between cursor-pointer hover:shadow-md transition-all ${
                      previewDoc?.id === doc.id 
                        ? 'border-indigo-500 bg-indigo-500/5 dark:bg-indigo-500/10' 
                        : 'border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-lg shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[8px] text-slate-400 font-mono capitalize">
                          {doc.category.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="space-y-0.5">
                        <h4 className="font-semibold text-xs text-slate-800 dark:text-white truncate" title={doc.title}>
                          {doc.title}
                        </h4>
                        <p className="text-[10px] text-slate-400">Uploaded by {doc.userName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 dark:border-slate-900">
                      <div className="flex items-center gap-1">
                        {signedCount > 0 ? (
                          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5">
                            <FileCheck className="w-3.5 h-3.5" /> {signedCount} Signed
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">No signatures yet</span>
                        )}
                      </div>

                      {isSigned && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-mono text-emerald-500">
                          Signed By You
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Right Grid: Upload Area or Document Preview Drawer */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Active Preview Area */}
          {previewDoc ? (
            <div className="p-5 rounded-2xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 space-y-5 animate-in slide-in-from-right-2 duration-200">
              
              {/* Preview Header */}
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-900 pb-3">
                <div className="space-y-1">
                  <h3 className="font-display font-semibold text-xs text-slate-900 dark:text-white">{previewDoc.title}</h3>
                  <p className="text-[10px] text-slate-400">Category: <span className="capitalize">{previewDoc.category.replace('_', ' ')}</span></p>
                </div>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                >
                  ✕
                </button>
              </div>

              {/* PDF Mock Visual Canvas layout */}
              <div className="p-8 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-inner relative overflow-hidden">
                <div className="absolute top-2 left-2 text-[8px] text-slate-400 font-mono uppercase tracking-widest">Page 1 of 12</div>
                
                <FileText className="w-12 h-12 text-slate-400 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">SECURE PDF CONTAINER</p>
                  <p className="text-[10px] text-slate-400 max-w-xs mx-auto leading-normal">
                    {previewDoc.description || 'Enterprise investment material with integrated cryptographic ledger signing protections.'}
                  </p>
                </div>
                
                <div className="pt-2">
                  <button
                    onClick={() => alert('Demo sandbox: This would trigger PDF file download.')}
                    className="py-1 px-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg text-[10px] font-mono inline-flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> DOWNLOAD FILE
                  </button>
                </div>
              </div>

              {/* Multi-party Signatures Tracker list */}
              <div className="space-y-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Electronic Signatures</span>
                
                <div className="space-y-2">
                  {previewDoc.electronicSignatures.length === 0 ? (
                    <div className="p-3 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs italic">
                      No signatures applied yet. Seal this deal by signing below.
                    </div>
                  ) : (
                    previewDoc.electronicSignatures.map((sig: any, i: number) => (
                      <div key={i} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-start justify-between">
                        <div className="space-y-0.5">
                          <p className="text-xs font-semibold">{sig.name}</p>
                          <p className="text-[9px] text-slate-400 block">{sig.title} • IP {sig.ip}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] font-mono bg-emerald-500/15 px-2 py-0.5 rounded-full inline-block">
                            CERTIFIED
                          </span>
                          <span className="text-[8px] text-slate-400 block mt-1 font-mono">
                            {new Date(sig.signedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Signature Application Form */}
              {!previewDoc.electronicSignatures.some((s: any) => s.userId === user.id) && (
                <form onSubmit={handleSignDocument} className="pt-3 border-t border-slate-100 dark:border-slate-900 space-y-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Apply Your Cryptographic Seal</span>
                  
                  {signError && (
                    <div className="p-2 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] text-rose-500">
                      {signError}
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs">
                    <label className="text-[10px] text-slate-500">Corporate Title</label>
                    <input
                      type="text"
                      required
                      id="doc-signer-title-input"
                      value={signerTitle}
                      onChange={(e) => setSignerTitle(e.target.value)}
                      placeholder="e.g. Managing Partner / CEO"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    id="doc-sign-submit"
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-500/10"
                  >
                    <CheckCircle className="w-4 h-4" /> Electronically Sign Document
                  </button>
                </form>
              )}

              {/* Owner Delete Button */}
              {(previewDoc.userId === user.id || user.role === 'admin') && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-900">
                  <button
                    onClick={() => handleDeleteDocument(previewDoc.id)}
                    id="doc-delete-button"
                    className="w-full py-2 border border-rose-500/30 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Document From Chamber
                  </button>
                </div>
              )}

            </div>
          ) : (
            /* Upload Portal Card */
            <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-slate-950/40 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-900 pb-3">
                <Upload className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Secure Upload Tunnel</h3>
              </div>

              <form onSubmit={handleUploadDocument} className="space-y-4 text-xs">
                
                {uploadError && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500">
                    {uploadError}
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-3 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>Document secured inside Chamber!</span>
                  </div>
                )}

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('doc-file-input')?.click()}
                  id="drag-drop-zone"
                  className={`border-2 border-dashed rounded-xl p-6 text-center space-y-2 cursor-pointer transition-all ${
                    isDragging 
                      ? 'border-indigo-500 bg-indigo-500/5' 
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/10 dark:bg-slate-950/10'
                  }`}
                >
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Drag & Drop Document Here</p>
                    <p className="text-[10px] text-slate-400">PDF, XLS, DOC up to 50MB</p>
                  </div>
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400 hover:underline font-semibold block">
                    or browse local filesystem
                  </span>
                </div>
                <input
                  type="file"
                  id="doc-file-input"
                  onChange={handleManualFileSelect}
                  className="hidden"
                />

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500">Document Title</label>
                  <input
                    type="text"
                    required
                    id="doc-upload-title-input"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. Cap_Table_V2.xlsx"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500">Chamber Classification</label>
                  <select
                    value={uploadCategory}
                    id="doc-upload-category-select"
                    onChange={(e) => setUploadCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="pitch_deck">Pitch Deck Summary</option>
                    <option value="financials">Financial Statements</option>
                    <option value="term_sheet">Investment Term Sheet</option>
                    <option value="cap_table">Cap Table Distribution</option>
                    <option value="legal">Legal & IP Structures</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-500">Document Description / Overview</label>
                  <textarea
                    value={uploadDesc}
                    id="doc-upload-desc-textarea"
                    onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="Brief description of file Tractions..."
                    rows={2}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  id="doc-upload-submit"
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Shield className="w-3.5 h-3.5" /> Secure File in Chamber
                </button>
              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
