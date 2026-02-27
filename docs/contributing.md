# Contributing

Thank you for your interest in contributing to Forge.

---

## Development Setup

```bash
git clone https://github.com/raniakthiri/forge.git
cd forge
npm install
```

Run in development mode (no build step needed):

```bash
npm run dev -- init --dry-run --verbose
```

Build:

```bash
npm run build
```

---

## Project Structure

See [architecture.md](architecture.md) for a full explanation of each file and service.

---

## Submitting a Pull Request

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Ensure `npm run build` passes with no TypeScript errors
5. Open a pull request with a clear description of the change

---

## Reporting Issues

Use [GitHub Issues](https://github.com/raniakthiri/forge/issues). Please include:

- What you ran
- What you expected
- What actually happened
- Your Node.js version and OS
