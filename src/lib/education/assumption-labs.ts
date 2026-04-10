// src/lib/education/assumption-labs.ts
// Tailored AssumptionLab scenarios for each education module.
// Keyed by module ID (e.g. 'ed01-m01').

export type LabScenario = {
  title: string
  subtitle: string
  scenario: string
  prompt: string
  accentColor?: string
}

export const EDUCATION_LABS: Record<string, LabScenario> = {

  // ── PROGRAM 01: THE EDUCATOR RESET ──────────────────────────────────

  'ed01-m01': {
    title: `The Regulated Leader`,
    subtitle: `The Internal State Audit`,
    scenario: `It's 7:42 AM. Three things have already gone sideways before you reached the building. Your jaw is tight, your breath is shallow, and your inner monologue is running at full speed.`,
    prompt: `What is one specific physiological shift you can make in the next 90 seconds — before entering the building — that would change the broadcast your nervous system sends to every student and colleague you encounter today?`,
    accentColor: `#E8621A`,
  },

  'ed01-m02': {
    title: `Nervous System Literacy`,
    subtitle: `Reading the Signals in Real Time`,
    scenario: `You are mid-lesson, a student says something dismissive, and you feel a sharp, sudden heat in your chest. Your voice goes slightly flat. You push through. By the time the period ends, you're exhausted from managing the activation you never named.`,
    prompt: `If you had paused at the moment of the chest heat and named your state — "That was sympathetic activation, not disrespect" — how might the next 20 minutes of class have felt different? What would have been available to you that wasn't?`,
    accentColor: `#E8621A`,
  },

  'ed01-m03': {
    title: `The Co-Regulation Move`,
    subtitle: `From Defiance to Biological Safety`,
    scenario: `A student is shouting in the hallway. Every teacher nearby is watching. Your immediate assumption — and physiological response — is "Defiance" or "Disrespect." Your body is already preparing for confrontation.`,
    prompt: `If you shifted your assumption to "Safety Emergency — this student's brainstem is running a survival protocol," how would your first 10 seconds of interaction change — your voice, your proximity, your pace, your first word?`,
    accentColor: `#E8621A`,
  },

  'ed01-m04': {
    title: `The Gap Between Stim and Response`,
    subtitle: `Mapping Your Narrowest Moments`,
    scenario: `A parent sends an email at 9pm using a tone that immediately tightens your whole body. Before you've finished reading, you've drafted a response in your head. You send it. By morning, you wish you hadn't.`,
    prompt: `What is one specific trigger — a tone, a phrase, a behavior — that consistently narrows your gap to near zero? What is the earliest physical signal that this trigger has fired? How could noticing that signal create even three seconds of response space?`,
    accentColor: `#E8621A`,
  },

  'ed01-m05': {
    title: `Compassion Without Fatigue`,
    subtitle: `The Witness Practice`,
    scenario: `A student shares something deeply difficult before class starts. You listen, you care, and you carry it all day — through six more periods, a staff meeting, and the drive home. You arrive exhausted and can't explain exactly why.`,
    prompt: `The lighthouse does not enter the storm. What would it look like for you to remain genuinely present with that student's disclosure while simultaneously not carrying it into the rest of your day? Where in your body does the distinction between witnessing and absorbing live?`,
    accentColor: `#E8621A`,
  },

  'ed01-m06': {
    title: `Elevating the Staff Room`,
    subtitle: `The Collective Climate Check`,
    scenario: `The staff room before school. Three separate conversation threads are running: one is productive processing, one is a complaint loop spiraling into helplessness, and one is quiet exhaustion that no one is naming. You have four minutes before the bell.`,
    prompt: `What is one thing you could do or say in those four minutes that would shift the collective frequency of that room — not by fixing anything, but by interrupting the loop or naming what's actually in the room? What stops most educators from making that move?`,
    accentColor: `#E8621A`,
  },

  // ── PROGRAM 02: VIBRATIONAL LEADERSHIP ──────────────────────────────

  'ed02-m01': {
    title: `The Principal as Frequency Setter`,
    subtitle: `The Morning Walk-Through`,
    scenario: `A district-level meeting ran long. You are arriving at 8:05 — five minutes after students. You are still mentally processing the meeting's pressure as you push through the front doors. Three staff members look up the moment you walk in.`,
    prompt: `What do you assume those staff members read from your first 10 seconds in the building? What does it mean that you are "on air" — broadcasting to every nervous system in the hallway — before you've spoken a single word? What would you need to do between the parking lot and the front door?`,
    accentColor: `#C9A84C`,
  },

  'ed02-m02': {
    title: `Culture Architecture`,
    subtitle: `The First 60 Seconds Audit`,
    scenario: `You've just reviewed your staff meeting agenda. It's full, functional, and entirely corrective — student discipline data, policy reminders, compliance deadlines. The meeting opens in five minutes and the staff is already arriving with the energy of people who stayed up grading last night.`,
    prompt: `What is one thing you could change about the first 60 seconds of this meeting — not the agenda, but the opening — that would communicate to staff nervous systems that this room is a safe, human place before business begins? What has your meeting culture been communicating in those first 60 seconds that you've never made explicit?`,
    accentColor: `#C9A84C`,
  },

  'ed02-m03': {
    title: `Holding Staff in Hard Moments`,
    subtitle: `The Leader's Co-Regulation Moment`,
    scenario: `A veteran teacher — someone who has never come to you with a personal concern — appears in your doorway at 3:30 PM on a Tuesday. She says "I just need a minute." She sits down, and before she says another word, her eyes fill with tears.`,
    prompt: `What is the first thing you do — physically, not verbally — in the first 10 seconds? What do you fight the urge to do? What would it mean to let her nervous system lead the pace of this conversation rather than your discomfort with silence?`,
    accentColor: `#C9A84C`,
  },

  'ed02-m04': {
    title: `Wellness Advocacy`,
    subtitle: `The Business Case Rehearsal`,
    scenario: `You are in a budget meeting. The superintendent signals that wellness programming is on the chopping block — "We need to prioritize core academic support." You have 90 seconds and no slides.`,
    prompt: `What is the one number — calculated from your actual school's data — that reframes wellness as academic infrastructure rather than a soft benefit? What is the cost of NOT investing, expressed in dollars your district already understands? Draft the first two sentences of your 90-second case.`,
    accentColor: `#C9A84C`,
  },

  'ed02-m05': {
    title: `Data-Informed Wellness`,
    subtitle: `Making the Invisible Visible`,
    scenario: `Your board is reviewing the wellness program at the end of Year 1. Engagement is real but hard to quantify. Someone asks: "How do we know this is working?" You have behavioral incident data, attendance data, and platform engagement data sitting in three separate spreadsheets.`,
    prompt: `What is the single most powerful correlation you could draw from those three data sources that would answer that board member's question in the language they actually care about? What story does your data tell that pure engagement metrics cannot?`,
    accentColor: `#C9A84C`,
  },

  'ed02-m06': {
    title: `The Year-Long Wellness Architecture`,
    subtitle: `The November Triage`,
    scenario: `It's the second week of November. Two teachers have already submitted informal resignation inquiries. Three others are visibly depleted. The August energy is gone. The program you launched in August — enthusiastically attended — has seen a 60% drop in engagement. This is exactly the moment most wellness initiatives collapse.`,
    prompt: `What is the one leadership action you take this week — not a new program, not a pep talk, but a specific, structural, visible act of care — that communicates to staff that the institution has not forgotten them now that the year has gotten hard? What would you need to believe about your role to make that move?`,
    accentColor: `#C9A84C`,
  },

  // ── PROGRAM 03: CO-REGULATION MASTERY ───────────────────────────────

  'ed03-m01': {
    title: `What Dysregulation Actually Is`,
    subtitle: `The Reclassification Exercise`,
    scenario: `Think of your most challenging student right now — the one whose behavior frustrates you most consistently. Today they knocked over a chair, refused to work, and made a comment that landed in front of the whole class.`,
    prompt: `If you reclassified every one of today's incidents from "behavior problem" to "nervous system event" — what changes? What in their history, their morning, their body, or their environment might explain the threat response you witnessed? Does that reclassification make you angrier or more equipped? Why?`,
    accentColor: `#0F7A6B`,
  },

  'ed03-m02': {
    title: `The Regulation Toolkit`,
    subtitle: `The Invisible Intervention`,
    scenario: `You have a student in Period 3 who escalates almost every Wednesday — the day their schedule is most unpredictable. Today is Wednesday. They walked in already activated. The rest of the class is watching to see how this goes.`,
    prompt: `You have 90 seconds before instructional time begins. Using only the tools from this module, what is the one intervention you make — that no other student needs to know is an intervention? How do you deliver it without singling them out, and what physical signals do you watch for to know whether it's working?`,
    accentColor: `#0F7A6B`,
  },

  'ed03-m03': {
    title: `Reading the Room`,
    subtitle: `The Zone 2 You Almost Missed`,
    scenario: `It's Wednesday, 4th period, 50 minutes in. The lesson is going reasonably well. But something feels slightly different from 20 minutes ago. You haven't quite named it yet — just a faint sense that the room's energy has shifted.`,
    prompt: `What does your body already know that your conscious attention hasn't caught yet? Describe the specific somatic signals — in your jaw, your breath, your pace — that are already reading the room's Zone 2 activation. What do you do in the next 3 minutes, before Zone 3 arrives?`,
    accentColor: `#0F7A6B`,
  },

  'ed03-m04': {
    title: `Language That Regulates vs. Language That Activates`,
    subtitle: `The 10-Second Rewrite`,
    scenario: `A student pushes back loudly on your feedback in front of the class. Your first instinct produces the words: "Every time I try to give you feedback, you make this into a scene." You catch yourself. The words didn't leave your mouth.`,
    prompt: `What happens in your body in the two seconds between the instinct and the catch? What is the regulated version of what you actually need to communicate — same honesty, zero identity-threat, prosody that de-escalates rather than matches their volume? Write it out as if you were going to say it out loud.`,
    accentColor: `#0F7A6B`,
  },

  'ed03-m05': {
    title: `Building Regulation Into Classroom Structure`,
    subtitle: `The Environment Audit`,
    scenario: `You arrive to your classroom early. Before students arrive, you stand at the door and look at the space as if you are a student's nervous system — not a teacher's mind — entering for the first time today.`,
    prompt: `What is the first sensory input that would register? Light? Noise level? Predictability of where to sit and what to do? Temperature? What is one element of your physical environment that is currently communicating something to students' nervous systems that you did not intend — and what would it cost to change it this week?`,
    accentColor: `#0F7A6B`,
  },

  'ed03-m06': {
    title: `The 90-Day Practice Plan`,
    subtitle: `The Win You Almost Didn't Count`,
    scenario: `Day 23 of your commitment. You used the 2×10 strategy with your most challenging student. Today — for the first time in three weeks — they made a small, quiet attempt at the task. They didn't turn it in. But they tried, briefly, and looked up at you once.`,
    prompt: `That moment — the one you could easily dismiss as "not enough" — is what the 90-day log is built to capture. Write down exactly what happened, what you noticed in their body and yours, and what you would have missed if you were still only logging the failures. What does this moment tell you about the direction of this student's nervous system?`,
    accentColor: `#0F7A6B`,
  },

  // ── PROGRAM 04: THE RETAINED EDUCATOR ───────────────────────────────

  'ed04-m01': {
    title: `Why Teachers Actually Leave`,
    subtitle: `The Unsaid Exit Interview`,
    scenario: `A strong teacher — three years in, genuinely good at the work — submitted their resignation two weeks ago. Their exit survey said: "personal reasons, family relocation." You read it and moved on. But you ran into them at a coffee shop last week, and the conversation went differently.`,
    prompt: `What do you think they actually said to you over coffee — the things that didn't appear on the exit survey? What did they need from the institution in years 1 and 2 that they never received? And what would it have cost to provide it, compared to the cost of replacing them now?`,
    accentColor: `#7C3AED`,
  },

  'ed04-m02': {
    title: `The Retention Diagnostic`,
    subtitle: `The Trend That Was Always There`,
    scenario: `You pull three years of your school's anonymous pulse survey results. The number for "I feel genuinely supported by building leadership" has dropped 12 points over 18 months — from 71% to 59%. You've seen this data before. You noted it. You didn't act on it. Two resignations arrived three months later.`,
    prompt: `What would have been possible if you had treated the 6-point drop at month 9 as an emergency rather than a data point? What intervention — specific, relational, structural — could have happened in that window that cannot happen once the resignation emails arrive? What will you do differently with next quarter's data?`,
    accentColor: `#7C3AED`,
  },

  'ed04-m03': {
    title: `Systemic Wellness Design`,
    subtitle: `The Structural Contradiction`,
    scenario: `Your district launched a mindfulness-based wellness program in August. By October, engagement was 14%. In November, you received a message from a teacher: "I would love to try the breathing exercises, but my planning period got co-opted for a data meeting again, and I haven't had 10 free minutes in two weeks."`,
    prompt: `This teacher's message is a systems diagnosis, not a complaint. What is the structural contradiction her experience reveals? What would it signal to staff if you fixed one structural lever — just one — before adding another wellness program? What would fixing it cost, in real time and real money?`,
    accentColor: `#7C3AED`,
  },

  'ed04-m04': {
    title: `Onboarding Into a Culture of Wellness`,
    subtitle: `The New Hire's First Impression`,
    scenario: `It's Day 6 for a first-year teacher. She has attended four days of orientation (information-dense), met briefly with her mentor once, and has yet to have a genuine conversation with anyone about how she's actually doing. She smiles in the hallways. Inside, her nervous system is running a question on repeat: "Do I belong here?"`,
    prompt: `What two specific, low-cost actions — things that could be done by any colleague or administrator this week — would begin answering that question with "yes"? And what does it mean that the institution's current onboarding design has left this question unanswered for six days?`,
    accentColor: `#7C3AED`,
  },

  'ed04-m05': {
    title: `The Culture ROI Report`,
    subtitle: `The Delta Is the Story`,
    scenario: `You are preparing the end-of-year Culture ROI presentation for the board. Twelve months ago you established a baseline on all five metrics. Now you have the Year 1 numbers. Retention improved 4%. Absence rate dropped 8%. Behavioral incidents per 100 student-days dropped 11%. New hire 90-day retention went from 78% to 91%.`,
    prompt: `The board will ask: "Is this the wellness program, or just normal variation?" Draft the one-paragraph response that answers that question — specifically, using the pattern of all five metrics moving together — without overstating causation. Then: what does this data say about what you invest in differently in Year 2?`,
    accentColor: `#7C3AED`,
  },

  'ed04-m06': {
    title: `Systems Integration`,
    subtitle: `The Culture That No Longer Needs a Program`,
    scenario: `It is Year 3 of your district's wellness implementation. Last week, a principal in Building 7 — without being asked — referenced nervous system regulation language in a staff performance conversation. A department head in Building 2 spontaneously started team meetings with a 90-second body scan. Three new hires mentioned that they chose this district partly because of how they were treated during the interview process.`,
    prompt: `These are not program outcomes — they are culture outcomes. What is the difference? And what does it mean that the most powerful evidence of systems integration is not a metric on a dashboard but a behavior that no one had to mandate? What did it take to get here, and what would it take to lose it?`,
    accentColor: `#7C3AED`,
  },

}
