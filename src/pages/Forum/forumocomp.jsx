import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from 'axios';
const API_URL = 'http://localhost:3000/api'; // replace with your backend URL
import moment from 'moment';

const ForumComponent = ({ 
    topics, 
    topicsToShow,
    currentTopic, 
    setCurrentTopic, 
    userLikes, 
    searchTerm, 
    setSearchTerm, 
    user_id,
    fetchData,
    setSnackbarMessage,
    setSnackbarSeverity,
    setOpenSnackbar
}) => {
    const [openNewTopicDialog, setOpenNewTopicDialog] = useState(false);
    const [openNewPostDialog, setOpenNewPostDialog] = useState(false);
    const [newTopicTitle, setNewTopicTitle] = useState('');
    const [newTopicDescription, setNewTopicDescription] = useState('');
    const [newPostContent, setNewPostContent] = useState('');

    const handleCreateTopic = async () => {
        if (!newTopicTitle.trim()) {
            setSnackbarMessage('Topic title is required');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            await axios.post(`${API_URL}/forum/topics`, {
                title: newTopicTitle,
                description: newTopicDescription,
                created_by: user_id
            });
            
            setOpenNewTopicDialog(false);
            setNewTopicTitle('');
            setNewTopicDescription('');
            setSnackbarMessage('Topic created successfully');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Refresh the topics list
            fetchData();
        } catch (error) {
            console.error('Error creating topic:', error);
            setSnackbarMessage('Failed to create topic. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleCreatePost = async () => {
        if (!newPostContent.trim()) {
            setSnackbarMessage('Post content is required');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            await axios.post(`${API_URL}/forum/posts`, {
                topic_id: currentTopic.id,
                user_id: user_id,
                content: newPostContent
            });
            
            setOpenNewPostDialog(false);
            setNewPostContent('');
            setSnackbarMessage('Post added successfully');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Refresh the current topic to include the new post
            const topicResponse = await axios.get(`${API_URL}/forum/topics/${currentTopic.id}`);
            
            // Process posts with user likes data
            if (topicResponse.data && topicResponse.data.posts) {
                topicResponse.data.posts = topicResponse.data.posts.map(post => ({
                    ...post,
                    userLiked: userLikes[post.id] === 'like',
                    userDisliked: userLikes[post.id] === 'dislike'
                }));
            }
            
            setCurrentTopic(topicResponse.data);
            
            // Refresh data to update counts
            fetchData();
        } catch (error) {
            console.error('Error creating post:', error);
            setSnackbarMessage('Failed to add post. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    // Handle post like/dislike
    const handleLikePost = async (postId, likeType) => {
        if (!user_id) {
            setSnackbarMessage('You must be logged in to like or dislike posts');
            setSnackbarSeverity('warning');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            // Check if user has already liked/disliked this post
            if (userLikes[postId]) {
                setSnackbarMessage('You have already rated this post');
                setSnackbarSeverity('info');
                setOpenSnackbar(true);
                return;
            }
            
            // Make API call to record the like/dislike
            await axios.post(`${API_URL}/post-likes`, {
                post_id: postId,
                user_id: user_id,
                like_type: likeType
            });
            
            // Update the post like/dislike count in the currentTopic posts array
            if (currentTopic) {
                const updatedPosts = currentTopic.posts.map(post => {
                    if (post.id === postId) {
                        return {
                            ...post,
                            likes: likeType === 'like' ? (post.likes || 0) + 1 : post.likes,
                            dislikes: likeType === 'dislike' ? (post.dislikes || 0) + 1 : post.dislikes,
                            userLiked: likeType === 'like',
                            userDisliked: likeType === 'dislike'
                        };
                    }
                    return post;
                });
                
                setCurrentTopic({
                    ...currentTopic,
                    posts: updatedPosts
                });
            }
            
            setSnackbarMessage(`Post ${likeType === 'like' ? 'liked' : 'disliked'} successfully`);
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
        } catch (error) {
            console.error(`Error ${likeType}ing post:`, error);
            setSnackbarMessage(`Failed to ${likeType} post. Please try again.`);
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const handleTopicClick = (topic) => {
        setCurrentTopic(null); // Clear first to avoid showing old topic data
        axios.get(`${API_URL}/forum/topics/${topic.id}`)
            .then(response => {
                // Process posts with user likes data
                if (response.data && response.data.posts) {
                    response.data.posts = response.data.posts.map(post => ({
                        ...post,
                        userLiked: userLikes[post.id] === 'like',
                        userDisliked: userLikes[post.id] === 'dislike'
                    }));
                }
                setCurrentTopic(response.data);
            })
            .catch(error => {
                console.error('Error fetching topic:', error);
                setSnackbarMessage('Failed to load topic. Please try again.');
                setSnackbarSeverity('error');
                setOpenSnackbar(true);
            });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Forum Header and Search */}
            <div className="mb-8">
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/50 mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-purple-700 bg-clip-text text-transparent">
                                    Community Forums
                                </h2>
                            </div>
                            <p className="text-slate-600 text-lg font-medium">Connect, share insights, and learn from community experiences</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Search topics..."
                                    className="pl-12 pr-4 py-3.5 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-slate-700 placeholder-slate-400 font-medium transition-all duration-200 w-full sm:w-72 shadow-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={() => setOpenNewTopicDialog(true)}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                                style={{ textTransform: 'none', padding: '14px 28px', borderRadius: '16px', fontWeight: '600' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                </svg>
                                New Topic
                            </Button>
                        </div>
                    </div>
                </div>
                
                {/* Topics Grid/List */}
                {topicsToShow.length === 0 ? (
                    <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-16 shadow-xl border border-white/50 text-center">
                        <div className="mb-8">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold mb-4 text-slate-800">{searchTerm ? 'No matching topics found' : 'Start the conversation!'}</h3>
                        <p className="text-slate-600 mb-10 max-w-lg mx-auto text-lg font-medium">
                            {searchTerm ? 'Try adjusting your search terms or browse all available topics.' : 'Be the first to spark a discussion in our vibrant community! Share your thoughts, questions, or insights.'}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {searchTerm ? (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="bg-white/80 backdrop-blur-sm text-blue-600 border-2 border-blue-200 hover:bg-blue-50 hover:border-blue-300 font-semibold py-3 px-8 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg"
                                >
                                    Clear Search
                                </button>
                            ) : (
                                <Button 
                                    variant="contained" 
                                    color="primary"
                                    onClick={() => setOpenNewTopicDialog(true)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg transform hover:scale-105 transition-all duration-200"
                                    style={{ textTransform: 'none', padding: '14px 32px', borderRadius: '20px', fontWeight: '600' }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Create New Topic
                                </Button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {topicsToShow.map(topic => (
                            <div 
                                key={topic.id} 
                                className="bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 overflow-hidden shadow-lg hover:shadow-2xl cursor-pointer transition-all duration-300 transform hover:-translate-y-2 group"
                                onClick={() => handleTopicClick(topic)}
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-5">
                                        <div className="flex-1 pr-4">
                                            <h3 className="text-xl font-bold text-slate-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors leading-tight">
                                                {topic.title}
                                            </h3>
                                            {topic.description && (
                                                <p className="text-slate-600 text-sm line-clamp-2 mb-4 font-medium">
                                                    {topic.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg flex-shrink-0">
                                            {topic.creator_name.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3 mb-5">
                                        <div className="flex items-center justify-between text-sm text-slate-500">
                                            <div className="flex items-center bg-slate-100/80 rounded-full px-3 py-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                                                </svg>
                                                <span className="font-medium text-slate-700">{topic.creator_name}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-slate-500">
                                            <div className="flex items-center bg-slate-100/80 rounded-full px-3 py-1.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                </svg>
                                                <span className="font-medium text-slate-700">{topic.last_post_date ? moment(topic.last_post_date).fromNow() : 'No activity'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-5 border-t border-slate-200/60">
                                        <div className="flex items-center bg-blue-50/80 rounded-full px-4 py-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-blue-700 font-bold">{topic.post_count}</span>
                                            <span className="text-blue-600 font-medium ml-1">{topic.post_count === 1 ? 'Reply' : 'Replies'}</span>
                                        </div>
                                        <div className="text-blue-600 group-hover:text-blue-800 font-semibold flex items-center transition-colors">
                                            <span>Join</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* Selected Topic with Posts */}
            {currentTopic && (
                <div className="mt-16 border-t-4 border-blue-400 pt-8">
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 mb-8 shadow-2xl border border-white/60 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10"></div>
                        <div className="relative flex items-start justify-between">
                            <div className="flex-1 pr-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full opacity-60"></div>
                                </div>
                                <h2 className="text-4xl font-bold text-slate-800 mb-4 leading-tight">{currentTopic.title}</h2>
                                {currentTopic.description && (
                                    <p className="text-slate-600 mb-6 text-xl font-medium leading-relaxed">{currentTopic.description}</p>
                                )}
                                <div className="flex flex-wrap items-center gap-6 text-slate-600">
                                    <div className="flex items-center bg-slate-100/80 rounded-full px-4 py-2">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center font-bold text-white mr-3 shadow-md">
                                            {currentTopic.creator_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <span className="text-sm text-slate-500">Started by</span>
                                            <div className="font-bold text-slate-700">{currentTopic.creator_name}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center bg-slate-100/80 rounded-full px-4 py-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                        </svg>
                                        <span className="font-semibold text-slate-700">{moment(currentTopic.created_at).format('MMM D, YYYY')}</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => {
                                    setCurrentTopic(null); 
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                className="bg-white/80 backdrop-blur-sm hover:bg-slate-100/80 text-slate-600 hover:text-slate-800 rounded-2xl p-3 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    
                    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={() => setOpenNewPostDialog(true)}
                            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg transform hover:scale-105 transition-all duration-200"
                            style={{ textTransform: 'none', padding: '12px 28px', borderRadius: '16px', fontWeight: '600' }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                            </svg>
                            Reply to Topic
                        </Button>
                        
                        <div className="flex items-center bg-blue-100/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                            </svg>
                            <span className="font-bold text-blue-800 text-lg">{currentTopic.posts?.length || 0} Replies</span>
                        </div>
                    </div>
                    
                    {currentTopic.posts && currentTopic.posts.length > 0 ? (
                        <div className="space-y-8">
                            {currentTopic.posts.map((post, index) => (
                                <div 
                                    key={post.id} 
                                    className={`rounded-3xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl ${
                                        index === 0 
                                            ? 'bg-gradient-to-br from-blue-50/90 to-indigo-100/90 backdrop-blur-sm border-2 border-blue-200' 
                                            : 'bg-white/90 backdrop-blur-sm border border-white/60 hover:border-blue-200'
                                    }`}
                                >
                                    <div className={`px-8 py-6 border-b ${index === 0 ? 'bg-blue-100/60 border-blue-200' : 'bg-slate-50/60 border-slate-200'}`}>
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold mr-4 shadow-lg ${
                                                    index === 0 
                                                        ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white' 
                                                        : 'bg-gradient-to-br from-slate-400 to-slate-500 text-white'
                                                }`}>
                                                    {post.user_name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-bold text-slate-800 text-lg">{post.user_name}</span>
                                                        {index === 0 && (
                                                            <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs rounded-full font-semibold shadow-md">
                                                                ✨ Original Post
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-slate-500 text-sm font-medium">
                                                        {moment(post.created_at).format('MMM D, YYYY [at] h:mm A')}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="bg-slate-200/60 text-slate-600 text-sm px-4 py-2 rounded-full font-bold shadow-sm">
                                                #{index + 1}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-8 py-8">
                                        <div className="prose max-w-none mb-8 text-slate-800 text-lg leading-relaxed font-medium">
                                            {post.content}
                                        </div>
                                        <div className="flex items-center justify-between border-t border-slate-200/60 pt-6 mt-6">
                                            <div className="flex items-center gap-4">
                                                <button 
                                                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200 font-semibold ${
                                                        post.userLiked 
                                                            ? 'bg-blue-100/80 text-blue-700 shadow-md border-2 border-blue-200' 
                                                            : 'text-slate-600 hover:bg-slate-100/80 hover:shadow-md border-2 border-transparent hover:border-slate-200'
                                                    }`}
                                                    onClick={() => handleLikePost(post.id, 'like')}
                                                    disabled={post.userLiked || post.userDisliked}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                                    </svg>
                                                    <span>{post.likes || 0}</span>
                                                </button>
                                                <button 
                                                    className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all duration-200 font-semibold ${
                                                        post.userDisliked 
                                                            ? 'bg-red-100/80 text-red-700 shadow-md border-2 border-red-200' 
                                                            : 'text-slate-600 hover:bg-slate-100/80 hover:shadow-md border-2 border-transparent hover:border-slate-200'
                                                    }`}
                                                    onClick={() => handleLikePost(post.id, 'dislike')}
                                                    disabled={post.userLiked || post.userDisliked}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                                                    </svg>
                                                    <span>{post.dislikes || 0}</span>
                                                </button>
                                            </div>
                                            <div className="ml-auto">
                                                {post.userLiked && 
                                                    <span className="text-blue-600 text-sm font-semibold bg-blue-50/80 px-3 py-1.5 rounded-full">✓ You liked this</span>
                                                }
                                                {post.userDisliked && 
                                                    <span className="text-red-600 text-sm font-semibold bg-red-50/80 px-3 py-1.5 rounded-full">✓ You disliked this</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 shadow-xl border border-white/60 text-center">
                            <div className="mb-8">
                                <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                    </svg>
                                </div>
                            </div>
                            <h3 className="font-bold text-slate-700 mb-4 text-3xl">No replies yet</h3>
                            <p className="text-slate-600 mb-10 max-w-md mx-auto text-lg font-medium">Be the first to reply to this topic and start the conversation!</p>
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={() => setOpenNewPostDialog(true)}
                                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg transform hover:scale-105 transition-all duration-200"
                                style={{ textTransform: 'none', padding: '14px 28px', borderRadius: '18px', fontWeight: '600' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                </svg>
                                Post First Reply
                            </Button>
                        </div>
                    )}
                    
                    {/* Reply button at bottom */}
                    {currentTopic.posts && currentTopic.posts.length > 0 && (
                        <div className="mt-12 flex justify-center">
                            <Button 
                                variant="contained" 
                                color="primary"
                                onClick={() => setOpenNewPostDialog(true)}
                                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg transform hover:scale-105 transition-all duration-200"
                                style={{ textTransform: 'none', padding: '14px 32px', borderRadius: '20px', fontWeight: '600' }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Reply to This Topic
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {/* New Topic Dialog */}
            <Dialog 
                open={openNewTopicDialog} 
                onClose={() => setOpenNewTopicDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(20px)' }
                }}
            >
                <DialogTitle>
                    <div className="flex items-center text-slate-800 text-2xl font-bold">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        Create New Topic
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="mb-8 p-6 bg-gradient-to-br from-blue-50/80 to-purple-50/80 rounded-2xl border border-blue-200/50">
                        <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600 mt-1 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <p className="text-blue-700 font-semibold text-lg">
                                Start a conversation by creating a new topic. Clear and descriptive titles help others find and join your discussion.
                            </p>
                        </div>
                    </div>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Topic Title"
                        type="text"
                        fullWidth
                        value={newTopicTitle}
                        onChange={(e) => setNewTopicTitle(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-6"
                        placeholder="Enter a compelling title for your topic"
                        InputProps={{
                            style: { borderRadius: '16px', fontSize: '16px', padding: '4px' }
                        }}
                    />
                    <TextField
                        margin="dense"
                        label="Description (Optional)"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={newTopicDescription}
                        onChange={(e) => setNewTopicDescription(e.target.value)}
                        variant="outlined"
                        placeholder="Add a brief description to give context about your topic"
                        InputProps={{
                            style: { borderRadius: '16px', fontSize: '16px' }
                        }}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewTopicDialog(false)} 
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '16px',
                            padding: '12px 24px',
                            color: '#64748B',
                            fontWeight: '600'
                        }}
                        className="hover:bg-slate-100/80"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreateTopic} 
                        variant="contained" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '16px',
                            padding: '12px 28px',
                            fontWeight: '600'
                        }}
                    >
                        Create Topic
                    </Button>
                </DialogActions>
            </Dialog>
            
            {/* New Post Dialog */}
            <Dialog 
                open={openNewPostDialog} 
                onClose={() => setOpenNewPostDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', backdropFilter: 'blur(20px)' }
                }}
            >
                <DialogTitle>
                    <div className="flex items-center text-slate-800 text-2xl font-bold">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                        </div>
                        <div>
                            <div>Reply to Topic</div>
                            <div className="text-sm font-medium text-slate-600 mt-1">{currentTopic?.title}</div>
                        </div>
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="mb-8 p-6 bg-gradient-to-br from-green-50/80 to-blue-50/80 rounded-2xl border border-green-200/50">
                        <p className="text-slate-700 font-semibold text-lg flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mr-3" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            Share your thoughts respectfully and contribute to the discussion
                        </p>
                    </div>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Your Reply"
                        type="text"
                        fullWidth
                        multiline
                        rows={8}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        required
                        variant="outlined"
                        placeholder="Share your thoughts, experiences, or questions..."
                        InputProps={{
                            style: { borderRadius: '16px', fontSize: '16px' }
                        }}
                    />
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewPostDialog(false)}
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '16px',
                            padding: '12px 24px',
                            color: '#64748B',
                            fontWeight: '600'
                        }}
                        className="hover:bg-slate-100/80"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleCreatePost}
                        variant="contained" 
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 shadow-lg"
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '16px',
                            padding: '12px 28px',
                            fontWeight: '600'
                        }}
                    >
                        Post Reply
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default ForumComponent;