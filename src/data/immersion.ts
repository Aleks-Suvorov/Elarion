// ─── Immersion & Thematic Tables ─────────────────────────────
// Per-genre sensory details, atmosphere, tone anchors.
// Used by the narrative adapter to differentiate each playthrough.

import type { Genre, Season } from '../types';

export interface AtmosphereProfile {
  openingLines: string[];        // First line of a session
  timeOfDayFlavour: Record<string, string>;
  seasonFlavour: Record<Season, string>;
  weatherFlavour: Record<string, string>;
  soundscape: string[];          // Ambient sound descriptors
  smells: string[];
  dangerCues: string[];          // Environmental signs of danger
  safetyCues: string[];          // Environmental signs of relative safety
  victoryLines: string[];        // Crit success
  failureLines: string[];        // Fumble
  deathWarningLines: string[];   // HP < 25%
  levelUpLines: string[];
  questCompletionLines: string[];
  clockCompletionLines: string[];
}

export const ATMOSPHERE: Record<Genre, AtmosphereProfile> = {
  fantasy: {
    openingLines: [
      'The road behind you has grown uncertain. The road ahead is worse.',
      'Magic saturates the air like old iron — charged, unpredictable, waiting.',
      'Three factions. One prize. Every player at the table thinks they hold the advantage.',
      'The world is older than its kingdoms. What it has buried, it will eventually unbury.',
      'You are not the first to come this way. The bones of the last party are just off the path.',
    ],
    timeOfDayFlavour: {
      dawn: 'Pale light bleeds through the treeline. The birds are not singing yet.',
      morning: 'The settlement stirs. Smoke from chimneys, the smell of bread, the sound of argument.',
      midday: 'The sun overhead gives nowhere to hide. Everything is exposed.',
      afternoon: 'The light turns amber and honest. Shadows lengthen but remain predictable.',
      evening: 'Torches are being lit. The day\'s business is nearly done — the night\'s is starting.',
      night: 'Darkness here is not empty. Things move in it that prefer the absence of witnesses.',
      latenight: 'The third hour past midnight. Guards are tired. The city is at its most honest.',
      predawn: 'The coldest hour. The one before the world decides to wake.',
    },
    seasonFlavour: {
      spring: 'New growth over old rot. The world is attempting optimism again.',
      summer: 'The heat makes everyone tired and irritable. Tempers are short.',
      autumn: 'Everything is preparing to die or to wait. The smell of decay is everywhere.',
      winter: 'The cold is an adversary. It does not hate you; it simply does not care.',
    },
    weatherFlavour: {
      clear: 'The sky is open, indifferent, and vast.',
      overcast: 'A ceiling of grey presses down. The world feels smaller.',
      rain: 'The rain turns roads to mud and washes away the convenient fictions people tell.',
      fog: 'The fog reduces everything to a radius of twenty metres. Beyond that, invention.',
      wind: 'The wind is cold and has opinions about where you should be going.',
      storm: 'The storm doesn\'t care about your plans. Lightning picks targets at random.',
      snow: 'Snow softens the landscape and makes everything look clean. It isn\'t.',
      blizzard: 'The blizzard is the whole world now. Shelter or die.',
    },
    soundscape: [
      'distant iron on iron', 'a hawk calling overhead', 'the creak of old timber',
      'wind in tall grass', 'a bell from somewhere below', 'the silence after a shout',
      'boots on cobblestone', 'a crowd that suddenly went quiet', 'chanting — low, rhythmic',
    ],
    smells: [
      'woodsmoke and wet earth', 'iron and copper', 'old parchment',
      'something burned recently', 'pine and frost', 'river silt and fish',
      'torch-pitch and sweat', 'blood — not yours, not yet',
    ],
    dangerCues: [
      'Tracks in the mud — recent and heading your way.',
      'The animals have gone quiet.',
      'Someone has been here. The fire is still warm.',
      'The door hangs open and it shouldn\'t.',
      'You count three exits. Someone counted them before you.',
    ],
    safetyCues: [
      'Children playing near the well. A good sign.',
      'Lanterns in windows. Smoke from chimneys. The village is alive.',
      'A posted guard who waves you through — bored, not nervous.',
      'The inn is loud with ordinary arguments.',
    ],
    victoryLines: [
      'Clean. Decisive. The kind of success that buys you a reputation.',
      'It works, and works well — a crack appears in what seemed immovable.',
      'The odds were against you. They were wrong.',
    ],
    failureLines: [
      'The door doesn\'t open. The lock laughs at you.',
      'Misjudged. The world corrects you without apology.',
      'Not today. The cost is manageable. Learn.',
    ],
    deathWarningLines: [
      'Your blood is mapping the floor. This is not a metaphor.',
      'You are running out of options in the same way a candle runs out of wax.',
      'The body can survive extraordinary things. You are testing its limits.',
    ],
    levelUpLines: [
      'Something has shifted. Not just skill — something in the architecture of who you are.',
      'The world has tested you enough times that the test is starting to feel like practice.',
    ],
    questCompletionLines: [
      'Done. The weight of it settles. On to the next thing.',
      'Finished. Whether it was worth it is a question for later.',
    ],
    clockCompletionLines: [
      'The thing you were watching for has arrived. Ready or not.',
      'Time ran out. The world has moved without asking your permission.',
    ],
  },

  'sci-fi': {
    openingLines: [
      'Deep space is mostly nothing. It\'s the something parts that kill you.',
      'The corporation owns the station, the air supply, and the contract on your life.',
      'Everything is data. Data can be stolen, corrupted, or bought.',
      'The signal came from a sector listed as empty. Someone lied on the charts.',
      'You have a ship, a job, and a list of people who want one or both of them.',
    ],
    timeOfDayFlavour: {
      dawn: 'Cycle-start. Lights at thirty percent. The shift change is in twenty minutes.',
      morning: 'First shift is up. The corridors are loud. Information is moving.',
      midday: 'Peak cycle. Systems under full load. The heat is perceptible through the hull.',
      afternoon: 'Mid-shift. Routine transmissions. The dull hours before something goes wrong.',
      evening: 'Second shift. The station empties into rec zones and mess halls.',
      night: 'Low-cycle. Skeleton crew. The best time for things that require no witnesses.',
      latenight: 'The station breathes with recycled air. Three decks up, someone is awake who shouldn\'t be.',
      predawn: 'Pre-shift. The void outside doesn\'t distinguish between night and day.',
    },
    seasonFlavour: {
      spring: 'Fiscal quarter start. Budgets are fresh. Optimism is briefly permitted.',
      summer: 'Peak operations cycle. Pressure from every direction.',
      autumn: 'End of quarter. Audits. Contracts being reviewed.',
      winter: 'Maintenance cycle. Things that were ignored get dealt with or abandoned.',
    },
    weatherFlavour: {
      clear: 'Systems nominal. Green across the board. Enjoy it.',
      overcast: 'Interference on external sensors. Unknown cause. Probably nothing.',
      rain: 'Atmospheric processors cycling. Synthetic precipitation on the agri-decks.',
      fog: 'Plasma exhaust venting. Visibility on the exterior platforms: minimal.',
      wind: 'Solar wind elevated. Comm signals degraded.',
      storm: 'Ion storm advisory. Non-essential external ops suspended.',
      snow: 'Cryo-volatiles venting from processing sector. Hazmat advisory issued.',
      blizzard: 'Hull breach protocol active. External access locked.',
    },
    soundscape: [
      'the hum of life support', 'a proximity alarm three decks down', 'static on the channel',
      'boots on grating', 'server fans cycling up', 'the hiss of a pressure door',
      'someone running — away from something or toward it', 'a cargo lock disengaging',
    ],
    smells: [
      'recycled air with a chemical edge', 'solder and hot metal', 'coolant leaking somewhere',
      'the synthetic smell of rations', 'plasma residue', 'the distinct scent of a space that hasn\'t been cleaned',
    ],
    dangerCues: [
      'Bioscan returns an anomaly in sector three.',
      'The corridor lighting shifts to amber. No announcement.',
      'Your nav system reports a ship on intercept course.',
      'The contact you were meeting isn\'t at the rendezvous.',
      'Three crew members haven\'t checked in for two hours.',
    ],
    safetyCues: [
      'The station AI confirms docking clearance. Routine scan. Clean.',
      'The bar is full. Nobody\'s looking for you here. Yet.',
      'Credentials accepted. Access granted. You\'re in the system.',
    ],
    victoryLines: [
      'Output confirmed. The data is yours.',
      'Clean breach. You were in and out before the system noticed.',
      'Mission parameters met. Debrief when you\'re back aboard.',
    ],
    failureLines: [
      'The system logs the attempt. Someone will look at those logs.',
      'Countermeasure triggered. Adjust approach.',
      'Denied. The wall is higher than it looked.',
    ],
    deathWarningLines: [
      'Suit integrity: 12%. The vacuum outside is patient.',
      'Biometrics critical. Recommend immediate medical intervention.',
      'You are leaking in ways that the suit\'s patch-kit cannot fix.',
    ],
    levelUpLines: [
      'Experience compiles into capability. You\'re better at staying alive than you were.',
      'Upgrade integrated. Threat assessment recalculated.',
    ],
    questCompletionLines: [
      'Objective secured. Credits incoming.',
      'Task complete. The system updates. The universe moves on.',
    ],
    clockCompletionLines: [
      'The countdown reached zero. The event begins now.',
      'Window closed. The situation has escalated without waiting for you.',
    ],
  },

  zombie: {
    openingLines: [
      'The world ended three months ago. You have not caught up to that fact yet.',
      'There are more of them than there are of you. There always will be.',
      'Trust is a resource. It runs out faster than food.',
      'The city is quiet. That is not the same as safe.',
      'You have survived this long by being careful. Careful is running out of road.',
    ],
    timeOfDayFlavour: {
      dawn: 'Grey light. The overnight count of sounds you couldn\'t identify: eleven.',
      morning: 'Daylight means visibility — yours and theirs. Move carefully.',
      midday: 'The sun is up and indifferent. Noise travels further than you\'d like.',
      afternoon: 'The best hours. Light still good. Core temperature manageable.',
      evening: 'It\'s time to be inside. Everything that goes wrong after dark goes worse.',
      night: 'Don\'t move. Don\'t make noise. Wait.',
      latenight: 'The middle of nothing. Hours until dawn. Ammunition counted for the fourth time.',
      predawn: 'The worst hour. Tired. Cold. Still dark.',
    },
    seasonFlavour: {
      spring: 'Everything is growing. Including the infection rate, according to the last broadcast.',
      summer: 'Heat accelerates decomposition. The smell has gotten biblical.',
      autumn: 'Supplies are a problem. They always are now, but more so.',
      winter: 'The cold slows them down. It slows everyone down.',
    },
    weatherFlavour: {
      clear: 'Good visibility. You can see them. They can see you.',
      overcast: 'Flat light. Hard to judge distances.',
      rain: 'The rain covers sound — yours and theirs both.',
      fog: 'Fog is a coffin lid. Stay inside it or get out of it. Don\'t walk through it.',
      wind: 'Wind masks approach from the downwind direction.',
      storm: 'Lightning. Every flash reveals your position to everything that has eyes.',
      snow: 'Tracks in snow are a liability you cannot afford.',
      blizzard: 'You\'re not going anywhere. Neither are they. Wait it out.',
    },
    soundscape: [
      'something dragging itself along pavement', 'a car alarm, still running after months',
      'the wind through broken windows', 'distant shouting — direction unclear',
      'a sound that was definitely a footstep', 'nothing — and nothing is wrong',
      'a child, somewhere — you check your count again', 'glass breaking two floors up',
    ],
    smells: [
      'decay — sweet, pervasive, everywhere', 'old fuel and rust',
      'woodsmoke from somewhere nearby', 'the clean smell of rain on concrete',
      'blood — dried and recent both', 'something cooking, which means someone survived',
    ],
    dangerCues: [
      'Fresh blood on the floor. Not dried.',
      'A horde — distant but the sound is getting louder.',
      'The barricade on the east side has been moved.',
      'Someone in your group is running a temperature.',
      'The radio picked up a signal that cut off mid-sentence.',
    ],
    safetyCues: [
      'The perimeter is intact. No tracks overnight.',
      'Lights from the settlement. Someone else made it through the night.',
      'The group is accounted for. Everyone is breathing.',
    ],
    victoryLines: [
      'Clean. Nobody bitten. Supplies secured.',
      'You made it. The group made it. Today that\'s enough.',
      'Against the odds, as always. The odds are getting tired of losing.',
    ],
    failureLines: [
      'Compromised. Pull back. Regroup.',
      'It costs you — resources, time, maybe trust. Pay it and adapt.',
      'Wrong call. The world corrects you immediately and without mercy.',
    ],
    deathWarningLines: [
      'You are running out of options faster than blood.',
      'Critical condition. The group is watching. Don\'t let it show.',
      'If this is it, make the last action count.',
    ],
    levelUpLines: [
      'Survival has made you harder. Harder is what survival requires.',
      'You have learned something that cannot be unlearned.',
    ],
    questCompletionLines: [
      'Made it. The supplies are real. The mission succeeded.',
      'Done. Cross it off. Add another day to the count.',
    ],
    clockCompletionLines: [
      'The horde has arrived. This was always going to happen.',
      'Time ran out. The world doesn\'t wait for survivors.',
    ],
  },

  modern: {
    openingLines: [
      'The city runs on favours and leverage. You are currently short on both.',
      'Three parties want the same thing. None of them know about the others. Yet.',
      'Clean hands are a luxury. Yours stopped being clean a long time ago.',
      'Information is the only currency that matters here.',
      'You are one degree of separation from everyone who matters. That\'s your advantage.',
    ],
    timeOfDayFlavour: {
      dawn: 'The city hasn\'t woken up. The city never fully sleeps.',
      morning: 'Suits and commuters. Nobody looks at each other. Perfect cover.',
      midday: 'The lunch hour. Deals made over tables. Information traded over coffee.',
      afternoon: 'The working hours. Everyone is visible. Everyone is watchable.',
      evening: 'The shift change. The day people heading home, the night people just arriving.',
      night: 'The city\'s real business hours. What happens after dark doesn\'t make the morning papers.',
      latenight: 'The quietest the city gets. Still not quiet.',
      predawn: 'Pre-dawn. The cleaners. The graveyard shift. The people who need to be invisible.',
    },
    seasonFlavour: {
      spring: 'The city reinvents itself. New faces. New money. New targets.',
      summer: 'Heat and short tempers. Situations escalate faster.',
      autumn: 'Year-end. Everyone is settling scores before the books close.',
      winter: 'Cold focuses priorities. Luxuries become obvious.',
    },
    weatherFlavour: {
      clear: 'No excuses for not being seen. Move with purpose.',
      overcast: 'Flat grey day. Everyone looks the same from a distance.',
      rain: 'The rain gives you a reason to keep your face down.',
      fog: 'The city disappears above the third floor. Use it.',
      wind: 'Wind strips context. Words carry wrong.',
      storm: 'Nobody is where they\'re supposed to be.',
      snow: 'The city slows down. So does everyone in it. Including security.',
      blizzard: 'Lockdown. The weather has decided everyone stays home.',
    },
    soundscape: [
      'traffic at a constant low roar', 'someone\'s call bleeding through a thin wall',
      'a siren — far, then near, then past', 'the elevator arriving at the wrong floor',
      'footsteps keeping pace behind you', 'a door closing firmly two rooms over',
      'the scan of a key card', 'silence in a room that was loud a moment ago',
    ],
    smells: [
      'coffee and recycled air', 'exhaust and wet concrete',
      'cigarette smoke near a service door', 'money — the specific smell of handled paper',
      'cologne that costs more than your rent', 'a building that burned recently',
    ],
    dangerCues: [
      'The man at the bar has been nursing the same drink for an hour.',
      'Your contact is thirty minutes late.',
      'The camera on the corner has been repositioned.',
      'A car has passed the same block three times.',
      'Someone knows your name who shouldn\'t.',
    ],
    safetyCues: [
      'Clean signal. No tails. The route is clear.',
      'The contact confirms. Handshake. You\'re in.',
      'Nothing unusual. The mundane is its own kind of cover.',
    ],
    victoryLines: [
      'Clean op. No trace. Nobody knows it was you.',
      'The deal closed. The ledger balances in your favour.',
      'You got what you came for and nobody died over it. A good day.',
    ],
    failureLines: [
      'Burned. Rebuild from a different angle.',
      'You left tracks. Someone will follow them.',
      'The wrong person noticed. Manage the fallout.',
    ],
    deathWarningLines: [
      'You are out of road in the most immediate sense.',
      'Critical. The exit is closing. Move.',
      'This is the kind of situation that ends careers. And other things.',
    ],
    levelUpLines: [
      'You\'ve been in enough rooms to know which exits matter.',
      'The game respects experience. So do the players.',
    ],
    questCompletionLines: [
      'Closed. The contract fulfilled. No loose ends.',
      'Done. The client is satisfied. For now.',
    ],
    clockCompletionLines: [
      'The window closed. Someone else walked through it.',
      'Deadline reached. The situation has changed without your input.',
    ],
  },

  cyberpunk: {
    openingLines: [
      'The city is neon and rot, stacked forty stories of each.',
      'The corps own the grid. You run between the packets, hoping they don\'t notice.',
      'Chrome costs money. Ideas are free. That\'s about where the advantages end.',
      'Everyone in this city is for sale. The question is who\'s doing the buying.',
      'The net remembers everything. The street forgets nothing. You exist somewhere between.',
    ],
    timeOfDayFlavour: {
      dawn: 'The neon dims slightly before dawn. The city pretends to rest.',
      morning: 'Corpo drones flooding transit. The suits don\'t make eye contact with each other.',
      midday: 'Peak cycle. Corporate efficiency at maximum. Street level: survival.',
      afternoon: 'The daily numbers are in. Someone is unhappy. Someone else is being blamed.',
      evening: 'The shift rotates. The corporate day ends. The city\'s real night begins.',
      night: 'Neon at full brilliance. Every transaction visible. None of them legal.',
      latenight: 'Zero-dark-thirty in the combat zone. Sound travels. Don\'t make any.',
      predawn: 'Pre-cycle. The city breathes. Somewhere a datacore is compiling your file.',
    },
    seasonFlavour: {
      spring: 'Q1 earnings. The corps are hungry. Acquisitions incoming.',
      summer: 'Heat plus concrete plus overcrowding. The perfect conditions for something ugly.',
      autumn: 'Fiscal close. Everyone is either counting wins or covering losses.',
      winter: 'Cold keeps the heat signatures clean. Good for wetwork. Bad for shelter.',
    },
    weatherFlavour: {
      clear: 'Good visibility. Drone coverage optimal. They can see you clearly.',
      overcast: 'Sensor scatter. The surveillance net has blind spots today.',
      rain: 'Acid rain advisory: third tier and below. The rich stay dry.',
      fog: 'Fog bank rolling in off the bay. Facial recognition compromised.',
      wind: 'Wind disperses aerosolised surveillance compounds. Natural counter-measure.',
      storm: 'EMP risk from lightning. Unshielded cyberware: potential malfunction.',
      snow: 'Rare. The city doesn\'t handle it. Neither do the security contractors.',
      blizzard: 'Total lockdown. Even the corps stay inside.',
    },
    soundscape: [
      'bass from three floors up and a world away', 'the skitter of a surveillance drone',
      'someone jacking in — the soft click of a neural interface', 'corporate PA, floor 40',
      'a gunshot — no echo, suppressed', 'the crackle of a compromised connection',
      'a man arguing with his implant', 'rain on neon — every surface a smeared reflection',
    ],
    smells: [
      'ozone from the grid', 'synth-food grease and carbon', 'blood and chrome',
      'the specific cold smell of server rooms', 'corpo cologne — synthetic and expensive',
      'something burning in the sub-levels', 'recycled air with a pharmaceutical edge',
    ],
    dangerCues: [
      'Three corpo-sec in plain clothes. Their posture gives them away.',
      'Someone ran a facial recognition scan on you. You felt the ping.',
      'A drone has been hovering at the edge of sensor range for five minutes.',
      'Your fixer isn\'t answering. The fixer always answers.',
      'The ICE on that server is the expensive kind.',
    ],
    safetyCues: [
      'Net scan clean. No tags. You\'re invisible for now.',
      'The safe house is cold — no signals in or out. Clean.',
      'The fixer vouches for you. That opens the door.',
    ],
    victoryLines: [
      'Ghost. You were never here. The logs agree.',
      'Data extracted. Eddies incoming. The job is done.',
      'Clean breach. No trace. The corpo won\'t know until it\'s too late.',
    ],
    failureLines: [
      'Traced. Burn the approach and route a new one.',
      'ICE caught you. They know someone tried. They don\'t know who yet.',
      'Flatlined approach. Different vector next run.',
    ],
    deathWarningLines: [
      'Chrome isn\'t a substitute for blood. You\'re running out of the latter.',
      'System critical. Meat-side and chrome-side both.',
      'You have about sixty seconds before the blood loss makes the decision for you.',
    ],
    levelUpLines: [
      'The streets have upgraded you. You process threat differently now.',
      'New capability integrated. The city is slightly less likely to kill you.',
    ],
    questCompletionLines: [
      'Run complete. Cred transfer confirmed.',
      'Job done. The fixer is impressed. That means more work.',
    ],
    clockCompletionLines: [
      'The countdown hit zero. The corp moved.',
      'Too slow. The window closed. The grid updated without you.',
    ],
  },

  historical: {
    openingLines: [
      'This century belongs to those willing to take it by force.',
      'The powerful do not fear the law. They write it.',
      'Information travels slowly here. Use that.',
      'The world is changing. Most people have not noticed yet.',
      'You serve a power that may not deserve your loyalty. That question is for later.',
    ],
    timeOfDayFlavour: {
      dawn: 'The city wakes with church bells. The day\'s business begins.',
      morning: 'The markets open. Commerce is the honest face of every other kind of transaction.',
      midday: 'The heat of the day. The powerful retreat to shade. The rest work through it.',
      afternoon: 'The afternoon light turns gold. The city feels momentarily generous.',
      evening: 'Torches and candles. Everything becomes shadows and orange.',
      night: 'The streets belong to those who prefer darkness. There are many of them.',
      latenight: 'The city sleeps, but the powerful do not. Business continues by candlelight.',
      predawn: 'Before the bells. The world is still. A rare thing.',
    },
    seasonFlavour: {
      spring: 'Planting season. The countryside holds its breath.',
      summer: 'Campaign season. Armies move. Merchants follow.',
      autumn: 'Harvest. Everything that was promised in spring is now due.',
      winter: 'The siege season ends. The political season begins.',
    },
    weatherFlavour: {
      clear: 'Good weather for travel and for war. Both are happening.',
      overcast: 'A grey sky over a grey situation.',
      rain: 'The rain turns roads to rivers. Movement slows.',
      fog: 'The fog hides everything equally.',
      wind: 'A cold wind from the north. A portent, if you believe in them.',
      storm: 'The storm grounds everything. A temporary peace.',
      snow: 'The passes are closing. Supply lines are failing.',
      blizzard: 'The blizzard ends campaigns and delays executions equally.',
    },
    soundscape: [
      'iron-shod wheels on cobblestone', 'a herald\'s trumpet', 'the crowd at the market square',
      'steel on steel — practice or otherwise', 'a sermon through a thick wall',
      'the counting house adding its columns', 'a horse stamping outside',
      'the scratch of a quill — someone writing something important',
    ],
    smells: [
      'woodsmoke and tallow', 'horse and hay', 'bread from the baker\'s',
      'iron and leather', 'the river, heavy and close',
      'incense from the church', 'something rotting in the market quarter',
    ],
    dangerCues: [
      'The seal on that letter has been broken and resealed.',
      'The innkeeper asked too many questions about your route.',
      'Three armed men have taken an interest in your table.',
      'The road ahead shows signs of recent passage — many riders.',
      'A writ has been posted with a description that fits you.',
    ],
    safetyCues: [
      'The gates are open and the guards wave you through.',
      'The letter of introduction is accepted. You are expected.',
      'The inn is full and loud. Good cover.',
    ],
    victoryLines: [
      'A clean victory. The terms are yours.',
      'Success, and the record will reflect it.',
      'Done and witnessed. The matter is settled.',
    ],
    failureLines: [
      'A setback. Recover position through other means.',
      'The attempt has been noted by the wrong people.',
      'Failure here has consequences that will arrive later.',
    ],
    deathWarningLines: [
      'The wound is serious. A surgeon, quickly, if one exists nearby.',
      'You are losing this fight in every measurable way.',
      'Your body has reached the limit of what duty can ask of it.',
    ],
    levelUpLines: [
      'Experience has shaped you into something more formidable.',
      'You carry the weight of what you\'ve survived. It makes you stronger.',
    ],
    questCompletionLines: [
      'The matter is concluded. Your part in it, at least.',
      'Done. The historians may record it differently.',
    ],
    clockCompletionLines: [
      'The armies are moving. This was inevitable.',
      'The deadline has passed. The consequences follow.',
    ],
  },

  mixed: {
    openingLines: [
      'The world does not fit into categories. Neither do you.',
      'Lines between eras and genres blur here. Pay attention.',
      'You have stepped into a situation that was complicated before you arrived.',
      'Every rule has an exception. You are standing in one.',
    ],
    timeOfDayFlavour: {
      dawn: 'A new phase begins. What it contains is undefined.',
      morning: 'Activity resumes. The day\'s threats are assembling.',
      midday: 'The crossroads hour. Every decision at full visibility.',
      afternoon: 'The window narrows. Use the remaining light.',
      evening: 'The transition between what the day permitted and what the night allows.',
      night: 'The world\'s second operating mode. Different rules apply.',
      latenight: 'Deep hours. The real world leaks through.',
      predawn: 'Before the reset. Decisions made here have weight.',
    },
    seasonFlavour: {
      spring: 'Renewal. Not always welcome, not always peaceful.',
      summer: 'The pressure of full operation.',
      autumn: 'Endings and accounting.',
      winter: 'Reduction. What remains is what matters.',
    },
    weatherFlavour: {
      clear: 'Optimal conditions. Use them.',
      overcast: 'Reduced visibility in multiple senses.',
      rain: 'The rain equalises. Everything becomes harder for everyone.',
      fog: 'Fog as metaphor and obstacle simultaneously.',
      wind: 'Something is shifting.',
      storm: 'The system overrides all plans.',
      snow: 'Temporary stasis. A forced pause.',
      blizzard: 'Total disruption. Survive until conditions improve.',
    },
    soundscape: [
      'something that doesn\'t fit the landscape', 'a sound that carries further than it should',
      'silence in a space that shouldn\'t be silent', 'an alarm of some kind',
      'voices, indistinct, nearby', 'movement that stopped when you did',
    ],
    smells: [
      'a scent that doesn\'t belong to this environment',
      'something burning', 'the cold smell of places abandoned',
      'the sharp smell of something recent and wrong',
    ],
    dangerCues: [
      'Something is out of place in a way you can\'t immediately name.',
      'The environment has changed since your last assessment.',
      'Something is watching. You feel it before you see it.',
    ],
    safetyCues: [
      'The immediate area is clear.',
      'No immediate threats in range.',
      'A temporary calm between pressures.',
    ],
    victoryLines: [
      'Success, by whatever definition applies here.',
      'You prevailed. The form of the victory fits the world.',
    ],
    failureLines: [
      'Failure with this world\'s particular flavour of consequence.',
      'Adjust. The system is still operable.',
    ],
    deathWarningLines: [
      'You are in danger of a permanent kind.',
      'Critical condition, regardless of genre.',
    ],
    levelUpLines: [
      'Growth. It took the form this world provides.',
      'You have become more capable of surviving here.',
    ],
    questCompletionLines: ['Completed. The world acknowledges it in its way.'],
    clockCompletionLines: ['The event arrived. Everything adjusts.'],
  },
};

// ─── Helpers ──────────────────────────────────────────────────

export function getAtmosphere(genre: Genre): AtmosphereProfile {
  return ATMOSPHERE[genre];
}

export function getOpeningLine(genre: Genre, seed: number): string {
  const lines = ATMOSPHERE[genre].openingLines;
  return lines[seed % lines.length];
}

export function getTimeOfDayFlavour(genre: Genre, hour: number): string {
  const profile = ATMOSPHERE[genre];
  if (hour < 5) return profile.timeOfDayFlavour['predawn'] ?? '';
  if (hour < 8) return profile.timeOfDayFlavour['dawn'] ?? '';
  if (hour < 12) return profile.timeOfDayFlavour['morning'] ?? '';
  if (hour < 14) return profile.timeOfDayFlavour['midday'] ?? '';
  if (hour < 18) return profile.timeOfDayFlavour['afternoon'] ?? '';
  if (hour < 21) return profile.timeOfDayFlavour['evening'] ?? '';
  if (hour < 24) return profile.timeOfDayFlavour['night'] ?? '';
  return profile.timeOfDayFlavour['latenight'] ?? '';
}

export function getWeatherFlavour(genre: Genre, weather: string): string {
  return ATMOSPHERE[genre].weatherFlavour[weather] ?? ATMOSPHERE[genre].weatherFlavour['clear'] ?? '';
}

export function getSeasonFlavour(genre: Genre, season: Season): string {
  return ATMOSPHERE[genre].seasonFlavour[season];
}

export function getRandomSoundscape(genre: Genre, seed: number): string {
  const sounds = ATMOSPHERE[genre].soundscape;
  return sounds[seed % sounds.length];
}

export function getRandomSmell(genre: Genre, seed: number): string {
  const smells = ATMOSPHERE[genre].smells;
  return smells[seed % smells.length];
}

export function getDangerCue(genre: Genre, seed: number): string {
  const cues = ATMOSPHERE[genre].dangerCues;
  return cues[seed % cues.length];
}
