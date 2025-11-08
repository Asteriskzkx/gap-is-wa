#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
// @svgr/core exports differ between ESM and CJS; prefer the transform function if available.
const _svgrCore = require("@svgr/core");
const svgr = _svgrCore.transform || _svgrCore.default || _svgrCore;

function usage() {
  console.log(
    "Usage: node scripts/svg-to-icons.js <svg-file-or-folder> [outDir]"
  );
  process.exit(1);
}

const input = process.argv[2];
if (!input) usage();

const outDir = process.argv[3] || path.join("src", "components", "icons");

function pascalCase(str) {
  return str
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");
}

function componentNameFromFile(file) {
  const name = path.basename(file, ".svg");
  // remove trailing size/style pattern like _24dp_... or _24dp
  const m = name.match(/^(.*?)(?:_\d+dp.*)?$/i);
  const base = m && m[1] ? m[1] : name;
  const comp = pascalCase(base);
  return comp.endsWith("Icon") ? comp : comp + "Icon";
}

function walkDir(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      walkDir(full, fileList);
    } else if (ent.isFile() && full.toLowerCase().endsWith(".svg")) {
      fileList.push(full);
    }
  }
  return fileList;
}

async function transformOne(svgPath, destDir) {
  const svg = fs.readFileSync(svgPath, "utf8");
  const componentName = componentNameFromFile(svgPath);
  // basic svgr transform
  const code = await svgr(
    svg,
    {
      icon: true,
      typescript: true,
      replaceAttrValues: { "#000": "currentColor" },
      prettier: true,
      svgo: true,
    },
    { componentName }
  );

  // svgr normally returns a JS/TS component string that contains 'export default'.
  // But in some edge cases it may return raw SVG markup (starts with '<svg').
  // If we get raw SVG, wrap it into a TSX component ourselves so outputs are consistent.
  let outCode = code;
  if (typeof outCode === "string" && outCode.trim().startsWith("<")) {
    const raw = outCode.trim();
    const m = raw.match(/^<svg([^>]*)>([\s\S]*?)<\/svg>$/i);
    const attrs = m ? m[1] : "";
    let inner = m ? m[2] : raw;

    // preserve viewBox if present
    const viewBoxMatch = attrs.match(/viewBox\s*=\s*"([^"]+)"/i);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : null;

    // normalize fills inside inner markup to currentColor
    inner = inner.replace(
      /fill=\"#([0-9a-fA-F]{3,6})\"/g,
      'fill="currentColor"'
    );

    outCode = `import React from "react";
\ntype ${componentName}Props = Readonly<React.SVGProps<SVGSVGElement>>;
\nexport default function ${componentName}(props: ${componentName}Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={props?.className || "h-6 w-6"}
      ${viewBox ? `viewBox=\"${viewBox}\"` : ""}
      fill="currentColor"
      {...props}
    >
${inner}
    </svg>
  );
}
`;
  }

  // convert svgr's output to project style
  let out = outCode;
  // make default React import style
  out = out.replace(
    /import \* as React from \"react\";?/,
    'import React from "react";'
  );
  // inject a typed props alias for consistency (e.g. 'type XProps = Readonly<React.SVGProps<SVGSVGElement>>;')
  // only if not already present
  if (!new RegExp(`type\\s+${componentName}Props`).test(out)) {
    out = out.replace(
      /import React from "react";/,
      `import React from "react";\n\ntype ${componentName}Props = Readonly<React.SVGProps<SVGSVGElement>>;`
    );
  }
  // remove separate SVGProps import if present
  out = out.replace(/import\s+\{\s*SVGProps[^;]+;?\}/, "");

  // change functional expression to named default function and use React.SVGProps typing
  const fnExpr = new RegExp(
    `const\\s+${componentName}\\s*=\\s*\\(props: \\w+<SVGSVGElement>\\)\\s*=>\\s*\\(`
  );
  if (fnExpr.test(out)) {
    out = out.replace(
      fnExpr,
      `export default function ${componentName}(props: ${componentName}Props) { return (`
    );
    // remove trailing ');\n};' pattern -> ');\n}'
    out = out.replace(/\)\;\n\};\n?$/s, ");\n}");
  } else {
    // fallback: replace arrow export default
    out = out.replace(
      /export default function\s+?\w+\([^\)]*\)\s*\{/,
      `export default function ${componentName}(props: ${componentName}Props) {`
    );
  }

  // ensure className default exists: insert className attr before {...props} if not present
  if (!/className=/.test(out)) {
    out = out.replace(/<svg([^>]*?)\{\.\.\.props\}/, (m, g1) => {
      return `<svg${g1}className={props?.className || \"h-6 w-6\"} {...props}`;
    });
  }

  // Ensure output directory exists
  fs.mkdirSync(destDir, { recursive: true });
  const outPath = path.join(destDir, `${componentName}.tsx`);
  fs.writeFileSync(outPath, out, "utf8");
  console.log(`Wrote ${outPath}`);
  return componentName;
}

async function main() {
  const absInput = path.resolve(input);
  const target = path.resolve(outDir);
  let svgs = [];
  if (!fs.existsSync(absInput)) {
    console.error("Input does not exist:", absInput);
    process.exit(2);
  }
  const stats = fs.statSync(absInput);
  if (stats.isDirectory()) {
    svgs = walkDir(absInput);
  } else if (stats.isFile() && absInput.toLowerCase().endsWith(".svg")) {
    svgs = [absInput];
  } else {
    console.error(
      "Input must be an .svg file or a folder containing .svg files"
    );
    process.exit(3);
  }

  const generated = [];
  for (const f of svgs) {
    try {
      const name = await transformOne(f, target);
      generated.push(name);
    } catch (err) {
      console.error("Failed to convert", f, err);
    }
  }

  // update index.js in target dir
  const files = fs.readdirSync(target).filter((x) => x.endsWith(".tsx"));
  const exports = files
    .map((f) => path.basename(f, ".tsx"))
    .sort()
    .map((name) => `export { default as ${name} } from "./${name}";`);
  const indexPath = path.join(target, "index.js");
  fs.writeFileSync(indexPath, exports.join("\n") + "\n", "utf8");
  console.log(`Updated ${indexPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(10);
});
