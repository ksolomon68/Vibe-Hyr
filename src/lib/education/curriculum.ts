export interface ReflectionQuestion {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
}

export interface EducationModule {
  id: string;
  num: string;
  title: string;
  subtitle: string;
  duration: string;
  hasReflection: boolean;
  content: string;
  quiz: ReflectionQuestion[];
}

export interface EducationProgram {
  id: string;
  num: string;
  slug: string;
  audience: string;
  title: string;
  subtitle: string;
  description: string;
  totalTime: string;
  certTitle: string;
  modules: EducationModule[];
}

export const PROGRAMS: EducationProgram[] = [

  // ── PROGRAM 01: THE EDUCATOR RESET ─────────────────────────────────
  {
    id: "ed01",
    num: "01",
    slug: "the-educator-reset",
    audience: "All Staff",
    title: "The Educator Reset",
    subtitle: "Nervous System Health · Emotional Resilience · Self-Mastery",
    description: "Vibe Hyr's core staff program. Focuses on teacher wellness, nervous system literacy, and the energy of leadership. The foundation of everything that follows.",
    totalTime: "3.5h",
    certTitle: "Educator Reset Certification",
    modules: [
      {
        id: "ed01-m01", num: "01",
        title: "The Regulated Leader",
        subtitle: "Understanding that your internal state is your most powerful classroom tool",
        duration: "35m", hasReflection: false,
        content: `
          <h2>THE REGULATED LEADER</h2>
          <p>Before we talk about curriculum, co-regulation, or classroom management — we need to talk about you. Not as a professional. As a nervous system. Because the most overlooked variable in educator effectiveness is not pedagogy, not content mastery, and not classroom structure. It is the <strong>regulated or dysregulated state of the adult body in the room</strong>.</p>
          <p>Students — especially those from high-stress home environments — are extraordinarily sensitive to the physiological state of the adults around them. This is not metaphor or motivation. It is biology: mirror neurons, co-regulation, and the social nervous system.</p>

          <div class="stat-row">
            <div class="stat-card">
              <div class="stat-num">44%</div>
              <div class="stat-label">of new teachers leave within 5 years</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">75%</div>
              <div class="stat-label">of educators report daily student dysregulation</div>
            </div>
            <div class="stat-card">
              <div class="stat-num">80%</div>
              <div class="stat-label">experience chronic stress affecting classroom climate</div>
            </div>
          </div>

          <h3>The Internal State Premise</h3>
          <p>Every person in the room with students carries a nervous system that is broadcasting — continuously, non-verbally, and often unconsciously. Students read this broadcast. In the absence of a regulated adult, dysregulated students have no external co-regulator to borrow from. In the presence of one, even the most activated student can begin to settle.</p>
          <p>The Vibe Hyr framework for educators starts with one foundational premise: <em>you cannot give what you don't have.</em> If your nervous system is chronically in survival mode — and for 80% of educators, it is — then the first professional development priority is restoring your own regulation, not adding more instructional strategies.</p>

          <div class="callout">
            "When we empower teachers to master their own internal state, the classroom follows. We aren't just giving them a curriculum to teach; we're giving them a way to be."
            <cite>— Khalil Ghaile, Founder, Vibe Hyr</cite>
          </div>

          <h3>What Regulation Actually Looks Like</h3>
          <ul class="bullet-list">
            <li><strong>Physiological baseline:</strong> Heart rate, breath rate, and muscle tension at resting levels even in challenging moments</li>
            <li><strong>Response latency:</strong> A measurable pause between stimulus and response — the ability to choose rather than react</li>
            <li><strong>Emotional availability:</strong> The capacity to remain present with a student's emotional state without absorbing or matching it</li>
            <li><strong>Recovery speed:</strong> How quickly you return to baseline after a difficult encounter</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">SELF-ASSESSMENT — WHERE ARE YOU RIGHT NOW?</div>
            <p>Before the next module, rate yourself 1–5 on each dimension: physiological baseline, response latency, emotional availability, recovery speed. This is your regulation baseline. You'll revisit it at the end of Module 06. The number isn't a judgment — it's a starting point.</p>
            <p>The goal of this entire program is to move each number. One point in any direction, consistently, changes the entire classroom experience.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed01-m02", num: "02",
        title: "Nervous System Literacy",
        subtitle: "The biology of stress and calm for adults — how to read your own body's signals before they read you",
        duration: "30m", hasReflection: false,
        content: `
          <h2>NERVOUS SYSTEM LITERACY</h2>
          <p>Nervous system literacy is the ability to read your own physiological state accurately and in real time — and to understand which part of your nervous system is currently driving the car. Most educators have never been formally taught this. They experience stress, exhaustion, frustration, and anxiety without a framework for understanding what is biologically happening — or what to do about it.</p>

          <h3>The Three States</h3>
          <p>Polyvagal Theory (Dr. Stephen Porges) describes three primary states of the autonomic nervous system. Understanding which state you're in at any moment is the foundation of self-regulation.</p>
          <ul class="bullet-list">
            <li><strong>Ventral Vagal — Safe and Social:</strong> Open, curious, connected, creative, able to reason. This is your optimal teaching state. You can read social cues, modulate your voice, and genuinely engage. Students feel safe around you.</li>
            <li><strong>Sympathetic — Fight or Flight:</strong> Activated, reactive, tunnel-vision, elevated heart rate. You're managing, not teaching. Decisions are faster but less nuanced. Students feel your urgency and often mirror it.</li>
            <li><strong>Dorsal Vagal — Shutdown:</strong> Disconnected, exhausted, "going through the motions." You're present in body but absent in engagement. Students feel the absence and often escalate to get a response.</li>
          </ul>

          <div class="key-concept">
            <div class="key-concept-label">THE CRITICAL INSIGHT</div>
            <p>Most classroom management strategies are designed for Ventral Vagal educators — they require reasoning, creativity, and relational attunement to execute well. When a teacher is in Sympathetic or Dorsal states, these strategies feel impossible or hollow. Regulation is not a soft skill. It is the prerequisite for every hard skill in the room.</p>
          </div>

          <h3>Reading Your Body's Signals</h3>
          <p>Each state produces distinct somatic signals. Learning to recognize yours — before the situation escalates — is the practical skill this module develops.</p>
          <ul class="bullet-list">
            <li><strong>Sympathetic signals:</strong> Jaw tension, shoulder elevation, chest tightness, shortness of breath, voice pitch rising, sense of time pressure</li>
            <li><strong>Dorsal signals:</strong> Heavy limbs, flat voice, difficulty tracking conversation, wanting to disappear, feeling "behind glass"</li>
            <li><strong>Ventral signals:</strong> Soft belly, open chest, genuine eye contact available, voice has range, curiosity is accessible</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">BODY SCAN PROTOCOL — 60 SECONDS</div>
            <p>Three times a day — before first bell, before lunch, before last period — do a 60-second body scan: jaw, shoulders, chest, breath. Name the state. Sympathetic / Ventral / Dorsal. No action required. Just naming begins the shift. Research shows that labeling physiological state — affect labeling — reduces amygdala activation within seconds.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed01-m03", num: "03",
        title: "The Co-Regulation Move",
        subtitle: "Meeting a student's storm with your calm — the biology of presence as intervention",
        duration: "35m", hasReflection: false,
        content: `
          <h2>THE CO-REGULATION MOVE</h2>
          <p>Co-regulation is the process by which a regulated nervous system helps regulate a dysregulated one — not through instruction or discipline, but through <em>presence</em>. It is one of the most powerful interventions available in any educational setting, and it requires exactly one thing: a regulated adult.</p>

          <h3>The Biology</h3>
          <p>The human nervous system is a social organ. It is designed to regulate in relationship — to borrow stability from the nervous systems of calm others. This process operates through multiple channels: the facial action system, prosody (the music of the voice), breath synchrony, and mirror neuron activity. None of this is conscious for the student. It simply happens when a regulated body is present in the room.</p>
          <p>A dysregulated student is not being defiant. Their brainstem is running a survival protocol. Logic, consequences, and raised voices are completely ineffective because they are addressed to the prefrontal cortex — which has temporarily gone offline. The only thing that can reach a brainstem-activated student is another nervous system that is broadcasting safety.</p>

          <div class="callout">
            "You cannot cognitively instruct a nervous system out of survival mode. You can only offer it another nervous system to synchronize with."
            <cite>— Dr. Stephen Porges</cite>
          </div>

          <h3>The Co-Regulation Move — Step by Step</h3>
          <ul class="bullet-list">
            <li><strong>Step 1 — Regulate yourself first:</strong> Before approaching a dysregulated student, take one slow exhale. Drop your shoulders. Soften your jaw. You are preparing your broadcast.</li>
            <li><strong>Step 2 — Lower physical proximity:</strong> If safe, reduce your height relative to the student. Sitting beside rather than standing over removes the threat signal.</li>
            <li><strong>Step 3 — Slow your voice prosody:</strong> Drop your pitch slightly. Slow your cadence. The pace of your speech is directly regulating. A slow, low voice tells the brainstem: no emergency here.</li>
            <li><strong>Step 4 — Offer presence, not problem-solving:</strong> "I'm here. We've got time." Not "Why did you do that?" Problem-solving can come after regulation — never during.</li>
            <li><strong>Step 5 — Wait:</strong> Regulation is not instant. Allow 2–4 minutes of quiet presence before attempting any language-based interaction.</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">THE REGULATED APPROACH DRILL</div>
            <p>Practice this sequence before you need it. Find a quiet moment and rehearse each physical element: jaw softened → shoulders dropped → slow exhale → low voice → seated proximity. Repeat until the sequence is muscle memory. When the moment arrives in the classroom, the drill fires automatically.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed01-m04", num: "04",
        title: "The Gap Between Stim and Response",
        subtitle: "Redefining classroom management through the space Viktor Frankl called 'the last human freedom'",
        duration: "30m", hasReflection: false,
        content: `
          <h2>THE GAP BETWEEN STIM AND RESPONSE</h2>
          <p>Viktor Frankl, writing from inside a Nazi concentration camp, identified what he called "the last human freedom" — the ability to choose one's response to any stimulus. Between stimulus and response, there is a space. In that space lies freedom and power.</p>
          <p>For educators, this space is the entire ballgame. The stimulus — a disruptive student, a challenging parent email, a colleague's comment — arrives constantly. The response — what you say, how you hold your body, what emotional tone you broadcast into the room — determines the outcome. <strong>The gap is trainable.</strong></p>

          <h3>What Narrows the Gap</h3>
          <ul class="bullet-list">
            <li><strong>Sympathetic activation:</strong> Fight-or-flight compresses the gap to near-zero. Reactions happen before conscious thought.</li>
            <li><strong>Accumulated stress:</strong> The tighter your nervous system's baseline, the faster responses trigger.</li>
            <li><strong>Unprocessed emotional charge:</strong> Specific triggers — a tone of voice, a type of disrespect — that carry historical charge narrow the gap around that stimulus specifically.</li>
            <li><strong>Sleep deprivation:</strong> Each hour of lost sleep measurably narrows prefrontal override capacity.</li>
          </ul>

          <div class="key-concept">
            <div class="key-concept-label">THE PRACTICAL REFRAME</div>
            <p>Classroom management is not about what you do to students. It is about what happens in the space between their behavior and your response. Every technique — every protocol, every strategy — is only as effective as the gap allows. Widen the gap, and every tool you already have works better. Narrow it, and no tool works.</p>
          </div>

          <h3>Training the Gap</h3>
          <p>The gap is widened through three practices, all covered across this program:</p>
          <ul class="bullet-list">
            <li><strong>Physiological regulation:</strong> A regulated nervous system has a naturally wider gap at baseline</li>
            <li><strong>Observer capacity:</strong> The ability to notice your own activation as it begins — before it peaks</li>
            <li><strong>Micro-interventions:</strong> Specific techniques for real-time gap extension when activation is rising</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">GAP JOURNAL — 3 DAYS</div>
            <p>For three days, log each incident where your gap narrowed — where you reacted rather than responded. Note: What was the stimulus? What was the physical signal that preceded the reaction? What was the response? What would you have done from a wider gap?</p>
            <p>You are not building a record of failures. You are mapping your specific trigger-stimulus territory — the inputs that consistently narrow your gap. That map is the training plan.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed01-m05", num: "05",
        title: "Compassion Without Fatigue",
        subtitle: "Language and boundaries for holding space without becoming the space",
        duration: "35m", hasReflection: false,
        content: `
          <h2>COMPASSION WITHOUT FATIGUE</h2>
          <p>Compassion fatigue is not a character flaw. It is a predictable physiological and psychological outcome of sustained emotional labor without adequate recovery. Educators are particularly vulnerable because the nature of the work — being emotionally present for 25–35 people simultaneously for 6+ hours daily — is among the most demanding forms of relational labor that exists.</p>
          <p>The problem is not compassion. The problem is compassion without boundaries — the pattern of absorbing rather than witnessing, of merging rather than accompanying.</p>

          <h3>The Absorption/Witness Distinction</h3>
          <p>An <em>absorber</em> takes the student's emotional state into themselves. The student's anxiety becomes the teacher's anxiety. The student's anger activates the teacher's threat response. After a day of absorbing, the educator is depleted, activated, and often carrying emotional material that doesn't belong to them.</p>
          <p>A <em>witness</em> sees, acknowledges, and holds space for the student's emotional state without internalizing it. The metaphor: a lighthouse doesn't enter the storm. It stands steady and visible from within it. Students need your presence. They need your steadiness. They don't need you to feel what they feel.</p>

          <div class="callout">
            "Empathy is not the same as taking on someone else's suffering. True compassion is the capacity to be moved without being swept away."
            <cite>— Pema Chödrön</cite>
          </div>

          <h3>Boundary Language That Works</h3>
          <ul class="bullet-list">
            <li><strong>With students:</strong> "I see that you're upset, and I'm here with you. I'm not going anywhere." (Presence without merger)</li>
            <li><strong>With parents:</strong> "I hear that this is really hard for your family. Let me tell you what I can do from my seat." (Acknowledgment + scope)</li>
            <li><strong>Internal language:</strong> "This belongs to them, not to me. I can care without carrying it home." (Witness frame)</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">THE TRANSITION RITUAL</div>
            <p>Create a physical transition between school and home — something that signals to your nervous system that the workday is complete and you are not required to continue processing. Examples: a specific song played in the car, a shower immediately after arrival home, a 5-minute walk. The specific act matters less than its consistency. Consistent transition rituals reduce cortisol carryover by signaling the amygdala that the threat environment has ended.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed01-m06", num: "06",
        title: "Elevating the Staff Room",
        subtitle: "Building a peer culture that fills rather than drains — collective regulation as school infrastructure",
        duration: "30m", hasReflection: true,
        content: `
          <h2>ELEVATING THE STAFF ROOM</h2>
          <p>Everything covered in modules 01–05 applies at the individual level. This module applies the same frameworks at the collective level — because a school's emotional climate is not determined by any single teacher. It is a product of the collective nervous system of the staff.</p>
          <p>A staff room that runs on complaint, competition, and chronic stress broadcasts that frequency throughout the building. Students absorb it. A staff room that runs on genuine mutual support, shared language, and collective regulation — however imperfect — creates an entirely different building-wide environment.</p>

          <h3>What Collective Regulation Looks Like</h3>
          <ul class="bullet-list">
            <li><strong>Shared language:</strong> When staff can say "I'm in sympathetic right now — I need 3 minutes" and have colleagues understand immediately, the culture has shifted</li>
            <li><strong>Regulated arrival practices:</strong> Brief, consistent morning practices that set baseline before students arrive — 5 minutes of collective stillness is worth an hour of reactive management</li>
            <li><strong>Complaint hygiene:</strong> The distinction between processing (specific, time-limited, solution-oriented) and venting loops (repetitive, escalating, unresolved) — and how to interrupt the latter without invalidating the former</li>
            <li><strong>Mutual accountability:</strong> Colleagues who will honestly say "you look activated — do you want to talk before next period?" rather than silently watching each other spiral</li>
          </ul>

          <div class="key-concept">
            <div class="key-concept-label">THE INFRASTRUCTURE INSIGHT</div>
            <p>Wellness is not a perk. It is infrastructure. A school that invests in staff nervous system regulation is not making a soft decision. It is making the single highest-leverage investment available — because a regulated staff produces regulated students, who produce measurable academic and behavioral outcomes.</p>
          </div>

          <div class="practice-box">
            <div class="practice-label">PROGRAM COMPLETION — YOUR RESET PLAN</div>
            <p>You've completed The Educator Reset. Before you close this module, write three things: (1) One regulation practice you will implement personally, daily. (2) One co-regulation move you will bring into your classroom this week. (3) One thing you will stop absorbing — a boundary you will practice holding.</p>
            <p>These three commitments, held for 21 days, will change your classroom. Not because the students changed. Because you did.</p>
          </div>
        `,
        quiz: [
          {
            q: "Why is educator nervous system regulation described as 'infrastructure' rather than a soft skill?",
            options: ["It sounds more impressive to administrators", "A regulated staff directly produces regulated students, which produces measurable academic and behavioral outcomes", "Nervous systems are physical structures in the body", "It justifies investment in wellness programs"],
            correct: 1,
            explanation: "Regulation is the prerequisite for every instructional strategy, co-regulation move, and classroom management technique. Without it, even excellent pedagogy is hampered. With it, even basic tools work better."
          },
          {
            q: "The distinction between 'absorber' and 'witness' in compassion work means:",
            options: ["Absorbers are more empathetic", "Witnesses don't care about their students", "A witness sees and holds space for a student's emotional state without internalizing it — like a lighthouse in a storm", "Absorption is required for trauma-informed practice"],
            correct: 2,
            explanation: "Students need your presence and steadiness, not your emotional merger with their state. The lighthouse metaphor is precise: you are most useful when you remain visible and stable from within the storm, not when you enter it."
          },
          {
            q: "Viktor Frankl's 'gap between stimulus and response' is trainable because:",
            options: ["You can learn to ignore triggers", "Physiological regulation widens the baseline gap, and observer capacity allows you to notice activation before it peaks", "Time management reduces stimulus frequency", "Students become less disruptive with experience"],
            correct: 1,
            explanation: "The gap is a function of nervous system state and observer capacity — both of which are trainable. A regulated baseline means a wider natural gap. Observer awareness means catching activation before it compresses to zero."
          }
        ]
      }
    ]
  },

  // ── PROGRAM 02: VIBRATIONAL LEADERSHIP ─────────────────────────────
  {
    id: "ed02",
    num: "02",
    slug: "vibrational-leadership",
    audience: "Admin & Principals",
    title: "Vibrational Leadership",
    subtitle: "Culture Architecture · Wellness Advocacy · Conscious Leadership",
    description: "How school leaders set the frequency for an entire building. Frameworks for supporting staff wellness from the top down — because culture flows from the top of the nervous system hierarchy.",
    totalTime: "3h",
    certTitle: "Vibrational Leadership Certification",
    modules: [
      {
        id: "ed02-m01", num: "01",
        title: "The Principal as Frequency Setter",
        subtitle: "Understanding that your state as a leader is felt building-wide — every day, before you say a word",
        duration: "30m", hasReflection: false,
        content: `
          <h2>THE PRINCIPAL AS FREQUENCY SETTER</h2>
          <p>Every organization has a nervous system, and that nervous system has a hierarchy. In a school, the nervous system hierarchy flows from principal to department heads to teachers to students. The emotional frequency at the top propagates downward — not through policy, not through meetings, but through the biological broadcasting of physiological state.</p>
          <p>When a principal walks through a hallway activated, tight, and urgent, the staff feel it before they hear anything. When a principal moves through a building with genuine groundedness and presence, the building settles. This is not leadership philosophy. It is neurobiology. And it means that the single most high-leverage act any school leader can take is the disciplined regulation of their own internal state.</p>

          <h3>The Hierarchy of Nervous System Influence</h3>
          <p>Research in organizational psychology consistently shows that leader emotional states are contagious — more so than peer states — due to authority-based attunement. Staff are biologically primed to read their leader's state and calibrate to it. An anxious principal creates an anxious staff. A regulated principal creates the conditions for a regulated staff.</p>

          <div class="callout">
            "Leadership is not about being in charge. It is about taking care of those in your charge — and you cannot take care of anyone from a depleted, dysregulated state."
            <cite>— Simon Sinek</cite>
          </div>

          <div class="practice-box">
            <div class="practice-label">THE ARRIVAL PROTOCOL</div>
            <p>Before you walk into the building each morning, do a 2-minute physiological check. Jaw: soft or tight? Shoulders: dropped or elevated? Breath: deep or shallow? Belly: soft or held? If any signal is dysregulated, complete one slow cycle — 4-count inhale, 6-count exhale — before entering. You are not performing for staff. You are genuinely preparing your broadcast. The difference is felt immediately.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed02-m02", num: "02",
        title: "Culture Architecture",
        subtitle: "Designing building-wide systems that support nervous system health — not accidentally undermine it",
        duration: "35m", hasReflection: false,
        content: `
          <h2>CULTURE ARCHITECTURE</h2>
          <p>Culture is not what you put on the wall. It is not your mission statement or your values list. Culture is what happens in the first 60 seconds of a staff meeting. It is the quality of silence after a difficult announcement. It is whether a teacher will tell you the truth about how they're doing. These things are not accidental — they are the product of deliberate or accidental architecture.</p>

          <h3>The Five Architectural Elements</h3>
          <ul class="bullet-list">
            <li><strong>Physical environment:</strong> Does the space signal safety or threat? Natural light, comfortable temperature, and acoustic management are not decorative choices — they are nervous system inputs.</li>
            <li><strong>Temporal structure:</strong> Predictability is regulating. Consistent schedules, reliable check-ins, and clear timelines reduce the sympathetic activation that uncertainty produces.</li>
            <li><strong>Communication quality:</strong> The ratio of positive-to-corrective feedback in staff communication. Research suggests a minimum 5:1 ratio for psychological safety. Most schools are inverted.</li>
            <li><strong>Psychological safety:</strong> Can staff bring problems to leadership without fear of judgment or professional consequence? Without this, all data you receive is filtered — the problems you most need to know about remain invisible.</li>
            <li><strong>Recovery infrastructure:</strong> Are there genuine structures for staff recovery — not as personal responsibility but as institutional provision? Planning periods protected, decompression spaces available, meeting-free time preserved?</li>
          </ul>

          <div class="key-concept">
            <div class="key-concept-label">THE ARCHITECTURAL AUDIT</div>
            <p>Before implementing any new wellness initiative, audit your existing culture against these five elements. In many schools, new wellness programs are placed on top of systems that are actively creating dysregulation — and the result is cynicism rather than uptake. Fix the architecture first.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed02-m03", num: "03",
        title: "Holding Staff in Hard Moments",
        subtitle: "The regulated leader's toolkit for supporting dysregulated staff without becoming dysregulated yourself",
        duration: "30m", hasReflection: false,
        content: `
          <h2>HOLDING STAFF IN HARD MOMENTS</h2>
          <p>A teacher cries in your office after a parent confrontation. A veteran educator says they're thinking about leaving. A staff member is clearly running on empty but denying it. A conflict between two colleagues is spreading through the department. These are leadership moments — and they are nervous system moments. How you show up in them shapes everything that follows.</p>

          <h3>The Mistake Leaders Make</h3>
          <p>The instinct in almost every leadership training is to move immediately to problem-solving: What happened? What do we need to fix? What's the plan? This instinct is well-intentioned and completely counterproductive in the first two to five minutes of a genuinely distressed person's disclosure.</p>
          <p>A dysregulated person cannot receive solutions. Their prefrontal cortex — the part that evaluates options and makes plans — is significantly offline. Before any solution can land, the person needs to feel received. Witnessed. Not fixed.</p>

          <ul class="bullet-list">
            <li><strong>First 90 seconds — witness only:</strong> "I hear you." "That sounds really hard." "I'm glad you told me." No questions. No solutions.</li>
            <li><strong>Watch for the breath change:</strong> When a dysregulated person begins to regulate, their breath pattern shifts. This is the signal that the prefrontal cortex is coming back online.</li>
            <li><strong>Only then — collaborative problem-solving:</strong> "What do you need from me right now?" "What would be most helpful?" Let them lead.</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">YOUR HOLDING LANGUAGE</div>
            <p>Write five phrases you can say in the first 90 seconds of a difficult staff disclosure — phrases that communicate witness without immediately moving to solution. Memorize them. These are your co-regulation moves as a leader. They are as important as any policy or procedure you manage.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed02-m04", num: "04",
        title: "Wellness Advocacy — The Business Case",
        subtitle: "The data, the language, and the framework for making staff wellness non-negotiable at the district level",
        duration: "35m", hasReflection: false,
        content: `
          <h2>WELLNESS ADVOCACY — THE BUSINESS CASE</h2>
          <p>If you are reading this as a building principal, you will need to make the case for sustained wellness investment to a superintendent, a school board, or a budget committee. This module gives you the data, the framing, and the language to make that case persuasively — not as an argument for a nice-to-have, but as a return-on-investment analysis.</p>

          <h3>The Cost of Not Investing</h3>
          <p>Teacher turnover costs between $8,000 and $21,000 per departing teacher, depending on district size and replacement process. At a turnover rate of 15–20% (current national average), a school of 50 teachers loses 7–10 teachers per year, at a total replacement cost of $56,000–$210,000 annually. This does not account for institutional knowledge loss, student relationship disruption, or the 1–2 year productivity curve for new hires.</p>

          <div class="stat-row">
            <div class="stat-card"><div class="stat-num">$21K</div><div class="stat-label">average cost per teacher turnover</div></div>
            <div class="stat-card"><div class="stat-num">3×</div><div class="stat-label">more likely to stay when staff feel supported</div></div>
            <div class="stat-card"><div class="stat-num">62%</div><div class="stat-label">reduction in behavioral incidents reported in wellness program schools</div></div>
          </div>

          <h3>The Framing</h3>
          <p>When presenting to district leadership, reframe wellness from <em>staff benefit</em> to <em>academic infrastructure</em>. "We are proposing an infrastructure investment that directly reduces our highest recurring cost center — teacher replacement — while improving our primary outcome metric — student behavioral and academic performance." This framing is not manipulation. It is accurate. And it is the language that moves budget decisions.</p>

          <div class="practice-box">
            <div class="practice-label">BUILD YOUR BUSINESS CASE</div>
            <p>Calculate your school's current annual turnover cost using $14,000 per teacher (conservative midpoint). Calculate what a 30% reduction in turnover would save. This savings number is your maximum justifiable wellness investment, with budget left over. In most schools, this makes a comprehensive wellness program cost-neutral at minimum.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed02-m05", num: "05",
        title: "Data-Informed Wellness",
        subtitle: "Using the Vibe Hyr staff dashboard to make wellness visible, trackable, and actionable",
        duration: "25m", hasReflection: false,
        content: `
          <h2>DATA-INFORMED WELLNESS</h2>
          <p>One of the consistent barriers to sustained wellness investment is the perceived lack of data. Academic outcomes have grades. Attendance has percentages. Discipline has incident counts. Wellness has — what, exactly? This module answers that question by introducing the metrics that make staff wellness visible and correlatable with the outcomes districts already track.</p>

          <h3>The Vibe Hyr Staff Dashboard</h3>
          <p>For schools using the Vibe Hyr platform, the staff dashboard provides administrators with aggregate (anonymized) engagement data across the wellness modules, along with trend tracking on self-reported regulation scores and module completion rates. This data can be correlated against existing behavioral incident data, teacher retention, and absence rates.</p>

          <ul class="bullet-list">
            <li><strong>Engagement metrics:</strong> Module completion rates, active users per week, return usage patterns</li>
            <li><strong>Regulation trends:</strong> Aggregate self-reported regulation scores over time — tracked without identifying individuals</li>
            <li><strong>Incident correlation:</strong> Week-by-week comparison of platform engagement levels with behavioral incident data</li>
            <li><strong>Retention indicators:</strong> Staff who engage consistently with wellness tools show measurably different retention profiles</li>
          </ul>

          <div class="key-concept">
            <div class="key-concept-label">THE REPORTING PRINCIPLE</div>
            <p>The goal of wellness data is not surveillance. It is advocacy. When you can show a board that weeks with high staff wellness engagement correlate with lower behavioral incident rates, you have created an evidence base for sustainable investment. The data protects the program during budget pressure — because it makes the cost of cutting it visible.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed02-m06", num: "06",
        title: "The Year-Long Wellness Architecture",
        subtitle: "Designing a sustainable, building-wide wellness system that compounds over the school year",
        duration: "25m", hasReflection: true,
        content: `
          <h2>THE YEAR-LONG WELLNESS ARCHITECTURE</h2>
          <p>One-day professional development events are the fast food of staff wellness — immediately satisfying, quickly metabolized, and leaving little lasting nutritional value. Sustainable wellness is not an event. It is an architecture — a set of consistent structures, practices, and rhythms that build compound interest over the course of a school year.</p>

          <h3>The Four Seasonal Moments</h3>
          <ul class="bullet-list">
            <li><strong>August — Installation:</strong> Before students arrive, install the shared language and baseline practices. Educator Reset modules 01–03 for all staff. Establish peer accountability pairs. This is planting season.</li>
            <li><strong>November — Triage:</strong> The first major stress peak of the year. Active check-ins, leadership visibility, and reactivation of Module 05 (Compassion Without Fatigue). This is the moment most wellness initiatives collapse if not deliberately reinforced.</li>
            <li><strong>February — Renewal:</strong> Post-winter-break recalibration. Fresh commitment, mid-year regulation assessment, optional advanced modules for engaged staff.</li>
            <li><strong>May — Harvest:</strong> End-of-year data review, recognition of staff who engaged, and planning the next year's architecture. What worked? What will you do differently? This meeting plants the seed for August.</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">YOUR WELLNESS CALENDAR</div>
            <p>Block the four seasonal moments in your calendar now — before the year begins. Mark the November and February touchpoints as non-negotiable leadership visibility moments. The schools that sustain wellness programs do so not because conditions are easier — but because the calendar is already committed before the difficulty arrives.</p>
          </div>
        `,
        quiz: [
          {
            q: "Why does the 'business case' framing outperform 'staff benefit' framing when advocating for wellness investment?",
            options: ["Administrators don't care about staff", "It aligns with budget-committee language — reframing wellness as infrastructure investment with measurable ROI on the district's highest recurring cost center", "Business language is more professional", "It avoids resistance from skeptical staff"],
            correct: 1,
            explanation: "District leadership makes decisions in the language of outcomes and costs. Framing wellness as academic infrastructure — with calculable turnover savings — makes the investment case in the terms budget decisions are actually made."
          },
          {
            q: "The year-long wellness architecture identifies November as 'triage' because:",
            options: ["That's when budgets are approved", "It's the first major stress peak of the year — the moment most wellness initiatives collapse without deliberate reinforcement", "Holiday stress is highest in November", "Teacher evaluation cycles peak in November"],
            correct: 1,
            explanation: "Most wellness initiatives installed in August lose momentum by November — the first sustained stress period. Proactively planning for this moment, rather than reacting to it, is the difference between a program that lasts and one that doesn't."
          },
          {
            q: "In the first 90 seconds of a dysregulated staff member's disclosure, the regulated leader should:",
            options: ["Immediately move to problem-solving to demonstrate competence", "Witness without solving — communicate presence before offering any solution, because a dysregulated person cannot receive solutions", "Refer to HR immediately", "Ask clarifying questions to understand the full situation"],
            correct: 1,
            explanation: "A dysregulated person's prefrontal cortex is significantly offline. Solutions cannot land until the person feels received. The breath change — visible in the body — signals when they are ready. Only then does collaborative problem-solving become possible."
          }
        ]
      }
    ]
  },

  // ── PROGRAM 03: CO-REGULATION MASTERY ──────────────────────────────
  {
    id: "ed03",
    num: "03",
    slug: "co-regulation-mastery",
    audience: "Classroom Teachers",
    title: "Co-Regulation Mastery",
    subtitle: "De-Escalation · Classroom Climate · The Biology of Calm",
    description: "The science of meeting a student's storm with your calm. Practical, body-based tools for de-escalating through presence — the advanced classroom application of nervous system literacy.",
    totalTime: "3h",
    certTitle: "Co-Regulation Mastery Certification",
    modules: [
      {
        id: "ed03-m01", num: "01",
        title: "What Dysregulation Actually Is",
        subtitle: "A neuroscience lens on student behavior — why 'misbehavior' is almost always a nervous system event",
        duration: "30m", hasReflection: false,
        content: `
          <h2>WHAT DYSREGULATION ACTUALLY IS</h2>
          <p>The shift in understanding that makes everything else in this program possible: <strong>most of what we call student misbehavior is a nervous system event, not a choice event.</strong> This distinction is not about reducing accountability. It is about accurately identifying what's happening — because the intervention for a nervous system event and the intervention for a deliberate defiance event are completely different.</p>

          <h3>The Brain in Survival Mode</h3>
          <p>When a student's amygdala fires a threat signal — which can be triggered by anything from genuine physical danger to the social threat of being wrong in front of peers — the brain initiates a survival protocol. The prefrontal cortex goes significantly offline. The student loses access to reasoning, impulse control, perspective-taking, and language comprehension.</p>
          <p>In this state, the student is not choosing to be difficult. They are not testing your authority. They are in a neurobiological emergency response that evolved over millions of years specifically to override conscious thought in moments perceived as life-threatening. Addressing this with reasoning, consequences, or raised voices is like trying to convince someone's adrenal glands to calm down through logical argument.</p>

          <div class="callout">
            "It is not that these children won't listen. It is that in that moment, they literally cannot. The part of the brain that processes your words has been temporarily taken offline by the part designed to survive."
            <cite>— Dr. Dan Siegel</cite>
          </div>

          <h3>The Threat Taxonomy</h3>
          <p>Understanding what actually triggers threat responses in students expands the toolkit for prevention:</p>
          <ul class="bullet-list">
            <li><strong>Social threat:</strong> Public correction, comparison to peers, perceived loss of status — activates the same neural networks as physical threat</li>
            <li><strong>Novelty threat:</strong> Unpredictable transitions, unexpected demands, changes to routine without warning</li>
            <li><strong>Relational threat:</strong> Perceived rejection, disconnection from an attachment figure, loss of adult approval</li>
            <li><strong>Sensory threat:</strong> Noise, lighting, crowding, hunger — physiological inputs that push the nervous system toward activation</li>
          </ul>
        `,
        quiz: []
      },
      {
        id: "ed03-m02", num: "02",
        title: "The Regulation Toolkit",
        subtitle: "12 evidence-based micro-interventions for real-time nervous system support in the classroom",
        duration: "35m", hasReflection: false,
        content: `
          <h2>THE REGULATION TOOLKIT</h2>
          <p>These 12 tools are not theoretical. They are body-based, evidence-backed, and usable in a live classroom without disrupting instruction for other students. Each one works by activating the parasympathetic nervous system — shifting the student from threat-mode toward safety.</p>

          <h3>Movement-Based Tools</h3>
          <ul class="bullet-list">
            <li><strong>The Brain Break:</strong> 60-90 seconds of bilateral movement (cross-crawl, jumping jacks) resets the nervous system and restores prefrontal access. Available to the whole class — no individual singling out required.</li>
            <li><strong>The Standing Reset:</strong> Invite a dysregulated student to stand for 2 minutes at the back of the room. Standing activates the vestibular system and changes sensory input — often enough to shift state without any further intervention.</li>
            <li><strong>The Water Walk:</strong> Send a student on a purposeful errand (water, pencil, message delivery). The walking activates the bilateral neurological system. The purpose preserves dignity.</li>
          </ul>

          <h3>Breath-Based Tools</h3>
          <ul class="bullet-list">
            <li><strong>Box Breathing (whole class):</strong> 4-count inhale, 4-count hold, 4-count exhale, 4-count hold. Done as a class routine — not a targeted intervention — so no student is singled out.</li>
            <li><strong>The 6-Count Exhale:</strong> A single long exhale (longer than the inhale) activates the vagus nerve and shifts sympathetic to parasympathetic in under 30 seconds.</li>
          </ul>

          <h3>Relational Tools</h3>
          <ul class="bullet-list">
            <li><strong>The 2×10:</strong> Spend 2 minutes per day for 10 days having non-academic, genuine conversation with your most challenging student. Research shows this single practice reduces behavioral incidents with that student by up to 85%.</li>
            <li><strong>The Connection Before Correction:</strong> Before addressing behavior, make one relational contact: "How are you doing today?" — and mean it. The 10-second investment reduces resistance to subsequent correction significantly.</li>
            <li><strong>The Proximity Move:</strong> Silent, calm physical proximity to a student who is beginning to escalate — before language is needed. Presence as preventive intervention.</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">YOUR CLASSROOM TOOLKIT SELECTION</div>
            <p>Choose three tools from this module — one movement, one breath, one relational. Commit to implementing all three consistently for two weeks. At the end of two weeks, note which one produced the most visible shift. That's your primary tool. The others become your rotation.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed03-m03", num: "03",
        title: "Reading the Room",
        subtitle: "Developing somatic awareness of classroom climate — the early warning system that prevents escalation",
        duration: "30m", hasReflection: false,
        content: `
          <h2>READING THE ROOM</h2>
          <p>The most powerful moment to intervene in a dysregulation cycle is before it peaks — in the window when a student is beginning to activate but has not yet gone into full survival mode. Catching this window requires a skill most educators were never explicitly taught: somatic reading of the room's emotional climate.</p>

          <h3>The Four-Zone Model</h3>
          <p>Every classroom moves through four zones throughout the day. Learning to recognize which zone you're in — and to intervene at Zone 2 rather than Zone 4 — transforms classroom management from reactive to preventive.</p>
          <ul class="bullet-list">
            <li><strong>Zone 1 — Regulated:</strong> Students are engaged, calm, and task-focused. The energy is generative. Your job: sustain it.</li>
            <li><strong>Zone 2 — Activating:</strong> Subtle signals of rising energy — fidgeting increasing, side conversations starting, focus fragmenting. Early intervention here prevents escalation. Your job: a regulation input now costs almost nothing.</li>
            <li><strong>Zone 3 — Dysregulated:</strong> Open disruption, emotional reactivity, conflict. You are managing rather than teaching. Your job: regulation before instruction.</li>
            <li><strong>Zone 4 — Crisis:</strong> Active safety concern. Follow protocol. Do not manage — contain.</li>
          </ul>

          <h3>The Zone 2 Signals</h3>
          <p>These are the early signals most teachers miss — the 5-10 minute window before Zone 3 arrives:</p>
          <ul class="bullet-list">
            <li>Increased movement without purpose — shuffling, tapping, chair-rocking</li>
            <li>Social scanning — students looking at each other more than the task</li>
            <li>Volume creep — the overall classroom noise floor rising gradually</li>
            <li>Your own body — jaw tightening, slight urgency arising. Your nervous system is reading the room before your conscious mind is.</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">THE ZONE CHECK</div>
            <p>Set a silent timer for every 20 minutes during one class period. When it fires, do a 10-second Zone check: scan the room's energy, name the Zone (1-4), and make one intentional choice based on it. Over time, this check becomes automatic — a background process running continuously.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed03-m04", num: "04",
        title: "Language That Regulates vs. Language That Activates",
        subtitle: "The words, tone, and timing that de-escalate — and the common phrases that reliably make things worse",
        duration: "30m", hasReflection: false,
        content: `
          <h2>LANGUAGE THAT REGULATES VS. LANGUAGE THAT ACTIVATES</h2>
          <p>Language in the classroom operates on two levels simultaneously: the semantic level (what the words mean) and the prosodic/relational level (what they feel like to the nervous system). A dysregulated student may process 10–20% of your semantic content and 100% of your prosodic content. Understanding this changes everything about how you speak in difficult moments.</p>

          <h3>Language That Reliably Activates</h3>
          <ul class="bullet-list">
            <li><strong>"Calm down."</strong> Never, under any circumstances, tells a nervous system to calm down. It communicates that the person's emotional state is a problem — which is itself threatening.</li>
            <li><strong>"Why did you do that?"</strong> Requires prefrontal reasoning that is unavailable in a dysregulated state. Creates shame or confusion, both of which increase activation.</li>
            <li><strong>"Every time you..."</strong> Generalizing language activates threat. It signals judgment of identity rather than addressing specific behavior.</li>
            <li><strong>Volume matching.</strong> Raising your voice to manage a loud student escalates the room. Their nervous system reads your raised voice as confirmation that the threat level is high.</li>
          </ul>

          <h3>Language That Reliably Regulates</h3>
          <ul class="bullet-list">
            <li><strong>"I notice you seem frustrated."</strong> Affect labeling — naming the emotion without judgment — reduces amygdala activation within 90 seconds. Research-confirmed.</li>
            <li><strong>"I'm here. We've got time."</strong> Communicates safety without solving. Removes urgency from the student's threat assessment.</li>
            <li><strong>"You don't have to talk right now."</strong> Removes performance pressure, which is its own threat input.</li>
            <li><strong>Silence with presence.</strong> Often the most regulating thing available. Your calm, physical presence, without words, allows the student's nervous system to synchronize with yours.</li>
          </ul>

          <div class="callout">
            "The most powerful words in any de-escalation are not the cleverest ones. They are the simplest ones, spoken slowly, from a body that means them."
          </div>
        `,
        quiz: []
      },
      {
        id: "ed03-m05", num: "05",
        title: "Building Regulation Into Classroom Structure",
        subtitle: "Designing the physical and temporal environment of your classroom as a regulation infrastructure",
        duration: "30m", hasReflection: false,
        content: `
          <h2>BUILDING REGULATION INTO CLASSROOM STRUCTURE</h2>
          <p>Co-regulation as a reactive skill — something you deploy when a student is already dysregulated — is powerful. Co-regulation as a structural feature of your classroom environment — something that prevents dysregulation from reaching crisis point — is transformational. This module addresses the second.</p>

          <h3>The Regulatory Environment Design</h3>
          <ul class="bullet-list">
            <li><strong>Predictability:</strong> Post the daily schedule. Announce transitions 5 minutes in advance. Predictability removes anticipatory threat and is one of the single most powerful regulation tools available.</li>
            <li><strong>Sensory management:</strong> Lighting (reduce fluorescent where possible), acoustics (soft surfaces, noise reduction), temperature (cool rooms are more regulated rooms), and crowding awareness.</li>
            <li><strong>The Calm Corner:</strong> A designated space in the classroom — not a punishment zone but a regulation station — that any student can access proactively when they feel themselves activating. A regulation tool, a breathing prompt, something sensory. This removes the shame and stigma from needing to regulate.</li>
            <li><strong>Movement integration:</strong> Build movement breaks into the rhythm of instruction at the structural level — not as crisis response but as preventive regulation architecture.</li>
          </ul>

          <div class="key-concept">
            <div class="key-concept-label">DESIGN PRINCIPLE</div>
            <p>Every structural element of your classroom is communicating something to your students' nervous systems, continuously, before a single word is spoken. The question is not whether your environment is regulating or dysregulating — it always is one or the other. The question is whether that communication is intentional.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed03-m06", num: "06",
        title: "The 90-Day Co-Regulation Practice Plan",
        subtitle: "Integrating everything into a sustainable, compounding classroom practice",
        duration: "25m", hasReflection: true,
        content: `
          <h2>THE 90-DAY CO-REGULATION PRACTICE PLAN</h2>
          <p>Co-regulation is a skill, and like all skills, it compounds with practice. The first time you attempt a regulated approach to a crisis is the hardest. The tenth time, the body knows the sequence. The fiftieth time, it's automatic. This module gives you a 90-day structure that builds the skill to the automatic level.</p>

          <h3>Month 1 — Foundation (Days 1–30)</h3>
          <ul class="bullet-list">
            <li>Daily body scan practice — morning, midday, end of day</li>
            <li>Zone monitoring — one intentional Zone check per period</li>
            <li>One regulation tool implemented consistently — start with 2×10 for your most challenging student</li>
          </ul>

          <h3>Month 2 — Application (Days 31–60)</h3>
          <ul class="bullet-list">
            <li>Add the Calm Corner structural element</li>
            <li>Practice the regulated approach drill before each period</li>
            <li>Log one successful co-regulation moment per day — not the failures, the wins</li>
          </ul>

          <h3>Month 3 — Integration (Days 61–90)</h3>
          <ul class="bullet-list">
            <li>Review behavioral incident data from months 1–2 — you will likely see measurable reduction</li>
            <li>Share one tool with a colleague — teaching accelerates mastery</li>
            <li>Identify your next practice frontier — the area where regulation is still effortful rather than automatic</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">YOUR 90-DAY COMMITMENT</div>
            <p>Write your three Month 1 commitments now. Date them. Tell one colleague. The accountability of declaration — even informal — measurably increases follow-through. You have everything you need. The only remaining ingredient is repetition.</p>
          </div>
        `,
        quiz: [
          {
            q: "Why does saying 'calm down' to a dysregulated student reliably make things worse?",
            options: ["Students see it as dismissive", "It communicates that their emotional state is a problem — which is itself a threat signal that increases activation", "It's too simple to be effective", "Students don't respond to verbal commands when dysregulated"],
            correct: 1,
            explanation: "The command 'calm down' signals that the person's current state is wrong or unacceptable — a judgment that the threat-scanning amygdala reads as additional threat. Affect labeling ('I notice you seem frustrated') reduces amygdala activation by naming the state without judging it."
          },
          {
            q: "The most powerful moment to intervene in a dysregulation cycle is:",
            options: ["Zone 3 — when disruption is visible", "Zone 4 — crisis stage", "Zone 2 — when early activation signals appear, before full dysregulation occurs", "After the incident during debrief"],
            correct: 2,
            explanation: "Zone 2 intervention costs almost nothing — a brain break, a proximity move, a quiet check-in — and prevents Zone 3. Zone 3 intervention requires significantly more time, energy, and instructional disruption. Catching Zone 2 is the entire practical value of somatic classroom literacy."
          },
          {
            q: "The 2×10 strategy (2 minutes per day for 10 days with your most challenging student) is effective because:",
            options: ["Students perform better for teachers they like", "It reduces behavioral incidents by building genuine relational connection — the nervous system's most powerful regulator — before behavior becomes the context for every interaction", "It takes time away from academics, reducing pressure", "It identifies the root cause of behavior problems"],
            correct: 1,
            explanation: "Relational connection is the most powerful co-regulation tool available. When a student's nervous system has evidence of genuine attunement from a specific adult, the threat-scanning system relaxes specifically around that adult — reducing incidents by up to 85% in research contexts."
          }
        ]
      }
    ]
  },

  // ── PROGRAM 04: THE RETAINED EDUCATOR ──────────────────────────────
  {
    id: "ed04",
    num: "04",
    slug: "the-retained-educator",
    audience: "Districts & HR",
    title: "The Retained Educator",
    subtitle: "Staff Retention · Systemic Wellness · Culture ROI",
    description: "Systems-level approaches to reducing teacher turnover through culture-building and self-awareness integration. Designed for HR directors, district administrators, and school boards.",
    totalTime: "2.5h",
    certTitle: "Retention Systems Certification",
    modules: [
      {
        id: "ed04-m01", num: "01",
        title: "Why Teachers Actually Leave",
        subtitle: "The data behind the turnover crisis — and why the standard interventions haven't worked",
        duration: "30m", hasReflection: false,
        content: `
          <h2>WHY TEACHERS ACTUALLY LEAVE</h2>
          <p>Every district has data on teacher turnover. Almost none have accurate data on why it happens. Exit surveys capture departing teachers at their most diplomatic, their most fatigued, and their most conflict-avoidant — which means the data collected is systematically biased toward surface-level, face-saving explanations that rarely address root causes.</p>

          <h3>What the Research Actually Shows</h3>
          <p>When researchers follow up with departed teachers 6–12 months after resignation — when they are safe from professional consequences and no longer in survival mode — a very different picture emerges. The top three reasons teachers actually leave are:</p>
          <ul class="bullet-list">
            <li><strong>Feeling unseen and unsupported by leadership:</strong> Not paid poorly. Not overwhelmed with work. Not students. <em>Leadership.</em> Specifically: the felt absence of genuine care from administration.</li>
            <li><strong>Chronic emotional exhaustion without recovery infrastructure:</strong> Not workload per se, but emotional labor without any systemic provision for processing or recovery.</li>
            <li><strong>Loss of identity connection to the work:</strong> The feeling that what they came into teaching to do has been crowded out by compliance, data, and reactive management — that they can no longer access the reason they became teachers.</li>
          </ul>

          <div class="callout">
            "We keep trying to retain teachers with money and reduced paperwork. What teachers are telling us, consistently and quietly, is that they need to feel that their humanity matters in this building."
            <cite>— Dr. Susan Moore Johnson, Harvard Graduate School of Education</cite>
          </div>

          <div class="key-concept">
            <div class="key-concept-label">THE RETENTION INSIGHT</div>
            <p>The three root causes above share one feature: they are all relational and psychological, not structural or compensatory. This is why pay raises alone do not solve the turnover crisis. Money addresses none of the three top reasons teachers leave. Wellness-centered culture addresses all three.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed04-m02", num: "02",
        title: "The Retention Diagnostic",
        subtitle: "The assessment tools that surface the real state of your district's culture — before it shows up as resignations",
        duration: "25m", hasReflection: false,
        content: `
          <h2>THE RETENTION DIAGNOSTIC</h2>
          <p>Most districts discover they have a serious retention problem when they begin losing teachers they cannot afford to lose. By that point, the cultural conditions that produced the departures have usually been in place for 1–3 years. A retention diagnostic is the tool for reading the culture before it shows up in the exit survey data.</p>

          <h3>The Five Diagnostic Questions</h3>
          <p>These five questions, asked anonymously and regularly, give you a real-time reading of your retention risk:</p>
          <ul class="bullet-list">
            <li><strong>"Do you feel genuinely supported by your building leadership?"</strong> — The most predictive single question for 12-month retention intent</li>
            <li><strong>"Do you have adequate recovery time built into your work week?"</strong> — Measures structural wellness provision</li>
            <li><strong>"Do you feel connected to the original reason you chose this profession?"</strong> — Measures identity-work alignment</li>
            <li><strong>"Would you recommend this school as a place to work to a teacher you care about?"</strong> — The NPS proxy for staff culture quality</li>
            <li><strong>"Do you plan to be in this role in 18 months?"</strong> — The direct retention signal</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">DEPLOY THE DIAGNOSTIC</div>
            <p>Send these five questions as an anonymous pulse survey at the start of each quarter. Track the trend, not the number. A declining trend on question 5 gives you 6–9 months of advance notice before resignations materialize. That window is enough to intervene — if you use it.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed04-m03", num: "03",
        title: "Systemic Wellness Design",
        subtitle: "Building wellness into the architecture of the district — not as a program, but as a structural feature",
        duration: "30m", hasReflection: false,
        content: `
          <h2>SYSTEMIC WELLNESS DESIGN</h2>
          <p>The most common wellness initiative failure mode: a program is designed, funded, and launched — and then sits at 12% engagement while the structural conditions that are creating dysregulation remain completely unchanged. Structural wellness design addresses the architecture first, programs second.</p>

          <h3>The Five Structural Levers</h3>
          <ul class="bullet-list">
            <li><strong>Meeting hygiene:</strong> The average teacher attends 4–6 meetings per week, most of which could be emails. Every unnecessary meeting is a cortisol cost. Protect preparation and recovery time as rigorously as instructional time.</li>
            <li><strong>Communication norms:</strong> After-hours email expectations create ambient stress that never fully resolves. A district-wide norm of no administrative email sent or expected after 5pm and before 7am is a structural wellness intervention with zero budget requirement.</li>
            <li><strong>Protected planning time:</strong> Planning periods that are genuinely protected — not co-opted for coverage, meetings, or administrative tasks — are among the most direct investments in teacher wellbeing available.</li>
            <li><strong>Access to EAP:</strong> Employee assistance programs are in most districts. Most staff don't use them because they don't know they exist, the process feels stigmatized, or they don't have time. Active, destigmatized promotion of EAP is a retention tool.</li>
            <li><strong>Peer support structures:</strong> Formal peer mentoring, coaching triads, and team wellness check-ins build relational infrastructure that individuals cannot build alone.</li>
          </ul>

          <div class="key-concept">
            <div class="key-concept-label">THE SEQUENCE PRINCIPLE</div>
            <p>Do not launch wellness programs on top of broken structures. First, audit your five structural levers. Fix the worst one before adding any new initiative. A staff that sees structural change — rather than just program provision — begins to believe the institution means it. That belief is the foundation everything else is built on.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed04-m04", num: "04",
        title: "Onboarding Into a Culture of Wellness",
        subtitle: "How the first 90 days of a teacher's experience determine whether they'll be here in year three",
        duration: "25m", hasReflection: false,
        content: `
          <h2>ONBOARDING INTO A CULTURE OF WELLNESS</h2>
          <p>The data is stark: 44% of new teachers leave within five years. The vast majority who leave cite factors that were present — and knowable — within the first 90 days. The first 90 days are not orientation. They are the moment a new hire's nervous system decides whether this institution is safe, whether they belong, and whether they can sustain themselves here long-term.</p>

          <h3>The 90-Day Nervous System Architecture for New Hires</h3>
          <ul class="bullet-list">
            <li><strong>Days 1–10 — Belonging installation:</strong> Not information transfer — relationship building. The new hire needs to feel seen by at least two people in the building before the first day of classes. Assigned mentor who has protected time for the relationship.</li>
            <li><strong>Days 11–30 — Competence scaffolding:</strong> New teachers leave when they feel incompetent and unsupported simultaneously. Regular, specific, positive feedback on instructional practice in weeks 2–4 is retention investment with outsized ROI.</li>
            <li><strong>Days 31–60 — Honest safety:</strong> A formal check-in that explicitly asks: "What's harder than you expected? What would help?" — and genuinely responds to the answers. Most new teachers are struggling with something they are afraid to disclose. This check-in gives them a safe channel.</li>
            <li><strong>Days 61–90 — Identity reinforcement:</strong> Reconnecting the new hire to why they chose teaching — not through a motivational exercise but through genuine conversation about their specific vision for the work. Keeping identity-work connection alive is the most powerful long-term retention tool available.</li>
          </ul>
        `,
        quiz: []
      },
      {
        id: "ed04-m05", num: "05",
        title: "The Culture ROI Report",
        subtitle: "Building the data infrastructure that makes wellness investment defensible at board level",
        duration: "25m", hasReflection: false,
        content: `
          <h2>THE CULTURE ROI REPORT</h2>
          <p>Every HR director and district administrator faces the same challenge: the investment in culture and wellness is real, but the return is distributed, delayed, and expressed in metrics that don't naturally appear on a budget line. The Culture ROI Report is the tool for making the return visible — in the language that drives institutional resource allocation.</p>

          <h3>The Five Metrics to Track</h3>
          <ul class="bullet-list">
            <li><strong>Retention rate (annual):</strong> Year-over-year change in percentage of staff retained. A 5% improvement in retention rate at a 50-teacher school is approximately $52,500–$105,000 in avoided replacement costs.</li>
            <li><strong>Absence rate:</strong> Chronic absence (6+ days per year) is strongly correlated with burnout and precedes resignation. Declining absence trends are a leading indicator of improving retention.</li>
            <li><strong>Behavioral incident rate:</strong> Tracked per 100 student-days. Direct correlation with staff regulation quality — and therefore a culture metric as much as a student metric.</li>
            <li><strong>New hire 90-day retention:</strong> The percentage of new hires who are still in role at 90 days is the first filter on onboarding quality.</li>
            <li><strong>Wellness program engagement:</strong> Active monthly users in Vibe Hyr or equivalent platform. Lagging indicator of culture uptake; leading indicator of the population who will retain.</li>
          </ul>

          <div class="practice-box">
            <div class="practice-label">BUILD YOUR BASELINE</div>
            <p>Pull your current numbers on all five metrics. If you don't have them, their absence is itself a finding — the district isn't measuring what matters. Establish the baseline this year. Measure again in 12 months. The delta is your Culture ROI narrative.</p>
          </div>
        `,
        quiz: []
      },
      {
        id: "ed04-m06", num: "06",
        title: "The Retained Educator — Systems Integration",
        subtitle: "Connecting individual wellness to district strategy — a complete implementation roadmap",
        duration: "25m", hasReflection: true,
        content: `
          <h2>THE RETAINED EDUCATOR — SYSTEMS INTEGRATION</h2>
          <p>Everything in this program is actionable at the building level by a single motivated principal. The systems integration module shows how it connects at the district level — and what a multi-year commitment to educator retention as a strategic priority actually looks like when implemented with fidelity.</p>

          <h3>Year 1 — Foundation</h3>
          <p>Deploy the Retention Diagnostic. Audit the five structural levers. Fix the worst one. Launch The Educator Reset as baseline professional development for all staff. Establish the data baseline on all five Culture ROI metrics.</p>

          <h3>Year 2 — Differentiation</h3>
          <p>Based on Year 1 data, differentiate by building: which schools need Vibrational Leadership? Which teachers are ready for Co-Regulation Mastery? Deploy targeted programs where data shows the gap. Begin correlating platform engagement with incident and absence data.</p>

          <h3>Year 3 — Integration</h3>
          <p>Wellness language is embedded in hiring (we ask candidates about regulation). It's embedded in evaluation (we include culture contribution). It's embedded in leadership development (building principals receive Vibrational Leadership as part of their professional growth). The program is no longer a program — it's the culture.</p>

          <div class="callout">
            "A culture of wellness doesn't happen because a district wanted it. It happens because a district designed for it — systematically, patiently, and with the understanding that the return compounds over years, not quarters."
          </div>

          <div class="practice-box">
            <div class="practice-label">YOUR FIRST COMMITMENT</div>
            <p>Choose one action from Year 1 Foundation that you can complete in the next 30 days. Just one. The systems integration journey starts with the first structural act. Name it. Date it. Begin.</p>
          </div>
        `,
        quiz: [
          {
            q: "The three root causes of teacher departure (as revealed by post-resignation follow-up research) are primarily:",
            options: ["Compensation, workload, and student behavior", "Feeling unseen by leadership, chronic emotional exhaustion without recovery infrastructure, and loss of identity connection to the work", "School safety, administrative burden, and lack of resources", "Professional development quality, class size, and curriculum autonomy"],
            correct: 1,
            explanation: "Exit surveys collect face-saving responses. Post-resignation research reveals the true picture: relational and psychological causes dominate. This is why pay raises alone don't solve turnover — they don't address any of the three root causes."
          },
          {
            q: "The most predictive single question for 12-month teacher retention intent is:",
            options: ["'Are you satisfied with your compensation?'", "'Do you feel genuinely supported by your building leadership?'", "'Do you plan to be in this role in 18 months?'", "'Is your workload manageable?'"],
            correct: 1,
            explanation: "Of all the diagnostic questions, felt leadership support is the single strongest predictor of whether a teacher will still be in the building 12 months later. This reflects the root cause data: teachers leave when they feel unseen, and they stay when they feel genuinely supported."
          },
          {
            q: "The 'sequence principle' of systemic wellness design states that:",
            options: ["Programs should be deployed before structural changes", "New initiatives require 90 days before evaluation", "You should audit and fix structural levers before launching wellness programs — because programs built on broken structures produce cynicism, not uptake", "District-level change precedes building-level change"],
            correct: 2,
            explanation: "Staff who see structural change — protected planning time, communication norms, meeting hygiene — begin to believe the institution means it. That belief is the foundation that makes program uptake possible. Programs without structural change are perceived as window dressing."
          }
        ]
      }
    ]
  }
];
