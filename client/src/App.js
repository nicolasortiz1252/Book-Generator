import './App.css';
import React, { useEffect, useRef, useState } from "react";

const BookCard = ({onSubmit}) => {
    const [author, setAuthor] = useState("");
    const [title, setTitle] = useState("");
    const [year, setYear] = useState("");
    const [rating, setRating] = useState("");
    const [pages, setPages] = useState("");
    const [theme, setTheme] = useState("");

    const handleSubmit = () => {
      const bookData = {
        author,
        title,
        year,
        rating,
        pages,
        theme,
      };
      onSubmit(bookData);
    }

    return(
      <div className="w-[400px] border rounded-lg overflow-hidden shadow-lg">
      <div className="px-6 py-4">
        <div className="font-bold text-xl mb-2">Generador de Libros</div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="author"
          >
            Autor
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="author"
            type="text"
            placeholder="Introducir autor"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="title"
          >
            Libro similar
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="title"
            type="text"
            placeholder="Introducir título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="year"
          >
            Año de salida
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="year"
            type="text"
            placeholder="Introducir año de salida"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="rating"
          >
            Puntuación
          </label>
          <select
            className="block appearance-none w-full bg-white border border-gray-400 hover:border-gray-500 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline"
            id="rating" 
            value={rating}
            onChange={(e) => setRating(e.target.value)}
          >
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select>
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="pages"
          >
            Cantidad de páginas
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="pages"
            type="text"
            placeholder="Introducir cantidad de páginas"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="theme"
          >
            Género
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="theme"
            type="text"
            placeholder="Introducir género"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>
        <div className="px-6 py-4">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="button"
            onClick={handleSubmit}
          >
            Generar Libro
          </button>
        </div>
      </div>
    </div>
    )
}

function App() {
  const [bookData, setBookData] = useState(null);
  const [bookText, setBookText] = useState("");

  let eventSourceRef = useRef(null);

  useEffect(()=>{
    if(bookData){
      closeEventStream();
      initializeEventStream();
    }
  }, [bookData])

  const initializeEventStream = () => {
    const bookInputs = {... bookData};

    const queryParams = new URLSearchParams(bookInputs).toString();
    const url = `http://localhost:3001/bookStream?${queryParams}`;
    eventSourceRef.current = new EventSource(url);

    eventSourceRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.action === "close") {
        closeEventStream();
      } else if (data.action === "chunk") {
        setBookText((prev) => prev + data.chunk);
      }
    }
  }

  const closeEventStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }

  async function onSubmit(data){
    setBookText('');  
    setBookData(data);
  }

  return (
    <div className="App">
    <div className="flex flex-row h-full my-4 gap-2 justify-center">
      <BookCard onSubmit={onSubmit} />
      <div className="w-[400px] h-[565px] text-xs text-gray-600 p-4 border rounded-lg shadow-xl whitespace-pre-line overflow-y-auto">
        {bookText}
      </div>
    </div>
  </div>
  );
}

export default App;
