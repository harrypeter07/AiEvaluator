"use client";
import { cn } from "@/lib/utils";
import { motion, stagger, useAnimate, useInView } from "framer-motion";
import { useEffect } from "react";

export const TypewriterEffect = ({ words, className, cursorClassName }) => {
	// split text inside of words into array of characters
	const wordsArray = words.map((word) => {
		return {
			...word,
			text: word.text.split(""),
		};
	});

	const [scope, animate] = useAnimate();
	const isInView = useInView(scope);

	useEffect(() => {
		if (isInView) {
			animate(
				"span",
				{
					display: "inline-block",
					opacity: 1,
					width: "fit-content",
				},
				{
					duration: 0.3,
					delay: stagger(0.1),
					ease: "easeInOut",
				}
			);
		}
	}, [isInView, animate]);

	const renderWords = () => {
		return (
			<motion.div ref={scope} className="inline">
				{wordsArray.map((word, idx) => {
					return (
						<div key={`word-${idx}`} className="inline-block mr-6">
							{word.text.map((char, index) => (
								<motion.span
									initial={{}}
									key={`char-${index}`}
									className={cn(
										`dark:text-white text-black opacity-0 hidden`,
										word.className
									)}
								>
									{char}
								</motion.span>
							))}
						</div>
					);
				})}
			</motion.div>
		);
	};

	return (
		<div
			className={cn(
				"text-base font-bold text-center sm:text-xl md:text-3xl lg:text-5xl",
				className
			)}
		>
			{renderWords()}
			<motion.span
				initial={{
					opacity: 0,
				}}
				animate={{
					opacity: 1,
				}}
				transition={{
					duration: 0.8,
					repeat: Infinity,
					repeatType: "reverse",
				}}
				className={cn(
					"inline-block h-4 bg-blue-500 rounded-sm w-[4px] md:h-6 lg:h-10",
					cursorClassName
				)}
			></motion.span>
		</div>
	);
};

export const TypewriterEffectSmooth = ({
	words,
	className,
	cursorClassName,
}) => {
	// split text inside of words into array of characters
	const wordsArray = words.map((word) => {
		return {
			...word,
			text: word.text.split(""),
		};
	});

	const renderWords = () => {
		return (
			<div>
				{wordsArray.map((word, idx) => {
					return (
						<div key={`word-${idx}`} className="inline-block mr-4">
							{word.text.map((char, index) => (
								<span
									key={`char-${index}`}
									className={cn(`dark:text-white text-black `, word.className)}
								>
									{char}
								</span>
							))}
						</div>
					);
				})}
			</div>
		);
	};

	return (
		<div className={cn("flex my-6 space-x-1", className)}>
			<motion.div
				className="overflow-hidden pb-2"
				initial={{
					width: "0%",
				}}
				whileInView={{
					width: "fit-content",
				}}
				transition={{
					duration: 2,
					ease: "linear",
					delay: 1,
				}}
			>
				<div
					className="text-xs font-bold sm:text-base md:text-xl lg:text-3xl xl:text-5xl"
					style={{
						whiteSpace: "nowrap",
					}}
				>
					{renderWords()}
				</div>
			</motion.div>
			<motion.span
				initial={{
					opacity: 0,
				}}
				animate={{
					opacity: 1,
				}}
				transition={{
					duration: 0.8,
					repeat: Infinity,
					repeatType: "reverse",
				}}
				className={cn(
					"block h-4 bg-blue-500 rounded-sm w-[4px] sm:h-6 xl:h-12",
					cursorClassName
				)}
			></motion.span>
		</div>
	);
};

const words = [
	{
		text: "Evaluate",
		className: "text-red-500",
	},
	{
		text: "assignments ",
		className: "text-blue-500",
	},
	{
		text: "with ",
		className: "text-green-500",
	},
	{
		text: "AI ",
		className: "text-yellow-500",
	},
	{
		text: "power.",
		className: "text-purple-500",
	},
];
