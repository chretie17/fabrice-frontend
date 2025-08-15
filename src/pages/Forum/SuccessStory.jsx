import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import axios from 'axios';
import API_URL from '../../api';
import moment from 'moment';

const SuccessStoriesComponent = ({ 
    successStories, 
    user_id,
    fetchData,
    setSnackbarMessage,
    setSnackbarSeverity,
    setOpenSnackbar
}) => {
    const [openNewStoryDialog, setOpenNewStoryDialog] = useState(false);
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [newStoryContent, setNewStoryContent] = useState('');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [expandedStories, setExpandedStories] = useState({});

    const handleSubmitStory = async () => {
        if (!newStoryTitle.trim() || !newStoryContent.trim()) {
            setSnackbarMessage('Title and content are required');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
            return;
        }
        
        try {
            await axios.post(`${API_URL}/success-stories`, {
                user_id: user_id,
                title: newStoryTitle,
                content: newStoryContent,
                is_anonymous: isAnonymous
            });
            
            setOpenNewStoryDialog(false);
            setNewStoryTitle('');
            setNewStoryContent('');
            setIsAnonymous(false);
            setSnackbarMessage('Success story submitted for approval');
            setSnackbarSeverity('success');
            setOpenSnackbar(true);
            
            // Refresh success stories
            fetchData();
        } catch (error) {
            console.error('Error submitting story:', error);
            setSnackbarMessage('Failed to submit story. Please try again.');
            setSnackbarSeverity('error');
            setOpenSnackbar(true);
        }
    };

    const toggleExpanded = (storyId) => {
        setExpandedStories(prev => ({
            ...prev,
            [storyId]: !prev[storyId]
        }));
    };

    return (
        <div>
            {/* Success Stories Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-blue-800 mb-3">Success Stories</h2>
                    <p className="text-gray-600 text-lg">Read inspiring stories from community members who have achieved their goals and transformed their lives</p>
                </div>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => setOpenNewStoryDialog(true)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg transform hover:scale-105 transition-all duration-200"
                    style={{ textTransform: 'none', padding: '12px 24px', borderRadius: '15px' }}
                >
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Share Your Story
                    </div>
                </Button>
            </div>
            
            {successStories.length === 0 ? (
                <div className="text-center py-16 bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 rounded-2xl border-2 border-dashed border-green-300">
                    <div className="animate-bounce">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto mb-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-gray-800">Your Success Story Awaits!</h3>
                    <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
                        Be the first to share your inspiring journey and motivate others in our community. Every success story starts with someone brave enough to share it.
                    </p>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => setOpenNewStoryDialog(true)}
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg transform hover:scale-105 transition-all duration-200"
                        style={{ textTransform: 'none', padding: '14px 28px', borderRadius: '20px' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Share Your Success Story
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                    {successStories.map(story => {
                        const isExpanded = expandedStories[story.id];
                        const shouldTruncate = story.content.length > 300;
                        const displayContent = isExpanded || !shouldTruncate 
                            ? story.content 
                            : `${story.content.substring(0, 300)}...`;

                        return (
                            <div key={story.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                                <div className="p-6">
                                    <div className="flex items-center mb-4">
                                        <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center font-medium mr-3">
                                            {story.author_name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-blue-800">{story.title}</h3>
                                            <div className="flex items-center text-gray-600 text-sm mt-1">
                                                <span>{story.author_name}</span>
                                                <span className="mx-2">•</span>
                                                <span>{moment(story.created_at).format('MMM D, YYYY')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="prose max-w-none mb-5 text-gray-700">
                                        <p>{displayContent}</p>
                                    </div>
                                    <div className="flex items-center justify-between border-t pt-4">
                                        <div className="flex items-center text-blue-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span className="font-medium">Success Story</span>
                                        </div>
                                        {shouldTruncate && (
                                            <button 
                                                onClick={() => toggleExpanded(story.id)}
                                                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                                            >
                                                {isExpanded ? 'Read Less' : 'Read More'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* New Success Story Dialog */}
            <Dialog 
                open={openNewStoryDialog} 
                onClose={() => setOpenNewStoryDialog(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    style: { borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }
                }}
            >
                <DialogTitle>
                    <div className="flex items-center text-green-800 text-xl font-bold">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-2 rounded-full mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        Share Your Success Story
                    </div>
                </DialogTitle>
                <DialogContent>
                    <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600 mt-0.5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                            <div>
                                <p className="text-green-700 font-medium mb-1">
                                    Your story will inspire others!
                                </p>
                                <p className="text-green-600 text-sm">
                                    Share your journey, challenges you overcame, and the positive changes you've experienced. Your story will be reviewed before being published.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Story Title"
                        type="text"
                        fullWidth
                        value={newStoryTitle}
                        onChange={(e) => setNewStoryTitle(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-4"
                        placeholder="Give your success story a compelling title"
                        InputProps={{
                            style: { borderRadius: '12px' }
                        }}
                    />
                    
                    <TextField
                        margin="dense"
                        label="Your Success Story"
                        type="text"
                        fullWidth
                        multiline
                        rows={8}
                        value={newStoryContent}
                        onChange={(e) => setNewStoryContent(e.target.value)}
                        required
                        variant="outlined"
                        className="mb-4"
                        placeholder="Share your journey: What challenges did you face? What strategies helped you succeed? How has your life changed? What advice would you give others?"
                        InputProps={{
                            style: { borderRadius: '12px' }
                        }}
                    />
                    
                    <div className="flex items-center bg-gray-50 p-4 rounded-xl">
                        <input
                            type="checkbox"
                            id="anonymous"
                            checked={isAnonymous}
                            onChange={(e) => setIsAnonymous(e.target.checked)}
                            className="w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
                        />
                        <label htmlFor="anonymous" className="ml-3 text-gray-700 font-medium">
                            Post anonymously
                        </label>
                        <div className="ml-auto">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                        </div>
                    </div>
                </DialogContent>
                <DialogActions style={{ padding: '16px 24px' }}>
                    <Button 
                        onClick={() => setOpenNewStoryDialog(false)}
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '12px',
                            padding: '10px 20px',
                            color: '#6B7280'
                        }}
                        className="hover:bg-gray-100"
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSubmitStory}
                        variant="contained" 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg"
                        style={{ 
                            textTransform: 'none',
                            borderRadius: '12px',
                            padding: '10px 24px'
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                        Submit Story
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SuccessStoriesComponent;