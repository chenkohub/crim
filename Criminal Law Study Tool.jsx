import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// CRIMINAL LAW INTERACTIVE STUDY TOOL
// JD2960 - Professor Arnaud - Spring 2026 - BU Law
// Based on evidence-based learning: active recall, spaced
// repetition, rule-writing drills, and issue-spotting practice
// ============================================================

// ---- DATA: FLASHCARDS ----
const flashcards = [
  // UNIT I: INTRODUCTION
  {id:1, unit:"I", topic:"Theories of Punishment", front:"What are the two major categories of punishment theory?", back:"Non-consequentialist (Retribution / just deserts) and Consequentialist (Utilitarianism: deterrence [specific & general], rehabilitation, incapacitation)."},
  {id:2, unit:"I", topic:"Theories of Punishment", front:"What is retribution?", back:"Punishment is justified because the offender deserves it ('just deserts'). Backward-looking — focuses on the wrong committed, not future outcomes."},
  {id:3, unit:"I", topic:"Theories of Punishment", front:"What are the three forms of consequentialist punishment?", back:"1) Deterrence (specific: deter this offender; general: deter society)\n2) Rehabilitation (reform the offender)\n3) Incapacitation (prevent future crime by confining offender)"},
  {id:4, unit:"I", topic:"Hart / Criminal Law", front:"What differentiates criminal law from civil law according to Hart?", back:"Community condemnation of the offender. Criminal law offers direction on conduct, expresses community norms (social contract), and subjects violators to sanctions carrying moral stigma."},
  {id:5, unit:"I", topic:"Void for Vagueness", front:"What is the void for vagueness doctrine?", back:"Under the Fourteenth Amendment, a criminal statute is unconstitutionally vague if it fails to give ordinary people fair notice of what conduct is prohibited and/or encourages arbitrary enforcement. (United States v. Bronstein)"},
  {id:6, unit:"I", topic:"Rule of Lenity", front:"What is the rule of lenity?", back:"When a criminal statute is ambiguous, it must be construed in favor of the defendant (against the government)."},
  {id:7, unit:"I", topic:"Jury Nullification", front:"What is jury nullification?", back:"The power of a jury to acquit a defendant despite evidence proving guilt beyond a reasonable doubt, effectively 'nullifying' the law. Juries are generally not informed of this power."},

  // UNIT II: ACTUS REUS
  {id:8, unit:"II", topic:"Actus Reus", front:"What are the three components of actus reus?", back:"1) A voluntary act (or qualifying omission)\n2) That causes\n3) Social harm"},
  {id:9, unit:"II", topic:"Voluntary Act", front:"What constitutes an involuntary act under MPC § 2.01?", back:"Reflexes, convulsions, bodily movements during unconsciousness or sleep, conduct during hypnosis, and any bodily movement that is NOT a product of the effort or determination of the actor, either conscious or habitual."},
  {id:10, unit:"II", topic:"Voluntary Act", front:"Martin v. State — What is the rule?", back:"No voluntary act where police carried an intoxicated man onto a public highway and then arrested him for public drunkenness. The 'appearance in public' was not voluntary."},
  {id:11, unit:"II", topic:"Voluntary Act", front:"State v. Decina — How can an involuntary act still lead to liability?", back:"The voluntary act occurred EARLIER — when the epileptic defendant chose to drive knowing he was subject to seizures. Culpability attaches to the voluntary decision to put oneself in a dangerous position."},
  {id:12, unit:"II", topic:"Status Crimes", front:"Robinson v. California — What is the rule on status crimes?", back:"It is unconstitutional to punish a person for their status or condition (e.g., being addicted to narcotics). Criminal punishment must be for ACTS, not conditions. (8th/14th Amendments)"},
  {id:13, unit:"II", topic:"Status Crimes", front:"Powell v. Texas — How does it limit Robinson?", back:"Being drunk in public is an ACT (appearing in public after drinking), not a status. The statute punished conduct, not the condition of alcoholism. Robinson limited to pure status offenses."},

  // UNIT II: OMISSIONS
  {id:14, unit:"II", topic:"Omissions", front:"What are the FIVE categories of legal duty that make an omission satisfy actus reus?", back:"1) Special relationship (parent-child, spouse)\n2) Contractual duty\n3) Statutory duty\n4) Creation of the risk\n5) Voluntary assumption of care\n\nMnemonic: 'S-C-S-C-V' — Special, Contract, Statute, Created risk, Voluntary assumption"},
  {id:15, unit:"II", topic:"Omissions", front:"People v. Beardsley — What limits the 'special relationship' duty?", back:"A romantic/social relationship (mistress/lover) is NOT sufficient to create a legal duty. Must have a legal relation of 'protector' — like parent-child or husband-wife."},
  {id:16, unit:"II", topic:"Omissions", front:"Commonwealth v. Pestinikas — What type of duty was at issue?", back:"Contractual duty. Defendants agreed to provide food and medical care to the victim. A contractual duty to act creates criminal liability for omission even if services are outsourced."},

  // UNIT II: MENS REA
  {id:17, unit:"II", topic:"MPC § 2.02", front:"List the MPC mens rea hierarchy from most to least culpable.", back:"1) PURPOSELY — conscious object to cause the result\n2) KNOWINGLY — aware conduct is practically certain to cause result\n3) RECKLESSLY — consciously disregards substantial and unjustifiable risk\n4) NEGLIGENTLY — should be aware of substantial and unjustifiable risk (objective standard)\n\nMnemonic: 'People Kill Rats Nightly'"},
  {id:18, unit:"II", topic:"MPC § 2.02", front:"What is the DEFAULT mens rea under the MPC when a statute is silent?", back:"RECKLESSNESS. Under MPC § 2.02, when no culpability level is prescribed, recklessness is sufficient."},
  {id:19, unit:"II", topic:"MPC § 2.02", front:"MPC § 2.02(3)–(4): How does a stated mental state apply to elements?", back:"A mental state stated in a statute modifies ALL material elements of the actus reus, unless a contrary purpose plainly appears. Exception: Jurisdictional elements need not have mens rea applied (United States v. Yermian)."},
  {id:20, unit:"II", topic:"Knowledge", front:"What is willful blindness? (United States v. Jewell)", back:"Knowledge is satisfied even without positive awareness if the defendant's ignorance was SOLELY the result of a CONSCIOUS EFFORT to disregard the nature of a fact, with a CONSCIOUS PURPOSE to avoid learning the truth. It is a proxy for positive knowledge."},
  {id:21, unit:"II", topic:"Intent", front:"What is transferred intent? (People v. Scott)", back:"When D intends to harm A but harms B instead, the intent 'transfers' to B. D can be prosecuted for the killing of B using the intent directed at A. D may ALSO be charged with attempted murder of A."},
  {id:22, unit:"II", topic:"Intent", front:"State v. Fugate — How can intent to kill be inferred?", back:"Intent to kill may be PRESUMED where the natural and probable consequence of a wrongful act is to produce death. Intent may be deduced from all the surrounding circumstances."},

  // UNIT II: GENERAL vs. SPECIFIC INTENT
  {id:23, unit:"II", topic:"Gen/Spec Intent", front:"What distinguishes general intent from specific intent crimes? (People v. Atkins)", back:"GENERAL INTENT: Only mental state required is intent to do the actus reus.\nSPECIFIC INTENT: Requires intent to do something BEYOND the actus reus (look for additional intent language like 'with intent to...').\n\nKey test: Does the statute require intent language beyond the act itself?"},
  {id:24, unit:"II", topic:"Gen/Spec Intent", front:"How does the general/specific intent distinction affect mistake of fact defenses?", back:"SPECIFIC INTENT crime: Honest mistake of fact is a defense (even if unreasonable), IF it negates the specific intent.\nGENERAL INTENT crime: Only an honest AND reasonable mistake is a defense.\nSTRICT LIABILITY: Mistake of fact is NEVER a defense."},

  // UNIT II: STRICT LIABILITY
  {id:25, unit:"II", topic:"Strict Liability", front:"What are the characteristics of strict liability crimes?", back:"No mens rea for at least one element; geared toward health/safety/welfare; punish omissions; risk of significant injury; defendant in position to prevent harm; light penalties; often newly created/regulatory crimes.\n\nMorissette v. United States: Criminal law PRESUMES mens rea. Government bears burden of showing strict liability was intended."},
  {id:26, unit:"II", topic:"Strict Liability", front:"Malum prohibitum vs. malum in se — How does this relate to strict liability?", back:"Strict liability is more readily inferred for MALUM PROHIBITUM offenses (wrong only because prohibited by statute — regulatory). It is DISFAVORED for MALUM IN SE offenses (inherently wrong), especially those carrying heavy punishment and moral stigma."},

  // UNIT III: MISTAKES
  {id:27, unit:"III", topic:"Mistake of Fact", front:"State the complete mistake of fact framework across all crime types.", back:"SPECIFIC INTENT: Honest mistake negates intent (even if unreasonable)\nGENERAL INTENT: Honest AND reasonable mistake required\nSTRICT LIABILITY: No defense at all\n\nMPC § 2.04: Mistake is a defense if it negates the purpose, knowledge, belief, recklessness, or negligence required for a material element."},
  {id:28, unit:"III", topic:"Mistake of Law", front:"What is the general rule on mistake of law, and what are the exceptions?", back:"GENERAL RULE: Ignorance of law is no excuse.\n\nEXCEPTIONS:\n1) Official interpretation reliance (People v. Marrero)\n2) Mistake negates specific mens rea — 'willfulness' crimes (Cheek v. United States): honest belief that law doesn't impose a duty negates willfulness. BUT disagreement with the law does NOT.\n3) Lambert exception (due process — passive/omission offenses)"},

  // UNIT III: CAUSATION
  {id:29, unit:"III", topic:"Causation", front:"What two types of causation must the prosecution prove?", back:"1) ACTUAL CAUSE ('but-for' test): But for D's conduct, would the harm have occurred?\n2) PROXIMATE CAUSE (legal cause): Is it fair and just to hold D liable? Central inquiry: intervening cause analysis."},
  {id:30, unit:"III", topic:"Causation", front:"Explain the intervening cause framework for proximate causation.", back:"RESPONSIVE (dependent) IC: Reaction to D's act. D remains proximate cause UNLESS the IC was extremely unusual/bizarre.\n• Example: Victim shot → develops pneumonia → dies (responsive, not bizarre = D is proximate cause)\n\nCOINCIDENTAL (independent) IC: Would have happened regardless of D's act. D is NOT proximate cause UNLESS the IC was foreseeable.\n• Example: D leaves victim on road → hit by truck (independent, but foreseeable = D is proximate cause)"},
  {id:31, unit:"III", topic:"Causation", front:"MPC § 2.03 — How does the MPC handle causation for recklessness crimes?", back:"Causation not established if actual result is NOT within the risk D was aware of, UNLESS:\n(a) Result differs only in that a different person/property was injured or harm was more serious; OR\n(b) Result involves same kind of injury and is not too remote or accidental to have just bearing on D's liability."},

  // UNIT III: CONCURRENCE
  {id:32, unit:"III", topic:"Concurrence", front:"What two forms of concurrence are required?", back:"1) TEMPORAL CONCURRENCE: Mens rea must exist at the TIME the actus reus is committed.\n2) MOTIVATIONAL CONCURRENCE: The culpable mental state must MOTIVATE the act.\n\nCourts may 'roll together' a series of acts into one continuous transaction to satisfy concurrence."},

  // UNIT IV: CRIMINAL HOMICIDE — MURDER
  {id:33, unit:"IV", topic:"Murder", front:"What are the four forms of malice aforethought at common law?", back:"1) Intent to kill (express malice)\n2) Intent to inflict grievous bodily injury\n3) Depraved heart murder (extreme recklessness)\n4) Felony murder rule\n\nMnemonic: 'I-I-D-F' — Intent to kill, Intent GBI, Depraved heart, Felony murder"},
  {id:34, unit:"IV", topic:"First Degree Murder", front:"What is required for first-degree murder under the Pennsylvania model?", back:"Murder committed in a statutorily prescribed manner, OR a willful, deliberate, and premeditated killing, OR felony murder.\n\nDELIBERATION: Measuring and evaluating the major facets of a choice — weighing reasons for and against, considering consequences (State v. Brown)\nPREMEDITATION: Thinking about something beforehand\n\nCRITICAL: Merely having TIME to deliberate ≠ actually deliberating (State v. Bingham)"},
  {id:35, unit:"IV", topic:"First Degree Murder", front:"Gilbert v. State — What factors support a finding of premeditation and deliberation?", back:"1) Having a gun with bullets nearby\n2) Thinking about different ways to kill (poison vs. shooting)\n3) Thinking about alternatives (asking a doctor, nursing home)\n4) Positioning oneself to avoid being seen\n5) Going back for another bullet to shoot again"},
  {id:36, unit:"IV", topic:"Depraved Heart", front:"Define depraved heart murder and the Knoller standard.", back:"DEFINITION: Actor's conduct manifests EXTREME recklessness — risk-taking that evinces extreme indifference to the value of human life.\n\nPeople v. Knoller (Phillips Test): Malice implied when killing proximately caused by an act whose natural consequences are dangerous to life, deliberately performed by a person who KNOWS conduct endangers life and acts with CONSCIOUS DISREGARD FOR LIFE.\n\nKEY: Must be conscious disregard of risk of DEATH (awareness of risk of serious bodily injury alone is INSUFFICIENT)."},
  {id:37, unit:"IV", topic:"Murder (MPC)", front:"MPC § 210.2 — How does the MPC define murder?", back:"Criminal homicide constitutes murder when the actor unjustifiably, inexcusably, and without mitigating circumstances kills another:\n(a) PURPOSELY or KNOWINGLY; OR\n(b) RECKLESSLY under circumstances manifesting EXTREME INDIFFERENCE to the value of human life.\n\nNOTE: MPC does NOT use degrees of murder."},

  // UNIT IV: VOLUNTARY MANSLAUGHTER
  {id:38, unit:"IV", topic:"Vol. Manslaughter", front:"State the FOUR elements of voluntary manslaughter under the common law CATEGORICAL approach.", back:"1) Act in the heat of passion\n2) Passion resulted from LEGALLY ADEQUATE provocation\n3) No reasonable opportunity to cool off\n4) Causal link between provocation, passion, and killing\n\nLegally adequate provocation (judge decides): battery/assault, mutual combat, serious crime against close relative, illegal arrest, spousal adultery.\nMERE WORDS are NOT sufficient."},
  {id:39, unit:"IV", topic:"Vol. Manslaughter", front:"State the FOUR elements of voluntary manslaughter under the MODERN reasonable person approach.", back:"1) Act in the heat of passion\n2) Actor was REASONABLY provoked\n3) Did NOT have time to cool off\n4) A REASONABLE PERSON in D's position would not have cooled off\n\nKey differences from categorical: Question goes to JURY; recognizes cumulative passion (People v. Berry — 20 hours still 'heat of passion'); mere words rule may have exceptions."},
  {id:40, unit:"IV", topic:"Vol. Manslaughter", front:"MPC § 210.3 — State the EMED standard and the Dumlao two-step test.", back:"Manslaughter if D kills under circumstances that would ordinarily be murder, but committed as result of EXTREME MENTAL OR EMOTIONAL DISTURBANCE (EMED) for which there is a reasonable explanation or excuse.\n\nDUMLAO TWO-STEP:\n1) View D's SUBJECTIVE internal situation and external circumstances as D perceived them (however inaccurate)\n2) Assess whether the EXPLANATION for the disturbance was reasonable (NOT the reasonableness of the action)\n\nNo single provocative act needed. Words alone can qualify. Question left to jury."},

  // UNIT IV: INVOLUNTARY MANSLAUGHTER
  {id:41, unit:"IV", topic:"Invol. Manslaughter", front:"What mental states can support involuntary manslaughter?", back:"COMMON LAW: 'Criminal negligence' — either:\n1) Recklessness (aware of substantial/unjustifiable risk + consciously disregards)\n2) Gross negligence (gross deviation from reasonable standard of care)\n3) Ordinary negligence (rarely — State v. Williams)\n\nMPC § 210.3(1)(a): RECKLESSNESS only. Negligence is NEVER sufficient for MPC manslaughter."},

  // UNIT IV: FELONY MURDER
  {id:42, unit:"IV", topic:"Felony Murder", front:"State the basic felony murder rule and its four limitations.", back:"RULE: Guilty of murder if a death results from conduct during commission or attempted commission of a felony.\n\nFOUR LIMITATIONS:\n1) INHERENTLY DANGEROUS FELONY (People v. James) — abstract vs. fact-specific approach\n2) RES GESTAE (People v. Bodely) — temporal/spatial proximity + causal link; temporary safety rule\n3) MERGER DOCTRINE (Rose v. State) — underlying felony must be independent; assaultive felonies merge. Exception: independent felonious purpose (e.g., robbery)\n4) AGENCY RULE (State v. Canola) — FM doesn't apply to third-party killings. Exception: shield case\n\nMnemonic: 'I-R-M-A' — Inherently dangerous, Res gestae, Merger, Agency"},
  {id:43, unit:"IV", topic:"Felony Murder", front:"How does the MPC handle felony murder?", back:"MPC ELIMINATES felony murder as a standalone doctrine.\n\nInstead, MPC § 210.2(1)(b) creates a PRESUMPTION: Recklessness and extreme indifference are PRESUMED if the actor is engaged in (or is an accomplice in) the commission of, attempt to commit, or flight after committing certain enumerated felonies."},

  // UNIT V: THEFT
  {id:44, unit:"V", topic:"Larceny", front:"State the elements of larceny.", back:"1) TRESPASSORY TAKING (wrongful/fraudulent — without right or justification)\n2) CARRYING AWAY (asportation — assertion of control)\n3) PERSONAL PROPERTY OF ANOTHER\n4) WITHOUT OWNER'S CONSENT\n5) WITH INTENT TO PERMANENTLY DEPRIVE (specific intent)\n\nConcurrence: Taking and intent to permanently deprive must occur at the SAME TIME."},
  {id:45, unit:"V", topic:"Theft Distinctions", front:"Distinguish larceny, larceny by trick, false pretenses, and embezzlement.", back:"LARCENY: Trespassory taking + carrying away + intent to permanently deprive\n\nLARCENY BY TRICK (State v. Barbour): D obtains POSSESSION (not title) through fraud/deception\n\nFALSE PRETENSES (State v. Pierce): D obtains TITLE AND POSSESSION through fraud\n\nEMBEZZLEMENT: Intentional CONVERSION by someone already in LAWFUL POSSESSION (entrusted/fiduciary)\n\nKey question: Did D get possession, title, or was D already entrusted?"},
  {id:46, unit:"V", topic:"Theft Concepts", front:"Explain possession vs. custody vs. constructive possession.", back:"POSSESSION: Sufficient control + reasonably unrestricted use\nCUSTODY: Physical control but substantially restricted use (e.g., mechanic, valet, employee)\nCONSTRUCTIVE POSSESSION: Owner retains legal possession even when not in physical control (e.g., agent delivery, lost property found by another, transaction in owner's presence)\n\n'BREAKING THE BULK': Bailee who opens a package and takes goods converts custody into larceny."},

  // UNIT VI: DEFENSES
  {id:47, unit:"VI", topic:"Self-Defense", front:"What are the key requirements for a self-defense claim?", back:"1) D must have a REASONABLE BELIEF of imminent unlawful force\n2) Force used must be PROPORTIONAL to the threat\n3) Some jurisdictions require DUTY TO RETREAT before using deadly force (exception: castle doctrine)\n\nIMPERFECT SELF-DEFENSE: D had an honest but UNREASONABLE belief — mitigates murder to voluntary manslaughter.\nDEFENSE OF OTHERS: Same principles apply."},
  {id:48, unit:"VI", topic:"Necessity", front:"What is the necessity defense? (Dudley and Stephens)", back:"NECESSITY: D chose the 'lesser evil' when faced with a choice between two harms.\n\nElements: (1) Imminent threat of harm; (2) No lawful alternative; (3) Harm avoided > harm caused; (4) D did not create the situation.\n\nKEY LIMITATION (Dudley & Stephens): Necessity CANNOT justify killing an innocent person to save your own life. No absolute necessity to preserve one's own life at expense of another's."},
  {id:49, unit:"VI", topic:"Duress", front:"What is the duress defense and how does it differ from necessity?", back:"DURESS: D committed a crime because of a HUMAN THREAT of imminent death or serious bodily harm.\n\nElements: (1) Threat of imminent death/SBI; (2) Well-grounded fear; (3) No reasonable opportunity to escape.\n\nKEY DISTINCTION: Necessity = natural/circumstantial pressure (lesser evil choice). Duress = human coercion (someone forced you).\n\nLIMITATION: Traditionally, duress is NOT a defense to murder."},
  {id:50, unit:"VI", topic:"Justification vs. Excuse", front:"What is the difference between a justification defense and an excuse defense?", back:"JUSTIFICATION: D's conduct was RIGHT or at least permissible under the circumstances. Society approves of the act. (e.g., self-defense, necessity, defense of others)\n\nEXCUSE: D's conduct was WRONG, but D is not morally blameworthy due to circumstances. Society does not approve but does not blame. (e.g., duress, insanity, involuntary intoxication)"},

  // UNIT VII: INCHOATE OFFENSES
  {id:51, unit:"VII", topic:"Attempt", front:"What are the elements of criminal attempt and the key tests?", back:"ELEMENTS: (1) Specific intent to commit the target crime; (2) An act beyond mere preparation.\n\nTESTS for 'act beyond preparation':\n• LAST ACT TEST: D must have done everything needed (rarely used)\n• DANGEROUS PROXIMITY TEST: How close D came to completing the crime (common law)\n• SUBSTANTIAL STEP TEST (MPC): Conduct that is strongly corroborative of criminal purpose — broader, easier for prosecution"},
  {id:52, unit:"VII", topic:"Conspiracy", front:"What are the elements of conspiracy?", back:"1) AGREEMENT between two or more persons to commit a crime\n2) INTENT to agree + intent to commit the underlying crime\n3) OVERT ACT in furtherance (MPC/most jurisdictions — common law sometimes doesn't require)\n\nPINKERTON LIABILITY: Each conspirator liable for foreseeable crimes committed by co-conspirators in furtherance of the conspiracy.\nBILATERAL (common law): Two+ guilty minds required.\nUNILATERAL (MPC): Only D's agreement matters (even if other party is undercover cop)."},
  {id:53, unit:"VII", topic:"Accomplice Liability", front:"What is accomplice liability?", back:"AIDING AND ABETTING: D assisted or encouraged the principal in committing the crime.\n\nELEMENTS: (1) Act of assistance/encouragement; (2) Intent to assist; (3) Intent that the underlying crime be committed.\n\nACCESSORY BEFORE THE FACT: Assisted in planning but not present.\nACCESSORY AFTER THE FACT: Helped after the crime (separate, lesser offense).\nPRINCIPAL: Actually committed the crime."},
];

// ---- DATA: MNEMONICS ----
const mnemonics = [
  {topic: "MPC Mens Rea Hierarchy", mnemonic: "People Kill Rats Nightly", meaning: "Purpose → Knowledge → Recklessness → Negligence"},
  {topic: "Four Forms of Malice Aforethought", mnemonic: "I-I-D-F", meaning: "Intent to kill, Intent GBI, Depraved heart, Felony murder"},
  {topic: "Five Duties to Act (Omissions)", mnemonic: "S-C-S-C-V", meaning: "Special relationship, Contract, Statute, Created risk, Voluntary assumption"},
  {topic: "Felony Murder Limitations", mnemonic: "I-R-M-A", meaning: "Inherently dangerous, Res gestae, Merger, Agency"},
  {topic: "Voluntary Manslaughter (Categorical)", mnemonic: "H-A-C-C", meaning: "Heat of passion, Adequate provocation, Cooling time (none), Causal link"},
  {topic: "Larceny Elements", mnemonic: "TACP-I", meaning: "Trespassory taking, Asportation, Consent (none), Property of another, Intent to permanently deprive"},
  {topic: "Causation Two-Part Test", mnemonic: "But-Prox", meaning: "But-for (actual) cause + Proximate (legal) cause"},
  {topic: "Intervening Cause Analysis", mnemonic: "R-not-B, C-if-F", meaning: "Responsive → D liable unless Bizarre; Coincidental → D NOT liable unless Foreseeable"},
];

// ---- DATA: PRACTICE HYPOTHETICALS ----
const hypos = [
  {
    id: 1,
    title: "The Bar Fight",
    facts: "Dave and Victor get into a heated argument at a bar after Victor insults Dave's wife. Victor shoves Dave. Dave, enraged, pulls out a knife he always carries and stabs Victor once in the chest. Victor dies on the way to the hospital. Medical evidence shows Victor would have survived if the ambulance hadn't been delayed 40 minutes due to a traffic accident on the highway.",
    questions: [
      {
        q: "Q1: Analyze whether Dave is guilty of first-degree murder.",
        model: "ISSUE: Whether Dave's killing of Victor was willful, deliberate, and premeditated.\n\nRULE: First-degree murder requires a willful, deliberate, and premeditated killing. Deliberation means measuring and evaluating the major facets of a choice — weighing reasons for and against killing (State v. Brown). Premeditation means thinking about it beforehand. Merely having TIME to deliberate ≠ actually deliberating (State v. Bingham).\n\nPROSECUTION: Dave carried a knife daily, suggesting preparedness for violence. He made a choice to draw the weapon and target a vital area (chest), showing he weighed the consequences. The act of pulling out a concealed weapon and directing it at the chest suggests deliberation.\n\nDEFENSE: Dave acted in the immediate heat of the moment after being shoved. There was no 'cool head capable of reflection' — he reacted instinctively to a physical assault. Carrying a knife daily is habit, not premeditation for this specific act. Under Bingham, the brief seconds between the shove and the stabbing are insufficient to establish actual deliberation.\n\nCONCLUSION: First-degree murder is unlikely. The facts suggest a reactive killing, not a calculated one."
      },
      {
        q: "Q2: Analyze Dave's strongest argument for voluntary manslaughter under all three frameworks.",
        model: "CATEGORICAL APPROACH:\n(1) Heat of passion: Yes — Dave was 'enraged' after verbal insults and a physical shove.\n(2) Adequate provocation: The SHOVE (battery) is legally adequate provocation at common law. The verbal insults alone would NOT qualify under the mere words rule, but battery IS a recognized category.\n(3) Cooling time: Minimal — the stabbing occurred immediately after the shove.\n(4) Causal link: The provocation (shove) triggered the passion that caused the killing.\nRESULT: All four elements likely satisfied.\n\nMODERN APPROACH:\nWould a reasonable person in Dave's position have been provoked into heat of passion? Likely yes — a physical shove after insults to one's spouse. Would a reasonable person have cooled off? No — it was immediate. Stronger for Dave because the jury decides reasonableness.\n\nMPC EMED (§ 210.3):\nDave was under extreme emotional disturbance (rage from insults + battery). Is there a reasonable explanation? Under Dumlao step 1: View Dave's subjective situation — his wife was insulted, he was shoved. Step 2: A reasonable explanation for the disturbance exists (being physically attacked after spousal insults). EMED likely satisfied.\n\nDave's STRONGEST argument is under the MPC/EMED framework because it is the most expansive and focuses on the reasonableness of the disturbance, not the action."
      },
      {
        q: "Q3: Analyze the causation issue created by the ambulance delay.",
        model: "ISSUE: Whether Dave is the proximate cause of Victor's death given the 40-minute ambulance delay.\n\nRULE: Prosecution must prove both actual (but-for) and proximate cause. For proximate cause, we analyze intervening causes as either responsive/dependent (D liable unless bizarre) or coincidental/independent (D not liable unless foreseeable).\n\nACTUAL CAUSE: But for Dave's stabbing, Victor would not have needed an ambulance and would not have died. Satisfied.\n\nPROXIMATE CAUSE:\nPROSECUTION: The ambulance delay is a COINCIDENTAL/INDEPENDENT intervening cause (the traffic accident would have happened regardless of Dave's act), BUT it is FORESEEABLE that emergency medical response may be delayed for various reasons. When you stab someone, you accept the risk that medical help may not arrive promptly. Under Henderson v. Kibbe, foreseeable independent ICs do not break the chain.\n\nDEFENSE: The traffic accident was a pure coincidence — an independent event wholly unrelated to the stabbing. Victor WOULD HAVE SURVIVED with timely care. The 40-minute delay is the actual cause of death, not the stabbing itself. This is an unforeseeable, coincidental IC that breaks proximate causation.\n\nCONCLUSION: Prosecution likely prevails. Courts generally hold that medical complications and delays in treatment are foreseeable consequences of inflicting serious injury. Dave set the chain of events in motion by stabbing Victor in the chest."
      }
    ]
  },
  {
    id: 2,
    title: "The Pawn Shop Scheme",
    facts: "Mia borrows her neighbor Tom's expensive watch, telling him she needs it for a formal event. Instead, she takes it to a pawn shop and sells it, pocketing the cash. Separately, Mia's coworker Jake knows that Mia has been pawning stolen items. When Mia asks Jake to drive her to the pawn shop 'to sell some stuff,' Jake agrees, suspecting but not confirming the items are stolen. Meanwhile, Mia's friend Carol, who works as a bank teller, has been skimming small amounts from dormant accounts over six months, totaling $12,000.",
    questions: [
      {
        q: "Q1: What theft offense has Mia committed regarding Tom's watch? Analyze all possibilities.",
        model: "ISSUE: Whether Mia committed larceny, larceny by trick, false pretenses, or embezzlement.\n\nLARCENY BY TRICK (most likely):\nRULE: D knowingly makes a false statement with intent to deceive, causing owner to pass POSSESSION (but not title) to D. (State v. Barbour)\nANALYSIS: Mia lied about needing the watch for a formal event. Tom consented to transfer POSSESSION (a loan), not title/ownership. Mia obtained possession through fraud/artifice. She then converted the watch by selling it. All elements satisfied — this is larceny by trick.\n\nNOT STANDARD LARCENY: Because Tom voluntarily handed over the watch. No trespassory taking — the initial transfer was consensual (though fraudulently obtained).\n\nNOT FALSE PRETENSES: Tom did not transfer TITLE. He lent the watch expecting its return. Mia obtained possession only.\n\nNOT EMBEZZLEMENT: Mia was not in a position of trust/fiduciary relationship. She was a neighbor borrowing an item, not an entrusted agent.\n\nCONCLUSION: Mia is guilty of larceny by trick."
      },
      {
        q: "Q2: Analyze Jake's criminal liability. Consider his mental state under both common law and MPC.",
        model: "ISSUE: Whether Jake's mental state satisfies the mens rea for accomplice liability and/or the underlying offense.\n\nACCOMPLICE LIABILITY:\nRULE: Requires (1) act of assistance, (2) intent to assist, (3) intent that the crime be committed.\nJake drove Mia to the pawn shop (act of assistance). He SUSPECTED but did not confirm the items were stolen.\n\nWILLFUL BLINDNESS (United States v. Jewell):\nPROSECUTION: Jake had reason to KNOW Mia dealt in stolen goods ('knows that Mia has been pawning stolen items'). His failure to confirm was a conscious effort to avoid learning the truth — willful blindness satisfies 'knowingly' under Jewell. He had a conscious purpose to avoid learning whether these specific items were stolen.\n\nDEFENSE: Jake merely 'suspected' — suspicion is closer to recklessness than knowledge. He didn't make a deliberate effort to avoid learning; he simply didn't ask. Jewell requires a CONSCIOUS PURPOSE to avoid the truth, not mere failure to inquire.\n\nMPC ANALYSIS: Under MPC § 2.02, 'knowingly' means awareness of a high probability. Jake knew Mia's pattern of behavior. A jury could find he was aware it was practically certain the items were stolen.\n\nCOMMON LAW: Under general/specific intent, if accomplice liability is a specific intent crime, prosecution must show Jake specifically intended to help Mia commit theft. His awareness of her pattern + willingness to drive strongly suggests this intent.\n\nCONCLUSION: Jake likely liable as an accomplice under willful blindness doctrine."
      },
      {
        q: "Q3: Classify Carol's crime. What is her mens rea and how would you analyze under MPC § 2.02?",
        model: "ISSUE: What theft offense has Carol committed?\n\nEMBEZZLEMENT:\nRULE: Intentional conversion of another's property by someone who is entrusted/in lawful possession.\nANALYSIS: Carol is a bank teller — a fiduciary in a position of trust, obligated to act in the bank's interest. She has LAWFUL POSSESSION of the funds through her employment. Her 'skimming' constitutes CONVERSION — using the property in a way adverse to the owner. She acted with PURPOSE (conscious object to take the money) over six months, showing deliberate, repeated intent.\n\nMPC § 2.02 ANALYSIS:\n- PURPOSELY: Carol's conscious object was to take money from the accounts. Clearly satisfied.\n- KNOWINGLY: Carol was aware her conduct was practically certain to deprive the bank of funds. Satisfied.\n- The systematic nature (six months, small amounts) shows both purpose and knowledge — this was calculated, not impulsive.\n\nNOT LARCENY: Carol already had lawful possession through her employment. No trespassory taking.\nNOT FALSE PRETENSES: Carol didn't obtain title through misrepresentation to the bank.\n\nCONCLUSION: Carol is guilty of embezzlement with purposeful mens rea."
      }
    ]
  },
  {
    id: 3,
    title: "The House Party",
    facts: "Alex hosts a house party where guests are doing drugs. Alex's friend Ben, who is heavily intoxicated, gets into a fight with another guest, Chris. Alex sees Ben beating Chris severely but does nothing to intervene. Chris later dies from his injuries. During the same party, Alex's roommate Dana decides to rob a guest named Eddie at knifepoint in an upstairs bedroom. As Dana flees the house with Eddie's wallet, Eddie chases Dana into the street where Eddie is struck and killed by a passing car. A toxicology report shows Chris had a rare, undiagnosed heart condition that made the injuries fatal — an otherwise healthy person would have survived.",
    questions: [
      {
        q: "Q1: Analyze Alex's liability for Chris's death. Consider omission liability and all relevant issues.",
        model: "ISSUE: Whether Alex is criminally liable for Chris's death based on a failure to act.\n\nACTUS REUS — OMISSION:\nRULE: An omission satisfies actus reus only when a LEGAL DUTY to act exists. Five categories: special relationship, contract, statute, creation of risk, voluntary assumption of care.\n\nPROSECUTION: Alex may have a duty based on CREATION OF RISK — Alex hosted the party where drugs and alcohol were present, creating the dangerous conditions. Alternatively, as the HOST/homeowner, Alex had control over the premises and a possible duty to prevent harm to guests (analogous to a business owner's duty to patrons).\n\nDEFENSE: Under Beardsley, a mere social relationship does NOT create a legal duty. Alex and Chris are party host and guest — no special legal relationship of 'protector.' Hosting a party does not create the specific risk of a fight between two other adults. Alex did not start the fight.\n\nMENS REA: Even if duty exists, what was Alex's mental state? Alex SAW the beating — knew of the risk. Under recklessness standard, Alex was aware of a substantial risk to Chris and consciously disregarded it by doing nothing.\n\nCAUSATION — HEART CONDITION:\nThe rare heart condition is a RESPONSIVE factor (Chris's body responded to the injuries). Under the 'thin skull' / 'take your victim as you find them' principle, D is liable even if the victim was unusually vulnerable. The heart condition doesn't break proximate causation.\n\nCONCLUSION: Alex's liability depends on whether the jurisdiction recognizes a host's duty or a duty based on creating dangerous conditions. If a duty is found, involuntary manslaughter (recklessness) is likely the charge."
      },
      {
        q: "Q2: Analyze Dana's liability for Eddie's death under the felony murder doctrine. Apply all four limitations.",
        model: "FELONY MURDER ANALYSIS:\n\nBASIC RULE: Dana committed robbery (theft + force/threat). Eddie died during the commission. Felony murder applies IF limitations are satisfied.\n\n1) INHERENTLY DANGEROUS FELONY: Robbery involves force or threat of force (knifepoint). Under BOTH the abstract approach (robbery by its elements always creates risk of death) and fact-specific approach (knife robbery = substantial death risk), robbery qualifies as inherently dangerous. SATISFIED.\n\n2) RES GESTAE / TEMPORAL-SPATIAL: Eddie was struck while chasing Dana who was FLEEING the robbery. Under the temporary safety rule (People v. Bodely), the robbery isn't complete until Dana reaches a place of temporary safety. Dana was still in flight = still within the res gestae of the felony. The death occurred in immediate pursuit. SATISFIED.\n\n3) MERGER DOCTRINE (Rose v. State): Does the underlying felony (robbery) merge with the homicide? NO — robbery has an INDEPENDENT FELONIOUS PURPOSE (taking Eddie's wallet). The death was incidental to the theft, not an assaultive felony aimed at killing. The independent felonious purpose exception applies. NO MERGER.\n\n4) AGENCY RULE (State v. Canola): The car driver — a third party — struck Eddie. Under the AGENCY RULE, FM does not extend to killings by non-co-felons. The driver is not Dana's agent or associate. Under agency theory, Dana is NOT liable.\n\nHOWEVER: Under the PROXIMATE CAUSE THEORY (minority), FM applies to any death proximately caused by the felony. Eddie's chase and the car strike were a foreseeable consequence of a violent robbery. Under this theory, Dana IS liable.\n\nCONCLUSION: Result depends on jurisdiction. Agency rule jurisdictions: no FM liability for Eddie's death. Proximate cause jurisdictions: FM liability applies."
      },
      {
        q: "Q3: If the jurisdiction uses the MPC instead of common law, how does the analysis of Dana's liability change?",
        model: "MPC APPROACH TO FELONY MURDER:\n\nRULE: The MPC ELIMINATES felony murder as a standalone doctrine. Instead, MPC § 210.2(1)(b) creates a PRESUMPTION that recklessness and extreme indifference to human life are presumed if D is engaged in the commission of (or flight after) certain enumerated felonies — including robbery.\n\nAPPLICATION:\nThe presumption shifts the burden: Dana is PRESUMED to have acted with extreme recklessness manifesting extreme indifference to human life because she was committing robbery.\n\nPROSECUTION: The presumption applies — Dana was in flight from an armed robbery. The jury may infer extreme recklessness. Robbing someone at knifepoint and fleeing into a street creates obvious risks of death. This satisfies MPC murder under § 210.2(1)(b).\n\nDEFENSE: The presumption is rebuttable. Dana could argue she did not actually act with extreme recklessness — she was fleeing, not creating danger. The death was caused by a car, not by Dana's direct actions. Her subjective mental state was to escape, not to endanger Eddie's life. The risk of a car strike during a foot chase is not 'extreme' recklessness.\n\nALTERNATIVE CHARGE — MPC MANSLAUGHTER (§ 210.3): If extreme recklessness is not established, Dana may still be guilty of manslaughter if she acted RECKLESSLY (consciously disregarded a substantial risk that flight from a knifepoint robbery could result in someone's death).\n\nCONCLUSION: Under MPC, Dana faces murder via the recklessness presumption (rebuttable) or, failing that, manslaughter for reckless conduct. The MPC avoids the rigid limitations of common law FM but still provides a path to murder liability."
      }
    ]
  }
];

// ---- DATA: RULE WRITING DRILLS ----
const ruleDrills = [
  {id:1, prompt:"Write the MPC § 2.02 mens rea hierarchy with definitions.", answer:"1) PURPOSELY: Conscious object to engage in conduct or cause a result.\n2) KNOWINGLY: Awareness that conduct is practically certain to cause the result.\n3) RECKLESSLY: Conscious disregard of a substantial and unjustifiable risk. The risk must be of such a nature and degree that its disregard is a gross deviation from the standard of care a law-abiding person would observe.\n4) NEGLIGENTLY: Should be aware of a substantial and unjustifiable risk. Failure to perceive is a gross deviation from the standard of care a reasonable person would observe."},
  {id:2, prompt:"Write the four forms of common law malice aforethought.", answer:"1) Intent to kill another human being (express malice)\n2) Intent to inflict grievous bodily injury\n3) Depraved heart murder — extreme recklessness evincing extreme indifference to human life\n4) Felony murder rule — death during commission of a felony"},
  {id:3, prompt:"Write all four elements of voluntary manslaughter (categorical approach) and list the legally adequate provocations.", answer:"Elements: (1) Act in the heat of passion; (2) Passion resulted from legally adequate provocation; (3) No reasonable opportunity to cool off; (4) Causal link between provocation, passion, and killing.\n\nLegally adequate provocation: Battery/assault, mutual combat, serious crime against close relative, illegal arrest, observation of spousal adultery. Mere words are NOT sufficient."},
  {id:4, prompt:"Write the EMED standard (MPC § 210.3) and the Dumlao two-step test.", answer:"Manslaughter if D kills under circumstances that would ordinarily constitute murder, but the homicide was committed as a result of extreme mental or emotional disturbance (EMED) for which there is a reasonable explanation or excuse.\n\nDumlao two-step: (1) View the subjective, internal situation in which D found himself and the external circumstances as he perceived them at the time (however inaccurate). (2) Assess from that standpoint whether the explanation for the emotional disturbance was reasonable. NOTE: We assess reasonableness of the disturbance, not the action."},
  {id:5, prompt:"Write the four felony murder limitations with case names.", answer:"1) INHERENTLY DANGEROUS FELONY (People v. James): Underlying felony must be inherently dangerous. Two approaches: 'in the abstract' (look at elements) or fact-specific (look at how committed).\n2) RES GESTAE (People v. Bodely): Temporal/spatial proximity + causal link. Temporary safety rule: felony not complete until D reaches safety.\n3) MERGER DOCTRINE (Rose v. State): Underlying felony must be independent of homicide. Assaultive felonies merge. Exception: independent felonious purpose.\n4) AGENCY RULE (State v. Canola): FM doesn't extend to third-party killings. Exception: shield case."},
  {id:6, prompt:"Write the elements of larceny and distinguish it from larceny by trick, false pretenses, and embezzlement.", answer:"LARCENY: (1) Trespassory taking, (2) carrying away (asportation), (3) personal property of another, (4) without consent, (5) intent to permanently deprive.\n\nLARCENY BY TRICK: D obtains POSSESSION (not title) through fraud/deception.\nFALSE PRETENSES: D obtains TITLE and possession through false representation.\nEMBEZZLEMENT: Conversion by someone already in lawful possession as a fiduciary/entrusted party."},
  {id:7, prompt:"Write the intervening cause framework for proximate causation.", answer:"RESPONSIVE/DEPENDENT IC: Occurs in reaction to D's act. D remains proximate cause UNLESS the IC was extremely unusual or bizarre.\n\nCOINCIDENTAL/INDEPENDENT IC: Would have occurred regardless of D's act. D is NOT the proximate cause UNLESS the IC was foreseeable.\n\nMPC § 2.03: Result must be within the risk D was aware of, unless result differs only in person/property or is same kind of harm and not too remote/accidental."},
  {id:8, prompt:"Write the five categories of legal duty for omission liability.", answer:"An omission satisfies actus reus ONLY when a legal duty exists:\n1) SPECIAL RELATIONSHIP (parent-child, spouse — Beardsley limits to legal 'protector' relationships)\n2) CONTRACTUAL DUTY (Pestinikas — agreement to provide care)\n3) STATUTORY DUTY\n4) CREATION OF THE RISK (D created the dangerous situation)\n5) VOLUNTARY ASSUMPTION OF CARE (Howard — D undertook to help and victim relied on it)"},
];

// ---- COMPONENTS ----

const UNITS = ["All", "I", "II", "III", "IV", "V", "VI", "VII"];
const MODES = [
  {key: "flashcards", label: "Flashcards", icon: "🃏"},
  {key: "quiz", label: "Self-Test Quiz", icon: "✅"},
  {key: "rules", label: "Rule Writing", icon: "✍️"},
  {key: "hypos", label: "Practice Hypos", icon: "📋"},
  {key: "mnemonics", label: "Mnemonics", icon: "🧠"},
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ---- FLASHCARD MODE ----
function FlashcardMode({ cards }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [deck, setDeck] = useState(cards);
  const [confidence, setConfidence] = useState({});

  useEffect(() => { setDeck(cards); setIdx(0); setFlipped(false); }, [cards]);

  const card = deck[idx];
  if (!card) return <div className="text-center text-gray-400 py-16">No cards in this unit.</div>;

  const markConfidence = (level) => {
    setConfidence(prev => ({...prev, [card.id]: level}));
    next();
  };
  const next = () => { setFlipped(false); setIdx(i => Math.min(i + 1, deck.length - 1)); };
  const prev = () => { setFlipped(false); setIdx(i => Math.max(i - 1, 0)); };
  const shuffle = () => { setDeck(shuffleArray(deck)); setIdx(0); setFlipped(false); };

  const confCounts = Object.values(confidence);
  const got = confCounts.filter(c => c === "got").length;
  const shaky = confCounts.filter(c => c === "shaky").length;
  const missed = confCounts.filter(c => c === "missed").length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500">Card {idx + 1} of {deck.length} · Unit {card.unit} · {card.topic}</span>
        <button onClick={shuffle} className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded hover:bg-gray-600">Shuffle</button>
      </div>

      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer rounded-xl p-8 min-h-64 flex flex-col justify-center transition-all duration-200"
        style={{background: flipped ? "#1a2744" : "#1e293b", border: flipped ? "2px solid #3b82f6" : "2px solid #334155"}}
      >
        <div className="text-xs uppercase tracking-wider text-gray-400 mb-3">{flipped ? "Answer" : "Question"} {!flipped && <span className="text-blue-400 ml-2">(click to flip)</span>}</div>
        <div className="text-lg text-gray-100 whitespace-pre-line leading-relaxed">{flipped ? card.back : card.front}</div>
      </div>

      {flipped && (
        <div className="flex gap-3 mt-4 justify-center">
          <button onClick={() => markConfidence("got")} className="px-5 py-2 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 text-sm font-medium">Got It ✓</button>
          <button onClick={() => markConfidence("shaky")} className="px-5 py-2 rounded-lg bg-yellow-700 text-white hover:bg-yellow-600 text-sm font-medium">Shaky ~</button>
          <button onClick={() => markConfidence("missed")} className="px-5 py-2 rounded-lg bg-red-700 text-white hover:bg-red-600 text-sm font-medium">Missed ✗</button>
        </div>
      )}

      <div className="flex items-center justify-between mt-6">
        <button onClick={prev} disabled={idx === 0} className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-30">← Previous</button>
        <div className="flex gap-4 text-sm">
          <span className="text-emerald-400">✓ {got}</span>
          <span className="text-yellow-400">~ {shaky}</span>
          <span className="text-red-400">✗ {missed}</span>
        </div>
        <button onClick={next} disabled={idx === deck.length - 1} className="px-4 py-2 rounded bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-30">Next →</button>
      </div>
    </div>
  );
}

// ---- QUIZ MODE ----
function QuizMode({ cards }) {
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({correct: 0, total: 0});
  const [started, setStarted] = useState(false);

  const startQuiz = () => {
    setDeck(shuffleArray(cards).slice(0, Math.min(15, cards.length)));
    setIdx(0); setUserAnswer(""); setShowAnswer(false);
    setScore({correct: 0, total: 0}); setStarted(true);
  };

  if (!started) return (
    <div className="text-center py-16">
      <h3 className="text-xl text-gray-200 mb-4">Active Recall Self-Test</h3>
      <p className="text-gray-400 mb-2">You'll be shown questions and must type your answer from memory BEFORE seeing the correct answer.</p>
      <p className="text-gray-500 mb-6 text-sm">Research shows this 'retrieval practice' doubles long-term retention compared to re-reading.</p>
      <button onClick={startQuiz} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500 font-medium">Start Quiz ({Math.min(15, cards.length)} questions)</button>
    </div>
  );

  const card = deck[idx];
  if (!card) return (
    <div className="text-center py-16">
      <h3 className="text-2xl text-gray-200 mb-4">Quiz Complete!</h3>
      <p className="text-4xl font-bold mb-2" style={{color: score.correct / score.total >= 0.7 ? "#34d399" : "#f87171"}}>{score.correct} / {score.total}</p>
      <p className="text-gray-400 mb-6">{score.correct / score.total >= 0.7 ? "Strong performance! Review any 'shaky' cards." : "Keep drilling — focus on the rules you missed."}</p>
      <button onClick={startQuiz} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-500">Try Again</button>
    </div>
  );

  const handleReveal = () => setShowAnswer(true);
  const handleNext = (correct) => {
    setScore(s => ({correct: s.correct + (correct ? 1 : 0), total: s.total + 1}));
    setUserAnswer(""); setShowAnswer(false); setIdx(i => i + 1);
  };

  return (
    <div>
      <div className="flex justify-between mb-4 text-sm text-gray-400">
        <span>Question {idx + 1} of {deck.length}</span>
        <span>Score: {score.correct}/{score.total}</span>
      </div>
      <div className="rounded-xl p-6 mb-4" style={{background: "#1e293b", border: "2px solid #334155"}}>
        <div className="text-xs text-gray-500 mb-2">Unit {card.unit} · {card.topic}</div>
        <div className="text-lg text-gray-100">{card.front}</div>
      </div>
      {!showAnswer ? (
        <>
          <textarea
            value={userAnswer}
            onChange={e => setUserAnswer(e.target.value)}
            placeholder="Type your answer from memory... (don't peek!)"
            className="w-full p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
            rows={5}
          />
          <button onClick={handleReveal} className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">Reveal Answer</button>
        </>
      ) : (
        <>
          {userAnswer && (
            <div className="rounded-lg p-4 mb-3" style={{background: "#1a1a2e", border: "1px solid #4a4a6a"}}>
              <div className="text-xs text-gray-400 mb-1">Your Answer:</div>
              <div className="text-gray-300 whitespace-pre-line text-sm">{userAnswer}</div>
            </div>
          )}
          <div className="rounded-lg p-4 mb-4" style={{background: "#0f2a1a", border: "1px solid #166534"}}>
            <div className="text-xs text-emerald-400 mb-1">Correct Answer:</div>
            <div className="text-gray-200 whitespace-pre-line text-sm">{card.back}</div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleNext(true)} className="px-5 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-600">I got it right ✓</button>
            <button onClick={() => handleNext(false)} className="px-5 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600">I missed it ✗</button>
          </div>
        </>
      )}
    </div>
  );
}

// ---- RULE WRITING MODE ----
function RuleWritingMode() {
  const [idx, setIdx] = useState(0);
  const [userText, setUserText] = useState("");
  const [revealed, setRevealed] = useState(false);

  const drill = ruleDrills[idx];

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg text-gray-200 mb-2">Rule Writing Drill</h3>
        <p className="text-gray-400 text-sm mb-4">Write the complete rule from memory. Research shows that practicing writing rule statements is one of the most effective ways to memorize for closed-book exams.</p>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {ruleDrills.map((d, i) => (
          <button key={d.id} onClick={() => {setIdx(i); setUserText(""); setRevealed(false);}}
            className={`px-3 py-1 rounded text-sm ${i === idx ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
            Drill {i + 1}
          </button>
        ))}
      </div>
      <div className="rounded-xl p-6 mb-4" style={{background: "#1e293b", border: "2px solid #334155"}}>
        <div className="text-lg text-gray-100">{drill.prompt}</div>
      </div>
      <textarea
        value={userText}
        onChange={e => setUserText(e.target.value)}
        placeholder="Write the complete rule from memory..."
        className="w-full p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
        rows={8}
      />
      <button onClick={() => setRevealed(true)} className="mt-3 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">Check Against Model Answer</button>
      {revealed && (
        <div className="rounded-lg p-5 mt-4" style={{background: "#0f2a1a", border: "1px solid #166534"}}>
          <div className="text-xs text-emerald-400 mb-2 font-medium">Model Answer:</div>
          <div className="text-gray-200 whitespace-pre-line text-sm leading-relaxed">{drill.answer}</div>
        </div>
      )}
    </div>
  );
}

// ---- HYPO MODE ----
function HypoMode() {
  const [hypoIdx, setHypoIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showModel, setShowModel] = useState(false);

  const hypo = hypos[hypoIdx];
  const question = hypo.questions[qIdx];

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg text-gray-200 mb-2">Practice Hypotheticals</h3>
        <p className="text-gray-400 text-sm">Practice issue-spotting and IRAC analysis on fact patterns modeled after Professor Arnaud's exam format. Write your answer first, then compare against the model.</p>
      </div>
      <div className="flex gap-2 mb-4">
        {hypos.map((h, i) => (
          <button key={h.id} onClick={() => {setHypoIdx(i); setQIdx(0); setUserAnswer(""); setShowModel(false);}}
            className={`px-3 py-1 rounded text-sm ${i === hypoIdx ? "bg-blue-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
            {h.title}
          </button>
        ))}
      </div>

      <div className="rounded-xl p-5 mb-4" style={{background: "#1a1a2e", border: "1px solid #3b3b5c"}}>
        <div className="text-xs text-purple-400 mb-2 font-medium">FACT PATTERN: {hypo.title}</div>
        <div className="text-gray-200 text-sm leading-relaxed">{hypo.facts}</div>
      </div>

      <div className="flex gap-2 mb-4">
        {hypo.questions.map((_, i) => (
          <button key={i} onClick={() => {setQIdx(i); setUserAnswer(""); setShowModel(false);}}
            className={`px-3 py-1 rounded text-sm ${i === qIdx ? "bg-purple-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"}`}>
            Q{i + 1}
          </button>
        ))}
      </div>

      <div className="rounded-lg p-4 mb-4" style={{background: "#1e293b", border: "1px solid #334155"}}>
        <div className="text-gray-100 font-medium">{question.q}</div>
      </div>

      <textarea
        value={userAnswer}
        onChange={e => setUserAnswer(e.target.value)}
        placeholder="Write your IRAC analysis here... (Issue → Rule → Application from both sides → Conclusion)"
        className="w-full p-4 rounded-lg bg-gray-800 text-gray-200 border border-gray-600 focus:border-blue-500 focus:outline-none resize-none"
        rows={10}
      />
      <button onClick={() => setShowModel(true)} className="mt-3 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500">Show Model Answer</button>

      {showModel && (
        <div className="rounded-lg p-5 mt-4" style={{background: "#1a0f2a", border: "1px solid #7c3aed"}}>
          <div className="text-xs text-purple-400 mb-2 font-medium">Model Answer:</div>
          <div className="text-gray-200 whitespace-pre-line text-sm leading-relaxed">{question.model}</div>
        </div>
      )}
    </div>
  );
}

// ---- MNEMONICS MODE ----
function MnemonicsMode() {
  const [revealed, setRevealed] = useState({});
  return (
    <div>
      <h3 className="text-lg text-gray-200 mb-2">Mnemonics for Key Rules</h3>
      <p className="text-gray-400 text-sm mb-6">Mnemonics create mental shortcuts for recalling multi-element rules under exam pressure. Test yourself: can you recite what each letter stands for?</p>
      <div className="space-y-4">
        {mnemonics.map((m, i) => (
          <div key={i} className="rounded-lg p-5" style={{background: "#1e293b", border: "1px solid #334155"}}>
            <div className="flex justify-between items-start">
              <div>
                <div className="text-gray-400 text-xs mb-1">{m.topic}</div>
                <div className="text-2xl font-bold text-blue-400 mb-2">{m.mnemonic}</div>
              </div>
              <button onClick={() => setRevealed(r => ({...r, [i]: !r[i]}))}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600">
                {revealed[i] ? "Hide" : "Reveal"}
              </button>
            </div>
            {revealed[i] && <div className="text-gray-300 text-sm mt-1">{m.meaning}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---- MAIN APP ----
export default function App() {
  const [mode, setMode] = useState("flashcards");
  const [unit, setUnit] = useState("All");

  const filteredCards = unit === "All" ? flashcards : flashcards.filter(c => c.unit === unit);

  return (
    <div className="min-h-screen" style={{background: "#0f172a", color: "#e2e8f0"}}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-1">Criminal Law Study Tool</h1>
          <p className="text-gray-400 text-sm">JD2960 · Prof. Arnaud · Spring 2026 · Closed-Book Exam Prep</p>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-6 flex-wrap justify-center">
          {MODES.map(m => (
            <button key={m.key} onClick={() => setMode(m.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === m.key ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50" : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"}`}>
              {m.icon} {m.label}
            </button>
          ))}
        </div>

        {/* Unit Filter (for flashcards and quiz) */}
        {(mode === "flashcards" || mode === "quiz") && (
          <div className="flex gap-2 mb-6 justify-center flex-wrap">
            {UNITS.map(u => (
              <button key={u} onClick={() => setUnit(u)}
                className={`px-3 py-1 rounded text-xs font-medium ${unit === u ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-500 hover:text-gray-300"}`}>
                {u === "All" ? "All Units" : `Unit ${u}`}
              </button>
            ))}
          </div>
        )}

        {/* Content Area */}
        <div className="rounded-2xl p-6" style={{background: "#111827", border: "1px solid #1f2937"}}>
          {mode === "flashcards" && <FlashcardMode cards={filteredCards} />}
          {mode === "quiz" && <QuizMode cards={filteredCards} />}
          {mode === "rules" && <RuleWritingMode />}
          {mode === "hypos" && <HypoMode />}
          {mode === "mnemonics" && <MnemonicsMode />}
        </div>

        {/* Study Tips Footer */}
        <div className="mt-8 rounded-lg p-5" style={{background: "#111827", border: "1px solid #1f2937"}}>
          <h4 className="text-sm font-medium text-gray-300 mb-2">Evidence-Based Study Strategy for Closed-Book Exams</h4>
          <div className="text-xs text-gray-500 space-y-1">
            <p><span className="text-blue-400 font-medium">Active Recall:</span> Always try to answer from memory BEFORE looking at the answer. Retrieval practice doubles retention vs. re-reading.</p>
            <p><span className="text-blue-400 font-medium">Spaced Repetition:</span> Study in multiple short sessions over 2-4 weeks, not one long cram. Review missed cards daily, 'got it' cards every 3-5 days.</p>
            <p><span className="text-blue-400 font-medium">Rule Writing:</span> Physically write out rule statements from memory — the most effective memorization technique for closed-book exams.</p>
            <p><span className="text-blue-400 font-medium">Practice Hypos:</span> Simulate exam conditions — set a 30-min timer per question and write full IRAC answers without notes.</p>
            <p><span className="text-blue-400 font-medium">Both Sides:</span> Prof. Arnaud tests argumentation. For every rule, practice articulating both the prosecution and defense arguments using specific facts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
