import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  return (
    <div className="fixed justify-between left-0 right-0 top-0 z-50 h-16 border-b border-primary/50 bg-background shadow-sm flex items-center">
      <div className="px-8 flex items-center gap-10 ">
        <Link to="/" className="text-xl">Weathleats</Link>
        <div className="gap-10 flex text-sm">
          <Link
            to="/"
            className="text-[#637257] hover:text-textBlack transition-colors duration-100 ease-in-out"
          >
            Recipes
          </Link>
          {/* <Link
            to="/articles"
            className="text-primary hover:text-textBlack transition-colors duration-100 ease-in-out"
          >
            Articles
          </Link> */}
          <Link
            to=""
            className="text-[#637257] hover:text-textBlack transition-colors duration-100 ease-in-out"
          >
            Submit a recipe
            <span className="text-[10px] px-2 py-2 ml-2 rounded-[4px] bg-[#637257] text-textWhite">
              Coming soon
            </span>
          </Link>
        </div>
      </div>
      {pathname !== "/login" && pathname !== "/signup" && (
        <div className="px-10 flex items-center gap-5">
          {user && pathname !== "/profile" && (
            <Link
              to="/profile"
              className="py-2 px-3 bg-primary text-textWhite text-sm rounded-[4px]"
            >
              Profile
            </Link>
          )}
          {!user && (
            <>
              <Link to="/signup" className="p-2 text-sm text-textBlack">
                Sign up
              </Link>
              <Link
                to="/login"
                className="py-2 px-3 bg-[#637257] text-textWhite text-xs rounded-md"
              >
                Login
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
