

import { Navbar } from '@/components/navbar'
import Heading from '@/components/ui/modules/home/heading'
import Hero from '@/components/ui/modules/home/hero'
import SearchField from '@/components/ui/modules/home/searchField'
import React from 'react'

// import { Navbar } from '@/src/components/layout/navbar';

export default function HomePage() {
  return (
    <div>
      <Heading />
      <Navbar />
      <SearchField />
      <Hero />
    </div>
  )
}
