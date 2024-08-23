import { useEffect, useState } from "react";
import { Api, type User } from "./Api";
import EventEmitter from "eventemitter3";

class _UserManager {
	_e = new EventEmitter();

	useUserInfo(): User | undefined {
		let userInfo;
		if (typeof window !== "undefined") {
			userInfo = window.localStorage.getItem("user_info");
			if (userInfo != null) userInfo = JSON.parse(userInfo);
		}
		const [user, setUser] = useState<User | undefined>(userInfo);

		useEffect(() => {
			const listener = (userinfo: User) => {
				setUser(userinfo);
			};
			this._e.addListener("user_changed", listener);

			return () => {
				this._e.removeListener("user_changed", listener);
			};
		}, [this._e]);

		return user;
	}

	async login(username: string, password: string) {
		const res = await Api.login(username, password);
		if (res.success) {
			window.localStorage.setItem("user_info", JSON.stringify(res.data));
			this._e.emit("user_changed", res.data);

			return res;
		}
		return res;
	}

	async create(username: string, display_name: string, email: string, password: string, zipcode: string) {
		const res = await Api.createUser(username, display_name, email, password, zipcode);
		if (res.success) {
			window.localStorage.setItem("user_info", JSON.stringify(res.data));
			this._e.emit("user_changed", res.data);
		}
		return res;
	}

	async logout() {
		const res = await Api.logout();
		if (res.success) {
			window.localStorage.removeItem("user_info");
			this._e.emit("user_changed", undefined);
		}
		return res;
	}
}

export const UserManager = new _UserManager();

// @ts-expect-error esbuild define
if (globalThis.DEBUG) {
	// @ts-expect-error for debug purposes only
	globalThis.UserManager = UserManager;
}
