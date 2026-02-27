import fs from 'fs';
import path from 'path';

interface FileEntry {
  path: string;
  content: string;
}

export class FileWriter {
  private rootDir: string;
  private verbose: boolean;

  constructor(rootDir: string, verbose: boolean = false) {
    this.rootDir = path.resolve(rootDir);
    this.verbose = verbose;
  }

  write(files: FileEntry[]): void {
    fs.mkdirSync(this.rootDir, { recursive: true });
    for (const file of files) {
      this.writeFile(file.path, file.content);
    }
  }

  writeText(relativePath: string, content: string): void {
    this.writeFile(relativePath, content);
  }

  private writeFile(relativePath: string, content: string): void {
    const absolutePath = path.resolve(this.rootDir, relativePath);

    // Security: ensure the resolved path stays within rootDir
    if (!absolutePath.startsWith(this.rootDir + path.sep) && absolutePath !== this.rootDir) {
      console.error(`\nSecurity error: "${relativePath}" resolves outside project root`);
      process.exit(1);
    }

    const dir = path.dirname(absolutePath);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf8');

    if (this.verbose) {
      console.log(`  [write] ${relativePath}`);
    }
  }
}
