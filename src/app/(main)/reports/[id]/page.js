'use client'

import React, { useState } from 'react';
import SingleFaceDetector from '@/components/SingleFaceDetector';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import Image from 'next/image';
import useFetch from '@/hooks/useFetch';
import { useUser } from '@/context/UserContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { shareSchema } from '@/validation/share';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import FormField from '@/components/ui/FormField';
import { toast } from 'sonner';
import { Share2 } from 'lucide-react';
import EditReportDialog from '@/components/EditReportDialog';
import z from 'zod';
import AiBot from '@/components/AiBot';
import { VoiceAssistantProvider } from '@/hooks/useVoiceAssitantOnline';
import Loader from '@/components/ui/Loader';


const shareSchemaFace = z.object({
    email: z.string().email({ message: 'Invalid email address' }),
});

const shareSchemaOTP = z.object({
    phone: z.string().min(10, 'Phone must be at least 10 digits'),
});

const shareSchemaQR = shareSchemaOTP;

const schemaMap = {
    face: shareSchemaFace,
    otp: shareSchemaOTP,
    qr: shareSchemaQR,
};


const ReportView = () => {
    const { user, isLoading: userLoading } = useUser();
    const { id } = useParams();
    const [commentText, setCommentText] = useState('');
    const [commentLoading, setCommentLoading] = useState(false);
    const [commentError, setCommentError] = useState('');

    // Fetch report data
    const { data, error, isLoading, refetch } = useFetch({
        url: `/api/reports/${id}`,
        method: 'GET',
        auto: true,
    });

    // Fetch comments for this report
    const {
        data: commentsData,
        error: commentsError,
        isLoading: commentsLoading,
        refetch: refetchComments
    } = useFetch({
        url: `/api/reports/${id}/comments`,
        method: 'GET',
        auto: true,
    });

    // useFetch for posting comments
    const {
        isLoading: postLoading,
        error: postError,
        refetch: postComment
    } = useFetch({
        url: `/api/reports/${id}/comment`,
        method: 'POST',
        auto: false,
        onSuccess: async () => {
            setCommentText('');
            await refetchComments();
        },
        onError: (err) => {
            setCommentError(err.message || 'Failed to add comment');
        }
    });


    // Minimalistic, modern card layout with owner, views, comments, and comment form
    const [shareSuccess, setShareSuccess] = useState('');
    const [openShareDialog, setOpenShareDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    // Edit report handler
    const handleEditReport = async (form) => {
        setEditLoading(true);
        try {
            const formData = new FormData();
            formData.append('name', form.name);
            formData.append('desc', form.desc);
            formData.append('type', form.type);
            if (form.file) formData.append('file', form.file);
            const res = await fetch(`/api/reports/${id}/patch`, {
                method: 'PATCH',
                body: formData,
            });
            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to edit report');
            toast.success('Report updated!');
            setOpenEditDialog(false);
            refetch();
        } catch (err) {
            toast.error(err.message || 'Failed to edit report');
        }
        setEditLoading(false);
    };
    const [faceVerified, setFaceVerified] = useState(false);
    const [accessType, setAccessType] = useState('face');



    const getDefaultValues = () => {
        if (accessType === 'face') {
            return { email: '' };
        } else if (accessType === 'otp' || accessType === 'qr') {
            return { phone: '' };
        }
        return {};
    };

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(schemaMap[accessType]),
        defaultValues: getDefaultValues(),
    });


    const {
        isLoading: shareLoading,
        error: shareError,
        refetch: shareReport
    } = useFetch({
        url: `/api/reports/${id}/share`,
        method: 'POST',
        auto: false,
        onSuccess: () => {
            setShareSuccess('Report shared successfully!');
            toast.success('Report shared successfully!');
            reset();
        },
        onError: (err) => {
            console.log(err)
            toast.error(err.message || 'Failed to share report');
            setShareSuccess('');
        }
    });

    const onShareSubmit = async (values) => {
        setShareSuccess('');
        let payload = { accessType };
        if (accessType === 'face') {
            const { email } = values;
            if (email) payload.email = email;
        } else if (accessType === 'otp' || accessType === 'qr') {
            const { phone } = values;
            if (phone) payload.phone = phone;
        }
        await shareReport({ payload });
    };



    if (isLoading) return (
        <Loader />
    );
    if (userLoading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-pulse w-32 h-8 rounded bg-muted" />
        </div>
    );
    if (error) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-destructive text-sm font-medium border border-destructive/30 rounded px-4 py-2 bg-card shadow-sm">{error}</div>
        </div>
    );
    if (!data) return null;
    // Only show report if current user is owner or in sharableUsers
    const isOwner = user && data.owner && String(user._id) === String(data.owner._id);
    const isShared = user && Array.isArray(data.sharableUsers) && data.sharableUsers.some(u => String(u) === String(user._id));
    if (!isOwner && !isShared) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-muted-foreground text-lg font-medium">You do not have access to this report.</div>
            </div>
        );
    }
    // If shared user, require face verification
    if (isShared && !isOwner && !faceVerified) {
        // You may want to fetch the targetDescriptor from user.faceDescriptor or report
        const targetDescriptor = user?.faceDescriptor || [];
        console.log("Descriptor length before save:", targetDescriptor.length); // should be 128

        return (
            <div className="flex flex-col items-center min-h-[60vh] py-10 px-4">
                <h2 className="text-xl font-semibold mb-6 text-center">Face Verification Required</h2>
                <SingleFaceDetector
                    startDetection={true}
                    targetDescriptor={targetDescriptor}
                    onMatch={() => setFaceVerified(true)}
                />
                <div className="mt-4 text-muted-foreground text-center">Please verify your face to access this shared report.</div>
            </div>
        );
    }
    return (
        <VoiceAssistantProvider>

            <div className="flex justify-center py-10 px-4">
                <div className="w-full  flex gap-2 flex-col sm:flex-row">
                    <div className="bg-card flex-1 border border-border rounded-xl shadow-md p-4 sm:p-6 flex flex-col gap-6">

                        {/* Header */}
                        <div className="flex justify-between gap-5 items-center border-b pb-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-3 w-10 h-10 rounded-full overflow-hidden border">
                                    <Image
                                        src={data.owner?.avatar || '/window.svg'}
                                        alt={data.owner?.name || 'User'}
                                        width={40}
                                        height={40}
                                        className="object-cover w-full h-full rounded-full"
                                    />
                                </div>
                                <div className="text-sm">
                                    <div className="font-semibold">{data.owner?.name || 'Unknown'}</div>
                                    <div className="text-muted-foreground text-xs">{data.owner?.email}</div>
                                </div>
                            </div>
                            {/* Edit Button & Dialog, then Share Button & Dialog */}
                            {(isOwner || isShared) && (
                                <div>
                                    <EditReportDialog
                                        open={openEditDialog}
                                        setOpen={setOpenEditDialog}
                                        initialData={data}
                                        onSubmit={handleEditReport}
                                        loading={editLoading}
                                    />
                                    <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
                                        <DialogTrigger asChild>
                                            <button
                                                type="button"
                                                className="ms-2 p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
                                                aria-label="Share Report"
                                            >
                                                <Share2 size={18} />
                                            </button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Share Report</DialogTitle>
                                            </DialogHeader>
                                            <form onSubmit={handleSubmit(onShareSubmit)} className="space-y-4">
                                                {accessType === 'face' ? (
                                                    <FormField
                                                        id="email"
                                                        label="User Email"
                                                        placeholder="Enter user email to share"
                                                        register={register}
                                                        errors={errors}
                                                        disabled={shareLoading}
                                                        required
                                                    />) : (
                                                    <FormField
                                                        id="phone"
                                                        label="User Phone Number"
                                                        placeholder="Enter user phone number to share"
                                                        register={register}
                                                        errors={errors}
                                                        disabled={shareLoading}
                                                        required
                                                    />
                                                )}
                                                <div className="flex flex-col gap-2 mt-2">
                                                    <label className="text-sm font-medium mb-1">Access Type</label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            className={`px-3 py-1 rounded-lg border ${accessType === 'qr' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} font-medium transition`}
                                                            onClick={() => setAccessType('qr')}
                                                        >QR Based</button>
                                                        <button
                                                            type="button"
                                                            className={`px-3 py-1 rounded-lg border ${accessType === 'otp' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} font-medium transition`}
                                                            onClick={() => setAccessType('otp')}
                                                        >OTP</button>
                                                        <button
                                                            type="button"
                                                            className={`px-3 py-1 rounded-lg border ${accessType === 'face' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'} font-medium transition`}
                                                            onClick={() => setAccessType('face')}
                                                        >Face Recognition</button>
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <button
                                                        type="submit"
                                                        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition text-sm"
                                                        disabled={shareLoading}
                                                    >
                                                        {shareLoading ? 'Sharing...' : 'Share'}
                                                    </button>
                                                </DialogFooter>
                                            </form>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mb-2 gap-5">

                            {/* Report Content */}
                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-semibold text-foreground">{data.title || 'Untitled Report'}</h2>
                                {data.description && (
                                    <p className="text-muted-foreground text-sm">{data.description}</p>
                                )}
                                <hr />
                                <div className="text-xs text-muted-foreground flex gap-4">
                                    <span>Views: <strong>{data.views}</strong></span>
                                    <span>Created: {data.createdAt ? format(new Date(data.createdAt), 'PPP') : '-'}</span>
                                    <span>Updated: {data.updatedAt ? format(new Date(data.updatedAt), 'PPpp') : '-'}</span>
                                </div>
                            </div>


                        </div>
                        {data.desc && (
                            <div className="text-muted-foreground mb-2 text-base">{data.desc}</div>
                        )}
                        {data.type === 'pdf' ? (
                            <div className="w-full  aspect-[4/3] flex items-center justify-center">
                                <iframe
                                    src={data.url}
                                    className="w-full h-[500px] border rounded-lg shadow-sm transition-all duration-200 "
                                    title="PDF Report"
                                    allow="autoplay"
                                />
                            </div>
                        ) : (
                            <div className="w-full flex items-center justify-center">
                                <Image
                                    src={data.url}
                                    alt="Report"
                                    width={600}
                                    height={800}
                                    className="rounded-lg max-h-[500px] object-contain"
                                    priority
                                />
                            </div>
                        )}
                        {/* Comments Section */}
                        <div className="w-full mt-6">
                            <h3 className="text-lg font-semibold mb-4">Comments</h3>
                            {commentsLoading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-pulse w-24 h-6 rounded bg-muted" />
                                </div>
                            ) : commentsError ? (
                                <div className="text-destructive text-sm font-medium border border-destructive/30 rounded px-4 py-2 bg-card shadow-sm">{commentsError}</div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {(commentsData?.comments && commentsData.comments.length > 0) ? (
                                        commentsData.comments.map((comment, idx) => (
                                            <div key={comment._id || idx} className="flex items-start gap-3 py-2  border-b border-border bg-gray-400/10 rounded-md px-2 last:border-none">
                                                <div className="flex-shrink-0">
                                                    <Image
                                                        src={comment.user?.avatar || '/window.svg'}
                                                        alt={comment.user?.name || comment.user?.email || 'User'}
                                                        width={36}
                                                        height={36}
                                                        className="rounded-full border object-cover"
                                                        style={{ borderRadius: '50%', objectFit: 'cover', width: 36, height: 36 }}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center mb-1 gap-2">
                                                        <span className="font-semibold text-sm">{comment.user?.name || 'User'}</span>
                                                        <span className="text-xs text-muted-foreground">{comment.user?.email}</span>
                                                        <span className="text-xs text-muted-foreground ml-auto">{comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a') : ''}</span>
                                                    </div>
                                                    <p className="text-sm text-foreground break-words">{comment.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-muted-foreground text-sm">No comments yet.</div>
                                    )}
                                </div>
                            )}
                            {/* Add Comment Form */}
                            <form
                                className="mt-4 flex flex-col sm:flex-row gap-2 items-center"
                                onSubmit={async e => {
                                    e.preventDefault();
                                    setCommentError('');
                                    if (!commentText.trim()) {
                                        setCommentError('Comment cannot be empty');
                                        return;
                                    }
                                    setCommentLoading(true);
                                    await postComment({
                                        payload: { text: commentText },
                                    });
                                    setCommentLoading(false);
                                }}
                            >
                                <input
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="flex-1 border border-border rounded-lg px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                    value={commentText}
                                    onChange={e => setCommentText(e.target.value)}
                                    disabled={commentLoading || postLoading}
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition"
                                    disabled={commentLoading || postLoading}
                                >
                                    {commentLoading || postLoading ? 'Posting...' : 'Comment'}
                                </button>
                            </form>
                            {(commentError || postError) && (
                                <div className="mt-2 text-destructive text-sm">
                                    {commentError || postError}
                                </div>
                            )}
                        </div>
                    </div>
                    <AiBot pdfUrl={data.type === 'pdf' && data.url} imgUrl={data.type !== 'pdf' && data.url} />
                </div>
            </div>
        </VoiceAssistantProvider>
    );
};

export default ReportView;