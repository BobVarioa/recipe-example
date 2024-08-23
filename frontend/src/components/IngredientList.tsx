import { useRef, useState } from "react";
import { Api, type Ingredient, type IngredientPrice } from "../utils/Api";
import { Modal } from "./Modal";
import { MdAttachMoney } from "react-icons/md";
import { PriceManager } from "../utils/PriceManager";
import "./IngredientList.css";
import { massUnits, volumeUnits } from "./EditableIngredientList";
import { UserManager } from "../utils/UserManager";
import convert from "convert";

interface IngredientListProps {
	ingredients: Ingredient[];
}

export function IngredientList({ ingredients }: IngredientListProps) {
	const [priceFor, setPriceFor] = useState<Ingredient | undefined>(undefined);
	const [selectedUnit, setSelectedUnit] = useState<string>("")


	const priceRef = useRef<HTMLInputElement>(null);
	const amountRef = useRef<HTMLInputElement>(null);

	const [suggestedPrice, setSuggestedPrice] = useState<number>();

	const userInfo = UserManager.useUserInfo();
	if (!userInfo) {
		return (
			<ul>
				{ingredients.map((v) => (
					<li key={v.name}>
						{v.name} - {v.amount} {v.unit}
					</li>
				))}
			</ul>
		);
	}

	return (
		<>
			<ul>
				{ingredients.map((v) => (
					<li key={v.name}>
						{v.name} - {v.amount} {v.unit}{" "}
						{PriceManager.hasPrice(v.name) ? (
							<span className="price">${PriceManager.getPrice(v.name, v.amount, v.unit)!.toFixed(2)}</span>
						) : (
							<button onClick={() => setPriceFor(v)}>
								<MdAttachMoney />
							</button>
						)}
					</li>
				))}
			</ul>
			<Modal
				isOpen={priceFor !== undefined}
				onClose={() => setPriceFor(undefined)}
				className="price-modal"
				onOpen={async () => {
					if (!priceFor) return;
					const suggested = await PriceManager.getSuggestedPrice(priceFor);
					if (suggested) {
						setSuggestedPrice(suggested);
						setSelectedUnit(priceFor.unit)
					}
				}}
			>
				Set price for {priceFor?.name}:
				<div>
					<input
						type="number"
						placeholder="Price"
						ref={priceRef}
						defaultValue={suggestedPrice ? Math.floor(suggestedPrice * 100) / 100 : undefined}
					/>
					<input
						type="number"
						placeholder="Amount"
						ref={amountRef}
						defaultValue={suggestedPrice !== undefined ? priceFor?.amount : undefined}
					/>
					<select name="unit" value={selectedUnit} onChange={(v) => setSelectedUnit(v.target.value)}>
						<option value="">Unit</option>
						<hr />
						<optgroup label="Volume">
							{volumeUnits.map((v) => (
								<option key={v} value={v}>
									{v}
								</option>
							))}
						</optgroup>
						<optgroup label="Mass">
							{massUnits.map((v) => (
								<option key={v} value={v}>
									{v}
								</option>
							))}
						</optgroup>
					</select>
				</div>
				<button
					onClick={async () => {
						if (priceFor && amountRef.current && priceRef.current && selectedUnit.length !== 0) {
							const amount = Number.parseInt(amountRef.current.value);
							const price = Number.parseInt(priceRef.current.value);
							if (Number.isNaN(amount) || Number.isNaN(price)) return;

							await PriceManager.setPrice(priceFor.name, price, amount, selectedUnit);
							setPriceFor(undefined);
							setSelectedUnit("");
							amountRef.current.value = "";
							priceRef.current.value = "";
						}
					}}
				>
					Done
				</button>
			</Modal>
		</>
	);
}
