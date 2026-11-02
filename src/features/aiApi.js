
import { api } from "../utils/axios.js";

export const chat = async ({ projectId, message, history = [], signal }) => {
  const response = await fetch(
    `${api.defaults.baseURL || ""}/api/ai/chat`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        "x-user-id": localStorage.getItem("userId") || "",
      },
      body: JSON.stringify({ projectId, message, history }),
      signal,
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => null);
    throw new Error(err?.message || `Request failed (${response.status})`);
  }

  if (!response.body) {
    throw new Error("Streaming is not supported by this response.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let finalMessage = "";

  const processBlock = (block) => {
    if (!block.trim()) return false;

    let event = "message";
    let dataLine = "";

    for (const line of block.split(/\r?\n/)) {
      if (line.startsWith("event:")) {
        event = line.slice(6).trim();
      } else if (line.startsWith("data:")) {
        dataLine += (dataLine ? "\n" : "") + line.slice(5).trim();
      }
    }

    if (!dataLine || dataLine === "[DONE]") return false;

    let data;

    try {
      data = JSON.parse(dataLine);
    } catch {
      throw new Error("Invalid response received from server.");
    }

    if (event === "error") {
      throw new Error(data.message || "Something went wrong");
    }

    if (event === "message") {
      finalMessage += data.content || "";
    }

    if (event === "done") {
      finalMessage = data.message || finalMessage;
      return true;
    }

    return false;
  };

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        buffer += decoder.decode();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      const blocks = buffer.split(/\r?\n\r?\n/);
      buffer = blocks.pop() || "";

      for (const block of blocks) {
        if (processBlock(block)) {
          await reader.cancel();
          return finalMessage;
        }
      }
    }

    if (buffer.trim()) {
      processBlock(buffer);
    }

    return finalMessage;
  } catch (error) {
    await reader.cancel().catch(() => {});
    throw error;
  } finally {
    reader.releaseLock();
  }
};
