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
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: zodResolver(shareSchema),
        defaultValues: { email: '' },
    });

    const [shareSuccess, setShareSuccess] = useState('');
    const [openShareDialog, setOpenShareDialog] = useState(false);
    const [faceVerified, setFaceVerified] = useState(false);

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
        await shareReport({
            payload: { email: values.email },
        });
    };



    if (isLoading) return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="animate-pulse w-32 h-8 rounded bg-muted" />
        </div>
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
        const targetDescriptor = user?.faceDescriptor|| [];
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
        <div className="flex flex-col items-center min-h-[60vh] py-10 px-4">
            <div className="w-full max-w-2xl">
                <div className="bg-card border border-border rounded-xl shadow-lg p-8 flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center w-full mb-2 gap-2">
                        {/* Share Button & Dialog - only for owner, not for shared users */}
                        {isOwner && (
                            <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
                                <DialogTrigger asChild>
                                    <button
                                        type="button"
                                        className="px-3 py-1 rounded-lg bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition text-sm mb-2"
                                    >
                                        Share Report
                                    </button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Share Report</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleSubmit(onShareSubmit)} className="space-y-4">
                                        <FormField
                                            id="email"
                                            label="User Email"
                                            placeholder="Enter user email to share"
                                            register={register}
                                            errors={errors}
                                            disabled={shareLoading}
                                            required
                                        />
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
                        )}
                        <h2 className="text-2xl font-semibold tracking-tight">{data.name || 'Report'}</h2>
                        <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
                            {data.owner && (
                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                    {data.owner.avatar && (
                                        <Image src={data.owner.avatar} alt="Owner Avatar" width={28} height={28} className="rounded-full border object-cover"
                                            style={{ borderRadius: '50%', objectFit: 'cover', width: 36, height: 36 }} />
                                    )}
                                    Owner: <span className="font-medium">{data.owner.name || data.owner.email}</span>
                                </span>
                            )}
                            <span className="text-sm text-muted-foreground">Views: <span className="font-medium">{data.views ?? 0}</span></span>
                        </div>
                    </div>
                    {data.desc && (
                        <div className="text-muted-foreground mb-2 text-base">{data.desc}</div>
                    )}
                    <div className="flex gap-4 text-xs text-muted-foreground mb-2">
                        <span>Created: {data.createdAt ? format(new Date(data.createdAt), 'PPpp') : '-'}</span>
                        <span>Updated: {data.updatedAt ? format(new Date(data.updatedAt), 'PPpp') : '-'}</span>
                    </div>
                    {data.type === 'pdf' ? (
                        <div className="w-full aspect-[4/3] flex items-center justify-center">
                            <iframe
                                src={data.url}
                                className="w-full h-[500px] border rounded-lg shadow-sm transition-all duration-200"
                                title="PDF Report"
                                allow="autoplay"
                            />
                        </div>
                    ) : (
                        <div className="w-full flex items-center justify-center">
                            <Image
                                src={data.url}
                                alt="Report Image"
                                width={600}
                                height={800}
                                className="rounded-lg shadow-sm object-contain max-h-[500px] w-auto"
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
                                        <div key={comment._id || idx} className="flex items-start gap-3 py-2 px-1 border-b border-border last:border-none">
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
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-base text-foreground">{comment.user?.name || 'User'}</span>
                                                    <span className="text-xs text-muted-foreground">{comment.user?.email}</span>
                                                    <span className="text-xs text-muted-foreground ml-auto">{comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a') : ''}</span>
                                                </div>
                                                <div className="text-[15px] text-foreground mt-1" style={{ wordBreak: 'break-word' }}>{comment.text}</div>
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
                            className="mt-6 flex flex-col md:flex-row gap-2 items-center"
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
                                    headers: {},
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
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium shadow hover:bg-primary/90 transition"
                                disabled={commentLoading || postLoading}
                            >
                                {(commentLoading || postLoading) ? 'Posting...' : 'Comment'}
                            </button>
                        </form>
                        {commentError && <div className="mt-2 text-destructive text-sm">{commentError}</div>}
                        {postError && <div className="mt-2 text-destructive text-sm">{postError}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportView;