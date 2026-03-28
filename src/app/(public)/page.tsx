/* eslint-disable @typescript-eslint/no-explicit-any */


import HeroSection from '@/components/ui/modules/home/heroSection'
import JoinSection from '@/components/ui/modules/home/joinSection'
import LeaderboardSection from '@/components/ui/modules/home/leaderboardSection'
import PopularSection from '@/components/ui/modules/home/popularSection'
import SearchField from '@/components/ui/modules/home/searchField'
import TrendingSection from '@/components/ui/modules/home/trendingSection'
import { getMovies } from '@/lib/api'
import React from 'react'

// import { Navbar } from '@/src/components/layout/navbar';

export default async function HomePage() {
  let movies: any[] = [];
  let error: string | null = null;

  try {
    const response = await getMovies();
    console.log("REs", response)
    // Handle both response.data and direct array responses
    movies = response?.data || (Array.isArray(response) ? response : []);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load movies';
  }

  return (
    <div>
      {/* <Heading />
      <Navbar /> */}

      <div>
        <h1>Movies</h1>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
        {movies.length > 0 ? (
          movies.map((movie: any) => (
            <p key={movie.id}>{movie.title}</p>
          ))
        ) : (
          <p>{error ? 'Failed to load movies' : 'No movies available'}</p>
        )}
      </div>


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
