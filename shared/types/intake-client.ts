// Shared intake types for Staff & Client consistency
// Re-export from client implementation to maintain type consistency

export type {
  IntakeAnswers,
  RecommendedProduct,
  RequiredDocsResult,
  DedupeRunResult
} from '../../client/src/lib/intake-client';

export {
  formatCurrencyRange,
  getRecommendations,
  getRequiredDocs,
  dedupeRecommended,
  collapseVisualVariants,
  runDedupe,
  rebuildCatalogIfSupported,
  confirmClientIntegration,
  missingFieldsForStep2,
  step2RecommendFlow,
  step5DocsFlow,
  finalizeCleanupAndRebuild,
  CLIENT_OPEN_QUESTIONS
} from '../../client/src/lib/intake-client';