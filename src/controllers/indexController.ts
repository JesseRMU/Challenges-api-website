import { Request, Response } from 'express';
import axios from 'axios';

const TMDB_API_KEY = '6d3c81c18d632781db93325231a49095'; // of gebruik process.env.TMDB_API_KEY

// Helper functie om NL rating te zoeken in release_dates/content_ratings
const getDutchRating = (ratingsData: any, type: 'movie' | 'tv'): string => {
    if (type === 'movie') {
        // movie: ratingsData is release_dates.results[]
        const nlData = ratingsData.results.find((r: any) => r.iso_3166_1 === 'NL');
        if (nlData && nlData.release_dates.length > 0) {
            return nlData.release_dates[0].certification || 'N/A';
        }
    } else {
        // tv: ratingsData is results[] with iso_3166_1 and rating
        const nlData = ratingsData.results.find((r: any) => r.iso_3166_1 === 'NL');
        if (nlData) {
            return nlData.rating || 'N/A';
        }
    }
    return 'N/A';
};

export const getIndex = (req: Request, res: Response) => {
    res.render('index'); // Laadt de EJS view
};

export const getGenres = async (req: Request, res: Response) => {
    try {
        const movieGenresResp = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`);
        const tvGenresResp = await axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`);

        // Combineer genres (let op: genres kunnen overlappen)
        const genresMap = new Map<number, string>();
        movieGenresResp.data.genres.forEach((g: any) => genresMap.set(g.id, g.name));
        tvGenresResp.data.genres.forEach((g: any) => genresMap.set(g.id, g.name));

        // Unieke lijst van genres
        const genres = Array.from(genresMap.entries()).map(([id, name]) => ({ id, name }));

        res.render('index', { genres }); // Stuur genres mee naar view
    } catch (err) {
        console.error(err);
        res.render('index', { genres: [] });
    }
};


export const getRandomMovieOrShow = async (req: Request, res: Response) => {
    try {
        const { genre, type, imdbScore } = req.query; // genre ID, type en imdbScore uit query string

        // Bepaal het type: gebruik parameter of kies random als geen type is opgegeven
        let mediaType: string;
        if (type === 'movie' || type === 'tv') {
            mediaType = type;
        } else {
            mediaType = Math.random() < 0.5 ? 'movie' : 'tv';
        }

        const randomPage = Math.floor(Math.random() * 500) + 1;

        let discoverUrl = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${TMDB_API_KEY}&language=en-US&page=${randomPage}&sort_by=popularity.desc`;

        if (genre) {
            discoverUrl += `&with_genres=${genre}`;
        }

        // Voeg IMDB score filter toe
        if (imdbScore) {
            discoverUrl += `&vote_average.gte=${imdbScore}`;
        }

        const response = await axios.get(discoverUrl);
        const results = response.data.results;

        if (!results || results.length === 0) {
            return res.status(404).json({ error: 'No results found for this genre' });
        }

        const randomItem = results[Math.floor(Math.random() * results.length)];

        // Haal gedetailleerde info en rating gelijktijdig op
        const detailsUrl = `https://api.themoviedb.org/3/${mediaType}/${randomItem.id}?api_key=${TMDB_API_KEY}&language=en-US`;

        let ratingUrl: string;
        if (mediaType === 'movie') {
            ratingUrl = `https://api.themoviedb.org/3/movie/${randomItem.id}/release_dates?api_key=${TMDB_API_KEY}`;
        } else {
            ratingUrl = `https://api.themoviedb.org/3/tv/${randomItem.id}/content_ratings?api_key=${TMDB_API_KEY}`;
        }

        // Concurrent requests using Promise.all()
        const [detailsResponse, ratingResponse] = await Promise.all([
            axios.get(detailsUrl),
            axios.get(ratingUrl)
        ]);

        const details = detailsResponse.data;
        const ratingNL = getDutchRating(ratingResponse.data, mediaType as 'movie' | 'tv');

        const data: any = {
            title: mediaType === 'movie' ? details.title : details.name,
            year: (details.release_date || details.first_air_date || '').slice(0, 4),
            description: details.overview,
            image: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            rating: ratingNL,
            vote_average: details.vote_average,
            number_of_seasons: mediaType === 'tv' ? details.number_of_seasons : 'N/A',
            media_type: mediaType,
        };

        console.log('Random item data:', data);
        return res.json(data);
    } catch (err) {
        console.error('Error fetching TMDB data:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
