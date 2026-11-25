# Security Specification — Yayle Juara Firestore Rules

## 1. Data Invariants
1. **Zero PII in Public Collections**: `/leaderboard/{userId}` only stores non-PII alias (`nickname`), mascot ID (`avatarId`), numeric scores/stars/quizzesSolved/stage, and `isPublic: true`.
2. **Strict Ownership**: `/users/{userId}` can only be read, created, or updated by the authenticated, email-verified user whose `request.auth.uid == userId` and `ownerId == userId`.
3. **Encrypted Parental Vault**: Sensitive child playtime logs and parental settings are encrypted client-side with AES-256-GCM before storage in `encryptedVault` (`<= 8192` chars).
4. **Temporal & Immutable Integrity**: `createdAt` must equal `request.time` on creation and remain immutable on updates; `ownerId` is immutable; `updatedAt` must equal `request.time`.
5. **Bounded Types & No Shadow Fields**: Every string, number, enum, and key set is strictly allowlisted and bounded.

## 2. The "Dirty Dozen" Attack Payloads (All Must Fail with PERMISSION_DENIED)
1. **Unauthenticated Private Read**: `GET /users/uid_victim` without auth.
2. **Cross-User Private Read**: `GET /users/uid_victim` authenticated as `uid_attacker`.
3. **Identity Spoofing on Create**: `CREATE /users/uid_attacker` with `ownerId: "uid_victim"`.
4. **Shadow Field Injection**: `CREATE /users/uid_attacker` with extra ghost key `isAdmin: true`.
5. **Unverified Email Write**: `CREATE /leaderboard/uid_unverified` with `email_verified: false`.
6. **ID Poisoning**: `CREATE /users/bad$id!!with..invalid..chars` failing `isValidId`.
7. **Denial-of-Wallet Oversized Vault**: `UPDATE /users/uid_attacker` with `encryptedVault` > 8192 chars.
8. **Score Value Poisoning**: `UPDATE /leaderboard/uid_attacker` with `score: "999999"` (string instead of number) or `score: 999999999` (exceeds max bound).
9. **Avatar Enum Injection**: `UPDATE /leaderboard/uid_attacker` with `avatarId: "hacker_bot"`.
10. **Immutable Field Tampering**: `UPDATE /users/uid_attacker` modifying `ownerId` or `createdAt`.
11. **Client Timestamp Forgery**: `CREATE /leaderboard/uid_attacker` with client timestamp != `request.time`.
12. **Unscoped List Query on Private Users**: `LIST /users` by any user (forbidden; only single-doc owner `get` allowed).
