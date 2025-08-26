// Shared intake types for Staff & Client consistency
// Re-export from client implementation to maintain type consistency

export type {
  IntakeAnswers,
  RecommendedProduct,
  RequiredDocsResult,
  DedupeRunResult
} from '../../client/src/lib/intake-client';

export {
  OPEN_QUESTIONS,
  getRecommendations,
  getRequiredDocs,
  dedupeRecommended,
  collapseVisualVariants,
  runEndOfFlowCleanup,
  useAsk,
  step2Flow,
  step5Flow,
  finalizeFlow
} from '../../client/src/lib/intake-client';