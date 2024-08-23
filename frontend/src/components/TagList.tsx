import { Link } from "react-router-dom";
import "./TagList.css";

interface TagListProps {
	tags: string[];
}

export function TagList({ tags }: TagListProps) {
	return (
		<div className="tag-list">
			{tags.map((v, i) => (
				<Link className="tag" to={`/search/${v}`}>
					{v}
				</Link>
			))}
		</div>
	);
}
