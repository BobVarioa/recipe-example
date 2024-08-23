interface FailResponse<T> {
	success: false;
	error: string;
}

interface SuccessResponse<T> {
	success: true;
	data: T;
}

type Response<T> = FailResponse<T> | SuccessResponse<T>;

export interface User {
	id: number;
	username: string;
	display_name: string;
	tags: Tag[];
}

export type PublicUser = Omit<User, "tags">;

export interface Tag {
	id: number;
	name: string;
}

export interface Ingredient {
	id: number;
	name: string;
	amount: number;
	unit: string;
}

export interface Recipe {
	id: number;
	title: string;
	username: string;
	user_id: number;
	display_name: string;
	tags: Tag[];
	ingredients: Ingredient[];
	body: string;
}

export interface PublishRecipe {
	id: number;
}

export interface IngredientPrice {
	price: number;
	currency: string;
	zipcode: string;
	amount: number;
	unit: string;
}

class _Api {
	async #getUrl<T = never, R = {}>(url: string, body: any = undefined): Promise<Response<T> & R> {
		const res = await fetch(`/api/${url}`, {
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		});

		try {
			const text = await res.text();

			return JSON.parse(text) as Response<T> & R;
		} catch (e) {
			return { success: false, error: "Failed to parse response json" };
		}
	}

	async login(username: string, password: string) {
		return await this.#getUrl<User>("login", { username, password });
	}
	async logout() {
		return await this.#getUrl("logout");
	}

	async getPublicUser(id: number) {
		return await this.#getUrl<PublicUser>("get_public_user", { id });
	}
	async createUser(username: string, display_name: string, email: string, password: string, zipcode: string) {
		return await this.#getUrl<User>("create_user", {
			username,
			display_name,
			email,
			password,
			zipcode,
		});
	}
	async setTags(tags: string[]) {
		return await this.#getUrl("set_tags", { tags });
	}
	async setTagsById(tags: number[]) {
		return await this.#getUrl("set_tags_by_id", { tags });
	}
	async getTags() {
		return await this.#getUrl<Tag[]>("get_tags");
	}
	async getRecipes(limit: number, tags: string[] = []) {
		return await this.#getUrl<Omit<Recipe, "body">[]>("get_recipes", {
			tags,
			limit,
		});
	}
	async getRecipesByUser(limit: number, user_id: number) {
		return await this.#getUrl<Omit<Recipe, "body">[]>("get_recipes_by_user", {
			user: user_id,
			limit,
		});
	}
	async getRecipe(id: number) {
		return await this.#getUrl<Recipe>("get_recipe", { id });
	}
	async publishRecipe(title: string, ingredients: Omit<Ingredient, "id">[], tags: string[], body: string) {
		return await this.#getUrl<PublishRecipe>("publish_recipe", {
			title,
			ingredients,
			tags,
			body,
		});
	}
	async getPrice(ingredient: string) {
		return await this.#getUrl<IngredientPrice[], { suggested: boolean }>("get_price", {
			ingredient,
		});
	}
	async getPriceById(ingredient: number) {
		return await this.#getUrl<IngredientPrice[], { suggested: boolean }>("get_price_by_id", {
			ingredient,
		});
	}
	async setPrice(ingredient: string, amount: number, unit: string, price: number, currency: string) {
		return await this.#getUrl("set_price", {
			ingredient,
			amount,
			unit,
			price,
			currency,
		});
	}
	async setPriceById(ingredient: number, amount: number, unit: string, price: number, currency: string) {
		return await this.#getUrl("set_price_by_id", {
			ingredient,
			amount,
			unit,
			price,
			currency,
		});
	}
}

export const Api = new _Api();

// @ts-expect-error esbuild define
if (globalThis.DEBUG) {
	// @ts-expect-error for debug purposes only
	globalThis.Api = Api;
}
