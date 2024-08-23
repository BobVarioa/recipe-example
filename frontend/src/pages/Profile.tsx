import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { Api, type PublicUser, type Recipe } from "../utils/Api";
import { UserManager } from "../utils/UserManager";
import { RecipeCarousel } from "../components/RecipeCarousel";

export function Profile() {
	const { profileId: profileIdParam } = useParams();
	const [user, setUser] = useState<PublicUser | undefined>(undefined);

	let profileId: number | undefined;
	if (profileIdParam) {
		profileId = Number.parseInt(profileIdParam);
	} else {
		const userInfo = UserManager.useUserInfo();
		if (userInfo) {
			profileId = userInfo.id;
		}
	}

	const [error, setError] = useState<string>("");

	let cancelled = false;
	useEffect(() => {
		(async () => {
			if (!profileId) return;
			const res = await Api.getPublicUser(profileId);
			if (!cancelled) {
				if (!res.success) {
					setError(res.error);
					return;
				}
				setUser(res.data);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, [profileId]);

	if (!profileId) {
		return <Navigate to={`/login?next=${encodeURIComponent("/profile")}`}></Navigate>
	}

	if (!user) {
		if (error.length > 0) return <span className="error">{error}</span>;
		return <>Loading...</>;
	}
	return (
		<>
			<h1>{user.display_name}</h1>
			<caption>{user.username}</caption>

			<h3>{user.display_name}'s recipes:</h3>
			<RecipeCarousel
				grid={true}
				recipes={async () => {
					const res1 = await Api.getRecipesByUser(20, profileId);
					if (!res1.success) {
						setError(res1.error);
						return [];
					}
					return res1.data;
				}}
			/>
		</>
	);
}
