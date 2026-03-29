import { httpClient } from "@/lib/axios/httpClient"

export const getMovies = async () => {
    const allMovies = await httpClient.get("/movies")
    console.log("all ", allMovies.result)
    return allMovies.result
}

