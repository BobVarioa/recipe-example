import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import "./EditableTagList.css";
import { TagList } from "./TagList";

export interface EditableTagListMethods {
	getTags(): string[];
}

export const EditableTagList = forwardRef<EditableTagListMethods>(function (props, ref) {
	const [tags, setTags] = useState<string[]>([]);

	useImperativeHandle(ref, () => {
		return {
			getTags() {
				return tags;
			},
		} as EditableTagListMethods;
	});

	const tagInputRef = useRef<HTMLInputElement>(null);

	const addTag = () => {
		if (tagInputRef.current && tagInputRef.current.value.length > 0) {
			const tag = tagInputRef.current.value.trim();
			if (!tags.includes(tag)) {
				const _tags = tags.slice();
				_tags.push(tag);
				setTags(_tags);
			}
			tagInputRef.current.value = "";
		}
	};

	return (
		<>
			<TagList tags={tags} />
			<div className="add-tag">
				<input
					type="text"
					name="tag-name"
					ref={tagInputRef}
					onKeyUp={(event) => {
						if (event.key === "Enter") {
							addTag();
						}
					}}
				/>
				<button onClick={addTag}>
					<IoMdAddCircleOutline /> <span> Tag</span>
				</button>
			</div>
		</>
	);
});
