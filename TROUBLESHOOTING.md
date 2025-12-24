# Troubleshooting Guide

## Continuous Compilation Issues

If Next.js is continuously compiling, try these solutions:

### 1. Clear Build Cache
```bash
rm -rf .next
npm run dev
```

On Windows:
```bash
rmdir /s /q .next
npm run dev
```

### 2. Check for File System Issues
- Ensure no other processes are modifying files in the project directory
- Check if antivirus software is scanning the project folder
- Disable file indexing on the project folder (Windows Search)

### 3. Optimize File Watching
The configuration has been optimized to:
- Ignore `.next`, `node_modules`, and build directories
- Use aggregate timeout to batch file changes
- Disable polling on Windows

### 4. Check for Circular Dependencies
Run:
```bash
npm run lint
```

### 5. Restart Development Server
Sometimes a simple restart fixes the issue:
1. Stop the server (Ctrl+C)
2. Clear `.next` folder
3. Restart: `npm run dev`

### 6. Check TypeScript Configuration
Ensure `tsconfig.json` excludes build directories:
- `.next`
- `node_modules`
- `out`
- `build`
- `coverage`

### 7. Disable TypeScript Incremental Compilation (if needed)
If issues persist, temporarily disable incremental compilation:
```json
{
  "compilerOptions": {
    "incremental": false
  }
}
```

### 8. Check for Large Files
Large files in the project can slow down compilation. Check:
- Image files in `public/` directory
- Large JSON files
- Generated files

### 9. Windows-Specific Issues
On Windows, file watching can be slower. Consider:
- Using WSL2 for development
- Increasing file watcher limits (if applicable)
- Excluding project folder from antivirus real-time scanning

### 10. Check Environment Variables
Ensure `.env.local` is not being watched unnecessarily:
- Add `.env*` to `.gitignore`
- Check if environment files are being modified by other processes

## Common Causes

1. **File Watchers**: Too many files being watched
2. **Build Artifacts**: `.next` folder being watched
3. **TypeScript**: Incremental compilation issues
4. **Hot Module Replacement**: HMR detecting false changes
5. **File System**: Slow file system or network drives
6. **Antivirus**: Real-time scanning interfering
7. **IDE**: IDE file watchers conflicting with Next.js

## Performance Tips

1. Use Turbopack (default in Next.js 16) - it's faster than webpack
2. Keep `node_modules` excluded from watching
3. Use `.nextignore` to exclude unnecessary files
4. Optimize TypeScript compilation with proper excludes
5. Consider using `--turbo` flag for faster builds

