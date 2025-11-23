/**
 * Recursively collect confidence values from the Vision API annotation tree
 * @param {Object} node - Any node in the annotation tree that may contain confidence
 * @param {Array<number>} confidences - Collected confidence values
 */
function collectConfidenceValues(node, confidences) {
  if (!node || typeof node !== 'object') {
    return;
  }

  if (typeof node.confidence === 'number') {
    confidences.push(node.confidence);
  }

  const childCollections = [
    node.pages,
    node.blocks,
    node.paragraphs,
    node.words,
    node.symbols,
  ];

  childCollections.forEach((collection) => {
    if (Array.isArray(collection)) {
      collection.forEach((child) => collectConfidenceValues(child, confidences));
    }
  });
}

/**
 * Calculate overall confidence score using the values returned by Google Cloud Vision
 * @param {Object} fullTextAnnotation - fullTextAnnotation object from Vision API
 * @returns {number} Average confidence score (0-1)
 */
function calculateConfidence(fullTextAnnotation) {
  if (!fullTextAnnotation) {
    return 0;
  }

  const confidences = [];
  collectConfidenceValues(fullTextAnnotation, confidences);

  if (confidences.length === 0) {
    return 0;
  }

  const total = confidences.reduce((sum, value) => sum + value, 0);
  return total / confidences.length;
}

/**
 * Round confidence to 2 decimal places
 * @param {number} confidence - Confidence score
 * @returns {number} Rounded confidence score
 */
function roundConfidence(confidence) {
  return Math.round(confidence * 100) / 100;
}

module.exports = {
  calculateConfidence,
  roundConfidence,
};


