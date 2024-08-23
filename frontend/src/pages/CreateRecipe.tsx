import {
	BlockTypeSelect,
	BoldItalicUnderlineToggles,
	CreateLink,
	DiffSourceToggleWrapper,
	InsertTable,
	InsertThematicBreak,
	ListsToggle,
	MDXEditor,
	Separator,
	UndoRedo,
	headingsPlugin,
	toolbarPlugin,
	type MDXEditorMethods,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { EditableIngredientList, type IngredientListMethods } from "../components/EditableIngredientList";
import { EditableTagList, type EditableTagListMethods } from "../components/EditableTagList";
import { Api } from "../utils/Api";
import "./CreateRecipe.css";
import { UserManager } from "../utils/UserManager";

export function CreateRecipe() {
	const navigate = useNavigate()

	const mdxRef = useRef<MDXEditorMethods>();

	const titleRef = useRef<HTMLInputElement>(null);
	const ingredientsRef = useRef<IngredientListMethods>(null);
	const tagListRef = useRef<EditableTagListMethods>(null);
	const [error, setError] = useState("");

	const userInfo = UserManager.useUserInfo();
	if (!userInfo) {
		return <Navigate to={`/login?next=${encodeURIComponent("/create")}`}></Navigate>;
	}

	return (
		<div className="recipe-editor">
			<input type="text" ref={titleRef} placeholder="Title" />

			<hr />

			<EditableTagList ref={tagListRef} />

			<hr />

			<EditableIngredientList ref={ingredientsRef} />

			<MDXEditor
				plugins={[
					headingsPlugin(),
					toolbarPlugin({
						toolbarContents: () => (
							<DiffSourceToggleWrapper>
								<UndoRedo />

								<Separator />

								<BoldItalicUnderlineToggles />

								<Separator />

								<ListsToggle />
								<BlockTypeSelect />

								<Separator />

								<CreateLink />

								<Separator />

								<InsertTable />
								<InsertThematicBreak />
							</DiffSourceToggleWrapper>
						),
					}),
				]}
				markdown={""}
				className="editor"
				// @ts-expect-error react just gives some additional props here which aren't really necessary
				ref={mdxRef}
			/>

			<hr />

			{error.length > 0 && <p className="error">{error}</p>}

			<button
				onClick={() => {
					if (mdxRef.current && titleRef.current && ingredientsRef.current && tagListRef.current) {
						const title = titleRef.current.value.trim();
						const ingredients = ingredientsRef.current.getIngredients();
						const tags = tagListRef.current.getTags();
						const body = mdxRef.current.getMarkdown();

						if (title.length === 0) {
							setError("Recipe must have a title.");
							return;
						}

						if (ingredients.length === 0) {
							setError("Recipe must have at least one ingredient.");
							return;
						}

						if (body.length === 0) {
							setError("Recipe body cannot be empty.");
							return;
						}

						Api.publishRecipe(title, ingredients, tags, body).then((v) => {
							if (v.success) {
								navigate(`/recipe/${v.data.id}`);
								return;
							}

							setError(v.error);
						});
					}
				}}
			>
				Publish
			</button>
		</div>
	);
}
