import HeroSection from '@/components/ui/modules/home/heroSection'
import LeaderboardSection from '@/components/ui/modules/home/leaderboardSection'
import PopularSection from '@/components/ui/modules/home/popularSection'
import RecommendFeedSection from '@/components/ui/modules/home/recommendFeedSection'
import TrendingSection from '@/components/ui/modules/home/trendingSection'
import TopRatedSection from '@/components/ui/modules/home/topRatedSection'
import NewReleasesSection from '@/components/ui/modules/home/newReleasesSection'
import GenreSpotlightSection from '@/components/ui/modules/home/genreSpotlightSection'
import LatestReviewsSection from '@/components/ui/modules/home/latestReviewsSection'
import CommunitySection from '@/components/ui/modules/home/communitySection'
import ChatWidget from '@/components/chat-widget'
import { HomeNavigation } from '@/components/ui/modules/home/home-navigation'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import React, { Suspense } from 'react'
import { getMovies } from './public/_actions'
import { LoadingState } from '@/components/ui/states/feedback-states'

export default async function HomePage() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['movies'],
    queryFn: getMovies,
  })

  return (
    <div className="relative">
      <HomeNavigation />
      
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div id="hero"><HeroSection /></div>
        
        <div id="trending">
          <Suspense fallback={<LoadingState message="Loading trending..." />}>
            <TrendingSection />
          </Suspense>
        </div>

        <div id="popular">
          <Suspense fallback={<LoadingState message="Loading popular..." />}>
            <PopularSection />
          </Suspense>
        </div>

        <div id="recommend">
          <Suspense fallback={<LoadingState message="Curating for you..." />}>
            <RecommendFeedSection />
          </Suspense>
        </div>

        <div id="leaderboard">
          <Suspense fallback={<LoadingState message="Loading champions..." />}>
            <LeaderboardSection />
          </Suspense>
        </div>

        <div id="top-rated">
          <Suspense fallback={<LoadingState message="Fetching top rated..." />}>
            <TopRatedSection />
          </Suspense>
        </div>

        <div id="new-releases">
          <Suspense fallback={<LoadingState message="Discovering new releases..." />}>
            <NewReleasesSection />
          </Suspense>
        </div>

        <div id="genres">
          <Suspense fallback={<LoadingState message="Exploring genres..." />}>
            <GenreSpotlightSection />
          </Suspense>
        </div>

        <div id="reviews">
          <Suspense fallback={<LoadingState message="Reading latest reviews..." />}>
            <LatestReviewsSection />
          </Suspense>
        </div>

        <div id="community">
          <Suspense fallback={<LoadingState message="Connecting to community..." />}>
            <CommunitySection />
          </Suspense>
        </div>
      </HydrationBoundary>
      
      <ChatWidget />
    </div>
  )
}
