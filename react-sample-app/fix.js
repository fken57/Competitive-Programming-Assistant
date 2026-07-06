const fs = require('fs');
const path = require('path');

const fixImports = (content) => {
    return content
        .replace(/'\.\.\/\.\.\/common/g, "'../../../common")
        .replace(/'\.\.\/\.\.\/\.\.\/hooks/g, "'../../../../hooks")
        .replace(/'\.\.\/\.\.\/\.\.\/util/g, "'../../../../util")
        .replace(/'\.\.\/GraphVisualizer/g, "'../../GraphVisualizer");
};

// Process tracked files that we restored
const baseDir = 'src/components/Graph/Algorithm';

const filesToMove = [
    { src: 'BFS.tsx', dest: 'UnorderedUnweighted/BFS.tsx' },
    { src: 'BFS.css', dest: 'UnorderedUnweighted/BFS.css' },
    { src: 'IsBinaryTree.tsx', dest: 'UnorderedUnweighted/IsBinaryTree.tsx' },
    { src: 'IsBinaryTree.css', dest: 'UnorderedUnweighted/IsBinaryTree.css' },
    { src: 'UnweightedOrdered.tsx', dest: 'OrderedUnweighted/UnweightedOrdered.tsx' },
    { src: 'UnweightedOrdered.css', dest: 'OrderedUnweighted/UnweightedOrdered.css' },
    { src: 'UnweightedUnordered.tsx', dest: 'UnorderedUnweighted/UnweightedUnordered.tsx' },
    { src: 'UnweightedUnordered.css', dest: 'UnorderedUnweighted/UnweightedUnordered.css' },
];

filesToMove.forEach(({ src, dest }) => {
    const srcPath = path.join(baseDir, src);
    const destPath = path.join(baseDir, dest);
    if (fs.existsSync(srcPath)) {
        let content = fs.readFileSync(srcPath, 'utf8');
        if (src.endsWith('.tsx')) {
            content = fixImports(content);
        }
        if (dest === 'OrderedUnweighted/UnweightedOrdered.tsx') {
            content = content.replace("'./BFS'", "'../UnorderedUnweighted/BFS'")
                             .replace("'./UnweightedUnordered.css'", "'./UnweightedOrdered.css'");
        }
        fs.writeFileSync(destPath, content, 'utf8');
        fs.unlinkSync(srcPath); // remove original
    }
});
