/* eslint-disable @typescript-eslint/no-explicit-any */


import HeroSection from '@/components/ui/modules/home/heroSection'
import JoinSection from '@/components/ui/modules/home/joinSection'
import LeaderboardSection from '@/components/ui/modules/home/leaderboardSection'
import PopularSection from '@/components/ui/modules/home/popularSection'
import SearchField from '@/components/ui/modules/home/searchField'
import TrendingSection from '@/components/ui/modules/home/trendingSection'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import React from 'react'
import { getMovies } from './movie/_actions'
import MovieList from '@/components/modules/Movies/MovieList'

// import { Navbar } from '@/src/components/layout/navbar';

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
        <MovieList />
      </HydrationBoundary>


      <SearchField />
      {/* <Hero /> */}
      <HeroSection />
      <TrendingSection />
      <PopularSection />
      <JoinSection />
      <LeaderboardSection />
    </div>
  )
}
