import { forwardRef, useImperativeHandle, useState } from "react";
import { IoMdAddCircleOutline } from "react-icons/io";
import type { Ingredient } from "../utils/Api";
import "./EditableIngredientList.css";

// NOTE: eventually, this would intelligently pick between these depending on what ingredient is used, but right now it does not
export const volumeUnits = ["mL", "L", "tsp", "tbsp", "fl oz", "cups", "pt", "qt", "gal"];
export const massUnits = ["g", "oz", "lb"];

type IngredientNoId = Omit<Ingredient, "id">;

interface IngredientProps {
	ingredientRef: IngredientNoId;
}

function EditIngredient({ ingredientRef }: IngredientProps) {
	return (
		<div className="ingredient">
			<input
				type="text"
				name="ingredient-name"
				placeholder={"Ingredient"}
				onBlur={(event) => {
					ingredientRef.name = event.target.value.trim();
				}}
			/>
			<input
				type="number"
				name="number"
				placeholder={"Amount"}
				onBlur={(event) => {
					const val = Number.parseInt(event.target.value);
					if (!Number.isNaN(val)) {
						ingredientRef.amount = val;
						return;
					}
					event.target.value = ingredientRef.amount === 0 ? "" : ingredientRef.amount.toString();
				}}
			/>
			<select
				name="unit"
				onBlur={(event) => {
					if (event.target.value.length === 0) return;
					ingredientRef.unit = event.target.value;
				}}
			>
				<option value="">Unit</option>
				<hr />
				<optgroup label="Volume">
					{volumeUnits.map((v) => (
						<option key={v} value={v} selected={v === ingredientRef.unit}>
							{v}
						</option>
					))}
				</optgroup>
				<optgroup label="Mass">
					{massUnits.map((v) => (
						<option key={v} value={v} selected={v === ingredientRef.unit}>
							{v}
						</option>
					))}
				</optgroup>
			</select>
		</div>
	);
}

export interface IngredientListMethods {
	getIngredients(): IngredientNoId[];
}

export const EditableIngredientList = forwardRef<IngredientListMethods>(function (props, ref) {
	const [ingredients, setIngredients] = useState<IngredientNoId[]>([]);

	useImperativeHandle(ref, () => {
		return {
			getIngredients() {
				return ingredients.filter((v) => v.name.length > 0 && v.amount != 0 && v.unit.length > 0);
			},
		} as IngredientListMethods;
	});

	return (
		<div className="editable-ingredient-list">
			{ingredients.map((v, i) => (
				<EditIngredient ingredientRef={v} />
			))}
			<button
				className="add-ingredient"
				onClick={() => {
					const ings = ingredients.slice();
					ings.push({ name: "", amount: 0, unit: "" });
					setIngredients(ings);
				}}
			>
				<IoMdAddCircleOutline />
				<span> Ingredient</span>
			</button>
		</div>
	);
});
