/**
 * patternLoader.js - Load test patterns from JSON files on disk
 */

const fs = require('fs');
const path = require('path');

const PATTERNS_DIR = path.join(__dirname, '..', 'data', 'patterns');

/**
 * Load all patterns from disk
 * @returns {object} Map of patternId -> pattern object
 */
function loadAllPatterns() {
  const patterns = {};

  try {
    if (!fs.existsSync(PATTERNS_DIR)) {
      console.warn(`[patternLoader] Patterns directory not found: ${PATTERNS_DIR}`);
      return patterns;
    }

    const files = fs.readdirSync(PATTERNS_DIR).filter(f => f.endsWith('.json'));
    console.log(`[patternLoader] Found ${files.length} pattern files`);

    for (const file of files) {
      const filePath = path.join(PATTERNS_DIR, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const pattern = JSON.parse(content);
        patterns[pattern.id] = pattern;
        console.log(`[patternLoader] Loaded pattern: ${pattern.id} (${pattern.company})`);
      } catch (err) {
        console.error(`[patternLoader] Error loading ${file}:`, err.message);
      }
    }
  } catch (err) {
    console.error(`[patternLoader] Error reading patterns directory:`, err.message);
  }

  return patterns;
}

/**
 * Get a single pattern by id
 * @param {string} patternId - Pattern ID
 * @returns {object|null} Pattern object or null if not found
 */
function getPattern(patternId) {
  const patterns = loadAllPatterns();
  return patterns[patternId] || null;
}

/**
 * Get all patterns as a list (for UI listing)
 * @returns {array} List of pattern summaries
 */
function listPatterns() {
  const patterns = loadAllPatterns();
  return Object.values(patterns).map(p => ({
    id: p.id,
    company: p.company,
    name: p.name,
    description: p.description,
    timeLimitSeconds: p.timeLimitSeconds,
    totalQuestions: p.totalQuestions,
    sections: p.sections.map(s => ({
      topic: s.topic,
      count: s.count
    }))
  }));
}

module.exports = { loadAllPatterns, getPattern, listPatterns };
