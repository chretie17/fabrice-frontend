import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, TextField, Tabs, Tab, Dialog, DialogTitle,
  DialogContent, DialogActions, IconButton, Chip, Typography,
  Box, Snackbar, Alert, CircularProgress,
  TablePagination
} from '@mui/material';
import {
  Edit, Delete, Flag, Search, Visibility, VisibilityOff,
  PushPin, ArrowUpward
} from '@mui/icons-material';
import ForumIcon from '@mui/icons-material/Forum';
import moment from 'moment';

const API_URL = 'http://localhost:3000/api'; // your backend URL

// Simple TabPanel
function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminContentManagement = () => {
  // Forum-only state
  const [tabValue, setTabValue] = useState(0);           // sub-tabs: 0=Topics, 1=Posts, 2=Flagged
  const [forumTopics, setForumTopics] = useState([]);
  const [forumPosts, setForumPosts] = useState([]);
  const [flaggedContent, setFlaggedContent] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchForumData();
  }, []);

  const fetchForumData = async () => {
    setLoading(true);
    try {
      const [topicsRes, flaggedRes] = await Promise.all([
        axios.get(`${API_URL}/admin/forum/topics`),
        axios.get(`${API_URL}/admin/flagged-content`)
      ]);
      setForumTopics(topicsRes.data || []);
      setFlaggedContent(flaggedRes.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Error loading forum data:', err);
      toast('Failed to load forum data', 'error');
      setLoading(false);
    }
  };

  const toast = (msg, severity = 'success') => {
    setSnackbarMessage(msg);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleTabChange = (_e, v) => {
    setTabValue(v);
    setPage(0);
  };

  const handleChangePage = (_e, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleTogglePinTopic = async (topic) => {
    try {
      const updated = !topic.is_pinned;
      await axios.put(`${API_URL}/admin/forum/topics/${topic.id}`, { is_pinned: updated });
      setForumTopics((prev) => prev.map(t => t.id === topic.id ? { ...t, is_pinned: updated } : t));
      toast(`Topic ${updated ? 'pinned' : 'unpinned'} successfully`);
    } catch (err) {
      console.error('Pin topic error:', err);
      toast('Failed to update topic', 'error');
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await axios.delete(`${API_URL}/admin/forum/topics/${topicId}`);
      setForumTopics((prev) => prev.filter(t => t.id !== topicId));
      if (selectedTopic === topicId) {
        setSelectedTopic(null);
        setForumPosts([]);
        setTabValue(0);
      }
      toast('Topic deleted successfully');
    } catch (err) {
      console.error('Delete topic error:', err);
      toast('Failed to delete topic', 'error');
    }
  };

  const handleLoadTopicPosts = async (topicId) => {
    setSelectedTopic(topicId);
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/admin/forum/topics/${topicId}/posts`);
      setForumPosts(res.data || []);
      setTabValue(1);
      setLoading(false);
    } catch (err) {
      console.error('Load posts error:', err);
      toast('Failed to load posts', 'error');
      setLoading(false);
    }
  };

  const handleOpenPostEditor = (post) => {
    // implement your own dialog if you want editing;
    // to keep this file lean (success stories removed), we only show the hook:
    console.log('Open post editor for', post);
  };

  // Filters
  const getFilteredTopics = () => {
    let filtered = [...forumTopics];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q)) ||
        t.creator_name.toLowerCase().includes(q)
      );
    }
    return filtered;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-8 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                <ForumIcon className="mr-2 text-blue-600" />
                <span className="border-b-4 border-blue-500 pb-1">Forum Management</span>
              </h1>
              <p className="text-gray-600 mt-2">Manage topics, posts, and flagged content</p>
            </div>
          </div>

          {/* Forum sub-tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="forum tabs">
              <Tab label="Topics" />
              <Tab label={selectedTopic ? 'Posts' : 'Posts (select a topic)'} disabled={!selectedTopic} />
              <Tab label={`Flagged (${flaggedContent.length})`} />
            </Tabs>
          </Box>

          {/* Search bar (applies to topics tab) */}
          {tabValue === 0 && (
            <div className="flex justify-between items-center mt-4 mb-2">
              <div className="relative w-full md:w-72">
                <TextField
                  placeholder="Search topics..."
                  variant="outlined"
                  fullWidth
                  size="small"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                    style: { borderRadius: '0.5rem' }
                  }}
                />
              </div>
            </div>
          )}

          {/* Topics */}
          <TabPanel value={tabValue} index={0}>
            {loading ? (
              <div className="flex justify-center my-12"><CircularProgress /></div>
            ) : getFilteredTopics().length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <Typography variant="h6" color="textSecondary">No topics found</Typography>
                <Typography variant="body2" color="textSecondary">
                  {searchTerm ? 'Try a different search' : 'No forum topics yet'}
                </Typography>
              </div>
            ) : (
              <>
                <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                  <Table>
                    <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                      <TableRow>
                        <TableCell width="40%">Topic</TableCell>
                        <TableCell width="15%">Creator</TableCell>
                        <TableCell width="10%">Posts</TableCell>
                        <TableCell width="15%">Last Activity</TableCell>
                        <TableCell width="20%" align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getFilteredTopics()
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((topic) => (
                          <TableRow
                            key={topic.id}
                            sx={{
                              '&:hover': { backgroundColor: '#f9fafb' },
                              backgroundColor: topic.is_pinned
                                ? 'rgba(236, 253, 245, 0.3)'
                                : topic.is_flagged
                                  ? 'rgba(254, 242, 242, 0.3)'
                                  : 'inherit'
                            }}
                          >
                            <TableCell>
                              <Typography
                                variant="subtitle2"
                                className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                                onClick={() => handleLoadTopicPosts(topic.id)}
                              >
                                {topic.is_pinned && <PushPin fontSize="small" className="mr-1 text-blue-600" />}
                                {topic.title}
                                {topic.is_flagged && <Flag fontSize="small" className="ml-1 text-red-500" />}
                              </Typography>
                              {topic.description && (
                                <Typography variant="body2" className="text-gray-600 line-clamp-1 mt-1">
                                  {topic.description}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                                  {topic.creator_name?.charAt(0).toUpperCase()}
                                </div>
                                <Typography variant="body2">{topic.creator_name}</Typography>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2" className="font-medium">{topic.post_count || 0}</Typography>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">
                                {topic.last_post_date ? moment(topic.last_post_date).format('MMM D, YYYY') : 'No posts'}
                              </Typography>
                              {topic.last_post_date && (
                                <Typography variant="caption" className="text-gray-500">
                                  {moment(topic.last_post_date).fromNow()}
                                </Typography>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                onClick={() => handleTogglePinTopic(topic)}
                                title={topic.is_pinned ? 'Unpin topic' : 'Pin topic'}
                              >
                                <PushPin className={topic.is_pinned ? 'text-blue-600' : 'text-gray-400'} />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleLoadTopicPosts(topic.id)}
                                title="View posts"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteTopic(topic.id)}
                                title="Delete topic"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <TablePagination
                  component="div"
                  count={getFilteredTopics().length}
                  page={page}
                  onPageChange={handleChangePage}
                  rowsPerPage={rowsPerPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  rowsPerPageOptions={[5, 10, 25]}
                />
              </>
            )}
          </TabPanel>

          {/* Posts */}
          <TabPanel value={tabValue} index={1}>
            {!selectedTopic ? (
              <Typography variant="subtitle1" className="text-center py-8">
                Select a topic to view posts
              </Typography>
            ) : loading ? (
              <div className="flex justify-center my-12"><CircularProgress /></div>
            ) : forumPosts.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <Typography variant="h6" color="textSecondary">No posts in this topic</Typography>
                <Typography variant="body2" color="textSecondary">This topic has no replies yet</Typography>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-4 border border-blue-100">
                  <Typography variant="subtitle1" className="flex items-center text-blue-800 font-semibold">
                    <ArrowUpward fontSize="small" className="mr-2" />
                    Viewing posts for topic: {forumTopics.find(t => t.id === selectedTopic)?.title}
                  </Typography>
                  <Button size="small" variant="text" onClick={() => setTabValue(0)} className="mt-2">
                    Back to topics
                  </Button>
                </div>

                {forumPosts.map((post, index) => (
                  <Paper
                    key={post.id}
                    elevation={0}
                    className="mb-4 border border-gray-200 rounded-xl overflow-hidden"
                    sx={{ backgroundColor: post.is_hidden ? 'rgba(243, 244, 246, 0.7)' : 'white' }}
                  >
                    <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="bg-gray-200 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                          {post.user_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <Typography variant="subtitle2" className="font-medium">
                            {post.user_name}
                            {index === 0 && (
                              <Chip
                                label="Topic Starter"
                                size="small"
                                className="ml-2"
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            )}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {moment(post.created_at).format('MMM D, YYYY [at] h:mm A')}
                          </Typography>
                        </div>
                      </div>

                      <div className="flex items-center">
                        {post.is_flagged && (
                          <Chip
                            icon={<Flag fontSize="small" />}
                            label="Flagged"
                            color="error"
                            size="small"
                            sx={{ mr: 2 }}
                          />
                        )}
                        {post.is_hidden && (
                          <Chip
                            icon={<VisibilityOff fontSize="small" />}
                            label="Hidden"
                            color="default"
                            size="small"
                            sx={{ mr: 2 }}
                          />
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      {post.is_hidden ? (
                        <div className="text-gray-500 italic">
                          <VisibilityOff fontSize="small" className="mr-2" />
                          This post has been hidden by a moderator
                        </div>
                      ) : (
                        <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
                          {post.content}
                        </Typography>
                      )}

                      
                    </div>
                  </Paper>
                ))}
              </>
            )}
          </TabPanel>

          {/* Flagged */}
          <TabPanel value={tabValue} index={2}>
            {loading ? (
              <div className="flex justify-center my-12"><CircularProgress /></div>
            ) : flaggedContent.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
                <Typography variant="h6" color="textSecondary">No flagged content</Typography>
                <Typography variant="body2" color="textSecondary">
                  There are no posts or topics flagged for review
                </Typography>
              </div>
            ) : (
              <TableContainer component={Paper} elevation={0} sx={{ borderRadius: '0.75rem', border: '1px solid #e5e7eb' }}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f9fafb' }}>
                    <TableRow>
                      <TableCell width="15%">Type</TableCell>
                      <TableCell width="40%">Content</TableCell>
                      <TableCell width="15%">Author</TableCell>
                      <TableCell width="15%">Flagged On</TableCell>
                      <TableCell width="15%" align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {flaggedContent.map((item) => (
                      <TableRow
                        key={`${item.type}-${item.id}`}
                        sx={{
                          '&:hover': { backgroundColor: '#f9fafb' },
                          backgroundColor: 'rgba(254, 242, 242, 0.2)'
                        }}
                      >
                        <TableCell>
                          <Chip
                            label={item.type === 'topic' ? 'Topic' : 'Post'}
                            color="error"
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="subtitle2" className="font-semibold text-gray-800">
                            {item.type === 'topic' ? item.title : `Re: ${item.topic_title}`}
                          </Typography>
                          <Typography variant="body2" className="text-gray-600 line-clamp-2 mt-1">
                            {item.content ? item.content.substring(0, 120) + '...' : item.description}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="bg-red-100 text-red-800 rounded-full w-8 h-8 flex items-center justify-center font-medium mr-2">
                              {item.author_name.charAt(0).toUpperCase()}
                            </div>
                            <Typography variant="body2">{item.author_name}</Typography>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {moment(item.flagged_at).format('MMM D, YYYY')}
                          </Typography>
                          <Typography variant="caption" className="text-gray-500">
                            {moment(item.flagged_at).fromNow()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {/* Hook up to your moderation endpoints */}
                          <Button
                            variant="outlined"
                            size="small"
                            color="success"
                            sx={{ mr: 1, borderRadius: '1rem' }}
                            onClick={() => toast('Approved (implement endpoint)')}
                          >
                            Approve
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => toast('Deleted (implement endpoint)')}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </div>
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminContentManagement;
