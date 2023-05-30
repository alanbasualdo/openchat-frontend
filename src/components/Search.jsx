export const Search = ({ search, setSearch }) => {

    return (
        <div className="relative">
            <input
                type="text"
                placeholder="Search user"
                className="rounded-xl w-full border-gray-300 pl-10 text-gray-500 h-14"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            <i className="ri-search-line absolute top-4 left-4 text-gray-500"></i>
        </div>
    )
}
