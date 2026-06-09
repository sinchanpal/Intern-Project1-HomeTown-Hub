import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../../App';
import Swal from 'sweetalert2';
import { LuFlag, LuTrash2 } from 'react-icons/lu';
import { TbAlertTriangleFilled } from "react-icons/tb";
import { FaCircleCheck } from "react-icons/fa6";
import emptyDp from '../../assets/emptyDP.jpg';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/admin/reports`, {
                    withCredentials: true
                });

                setReports(res.data.reports || []);
            } catch (error) {
                console.error("Error fetching reports:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleAction = async (reportId, actionType) => {
        const isDelete = actionType === 'delete_post';

        const result = await Swal.fire({
            title: isDelete ? "Delete this post?" : "Dismiss this report?",
            text: isDelete
                ? "The post will be permanently removed and the report resolved."
                : "The post will stay up and the report will be cleared.",
            icon: isDelete ? "warning" : "info",
            showCancelButton: true,
            confirmButtonColor: isDelete ? "#d33" : "#10b981", // Red for delete, Emerald for dismiss
            cancelButtonColor: "#374151",
            confirmButtonText: isDelete ? "Yes, delete post" : "Yes, dismiss",
            background: "#16191f",
            color: "#fff"
        });

        if (result.isConfirmed) {
            try {
                await axios.put(`${serverUrl}/api/admin/reports/${reportId}`,
                    { action: actionType },
                    { withCredentials: true }
                );

                // Remove the report from the UI
                setReports(prev => prev.filter(r => r._id !== reportId));

                Swal.fire({
                    title: "Success!",
                    text: isDelete ? "Post deleted." : "Report dismissed.",
                    icon: "success",
                    background: '#16191f',
                    color: '#fff',
                    timer: 1500,
                    showConfirmButton: false
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.response?.data?.message || 'Failed to process report.',
                    background: '#16191f',
                    color: '#fff'
                });
            }
        }
    };

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <LuFlag className="text-red-400" /> Content Moderation
                </h1>
                <p className="text-gray-400">Review flagged posts to keep Hometown Hub safe.</p>
            </div>

            <div className="bg-[#16191f] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#0f1115] border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
                                <th className="p-4 font-medium">Flagged Post</th>
                                <th className="p-4 font-medium">Reason</th>
                                <th className="p-4 font-medium">Reported By</th>
                                <th className="p-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500">Loading reports...</td>
                                </tr>
                            ) : reports.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-emerald-500">
                                            <FaCircleCheck size={48} className="mb-3 opacity-50" />
                                            <p className="text-lg font-medium text-emerald-400">All caught up!</p>
                                            <p className="text-gray-500 text-sm mt-1">There are no pending reports to review.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                reports.map((report) => (
                                    <tr key={report._id} className="hover:bg-gray-800/30 transition-colors">

                                        {/* Post Snippet with Media Rendering */}
                                        <td className="p-4 max-w-xs">
                                            {report.post ? (
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-2">Author: <span className="text-gray-300 font-medium">{report.post.author?.name}</span></p>
                                                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                                                        
                                                        {/* 1. Render Text if it exists */}
                                                        {report.post.content && (
                                                            <p className="text-white text-sm line-clamp-2 italic mb-2">
                                                                "{report.post.content}"
                                                            </p>
                                                        )}

                                                        {/* 2. Render Image if mediaType is 'image' */}
                                                        {report.post.mediaType === 'image' && report.post.media && (
                                                            <img 
                                                                src={report.post.media} 
                                                                alt="Reported content" 
                                                                className="w-full h-auto max-h-32 object-cover rounded-md border border-gray-700"
                                                            />
                                                        )}

                                                        {/* 3. Render Video if mediaType is 'video' */}
                                                        {report.post.mediaType === 'video' && report.post.media && (
                                                            <video 
                                                                src={report.post.media} 
                                                                controls 
                                                                className="w-full h-auto max-h-32 object-cover rounded-md border border-gray-700"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-500 italic text-sm">Post was already deleted by user.</span>
                                            )}
                                        </td>

                                        {/* Reason Badge */}
                                        <td className="p-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                                                <TbAlertTriangleFilled size={14} />
                                                {report.reason}
                                            </span>
                                        </td>

                                        {/* Reporter Info */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <img
                                                    src={report.reportedBy?.profilePicture || emptyDp}
                                                    alt="avatar"
                                                    className="w-8 h-8 rounded-full object-cover border border-gray-700"
                                                />
                                                <p className="text-gray-300 text-sm font-medium">{report.reportedBy?.name}</p>
                                            </div>
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleAction(report._id, 'dismiss_report')}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors border border-gray-700"
                                                    title="Dismiss Report"
                                                >
                                                    Dismiss
                                                </button>

                                                {/* Only show delete button if the post still exists */}
                                                {report.post && (
                                                    <button
                                                        onClick={() => handleAction(report._id, 'delete_post')}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                                                        title="Delete Post"
                                                    >
                                                        <LuTrash2 size={14} /> Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Reports;