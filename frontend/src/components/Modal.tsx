import { useEffect, useRef, useState } from "react";
import { IoIosClose } from "react-icons/io";
import "./Modal.css";

interface ModalProps {
	isOpen: boolean;
	onClose?: () => void;
	onOpen?: () => Promise<void>;
	children: React.ReactNode;
	className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onOpen, onClose, children, className }) => {
	const [isModalOpen, setModalOpen] = useState(isOpen);
	const modalRef = useRef<HTMLDialogElement | null>(null);

	const handleCloseModal = () => {
		if (onClose) {
			onClose();
		}
		setModalOpen(false);
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDialogElement>) => {
		if (event.key === "Escape") {
			handleCloseModal();
		}
	};

	useEffect(() => {
		if (onOpen) {
			onOpen().then(() => setModalOpen(isOpen));
		} else {
			setModalOpen(isOpen);
		}
	}, [isOpen]);

	useEffect(() => {
		const modalElement = modalRef.current;

		if (modalElement) {
			if (isModalOpen) {
				modalElement.showModal();
			} else {
				modalElement.close();
			}
		}
	}, [isModalOpen]);

	return (
		<dialog ref={modalRef} onKeyDown={handleKeyDown} className={"modal " + (className ?? "")}>
			<IoIosClose className="icon modal-close-btn" onClick={handleCloseModal} aria-label="Close" title="Close" />
			{children}
		</dialog>
	);
};
