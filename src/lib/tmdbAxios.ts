import axios from "axios";

export const tmdbAxios = axios.create({
  baseURL: "https://api.themoviedb.org/3/",
  headers: {
    Authorization: `Bearer ${process.env.TMDB_BEARER_TOKEN ?? ""}`,
    Accept: "application/json",
  },
});
