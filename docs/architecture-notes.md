# Firebase Integration Notes

## Decisions Log
- Use Firebase Web SDK modular APIs for auth and Firestore.
- Keep core logic in `src/core/*` with no React imports.
- Route all state/action diagnostics through a shared structured logger.
- Make diagnostics screen inspect-only; app works without opening it.

## Kill List
- Tried keeping logs only in component state.
- Rejected because logs would disappear across screens and could not be consumed centrally.

- Tried putting Firebase calls directly in UI components.
- Rejected because it violates UI/core separation and makes testing harder.

- Considered realtime profile listeners first.
- Rejected for now to keep this initial integration simple and low-risk.
