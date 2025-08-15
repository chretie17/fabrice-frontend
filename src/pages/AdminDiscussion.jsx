import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BackendPort from '../api';
import { Check, X, MessageCircle, FileText } from 'lucide-react';

const AdminDiscussions = () => {
    const [pendingPosts, setPendingPosts] = useState([]);
    const [allPosts, setAllPosts] = useState([]);

    useEffect(() => {
        fetchPendingPosts();
        fetchAllPosts();
    }, []);

    const fetchPendingPosts = async () => {
        try {
            const response = await axios.get(BackendPort.getApiUrl('community/posts/pending'));
            setPendingPosts(response.data);
        } catch (error) {
            console.error('Error fetching pending posts:', error);
        }
    };

    const fetchAllPosts = async () => {
        try {
            const response = await axios.get(BackendPort.getApiUrl('community/posts'));
            setAllPosts(response.data);
        } catch (error) {
            console.error('Error fetching all posts:', error);
        }
    };

    const handlePostStatusChange = async (postId, status) => {
        try {
            await axios.put(BackendPort.getApiUrl('community/posts/status'), { post_id: postId, status });
            alert(`Post ${status.toLowerCase()} successfully!`);
            fetchPendingPosts();
            fetchAllPosts();
        } catch (error) {
            console.error(`Error updating post status:`, error);
        }
    };

    return (
        <div className="min-h-screen bg-white p-8">
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl border border-gray-200">
                <div className="bg-[#13377C] text-white p-6 rounded-t-2xl flex items-center">
                    <MessageCircle className="mr-3" />
                    <h1 className="text-2xl font-bold">Admin: Community Discussions</h1>
                </div>

                <div className="p-6 space-y-8">
                    {/* Pending Posts Section */}
                    <section>
                        <div className="flex items-center mb-4">
                            <FileText className="mr-2 text-[#13377C]" />
                            <h2 className="text-xl font-semibold text-gray-800">Pending Posts for Approval</h2>
                        </div>
                        {pendingPosts.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No pending posts for approval.</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingPosts.map((post) => (
                                    <div 
                                        key={post.id} 
                                        className="bg-gray-50 border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all duration-300"
                                    >
                                        <h3 className="font-bold text-lg text-gray-800 mb-2">{post.title}</h3>
                                        <p className="text-gray-600 mb-3">{post.content}</p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-400">
                                                By {post.tenant_name} on {new Date(post.created_at).toLocaleString()}
                                            </p>
                                            <div>
                                                <button
                                                    onClick={() => handlePostStatusChange(post.id, 'Approved')}
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg mr-2 flex items-center"
                                                >
                                                    <Check className="mr-1" size={20} /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handlePostStatusChange(post.id, 'Rejected')}
                                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center"
                                                >
                                                    <X className="mr-1" size={20} /> Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* All Posts Section */}
                    <section>
                        <div className="flex items-center mb-4">
                            <FileText className="mr-2 text-[#13377C]" />
                            <h2 className="text-xl font-semibold text-gray-800">All Approved Posts</h2>
                        </div>
                        {allPosts.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No approved posts available.</p>
                        ) : (
                            <div className="space-y-4">
                                {allPosts.map((post) => (
                                    <div 
                                        key={post.id} 
                                        className="bg-gray-50 border border-gray-200 rounded-xl p-5"
                                    >
                                        <h3 className="font-bold text-lg text-gray-800 mb-2">{post.title}</h3>
                                        <p className="text-gray-600 mb-3">{post.content}</p>
                                        <p className="text-sm text-gray-400">
                                            By {post.tenant_name} on {new Date(post.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
};

export default AdminDiscussions;