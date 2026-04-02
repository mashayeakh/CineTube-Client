/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { getMovies, type MovieListItem } from '@/app/(public)/public/_actions'
import { useQuery } from '@tanstack/react-query'
import React from 'react'

export default function MovieList() {

    const { data } = useQuery<MovieListItem[]>({
        queryKey: ['movies'],
        queryFn: () => getMovies(),
    })

    return (
        <div>
            <h1>Movie List</h1>
            {data?.map((movie) => (
                <div key={movie.id}>
                    <h2>{movie.title}</h2>
                    <p>{movie.description}</p>
                </div>
            ))}
        </div>
    )
}
