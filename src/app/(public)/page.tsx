

import { Navbar } from '@/components/navbar'
import Heading from '@/components/ui/modules/home/heading'
import HeroSection from '@/components/ui/modules/home/heroSection'
import JoinSection from '@/components/ui/modules/home/joinSection'
import LeaderboardSection from '@/components/ui/modules/home/leaderboardSection'
import PopularSection from '@/components/ui/modules/home/popularSection'
import SearchField from '@/components/ui/modules/home/searchField'
import TrendingSection from '@/components/ui/modules/home/trendingSection'
import React from 'react'

// import { Navbar } from '@/src/components/layout/navbar';

export default function HomePage() {
  return (
    <div>
      <Heading />
      <Navbar />
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
