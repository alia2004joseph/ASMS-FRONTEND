import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Material, Subject } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  BookOpen,
  Download,
  UploadCloud,
  FileText,
  Search,
  Filter,
  Trash2,
  Lock,
  User,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Modal } from '../common/Modal';

export const MaterialsModule: React.FC = () => {
  const { user, isClassRep } = useAuth();
  const { showToast } = useNotifications();

  const [materials, setMaterials] = useState<Material[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Upload form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [category, setCategory] = useState<Material['category']>('LECTURE_NOTES');
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [mats, subs] = await Promise.all([api.getMaterials(), api.getSubjects()]);
      setMaterials(mats);
      setSubjects(subs);
      if (subs.length > 0 && !subjectId) {
        setSubjectId(subs[0].id);
      }
    } catch (err) {
      console.error('Failed to load materials data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (mat: Material) => {
    try {
      setDownloadingId(mat.id);
      const res = await api.downloadMaterial(mat.id);
      showToast('Material Download Authorized', `Access granted for ${res.file_name}. Download starting...`, 'success');
      
      // Update local download count
      setMaterials((prev) =>
        prev.map((m) => (m.id === mat.id ? { ...m, download_count: m.download_count + 1 } : m))
      );
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Download authorization failed';
      showToast('Access Denied', errorMsg, 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (mat: Material) => {
    if (!confirm(`Are you sure you want to delete "${mat.title}"?`)) return;
    try {
      await api.deleteMaterial(mat.id);
      setMaterials((prev) => prev.filter((m) => m.id !== mat.id));
      showToast('Material Deleted', 'The course material has been removed.', 'info');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Delete failed';
      showToast('Delete Failed', errorMsg, 'error');
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) {
      showToast('Validation Error', 'Title and Subject are required fields.', 'warning');
      return;
    }

    try {
      setUploading(true);
      const created = await api.uploadMaterial({
        title,
        description,
        subject_id: subjectId,
        classroom_id: 'class-me-y3',
        category,
        file_name: fileName.trim() || `${title.replace(/\s+/g, '_').slice(0, 20)}.pdf`,
        file_size: '2.8 MB',
        file_type: 'application/pdf',
      });

      setMaterials((prev) => [created, ...prev]);
      showToast('Material Published & Students Notified', 'In-app notification and emails dispatched to enrolled students.', 'success');
      setUploadModalOpen(false);
      setTitle('');
      setDescription('');
      setFileName('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Upload failed';
      showToast('Upload Failed', errorMsg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const filtered = materials.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.file_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'ALL' || m.subject_id === selectedSubject;
    const matchesCategory = selectedCategory === 'ALL' || m.category === selectedCategory;
    return matchesSearch && matchesSubject && matchesCategory;
  });

  const getCategoryBadge = (cat: Material['category']) => {
    switch (cat) {
      case 'LECTURE_NOTES':
        return <Badge variant="info">Lecture Notes</Badge>;
      case 'ASSIGNMENT':
        return <Badge variant="danger">Assignment</Badge>;
      case 'LAB_MANUAL':
        return <Badge variant="warning">Lab Manual</Badge>;
      case 'PAST_PAPER':
        return <Badge variant="purple">Past Paper</Badge>;
      case 'REFERENCE':
        return <Badge variant="success">Reference</Badge>;
      default:
        return <Badge>{cat}</Badge>;
    }
  };

  const canUpload = user?.role === 'LECTURER' || user?.role === 'ADMIN' || isClassRep;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Class Course Materials Repository
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">Academic Materials & Lecture Notes</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Protected digital materials repository with role-based access validation and automated email notifications.
          </p>
        </div>

        {canUpload && (
          <button
            onClick={() => setUploadModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload New Material</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search material title, keywords, or filename..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="LECTURE_NOTES">Lecture Notes</option>
            <option value="ASSIGNMENT">Assignments</option>
            <option value="LAB_MANUAL">Lab Manuals</option>
            <option value="PAST_PAPER">Past Papers</option>
            <option value="REFERENCE">References</option>
          </select>
        </div>
      </div>

      {/* Materials List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-xs">Loading course materials...</div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
          No materials match your search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((mat) => {
            const subject = mat.subject || subjects.find((s) => s.id === mat.subject_id);
            const isDownloading = downloadingId === mat.id;

            return (
              <div
                key={mat.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                      {subject?.code || 'Course'}
                    </span>
                    {getCategoryBadge(mat.category)}
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-1.5">{mat.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{mat.description}</p>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs text-slate-600 mb-4">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <span className="font-mono text-slate-800 font-semibold truncate">{mat.file_name}</span>
                    </div>
                    <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">{mat.file_size}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      Uploaded by {mat.uploaded_by ? `${mat.uploaded_by.first_name} ${mat.uploaded_by.last_name}` : 'Staff'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {new Date(mat.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    {mat.download_count} downloads
                  </span>

                  <div className="flex items-center gap-2">
                    {(user?.role === 'ADMIN' || mat.uploaded_by_id === user?.id || isClassRep) && (
                      <button
                        onClick={() => handleDelete(mat)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete material"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleDownload(mat)}
                      disabled={isDownloading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-all disabled:opacity-50"
                    >
                      {isDownloading ? (
                        <span>Checking...</span>
                      ) : (
                        <>
                          <Download className="w-3.5 h-3.5" />
                          <span>Download File</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Material Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload New Course Material"
        subtitle="Enrolled students will receive instant in-app and email notifications"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Subject / Course *</label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
              required
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Material Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Material['category'])}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="LECTURE_NOTES">Lecture Notes</option>
              <option value="ASSIGNMENT">Assignment / Task</option>
              <option value="LAB_MANUAL">Lab Manual / Practical Guide</option>
              <option value="PAST_PAPER">Past Paper / Exam Solution</option>
              <option value="REFERENCE">Textbook / Reference</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              placeholder="e.g. Lecture 05: Navier-Stokes Differential Formulation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">File Name (simulated upload)</label>
            <input
              type="text"
              placeholder="e.g. ME304_Lecture05_NavierStokes.pdf"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Instructions</label>
            <textarea
              rows={3}
              placeholder="Provide instructions, reading guidelines, or submission due dates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white text-slate-800"
            />
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Security Policy: Files are strictly protected. Only students officially enrolled in this ASMS class can authenticate and download this material.
            </p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{uploading ? 'Publishing...' : 'Publish & Broadcast'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
