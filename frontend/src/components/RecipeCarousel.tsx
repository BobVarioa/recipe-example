import { useEffect, useState } from "react";
import type { Recipe } from "../utils/Api";
import "./RecipeCarousel.css";
import { Link } from "react-router-dom";
import { TagList } from "./TagList";

type RecipeNoBody = Omit<Recipe, "body">;

interface RecipeCarouselProps {
	recipes(): Promise<RecipeNoBody[]>;
	grid?: boolean;
}

export function RecipeCarousel({ recipes: getRecipes, grid = false }: RecipeCarouselProps) {
	const [recipes, setRecipes] = useState<RecipeNoBody[]>([]);

	let ignore = false;
	useEffect(() => {
		getRecipes().then((v) => {
			if (!ignore) {
				setRecipes(v);
			}
		});
		return () => {
			ignore = true;
		};
	}, [getRecipes]);

	return (
		<div className={grid ? "recipe-carousel-grid" : "recipe-carousel"}>
			{recipes.length === 0 ? <p>No recipes...</p> : recipes.map((v) => (
				<Link className="recipe" to={`/recipe/${v.id}`} key={v.id}>
					<p className="title">{v.title}</p>
					<p className="author">- {v.display_name}</p>
					<TagList tags={v.tags.map(v => v.name)} />
				</Link>
			))}
		</div>
	);
}
