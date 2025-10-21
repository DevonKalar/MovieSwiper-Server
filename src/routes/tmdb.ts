import { Router } from 'express';
import {tmdbService} from '../services/tmdb.js';

const tmdbRouter = Router();

tmdbRouter.get('/details/:id', async (req, res) => {
    try {
        const movieId = parseInt(req.params.id, 10);
        const movieDetails = await tmdbService.fetchMovieDetails(movieId);
        if (!movieDetails) {
            return res.status(404).json({ error: 'Movie not found' });
        }
        res.json(movieDetails);
    } catch (error) {
        console.error("Error fetching movie details:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

tmdbRouter.get('/movies', async (req, res) => {
    try {
        const movies = await tmdbService.fetchMoviesByQuery(req);
        res.json(movies);
    } catch (error) {
        console.error("Error fetching movies:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

tmdbRouter.get('/genres', async (req, res) => {
    try {
        const genres = await tmdbService.fetchGenres();
        res.json(genres);
    } catch (error) {
        console.error("Error fetching genres:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default tmdbRouter;