import { useEffect, useState } from "react";
import { Api, type Recipe } from "../utils/Api";
import { useParams } from "react-router";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IngredientList } from "../components/IngredientList";
import { Link } from "react-router-dom";
import { TagList } from "../components/TagList";

export function Recipe() {
	const { recipeId: recipeIdParam } = useParams();
	const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);

	const recipeId = Number.parseInt(recipeIdParam ?? "");
	let invalid = false;

	if (Number.isNaN(recipeId)) {
		invalid = true;
	}

	const [error, setError] = useState<string>("");

	let cancelled = false;
	useEffect(() => {
		if (!invalid) {
			Api.getRecipe(recipeId).then((v) => {
				if (!cancelled) {
					if (v.success) {
						setRecipe(v.data);
						return;
					}
					setError(v.error);
				}
			});

			return () => {
				cancelled = true;
			};
		}
	}, [recipeIdParam, invalid]);

	if (!recipe) {
		if (error.length > 0) return <span className="error">{error}</span>;
		return <>Loading...</>;
	}

	return (
		<>
			<h1>{recipe.title}</h1>
			<TagList tags={recipe.tags.map(v => v.name)}></TagList>
			<caption>
				<span>
					- <Link to={`/profile/${recipe.user_id}`}>{recipe.display_name}</Link>
				</span>
			</caption>


			<h3>Ingredients: </h3>
			<IngredientList ingredients={recipe.ingredients} />

			<hr />

			<Markdown remarkPlugins={[remarkGfm]}>{recipe.body}</Markdown>
		</>
	);
}
