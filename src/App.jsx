import React, { useEffect,useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite.js'
const API_BASE_URL = 'https://api.themoviedb.org/3'

const API_KEY = import.meta.env.VITE_IMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`

  }
}
const App = () => {

    const [SearchTerm,setSearchTerm] = useState('');

     const[ErrorMessage,setErrorMessage] = useState('');

     const [movieList, setMovieList] = useState([]);

     const [isLoading, setisLoading] = useState(false);

       const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')

         const [trendingMovies, setTrendingMovies] = useState([]);

 // Debounce the search term to prevent making too many API requests
  // by waiting for the user to stop typing for 500ms
      useDebounce(() => setDebouncedSearchTerm(SearchTerm), 500, [SearchTerm])

    const fetchMovies =async(query) =>{
        setisLoading(true);
        setErrorMessage('');

      try{
          const endpoint = query? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`:`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

          const response = await fetch(endpoint,API_OPTIONS);

          if(!response.ok){
            throw new Error(`Failed to fetch movies`)
          }
          const data = await response.json();

          if(data.response == 'False'){
               setErrorMessage(data.Error || `Failed to fetch movies`)
               setMovieList([]);
               return;
          }
          setMovieList(data.results || []);
           if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
      }catch(error){
        console.error(`Error fetching movies: ${error}`);
        setErrorMessage(`ERRROR FETCHING MOVIES`);
      } finally{
        setisLoading(false);
      }
    }
      const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  }

    useEffect( () => {
      fetchMovies(debouncedSearchTerm);
    },[debouncedSearchTerm]);

    useEffect( () =>{
            loadTrendingMovies();
    },[])

  return (
   <main>
    <div className="pattern" />
    <div className="wrapper">
    <header>
      <img  src="./hero.png" alt ="Hero Banner"/>
      <h1>Tired of   <span className="text-gradient">Searching?</span> We’ve Got Your Movie Night Covered </h1>
      <Search SearchTerm={SearchTerm} setSearchTerm={setSearchTerm}/>
      <h1 className="text-white">{SearchTerm}</h1>
    </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}


    <section className="all-movies">
     <h2>All Movies</h2>
     {isLoading?(
      <Spinner/>
     ) : ErrorMessage ? (
        <p className="text-red-500">{ErrorMessage}</p>
     ) : (
      <ul>
        {movieList.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
      </ul>
     )

     }
    </section>
    </div>
   </main>
  )
}

export default App