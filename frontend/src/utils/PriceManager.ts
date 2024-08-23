import EventEmitter from "eventemitter3";
import { UserManager } from "./UserManager";
import { Api, type Ingredient, type IngredientPrice, type User } from "./Api";
import convert from "convert";

class _PriceManager {
	_e = new EventEmitter();

	constructor() {
		UserManager._e.on("user_changed", (userinfo) => this.userInfoListener(userinfo));

		if (typeof window !== "undefined") {
			const userInfo = window.localStorage.getItem("user_info");
			if (userInfo != null) {
				this.priceKey = `prices_${JSON.parse(userInfo).id}`
			}

		}
	}

	priceKey = "prices";

	userInfoListener(userinfo: User) {
		if (userinfo) {
			this.priceKey = `prices_${userinfo.id}`;
		} else {
			this.priceKey = "prices_anonymous";
		}
	}

	get #priceInfo(): Record<string, IngredientPrice> {
		return JSON.parse(window.localStorage.getItem(this.priceKey) ?? "{}");
	}

	set #priceInfo(value) {
		window.localStorage.setItem(this.priceKey, JSON.stringify(value));
	}

	convertTo(from: IngredientPrice, amount: number, unit: string) {
		// @ts-expect-error the types for this library are bad
		const conversionRatio: number = convert(1, unit as any).to(from.unit as any);
		return (from.price / from.amount) * conversionRatio * amount;
	} 

	hasPrice(ingredient: string): boolean {
		const dict = this.#priceInfo;
		if (Object.hasOwn(dict, ingredient)) {
			return true;
		}
		return false;
	}


	getPrice(ingredient: string, amount: number, unit: string): number | undefined {
		const dict = this.#priceInfo;
		if (Object.hasOwn(dict, ingredient)) {
			const first = dict[ingredient];
			return this.convertTo(first, amount, unit)
		}

		return undefined;
	}

	async getSuggestedPrice(ingredient: Ingredient): Promise<number | undefined> {
		const res = await Api.getPriceById(ingredient.id);
		if (res.success && res.data.length > 0) {
			if (res.suggested) {
				const first = res.data[0];
				let avg_price = this.convertTo(first, ingredient.amount, ingredient.unit);
				for (let i = 1; i < res.data.length; i++) {
					const ingPrice = res.data[i];
					avg_price += this.convertTo(ingPrice, ingredient.amount, ingredient.unit);
					avg_price /= 2;
				}

				return avg_price;
			} else {
				const dict = this.#priceInfo;
				dict[ingredient.name] = res.data[0];
				this.#priceInfo = dict;
			}
		}
	}

	async setPrice(ingredient: string, price: number, amount: number, unit: string) {
		const res = await Api.setPrice(ingredient, amount, unit, price, "USD");
		if (res.success) {
			const dict = this.#priceInfo;
			dict[ingredient] = { amount, currency: "USD", price, unit, zipcode: "" };
			this.#priceInfo = dict;
			return true;
		}
	}
}

export const PriceManager = new _PriceManager();
