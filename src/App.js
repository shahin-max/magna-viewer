import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // Assuming your CSS is here

function App() {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [pages, setPages] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [currentChapterId, setCurrentChapterId] = useState(null);
  const [currentBookId, setCurrentBookId] = useState(null);

  useEffect(() => {
    // Fetch books on component mount
    const fetchBooks = async () => {
      const response = await axios.get('http://52.195.171.228:8080/books/');
      setBooks(response.data);
    };
    fetchBooks();
  }, []);

  const fetchChapters = async (bookId) => {
    setCurrentBookId(bookId); // Set the active book
    const response = await axios.get(`http://52.195.171.228:8080/books/${bookId}/`);
    setChapters(response.data.chapter_ids);
    setCurrentChapterId(null); // Reset chapter
    setPages([]); // Clear pages
  };

  const fetchPages = async (chapterId) => {
    setCurrentChapterId(chapterId); // Set the active chapter
    const response = await axios.get(`http://52.195.171.228:8080/chapters/${chapterId}/`);
    setPages(response.data.pages);
    setCurrentPageIndex(0); // Start at the first page of the chapter
  };

  const nextPage = () => {
    if (currentPageIndex < pages.length - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    } else {
      // If last page of chapter, fetch next chapter
      const nextChapterIndex = chapters.indexOf(currentChapterId) + 1;
      if (nextChapterIndex < chapters.length) {
        fetchPages(chapters[nextChapterIndex]);
      }
    }
  };

  const prevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    } else {
      // If first page of chapter, fetch previous chapter
      const prevChapterIndex = chapters.indexOf(currentChapterId) - 1;
      if (prevChapterIndex >= 0) {
        fetchPages(chapters[prevChapterIndex]);
        // Set to the last page of the previous chapter
        setTimeout(() => setCurrentPageIndex(pages.length - 1), 100); // Adding timeout to ensure pages are fetched
      }
    }
  };

  const handleImageClick = (e) => {
    const clickX = e.nativeEvent.offsetX;
    const imageWidth = e.target.width;
    if (clickX < imageWidth / 2) {
      // Clicked left side (previous page)
      prevPage();
    } else {
      // Clicked right side (next page)
      nextPage();
    }
  };

  return (
    <div className="MangaViewer">
      <div className="BookList">
        {books.map((book) => (
          <button
            key={book.id}
            onClick={() => fetchChapters(book.id)}
            className={book.id === currentBookId ? 'active' : ''}
          >
            {book.title}
          </button>
        ))}
      </div>

      <div className="ChapterList">
        {chapters.map((chapterId, index) => (
          <button
            key={chapterId}
            onClick={() => fetchPages(chapterId)}
            className={chapterId === currentChapterId ? 'active' : ''}
          >
            {index + 1}
          </button>
        ))}
      </div>

      <div className="PageViewer">
        {pages.length > 0 && (
          <img
            src={pages[currentPageIndex].image.file}
            alt={`Page ${currentPageIndex}`}
            onClick={handleImageClick} // Handle click to detect left or right side click
            style={{ width: '20%', cursor: 'pointer', border: '5px solid black' }}
          />
        )}
      </div>
      {pages.length > 0 && (
        <div className="page-count">
          {`${currentPageIndex + 1} / ${pages.length}`} {/* Updated display */}
        </div>
      )}
    </div>
  );
}

export default App;
