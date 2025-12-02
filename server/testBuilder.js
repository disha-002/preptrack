/**
 * testBuilder.js - Test generation logic
 * Builds a test from a pattern by fetching questions from the database by topic/difficulty
 */

/**
 * Builds a test from a pattern by selecting random questions per section with fallbacks
 * @param {object} db - MongoDB database connection
 * @param {object} pattern - Test pattern with sections and rules
 * @param {string} company - Company name (optional, for company-specific filtering)
 * @returns {array} Array of client-safe question objects (without correctAnswer/explanation)
 */
async function buildTestFromPattern(db, pattern, company = null) {
  const qCol = db.collection('questions');
  const selected = [];
  const usedIds = new Set();

  console.log(`[buildTestFromPattern] Building test for pattern: ${pattern.id} (${pattern.company})`);

  for (const section of pattern.sections) {
    let need = section.count || 0;
    console.log(`[Section] ${section.topic}: need ${need} questions`);

    // Build base filter: map topic to category (our questions use 'category' field)
    const baseFilter = { category: section.topic };
    if (section.difficulty) {
      baseFilter.difficulty = section.difficulty;
    }
    if (section.tags && section.tags.length > 0) {
      baseFilter.tags = { $in: section.tags };
    }

    // Try to gather questions with fallback logic
    let gathered = await gatherQuestionsForSection(
      qCol,
      baseFilter,
      need,
      pattern.rules,
      usedIds,
      section
    );

    console.log(`[Section] ${section.topic}: gathered ${gathered.length} questions (need was ${need})`);

    // Convert to client-safe format and add to selected
    for (const q of gathered) {
      if (!usedIds.has(String(q._id))) {
        usedIds.add(String(q._id));
        selected.push({
          id: String(q._id),
          text: q.text,
          choices: q.choices,
          category: q.category,
          difficulty: q.difficulty,
          tags: q.tags,
          company: q.company
          // Do NOT include correctAnswer or explanation
        });
      }
    }
  }

  console.log(`[buildTestFromPattern] Final test has ${selected.length} questions`);
  return selected;
}

/**
 * Helper function to gather questions for a section with fallback strategy
 */
async function gatherQuestionsForSection(qCol, baseFilter, need, rules, usedIds, section) {
  let result = [];

  // Attempt 1: exact match (base filter as-is)
  let filter = { ...baseFilter };
  let docs = await sampleQuestions(qCol, filter, need);
  docs = docs.filter(d => !usedIds.has(String(d._id)));
  result = docs.slice(0, need);

  if (result.length >= need) {
    console.log(`  [${section.topic}] Got ${result.length} with exact match`);
    return result;
  }

  // Attempt 2: relax tags if present and fallback enabled
  if (section.tags && section.tags.length > 0 && rules && rules.fallback && rules.fallback.relaxTags) {
    const relaxedFilter = { category: section.topic };
    if (section.difficulty) relaxedFilter.difficulty = section.difficulty;
    // Remove tags constraint

    let moreDocs = await sampleQuestions(qCol, relaxedFilter, need * 2);
    for (const d of moreDocs) {
      if (!usedIds.has(String(d._id)) && !result.find(r => String(r._id) === String(d._id))) {
        result.push(d);
        if (result.length >= need) {
          console.log(`  [${section.topic}] Got ${result.length} after relaxing tags`);
          return result.slice(0, need);
        }
      }
    }
  }

  // Attempt 3: relax difficulty if fallback enabled
  if (rules && rules.fallback && rules.fallback.relaxDifficulty) {
    const relaxedFilter = { category: section.topic };
    // Remove difficulty constraint (keep tags if present)
    if (section.tags && section.tags.length > 0) {
      relaxedFilter.tags = { $in: section.tags };
    }

    let moreDocs = await sampleQuestions(qCol, relaxedFilter, need * 3);
    for (const d of moreDocs) {
      if (!usedIds.has(String(d._id)) && !result.find(r => String(r._id) === String(d._id))) {
        result.push(d);
        if (result.length >= need) {
          console.log(`  [${section.topic}] Got ${result.length} after relaxing difficulty`);
          return result.slice(0, need);
        }
      }
    }
  }

  // Attempt 4: just pull from topic (no other constraints)
  if (result.length < need) {
    const topicOnlyFilter = { category: section.topic };
    let moreDocs = await sampleQuestions(qCol, topicOnlyFilter, need * 4);
    for (const d of moreDocs) {
      if (!usedIds.has(String(d._id)) && !result.find(r => String(r._id) === String(d._id))) {
        result.push(d);
        if (result.length >= need) {
          console.log(`  [${section.topic}] Got ${result.length} from topic only`);
          return result.slice(0, need);
        }
      }
    }
  }

  if (result.length < need) {
    console.warn(`  [${section.topic}] Warning: only ${result.length}/${need} questions found`);
  }

  return result.slice(0, Math.max(need, result.length));
}

/**
 * Sample random documents from a collection matching a filter
 */
async function sampleQuestions(qCol, filter, sampleSize) {
  try {
    const pipeline = [{ $match: filter }, { $sample: { size: Math.min(sampleSize, 100) } }];
    const docs = await qCol.aggregate(pipeline).toArray();
    return docs;
  } catch (err) {
    console.error('Error sampling questions:', err);
    return [];
  }
}

module.exports = { buildTestFromPattern };
