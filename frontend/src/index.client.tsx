import { hydrateRoot } from "react-dom/client";
import { Root } from "./components/Root";
import { BrowserRouter } from "react-router-dom";

/* NOTE:
hydration seems to have some inconsistent issues? 
I've had it happen only a few times now, but sometimes React 
will log something in the console and recover from the error.
Not something incredibly critical, but worth looking into
*/
hydrateRoot(
	document.getElementById("root")!,
	<BrowserRouter>
		<Root />
	</BrowserRouter>
);
