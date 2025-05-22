#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import server from "./index";

async function main() {
  const transport = new StdioServerTransport();

  await server.connect(transport);

  try {
    console.error("Starting MCP Accessibility checker server...");
    console.error("MCP server connected successfully");
  } catch (error) {
    console.error("Error starting server:", error);
    if (error instanceof Error) {
      console.error("Error stack:", error.stack);
    }
    process.exit(1);
  }

  // Handle process events
  process.on("disconnect", () => {
    console.error("Process disconnected");
    process.exit(0);
  });

  process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
  });

  // Keep the process running
  await new Promise<void>((resolve) => {
    const signals = ["SIGINT", "SIGTERM", "SIGHUP"];
    signals.forEach((signal) =>
      process.on(signal, () => {
        console.error(`Received ${signal}, shutting down...`);
        resolve();
      })
    );

    process.on("disconnect", () => {
      console.error("Process disconnected");
      resolve();
    });

    // Optional: log something every 30s to prove it's alive
    setInterval(() => {
      console.error("[heartbeat] MCP server alive...");
    }, 30000);
  });

  await new Promise(() => {});
}

// Start the server
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
