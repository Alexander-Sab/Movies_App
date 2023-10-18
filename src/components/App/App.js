import React, { Component } from 'react'

import { MovieServices } from '../../services/MovieServices'
import SearchTab from '../SearchTab'
import RatedTab from '../RatedTab'
import OnlineOfflineComponent from '../OnlineOfflineComponent'
import { NO_RATED_MOVIES_MESSAGE } from '../../constants/constants'
import './App.css'

export class App extends Component {
  state = {
    movies: [],
    searchValue: '',
    page: 1,
    totalPages: 0,
    activeTab: 'search',
    genres: [],
    guestSessionId: null,
    ratedMovies: [],
    ratedMoviesLoading: false,
    ratedMoviesError: null,
  }

  async componentDidMount() {
    const { genres } = this.state
    if (genres.length === 0) {
      await this.loadGenres()
    }
    this.searchMovies()
    this.createGuestSession()
  }

  loadGenres = async () => {
    try {
      const genres = await MovieServices.getGenres()
      this.setState({ genres })
    } catch (error) {
      console.error(error)
    }
  }

  searchMovies = () => {
    const { searchValue, page } = this.state
    MovieServices.searchMovies(searchValue, page)
      .then((response) => {
        const movies = response.movies
        const totalPages = response.totalPages
        this.setState({ movies, totalPages })
      })
      .catch((error) => console.error(error))
  }

  handleSearch = (searchValue) => {
    this.setState({ searchValue, page: 1 }, this.searchMovies)
  }

  createGuestSession = async () => {
    try {
      const guestSessionId = await MovieServices.createGuestSession()
      this.setState({ guestSessionId }, () => {
        this.loadRatedMovies(guestSessionId)
      })
    } catch (error) {
      console.error(error)
    }
  }

  loadRatedMovies = (guestSessionId) => {
    this.setState({ ratedMoviesLoading: true, ratedMoviesError: null })
    MovieServices.getRatedMoviesFromServer(guestSessionId)
      .then((response) => {
        const ratedMovies = response.movies
        this.setState({ ratedMovies, ratedMoviesLoading: false })
      })
      .catch((error) => {
        console.error(error)
        this.setState({
          ratedMoviesError: error.message,
          ratedMoviesLoading: false,
        })
      })
  }

  handleRate = (movieId, newRating) => {
    newRating = Math.min(10, Math.max(1, newRating))
    const { movies, guestSessionId } = this.state
    const movieIndex = movies.findIndex((movie) => movie.id === movieId)
    if (movieIndex === -1) {
      return
    }
    const updatedMovies = [...movies]
    updatedMovies[movieIndex].rating = newRating
    //console.log('newRating:', newRating)
    //console.log('updatedMovies:', updatedMovies)
    this.setState({ movies: updatedMovies }, () => {
      MovieServices.rateMovie(movieId, newRating, guestSessionId)
        .then(() => {
          const ratedMovies = updatedMovies.filter(
            (movie) => movie.rating !== null,
          )
          this.setState({ ratedMovies })
        })
        .catch((error) => {
          console.error(error)
        })
    })
  }

  renderSearchTab = () => {
    const { movies, page, totalPages, genres, guestSessionId } = this.state
    return (
      <SearchTab
        movies={movies}
        page={page}
        totalPages={totalPages}
        genres={genres}
        handleSearch={this.handleSearch}
        handleRate={this.handleRate}
        guestSessionId={guestSessionId}
      />
    )
  }

  renderRatedTab = () => {
    const { ratedMovies, genres, ratedMoviesLoading, ratedMoviesError } =
      this.state
    //console.log('возврат оцененных фильмов', ratedMovies)
    if (ratedMoviesLoading) {
      return <p>Loading...</p>
    }
    if (ratedMoviesError) {
      return <p>Error: {ratedMoviesError}</p>
    }
    if (!ratedMovies || ratedMovies.length === 0) {
      return <p>{NO_RATED_MOVIES_MESSAGE}</p>
    }
    ratedMovies.forEach((movie) => {
      //console.log('фильмы', movie)
    })
    return (
      <RatedTab
        ratedMovies={ratedMovies}
        genres={genres}
        handleRate={this.handleRate}
      />
    )
  }

  handleTabChange = (tab) => {
    if (
      tab === 'rated' &&
      (!this.state.ratedMovies || this.state.ratedMovies.length === 0)
    ) {
      this.loadRatedMovies(this.state.guestSessionId)
    }
    this.setState({ activeTab: tab })
  }

  handlePageChange = (page) => {
    this.setState({ page }, this.searchMovies)
  }

  render() {
    const { activeTab } = this.state
    return (
      <OnlineOfflineComponent
        activeTab={activeTab}
        handleTabChange={this.handleTabChange}
        renderSearchTab={this.renderSearchTab}
        renderRatedTab={this.renderRatedTab}
      />
    )
  }
}

export default App
