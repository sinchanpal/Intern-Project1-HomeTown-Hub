import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { ClipLoader } from "react-spinners";
import { LuCalendar, LuMapPin, LuClock, LuUsers, LuPlus, LuX, LuTrash2, LuCheck } from "react-icons/lu";
import emptyDp from "../assets/emptyDP.jpg";
import { useSocket } from '../context/SocketContext';

const EventsTab = ({ communityId, community }) => {
    const { userData } = useSelector(state => state.user);
    const isPandit = community.moderators.some(mod => mod._id === userData?._id);

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form states
    const [showForm, setShowForm] = useState(false);
    const [creating, setCreating] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        location: ""
    });


    const { socket } = useSocket();

    // Listen for new events in real-time and add them to the feed if they belong to this community
    useEffect(() => {
        if (!socket) return;

        const handleNewEvent = (incomingEvent) => {
            // SECURITY/UX CHECK: Only add the event to the feed IF it belongs to the community currently being viewed!
            const eventCommunityId = incomingEvent.community._id || incomingEvent.community;

            if (eventCommunityId.toString() === community._id.toString()) {
                // Add the new event to the VERY TOP of the feed
                setEvents((prevEvents) => [incomingEvent, ...prevEvents]);
            }
        };

        // Turn on the listener
        socket.on("newEvent", handleNewEvent);

        // Cleanup: Turn off the listener when they leave the page so it doesn't duplicate
        return () => {
            socket.off("newEvent", handleNewEvent);
        };
    }, [socket, community._id, setEvents]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/event/all-community-events/${communityId}`, {
                    withCredentials: true
                });
                setEvents(res.data.events);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching events:", error);
                setLoading(false);
            }
        };
        fetchEvents();
    }, [communityId]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {

            // Convert the  local time string into a smart, timezone-aware UTC string
            const localDate = new Date(formData.date); //Ex: Grabs  local 4:00 PM
            const timezoneAwareDate = localDate.toISOString(); // Safely converts to UTC mathematically

            // Create a temporary object to send to the backend
            const dataToSend = {
                ...formData,
                date: timezoneAwareDate
            };

            const res = await axios.post(`${serverUrl}/api/event/create-event/${communityId}`, dataToSend, {
                withCredentials: true
            });

            // Note: Since the backend doesn't populate attendees on creation, we will format it 
            // so the creator instantly shows up as the first attendee locally.
            const newEvent = {
                ...res.data.event,
                attendees: [{ _id: userData._id, name: userData.name, profilePicture: userData.profilePicture }]
            };

            setEvents([newEvent, ...events]);
            setFormData({ title: "", description: "", date: "", location: "" });
            setShowForm(false);

            Swal.fire({
                title: "Created!",
                text: "Your event is live.",
                icon: "success",
                timer: 1500,
                showConfirmButton: false,
                background: "#0f2320",
                color: "#fff"
            });
        } catch (error) {
            console.error("Error creating event:", error);
            Swal.fire({
                title: "Error!",
                text: error.response?.data?.message || "Failed to create event",
                icon: "error",
                background: "#0f2320",
                color: "#fff"
            });
        } finally {
            setCreating(false);
        }
    };

    const handleRSVP = async (eventId) => {
        try {
            const res = await axios.put(`${serverUrl}/api/event/rsvp/${eventId}`, {}, {
                withCredentials: true
            });

            setEvents(events.map(ev =>
                ev._id === eventId ? { ...ev, attendees: res.data.attendees } : ev
            ));
        } catch (error) {
            console.error("Error updating RSVP:", error);
        }
    };

    const handleDeleteEvent = async (eventId) => {
        const result = await Swal.fire({
            title: "Cancel this event?",
            text: "This action cannot be undone.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#374151",
            confirmButtonText: "Yes, cancel it",
            background: "#0f2320",
            color: "#fff"
        });

        if (!result.isConfirmed) return;

        try {
            await axios.delete(`${serverUrl}/api/event/delete-event/${eventId}`, {
                withCredentials: true
            });
            setEvents(events.filter(ev => ev._id !== eventId));
        } catch (error) {
            console.error("Error deleting event:", error);
            Swal.fire({ title: "Error", text: "Failed to delete event", icon: "error", background: "#0f2320", color: "#fff" });
        }
    };

    // Helper to format the Date string nicely
    const formatEventDate = (dateString) => {
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) return (
        <div className="flex justify-center items-center py-10">
            <ClipLoader size={40} color="#4ade80" />
        </div>
    );

    return (
        <div className="w-full">
            {/* Create Event Header & Toggle */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-center">
                    <LuCalendar className="mr-2 text-green-500" /> Upcoming Meetups
                </h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center px-4 py-2 rounded-xl font-bold transition-colors ${showForm ? 'bg-gray-800 text-gray-300' : 'bg-green-700 text-white hover:bg-green-600'}`}
                >
                    {showForm ? <><LuX className="mr-1" /> Cancel</> : <><LuPlus className="mr-1" /> Host Event</>}
                </button>
            </div>

            {/* Event Creation Form */}
            {showForm && (
                <div className="bg-[#0f2320] rounded-2xl border-2 border-gray-700 p-5 mb-8 shadow-sm animate-fade-in-down">
                    <h3 className="text-lg font-bold text-gray-100 mb-4">Event Details</h3>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                        <input
                            type="text"
                            name="title"
                            required
                            placeholder="What's happening? (e.g., Sunday Football Match)"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-[#091413] text-white rounded-xl outline-none border border-gray-700 focus:border-green-600 transition-colors"
                        />
                        <div className="flex flex-col md:flex-row gap-4">
                            <input
                                type="datetime-local"
                                name="date"
                                required
                                value={formData.date}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-[#091413] text-gray-300 rounded-xl outline-none border border-gray-700 focus:border-green-600 transition-colors css-color-scheme-dark"
                            />
                            <input
                                type="text"
                                name="location"
                                required
                                placeholder="Location (e.g., Midnapore College Ground)"
                                value={formData.location}
                                onChange={handleInputChange}
                                className="w-full p-3 bg-[#091413] text-white rounded-xl outline-none border border-gray-700 focus:border-green-600 transition-colors"
                            />
                        </div>
                        <textarea
                            name="description"
                            placeholder="Add more details so people know what to expect..."
                            value={formData.description}
                            onChange={handleInputChange}
                            className="w-full p-3 bg-[#091413] text-white rounded-xl outline-none resize-none h-24 border border-gray-700 focus:border-green-600 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={creating}
                            className="w-full bg-green-700 text-white py-3 rounded-xl font-bold hover:bg-green-600 disabled:bg-gray-700 transition-all"
                        >
                            {creating ? "Publishing Event..." : "Publish Event"}
                        </button>
                    </form>
                </div>
            )}

            {/* Events List */}
            <div className="space-y-6">
                {events.length > 0 ? (
                    events.map(event => {
                        const isCreator = event.creator?._id === userData?._id;
                        const canDelete = isCreator || isPandit;
                        // Backend populates attendees, so they are an array of objects
                        const isAttending = event.attendees?.some(user => user._id === userData?._id);

                        // Check if event is in the past
                        const isPastEvent = new Date(event.date) < new Date();

                        return (
                            <div key={event._id} className={`p-5 rounded-2xl border-2 shadow-sm relative transition-all ${isPastEvent ? 'border-gray-800 bg-[#0a1110] opacity-75' : 'border-gray-700 bg-[#0f2320]'}`}>

                                {canDelete && (
                                    <button
                                        onClick={() => handleDeleteEvent(event._id)}
                                        className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors p-1"
                                        title="Cancel Event"
                                    >
                                        <LuTrash2 size={18} />
                                    </button>
                                )}

                                {/* Date Badge */}
                                <div className="flex items-start gap-4 mb-3">
                                    <div className={`flex flex-col items-center justify-center min-w-15 p-2 rounded-xl ${isPastEvent ? 'bg-gray-800 text-gray-400' : 'bg-green-900/50 text-green-400 border border-green-800'}`}>
                                        <span className="text-xs font-bold uppercase">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-xl font-black">{new Date(event.date).getDate()}</span>
                                    </div>
                                    <div className="pr-8">
                                        <h3 className="text-xl font-bold text-white leading-tight">{event.title}</h3>
                                        <p className="text-sm text-gray-400 flex items-center mt-1">
                                            By {event.creator?.name || "Unknown"}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <p className="text-gray-300 text-sm flex items-center">
                                        <LuClock className="mr-2 text-gray-500" size={16} /> {formatEventDate(event.date)}
                                    </p>
                                    <p className="text-gray-300 text-sm flex items-center">
                                        <LuMapPin className="mr-2 text-gray-500" size={16} /> {event.location}
                                    </p>
                                </div>

                                <p className="text-gray-300 whitespace-pre-wrap mb-4 bg-[#091413] p-3 rounded-xl border border-gray-800 text-sm">
                                    {event?.description}
                                </p>

                                {/* Attendees & RSVP Section */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-700/50">

                                    <div className="flex items-center">
                                        <LuUsers className="mr-2 text-gray-400" size={18} />
                                        <span className="text-gray-300 font-medium mr-3">{event.attendees?.length || 0} Attending</span>

                                        {/* Avatar Stack */}
                                        <div className="flex -space-x-2">
                                            {event?.attendees?.slice(0, 5).map((attendee, idx) => (
                                                <img
                                                    key={idx}
                                                    src={attendee?.profilePicture || emptyDp}
                                                    alt="avatar"
                                                    className="w-8 h-8 rounded-full border-2 border-[#0f2320] object-cover"
                                                    title={attendee?.name}
                                                />
                                            ))}
                                            {event.attendees?.length > 5 && (
                                                <div className="w-8 h-8 rounded-full border-2 border-[#0f2320] bg-gray-800 flex items-center justify-center text-xs text-white font-bold">
                                                    +{event.attendees?.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {!isPastEvent ? (
                                        <button
                                            onClick={() => handleRSVP(event._id)}
                                            className={`flex items-center px-6 py-2 rounded-xl font-bold transition-all w-full sm:w-auto justify-center ${isAttending ? 'bg-gray-800 text-gray-300 border border-gray-600 hover:bg-red-900/30 hover:border-red-800 hover:text-red-400' : 'bg-green-700 text-white hover:bg-green-600'}`}
                                        >
                                            {isAttending ? <><LuCheck className="mr-2" size={18} /> Going</> : 'Join Event'}
                                        </button>
                                    ) : (
                                        <span className="text-gray-500 font-bold px-4 py-2 border border-gray-700 rounded-xl w-full sm:w-auto text-center">Event Ended</span>
                                    )}
                                </div>

                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-16 bg-[#0f2320] rounded-2xl border-2 border-dashed border-gray-700">
                        <LuCalendar size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-bold text-gray-300 mb-2">No events scheduled</h3>
                        <p className="text-gray-500 mb-6">There are no upcoming meetups in this hub right now.</p>
                        <button onClick={() => setShowForm(true)} className="bg-green-700 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-600 transition-colors">
                            Host the first event
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventsTab;