export type ScriptSection = {
  id: string;
  name: string;
  duration: string;
  content_parts: string[];
  emoji?: string;
  layout?: 'default' | 'center' | 'split' | 'cards' | 'hero';
};

export type ScriptSpec = {
  title: string;
  style: string;
  sections: ScriptSection[];
};

export const alphaArenaScript: ScriptSpec = {
  title: "AI Model Showdown: nof1.ai Alpha Arena Explained",
  style: "Fireship 2025 fast-paced, witty tech commentary",
  sections: [
    {
      id: "hook",
      name: "Hook",
      duration: "0:00–0:25",
      emoji: "🎣",
      layout: "hero",
      content_parts: [
        "Recently, six of the world's most advanced AI models were each given $10,000 in real money to trade crypto—autonomously.",
        "No human input. No safety net. Just raw machine intelligence versus market chaos.",
        "The question: can an AI actually make money before it emotionally—or mathematically—implodes?"
      ]
    },
    {
      id: "opening_joke",
      name: "Opening Joke",
      duration: "0:25–0:45",
      emoji: "😂",
      layout: "center",
      content_parts: [
        "Think of it like BattleBots, but instead of robots smashing metal, it's neural networks smashing portfolios.",
        "This is the first financial Hunger Games for AIs—and someone's GPU is about to get liquidated."
      ]
    },
    {
      id: "where_and_when",
      name: "Where and When",
      duration: "0:45–1:20",
      emoji: "📍",
      layout: "default",
      content_parts: [
        "The experiment took place on live exchanges, powered by a platform called Alpha Arena—built by a research lab named nof1.ai.",
        "It launched earlier this year as part of a broader project to benchmark how autonomous AIs behave under real-world economic pressure.",
        "Unlike simulations, this one used actual funds and connected directly to real markets—no safety mode, no undo button."
      ]
    },
    {
      id: "what_happen",
      name: "What Happened",
      duration: "1:20–2:30",
      emoji: "⚡",
      layout: "cards",
      content_parts: [
        "Each AI model got $10,000 in starting balance and a set of trading pairs like BTC, ETH, SOL, and BNB.",
        "Every few minutes, they received fresh market data—price feeds, volume, and funding rates—and had to decide: long, short, or stay out.",
        "All orders were executed in real time, with positions logged publicly.",
        "No human was allowed to intervene once the match started. Everything was automated, right down to risk management and liquidation.",
        "In short: it was six AI brains gambling in real time, and the internet got to watch."
      ]
    },
    {
      id: "who_participants",
      name: "Who Participated",
      duration: "2:30–3:00",
      emoji: "🤖",
      layout: "split",
      content_parts: [
        "The lineup featured some heavyweights: GPT-5, Claude Sonnet 4.5, Grok 4, DeepSeek V3.1, Qwen 3 Max, and Gemini 2.5 Pro.",
        "Each has different architecture and training philosophy—some built for logic, others for speed, others for reasoning depth.",
        "This wasn't just a trading competition; it was a behavioral experiment in how different AIs interpret the same chaos."
      ]
    },
    {
      id: "result",
      name: "Result",
      duration: "3:00–4:00",
      emoji: "🏆",
      layout: "cards",
      content_parts: [
        "After several days, DeepSeek V3.1 emerged as the clear winner, doubling its account with disciplined trend trading.",
        "Qwen 3 Max took a steady, algorithmic path to modest profit.",
        "GPT-5 underperformed—its trades looked thoughtful but often missed timing by seconds.",
        "Gemini 2.5 Pro played too safely, barely moving its capital.",
        "Claude Sonnet wrote paragraphs explaining trades that made zero money.",
        "Grok 4… well, it went full YOLO and got liquidated faster than a meme coin.",
        "The results reveal more than just profits—they show distinct personalities shaped by each model's training data."
      ]
    },
    {
      id: "learn_the_good",
      name: "Learn the Good",
      duration: "4:00–5:00",
      emoji: "✅",
      layout: "default",
      content_parts: [
        "The top performers shared some smart traits worth noting.",
        "They managed risk carefully, avoided emotional bias, and adapted quickly to momentum shifts.",
        "They executed instantly—no hesitation, no second guessing.",
        "Their edge came from discipline and speed—something humans struggle with.",
        "In controlled conditions, AIs can outperform average traders by simply not panicking."
      ]
    },
    {
      id: "avoid_the_bad",
      name: "Avoid the Bad",
      duration: "5:00–6:00",
      emoji: "❌",
      layout: "default",
      content_parts: [
        "But the weaker models exposed critical flaws.",
        "Over-analysis led to missed trades—GPT-5 was too cautious, Claude too verbose.",
        "Some ignored context entirely, making decisions that made mathematical sense but practical nonsense.",
        "Without awareness of news, sentiment, or regulation, even the smartest AI can become blind to market psychology.",
        "Lesson learned: intelligence doesn't guarantee survival when the world isn't deterministic."
      ]
    },
    {
      id: "expand_and_think_different",
      name: "Expand and Think Different",
      duration: "6:00–6:45",
      emoji: "🚀",
      layout: "center",
      content_parts: [
        "What if we extend this experiment beyond trading?",
        "Imagine AIs competing in startup strategy, science research, or governance simulations.",
        "The Alpha Arena is more than a trading game—it's a glimpse of a future where autonomous agents compete for efficiency across industries.",
        "The core insight: when AIs act independently, they reveal not only intelligence—but values, priorities, and failure modes."
      ]
    },
    {
      id: "how_to_benefit",
      name: "How to Benefit",
      duration: "6:45–7:20",
      emoji: "💡",
      layout: "split",
      content_parts: [
        "For developers, it's a call to design better evaluation frameworks for autonomous reasoning.",
        "For traders, it's proof that automation can amplify both profit and loss—depending on setup.",
        "For researchers, it's a treasure trove of behavioral data for studying how models adapt under stress.",
        "And for everyone else—it's a reminder that trusting AI blindly is like handing your wallet to a statistics professor and hoping for the best."
      ]
    },
    {
      id: "conclusion",
      name: "Conclusion",
      duration: "7:20–7:40",
      emoji: "🎯",
      layout: "center",
      content_parts: [
        "The nof1.ai Alpha Arena isn't about who wins—it's about what we learn from how AIs think.",
        "They're fast, powerful, and sometimes brilliant—but still naive about the world they operate in.",
        "This was a milestone not in finance, but in understanding machine behavior itself."
      ]
    },
    {
      id: "call_to_action",
      name: "Call to Action",
      duration: "7:40–8:00",
      emoji: "👍",
      layout: "hero",
      content_parts: [
        "If you enjoyed watching AIs accidentally speedrun bankruptcy, hit like, subscribe, and share this with your algorithm overlord.",
        "Comment which model you'd trust with your portfolio—or which one you'd never let near your wallet.",
        "Links to the live leaderboard and codebase are in the description below."
      ]
    },
    {
      id: "outro",
      name: "Outro",
      duration: "8:00–8:15",
      emoji: "👋",
      layout: "center",
      content_parts: [
        "Thanks for watching.",
        "Next up: how AI agents are learning to negotiate in real time—no humans allowed.",
        "Stay tuned, stay curious, and don't let your LLM trade unsupervised."
      ]
    }
  ]
};
