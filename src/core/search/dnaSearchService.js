const CONFIDENCE_WEIGHT = {
  High: 3,
  Medium: 2,
  Low: 1,
}

export const DNA_MARKERS = [
  {
    marker: 'BRCA1',
    category: 'Risk',
    confidence: 'High',
    chromosome: '17',
    impactScore: 93,
    clinical: true,
    tags: ['breast', 'ovarian', 'repair'],
    description: 'Associated with hereditary breast and ovarian cancer risk profile.',
  },
  {
    marker: 'APOE',
    category: 'Neurology',
    confidence: 'High',
    chromosome: '19',
    impactScore: 88,
    clinical: true,
    tags: ['lipids', 'neuro', 'alzheimer'],
    description: 'Impacts lipid transport and long-term neurodegenerative risk context.',
  },
  {
    marker: 'MTHFR',
    category: 'Metabolism',
    confidence: 'Medium',
    chromosome: '1',
    impactScore: 71,
    clinical: false,
    tags: ['folate', 'homocysteine', 'methylation'],
    description: 'Linked to folate metabolism efficiency and methylation balance.',
  },
  {
    marker: 'CYP2C19',
    category: 'Drug Response',
    confidence: 'High',
    chromosome: '10',
    impactScore: 86,
    clinical: true,
    tags: ['pharmacogenomics', 'clopidogrel', 'metabolism'],
    description: 'Affects metabolism rates for several drug classes.',
  },
  {
    marker: 'F5',
    category: 'Risk',
    confidence: 'Medium',
    chromosome: '1',
    impactScore: 79,
    clinical: true,
    tags: ['clotting', 'thrombosis', 'factor-v'],
    description: 'Variant patterns can increase thrombosis tendency.',
  },
  {
    marker: 'CYP1A2',
    category: 'Drug Response',
    confidence: 'Low',
    chromosome: '15',
    impactScore: 58,
    clinical: false,
    tags: ['caffeine', 'detox', 'metabolism'],
    description: 'Related to caffeine and xenobiotic metabolism speed.',
  },
  {
    marker: 'HLA-B',
    category: 'Immunology',
    confidence: 'High',
    chromosome: '6',
    impactScore: 91,
    clinical: true,
    tags: ['immunity', 'drug-hypersensitivity', 'hla'],
    description: 'Certain alleles correlate with immune drug-response risk.',
  },
  {
    marker: 'LCT',
    category: 'Nutrition',
    confidence: 'Medium',
    chromosome: '2',
    impactScore: 62,
    clinical: false,
    tags: ['lactose', 'digestion', 'diet'],
    description: 'Used in lactose tolerance interpretation models.',
  },
]

export function getDnaFilterOptions(markers = DNA_MARKERS) {
  const categories = [...new Set(markers.map((marker) => marker.category))].sort()
  const confidenceLevels = [...new Set(markers.map((marker) => marker.confidence))]
  const chromosomes = [...new Set(markers.map((marker) => marker.chromosome))].sort((left, right) => {
    const leftAsNumber = Number(left)
    const rightAsNumber = Number(right)
    if (!Number.isNaN(leftAsNumber) && !Number.isNaN(rightAsNumber)) {
      return leftAsNumber - rightAsNumber
    }
    return left.localeCompare(right)
  })

  return {
    categories,
    confidenceLevels,
    chromosomes,
  }
}

function getQueryMatchScore(marker, query) {
  if (!query) {
    return 0
  }

  const normalizedQuery = query.toLowerCase()
  let score = 0

  if (marker.marker.toLowerCase().includes(normalizedQuery)) {
    score += 3
  }
  if (marker.category.toLowerCase().includes(normalizedQuery)) {
    score += 2
  }
  if (marker.description.toLowerCase().includes(normalizedQuery)) {
    score += 1
  }
  if (marker.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))) {
    score += 2
  }

  return score
}

export function filterDnaMarkers(markers, filters) {
  const {
    query,
    category,
    confidence,
    chromosome,
    clinicalOnly,
    minImpactScore,
    sortBy,
  } = filters

  const normalizedQuery = query.trim().toLowerCase()

  const filtered = markers
    .map((marker) => ({
      ...marker,
      matchScore: getQueryMatchScore(marker, normalizedQuery),
    }))
    .filter((marker) => {
      if (normalizedQuery && marker.matchScore === 0) {
        return false
      }
      if (category !== 'All' && marker.category !== category) {
        return false
      }
      if (confidence !== 'All' && marker.confidence !== confidence) {
        return false
      }
      if (chromosome !== 'All' && marker.chromosome !== chromosome) {
        return false
      }
      if (clinicalOnly && !marker.clinical) {
        return false
      }
      if (marker.impactScore < minImpactScore) {
        return false
      }
      return true
    })

  const sorted = [...filtered].sort((left, right) => {
    if (sortBy === 'impact') {
      return right.impactScore - left.impactScore
    }
    if (sortBy === 'confidence') {
      return CONFIDENCE_WEIGHT[right.confidence] - CONFIDENCE_WEIGHT[left.confidence]
    }
    if (sortBy === 'marker') {
      return left.marker.localeCompare(right.marker)
    }

    // relevance sort
    if (right.matchScore !== left.matchScore) {
      return right.matchScore - left.matchScore
    }
    return right.impactScore - left.impactScore
  })

  return sorted
}
