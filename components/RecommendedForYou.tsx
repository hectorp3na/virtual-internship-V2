import { ClockIcon, StarIcon } from '@heroicons/react/24/outline';

export default function RecommendedForYou() {
  const books = [
    {
      id: "5bxl50cz4bt",
      title: "How to Win Friends and Influence People in the Digital Age",
      author: "Dale Carnegie",
      subTitle: "Time-tested advice for the digital age",
      duration: "03:24",
      rating: "4.4",
      img: "https://firebasestorage.googleapis.com/v0/b/summaristt.appspot.com/o/books%2Fimages%2Fhow-to-win-friends-and-influence-people.png?alt=media&token=099193aa-4d85-4e22-8eb7-55f12a235fe2",
    },
    {
      id: "2l0idxm1rvw",
      title: "Can’t Hurt Me",
      author: "David Goggins",
      subTitle: "Master Your Mind and Defy the Odds",
      duration: "04:52",
      rating: "4.2",
      img: "https://firebasestorage.googleapis.com/v0/b/summaristt.appspot.com/o/books%2Fimages%2Fcant-hurt-me.png?alt=media&token=026646b0-40f8-48c4-8d32-b69bd5b8f700",
    },
    {
      id: "4t0amyb4upc",
      title: "Mastery",
      author: "Robert Greene",
      subTitle: "Myths about genius and what it really means to be great",
      duration: "04:40",
      rating: "4.3",
      img: "https://firebasestorage.googleapis.com/v0/b/summaristt.appspot.com/o/books%2Fimages%2Fmastery.png?alt=media&token=c41aac74-9887-4536-9478-93cd983892af",
    },
  ];

  return (
    <div className="mt-8">
      <h2 className="text-[22px] font-semibold text-gray-900">Recommended For You</h2>
      <p className="text-md text-gray-500 mb-4">We think you’ll like these</p>

      {/* Horizontal Scroll */}
      <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
        {books.map((book) => (
          <a
            key={book.id}
            href={`/book/${book.id}`}
            className="flex-none w-56 bg-white rounded-lg shadow-sm border hover:shadow-md transition p-3"
          >
            <figure className="w-full h-40 mb-3">
              <img
                className="w-full h-full object-cover rounded"
                src={book.img}
                alt={book.title}
              />
            </figure>
            <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">
              {book.title}
            </h3>
            <p className="text-xs text-gray-500">{book.author}</p>
            <p className="text-xs text-gray-400 mt-1">{book.subTitle}</p>

            <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>{book.duration}</span>
              </div>
              <div className="flex items-center space-x-1">
                <StarIcon className="w-4 h-4" />
                <span>{book.rating}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
