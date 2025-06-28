// src/controllers/indexController.ts
import { Request, Response } from 'express';
import axios from 'axios';

const TMDB_API_KEY = '6d3c81c18d632781db93325231a49095'; // of gebruik process.env.TMDB_API_KEY

export const getIndex = (req: Request, res: Response) => {
    res.render('index'); // Laadt de EJS view
};

export const getRandomMovieOrShow = async (req: Request, res: Response) => {
    try {
        const type = Math.random() < 0.5 ? 'movie' : 'tv';
        const randomPage = Math.floor(Math.random() * 500) + 1;

        const discoverUrl = `https://api.themoviedb.org/3/discover/${type}?api_key=${TMDB_API_KEY}&language=nl-NL&page=${randomPage}&sort_by=popularity.desc`;

        const response = await axios.get(discoverUrl);
        const results = response.data.results;

        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'Geen resultaten gevonden' });
        }

        const randomItem = results[Math.floor(Math.random() * results.length)];

        const data: any = {
            title: type === 'movie' ? randomItem.title : randomItem.name,
            year: (randomItem.release_date || randomItem.first_air_date || '').slice(0, 4),
            description: randomItem.overview,
            image: `https://image.tmdb.org/t/p/w500${randomItem.poster_path}`,
        };

                // Extra call als het een tv-serie is om aantal seizoenen te halen
        if (type === 'tv') {
            const detailsUrl = `https://api.themoviedb.org/3/tv/${randomItem.id}?api_key=${TMDB_API_KEY}&language=nl-NL`;
            const detailsResponse = await axios.get(detailsUrl);
            data.number_of_seasons = detailsResponse.data.number_of_seasons;
        }

        console.log('Random item data:', data);
        return res.json(data);
    } catch (err) {
        console.error('Fout bij ophalen TMDB data:', err);
       return res.status(500).json({ error: 'Interne serverfout' });
    }
};


