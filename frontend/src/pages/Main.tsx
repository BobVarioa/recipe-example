import { Fragment } from "react/jsx-runtime";
import { Api } from "../utils/Api";
import { RecipeCarousel } from "../components/RecipeCarousel";
import { UserManager } from "../utils/UserManager";

export function Main() {
	const userInfo = UserManager.useUserInfo();

	if (userInfo && userInfo.tags.length != 0) {
		const tags = userInfo.tags;
		return (
			<>
				{tags.map((v) => {
					<Fragment key={v.name}>
						<h3>{v.name}</h3>
						<RecipeCarousel
							recipes={async () => {
								const res = await Api.getRecipes(20, [v.name]);
								if (res.success) {
									return res.data;
								}
								return [];
							}}
						/>
					</Fragment>;
				})}
			</>
		);
	}

	return (
		<Fragment key={"no user tags"}>
			<h3>Recent recipes:</h3>
			<RecipeCarousel
				grid={true}
				recipes={async () => {
					const res = await Api.getRecipes(20);
					if (res.success) {
						return res.data;
					}
					return [];
				}}
			/>
		</Fragment>
	);
}
