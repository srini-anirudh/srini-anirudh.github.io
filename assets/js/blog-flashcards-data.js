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
    ["Attention scale", "\\(QK^\\top/\\sqrt{d_h}\\)", "The square-root factor keeps logit variance roughly stable as head width grows."],
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
    ["Trainable size", "\\(r(d_{in}+d_{out})\\)", "This replaces a full update with d_in×d_out parameters by a sum that is linear in width."],
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

const BLOG_FLASHCARD_RESULT_LINKS = {
  "the-vlm-architecture-gallery": [2, 0, 1],
  "the-agent-evaluation-playbook": [3, 0, 8],
  "what-autograd-actually-does": [5, 4, 3],
  "why-transformers-do-not-explode": [4, 7, 3],
  "choosing-the-next-token": [1, 2, 7],
  "teaching-a-language-model-to-follow-instructions": [2, 1, 6],
  "how-lora-changes-a-model-without-rewriting-it": [0, 2, 4],
  "inside-an-ai-agent-harness": [0, 2, 3],
  "memory-is-more-than-context": [2, 1, 0],
  "how-multi-agent-systems-actually-coordinate": [0, 1, 8],
  "reinforcement-learning-for-agents-from-first-principles": [4, 2, 3],
  "how-attention-moves-information": [1, 7, 8],
  "the-puzzle-of-overparameterization": [4, 1, 5],
  "how-llms-are-pretrained": [0, 3, 2],
  "mixing-data-without-losing-capabilities": [1, 4, 8],
  "how-language-models-learn-to-use-tools": [1, 0, 8],
  "the-making-of-an-ai-agent": [0, 1, 8],
  "what-changed-inside-the-transformer": [0, 3, 7],
  "scaling-laws-from-first-principles": [0, 1, 8],
  "reinforcement-learning-from-first-principles": [0, 2, 8],
  "teaching-a-model-what-we-prefer": [4, 7, 3],
  "how-reinforcement-learning-teaches-models-to-reason": [6, 0, 8],
  "thinking-in-tokens": [0, 3, 7],
  "how-models-improve-without-changing-their-weights": [4, 2, 7],
  "how-to-find-what-is-slowing-your-model": [8, 5, 3],
  "the-serving-playbook": [8, 3, 1],
  "the-mechanics-of-llm-inference": [4, 1, 5],
  "the-parallelism-playbook": [0, 1, 7],
  "inside-a-training-step": [5, 6, 8],
  "talk-is-not-cheap": [0, 2, 4],
  "why-fast-gpus-still-wait-for-memory": [0, 1, 3],
  "why-gpus-are-built-for-deep-learning": [0, 2, 3],
  "inside-a-modern-vision-encoder": [0, 1, 2],
  "one-transformer-two-modalities": [1, 0, 2],
  "an-image-is-a-sentence": [0, 2, 6],
  "across-the-cnnverse": [4, 0, 6],
  "evolution-of-ml-architectures": [4, 2, 8],
  "how-models-know-where-they-are": [0, 2, 8],
  "what-an-optimizer-actually-does": [1, 2, 3],
  "the-geometry-of-normalization": [5, 6, 1],
  "why-neural-networks-need-nonlinearity": [0, 1, 3]
};

Object.entries(BLOG_FLASHCARD_RESULT_LINKS).forEach(([slug, resultLinks]) => {
  if (window.BLOG_FLASHCARDS[slug]) window.BLOG_FLASHCARDS[slug].resultLinks = resultLinks;
});

const BLOG_FLASHCARD_TABLES = {
  "the-vlm-architecture-gallery": {
    title: "Choose the fusion interface",
    intro: "Start with the information bottleneck and serving budget; the named architecture usually follows from those constraints.",
    columns: ["Interface", "Visual tokens", "Strength", "Choose when"],
    rows: [
      ["Linear projector", "Patch-dependent", "Simple and modular", "Strong pretrained towers and ample token budget"],
      ["Query compressor", "Fixed small set", "Predictable LLM cost", "Images have many patches but tasks need a compact summary"],
      ["Cross-attention", "Separate memory", "Selective retrieval at depth", "Language should consult vision without inserting every token"],
      ["Unified early fusion", "Shared sequence", "Dense cross-modal learning", "Enough joint data and compute exist to train one representation"]
    ]
  },
  "the-agent-evaluation-playbook": {
    title: "What to measure",
    intro: "Grade the changed world first, then use the trajectory to explain why the system succeeded or failed.",
    columns: ["Layer", "Measure", "Catches", "Do not substitute"],
    rows: [
      ["Outcome", "Verified state predicates", "Claimed success without action", "Final-answer fluency"],
      ["Trajectory", "Valid, necessary, recoverable steps", "Lucky or unsafe success", "Step count alone"],
      ["Reliability", "Repeated-run success distribution", "Stochastic brittleness", "One cherry-picked run"],
      ["Operations", "Latency, cost, permissions, side effects", "Undeployable capability", "Average accuracy"]
    ]
  },
  "what-autograd-actually-does": {
    title: "Choose the differentiation mode",
    intro: "The cheapest mode follows from which side of the function—inputs or outputs—has fewer independent directions.",
    columns: ["Method", "One sweep gives", "Best shape", "Typical use"],
    rows: [
      ["Forward mode", "One input-direction JVP", "Few inputs, many outputs", "Sensitivity and Jacobian columns"],
      ["Reverse mode", "One output-direction VJP", "Many inputs, few outputs", "Scalar-loss neural-network training"],
      ["Full Jacobian", "Every pairwise derivative", "Only small dimensions", "Analysis, never ordinary backprop"],
      ["Checkpointed reverse", "Same gradients with recompute", "Activation-memory limited", "Deep model training"]
    ]
  },
  "why-transformers-do-not-explode": {
    title: "Stability levers",
    intro: "Treat instability as a signal-budget failure and identify where scale first leaves its safe range.",
    columns: ["Lever", "Controls", "Failure signature", "First check"],
    rows: [
      ["Initialization", "Forward and gradient variance", "Immediate growth or collapse", "Fan-in and residual scaling"],
      ["Normalization", "Sublayer input scale", "Depth-dependent drift", "Placement and epsilon"],
      ["Optimizer", "Parameter update size", "Loss spikes after warmup", "Learning rate and clipping"],
      ["Precision", "Representable numerical range", "Inf, NaN, or silent underflow", "Accumulator dtype and loss scaling"]
    ]
  },
  "choosing-the-next-token": {
    title: "Choose a decoding policy",
    intro: "Match decoding to the objective: diversity, exactness, global likelihood, or structural validity.",
    columns: ["Method", "What it changes", "Best for", "Main failure"],
    rows: [
      ["Greedy", "Always takes local maximum", "Fast deterministic baselines", "Early mistakes cannot recover"],
      ["Temperature + top-p", "Reshapes and truncates uncertainty", "Open-ended generation", "Unstable quality when poorly tuned"],
      ["Beam search", "Keeps likely partial sequences", "Sequence-level likelihood tasks", "Bland or length-biased output"],
      ["Grammar constraint", "Masks invalid next tokens", "JSON, schemas, formal syntax", "Valid structure can still be wrong"]
    ]
  },
  "teaching-a-language-model-to-follow-instructions": {
    title: "Build the SFT dataset",
    intro: "The loss is familiar; the behavior comes from example selection, masking, and coverage.",
    columns: ["Decision", "Good default", "Why", "Failure if ignored"],
    rows: [
      ["Examples", "Diverse, correct demonstrations", "Defines the behavior contract", "Template imitation"],
      ["Loss mask", "Assistant outputs only", "Learns responses, conditions on prompts", "Imitates user/system text"],
      ["Packing", "Isolate example boundaries", "Uses tokens efficiently", "Cross-example leakage"],
      ["Evaluation", "Capability and regression suite", "Checks behavior outside training", "Style gains hide lost skills"]
    ]
  },
  "how-lora-changes-a-model-without-rewriting-it": {
    title: "Choose an adaptation strategy",
    intro: "Pick based on the size of the behavior shift, memory budget, and whether adapters must remain composable.",
    columns: ["Method", "Trainable state", "Strength", "Choose when"],
    rows: [
      ["Full fine-tuning", "All weights", "Maximum update freedom", "Large data and memory; one final model"],
      ["LoRA", "Low-rank deltas", "Portable and memory-efficient", "Task shift fits a constrained update"],
      ["QLoRA", "LoRA + quantized base", "Lowest base-weight memory", "A large frozen model must fit one device"],
      ["Prompt/prefix tuning", "Learned input state", "Very small footprint", "Behavior shift is narrow and deployment supports it"]
    ]
  },
  "inside-an-ai-agent-harness": {
    title: "Assign responsibilities",
    intro: "Put judgment in the model and guarantees in deterministic machinery whenever the boundary is available.",
    columns: ["Concern", "Model owns", "Harness owns", "Required evidence"],
    rows: [
      ["Planning", "Candidate next action", "Budgets and stopping rules", "Explicit goal and state"],
      ["Tool use", "Intent and arguments", "Schema validation and execution", "Typed observation"],
      ["Memory", "Use retrieved evidence", "Write, index, provenance", "Source-linked record"],
      ["Safety", "Recognize ambiguity", "Permissions, sandbox, approvals", "Auditable event log"]
    ]
  },
  "memory-is-more-than-context": {
    title: "Choose the memory layer",
    intro: "Store information according to its lifetime and how it will change a future decision.",
    columns: ["Layer", "Stores", "Lifetime", "Retrieve when"],
    rows: [
      ["Working", "Current plan and state", "One task", "Every relevant turn"],
      ["Episodic", "What happened", "Many tasks", "A similar situation recurs"],
      ["Semantic", "Stable facts and entities", "Until invalidated", "A decision needs factual context"],
      ["Procedural", "How to perform actions", "Until workflow changes", "Selecting or executing a method"],
      ["Reflective", "Consolidated lessons", "Long-lived", "Planning from prior successes and failures"]
    ]
  },
  "how-multi-agent-systems-actually-coordinate": {
    title: "Choose the topology",
    intro: "Add coordination structure only for a concrete advantage over one capable agent with the same budget.",
    columns: ["Topology", "Advantage", "Cost", "Choose when"],
    rows: [
      ["Orchestrator + workers", "Clear control and parallel tasks", "Central bottleneck", "Subtasks and dependencies are explicit"],
      ["Peer-to-peer", "Flexible collaboration", "Message and state conflicts", "Agents have complementary local knowledge"],
      ["Debate / voting", "Independent error correction", "Correlated answers and judge cost", "Several checkable approaches exist"],
      ["Shared blackboard", "Artifact-centered coordination", "Consistency and ownership", "Work accumulates in structured shared state"]
    ]
  },
  "reinforcement-learning-for-agents-from-first-principles": {
    title: "Design the training environment",
    intro: "The environment is the data generator; weak resets or rewards contaminate every policy update.",
    columns: ["Requirement", "Why it matters", "Failure", "Design response"],
    rows: [
      ["Resettable", "Creates comparable episodes", "State contamination", "Snapshots or isolated sandboxes"],
      ["Verifiable", "Supplies trustworthy reward", "Reward hacking", "Hidden state predicates"],
      ["Representative", "Matches deployment decisions", "Sim-to-real gap", "Realistic tools and noise"],
      ["Observable", "Supports credit and debugging", "Opaque failures", "Structured event and state logs"]
    ]
  },
  "how-attention-moves-information": {
    title: "Choose the attention pattern",
    intro: "The useful variant is the cheapest pattern that preserves the retrieval paths the task needs.",
    columns: ["Pattern", "Reach", "Cost / cache", "Choose when"],
    rows: [
      ["Full MHA", "Every allowed token", "Highest KV and quadratic scores", "Context is moderate and quality dominates"],
      ["GQA / MQA", "Full reach", "Smaller KV cache", "Autoregressive serving is bandwidth-limited"],
      ["Sliding window", "Local neighborhood", "Linear local scores", "Recent context carries most signal"],
      ["Compressed / latent", "Full through bottleneck", "Reduced stored state", "A learned summary retains retrieval quality"]
    ]
  },
  "the-puzzle-of-overparameterization": {
    title: "Interpret the capacity curve",
    intro: "Parameter count changes both expressivity and the geometry through which optimization selects a function.",
    columns: ["Regime", "Training error", "Test behavior", "Best question"],
    rows: [
      ["Underparameterized", "Nonzero", "Bias dominated", "What structure cannot be represented?"],
      ["Near interpolation", "Approaches zero", "Variance can peak", "Is the fit ill-conditioned?"],
      ["Overparameterized", "Zero", "Second descent may appear", "Which interpolating solution is selected?"],
      ["Long training", "Already zero", "Grokking may improve rules", "Is function complexity still changing?"]
    ]
  },
  "how-llms-are-pretrained": {
    title: "Build the token pipeline",
    intro: "Every pipeline stage changes the probability that a type of information reaches the optimizer.",
    columns: ["Stage", "Decision", "Protects", "Common failure"],
    rows: [
      ["Source", "Coverage and licensing", "Capability breadth", "One dominant domain"],
      ["Filter", "Quality and safety thresholds", "Signal per token", "Removing rare valuable data"],
      ["Deduplicate", "Exact and semantic similarity", "Diversity and eval integrity", "Benchmark leakage"],
      ["Mix / schedule", "Sampling weight over time", "Capability allocation", "Static ratios after saturation"],
      ["Pack", "Boundaries and sequence length", "Compute utilization", "Unwanted document leakage"]
    ]
  },
  "mixing-data-without-losing-capabilities": {
    title: "Diagnose a mixture",
    intro: "Use held-out capability changes to distinguish insufficient exposure, conflicting gradients, and simple saturation.",
    columns: ["Observation", "Likely cause", "Intervention", "Watch next"],
    rows: [
      ["New skill flat", "Too little effective weight", "Raise sampling or loss weight", "Marginal gain per token"],
      ["Old skill regresses", "Interference or forgetting", "Replay or isolate updates", "Cross-domain loss delta"],
      ["Large domain dominates", "Size-proportional sampling", "Temperature or capped sampling", "Gradient contribution"],
      ["All domains plateau", "Mixture or capacity saturated", "Change schedule, data, or model", "Fresh eval frontier"]
    ]
  },
  "how-language-models-learn-to-use-tools": {
    title: "Locate a tool-use failure",
    intro: "Evaluate each decision separately; a successful API call is not the same as a solved task.",
    columns: ["Stage", "Question", "Failure", "Metric"],
    rows: [
      ["Need", "Should any tool be called?", "Hallucinated or missed call", "Need-detection accuracy"],
      ["Select", "Which affordance applies?", "Wrong tool", "Top-k tool recall"],
      ["Ground", "Are arguments valid and correct?", "Schema or entity error", "Execution validity"],
      ["Use result", "Did evidence change the answer?", "Ignored observation", "Outcome improvement"],
      ["Verify", "Did the world reach the goal?", "Claimed success", "Final-state pass rate"]
    ]
  },
  "the-making-of-an-ai-agent": {
    title: "Build the agent loop",
    intro: "Each component closes a different gap between a stateless language model and reliable action.",
    columns: ["Component", "Function", "Without it", "Owner"],
    rows: [
      ["State", "Represents current reality", "Transcript reconstruction", "Harness"],
      ["Policy", "Chooses the next action", "No adaptive behavior", "Model"],
      ["Tools", "Observe and change the world", "Text-only simulation", "Harness boundary"],
      ["Verifier", "Checks goal and effects", "Confident false completion", "Environment / harness"],
      ["Stopping rule", "Bounds the episode", "Loops and runaway cost", "Harness"]
    ]
  },
  "what-changed-inside-the-transformer": {
    title: "Why each organ changed",
    intro: "Modern modifications survived when they removed a scaling bottleneck without breaking the residual-stream skeleton.",
    columns: ["Component", "Common modern choice", "Primary gain", "New trade-off"],
    rows: [
      ["Normalization", "Pre-norm RMSNorm", "Deep training stability", "Less explicit centering"],
      ["Position", "RoPE / relative methods", "Useful displacement geometry", "Context extension needs care"],
      ["Feed-forward", "SwiGLU or MoE", "Quality or conditional capacity", "Wider projections or routing"],
      ["Attention KV", "GQA / MLA", "Smaller cache and bandwidth", "Compression can cost quality"],
      ["Kernels", "Fused attention and MLP", "Less memory traffic", "Hardware-specific complexity"]
    ]
  },
  "scaling-laws-from-first-principles": {
    title: "Use a scaling law responsibly",
    intro: "A forecast is a controlled extrapolation, not permission to ignore regime changes.",
    columns: ["Step", "Do", "Why", "Stop if"],
    rows: [
      ["Fit", "Run several smaller scales", "Estimate trend and uncertainty", "Curves are not smooth"],
      ["Allocate", "Optimize N and D under C", "Avoid obvious undertraining", "Data quality is not comparable"],
      ["Validate", "Hold out a larger run", "Test extrapolation", "Residuals shift systematically"],
      ["Adjust", "Include serving and data constraints", "Compute-optimal is not product-optimal", "Assumptions leave the fitted regime"]
    ]
  },
  "reinforcement-learning-from-first-principles": {
    title: "What each RL component fixes",
    intro: "Most practical machinery either reduces gradient variance or prevents a destructive policy jump.",
    columns: ["Component", "Role", "Fixes", "Risk"],
    rows: [
      ["Return", "Scores sampled consequences", "Missing action labels", "High variance"],
      ["Baseline / value", "Defines expected outcome", "Noisy absolute reward", "Value bias"],
      ["Advantage / GAE", "Assigns relative credit", "Long-horizon noise", "Bias–variance tuning"],
      ["Clip / KL", "Limits update distance", "Policy collapse", "Learning becomes too conservative"]
    ]
  },
  "teaching-a-model-what-we-prefer": {
    title: "Choose the preference path",
    intro: "The methods differ mainly in whether reward is modeled explicitly and how policy drift is constrained.",
    columns: ["Method", "Signal", "Advantage", "Main risk"],
    rows: [
      ["SFT", "Preferred demonstrations", "Simple and stable", "No rejected contrast"],
      ["Reward model + PPO", "Learned scalar reward", "Can optimize sampled behavior", "Reward hacking and complexity"],
      ["DPO", "Preferred vs rejected pairs", "Direct, stable objective", "Limited to comparison coverage"],
      ["Rule / verifier reward", "Programmatic outcome", "Scalable when correctness is checkable", "Proxy shortcuts"]
    ]
  }
};

Object.assign(BLOG_FLASHCARD_TABLES, {
  "how-reinforcement-learning-teaches-models-to-reason": {
    title: "Choose the reasoning feedback",
    intro: "Use the densest trustworthy feedback available without making one canonical trace the only valid route.",
    columns: ["Feedback", "Coverage", "Strength", "Failure mode"],
    rows: [
      ["Outcome verifier", "Final answer", "Cheap, objective, scalable", "Sparse credit and reward hacks"],
      ["Process labels", "Intermediate steps", "Dense credit", "Expensive and overconstraining"],
      ["Learned reward", "Flexible qualities", "Works without exact checker", "Model bias and exploitation"],
      ["Group-relative reward", "Answers to one prompt", "No separate value model", "Weak signal when group lacks diversity"]
    ]
  },
  "thinking-in-tokens": {
    title: "Spend reasoning tokens",
    intro: "A useful token changes later computation; extra narration that preserves the same state is pure cost.",
    columns: ["Token use", "Carries forward", "Helps when", "Waste signal"],
    rows: [
      ["Decompose", "Subgoals and order", "Dependencies are long", "Restates the prompt"],
      ["Calculate", "Intermediate variables", "One pass cannot retain arithmetic", "Repeats known values"],
      ["Branch", "Alternative hypotheses", "Early choices are uncertain", "Branches are not compared"],
      ["Verify", "Checks and contradictions", "Errors are detectable", "Rubber-stamps the prior answer"]
    ]
  },
  "how-models-improve-without-changing-their-weights": {
    title: "Choose the test-time strategy",
    intro: "Additional compute helps through more useful paths or better selection—not by making one path verbose.",
    columns: ["Strategy", "Adds", "Needs", "Choose when"],
    rows: [
      ["Longer chain", "Serial depth", "Productive reasoning policy", "One trajectory needs decomposition"],
      ["Best-of-N", "Independent complete attempts", "Reliable ranker", "Generation is harder than verification"],
      ["Voting", "Answer frequency", "Uncorrelated errors", "Correct answers form a stable mode"],
      ["Search", "Conditional branch expansion", "Partial-state score", "Some branches can be pruned early"],
      ["Tools", "External compute or evidence", "Safe action interface", "The task exceeds internal recall"]
    ]
  },
  "how-to-find-what-is-slowing-your-model": {
    title: "From symptom to profiler",
    intro: "Use the least detailed tool that can falsify the current bottleneck hypothesis.",
    columns: ["Symptom", "Likely class", "Inspect", "Candidate fix"],
    rows: [
      ["GPU gaps", "Host, launch, dependency", "CPU–GPU timeline", "Compile, pipeline input, remove sync"],
      ["Long low-AI kernels", "Memory bandwidth", "Roofline and bytes", "Fuse, reuse, reduce precision"],
      ["Long high-AI kernels", "Compute throughput", "Tensor-core counters", "Tile and use supported shapes"],
      ["Ranks waiting", "Communication or imbalance", "Distributed timeline", "Overlap, bucket, remap topology"],
      ["Good average, bad tail", "Queueing or stragglers", "Latency distribution", "Admission and scheduling"]
    ]
  },
  "the-serving-playbook": {
    title: "Choose the serving technique",
    intro: "First identify whether the service is limited by queueing, prefill compute, decode bandwidth, or KV capacity.",
    columns: ["Technique", "Targets", "Wins when", "Trade-off"],
    rows: [
      ["Continuous batching", "Decode utilization", "Requests arrive and finish irregularly", "Scheduler complexity"],
      ["Paged KV", "Fragmentation and capacity", "Sequence lengths vary", "Block metadata and indirection"],
      ["Prefix cache", "Repeated prefill", "Prompts share long prefixes", "Cache lookup and invalidation"],
      ["Chunked prefill", "Decode tail latency", "Long prompts block live decoding", "Longer individual prefill"],
      ["Disaggregation", "Phase-specific scaling", "Prefill and decode loads differ", "KV transfer and routing"],
      ["Speculative decode", "Target decode steps", "Draft acceptance is high", "Draft and verification overhead"]
    ]
  },
  "the-mechanics-of-llm-inference": {
    title: "Diagnose the inference phase",
    intro: "Prefill and decode share weights but expose different limits, so optimize their user-facing latencies separately.",
    columns: ["Phase", "Parallel dimension", "Common limit", "Primary metric"],
    rows: [
      ["Queue", "Requests over time", "Admission and capacity", "Queue delay"],
      ["Prefill", "Prompt positions", "Compute and attention", "Time to first token"],
      ["Decode", "Active requests", "Weight/KV bandwidth", "Inter-token latency"],
      ["Sampling", "Vocabulary and constraints", "CPU/GPU synchronization", "Per-step overhead"],
      ["KV management", "Sequences and blocks", "Memory capacity/fragmentation", "Maximum live tokens"]
    ]
  },
  "the-parallelism-playbook": {
    title: "How to choose parallelism",
    intro: "Start from the resource that fails to fit or finish, then choose the partition whose communication matches the fastest available links.",
    columns: ["Constraint", "Technique", "What is partitioned", "Communication / cost", "Choose when"],
    rows: [
      ["Need more throughput", "Data parallel / DDP", "Batch examples", "Gradient all-reduce", "One model replica fits per worker"],
      ["Optimizer state does not fit", "ZeRO / FSDP", "States, gradients, parameters", "Gather + reduce-scatter", "Model compute fits but persistent state does not"],
      ["One layer does not fit", "Tensor parallel", "Matrix dimensions / heads", "Collectives inside every layer", "Fast intra-node links are available"],
      ["Whole model does not fit", "Pipeline parallel", "Contiguous layer stages", "Activations + pipeline bubbles", "Stages can be balanced across devices"],
      ["Context activations do not fit", "Context / sequence parallel", "Token positions", "Attention and normalization exchanges", "Very long sequences dominate memory"],
      ["MoE experts do not fit", "Expert parallel", "Expert parameters and routed tokens", "All-to-all + load imbalance", "Sparse experts expand capacity per token"],
      ["Several constraints", "Hybrid N-D parallel", "Multiple axes", "Interacting collectives", "Map chatty axes within-node and quieter axes across nodes"]
    ]
  },
  "inside-a-training-step": {
    title: "Read the training memory ledger",
    intro: "Separate persistent state from tensors whose lifetime ends during forward, backward, or the optimizer step.",
    columns: ["Memory", "Scales with", "Lifetime", "Reduction lever"],
    rows: [
      ["Weights", "Parameter count", "Entire run", "Lower precision or sharding"],
      ["Optimizer states", "Parameters × states", "Entire run", "ZeRO/FSDP or cheaper optimizer"],
      ["Gradients", "Trainable parameters", "Backward to update", "Sharding or low-rank adaptation"],
      ["Activations", "Batch × tokens × width × layers", "Forward through backward", "Checkpointing or smaller microbatch"],
      ["Temporaries", "Largest kernels / collectives", "One operation", "Fusion, tiling, buffer reuse"]
    ]
  },
  "talk-is-not-cheap": {
    title: "Choose the communication strategy",
    intro: "Message size decides whether startup latency or link bandwidth matters; topology decides which algorithm can reach that limit.",
    columns: ["Situation", "Dominant term", "Prefer", "Avoid"],
    rows: [
      ["Many tiny tensors", "Startup latency α", "Bucket or fuse messages", "One collective per tensor"],
      ["Large dense tensor", "Bytes / bandwidth", "Bandwidth-efficient ring", "Extra copies and slow links"],
      ["Small reduction", "Collective depth", "Tree-like reduction", "Long sequential ring"],
      ["Multi-node hierarchy", "Slowest boundary", "Hierarchical collective", "Topology-blind rank order"],
      ["Independent compute exists", "Critical-path overlap", "Launch communication early", "False overlap with hidden dependency"]
    ]
  },
  "why-fast-gpus-still-wait-for-memory": {
    title: "Choose the optimization",
    intro: "Arithmetic intensity determines whether to reduce byte traffic or improve arithmetic throughput.",
    columns: ["Regime", "Evidence", "Optimize", "Usually ineffective"],
    rows: [
      ["Memory-bound", "AI below ridge; bandwidth high", "Fuse, reuse, quantize, coalesce", "More peak FLOPs"],
      ["Compute-bound", "AI above ridge; tensor cores busy", "Better tiling and math units", "Only reducing launches"],
      ["Latency-bound", "Tiny kernels and gaps", "Fuse or compile graph", "Bandwidth tuning alone"],
      ["Capacity-bound", "Working set does not fit", "Shard, recompute, compress", "Faster kernel on same footprint"]
    ]
  },
  "why-gpus-are-built-for-deep-learning": {
    title: "Map the workload to the processor",
    intro: "Choose throughput hardware when regular parallel work can amortize movement and launch overhead.",
    columns: ["Workload property", "GPU advantage", "Requirement", "CPU may win when"],
    rows: [
      ["Massive data parallelism", "Many arithmetic lanes", "Thousands of independent operations", "Problem is small"],
      ["Regular matrix math", "Tensor cores", "Supported shapes and precision", "Control flow dominates"],
      ["Reusable tiles", "Shared memory and cache", "Locality-aware kernels", "Access is irregular"],
      ["Long memory latency", "Warp switching", "Enough occupancy", "Single request needs minimum latency"]
    ]
  },
  "inside-a-modern-vision-encoder": {
    title: "Choose the image intake",
    intro: "Resolution policy and connector compression jointly determine what evidence survives and what the LLM must pay for.",
    columns: ["Method", "Detail", "Token cost", "Failure"],
    rows: [
      ["Fixed resize", "Uniform global view", "Predictable and low", "Small text and objects disappear"],
      ["Crop", "High detail in selected region", "Low to moderate", "Missed context outside crop"],
      ["Tiling", "High local detail + overview", "Grows with tiles", "Duplicated regions and spatial stitching"],
      ["Native / dynamic resolution", "Preserves aspect and detail", "Variable", "Batching and position complexity"],
      ["Query compression", "Task-shaped summaries", "Fixed downstream", "Fine evidence lost in bottleneck"]
    ]
  },
  "one-transformer-two-modalities": {
    title: "What changes at the modality boundary",
    intro: "The transformer middle can be shared only after each modality supplies a compatible sequence and geometry.",
    columns: ["Stage", "Text", "Vision", "Shared after"],
    rows: [
      ["Tokenize", "Discrete subword IDs", "Continuous pixel patches", "Projection to width d"],
      ["Position", "1D order", "2D row and column", "Position-aware vectors"],
      ["Mask", "Often causal", "Often bidirectional", "Task-specific interaction graph"],
      ["Backbone", "Attention + FFN", "Attention + FFN", "Vector sequence exists"],
      ["Output", "Vocabulary logits", "Class, region, or features", "Task head defines meaning"]
    ]
  },
  "an-image-is-a-sentence": {
    title: "Control the ViT token budget",
    intro: "Patch size and spatial hierarchy decide whether detail or quadratic attention becomes the limiting resource.",
    columns: ["Design", "Token interaction", "Benefit", "Choose when"],
    rows: [
      ["Vanilla ViT", "Global at one scale", "Maximum flexibility", "Resolution is moderate and data is large"],
      ["DeiT recipe", "Global at one scale", "Data-efficient training", "Private pretraining scale is unavailable"],
      ["Pyramid", "Tokens merge by stage", "Multiscale dense features", "Detection and segmentation need hierarchy"],
      ["Windowed / Swin", "Local windows + shifts", "High-resolution efficiency", "Local structure dominates early"],
      ["Video tokens", "Space × time", "Motion reasoning", "Temporal cost can be constrained"]
    ]
  },
  "across-the-cnnverse": {
    title: "Choose the convolutional block",
    intro: "CNN families differ in how they buy receptive field and channel mixing under a compute budget.",
    columns: ["Block", "Spatial mixing", "Channel mixing", "Best use"],
    rows: [
      ["Dense convolution", "k×k across all channels", "Inside same kernel", "Simple, hardware-friendly baseline"],
      ["Bottleneck", "Narrow middle convolution", "1×1 projections", "Deep residual networks"],
      ["Depthwise separable", "Per-channel k×k", "Separate 1×1", "Mobile or low-FLOP models"],
      ["Dilated", "Sparse enlarged kernel", "Normal channel mix", "Large receptive field without downsampling"],
      ["ConvNeXt block", "Large depthwise kernel", "Inverted bottleneck", "Transformer-era CNN accuracy"]
    ]
  },
  "evolution-of-ml-architectures": {
    title: "Compare information movement",
    intro: "Architecture choice follows the structure that should be cheap: locality, persistent state, or content-addressed retrieval.",
    columns: ["Primitive", "Information path", "Training parallelism", "Natural strength"],
    rows: [
      ["Dense", "All features in one layer", "High", "Fixed-size global mixing"],
      ["Convolution", "Local then expanding", "High", "Spatial locality and translation"],
      ["Recurrence", "Through serial state", "Low across time", "Streaming and compact state"],
      ["Attention", "Direct content-based edges", "High across known tokens", "Flexible retrieval"],
      ["State-space", "Structured recurrent scan", "Parallelizable training", "Long sequences and streaming"],
      ["Hybrid", "Primitive chosen by layer", "Mixed", "Balancing retrieval with efficiency"]
    ]
  },
  "how-models-know-where-they-are": {
    title: "Choose positional geometry",
    intro: "The best encoding makes task-relevant relationships easy while surviving the lengths and shapes expected at inference.",
    columns: ["Method", "Represents", "Strength", "Limitation"],
    rows: [
      ["Learned absolute", "Token index", "Flexible in training range", "Fixed table and weak extrapolation"],
      ["Sinusoidal", "Absolute multiscale phase", "No learned table", "Frequency behavior still shifts"],
      ["Relative bias", "Pairwise displacement", "Direct distance preference", "Bias form can limit geometry"],
      ["RoPE", "Relative phase in Q/K", "Natural dot-product displacement", "Long-context scaling is delicate"],
      ["2D / multimodal", "Row, column, time, modality", "Preserves structured coordinates", "More axes need calibration"]
    ]
  },
  "what-an-optimizer-actually-does": {
    title: "Choose the update geometry",
    intro: "Match the optimizer to gradient noise, curvature, state budget, and distributed bandwidth—not habit.",
    columns: ["Method", "Memory", "Adaptation", "Choose when"],
    rows: [
      ["SGD", "One update buffer or none", "Global learning rate", "Scale is uniform and memory is tight"],
      ["Momentum", "First moment", "Temporal smoothing", "Directions are noisy but persistent"],
      ["AdamW", "First + second moments", "Per-coordinate scale", "Transformer gradients vary by coordinate"],
      ["Matrix-aware / Muon", "Matrix update state", "Balances matrix directions", "Large 2D parameters dominate and kernels support it"],
      ["Sharded optimizer", "State divided by ranks", "Same logical rule", "Optimizer memory no longer fits locally"]
    ]
  },
  "the-geometry-of-normalization": {
    title: "Choose what to normalize",
    intro: "Axis choice determines which examples or features share statistics and which scale information disappears.",
    columns: ["Method", "Statistics over", "Keeps batch independent?", "Choose when"],
    rows: [
      ["BatchNorm", "Batch + spatial per channel", "No", "CNN batches are large and stable"],
      ["LayerNorm", "Features per token/example", "Yes", "Transformer tokens need centered scale"],
      ["RMSNorm", "Feature RMS per token", "Yes", "Scaling control is enough and simplicity matters"],
      ["GroupNorm", "Channel groups per example", "Yes", "Vision batches are small"],
      ["InstanceNorm", "Spatial map per channel/example", "Yes", "Instance style statistics should be removed"]
    ]
  },
  "why-neural-networks-need-nonlinearity": {
    title: "Choose an activation",
    intro: "Start with gradient flow and gating behavior, then account for sparsity, precision, and projection cost.",
    columns: ["Activation", "Derivative behavior", "Strength", "Main cost / failure"],
    rows: [
      ["Sigmoid / tanh", "Saturates at both ends", "Smooth bounded gate", "Vanishing gradients"],
      ["ReLU", "0 or 1", "Cheap and sparse", "Dead negative units"],
      ["GELU / SiLU", "Smooth self-gate", "Stable transformer features", "Dense and slightly costlier"],
      ["SwiGLU", "Learned multiplicative gate", "Strong quality per compute", "Extra projection width"],
      ["Squared ReLU", "Zero then growing slope", "Sparse high-response features", "Large activation tails"]
    ]
  }
});

Object.entries(BLOG_FLASHCARD_TABLES).forEach(([slug, table]) => {
  if (window.BLOG_FLASHCARDS[slug]) window.BLOG_FLASHCARDS[slug].table = table;
});

// Decks added with the Run-the-code bar release
Object.assign(window.BLOG_FLASHCARDS, {
  "building-grounded-document-intelligence": {
    "title": "Building Grounded Document Intelligence",
    "readTime": "24 min",
    "summary": "Every document pipeline throws something away. The series builds a text form of the page that does not, grounding models that point with masks instead of typed coordinates, and a loop that connects them.",
    "framework": [
      "Find what the text form of a page drops",
      "Replace typed coordinates with masks that SAM draws",
      "Feed the best grounding model back into the pipeline"
    ],
    "takeaway": "Give each module the task it does best: agents for judgment, tools for deterministic steps, a language model for what to ground and a segmenter for where. The four systems form a loop, not a list of papers.",
    "cards": [
      [
        "What problem does the series start from?",
        "Every common way of turning a page into text throws information away, and everything built on that text inherits the loss. The first job is a text form that keeps the words, the structure, where things sit and how they look."
      ],
      [
        "What is the second idea?",
        "Grounding should be a mask, not a string of typed coordinates. The vision-language model decides what to ground and at what granularity, and SAM draws where, trained end to end."
      ],
      [
        "How do REPLICA, M3Grounder, DoCoG and DocLayout-VL form a loop?",
        "REPLICA rebuilds pages in a complete text form, which generates grounded training data. That data trains the three grounding models, and DocLayout-VL then takes over REPLICA's first stage."
      ],
      [
        "What design principle runs through all four systems?",
        "Divide the work and give each module the task it does best. Agents handle judgment, tools handle deterministic steps, a language model decides what to ground and a segmenter decides where."
      ]
    ],
    "deepDive": [
      [
        "Why do existing formats lose appearance and geometry?",
        "Markdown and plain text cannot write a coordinate or a font colour, and generic HTML makes position and style optional. What a format does not require, a system does not produce, so FID-HTML requires both inline on every element."
      ],
      [
        "What does REPLICA do, and what are its limits?",
        "It splits the job into Segment, Localize, Assemble and Refine, and the last stage checks the render, up to five times; it reaches 0.86 overall on VFDR-Bench. It works one page at a time, does not recover the exact font family, and the refine loop costs latency."
      ],
      [
        "Why does grounding by typed coordinates break?",
        "Typed coordinates are expensive, because a curved polygon takes hundreds of tokens, and unanchored, so they can be hallucinated. They are also the wrong shape for curved text and wedges, and singular when real evidence is in several places."
      ],
      [
        "How does the data engine avoid typing coordinates?",
        "A language model reads the FID-HTML, writes a question and cites an element ID; the ID maps to a box and SAM makes the mask. This gave about 2M grounded QA pairs, 1.5M step-wise QA and 80M masks."
      ],
      [
        "How do the three grounding models differ?",
        "They share one recipe, a VLM plus SAM. Only the interaction between grounding tokens changes: none in M3Grounder, along a chain in DoCoG and along a tree in DocLayout-VL."
      ],
      [
        "Does the gain come from data or from architecture?",
        "The three papers share one 8B backbone, so the post can separate them. Zero-shot it barely grounds, fine-tuning on the data gets most of the way, and the VLM plus SAM design closes the rest by 18 to 34 points."
      ]
    ],
    "results": [
      [
        "Reconstruction",
        "GPS 0.86 vs 0.43",
        "On VFDR-Bench, REPLICA's global position score is 0.86, against 0.43 for the best of 15 baselines."
      ],
      [
        "Answers versus evidence",
        "85.8 / 81.9 vs 84.2 / 11.4",
        "On DoCoG-Bench, DoCoG scores 85.8 answer quality and 81.9 grounding. Gemini 3 Pro answers well but grounds at 11.4."
      ],
      [
        "Gap closed by the design",
        "18 to 34 points",
        "With the same 8B backbone fine-tuned on the same data, the VLM plus SAM design adds this much on top."
      ]
    ],
    "resultLinks": [
      5,
      4,
      9
    ],
    "table": {
      "title": "First-of-their-kind capabilities and their results",
      "intro": "Each paper opens a capability the post says did not exist before, and sets the state of the art on its own benchmark.",
      "columns": [
        "Model",
        "New capability",
        "Benchmark and metric",
        "Ours vs best other"
      ],
      "rows": [
        [
          "REPLICA",
          "Visually faithful document reconstruction",
          "VFDR-Bench, global position (GPS)",
          "0.86 vs 0.43, best of 15 baselines"
        ],
        [
          "M3Grounder",
          "Mask-based, multi-span, multi-granular grounded VQA",
          "GDQA-Bench, grounding F1",
          "79.0 vs 43.4, Gemini-2.5-Pro"
        ],
        [
          "DoCoG",
          "Step-wise, multi-type grounded chain-of-thought VQA",
          "DoCoG-Bench, answer / grounding",
          "85.8 / 81.9 vs 84.2 / 11.4, Gemini 3 Pro"
        ],
        [
          "DocLayout-VL",
          "Open-set, hierarchical, promptable layout understanding",
          "HOPLay-Docs-Bench, overall",
          "79.4 vs 37.2, Gemini 3 Pro"
        ]
      ]
    }
  },
  "replica-visually-faithful-document-reconstruction": {
    "title": "REPLICA: Visually Faithful Document Reconstruction",
    "readTime": "38 min",
    "summary": "REPLICA rebuilds a page as HTML that keeps its words, structure, positions and appearance, checks the result against the original, and turns every rebuilt page into labelled training data.",
    "framework": [
      "Ask what a text conversion drops: geometry and appearance",
      "Require position and style in the format, then split the work into checked stages",
      "Score each axis separately and verify the render"
    ],
    "takeaway": "A text form of a page loses information mostly because of its target format, so the format must require position and style. Decomposing the job into checked stages, with a render check at the end, beat a larger single model on this task.",
    "cards": [
      [
        "Why does converting a page to text lose information?",
        "A page holds text, structure, geometry and appearance, and common conversions drop the last two. In the invoice example, losing the strikethrough makes four line items add to 6,420.00, while the page's own subtotal is 4,020.00."
      ],
      [
        "What is FID-HTML?",
        "Ordinary HTML that a browser renders and a model can read, with one rule: every element carries its position and style inline. It encodes text, hierarchy, semantic tags, positions, styling and figures with generated alt-text."
      ],
      [
        "What are REPLICA's four stages?",
        "Segment builds the layout tree, Localize writes HTML for each region, Assemble merges the pieces and orders them, and Refine renders the page and repairs it against the source. Agents handle judgment and tools handle deterministic steps."
      ],
      [
        "How does a rebuilt page become training data?",
        "Every element comes out with an ID, text, box and style, so a language model can write a question and cite the element ID. The ID maps to a box and a segmenter makes the mask, so grounding is a lookup and no model types a coordinate."
      ]
    ],
    "deepDive": [
      [
        "Why do existing formats and models fail on geometry and appearance?",
        "Plain text and Markdown cannot write coordinates, some formats are partial, and generic HTML makes position and style optional. What a format does not require, a system does not produce: GPT-5 writes HTML yet scores 0.43 global position and 0.21 line position."
      ],
      [
        "Why check the render and not the markup?",
        "A text similarity score is blind to overflow, wrapping and overlap, because the characters are identical. Refine fits fonts, restores backgrounds and lets a reflection agent patch the CSS up to five times, with a reflection gain of +0.06."
      ],
      [
        "How are position and appearance scored?",
        "GPS scores blocks and LPS scores lines, using the F1 of area-normalised precision and recall after matching boxes; VFS uses a vision-language model as judge. The metrics correlate above 0.8 with seven expert annotators, but the judge is not named, so use VFS to rank systems, not as an absolute value."
      ],
      [
        "How does REPLICA compare with the baselines?",
        "It scores 0.86 overall against 0.58 for GPT-5, and no baseline exceeds 0.43 GPS or 0.22 LPS. GPT-5 has 0.86 visual fidelity but 0.43 GPS, so its pages look right without being the page."
      ],
      [
        "Where do the gains come from in the ablation?",
        "Strengthening Segment carries GPS from 0.34 to 0.69, and later stages cannot recover a block that was never detected. Replacing a single generator with a router and six specialists lifts overall from 0.76 to 0.86."
      ],
      [
        "What are the limits and what is not yet measured?",
        "It works one page at a time, does not recover the exact font family, and reports no absolute latency for the refine loop. No VFDR-Bench score exists yet for REPLICA with DocLayout-VL in place of its detectors."
      ]
    ],
    "results": [
      [
        "Position score",
        "F1 of area-normalised precision and recall",
        "GPS and LPS match each true element to a prediction by IoU, so missed and invented boxes both lower the score."
      ],
      [
        "Global position",
        "GPS 0.86 vs 0.43",
        "REPLICA against GPT-5, the best baseline, on VFDR-Bench."
      ],
      [
        "Router and specialists",
        "0.76 to 0.86 overall",
        "The largest single gain in the ablation, on the same 8B backbone."
      ]
    ],
    "resultLinks": [
      6,
      7,
      8
    ],
    "table": {
      "title": "REPLICA against the best baseline, axis by axis",
      "intro": "Text extraction is largely solved across strong systems, so the gap is in structure, geometry and the overall score.",
      "columns": [
        "Axis",
        "Metric",
        "Best baseline",
        "REPLICA"
      ],
      "rows": [
        [
          "Structure",
          "NTED (lower is better)",
          "0.49 (GPT-5)",
          "0.20"
        ],
        [
          "Global position",
          "GPS",
          "0.43 (GPT-5)",
          "0.86"
        ],
        [
          "Line position",
          "LPS",
          "0.22 (Qwen3-VL)",
          "0.73"
        ],
        [
          "Appearance",
          "VFS",
          "0.86 (GPT-5)",
          "0.93"
        ],
        [
          "Overall",
          "Mean of four axes",
          "0.58 (GPT-5)",
          "0.86"
        ]
      ]
    }
  },
  "m3grounder-mask-based-document-grounding": {
    "title": "Grounding Document Answers With Masks",
    "readTime": "36 min",
    "summary": "M3Grounder lets a vision-language model write a [GROUND] token after each span it cites, and SAM turns each token into three nested pixel masks: phrase, line and block. The post covers why typed boxes break on documents and what the design costs.",
    "framework": [
      "See why typed boxes fail on curved, plural and small evidence",
      "Let a grounding token prompt SAM, with document losses and data from REPLICA",
      "Read the gains as grounding, not better answers"
    ],
    "takeaway": "Data teaches a model what to ground, and the output representation decides what it can draw. If errors sit on irregular shapes or several regions, more data for a box model will not fix them.",
    "cards": [
      [
        "Why does grounding with typed boxes break on documents?",
        "The numbers are next-token predictions that nothing ties to pixels, and rectangles are the wrong shape for curves and wedges. Evidence is often in several places, and precise shapes cost many tokens."
      ],
      [
        "How does M3Grounder ground an answer?",
        "After each cited span the model writes a [GROUND] token, whose hidden state goes through three small heads into three SAM prompts. The result is phrase, line and block masks from one model trained end to end."
      ],
      [
        "What does the result show?",
        "M3Grounder-Q reaches 79.0 grounding F1 on GroundingDocQA-Bench, against 43.4 for Gemini-2.5-Pro. It also beats the best prior result on BoundingDocs, DOGR-Bench and MMDocBench."
      ],
      [
        "What does grounding not improve?",
        "The answers. Answer quality is 80.1 against 81.9 for Qwen3-VL fine-tuned on the same data, and DocVQA is 92.1 against 96.1 for the base model; the gain is checkable evidence."
      ]
    ],
    "deepDive": [
      [
        "Why not chain OCR, a VLM and SAM?",
        "The chain fails where an answer string must be matched to OCR text, so a misread curved banner gives SAM no prompt. Three stages that are each right 90% of the time give at most 73%."
      ],
      [
        "What do the two document losses do?",
        "A bleed loss keeps masks off graphics around the text, and a hierarchy loss keeps phrase inside line inside block. The hierarchy loss lifts phrase F1 from 74.0 to 78.2 but block F1 only from 84.4 to 84.7."
      ],
      [
        "How is the training data made without typed coordinates?",
        "REPLICA rebuilds each page as FID-HTML, a language model cites element IDs, and Hi-SAM turns the boxes into masks. The engine inherits its components' errors, since filtering removes errors but does not fix them."
      ],
      [
        "Is the gain from data or architecture?",
        "Both, on different evidence. Data lifts single-span F1 from 15.7 to 68.1, while on curved and skewed evidence data reaches 38.3 and the architecture adds 47 points, to 85.3."
      ],
      [
        "What do the ablations teach?",
        "Training on phrase level only drops phrase F1 from 79.0 to 71.3, so coarse supervision helps fine grounding. One shared head scores 63.6, and LoRA instead of full fine-tuning drops phrase F1 to 61.5."
      ],
      [
        "Where does it sit in the series, and what are its limits?",
        "It is the first payoff of the loop, since REPLICA made 140K of the 200K training documents possible, and DoCoG and DocLayout-VL build on it. It works on one page, adds about 63 ms per sample, and masks fix shape but not localisation."
      ]
    ],
    "results": [
      [
        "Grounding F1",
        "79.0 vs 43.4",
        "M3Grounder-Q against Gemini-2.5-Pro on GroundingDocQA-Bench."
      ],
      [
        "Error tolerance of a box",
        "\\(\\mathrm{IoU}=\\frac{s-d}{s+d}\\)",
        "A box shifted by d along a side of length s passes IoU above 0.5 only if d is under s/3, so a 14-pixel line tolerates under 5 pixels."
      ],
      [
        "Chain success bound",
        "\\(r_1 \\cdot r_2 \\cdot r_3\\)",
        "Three chained stages each right 90% of the time succeed at most 73% of the time."
      ]
    ],
    "resultLinks": [
      2,
      0,
      4
    ],
    "table": {
      "title": "One 8B backbone: data versus architecture",
      "intro": "Grounding F1 on GroundingDocQA-Bench for Qwen3-VL-8B, zero-shot, fine-tuned on the data with box outputs, and as M3Grounder-Q.",
      "columns": [
        "Evidence type",
        "Zero-shot",
        "Fine-tuned (boxes)",
        "M3Grounder-Q"
      ],
      "rows": [
        [
          "Single-span",
          "15.7",
          "68.1",
          "84.2"
        ],
        [
          "Multi-span",
          "3.8",
          "37.7",
          "63.5"
        ],
        [
          "Curved and skewed",
          "11.6",
          "38.3",
          "85.3"
        ],
        [
          "Overall grounding F1",
          "12.8",
          "60.6",
          "79.0"
        ]
      ]
    }
  },
  "docog-grounded-chain-of-thought": {
    "title": "Grounding Every Step of a Document Answer",
    "readTime": "38 min",
    "summary": "DoCoG writes a chain of thought in which every step that reads the page also marks what it read with a pixel mask. It needs a small module between the language model and SAM, and a preference stage that does not break the masks.",
    "framework": [
      "See that a computed answer has nothing to point at",
      "Ground each reading step and refine the pointers together",
      "Protect the grounding interface during preference training"
    ],
    "takeaway": "Grounding the reads makes reasoning checkable and also improved answers in the ablation. Freezing a downstream module does not protect it if you keep training the module that feeds it.",
    "cards": [
      [
        "Why is grounding only the final answer not enough?",
        "The answer may be computed and printed nowhere, like the $27.50 on the bill. It may be a judgement, and a correct answer can rest on wrong reads."
      ],
      [
        "What does DoCoG do?",
        "Every step that reads the page emits a [GND] token that becomes a pixel mask, and arithmetic steps mark nothing. It works across text, tables, charts and flowcharts."
      ],
      [
        "What does the result show?",
        "On DoCoG-Bench it scores 85.8 answer quality and 81.9 final-answer grounding. Gemini 3 Pro answers at 84.2 but grounds at 11.4."
      ],
      [
        "What does grounding not fix?",
        "Arithmetic, because computation steps carry no mask. On TabMWP DoCoG scores 80.7, below a table specialist at 88.3 and GPT-5 at 93.7."
      ]
    ],
    "deepDive": [
      [
        "What does GIM do, and why not a bigger language model?",
        "GIM is a three-layer module between the language model and SAM. Its self-attention lets every pointer see every other in both directions and its cross-attention checks each against the segmenter's features, and removing it drops final-answer grounding from 81.9 to 69.6. The post notes no larger-backbone ablation was run, so the claim holds for this interface, not in general."
      ],
      [
        "How is the training data built?",
        "DoCoG-QA has 325K documents and 1.5M question-answer pairs, written by a language model that cites mask IDs and checked by four filters. Masks for graphical elements come from SAM 3, with 33,500 checked by hand, so grounding scores measure agreement with those masks."
      ],
      [
        "What does preference training add?",
        "DPO on 20K chain pairs uses a reward over format, answer, chain quality and grounding, and lifts answer quality from 84.1 to 85.8 and final-answer grounding from 80.3 to 81.9. The authors describe it as, to their knowledge, the first use of DPO for grounded document VQA."
      ],
      [
        "What goes wrong in preference training, and how is it fixed?",
        "GIM and SAM are frozen, but the hidden states they read drift as the language model changes, and final-answer grounding falls from 81.9 to 41.7. An anchor loss keeps the refined embeddings near the supervised model's; without it answer quality also falls to 78.1, which the post does not explain."
      ],
      [
        "Do reasoning and grounding help each other?",
        "Yes. Answer quality rises from 78.1 with no grounding to 81.5 with final-answer masks and 84.1 with grounded steps, and reasoning first lifts final-answer grounding from 69.3 to 77.8."
      ],
      [
        "Why does Gemini 3 Pro ground so poorly here?",
        "Part of the gap is format, since boxes are scored as masks. On box benchmarks Gemini 3 Pro scores 65.3 on DOGR and 73.5 on BoundingDocs, against 75.4 and 85.4 for DoCoG, so read 11.4 as no step-wise mask evidence in this format."
      ]
    ],
    "results": [
      [
        "Answer versus grounding",
        "85.8 / 81.9",
        "DoCoG's answer quality and final-answer grounding on DoCoG-Bench, against 84.2 and 11.4 for Gemini 3 Pro."
      ],
      [
        "Anchored preference loss",
        "\\(\\mathcal{L}_{opt}=\\mathcal{L}_{DPO}+\\lambda_{anchor}\\mathcal{L}_{anchor}\\)",
        "The anchor term keeps GIM-refined embeddings near the supervised model's, so final-answer grounding stays at 81.9 instead of 41.7."
      ],
      [
        "Grounded steps",
        "78.1 to 84.1 answer quality",
        "Answer quality rises from no grounding to grounded steps in the progressive ablation."
      ]
    ],
    "resultLinks": [
      2,
      7,
      8
    ],
    "table": {
      "title": "DoCoG on public benchmarks",
      "intro": "DoCoG beats the best open baseline on most rows. Commercial models still win several answer benchmarks, and DoCoG leads every grounding metric.",
      "columns": [
        "Benchmark",
        "DoCoG",
        "Best open baseline",
        "Best commercial"
      ],
      "rows": [
        [
          "ChartQA",
          "92.7",
          "91.0 (Chart-R1)",
          "89.0 (GPT-5)"
        ],
        [
          "CharXiv",
          "73.1",
          "68.8 (InternVL3.5)",
          "80.3 (Gemini 3 Pro)"
        ],
        [
          "TabMWP",
          "80.7",
          "88.3 (SynTab-LLaVA)",
          "93.7 (GPT-5)"
        ],
        [
          "MMDocBench, IoU",
          "70.5",
          "28.7 (Qwen3-VL)",
          "55.4 (Gemini 3 Pro)"
        ],
        [
          "BoundingDocs, grounding F1",
          "85.4",
          "44.5 (Qwen3-VL)",
          "73.5 (Gemini 3 Pro)"
        ]
      ]
    }
  },
  "doclayout-vl-promptable-layout-segmentation": {
    "title": "DocLayout-VL: Hierarchical, Open-Set, Promptable Document Layout Segmentation",
    "readTime": "34 min",
    "summary": "DocLayout-VL treats a page as a tree of masks. A language model writes the tree with one [LAY] token per region, attention follows the tree, and SAM draws every region in whatever vocabulary the prompt asks for.",
    "framework": [
      "See where closed-set boxes fall short",
      "Write the tree, refine tokens along it, and draw masks",
      "Judge it on breadth, not on winning every dataset"
    ],
    "takeaway": "For layout, the output interface matters more than parameter count or reasoning tokens. DocLayout-VL replaces REPLICA's detector ensemble, but its case is breadth, and cross-page structure stays open.",
    "cards": [
      [
        "What is wrong with closed-set box detectors?",
        "Four independent failures. Boxes are the wrong shape for seals and wedges, a fixed label set cannot keep up with real domains, a flat list loses the page tree, and the output cannot change with the request."
      ],
      [
        "How does DocLayout-VL work?",
        "A vision-language model writes the layout tree as tagged text with a [LAY] token per region. HGC refines the tokens along the tree, SAM turns each into a mask, and the prompt sets the vocabulary."
      ],
      [
        "What does it achieve?",
        "It scores 79.4 overall on HOPLay-Docs-Bench, against 37.2 for Gemini 3 Pro, the best zero-shot model. On the hierarchical track it gets 77.5 Open mIoU against 6.9."
      ],
      [
        "Where does it not win?",
        "On simple, saturated benchmarks the per-dataset detectors stay slightly ahead and are cheaper. DocLayout-YOLO gets 96.9 on PubLayNet against 96.5, and 97.5 on TableBank against 97.3."
      ]
    ],
    "deepDive": [
      [
        "What does HGC do?",
        "Each [LAY] token attends only to its parent, children and siblings, and removing HGC drops hierarchical Open mIoU from 77.5 to 58.3 while the flat track barely moves. The mask trusts the predicted tree, so a well-formed but wrong tree is not corrected."
      ],
      [
        "What do the structure losses add?",
        "Containment keeps a child inside its parent, overlap keeps siblings apart, and background keeps masks off margins, which Dice cannot do. Removing the structure loss lowers hierarchical Open mIoU from 77.5 to 72.3 and raises flat from 86.7 to 87.2."
      ],
      [
        "Where does the training data come from?",
        "HOPLay-Docs-80M has 2.5M pages with 80M masks, 400K open-set labels and 5M promptable annotations, built by rebuilding pages as HTML first. Most labels are written by a model, and only the benchmark is human-verified."
      ],
      [
        "What do the curriculum and data-scale experiments show?",
        "Training on flat layouts, then trees, then instructions beats one joint pass, 77.5 against 68.7 on the tree. The curriculum on half the data reaches 70.2, and the gap to a box-writing VLM grows from 35.1 to 45.0 points as data rises from 25% to 100%."
      ],
      [
        "Do scale or reasoning fix layout?",
        "No. Qwen3-VL-8B scores 31.6 overall and the 235B model 31.5, while fine-tuning the 8B with boxes gives 45.8. Models can also explain well and point badly: Gemini 3 Pro has 77.6 G-Eval but 28.9 cumulative IoU on prompts."
      ],
      [
        "How does it close the loop with REPLICA, and what stays open?",
        "It replaces the detector ensemble and two agents in REPLICA's Segment stage, which the post supports with results like 67.8 against 47.4 for DocLayout-YOLO on OmniDocBench. It handles one page at a time, long trees are slow, and training labels are model-written."
      ]
    ],
    "results": [
      [
        "Overall score",
        "\\(OS=\\tfrac14\\,[\\text{flat}+\\text{hier}+\\text{curved}+\\text{prompt}]\\)",
        "The mean of four track scores. DocLayout-VL-8B scores about 79.4."
      ],
      [
        "Tree attention mask",
        "\\(A=\\mathrm{softmax}\\!\\left(QK^{\\top}/\\sqrt{d_k}+B_{\\hat T}\\right)\\)",
        "B is zero for a token, its parent, children and siblings, and minus infinity elsewhere."
      ],
      [
        "Curriculum versus joint training",
        "77.5 vs 68.7",
        "Hierarchical Open mIoU with the three-stage curriculum against one joint pass."
      ]
    ],
    "resultLinks": [
      2,
      4,
      7
    ],
    "table": {
      "title": "Layout approaches on HOPLay-Docs-Bench",
      "intro": "Only the last row combines masks, open labels and a tree of any depth. Scores are the overall score from the post.",
      "columns": [
        "Approach",
        "Regions and labels",
        "Structure",
        "Overall score"
      ],
      "rows": [
        [
          "Hierarchical parser (DocParser)",
          "Boxes, fixed labels",
          "Tree from detected boxes",
          "4.3"
        ],
        [
          "VLM page parsers (Dolphin, Chandra)",
          "Boxes, fixed element types",
          "Element sequence",
          "6.6 and 20.1"
        ],
        [
          "Zero-shot VLM (Gemini 3 Pro)",
          "Boxes typed as text, open labels",
          "Can write nesting, weak trees",
          "37.2"
        ],
        [
          "Qwen3-VL-8B fine-tuned with boxes",
          "Boxes typed as text, open labels",
          "Tree as text",
          "45.8"
        ],
        [
          "DocLayout-VL",
          "Masks, open labels set by the prompt",
          "Full tree of any depth",
          "79.4"
        ]
      ]
    }
  }
});

// Decks added with the Run-the-code bar release
Object.assign(window.BLOG_FLASHCARDS, {
  "teaching-language-models-to-see": {
    "title": "Teaching Language Models to See",
    "readTime": "39 min",
    "summary": "Connecting a strong vision encoder to a strong language model only matches shapes. Pretraining is what makes image vectors mean something to the language model, through the choice of what to freeze, what data to mix, and how many visual tokens to spend.",
    "framework": [
      "Align the connector so image vectors are readable by the language model",
      "Decide which parts to freeze, which data to mix, and what resolution to use",
      "Spend the budget on token count and data density, not connector design"
    ],
    "takeaway": "The post's reading of the ablations is that a good VLM is mainly a data and curriculum problem within a sensible architecture. Architecture matters mostly through what each visual token costs.",
    "cards": [
      [
        "Why can't you just plug a vision encoder into a language model with a linear layer?",
        "A linear layer only makes the widths agree. The language model has never seen these vectors, so they can sit in the wrong place, at the wrong scale, or carry content it cannot read, and the answer comes out fluent and wrong."
      ],
      [
        "When has an image vector become a token the language model understands?",
        "When a frozen or lightly tuned language model can use it to predict the right next words. For a caption that says \"a red bicycle\", the image tokens should make \"red\" and \"bicycle\" more likely."
      ],
      [
        "Why freeze parts of the model during pretraining?",
        "Freezing protects what the models already know, shields them from noisy gradients through a random connector, and saves memory. The cost is capacity: in VILA, a frozen language model gave decent zero-shot results but lacked in-context learning."
      ],
      [
        "Why does a pretraining recipe mix several data types?",
        "Each type teaches a different skill, and one type dominating warps the model. Captions alone give a describer, and OCR alone can cost ground on natural images. Text-only data guards against forgetting."
      ]
    ],
    "deepDive": [
      [
        "Why is a contrastive encoder only a starting point?",
        "It is trained to match one pooled vector to a short caption, so its patch features are never supervised directly. Captions rarely mention small text, counts or positions, so recipes let the encoder keep learning once dense, text-heavy and spatial data arrive."
      ],
      [
        "Is a projector-only alignment stage needed?",
        "Papers disagree. LLaVA keeps it, while Prismatic reports that skipping it has no effect and saves 20 to 25% of compute, and Molmo saw no gain. The post reconciles them: the skippers used clean, high-quality data. With noisy captions or a high language-model learning rate, keep a short alignment stage."
      ],
      [
        "When should the vision encoder be unfrozen?",
        "In MM1's ablation a frozen encoder was better by 2.2 points at lower resolutions, and unfreezing was better by 2.9 points at 1344 pixels. PaliGemma saw unfreezing improve spatial tasks. The post's advice is to unfreeze with a lower learning rate when you change resolution or need spatial skills."
      ],
      [
        "Why is resolution a data-mixture decision?",
        "Visual token count grows with the square of the side length, and every image token costs training compute even though it carries no loss. So resolution sets how much compute each data source receives. MM1 found that token count and resolution matter most, and connector type little."
      ],
      [
        "Does the vision encoder need a purely visual training signal?",
        "The post calls this open, with evidence both ways. Language loss alone can train an encoder (CapPa, Qwen2-VL's first stage). But Prismatic saw significant gains from fusing DINOv2 features with SigLIP, which suggests visual self-supervision captures things captions miss."
      ],
      [
        "Is a good VLM mainly an architecture problem or a data problem?",
        "The evidence leans toward data and curriculum within a sensible architecture. MM1 called connector design comparatively negligible, and Shukor and colleagues found no inherent advantage for late over early fusion across 457 models. Architecture still decides what each visual token costs."
      ]
    ],
    "results": [
      [
        "Visual token count",
        "\\(N_v = (H/P)(W/P)/r^2\\)",
        "At 336 px with P = 14 and no merging this gives 576 tokens, and doubling the side length quadruples the count."
      ],
      [
        "Memory rule of thumb",
        "16 bytes vs 2 per parameter",
        "Mixed-precision Adam needs about 16 bytes per trained parameter and 2 per frozen one, about 112 GB against 14 GB for a 7B language model before activations."
      ],
      [
        "MM1 final mixture",
        "45 / 45 / 10",
        "MM1 used 45% interleaved documents, 45% caption pairs and 10% text-only data, with nothing frozen, for about 400 billion tokens."
      ]
    ],
    "resultLinks": [
      7,
      2,
      3
    ],
    "table": {
      "title": "Which components are trained",
      "intro": "Recipes usually walk down this table over their stages, from the connector alone to joint training.",
      "columns": [
        "Setting",
        "Goal",
        "Examples",
        "Main caution"
      ],
      "rows": [
        [
          "Encoder frozen, connector trained, LM frozen",
          "Align the two spaces",
          "LLaVA stage 1, BLIP-2, Flamingo",
          "Backward still passes through the whole language model, so it is not cheap"
        ],
        [
          "Encoder frozen, connector and LM trained",
          "Teach the language model to use image tokens",
          "LLaVA stage 2, Qwen-VL stage 3, Prismatic",
          "Text-only ability can degrade without text data in the mix"
        ],
        [
          "Encoder and connector trained, LM frozen",
          "Adapt the vision side",
          "Qwen-VL stage 1, Qwen2-VL stage 1, InternVL 1.5 pretraining",
          "Gives up capacity on the language side"
        ],
        [
          "All three trained",
          "Joint co-adaptation",
          "PaliGemma, MM1, Molmo, Idefics2",
          "Highest capacity and highest risk; early divergence is possible"
        ]
      ]
    }
  },
  "how-vision-language-models-scale": {
    "title": "How Vision-Language Models Scale",
    "readTime": "40 min",
    "summary": "A VLM has two towers, a connector, and a variable number of tokens per image, so a text-only scaling law does not carry over cleanly. The post walks through the published evidence and says plainly that no Chinchilla-style law exists yet for late-fusion VLMs.",
    "framework": [
      "Count compute per tower, including frozen towers and sunk cost",
      "Spend on LLM quality and visual tokens rather than a bigger encoder",
      "Set the token budget per task and size the data filter to the run"
    ],
    "takeaway": "For late-fusion VLMs the biggest compute decision is the choice of LLM, and the main vision knob is visual token count, not encoder size. Most findings come from one setup or one family, so treat them as evidence rather than a law.",
    "cards": [
      [
        "What makes a VLM scaling law harder than a text-only one?",
        "A VLM has three parameter groups (encoder, connector, LLM), a mixture of data kinds, and an image that can be 64 or 7,000 tokens depending on resolution and merging. Most VLMs are also built from towers whose training cost was paid earlier."
      ],
      [
        "Why does the vision encoder matter more for small VLMs than for large ones?",
        "The encoder sees every patch while the LLM sees only the merged tokens, so a 2 x 2 merge multiplies the encoder's weight. With Qwen2-VL's 675M encoder it is about 64% of visual compute next to a 1.5B LLM and under 4% next to the 72B LLM."
      ],
      [
        "Should you spend a budget on a bigger encoder or a stronger LLM?",
        "The evidence leans toward the LLM once the encoder is decent. Idefics2 found language-model quality mattered more than vision-backbone quality, and MM1 saw resolution add more than a larger encoder. PaLI argued the opposite earlier, so read each ablation with how its encoders were trained."
      ],
      [
        "How should you set the number of visual tokens?",
        "Set it per task type. In Li et al. (2024), visual reasoning favored the largest LLM with very few visual tokens, while OCR and document tasks reversed that and kept as many tokens as possible."
      ]
    ],
    "deepDive": [
      [
        "Does freezing the LLM cut its training compute by two thirds?",
        "No. If the connector below it is trained, gradients still flow back through the frozen LLM, so it costs about 4 FLOPs per parameter per token instead of 6. The real saving is memory, since there is no optimizer state or weight gradient."
      ],
      [
        "Why are reported training-token counts hard to compare across VLMs?",
        "Reused towers carry sunk cost. InternVL 2.5-78B reports about 120B multimodal tokens against 1.4T for Qwen2-VL-72B, and credits its pretrained 6B InternViT. A law fitted on VLM-stage tokens alone measures the cost of adaptation, not of the model."
      ],
      [
        "Why can the best data filter change with the compute budget?",
        "High-quality data runs out of fresh samples, and repeats teach less. In Goyal et al.'s experiment on a 128M pool, aggressive filtering won early, then plateaued, and with enough compute even the unfiltered pool caught up. Choose the threshold together with the planned run length."
      ],
      [
        "Do early-fusion and late-fusion models scale differently?",
        "Not in the loss slope. Shukor et al. trained 457 models from scratch and found nearly identical exponents. Late fusion wanted more parameters, early fusion more tokens, and early fusion was slightly better and cheaper at small budgets. Late fusion's practical edge is the free pretrained LLM."
      ],
      [
        "Does a flat benchmark curve mean more data stops helping?",
        "Not necessarily. In WebLI-100B, going from 10B to 100B pairs barely moved ImageNet and COCO, but raised Dollar Street geolocalisation from 35.9% to 41.7% at equal compute. Measure on your own users' distribution before concluding data is saturated."
      ],
      [
        "What is still unknown about VLM scaling?",
        "There is no published late-fusion equivalent of Chinchilla for splitting a budget across encoder, LLM, visual tokens and multimodal tokens. Open questions the post lists include loss versus capability, the value of repeated images, token allocation across images, and which encoder objective scales best."
      ]
    ],
    "results": [
      [
        "Compute per sample",
        "\\(C \\approx 6N_V P + 6N_L(V+T)\\)",
        "Encoder FLOPs scale with patches P, LLM FLOPs scale with merged visual tokens V plus text tokens T, and frozen towers use 2 or 4 instead of 6."
      ],
      [
        "Inference trade-off",
        "\\(\\alpha \\approx 0.077,\\ \\beta \\approx 0.015\\)",
        "In Li et al. (2024) error fell about five times faster with LLM size than with visual tokens on visual reasoning, though OCR reverses this."
      ],
      [
        "Resolution versus size",
        "23.5 vs 18.9 per example",
        "PaliGemma 2's 3B model at 896 px costs more to train per example than its 28B model at 224 px."
      ]
    ],
    "resultLinks": [
      1,
      3,
      3
    ],
    "table": {
      "title": "Where the evidence points",
      "intro": "Each row is one scaling axis, with the finding and the limit the post puts on it.",
      "columns": [
        "Axis",
        "Finding",
        "Source",
        "Caveat"
      ],
      "rows": [
        [
          "Vision tower",
          "A shape-optimized 400M ViT matched a 2.5x larger one at equal compute",
          "Alabdulmohsin et al.",
          "Shape exponents were fitted per setting"
        ],
        [
          "Data filtering",
          "The best filter depends on how much compute the run uses",
          "Goyal et al.",
          "Small models (ViT-B/32)"
        ],
        [
          "Encoder versus LLM",
          "LLM quality had more impact than vision-backbone quality at fixed parameters",
          "Idefics2",
          "Compared existing encoders, one possibly under-trained"
        ],
        [
          "Visual tokens",
          "Few tokens with the largest LLM for reasoning; many tokens for OCR",
          "Li et al. (2024)",
          "One LLM family and one compressor"
        ],
        [
          "Fusion style",
          "Same loss exponent for early and late fusion",
          "Shukor et al.",
          "Small scale, 0.3B to 3B, loss not benchmarks"
        ]
      ]
    }
  },
  "one-model-many-visual-skills": {
    "title": "One Model, Many Visual Skills",
    "readTime": "42 min",
    "summary": "Post-training turns a pretrained VLM into one assistant with many skills by supervised fine-tuning on examples of the wanted behavior. Most of the work is in the data: what to include, in what proportion, who wrote it, and what conflicts with what.",
    "framework": [
      "Treat SFT as behavior cloning: the data decides the behavior",
      "Watch for conflicts: formats, forgetting and teacher errors",
      "Judge mixture changes with a capability vector on image-dependent benchmarks"
    ],
    "takeaway": "One set of weights can learn many visual skills, but the skills share parameters and so help and hurt each other. Most fixes the post describes are about conditioning, replay and verification rather than new architecture.",
    "cards": [
      [
        "What separates pretraining from visual instruction tuning?",
        "Both use the same next-token loss. Pretraining scores every text token of captions and web text, while SFT scores only the response, given an image and an instruction, so the data distribution decides the behavior learned."
      ],
      [
        "Why do short-answer datasets hurt conversation, and what fixes it?",
        "Without a marker, the model learns that answers about images are short. LLaVA-1.5 appended a format prompt, Molmo used style tags and Cambrian-1 used system prompts, so the style depends on the input and both can coexist."
      ],
      [
        "Why mix text-only data into multimodal SFT?",
        "Multimodal tuning updates the weights that carry the language model's text skills. In VILA, re-blending text-only data fixed text degradation and raised VLM accuracy, and MM1.5 found text weight from 0 to 0.2 had minor effects on multimodal benchmarks."
      ],
      [
        "Why can a teacher model's synthetic data be risky?",
        "Its mistakes are systematic. POPE ties hallucinated objects to frequent or co-occurring objects in the instruction data, so a teacher's bias becomes the student's bias. The post recommends verifying object mentions against the image and adding negative questions."
      ]
    ],
    "deepDive": [
      [
        "Which tokens get loss in multimodal SFT, and why does it matter?",
        "Only assistant tokens and the end-of-turn token get loss. Visual tokens never do. In the post's example about 1,190 positions carry only 16 loss tokens, so the visual tokens cost most of the compute while a handful of answer tokens supply the signal."
      ],
      [
        "How does loss normalization change the effective mixture?",
        "With a per-token average, a source's share of the gradient is its sampling weight times its answer length. With half the examples being one-word answers of about 2 tokens against 150-token captions, the short answers get about 1.3% of the signal, against 50% with a per-example average."
      ],
      [
        "Do capability and style come from the same data?",
        "The post says no. Vision-Flan's authors found GPT-4-synthesized conversational data mainly changed the response format, and about 1,000 samples were enough for that. Task coverage builds the skills, and a small clean assistant-style set sets the voice."
      ],
      [
        "Should the vision encoder be unfrozen during instruction tuning?",
        "Evidence disagrees. Prismatic found that fine-tuning the visual backbone significantly degraded performance, while Cambrian-1 found unfreezing widely beneficial. The post suggests unfreezing only with enough data, a reduced learning rate and a grounding benchmark, and notes that VLMs can fail even when the encoder holds the information."
      ],
      [
        "Does a correct reasoning chain show the model used the image?",
        "No. MathVerse found models that relied heavily on the text, with some scoring over 5% higher with no image. A direct test is counterfactual: change the image so the answer should change, and check that the rationale changes with it."
      ],
      [
        "Is a staged curriculum better than one joint mixture?",
        "The evidence is split. Prismatic found the alignment stage could be removed, saving 20 to 25% compute, while Cambrian-1 found two-stage training beneficial. The post reconciles this by alignment data size: a short stage adds little, a large one acts as extra pretraining. Its rule is to stage when trainable parts or sequence length differ, and use one joint mixture within a stage."
      ]
    ],
    "results": [
      [
        "Loss-token share",
        "1.3% vs 50%",
        "With half the examples as 2-token answers and half as 150-token captions, a per-token average gives the short answers about 1.3% of the signal, against 50% per example."
      ],
      [
        "Text replay",
        "79.8 to 84.1",
        "NVLM's 72B model raised its average text score on MMLU, GSM8K, MATH and HumanEval from 79.8 for its Qwen2-72B-Instruct backbone to 84.1."
      ],
      [
        "Image-use check",
        "Over 5% higher without image",
        "MathVerse found some models scored more than 5% higher with no image at all, so a correct rationale does not show the model looked."
      ]
    ],
    "resultLinks": [
      5,
      2,
      8
    ],
    "table": {
      "title": "Forgetting levers",
      "intro": "Each lever buys protection at some cost; the post calls text replay the only one with evidence of helping both sides.",
      "columns": [
        "Lever",
        "Protects",
        "Cost or risk",
        "Evidence"
      ],
      "rows": [
        [
          "Text-only replay",
          "Knowledge, maths, code, the user's language",
          "Compute per step; low-quality text can hurt",
          "VILA, NVLM, Qwen2.5-VL (50% text), MM1.5"
        ],
        [
          "Freeze the LLM",
          "All text ability exactly",
          "Visual skills cap out",
          "NVLM: poor results for decoder-only models"
        ],
        [
          "LoRA or DoRA adapters",
          "The base weights",
          "Can learn less, especially new formats",
          "LLaVA-1.5 LoRA scored close to full fine-tuning"
        ],
        [
          "Balanced mixture caps",
          "Stops one source dominating",
          "Discards data from large sources",
          "Cambrian-1: best cap 250K to 350K"
        ],
        [
          "Safety data mixed in",
          "Refusals and safe behavior",
          "Over-refusal if unbalanced",
          "VLGuard, Prismatic: benchmarks do not catch the loss"
        ]
      ]
    }
  },
  "measuring-what-a-vlm-can-do": {
    "title": "Measuring What a VLM Can Do",
    "readTime": "44 min",
    "summary": "A VLM benchmark score is not a property of the model alone. It binds a task, data, a metric and a protocol, and each of the four can fail on its own, so a line like \"state of the art on 20 benchmarks\" is really twenty separate claims.",
    "framework": [
      "Name the four parts behind every number: task, data, metric, protocol",
      "Test whether the benchmark needs the image, leaked, or is too small",
      "Compare numbers only under the same split, metric variant, mode, extractor and source"
    ],
    "takeaway": "Before trusting a score, ask what the metric would mark correct by mistake and whether the image was even needed. A leaderboard average is a weighting choice, so use it to shortlist and then read the columns for the capability you need.",
    "cards": [
      [
        "What four parts sit behind every benchmark number?",
        "Task (the skill it should need), data (images, questions and their source), metric (the rule that scores an answer) and protocol (prompt, resolution, frames, answer extraction, split). Each can fail on its own, so two papers can report the same benchmark and differ by several points."
      ],
      [
        "Why run a blind baseline before trusting a vision benchmark?",
        "Models can score well while ignoring the image. Cambrian-1 found SQA-I, MMMU, MathVista and AI2D change by less than 5% with the image removed, and Gemini Pro reached 42.9% on MMMU with no image in the MMStar study."
      ],
      [
        "How can you tell a VLM has learned the test rather than the skill?",
        "MMStar defines multi-modal leakage as ML = max(0, S_wv - S_t): how far the VLM beats its own base LLM when the image is removed. A large value suggests the benchmark's data, or something close to it, was in training."
      ],
      [
        "Why does the metric matter as much as the data?",
        "Each metric encodes a view of what correct means. Tolerant metrics were added to stop punishing right answers and each created a new way to reward wrong ones, so the useful question is what the metric would score as correct by mistake."
      ]
    ],
    "deepDive": [
      [
        "Why is the answer parser part of the metric?",
        "Models rarely answer in the format the metric expects. MMBench falls back to an LLM choice extractor and MathVista always uses an LLM extractor, so a score with regex extraction and one with LLM extraction are different measurements."
      ],
      [
        "What does CircularEval fix in multiple-choice benchmarks?",
        "It asks each question N times with the options rotated and gives credit only if every pass is right. This removes position bias and cuts chance for four options from 25% to (1/4)^4, about 0.4%. It also means an MMBench number is only comparable to another computed the same way."
      ],
      [
        "Why can a relaxed-accuracy or ANLS score mislead?",
        "ChartQA's 5% tolerance accepts a wrong year such as 2020 for 2019, and its single number averages an easier generated split with a harder human split. ANLS treats all characters equally, so 1,250 versus 7,250 scores 0.8."
      ],
      [
        "Does beating humans on DocVQA mean the benchmark is solved?",
        "Not as stated. The 94.36% human figure is accuracy, while models report ANLS. On the matching metric humans score 98.1 against Qwen2.5-VL-72B's 96.4, so the model is close but still below."
      ],
      [
        "How much can a small benchmark tell you?",
        "The standard error is the square root of p(1-p)/n. At 60% accuracy that is about plus or minus 3 points on MathVista's 1,000 questions and about plus or minus 13 on a 60-question set. A two-point gain on a 200-question benchmark is not evidence of anything."
      ],
      [
        "Which levers move which benchmark scores?",
        "The post cites evidence, not laws. Resolution and OCR data moved Idefics2's DocVQA from 22.6 to 49.9, and Mantis's small multi-image set beat Idefics2-8B by 13 points on multi-image benchmarks. Preference training moved hallucination benchmarks. The post's lesson: look for missing task-shaped data before a larger run."
      ]
    ],
    "results": [
      [
        "VQA accuracy",
        "\\(\\text{Acc}(a)=\\min(\\#\\text{humans}/3,\\,1)\\)",
        "An answer given by at least three of ten annotators is fully correct, and the official code averages over ten leave-one-out subsets."
      ],
      [
        "CircularEval chance",
        "\\((1/4)^4 = 1/256\\)",
        "Asking each four-option question four times with rotated options cuts the chance of passing by guessing from 25% to about 0.4%."
      ],
      [
        "Leakage and gain",
        "\\(MG=S_v-S_{wv}\\)",
        "Multi-modal gain is what the image adds; MMStar filtered 22,401 candidates to 1,500 questions that need the image."
      ]
    ],
    "resultLinks": [
      3,
      5,
      2
    ],
    "table": {
      "title": "Which metric for which output",
      "intro": "Tolerant metrics fix one problem and create another. The last column is what the post says each one misses.",
      "columns": [
        "Metric",
        "Used by",
        "What it rewards",
        "What it misses"
      ],
      "rows": [
        [
          "Exact match",
          "GQA, multiple-choice suites",
          "The canonical answer after normalization",
          "Valid paraphrases such as \"2 people\" versus \"2\""
        ],
        [
          "VQA accuracy",
          "VQAv2, TextVQA, VizWiz",
          "Agreement with at least 3 of 10 humans",
          "Correct answers annotators rarely gave"
        ],
        [
          "ANLS",
          "DocVQA, InfographicVQA, ST-VQA",
          "Reading the right field with small slips",
          "Whether a one-digit error changes the meaning"
        ],
        [
          "Relaxed accuracy",
          "ChartQA, PlotQA",
          "Numeric answers within 5%",
          "Wrong years and large values inside 5%"
        ],
        [
          "LLM judge",
          "MM-Vet, LLaVA-Bench, MMHal-Bench",
          "Free-form quality as a model sees it",
          "Judge bias and reproducibility if the judge changes"
        ]
      ]
    }
  },
  "aligning-vision-language-models": {
    "title": "Aligning Vision-Language Models",
    "readTime": "45 min",
    "summary": "Text-only preference learning rewards answers that sound good, but a judge that cannot see the image cannot tell. The post covers how to build rewards, preference pairs, feedback and safety data that depend on the image, and when a model should abstain.",
    "framework": [
      "Test whether a reward, judge or DPO run actually depends on the image",
      "Build the contrast: on-policy, minimal edits, and image-side pairs",
      "Pair hallucination rates with coverage, and add image-aware safety and abstention"
    ],
    "takeaway": "Preference optimization learns only the distinction its negatives draw, so a pair that differs in style teaches style. Make the image part of the contrast, and audit every judge with an image-ablation test before optimizing against it.",
    "cards": [
      [
        "How does the post define a grounding failure?",
        "Split the log-probability into the language prior plus a visual information gain. A response is ungrounded when its claims about the image are about as likely with the image as without it, so the model answered from its prior."
      ],
      [
        "Why does standard multimodal DPO often ignore the image?",
        "The DPO loss only sees the sum of a text margin and an image margin, and gradient descent takes the easier text route. In mDPO's test, training on the same 10k pairs with all images removed did about the same or slightly better on MMHal-Bench."
      ],
      [
        "How do image-side pairs fix this?",
        "Keep the response fixed and change the image, for example with a crop of up to 20%. The text-only terms then cancel exactly, so the only way to lower the loss is to make the correct response depend more on the correct image."
      ],
      [
        "How do you test whether a reward model or judge reads the image?",
        "Score responses with the true image, with no image and with a different image. A reward whose scores barely move when the image is removed, or whose ranking does not flip when the image changes, is not grounded."
      ]
    ],
    "deepDive": [
      [
        "Why does a helpfulness score not prove better alignment?",
        "In LLaVA-RLHF, the policy trained against a standard reward model learned longer answers. They scored better on LLaVA-Bench (helpfulness) and worse on MMHal-Bench (hallucination). Pair a helpfulness benchmark with a hallucination one."
      ],
      [
        "Why can fewer hallucinations simply mean shorter answers?",
        "CHAIR and Object HalBench reward saying less, since a one-word caption scores perfectly. The post says to report a coverage or recall measure, as AMBER does, next to any hallucination rate, and to check response length."
      ],
      [
        "Why do on-policy pairs and minimal edits work with so little data?",
        "Pairs sampled from the model contain its real errors. Identical prefix tokens cancel in the DPO gradient, so a minimal edit concentrates the signal on the error. RLHF-V's 1.4k corrections beat LLaVA-RLHF's roughly 10k comparisons, and OPA-DPO's 4.8k on-policy examples beat a method trained on 16k. Neither paper isolates a single cause."
      ],
      [
        "Are harder negatives always better?",
        "No. SeVa found medium-strength noise better than weak or strong noise, and mDPO found a crop of up to 20% better than a larger crop, with an unrelated image worse still. Past some point the corrupted image may no longer contradict the caption, so treat difficulty as a hyperparameter."
      ],
      [
        "Where do reward models and AI judges fail?",
        "They fail at seeing, not reasoning. VL-RewardBench found judges fail mostly on basic perception, with GPT-4o at 65.4%. Judges can also hallucinate, show position and verbosity biases, and share the policy's encoder blind spots. Self-feedback worked in RLAIF-V and CSR only because the judgement was broken into small checks or tied to a CLIP image score."
      ],
      [
        "How should a model decide when not to answer?",
        "With a correct answer worth +1, a wrong one costing c and abstaining worth 0, answer only if p > c/(1+c). That holds only for calibrated confidence. Raw softmax confidence let the best models answer fewer than 7.5% of VQA v2 questions at 1% risk, and a learned selector raised that from 6.8% to 15.6%."
      ]
    ],
    "results": [
      [
        "Visual information gain",
        "\\(\\log P(y|x,I)=\\log P(y|x)+g(y;I|x)\\)",
        "The identity splits an answer's log-probability into the language prior and what the image added, and a near-zero gain means the model answered from the prior."
      ],
      [
        "Abstention threshold",
        "\\(p > c/(1+c)\\)",
        "Answer only when confidence exceeds this, which is 0.5 when a wrong answer costs the same as a right one gains and 0.8 when it costs four times as much."
      ],
      [
        "Dense DPO weight",
        "\\(\\gamma = 5\\)",
        "RLHF-V counts corrected tokens five times as much as unchanged ones, and reported a 34.8% reduction in the base model's hallucination rate with 1.4k samples."
      ]
    ],
    "resultLinks": [
      0,
      9,
      6
    ],
    "table": {
      "title": "Ways to build a negative",
      "intro": "A negative only teaches the difference it contains, and each row has a matching failure mode.",
      "columns": [
        "Corruption",
        "Side",
        "Distinction it teaches",
        "Main risk"
      ],
      "rows": [
        [
          "Insert an absent object",
          "Text",
          "Object existence",
          "Implausible objects are too easy"
        ],
        [
          "Sample from the model itself",
          "Text",
          "The model's own errors",
          "Needs a reliable labeller"
        ],
        [
          "Noise the image",
          "Image",
          "Image dependence",
          "Too much noise gives noisy labels"
        ],
        [
          "Crop the image (up to 20%)",
          "Image",
          "Image dependence with partial evidence",
          "The crop may not remove the relevant region"
        ],
        [
          "Unrelated image",
          "Image",
          "Gross mismatch only",
          "Too easy, teaches little"
        ]
      ]
    }
  },
  "when-language-must-point": {
    "title": "When Language Must Point",
    "readTime": "42 min",
    "summary": "Grounding links language to a place in the image as a point, box, polygon or mask. Every system must decide how geometry becomes tokens, or hand the location to a decoder, and that choice shapes cost, precision and what evidence the model can show.",
    "framework": [
      "Pick the output shape that fits the evidence: point, box, polygon or mask",
      "Decide whether to type coordinates, select a proposal, or decode a mask",
      "Measure the regions directly, with metrics matched to the shape and the granularity"
    ],
    "takeaway": "There is no single best interface. Typed coordinates are portable and easy to reward, while a decoder suits irregular or multi-region evidence. Answer accuracy is not a proxy for grounding accuracy.",
    "cards": [
      [
        "Why does grounding matter beyond explanation?",
        "A location is a checkable output and also an input to the next step. It lets a person verify a claim in seconds and lets a program, robot or reward function use the region, as in clicks, crops, grasp targets and IoU rewards."
      ],
      [
        "What are the three ways a model can hand over a location?",
        "It can type coordinates as tokens, select among candidate regions proposed by a detector (as in Groma), or emit a special token whose hidden state prompts a decoder such as SAM (as in LISA)."
      ],
      [
        "Why can a box never fully describe some regions?",
        "The best possible box has an IoU equal to the region's fill ratio. That is about 0.79 for an ellipse, about 0.34 for a curved text line and can be below 0.1 for a thin diagonal text line."
      ],
      [
        "Why does cross-entropy handle coordinates badly?",
        "The loss for a coordinate token depends only on the probability of the true bin, so missing by one bin costs the same as missing by three hundred. An IoU reward gives partial credit that grows as the box gets closer."
      ]
    ],
    "deepDive": [
      [
        "How does the number of bins limit localization?",
        "With W-pixel images and N bins, each edge can be off by up to W/(2N) pixels. A 0-100 grid on a 3840-pixel screenshot has 38.4-pixel bins, so even a perfect model could miss a 24-pixel icon. The post says to size the grid for the smallest target at the largest image you will serve."
      ],
      [
        "Why are coordinate conventions a silent risk?",
        "Models differ in range, axis order and even version. Qwen2.5-VL writes absolute pixels of its resized input, while Qwen3-VL went back to a 0-1000 grid, and PaliGemma puts y before x. A wrong parser still returns valid-looking boxes in the wrong place, so pin the model version and test with a known box."
      ],
      [
        "Why should grounding data include queries with no target?",
        "Classic REC data always has one correct box, so a model learns to draw a confident box even for an object that is absent. GRES, Ferret's GRIT data (about 95K hard negatives) and Molmo's pointing data add not-present cases."
      ],
      [
        "What does a decoder buy, and what does it cost?",
        "In the author's own document-grounding work, with the same 8B backbone, adding SAM lifted DocLayout-VL's open mIoU from 32.5 to 58.3. A decoder adds a second model to serve, about 63 ms of overhead per sample in M3Grounder, and its masks cannot be returned by a text-only API or scored by a text-parsing reward."
      ],
      [
        "Why is granularity a property of the question?",
        "The same pixels can be the right answer to one request and wrong for another: citing a value needs the phrase, redacting it needs the row, and chunking needs the block. A model returning the correct line when the label is a word scores a low IoU, so check that output unit matches annotation unit."
      ],
      [
        "Do grounded reasoning steps prove the model looked at the right place?",
        "Not automatically. GRIT's rewards check only the final answer and the output format, so its boxes show where the model chose to look. On DoCoG-Bench, Gemini 3 Pro scored 84.2 on answer quality but 11.4 on grounding, so evaluate the regions directly."
      ]
    ],
    "results": [
      [
        "Best-box quality",
        "\\(\\text{IoU}(B^*,S)=|S|/|B^*|=f(S)\\)",
        "The tightest enclosing box scores exactly the region's fill ratio, which is about 0.34 for a curved text line."
      ],
      [
        "Quantization worst case",
        "\\(\\text{IoU}_{\\min}=\\left(\\frac{s-\\Delta}{s}\\right)^2,\\ \\Delta=W/N\\)",
        "The error depends on the original image width, not on the resolution the model sees, and small objects suffer most."
      ],
      [
        "Answer vs grounding",
        "84.2 vs 11.4",
        "On DoCoG-Bench, Gemini 3 Pro scored 84.2 on answer quality but 11.4 on grounding, while the author's DoCoG scored 85.8 and 81.9."
      ]
    ],
    "resultLinks": [
      2,
      4,
      9
    ],
    "table": {
      "title": "Choose the grounding interface",
      "intro": "The right choice follows from the shape of the evidence, the number of regions and what consumes the output.",
      "columns": [
        "Situation",
        "Interface",
        "Why",
        "Watch out for"
      ],
      "rows": [
        [
          "Small compact object; click, count or grasp",
          "Points as text",
          "Cheap to label and emit; checked by an inside test",
          "Train points to land on the object, not its centroid"
        ],
        [
          "Crop, zoom or reward the output",
          "Boxes as text on a normalized grid",
          "Parseable and scorable with IoU",
          "Grid must suit the smallest target at the largest resolution"
        ],
        [
          "Irregular, nested or multi-region evidence",
          "Masks from a decoder",
          "The language model decides what, the segmenter decides where",
          "Extra model to serve; not plain text"
        ],
        [
          "Several reading steps",
          "Ground each reading step",
          "Each step becomes checkable",
          "Measure the regions, since a correct answer says little about them"
        ],
        [
          "API that returns only text",
          "Typed coordinates",
          "The only option",
          "Pin the version and test the convention"
        ]
      ]
    }
  },
  "how-vlms-read-documents": {
    "title": "How VLMs Read Documents",
    "readTime": "42 min",
    "summary": "A page is an image whose content is mostly text, layout and structure, so reading it takes more than recognizing characters. The post compares pipelines, end-to-end models and hybrids, and asks what a model should write down and how to measure it.",
    "framework": [
      "Recover the layers of a page: text, blocks, order, tables, hierarchy",
      "Budget pixels and tokens by text density, then choose pipeline, end-to-end or hybrid",
      "Pick an output format and metric that keep what the downstream use needs"
    ],
    "takeaway": "Failures often sit in the upper layers (order, tables, hierarchy), not in character recognition. Pick the poorest output format that still carries what you need, and score with metrics that match your use.",
    "cards": [
      [
        "Why is a page harder than a photograph?",
        "Text is small and dense, every character matters, and pixel order is not reading order. A page also has hierarchy, two-dimensional content such as tables and formulas, long length, and wide variation in scripts and quality."
      ],
      [
        "Where do pipelines and end-to-end models each fail?",
        "A pipeline passes errors along: a misread digit is inherited by every later stage, though each stage can be inspected. An end-to-end model has no joints, but a long generation can go wrong anywhere, including repeating a line and never stopping."
      ],
      [
        "How does a page's token cost scale with resolution?",
        "Tokens grow with the square of the resolution. In the post's Qwen2.5-VL-style arithmetic, an A4 page is about 640 tokens at 72 dpi, 2,780 at 150 dpi and 11,100 at 300 dpi, while ten-point text at 72 dpi is only about 10 pixels per em."
      ],
      [
        "Why does the output format matter?",
        "A format can only carry what it has syntax for. Plain text drops structure, Markdown has no merged cells or positions, and richer formats cost more output tokens, so choose the poorest format that still serves the downstream use."
      ]
    ],
    "deepDive": [
      [
        "Are pipelines of specialist models obsolete?",
        "No. On OmniDocBench v1.5, the pipeline PP-StructureV3 scores 86.73 against 75.02 for GPT-4o and 87.02 for Qwen2.5-VL-72B. The post calls a tuned pipeline the baseline to beat for bulk conversion of clean PDFs."
      ],
      [
        "What is the case for layout-first, two-pass parsers?",
        "MinerU2.5 and PaddleOCR-VL find layout on a small image, then read each element at native resolution. The post says the clearer argument is cost and failure locality, not accuracy, since the scores also differ in encoder, decoder and data. The hybrid still has one weakness: a block that stage one misses is never read."
      ],
      [
        "How far can token compression go?",
        "DeepSeek-OCR reports about 97% decoding precision below 10 text tokens per vision token and about 60% at 20. The ratio is not constant: with 64 vision tokens, precision fell from 96.5% to 59.1% as pages got denser, so measure it on your own documents."
      ],
      [
        "Why is TEDS better than string similarity for tables?",
        "Moving one cell to the wrong column leaves most characters in place, so string scores stay high while the table says something false. TEDS scores the HTML tree by edit distance, so span and position errors count."
      ],
      [
        "Do more pixels always help on long documents?",
        "No. In MMLongBench-Doc, the best model, GPT-4o, reached only 42.7 F1, and 12 of 14 VLMs scored worse than their own language models given lossy OCR text. A good parse followed by a text model can beat page images."
      ],
      [
        "Does the way a model points at evidence matter?",
        "In the author's own M3Grounder results, the same 8B backbone with the same data reached 60.6 grounding F1 writing boxes as text and 79.0 with a VLM-plus-SAM mask design, against 43.4 for Gemini-2.5-Pro. The post attributes that gap to the output design, and flags that this is the author's group's work."
      ]
    ],
    "results": [
      [
        "Page token cost",
        "\\(\\text{tokens}\\approx 0.123\\,d^2\\)",
        "For an A4 page at d dpi with one token per 28 by 28 pixel square, doubling the dpi quadruples the tokens."
      ],
      [
        "Table score",
        "\\(\\text{TEDS}=1-\\frac{\\text{EditDist}}{\\max(|T_a|,|T_b|)}\\)",
        "In the post's worked example, three tree edits over 13 nodes give a TEDS of about 0.83 even though flattened text similarity is 0.97."
      ],
      [
        "Compression limit",
        "About 97% below 10x",
        "DeepSeek-OCR decoded about 97% of text correctly below 10 text tokens per vision token and about 60% at 20, measured on English Fox pages."
      ]
    ],
    "resultLinks": [
      2,
      7,
      6
    ],
    "table": {
      "title": "Three designs for reading a page",
      "intro": "No design wins every row; the hybrid wins most, which is why many 2025 parsers adopted it.",
      "columns": [
        "Aspect",
        "Pipeline of specialists",
        "End-to-end, one pass",
        "Hybrid, layout then crops"
      ],
      "rows": [
        [
          "Dense text",
          "Good on clean print; weak on handwriting",
          "Good if resolution suffices; drops when downscaled",
          "Strong: each element at native resolution"
        ],
        [
          "Speed and cost",
          "Fast, small models can run on CPU",
          "One long generation per page",
          "Short parallel generations; two calls"
        ],
        [
          "Error behavior",
          "Errors cascade across stages",
          "No joints, but loops and hallucinated text can appear anywhere",
          "Layout errors propagate; recognition errors stay local"
        ],
        [
          "Controllability",
          "Swap or tune any stage",
          "Prompt only",
          "Prompt per element type"
        ],
        [
          "Examples",
          "Tesseract, PP-StructureV3, Docling, Marker",
          "Donut, Nougat, GOT, olmOCR, dots.ocr",
          "MinerU2.5, PaddleOCR-VL, Dolphin"
        ]
      ]
    }
  },
  "seeing-in-time": {
    "title": "Seeing in Time",
    "readTime": "44 min",
    "summary": "A video is a stack of images plus time, and time costs tokens while the token budget is fixed. Every design choice in a video model is a way of spending that budget, and many benchmark questions can be answered without using time at all.",
    "framework": [
      "Compute the token budget: duration times frame rate times tokens per frame",
      "Choose frames, compression and a way to tell the model when each frame happened",
      "Test whether a benchmark score needs time with text-only, one-frame and shuffled controls"
    ],
    "takeaway": "Pick the sampling, compression and timing scheme for the questions you expect, since no setting suits every question. Treat a video benchmark score as a blend of image skill and temporal skill until the controls show otherwise.",
    "cards": [
      [
        "Why is video not just more images?",
        "Time adds order, motion, duration and causality, which no single frame contains. Each pulls the budget a different way: motion wants dense frames over a short window, causality wants sparse frames over a long one, and duration and moments need a clock."
      ],
      [
        "How many tokens does a video cost?",
        "N = D x f x tau: duration, frame rate and tokens per frame. One hour at 2 frames per second with 256 tokens per frame is 1,843,200 tokens, and attention cost grows with the square of that count."
      ],
      [
        "What does a fixed budget force you to trade?",
        "Short events need dense frames and long stories need coverage. With 8 uniform frames on the post's one-minute clip, frames are about 7.5 seconds apart and one-second events are usually missed, while a fixed rate high enough to catch them gives enormous token counts on an hour of video."
      ],
      [
        "Why can a high video benchmark score say little about time?",
        "Many questions can be answered from text alone or from one frame. Apollo found NExT-QA and Perception Test largely solved by one frame, and on TempCompass an image-only model scored 89.9 on action questions against 88.5 for the best video model."
      ]
    ],
    "deepDive": [
      [
        "Why does uniform frame sampling hurt training?",
        "It quietly changes the playback speed of every example: N frames from a short clip look like slow motion and N frames from a long video look like fast forward. Apollo found frame-rate sampling consistently better in training, and its fix is to space out short clips instead of stretching the gap between frames."
      ],
      [
        "Does adding more frames always help?",
        "No. LongVA's Video-MME score rose from 47.9 at 8 frames to 52.6 at 128, then fell to 51.8 at 384. LLaVA-Video kept improving to its 110-frame limit on dynamic data. Benefit depends on whether the data and benchmark hold information between the frames you already have, so sweep the count for your task."
      ],
      [
        "Should a video model use a video encoder or an image encoder?",
        "Apollo found SigLIP, an image encoder, was the best single choice across seven encoders. Video encoders won only on temporal perception such as speed and direction, and combining SigLIP with InternVideo2 beat both by about 7 percent. If motion matters, add a video encoder beside the image encoder."
      ],
      [
        "How should a model be told when a frame happened?",
        "Options are order only, text tags, time inside RoPE and text timestamps. Qwen2.5-VL aligned M-RoPE to absolute time, and Qwen3-VL went back to text timestamps because absolute-time positions became large and sparse for long videos and needed costly data. A toy lab model trained at one frame rate ignored the stamps, so training across several frame rates is needed."
      ],
      [
        "Is a perfect needle-in-a-haystack score evidence of long-video understanding?",
        "No. It tests finding one frame. Gemini 1.5 Pro retrieved a word from a single frame across 10.5 hours, yet scored 37.3% on HourVideo against 85.0% for human experts. Use needle tests to check the context works and reasoning benchmarks to check it is used."
      ],
      [
        "What limits temporal grounding before the model runs?",
        "The model can only place a boundary at a frame. With frames delta seconds apart, an event of length L keeps a tIoU of only (L - delta)/L at worst, so a 4-second event sampled every 2 seconds is capped at 0.5. Sample densely around the moments you need to time."
      ]
    ],
    "results": [
      [
        "Video token count",
        "\\(N = D\\cdot f\\cdot\\tau\\)",
        "Duration, frame rate and tokens per frame multiply, so Gemini 2.5 cutting tokens per frame from 258 to 66 fit about three hours instead of one in a million-token context."
      ],
      [
        "Temporal IoU cap",
        "\\(\\text{tIoU}_{\\min}=(L-\\Delta)/L\\)",
        "Frame spacing limits grounding accuracy, giving 0.5 for a 4-second event at 2-second spacing and 0.875 at 2 frames per second."
      ],
      [
        "Slow-fast split",
        "\\(10\\times288+50\\times16=3{,}680\\)",
        "SlowFast-LLaVA spends its token budget on 10 detailed frames and 50 coarse ones, and matched or beat some fine-tuned video models without video training."
      ]
    ],
    "resultLinks": [
      1,
      9,
      2
    ],
    "table": {
      "title": "Three routes for hour-long video",
      "intro": "Each route trades something exact for scale, and none is best for every question.",
      "columns": [
        "Route",
        "Examples",
        "Strength",
        "Risk"
      ],
      "rows": [
        [
          "Read everything",
          "LongVA, LongVILA, Gemini, Qwen3-VL",
          "Nothing is thrown away by a heuristic",
          "Memory and latency; depends on the model using distant tokens"
        ],
        [
          "Compress or remember",
          "LLaMA-VID, MovieChat, MA-LMM, VideoChat-Flash",
          "Scales to any length",
          "The compressor decides what matters before the question is known"
        ],
        [
          "Search, then look",
          "VideoAgent, VideoTree, Video-RAG",
          "Few tokens spent (VideoAgent looked at about 8 frames on average)",
          "Depends on the retriever finding the right moment"
        ]
      ]
    }
  }
});

// Decks added with the Run-the-code bar release
Object.assign(window.BLOG_FLASHCARDS, {
  "pytorch-from-first-principles": {
    "title": "PyTorch From First Principles",
    "readTime": "68 min",
    "summary": "Build a small neural network and its training loop from raw PyTorch, and inspect every tensor on the way. Each piece is tested against the PyTorch code it replaces.",
    "framework": [
      "Print the layout, graph and state of each tensor",
      "Rebuild the piece by hand and match the PyTorch version",
      "Break it on purpose and learn the symptom and the first check"
    ],
    "takeaway": "loss.backward() writes gradients and changes no weights. optimizer.step() reads those gradients and its own state and changes the weights in place. Most timings in the post come from busy machines and single runs, so read them as ratios.",
    "cards": [
      [
        "What does a tensor carry, and why does transpose move no data?",
        "A tensor is a flat storage plus shape, stride and offset, and an element lives at offset plus the sum of index times stride. Transpose swaps two entries of shape and stride, so the storage is untouched."
      ],
      [
        "How does broadcasting work, and what silent bug can it hide?",
        "Shapes line up from the right and each column must match or be 1; stretched dimensions get stride 0, so nothing is copied. A [B, 1] prediction minus a [B] target becomes [B, B], giving a loss of 1.0290 instead of 0.6618 while training still runs."
      ],
      [
        "What happens between loss.backward() and optimizer.step()?",
        "backward walks the recorded graph and writes one .grad per leaf parameter, and no weight changes. step reads .grad and its own state and updates the weights in place, without seeing the graph."
      ],
      [
        "Why must GPU timings call synchronize before reading the clock?",
        "GPU work is queued, so an unsynchronized clock measures only the queueing. A 4096 by 4096 matmul read 0.285 ms against a real 53.6 ms on the Apple M5 GPU, and 0.037 ms against 2.695 ms on an H100."
      ]
    ],
    "deepDive": [
      [
        "When does reshape differ from view?",
        "reshape returns a view on a contiguous tensor and a copy on a non-contiguous one, so writes may or may not reach the original. Use view when you depend on sharing, because it fails loudly after a transpose."
      ],
      [
        "How is cross entropy made stable, and what loss should a useless model start at?",
        "Subtract the row maximum before exp, so no argument exceeds zero. The naive version returns nan on a logit of 100, while the stable one matches F.cross_entropy. A three-class model that learned nothing starts near ln 3 = 1.0986."
      ],
      [
        "How close do the hand-written optimizers get to torch.optim?",
        "Training the same model four times, the largest epoch-loss gap over 60 epochs is exactly 0.00e+00 for both SGD and AdamW. The final tests compare weights after 25 steps and also pass."
      ],
      [
        "What does AdamW do on its first step, and what does its state cost?",
        "The first step is almost exactly lr times sign(g): gradients of 0.0001, -5 and 300 all move a weight by 0.01. In the traced step the state takes 2968 bytes against 1484 bytes of parameters, a ratio of 2."
      ],
      [
        "What did the DataLoader benchmark show about workers?",
        "With 2 ms of work per example, 0 workers gave 496 examples per second and 4 persistent workers gave 1778. Fresh workers took 0.55 s per epoch against 0.34 s persistent. prefetch_factor 2 versus 4 changed nothing, and the comparison with SimpleDataLoader was too noisy to rank."
      ],
      [
        "What did breaking the training loop teach?",
        "A learning rate of 10 exploded the loss and left a dead second ReLU layer, so a logged loss of 4 was not a recovery. Clipping at 1.0 still ended at chance, 0.333 validation accuracy, while lr 0.1 reached 0.998. Skipping zero_grad ended at loss 351.68 against 0.0136, and skipping eval() read 0.900 accuracy against 0.969."
      ]
    ],
    "results": [
      [
        "Silent broadcast",
        "1.0290 vs 0.6618",
        "A [B, 1] against [B] subtraction gave a [B, B] difference and a wrong loss that still trained."
      ],
      [
        "Missing synchronize",
        "0.285 ms vs 53.6 ms",
        "On the Apple M5 GPU the unsynchronized clock was about 188 times too small."
      ],
      [
        "AdamW first step",
        "\\(\\Delta p \\approx lr \\cdot \\text{sign}(g)\\)",
        "On step one the gradient size does not matter, and the learning rate is a distance in weight units."
      ]
    ],
    "resultLinks": [
      1,
      3,
      7
    ],
    "table": {
      "title": "View and copy calls",
      "intro": "Read each call by asking one question: does it move any bytes?",
      "columns": [
        "Call",
        "Moves data",
        "Result",
        "Use it when"
      ],
      "rows": [
        [
          "view",
          "Never",
          "Shares storage; fails if strides do not line up",
          "You depend on writes reaching the original"
        ],
        [
          "reshape",
          "Only when view would fail",
          "A view or a copy",
          "You do not mind which one you get"
        ],
        [
          "contiguous",
          "Only when not already contiguous",
          "Always contiguous",
          "After a transpose, to make the copy visible before view"
        ],
        [
          "clone",
          "Always",
          "New storage",
          "Keeping small pieces of a big tensor"
        ]
      ]
    }
  },
  "the-hugging-face-stack": {
    "title": "The Hugging Face Stack",
    "readTime": "60 min",
    "summary": "Rebuild what each Hugging Face library automates, run both versions, and check that the numbers agree. When they agree, you know what the library does. When they differ, you have found a hidden choice.",
    "framework": [
      "Write the thing the library does by hand",
      "Run both versions and compare the numbers",
      "Choose the lightest layer that does the job"
    ],
    "takeaway": "Agreement checks are solid: the raw loop matches Trainer to float precision. Timings are single runs on a busy CPU machine, so they are rough guides only. Several of the worst bugs raise no error and need a count or a comparison to catch.",
    "cards": [
      [
        "Which choices make a raw loop match Trainer?",
        "Sequential data order, token-level loss normalisation over the whole accumulated batch, no weight decay on biases and norms, a linear schedule, and clipping. Over 60 steps the largest loss gap is 1.43e-06 and the gradient norms print as equal."
      ],
      [
        "Why does the library's language-model collator break SFT on this checkpoint?",
        "It masks labels by pad value, and here the pad token equals the EOS token. All 9 real end-of-turn tokens in the batch lost their labels, against 9 kept by the hand-written collator, and nothing crashes. The model never practises stopping."
      ],
      [
        "How does prefix diffing find the assistant tokens?",
        "Render the conversation up to the reply and again through the reply, then label the difference, keeping the end-of-turn token but not the trailing newline. It matches the generation-tag method, and it raises an error if the template is not prefix-preserving."
      ],
      [
        "What does the Accelerate check show about data-parallel training?",
        "Two CPU processes with batch 4 match one process with batch 8 to 9.54e-07 in loss and 5.96e-08 in gradient norm, given correct token weighting. This is CPU with gloo only, so multi-GPU paths are not measured."
      ]
    ],
    "deepDive": [
      [
        "How does a hand-written generate loop compare with model.generate?",
        "Greedy and same-seed sampled tokens are identical to model.generate. Timings are single runs on a busy machine: 16.9 tokens/s with a cache against 11.9 without on the CPU, and a much smaller cache gain on the H100. The post draws no conclusion from the ordering."
      ],
      [
        "What did the LoRA runs show, and how far can they be trusted?",
        "921,600 of 135,436,608 parameters (0.68%) train, and PEFT equals the hand formula at 0.00e+00. Exact match on 182 held-out sums went from 0.000 to 0.560-0.593 over three seeds, but the 0.000 is mostly a format effect from a 6-token cut, and 41% to 44% of answers are still wrong."
      ],
      [
        "What did the Datasets step measure?",
        "Arrow stores 2,000 rows in 74,000 bytes, against 384,184 bytes for a Python list. A cached map still took 0.55 s because hashing the function costs about 0.5 s. Batched map ran at 18,626 rows/s against 5,813 per row, and a second process gained nothing, all in single runs."
      ],
      [
        "Why does the image decide how long the text is?",
        "The processor expands one placeholder into as many tokens as the vision encoder makes. The 640 by 480 image gave 13 tiles times 64 tokens, 832 image tokens and 875 in all, against 80 with do_image_splitting=False. Batching pads the tile axis to the largest image."
      ],
      [
        "What did the TRL runs actually prove?",
        "They prove the data contract, not learning. SFT labels equal our function's labels, and DPO starts at ln 2 = 0.693. The GRPO run had loss 0.0 and zero gradient because a random model never earned a reward, so check that the base model sometimes succeeds."
      ],
      [
        "What does a custom model need to join the stack?",
        "A config with a model_type, PreTrainedModel plus GenerationMixin, a standard forward that accepts **kwargs, and register() at import time. The raw loop then matched Trainer to 7.15e-07 and generate matched a no-cache greedy loop. Loading before register() raises a ValueError."
      ]
    ],
    "results": [
      [
        "Raw loop vs Trainer",
        "1.43e-06",
        "Largest loss difference over 60 steps, which is float32 rounding."
      ],
      [
        "Real EOS labels kept",
        "9 vs 0",
        "The hand-written collator kept all 9 real end-of-turn labels and the library collator kept none."
      ],
      [
        "LoRA exact match",
        "0.000 to 0.560-0.593",
        "Three seeds on 182 held-out sums, with the base-model gap mostly a format effect."
      ]
    ],
    "resultLinks": [
      0,
      1,
      5
    ],
    "table": {
      "title": "Which layer owns the loop",
      "intro": "The first four rows compute the same thing, so the choice is about who owns the code and not about the result.",
      "columns": [
        "Layer",
        "You write",
        "Agreement with raw loop",
        "Best for"
      ],
      "rows": [
        [
          "Raw PyTorch",
          "Everything",
          "The reference",
          "Learning and exact control"
        ],
        [
          "Trainer",
          "Arguments and a collator",
          "1.43e-06 in loss over 60 steps",
          "Standard training"
        ],
        [
          "Subclass of Trainer",
          "One or two methods",
          "9.54e-07 against default Trainer, with the new term off",
          "A new loss or metric"
        ],
        [
          "Accelerate",
          "The loop, minus devices",
          "4.77e-07 on 1 process, 9.54e-07 on 2 CPU processes",
          "Unusual loop shapes"
        ]
      ]
    }
  },
  "build-attention-from-scratch": {
    "title": "Build Attention From Scratch",
    "readTime": "78 min",
    "summary": "Write attention by hand and grow it into MHA, GQA, MLA, sparse, linear and tiled FlashAttention-style versions. Each is tested against a trusted implementation, and every timing is a real run on one busy CPU unless labelled as one H100 run.",
    "framework": [
      "Write the function so every tensor is visible",
      "Test behaviour against a trusted reference",
      "Measure memory and time before trusting a faster kernel"
    ],
    "takeaway": "Cache bytes and numerical errors are exact, and the equivalence tests are solid. Timings are rough, mostly CPU fp32, and the GPU numbers are single runs. The post does not train anything, so it makes no quality claim for GQA, MQA or MLA.",
    "cards": [
      [
        "What happens if you drop the 1/sqrt(d) scale?",
        "Nothing crashes, but the softmax collapses onto one key as the head grows. The mean top weight goes from 0.42 to 0.91 as d goes from 8 to 512, while the correct version stays near 0.11."
      ],
      [
        "Why test causality as a behaviour and not inspect the mask?",
        "An inverted mask has the right shape and the right number of True cells, so a mask check could pass. The causality test rewrites future tokens and fails at once: token 0 moved by 0.145 when token 5 changed."
      ],
      [
        "How do the tests show GQA is MHA with tied KV heads?",
        "With copied weights, GQA with Hkv equal to Hq matches MHA, and Hkv = 1 matches MQA, within about 1e-7. Tiling the KV weights of a GQA layer into an MHA layer gives the same output."
      ],
      [
        "What does the KV cache memory formula say, and did it hold?",
        "M = 2 * L * B * S * Hkv * dh * b, and it matched the real tensor bytes exactly in every benchmark row. Computed for 32 layers in bf16, a 128K context is 64 GiB for MHA and 16 GiB for GQA with Hkv = 8."
      ]
    ],
    "deepDive": [
      [
        "Which decode bugs produce wrong text without any error?",
        "Using is_causal=True while decoding aligns the mask top-left, so the new token sees only key 0. Forgetting the position offset restarts RoPE at 0, with error 0.084 against 5.8e-08. The cache equivalence test catches both."
      ],
      [
        "Does a sparse mask make attention faster?",
        "Not on a dense kernel. At N = 16,384 a window mask that is about 98% sparse took 959 ms against 259 ms for full causal. A chunked window kernel took 31.5 ms and scaled roughly linearly. Block-sparse density from 51% to 3% left the dense time flat."
      ],
      [
        "How does online softmax avoid holding the full score matrix?",
        "It keeps a running max, denominator and numerator per query row, and rescales old sums by exp(m - m_new) when the max rises. The tiled loop matched naive to 7.15e-07 and skipped 28 of 64 tiles. On one H100 in bf16, sdpa_flash took 0.6 ms with 4 MB extra against 21.0 ms and 10,496 MB for naive at N = 16,384."
      ],
      [
        "What does MLA save, and what does it cost?",
        "It caches one latent plus a small RoPE key, 160 bytes per token per layer in the demo against 2048 for MHA, and the absorbed path matches the explicit one to 1.9e-07. It has more parameters than GQA or MQA, and on the explicit CPU path forward took 1,384 ms against 175 ms for MHA at N = 8,192. Quality is not measured."
      ],
      [
        "How do QK-norm and soft-capping behave when activations grow?",
        "At 16 times the activation scale, plain logits reach 1,360 with top weight 0.992 and entropy 0.02. QK-norm stays constant. A soft-cap of 5 bounds the logits but pushes entropy to 4.84, close to uniform, so a cap can flatten attention."
      ],
      [
        "Why did sharing KV heads slow the backward pass on this CPU?",
        "At B = 1 and N = 8,192, MQA backward took 1,874 ms with enable_gqa and 270 ms when K and V were repeated first, with the same output. The gap closes once batch times KV heads reaches 8. The explanation is inferred from timings, it is CPU fp32 only, and it does not appear on the H100."
      ]
    ],
    "results": [
      [
        "KV cache size",
        "\\(M_{KV} = 2\\,L\\,B\\,S\\,H_{kv}\\,d_h\\,b\\)",
        "The formula matched tensor bytes exactly, and a 128K bf16 context is 64 GiB for MHA against 16 GiB for GQA with Hkv = 8, computed and not measured."
      ],
      [
        "Window mask vs chunked kernel",
        "959 ms vs 31.5 ms",
        "At N = 16,384 the masked dense call was slower than full causal, while the chunked kernel only computed the allowed band."
      ],
      [
        "MQA backward at B = 1",
        "1,874 ms vs 270 ms",
        "Repeating K and V before SDPA removed the slowdown from enable_gqa on this CPU at N = 8,192."
      ]
    ],
    "resultLinks": [
      3,
      5,
      9
    ],
    "table": {
      "title": "Nothing is free",
      "intro": "CPU fp32, one layer, B = 1, N = 8,192. Cache size is exact; times are from a busy shared machine.",
      "columns": [
        "Design",
        "Cached numbers per token per layer",
        "Cost measured here",
        "Quality in this post"
      ],
      "rows": [
        [
          "MHA",
          "512",
          "Forward 175 ms, backward 424 ms",
          "Baseline"
        ],
        [
          "GQA Hkv=2",
          "128",
          "Forward 145 ms, backward 923 ms",
          "Not measured; Ainslie et al. report close to MHA"
        ],
        [
          "MQA",
          "64",
          "Forward 124 ms, backward 1,909 ms",
          "Not measured; Ainslie et al. report it can fall below MHA"
        ],
        [
          "MLA r=64",
          "72",
          "Forward 1,384 ms, decode 3.85 ms per token",
          "Unknown"
        ],
        [
          "Linear",
          "None, constant state",
          "Decode 0.27 ms per token, forward 1,268 ms",
          "A different kernel, not softmax"
        ]
      ]
    }
  },
  "build-a-modern-llm-from-scratch": {
    "title": "Build a Modern LLM From Scratch",
    "readTime": "43 min",
    "summary": "Build a Llama-style decoder with RMSNorm, RoPE, grouped-query attention, SwiGLU, a KV cache and modern sampling, one tested module at a time. At the end the code reproduces Hugging Face's Llama logits and runs real pretrained weights.",
    "framework": [
      "Add one module and one check at each step",
      "Compare against an independent Llama implementation, not only small tests",
      "Break each piece on purpose to see which bugs stay silent"
    ],
    "takeaway": "Small tests cannot catch a design choice that is wrong everywhere, so compare logits with a trusted implementation. Most timings are single runs on a shared machine, and the training and head-comparison runs are small, one-seed sanity checks.",
    "cards": [
      [
        "How does the post prove the model is correct, not just plausible?",
        "It converts the weights into Hugging Face's LlamaForCausalLM and compares logits. The tiny model and SmolLM2-135M loaded into our code both give a max logit difference of 0, and 64 greedy tokens match. Exact zero is a bonus: the naive backend differs by about 1e-6, so the test uses a tolerance of 1e-5."
      ],
      [
        "Which bug leaves the text readable but the model wrong?",
        "Swapping the RoPE channel pairing. With SmolLM2-135M, loss on a plain sentence rose from 2.076 to 3.385 nats per token while the output stayed readable English, so only a numerical comparison catches it."
      ],
      [
        "Why is is_causal=True unsafe with a KV cache?",
        "PyTorch aligns the triangle top-left, which is right only when queries and keys have the same length. Chunked prefill on a cache was wrong by up to 0.9 logits in later chunks, and using it on every decode call differed by up to 1.167 logits."
      ],
      [
        "How much does the KV cache save in this tutorial?",
        "It cuts processed tokens about 256 times, but time only 4.9 times for the tiny model on CPU (3.7 times on a rerun), and 2.2 times for SmolLM2-135M. On an H100 at batch 1 it gave 1.1 times, likely because steps are launch-bound, which was not profiled."
      ]
    ],
    "deepDive": [
      [
        "Why is GQA mainly an inference-memory decision?",
        "In Llama 3 8B, going from 32 KV heads to 8 removes about 9% of the whole model's parameters but 75% of the KV cache, 2.00 GiB to 0.50 GiB for 4096 tokens in bf16. The closed-form parameter formula matched the built module for tiny, SmolLM2-135M and Llama 3 8B."
      ],
      [
        "Where do the parameters live in a SwiGLU model?",
        "SwiGLU holds 75% of the tiny model, 59% of SmolLM2-135M and 70% of Llama 3 8B. A 4D classic MLP and SwiGLU match at F = 8D/3, which explains the odd-looking widths such as 1536 for D = 576."
      ],
      [
        "What do initialisation and the shifted loss checks catch?",
        "A correct model starts near ln 256 = 5.545: std 0.02 gave 5.611, while 0.2 gave 10.418 and 1.0 gave 46.022. Depth scaling keeps a 48-layer stream at RMS 0.059 instead of 0.690. Removing the loss shift drove loss to 0.0048 by copying, which is a bug and not progress."
      ],
      [
        "What is the RMSNorm epsilon floor?",
        "Output RMS is r divided by sqrt(r squared plus eps), so below an input RMS near sqrt(eps) the norm stops rescaling. An input of RMS 0.0194 came out at 0.9869 and one near 0.001 at 0.2921. Fresh embeddings at 0.020 lose about 1.2%, which would matter at initializer_range 0.002."
      ],
      [
        "What does the Tiny Shakespeare run show, and what does it not?",
        "Validation loss fell from 5.578 to about 1.50 in 1,000 steps, so the architecture learns. Between steps 800 and 1000 training loss still fell, 1.152 to 1.131, while validation went 1.496 to 1.500, a rough 0.37 gap. It says nothing about how good a well-trained model can be."
      ],
      [
        "Does a small load-balancing loss change MoE routing?",
        "Yes. In an 8-expert, top-2 demo the busiest expert reached 0.49 of the load without it, and 0.18 with a coefficient of only 0.01. The shares come from the last batch of one seed, and the lower loss with balancing (1.912 against 2.010) should not be read as an improvement."
      ]
    ],
    "results": [
      [
        "Logit difference vs Llama",
        "0.000e+00",
        "Max logit difference for the tiny model and for SmolLM2-135M loaded into our code."
      ],
      [
        "RoPE pairing swapped",
        "2.076 to 3.385 nats",
        "Loss per token on SmolLM2-135M rose by more than a nat while the text stayed readable."
      ],
      [
        "KV cache speed-up",
        "4.9x CPU, 1.1x H100",
        "Single runs on the tiny model: the CPU gain was 3.7x on a rerun, and the GPU run at batch 1 saved little."
      ]
    ],
    "resultLinks": [
      0,
      1,
      3
    ],
    "table": {
      "title": "Cutting KV heads in the tiny preset",
      "intro": "Same data, batches, steps and seed. One seed, 400 steps, about 1 MB of text, so the loss gap is too small to rank.",
      "columns": [
        "Config",
        "Attention parameters",
        "Cache per token (float32)",
        "Validation loss"
      ],
      "rows": [
        [
          "MHA, 8 KV heads",
          "1,572,864",
          "12,288 B",
          "1.618"
        ],
        [
          "GQA, 4 KV heads",
          "1,179,648",
          "6,144 B",
          "1.621"
        ],
        [
          "GQA, 2 KV heads (default)",
          "983,040",
          "3,072 B",
          "1.619"
        ],
        [
          "MQA, 1 KV head",
          "884,736",
          "1,536 B",
          "1.622"
        ]
      ]
    }
  },
  "train-an-llm-from-scratch": {
    "title": "Train an LLM From Scratch",
    "readTime": "55 min",
    "summary": "Turn a small Llama-style model into a pretraining system: token shards, packed windows, token-weighted accumulation, exact resume, MFU, DDP, sharding and failure guards. The goal is a run you can stop at any step and continue to the same bits.",
    "framework": [
      "Fix what the ten-line loop lacks, one tested module at a time",
      "Prove each claim: exact resume, equal gradients, matching Trainer",
      "Cause every failure on purpose and check that the guard fires"
    ],
    "takeaway": "Most claims here are exactness tests and they hold. The multi-GPU results are single runs on two H100 GPUs, and ZeRO-2, ZeRO-3 and FSDP resume are not measured. The model is small, so timings and MFU describe this model only.",
    "cards": [
      [
        "What does an exact resume need, and what did the test show?",
        "A checkpoint must hold the model, optimiser, scheduler, step, every RNG, the data position and the config. A run stopped at step 20 and resumed matched the straight 40-step run with a gap of exactly 0, on CPU and on one H100. A weights-only restart diverged at step 21."
      ],
      [
        "Why can a wrong resume look like an improvement?",
        "At step 40 the weights-only run showed loss 5.749 against 6.126 for the correct run. It replayed batches already seen and also restarted warmup and the Adam moments, and the post did not separate the causes. Check validation loss before celebrating."
      ],
      [
        "Why normalise gradient accumulation by the whole step's token count?",
        "Averaging each micro-batch's mean loss is the mean-of-means bug. On packed data both methods differ from one big batch by 3.73e-09, but with unequal target counts mean of means reached 8.25e-03 while the token-weighted method stayed at 3.73e-09."
      ],
      [
        "How do padding and packing compare at L = 256?",
        "Padding has 73.0% utilisation and cuts 8.1% of tokens. Greedy packing has 100.0% utilisation and cuts none, but 91.9% of windows contain a document boundary. Read utilisation next to tokens cut: at L = 128 padding shows 99.6% while discarding 37.3% of tokens."
      ]
    ],
    "deepDive": [
      [
        "Does DDP equal one big batch?",
        "Yes within float32 noise. Two processes matched one process on the whole batch to 3.73e-09 on gloo and on NCCL with two H100 GPUs, and a hand-written all-reduce matched DDP exactly. This holds because ranks get equal shares. Only two GPUs were measured."
      ],
      [
        "What did ZeRO-1 and FSDP save?",
        "Optimiser state per rank fell from 9.54 MiB to about 4.76 MiB with ZeRO-1, and FSDP also halved the weights, with identical weights for ZeRO-1. On a 141M model on two H100 GPUs, peak memory fell from 2,769 to 1,854 MiB, less than the parameter drop, with a weight gap of 9.52e-04 that was not investigated. ZeRO-2 and ZeRO-3 were not run, and FSDP resume is not implemented."
      ],
      [
        "What did the MFU measurement show?",
        "The FLOP formula 6N + 12 n d T gave 37,129,728 per token, 0.98 of the counted value. MFU against a measured peak was 35.4% on CPU, or about 35% to 44% across two peak measurements, and 0.8% on one H100 because the model is too small. A measured-peak MFU is only comparable on the same machine."
      ],
      [
        "Is bf16 or activation checkpointing a free win here?",
        "No. bf16 was about 11 times slower on a CPU that emulates it, with loss gap 0.0010, and slower on the H100 too (60.5 against 45.8 ms). Checkpointing cut saved tensors to 0.18 times, but process peak growth only to 0.70 or 0.48 times on CPU for the two implementations, in single runs."
      ],
      [
        "Which guards were tested, and where were they weak?",
        "A median-and-MAD spike detector flagged a jump to 10.586 that an earlier mean-and-variance detector missed. Clipping did not rescue a learning rate of 3 because Adam normalises step size. Three NaN steps in a row stop the run, but automatic reload and lower learning rate are not implemented. A corrupt checkpoint fell back to step 10."
      ],
      [
        "Why did the same architecture end at different losses?",
        "The Hugging Face Llama model ended at validation loss 2.6135 and the TinyLLM version at 2.2611. Scaling the two residual projections at init brought Llama to 2.2529, consistent with initialisation being almost the whole gap. It is one seed, and the epsilon difference was not tested."
      ]
    ],
    "results": [
      [
        "Exact resume",
        "gap 0.00e+00",
        "Stopped-and-resumed training matched an uninterrupted 40-step run bit for bit on CPU and on one H100."
      ],
      [
        "Accumulation error",
        "8.25e-03 vs 3.73e-09",
        "With unequal target counts, mean of means was over a million times worse than token-weighted accumulation."
      ],
      [
        "Model FLOPs per token",
        "\\(6N + 12\\,n\\,d\\,T\\)",
        "The formula gave 37,129,728 FLOPs per token for this model, 0.98 of the counted value."
      ]
    ],
    "resultLinks": [
      0,
      2,
      6
    ],
    "table": {
      "title": "Distributed strategies",
      "intro": "Per-rank memory is arithmetic, with P the weight size and N the rank count. The last column is what the post actually ran.",
      "columns": [
        "Strategy",
        "Per-rank memory",
        "Added communication",
        "Run here"
      ],
      "rows": [
        [
          "DDP",
          "Weights P, gradients P, optimiser 2P",
          "All-reduce per step",
          "Yes, gloo and NCCL on 2 H100 GPUs"
        ],
        [
          "ZeRO-1",
          "Optimiser 2P / N",
          "Plus a broadcast of new weights",
          "Yes, gloo"
        ],
        [
          "FSDP",
          "Weights P / N, gradients P / N, optimiser 2P / N",
          "All-gather per block",
          "Yes, gloo, and memory on 2 H100 GPUs"
        ],
        [
          "ZeRO-2 and ZeRO-3",
          "Further sharding of gradients and weights",
          "Reduce-scatter, and all-gather per block",
          "Not yet measured, needs DeepSpeed"
        ]
      ]
    }
  },
  "post-train-an-llm": {
    "title": "Post-Train an LLM",
    "readTime": "85 min",
    "summary": "Post-train SmolLM2-135M on arithmetic with SFT, DPO, a reward model, REINFORCE and GRPO, each written by hand and checked against PEFT or TRL. SFT worked. DPO and the RL runs did not improve held-out accuracy.",
    "framework": [
      "Write each stage from the log-probability of the completion tokens",
      "Check each loss against a by-hand value, PEFT or TRL",
      "Report held-out accuracy against each run's own before value, even when it fell"
    ],
    "takeaway": "SFT is the only stage that raised accuracy here, from 0.0% to 74.5%. DPO and GRPO ended below their starts and REINFORCE ended 1 to 7 points lower, mostly within noise. The losses match TRL, but the sampling and training scripts are not covered by those tests and the post did not search for settings that work.",
    "cards": [
      [
        "What signal does each of the three stages get?",
        "SFT is told the answer token by token. DPO is told that one answer is better than another. GRPO is told nothing, and a checker scores the model's own samples. All three rest on the log-probability of the completion tokens given the prompt."
      ],
      [
        "What does the exact reward check?",
        "It gives 1.0 only if the reply has the exact number in the form \"The answer is N.\" and 0.0 otherwise. The first claim counts."
      ],
      [
        "What did SFT achieve?",
        "Held-out accuracy rose from 0.0% (format 0.0%) to 74.5% (format 100%), on both the CPU and the H100. By kind on the CPU it was add 98, sub 86, chain 68 and mul 46."
      ],
      [
        "What did DPO do to held-out accuracy?",
        "It lowered accuracy in all four runs. With learning rate 5e-6 it fell from 79.5% to 44.5% on synthetic pairs and to 42.0% on on-policy pairs. At 1e-6 it fell to 66.5% and 65.5%."
      ]
    ],
    "deepDive": [
      [
        "Why is the stop token easy to lose?",
        "Setting the pad token to the end-of-turn token (im_end) masks the stop token out of the targets, and nothing crashes. A test showed 1 stop-token target with the correct setup against 0 with the bug, so the model gets no signal to finish a reply."
      ],
      [
        "What did packing show, and what leaks without a block mask?",
        "Padding filled 63.7% of slots and packing 89.8%. On the H100 packing gave 2,118 targets per second against 1,332 for padding. Without a block mask the maximum logit difference was 39.754, against 0.00000 with it. Hugging Face builds the mask from position resets only when use_cache is False. With use_cache True the conversations leak silently."
      ],
      [
        "How did LoRA compare with full fine-tuning, and did it save memory?",
        "On the H100 LoRA reached 75.0% against 74.5% with 4,884,480 trainable parameters instead of 134,515,008, using different learning rates and one seed each. Memory depended on the setting. Peak was 4,695 against 5,938 MiB on the H100 at batch 16, higher on the CPU at batch 16 (7,381 against 7,045 MiB) and lower at batch 2 (1,897 against 3,165 MiB). The cause was not isolated."
      ],
      [
        "How does the DPO loss start, and what is its link to a reward model?",
        "With the policy equal to the reference, the margin is 0 and the first loss is log 2, about 0.6931. The loss is -log sigma of a reward gap, the same form as the reward model's loss. In DPO the reward is beta times log(policy / reference), which the policy already computes."
      ],
      [
        "How did the reward model and the gradient-noise meter fare?",
        "The reward model reached 55.5% held-out pair accuracy after 300 steps and 59.5% after 1,500, against 50% chance, with one seed. For REINFORCE, 32-rollout gradient estimates on the last block had a signal-to-noise ratio near the pure-noise value of 0.091 (highest 0.147), so the measurement does not rank the estimators."
      ],
      [
        "Did the RL runs improve the model?",
        "No. At learning rate 1e-5, GRPO ended 14.5 to 21 points below its 80.0% start in all three seeds. REINFORCE ended 1 to 7 points below, mostly within noise (one standard error is about 3 points). At 1e-6 both stayed within noise of the start. The cause was not isolated, and no settings were searched."
      ]
    ],
    "results": [
      [
        "SFT accuracy",
        "0.0% to 74.5%",
        "Held-out accuracy after 500 steps of SFT on SmolLM2-135M, matched on the CPU and the H100."
      ],
      [
        "DPO accuracy",
        "79.5% to 44.5%",
        "Synthetic pairs at learning rate 5e-6 lowered accuracy, and the other three DPO runs fell too, though the margin grew."
      ],
      [
        "GRPO accuracy",
        "80.0% to 64.5%",
        "At learning rate 1e-5 GRPO ended at 64.5%, 65.5% and 59.0% across three seeds, below its start each time."
      ]
    ],
    "resultLinks": [
      2,
      3,
      9
    ],
    "table": {
      "title": "Stages compared",
      "intro": "Each script draws its own 200 held-out prompts, so compare each row only with its own before value. These are records of single runs, not a ranking of methods.",
      "columns": [
        "Method",
        "Signal",
        "Reference model",
        "Held-out accuracy, before to after"
      ],
      "rows": [
        [
          "SFT",
          "The answer",
          "No",
          "0.0% to 74.5%"
        ],
        [
          "DPO",
          "A is better than B",
          "Yes, required",
          "79.5% to 44.5% (synthetic) and 42.0% (on-policy)"
        ],
        [
          "Reward model",
          "A is better than B",
          "No",
          "Pair accuracy 55.5% after 300 steps and 59.5% after 1,500, with 50% as chance"
        ],
        [
          "REINFORCE",
          "A checker's score",
          "No",
          "80.0% to 73.0%, 76.0% and 79.0% over three seeds"
        ],
        [
          "GRPO",
          "A checker's score, relative to the group",
          "Optional, for KL",
          "80.0% to 64.5%, 65.5% and 59.0% over three seeds"
        ]
      ]
    }
  }
});

// Decks added with the Run-the-code bar release
Object.assign(window.BLOG_FLASHCARDS, {
  "build-a-vlm-from-scratch": {
    "title": "Build a Vision-Language Model From Scratch",
    "readTime": "59 min",
    "summary": "A pretrained SigLIP encoder and SmolLM2 are joined by a small projector. Most of the work is the bookkeeping around it: tokens, labels, positions, masks and cache.",
    "framework": [
      "Count every tensor between the picture and the language model",
      "Check each step against trusted code and break it on purpose",
      "Train only the projector and test that the picture is really used"
    ],
    "takeaway": "Almost every VLM bug lives in the bookkeeping and many raise no error. The projector run proves the picture reaches the language model, nothing more.",
    "cards": [
      [
        "What is the only new neural network in this VLM?",
        "The projector, with 2,102,400 parameters, under 1% of the model. The SigLIP encoder and SmolLM2 are pretrained and reused."
      ],
      [
        "How do image features get into the language model?",
        "The prompt holds 49 placeholder ids per crop, and masked_scatter overwrites those rows with projected features in reading order. It matches the plain loop exactly and took 0.461 ms against 3.764 ms."
      ],
      [
        "Which tokens does the loss look at?",
        "Only the assistant reply and its closing <|im_end|> keep labels, and everything else is -100. In the example that is 5 of 69 positions."
      ],
      [
        "What did the projector training show, and what did it not show?",
        "After 300 projector-only steps, all-three-correct captions rose from 0% to 100% on 96 held-out pictures. With only 54 possible captions from one generator, this shows the picture reaches the model, not good vision."
      ]
    ],
    "deepDive": [
      [
        "What does pixel shuffle buy, and what does it cost?",
        "It concatenates each 2 x 2 block of patches, so 196 tokens become 49 and the KV cache falls from 9.7 MB to 2.9 MB. The projector grows from 775,296 to 2,102,400 parameters."
      ],
      [
        "Why is a fresh projector a surprise?",
        "A fresh projector emits a standard deviation of 1.162 (linear) or 0.452 (MLP) against 0.107 for real embeddings. After training it was 4.83, about 36 times the table's 0.136, and still hit 100%. Whether matching helps on harder data was not measured."
      ],
      [
        "Which silent bugs did the post measure, and how do they look?",
        "Zeroed pixels give 0% fully correct captions, wrong normalisation drops colour to 83%, and right padding gives 70% all-three. Reversed crops score 0% against their own targets and 100% against reversed ones."
      ],
      [
        "How does tiling set the token cost?",
        "With a tile cap, cost follows the aspect ratio, not the resolution: 640 x 480 and 2048 x 1536 both cost 343 tokens. A 100 x 50 icon costs 147 tokens."
      ],
      [
        "Why does the KV cache matter more as pictures grow?",
        "Caching saved a factor of 1.4 at 63 prompt tokens and 7.9 at 1386, while cache memory grew 22 times. These CPU timings came from a busy machine, so treat them as rough."
      ],
      [
        "How do position ids and the attention mask fail quietly?",
        "A cumulative sum makes the first real token position 0 under left padding. A padding row filled with minus infinity makes softmax return nan, so the dtype's minimum value is used instead."
      ]
    ],
    "results": [
      [
        "Image token budget",
        "\\(196 \\to 49\\) tokens",
        "Pixel shuffle with factor 2 cut the sequence from 210 to 63 tokens and the KV cache from 9.7 MB to 2.9 MB."
      ],
      [
        "Alignment accuracy",
        "0% → 100%",
        "On 96 held-out pictures all-three-correct captions rose after 300 projector-only steps, on a narrow 54-caption task."
      ],
      [
        "Cache benefit",
        "1.4× → 7.9×",
        "The speed-up from caching grew with prompt length, from 63 to 1386 tokens, in rough CPU timings."
      ]
    ],
    "resultLinks": [
      4,
      3,
      8
    ],
    "table": {
      "title": "Choose a resolution strategy",
      "intro": "Measured on a 1000 x 300 picture with pixel shuffle 2. The right choice depends on whether shape or small detail carries the answer.",
      "columns": [
        "Strategy",
        "Image tokens",
        "Cost in quality",
        "Use when"
      ],
      "rows": [
        [
          "Fixed resize",
          "49 (1 crop)",
          "Shapes stretch by 3.33 times",
          "Near-square pictures, or the encoder was trained this way"
        ],
        [
          "Aspect-ratio padding",
          "49 (1 crop)",
          "Content fills only 30% of the crop height",
          "Shape matters and the budget is tight"
        ],
        [
          "Tiling with a thumbnail",
          "196 (4 crops)",
          "Objects can be cut across a tile edge",
          "Documents and long pictures with small detail"
        ]
      ]
    }
  },
  "train-a-real-vlm": {
    "title": "Train a Real VLM",
    "readTime": "55 min",
    "summary": "A staged training system for a vision-language model: a projector-only alignment stage, then a six-task mixture with text replay, tiling, packing, LoRA and grounding. All data is synthetic and every number is one seed.",
    "framework": [
      "Give every task one sample format and a metric",
      "Train in stages and compare against grey-image and no-model controls",
      "Report what the small runs do not show"
    ],
    "takeaway": "The system works, but the results are small and single-seed. Controls showed that documents and charts were not learned, and grounding is not shown to work.",
    "cards": [
      [
        "How does one sample format and loss mask serve six tasks?",
        "Every task becomes images plus chat messages, and only the assistant answer and its end token are targets, 3.2% of positions in the example batch. Plain-text replay passages are fully supervised."
      ],
      [
        "What do the two training stages train?",
        "Stage 1 trains only the 2,102,400-parameter projector (0.9% of weights) on captions. Stage 2 adds the language model (61.4% trainable) with a temperature mixture and 10% text replay."
      ],
      [
        "Why run grey-image and no-model controls?",
        "A nonzero score may not come from the image. On the H100 run, documents scored 0.191 with real images and 0.197 with grey images, and charts 0.148 against 0.125 for a fixed answer, so neither was learned."
      ],
      [
        "What does text replay do to forgetting?",
        "Without replay, held-out text perplexity rose from 35.32 to 49.85. With 10% replay it fell to 23.19, partly from adapting to the same kind of text, with no measurable task cost at one seed."
      ]
    ],
    "deepDive": [
      [
        "What did the four mixtures show?",
        "VQA followed its share of draws, from 0.906 at 26.7% to 0.680 at 8.3%. The post reads this as a statement about draws, not a ranking, and neighbouring gaps are within noise."
      ],
      [
        "Did unfreezing the vision encoder help?",
        "No gap between vision frozen, top 4 blocks and fully trained was clearly above noise in 250 steps. The partial and full runs also used different vision learning rates, so layers and rate are confounded."
      ],
      [
        "Where should LoRA go?",
        "LoRA on the language model alone matched training it on caption and VQA with 4.9M weights against 134.6M. LoRA on vision only or projector only did not learn (VQA 0.445 and 0.461), and all three together gave no measurable gain."
      ],
      [
        "Did tiling help documents and OCR?",
        "Not in these runs: OCR error was 0.055 with tiles and 0.045 with one resized tile, and ANLS 0.188 against 0.185. An invoice cost 245 visual tokens against 49, and samples over 1,024 tokens are refused."
      ],
      [
        "What must packing guarantee, and what does it save?",
        "It needs a block-diagonal causal mask, position ids that restart per sample, and no target across a boundary. Packed and separate losses agree to a relative 1e-4, but the timing comparison was inconclusive."
      ],
      [
        "Is grounding shown to work?",
        "No. After 1,500 steps only 2 to 4 of 70 boxes were correct, against 1 to 5 of 70 for a fixed box with no model. Undertrained and no skill cannot be separated, and quantisation caps a perfect 28-pixel box at IoU 0.64."
      ]
    ],
    "results": [
      [
        "Forgetting without replay",
        "35.32 → 49.85",
        "Held-out text perplexity rose without replay and fell to 23.19 with 10% replay, partly through domain adaptation."
      ],
      [
        "Controls expose failures",
        "Docs 0.191 vs 0.197 grey",
        "The document score with real images equals the grey-image score, so documents were not learned."
      ],
      [
        "Mixture follows draws",
        "VQA 0.906 → 0.680",
        "VQA fell as its share of draws fell from 26.7% to 8.3%, in single-seed 250-step runs."
      ]
    ],
    "resultLinks": [
      3,
      2,
      4
    ],
    "table": {
      "title": "Choose what trains",
      "intro": "Parameter counts are exact. The fit and risk columns are qualitative and come from what each mode can change.",
      "columns": [
        "Mode",
        "Share of all weights",
        "Fits when",
        "Main risk"
      ],
      "rows": [
        [
          "Align",
          "0.9%",
          "The projector is random",
          "Towers cannot adapt, so quality has a low ceiling"
        ],
        [
          "Language model",
          "61.4%",
          "The images suit the encoder",
          "The language model forgets plain text"
        ],
        [
          "Full",
          "100.0%",
          "Plenty of data and compute",
          "Highest memory and most ways to forget"
        ],
        [
          "LoRA on language model",
          "2.1%",
          "You want a small, reversible change",
          "New tokens need their embedding rows trained"
        ]
      ]
    }
  },
  "post-train-a-vlm": {
    "title": "Post-Train a VLM",
    "readTime": "45 min",
    "summary": "Image-conditioned DPO and visual GRPO are written by hand for a real 256M VLM on synthetic scenes with exact truth. The point is to check whether the model used the image or gamed the loss. All runs are short and single-seed.",
    "framework": [
      "Build scenes and rewards where every fact is exact",
      "Run blind controls to see whether the image was used",
      "Audit each reward for exploits and log monitors"
    ],
    "takeaway": "A preference loss or a visual reward can improve without the model using the image. Blind controls, constant-answer baselines and honest monitors catch what training curves hide.",
    "cards": [
      [
        "Why build preference pairs from exact scenes with balanced negatives?",
        "Every fact in a drawn scene is known, so labels are exact. The balanced sampler draws wrong values from the same set as true values, so any scorer that ignores the image averages 50%."
      ],
      [
        "How is DPO written without keeping a second model in memory?",
        "The frozen starting model scores each pair once and a LoRA adapter with zero initial state starts at the reference. The first loss must be 0.693, and a zero reference shows a falsely low 0.3446."
      ],
      [
        "What did balanced DPO change?",
        "Real-image accuracy on balanced pairs rose from 79.3% to 88.7% and grey-image accuracy from 47.3% to 56.0%, from one seed, so read it as a direction. Short-answer accuracy fell from 58.7% to 53.3%, about the size of the noise."
      ],
      [
        "What happened when GRPO trained on the weak recall reward?",
        "Recall reached 1.00 by naming 5.46 colours per answer, 2.98 of them not in the image, and honest F1 fell from 0.765 to 0.703. The F1 reward reached 1.00 with no false colours, in one seed on one task."
      ]
    ],
    "deepDive": [
      [
        "What did the blind checks show about shortcuts?",
        "A text-only probe scored 49% on balanced pairs and 91% on biased ones, though spatial stayed at 58%. Biased DPO moved the grey-image score from 83.3% to 90.0%, and balanced DPO to 57.3% with count still at 100%."
      ],
      [
        "What does encoding each image once save?",
        "On the CPU the speed-up grew from 3.33 times at G = 4 to 7.65 times at G = 16. On the H100 it was 1.10 to 2.99 times, flat near 207 ms, which was not profiled."
      ],
      [
        "Why audit a reward before training?",
        "A whole-image box scores 1.00 on center-in-box but 0.038 on IoU. A list of five colours scores recall 1.00 but F1 0.57."
      ],
      [
        "How does the GRPO update work here?",
        "Each answer is compared only with other answers for the same image, at temperature 1. A group where all eight answers are the same has zero advantage and teaches nothing."
      ],
      [
        "Did GRPO improve counting?",
        "Held-out counting ended at 60%, 55% and 52%, near the 55% from always answering 1, and the connector run most likely collapsed to a constant. The runs mixed hardware and used one seed."
      ],
      [
        "What did the perception probe and written-list control show?",
        "The probe scored 99.5% on pretrained features and 99.0% to 99.5% after RL, so it was at its ceiling and cannot show improved perception. The written-list control rose from 0% to 50% only in the LLM-only run, and its 0% start is largely a scoring artefact."
      ]
    ],
    "results": [
      [
        "Encode-once speed-up",
        "3.33× → 7.65×",
        "On the CPU the saving grew from G = 4 to G = 16, while the H100 saw 1.10× to 2.99× up to G = 32."
      ],
      [
        "Blind text probe",
        "49% vs 91%",
        "A text-only probe is at chance on balanced pairs and near-perfect on biased pairs, so only the biased set leaks through words."
      ],
      [
        "Reward hacking",
        "Recall 1.00, F1 0.703",
        "Training on recall reached full recall but honest F1 fell from 0.765 as false colours rose to 2.98 per answer."
      ]
    ],
    "resultLinks": [
      5,
      4,
      3
    ],
    "table": {
      "title": "Which check to run first",
      "intro": "Each post-training run can use a shortcut. Name the shortcut, then check it before trusting the score.",
      "columns": [
        "Run",
        "Training signal",
        "Shortcut risk",
        "Check first"
      ],
      "rows": [
        [
          "DPO, balanced negatives",
          "Preference pairs",
          "No, text carries no hint",
          "Grey-image accuracy near 50%"
        ],
        [
          "DPO, biased negatives",
          "Preference pairs",
          "Yes, words predict the label",
          "Text-only probe before training"
        ],
        [
          "GRPO, exact count",
          "Exact count from the scene",
          "Yes, an answer prior or constant answer",
          "Always answering 1, then the perception probe"
        ],
        [
          "GRPO, recall reward",
          "Colour recall (weak)",
          "Yes, naming more colours pays",
          "Colours named and colours not in the image"
        ],
        [
          "GRPO, F1 reward",
          "Colour F1",
          "Less, a false colour costs precision",
          "Colours named and colours not in the image"
        ]
      ]
    }
  },
  "build-an-agent-harness-from-scratch": {
    "title": "Build an Agent Harness From Scratch",
    "readTime": "50 min",
    "summary": "An eight-line agent loop grows into a coding agent with validated tools, edit formats, a sandbox, permissions, context control, an event log and checkpoints. Most of the work is telling the model what went wrong and limiting what a wrong move can do.",
    "framework": [
      "Run the simple loop and watch it fail",
      "Add the guard that turns each failure into feedback or a limit",
      "Measure each guard with a benchmark or a test"
    ],
    "takeaway": "The harness, not the model, handles most failures. A scripted model shows the harness works, but a real 0.5B model run did not fix the bug, and the run still ended with status done.",
    "cards": [
      [
        "Why does the eight-line loop fail, and what fixes it?",
        "An unknown tool or bad arguments crash it, and a malformed call makes it loop with no feedback. The harness validates every call, returns each problem as a message the model can act on, and stops after four protocol errors in a row."
      ],
      [
        "Why must the agent read a file before editing it?",
        "A tracker stores a hash of what the model last saw. An edit is refused if the file was never read or changed since, which prevents edits from an out-of-date view."
      ],
      [
        "Which edit format is the default and why?",
        "Search/replace. In a simulated-slip benchmark it corrupted 0 of 1,400 edits at 77 tokens, against 600 silent corruptions at 1,667 tokens for whole-file rewrite."
      ],
      [
        "Did a real model fix the bug?",
        "No. Qwen2.5-0.5B tried an edit without reading the file, was refused, and answered in plain text, so the run ended with status done and the bug still there. It is one run of a small model."
      ]
    ],
    "deepDive": [
      [
        "Why does the shell tool use process groups?",
        "A plain timeout kills only the process it started, and a background child can live on and block the call. Each command gets its own process group, and the whole group is killed."
      ],
      [
        "Is the local sandbox a security boundary?",
        "No. The shell read and overwrote a file outside the workspace with no prompt. The Docker backend mounts only the workspace but costs about 412 ms per command against 13.2 ms, and was checked on one Linux kernel."
      ],
      [
        "How do the permission levels work, and where do they fall short?",
        "Four risk levels, with unknown programs defaulting to workspace write. A string classifier is wrong both ways: a python call that deletes the filesystem was workspace write, while grep sudo was dangerous."
      ],
      [
        "What does the toolset cost in context?",
        "Twenty tool schemas cost 1,676 real tokens before the task is read, against 537 for the five-tool preset. The cheap estimate overcounts JSON by 1.89 times."
      ],
      [
        "What does context compaction save, and where does it stop holding?",
        "Doubling from 80 to 160 steps multiplies total prompt tokens by 3.9 with no budget and 2.1 with a 4,000 budget, saving 89%. The budget fails once the never-dropped summary outgrows it, and this counts tokens only."
      ],
      [
        "How should giant outputs be truncated?",
        "Head-only kept the failing assertion 0.5% of the time and adding rescued error lines kept it 100% with one failure. With 200 earlier FAILED lines the rescue budget ran out, and past 1 MB capture drops the middle first."
      ]
    ],
    "results": [
      [
        "Silent corruption",
        "600 of 1,400",
        "Whole-file rewrite silently corrupted 600 simulated edits, while search/replace corrupted none."
      ],
      [
        "Compaction saving",
        "89% at 160 steps",
        "A 4,000-token budget cut total prompt tokens by 89%, but only while the summary fit inside it."
      ],
      [
        "Truncation rescue",
        "0.5% → 100%",
        "Head-only truncation kept the failing assertion 0.5% of the time, and adding rescued error lines kept it every time with a single failure."
      ]
    ],
    "resultLinks": [
      2,
      8,
      9
    ],
    "table": {
      "title": "Choose an edit format",
      "intro": "Outcomes are over 1,400 simulated edits per format. The slips are simulated, so this shows what each format does under a slip, not how often a real model slips.",
      "columns": [
        "Format",
        "Tokens per edit",
        "Correct / refused / corrupted",
        "Behavior under a slip"
      ],
      "rows": [
        [
          "Whole file",
          "1,667",
          "800 / 0 / 600",
          "Never refuses, so slips go unnoticed"
        ],
        [
          "Search/replace",
          "77",
          "877 / 523 / 0",
          "Refuses non-unique quotes and misses, never corrupts"
        ],
        [
          "Strict diff",
          "118",
          "625 / 775 / 0",
          "Safe but slow, refuses stale line numbers"
        ],
        [
          "Anchored diff",
          "122",
          "1,036 / 364 / 0",
          "Most edits correct, line numbers are only hints"
        ]
      ]
    }
  },
  "add-memory-to-the-agent": {
    "title": "Add Memory and Context Engineering to the Agent",
    "readTime": "70 min",
    "summary": "The agent gets four kinds of memory, a write gate, hybrid retrieval and a token budget, attached without changing its loop. Most numbers come from a deterministic rule reader. Two small real-model runs are far less flattering.",
    "framework": [
      "Write only what is worth keeping and edit facts instead of appending",
      "Read by retrieving and packing under a token budget",
      "Test that memory is the cause, then check with a real model"
    ],
    "takeaway": "Memory helps when it keeps current values and fits the budget. The rule reader overstates the gain, since one small real model showed the right fact in the prompt is not always used.",
    "cards": [
      [
        "What are the four kinds of memory and how do they differ?",
        "Working memory is the always-in-context task state. Episodic is an append-only log of (state, action, observation, reward, time), semantic holds keyed facts, and procedural holds templated rules from repeated recoveries."
      ],
      [
        "How does the fact store handle a changed value?",
        "Each claim causes one operation: add, update, supersede, delete or no-op. A superseded fact is kept with its validity interval but not returned, and an append-only store dropped updated-fact accuracy from 1.00 to 0.66."
      ],
      [
        "What does the write gate decide?",
        "It scores novelty, stability, importance, confidence and scope, with hand-set weights and threshold. Without the writer and scope gate, accuracy after a just-for-today override fell from 1.00 to 0.00."
      ],
      [
        "How does the post test that memory is the cause of the gain?",
        "It fixes the reader, tasks and seeds, changes only the context, then corrupts every stored value. Accuracy fell from 0.999 to 0.585, using a rule-based reader whose numbers are not real-model accuracy."
      ]
    ],
    "deepDive": [
      [
        "How does the budget packer choose what to keep?",
        "It takes required blocks, then section floors, then fills greedily by value per token. Greedy can drop what you need most, and against brute force it reached 0.982 of optimal on average and 0.788 at worst."
      ],
      [
        "When does a truncated transcript beat or lose to memory?",
        "In the facts world at budget 1,024 retrieved memory scored 0.999 against 0.749 for the transcript. In the deploy world at budget 256 the transcript succeeded on 0.394 of tasks against 0.713 for no memory."
      ],
      [
        "Why report steps and not only success rate?",
        "Success depends on the step limit. At a limit of 8 retrieved memory beat no memory 0.929 to 0.713, but at 9 both reached 1.000, leaving only efficiency (2.77 calls against 5.84)."
      ],
      [
        "What happened with a real model in the deploy run?",
        "One small model got 0 of 16 with no memory, 3 with the full transcript, 13 with retrieved memory and 16 with the right fact first. The fact was in every transcript prompt, so having it is not using it. This is 16 tasks and one model."
      ],
      [
        "Did the real model confirm the rule reader's gain on fact probes?",
        "Only weakly. Retrieved memory scored 0.592 against 0.542 for the transcript, a lead the post does not claim, and oracle memory reached only 0.875."
      ],
      [
        "Do recency and importance help retrieval here?",
        "No. Semantic-only tied the full hybrid at 0.999 while recency-only fell to 0.686, because superseding already removes stale values. This is about this benchmark, not a proof recency is useless."
      ]
    ],
    "results": [
      [
        "Stale facts mislead",
        "1.00 → 0.66",
        "An append-only store kept updated-fact accuracy at only 0.66 although stated-fact recall stayed at 1.00."
      ],
      [
        "Causal check",
        "0.999 → 0.585",
        "Corrupting every stored value cut the rule reader's accuracy, which shows it uses the memory."
      ],
      [
        "Real model, 16 tasks",
        "3/16 vs 13/16",
        "A small model got 3 deploys right with the full transcript and 13 with retrieved memory, with the right fact in every prompt."
      ]
    ],
    "resultLinks": [
      1,
      3,
      7
    ],
    "table": {
      "title": "The four memories compared",
      "intro": "No single design serves all four. Each kind has its own writer, lifetime and failure mode.",
      "columns": [
        "Memory",
        "Holds",
        "Lasts",
        "Main way it fails"
      ],
      "rows": [
        [
          "Working",
          "Goal, plan, open questions",
          "One task, rewritten in place",
          "A malformed update, limited to the fields it names"
        ],
        [
          "Episodic",
          "(state, action, observation, reward, time)",
          "Permanent, append only",
          "Too verbose if read raw"
        ],
        [
          "Semantic",
          "(subject, attribute) to value",
          "Until superseded, history kept",
          "Stale or wrong values that look certain"
        ],
        [
          "Procedural",
          "Trigger, error, templated steps",
          "Until it stops working",
          "Generalised too far from one quirk"
        ]
      ]
    }
  },
  "train-an-agent-with-rl": {
    "title": "Train an Agent With Reinforcement Learning",
    "readTime": "55 min",
    "summary": "A small filesystem environment, a behaviour-cloned policy and a GRPO trainer, all on a CPU. Cloning breaks one step off the expert path, and plain outcome-reward GRPO did not fix it in these single-seed runs.",
    "framework": [
      "Clone an expert and measure where it breaks",
      "Train online with GRPO and read the flat-group, credit and reward results",
      "Compare against simpler baselines and stay cautious about single seeds"
    ],
    "takeaway": "The code is the main deliverable. Plain GRPO showed no gain, and two variants that lifted perturbed success are single-seed leads, not results.",
    "cards": [
      [
        "What breaks the cloned policy?",
        "One harmless forced mistake cuts success from about 80% to 17%, and three to 4%, while the expert stays at 100%. The share of decisions in unseen states rises from 0% to 95%, as a lower bound."
      ],
      [
        "How does an episode become training data?",
        "A mask marks only policy-sampled tokens, so forced mistakes and tool output are never trained on. A test checks that recorded log-probabilities equal a training forward, so the ratio starts at 1 and an off-by-one shift is caught."
      ],
      [
        "Did plain GRPO with an outcome reward improve the policy?",
        "No. Over 120 iterations clean went 78% to 80%, perturbed 13% to 3% and failures 21% to 19%. Flat groups (about 0.80) are a likely but unproven cause, from an unsaved probe and one seed."
      ],
      [
        "What did lift perturbed success?",
        "An on-policy variant raised it from 13% to 31%, but changed five settings at once. Filtered BC on the policy's own successes reached 27%. Both are single seeds with a standard error of about 3 to 4 points."
      ]
    ],
    "deepDive": [
      [
        "Why do flat groups matter, and what do advantages look like?",
        "A lone winner in a group of eight gets +2.47 and a lone loser -2.47, against about 0.35 for ordinary members. A group that all wins or all fails gets exactly 0, so log the flat-group fraction."
      ],
      [
        "Did action-level credit beat trajectory-level credit?",
        "The suites were the same. Trajectory credit saw its submit share fall from 1.00 to 0.14, while action credit did not, but that comparison also adds a critic and changes normalisation, so it is a lead."
      ],
      [
        "How was reward hacking shown, and what did potential shaping do?",
        "The activity reward pays 0.2 per call, so looping read (1.8) beats solving level 2 (1.4). Clean success ended at 73% against 81%, about 1.6 standard errors, and potential shaping changed nothing under trajectory-level GRPO."
      ],
      [
        "Did exploration settings or a curriculum help?",
        "No. Temperature changed the flat share only slightly and perturbed success stayed at 1% to 3%. The staged curriculum never left stage 1, so it tested nothing."
      ],
      [
        "Did GRPO learn to recover from tool failures?",
        "No. The clone recovered in 5 of 218 episodes that hit an error and the main-run GRPO policy in 0 of 221. The clean demonstrations never showed recovery, though the scripted expert recovers from all four failure types."
      ],
      [
        "How did offline methods compare with online GRPO?",
        "Filtered BC scored 80% clean and 27% perturbed, offline GRPO 77% and 5%, and online GRPO 81% and 2%. Offline clipping climbed from 0.17 to about 0.45, and each is one seed."
      ]
    ],
    "results": [
      [
        "Compounding error",
        "80% → 17%",
        "One harmless forced mistake cut the cloned policy's success, while the expert stayed at 100%."
      ],
      [
        "Plain GRPO",
        "Perturbed 13% → 3%",
        "After 120 iterations clean success moved from 78% to 80% and perturbed success fell."
      ],
      [
        "Offline methods",
        "27% vs 5% perturbed",
        "Filtered BC reached 27% perturbed success while offline GRPO reached 5%, each from a single seed."
      ]
    ],
    "resultLinks": [
      0,
      2,
      9
    ],
    "table": {
      "title": "Training methods compared",
      "intro": "Greedy success on the same 150 fresh tasks, one seed. Differences of a few points are not meaningful.",
      "columns": [
        "Method",
        "Clean",
        "Perturbed",
        "Main risk"
      ],
      "rows": [
        [
          "Behaviour cloning",
          "78%",
          "13%",
          "Breaks off the expert's path"
        ],
        [
          "Filtered BC",
          "80%",
          "27%",
          "Learns only what the buffer already does"
        ],
        [
          "Offline GRPO",
          "77%",
          "5%",
          "Stale log-probabilities, heavy clipping"
        ],
        [
          "GRPO, 2 epochs per batch",
          "80%",
          "3%",
          "No gain, flat groups and drift to long episodes"
        ],
        [
          "GRPO, on-policy variant",
          "79%",
          "31%",
          "Five settings differ, so the cause is untested"
        ]
      ]
    }
  }
});

// Decks added with the Run-the-code bar release
Object.assign(window.BLOG_FLASHCARDS, {
  "rewarding-what-the-model-sees": {
    "title": "Rewarding What the Model Sees",
    "readTime": "42 min",
    "summary": "Many visual tasks have answers a program can check, so verifiable rewards carry over to vision-language models. The hard part is knowing what a rising reward actually changed: seeing, reasoning, or guessing.",
    "framework": [
      "Turn each visual annotation into a checkable reward",
      "Predict how the cheapest output would game it",
      "Add controls that separate perception from reasoning"
    ],
    "takeaway": "A visual reward is only as good as its cheapest exploit. Score the degenerate outputs, audit every verifier, and report controls that show what the model really learned.",
    "cards": [
      [
        "Why can verifiable-reward RL work on images?",
        "Many visual tasks have answers a program can check: a count is an integer, a box can be compared with a reference box, and text can be compared by edit distance. Existing labels become checks, so no preference data or learned reward model is needed."
      ],
      [
        "Why is an oversized box a reward hack?",
        "A box that contains the target earns the target's share of its area, a floor of free credit. On hard targets that beats an honest miss, so group-relative advantages pull the policy toward bigger boxes."
      ],
      [
        "When the reward rises, what may have improved?",
        "The model may see more accurately, reason better over the same view, or answer without looking. One reward number cannot tell these apart, so run controls such as a blank image, oracle perception and a perception probe."
      ],
      [
        "Why can one weak verifier hurt a multi-domain run?",
        "The shared policy carries an exploit into every domain. In GLM-4.1V-Thinking, a flawed multi-image QA reward let the model learn shortcuts, and training collapsed across all domains."
      ]
    ],
    "deepDive": [
      [
        "Why does the group baseline suit images?",
        "The mean is taken over rollouts of one image, so it removes how hard the image is and keeps how well each rollout handled it. The flip side is that a group where every rollout fails, or every rollout succeeds, has zero advantage and teaches nothing."
      ],
      [
        "How often does a group carry no signal, and what helps?",
        "With K = 8 rollouts, about 0.8% of groups at pass rate 0.5, about 43% at 0.9 and about 66% at 0.95. Fixes are pass-rate filtering (a 0.2 to 0.8 band in Vision-G1), dynamic sampling, replay of useful groups and hints for hard prompts."
      ],
      [
        "Which parameters should receive the RL gradient?",
        "The evidence is thin and mixed. Adapter-only training scored best in Skywork R1V2 and freezing the connector broke R1V3, while training the encoder gave gradient spikes and a detection collapse in V-Triune."
      ],
      [
        "Does explicit thinking help perception?",
        "Mostly not. Perception-R1's no-thinking variant won on all four tasks (RefCOCO 89.1 against 75.1), and longer chains went with less visual attention. Seg-Zero is a modest exception."
      ],
      [
        "Why is credit weak under a sparse outcome reward?",
        "Every token gets the same advantage, so two misreadings that cancel are rewarded and correct readings followed by a wrong subtraction are penalised. If the answer needs every step right, a step's credit scales with the chance that all other steps are right, about 0.41 for five steps at 80%."
      ],
      [
        "Do published grounded-reasoning rewards verify the grounding?",
        "Mostly they check that grounding is present, not that it is correct: ViGoRL requires valid coordinates, GRIT at least one box, DeepEyes pays a bonus only for a correct answer. The chain is a useful trace, not a verified one."
      ]
    ],
    "results": [
      [
        "Zero-signal groups",
        "\\(p^K + (1-p)^K\\)",
        "With K = 8, about 0.8% of groups are useless at p = 0.5, about 43% at p = 0.9 and about 66% at p = 0.95."
      ],
      [
        "Box reward floor",
        "\\(\\text{IoU} = 0.20 / 1.00 = 0.20\\)",
        "A whole-image box over a target covering 20% of the image earns 0.2 while saying nothing about where the object is."
      ],
      [
        "Credit per step",
        "\\(\\prod_{i \\neq j} q_i\\)",
        "A step's effect on the reward is scaled by the probability that every other step also went right, so credit fades with the number of steps."
      ]
    ],
    "resultLinks": [
      5,
      1,
      8
    ],
    "table": {
      "title": "Visual rewards and how they get gamed",
      "intro": "Dense rewards give signal but invite cheap partial credit. Binary rewards avoid that at the price of silence when every attempt fails.",
      "columns": [
        "Reward",
        "Density",
        "Main hacking risk",
        "Repair named in the post"
      ],
      "rows": [
        [
          "Exact match",
          "Binary",
          "Lenient normaliser or answer parser",
          "Strict parser: one answer in one fixed place, tested on adversarial strings"
        ],
        [
          "Numeric tolerance",
          "Binary, with slack",
          "Misreadings inside the band pass",
          "Consider a tighter tolerance in training than in evaluation"
        ],
        [
          "Soft box IoU",
          "Dense",
          "Oversized box earns a floor of credit",
          "Threshold, precision term or size term"
        ],
        [
          "Thresholded IoU",
          "Binary",
          "Sparse on hard targets",
          "GIoU ranks misses, giving a direction when no rollout overlaps"
        ]
      ]
    }
  },
  "thinking-with-images": {
    "title": "Thinking With Images",
    "readTime": "44 min",
    "summary": "A VLM that looks at an image once can reason only about what the first encoding kept. When a pixel-level detail is missing, the fix is to look again, not to think longer.",
    "framework": [
      "Split the answer into extraction, use and reasoning",
      "Probe which of the three failed",
      "Spend test-time compute on perception when the facts are missing"
    ],
    "takeaway": "Reasoning tokens rearrange what the visual tokens hold and cannot create what the encoder discarded. Treat perception, through crops, views and tools, as its own test-time compute axis.",
    "cards": [
      [
        "Why can't more reasoning tokens recover a missed detail?",
        "Reasoning is computed from the visual tokens, and by the data processing inequality nothing computed from them can carry more information about the image than they do. When the missing fact is a visual detail, the remedy is more perception: higher resolution, a crop, another view or a tool."
      ],
      [
        "What are the three ways a visual answer fails?",
        "The fact was never extracted into the visual tokens, it was extracted but not used, or the reasoning failed. Each has a different fix, and the post calls the split an approximation, not an identity."
      ],
      [
        "What does a crop buy, and what is the catch?",
        "It spends the same tokens on a smaller region, so text height goes from about 3.6 to about 14 pixels at 768 tokens. It is a bet on localisation, and global questions need tiling or higher global resolution."
      ],
      [
        "Why does majority voting fail against perception errors?",
        "Every sample is computed from the same encoding. If the encoding lost the plaque, all samples guess the same prior and the vote becomes confidently wrong, so sample over different views as well as text."
      ]
    ],
    "deepDive": [
      [
        "How do you tell which stage failed?",
        "Switch one stage off at a time: blind (no image), oracle swap (true facts as text), caption then reason, crop, linear probe and mid-trace image removal. Run the cheap ones first, and remember captions are lossy."
      ],
      [
        "What are the three forms of multimodal reasoning?",
        "Form 1 reasons in text over static visual tokens, Form 2 interleaves reasoning with new crops of the original pixels, and Form 3 reasons through latent steps. Only Form 2 goes back to the pixels, so only it can recover lost detail."
      ],
      [
        "Does long reasoning keep using the image?",
        "It tends to drift: removing the image halfway cost only about 2% in the TVC ablation, and longer chains put less attention on the image. The post offers dilution and self-conditioning as the main explanations."
      ],
      [
        "How much does looking again help?",
        "With weights fixed, Qwen3-VL reports about 5 points on V* from enabling tools across its family, and DeepEyes lifts a Qwen2.5-VL-7B base from 71.2 to 90.1 by teaching it to zoom. So check whether tools were enabled when comparing models on detail benchmarks."
      ],
      [
        "How are looking policies trained, and what is the caveat?",
        "Mostly with outcome-only RL, where each crop goes back to the original pixels and new actions need early encouragement such as a curiosity reward. Zoom was learned by RL alone in DeepEyes, but code and search tools needed a cold start in DeepEyesV2."
      ],
      [
        "What can a visual verifier check that a text verifier cannot?",
        "Grounded traces leave boxes, crops and OCR strings that can be re-checked, including relevance and a counterfactual mask. VisualPRM added 5.9 points on InternVL2.5-78B, but on mostly math and science benchmarks, so it does not show that a process reward model fixes misreadings of small details."
      ]
    ],
    "results": [
      [
        "Crop trade-off",
        "\\(h_{enc} = h_{orig}\\, W_{enc} / W_{region}\\)",
        "At the same 768-token budget, the full photo gives text about 3.6 pixels tall and a top-right quarter crop gives about 14 pixels."
      ],
      [
        "Failure factorisation",
        "\\(P(X)\\,P(U \\mid X)\\,P(R \\mid X, U)\\)",
        "Accuracy is approximately this product plus lucky guesses, and reasoning tokens act on the last two factors, not on P(X)."
      ],
      [
        "Information bound",
        "\\(I(Y^*; y \\mid q) \\le I(Y^*; z_v \\mid q)\\)",
        "Nothing computed from the visual tokens can hold more information about the image than the tokens themselves."
      ]
    ],
    "resultLinks": [
      2,
      1,
      0
    ],
    "table": {
      "title": "Three forms of multimodal reasoning",
      "intro": "The column that separates the forms is whether they go back to the pixels.",
      "columns": [
        "Form",
        "Where perception happens",
        "Can it recover lost detail?",
        "Typical failure"
      ],
      "rows": [
        [
          "1 · Text reasoning over static tokens",
          "Once, before reasoning",
          "No. Bounded by what the visual tokens kept",
          "Reads around missing detail; drifts to language priors in long traces"
        ],
        [
          "2 · Interleaved perception and reasoning",
          "Repeatedly, at the model's request",
          "Yes, if it looks at the right place at enough resolution",
          "Looks in the wrong place; repeats crops; over-queries"
        ],
        [
          "3 · Latent multimodal reasoning",
          "Once, then re-represented internally",
          "Usually no, unless it re-encodes the image",
          "Latents can collapse or drift; hard to debug"
        ]
      ]
    }
  },
  "vlms-that-act": {
    "title": "VLMs That Act",
    "readTime": "40 min",
    "summary": "When the image becomes the live state of a computer, a VLM turns from a function into a policy. Its output must execute, its own actions shape what it sees next, and success is a fact about the world.",
    "framework": [
      "Choose what the agent observes and how it acts",
      "Train on trajectories, then on outcomes",
      "Evaluate in a live environment and defend in the harness"
    ],
    "takeaway": "Per-step accuracy, grounding scores and on-screen text all mislead. Check the world state, test grounding separately from planning, and put safety in the harness, not in the prompt.",
    "cards": [
      [
        "What changes when a VLM moves from answering to acting?",
        "The output must execute, since a click lands or it does not. The input depends on the output, so errors compound, and success is a fact about the world that needs a live environment to grade."
      ],
      [
        "Why is the screenshot not the state?",
        "Two screenshots can be identical while the world differs, for example an expense report submitted once or twice. Benchmarks such as OSWorld and AndroidWorld grade by inspecting files, databases or system state, and agents should keep an action log."
      ],
      [
        "Which observation format works best?",
        "It depends on whether the model is trained to ground: accessibility text (12.24%) beat screenshots (at most 5.80%) in OSWorld for general models, but grounding-trained screenshot-only models later passed both. Set-of-Mark was found ineffective for web agents in SeeAct."
      ],
      [
        "Why is resolution often the real grounding problem?",
        "On a 3840 by 2160 screen with 1,024 tokens, one token covers about 90 pixels, so a 24-pixel icon is a quarter of a token wide. Zoom-in search lifted ScreenSpot-Pro from 18.9% to 48.1% with no training."
      ]
    ],
    "deepDive": [
      [
        "What are the action-space levels and their trade-off?",
        "Pixel level works on any GUI but needs exact grounding at every pointing action. Code as action bundles events, element level lets the harness resolve ids, and API level needs no perception but covers only planned tasks."
      ],
      [
        "Why does behavioural cloning struggle on long tasks?",
        "Training states come from the expert and test states from the model, so one mistake leads to unseen screens. A no-recovery baseline gives about 0.55 over 30 steps at 2% error and about 0.21 at 5%."
      ],
      [
        "Does reinforcement learning from task outcomes help?",
        "DigiRL took a 1.3B model from 17.7% (supervised on static demonstrations) to 67.2% with offline-to-online RL, above a filtered cloning baseline at 57.8%. Costs are heavy environments and fallible model judges, and the post's toy lab did not reproduce the gain."
      ],
      [
        "Why test grounding separately from planning?",
        "SeeAct's GPT-4V completed 51.1% of live-web tasks when a human grounded its plans, and automatic grounding left a substantial gap. Test with oracle grounding to see which half to fix."
      ],
      [
        "Why do static benchmarks mislead, and what does the step budget do?",
        "They cannot credit a different valid path, test recovery or measure long horizons. Interactive scores also depend on the step budget: UI-TARS scored 24.6 on OSWorld at 50 steps and 22.7 at 15."
      ],
      [
        "Why can't a prompt defend a computer-use agent from on-screen injection?",
        "A prompt defence is more text on the same channel as the attack. Agents clicked adversarial pop-ups 86% of the time even when told to ignore them, so put defences in the harness as allow-lists, reversibility checks and confirmation gates."
      ]
    ],
    "results": [
      [
        "Zoom on dense screens",
        "18.9% → 48.1%",
        "On ScreenSpot-Pro, a training-free zoom-in search lifted accuracy from the best existing model's score."
      ],
      [
        "Pointing errors multiply",
        "\\(0.98^4 \\approx 0.92\\)",
        "Four pointing actions that each succeed 98% of the time succeed together about 92% of the time, while one API call has no pointing to get wrong."
      ],
      [
        "No-recovery success",
        "\\((1-\\varepsilon)^T\\)",
        "With independent errors and no recovery, 2% error over 30 steps gives about 0.55 and 5% gives about 0.21."
      ]
    ],
    "resultLinks": [
      3,
      4,
      5
    ],
    "table": {
      "title": "How to present a screen to the model",
      "intro": "Structured sources are precise but not always present. Pixels are always present, but the model does all the perception.",
      "columns": [
        "Observation",
        "Strength",
        "Weakness",
        "Availability"
      ],
      "rows": [
        [
          "Screenshot",
          "Exact view of what a person sees",
          "No names, roles or hidden elements",
          "Universal: any app, any OS"
        ],
        [
          "Accessibility tree",
          "Roles, names and states; stable names survive restyling",
          "No layout, colour or images; quality depends on the app",
          "Desktop and mobile; often missing in canvas apps"
        ],
        [
          "DOM or HTML",
          "Detailed and exact page structure",
          "Often very long and fragile to markup changes",
          "Web only"
        ],
        [
          "Hybrid",
          "Two sources can cross-check; highest robustness",
          "Highest token cost of the practical options",
          "Falls back to pixels when the element list is poor"
        ]
      ]
    }
  },
  "from-vlms-to-vlas": {
    "title": "From VLMs to VLAs",
    "readTime": "48 min",
    "summary": "A vision-language-action model starts from a pretrained VLM and adds a way to emit a fast stream of continuous motor commands. The VLM supplies semantics, while motor skill must come from robot data.",
    "framework": [
      "Separate what the VLM knows from what robot data must teach",
      "Pick an action representation that fits the control rate",
      "Judge the result with enough trials and safety below the model"
    ],
    "takeaway": "A VLA is limited by decisions per task, action tokens per second and the data behind its motions, not only by model size. Check where the policy fails before scaling anything.",
    "cards": [
      [
        "Why is controlling a robot harder than driving a GUI?",
        "A robot must send a vector of real numbers to its motors many times per second. Late commands make the arm stop or jerk, one wrong command shows a world the robot has never seen, and there is no undo for a dropped cup."
      ],
      [
        "What does the VLM bring to a robot policy, and what does it not?",
        "It brings semantic generalisation, unseen-object knowledge, spatial reasoning and task decomposition, but no new motions, proprioception or force. In RT-2 the same 5B model scored 9% from scratch and 42% from a pretrained VLM."
      ],
      [
        "Why do errors compound, and how does chunking help?",
        "A policy that leaves the demonstrated states can make on the order of εT²/2 mistakes in the worst case, and the bound grows with the number of decisions, not seconds. Predicting H actions at once cuts decisions to T/H, but the robot is blind to new observations while a chunk runs."
      ],
      [
        "Why can't a plain regression head handle robot demonstrations?",
        "Demonstrations are multimodal, and mean squared error predicts the average of left and right, which hits the obstacle. Tokens, diffusion and flow can hold several modes, though regression worked well for OpenVLA-OFT on single-robot fine-tuning."
      ]
    ],
    "deepDive": [
      [
        "How do the main action representations trade off?",
        "Per-step bins carry almost no information per token at high frequency, and FAST compresses chunks and trains up to 5 times faster than π0 but needs about 750 ms per second of motion. Flow matching takes about 100 ms but adds untrained weights."
      ],
      [
        "How do fast and slow systems split the work?",
        "A slow VLM understands the scene and a small fast policy turns it into commands from fresh observations, as in Helix (7B at 7 to 9 Hz, 80M at 200 Hz). 'Dual system' covers several designs, and a language interface can be inspected while a latent one cannot."
      ],
      [
        "What can go wrong when an action expert is added to a VLM?",
        "Training a random action expert jointly with the backbone harmed language following, through gradient interference. The fix trains the backbone on FAST tokens, the expert with flow matching, and adds a stop-gradient."
      ],
      [
        "How should a robot data budget be spent?",
        "On new environments and objects before more repetitions in one lab. Demonstrations per environment saturated quickly, and π0.5 with 104 training locations matched a baseline trained in the test homes."
      ],
      [
        "How does RL for VLAs differ from RL for reasoning LLMs?",
        "Real rollouts are slow and need resets, so group-relative sampling is costly, and one study found PPO beat GRPO and DPO. Real-world work leans on critics, advantage conditioning and human interventions."
      ],
      [
        "How many trials does a robot comparison need?",
        "Twenty trials at 50% success give a 95% interval of about ±22 points, and telling 50% from 60% reliably needs about 385 trials per policy. LIBERO is near saturation at 97.1%, so a gain there says little about generalisation."
      ]
    ],
    "results": [
      [
        "Compounding error",
        "\\(\\sum_{t=1}^{T} \\epsilon (T-t+1) \\approx \\epsilon T^2 / 2\\)",
        "In the worst case an imitating policy makes on the order of εT² mistakes, against εT if every step were judged on expert states."
      ],
      [
        "Pretraining lever",
        "9% → 42%",
        "The same RT-2 5B model on the same robot data, trained from scratch versus initialised from a web-pretrained VLM."
      ],
      [
        "Trials per policy",
        "\\(n \\approx (1.96+0.84)^2 \\, \\frac{p_A(1-p_A)+p_B(1-p_B)}{(p_A-p_B)^2}\\)",
        "Telling 50% from 60% success at 95% confidence and 80% power takes about 385 trials per policy."
      ]
    ],
    "resultLinks": [
      2,
      1,
      9
    ],
    "table": {
      "title": "Choose an action representation",
      "intro": "Read the work per chunk first, since it decides whether a representation can run at control rates at all.",
      "columns": [
        "Representation",
        "Work per 1-s chunk (50 Hz, 7-D)",
        "Handles multimodal demos",
        "Main catch"
      ],
      "rows": [
        [
          "Per-step bins",
          "7 sequential tokens per step, one call per step",
          "Yes, per dimension",
          "Weak training signal at high frequency"
        ],
        [
          "FAST (DCT + BPE)",
          "30 to 60 sequential tokens; about 750 ms in π0-FAST",
          "Yes",
          "Trains fast but runs slowly"
        ],
        [
          "Continuous regression, parallel decoding",
          "One forward pass",
          "No, predicts a central value",
          "Worked well in single-robot fine-tuning (OpenVLA-OFT); needs an output head"
        ],
        [
          "Flow-matching action expert",
          "10 passes of a 300M expert; 27 ms of π0's 73 ms",
          "Yes",
          "New untrained weights can harm the VLM's knowledge"
        ]
      ]
    }
  },
  "the-cost-of-a-picture": {
    "title": "The Cost of a Picture",
    "readTime": "42 min",
    "summary": "One ordinary picture is worth hundreds to thousands of text tokens, and those tokens cost compute, KV-cache memory and bandwidth. The post asks where the cost goes, what each cut removes, and which tasks notice.",
    "framework": [
      "Name the stage that dominates for your traffic",
      "Cut free first: caching and serving, then fewer tokens",
      "Check the cut on text-reading and grounding, not only averages"
    ],
    "takeaway": "Token count is set mostly by the connector and the resolution policy, and the right budget differs by task. Measure wall-clock time and test pruning on detail-heavy slices against random and pooling baselines.",
    "cards": [
      [
        "Which stage dominates the cost of an image request?",
        "It depends on answer length and batch size. In the worked estimate the image is 98% of a roughly 101 MB cache, and a 200-token answer takes about 0.85 s of decode against about 70 ms for encoding and prefill, so visual tokens dominate for short answers, many users and many images."
      ],
      [
        "Why can pruning results on average benchmarks mislead?",
        "Those benchmarks mostly ask about large objects and scenes. At 75% of tokens removed, random selection kept 95.0% and pooling 96.4% against 89.8% for FastV, and every method collapsed on RefCOCO grounding."
      ],
      [
        "How many visual tokens does a task need?",
        "It varies by orders of magnitude. For reasoning a fitted law favours a large language model with very few visual tokens, often under twenty, while for text reading the optimum flips towards more tokens."
      ],
      [
        "Does the connector design matter more than the token budget?",
        "No. In MM1's ablations resolution and visual token count had a large effect and connector type comparatively little, so tune the budget first."
      ]
    ],
    "deepDive": [
      [
        "Why are FLOPs saved not the same as time saved?",
        "Methods that score tokens with the attention matrix need it, and fused kernels like FlashAttention never write it out. SparseVLM had slightly more FLOPs than FastV but about 27% higher latency, so report wall-clock time."
      ],
      [
        "What changes when the model is small?",
        "The encoder becomes a large share: a So400m encoder is about 5% of weights beside a 7B language model and about 45% beside a 0.5B one. FastVLM found high resolution with a small language model suboptimal, so budget encoder latency first."
      ],
      [
        "What does weight-only quantization speed up?",
        "It speeds up decode, which is memory-bound, and saves memory. It barely helps image-heavy prefill, which is compute-bound, so cut tokens or quantize activations too."
      ],
      [
        "How do caching and pruning interact?",
        "A prefix cache keyed only on token ids would reuse one image's KV for another, so the image hash must be in the key. Question-guided pruning changes the kept tokens per question and breaks reuse, so for chat traffic caching can beat pruning."
      ],
      [
        "What does disaggregating the encoder buy?",
        "The EPD paper reported up to 15 times lower peak memory, 22 times larger batches and up to 71% lower TTFT, and a vLLM benchmark doubled goodput from 6 to 12 queries per second for four-image requests. The engineering cost is high, so use it when multi-image or bursty traffic causes interference."
      ],
      [
        "How should efficiency be measured honestly?",
        "Report time, not only FLOPs, and count every stage and memory. Include text-reading, grounding and counting tasks, compare against random and pooling at the same budget, state the base model's built-in compression, test multi-turn use and sweep the whole budget curve."
      ]
    ],
    "results": [
      [
        "Tokens after the connector",
        "\\(V = N_{patch} / m^2\\)",
        "With 14-pixel patches and a 2 × 2 merge, a 1344 × 1008 photo becomes 6,912 patches and 1,728 visual tokens."
      ],
      [
        "KV cache size",
        "\\(2 \\cdot L \\cdot n_{kv} \\cdot d_h \\cdot b \\cdot (V+T)\\)",
        "In the worked example the cache is about 101 MB, and the same request without grouped-query attention needs about 710 MB."
      ],
      [
        "Tokens versus model size",
        "\\(Y(N,T) = \\frac{A}{N^{\\alpha}} \\cdot \\frac{B}{T^{\\beta}} + D\\)",
        "For visual reasoning the fit gave α = 0.077 and β = 0.015, and for text reading the exponents reversed to 0.029 and 0.048."
      ]
    ],
    "resultLinks": [
      3,
      0,
      2
    ],
    "table": {
      "title": "Where token reduction acts",
      "intro": "Where a method acts decides which cost it can cut. Reported effects come from different base models and are not directly comparable.",
      "columns": [
        "Method",
        "Acts where",
        "Reported effect (authors)",
        "Main risk"
      ],
      "rows": [
        [
          "Pixel shuffle or 2 × 2 merge",
          "Connector, trained in",
          "4 times fewer tokens at factor 2, 16 times at factor 4",
          "Fixed ratio for every image"
        ],
        [
          "FastV",
          "Inside the LLM, after layer 2",
          "45% fewer FLOPs on LLaVA-1.5-13B",
          "Position bias; grounding collapse"
        ],
        [
          "VisionZip",
          "Encoder output, no training",
          "8 times faster prefill",
          "Budget fixed per image"
        ],
        [
          "DART",
          "Early or encoder-side, no training",
          "88.9% pruned, 2.99 times faster prefill",
          "May drop a unique but needed token"
        ],
        [
          "VL-Cache",
          "KV cache",
          "10% of the cache kept, up to 7.08 times faster decode",
          "No TTFT gain"
        ]
      ]
    }
  },
  "searching-with-pixels": {
    "title": "Searching With Pixels",
    "readTime": "43 min",
    "summary": "A VLM cannot read a whole archive of pages, so a visual RAG system searches first and reads second. The post covers how to score a match, index pages without OCR, rerank, and hand cited evidence to the generator.",
    "framework": [
      "Pick a scoring design by where its cost is paid",
      "Index, compress and rerank in a cascade",
      "Check the generator and its citations, not only retrieval"
    ],
    "takeaway": "Bi-encoders, late interaction and cross-encoders differ mainly in where the cost lands. Test against simple baselines on your own queries, and remember that perfect retrieval does not guarantee a good answer.",
    "cards": [
      [
        "How do bi-encoders, cross-encoders and late interaction differ?",
        "They differ in when the query and candidate first meet. A bi-encoder precomputes one vector per item, a cross-encoder needs a forward pass per candidate per query, and late interaction stores a vector per patch and scores with MaxSim."
      ],
      [
        "When does the modality gap hurt?",
        "In a single-modality pool the gap shifts every score alike, so ranking survives; in a mixed pool it favours the query's own side. UniIR saw wrong-modality results for 58.8% of queries with a CLIP model, falling to 2.7% after instruction tuning."
      ],
      [
        "Why did ColPali beat OCR pipelines on document pages?",
        "It scored 81.3 average nDCG@5 on ViDoRe against about 65.5 to 67.0 for text pipelines, and indexed at 0.39 s per page instead of 7.22. Its single-vector version scored 58.8, so most of the jump came from late interaction; text-dense pages suffer most from compression."
      ],
      [
        "What does a multi-vector index cost to store?",
        "Pages times vectors times dimensions times bytes: ColPali stores 1,030 vectors of 128 dimensions in 16-bit floats, about 257.5 KB per page. That is roughly 64 times a single 2,048-dimensional vector, and pooling, Matryoshka dimensions and quantization are the levers."
      ]
    ],
    "deepDive": [
      [
        "What do the two cutoffs in a retrieve, rerank, read cascade mean?",
        "The first cutoff is set by recall, since a reranker cannot recover a page never retrieved, and the reading cutoff by how many pages the generator can use. Reranking only the top 10 lifted DSE from 85.8 to 90.5 nDCG@5, per its model card."
      ],
      [
        "Does a bigger VLM backbone make a better retriever?",
        "Not automatically. MM-Embed's VLM retriever lost to a smaller CLIP model on plain cross-modal retrieval until trained with modality-aware hard negatives, so benchmark the simple baseline on your own query mix."
      ],
      [
        "Why do hard negatives matter, and what is the catch?",
        "Under the InfoNCE gradient, easy negatives carry almost no weight, so only close negatives teach anything. The hardest mined negatives are often false negatives that answer the query too, so pipelines skip the very top or filter with a stronger model or judge."
      ],
      [
        "Does perfect retrieval guarantee a good answer?",
        "No. On MRAG-Bench, gold images improved GPT-4o by only 5.82% while people improved by 33.16%, so evaluate the generator with gold evidence as well as retrieved evidence."
      ],
      [
        "What does a citation prove?",
        "Only that the model looked somewhere, not that the place supports the claim. Region-level citations make errors checkable and a verification step makes them checked."
      ],
      [
        "Why must benchmark scores be read with pool size and query style in mind?",
        "MMEB scores against 1,000 candidates while M-BEIR uses a pool of 5.6 million, and ViDoRe V1 saturated above 90 before V2's blind queries pushed scores into the 60s. Queries written while looking at a page tend to reuse its exact words."
      ]
    ],
    "results": [
      [
        "MaxSim",
        "\\(s(q,d) = \\sum_i \\max_j \\langle q_i, d_j \\rangle\\)",
        "Each query token finds its best-matching candidate vector and the best matches are summed, which keeps different locations on a page apart."
      ],
      [
        "Index size",
        "\\(\\text{pages} \\times \\text{vectors} \\times \\text{dims} \\times \\text{bytes}\\)",
        "For ColPali, 1,030 × 128 × 2 bytes is 263,680 bytes per page, about 264 GB per million pages."
      ],
      [
        "ColPali on ViDoRe",
        "81.3 vs 58.8",
        "Average nDCG@5 for the multi-vector model against its single-vector version, BiPali."
      ]
    ],
    "resultLinks": [
      0,
      3,
      2
    ],
    "table": {
      "title": "Choose a retriever family",
      "intro": "Moving from bi-encoder to cross-encoder, matching gets finer and precomputation gets harder.",
      "columns": [
        "Family",
        "When query and candidate meet",
        "Stored per candidate",
        "Typical role"
      ],
      "rows": [
        [
          "Sparse text (BM25 over OCR)",
          "At the end, via shared words",
          "Term weights, a few KB",
          "First stage or hybrid partner"
        ],
        [
          "Bi-encoder",
          "At the end, one dot product",
          "One vector",
          "First stage"
        ],
        [
          "Late interaction",
          "After encoding, token by token (MaxSim)",
          "One vector per token or patch",
          "First stage on small corpora, or second stage"
        ],
        [
          "Cross-encoder",
          "From the first layer",
          "Nothing; it cannot precompute",
          "Reranker on a short list"
        ]
      ]
    }
  },
  "what-happens-inside-a-vlm": {
    "title": "What Happens Inside a VLM",
    "readTime": "44 min",
    "summary": "A correct answer does not show that a VLM used the image. The post builds an interpretability toolkit and uses it to trace where visual information is lost between pixels and the answer.",
    "framework": [
      "Pick tools that match the stage you suspect",
      "Pair a cheap candidate finder with a causal test",
      "Find which stage lost the picture before choosing a fix"
    ],
    "takeaway": "The same wrong answer can come from the encoder, the connector, the routing, or language priors, and each needs a different fix. Findings rest mostly on LLaVA-family models, so retest on your own model and prompt format.",
    "cards": [
      [
        "Why is high attention not the same as importance?",
        "Some image tokens are visual sinks that draw attention whatever the question, and removing them did not hurt performance. In LLaVA-1.5, ablating an object's own tokens broke over 70% of identifications, so ablate what a heat map highlights before trusting it."
      ],
      [
        "How does image information reach the answer in adapter-style VLMs?",
        "Only attention moves information. In LLaVA-1.5-13B on GQA, blocking image to question tokens in layers 0 to 4 cut the correct answer's probability by about 60%, question to last by up to about 30%, and direct image to last did little, though another study found a direct route matters."
      ],
      [
        "Why report the no-image score next to the with-image score?",
        "A benchmark score mixes visual skill, language prior and memorised items: GeminiPro scored 42.9% on MMMU blind, and Sphinx-X-MoE scored 43.6% blind against 17.9% for its base language model. Multimodal gain is the score with images minus the score without."
      ],
      [
        "How can one wrong answer come from different stages?",
        "BlindTest failures sit in the language model's readout, CLIP-blind pairs lack information in the encoder, and for a four-stripe logo removing background cues raised accuracy by about 21 points. Probe the encoder first, since it decides which half to fix."
      ]
    ],
    "deepDive": [
      [
        "When do image tokens become word-like?",
        "Not at the input: projected image tokens were not decodable into words, and in LLaVA-1.5 the logit lens decoded about 24% of an object's patches at the best layer, around layer 26 of 33. Read image positions at middle and late layers."
      ],
      [
        "Is the connector a neutral translator?",
        "No. Between 40% and 60% of nearest-neighbour relations changed after projection, and high reconstruction loss predicted failures on grounded questions, though a companion lab found it not predictive for colour (Spearman +0.25)."
      ],
      [
        "Why is attention-based pruning risky?",
        "Image attention collapses after the first layers, which motivated FastV, but with 1D RoPE attention ranking drops the top of the image and localization collapsed. A companion lab on SmolVLM-256M saw attention pruning reach 56.7% against 70.0% for random dropping."
      ],
      [
        "What are the inside mechanisms of hallucination?",
        "Image reliance fades as the response grows, many tokens attend to summary tokens, RoPE weakens attention to distant image tokens, and earlier layers often recognised objects the final layer got wrong. Each mechanism was found on a few LLaVA-family models, so treat them as contributors."
      ],
      [
        "How firm are SAE features and steering vectors?",
        "A feature depends on the dictionary: rare concepts changed drastically across seeds. Steering vectors from the text-only backbone still improved CV-Bench spatial accuracy by up to 7.3 points, so check a feature survives retraining first."
      ],
      [
        "What limits the evidence?",
        "Much of it comes from LLaVA-1.5 with 576 tokens, a CLIP encoder and 1D positions, and few findings were retested on native-resolution or cross-attention designs. Image minimal pairs are hard to build, closed models allow only behavioural tests, and there is no shared benchmark for whether an interpretation is faithful."
      ]
    ],
    "results": [
      [
        "Route knockout",
        "about 60% · up to about 30% · negligible",
        "Drop in the correct answer's probability when blocking image to question, question to last position, and image directly to last position in LLaVA-1.5-13B on GQA."
      ],
      [
        "Logit-lens peak",
        "about 24% at layer 26 of 33",
        "Share of an object's patches that decode to its class name at the best layer in LLaVA-1.5."
      ],
      [
        "Gain and leakage",
        "\\(MG = S_v - S_{wv},\\; ML = \\max(0, S_{wv} - S_t)\\)",
        "Multimodal gain measures what the image adds, and leakage measures how much better the VLM does blind than its own language model."
      ]
    ],
    "resultLinks": [
      1,
      4,
      2
    ],
    "table": {
      "title": "Match the method to the question",
      "intro": "Moving down the rows, methods become more causal and more expensive. The robust findings use one method to find a candidate and another to test it.",
      "columns": [
        "Method",
        "Question it answers",
        "Causal?",
        "Main pitfall in VLMs"
      ],
      "rows": [
        [
          "Attention maps",
          "Where does a position read from?",
          "No",
          "Visual sinks and value norms distort the picture; heads disagree"
        ],
        [
          "Linear probes",
          "Is a property linearly decodable at this layer?",
          "No",
          "Shows presence, not use; needs labels and control tasks"
        ],
        [
          "Logit lens",
          "What word does this position resemble at layer ℓ?",
          "No",
          "Early layers decode poorly; lens maps are trained on text positions"
        ],
        [
          "Activation patching",
          "Does this activation carry the fact that changes the answer?",
          "Yes",
          "Noise corruption is off-distribution; image minimal pairs are hard to build"
        ],
        [
          "Attention knockout",
          "Does this route, at these layers, carry needed information?",
          "Yes",
          "Blocking changes attention elsewhere; results depend on window size"
        ]
      ]
    }
  },
  "models-that-see-and-draw": {
    "title": "Models That See and Draw",
    "readTime": "44 min",
    "summary": "Reading an image and writing one are very different jobs. The post covers why images are hard to output, how tokenizers and decoding orders handle it, and three ways to build one model that does both.",
    "framework": [
      "Pick a generation process that can commit to one mode",
      "Choose what the image tokenizer keeps: meaning or pixels",
      "Decide how much of the network the two skills share"
    ],
    "takeaway": "Sharing one tokenizer or one set of weights can hurt understanding, and the evidence favours shared attention with separate everything else. Synergy shows up mostly in training, not automatically at test time.",
    "cards": [
      [
        "Why can't a model draw by regressing pixels?",
        "Squared-error training converges to the conditional mean, so a caption with many valid images gets their blur, such as a half-transparent cat on both sides of a sofa. Every working generator needs a sampler, either a softmax over tokens or iterative denoising."
      ],
      [
        "Why is a pixel-reconstruction tokenizer a poor reader?",
        "In the Janus ablation, reading through a VQ tokenizer cut MMBench from 69.4 to 35.0 while generation barely changed (FID 8.72 against 8.53). With decoupled encoders, the unified model scored 69.4 against 70.6 for understanding alone."
      ],
      [
        "What are the three families, and where is each one's bottleneck?",
        "Bridge models pass a few dozen conditioning vectors, often 64, to a separate diffusion model. Autoregressive models pass every image token through a codebook softmax, and hybrids have no narrow interface but one trunk learns two tasks."
      ],
      [
        "Does understanding help drawing, and does it help at test time?",
        "The synergy is lopsided and mostly in training: with understanding data in the mix, MetaMorph needed as few as 5,000 generation samples to start. At test time, RealUnify found BAGEL rose from 32.7% to 47.7% when split into explicit understand-then-generate steps."
      ]
    ],
    "deepDive": [
      [
        "Why does image generation have to choose a decoding order?",
        "Text has one natural order and images do not. Raster autoregression needs one pass per token and commits early, while MaskGIT, next-scale prediction and diffusion fix global structure first; Show-o reports about 20 times fewer steps."
      ],
      [
        "If squared error blurs, why does flow matching work?",
        "The network learns the mean direction at one noisy point, not the mean image. The sampler takes a small step and re-evaluates, so each step commits a little more to one mode until a sharp image remains."
      ],
      [
        "What goes wrong with codebooks, and how is it fixed?",
        "Many entries are never chosen, so a large codebook can act small; low-dimensional normalised codes, FSQ and LFQ are the fixes. A companion lab did not reproduce the usage gain: normalised codes reached 6.4% against 4.5% for plain VQ, while FSQ reached 77.4%."
      ],
      [
        "Why share attention but separate the other weights?",
        "In BAGEL's controlled 1.5B study, per-modality weights with shared attention beat both a dense model and a mixture-of-experts at equal compute. Hybrids must also decide what later tokens see, since noised images make poor context."
      ],
      [
        "Why do published loss weights look contradictory?",
        "Emu3 weights the image loss by 0.5, Transfusion by 5, and BAGEL samples four generation examples per understanding example, because each counts loss differently. Check how a loss is normalised before copying its weight, and judge mixtures on both skills."
      ],
      [
        "What is actually known about closed models like GPT-4o image generation?",
        "OpenAI states image generation is embedded natively in the omnimodal model and gives no architecture, and Google has not published Gemini's. Claims about a diffusion head or semantic input encoders are informed guesses, not disclosures."
      ]
    ],
    "results": [
      [
        "Regression optimum",
        "\\(f^*(c) = E[x \\mid c]\\)",
        "The squared-error minimiser is the conditional mean, which for a many-mode caption is not one of the valid images."
      ],
      [
        "Janus ablation",
        "MMBench 69.4 → 35.0",
        "Using a VQ tokenizer instead of a semantic encoder for understanding, while generation FID barely moved."
      ],
      [
        "Rectified-flow loss",
        "\\(\\mathbb{E}\\,\\| v_\\theta(x_t, t, c) - (\\epsilon - x_0) \\|^2\\)",
        "The network predicts the straight-line direction from data to noise, and sampling takes small steps back from noise."
      ]
    ],
    "resultLinks": [
      0,
      1,
      5
    ],
    "table": {
      "title": "Choose a unified design",
      "intro": "Moving down the rows, the narrow interface between reading and drawing disappears, while training cost rises.",
      "columns": [
        "Family",
        "Narrowest interface",
        "Understanding at risk?",
        "Examples"
      ],
      "rows": [
        [
          "Bridge to external diffusion",
          "The conditioning vectors",
          "No, if the reader is frozen",
          "MetaQuery, BLIP3-o"
        ],
        [
          "Autoregressive, shared tokenizer",
          "Codebook softmax",
          "Yes, weak semantics",
          "Chameleon, Emu3"
        ],
        [
          "Autoregressive, decoupled encoders",
          "Codebook softmax",
          "Little",
          "Janus, Janus-Pro"
        ],
        [
          "Hybrid, dense trunk",
          "None inside the network",
          "Yes, needs care with noise",
          "Transfusion, Show-o2"
        ],
        [
          "Hybrid, modality experts",
          "None inside the network",
          "Little; text weights can be frozen",
          "LMFusion, BAGEL"
        ]
      ]
    }
  },
  "how-the-open-vlm-families-were-built": {
    "title": "How the Open VLM Families Were Built",
    "readTime": "52 min",
    "summary": "The post reads every major open VLM family against one checklist of data, model, training, evaluation and scale. It asks which choices recur and which ones controlled ablations support.",
    "framework": [
      "Read each family against the same checklist",
      "Trust within-paper ablations over cross-paper comparisons",
      "Spend on the driver of the capability you need"
    ],
    "takeaway": "Resolution handling, cropping, data and answer format moved scores more than connector type or encoder family. Each capability has its own driver, and cross-report numbers are only a rough position.",
    "cards": [
      [
        "What drives each capability in open VLMs?",
        "Each capability has its own driver: documents follow resolution and text-rich data, localisation follows grounding data, and math follows the language model and RL. Connector type and contrastive encoder family track none strongly."
      ],
      [
        "Why does image preprocessing matter so much?",
        "Five independent papers saw large document gains from resolution or tiling. With tokens fixed at 256, Gemma 3's DocVQA rose from 31.9 at 256 px to 59.8 at 896 px, so encode high and pool down, though more tiles slightly hurt MMMU in InternVL 1.5."
      ],
      [
        "Does the connector design matter?",
        "Little, next to resolution and token count, except that low-token resamplers lost on OCR (27.1 against 55.5 for Cambrian-1's aggregator). MiniCPM-V reached 890 on OCRBench with a resampler, so the penalty is not absolute."
      ],
      [
        "What did the RL and preference stages show?",
        "Nearly every 2025 family added one. Gains were largest on reasoning and on small models, a model's pass@k before RL bounds what RL can reach, and a thinking mode can cost perception: Qwen3-VL Thinking scored 875 on OCRBench against 920 for Instruct."
      ]
    ],
    "deepDive": [
      [
        "Why did the families fix things in the same order?",
        "Resolution came first, then data curation, then preference or RL training, as in InternVL and Qwen-VL. Resolution sets a ceiling on document tasks and RL gains are bounded by what the base model can sample, so more RL will not fix weak reading."
      ],
      [
        "What moved early VLM scores most?",
        "Task data, answer format and how the image is cut. In LLaVA-1.5, VQAv2 with a format prompt lifted MME from 809.6 to 1,323.8 against about 31 for the MLP, and Molmo's overlapping crops lifted its average from 62.8 to 76.9."
      ],
      [
        "Should the vision encoder be frozen or trained?",
        "The evidence conflicts because setups differ: Prismatic found encoder fine-tuning harmful and Cambrian-1 found unfreezing helpful. Later families trained the encoder at a learning rate 5 to 10 times lower than the language model's."
      ],
      [
        "How many tokens does a document page need?",
        "It depends on text density, not pixels. DeepSeek-OCR held about 97% precision up to about 10 text tokens per vision token and about 60% near 20, and Idefics3 gained 13.7 DocVQA points by lifting Idefics2's 64-token limit."
      ],
      [
        "Does compute rank capability across families?",
        "No. Molmo-72B beat Llama 3.2 90B on DocVQA (93.5 against 90.1) at well under 1% of the compute. Within a family scale helps reliably, but compute totals cover different stages."
      ],
      [
        "How far can scores from different reports be trusted?",
        "Only as a rough position: LLaVA-NeXT-34B scored 51.1 on MMMU in one report and 46.7 in a re-evaluation. A within-paper change with everything else fixed is evidence, while cross-family trends are hypotheses."
      ]
    ],
    "results": [
      [
        "Encode high, pool down",
        "31.9 → 45.4 → 59.8",
        "Gemma 3 DocVQA at 256, 448 and 896 px input, with image tokens held at 256."
      ],
      [
        "Format and task data",
        "MME 809.6 → 1,323.8",
        "In LLaVA-1.5, adding VQAv2 with a one-line answer-format prompt gave the first large gain."
      ],
      [
        "Text density limit",
        "about 97% → about 60%",
        "DeepSeek-OCR decoding precision at roughly 10 and 20 text tokens per vision token."
      ]
    ],
    "resultLinks": [
      1,
      5,
      7
    ],
    "table": {
      "title": "Match the capability to its driver",
      "intro": "Spend on the driver of the capability you need. Evidence strength is as labelled in the post.",
      "columns": [
        "Capability",
        "Main driver",
        "Evidence strength",
        "Example from the post"
      ],
      "rows": [
        [
          "Document reading",
          "Resolution or tiling and text-rich data",
          "Strong",
          "Gemma 3 DocVQA 31.9 to 59.8 at a fixed 256 tokens"
        ],
        [
          "Math reasoning",
          "Language model and preference or RL stages",
          "Strong",
          "InternVL3 MPO raised MathVista from 74.0 to 79.0"
        ],
        [
          "Localisation",
          "Grounding and pointing data",
          "Strong",
          "GLM-V grounding-only RL: +30.4 grounding, 4.6 lower OCR and charts"
        ],
        [
          "Multilingual chat",
          "A thin multilingual SFT layer",
          "Moderate",
          "90K samples lifted German from 22.8 to 76.5 on a chat benchmark"
        ],
        [
          "Knowledge (MMMU)",
          "The language model",
          "Hypothesis",
          "Cambrian-1 found MMMU barely needs the image"
        ]
      ]
    }
  }
});
