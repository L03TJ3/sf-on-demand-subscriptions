flowchart LR
U[User] -->|clicks Play| VJS[Video.js Player]
VJS -->|Gate: show modal & wallet| UI[Auth/Wallet]
UI -->|Confirmed+Network OK| SDK[Streaming SDK Superfluid+G$]
SDK -->|Start stream txn| CH[Chain]
CH -->|Receipt| SDK --> VJS
VJS -->|Playing| OVL[Stats Overlay Button]
VJS -->|Pause/Ended| SDK
SDK -->|Stop/Adjust stream| CH
OVL -->|Toggle| WDG[Overlay Widget live flow, cost, time]
