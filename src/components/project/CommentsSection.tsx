// src/components/project/CommentsSection.tsx

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { UserCircle2, Trash2, Send } from 'lucide-react';
import api from '../../lib/api';
import { getCloudinaryImageUrl } from '../../lib/cloudinary';
import type { Comment, FetchCommentsResponse } from '../../types'; // CommentUser kaldırıldı

// --- Alt Bileşen: Tek Bir Yorum ---
function CommentItem({ comment, onDelete }: {
  comment: Comment;
  onDelete: (commentId: number) => void;
}) {
  const { user } = useAuth();
  const canDelete = user?.id === comment.user.id || user?.role === 'ADMIN' || user?.role === 'MODERATOR';
  const avatarUrl = getCloudinaryImageUrl(comment.user.profileImagePublicId);

  return (
    <div className="flex space-x-4 py-4 border-b border-prestij-border-primary last:border-b-0">
      {avatarUrl ? (
          <img src={avatarUrl} alt={comment.user.username} className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <UserCircle2 className="w-10 h-10 text-gray-500" />
        )}
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <span className="font-semibold text-white mr-2">{comment.user.username}</span>
            <span className="text-gray-400 text-xs">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: tr })}
            </span>
          </div>
          {canDelete && (
            <button onClick={() => onDelete(comment.id)} className="text-gray-500 hover:text-red-500 transition-colors" title="Yorumu Sil">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-gray-300 mt-1 text-sm leading-relaxed whitespace-pre-wrap">{comment.content}</p>
      </div>
    </div>
  );
}

// --- Alt Bileşen: Yorum Yapma Formu ---
function CommentForm({ projectId, onCommentAdded }: {
  projectId: number;
  onCommentAdded: (newComment: Comment) => void;
}) {
  const { user, isAuthenticated } = useAuth();
  const avatarUrl = getCloudinaryImageUrl(user?.profileImagePublicId);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await api.post(`/projects/${projectId}/comments`, { content });
      toast.success('Yorumunuz eklendi!');
      onCommentAdded(response.data);
      setContent('');
    } catch {
      toast.error('Yorum eklenemedi, lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return <p className="text-sm text-gray-400 my-4">Yorum yapmak için giriş yapmalısınız.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 mb-8 flex items-start gap-4">
      <div className="w-10 h-10 flex-shrink-0">
        {avatarUrl ? (
          <img src={avatarUrl} alt={user?.username} className="w-10 h-10 rounded-full object-cover"/>
        ) : (
          <UserCircle2 className="w-10 h-10 text-gray-500" />
        )}
      </div>
      <div className="flex-1">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Yorumunuzu yazın..."
          rows={3}
          className="w-full p-3 bg-prestij-bg-dark-2 border border-prestij-border-primary rounded-md text-sm text-gray-200 focus:ring-1 focus:ring-prestij-purple focus:border-prestij-purple placeholder-prestij-text-placeholder"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !content.trim()} className="mt-3 px-4 py-2 bg-prestij-purple hover:bg-prestij-purple-darker text-white text-sm font-medium rounded-md disabled:opacity-50 flex items-center gap-2">
          {isLoading ? 'Gönderiliyor...' : 'Yorum Yap'}
          {!isLoading && <Send className="w-4 h-4" />}
        </button>
      </div>
    </form>
  );
}

// --- Ana Bileşen ---
export default function CommentsSection({ projectId }: { projectId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalComments, setTotalComments] = useState(0);

  const fetchComments = useCallback(async (page = 1) => {
    if (page === 1) setIsLoading(true); // Sadece ilk yüklemede tam ekran yükleme göster
    try {
      const response = await api.get<FetchCommentsResponse>(`/projects/${projectId}/comments?page=${page}&limit=5`);
      const data = response.data;
      setComments(prev => page === 1 ? data.comments : [...prev, ...data.comments]);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setTotalComments(data.totalComments);
    } catch { // Parametresiz catch
      toast.error('Yorumlar yüklenemedi.');
    } finally {
      setIsLoading(false);
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleCommentAdded = (newComment: Comment) => {
    setComments(prev => [newComment, ...prev]);
    setTotalComments(prev => prev + 1);
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) return;
    try {
      // Varsayılan API yolunu varsayıyoruz: DELETE /api/comments/[commentId]
      // Web sitenizde bu endpoint'in olması gerekir.
      await api.delete(`/comments/${commentId}`);
      toast.success('Yorum başarıyla silindi.');
      setComments(prev => prev.filter(c => c.id !== commentId));
      setTotalComments(prev => prev - 1);
    } catch { // Parametresiz catch
      toast.error('Yorum silinemedi.');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-white mb-1">
        Yorumlar ({totalComments.toLocaleString('tr-TR')})
      </h3>
      <CommentForm projectId={projectId} onCommentAdded={handleCommentAdded} />
      
      {isLoading && comments.length === 0 && <p className="text-gray-400">Yorumlar yükleniyor...</p>}
      {!isLoading && comments.length === 0 && <p className="text-gray-400">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>}
      
      <div>
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} onDelete={handleDeleteComment} />
        ))}
      </div>

      {currentPage < totalPages && !isLoading && (
        <div className="mt-6 text-center">
          <button onClick={() => fetchComments(currentPage + 1)} className="px-4 py-2 bg-prestij-bg-button hover:bg-prestij-bg-dark-2 text-gray-200 text-sm rounded-md">
            Daha Fazla Yorum Yükle
          </button>
        </div>
      )}
    </div>
  );
}