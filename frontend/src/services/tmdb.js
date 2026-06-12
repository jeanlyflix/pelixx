// TMDB API service - rotates between provided keys
const KEYS = [
  'c8dea14dc917687ac631a52620e4f7ad',
  '3cb41ecea3bf606c56552db3d17adefd'
];
let keyIdx = 0;
const getKey = () => KEYS[keyIdx % KEYS.length];
const rotateKey = () => { keyIdx = (keyIdx + 1) % KEYS.length; };

const BASE = 'https://api.themoviedb.org/3';
export const IMG = 'https://image.tmdb.org/t/p/original';
export const IMG_W500 = 'https://image.tmdb.org/t/p/w500';
export const IMG_W780 = 'https://image.tmdb.org/t/p/w780';
export const IMG_W300 = 'https://image.tmdb.org/t/p/w300';

async function tmdb(path, params = {}) {
  const url = new URL(`${BASE}${path}`);
  url.searchParams.set('api_key', getKey());
  url.searchParams.set('language', 'es-ES');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  let res = await fetch(url);
  if (res.status === 429 || res.status === 401) {
    rotateKey();
    url.searchParams.set('api_key', getKey());
    res = await fetch(url);
  }
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export const TMDB = {
  trendingMovies: () => tmdb('/trending/movie/week'),
  trendingTV:     () => tmdb('/trending/tv/week'),
  popularMovies:  (p = 1) => tmdb('/movie/popular', { page: p }),
  topRatedMovies: (p = 1) => tmdb('/movie/top_rated', { page: p }),
  upcoming:       () => tmdb('/movie/upcoming'),
  nowPlaying:     () => tmdb('/movie/now_playing'),
  popularTV:      (p = 1) => tmdb('/tv/popular', { page: p }),
  topRatedTV:     () => tmdb('/tv/top_rated'),
  airingToday:    () => tmdb('/tv/airing_today'),
  byGenre:        (genreId, type = 'movie', p = 1) =>
                    tmdb(`/discover/${type}`, { with_genres: genreId, page: p, sort_by: 'popularity.desc' }),
  movieDetail:    (id) => tmdb(`/movie/${id}`, { append_to_response: 'videos,credits,similar' }),
  tvDetail:       (id) => tmdb(`/tv/${id}`, { append_to_response: 'videos,credits,similar' }),
  tvSeason:       (id, seasonNumber) => tmdb(`/tv/${id}/season/${seasonNumber}`),
  episodeVideos:  (id, season, ep) => tmdb(`/tv/${id}/season/${season}/episode/${ep}/videos`),
  search:         (q) => tmdb('/search/multi', { query: q, include_adult: 'false' }),
  videos:         (id, type = 'movie') => tmdb(`/${type}/${id}/videos`)
};

export function pickTrailer(videos = []) {
  if (!videos || !videos.length) return null;
  const trailers = videos.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser'));
  const official = trailers.find(v => v.official);
  return (official || trailers[0] || videos.find(v => v.site === 'YouTube')) || null;
}
