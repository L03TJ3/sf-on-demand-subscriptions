# AGENTS.md — AI-Workshop: On-Demand Money Streaming for A/V

> **Purpose**
> This file gives Codex-style agents everything they need to work on the **on-demand subscription via money streaming** project. It defines goals, repo layout, coding conventions, commands, references, risks, and checklists—so agents can implement features end-to-end without guesswork.

---

## 1) Mission & Scope

**Goal:** When a viewer presses play in our Video.js player, start a **G\$ (GoodDollar)** money stream using **Superfluid**. When they pause/stop/seek beyond preview, **adjust or stop** the stream.

**Non-goals (MVP):** No marketplace/DRM, no off-player metering, no fancy billing beyond instantaneous flow control.

**Why this matters:** Superfluid enables second-by-second payments; G\$ on Celo is a **native SuperToken** (no wrapping) designed to stream out-of-the-box. We gate playback on a successful stream start, and we stop/adjust exactly when the user stops watching. ([GoodDocs][1])

---

## 2) Repository Structure (TurboRepo)

```
.
├─ apps/
│  └─ web/                 # Next.js; Video.js wired; .env for RPC/addresses
├─ packages/
│  ├─ streaming-sdk/       # Thin wrapper (startStream, stopStream, getFlow)
│  ├─ player-plugin/       # Video.js plugin (gating + Stats button)
│  └─ ui/                  # Shared UI (modals, toasts, overlay)
├─ docs/
│  ├─ context/sources.md
│  ├─ architecture/streaming.mmd
│  └─ instructions/superfluid_gooddollar.md
│  └─ mermaids/ # Place any mermaid diagrams here

├─ .ai/
│  └─ research.json        # Filled to schema below
└─ turbo.json
```

**Definition of Done for each PR**

- Compiles; lint/typecheck passes; minimal Play/Pause flow test passes.
- `docs/architecture/streaming.mmd` updated if control flow changes.
- `docs/context/sources.md` contains any new authoritative links.
- `.ai/research.json` values refreshed if a dependency/contract changes.

---

## 3) Authoritative References (use these first)

- **Superfluid docs hub** — protocol, SDKs, technical refs, explorer. ([Superfluid][2])
- **CFAv1Forwarder (client contract)**

  - Universal address (same on all SF chains): `0xcfA132E353cB4E398080B9700609bb008eceB125`. ([Superfluid][3])
  - Tech reference (ABI + helper view functions). ([Superfluid][3])

- **GDAv1Forwarder** (pool distributions) — universal `0x6DA13Bde224A05a288748d857b9e7DDEffd1dE08`. (Next steps only.) ([Superfluid][4])
- **GoodDollar “Use G\$ streaming”** — end-to-end guide, **G\$ token address on Celo**, examples, gotchas.

  - G\$ (Celo mainnet) `0x62B8B11039fcfE5AB0C56E502b1C372A3D2a9C7A`
  - Dev G\$ (testing) `0xFa51eFDc0910CCdA91732e6806912Fa12e2FD475`
  - Notes: streaming **live only on Celo** (chainId `42220`) at the moment. ([GoodDocs][1])

- **G\$ decimals** — On **Celo: 18 decimals** (Fuse/Ethereum ERC-20 had 2). ([GoodDocs][5])
- **Video.js**

  - API docs (Player/events, Components, Plugin API). ([docs.videojs.com][6], [videojs.com][7])
  - Latest NPM version (pin in package.json): **`video.js@8.23.4`** (published 14 days ago). ([npm][8])
  - **iOS fullscreen limitation:** iOS forces native fullscreen with **no custom HTML controls/overlays**; use inline playback or full-window fallback. ([GitHub][9])

- **OpenAI Codex & AGENTS.md guidance** — Codex is guided by `AGENTS.md` files in the repo. ([OpenAI][10])

_Add network host addresses as needed from Superfluid “Contract Addresses” and Explorer._ ([Superfluid][11])

---

## 4) Versions to Track (fill into `.ai/research.json`)

- **Superfluid SDK (sdk-core)**: check NPM for latest (e.g., `@superfluid-finance/sdk-core@0.6.12`, last month). ([npm][12])
- **Video.js**: latest NPM tag (e.g., `8.23.4`). ([npm][8])
- **GoodDollar docs commit/revision**: If GitBook doesn’t expose a commit, record the **“Last updated”** date shown on the page (“Use G\$ streaming”: _3 months ago_ when accessed) alongside the URL.

**Schema (keep this exact):**

```json
{
  "versions": {
    "superfluid_sdk": "string",
    "videojs": "string",
    "gooddollar_docs_commit": "string"
  },
  "networks": [
    {
      "chain": "string",
      "g$_token": "address",
      "superfluid_host": "address",
      "cfa_forwarder": "address",
      "explorer_refs": ["url"]
    }
  ],
  "apis": {
    "superfluid": {
      "start": "codeblock",
      "stop": "codeblock",
      "getFlow": "codeblock"
    },
    "gooddollar": {
      "allowance_or_claim": "notes+codeblock"
    }
  },
  "player": {
    "events": ["play", "pause", "ended", "seeking"],
    "plugin_outline": "codeblock",
    "fullscreen_notes": "text"
  },
  "risks": ["text"],
  "test_plan": ["unit", "integration", "manual checklist"]
}
```

---

## 5) Implementation Guidance

### 5.1 Superfluid + G\$ (client-side via **CFAv1Forwarder**)

**Concept:** For pure “pay-as-you-watch,” call the forwarder’s **`createFlow` / `updateFlow` / `deleteFlow`** on **G\$ SuperToken**. Use helper views (`getFlowInfo`, `getBufferAmountByFlowrate`) to display live stats and ensure sufficient buffer. ([GoodDocs][1])

**Start stream (Ethers v6 example):**

```ts
import { BrowserProvider, Contract } from "ethers";

const forwarder = new Contract(
  "0xcfA132E353cB4E398080B9700609bb008eceB125",
  CFAv1ForwarderAbi,
  new BrowserProvider(window.ethereum).getSigner()
);

const G$ = "0x62B8B11039fcfE5AB0C56E502b1C372A3D2a9C7A"; // Celo mainnet

// convert "tokens per month" => int96 wad/sec (18 decimals)
const perMonthToRate = (pm: bigint) => (pm * 10n ** 18n) / 2592000n;

export async function startStream(
  sender: string,
  receiver: string,
  perMonth: bigint
) {
  const flowRate = perMonthToRate(perMonth);
  // Optional: pre-check required buffer
  // const buffer = await forwarder.getBufferAmountByFlowrate(G$, flowRate);
  const tx = await forwarder.createFlow(G$, sender, receiver, flowRate, "0x");
  return tx.wait();
}
```

**Stop stream:**

```ts
export async function stopStream(sender: string, receiver: string) {
  const tx = await forwarder.deleteFlow(G$, sender, receiver, "0x");
  return tx.wait();
}
```

**Get live flow (rate, deposit/buffer):**

```ts
export async function getFlow(sender: string, receiver: string) {
  const info = await forwarder.getFlowInfo(G$, sender, receiver);
  // info.flowrate, info.deposit, info.owedDeposit
  return info;
}
```

_Reference for universal forwarder address & ABI:_ Superfluid docs. ([Superfluid][3])
_Reference for G\$ addresses & streaming context:_ GoodDollar docs. ([GoodDocs][1])

**Permissions / smart accounts:** If a relayer or smart account must manage flows for a user, use **Access Control** (Flow Operators) to grant/revoke permissions and set flowrate on behalf of the sender. ([Superfluid][3])

**Decimals:** Use **18 decimals on Celo** (e.g., “1.15 G\$” → `1150000000000000000`). ([GoodDocs][5])

---

### 5.2 Video.js integration

**Events to handle:** `play`, `pause`, `ended`, `seeking`. (Hook `timeupdate` only for UI.) ([docs.videojs.com][6])

**iOS fullscreen (critical):** iOS uses **native fullscreen**—**custom HTML controls/overlays won’t render**; prefer inline playback (`playsinline`, `disablePictureInPicture`) or **full-window** mode instead of invoking native fullscreen on iPhone. ([GitHub][9])

**Plugin outline (gating + “Stats” button):**

```ts
// packages/player-plugin/src/index.ts
import videojs from "video.js";

const Plugin = videojs.getPlugin("plugin");
const Button = videojs.getComponent("Button");

class StatsButton extends Button {
  handleClick() {
    this.player().trigger("goodstats:toggle");
  }
}
videojs.registerComponent("StatsButton", StatsButton);

class GoodStreamPlugin extends Plugin {
  constructor(player, options) {
    super(player, options);

    // Gate play: intercept and start stream first
    player.on("play", async (e) => {
      if (player.hasStarted()) return; // idempotent
      player.pause();

      const ok = await options.onGatePlay?.(); // open modal, connect wallet, startStream
      if (ok) player.play();
    });

    // Stop/adjust on pause/ended/seeking beyond preview
    player.on("pause", () => options.onPause?.());
    player.on("ended", () => options.onEnded?.());
    player.on("seeking", () => options.onSeeking?.(player.currentTime()));

    // Add Stats button into control bar
    player.ready(() => {
      player
        .getChild("controlBar")
        ?.addChild("StatsButton", {}, player.controlBar.children().length - 1);
    });
  }
}

videojs.registerPlugin("goodStream", GoodStreamPlugin);
export default GoodStreamPlugin;
```

**Notes / sources:** Components & plugin API. ([videojs.com][7], [docs.videojs.com][13])

---

## 6) Required Docs & Files (generate/update)

- `docs/context/sources.md` — a link list with one-liners (why each link matters).
  Include:

  - Superfluid docs hub & forwarder tech ref. ([Superfluid][2])
  - GoodDollar “Use G\$ streaming”. ([GoodDocs][1])
  - Video.js docs + components + plugin API + **iOS fullscreen limitation** source. ([docs.videojs.com][6], [videojs.com][7], [GitHub][9])

- `docs/mermaids/streaming.md` — **Mermaid** (keep this exact graph; extend only if needed):

  ```
  flowchart LR
    U[User] -->|clicks Play| VJS[Video.js Player]
    VJS -->|Gate: show modal & wallet| UI[Auth/Wallet]
    UI -->|Confirmed+Network OK| SDK[Streaming SDK (Superfluid+G$)]
    SDK -->|Start stream txn| CH[Chain]
    CH -->|Receipt| SDK --> VJS
    VJS -->|Playing| OVL[Stats Overlay Button]
    VJS -->|Pause/Ended| SDK
    SDK -->|Stop/Adjust stream| CH
    OVL -->|Toggle| WDG[Overlay Widget (live flow, cost, time)]
  ```

- `docs/instructions/superfluid_gooddollar.md` — step-by-step:

  1. Wallet connect (Celo), 2) `createFlow`/`deleteFlow`, 3) buffer calculation, 4) stats (getFlowInfo), 5) ACL (optional), 6) iOS fullscreen fallback.

- `apps/web` — minimal Next.js page that mounts Video.js, loads our plugin with callbacks that call the **streaming-sdk**.

- `packages/streaming-sdk` — exports `startStream`, `stopStream`, `getFlow`, reading **env** for:

  ```
  NEXT_PUBLIC_CHAIN_ID=42220
  NEXT_PUBLIC_GDOLLAR_ADDRESS=0x62B8B11039fcfE5AB0C56E502b1C372A3D2a9C7A
  NEXT_PUBLIC_CFA_FORWARDER=0xcfA132E353cB4E398080B9700609bb008eceB125
  ```

  (+ optional `SUPERFLUID_HOST` once confirmed from explorer). ([Superfluid][11])

- `packages/player-plugin` — the plugin stub above.

- `.ai/research.json` — fill schema values from **NPM** (versions), **GoodDollar “Use G\$ streaming”** (addresses, notes), **Superfluid Contract Addresses/Explorer** (host). ([npm][8], [GoodDocs][1], [Superfluid][11])

---

## 7) Engineering Checklist (must follow)

**Playback gating**

- Intercept first `play`; show modal → connect wallet → network check (Celo) → **start stream** → resume playback. On reject, keep paused and show toast.

**Custom button**

- Add “Stats” button to control bar. In fullscreen:

  - **Web:** works.
  - **iOS native fullscreen:** _do not expect custom UI_. Provide **full-window** alternative or inline playback. ([GitHub][9])

**Stream sync**

- Debounce rapid `pause`/`seek`.
- Minimum billing interval UI (e.g., ignore seeks < 1–2s, but always **deleteFlow** on explicit pause).
- Idempotent `startStream`/`stopStream` (check existing flow first).

**Accounting (overlay)**

- Show **live flowRate**, **elapsed streamed time**, and **estimated cost** (simple `rate * seconds` in 18-decimals, label as estimated). Use `getFlowInfo`. ([GoodDocs][1])

**Failure modes**

- Wallet rejected, wrong network, insufficient balance/buffer, RPC timeouts → non-blocking toasts, keep media paused.

**Security**

- Never start streams without explicit user action. No autoplay → pay.

---

## 8) Test Plan

**Unit**

- `streaming-sdk`: converts per-month↔per-second; handles 18-decimals; formats; idempotent start/stop.
- Player plugin: gating logic (simulated player events).

**Integration**

- With a browser wallet on **Celo mainnet/dev**:

  - Start → flow appears on chain; Pause/Ended → flow deleted; Seeking beyond preview triggers adjust/stop.
  - Overlay shows `flowrate` and updates.

**Manual checklist**

- iOS Safari inline playback path works (no custom controls in native fullscreen). ([GitHub][9])
- Wrong network error UX.
- Low balance/buffer UX using `getBufferAmountByFlowrate`. ([Superfluid][3])
- Confirm **G\$ address** and **CFA forwarder** from docs; verify host address from explorer/contracts page. ([GoodDocs][1], [Superfluid][11])

---

## 9) Programmatic Commands

**Bootstrap**

```bash
pnpm i
pnpm -w turbo run build
pnpm -w turbo run lint && pnpm -w turbo run typecheck
```

**Dev runs**

```bash
pnpm --filter @apps/web dev
```

**Update refs**

- Superfluid SDK version: `npm view @superfluid-finance/sdk-core version` (record into `.ai/research.json`). ([npm][12])
- Video.js version: `npm view video.js version` (update package & research). ([npm][8])

---

## 10) Player API Notes (quick reference)

- **Events:** `play`, `pause`, `seeking`, `ended` (bind on Player). ([docs.videojs.com][6])
- **Plugins:** `videojs.registerPlugin('goodStream', fnOrClass)`. Initialize via player options if needed. ([docs.videojs.com][13])
- **Components:** add custom control via `player.getChild('controlBar').addChild('StatsButton')`. ([videojs.com][7])
- **Caveat:** Touch/fullscreen behaviors differ across devices; see docs/migration guides. ([videojs.com][7])

---

## 11) Risks & Edge Cases (record into `research.json.risks`)

- iOS fullscreen: no custom overlays; UX fallback required. ([GitHub][9])
- User revokes permissions or wallet switches accounts mid-stream.
- Buffer and flow deposit underfunded → creation fails; must pre-check via `getBufferAmountByFlowrate`. ([Superfluid][3])
- Network availability: G\$ streaming currently **Celo only**; switching chains breaks flows. ([GoodDocs][1])
- Rate updates spam: debounce/aggregate `seeking`/scrubbing.

---

## 12) What to Put in `docs/context/sources.md`

- Short bullets per link: what it’s for (ABI? events? iOS quirk?), and **the exact value** we rely on (addresses, versions). Link to:

  - Superfluid docs hub, CFAv1Forwarder ref. ([Superfluid][2])
  - GoodDollar Use G\$ streaming (addresses, decimals, scope). ([GoodDocs][1])
  - Video.js docs (events, components, plugin API) + iOS limitations. ([docs.videojs.com][6], [videojs.com][7], [GitHub][9])
  - Superfluid Contract Addresses / Explorer (for host). ([Superfluid][11])

---

## 13) How Agents Should Use This File

- Treat this as the **single source of truth** for project intent and references.
- When you touch code that affects the flow lifecycle or player gating, **update the Mermaid** and the **sources.md** note if you used a new doc.
- Always refresh `.ai/research.json` values when **versions** or **addresses** change and commit it.

---

## 14) Appendix — Ready-to-Paste `player` section for `.ai/research.json`

```json
{
  "player": {
    "events": ["play", "pause", "ended", "seeking"],
    "plugin_outline": "// see packages/player-plugin/src/index.ts in this repo",
    "fullscreen_notes": "On iOS, native fullscreen uses system controls; custom HTML overlays/plugins will not render. Prefer playsinline/full-window on iPhone."
  }
}
```

**Primary sources for this section:** Video.js API & iOS limitation notes. ([docs.videojs.com][6], [GitHub][9])

---

## 15) Quick Links (for fast nav)

- Superfluid Docs Hub → concepts, SDKs, tech refs. ([Superfluid][2])
- CFAv1Forwarder (address & ABI) → client calls. ([Superfluid][3])
- GoodDollar “Use G\$ streaming” → G\$ addresses, examples. ([GoodDocs][1])
- Video.js API → events & components; Plugin API. ([docs.videojs.com][6], [videojs.com][7])
- Video.js latest on NPM (pin to 8.23.x). ([npm][8])

## 16) Styling Guide for apps

- Reference the styling-guide for preferences when using tamagui: `docs/StylingGuide.md`

---

### End of AGENTS.md

_This AGENTS.md follows the **Codex** guidance that agents can be steered by repository-local instructions (AGENTS.md) describing navigation, commands, and standards for your project._ ([OpenAI][10])

[1]: https://docs.gooddollar.org/for-developers/gooddapp-developer-guides/use-gusd-streaming "Use G$ streaming | GoodDocs"
[2]: https://docs.superfluid.org/?utm_source=chatgpt.com "Superfluid | Stream Money Every Second | Superfluid | Stream Money ..."
[3]: https://docs.superfluid.org/docs/sdk/money-streaming/acl-user-data "Manage Access Control and User Data | Superfluid | Stream Money Every Second"
[4]: https://docs.superfluid.org/docs/sdk/distributions/connect-claim-pool?utm_source=chatgpt.com "Connecting and Claiming from the Pools - docs.superfluid.org"
[5]: https://docs.gooddollar.org/user-guides/bridge-gooddollars?utm_source=chatgpt.com "Bridge GoodDollars | GoodDocs"
[6]: https://docs.videojs.com/index.html "Video.js API docs"
[7]: https://videojs.com/guides/components/?utm_source=chatgpt.com "Components | Video.js"
[8]: https://www.npmjs.com/package/video.js "video.js - npm"
[9]: https://github.com/videojs/video.js/issues/6985?utm_source=chatgpt.com "Is there a way to display VideoJS controls when in fullscreen mode on ..."
[10]: https://openai.com/index/introducing-codex/ "Introducing Codex | OpenAI"
[11]: https://docs.superfluid.org/docs/protocol/contract-addresses?utm_source=chatgpt.com "Contract Addresses | Superfluid | Stream Money Every Second"
[12]: https://www.npmjs.com/package/%40superfluid-finance/sdk-core?utm_source=chatgpt.com "@superfluid-finance/sdk-core - npm"
[13]: https://docs.videojs.com/plugin.js.html?utm_source=chatgpt.com "Source: plugin.js - Video.js"
