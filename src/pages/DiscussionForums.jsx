import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  MessageCircle,
  Send,
  PlusCircle,
  X,
  User,
  Clock,
  Edit3,
  ThumbsUp,
} from 'lucide-react';
import BackendPort from '../api';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef((props, ref) => {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const CommunityForum = () => {
  const [posts, setPosts] = useState([]);
  const [expandedPost, setExpandedPost] = useState(null);
  const [newPost, setNewPost] = useState({ title: '', content: '', floors: '' });
  const [comment, setComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ floor: '' });
  const [tenantId] = useState(localStorage.getItem('userId'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchPosts();
  }, [searchQuery, filters]);

  // All the existing functions remain unchanged
  const fetchPosts = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(BackendPort.getApiUrl('community/posts'), {
        params: { search: searchQuery, floor: filters.floor },
      });
      setPosts(response.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load discussions. Please try again.');
      setSnackbar({ open: true, message: 'Failed to load discussions.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(
        BackendPort.getApiUrl(`community/posts/${postId}/comments`)
      );
      const commentsWithLikes = await Promise.all(
        response.data.map(async (comment) => {
          const likesResponse = await axios.get(
            BackendPort.getApiUrl(`community/comments/${comment.id}/likes`)
          );
          return { ...comment, likes: likesResponse.data.like_count };
        })
      );
      setExpandedPost((prevPost) => ({
        ...prevPost,
        comments: commentsWithLikes,
      }));
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleExpandPost = (post) => {
    if (expandedPost?.id === post.id) {
      setExpandedPost(null);
    } else {
      setExpandedPost(post);
      fetchComments(post.id);
    }
  };

  const handleAddComment = async (postId) => {
    if (!comment.trim()) return setSnackbar({ open: true, message: 'Comment cannot be empty.', severity: 'error' });
    try {
      await axios.post(BackendPort.getApiUrl('community/comments'), {
        post_id: postId,
        tenant_id: tenantId,
        content: comment,
      });
      setSnackbar({ open: true, message: 'Comment added successfully!', severity: 'success' });
      setComment('');
      fetchComments(postId);
    } catch (err) {
      console.error('Error adding comment:', err);
      setSnackbar({ open: true, message: 'Failed to add comment. Please try again.', severity: 'error' });
    }
  };

  const handleLikeComment = async (commentId) => {
    try {
      await axios.post(BackendPort.getApiUrl('community/comments/like'), {
        comment_id: commentId,
        tenant_id: tenantId,
      });
      fetchComments(expandedPost.id);
    } catch (err) {
      console.error('Error liking comment:', err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.content.trim()) {
      return setSnackbar({ open: true, message: 'Title and content are required.', severity: 'error' });
    }
    try {
      await axios.post(BackendPort.getApiUrl('community/posts'), {
        tenant_id: tenantId,
        title: newPost.title,
        content: newPost.content,
        floors: newPost.floors || 'All Floors',
      });
      setSnackbar({ open: true, message: 'Post created successfully! Awaiting moderation.', severity: 'success' });
      setNewPost({ title: '', content: '', floors: '' });
      setIsCreatingPost(false);
      fetchPosts();
    } catch (err) {
      console.error('Error creating post:', err);
      setSnackbar({ open: true, message: 'Failed to create post. Please try again.', severity: 'error' });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8 md:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 mb-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-indigo-900 flex items-center">
            <MessageCircle className="mr-3 text-indigo-600" size={32} />
            Community Hub
          </h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 bg-white/80 backdrop-blur-sm"
            />
            <select
              value={filters.floor}
              onChange={(e) => setFilters({ ...filters, floor: e.target.value })}
              className="px-4 py-2 rounded-lg border-2 border-indigo-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 bg-white/80 backdrop-blur-sm"
            >
              <option value="">All Floors</option>
              {[...Array(10)].map((_, i) => (
                <option key={i} value={i + 1}>
                  Floor {i + 1}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* New Discussion Button */}
        {!isCreatingPost && (
          <button
            onClick={() => setIsCreatingPost(true)}
            className="group flex items-center bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 mb-8"
          >
            <PlusCircle className="mr-2 group-hover:rotate-90 transition-transform duration-300" size={20} />
            New Discussion
          </button>
        )}

        {/* Create Post Form */}
        {isCreatingPost && (
          <div className="bg-white/90 backdrop-blur-lg shadow-2xl rounded-2xl p-6 md:p-8 mb-8 border border-indigo-100 animate-slideDown">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-indigo-900 flex items-center">
                <Edit3 className="mr-3 text-indigo-600" size={24} />
                Start a Discussion
              </h2>
              <button
                onClick={() => setIsCreatingPost(false)}
                className="text-gray-500 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreatePost} className="space-y-6">
              <input
                type="text"
                placeholder="Discussion Title"
                value={newPost.title}
                onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
                required
              />
              <textarea
                placeholder="Share your thoughts..."
                value={newPost.content}
                onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl min-h-[150px] focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 resize-none"
                required
              />
              <select
                value={newPost.floors}
                onChange={(e) => setNewPost({ ...newPost, floors: e.target.value })}
                className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200"
              >
                <option value="">Share with All Floors</option>
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    Share with Floor {i + 1}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
              >
                <Send className="mr-2" size={20} />
                Post Discussion
              </button>
            </form>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center text-indigo-600 animate-pulse p-8">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" />
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-100" />
                <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          ) : error ? (
            <div className="text-center text-red-500 bg-red-50 p-6 rounded-xl border border-red-200">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center text-indigo-800 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
              <MessageCircle size={48} className="mx-auto mb-4 text-indigo-600" />
              <p className="font-medium">No discussions yet. Start the first one!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-indigo-100 overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <div className="p-6">
                  <h2 className="text-xl md:text-2xl font-bold text-indigo-900 mb-3">{post.title}</h2>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                  <div className="flex flex-wrap items-center text-sm text-gray-500 mb-4 gap-3">
                    <div className="flex items-center">
                      <User size={16} className="text-indigo-600 mr-2" />
                      <span className="font-medium">{post.tenant_name}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock size={16} className="text-indigo-600 mr-2" />
                      <span>{new Date(post.created_at).toLocaleString()}</span>
                    </div>
                    {post.floors && (
                      <span className="text-indigo-800 bg-indigo-50 px-3 py-1 rounded-full text-sm font-medium">
                        Floor {post.floors}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleExpandPost(post)}
                    className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center transition-colors duration-200"
                  >
                    <MessageCircle size={16} className="mr-2" />
                    {expandedPost?.id === post.id ? 'Hide Comments' : 'View Comments'}
                  </button>
                </div>

                {expandedPost?.id === post.id && (
                  <div className="bg-indigo-50/80 backdrop-blur-sm p-6 border-t border-indigo-100">
                    <h3 className="text-xl font-semibold text-indigo-900 mb-4 flex items-center">
                      <MessageCircle size={20} className="mr-3 text-indigo-600" />
                      Comments
                    </h3>
                    <div className="space-y-4 mb-6">
                      {expandedPost.comments?.length > 0 ? (
                        expandedPost.comments.map((comment) => (
                          <div key={comment.id} className="bg-white p-4 rounded-xl shadow-md transition-all duration-200 hover:shadow-lg">
                            <p className="text-gray-700 mb-2">{comment.content}</p>
                            <div className="flex flex-wrap items-center text-sm text-gray-500 gap-3">
                              <div className="flex items-center">
                                <User size={14} className="text-indigo-600 mr-2" />
                                <span className="font-medium">{comment.tenant_name}</span>
                              </div>
                              <div className="flex items-center">
                                <Clock size={14} className="text-indigo-600 mr-2" />
                                <span>{new Date(comment.created_at).toLocaleString()}</span>
                              </div>
                              <button
                                onClick={() => handleLikeComment(comment.id)}
                                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
                              >
                                <ThumbsUp size={14} />
                                <span>{comment.likes} Likes</span>
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500 text-center py-8 bg-white/50 rounded-xl backdrop-blur-sm">
                          <MessageCircle size={24} className="mx-auto mb-2 text-indigo-600" />
                          <p>No comments yet. Be the first to comment!</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add your comment..."
                        className="flex-grow px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition duration-200 resize-none bg-white/80 backdrop-blur-sm"
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center whitespace-nowrap"
                      >
                        <Send className="mr-2" size={20} />
                        Send
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          className="!bg-gradient-to-r !from-indigo-600 !to-blue-600"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CommunityForum;