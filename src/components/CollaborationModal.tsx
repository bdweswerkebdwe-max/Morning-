import React, { useState } from 'react';
import { Share2, Users, MessageSquare, Copy, CheckCircle2, ShieldCheck, X, Plus, Send } from 'lucide-react';
import { User, Project } from '../types';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  currentUser: User | null;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
}

interface CommentItem {
  id: string;
  userName: string;
  text: string;
  timestamp: string;
}

export const CollaborationModal: React.FC<CollaborationModalProps> = ({ isOpen, onClose, project, currentUser }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: 'tm_1', name: 'أحمد المحمود', email: 'ahmed@moulin.ai', role: 'admin' },
    { id: 'tm_2', name: 'سارة خالد', email: 'sara@moulin.ai', role: 'editor' },
  ]);

  const [comments, setComments] = useState<CommentItem[]>([
    { id: 'c_1', userName: 'سارة خالد', text: 'فيديو رائع جداً! أقترح زيادة سرعة الخطاف في أول 3 ثواني.', timestamp: 'قبل 10 دقائق' },
  ]);

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [newComment, setNewComment] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `https://ais-dev-e67fcmtvfcuqkqrr3ztzsb-679154914423.europe-west2.run.app/preview/${project?.id || 'prj_1'}`;

  const handleCopyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAddMember = () => {
    if (!newEmail.trim()) return;
    const member: TeamMember = {
      id: 'tm_' + Date.now(),
      name: newEmail.split('@')[0],
      email: newEmail,
      role: newRole,
    };
    setTeamMembers([...teamMembers, member]);
    setNewEmail('');
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const item: CommentItem = {
      id: 'c_' + Date.now(),
      userName: currentUser?.name || 'مستخدم',
      text: newComment,
      timestamp: 'الآن',
    };
    setComments([...comments, item]);
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4" dir="rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">التعاون وإدارة الفريق ({project?.title || 'المشروع'})</h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-xl">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Link Section */}
        <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <label className="text-xs font-bold text-slate-300 block">رابط المعاينة والمشاركة الآمنة:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono"
            />
            <button
              onClick={handleCopyShareLink}
              className="bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap flex items-center gap-1"
            >
              {isCopied ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{isCopied ? 'تم النسخ' : 'نسخ الرابط'}</span>
            </button>
          </div>
        </div>

        {/* Add Team Member */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-300">أعضاء الفريق والصلاحيات:</h3>
          <div className="flex items-center gap-2">
            <input
              type="email"
              placeholder="البريد الإلكتروني للزميل..."
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2"
            >
              <option value="editor">محرر (Editor)</option>
              <option value="viewer">مشاهد (Viewer)</option>
              <option value="admin">مدير (Admin)</option>
            </select>
            <button
              onClick={handleAddMember}
              className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap"
            >
              إضافة +
            </button>
          </div>

          <div className="space-y-2">
            {teamMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-200">{m.name} ({m.email})</span>
                <span className="bg-slate-800 text-amber-400 px-2 py-0.5 rounded font-bold uppercase">{m.role}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comments Feed */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <h3 className="text-xs font-bold text-slate-300 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-amber-400" />
            <span>التعليقات والملاحظات على المشروع:</span>
          </h3>

          <div className="space-y-2 max-h-36 overflow-y-auto scrollbar-thin">
            {comments.map(c => (
              <div key={c.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span className="font-bold text-amber-400">{c.userName}</span>
                  <span>{c.timestamp}</span>
                </div>
                <p className="text-slate-200">{c.text}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="اكتب ملاحظة أو تعليق للفريق..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
            />
            <button
              onClick={handleAddComment}
              className="bg-amber-600 hover:bg-amber-500 text-white p-2 rounded-xl"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
