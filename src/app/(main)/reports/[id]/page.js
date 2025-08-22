'use client'

import React, { useState } from 'react';
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
            toast.success(err.message || 'Failed to share report');
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
    // Only show report if current user is owner
    if (!user || !data.owner || String(user._id) !== String(data.owner._id)) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="text-muted-foreground text-lg font-medium">You do not have access to this report.</div>
            </div>
        );
    }
    return (
  <div className="flex justify-center py-10 px-4">
    <div className="w-full max-w-2xl">
      <div className="bg-card border border-border rounded-xl shadow-md p-4 sm:p-6 flex flex-col gap-6">

        {/* Header */}
        <div className="flex justify-start gap-5 items-center border-b pb-4">
          <div className="flex items-center gap-3 w-10 h-10 rounded-full overflow-hidden border">
            <Image
              src={data.owner?.avatar || '/window.svg'}
              alt={data.owner?.name || 'User'}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
            </div>
            <div className="text-sm">
              <div className="font-semibold">{data.owner?.name || 'Unknown'}</div>
              <div className="text-muted-foreground text-xs">{data.owner?.email}</div>
            </div>
          <Dialog open={openShareDialog} onOpenChange={setOpenShareDialog}>
            <DialogTrigger asChild>
             <button
  type="button"
  className="ms-auto p-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition"
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
                <FormField
                  id="email"
                  label="User Email"
                  placeholder="Enter user email"
                  register={register}
                  errors={errors}
                  disabled={shareLoading}
                  required
                />
                <DialogFooter>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition text-sm"
                    disabled={shareLoading}
                  >
                    {shareLoading ? 'Sharing...' : 'Share'}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Report Content */}
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold text-foreground">{data.name || 'Untitled Report'}</h2>
          {data.desc && (
            <p className="text-muted-foreground text-sm">{data.desc}</p>
          )}
          <div className="text-xs text-muted-foreground flex gap-4">
            <span>Views: <strong>{data.views}</strong></span>
            <span>Created: {data.createdAt ? format(new Date(data.createdAt), 'PPP') : '-'}</span>
          </div>
        </div>

        {/* Report Media */}
        <div className="w-full flex justify-center items-center bg-muted/10 p-2 rounded-lg">
          {data.type === 'pdf' ? (
            <iframe
              src={data.url}
              className="w-full h-[500px] rounded-lg border"
              title="PDF Report"
            />
          ) : (
            <Image
              src={data.url}
              alt="Report"
              width={600}
              height={800}
              className="rounded-lg max-h-[500px] object-contain"
              priority
            />
          )}
        </div>

        {/* Comments Section */}
        <div className="pt-2">
          <h3 className="text-base font-semibold mb-3">Comments</h3>
          {commentsLoading ? (
            <div className="text-sm text-muted-foreground">Loading comments...</div>
          ) : commentsError ? (
            <div className="text-destructive text-sm">{commentsError}</div>
          ) : (
            <div className="flex flex-col gap-3">
              {commentsData?.comments?.length > 0 ? (
                commentsData.comments.map(comment => (
                  <div
                    key={comment._id}
                    className="bg-muted/40 rounded-lg px-4 py-2 flex gap-3 items-start"
                  >
                    <Image
                      src={comment.user?.avatar || '/window.svg'}
                      alt={comment.user?.name || 'User'}
                      width={32}
                      height={32}
                      className="rounded-full object-cover border"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-sm">{comment.user?.name || 'User'}</span>
                        <span className="text-xs text-muted-foreground">
                          {comment.createdAt ? format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a') : ''}
                        </span>
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

          {/* Comment Form */}
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
                payload: { text: commentText }
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
    </div>
  </div>
);
};

export default ReportView;