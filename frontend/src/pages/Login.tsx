import { useRef, useState } from "react";
import { UserManager } from "../utils/UserManager";
import { useNavigate, Navigate } from "react-router";
import { Link } from "react-router-dom";
import "./Login.css";

export function Login() {
	const navigate = useNavigate();

	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);

	const [failText, setFailText] = useState("");

	const userInfo = UserManager.useUserInfo();
	if (userInfo) {
		const url = new URL(window.location.href);
		return <Navigate to={url.searchParams.get("next") ?? "/"}></Navigate>;
	}

	return (
		<div className="login">
			<input type="text" name="username" placeholder="Username" ref={usernameRef} />
			<input type="password" name="password" placeholder="Password" ref={passwordRef} />

			{failText.length > 0 && <span>{failText}</span>}

			<button
				onClick={() => {
					const user = usernameRef.current;
					const pass = passwordRef.current;
					if (user?.value && pass?.value) {
						UserManager.login(user.value, pass.value).then((v) => {
							if (v.success) {
								const url = new URL(window.location.href);
								navigate(url.searchParams.get("next") ?? "/");
								return;
							}
							setFailText(v.error);
						});
					}
				}}
			>
				Login
			</button>

			<Link to="/signup">or sign up</Link>
		</div>
	);
}
