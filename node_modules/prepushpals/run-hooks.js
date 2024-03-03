const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
function getGitRoot() {
    return execSync('git rev-parse --show-toplevel').toString().trim();
}

const projectRoot = getGitRoot();

// Function to check if a package is installed
function isPackageInstalled(packageName) {
    try {
        execSync(`npm list ${packageName} --depth=0`, { stdio: 'ignore', cwd: projectRoot });
        return true; // No error means the package is installed
    } catch (error) {
        return false; // Error means the package is not installed
    }
}

// Function to ensure a package is installed
function ensurePackageInstalled(packageName) {
    if (!isPackageInstalled(packageName)) {
        console.log(`${packageName} is not installed. Installing at project root...`);
        execSync(`npm install ${packageName}`, { stdio: 'inherit', cwd: projectRoot });
    } else {
        console.log(`${packageName} is already installed at the project root.`);
    }
}

function copyFile(source, destination) {
    fs.copyFileSync(source, destination);
    console.log(`Copied ${source} to ${destination}`);
}

// Now let's require the config from the user's project root
const configPath = path.join(projectRoot, '.hookconfig.json');
const config = require(configPath);

config.checks.forEach(check => {
    try {
        if (check === 'eslint') {
            // Ensure ESLint is installed at the user's project root
            ensurePackageInstalled('eslint');

            const projectESLintConfigPath = path.join(projectRoot, '.eslintrc.js');
            const ESLintConfigPath = path.join(projectRoot, 'node_modules', 'prepushpals', 'config', '.eslintrc.js')
            copyFile(ESLintConfigPath, projectESLintConfigPath);
            execSync('eslint --fix .', { stdio: 'inherit', cwd: projectRoot });
        } else if (check === 'prettier') {
            // Ensure Prettier is installed at the user's project root
            ensurePackageInstalled('prettier');

            const projectPrettierConfigPath = path.join(projectRoot, '.prettierrc');
            if (!fs.existsSync(projectPrettierConfigPath)) {
                const prettierConfigPath = path.join(projectRoot, 'node_modules', 'prepushpals', 'config', '.prettierrc')
                copyFile(prettierConfigPath, projectPrettierConfigPath);
            }

            execSync('prettier --write .', { stdio: 'inherit', cwd: projectRoot });
        }
        // Add additional checks here
    } catch (error) {
        console.error(`Error during ${check}: ${error}`);
        process.exit(1);
    }
});
