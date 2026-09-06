window.BLOG_FLASHCARDS = {
  "the-vlm-architecture-gallery": {
    title: "The VLM Architecture Gallery",
    readTime: "5 min",
    summary: "A compact map of how vision-language models turn pixels into tokens, connect vision to language, and spend compute across the two modalities.",
    framework: ["Separate the vision encoder, connector, and language model", "Track where and how visual tokens enter the sequence", "Compare capability against token and training cost"],
    takeaway: "Most VLM architectures are variations on a small set of interfaces. Compare interfaces and information bottlenecks, not model names.",
    cards: [
      ["What are the main ways to connect vision and language?", "Encode pixels separately, then use a projection, cross-attention, a query module, or early unified tokenization to connect them to the language model."],
      ["Which axes make two VLMs meaningfully different?", "Vision encoder, connector, fusion depth, token count, resolution strategy, training stages, and whether the language backbone is frozen or updated."],
      ["Why do visual-token budgets matter so much?", "Attention and KV-cache costs grow with sequence length. More visual tokens preserve detail, but they consume training, prefill, and serving capacity."],
      ["How should I read an unfamiliar VLM diagram?", "Follow one image from pixels to patches to visual features to connector output. Then ask where language first sees those features and which losses train each boundary."]
    ]
  },
  "the-agent-evaluation-playbook": {
    title: "The Agent Evaluation Playbook",
    readTime: "4 min",
    summary: "Evaluate agents as state-changing systems: inspect outcomes, trajectories, reliability, safety, and cost—not just the final sentence.",
    framework: ["Define the world state that should change", "Grade both the outcome and the path taken", "Measure reliability under repeated, adversarial runs"],
    takeaway: "An agent succeeds only when the external world ends in the right state under acceptable cost and risk. Fluent prose is weak evidence.",
    cards: [
      ["What is the right unit of agent evaluation?", "A task episode: initial state, observations, actions, tool results, final state, elapsed time, cost, and policy violations."],
      ["Why is final-answer accuracy insufficient?", "An agent can state the right answer while failing to perform the action, corrupting state, using forbidden tools, or succeeding only by luck."],
      ["How should partial success be scored?", "Use explicit state predicates and milestones. Award credit for verified subgoals, while keeping safety violations and irreversible damage as separate dimensions."],
      ["Why run the same task more than once?", "Agent behavior is stochastic and long horizons compound errors. Pass rates, pass@k, worst-case failures, and cost distributions reveal what one run hides."]
    ]
  },
  "what-autograd-actually-does": {
    title: "What Autograd Actually Does",
    readTime: "4 min",
    summary: "Autograd records local operations, saves what backward will need, and applies reverse-mode chain rule to turn one loss into many parameter gradients.",
    framework: ["Treat the program as a graph of local functions", "Send an adjoint backward through each local derivative", "Trade saved activations against recomputation"],
    takeaway: "Autograd never forms one giant Jacobian. It composes local vector–Jacobian products backward because the output is scalar and the parameter vector is enormous.",
    cards: [
      ["How can one loss produce billions of gradients efficiently?", "Reverse-mode differentiation reuses shared downstream work. A forward pass records the graph; one backward sweep accumulates every parameter’s contribution."],
      ["What exactly moves backward through the graph?", "An adjoint: the derivative of the final loss with respect to each intermediate value. Each operation converts its output adjoint into input adjoints."],
      ["Why does autograd save tensors?", "Local backward formulas need forward values such as inputs, outputs, masks, or statistics. Saved tensors avoid repeating the forward computation."],
      ["What does activation checkpointing change?", "It saves fewer intermediate tensors and reruns selected forward regions during backward. Memory falls; compute and wall time rise."]
    ]
  },
  "why-transformers-do-not-explode": {
    title: "Why Transformers Do Not Explode",
    readTime: "4 min",
    summary: "Transformer stability comes from controlling variance through initialization, residual paths, normalization placement, update size, and numerical precision.",
    framework: ["Track signal variance through every transform", "Keep a clean residual route for information and gradients", "Bound both optimizer updates and numerical range"],
    takeaway: "No single trick stabilizes a deep transformer. Stability is an end-to-end budget for signal scale across depth, time, and finite-precision arithmetic.",
    cards: [
      ["Why can stacking ordinary layers make signals explode or vanish?", "Each layer rescales variance. Repeated multipliers compound exponentially unless initialization and normalization keep the expected scale near one."],
      ["What makes the residual stream special?", "It is the model’s long-lived information highway. Residual additions must remain well-scaled so new transformations refine the stream instead of overwhelming it."],
      ["Why is pre-normalization usually easier to train deeply?", "It gives each sublayer a controlled input while leaving an identity gradient path through the residual connection. Post-norm makes that path pass through normalization."],
      ["Where can training still become unstable?", "Oversized learning rates, sharp loss spikes, poorly scaled residual branches, attention-logit growth, and fp16 overflow can break an otherwise sound architecture."]
    ]
  },
  "choosing-the-next-token": {
    title: "Choosing the Next Token",
    readTime: "4 min",
    summary: "The model supplies a probability distribution; a decoder turns it into behavior through temperature, truncation, search, penalties, and constraints.",
    framework: ["Start from logits and the probability distribution", "Choose how much uncertainty to preserve", "Add search or constraints only for the task’s objective"],
    takeaway: "Decoding is a decision policy layered on top of a learned distribution. There is no universally best decoder because creativity, likelihood, correctness, and latency are different objectives.",
    cards: [
      ["What does the language model output at each step?", "One logit per vocabulary token. Softmax converts the logits into a conditional probability distribution for the next token."],
      ["What does temperature actually do?", "It divides logits before softmax. Lower temperature sharpens probability gaps; higher temperature flattens them and raises diversity."],
      ["How do top-k and top-p differ?", "Top-k keeps a fixed number of candidates. Top-p keeps the smallest set whose cumulative probability reaches a threshold, adapting to the distribution’s confidence."],
      ["When is greedy decoding the wrong default?", "When multiple continuations are valid, early choices need recovery, diversity matters, or a verifier can judge several candidates better than the model can choose locally."]
    ]
  },
  "teaching-a-language-model-to-follow-instructions": {
    title: "Teaching a Language Model to Follow Instructions",
    readTime: "4 min",
    summary: "Supervised fine-tuning turns a next-token predictor into an assistant by training on demonstrations of desired conversational behavior.",
    framework: ["Define the behavior through demonstrations", "Apply loss only where the assistant should learn", "Test distribution shift beyond the demonstration set"],
    takeaway: "SFT is behavior cloning, not a new objective. Its power and limits come from the coverage, consistency, and weighting of the demonstrations.",
    cards: [
      ["Why does a pretrained model need supervised fine-tuning?", "Pretraining learns language and knowledge, but not a stable interaction contract. SFT concentrates probability on helpful response formats, refusals, tool calls, and task procedures."],
      ["Is the SFT loss different from pretraining loss?", "Usually no. Both use next-token cross-entropy; what changes is the curated data distribution, conversation format, and which tokens receive loss."],
      ["Why mask user and system tokens from the loss?", "The model should condition on those tokens, not learn to imitate them as assistant output. Loss masking focuses updates on the desired response."],
      ["What can SFT not solve by itself?", "It struggles beyond demonstrated behavior, cannot directly optimize outcome-level success, and may imitate mistakes or verbosity present in the training data."]
    ]
  },
  "how-lora-changes-a-model-without-rewriting-it": {
    title: "How LoRA Changes a Model Without Rewriting It",
    readTime: "4 min",
    summary: "LoRA freezes the base model and learns a low-rank update to selected weight matrices, cutting trainable state without changing the basic computation.",
    framework: ["Write adaptation as base weights plus an update", "Factor the update through a small rank", "Place limited rank where it buys the most behavior change"],
    takeaway: "LoRA saves optimizer and gradient memory because it restricts the update space. It does not make the frozen base weights disappear from forward and backward computation.",
    cards: [
      ["What mathematical change does LoRA make?", "It replaces a learned full update with a product of two thin matrices: the effective weight is the frozen base weight plus a scaled low-rank delta."],
      ["Why can a low-rank update be enough?", "Fine-tuning often needs a structured behavioral shift rather than a wholly new model. Useful update directions occupy a much smaller subspace than the full parameter matrix."],
      ["What memory does LoRA actually save?", "It sharply reduces trainable gradients and optimizer states. The base weights and many activations are still needed, so total memory does not fall in direct proportion to trainable parameters."],
      ["How does QLoRA extend the idea?", "It stores the frozen base model in a low-bit format while training LoRA adapters in higher precision, reducing base-weight memory without quantizing the learned update path as aggressively."]
    ]
  },
  "inside-an-ai-agent-harness": {
    title: "Inside an AI Agent Harness",
    readTime: "4 min",
    summary: "The harness turns a stateless model call into a controlled system by assembling context, executing actions, recording state, verifying effects, and enforcing limits.",
    framework: ["Make state explicit and append observations", "Expose narrow, typed actions", "Verify effects and contain every side effect"],
    takeaway: "The model proposes actions; the harness owns reality. Reliability comes from the machinery around the model that controls state, authority, feedback, and recovery.",
    cards: [
      ["What does the harness add beyond the language model?", "A loop, context builder, tool protocol, state store, permissions, execution environment, verifier, retry policy, and budgets for time, tokens, and money."],
      ["Why should tool calls use typed protocols?", "Schemas constrain the action space, make validation possible, separate intent from execution, and produce machine-readable observations for the next model step."],
      ["Why is an append-only event log useful?", "It preserves what the agent saw and did, supports replay and debugging, and prevents a compressed summary from silently becoming the only record of reality."],
      ["Where should safety controls live?", "Outside the model, at the action boundary: least-privilege credentials, sandboxes, allowlists, approval gates, idempotency checks, and verification after mutation."]
    ]
  },
  "memory-is-more-than-context": {
    title: "Memory Is More Than Context",
    readTime: "4 min",
    summary: "Agent memory is a pipeline that writes, stores, retrieves, compresses, and uses information; the context window is only its temporary working surface.",
    framework: ["Separate durable storage from working context", "Retrieve by expected decision value", "Consolidate and forget to control noise"],
    takeaway: "Memory quality is an allocation problem: place the most decision-relevant evidence into a limited context budget at the moment it can change an action.",
    cards: [
      ["Why is a long context window not the same as memory?", "Context is visible only for the current call and attention over it is imperfect. Memory also requires durable writes, indexing, retrieval, consolidation, and deletion policies."],
      ["What kinds of memory does an agent need?", "Working state for the current task, episodic records of events, semantic facts, procedural knowledge, and reflective summaries derived from experience."],
      ["What makes retrieval useful rather than merely relevant?", "A retrieved item must arrive at the right time, be trustworthy, fit the remaining token budget, and materially change the next decision."],
      ["Why must a memory system forget?", "Unlimited accumulation increases retrieval noise, preserves stale facts, raises cost, and can crowd out current evidence. Decay and consolidation are features, not data loss bugs."]
    ]
  },
  "how-multi-agent-systems-actually-coordinate": {
    title: "How Multi-Agent Systems Actually Coordinate",
    readTime: "4 min",
    summary: "Multiple agents help when diversity or specialization beats the extra communication, duplicated work, and error-propagation cost they introduce.",
    framework: ["Name the advantage over one strong agent", "Choose topology and message contracts", "Verify shared state and resolve disagreement"],
    takeaway: "Agent count is not capability. A multi-agent system wins only when decomposition, diversity, or parallelism creates more value than coordination consumes.",
    cards: [
      ["When should a task use more than one agent?", "When subtasks are genuinely parallel, specialists have distinct tools or knowledge, independent attempts add useful diversity, or adversarial review catches costly errors."],
      ["What coordination topologies are common?", "A central orchestrator with workers, peer-to-peer collaboration, hierarchical teams, blackboard/shared-state systems, and debate or voting ensembles."],
      ["Why does adding agents often fail to help?", "They duplicate work, share correlated mistakes, lose context through messages, overwrite state, wait on dependencies, and create more outputs than anyone can verify."],
      ["What should agents communicate?", "Compact artifacts with provenance: goals, assumptions, evidence, decisions, unresolved risks, and state changes—not entire conversational transcripts."]
    ]
  },
  "reinforcement-learning-for-agents-from-first-principles": {
    title: "Reinforcement Learning for Agents From First Principles",
    readTime: "4 min",
    summary: "Agentic RL trains action policies from consequences across long, stateful interactions where rewards are delayed and environments can change.",
    framework: ["Model the task as states, actions, transitions, and rewards", "Collect trajectories from the policy’s own behavior", "Assign delayed outcomes back to useful decisions"],
    takeaway: "For agents, the environment becomes part of the training data generator. The central difficulty is trustworthy feedback and credit across long action chains.",
    cards: [
      ["What changes when RL moves from text answers to agents?", "Actions alter an external state, observations depend on prior actions, episodes can be long, and mistakes may be costly or irreversible."],
      ["Why is imitation learning not enough?", "It copies demonstrated actions but does not directly learn which choices cause success under the learner’s own mistakes and state distribution."],
      ["What makes credit assignment hard for agents?", "A final reward may arrive hundreds of steps after the decisive action, with many irrelevant actions and environment events in between."],
      ["What makes a useful agent training environment?", "Resettable state, deterministic checks where possible, realistic tools, safe isolation, scalable execution, rich diagnostics, and rewards resistant to shortcuts."]
    ]
  },
  "how-attention-moves-information": {
    title: "How Attention Moves Information",
    readTime: "4 min",
    summary: "Attention lets each token retrieve a content-dependent mixture of other tokens through queries, keys, values, masking, and multiple heads.",
    framework: ["Use queries and keys to compute relevance", "Use the weights to mix values", "Control reach, cost, and cache size with the attention pattern"],
    takeaway: "Attention is differentiable retrieval. Separate the address used to find information from the content that gets moved.",
    cards: [
      ["Why are queries, keys, and values separate?", "Queries express what a destination needs, keys describe what each source offers, and values carry the information. Separate projections let matching and content live in different spaces."],
      ["What does scaled dot-product attention compute?", "It compares every allowed query-key pair, scales and softmaxes those scores, then returns a weighted sum of value vectors."],
      ["What do multiple heads buy?", "Each head can learn a different matching rule and move different features in parallel before their outputs are recombined."],
      ["Why do GQA, sliding windows, and MLA exist?", "Full multi-head attention is expensive in memory and sequence length. These variants reduce KV-cache size or restrict/recompress interactions while preserving useful retrieval."]
    ]
  },
  "the-puzzle-of-overparameterization": {
    title: "The Puzzle of Overparameterization",
    readTime: "4 min",
    summary: "Modern models can interpolate training data yet generalize because optimization, data structure, and parameterization bias them toward some fitting solutions over others.",
    framework: ["Separate parameter count from effective function complexity", "Study which interpolating solution optimization selects", "Track behavior across the interpolation threshold"],
    takeaway: "Fitting every training example does not uniquely determine the learned function. Generalization depends on the implicit bias among many zero-training-loss solutions.",
    cards: [
      ["Why does classical bias–variance intuition appear to fail?", "It assumes complexity rises monotonically with parameter count and often stops at interpolation. Modern models continue past that threshold into a second descent regime."],
      ["What is double descent?", "Test error can fall, rise near the point where the model first fits all training data, then fall again as the model becomes even more overparameterized."],
      ["How can interpolation be benign?", "If noise is absorbed in directions that have little effect on likely test inputs while the signal is learned in important directions, exact fitting need not ruin prediction."],
      ["What selects one solution from many interpolating solutions?", "Initialization, optimizer dynamics, architecture, normalization, regularization, data order, and training time jointly create an implicit bias in function space."]
    ]
  },
  "how-llms-are-pretrained": {
    title: "How LLMs Are Pretrained",
    readTime: "4 min",
    summary: "Pretraining converts messy source corpora into a weighted, deduplicated token stream and optimizes next-token prediction while continuously auditing quality and capability.",
    framework: ["Turn raw sources into a governed data distribution", "Spend tokens according to quality and capability goals", "Evaluate continuously before scale makes mistakes expensive"],
    takeaway: "The dataset is not a pile of documents; it is a sampling policy. Pretraining behavior follows from which tokens the pipeline makes likely.",
    cards: [
      ["What is the core pretraining objective?", "Predict the next token from previous tokens. Applied across enormous, diverse corpora, this forces the model to compress regularities in language, knowledge, code, and reasoning traces."],
      ["Why is raw web text not yet training data?", "It contains duplicates, boilerplate, spam, unsafe content, contamination, broken encoding, and wildly uneven quality. Filtering decisions reshape the learned distribution."],
      ["Why does deduplication matter?", "Duplicates waste compute, amplify memorization, distort domain weights, and can leak benchmark examples across train and evaluation sets."],
      ["What does a data mixture control?", "The probability that the next training token comes from each source or domain. Those probabilities allocate finite model capacity and compute across capabilities."]
    ]
  },
  "mixing-data-without-losing-capabilities": {
    title: "Mixing Data Without Losing Capabilities",
    readTime: "4 min",
    summary: "Multi-capability training is a resource-allocation problem: sampling and loss weights decide which gradients dominate and which skills transfer or regress.",
    framework: ["Measure per-domain gains and regressions", "Control both sampling frequency and loss scale", "Adapt the mixture as learning speeds diverge"],
    takeaway: "A data mixture is an implicit objective over capabilities. Balance gradients and marginal value, not raw dataset sizes.",
    cards: [
      ["Why does improving one capability sometimes damage another?", "Examples from different domains can produce conflicting gradients, compete for finite capacity, or shift shared representations away from an earlier skill."],
      ["What is the difference between sampling and loss weighting?", "Sampling controls how often a domain appears; loss weighting controls how strongly its examples update the model. Their product largely determines gradient influence."],
      ["Why is proportional-to-dataset-size sampling usually poor?", "Large noisy domains dominate, small high-value domains vanish, and repeated exposure needs differ across domains."],
      ["How should a mixture be managed in practice?", "Track a capability dashboard, estimate marginal gains per token, monitor gradient conflict and forgetting, then adjust weights or schedule phases rather than fixing one mixture forever."]
    ]
  },
  "how-language-models-learn-to-use-tools": {
    title: "How Language Models Learn to Use Tools",
    readTime: "4 min",
    summary: "Tool use decomposes into discovering a tool, deciding to call it, producing valid arguments, interpreting results, and verifying that the result solves the task.",
    framework: ["Retrieve the right action schema", "Generate a valid call under constraints", "Use executable feedback to verify and continue"],
    takeaway: "Tool use is a closed-loop control problem, not special syntax. Success requires the model and execution environment to share a precise action–observation contract.",
    cards: [
      ["How is a tool call represented to a language model?", "As tokens that follow a structured protocol: tool name plus typed arguments. The harness parses those tokens, executes the tool, and returns an observation."],
      ["What are the distinct tool-use decisions?", "Whether a tool is needed, which tool applies, what arguments satisfy its schema, how to use the result, and whether further action is required."],
      ["Can prompting alone teach tool use?", "Prompting can expose schemas and demonstrations, but fine-tuning improves reliable formatting and selection; executable-feedback training can optimize actual task outcomes."],
      ["Why does tool retrieval become necessary?", "Large tool catalogs cannot all fit in context and similar descriptions confuse selection. Retrieval narrows the action space to plausible tools before the model chooses."]
    ]
  },
  "the-making-of-an-ai-agent": {
    title: "The Making of an AI Agent",
    readTime: "4 min",
    summary: "An agent is a policy inside a stateful loop: observe, reason, act, receive consequences, update working state, and stop when a verified goal is reached.",
    framework: ["Define observations, actions, state, and stopping rules", "Train on complete trajectories, not isolated answers", "Place verification and authority in the surrounding system"],
    takeaway: "Agency emerges from the feedback loop between a model and an environment. The model is important, but state, tools, training trajectories, and the harness determine the system’s real behavior.",
    cards: [
      ["What turns a chatbot into an agent?", "Persistent state plus a loop that lets model outputs trigger actions, makes their consequences observable, and repeats until success, failure, or a budget limit."],
      ["What is a trajectory?", "The full sequence of states, observations, reasoning or latent decisions, actions, tool outputs, rewards, and terminal outcome for one episode."],
      ["How do imitation and reinforcement learning differ for agents?", "Imitation copies good trajectories; RL changes action probabilities using outcome feedback from the agent’s own rollouts. They solve different coverage and credit problems."],
      ["Where do most agent failures come from?", "Ambiguous goals, missing context, poor tool contracts, stale state, weak verification, long-horizon compounding errors, and excess authority—not only weak language modeling."]
    ]
  },
  "what-changed-inside-the-transformer": {
    title: "What Changed Inside the Transformer?",
    readTime: "4 min",
    summary: "The transformer skeleton survived, but modern models changed normalization, position, feed-forward gates, attention sharing, residual scaling, and expert routing.",
    framework: ["Keep the residual-stream skeleton fixed", "Map each modification to stability, quality, or efficiency", "Trace its effect in both training and inference"],
    takeaway: "Architecture evolution is constrained optimization. Most successful changes preserve the transformer’s information-routing core while removing a concrete scaling bottleneck.",
    cards: [
      ["What stayed constant from the original transformer?", "A residual stream repeatedly updated by token-mixing attention and per-token feed-forward transformations, trained with gradient descent on sequence objectives."],
      ["Why did RMSNorm and pre-norm become common?", "They simplify statistics and improve gradient flow through deep residual stacks, making large-scale training more stable."],
      ["Why did gated feed-forward blocks replace plain ReLU MLPs?", "SwiGLU-like gates provide multiplicative, input-dependent feature control and have delivered better quality per compute in many large models."],
      ["Why did attention variants focus on keys and values?", "During decoding the KV cache grows with layers, sequence length, heads, and head width. GQA and MLA reduce that serving bottleneck while retaining multiple query views."]
    ]
  },
  "scaling-laws-from-first-principles": {
    title: "Scaling Laws from First Principles",
    readTime: "4 min",
    summary: "Scaling laws connect parameters, data, compute, and loss so small experiments can guide how a fixed training budget should be allocated.",
    framework: ["Write compute as the product of model size and training tokens", "Fit smooth loss trends on smaller runs", "Optimize allocation under the actual budget and constraints"],
    takeaway: "A scaling law is a planning instrument, not a law of nature. It is valuable when its regime, data quality, and objective match the decision being made.",
    cards: [
      ["What are the three central quantities?", "Parameter count N, training tokens D, and compute C. For dense transformer training, a common approximation is C ≈ 6ND floating-point operations."],
      ["What does a power-law loss curve say?", "Reducible loss falls predictably but with diminishing returns as model size, data, or compute grows over a measured regime."],
      ["What did compute-optimal scaling change?", "It reframed the choice from ‘make the model as large as possible’ to jointly selecting model size and token count for a fixed compute budget."],
      ["Why can real training plans deviate from compute-optimal recipes?", "Inference cost, data scarcity, latency, memory, reuse, and data quality can make a smaller overtrained model or a larger undertrained model economically preferable."]
    ]
  },
  "reinforcement-learning-from-first-principles": {
    title: "Reinforcement Learning from First Principles",
    readTime: "4 min",
    summary: "RL changes a policy using sampled consequences when correct actions are not directly labeled, with baselines and trust regions controlling noisy updates.",
    framework: ["Express behavior as a stochastic policy", "Weight sampled log-probability gradients by advantage", "Constrain update size to preserve useful behavior"],
    takeaway: "Policy gradients increase the probability of actions that did better than an appropriate baseline. Nearly every practical refinement reduces variance or limits destructive updates.",
    cards: [
      ["What is the policy-gradient idea?", "Sample actions from the current policy, observe returns, and increase log-probability for actions with positive advantage while decreasing it for negative advantage."],
      ["Why use a baseline?", "Subtracting an action-independent expected return leaves the gradient unbiased while reducing variance. It asks whether an outcome was better than expected, not merely positive."],
      ["What is an advantage estimate?", "The value of taking an action relative to the state’s baseline value. GAE trades some bias for lower variance by combining temporal-difference errors across horizons."],
      ["Why do PPO-style methods constrain policy updates?", "Large probability changes can exploit noisy rewards and erase capabilities in one step. Clipping or KL penalties keep learning local enough to remain stable."]
    ]
  },
  "teaching-a-model-what-we-prefer": {
    title: "Teaching a Model What We Prefer",
    readTime: "4 min",
    summary: "Preference learning converts comparisons between responses into a training signal, then optimizes behavior while staying near a capable reference policy.",
    framework: ["Collect comparisons that expose real trade-offs", "Infer which responses should become more likely", "Regularize against reward hacking and capability drift"],
    takeaway: "Preference data defines a relative ordering, not an objective truth. The training method can only be as coherent, representative, and robust as those comparisons.",
    cards: [
      ["Why not train directly on a label called ‘good’?", "Helpfulness, harmlessness, style, and correctness are difficult to specify as token-level targets. Pairwise comparisons are often easier for humans to judge consistently."],
      ["What does a reward model learn?", "A scalar score whose differences predict which of two responses a rater prefers. It becomes a proxy objective for policy optimization."],
      ["Why keep the optimized policy near a reference model?", "A KL penalty limits drift into high-reward but unnatural or capability-damaging regions that the preference dataset does not constrain well."],
      ["How does DPO differ from the classic RLHF pipeline?", "DPO directly adjusts preferred versus rejected response likelihoods relative to a reference model, avoiding a separate reward-model-and-RL optimization loop."]
    ]
  },
  "how-reinforcement-learning-teaches-models-to-reason": {
    title: "How Reinforcement Learning Teaches Models to Reason",
    readTime: "4 min",
    summary: "Verifiable rewards let models explore reasoning traces and reinforce strategies that produce correct outcomes without requiring a gold trace for every problem.",
    framework: ["Generate diverse attempts", "Score outcomes with a trustworthy verifier", "Move probability toward successful strategies while preserving exploration"],
    takeaway: "RL does not inject reasoning rules directly. It searches over behaviors the model can already express and makes reliably successful trajectories more probable.",
    cards: [
      ["Why are verifiable tasks unusually useful for reasoning RL?", "Math, code, and rule-based tasks provide scalable outcome checks, reducing dependence on subjective learned reward models."],
      ["What is the difference between outcome and process reward?", "Outcome reward scores the final result; process reward scores intermediate steps. Process feedback offers denser credit but is harder to label and can constrain valid alternative reasoning."],
      ["Why use group-relative methods such as GRPO?", "Multiple answers to the same prompt provide a local baseline. Comparing their rewards reduces reliance on a separately trained value model."],
      ["What limits reasoning gains from RL?", "Weak base capabilities, insufficient exploration, flawed verifiers, reward shortcuts, narrow task distributions, and long traces whose extra tokens do not improve decisions."]
    ]
  },
  "thinking-in-tokens": {
    title: "Thinking in Tokens",
    readTime: "4 min",
    summary: "Reasoning tokens create a serial scratchpad where a fixed model can decompose problems, store intermediate results, branch, and revise before answering.",
    framework: ["Use tokens as temporary external state", "Spend them on decisions that change later computation", "Verify progress instead of rewarding length"],
    takeaway: "Extra tokens are useful only when they carry forward information that changes subsequent predictions. Length is a cost proxy, not reasoning itself.",
    cards: [
      ["What does a reasoning token buy computationally?", "Another sequential model evaluation conditioned on a richer intermediate state, allowing later steps to depend on calculations, plans, or checks written earlier."],
      ["Why can visible chain-of-thought improve answers?", "It externalizes intermediate variables, decomposes distant dependencies, and gives the model a place to correct local errors before committing to a final response."],
      ["Why is a longer trace not always better?", "The model can repeat itself, rationalize a mistake, drift, or spend tokens on low-value detail. More serial compute helps only when the policy uses it productively."],
      ["What should a useful trace contain?", "Decision-relevant state: subgoals, constraints, intermediate results, uncertainty, branch choices, and verification—not ornamental narration."]
    ]
  },
  "how-models-improve-without-changing-their-weights": {
    title: "How Models Improve Without Changing Their Weights",
    readTime: "4 min",
    summary: "Test-time scaling spends additional inference compute on longer reasoning, multiple samples, search, critique, tools, or verification while keeping parameters fixed.",
    framework: ["Generate alternative computational paths", "Use feedback to allocate more compute", "Select with a verifier whose errors are understood"],
    takeaway: "Test-time compute is valuable when extra attempts are diverse and selection is more reliable than generation. Otherwise it merely repeats or amplifies the same error.",
    cards: [
      ["What are the main forms of test-time scaling?", "Longer chains, repeated samples, self-refinement, tree or graph search, decomposition, tool use, verifier-guided selection, and adaptive compute allocation."],
      ["Why does sampling several answers help?", "Independent or diverse attempts reduce the chance that one unlucky trajectory determines the answer, especially when majority vote or a verifier can identify better candidates."],
      ["What is the generator–verifier gap?", "It can be easier to recognize a correct solution than to generate one directly. Search converts that asymmetry into performance by proposing many candidates and selecting."],
      ["What sets the ceiling for verifier-guided scaling?", "Correlated candidates, false-positive verifier errors, reward hacking, rising latency and cost, and tasks where correctness cannot be checked reliably."]
    ]
  },
  "how-to-find-what-is-slowing-your-model": {
    title: "How to Find What Is Slowing Your Model",
    readTime: "4 min",
    summary: "Performance work starts with a timeline and a falsifiable bottleneck hypothesis, then moves from application traces to kernels and hardware counters.",
    framework: ["Locate idle time and long operations on the timeline", "Classify compute, memory, communication, or scheduling limits", "Change one cause and remeasure end-to-end"],
    takeaway: "GPU utilization is not a diagnosis. Optimization means finding the resource that limits useful throughput and proving that removing it improves the metric users care about.",
    cards: [
      ["What is the first artifact to inspect?", "A synchronized CPU/GPU timeline showing data loading, launches, kernels, communication, memory copies, synchronization, and gaps."],
      ["Why can high GPU utilization still hide poor performance?", "The GPU may run tiny kernels, memory-bound work, redundant operations, or communication while delivering low model throughput."],
      ["How do PyTorch Profiler and Nsight differ?", "PyTorch Profiler maps time to model operations; Nsight Systems exposes cross-process timelines; Nsight Compute explains individual kernels through hardware counters."],
      ["What makes a good optimization experiment?", "State a bottleneck, predict which metric should change, alter one factor, measure warm steady-state end-to-end performance, and check that work or quality did not silently change."]
    ]
  },
  "the-serving-playbook": {
    title: "The Serving Playbook",
    readTime: "4 min",
    summary: "LLM serving is online scheduling under variable arrivals, sequence lengths, KV-cache pressure, latency targets, and shared GPU capacity.",
    framework: ["Separate prefill and decode resource profiles", "Schedule continuously around live KV state", "Optimize goodput under explicit latency objectives"],
    takeaway: "Serving throughput is not offline batch throughput. The scheduler, memory allocator, and latency distribution are part of the model system.",
    cards: [
      ["Why does static batching fail for online generation?", "Requests arrive and finish at different times. Waiting for a fixed batch wastes capacity and lets the longest sequence hold finished work hostage."],
      ["What is continuous batching?", "The scheduler rebuilds the active batch at decoding boundaries, adding new requests and removing completed ones so GPU slots remain useful."],
      ["What problem does paged KV memory solve?", "Variable-length caches fragment contiguous allocations and force over-reservation. Paging maps logical cache blocks to reusable physical blocks on demand."],
      ["What should a serving system optimize?", "Goodput: requests completed within service-level latency targets, not raw tokens per second achieved by intolerable queues or tail latency."]
    ]
  },
  "the-mechanics-of-llm-inference": {
    title: "The Mechanics of LLM Inference",
    readTime: "4 min",
    summary: "Inference alternates between a parallel prompt prefill and a serial token-by-token decode, with the KV cache trading memory for avoided recomputation.",
    framework: ["Split prefill from decode", "Track weights, activations, and KV bytes separately", "Optimize time-to-first-token and inter-token latency independently"],
    takeaway: "LLM inference is two different workloads sharing one model. Prefill tends to expose compute; decode tends to expose memory bandwidth and scheduling.",
    cards: [
      ["Why must autoregressive generation run one token at a time?", "The probability of token t depends on tokens before t, including the just-generated token t−1. That dependency serializes decode across positions."],
      ["How do prefill and decode differ?", "Prefill processes all prompt positions in parallel and builds cache state. Decode processes one new position per request while repeatedly reading weights and prior cache."],
      ["What does the KV cache save?", "It stores attention keys and values for earlier positions so they do not need to be recomputed for every new token."],
      ["Why is decode often bandwidth-bound?", "Each step performs relatively little work per request but reads large model weights and growing KV state, yielding low arithmetic intensity unless batching supplies reuse."]
    ]
  },
  "the-parallelism-playbook": {
    title: "The Parallelism Playbook",
    readTime: "5 min",
    summary: "Distributed training scales by partitioning data, optimizer state, tensors, layers, sequence positions, or experts—each with a distinct communication pattern.",
    framework: ["Find what no longer fits or finishes in time", "Partition along the axis that removes that limit", "Map resulting collectives onto the physical topology"],
    takeaway: "Parallelism exchanges local memory or compute for communication and coordination. The right strategy is the cheapest partition that satisfies capacity and throughput constraints.",
    cards: [
      ["What does data parallelism partition?", "It gives each worker a different batch shard while replicating the model, then synchronizes parameter gradients—typically with all-reduce."],
      ["How do ZeRO and FSDP differ from ordinary DDP?", "They shard optimizer states, gradients, and eventually parameters across data-parallel ranks, reconstructing what each layer needs around computation."],
      ["When is tensor or pipeline parallelism needed?", "Tensor parallelism splits operations when a layer is too large; pipeline parallelism splits layer ranges when the model is too large, introducing communication or bubbles."],
      ["Why are hybrid strategies normal at scale?", "No single axis optimizes memory, communication, and utilization across nodes. Systems combine cheap intra-node tensor splits with inter-node data or pipeline dimensions."]
    ]
  },
  "inside-a-training-step": {
    title: "Inside a Training Step",
    readTime: "4 min",
    summary: "A training step moves shaped tensors through forward operations, saves selected activations, runs backward matrix products, synchronizes gradients, and updates persistent state.",
    framework: ["Annotate every tensor with shape and lifetime", "Count compute and bytes for forward and backward", "Separate persistent model state from transient activations"],
    takeaway: "Most training-system behavior follows from three ledgers: tensor shapes, operation counts, and memory lifetimes.",
    cards: [
      ["What are the phases of one training step?", "Load and tokenize a batch, run forward, compute loss, backpropagate gradients, synchronize distributed state, apply the optimizer update, and clear or reuse buffers."],
      ["Why is backward more expensive than it looks?", "A matrix multiply’s backward pass usually needs one multiply for input gradients and another for weight gradients, plus saved forward values."],
      ["What consumes training memory?", "Parameters, gradients, optimizer states, activations saved for backward, temporary workspaces, communication buffers, and allocator fragmentation."],
      ["What does activation checkpointing trade?", "It discards selected forward activations and recomputes them during backward, exchanging extra FLOPs for lower peak memory."]
    ]
  },
  "talk-is-not-cheap": {
    title: "Talk Is Not Cheap",
    readTime: "4 min",
    summary: "Distributed performance depends on how many bytes cross PCIe, NVLink, switches, and the network—and whether communication can overlap useful compute.",
    framework: ["Express each collective in latency plus bytes over bandwidth", "Respect the actual device topology", "Overlap only work without hidden dependencies"],
    takeaway: "Communication is another level of the memory hierarchy. Scale succeeds when algorithms place frequent, large exchanges on the fastest links and hide what remains.",
    cards: [
      ["What does the latency–bandwidth model explain?", "Communication time is roughly startup latency plus message bytes divided by effective bandwidth. Small messages pay latency; large messages expose bandwidth."],
      ["How do PCIe, NVLink, and InfiniBand differ?", "They connect different scopes with different bandwidth and latency: devices through host I/O, GPUs directly or via switches, and machines across a cluster fabric."],
      ["What do collectives such as all-reduce do?", "They coordinate many point-to-point transfers into common patterns for reducing, gathering, scattering, or exchanging distributed tensors."],
      ["When does communication overlap actually work?", "Only when independent compute is ready, the network and GPU can progress concurrently, buffers do not conflict, and many small synchronizations do not serialize the schedule."]
    ]
  },
  "why-fast-gpus-still-wait-for-memory": {
    title: "Why Fast GPUs Still Wait for Memory",
    readTime: "4 min",
    summary: "A kernel reaches compute peak only when it performs enough arithmetic per byte moved; otherwise memory bandwidth sets the speed limit.",
    framework: ["Count operations and bytes", "Compute arithmetic intensity", "Compare it with the machine’s compute-to-bandwidth ratio"],
    takeaway: "Peak FLOPs describe one roof, not application speed. Performance is bounded by the scarcer resource for a workload’s arithmetic intensity.",
    cards: [
      ["What is arithmetic intensity?", "The number of arithmetic operations performed per byte transferred from the relevant memory level. Reuse raises intensity."],
      ["What does the Roofline model say?", "Attainable performance is bounded by the smaller of peak compute and memory bandwidth multiplied by arithmetic intensity."],
      ["Why are large matrix multiplies efficient?", "Tiling lets many operations reuse each loaded matrix element from fast on-chip memory, raising arithmetic intensity enough to approach compute limits."],
      ["How does kernel fusion help?", "It keeps intermediate values in registers or shared memory instead of writing and rereading them from global memory, reducing launches and byte traffic."]
    ]
  },
  "why-gpus-are-built-for-deep-learning": {
    title: "Why GPUs Are Built for Deep Learning",
    readTime: "4 min",
    summary: "GPUs devote silicon to throughput: many arithmetic lanes, massive thread concurrency, high-bandwidth memory, and matrix units suited to regular tensor operations.",
    framework: ["Match the workload’s parallelism to the execution model", "Tile data for reuse in the memory hierarchy", "Hide latency with many ready warps"],
    takeaway: "GPUs win when the same regular operation applies across lots of data. They trade sophisticated single-thread latency for aggregate throughput.",
    cards: [
      ["How does a GPU’s transistor budget differ from a CPU’s?", "A CPU spends heavily on caches, branch prediction, and out-of-order logic for low-latency threads; a GPU allocates more area to arithmetic lanes and throughput."],
      ["What is a warp?", "A group of threads scheduled together through the same instruction stream. Divergent branches make different lanes wait and reduce useful work."],
      ["How do GPUs hide memory latency?", "When one warp waits for data, the scheduler runs another ready warp. High occupancy supplies enough independent work to cover stalls."],
      ["Why do tensor cores matter?", "They execute small matrix multiply–accumulate tiles at very high throughput in reduced precision, matching the dominant operation in deep learning."]
    ]
  },
  "inside-a-modern-vision-encoder": {
    title: "Inside a Modern Vision Encoder",
    readTime: "4 min",
    summary: "A vision encoder turns variable-resolution pixels into a compact visual token sequence through preprocessing, patch embeddings, spatial mixing, and a connector.",
    framework: ["Track resolution into patch count", "Separate visual feature learning from language alignment", "Measure detail retained per output token"],
    takeaway: "The encoder is an information bottleneck. Its job is not just to recognize an image, but to preserve the spatial evidence downstream tasks will need at an affordable token cost.",
    cards: [
      ["How do pixels become visual tokens?", "Normalize and resize or tile the image, divide it into patches, project each patch to a vector, add position information, and transform the sequence with a vision backbone."],
      ["Why is high resolution difficult?", "Reducing patch size or enlarging the image increases token count, and global attention cost grows quadratically with those tokens."],
      ["What does the connector do?", "It maps, resamples, or pools vision features into the dimension and token budget expected by the language model."],
      ["Why can training objectives matter more than encoder size?", "Contrastive, classification, captioning, reconstruction, and multimodal objectives preserve different information and shape which visual evidence remains accessible."]
    ]
  },
  "one-transformer-two-modalities": {
    title: "One Transformer, Two Modalities",
    readTime: "4 min",
    summary: "Text and images enter differently—token lookup versus patch projection—but can share the same transformer once both become positioned vector sequences.",
    framework: ["Convert each modality into vectors of a common width", "Attach the right spatial or sequential positions", "Choose masks and output heads for the task"],
    takeaway: "A transformer operates on vectors, not words or pixels. Modality-specific inductive bias lives mostly in tokenization, position, masking, objectives, and heads.",
    cards: [
      ["How does text tokenization differ from image patchification?", "Text selects learned vectors by discrete token IDs; vision projects continuous pixel patches into vectors. Both produce a sequence with a shared embedding width."],
      ["What computation is identical after embedding?", "Layer normalization, multi-head attention, residual updates, and feed-forward transformations can be the same for both modalities."],
      ["Why do their position encodings differ?", "Text has a primarily one-dimensional order; images have two-dimensional row-column geometry and may vary in aspect ratio and resolution."],
      ["Why do masks and heads still matter?", "Causal masks support generation, bidirectional attention supports representation learning, and task-specific heads interpret final vectors as tokens, classes, regions, or continuous outputs."]
    ]
  },
  "an-image-is-a-sentence": {
    title: "An Image Is a Sentence",
    readTime: "4 min",
    summary: "Vision Transformers recast an image as a patch-token sequence, gaining transformer scaling while confronting quadratic attention and weakened spatial bias.",
    framework: ["Patchify the image into a sequence", "Restore spatial identity with position information", "Control token interactions as resolution grows"],
    takeaway: "ViT replaces built-in locality with learned interaction. Scale and data can make that flexibility powerful, but resolution turns token count into the central cost.",
    cards: [
      ["How does a Vision Transformer represent an image?", "It divides the image into fixed-size patches, flattens and linearly projects each patch, adds positional information, and processes the resulting token sequence."],
      ["What did ViT remove relative to CNNs?", "Most hard-coded locality and translation-equivariant weight sharing. Attention can connect arbitrary patches, but must learn useful spatial structure from data."],
      ["Why is image attention expensive?", "Image token count grows with area divided by patch area, and global self-attention compares every pair, producing quadratic cost in token count."],
      ["How do hierarchical vision transformers reduce the cost?", "They restrict attention to windows, merge patches across stages, or mix local and global operations so later layers process fewer tokens."]
    ]
  },
  "across-the-cnnverse": {
    title: "Across the CNNVerse",
    readTime: "4 min",
    summary: "CNNs build visual features through local shared filters, expanding receptive fields, multiscale hierarchies, and residual paths that make depth trainable.",
    framework: ["Start with local translation-equivariant filters", "Grow spatial context across layers and scales", "Use residual routes to optimize deep feature hierarchies"],
    takeaway: "CNN evolution repeatedly balances three resources: spatial detail, receptive field, and compute. Architectural families differ mainly in how they spend that budget.",
    cards: [
      ["What does convolution assume about images?", "Nearby pixels interact strongly, the same pattern can appear anywhere, and shared local filters should detect it regardless of position."],
      ["How does a CNN’s receptive field grow?", "Stacked kernels, stride, pooling, and dilation let deeper features depend on progressively larger regions of the input."],
      ["Why were residual connections pivotal?", "They let blocks learn refinements around an identity path, improving gradient flow and making much deeper convolutional networks trainable."],
      ["What distinguishes modern CNN families?", "How they scale depth, width, resolution, groups, bottlenecks, kernels, and stage hierarchy while controlling accuracy, latency, and memory."]
    ]
  },
  "evolution-of-ml-architectures": {
    title: "Evolution of ML Architectures",
    readTime: "5 min",
    summary: "Architecture history is a sequence of answers to three questions: how information moves, how state is stored, and how credit travels backward.",
    framework: ["Identify the information-routing primitive", "Identify the state or memory mechanism", "Compare training parallelism with inference cost"],
    takeaway: "Architectures evolve when a bottleneck in information movement, optimization, or hardware efficiency becomes dominant—not simply because a newer block is fashionable.",
    cards: [
      ["What does a dense network contribute?", "Global learned mixing between fixed-size vectors, but no built-in structure for space, time, or variable-length context."],
      ["Why did convolutions dominate vision?", "Locality and shared filters encode image structure efficiently, reducing parameters and making translation-related features reusable."],
      ["Why did recurrence give way to attention for large sequence models?", "Recurrence compresses history through serial state updates; attention exposes direct content-based paths between tokens and parallelizes training."],
      ["Where do state-space and hybrid models fit?", "They seek long-context sequence processing with more favorable scaling or streaming state, often retaining attention where flexible retrieval is most valuable."]
    ]
  },
  "how-models-know-where-they-are": {
    title: "How Models Know Where They Are",
    readTime: "4 min",
    summary: "Position methods break attention’s permutation symmetry by encoding absolute location, relative displacement, rotation, bias, or multidimensional coordinates.",
    framework: ["Identify the symmetry that must be broken", "Choose absolute versus relative geometry", "Test extrapolation beyond trained lengths and shapes"],
    takeaway: "Position encoding defines geometry for the model. The important question is which relationships remain easy to express when length, resolution, or modality changes.",
    cards: [
      ["Why does attention need position information?", "Without it, permuting the input tokens permutes outputs the same way; the layer knows content but not order or distance."],
      ["How do absolute and relative methods differ?", "Absolute methods attach a coordinate to each token. Relative methods make interactions depend directly on displacement between token pairs."],
      ["What does RoPE do?", "It rotates query and key components by position-dependent angles so their dot product naturally contains relative-offset information."],
      ["Why is context extension not solved by changing one number?", "Position frequencies, attention distributions, training lengths, data, and numerical precision interact; extrapolating coordinates does not guarantee useful long-range behavior."]
    ]
  },
  "what-an-optimizer-actually-does": {
    title: "What an Optimizer Actually Does",
    readTime: "4 min",
    summary: "An optimizer transforms noisy gradients into parameter updates by choosing direction, per-coordinate scale, temporal smoothing, and regularization.",
    framework: ["Separate the raw gradient from the update", "Track optimizer state in time and parameter space", "Judge progress per compute and memory byte"],
    takeaway: "The optimizer is an update rule with geometry and memory. Its value lies in reshaping the gradient noise and curvature the model actually presents.",
    cards: [
      ["Why is the gradient not automatically the best update?", "It gives the locally steepest direction under one geometry, but says nothing about appropriate step size, noisy estimates, coordinate scaling, or long narrow valleys."],
      ["What does momentum do?", "It averages gradients across steps, dampening oscillation and accumulating consistent directions so movement through shallow valleys becomes faster."],
      ["What do Adam-style second moments do?", "They scale each coordinate by a running estimate of gradient magnitude, producing adaptive steps and resilience to uneven feature scales."],
      ["Why does optimizer choice affect systems design?", "Optimizer states can multiply parameter memory, updates require extra bandwidth and kernels, and distributed sharding must move or partition those states."]
    ]
  },
  "the-geometry-of-normalization": {
    title: "The Geometry of Normalization",
    readTime: "4 min",
    summary: "Normalization chooses axes, removes selected scale or offset information, and places controlled geometry at sensitive points in the network.",
    framework: ["Name the axes used to compute statistics", "Ask which information normalization removes", "Place it where signal and gradient scale need control"],
    takeaway: "Normalization is not one operation. It is a family of geometric projections whose behavior depends on axes, affine parameters, and placement in the residual system.",
    cards: [
      ["How do BatchNorm, LayerNorm, and RMSNorm differ?", "BatchNorm uses batch-spatial statistics per channel; LayerNorm centers and scales features per example; RMSNorm scales by root-mean-square without subtracting the mean."],
      ["What is the geometric view of normalization?", "Centering projects away a mean direction; scaling places vectors on a controlled-radius surface; learned affine parameters restore flexible per-feature scale and shift."],
      ["Why does axis choice matter?", "It determines which examples, tokens, channels, or spatial positions share statistics—and therefore which information and dependencies are coupled."],
      ["Why is normalization placement crucial in transformers?", "Pre-, post-, sandwich-, and peri-normalization create different signal scales and gradient routes through residual blocks, especially as depth grows."]
    ]
  },
  "why-neural-networks-need-nonlinearity": {
    title: "Why Neural Networks Need Nonlinearity",
    readTime: "4 min",
    summary: "Nonlinear activations prevent deep networks from collapsing into one linear map and shape gradient flow, gating, sparsity, precision, and compute efficiency.",
    framework: ["Separate expressivity from trainability", "Inspect the derivative seen by backpropagation", "Compare accuracy gains against memory and hardware cost"],
    takeaway: "Activation history is mostly about optimization and systems constraints, not universal approximation. The winning function keeps useful gradients while spending compute efficiently.",
    cards: [
      ["Why does a deep network need nonlinear activations?", "Composing affine maps without a nonlinearity collapses to one affine map. Nonlinearity lets depth represent conditional, curved, and piecewise transformations."],
      ["Why did sigmoid and tanh struggle in deep networks?", "Their derivatives shrink in saturated regions, so repeated chain-rule multiplication makes gradients vanish across depth."],
      ["What made ReLU so effective?", "It is cheap, keeps derivative one on the positive side, creates sparse activations, and works well with variance-aware initialization—though units can die on the negative side."],
      ["Why did GELU and SwiGLU become transformer defaults?", "Smooth self-gating improves feature control; SwiGLU adds multiplicative interactions that often improve quality per training compute, at the cost of a wider gated projection."]
    ]
  }
};

const BLOG_FLASHCARD_DEEP_DIVES = {
  "the-vlm-architecture-gallery": [
    ["Why did projector-based VLMs become so common?", "A small projection layer offers a cheap, simple interface between strong pretrained vision and language backbones while allowing each side to retain its specialization."],
    ["What do query-based connectors change?", "A fixed set of learned queries extracts a bounded number of visual summaries, making the visual-token budget independent of the encoder’s raw patch count."],
    ["When is cross-attention preferable to inserting image tokens?", "Cross-attention lets language retrieve from a separate visual memory at chosen layers, preserving modality separation but adding dedicated parameters and cache behavior."],
    ["What is gained by early or unified fusion?", "The model can learn shared representations and dense cross-modal interactions from the bottom, but it gives up modularity and usually demands more joint training data."],
    ["Why do dynamic resolution and tiling keep recurring?", "Fixed resizing destroys small details or wastes tokens. Tiling preserves local resolution, but increases sequence length and complicates global spatial understanding."],
    ["How should capability comparisons be normalized?", "Compare models at similar language-backbone scale, image resolution, visual-token count, training data, and evaluation protocol; architecture names alone confound all five."]
  ],
  "the-agent-evaluation-playbook": [
    ["What belongs in an evaluation task specification?", "A reproducible initial state, allowed actions, success predicates, forbidden side effects, resource budgets, and a reset procedure."],
    ["How can trajectory quality be measured?", "Check action validity, unnecessary steps, recovery behavior, evidence use, tool errors, policy compliance, and whether intermediate state stayed consistent."],
    ["Why separate capability from reliability?", "A system may solve a task occasionally yet fail too often for deployment. Capability asks whether success is possible; reliability asks how predictably it occurs."],
    ["How do hidden tests improve agent evaluation?", "They prevent the model from optimizing surface-form criteria and let graders verify external state or edge cases the agent cannot simply echo."],
    ["What should an agent evaluation report include?", "Success and failure rates, confidence intervals, cost and latency distributions, failure taxonomy, safety events, grader uncertainty, and representative trajectories."]
  ],
  "what-autograd-actually-does": [
    ["How do forward-mode and reverse-mode costs differ?", "Forward mode propagates one input-direction derivative per sweep; reverse mode propagates one output-direction derivative. Scalar-loss training strongly favors reverse mode."],
    ["What are JVPs and VJPs?", "A JVP multiplies a Jacobian by an input-direction vector; a VJP multiplies an output cotangent by the Jacobian. Backpropagation is a chain of VJPs."],
    ["Why does gradient accumulation add rather than overwrite?", "One value can influence the loss through several downstream paths. The total derivative is the sum of contributions from every path."],
    ["What happens at branches, views, and in-place operations?", "Branches sum gradient contributions; views share storage and require shape-aware bookkeeping; unsafe in-place changes can destroy values backward still needs."],
    ["How does softmax backward avoid constructing its full Jacobian?", "Its VJP simplifies to elementwise operations using the softmax output and a dot product, so the dense Jacobian is never materialized."],
    ["What must a custom backward implementation guarantee?", "Correct input gradients with matching shapes, devices, and dtypes, plus preservation of every forward value the formula actually needs."],
    ["When is higher-order differentiation harder?", "Backward itself must remain differentiable, saved values cannot be detached incorrectly, and memory grows because the gradient computation builds another graph."]
  ],
  "why-transformers-do-not-explode": [
    ["How should a weight matrix be initialized to preserve variance?", "Choose entry variance inversely proportional to fan-in, adjusted for the activation and residual structure, so outputs remain on the same scale as inputs."],
    ["Why do residual additions accumulate variance with depth?", "Even well-scaled branches add energy to a persistent stream. Without correlation-aware scaling or normalization, the stream’s norm can grow layer after layer."],
    ["What does residual scaling change?", "It reduces each branch’s initial or ongoing contribution, keeping the sum across many layers within a controlled variance budget."],
    ["Why can attention logits become numerically dangerous?", "Growing query and key norms make dot products extreme, saturating softmax and stressing limited precision; scaling and normalization control that range."],
    ["What is the optimizer’s role in stability?", "Warmup, clipping, adaptive scaling, and conservative peak learning rates prevent early noisy gradients or rare spikes from producing destructive parameter jumps."],
    ["Why do bfloat16 and float32 accumulations help?", "Bfloat16 has a wider exponent range than fp16, while float32 reductions and optimizer state protect small sums and updates from overflow or underflow."]
  ],
  "choosing-the-next-token": [
    ["What does entropy reveal about a decoding step?", "It measures uncertainty across the next-token distribution. High entropy offers many plausible continuations; low entropy concentrates mass on a few choices."],
    ["What problem is beam search trying to solve?", "It keeps several high-likelihood partial sequences to avoid committing to one locally best token, though likelihood alone can favor bland or short outputs."],
    ["How do repetition and frequency penalties work?", "They modify logits using previously generated tokens, discouraging loops or overuse but potentially suppressing necessary repetition."],
    ["What do constrained decoders or grammars guarantee?", "They mask tokens that would violate a formal structure, ensuring syntactic validity without guaranteeing semantic correctness."],
    ["How should decoding be evaluated?", "Measure task success, diversity, calibration, latency, and failure modes on the target distribution; do not tune only for subjective fluency on a few prompts."]
  ],
  "teaching-a-language-model-to-follow-instructions": [
    ["What should an instruction-tuning example contain?", "A clear task and context, the intended assistant behavior, correct content, consistent formatting, and any tool or safety policy the model must learn."],
    ["Why does dataset diversity matter?", "It teaches the model which behavior remains invariant across topics, formats, languages, and user styles instead of memorizing narrow templates."],
    ["What is sequence packing?", "It combines several short examples into one training sequence to reduce padding, while masks prevent unintended attention or loss leakage across example boundaries."],
    ["How can SFT damage a pretrained model?", "A narrow or heavily repeated dataset can shift style, reduce breadth, amplify artifacts, or cause capability forgetting through concentrated gradients."],
    ["How should SFT quality be evaluated?", "Use held-out task performance, instruction adherence, calibration, safety, verbosity, capability-regression tests, and human or executable outcome checks."]
  ],
  "how-lora-changes-a-model-without-rewriting-it": [
    ["What does the LoRA rank control?", "Rank sets the dimensionality of the allowed update subspace. Higher rank adds capacity and trainable state, but returns often diminish."],
    ["What do alpha and rank scaling control?", "They set the effective magnitude of the low-rank update relative to the frozen base transformation, influencing optimization and adapter portability."],
    ["Which modules should receive adapters?", "Attention projections are common; adapting feed-forward projections too adds capacity. The best placement depends on task shift, memory, and acceptable trainable compute."],
    ["Can several LoRA adapters be combined?", "They can be switched, weighted, concatenated, or merged, but independently trained deltas may interfere because their useful directions were not learned jointly."],
    ["What happens when a LoRA adapter is merged?", "Its low-rank product is added into the base matrix for inference, removing adapter operations but creating a task-specific full-weight checkpoint."]
  ],
  "inside-an-ai-agent-harness": [
    ["What should the context builder include each turn?", "The stable policy, current goal, verified state, relevant memory, recent observations, available action schemas, and a compact record of unresolved work."],
    ["Why can repeatedly appending full history fail?", "Context cost grows, old noise competes with current evidence, and the model may attend to stale plans. Structured state plus selective history scales better."],
    ["What is an action–computer interface?", "The model-facing vocabulary of actions, schemas, observations, errors, and affordances through which the harness exposes a larger environment."],
    ["How should retries be handled?", "Classify the failure, preserve evidence, change the strategy or inputs, cap attempts, and avoid repeating non-idempotent side effects."],
    ["What makes an agent run debuggable?", "Durable event logs, deterministic tool wrappers where possible, versioned prompts and schemas, state snapshots, and explicit decision and budget telemetry."]
  ],
  "memory-is-more-than-context": [
    ["What should trigger a memory write?", "Novel, durable, decision-relevant information with enough provenance to be trusted later—not every conversational turn."],
    ["How should memories be indexed?", "Combine semantic similarity with entities, time, task, source, confidence, and access scope so retrieval can match the kind of decision being made."],
    ["What is memory consolidation?", "It merges repeated episodes into stable facts or procedures, resolves contradictions, and retains links back to source evidence."],
    ["How can retrieved memory harm an agent?", "Stale, poisoned, irrelevant, or overconfident memories can override current evidence and persist mistakes across many future tasks."],
    ["How should memory be evaluated?", "Measure whether retrieval changes task outcomes, plus precision, freshness, provenance, privacy, token cost, and resilience to misleading stored content."]
  ],
  "how-multi-agent-systems-actually-coordinate": [
    ["What should a central orchestrator decide?", "Task decomposition, worker assignment, dependency order, shared-state updates, review requirements, budgets, and when the team has enough evidence to stop."],
    ["When does debate improve an answer?", "When agents produce genuinely independent arguments, disagreements are evidence-bearing, and a judge can resolve them better than the original generator."],
    ["How should shared state be managed?", "Use typed artifacts, ownership or transactional updates, provenance, versioning, and conflict handling rather than an unstructured shared transcript."],
    ["What failures are unique to multi-agent systems?", "Coordination deadlocks, message distortion, duplicated mutations, collusion, authority confusion, cascading hallucinations, and consensus around correlated errors."],
    ["How do you know another agent is worth its cost?", "Ablate it. Compare outcome quality, reliability, latency, and spend against a single-agent baseline with the same total compute and tools."]
  ],
  "reinforcement-learning-for-agents-from-first-principles": [
    ["How should an agentic task be modeled formally?", "As a partially observed process where the policy maps histories or belief state to actions and receives rewards as the environment transitions."],
    ["Why are resets essential for training?", "They create comparable episodes, prevent irreversible contamination, and let the learner experience enough independent outcomes for useful credit estimates."],
    ["What is reward hacking in an agent environment?", "The policy finds a way to increase the recorded score without achieving the intended world state, often by exploiting the grader or tool surface."],
    ["How can long-horizon credit be improved?", "Use verifiable milestones, process signals, value estimates, hindsight relabeling, hierarchical tasks, and trajectory analysis while guarding against proxy gaming."],
    ["Why is on-policy data expensive for agents?", "Each update needs fresh interactive rollouts involving tools, environments, latency, and resets, rather than cheap replay of a static text corpus."]
  ],
  "how-attention-moves-information": [
    ["Why divide attention logits by the square root of head width?", "Unscaled dot-product variance grows with dimension, pushing softmax toward saturation. The scaling keeps logits in a trainable range."],
    ["What does the causal mask do?", "It removes attention edges from a token to future positions, preserving the autoregressive factorization used for generation."],
    ["How do self-attention and cross-attention differ?", "Self-attention draws queries, keys, and values from one sequence; cross-attention uses queries from one stream and keys and values from another."],
    ["Why is full attention quadratic in sequence length?", "Every query compares with every key, creating a length-by-length score matrix before values are mixed."],
    ["What does the KV cache preserve during decoding?", "Past keys and values for every layer, letting each new query attend to history without recomputing earlier hidden states."],
    ["What is lost when attention is made sparse or compressed?", "Some direct retrieval paths or representational capacity disappear; success depends on whether the removed interactions were redundant for the task."]
  ],
  "the-puzzle-of-overparameterization": [
    ["What is the interpolation threshold?", "The regime where the model first gains enough effective capacity to drive training error to zero; variance and conditioning can be worst near this boundary."],
    ["Why is parameter count a weak complexity measure for neural networks?", "Different parameter settings can encode similar functions, and optimization explores a highly structured subset shaped by architecture and data."],
    ["What is implicit regularization?", "A bias toward particular solutions created by the optimizer, initialization, parameterization, and finite training process even without an explicit penalty term."],
    ["How does function-space thinking help?", "It asks what input-output behavior was learned rather than how many coordinates represent it, separating redundant parameters from genuinely complex predictions."],
    ["Where does grokking fit?", "A model can first memorize training examples and only later transition to a simpler, generalizing algorithm, showing that zero training loss is not the end of learning."],
    ["What evidence would falsify a generalization story?", "Test it across noise, sample size, optimization choices, width, depth, and distribution shift; a story tied to one curve or benchmark is not yet an explanation."]
  ],
  "how-llms-are-pretrained": [
    ["How are documents turned into training sequences?", "After tokenization, documents are packed or concatenated into fixed-length sequences with boundary rules that balance utilization against unwanted cross-document context."],
    ["What is quality filtering trying to estimate?", "The expected learning value and risk of a document—not simply grammaticality. Useful rare domains may look unlike generic high-quality prose."],
    ["Why are data mixtures often scheduled over training?", "Capabilities learn at different rates, repeated domains saturate, and late-stage high-quality or long-context data can steer the final model efficiently."],
    ["What is benchmark contamination?", "Evaluation examples or close variants appear in training, making scores reflect memorization or familiarity rather than generalization."],
    ["How do tokenizer choices affect pretraining?", "They change sequence lengths, language and code efficiency, rare-symbol handling, and therefore how compute is distributed across information."],
    ["Why run evaluations during pretraining?", "Loss alone can hide capability regressions, data problems, memorization, or numerical instability. Checkpoints reveal trends before the full compute budget is spent."]
  ],
  "mixing-data-without-losing-capabilities": [
    ["What is positive transfer?", "Updates from one domain improve another because both benefit from shared representations, procedures, or regularization."],
    ["How can gradient conflict be detected?", "Compare gradient directions or per-domain loss changes after updates; opposing directions indicate that one batch’s improvement may damage another domain."],
    ["Why does mixture balance change with model scale?", "Larger models have different capacity, transfer, and memorization behavior, so a ratio tuned on a small model may not preserve the same capability frontier."],
    ["What is replay protecting during continued training?", "A sample of earlier data anchors existing behaviors while new-domain updates are applied, reducing catastrophic forgetting."],
    ["What should determine when mixing stops?", "Stop or reweight when marginal gains per token flatten, target capabilities reach thresholds, or regression and overfitting costs exceed the remaining benefit."]
  ],
  "how-language-models-learn-to-use-tools": [
    ["What is tool discovery?", "Recognizing that an external action can provide missing information or change state more reliably than generating text from the model’s weights."],
    ["How is tool selection different from argument generation?", "Selection chooses an affordance; argument generation grounds user intent into that tool’s typed fields. Each can fail independently."],
    ["What can executable feedback teach that demonstrations cannot?", "Whether the call parsed, ran, changed the intended state, and solved the downstream task under the model’s own action distribution."],
    ["Why must tool results be treated as untrusted input?", "External content can be wrong, stale, malicious, or contain prompt injection. The harness must preserve provenance and policy boundaries."],
    ["How should tool-use success be measured?", "Verify final state, call validity, tool choice, argument accuracy, recovery from errors, side effects, latency, and total action cost."]
  ],
  "the-making-of-an-ai-agent": [
    ["How should an agent decide when to stop?", "Use explicit success predicates, failure conditions, uncertainty thresholds, and resource budgets rather than waiting for the model to feel finished."],
    ["Why does state need to be represented separately from prose?", "Typed state can be validated, updated, and shared without relying on the model to reconstruct reality from an ever-growing transcript."],
    ["What training data most directly teaches recovery?", "Trajectories containing tool failures, wrong turns, changed environments, and successful replanning—not only pristine demonstrations."],
    ["How do tools change the model’s effective capability?", "They replace uncertain internal recall or arithmetic with actions that retrieve, compute, communicate, or mutate external state."],
    ["What is the safest division of responsibility?", "Let the model propose and interpret; let deterministic code enforce permissions, schemas, invariants, execution, and verification."]
  ],
  "what-changed-inside-the-transformer": [
    ["How did positional encoding evolve?", "Learned or sinusoidal absolute embeddings gave way in many LLMs to relative biases and rotary encodings that express displacement and adapt better to varying lengths."],
    ["What changed in attention normalization and bias terms?", "Modern implementations often remove unnecessary biases, normalize queries or keys in some designs, and use numerically stable kernels without changing the conceptual operation."],
    ["What are grouped-query and multi-query attention trading?", "They share key-value heads across more query heads, sharply shrinking decode cache and bandwidth at a possible quality cost."],
    ["What do mixture-of-experts layers change?", "They route each token through only a subset of feed-forward experts, increasing parameter capacity without proportional per-token FLOPs but adding routing and communication complexity."],
    ["Why do fused kernels count as architecture in practice?", "A mathematically equivalent block can have radically different feasible sequence length, batch size, and cost when its memory traffic and launches are fused."],
    ["How should a new transformer modification be judged?", "Measure quality at matched data and compute, stability at scale, memory, training throughput, decode cost, implementation complexity, and compatibility with parallelism."]
  ],
  "scaling-laws-from-first-principles": [
    ["What is irreducible loss in a fitted scaling model?", "The asymptotic floor the chosen model attributes to uncertainty or limitations not removed by more scale within that formulation."],
    ["Why do small runs predict larger ones at all?", "Aggregated loss can vary smoothly with scale even while individual capabilities emerge unevenly, allowing empirical extrapolation over a validated regime."],
    ["What assumptions sit behind C ≈ 6ND?", "Dense transformer training, standard forward and backward matrix operations, and a simplified count that ignores some attention, embedding, optimizer, and communication costs."],
    ["How does data quality enter a scaling law?", "Nominal token count is not equal to effective information. Filtering, repetition, domain match, and synthetic data alter how much loss reduction each token buys."],
    ["When should a scaling-law forecast not be trusted?", "Across architecture, objective, data, optimizer, context-length, or regime changes that lie outside the experiments used to fit it."]
  ],
  "reinforcement-learning-from-first-principles": [
    ["What does the return represent?", "The discounted or undiscounted sum of future rewards attributed to a state-action decision over a trajectory."],
    ["Why is REINFORCE unbiased but noisy?", "It uses sampled returns to weight score-function gradients; the expectation is correct, but individual trajectories vary greatly."],
    ["What does a value function estimate?", "Expected future return from a state under the current policy, providing a baseline and a way to propagate delayed reward."],
    ["What does the discount factor control?", "How strongly distant rewards influence current decisions, balancing long-term credit against variance and task horizon."],
    ["How does PPO clipping behave?", "It limits the incentive to move an action’s probability ratio too far from the behavior policy on one batch, approximating a trust region."],
    ["How does RL map onto a language model?", "The prompt and generated prefix form state, tokens are actions, the model is the policy, and sequence or process scores provide rewards."]
  ],
  "teaching-a-model-what-we-prefer": [
    ["How are preference comparisons modeled?", "A common model treats the probability that response A wins over B as a logistic function of their latent reward difference."],
    ["Why can a reward model be exploited?", "It is an imperfect proxy trained on limited comparisons; optimization finds high-scoring regions where its errors are largest."],
    ["What does preference-data quality require?", "Clear rubrics, representative prompts, skilled and calibrated raters, disagreement tracking, and examples that expose meaningful trade-offs."],
    ["What is the role of the reference policy in DPO?", "It anchors likelihood ratios so optimization favors preferred responses without freely drifting away from the pretrained or supervised policy."],
    ["Why evaluate preferences by dimension?", "A single win rate can hide trade-offs among correctness, helpfulness, concision, style, and safety that should not be collapsed blindly."]
  ],
  "how-reinforcement-learning-teaches-models-to-reason": [
    ["Why can outcome-only rewards still improve intermediate reasoning?", "Successful traces receive higher probability as a whole, so recurring internal strategies correlated with correct outcomes become more likely even without step labels."],
    ["What is the exploration problem?", "The policy cannot reinforce a correct strategy it never samples. Diversity, temperature, curriculum, and capable initialization determine which behaviors become discoverable."],
    ["How does GRPO form an advantage without a value model?", "It normalizes each answer’s reward relative to other answers sampled for the same prompt, turning within-group performance into the learning signal."],
    ["Why does KL regularization remain useful in reasoning RL?", "It restrains distribution drift, language degradation, and exploitation of a narrow verifier while still allowing successful reasoning patterns to grow."],
    ["What should be checked beyond benchmark accuracy?", "Reward hacking, trace length, diversity, calibration, transfer to unseen problem forms, language quality, and capability regressions outside the verified domain."]
  ],
  "thinking-in-tokens": [
    ["What is the latent-variable view of a reasoning trace?", "The trace is an intermediate sequence that mediates between prompt and answer; training or search can improve the probability of traces that support correct outputs."],
    ["How do planning and calculation use tokens differently?", "Planning chooses a sequence of subgoals; calculation resolves local state. Both reduce the amount of hidden work one forward pass must compress."],
    ["What is the downside of training only on visible rationales?", "Rationales can be post-hoc, style-biased, non-faithful, or teach unnecessary verbosity instead of the internal decisions that caused success."],
    ["How should reasoning efficiency be measured?", "Compare verified outcome quality against generated tokens, latency, samples, and tool calls rather than rewarding raw chain length."]
  ],
  "how-models-improve-without-changing-their-weights": [
    ["How does best-of-N scaling work?", "Sample N candidate solutions and use a reward model, verifier, or exact checker to select one; gains depend on candidate diversity and ranking accuracy."],
    ["When does majority voting help?", "When errors are not perfectly correlated and the correct answer is the most stable mode across samples, especially for questions with a discrete answer."],
    ["What does search add beyond independent sampling?", "It allocates compute conditionally, expanding promising partial solutions and abandoning weak branches instead of spending equal budget on complete attempts."],
    ["What is adaptive test-time compute?", "The system estimates difficulty or uncertainty and spends more tokens, samples, or verification only on inputs likely to benefit."],
    ["How should a test-time scaling method be compared?", "At matched total compute and latency, with verifier cost included and success measured across difficulty—not by comparing a large search budget to one cheap baseline sample."]
  ],
  "how-to-find-what-is-slowing-your-model": [
    ["What are the major bottleneck classes?", "Host or input stalls, launch overhead, compute throughput, memory bandwidth, communication, synchronization, allocation, and load imbalance."],
    ["How does the Roofline model help profiling?", "It predicts whether an operation’s arithmetic intensity makes compute or bandwidth the plausible ceiling, narrowing which counters and optimizations matter."],
    ["Why should traces be collected after warmup?", "Compilation, cache population, memory allocation, and autotuning make early iterations unrepresentative of steady-state behavior."],
    ["What does a long CPU gap before a GPU kernel suggest?", "Python or framework overhead, data preparation, synchronization, graph breaks, compilation, or a dependency that prevented the launch from being issued."],
    ["When is a faster kernel irrelevant?", "When it is a small share of end-to-end time, overlaps another bottleneck, moves work elsewhere, or reduces throughput through extra synchronization."]
  ],
  "the-serving-playbook": [
    ["What is chunked prefill?", "It divides long prompt processing into scheduler-sized chunks so one large prefill does not block decode work and destroy inter-token latency."],
    ["Why use prefix caching?", "Requests sharing a system prompt or document prefix can reuse its computed KV state, saving prefill compute and latency."],
    ["What does prefill–decode disaggregation trade?", "Separate worker pools can specialize and scale each phase independently, but KV transfer, routing, and load balance become new costs."],
    ["How does speculative decoding accelerate generation?", "A cheaper draft model proposes several tokens and the target verifies them in parallel, reducing expensive target-model decode steps when acceptance is high."],
    ["Why is tail latency central to serving?", "Users and dependent services experience slow outliers, while queueing grows nonlinearly near saturation; averages hide overload and unfairness."]
  ],
  "the-mechanics-of-llm-inference": [
    ["How does KV-cache memory scale?", "Roughly with batch size, cached sequence length, layer count, key-value head count, head dimension, two tensors, and bytes per element."],
    ["What controls time to first token?", "Queueing plus prompt preprocessing and prefill, which depends heavily on prompt length, batching, model compute, and cache reuse."],
    ["What controls inter-token latency?", "Decode scheduling, weight and KV bandwidth, active batch size, communication, sampling overhead, and occasional memory-management stalls."],
    ["Why does batching improve decode throughput?", "The same model weights loaded for a step serve more requests, increasing useful work per byte, though each request may wait longer."],
    ["Where does quantization help inference?", "It shrinks weight or KV bytes and may unlock faster low-precision kernels, provided dequantization overhead and accuracy loss remain acceptable."]
  ],
  "the-parallelism-playbook": [
    ["What is the communication cost of DDP?", "Every step must reduce the full gradient volume across replicas, though bucketed reductions can overlap backward computation."],
    ["What is sequence or context parallelism?", "It partitions token positions or activation work across devices, helping long contexts fit but requiring communication for operations that mix across the split."],
    ["What is expert parallelism?", "Experts are placed on different devices and tokens are routed across the network to their selected experts, producing all-to-all communication and load-balance challenges."],
    ["What creates a pipeline bubble?", "Some stages sit idle while microbatches fill, drain, or wait on an imbalanced slow stage; more microbatches reduce the fraction but add scheduling and memory trade-offs."],
    ["How should parallel dimensions map to topology?", "Keep high-volume or latency-sensitive collectives within the fastest link domain and use slower inter-node links for dimensions with lower communication pressure."],
    ["What is the minimum viable parallelism principle?", "Use sharding only where memory or throughput demands it; every extra dimension adds collectives, failure modes, and operational complexity."]
  ],
  "inside-a-training-step": [
    ["How does token count shape the main tensors?", "A batch of B sequences of length T becomes roughly B×T hidden vectors of width D, and most block operations preserve that outer token count."],
    ["Where do transformer FLOPs concentrate?", "Usually in the large projections of attention and feed-forward blocks; attention’s score computation becomes dominant only at sufficiently long sequence lengths."],
    ["Why can activations dominate memory?", "They scale with microbatch, sequence length, width, and depth, while backward needs many of them live simultaneously unless recomputed."],
    ["What is gradient accumulation doing?", "It sums gradients from several microbatches before an optimizer update, emulating a larger batch without storing all activations at once."],
    ["When do optimizer states dominate?", "Adaptive optimizers commonly keep multiple full-size statistics, so persistent training state can exceed the parameter weights by several times."],
    ["Why can mixed precision need a master copy?", "Low-precision forward weights save compute and memory, while higher-precision master weights or optimizer states preserve small accumulated updates."]
  ],
  "talk-is-not-cheap": [
    ["Why does topology awareness matter?", "Two logical neighbors may traverse very different numbers and kinds of links. A collective that ignores placement can overload slow links while fast links sit idle."],
    ["How do ring and tree collectives differ?", "Rings use bandwidth efficiently through staged chunks; trees reduce latency through logarithmic depth. Message size and topology determine the better shape."],
    ["What is RDMA buying across machines?", "The network can move data directly between registered memory regions with low CPU involvement, reducing copies and software overhead."],
    ["Why do many small collectives hurt?", "Each pays startup and synchronization costs, offers poor bandwidth utilization, and creates more ordering points; bucketing combines them into larger transfers."],
    ["How can communication be reduced rather than hidden?", "Shard differently, use lower precision, accumulate locally, exploit sparsity, recompute, or redesign the algorithm so fewer bytes cross the boundary."]
  ],
  "why-fast-gpus-still-wait-for-memory": [
    ["Which memory level should byte counts use?", "The level that is currently limiting: HBM for many kernels, but caches, shared memory, or interconnect can impose a nearer roof."],
    ["Why are elementwise operations usually memory-bound?", "They perform only a few arithmetic operations for every value read and written, yielding low arithmetic intensity."],
    ["How does batch size affect arithmetic intensity?", "Larger batches can reuse weights across more examples, raising operations per weight byte until another resource or latency constraint takes over."],
    ["Why does peak bandwidth remain unattainable sometimes?", "Access patterns, insufficient concurrency, small transfers, cache misses, bank conflicts, and instruction overhead reduce effective bandwidth."],
    ["What is the optimization order for a memory-bound kernel?", "Reduce bytes, improve locality and coalescing, fuse passes, increase reuse, and only then worry about adding arithmetic throughput."]
  ],
  "why-gpus-are-built-for-deep-learning": [
    ["Why is deep learning especially GPU-friendly?", "Its dominant tensor operations are regular, massively parallel, numerically tolerant, and reusable through dense linear-algebra kernels."],
    ["What is SIMT execution?", "Many threads follow one instruction stream in groups while retaining thread-level state, making regular data-parallel programs efficient and branches costly."],
    ["What does tiling accomplish?", "It divides a large operation into blocks whose data can be loaded once into faster on-chip storage and reused by many arithmetic instructions."],
    ["How do registers, shared memory, cache, and HBM differ?", "They trade capacity for speed and scope. Efficient kernels keep frequently reused values near arithmetic units and stream bulk data from HBM coherently."],
    ["When is a CPU still the better processor?", "For branch-heavy, latency-sensitive, lightly parallel, OS-integrated, or small tasks where GPU launch and transfer overhead outweigh throughput."]
  ],
  "inside-a-modern-vision-encoder": [
    ["How does patch size affect the representation?", "Smaller patches preserve finer detail but create more tokens and attention cost; larger patches compress aggressively and can erase small objects or text."],
    ["What is positional interpolation in vision models?", "It adapts learned positional grids to a new resolution, enabling reuse while risking geometric mismatch beyond the training regime."],
    ["How do cropping, tiling, and native-resolution methods differ?", "Cropping selects regions, tiling processes several fixed-size views, and native-resolution designs accept variable grids; each trades coverage, context, and tokens."],
    ["What information can pooling or resampling lose?", "Fine text, small objects, exact coordinates, counts, and relations that are not preserved in the limited output queries or pooled cells."],
    ["How should an encoder be evaluated for VLM use?", "Test downstream grounding, OCR, spatial reasoning, resolution robustness, token efficiency, latency, and alignment—not only image classification accuracy."]
  ],
  "one-transformer-two-modalities": [
    ["How does a class token compare with pooling?", "A learned class token gathers information through attention; pooling aggregates token outputs directly. Both convert a variable token set into a fixed representation."],
    ["Can one vocabulary represent both images and text?", "Discrete image tokenizers make this possible, but reconstruction-oriented codes may not preserve the semantic and spatial information reasoning needs."],
    ["What does cross-modal fusion require beyond shared width?", "Aligned training signals, modality indicators or positions, suitable attention masks, and enough capacity for tokens from one modality to condition on the other."],
    ["Why are modality-specific front ends still useful?", "Pixels and text have different statistics and symmetries; specialized tokenizers compress each efficiently before shared sequence processing."]
  ],
  "an-image-is-a-sentence": [
    ["What does the patch projection learn?", "A shared linear map turns each local pixel block into features, functioning like a convolution whose kernel size and stride equal the patch size."],
    ["What did DeiT demonstrate?", "Careful augmentation, regularization, distillation, and training recipes let vision transformers learn competitively without the originally assumed scale of private data."],
    ["How do PVT and Swin create hierarchy?", "They progressively reduce spatial token count while increasing channel width; Swin also shifts local windows so information crosses earlier window boundaries."],
    ["How is video different from a single image?", "Tokenization adds a time axis, multiplying sequence length and requiring the model to capture motion and long-range temporal structure efficiently."],
    ["When does convolution remain an advantage?", "With limited data, tight latency, high resolution, or tasks where locality and translation structure are strong priors worth encoding directly."]
  ],
  "across-the-cnnverse": [
    ["What do stride, padding, and dilation control?", "Stride changes output sampling, padding controls boundary and size behavior, and dilation expands receptive field without adding kernel weights."],
    ["What is a bottleneck block?", "Narrow 1×1 projections surround a more expensive spatial convolution, reducing computation while retaining a wider residual representation."],
    ["What does depthwise separable convolution trade?", "It separates spatial filtering per channel from channel mixing, sharply reducing compute and parameters at a possible accuracy or hardware-efficiency cost."],
    ["What did EfficientNet formalize?", "Coordinated scaling of depth, width, and input resolution rather than increasing one dimension in isolation."],
    ["Why did ConvNeXt revisit CNN design?", "It imported successful transformer-era choices—larger kernels, modern normalization, stage ratios, and inverted bottlenecks—while retaining convolutional structure."]
  ],
  "evolution-of-ml-architectures": [
    ["What is an architecture’s information path length?", "The number of sequential transformations needed for one input position to influence another; shorter paths can make distant dependencies easier to learn."],
    ["How did gating change recurrent networks?", "LSTM and GRU gates created controlled state-update and retention paths, reducing vanishing-gradient pressure across long sequences."],
    ["What did residual networks change beyond vision accuracy?", "They reframed deep layers as incremental updates to a persistent representation, a pattern that later became central to transformers."],
    ["Why did hardware shape architecture history?", "Parallel matrix operations thrive on accelerators, while serial recurrence, irregular sparsity, and communication-heavy routing can lose despite attractive asymptotic complexity."],
    ["How should training and inference complexity be separated?", "An operation may parallelize across all tokens during training yet require large caches or serial steps during generation; both regimes matter."],
    ["What makes a hybrid architecture sensible?", "Use each primitive where its inductive bias or system cost is strongest—for example local convolution, efficient recurrent state, and selective global attention."]
  ],
  "how-models-know-where-they-are": [
    ["What do sinusoidal positions provide?", "Deterministic frequencies encode location without a learned table and make relative shifts expressible through linear relationships among sine and cosine components."],
    ["What is an attention position bias?", "A learned or fixed scalar added to each query-key score based on their relative distance, directly favoring or discouraging certain offsets."],
    ["How do RoPE scaling methods extend context?", "They alter or interpolate rotation frequencies so positions beyond training do not rotate too rapidly, then often rely on continued training to adapt."],
    ["What does NoPE rely on?", "Causal masking, content patterns, boundary tokens, and learned attention behavior can supply some order information even without explicit positional vectors."],
    ["How should images and multimodal sequences encode position?", "Preserve two-dimensional patch coordinates plus ordering and modality boundaries; methods such as factorized 2D or multimodal rotary coordinates make those axes explicit."]
  ],
  "what-an-optimizer-actually-does": [
    ["How does SGD encode geometry?", "A raw gradient step assumes ordinary Euclidean distance in parameter coordinates, even though equal coordinate changes can have unequal functional effects."],
    ["Why can curvature slow optimization?", "One learning rate must remain stable in steep directions, forcing tiny progress along shallow directions in an ill-conditioned valley."],
    ["How is decoupled weight decay different from L2 regularization in Adam?", "Decoupled decay shrinks weights directly outside adaptive gradient scaling; adding an L2 gradient lets Adam rescale the penalty coordinate by coordinate."],
    ["What is Muon trying to change?", "It reshapes matrix updates through orthogonalization-like operations so singular directions have more balanced scale, applying matrix-aware rather than purely coordinate-wise geometry."],
    ["Why can an optimizer stall despite nonzero gradients?", "Updates may be too small after scaling, dominated by noise, misaligned with useful curvature, clipped, canceled by decay, or lost at finite precision."],
    ["How should optimizers be compared fairly?", "Tune learning-rate and schedule, match model, data, tokens, and precision, then compare quality per compute, stability, memory, and sensitivity—not one default configuration."]
  ],
  "the-geometry-of-normalization": [
    ["Why was BatchNorm transformative for CNNs?", "It stabilized channel statistics during training, supported larger learning rates, and added batch-dependent noise, though it couples examples and complicates small batches."],
    ["What does LayerNorm preserve and remove?", "It removes per-token feature mean and scale while preserving the direction of the centered feature vector, then restores learned affine freedom."],
    ["Why does RMSNorm omit centering?", "Scaling alone is cheaper and often sufficient to control residual-stream magnitude in transformers, while retaining the feature mean component."],
    ["What are GroupNorm and InstanceNorm solving?", "They avoid batch dependence by normalizing channel groups or individual feature maps, useful when batches are small or style statistics should be removed."],
    ["What is the difference between pre-, post-, and peri-normalization?", "They normalize before a sublayer, after the residual update, or around selected projections, creating different controlled surfaces and gradient routes."],
    ["Why are multimodal boundaries sensitive to normalization?", "Vision and language features can have different scales and distributions; normalization at the connector can improve alignment or erase magnitude information the downstream model needs."]
  ],
  "why-neural-networks-need-nonlinearity": [
    ["What does saturation do to learning?", "When the derivative approaches zero, upstream gradients disappear even if the unit’s output remains informative in the forward pass."],
    ["Why does zero-centering matter?", "Biased activation means can correlate parameter-gradient signs and distort signal statistics, though normalization and residual designs can mitigate the effect."],
    ["What is the dying-ReLU problem?", "A unit can stay in the negative region for all examples, produce zero output and gradient, and stop recovering under ordinary updates."],
    ["How do GELU and Swish implement self-gating?", "They multiply the input by a smooth, input-dependent gate, softly suppressing negative or low-confidence features rather than hard-clipping them."],
    ["How does a GLU differ from an elementwise activation?", "It projects into content and gate branches and multiplies them, adding feature-wise conditional interaction and usually changing the feed-forward width budget."],
    ["Why are sparse activations becoming interesting again?", "Zeros can reduce activation traffic and conditional compute if hardware and kernels exploit them, potentially changing the quality-versus-systems trade-off."]
  ]
};

Object.entries(BLOG_FLASHCARD_DEEP_DIVES).forEach(([slug, cards]) => {
  if (window.BLOG_FLASHCARDS[slug]) window.BLOG_FLASHCARDS[slug].deepDive = cards;
});

const BLOG_FLASHCARD_RESULTS = {
  "the-vlm-architecture-gallery": [
    ["Raw patch count", "\\(N_v = (H/P)(W/P)\\)", "Halving patch size P creates 4× as many visual tokens at fixed resolution."],
    ["Fusion families", "4 recurring interfaces", "Projection, query compression, cross-attention, and unified early fusion explain most architecture diagrams."],
    ["Comparison rule", "Normalize 5 budgets", "Backbone size, resolution, visual tokens, training data, and evaluation protocol must be aligned before attributing gains to architecture."]
  ],
  "the-agent-evaluation-playbook": [
    ["Episode reliability", "\\(\\text{pass}^k = p^k\\)", "If every one of k dependent steps must work and each succeeds with probability p, reliability compounds downward."],
    ["Outcome test", "State predicates > prose", "Success should be computed from the changed environment, not inferred from what the agent claims it did."],
    ["Minimum report", "5 distributions", "Outcome, safety, latency, cost, and trajectory quality reveal more than a single average score."]
  ],
  "what-autograd-actually-does": [
    ["Backward primitive", "\\(\\bar{x} = \\bar{y}J_f(x)\\)", "Reverse mode composes vector–Jacobian products; it does not materialize the full Jacobian."],
    ["Why reverse wins", "1 scalar → N gradients", "One reverse sweep is suited to training because loss dimension is one while parameter dimension is enormous."],
    ["Checkpoint trade", "Memory ↓ · FLOPs ↑", "Discarding saved activations lowers peak memory by recomputing their forward region during backward."]
  ],
  "why-transformers-do-not-explode": [
    ["Variance target", "\\(\\operatorname{Var}(W_{ij}) \\propto 1/d_{in}\\)", "Fan-in-aware initialization keeps a matrix projection from changing signal scale merely because width changed."],
    ["Attention scale", "\\(QK^\\top)/\\sqrt{d_h}\\)", "The square-root factor keeps logit variance roughly stable as head width grows."],
    ["Stability stack", "5 coupled controls", "Initialization, normalization, residual scaling, optimizer schedule, and precision must work as one signal budget."]
  ],
  "choosing-the-next-token": [
    ["Temperature", "\\(p_i = \\operatorname{softmax}(z_i/T)\\)", "T < 1 sharpens differences; T > 1 flattens them. It changes sampling behavior, not learned knowledge."],
    ["Top-p", "Smallest set with mass ≥ p", "The candidate count expands under uncertainty and contracts when the distribution is confident."],
    ["Constraint boundary", "Syntax ≠ semantics", "A grammar can guarantee valid JSON or code shape, but not that the generated action or answer is correct."]
  ],
  "teaching-a-language-model-to-follow-instructions": [
    ["SFT objective", "\\(L=-\\sum_{t\\in A}\\log p_\\theta(y_t|x,y_{<t})\\)", "Loss is commonly applied only to assistant tokens A while user and system tokens remain conditioning context."],
    ["What changed", "Data distribution, not loss family", "SFT is still next-token learning; curated demonstrations redefine which behavior receives probability mass."],
    ["Packing rule", "Mask every boundary", "Packed examples save padding only if attention and loss masks prevent unrelated conversations from leaking into one another."]
  ],
  "how-lora-changes-a-model-without-rewriting-it": [
    ["Low-rank update", "\\(W' = W + (\\alpha/r)BA\\)", "The frozen base W is modified by two trainable thin matrices with inner dimension r."],
    ["Trainable size", "\\(r(d_{in}+d_{out}))\\)", "This replaces a full update with d_in×d_out parameters by a sum that is linear in width."],
    ["Rank bound", "\\(\\operatorname{rank}(BA)\\le r\\)", "LoRA saves state precisely by restricting adaptation to an r-dimensional update subspace."]
  ],
  "inside-an-ai-agent-harness": [
    ["Control loop", "Observe → propose → validate → execute → verify", "The harness owns every transition; the model supplies a proposal inside the loop."],
    ["State invariant", "Log events before summarizing", "An append-only source of truth makes compression reversible and failures replayable."],
    ["Authority rule", "Least privilege per action", "Credentials, sandboxes, approval gates, and idempotency belong at the execution boundary, outside model discretion."]
  ],
  "memory-is-more-than-context": [
    ["Useful memory", "Relevant × timely × trusted", "Similarity alone is insufficient; a memory must arrive when it can alter the next decision and carry provenance."],
    ["Five layers", "Working · episodic · semantic · procedural · reflective", "Different lifetimes and retrieval policies serve different kinds of agent decisions."],
    ["Allocation rule", "Value per context token", "Retrieve evidence by expected decision value under a limited attention and token budget."]
  ],
  "how-multi-agent-systems-actually-coordinate": [
    ["Independent attempts", "\\(P(\\ge1\\ success)=1-(1-p)^k\\)", "Parallel attempts help only to the degree their errors are genuinely independent."],
    ["Team inequality", "Coordination gain > coordination cost", "Specialization, diversity, or parallelism must repay messaging, duplicated work, waiting, and verification."],
    ["Ablation test", "Same budget · fewer agents", "Compare against one strong agent with equal tools and total compute before crediting the multi-agent design."]
  ],
  "reinforcement-learning-for-agents-from-first-principles": [
    ["Agent process", "\\((s_t,a_t,r_t,s_{t+1})_{t=0}^{T})\\)", "Training data is an interactive trajectory, not an isolated prompt-response pair."],
    ["Return", "\\(G_t=\\sum_{k=0}^{T-t}\\gamma^k r_{t+k}\\)", "Credit assignment asks which earlier actions deserve a delayed cumulative outcome."],
    ["Environment test", "Resettable · verifiable · isolated", "Without reliable resets and state checks, rollouts cannot supply scalable trustworthy feedback."]
  ],
  "how-attention-moves-information": [
    ["Attention", "\\(\\operatorname{softmax}(QK^\\top/\\sqrt{d_h})V\\)", "Queries and keys choose where to retrieve; values determine what information moves."],
    ["Full score storage", "\\(O(n^2)\\)", "Every query-key pair creates a score, which is why long sequences motivate sparse, local, or compressed attention."],
    ["Decode cache", "Keys + values for every past token", "GQA and MLA target this persistent memory and bandwidth cost by sharing or compressing KV state."]
  ],
  "the-puzzle-of-overparameterization": [
    ["Interpolation point", "Training error → 0", "Test error can peak where the model first fits every example, then fall again as capacity continues growing."],
    ["Double descent", "Bias fall → variance peak → second fall", "The classical U-curve is incomplete when the capacity axis stops at interpolation."],
    ["Complexity lens", "Function bias > parameter count", "Generalization depends on which fitting function optimization selects among many equivalent parameterizations."]
  ],
  "how-llms-are-pretrained": [
    ["Objective", "\\(L=-\\sum_t\\log p_\\theta(x_t|x_{<t})\\)", "The simple next-token loss becomes powerful through scale, diversity, and repeated compression of structure."],
    ["Dataset meaning", "A sampling distribution", "Mixture probabilities—not directory sizes—determine which capabilities receive the next unit of compute."],
    ["Dedup dividend", "Less waste · less leakage · less memorization", "Near-duplicate removal simultaneously improves effective token diversity and evaluation integrity."]
  ],
  "mixing-data-without-losing-capabilities": [
    ["Gradient influence", "\\(w_i \\propto q_i\\lambda_i\\)", "A domain’s effect combines how often it is sampled q_i and how strongly its loss is weighted λ_i."],
    ["Transfer test", "\\(\\Delta L_j\\mid\\text{update on }i\\)", "Measure whether training on domain i improves or harms held-out performance on domain j."],
    ["Mixture policy", "Reweight by marginal gain/token", "Static ratios ignore that domains learn and saturate at different rates during training."]
  ],
  "how-language-models-learn-to-use-tools": [
    ["Five decisions", "Need → retrieve → select → call → verify", "A valid function call solves only the middle of the complete tool-use problem."],
    ["Action contract", "Name + typed arguments + observation", "Schemas turn generated tokens into validated operations and structured feedback."],
    ["Success metric", "Verified final state", "Tool accuracy should include outcome, side effects, recovery, latency, and cost—not merely parsable syntax."]
  ],
  "the-making-of-an-ai-agent": [
    ["Minimal agent", "Policy + state + actions + loop", "Remove persistent state or consequences and the system collapses back toward stateless response generation."],
    ["Training unit", "Complete trajectory", "Recovery and long-horizon credit cannot be learned from pristine final answers alone."],
    ["Responsibility split", "Model proposes · harness enforces", "Permissions, execution, invariants, and verification should remain deterministic wherever possible."]
  ],
  "what-changed-inside-the-transformer": [
    ["Skeleton", "Residual stream + attention + FFN", "Most modern changes optimize the organs while preserving this information-routing backbone."],
    ["KV pressure", "\\(M_{KV}\\propto Lnh_{kv}d_h\\)", "Cache grows with layers L, context n, KV heads, and head width; GQA and MLA attack those factors."],
    ["MoE bargain", "Parameters ↑ without proportional token FLOPs", "Sparse routing expands capacity, while communication, balance, and serving memory become new constraints."]
  ],
  "scaling-laws-from-first-principles": [
    ["Dense training compute", "\\(C\\approx6ND\\)", "A useful first estimate multiplies parameters N by training tokens D; the factor covers forward and backward matrix work."],
    ["Power-law form", "\\(L(x)=L_\\infty+Ax^{-\\alpha}\\)", "Loss improves predictably with diminishing returns over the regime used to fit the curve."],
    ["Planning rule", "Fit small → optimize budget → validate scale", "Scaling laws guide allocation only when architecture, data quality, objective, and operating regime remain comparable."]
  ],
  "reinforcement-learning-from-first-principles": [
    ["Policy gradient", "\\(\\nabla J=\\mathbb E[\\nabla\\log\\pi_\\theta(a|s)A(s,a)]\\)", "Increase probability for actions that outperform the baseline and decrease it for those that underperform."],
    ["Advantage", "\\(A(s,a)=Q(s,a)-V(s)\\)", "Relative performance reduces variance without changing the expected policy-gradient direction."],
    ["Trust mechanism", "Probability ratio or KL bound", "PPO-style constraints prevent one noisy batch from moving the policy into a destructive regime."]
  ],
  "teaching-a-model-what-we-prefer": [
    ["Pairwise model", "\\(P(A\\succ B)=\\sigma(r_A-r_B)\\)", "Comparisons identify reward differences more naturally than absolute human scores."],
    ["Regularized objective", "Reward − β KL(policy ‖ reference)", "The reference keeps optimization near known-capable behavior where preference coverage is weak."],
    ["DPO signal", "Preferred likelihood ratio > rejected ratio", "DPO folds preference optimization into a classification-like loss relative to a fixed reference policy."]
  ]
};

Object.assign(BLOG_FLASHCARD_RESULTS, {
  "how-reinforcement-learning-teaches-models-to-reason": [
    ["Group advantage", "\\(A_i=(r_i-\\bar r)/\\operatorname{std}(r)\\)", "GRPO-style learning compares answers sampled for one prompt instead of fitting a separate value model."],
    ["RL capability", "Search then reinforce", "RL amplifies successful behaviors the base policy can sample; it cannot reward a strategy absent from exploration."],
    ["Verifier ceiling", "False positives compound with search", "More samples help only while the checker ranks true solutions above attractive reward hacks."]
  ],
  "thinking-in-tokens": [
    ["Serial depth", "One generated token = one more conditioned step", "A written intermediate state lets later predictions depend on work that did not fit into one forward pass."],
    ["Useful trace", "State change per token", "Subgoals, calculations, uncertainty, and checks earn their cost; narration that changes no later decision does not."],
    ["Efficiency metric", "Verified success / inference compute", "Reasoning length is an input cost, not an outcome metric."]
  ],
  "how-models-improve-without-changing-their-weights": [
    ["At least one success", "\\(1-(1-p)^N\\)", "N independent attempts raise discovery probability, but correlated errors make the real gain smaller."],
    ["Selection condition", "Verifier accuracy > generator self-choice", "Best-of-N works when ranking candidates is easier and more reliable than producing the best one directly."],
    ["Adaptive compute", "Spend budget where marginal gain is high", "Difficulty and uncertainty estimates should decide which inputs receive longer traces, more samples, or search."]
  ],
  "how-to-find-what-is-slowing-your-model": [
    ["Amdahl bound", "\\(S\\le1/((1-f)+f/s)\\)", "Accelerating fraction f by s cannot overcome the unchanged portion of end-to-end time."],
    ["Roofline diagnosis", "\\(P\\le\\min(P_{peak}, B\\times AI)\\)", "Arithmetic intensity AI separates plausible compute limits from memory-bandwidth limits."],
    ["Proof standard", "Hypothesis → metric → intervention → remeasure", "An optimization is real only when the predicted counter and end-to-end target both improve without changing the work."]
  ],
  "the-serving-playbook": [
    ["Little’s law", "\\(L=\\lambda W\\)", "Average in-system requests L equal arrival rate λ times time in system W; queues grow as service falls behind arrivals."],
    ["Goodput", "Requests meeting SLO / second", "Raw tokens per second can rise while user-visible service worsens, so latency constraints belong in the throughput metric."],
    ["Continuous batching", "Admit and retire at decode boundaries", "The active batch follows live sequences instead of waiting for a fixed batch’s longest member."]
  ],
  "the-mechanics-of-llm-inference": [
    ["KV-cache bytes", "\\(2BLnh_{kv}d_hb\\)", "Two tensors across batch B, layers L, cached length n, KV heads, head width, and bytes b set persistent cache memory."],
    ["Two workloads", "Prefill: parallel · Decode: serial", "Prompt processing tends toward compute efficiency; token generation repeatedly streams weights and cache."],
    ["Latency split", "TTFT + tokens × ITL", "User latency combines queue and prefill time to first token with repeated inter-token decode latency."]
  ],
  "the-parallelism-playbook": [
    ["Data parallel", "Compute ÷ replicas · model replicated", "Each rank sees different examples; full gradients must still be synchronized every update."],
    ["ZeRO/FSDP memory", "State per rank ≈ total state / world size", "Sharding approaches this ideal but pays gathers, reductions, transient buffers, and imbalance."],
    ["Pipeline efficiency", "\\(m/(m+p-1)\\)", "For a simple schedule with m microbatches and p stages, fill and drain create the remaining bubble." ]
  ],
  "inside-a-training-step": [
    ["Dense train compute", "≈ 6 × parameters × tokens", "Forward is roughly two operations per active weight-token use; backward contributes about twice the forward work."],
    ["Activation scale", "\\(O(BTLd)\\)", "Saved hidden states grow with microbatch B, sequence T, layers L, and width d before attention-specific terms."],
    ["Adam state", "Often 2 statistics / parameter", "First and second moments can outweigh low-precision weights, motivating optimizer-state sharding."]
  ],
  "talk-is-not-cheap": [
    ["Link model", "\\(T(n)=\\alpha+n/\\beta\\)", "Startup latency α dominates small messages; bandwidth β dominates large transfers."],
    ["All-reduce volume", "≈ \\(2(P-1)/P\\) × tensor bytes", "A bandwidth-optimal ring moves nearly twice the tensor size per rank as participant count P grows."],
    ["Placement rule", "Frequent bytes stay on fastest links", "Map high-volume tensor collectives inside NVLink domains before crossing PCIe or the cluster network."]
  ],
  "why-fast-gpus-still-wait-for-memory": [
    ["Arithmetic intensity", "\\(AI=\\text{operations}/\\text{bytes}\\)", "Reuse raises AI; extra peak FLOPs do not help work that transfers too many bytes."],
    ["Roofline", "\\(P=\\min(P_{peak},B\\cdot AI)\\)", "The ridge point is P_peak/B: below it bandwidth dominates, above it compute can dominate."],
    ["Fusion dividend", "Intermediate HBM traffic → 0", "Keeping producer outputs on-chip removes full write-read round trips and often kernel-launch overhead."]
  ],
  "why-gpus-are-built-for-deep-learning": [
    ["Throughput trade", "More ALUs · less per-thread control", "GPUs sacrifice aggressive single-thread latency machinery to execute many regular operations concurrently."],
    ["Latency hiding", "Ready warps cover stalled warps", "Occupancy helps until registers, shared memory, or insufficient parallel work limit how many warps can remain resident."],
    ["Tensor-core primitive", "\\(D=A B+C\\)", "Small mixed-precision matrix multiply-accumulates match the repeated structure of deep-learning projections."]
  ],
  "inside-a-modern-vision-encoder": [
    ["Patch tokens", "\\(N=(H/P)(W/P)\\)", "Resolution grows token count by area; doubling height and width creates 4× the patches."],
    ["Global attention", "\\(O(N^2d)\\)", "Fine detail becomes expensive twice: more encoder interactions and more downstream visual tokens."],
    ["Connector objective", "Maximum task evidence / output token", "Pooling must compress while retaining OCR, objects, coordinates, counts, and relations needed later."]
  ],
  "one-transformer-two-modalities": [
    ["Common interface", "\\(X\\in\\mathbb R^{N\\times d}\\)", "After tokenization, both modalities present a sequence of N width-d vectors to the same transformer block."],
    ["Embedding difference", "Lookup IDs vs project patches", "Text selects discrete learned rows; vision applies a shared linear map to continuous pixel blocks."],
    ["Geometry difference", "1D order vs 2D coordinates", "Shared attention does not remove the need for modality-appropriate positions, masks, and output heads."]
  ],
  "an-image-is-a-sentence": [
    ["Token count", "\\(N=HW/P^2\\)", "At fixed image area, halving patch width P quadruples sequence length."],
    ["Attention cost", "\\(O(N^2d)\\)", "Combining the two formulas means halving patch width can make global score computation about 16× larger."],
    ["Hierarchy trade", "Tokens ↓ · channels ↑", "Patch merging or windowing preserves multiscale structure while preventing high-resolution global attention from dominating."]
  ],
  "across-the-cnnverse": [
    ["Output width", "\\(W_o=\\lfloor(W+2p-d(k-1)-1)/s\\rfloor+1\\)", "Kernel k, padding p, dilation d, and stride s determine spatial size."],
    ["Parameter sharing", "\\(k^2C_{in}C_{out}\\)", "Convolutional parameter count is independent of image width and height because one filter is reused everywhere."],
    ["Depthwise separable", "\\(k^2C_{in}+C_{in}C_{out}\\)", "Separating spatial and channel mixing can be far cheaper than a dense k²C_inC_out convolution."]
  ],
  "evolution-of-ml-architectures": [
    ["Dependency path", "RNN: O(n) · attention: O(1)", "Direct attention edges shorten the route between distant tokens during training, while recurrence updates state serially."],
    ["Training parallelism", "Convolution/attention > recurrence", "Parallelizable operations aligned with accelerators drove architecture adoption alongside modeling quality."],
    ["Design axes", "Movement · state · credit", "Ask how information travels, what persists, and how gradients reach the responsible component."]
  ],
  "how-models-know-where-they-are": [
    ["Permutation issue", "Attention without position is equivariant", "Reordering inputs only reorders outputs; content interactions alone cannot determine sequence order."],
    ["RoPE identity", "\\(\\langle R_mq,R_nk\\rangle=f(q,k,n-m)\\)", "Rotating queries and keys makes their dot product depend on relative displacement."],
    ["2D requirement", "Encode row and column", "Flattened image order alone makes nearby boundaries ambiguous; multimodal position must retain spatial geometry and sequence structure."]
  ],
  "what-an-optimizer-actually-does": [
    ["Momentum", "\\(m_t=\\beta m_{t-1}+(1-\\beta)g_t\\)", "Temporal averaging damps noisy reversals and accumulates directions that stay consistent."],
    ["Adam update", "\\(\\Delta\\theta_t=-\\eta\\hat m_t/(\\sqrt{\\hat v_t}+\\epsilon)\\)", "First moments choose direction; second moments scale coordinates by recent gradient magnitude."],
    ["State cost", "Parameters + gradients + moments", "Adaptive optimization can store several values per parameter, making memory and bandwidth part of optimizer choice."]
  ],
  "the-geometry-of-normalization": [
    ["LayerNorm", "\\(y=(x-\\mu)/\\sqrt{\\sigma^2+\\epsilon}\\)", "Center and scale are computed across a token’s feature axis, then learned affine parameters restore flexibility."],
    ["RMSNorm", "\\(y=x/\\sqrt{\\operatorname{mean}(x^2)+\\epsilon}\\)", "It controls radius without subtracting the feature mean."],
    ["Axis rule", "The normalized axes define the invariance", "Batch, token, channel, group, and spatial axes couple different examples and discard different scale information."]
  ],
  "why-neural-networks-need-nonlinearity": [
    ["Linear collapse", "\\(W_2(W_1x+b_1)+b_2=Wx+b\\)", "Any depth of affine layers is still one affine map; nonlinearities make additional layers expressively meaningful."],
    ["Sigmoid ceiling", "\\(\\max_x\\sigma'(x)=1/4\\)", "Repeated derivatives at or below 0.25 explain severe gradient shrinkage even before saturation becomes extreme."],
    ["SwiGLU", "\\(\\operatorname{SiLU}(xW_g)\\odot(xW_v)\\)", "A learned gate multiplicatively selects features, improving quality while adding projection and activation cost."]
  ]
});

Object.entries(BLOG_FLASHCARD_RESULTS).forEach(([slug, results]) => {
  if (window.BLOG_FLASHCARDS[slug]) window.BLOG_FLASHCARDS[slug].results = results;
});
