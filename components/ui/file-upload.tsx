"use client";

import { cn } from "@/lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { IconUpload } from "@tabler/icons-react";
import useDropzone from "react-dropzone";

const mainVariant = {
	initial: {
		x: 0,
		y: 0,
	},
	animate: {
		x: 20,
		y: -20,
		opacity: 0.9,
	},
};

const secondaryVariant = {
	initial: {
		opacity: 0,
	},
	animate: {
		opacity: 1,
	},
};

interface FileUploadProps {
	onChange?: (files: File[]) => void;
	accept?: string;
	maxSize?: number;
	multiple?: boolean;
}

interface FileRejection {
	file: File;
	errors: Array<{
		code: string;
		message: string;
	}>;
}

export const FileUpload: React.FC<FileUploadProps> = ({
	onChange,
	accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
	maxSize = 10 * 1024 * 1024, // 10MB default
	multiple = false,
}) => {
	const [files, setFiles] = useState<File[]>([]);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = (newFiles: File[]) => {
		const validFiles = newFiles.filter((file) => {
			if (file.size > maxSize) {
				setError(
					`File ${file.name} is too large. Maximum size is ${
						maxSize / (1024 * 1024)
					}MB`
				);
				return false;
			}
			return true;
		});

		if (validFiles.length > 0) {
			setFiles((prevFiles) => [...prevFiles, ...validFiles]);
			setError(null);
			onChange?.(validFiles);
		}
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	// @ts-expect-error - useDropzone types are not properly exported
	const { getRootProps, isDragActive } = useDropzone({
		multiple,
		noClick: true,
		onDrop: handleFileChange,
		accept: {
			"application/pdf": [".pdf"],
			"application/msword": [".doc"],
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document":
				[".docx"],
			"image/jpeg": [".jpg", ".jpeg"],
			"image/png": [".png"],
		},
		maxSize,
		onDropRejected: (fileRejections: FileRejection[]) => {
			const errors = fileRejections.map((rejection: FileRejection) => {
				if (rejection.errors[0]?.code === "file-too-large") {
					return `File ${rejection.file.name} is too large`;
				}
				if (rejection.errors[0]?.code === "file-invalid-type") {
					return `File ${rejection.file.name} has an invalid type`;
				}
				return `Error with file ${rejection.file.name}`;
			});
			setError(errors.join(", "));
		},
	});

	const removeFile = (index: number) => {
		setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
	};

	return (
		<div className="w-full" {...getRootProps()}>
			<motion.div
				onClick={handleClick}
				whileHover="animate"
				className="p-10 group/file block rounded-lg cursor-pointer w-full relative overflow-hidden bg-white dark:bg-neutral-900"
			>
				<input
					ref={fileInputRef}
					id="file-upload-handle"
					type="file"
					accept={accept}
					multiple={multiple}
					onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
					className="hidden"
				/>
				<div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
					<GridPattern />
				</div>
				<div className="flex flex-col items-center justify-center">
					<p className="relative z-20 font-sans font-bold text-neutral-700 dark:text-neutral-300 text-base">
						Upload file
					</p>
					<p className="relative z-20 font-sans font-normal text-neutral-400 dark:text-neutral-400 text-base mt-2">
						Drag or drop your files here or click to upload
					</p>
					<div className="relative w-full mt-10 max-w-xl mx-auto">
						{files.length > 0 &&
							files.map((file, idx) => (
								<motion.div
									key={"file" + idx}
									layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
									className={cn(
										"relative overflow-hidden z-40 bg-white dark:bg-neutral-900 flex flex-col items-start justify-start md:h-24 p-4 mt-4 w-full mx-auto rounded-md",
										"shadow-sm"
									)}
								>
									<div className="flex justify-between w-full items-center gap-4">
										<motion.p
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											layout
											className="text-base text-neutral-700 dark:text-neutral-300 truncate max-w-xs"
										>
											{file.name}
										</motion.p>
										<div className="flex items-center gap-2">
											<motion.p
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												layout
												className="rounded-lg px-2 py-1 w-fit shrink-0 text-sm text-neutral-600 dark:bg-neutral-800 dark:text-white shadow-input"
											>
												{(file.size / (1024 * 1024)).toFixed(2)} MB
											</motion.p>
											<button
												onClick={(e) => {
													e.stopPropagation();
													removeFile(idx);
												}}
												className="text-red-500 hover:text-red-700"
											>
												<svg
													className="w-5 h-5"
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path
														strokeLinecap="round"
														strokeLinejoin="round"
														strokeWidth={2}
														d="M6 18L18 6M6 6l12 12"
													/>
												</svg>
											</button>
										</div>
									</div>

									<div className="flex text-sm md:flex-row flex-col items-start md:items-center w-full mt-2 justify-between text-neutral-600 dark:text-neutral-400">
										<motion.p
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											layout
											className="px-1 py-0.5 rounded-md bg-gray-100 dark:bg-neutral-800"
										>
											{file.type}
										</motion.p>

										<motion.p
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											layout
										>
											modified{" "}
											{new Date(file.lastModified).toLocaleDateString()}
										</motion.p>
									</div>
								</motion.div>
							))}
						{!files.length && (
							<motion.div
								layoutId="file-upload"
								variants={mainVariant}
								transition={{
									type: "spring",
									stiffness: 300,
									damping: 20,
								}}
								className={cn(
									"relative group-hover/file:shadow-2xl z-40 bg-white dark:bg-neutral-900 flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md",
									"shadow-[0px_10px_50px_rgba(0,0,0,0.1)]"
								)}
							>
								{isDragActive ? (
									<motion.p
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="text-neutral-600 flex flex-col items-center"
									>
										Drop it
										<IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
									</motion.p>
								) : (
									<IconUpload className="h-4 w-4 text-neutral-600 dark:text-neutral-300" />
								)}
							</motion.div>
						)}

						{!files.length && (
							<motion.div
								variants={secondaryVariant}
								className="absolute opacity-0 border border-dashed border-sky-400 inset-0 z-30 bg-transparent flex items-center justify-center h-32 mt-4 w-full max-w-[8rem] mx-auto rounded-md"
							></motion.div>
						)}
					</div>
				</div>
			</motion.div>
			{error && <div className="mt-2 text-sm text-red-500">{error}</div>}
		</div>
	);
};

export function GridPattern() {
	const columns = 41;
	const rows = 11;
	return (
		<div className="flex bg-gray-100 dark:bg-neutral-900 shrink-0 flex-wrap justify-center items-center gap-x-px gap-y-px scale-105">
			{Array.from({ length: rows }).map((_, row) =>
				Array.from({ length: columns }).map((_, col) => {
					const index = row * columns + col;
					return (
						<div
							key={`${col}-${row}`}
							className={`w-10 h-10 flex shrink-0 rounded-[2px] ${
								index % 2 === 0
									? "bg-gray-50 dark:bg-neutral-950"
									: "bg-gray-50 dark:bg-neutral-950 shadow-[0px_0px_1px_3px_rgba(255,255,255,1)_inset] dark:shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
							}`}
						/>
					);
				})
			)}
		</div>
	);
}
