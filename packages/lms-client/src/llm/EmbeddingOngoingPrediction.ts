import { StreamablePromise } from "@lmstudio/lms-common";
import {
  type LLMDescriptor,
} from "@lmstudio/lms-shared-types";
import { EmbeddingPredictionResult } from "./EmbeddingPredictionResult";

/**
 * Represents an ongoing prediction.
 *
 * Note, this class is Promise-like, meaning you can use it as a promise. It resolves to a
 * {@link EmbeddingPredictionResult}, which contains the generated text in the `.content` property. Example
 * usage:
 *
 * ```typescript
 * const result = await model.complete("When will The Winds of Winter be released?");
 * console.log(result.content);
 * ```
 *
 * Or you can use instances methods like `then` and `catch` to handle the result or error of the
 * prediction.
 *
 * ```typescript
 * model.complete("When will The Winds of Winter be released?")
 *  .then(result =\> console.log(result.content))
 *  .catch(error =\> console.error(error));
 * ```
 *
 * Alternatively, you can also stream the result (process the results as more content is being
 * generated). For example:
 *
 * ```typescript
 * for await (const fragment of model.complete("When will The Winds of Winter be released?")) {
 *   process.stdout.write(fragment);
 * }
 * ```
 *
 * @public
 */
export class EmbeddingOngoingPrediction extends StreamablePromise<Array<number>, EmbeddingPredictionResult> {
  private modelInfo: LLMDescriptor | null = null;

  protected override async collect(fragments: ReadonlyArray<Array<number>>): Promise<EmbeddingPredictionResult> {
    if (this.modelInfo === null) {
      throw new Error("Model info should not be null");
    }
    return new EmbeddingPredictionResult(fragments, this.modelInfo);
  }

  private constructor(private readonly onCancel: () => void) {
    super();
  }

  /** @internal */
  public static create(onCancel: () => void) {
    const ongoingPrediction = new EmbeddingOngoingPrediction(onCancel);
    const finished = (modelInfo: LLMDescriptor) => {
      ongoingPrediction.modelInfo = modelInfo;
      ongoingPrediction.finished();
    };
    const failed = (error?: any) => ongoingPrediction.finished(error);
    const push = (fragment: Array<number>) => ongoingPrediction.push(fragment);
    return { ongoingPrediction, finished, failed, push };
  }

  /**
   * Get the final prediction results. If you have been streaming the results, awaiting on this
   * method will take no extra effort, as the results are already available in the internal buffer.
   *
   * Example:
   *
   * ```typescript
   * const prediction = model.complete("When will The Winds of Winter be released?");
   * for await (const fragment of prediction) {
   *   process.stdout.write(fragment);
   * }
   * const result = await prediction.result();
   * console.log(result.stats);
   * ```
   *
   * Technically, awaiting on this method is the same as awaiting on the instance itself:
   *
   * ```typescript
   * await prediction.result();
   *
   * // Is the same as:
   *
   * await prediction;
   * ```
   */
  public async result(): Promise<EmbeddingPredictionResult> {
    return await this;
  }

  /**
   * Cancels the prediction. This will stop the prediction with stop reason `userStopped`. See
   * {@link LLMPredictionStopReason} for other reasons that a prediction might stop.
   */
  public async cancel() {
    this.onCancel();
  }
}
