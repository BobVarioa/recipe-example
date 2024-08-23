import { Link, Route, Routes } from "react-router-dom";
import "./Root.css";
import { Login } from "../pages/Login";
import { Main } from "../pages/Main";
import { Recipe } from "../pages/Recipe";
import { CreateRecipe } from "../pages/CreateRecipe";
import { Signup } from "../pages/Signup";
import { Profile } from "../pages/Profile";
import { UserManager } from "../utils/UserManager";
import { CgProfile } from "react-icons/cg";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { IoLogInOutline } from "react-icons/io5";
import { License } from "../pages/License";
import { About } from "../pages/About";
import { IoIosLogOut } from "react-icons/io";
import { Search } from "../pages/Search";
import { FaHome } from "react-icons/fa";

export function Root() {
	const userInfo = UserManager.useUserInfo();

	return (
		<>
			<header className="topbar">
				<div className="left">
					<span className="logo">
						Re¢ipes
					</span>
					<Link to="/" aria-label="Goto home" title="Goto home">
						<FaHome className="icon" />
					</Link>
				</div>
				<div className="right">
					{userInfo ? (
						<>
							<Link to="/create" aria-label="Create new recipe" title="Create new recipe">
								<HiOutlinePencilSquare className="icon" />
							</Link>
							<Link to="/profile" aria-label="Open profile" title="Open profile">
								<CgProfile className="icon" />
							</Link>
							<a onClick={() => UserManager.logout()} aria-label="Logout" title="Logout">
								<IoIosLogOut className="icon" />
							</a>
						</>
					) : (
						<Link to="/login" aria-label="Login to account" title="Login to account">
							<IoLogInOutline className="icon" />
						</Link>
					)}
				</div>
			</header>
			<section className="body">
				<Routes>
					<Route path="/" element={<Main />} />
					<Route path="/login" element={<Login />} />
					<Route path="/recipe/:recipeId" element={<Recipe />} />
					<Route path="/create" element={<CreateRecipe />} />
					<Route path="/signup" element={<Signup />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/profile/:profileId" element={<Profile />} />
					<Route path="/license" element={<License />} />
					<Route path="/about" element={<About />} />
					<Route path="/search/:tag" element={<Search />} />
				</Routes>
			</section>
			<footer>
				<Link to="/about">About</Link>
				<Link to="/license">License</Link>
			</footer>
		</>
	);
}
