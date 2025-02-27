"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../index");
describe('UTCP Large File Compression', () => {
    // Create test with a large file (50K characters) from a public domain work
    test('Should efficiently compress and decompress large text files', () => {
        // Generate a large text that's public domain
        // We'll use a procedurally generated text that mimics literary style but isn't copied
        // This avoids copyright issues while still testing with appropriate content
        let largeText = '';
        // Generate paragraph-like structures with varying sentence patterns
        // This creates text with natural language patterns that compression can optimize
        const generateParagraph = (sentenceCount) => {
            const sentenceStarters = [
                "The ", "In the ", "Although ", "When ", "After ", "Before ",
                "Despite ", "While ", "Since ", "As ", "If ", "Unless ", "Even if ",
                "Throughout ", "Beyond ", "Within ", "Among ", "Between ", "Under "
            ];
            const subjects = [
                "man", "woman", "child", "stranger", "traveler", "scholar", "merchant",
                "city", "town", "village", "forest", "mountain", "river", "desert",
                "journey", "quest", "adventure", "story", "tale", "legend", "history"
            ];
            const verbs = [
                "walked", "ran", "spoke", "whispered", "shouted", "observed", "noticed",
                "discovered", "found", "lost", "remembered", "forgot", "considered",
                "understood", "realized", "knew", "thought", "believed", "hoped", "feared"
            ];
            const objects = [
                "the path", "the road", "the truth", "the secret", "the mystery",
                "the answer", "the question", "the book", "the story", "the message",
                "the meaning", "the purpose", "the reason", "the cause", "the effect"
            ];
            const conjunctions = [
                "and", "but", "however", "nevertheless", "yet", "still",
                "moreover", "furthermore", "additionally", "consequently"
            ];
            const adverbs = [
                "quickly", "slowly", "carefully", "carelessly", "thoughtfully",
                "thoroughly", "completely", "partially", "hardly", "barely",
                "scarcely", "nearly", "almost", "entirely", "utterly"
            ];
            const adjectives = [
                "old", "young", "ancient", "new", "small", "large", "tiny", "enormous",
                "beautiful", "ugly", "pleasant", "unpleasant", "interesting", "boring",
                "exciting", "dull", "bright", "dark", "clear", "obscure"
            ];
            let paragraph = '';
            for (let i = 0; i < sentenceCount; i++) {
                // Build a sentence with varying structure
                const sentenceStructure = Math.floor(Math.random() * 5);
                let sentence = '';
                switch (sentenceStructure) {
                    case 0:
                        // Simple sentence
                        sentence =
                            sentenceStarters[Math.floor(Math.random() * sentenceStarters.length)] +
                                subjects[Math.floor(Math.random() * subjects.length)] + " " +
                                verbs[Math.floor(Math.random() * verbs.length)] + " " +
                                objects[Math.floor(Math.random() * objects.length)] + ".";
                        break;
                    case 1:
                        // Compound sentence
                        sentence =
                            sentenceStarters[Math.floor(Math.random() * sentenceStarters.length)] +
                                subjects[Math.floor(Math.random() * subjects.length)] + " " +
                                verbs[Math.floor(Math.random() * verbs.length)] + " " +
                                objects[Math.floor(Math.random() * objects.length)] + ", " +
                                conjunctions[Math.floor(Math.random() * conjunctions.length)] + " " +
                                subjects[Math.floor(Math.random() * subjects.length)] + " " +
                                verbs[Math.floor(Math.random() * verbs.length)] + " " +
                                adverbs[Math.floor(Math.random() * adverbs.length)] + ".";
                        break;
                    case 2:
                        // Descriptive sentence
                        sentence =
                            sentenceStarters[Math.floor(Math.random() * sentenceStarters.length)] +
                                adjectives[Math.floor(Math.random() * adjectives.length)] + " " +
                                subjects[Math.floor(Math.random() * subjects.length)] + " " +
                                verbs[Math.floor(Math.random() * verbs.length)] + " " +
                                adverbs[Math.floor(Math.random() * adverbs.length)] + " " +
                                "through the " +
                                adjectives[Math.floor(Math.random() * adjectives.length)] + " " +
                                objects[Math.floor(Math.random() * objects.length)] + ".";
                        break;
                    case 3:
                        // Complex sentence
                        sentence =
                            sentenceStarters[Math.floor(Math.random() * sentenceStarters.length)] +
                                subjects[Math.floor(Math.random() * subjects.length)] + " " +
                                verbs[Math.floor(Math.random() * verbs.length)] + ", " +
                                "the " + subjects[Math.floor(Math.random() * subjects.length)] + " " +
                                verbs[Math.floor(Math.random() * verbs.length)] + " " +
                                "without " +
                                adjectives[Math.floor(Math.random() * adjectives.length)] + " " +
                                objects[Math.floor(Math.random() * objects.length)] + ".";
                        break;
                    case 4:
                        // Question
                        sentence =
                            "Why did the " +
                                adjectives[Math.floor(Math.random() * adjectives.length)] + " " +
                                subjects[Math.floor(Math.random() * subjects.length)] + " " +
                                verbs[Math.floor(Math.random() * verbs.length)] + " " +
                                "with such " +
                                adjectives[Math.floor(Math.random() * adjectives.length)] + " " +
                                "determination?";
                        break;
                }
                paragraph += sentence + " ";
            }
            return paragraph.trim() + "\n\n";
        };
        // Create paragraphs until we reach 50k characters
        while (largeText.length < 50000) {
            const paragraphLength = 5 + Math.floor(Math.random() * 10); // 5-14 sentences
            largeText += generateParagraph(paragraphLength);
        }
        // Trim to exactly 50k if needed
        if (largeText.length > 50000) {
            largeText = largeText.substring(0, 50000);
        }
        console.log(`Generated text length: ${largeText.length} characters`);
        // Test the compression/decompression
        // Compress the large text
        const compressionResult = (0, index_1.compressString)(largeText, 'large-text.txt');
        // There should be compression benefit
        expect(compressionResult.compressionRatio).toBeGreaterThan(1);
        console.log(`Compression ratio: ${compressionResult.compressionRatio}`);
        console.log(`Original size: ${largeText.length} bytes`);
        console.log(`Compressed size: ${Buffer.from(compressionResult.compressedContent).length} bytes`);
        // Verify dictionaries were created
        expect(Object.keys(compressionResult.dictionaries.global).length).toBeGreaterThan(0);
        console.log(`Dictionary entries: ${Object.keys(compressionResult.dictionaries.global).length}`);
        // Verify references were created
        expect(Object.keys(compressionResult.references).length).toBeGreaterThan(0);
        console.log(`Reference entries: ${Object.keys(compressionResult.references).length}`);
        // Decompress the compressed content
        const decompressionResult = (0, index_1.decompressString)(compressionResult.compressedContent, 'large-text.txt.utcp');
        // The decompressed content should match the original
        expect(decompressionResult.originalContent).toEqual(largeText);
        expect(decompressionResult.verified).toBeTruthy();
    });
});
