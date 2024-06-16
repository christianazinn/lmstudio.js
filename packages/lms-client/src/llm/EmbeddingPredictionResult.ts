import { type LLMDescriptor } from "@lmstudio/lms-shared-types";

/**
 * Represents the result of an embeddings prediction.
 *
 * The most notably property is {@link EmbeddingPredictionResult#content}, which contains the generated text.
 * Additionally, the {@link EmbeddingPredictionResult#stats} property contains statistics about the
 * prediction.
 *
 * @public
 */
export class EmbeddingPredictionResult {
  public constructor(
    /**
     * The newly generated embedding vectors as predicted by the LLM.
     */
    public readonly content: ReadonlyArray<Array<number>>,
    /**
     * Information about the model used for the prediction.
     */
    public readonly modelInfo: LLMDescriptor,
  ) { }
}
