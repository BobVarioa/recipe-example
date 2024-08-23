import { Navigate, useParams } from "react-router";
import { Api } from "../utils/Api";
import { RecipeCarousel } from "../components/RecipeCarousel";

export function Search() {
	const { tag } = useParams();

	if (!tag || tag.length === 0) {
		return <Navigate to="/" />;
	}

	return (
		<>
			<h3>Recipes tagged #{tag}:</h3>
			<RecipeCarousel
				grid={true}
				recipes={async () => {
					const res = await Api.getRecipes(20, [tag]);
					if (res.success) {
						return res.data;
					}
					return [];
				}}
			/>
		</>
	);
}
