/* eslint-disable @typescript-eslint/no-explicit-any */


import HeroSection from '@/components/ui/modules/home/heroSection'
import JoinSection from '@/components/ui/modules/home/joinSection'
import LeaderboardSection from '@/components/ui/modules/home/leaderboardSection'
import PopularSection from '@/components/ui/modules/home/popularSection'
import SearchField from '@/components/ui/modules/home/searchField'
import TrendingSection from '@/components/ui/modules/home/trendingSection'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import React from 'react'
import { getMovies } from './public/_actions'

// import { Navbar } from '@/src/components/layout/navbar';
import MovieList from './../../components/modules/Landing/movieList';

export default async function HomePage() {

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['movies'],
    queryFn: getMovies,
  })


  return (
    <div>
      {/* <Heading />
      <Navbar /> */}

      <HydrationBoundary state={dehydrate(queryClient)}>
        {/* <MovieList /> */}

        {/* <Hero /> */}
        <HeroSection />
        <TrendingSection />
        <PopularSection />
        <JoinSection />
        <LeaderboardSection />
      </HydrationBoundary>
    </div>
  )
}
