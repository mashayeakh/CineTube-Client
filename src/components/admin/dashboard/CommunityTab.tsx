import React from "react";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states/empty-state";
import { MessageSquare, Quote, ShieldAlert } from "lucide-react";

interface ReviewItem {
  id: string;
  author: string;
  excerpt: string;
  status: string;
  createdAt: string;
  spoiler: boolean;
}

interface CommunityTabProps {
  pendingReviews: ReviewItem[];
  comments: any[];
  pendingCount: number;
  reviewQueue: number;
  formatNumber: (v: number) => string;
  getStatusVariant: (status: string) => any;
}

export function CommunityTab({
  pendingReviews,
  comments,
  pendingCount,
  reviewQueue,
  formatNumber,
  getStatusVariant,
}: CommunityTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Review Queue */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Moderation Queue</h3>
              <p className="text-sm text-slate-500">{formatNumber(pendingCount || reviewQueue)} reviews awaiting approval</p>
            </div>
            <ShieldAlert className="size-5 text-amber-500" />
          </div>

          <div className="space-y-4">
            {pendingReviews.length === 0 ? (
              <EmptyState
                title="Queue is clear"
                description="No reviews are currently pending moderation."
              />
            ) : (
              pendingReviews.map((review) => (
                <div key={review.id} className="group relative rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-md hover:border-amber-100">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <p className="text-xs font-bold text-slate-700">{review.author}</p>
                    <div className="flex items-center gap-2">
                        {review.spoiler && <Badge variant="destructive" className="text-[8px] h-4">SPOILER</Badge>}
                        <Badge variant={getStatusVariant(review.status)} className="text-[10px] h-4">
                        {review.status}
                        </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Quote className="size-3 text-slate-300 mt-1 shrink-0" />
                    <p className="text-sm text-slate-600 line-clamp-2 italic leading-relaxed">
                        {review.excerpt}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-medium">{review.createdAt}</span>
                    <button className="text-[10px] font-bold text-blue-600 hover:underline">Moderation →</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-100 bg-blue-50/50 p-4 text-center">
                    <MessageSquare className="size-4 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{formatNumber(comments.length)}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Comments</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-violet-50/50 p-4 text-center">
                    <Quote className="size-4 text-violet-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900">{formatNumber(pendingReviews.length)}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">In Queue</p>
                </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                <MessageSquare className="size-32" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2 italic">Community Note</h3>
            <p className="text-sm text-slate-500 leading-relaxed relative z-10">
                User engagement is up 12% this week. Ensure all pending reviews are moderated within 24 hours to maintain platform health.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
