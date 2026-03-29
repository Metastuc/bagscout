import util from "util";

export function generateLogId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function serialize(value: unknown): string {
    try {
        return JSON.stringify(value);
    } catch {
        return String(value);
    }
}

interface LogInput {
    data?: unknown; // any structured data
    eventId?: string; // optional event-bus id
    id?: string; // optional override for log/event id
    module?: string; // e.g., 'subscription', 'ai', 'api'
    msg?: string; // message text
    tag?: string; // log level: info | error | debug | warn
    timestamp?: string; // optional timestamp
}

function formatLog({
    data,
    eventId,
    id = generateLogId(),
    module = "app",
    msg = "",
    tag = "log",
    timestamp = new Date().toISOString(),
}: LogInput): string {
    return (
        `[${timestamp}][${module}][${tag}][${id}]` +
        (eventId ? `[event:${eventId}]` : "") +
        ` ${msg}` +
        (data !== undefined ? " :: " + serialize(data) : "")
    );
}

/**
 * Creates a base logger function that logs messages to the console with
 * structured log input. The returned function can be called with a
 * partial log input object to log messages.
 *
 * The returned function has the following properties:
 * - info: logs messages with the "info" tag
 * - error: logs messages with the "error" tag
 * - warn: logs messages with the "warn" tag
 * - debug: logs messages with the "debug" tag
 * - json: returns a structured JSON object for the log input
 * - child: creates a child logger function with pre-filled context
 *
 * @param {Partial<LogInput>} context - a partial log input object
 * with pre-filled values for the logger
 * @returns {(input: LogInput) => void} a base logger function
 */
function createBaseLogger(context: Partial<LogInput> = {}) {
    const baseLog = (input: LogInput) => {
        const merged = {
            ...context,
            ...input,
            eventId: input.eventId ?? context.eventId,
        };
        console.log(
            "\n\n\n" +
                util.inspect(formatLog(merged), {
                    colors: true,
                    depth: null,
                    showHidden: true,
                    showProxy: true,
                }) +
                "\n\n\n",
        );
    };

    // Levels
    baseLog.info = (input: LogInput) => baseLog({ ...input, tag: input.tag ?? "info" });
    baseLog.error = (input: LogInput) => baseLog({ ...input, tag: input.tag ?? "error" });
    baseLog.warn = (input: LogInput) => baseLog({ ...input, tag: input.tag ?? "warn" });
    baseLog.debug = (input: LogInput) => baseLog({ ...input, tag: input.tag ?? "debug" });

    // Return structured JSON (for Loki / Pino / DB)
    baseLog.json = (input: LogInput) => ({
        ...context,
        ...input,
        timestamp: input.timestamp ?? new Date().toISOString(),
        id: input.id ?? generateLogId(),
    });

    // Create child logger with pre-filled context
    baseLog.child = (childContext: Partial<LogInput>) => createBaseLogger({ ...context, ...childContext });

    return baseLog;
}

export const appLogger = createBaseLogger();
