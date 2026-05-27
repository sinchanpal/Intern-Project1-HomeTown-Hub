import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';
import { LuImagePlus, LuArrowLeft, LuX } from "react-icons/lu";
import { ClipLoader } from "react-spinners";
import emptyDp from "../assets/emptyDP.jpg";

const EditCommunity = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userData } = useSelector(state => state.user);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    // Form States
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [rules, setRules] = useState([]);
    const [newRule, setNewRule] = useState("");

    // Image States
    const [coverImage, setCoverImage] = useState(null);
    const [preview, setPreview] = useState("");


    // Fetch existing community data when the page loads
    useEffect(() => {
        const fetchCommunity = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/community/get-community/${id}`, { withCredentials: true });
                const comm = res.data.community;

                // Frontend Security: Kick them out if they aren't a moderator
                const isPandit = comm.moderators.some(mod => mod._id === userData?._id);
                if (!isPandit) {
                    alert("Unauthorized!");
                    navigate(`/community-page/${id}`);
                    return;
                }

                setName(comm.name);
                setDescription(comm.description);
                setRules(comm.rules || []);
                setPreview(comm.coverImage || ""); // Show existing image if they have one

                setLoading(false);
            } catch (error) {
                console.error("Error fetching community", error);
                navigate("/");
            }
        };
        if (userData) fetchCommunity();
    }, [id, userData, navigate]);

    // Handle Image Selection
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCoverImage(file);
            setPreview(URL.createObjectURL(file)); // Create a local preview URL
        }
    };

    // Handle Rules Array
    const addRule = () => {
        if (newRule.trim()) {
            setRules([...rules, newRule.trim()]);
            setNewRule("");
        }
    };

    const removeRule = (indexToRemove) => {
        setRules(rules.filter((_, index) => index !== indexToRemove));
    };


    // Submit the Form
    const handleUpdate = async (e) => {
        e.preventDefault();
        setUpdating(true);

        // We MUST use FormData when uploading files!
        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        formData.append("rules", JSON.stringify(rules)); // Send array as a JSON string

        if (coverImage) {
            formData.append("coverImage", coverImage);
        }

        try {
            await axios.put(`${serverUrl}/api/community/edit-community/${id}`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });

            // Redirect back to the community page to see the changes!
            navigate(`/community-page/${id}`);
        } catch (error) {
            console.error("Error updating community:", error);
            alert(error.response?.data?.message || "Failed to update community");
            setUpdating(false);
        }
    };

    if (loading) return <div className="h-screen flex justify-center items-center bg-[#0f1115]"><ClipLoader color="#ffffff" size={50} /></div>;

    return (
        <div className="min-h-screen bg-linear-to-b from-black to-gray-900 text-white flex justify-center py-12 px-4">
            <div className="w-full max-w-2xl bg-[#16191f] rounded-2xl p-8 border border-gray-800 shadow-xl">

                <button onClick={() => navigate(`/community-page/${id}`)} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                    <LuArrowLeft className="mr-2" /> Cancel Edit
                </button>

                <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-emerald-400">
                    Edit Community Settings
                </h1>

                <form onSubmit={handleUpdate} className="space-y-6">
                    {/* Cover Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image</label>
                        <div className="relative w-full h-48 bg-[#0f1115] border-2 border-dashed border-gray-700 rounded-xl overflow-hidden flex flex-col justify-center items-center group hover:border-gray-500 transition-colors cursor-pointer">
                            {preview ? (
                                <img src={preview} alt="Cover Preview" className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                            ) : (
                                <LuImagePlus size={40} className="text-gray-600 mb-2" />
                            )}
                            <div className="absolute flex flex-col items-center">
                                <span className="text-sm font-bold bg-black/50 px-3 py-1 rounded-full">{preview ? "Change Image" : "Upload Cover Image"}</span>
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Community Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors min-h-25 resize-none"
                            required
                        />
                    </div>

                    {/* Community Rules */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Community Rules</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={newRule}
                                onChange={(e) => setNewRule(e.target.value)}
                                placeholder="e.g., Be respectful to others"
                                className="flex-1 bg-[#0f1115] border border-gray-700 rounded-xl p-3 text-white outline-none focus:border-blue-500 transition-colors"
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRule())}
                            />
                            <button type="button" onClick={addRule} className="bg-gray-800 hover:bg-gray-700 px-6 rounded-xl font-bold transition-colors">Add</button>
                        </div>

                        <div className="space-y-2">
                            {rules.map((rule, index) => (
                                <div key={index} className="flex justify-between items-center bg-[#0f1115] border border-gray-800 p-3 rounded-xl">
                                    <span className="text-gray-300 text-sm">{index + 1}. {rule}</span>
                                    <button type="button" onClick={() => removeRule(index)} className="text-red-400 hover:text-red-300"><LuX size={20} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={updating}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:bg-gray-600 mt-8"
                    >
                        {updating ? "Saving Changes..." : "Save Community Settings"}
                    </button>
                </form>


            </div>
        </div>
    );
};

export default EditCommunity;