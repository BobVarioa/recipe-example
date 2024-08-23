import { useRef, useState } from "react";
import { UserManager } from "../utils/UserManager";
import { useNavigate, Navigate } from "react-router";
import "./Signup.css";

export function Signup() {
	const navigate = useNavigate();

	const usernameRef = useRef<HTMLInputElement>(null);
	const passwordRef = useRef<HTMLInputElement>(null);
	const displayNameRef = useRef<HTMLInputElement>(null);
	const emailRef = useRef<HTMLInputElement>(null);
	const zipcodeRef = useRef<HTMLInputElement>(null);

	const [failText, setFailText] = useState("");

	const userInfo = UserManager.useUserInfo();
	if (userInfo) {
		const url = new URL(window.location.href);
		return <Navigate to={url.searchParams.get("next") ?? "/"}></Navigate>;
	}

	return (
		<div className="signup">
			<input type="text" placeholder="Username" name="username" ref={usernameRef} />
			<input type="password" placeholder="Password" name="password" ref={passwordRef} />
			<input type="text" placeholder="Display name" name="display_name" ref={displayNameRef} />
			<input type="text" placeholder="Email" name="email" ref={emailRef} />
			<input type="text" placeholder="Zipcode" name="zipcode" ref={zipcodeRef} />

			{failText.length > 0 && <span className="error">{failText}</span>}

			<button
				onClick={() => {
					const user = usernameRef.current;
					const pass = passwordRef.current;
					const email = emailRef.current;
					const display = displayNameRef.current;
					const zipcode = zipcodeRef.current;
					if (user?.value && pass?.value && email?.value && display?.value && zipcode?.value) {
						UserManager.create(user.value, display.value, email.value, pass.value, zipcode.value).then((v) => {
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
		</div>
	);
}
