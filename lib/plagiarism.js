import crypto from "crypto";

const PLAGIARISM_CONFIG = {
	STOP_WORDS: new Set([
		"the",
		"be",
		"to",
		"of",
		"and",
		"a",
		"in",
		"that",
		"have",
		"i",
		"it",
		"for",
		"not",
		"on",
		"with",
		"he",
		"as",
		"you",
		"do",
		"at",
	]),
	SIMILARITY_THRESHOLD: 30,
	WINDOW_SIZE: 5,
	MIN_MATCH_LENGTH: 20,
};

function normalizeText(text) {
	if (!text || typeof text !== "string") return "";
	return text
		.toLowerCase()
		.replace(/[^\w\s]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

function generateFingerprint(text) {
	const normalizedText = normalizeText(text)
		.split(/\s+/)
		.filter(
			(word) => word.length > 2 && !PLAGIARISM_CONFIG.STOP_WORDS.has(word)
		)
		.sort()
		.join(" ");
	return crypto.createHash("md5").update(normalizedText).digest("hex");
}

function rabinKarpFingerprints(
	text,
	windowSize = PLAGIARISM_CONFIG.WINDOW_SIZE
) {
	const BASE = 256;
	const PRIME = 101;
	const fingerprints = new Set();
	const normalizedText = normalizeText(text);

	if (normalizedText.length < windowSize) return fingerprints;

	let hash = 0;
	for (let i = 0; i < windowSize; i++) {
		hash = (hash * BASE + normalizedText.charCodeAt(i)) % PRIME;
	}
	fingerprints.add(hash);

	let h = 1;
	for (let i = 0; i < windowSize - 1; i++) {
		h = (h * BASE) % PRIME;
	}

	for (let i = windowSize; i < normalizedText.length; i++) {
		hash = (hash - normalizedText.charCodeAt(i - windowSize) * h) % PRIME;
		hash = (hash * BASE + normalizedText.charCodeAt(i)) % PRIME;
		if (hash < 0) hash += PRIME;
		fingerprints.add(hash);
	}

	return fingerprints;
}

function compareTexts(text1, text2) {
	const normalizedText1 = normalizeText(text1);
	const normalizedText2 = normalizeText(text2);

	const fingerprint1 = generateFingerprint(normalizedText1);
	const fingerprint2 = generateFingerprint(normalizedText2);

	if (fingerprint1 === fingerprint2) {
		return {
			similarityPercentage: 100,
			matchType: "identical",
			matchedSegments: [
				{
					text1: normalizedText1,
					text2: normalizedText2,
					similarityPercentage: 100,
				},
			],
		};
	}

	const hashes1 = rabinKarpFingerprints(normalizedText1);
	const hashes2 = rabinKarpFingerprints(normalizedText2);

	const commonHashes = new Set(
		[...hashes1].filter((hash) => hashes2.has(hash))
	);
	const similarityPercentage = Math.min(
		(commonHashes.size / Math.max(hashes1.size, hashes2.size)) * 100,
		100
	);

	const matchedSegments = findMatchedSegments(normalizedText1, normalizedText2);

	return {
		similarityPercentage: Math.round(similarityPercentage),
		matchedSegments,
		matchType:
			similarityPercentage > PLAGIARISM_CONFIG.SIMILARITY_THRESHOLD
				? "potential plagiarism"
				: "no significant similarity",
	};
}

export function findMatchedSegments(text1, text2) {
	const segments = [];
	const sentences1 = text1.split(/[.!?]+/).filter((s) => s.trim().length > 20);
	const sentences2 = text2.split(/[.!?]+/).filter((s) => s.trim().length > 20);

	if (sentences1.length === 0 || sentences2.length === 0) return segments;

	for (const sentence1 of sentences1) {
		for (const sentence2 of sentences2) {
			const hashes1 = rabinKarpFingerprints(sentence1);
			const hashes2 = rabinKarpFingerprints(sentence2);
			const commonHashes = new Set(
				[...hashes1].filter((hash) => hashes2.has(hash))
			);
			const similarityPercentage = Math.min(
				(commonHashes.size / Math.max(hashes1.size, hashes2.size)) * 100,
				100
			);

			if (similarityPercentage > 50) {
				segments.push({
					text1: sentence1.trim(),
					text2: sentence2.trim(),
					similarityPercentage: Math.round(similarityPercentage),
				});
			}
			if (segments.length >= 10) break;
		}
	}

	return segments;
}

export function checkPlagiarism(input, existingDocuments = null, options = {}) {
	const config = { ...PLAGIARISM_CONFIG, ...options };

	if (typeof input === "string" && Array.isArray(existingDocuments)) {
		if (!existingDocuments.length) {
			return { overallRisk: 0, potentialPlagiarism: [] };
		}

		let maxSimilarity = 0;
		const potentialPlagiarism = [];

		for (const doc of existingDocuments) {
			const docContent = doc.content || doc;
			const comparison = compareTexts(input, docContent);

			if (comparison.similarityPercentage > config.SIMILARITY_THRESHOLD) {
				maxSimilarity = Math.max(
					maxSimilarity,
					comparison.similarityPercentage
				);
				potentialPlagiarism.push({
					matchedAssignmentId: doc._id || null,
					similarityPercentage: comparison.similarityPercentage,
					matchedSegments: comparison.matchedSegments,
				});
			}
		}

		return {
			overallRisk: maxSimilarity,
			potentialPlagiarism: potentialPlagiarism.sort(
				(a, b) => b.similarityPercentage - a.similarityPercentage
			),
		};
	}

	const documents = Array.isArray(input) ? input : [input];
	if (documents.length < 2 && !existingDocuments) {
		return {
			overallRisk: 0,
			potentialPlagiarism: [],
			totalDocuments: documents.length,
		};
	}

	const report = {
		totalDocuments: documents.length,
		potentialPlagiarism: [],
		overallRisk: 0,
	};

	for (let i = 0; i < documents.length; i++) {
		for (let j = i + 1; j < documents.length; j++) {
			if (!documents[i] || !documents[j]) continue;
			const comparison = compareTexts(documents[i], documents[j]);

			if (comparison.similarityPercentage >= config.SIMILARITY_THRESHOLD) {
				report.potentialPlagiarism.push({
					document1Index: i,
					document2Index: j,
					...comparison,
				});
			}
		}
	}

	report.overallRisk =
		report.potentialPlagiarism.length > 0
			? (report.potentialPlagiarism.length /
					((documents.length * (documents.length - 1)) / 2)) *
			  100
			: 0;

	return report;
}

export const PlagiarismConfig = PLAGIARISM_CONFIG;
export const generateContentHash = generateFingerprint;
