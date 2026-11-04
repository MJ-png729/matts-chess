import { BotDifficulty } from '../types/chess';

export type BotChatEvent =
  | 'game_start'
  | 'bot_move_normal'
  | 'bot_winning_big'
  | 'bot_losing_big'
  | 'bot_capture'
  | 'bot_capture_major'
  | 'bot_capture_queen'
  | 'player_capture'
  | 'player_capture_major'
  | 'bot_check'
  | 'player_check'
  | 'player_blunder'
  | 'player_blunder_queen'
  | 'player_missed_mate'
  | 'player_missed_win'
  | 'bot_promotion'
  | 'player_promotion'
  | 'draw_accept'
  | 'draw_decline'
  | 'bot_win'
  | 'player_win'
  | 'player_resign'
  | 'draw_game'
  | 'trash_talk_toggled_on';

export interface DialogueContext {
  difficulty: BotDifficulty;
  playerName: string;
  san?: string;
  capturedPiece?: string;
  evalCp?: number; // From bot's perspective (+ = bot ahead, - = bot behind)
  moveCount?: number;
}

// Track recently used lines per event to prevent back-to-back repeats
const recentHistory = new Map<string, string[]>();

function pickLine(key: string, lines: string[]): string {
  if (lines.length === 0) return '';
  const recent = recentHistory.get(key) || [];
  const available = lines.filter((l) => !recent.includes(l));
  const pool = available.length > 0 ? available : lines;
  const chosen = pool[Math.floor(Math.random() * pool.length)];

  const updated = [...recent, chosen].slice(-Math.min(4, Math.max(1, lines.length - 1)));
  recentHistory.set(key, updated);
  return chosen;
}

/**
 * Chill casual lowercase texting mode (when Bot Messages is ON, but Bot Trash Talk is OFF).
 * Sounds like a real person texting, just without the disrespect or swearing.
 */
const CASUAL_LINES: Record<BotChatEvent, string[]> = {
  game_start: [
    'yo glhf :-)',
    'alr let us run it, good luck',
    'what opening you gonna play today :-D',
    'sup, ready whenever you are',
  ],
  bot_move_normal: [
    'hmm let me try this',
    'lowkey interesting position tbh',
    'alr your turn',
    'let us see what you got :-)',
    'just developing the pieces',
  ],
  bot_winning_big: [
    'okay wait my position is actually kind of clean rn :-D',
    'up a bunch of material now icl',
  ],
  bot_losing_big: [
    'oof i am down bad on this board 😭',
    'alr somehow i gotta find a miracle here 🙏',
  ],
  bot_capture: [
    'i will take that :-)',
    'yoink',
    'free pawn icl',
  ],
  bot_capture_major: [
    'ooh big capture :-D',
    'had my eye on that square for a sec',
  ],
  bot_capture_queen: [
    'wait did i just get the queen 8-o',
    'ooh catching the queen shifts everything',
  ],
  player_capture: [
    'clean trade',
    'alr i see the vision',
    'fair enough :-)',
  ],
  player_capture_major: [
    'oof did not see that coming ngl :(',
    'alr you got me there, well played',
  ],
  bot_check: [
    'check ;-)',
    'watch your king :-P',
  ],
  player_check: [
    'ooh nice check',
    'alr stepping out of check',
  ],
  player_blunder: [
    'wait... are you sure about that square 8-o',
    'ooh i think that piece might be hanging :-/',
  ],
  player_blunder_queen: [
    'wait did you mean to move your queen there 8-o',
    'oof queen might be trapped there :(',
  ],
  player_missed_mate: [
    'wait i think you might have had mate there 8-o',
    'phew thought i was cooked for a second 😭',
  ],
  player_missed_win: [
    'wait i left a piece hanging and got away with it 😂',
  ],
  bot_promotion: [
    'new queen on the board :-D',
    'pawn finally made it across',
  ],
  player_promotion: [
    'nice promotion, things just got real :-D',
  ],
  draw_accept: [
    'fair game, i will take the draw :-)',
    'good match, draw accepted ^-)',
  ],
  draw_decline: [
    'still a lot of game left tbh, let us keep playing :-)',
  ],
  bot_win: [
    'checkmate! gg :-D down for a rematch?',
    'gg that was a fun one',
  ],
  player_win: [
    'gg! you outplayed me there :-D',
    'checkmated me clean, rematch? :-)',
  ],
  player_resign: [
    'gg! hit rematch whenever you want another round :-)',
  ],
  draw_game: [
    'gg! dead even match :-)',
  ],
  trash_talk_toggled_on: [
    'oh we turning the heat up now? bet :-D',
  ],
};

/**
 * Unfiltered "Chess Menace" mode: lowercase, slang, sarcastic, cocky, funny, uses 😭 💀 😂 🤡 🙏 🗿,
 * celebrates blunders, roasts questionable moves, and never sounds like an AI tutor.
 */
const TRASH_TALK_LINES: Record<BotChatEvent, string[]> = {
  game_start: [
    'try not to embarrass yourself today 🙏',
    'hope you actually know how the horsey moves 💀',
    'another free elo farm let us go 😭',
    'do not play some boring ass opening pls 🗿',
    'alr let us see how fast this takes 😂',
  ],
  bot_move_normal: [
    'bro is staring at the screen like it is gonna help 😭',
    'what is your plan here genuinely 💀',
    'you lowkey just clicking random squares rn 😂',
    'take your time i already know how this ends 🗿',
    'icl this position is already looking rough for you',
    'wyd bro 😭 play chess',
  ],
  bot_winning_big: [
    'this is getting embarrassing for you ngl 😭',
    'might as well hit resign now and save us both the time 💀',
    'pack it up bro it is completely over 😂',
    'icl it is getting real ugly on this board 🗿',
    'bro is playing for vibes at this point 😭🙏',
    'just resign tbh why drag this out 😂😂',
  ],
  bot_losing_big: [
    'okay chill i was barely even paying attention 🗿',
    'don not get cocky now i am locking in',
    'bro sweating like there is prize money on the line 😭',
    'enjoy the lead while it lasts 🤡',
  ],
  bot_capture: [
    'yoink 😭 thanks',
    'free piece don not mind if i do 💀',
    'bro just leaving stuff undefended like it is charity 😂',
    'too easy ngl',
  ],
  bot_capture_major: [
    'bro just let me take that for free 😭💀',
    'what were you even looking at ahahaha 😂😂',
    'it is genuinely over for you now 💀',
    'thank you kindly 🗿🙏',
  ],
  bot_capture_queen: [
    'BRO JUST DONATED THE QUEEN 💀💀',
    'yo thanks for the queen lmao 😭😭😭',
    'did you just hand me your queen on a silver platter 😂💀',
    'RIP THE QUEEN 💀 pack your bags bro',
  ],
  player_capture: [
    'congrats you took one piece want a trophy 😭',
    'bro thinks he is cooking rn 💀',
    'yeah whatever enjoy that 🗿',
    'oh no anyway 😂',
  ],
  player_capture_major: [
    'okay wtf was that 😭 lucky ass square',
    'bro finally opened his eyes 💀',
    'alr chill grandmaster i am locking back in 🗿',
    'aint no way i left that there 😭😭',
  ],
  bot_check: [
    'check 💀 run bro run',
    'where is your king going rn 😂',
    'knock knock bitch check 😭💀',
    'got your king scrambling ahahaha 😂',
  ],
  player_check: [
    'cute little check 💀 means literally nothing',
    'stop spamming pointless checks clown 🤡',
    'ooh a check 😭 am i supposed to be scared',
    'yeah ok move on 🗿',
  ],
  player_blunder: [
    'nahhhhh 😭 you actually thought that was a good move?',
    'bro what was that move 💀',
    'BRO JUST DONATED THE QUEEN 💀💀',
    'aint no way you just played that 😭😭',
    'my eyes genuinely hurt looking at that move 💀',
    'what am i even looking at right now 🗿',
    'did you close your eyes and click a random square 😭',
    'bro thinks he is playing checkers 😂🤡',
    '💀',
    '🗿',
    '...',
  ],
  player_blunder_queen: [
    'BRO JUST DONATED THE QUEEN 💀💀',
    'bro... your queen 😭😭',
    'did you just give me your queen for free?? 😂💀',
    'aint no way you just hung the queen like that 😭🙏',
    'yo thank god you are blind 💀😂 free queen',
  ],
  player_missed_mate: [
    'you had ONE job 😭',
    'bro really had checkmate right there and walked past it 💀😂',
    'aint no way you missed mate 💀😭😭',
    'how did you not see mate bro 😂🙏 i am dying',
    'thank god you are blind 🙏😭',
  ],
  player_missed_win: [
    'bro missed a whole free piece 😂😂',
    'tunnel vision going crazy rn 💀',
    'you really just ignored a free capture icl 😭',
  ],
  bot_promotion: [
    'new queen spawned 💀 pray for your king 🙏',
    'two queens on the board now 😂 good luck',
    'pawn made it all the way 😭 it is over',
  ],
  player_promotion: [
    'ok chill with the lucky pawn push 🗿',
    'bro actually promoted 💀 alright bet',
  ],
  draw_accept: [
    'alr take your bailout draw and run 😭',
    'you got so damn lucky i clicked accept 🙏😂',
  ],
  draw_decline: [
    'a draw?? 💀 ahahaha hell no finish the game',
    'begging for a draw already is crazy 😭😂',
    'nah we playing this out 🗿 hold this checkmate',
    'bro really tried to finesse a draw 😂🤡',
  ],
  bot_win: [
    'gg. well actually not gg. that was a public execution 😭',
    'get cooked 💀 never touch a chessboard again 😂',
    'checkmate 😭😭 too damn easy',
    'sit down 😂 bro got dismantled in 4k 💀',
    'public execution fr 😭🙏 run it back if you dare',
    'lightwork 😂😂',
  ],
  player_win: [
    'nah run that back. we are not talking about this game.',
    'lag. definitely lag 🗿 rematch rn',
    'don not even screenshot that 😂 run it back immediately',
    'bro had stockfish open on the second monitor 💀 rematch me',
    'okay you got lucky as hell 😭 run that back',
  ],
  player_resign: [
    'ahaha rage quit 😭 smartest move you made all game 💀',
    'folded like a lawn chair 😂 can not even blame you tbh',
    'yea i would have resigned too ngl 😭💀',
  ],
  draw_game: [
    'how tf did you survive into a draw 😭💀',
    'got away with highway robbery getting a draw there 😂🗿',
  ],
  trash_talk_toggled_on: [
    'oh we doing trash talk now?? say less bitch 😭💀',
  ],
};

/**
 * Generates an optional bot message for a game event.
 * Returns null if botMessages is false or if probabilistic chatter lets a move speak for itself.
 */
export function getBotEventMessage(
  event: BotChatEvent,
  botMessages: boolean,
  botTrashTalk: boolean,
  ctx: DialogueContext
): string | null {
  if (!botMessages) return null;

  // Map blunder_queen / missed_mate carefully when not in trash talk mode
  const bank = botTrashTalk ? TRASH_TALK_LINES : CASUAL_LINES;

  // On quiet moves, check if bot is winning or losing huge to talk trash about the board state
  if (event === 'bot_move_normal') {
    const evalCp = ctx.evalCp ?? 0;
    if (evalCp >= 320 && (ctx.moveCount ?? 0) >= 8) {
      if (Math.random() < (botTrashTalk ? 0.55 : 0.35)) {
        return pickLine(`${botTrashTalk ? 'trash' : 'casual'}_bot_winning_big`, bank.bot_winning_big);
      }
      return null;
    }
    if (evalCp <= -360 && (ctx.moveCount ?? 0) >= 8) {
      if (Math.random() < (botTrashTalk ? 0.42 : 0.3)) {
        return pickLine(`${botTrashTalk ? 'trash' : 'casual'}_bot_losing_big`, bank.bot_losing_big);
      }
      return null;
    }

    // Normal quiet moves: keep conversational & sporadic
    const chance = botTrashTalk ? 0.28 : 0.18;
    if (Math.random() > chance) {
      return null;
    }
  }

  // Sometimes be quiet and let a ridiculous blunder speak for itself!
  if (event === 'player_blunder' && Math.random() < 0.12) {
    return null;
  }

  // Avoid over-talking on minor pawn captures
  if (event === 'bot_capture' || event === 'player_capture') {
    const chance = botTrashTalk ? 0.65 : 0.4;
    if (Math.random() > chance) {
      return null;
    }
  }

  // Only pick "BRO JUST DONATED THE QUEEN" in generic player_blunder if they actually captured/lost a queen
  let lines = bank[event] || [];
  if (event === 'player_blunder' && ctx.capturedPiece !== 'q') {
    lines = lines.filter((l) => !l.includes('DONATED THE QUEEN'));
  }

  if (lines.length === 0) return null;

  const key = `${botTrashTalk ? 'trash' : 'casual'}_${event}`;
  return pickLine(key, lines);
}

/**
 * Generates an interactive reply when the human player sends a chat message to the bot!
 */
export function getBotChatReply(
  userText: string,
  botMessages: boolean,
  botTrashTalk: boolean,
  difficulty: BotDifficulty,
  context?: {
    lastPlayerBlunder?: boolean;
    evalCp?: number;
  }
): string | null {
  if (!botMessages) return null;

  const lower = userText.toLowerCase();
  const hasTrashOrSwear =
    /\b(fuck|shit|bitch|ass|damn|hell|idiot|stupid|noob|trash|suck|loser|bot|clown|stfu|wtf|cooked|bad|easy|ez|mid|cringe|shut up|weak|garbage|terrible|dogshit)\b/.test(
      lower
    );
  const hasExcuse = /\b(misclick|lag|accident|slip|lucky|luck|rigged|cheating|cheat|cat|unfair|bug)\b/.test(
    lower
  );
  const hasQuestionOrHelp = /\b(why|how|what|help|advice|tutor|coach|explain|hint|best move)\b/.test(
    lower
  );
  const hasGreeting = /\b(hi|hello|hey|sup|yo|gl|hf|good luck|whats up|wsg)\b/.test(lower);
  const hasGG = /\b(gg|good game|well played|wp|nice)\b/.test(lower);
  const hasRematch = /\b(rematch|again|1v1|run it|run that back)\b/.test(lower);
  const hasEmoticon =
    /(:-?\)|:-?D|;-?\)|B-\)|:-?P|8-o|:o\)|:-?\(|V-\.|XD|😭|💀|😂|🤡|🙏|🗿)/i.test(userText);

  if (botTrashTalk) {
    if (hasTrashOrSwear) {
      if (context?.lastPlayerBlunder) {
        return pickLine('reply_trash_blunder_talk', [
          'all that talking just to play THAT move is crazy 💀',
          'talking crazy after playing THAT move is wild 😭🤡',
          'bro blundered his whole position and still got the audacity to type 💀😂',
        ]);
      }
      return pickLine('reply_trash_swear', [
        'all that talking just to play THAT move is crazy 💀',
        'bro typing whole essays while his position is on life support 😭',
        'loudest player with the worst moves i have ever seen 🤡😂',
        'keep talking it is gonna make this checkmate twice as funny 💀',
        'talk all you want bro the board is literally screaming for help 😭🙏',
      ]);
    }

    if (hasExcuse) {
      return pickLine('reply_trash_excuse', [
        'misclick excuse in big 2026 😭🙏',
        'blaming lag on a turn-based board game is crazy 😂😂',
        'classic cope 💀 just hold the L',
        'aint nobody buying that excuse bro 😭🗿',
      ]);
    }

    if (hasQuestionOrHelp) {
      return pickLine('reply_trash_tutor', [
        'do i look like a chess tutor to you 💀 figure it out',
        'i am not coaching you mid-game bro 😂',
        'you want advice?? stop playing terrible moves 😭🙏',
        'figure it out yourself 🗿 i am busy cooking you',
      ]);
    }

    if (hasGreeting) {
      return pickLine('reply_trash_hi', [
        'save the small talk bro you are getting cooked either way 💀',
        'yo gl 😭 you are deadass gonna need it on ' + difficulty + ' mode 😂',
        'sup 🙏 try to last more than 15 moves please',
      ]);
    }

    if (hasGG) {
      return pickLine('reply_trash_gg', [
        'gg. well actually not gg. that was a public execution 😭',
        'yeah gg... for ME 😂😂',
        'at least you know when you got cooked 💀',
      ]);
    }

    if (hasRematch) {
      return pickLine('reply_trash_rematch', [
        'say less, click rematch and catch another L 😭💀',
        'i will gladly farm you again let us run it 😂',
        'bet 🗿 prepare to get cooked again',
      ]);
    }

    if (hasEmoticon) {
      return pickLine('reply_trash_emo', [
        'spamming emojis will not save your king bro 😭💀',
        'smile now because your position is about to collapse 😂',
        '🤡🗿',
      ]);
    }

    return pickLine('reply_trash_general', [
      'bro is yapping in messenger instead of looking at the board 😭💀',
      'less typing more losing please 😂',
      'wyd bro make a move 🙏',
      'all that talking is crazy 💀 just play chess',
      'you are cooked btw icl 🗿',
    ]);
  }

  // Chill casual lowercase texting replies (when Bot Trash Talk is OFF)
  if (hasGreeting) {
    return pickLine('reply_casual_hi', [
      'yo glhf :-)',
      'sup! good luck today :-D',
    ]);
  }
  if (hasGG) {
    return pickLine('reply_casual_gg', [
      'gg! that was actually a fun game :-D',
      'wp! down for another one anytime :-)',
    ]);
  }
  if (hasRematch) {
    return pickLine('reply_casual_rematch', [
      'bet let us run it back :-D',
      'always down for a rematch :-)',
    ]);
  }
  if (hasEmoticon) {
    return pickLine('reply_casual_emo', [
      'ahaha love the classic msn icons :-D',
      'XD :-)',
    ]);
  }
  if (hasTrashOrSwear) {
    return pickLine('reply_casual_chill', [
      'yo chill 😂 if you want me to talk back flip trash talk on :-P',
      'lol alright alright let us just play :-)',
    ]);
  }
  return pickLine('reply_casual_general', [
    'fr tbh :-)',
    'haha curious what move you got next',
    'lowkey fun game so far :-D',
  ]);
}
