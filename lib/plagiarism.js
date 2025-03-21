import crypto from "crypto";
import { extractPDFText } from "./gemini";

/**
 * Extracts text content from a PDF using Gemini API
 * @param {string} base64Data - Base64 encoded PDF data
 * @returns {Promise<string>} - Extracted text content
 */
export async function extractPDFContent(base64Data) {
	try {
		const extractedText = await extractPDFText(base64Data);
		return extractedText || "";
	} catch (error) {
		console.error("Error extracting PDF content:", error);
		return "";
	}
}

/**
 * Generates a hash of the content for uniqueness checking
 * @param {string} content - Content to hash
 * @returns {string} - SHA-256 hash of the content
 */

export function generateContentHash(content) {
	// Using the already imported crypto module
	return crypto.createHash("sha256").update(content).digest("hex");
}

/**
 * Checks for plagiarism between the current content and other assignments
 * @param {string} content - The content to check
 * @param {Array} otherAssignments - Array of assignments to compare against
 * @returns {Object} - Plagiarism score and matched segments
 */
export async function checkPlagiarism(content, otherAssignments) {
	// Skip empty or invalid comparison targets
	if (!content || !otherAssignments || otherAssignments.length === 0) {
		return {
			plagiarismScore: 0,
			similarityMatches: [],
		};
	}

	// Convert to lowercase and remove extra spaces for comparison
	const normalizedContent = content.toLowerCase().replace(/\s+/g, " ").trim();

	// Track matches
	const similarityMatches = [];
	let totalSimilarityScore = 0;

	// Process each assignment to find similarities
	for (const assignment of otherAssignments) {
		// Make sure the assignment has content to compare
		if (!assignment || !assignment.content) {
			continue;
		}

		// Normalize the other content too
		const normalizedOtherContent = assignment.content
			.toLowerCase()
			.replace(/\s+/g, " ")
			.trim();

		// Skip identical documents (like comparing to self)
		if (normalizedContent === normalizedOtherContent) {
			console.log("Skipping identical document comparison");
			continue;
		}

		// Calculate content-based similarities
		const cosineSimilarity = calculateCosineSimilarity(
			normalizedContent,
			normalizedOtherContent
		);

		const jaccardSimilarity = calculateJaccardSimilarity(
			normalizedContent,
			normalizedOtherContent
		);

		// Combine similarity scores (50% cosine, 50% jaccard)
		const similarityScore = cosineSimilarity * 0.5 + jaccardSimilarity * 0.5;
		const scaledScore = similarityScore * 100; // Convert to percentage

		// Record matches with significant similarity
		if (
			scaledScore > 5 &&
			assignment._id &&
			typeof assignment._id === "object"
		) {
			// Find specific matching segments between the documents
			const matchedSegments = findMatchedSegments(
				normalizedContent,
				normalizedOtherContent
			);

			similarityMatches.push({
				matchedAssignmentId: assignment._id,
				assignmentTitle: assignment.title || "Unknown",
				similarityPercentage: Math.round(scaledScore),
				cosineSimilarity: Math.round(cosineSimilarity * 100),
				jaccardSimilarity: Math.round(jaccardSimilarity * 100),
				matchedSegments,
			});
			totalSimilarityScore += scaledScore;
		}
	}

	// Calculate overall plagiarism score as average of similarity scores
	const plagiarismScore =
		similarityMatches.length > 0
			? totalSimilarityScore / similarityMatches.length
			: 0;

	return {
		plagiarismScore: Math.min(100, Math.round(plagiarismScore)), // Cap at 100%
		similarityMatches,
	};
}

// List of common stop words to exclude from similarity calculations
const stopWords = new Set([
	"a",
	"about",
	"above",
	"after",
	"again",
	"against",
	"all",
	"am",
	"an",
	"and",
	"any",
	"are",
	"aren't",
	"as",
	"at",
	"be",
	"because",
	"been",
	"before",
	"being",
	"below",
	"between",
	"both",
	"but",
	"by",
	"can",
	"can't",
	"cannot",
	"could",
	"couldn't",
	"did",
	"didn't",
	"do",
	"does",
	"doesn't",
	"doing",
	"don't",
	"down",
	"during",
	"each",
	"few",
	"for",
	"from",
	"further",
	"had",
	"hadn't",
	"has",
	"hasn't",
	"have",
	"haven't",
	"having",
	"he",
	"he'd",
	"he'll",
	"he's",
	"her",
	"here",
	"here's",
	"hers",
	"herself",
	"him",
	"himself",
	"his",
	"how",
	"how's",
	"i",
	"i'd",
	"i'll",
	"i'm",
	"i've",
	"if",
	"in",
	"into",
	"is",
	"isn't",
	"it",
	"it's",
	"its",
	"itself",
	"let's",
	"me",
	"more",
	"most",
	"mustn't",
	"my",
	"myself",
	"no",
	"nor",
	"not",
	"of",
	"off",
	"on",
	"once",
	"only",
	"or",
	"other",
	"ought",
	"our",
	"ours",
	"ourselves",
	"out",
	"over",
	"own",
	"same",
	"shan't",
	"she",
	"she'd",
	"she'll",
	"she's",
	"should",
	"shouldn't",
	"so",
	"some",
	"such",
	"than",
	"that",
	"that's",
	"the",
	"their",
	"theirs",
	"them",
	"themselves",
	"then",
	"there",
	"there's",
	"these",
	"they",
	"they'd",
	"they'll",
	"they're",
	"they've",
	"this",
	"those",
	"through",
	"to",
	"too",
	"under",
	"until",
	"up",
	"very",
	"was",
	"wasn't",
	"we",
	"we'd",
	"we'll",
	"we're",
	"we've",
	"were",
	"weren't",
	"what",
	"what's",
	"when",
	"when's",
	"where",
	"where's",
	"which",
	"while",
	"who",
	"who's",
	"whom",
	"why",
	"why's",
	"with",
	"won't",
	"would",
	"wouldn't",
	"you",
	"you'd",
	"you'll",
	"you're",
	"you've",
	"your",
	"yours",
	"yourself",
	"yourselves",
]);

/**
 * Calculate Cosine Similarity between two texts using TF-IDF approach
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateCosineSimilarity(text1, text2) {
	// Break texts into words and filter out stop words
	const words1 = text1
		.split(/\W+/)
		.filter((word) => word.length > 2 && !stopWords.has(word.toLowerCase()));
	const words2 = text2
		.split(/\W+/)
		.filter((word) => word.length > 2 && !stopWords.has(word.toLowerCase()));

	// If either text has no meaningful words left after filtering, return 0
	if (words1.length === 0 || words2.length === 0) {
		return 0;
	}

	// Get unique words from both texts
	const uniqueWords = [...new Set([...words1, ...words2])];

	// Calculate term frequency for each document
	const tf1 = calculateTermFrequency(words1, uniqueWords);
	const tf2 = calculateTermFrequency(words2, uniqueWords);

	// Calculate TF-IDF vectors
	const docs = [words1, words2];
	const tfidf1 = calculateTfIdf(tf1, uniqueWords, docs);
	const tfidf2 = calculateTfIdf(tf2, uniqueWords, docs);

	// Calculate cosine similarity
	let dotProduct = 0;
	let magnitude1 = 0;
	let magnitude2 = 0;

	for (let i = 0; i < uniqueWords.length; i++) {
		dotProduct += tfidf1[i] * tfidf2[i];
		magnitude1 += tfidf1[i] * tfidf1[i];
		magnitude2 += tfidf2[i] * tfidf2[i];
	}

	magnitude1 = Math.sqrt(magnitude1);
	magnitude2 = Math.sqrt(magnitude2);

	// Handle edge case to avoid division by zero
	if (magnitude1 === 0 || magnitude2 === 0) {
		return 0;
	}

	return dotProduct / (magnitude1 * magnitude2);
}

/**
 * Calculate term frequency
 * @param {Array} words - Array of words in the document
 * @param {Array} uniqueWords - Array of unique words from all documents
 * @returns {Array} - Term frequency vector
 */
function calculateTermFrequency(words, uniqueWords) {
	const tf = Array(uniqueWords.length).fill(0);

	for (const word of words) {
		const index = uniqueWords.indexOf(word);
		if (index !== -1) {
			tf[index]++;
		}
	}

	return tf;
}

/**
 * Calculate TF-IDF vectors
 * @param {Array} tf - Term frequency vector
 * @param {Array} uniqueWords - Array of unique words
 * @param {Array} docs - Array of documents (word arrays)
 * @returns {Array} - TF-IDF vector
 */
function calculateTfIdf(tf, uniqueWords, docs) {
	const tfidf = [];

	for (let i = 0; i < uniqueWords.length; i++) {
		const word = uniqueWords[i];
		// Calculate IDF (Inverse Document Frequency)
		let docCount = 0;

		for (const doc of docs) {
			if (doc.includes(word)) {
				docCount++;
			}
		}

		const idf = Math.log(docs.length / (docCount || 1));
		tfidf.push(tf[i] * idf);
	}

	return tfidf;
}

/**
 * Calculate Jaccard Similarity between two texts
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} - Similarity score between 0 and 1
 */
function calculateJaccardSimilarity(text1, text2) {
	// Break texts into words, filter out stop words, and create sets
	const words1 = new Set(
		text1
			.split(/\W+/)
			.filter((word) => word.length > 2 && !stopWords.has(word.toLowerCase()))
	);
	const words2 = new Set(
		text2
			.split(/\W+/)
			.filter((word) => word.length > 2 && !stopWords.has(word.toLowerCase()))
	);

	// If either set is empty after filtering, return 0
	if (words1.size === 0 || words2.size === 0) {
		return 0;
	}

	// Calculate intersection size
	const intersection = new Set();
	for (const word of words1) {
		if (words2.has(word)) {
			intersection.add(word);
		}
	}

	// Calculate union size
	const union = new Set([...words1, ...words2]);

	// Jaccard similarity = size of intersection / size of union
	return intersection.size / union.size;
}

/**
 * Find specific matching segments between two texts
 */
function findMatchedSegments(text1, text2) {
	const segments = [];
	const sentences1 = text1.split(/[.!?]+/).filter((s) => s.trim().length > 20);
	const sentences2 = text2.split(/[.!?]+/).filter((s) => s.trim().length > 20);

	// Early return if not enough content to compare
	if (sentences1.length === 0 || sentences2.length === 0) {
		return segments;
	}

	// Look for similar sentences
	for (const sentence1 of sentences1) {
		if (sentence1.length < 20) continue;

		for (const sentence2 of sentences2) {
			if (sentence2.length < 20) continue;

			// Clean sentences for comparison (remove stop words)
			const cleanSentence1 = sentence1
				.split(/\W+/)
				.filter((word) => word.length > 2 && !stopWords.has(word.toLowerCase()))
				.join(" ");

			const cleanSentence2 = sentence2
				.split(/\W+/)
				.filter((word) => word.length > 2 && !stopWords.has(word.toLowerCase()))
				.join(" ");

			// Skip if clean sentences are too short
			if (cleanSentence1.length < 15 || cleanSentence2.length < 15) continue;

			// Check overlap using a sliding window approach on cleaned sentences
			for (let i = 0; i < cleanSentence1.length - 15; i++) {
				const fragment = cleanSentence1.substring(i, i + 15);
				if (cleanSentence2.includes(fragment)) {
					// Calculate specific similarity for this segment pair
					const segmentSimilarity = calculateJaccardSimilarity(
						cleanSentence1,
						cleanSentence2
					);

					// Only include significant matches
					if (segmentSimilarity > 0.3) {
						segments.push({
							text: sentence1.trim(),
							matchedText: sentence2.trim(),
							segmentSimilarity: Math.round(segmentSimilarity * 100) / 100,
						});
					}
					break; // Once we find a match, move to next sentence
				}
			}
		}

		// Limit number of segments
		if (segments.length >= 10) break;
	}

	return segments;
}
