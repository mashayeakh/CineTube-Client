// const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// function getRequiredBaseUrl() {
//     if (!BASE_URL) {
//         throw new Error(
//             "Missing NEXT_PUBLIC_API_URL. Add it to your .env.local (example: NEXT_PUBLIC_API_URL=http://localhost:5000)."
//         );
//     }

//     return BASE_URL.replace(/\/$/, "");
// }

// export async function getMovies() {
//     const baseUrl = getRequiredBaseUrl();
//     const res = await fetch(`${baseUrl}/api/v1/movies`, {
//         cache: "no-store",
//         credentials: "include", // important for auth later
//     });

//     if (!res.ok) {
//         throw new Error(`Failed to fetch movies (${res.status} ${res.statusText})`);
//     }

//     return res.json();
// }