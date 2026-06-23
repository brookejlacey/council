import { test, expect, Page } from "@playwright/test";

// Mock the backend API so tests run without a live server
function mockBackendAPI(page: Page) {
  return Promise.all([
    page.route("**/api/council/sessions", (route) => {
      if (route.request().method() === "POST") {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            id: "test-session-123",
            title: "New Session",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_context: {},
          }),
        });
      } else {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([]),
        });
      }
    }),

    page.route("**/api/council/advisors", (route) => {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "strategist",
            name: "The Strategist",
            role: "Strategy & Planning",
            personality: "analytical",
            emoji: "♟️",
            color: "#6366F1",
          },
          {
            id: "analyst",
            name: "The Analyst",
            role: "Financial Analysis",
            personality: "data-driven",
            emoji: "📊",
            color: "#059669",
          },
        ]),
      });
    }),
  ]);
}

/**
 * Inject a mock WebSocket that simulates the deliberation protocol.
 * Must be called before navigating to the page.
 */
async function mockWebSocket(page: Page) {
  await page.addInitScript(() => {
    const OriginalWebSocket = window.WebSocket;

    class MockWebSocket extends EventTarget {
      static CONNECTING = 0;
      static OPEN = 1;
      static CLOSING = 2;
      static CLOSED = 3;
      CONNECTING = 0;
      OPEN = 1;
      CLOSING = 2;
      CLOSED = 3;

      readyState = 0;
      url: string;
      protocol = "";
      extensions = "";
      bufferedAmount = 0;
      binaryType: BinaryType = "blob";

      onopen: ((ev: Event) => void) | null = null;
      onclose: ((ev: CloseEvent) => void) | null = null;
      onmessage: ((ev: MessageEvent) => void) | null = null;
      onerror: ((ev: Event) => void) | null = null;

      constructor(url: string | URL, protocols?: string | string[]) {
        super();
        this.url = url.toString();

        // Auto-open after a tick
        setTimeout(() => {
          this.readyState = 1;
          const evt = new Event("open");
          this.onopen?.(evt);
          this.dispatchEvent(evt);
        }, 50);
      }

      send(data: string) {
        const payload = JSON.parse(data);
        const message = payload.message || "";

        // Simulate the deliberation protocol
        const events = [
          {
            type: "routing",
            content: "Selecting advisors for your question...",
            metadata: {
              advisors: [
                {
                  id: "strategist",
                  name: "The Strategist",
                  role: "Strategy & Planning",
                  personality: "analytical",
                  emoji: "♟️",
                  color: "#6366F1",
                },
                {
                  id: "analyst",
                  name: "The Analyst",
                  role: "Financial Analysis",
                  personality: "data-driven",
                  emoji: "📊",
                  color: "#059669",
                },
              ],
            },
          },
          {
            type: "perspective",
            advisor_id: "strategist",
            advisor_name: "The Strategist",
            content:
              "From a strategic perspective, this requires careful planning and assessment of your resources.",
          },
          {
            type: "perspective",
            advisor_id: "analyst",
            advisor_name: "The Analyst",
            content:
              "Looking at the financial data, there are several factors to consider in your situation.",
          },
          {
            type: "debate",
            advisor_id: "strategist",
            advisor_name: "The Strategist",
            content:
              "Building on what The Analyst said, I want to emphasize the importance of a phased approach.",
            turn: 1,
          },
          {
            type: "debate",
            advisor_id: "analyst",
            advisor_name: "The Analyst",
            content:
              "I agree with The Strategist on phasing, but the numbers suggest a more aggressive timeline.",
            turn: 1,
          },
          {
            type: "synthesis",
            content:
              "## Council Synthesis\n\nYour advisors have deliberated and here is their combined guidance:\n\n**Areas of Agreement:** Both advisors emphasize planning.\n\n**Key Tension:** Timeline aggressiveness.\n\n**Recommended Actions:**\n1. Assess your current resources\n2. Create a phased plan\n3. Set clear milestones",
          },
          {
            type: "complete",
            content: "Deliberation complete",
          },
        ];

        let delay = 100;
        for (const event of events) {
          setTimeout(() => {
            const evt = new MessageEvent("message", {
              data: JSON.stringify(event),
            });
            this.onmessage?.(evt);
            this.dispatchEvent(evt);
          }, delay);
          delay += 200;
        }
      }

      close() {
        this.readyState = 3;
        const evt = new CloseEvent("close");
        this.onclose?.(evt);
        this.dispatchEvent(evt);
      }
    }

    // Only mock council WebSocket URLs, pass through Next.js HMR etc.
    // @ts-ignore
    window.WebSocket = function (
      url: string | URL,
      protocols?: string | string[]
    ) {
      const urlStr = url.toString();
      if (urlStr.includes("/council/ws/")) {
        return new MockWebSocket(url, protocols);
      }
      return new OriginalWebSocket(url, protocols as any);
    } as any;
    // Copy static properties
    (window.WebSocket as any).CONNECTING = 0;
    (window.WebSocket as any).OPEN = 1;
    (window.WebSocket as any).CLOSING = 2;
    (window.WebSocket as any).CLOSED = 3;
  });
}

test.describe("Council Landing Page", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackendAPI(page);
    await mockWebSocket(page);
  });

  test("shows hero stage with branding", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "COUNCIL" })
    ).toBeVisible();
    await expect(
      page.locator("text=Your personal board of advisors.")
    ).toBeVisible();
    await expect(
      page.locator("text=Not one opinion. A deliberation.")
    ).toBeVisible();
  });

  test("shows textarea with placeholder", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveAttribute(
      "placeholder",
      "What's weighing on you?"
    );
  });

  test("shows example prompts", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Try something like")).toBeVisible();
    await expect(page.locator("text=Career Crisis")).toBeVisible();
    await expect(page.locator("text=Life Decision")).toBeVisible();
    await expect(page.locator("text=Rights & Legal")).toBeVisible();
    await expect(page.locator("text=Finance & Risk")).toBeVisible();
    await expect(page.locator("text=Wellbeing")).toBeVisible();
  });

  test("shows disclaimer", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator(
        "text=COUNCIL provides multi-perspective analysis, not professional advice."
      )
    ).toBeVisible();
  });

  test("submit button is disabled when textarea is empty", async ({
    page,
  }) => {
    await page.goto("/");
    const submitBtn = page.locator("button", { hasText: "Convene Council" });
    await expect(submitBtn).toBeDisabled();
  });

  test("submit button enables when user types", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill("Should I change careers?");
    const submitBtn = page.locator("button", { hasText: "Convene Council" });
    await expect(submitBtn).toBeEnabled();
  });

  test("header shows COUNCIL branding with connection indicator", async ({
    page,
  }) => {
    await page.goto("/");
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(
      header.getByText("COUNCIL", { exact: true })
    ).toBeVisible();
    // Connection status dot (green when connected via mock WS)
    await expect(header.locator(".rounded-full").first()).toBeVisible();
  });

  test("shows green connection dot when WebSocket is connected", async ({
    page,
  }) => {
    await page.goto("/");
    // Wait for mock WS to connect
    await page.waitForTimeout(200);
    const dot = page.locator("header .bg-emerald-500");
    await expect(dot).toBeVisible();
  });
});

test.describe("Council Deliberation Flow", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackendAPI(page);
    await mockWebSocket(page);
  });

  test("clicking example prompt transitions to deliberation view", async ({
    page,
  }) => {
    await page.goto("/");
    // Wait for WS to connect
    await page.waitForTimeout(200);

    await page.locator("button", { hasText: "Career Crisis" }).click();

    // Should show the user's question
    await expect(
      page.locator("text=Your question to the Council")
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator(
        "text=I just lost my job and have 3 months of savings"
      )
    ).toBeVisible();
  });

  test("typing and pressing Enter submits the question", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(200);

    const textarea = page.locator("textarea");
    await textarea.fill("Should I start a business?");
    await textarea.press("Enter");

    await expect(
      page.locator("text=Your question to the Council")
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator("text=Should I start a business?")
    ).toBeVisible();
  });

  test("Shift+Enter does not submit", async ({ page }) => {
    await page.goto("/");
    const textarea = page.locator("textarea");
    await textarea.fill("Line one");
    await textarea.press("Shift+Enter");

    // Hero stage should still be visible (not submitted)
    await expect(
      page.locator("text=Your personal board of advisors.")
    ).toBeVisible();
  });

  test("clicking Convene Council button submits", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(200);

    const textarea = page.locator("textarea");
    await textarea.fill("How do I negotiate a raise?");
    await page.locator("button", { hasText: "Convene Council" }).click();

    await expect(
      page.locator("text=Your question to the Council")
    ).toBeVisible({ timeout: 5000 });
  });

  test("shows perspectives from advisors", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(200);

    await page.locator("button", { hasText: "Career Crisis" }).click();

    // Wait for perspectives to stream in
    await expect(
      page.getByText("Perspectives", { exact: true })
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator("text=From a strategic perspective")
    ).toBeVisible({ timeout: 5000 });
  });

  test("shows cross-examination phase", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(200);

    await page.locator("button", { hasText: "Career Crisis" }).click();

    await expect(
      page.getByText("Cross-Examination", { exact: true })
    ).toBeVisible({ timeout: 5000 });
  });

  test("shows synthesis after deliberation", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(200);

    await page.locator("button", { hasText: "Career Crisis" }).click();

    await expect(
      page.getByText("Synthesis", { exact: true })
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator("h2", { hasText: "Council Synthesis" })
    ).toBeVisible({ timeout: 5000 });
  });

  test("shows follow-up input after completion", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(200);

    await page.locator("button", { hasText: "Career Crisis" }).click();

    // Wait for complete phase
    const followUpInput = page.locator(
      'input[placeholder="Ask a follow-up or dig deeper..."]'
    );
    await expect(followUpInput).toBeVisible({ timeout: 5000 });
  });

  test("shows advisor pills in header during deliberation", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForTimeout(200);

    await page.locator("button", { hasText: "Career Crisis" }).click();

    // Phase badge should appear
    await expect(page.locator("header").locator("text=CONVENING")).toBeVisible({
      timeout: 5000,
    });
  });
});

test.describe("Responsive Design", () => {
  test.beforeEach(async ({ page }) => {
    await mockBackendAPI(page);
    await mockWebSocket(page);
  });

  test("renders correctly on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "COUNCIL" })
    ).toBeVisible();
    await expect(page.locator("textarea")).toBeVisible();
    await expect(
      page.locator("button", { hasText: "Convene Council" })
    ).toBeVisible();
  });

  test("renders correctly on tablet viewport", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await expect(
      page.getByRole("heading", { name: "COUNCIL" })
    ).toBeVisible();
    await expect(page.locator("text=Career Crisis")).toBeVisible();
  });
});
