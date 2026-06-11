const fs = require('fs');
const path = require('path');

const targetDirs = [
  path.join(__dirname, 'client', 'src', 'components'),
  path.join(__dirname, 'client', 'src', 'pages'),
  path.join(__dirname, 'client', 'src', 'layouts'),
];

// Mappings for light mode -> dark mode
// Because the app was built dark-first, the current classes ARE the dark classes.
// We need to replace `bg-slate-X` with `bg-light-equivalent dark:bg-slate-X`.
const replacements = [
  // Backgrounds
  { regex: /\bbg-slate-900\b/g, replacement: 'bg-white dark:bg-slate-900' },
  { regex: /\bbg-slate-800(\/\d+)?\b/g, replacement: (match) => `bg-slate-50 dark:${match}` },
  { regex: /\bbg-slate-700(\/\d+)?\b/g, replacement: (match) => `bg-white dark:${match}` },
  
  // Texts
  { regex: /\btext-slate-100\b/g, replacement: 'text-slate-900 dark:text-slate-100' },
  { regex: /\btext-slate-200\b/g, replacement: 'text-slate-800 dark:text-slate-200' },
  { regex: /\btext-slate-300\b/g, replacement: 'text-slate-700 dark:text-slate-300' },
  { regex: /\btext-slate-400\b/g, replacement: 'text-slate-600 dark:text-slate-400' },
  { regex: /\btext-slate-500\b/g, replacement: 'text-slate-500 dark:text-slate-500' },
  
  // Borders
  { regex: /\bborder-slate-800(\/\d+)?\b/g, replacement: (match) => `border-slate-200 dark:${match}` },
  { regex: /\bborder-slate-700(\/\d+)?\b/g, replacement: (match) => `border-slate-200 dark:${match}` },
  { regex: /\bborder-slate-600(\/\d+)?\b/g, replacement: (match) => `border-slate-300 dark:${match}` },
];

function processDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (file.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      // Skip ThemeContext and index.css as they are already handled manually
      if (file === 'ThemeContext.jsx' || file === 'index.css') return;

      // First check if this file already has dark: classes (to prevent double replacing if run multiple times)
      if (content.includes('dark:bg-') || content.includes('dark:text-') || content.includes('dark:border-')) {
        // Skip files that seem already processed to avoid corruption
        console.log(`Skipping already processed file: ${file}`);
        return;
      }

      replacements.forEach(({ regex, replacement }) => {
        if (regex.test(content)) {
          // Reset lastIndex just in case
          regex.lastIndex = 0;
          content = content.replace(regex, typeof replacement === 'function' ? replacement : replacement);
          modified = true;
        }
      });

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath.replace(__dirname, '')}`);
      }
    }
  });
}

targetDirs.forEach(dir => processDirectory(dir));
console.log('Theme update script completed.');
