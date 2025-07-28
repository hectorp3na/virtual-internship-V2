export default function SelectedForYou() {
  return (
    <div className="mt-6">
      <h2 className="text-[22px] font-semibold text-gray-900 mb-4">
        Selected just for you
      </h2>

      <a
        href="/book/f9gy1gpai8"
        className="flex items-center bg-[#fbefd6] hover:bg-yellow-100 rounded-lg shadow-sm transition p-6"
      >
        {/* Book Info Text (Left Side) */}
        <div className="flex-1 pr-4">
          <p className="text-sm text-gray-700 mb-2">
            How Constant Innovation Creates Radically Successful Businesses
          </p>
          <div className="border-t border-gray-200 my-2"></div>
          <h3 className="text-lg font-bold text-gray-900">The Lean Startup</h3>
          <p className="text-sm text-gray-500 mb-2">Eric Ries</p>

          <div className="flex items-center text-gray-600 text-sm">
            <svg
              className="mr-1"
              stroke="currentColor"
              fill="currentColor"
              strokeWidth="0"
              viewBox="0 0 16 16"
              height="16"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z"></path>
            </svg>
            3 mins 23 secs
          </div>
        </div>

        {/* Book Image (Right Side) */}
        <figure className="flex-shrink-0 w-32 h-32">
          <img
            className="w-full h-full object-cover rounded-md"
            src="https://firebasestorage.googleapis.com/v0/b/summaristt.appspot.com/o/books%2Fimages%2Fthe-lean-startup.png?alt=media&amp;token=087bb342-71d9-4c07-8b0d-4dd1f06a5aa2"
            alt="The Lean Startup"
          />
        </figure>
      </a>
    </div>
  );
}
