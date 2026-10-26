
const dotenv = require("dotenv");

dotenv.config();

let hindsightClient = null;

// Read configuration from backend/.env
function getConfig() {
    const apiKey = process.env.HINDSIGHT_API_KEY;
    const baseUrl = process.env.HINDSIGHT_BASE_URL;
    const bankId = process.env.HINDSIGHT_BANK_ID;

    const missing = [];

    if (!apiKey) missing.push("HINDSIGHT_API_KEY");
    if (!baseUrl) missing.push("HINDSIGHT_BASE_URL");
    if (!bankId) missing.push("HINDSIGHT_BANK_ID");

    if (missing.length > 0) {
        throw new Error(
            `Missing Hindsight environment variables: ${missing.join(", ")}`
        );
    }

    return { apiKey, baseUrl, bankId };
}

// Create the SDK client only when required.
async function getClient() {
    if (hindsightClient) {
        return hindsightClient;
    }

    const { apiKey, baseUrl } = getConfig();

    // Dynamic import keeps this compatible with a CommonJS backend.
    const { HindsightClient } = await import(
        "@vectorize-io/hindsight-client"
    );

    hindsightClient = new HindsightClient({
        baseUrl,
        apiKey,
    });

    return hindsightClient;
}

// Avoid storing obvious personal identifiers and secrets.
function containsSensitiveData(text) {
    const patterns = [
        /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
        /\b\d{12}\b/, // Aadhaar-like 12-digit identifier
        /\b(?:password|passwd|api[_ -]?key|access[_ -]?token|secret)\s*[:=]\s*\S+/i,
        /\bBearer\s+[A-Za-z0-9._~+/=-]+/i,
    ];

    return patterns.some((pattern) => pattern.test(text));
}

// Retrieve long-term memories relevant to a task.
async function recallMemories(query) {
    try {
        if (typeof query !== "string" || !query.trim()) {
            return [];
        }

        const { bankId } = getConfig();
        const client = await getClient();

        const response = await client.recall(
            bankId,
            query.trim()
        );

        const results = Array.isArray(response?.results)
            ? response.results
            : [];

        return results
            .filter((memory) => typeof memory?.text === "string")
            .slice(0, 5)
            .map((memory) => ({
                text: memory.text,
                type: memory.type || "memory",
            }));
    } catch (error) {
        // Memory is optional: browser automation must keep working.
        console.error(
            "[Hindsight] Recall failed:",
            error.message
        );

        return [];
    }
}

// Store only deliberately selected, useful memories.
// Call this function for explicit preferences or meaningful outcomes,
// not for every browser click.
async function saveMemory(content, context = "Ms WebPilot") {
    try {
        if (typeof content !== "string" || !content.trim()) {
            return { success: false, reason: "empty_content" };
        }

        const cleanedContent = content.trim();

        if (cleanedContent.length > 1000) {
            return { success: false, reason: "content_too_long" };
        }

        if (containsSensitiveData(cleanedContent)) {
            console.warn(
                "[Hindsight] Memory skipped: possible sensitive data."
            );

            return { success: false, reason: "sensitive_data" };
        }

        const { bankId } = getConfig();
        const client = await getClient();

        await client.retain(
            bankId,
            cleanedContent,
            {
                context: String(context).slice(0, 200),
            }
        );

        console.log("[Hindsight] Memory saved.");

        return { success: true };
    } catch (error) {
        console.error(
            "[Hindsight] Save failed:",
            error.message
        );

        return { success: false, reason: "memory_service_error" };
    }
}

// Verify that the configured Cloud endpoint, credentials,
// and memory bank can be used.
async function testMemoryConnection() {
    const { bankId } = getConfig();
    const client = await getClient();

    const version = await client.getVersion();

    // Also checks access to the configured memory bank.
    const result = await client.recall(
        bankId,
        "Ms WebPilot memory connection test"
    );

    return {
        success: true,
        apiVersion: version?.api_version || "reachable",
        bankAccessible: Array.isArray(result?.results),
        memoriesFound: Array.isArray(result?.results)
            ? result.results.length
            : 0,
    };
}

module.exports = {
    recallMemories,
    saveMemory,
    testMemoryConnection,
};

// Running `node memory.js` tests the connection without saving test data.
if (require.main === module) {
    testMemoryConnection()
        .then((result) => {
            console.log("[Hindsight] Connection test passed:", result);
        })
        .catch((error) => {
            console.error(
                "[Hindsight] Connection test failed:",
                error.message
            );

            process.exitCode = 1;
        });
}
