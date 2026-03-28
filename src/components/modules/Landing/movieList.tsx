/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { getMovies } from '@/app/(public)/movie/_actions'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

export default function MovieList() {

    const { data } = useQuery({
        queryKey: ['movies'],
        queryFn: () => getMovies(),
    })

    console.log("movies==", data)
    return (
        <div>
            <h1>Movie List</h1>
            {data?.map((movie: any) => (
                <div key={movie.id}>
                    <h2>{movie.title}</h2>
                    <p>{movie.description}</p>
                </div>
            ))}
        </div>
    )
}
