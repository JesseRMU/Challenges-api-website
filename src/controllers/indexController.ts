import { Request, Response } from 'express';
import Axios from 'axios';

const TMDB_API_KEY: string = process.env.TMDB_API_KEY || '6d3c81c18d632781db93325231a49095';

interface GenreResponse {
  id: number;
  name: string;
}

interface MovieShowData {
  title: string;
  year: string;
  description: string;
  image: string | null;
  rating: string;
  voteAverage: number;
  numberOfSeasons: number | string;
  mediaType: string;
}

// kijkt of data geldig is voor ratings
const isValidRatingData = (data: unknown): data is Record<string, unknown> => {
  return typeof data === 'object' && data !== null && 'results' in data;
};

//checkt of de data geldig is en anders returnt die 'N/A'
const getDutchRating = (ratingsData: unknown, type: 'movie' | 'tv'): string => {
  if (!isValidRatingData(ratingsData) || !Array.isArray(ratingsData.results)) {
    return 'N/A';
  }

  if (type === 'movie') {
    const nlData: Record<string, unknown> | undefined = ratingsData.results.find((r: unknown) => {
      return typeof r === 'object' && r !== null && 'iso_3166_1' in r &&
             (r as Record<string, unknown>).iso_3166_1 === 'NL';
    }) as Record<string, unknown> | undefined;

    if (nlData && Array.isArray(nlData.release_dates) && nlData.release_dates.length > 0) {
      const firstRelease: Record<string, unknown> =
        nlData.release_dates[0] as Record<string, unknown>;
      return String(firstRelease.certification || 'N/A');
    }
  } else {
    const nlData: Record<string, unknown> | undefined = ratingsData.results.find((r: unknown) => {
      return typeof r === 'object' && r !== null && 'iso_3166_1' in r &&
             (r as Record<string, unknown>).iso_3166_1 === 'NL';
    }) as Record<string, unknown> | undefined;

    if (nlData && nlData.rating) {
      return String(nlData.rating);
    }
  }
  return 'N/A';
};

export const getIndex = (req: Request, res: Response): void => {
  res.render('index');
};

export const getGenres = async (req: Request, res: Response): Promise<void> => {
  try {
    const movieGenresResp: { data: { genres: GenreResponse[] } } = await Axios.get(
      `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
    );
    const tvGenresResp: { data: { genres: GenreResponse[] } } = await Axios.get(
      `https://api.themoviedb.org/3/genre/tv/list?api_key=${TMDB_API_KEY}&language=en-US`
    );

    // combineerd alle genres in een variabele, anders zijn soms sommige genres dubbel
    const genresMap: Map<number, string> = new Map<number, string>();
    movieGenresResp.data.genres.forEach((g: GenreResponse) => genresMap.set(g.id, g.name));
    tvGenresResp.data.genres.forEach((g: GenreResponse) => genresMap.set(g.id, g.name));

    // lijst met alle genres
    const genres: Array<{ id: number; name: string }> = Array.from(genresMap.entries())
      .map(([id, name]: [number, string]) => ({ id, name }));

    res.render('index', { genres }); // Stuurt genres naar de view
  } catch (err) {
    console.error(err);
    res.render('index', { genres: [] });
  }
};

// Genereert een random film of serie, afhankelijk van de toegepaste filters
export const getRandomMovieOrShow = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { genre, type, imdbScore } = req.query;

    // Determine type: use parameter or choose random if no type is given
    let mediaType: string;
    if (type === 'movie' || type === 'tv') {
      mediaType = type;
    } else {
      mediaType = Math.random() < 0.5 ? 'movie' : 'tv';
    }

    const randomPage: number = Math.floor(Math.random() * 500) + 1;

    let discoverUrl: string = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=${TMDB_API_KEY}&language=en-US&page=${randomPage}&sort_by=popularity.desc`;

    if (genre) {
      discoverUrl += `&with_genres=${genre}`;
    }

    // IMDB score filter
    if (imdbScore) {
      discoverUrl += `&vote_average.gte=${imdbScore}`;
    }

    const response: { data: { results: Record<string, unknown>[] } } = await Axios.get(discoverUrl);
    const results: Record<string, unknown>[] = response.data.results;

    if (!results || results.length === 0) {
      return res.status(404).json({ error: 'No results found for this genre' });
    }

    const randomItem: Record<string, unknown> = results[Math.floor(Math.random() * results.length)];

    // Haalt beschrijving over film of serie op
    const detailsUrl: string = `https://api.themoviedb.org/3/${mediaType}/${randomItem.id}?api_key=${TMDB_API_KEY}&language=en-US`;

    let ratingUrl: string;
    if (mediaType === 'movie') {
      ratingUrl = `https://api.themoviedb.org/3/movie/${randomItem.id}/release_dates?api_key=${TMDB_API_KEY}`;
    } else {
      ratingUrl = `https://api.themoviedb.org/3/tv/${randomItem.id}/content_ratings?api_key=${TMDB_API_KEY}`;
    }

    // Haal beide API calls tegelijk op met Promise.all()
    const responses: [{ data: Record<string, unknown> }, { data: unknown }] = await Promise.all([
      Axios.get(detailsUrl),
      Axios.get(ratingUrl)
    ]);

    const details: Record<string, unknown> = responses[0].data;
    const ratingNL: string = getDutchRating(responses[1].data, mediaType as 'movie' | 'tv');

    // Alle data die word teruggestuurd naar de client
    const data: MovieShowData = {
      title: mediaType === 'movie' ? String(details.title || '') : String(details.name || ''),
      year: String(details.release_date || details.first_air_date || '').slice(0, 4),
      description: String(details.overview || ''),
      image: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
      rating: ratingNL,
      voteAverage: Number(details.vote_average || 0),
      numberOfSeasons: mediaType === 'tv' ? (Number(details.number_of_seasons) || 'N/A') : 'N/A',
      mediaType: mediaType,
    };

    console.log('Random item data:', data);
    return res.json(data);
  } catch (err) {
    console.error('Error fetching TMDB data:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
