import React, { createContext, useState, useEffect } from 'react'

export const GenreContext = createContext([])

export const GenreProvider = ({ children, genres }) => {
  // Принимайте genres как проп
  const [genreList, setGenreList] = useState([])

  useEffect(() => {
    setGenreList(genres) // Используйте переданные genres
  }, [genres])

  return (
    <GenreContext.Provider value={genreList}>{children}</GenreContext.Provider>
  )
}

export default GenreProvider
